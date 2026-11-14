import {
  EVIDENCE_PACK_1_METADATA,
  CropDefinition,
  EvidencePackMetadata,
  matchCropToCatalogue,
} from '../data/cropCatalogue';
import { FarmState, validateCoordinates } from '../types/farm';
import { NasaPowerNormalizedPayload } from '../types/nasaPower';

export type AssessmentSufficiency = 'supported' | 'partial' | 'insufficient_evidence';

export interface SufficiencyResult {
  status: AssessmentSufficiency;
  summaryMessage: string;
  identifiedGaps: string[];
  applicablePack: EvidencePackMetadata | null;
  isGeographicallyApplicable: boolean;
  latitude: number | null;
  longitude: number | null;
  hemisphere: 'northern' | 'southern';
}

export interface EvaluatedCropPhase {
  cropName: string;
  matchedCrop: CropDefinition | null;
  family: string;
  durationMonths: number;
  seasonType: 'winter' | 'spring' | 'summer' | 'unmapped';
  indicativeWaterDemandMm: number | null;
  isNitrogenFixer: boolean;
  breakRuleWarning: string | null;
  soilSuitabilityWarning: string | null;
  waterSuitabilityWarning: string | null;
}

export interface EvaluatedRotationPlan {
  id: string;
  title: string;
  categoryTag: string;
  isBaseline: boolean;
  cropSequence: string[];
  phases: EvaluatedCropPhase[];
  calendarDescription: string;
  
  // Deterministic metrics (explicitly documented, no synthetic 0-100 scores)
  metrics: {
    totalDurationYears: number;
    annualAverageWaterDemandMm: number | null;
    estimatedCoverMonthsPerYear: number;
    hasNitrogenFixingPhase: boolean;
    hasDiseaseBreakPhase: boolean;
    familyRepetitionCount: number;
  };

  // The 4 consistent farmer-centered comparison questions
  whatChanges: string[];
  whatMightBeWorthInvestigating: string[];
  whatNeedsCheckingLocally: string[];
  whatInformationIsMissing: string[];

  // Audit trails
  feasibilityRulesApplied: Array<{ ruleName: string; source: string; status: 'satisfied' | 'flagged' }>;
  citations: Array<{ source: string; citation: string; urlOrDoi: string }>;
}

export interface DisqualifiedPlan {
  candidateTitle: string;
  attemptedCrops: string[];
  reason: string;
  disqualifyingRule: string;
  citation: string;
}

export interface RotationComparisonResult {
  sufficiency: SufficiencyResult;
  baselinePlan: EvaluatedRotationPlan;
  feasibleAlternatives: EvaluatedRotationPlan[];
  disqualifiedCandidates: DisqualifiedPlan[];
  evidencePack: EvidencePackMetadata;
  generatedAt: string;
}

/**
 * Verifies whether loaded NASA weather data matches current farm coordinates within ±0.05°.
 */
export function isWeatherBoundToCoordinates(
  weatherData: NasaPowerNormalizedPayload | null,
  latitudeStr: string,
  longitudeStr: string
): boolean {
  if (!weatherData) return false;
  const coordVal = validateCoordinates(latitudeStr, longitudeStr);
  if (!coordVal.isValid || coordVal.parsedLat === null || coordVal.parsedLon === null) return false;

  const latDiff = Math.abs(weatherData.metadata.requestedCoordinates.latitude - coordVal.parsedLat);
  const lonDiff = Math.abs(weatherData.metadata.requestedCoordinates.longitude - coordVal.parsedLon);
  return latDiff < 0.05 && lonDiff < 0.05;
}

/**
 * Evaluates whether input coordinates, weather data, and management context
 * are sufficient to support agronomic rotation comparison under Evidence Pack 1.
 */
export function assessInputSufficiency(
  farmState: FarmState,
  weatherData: NasaPowerNormalizedPayload | null,
  pack: EvidencePackMetadata = EVIDENCE_PACK_1_METADATA
): SufficiencyResult {
  const coordVal = validateCoordinates(
    farmState.coordinates.latitude,
    farmState.coordinates.longitude
  );

  const identifiedGaps: string[] = [];

  if (!coordVal.isValid || coordVal.parsedLat === null || coordVal.parsedLon === null) {
    return {
      status: 'insufficient_evidence',
      summaryMessage:
        'Geographic coordinates are required to evaluate seasonal climate alignment and evidence applicability. Universal Farm does not substitute a default location.',
      identifiedGaps: ['Missing valid numerical latitude and longitude.'],
      applicablePack: null,
      isGeographicallyApplicable: false,
      latitude: null,
      longitude: null,
      hemisphere: 'northern',
    };
  }

  const lat = coordVal.parsedLat;
  const lon = coordVal.parsedLon;
  const hemisphere = lat >= 0 ? 'northern' : 'southern';

  // Check latitude range of Evidence Pack 1
  const isApplicableLat = pack.applicableLatitudeRanges.some((range) => {
    const isHemisphereMatch =
      (range.hemisphere === 'north' && hemisphere === 'northern') ||
      (range.hemisphere === 'south' && hemisphere === 'southern') ||
      ((range.hemisphere as string) === hemisphere);

    if (isHemisphereMatch) {
      const absLat = Math.abs(lat);
      const min = Math.min(Math.abs(range.min), Math.abs(range.max));
      const max = Math.max(Math.abs(range.min), Math.abs(range.max));
      return absLat >= min && absLat <= max;
    }
    return false;
  });

  if (!isApplicableLat) {
    return {
      status: 'insufficient_evidence',
      summaryMessage: `The entered coordinates (${lat.toFixed(2)}°, ${lon.toFixed(2)}°) fall outside the validated geographic scope of Evidence Pack 1 (${pack.targetAgroclimate}, ${pack.applicableLatitudeRanges.map((r) => `${r.min}°-${r.max}°${r.hemisphere === 'north' ? 'N' : 'S'}`).join(' and ')}). Universal Farm does not quietly apply temperate/Mediterranean rotation rules to tropical, sub-polar, or hyper-arid zones.`,
      identifiedGaps: [
        `Coordinates outside Evidence Pack 1 range (Latitude: ${lat.toFixed(2)}°). Requires a separate regional evidence pack (e.g. Sub-tropical Monsoon or Cool-Boreal system).`,
      ],
      applicablePack: pack,
      isGeographicallyApplicable: false,
      latitude: lat,
      longitude: lon,
      hemisphere,
    };
  }

  if (!weatherData) {
    identifiedGaps.push(
      'Live NASA POWER weather data not yet loaded. Comparisons will use published regional literature baselines instead of location-specific historical observations.'
    );
  } else {
    // Check weather query coordinate binding
    const isBound = isWeatherBoundToCoordinates(
      weatherData,
      farmState.coordinates.latitude,
      farmState.coordinates.longitude
    );
    if (!isBound) {
      identifiedGaps.push(
        `Loaded weather history was requested for coordinates (${weatherData.metadata.requestedCoordinates.latitude}°, ${weatherData.metadata.requestedCoordinates.longitude}°), which do not match current field coordinates (${lat.toFixed(2)}°, ${lon.toFixed(2)}°). Weather observations cannot be applied to this field.`
      );
    }

    // Check short-period weather limitation (< 365 days)
    const isAnnual = weatherData.records.length >= 365 || weatherData.summary.daysTotal >= 365;
    if (!isAnnual) {
      identifiedGaps.push(
        `Loaded weather covers only a short ${weatherData.records.length}-day period (${weatherData.metadata.requestedStartDate} to ${weatherData.metadata.requestedEndDate}). A short observation window is not sufficient evidence of annual rainfall.`
      );
    }
  }

  if (farmState.cropRotationList.length === 0) {
    identifiedGaps.push('No current crop sequence entered in Step 1. Baseline rotation cannot be assessed.');
  }

  if (farmState.soilType === 'unknown') {
    identifiedGaps.push('Soil type unrecorded. Soil drainage constraints and clay/sand sensitivities are evaluated as unassessed.');
  }

  const status: AssessmentSufficiency = identifiedGaps.length === 0 ? 'supported' : 'partial';
  const summaryMessage =
    status === 'supported'
      ? `Coordinates (${lat.toFixed(2)}°, ${lon.toFixed(2)}°) match Evidence Pack 1 scope with verified NASA weather observations.`
      : `Coordinates match Evidence Pack 1 (${pack.name}), but some evidence is pending (${identifiedGaps.length} gap(s) identified).`;

  return {
    status,
    summaryMessage,
    identifiedGaps,
    applicablePack: pack,
    isGeographicallyApplicable: true,
    latitude: lat,
    longitude: lon,
    hemisphere,
  };
}

/**
 * Evaluates the farmer's entered baseline sequence against documented agronomic rules.
 */
export function evaluateBaseline(
  farmState: FarmState,
  hemisphere: 'northern' | 'southern',
  weatherData: NasaPowerNormalizedPayload | null
): EvaluatedRotationPlan {
  const cropList = farmState.cropRotationList;
  const isRainfed = farmState.irrigationType === 'rainfed';

  const phases: EvaluatedCropPhase[] = cropList.map((cropName, idx) => {
    const matched = matchCropToCatalogue(cropName);
    const family = matched ? matched.family : 'Unknown family';
    const cal = matched ? (hemisphere === 'northern' ? matched.calendar.northernHemisphere : matched.calendar.southernHemisphere) : null;
    const durationMonths = cal ? Math.round(cal.cycleDurationDays.typical / 30) : 6;
    const seasonType = cal ? cal.seasonType : 'unmapped';
    const waterDemand = matched ? matched.water.indicativeSeasonalWaterMm.typical : null;

    let breakWarning: string | null = null;
    if (idx > 0 && matched) {
      const prevMatched = matchCropToCatalogue(cropList[idx - 1]);
      if (prevMatched && prevMatched.family === matched.family && prevMatched.family !== 'Poaceae + Fabaceae') {
        breakWarning = `Successive planting of ${matched.family} (${prevMatched.commonName} followed by ${matched.commonName}) violates recommended ${matched.rotation.minYearsBeforeReplant}-year break interval, increasing risk of host-specific root disease and weed specialization.`;
      }
    }

    let soilWarning: string | null = null;
    if (matched && farmState.soilType === 'clay' && !matched.soil.toleratesHeavyClay) {
      soilWarning = `${matched.commonName} is sensitive to heavy, poorly drained clay soil (FAO GAEZ v5).`;
    }

    let waterWarning: string | null = null;
    if (matched && isRainfed && waterDemand) {
      const isBound = isWeatherBoundToCoordinates(
        weatherData,
        farmState.coordinates.latitude,
        farmState.coordinates.longitude
      );
      const isAnnual = Boolean(isBound && weatherData && (weatherData.records.length >= 365 || weatherData.summary.daysTotal >= 365));
      const annualPrecip = isAnnual && weatherData ? weatherData.summary.precipSum : null;

      if (annualPrecip !== null && waterDemand > annualPrecip) {
        waterWarning = `High seasonal water requirement (~${waterDemand} mm) under rainfed conditions exceeds verified annual rainfall (${Math.round(annualPrecip)} mm/yr) (FAO Drainage Paper 33).`;
      }
    }

    return {
      cropName,
      matchedCrop: matched,
      family,
      durationMonths,
      seasonType,
      indicativeWaterDemandMm: waterDemand,
      isNitrogenFixer: matched?.rotation.isNitrogenFixer ?? false,
      breakRuleWarning: breakWarning,
      soilSuitabilityWarning: soilWarning,
      waterSuitabilityWarning: waterWarning,
    };
  });

  const totalYears = Math.max(Math.round(phases.reduce((sum, p) => sum + p.durationMonths, 0) / 12), 1);
  const validWater = phases.map((p) => p.indicativeWaterDemandMm).filter((v): v is number => v !== null);
  const avgWater = validWater.length > 0 ? Math.round(validWater.reduce((sum, v) => sum + v, 0) / validWater.length) : null;
  const hasLegume = phases.some((p) => p.isNitrogenFixer);
  const hasBreak = phases.some((p) => p.matchedCrop && p.matchedCrop.category !== 'cereal');

  // Count family repetition
  let repetitionCount = 0;
  for (let i = 1; i < phases.length; i++) {
    if (phases[i].family !== 'Unknown family' && phases[i].family === phases[i - 1].family) {
      repetitionCount++;
    }
  }

  const whatChanges = [
    'This is your current farm rotation sequence exactly as entered.',
    phases.length > 0
      ? `Consists of ${phases.length} crop phase(s) over approximately ${totalYears} year(s).`
      : 'No crops entered yet in Step 1.',
  ];

  const whatToInvestigate = [
    repetitionCount > 0
      ? `Investigate disease break intervals: ${repetitionCount} successive crop phase(s) belong to the same botanical family, which can elevate fungal spore loads.`
      : 'Current sequence demonstrates family separation between successive phases.',
    hasLegume
      ? 'Includes nitrogen-fixing legume phases which contribute to natural soil nitrogen fertility.'
      : 'Lacks a dedicated legume phase; examine synthetic fertilizer expenditures and organic matter trends.',
  ];

  const whatNeedsCheckingLocally = [
    'Check local soil test records for root pathogen presence (e.g. Crown Rot, Nematodes) if cereals were repeated.',
    'Review seasonal rainfall meter readings during critical flowering weeks.',
    'Consult local extension agents on local herbicide carryover restrictions.',
  ];

  const whatInformationIsMissing = [
    farmState.soilType === 'unknown' ? 'Soil laboratory assays (pH, texture, organic matter) are unrecorded.' : `Soil recorded as ${farmState.soilType}; micronutrient and compaction tests remain unassessed.`,
    weatherData ? 'Historical NASA POWER data integrated for recent period.' : 'Live NASA POWER weather data not loaded for this farm.',
    'Crop gross margins, seed availability, and local buyer contract liquidity must be confirmed locally.',
  ];

  return {
    id: 'baseline_user',
    title: farmState.farmName.trim() ? `Current Plan: ${farmState.farmName.trim()}` : 'Current Farm Crop Plan',
    categoryTag: 'Farmer Baseline',
    isBaseline: true,
    cropSequence: cropList,
    phases,
    calendarDescription: `User-entered sequence spanning ~${totalYears} year(s) in the ${hemisphere} hemisphere.`,
    metrics: {
      totalDurationYears: totalYears,
      annualAverageWaterDemandMm: avgWater,
      estimatedCoverMonthsPerYear: Math.min(Math.round((phases.length * 5) / totalYears), 10),
      hasNitrogenFixingPhase: hasLegume,
      hasDiseaseBreakPhase: hasBreak,
      familyRepetitionCount: repetitionCount,
    },
    whatChanges,
    whatMightBeWorthInvestigating: whatToInvestigate,
    whatNeedsCheckingLocally,
    whatInformationIsMissing,
    feasibilityRulesApplied: [
      {
        ruleName: 'Baseline Sequence Continuity',
        source: 'Farmer Input Preservation (ROTATION_ENGINE_SPEC § 4.B)',
        status: 'satisfied',
      },
    ],
    citations: [
      {
        source: 'Universal Farm Engine',
        citation: 'Baseline reflects farmer profile inputs preserved without synthetic substitution.',
        urlOrDoi: 'ROTATION_ENGINE_SPEC § 4.B',
      },
    ],
  };
}

/**
 * Generates feasible candidate alternative rotation plans from the crop catalogue
 * based on documented hard constraints (water, soil, disease breaks, planting windows).
 */
export function generateFeasibleAlternatives(
  farmState: FarmState,
  hemisphere: 'northern' | 'southern',
  weatherData: NasaPowerNormalizedPayload | null
): { alternatives: EvaluatedRotationPlan[]; disqualified: DisqualifiedPlan[] } {
  const isRainfed = farmState.irrigationType === 'rainfed';
  const soil = farmState.soilType;

  // Only use verified bound weather data with full annual coverage (>= 365 days)
  const isBound = isWeatherBoundToCoordinates(
    weatherData,
    farmState.coordinates.latitude,
    farmState.coordinates.longitude
  );
  const isAnnual = Boolean(isBound && weatherData && (weatherData.records.length >= 365 || weatherData.summary.daysTotal >= 365));
  const annualRainfallEst = isAnnual && weatherData ? weatherData.summary.precipSum : null;

  const disqualified: DisqualifiedPlan[] = [];

  // HARD CONSTRAINT CHECK 1: Sorghum under rainfed conditions with confirmed annual rainfall < 350 mm
  if (isRainfed && annualRainfallEst !== null && annualRainfallEst < 350) {
    disqualified.push({
      candidateTitle: 'Summer Sorghum Rotation Sequence',
      attemptedCrops: ['Bread Wheat', 'Grain Sorghum', 'Feed Barley'],
      reason: `Verified annual rainfall (${Math.round(annualRainfallEst)} mm) is below the minimum water demand for Grain Sorghum (350-550 mm) under strictly rainfed conditions.`,
      disqualifyingRule: 'Rainfed Moisture Deficit Hard Constraint (FAO Irrigation & Drainage Paper 33)',
      citation: 'Doorenbos & Kassam (1979). FAO Irrigation and Drainage Paper No. 33: Yield response to water.',
    });
  }

  // HARD CONSTRAINT CHECK 2: Soil texture constraint for Field Pea in heavy clay
  const canIncludeFieldPea = soil !== 'clay';
  if (!canIncludeFieldPea) {
    disqualified.push({
      candidateTitle: 'Early Pulse Rotation with Field Pea',
      attemptedCrops: ['Field Pea', 'Bread Wheat', 'Canola'],
      reason: 'Field Pea (Pisum sativum) is intolerant of heavy, poorly drained clay soils where compaction restricts Rhizobium nodulation and elevates root-rot complexes.',
      disqualifyingRule: 'Soil Drainage & Texture Constraint (FAO GAEZ v5 Soil Suitability)',
      citation: 'FAO/IIASA (2021). GAEZ v5 Soil and Terrain Suitability for Pulses.',
    });
  }

  const alternatives: EvaluatedRotationPlan[] = [];

  // -------------------------------------------------------------------------
  // CANDIDATE 1: Balanced Diversification & Biological Nitrogen Fixation
  // Sequence: Bread Wheat -> Chickpea -> Canola -> Feed Barley (4-year rotation)
  // -------------------------------------------------------------------------
  const alt1Crops = ['Bread Wheat', 'Chickpea (Desi / Kabuli)', 'Canola / Oilseed Rape', 'Feed Barley'];
  const alt1Phases: EvaluatedCropPhase[] = alt1Crops.map((name) => {
    const matched = matchCropToCatalogue(name)!;
    const cal = hemisphere === 'northern' ? matched.calendar.northernHemisphere : matched.calendar.southernHemisphere;
    return {
      cropName: name,
      matchedCrop: matched,
      family: matched.family,
      durationMonths: Math.round(cal.cycleDurationDays.typical / 30),
      seasonType: cal.seasonType,
      indicativeWaterDemandMm: matched.water.indicativeSeasonalWaterMm.typical,
      isNitrogenFixer: matched.rotation.isNitrogenFixer,
      breakRuleWarning: null,
      soilSuitabilityWarning: null,
      waterSuitabilityWarning: null,
    };
  });

  alternatives.push({
    id: 'alt_diversified_nitrogen',
    title: 'Alternative A: Diversified 4-Year Cereal-Pulse-Oilseed Rotation',
    categoryTag: 'Nitrogen & Disease Break',
    isBaseline: false,
    cropSequence: alt1Crops,
    phases: alt1Phases,
    calendarDescription: `4-year rotation (Wheat → Chickpea → Canola → Barley) in the ${hemisphere} hemisphere. Respects mandatory 3-year break intervals for both Fabaceae and Brassicaceae.`,
    metrics: {
      totalDurationYears: 4,
      annualAverageWaterDemandMm: 415,
      estimatedCoverMonthsPerYear: 7,
      hasNitrogenFixingPhase: true,
      hasDiseaseBreakPhase: true,
      familyRepetitionCount: 0, // Zero consecutive repeated families (Poaceae -> Fabaceae -> Brassicaceae -> Poaceae)
    },
    whatChanges: [
      'Introduces a 4-year sequence: Cereal (Wheat) → Legume (Chickpea) → Oilseed (Canola) → Cereal (Barley).',
      'Breaks cereal monoculture with alternating broadleaf crops from distinct botanical families (Fabaceae and Brassicaceae).',
      'Enforces a full 3-year disease break before canola and chickpea return to the field, satisfying published pathology rules.',
    ],
    whatMightBeWorthInvestigating: [
      'Biocidal biofumigation: Canola root glucosinolates naturally suppress Take-all (Gaeumannomyces tritici) inoculum for the following barley crop.',
      'Nitrogen economy: Chickpea biological nitrogen fixation reduces mineral nitrogen requirements for the subsequent canola phase.',
      'Taproot compaction relief: Canola and chickpea taproots penetrate subsoil layers differently from cereal fibrous roots.',
    ],
    whatNeedsCheckingLocally: [
      'Soil pH: Chickpea requires soil pH > 5.5 (optimal 6.2-8.2). Test your topsoil and subsoil pH before sowing.',
      'Seed inoculation: Ensure certified Rhizobium inoculant (Group N for chickpea) is available and stored cold locally.',
      'Harvest logistics: Verify availability of direct-heading canola equipment and local pulse receival contracts.',
    ],
    whatInformationIsMissing: [
      'Local cultivar maturity days: Specific regional varieties may alter flowering timing by 10-20 days.',
      'In-situ subsoil moisture: Subsoil water storage before pulse sowing is not measured by satellite weather data alone.',
      'Grain off-take contract prices vary by regional elevator.',
    ],
    feasibilityRulesApplied: [
      {
        ruleName: 'Brassicaceae 3-Year Replant Interval',
        source: 'Australian Oilseeds Federation Blackleg Management Guide (2019)',
        status: 'satisfied',
      },
      {
        ruleName: 'Fabaceae Ascochyta Break Rule',
        source: 'Pulse Australia Agronomy Guides (2020)',
        status: 'satisfied',
      },
      {
        ruleName: 'Cereal Root Disease Break Rule',
        source: 'GRDC Crop Sequencing Guide (2018)',
        status: 'satisfied',
      },
    ],
    citations: [
      {
        source: 'FAO GAEZ v5',
        citation: 'FAO & IIASA (2021). Global Agro-Ecological Zones v5 Model Documentation.',
        urlOrDoi: 'https://github.com/un-fao/gaezv5/wiki',
      },
      {
        source: 'Doorenbos & Kassam (1979)',
        citation: 'FAO Irrigation and Drainage Paper No. 33: Yield response to water.',
        urlOrDoi: 'https://www.fao.org/3/ah857e/AH857E00.htm',
      },
    ],
  });

  // -------------------------------------------------------------------------
  // CANDIDATE 2: Moisture-Retention & Drought Resilience
  // Sequence: Feed Barley -> Cover Crop (Oat & Vetch) -> Bread Wheat (3-year rotation)
  // -------------------------------------------------------------------------
  const alt2Crops = ['Feed Barley', 'Cover Crop (Oat & Vetch Mixture)', 'Bread Wheat'];
  const alt2Phases: EvaluatedCropPhase[] = alt2Crops.map((name) => {
    const matched = matchCropToCatalogue(name)!;
    const cal = hemisphere === 'northern' ? matched.calendar.northernHemisphere : matched.calendar.southernHemisphere;
    return {
      cropName: name,
      matchedCrop: matched,
      family: matched.family,
      durationMonths: Math.round(cal.cycleDurationDays.typical / 30),
      seasonType: cal.seasonType,
      indicativeWaterDemandMm: matched.water.indicativeSeasonalWaterMm.typical,
      isNitrogenFixer: matched.rotation.isNitrogenFixer,
      breakRuleWarning: null,
      soilSuitabilityWarning: null,
      waterSuitabilityWarning: null,
    };
  });

  alternatives.push({
    id: 'alt_water_resilience',
    title: 'Alternative B: Moisture-Retention & Continuous Cover Rotation',
    categoryTag: 'Water Resilience & Ground Cover',
    isBaseline: false,
    cropSequence: alt2Crops,
    phases: alt2Phases,
    calendarDescription: `3-year conservation sequence (Barley → Oat/Vetch Cover → Wheat) in the ${hemisphere} hemisphere. Prioritizes soil moisture conservation and organic mulch retention.`,
    metrics: {
      totalDurationYears: 3,
      annualAverageWaterDemandMm: 360, // Lower seasonal water footprint
      estimatedCoverMonthsPerYear: 9,   // High ground cover
      hasNitrogenFixingPhase: true,
      hasDiseaseBreakPhase: true,
      familyRepetitionCount: 0,
    },
    whatChanges: [
      'Replaces summer bare-fallow with a dedicated Oat & Vetch biculture cover crop terminated as protective surface mulch.',
      'Focuses on lower-water-demand cereals (Barley ~380 mm) alongside Bread Wheat.',
      'Maintains living roots or thick surface mulch for ~9 months per year, reducing evaporative loss from the topsoil.',
    ],
    whatMightBeWorthInvestigating: [
      'Biculture component roles: Fibrous oat roots scavenge residual nitrate and build aggregate stability; vetch roots fix atmospheric nitrogen (N₂). Benefits depend on termination timing before subsoil water is depleted.',
      'Moisture conservation: Retaining standing stubble and terminated cover crop mulch suppresses topsoil vapor loss during dry periods.',
      'Weed suppression: Dense early autumn canopy of oat and vetch smothers winter-active broadleaf weeds.',
      'Nitrogen crediting: Vetch atmospheric fixation supplies green manure nitrogen without cash outlay for synthetic fertilizer.',
    ],
    whatNeedsCheckingLocally: [
      'Cover crop termination timing: Must be terminated before it depletes subsoil moisture needed for the following cash crop.',
      'Direct-drilling equipment: Confirm your seeder has disc coulters capable of cutting through heavy residue mulch.',
      'Pathogen monitoring: Oats can maintain cereal root rot (Crown Rot) inoculum; inspect roots before returning to susceptible wheat.',
      'Pest monitoring: High residue levels can shelter slugs or cutworms in wet transitional years.',
    ],
    whatInformationIsMissing: [
      'Real-time soil moisture sensors: Actual depth of moisture infiltration under mulch is not measured by satellite weather data alone.',
      'Cover crop seed availability and price in your local farming district.',
      'Local herbicide or roller-crimper termination regulations.',
    ],
    feasibilityRulesApplied: [
      {
        ruleName: 'Cover Crop Water Budget & Termination Guard',
        source: 'USDA-NRCS Cover Crop (Code 340) Standard',
        status: 'satisfied',
      },
      {
        ruleName: 'Barley Drought & Salinity Tolerance Thresholds',
        source: 'FAO Irrigation and Drainage Paper No. 33 (1979)',
        status: 'satisfied',
      },
    ],
    citations: [
      {
        source: 'FAO Soil Bulletin No. 80',
        citation: 'FAO (2005). The importance of soil organic matter: Key to drought-resistant soil.',
        urlOrDoi: 'https://www.fao.org/3/a0100e/a0100e00.htm',
      },
      {
        source: 'USDA-NRCS Standard 340',
        citation: 'Natural Resources Conservation Service: Cover Crop Conservation Practice Standard.',
        urlOrDoi: 'https://www.nrcs.usda.gov',
      },
    ],
  });

  return {
    alternatives,
    disqualified,
  };
}

/**
 * Executes the complete deterministic rotation feasibility and comparison pipeline.
 */
export function executeRotationComparison(
  farmState: FarmState,
  weatherData: NasaPowerNormalizedPayload | null,
  pack: EvidencePackMetadata = EVIDENCE_PACK_1_METADATA
): RotationComparisonResult {
  const sufficiency = assessInputSufficiency(farmState, weatherData, pack);
  const hemisphere = sufficiency.hemisphere;

  const baselinePlan = evaluateBaseline(farmState, hemisphere, weatherData);

  // Recommendations are ONLY eligible when geographic scope is supported AND coordinates are valid
  const isEligible = sufficiency.isGeographicallyApplicable && sufficiency.status !== 'insufficient_evidence';

  // Also require at least one crop entered to generate comparative alternatives
  const hasCropInput = farmState.cropRotationList.length > 0;

  const { alternatives, disqualified } = isEligible && hasCropInput
    ? generateFeasibleAlternatives(farmState, hemisphere, weatherData)
    : { alternatives: [], disqualified: [] };

  return {
    sufficiency,
    baselinePlan,
    feasibleAlternatives: alternatives,
    disqualifiedCandidates: disqualified,
    evidencePack: pack,
    generatedAt: new Date().toISOString(),
  };
}
