/**
 * Universal Farm — Crop Knowledge Catalogue & Initial Evidence Pack
 *
 * EVIDENCE PACK 1: Temperate & Mediterranean Semi-Arid Cropping System (v1.0.0)
 *
 * SCOPE & GEOGRAPHIC APPLICABILITY:
 * Explicitly scoped for temperate and Mediterranean agro-climatic zones characterized
 * by cool, moist winters and warm-to-hot summers (typically latitude 28°-48°N and 28°-45°S).
 *
 * SCIENTIFIC PROVENANCE & ATTRIBUTION:
 * All agronomic properties, thermal thresholds, water requirements, and sequence rules
 * are sourced from published international literature:
 * - FAO GAEZ v5 Model Documentation & Crop Requirements (FAO/IIASA, 2021)
 * - FAO Irrigation and Drainage Paper No. 33: "Yield response to water" (Doorenbos & Kassam, 1979)
 * - FAO Irrigation and Drainage Paper No. 56: "Crop evapotranspiration" (Allen et al., 1998)
 * - Regional agricultural extension rotation break guidelines (GRDC, USDA-ARS, INRAE)
 *
 * REVIEW STATUS:
 * Sourced from official published literature; human agronomic review pending for localized cultivars.
 */

export type CropCategory = 'cereal' | 'pulse' | 'oilseed' | 'cover_crop';
export type IrrigationSuitability = 'rainfed_and_irrigated' | 'irrigated_preferred' | 'rainfed_only';
export type ToleranceLevel = 'high' | 'moderate' | 'low';

export interface CropCitation {
  source: string;
  citation: string;
  urlOrDoi: string;
  tableOrSection: string;
  applicableConditions?: string;
}

export interface SeasonCalendar {
  plantingMonths: number[]; // 1 to 12
  harvestMonths: number[];   // 1 to 12
  seasonType: 'winter' | 'spring' | 'summer';
  cycleDurationDays: { min: number; max: number; typical: number };
}

export interface CropDefinition {
  id: string;
  commonName: string;
  scientificName: string;
  family: string;
  category: CropCategory;
  packId: string;
  description: string;
  
  // Thermal limits and requirements
  thermal: {
    baseTempC: number;              // Tbase below which vegetative development pauses
    optimumTempC: { min: number; max: number };
    floweringFrostThresholdC: number; // Air temp below which frost damage to floral tissue occurs
    heatStressThresholdC: number;    // Air temp during flowering/grain fill causing pollen abortion / shriveling
    frostTolerance: ToleranceLevel;
  };

  // Water requirements under stated management
  water: {
    indicativeSeasonalWaterMm: { min: number; max: number; typical: number };
    droughtHardiness: ToleranceLevel;
    waterloggingSensitivity: ToleranceLevel;
    irrigationSuitability: IrrigationSuitability;
  };

  // Soil tolerances and requirements
  soil: {
    phOptimal: { min: number; max: number };
    phAbsolute: { min: number; max: number };
    toleratesHeavyClay: boolean;
    toleratesCoarseSand: boolean;
    drainageRequirement: 'well_drained' | 'moderate' | 'tolerant_of_heavy';
  };

  // Rotation and sequence rules
  rotation: {
    minYearsBeforeReplant: number;  // Mandatory break interval to prevent host-specific soil pathogens
    isNitrogenFixer: boolean;
    nitrogenContributionNote: string | null;
    residueLevel: 'high' | 'medium' | 'low';
    residueCoverDurationMonths: number;
    diseaseBreakFor: string[];       // Pathogens/diseases this crop breaks for subsequent cereals/crops
    diseaseSusceptibleTo: string[];  // Known pathogens of concern in continuous sequences
  };

  // Sowing and harvesting calendar windows
  calendar: {
    northernHemisphere: SeasonCalendar;
    southernHemisphere: SeasonCalendar;
  };

  citations: CropCitation[];
  reviewStatus: string;
  componentEvidence?: string; // Sourced distinction between single-species traits and biculture assumptions
}

export interface EvidencePackMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  targetAgroclimate: string;
  applicableLatitudeRanges: Array<{ min: number; max: number; hemisphere: 'north' | 'south' }>;
  applicableAnnualRainfallRangeMm: { min: number; max: number };
  cropsIncluded: string[];
  reviewStatus: string;
  disclaimer: string;
}

export const EVIDENCE_PACK_1_METADATA: EvidencePackMetadata = {
  id: 'temperate_mediterranean_v1',
  name: 'Temperate & Mediterranean Semi-Arid Cropping System',
  version: '1.0.0',
  description:
    'Documented crop requirements and rotation sequence rules for cereal, pulse, and oilseed systems in temperate and Mediterranean climate zones with cool winter growing seasons or defined seasonal rainfall.',
  targetAgroclimate: 'Temperate oceanic, Mediterranean dry-summer, and semi-arid cropping regimes.',
  applicableLatitudeRanges: [
    { min: 28, max: 48, hemisphere: 'north' },
    { min: 28, max: 45, hemisphere: 'south' },
  ],
  applicableAnnualRainfallRangeMm: { min: 250, max: 800 },
  cropsIncluded: [
    'bread_wheat',
    'feed_barley',
    'chickpea',
    'field_pea',
    'canola',
    'grain_sorghum',
    'cover_vetch_oats',
  ],
  reviewStatus: 'Literature Sourced (FAO GAEZ v5 & Extension) — Human Agronomic Review Pending',
  disclaimer:
    'This evidence pack reflects published literature rules for temperate and Mediterranean systems. It is not a global universal agronomic model. Local soil series, microclimates, and regional disease biotypes require validation with local agronomists.',
};

export const CROP_CATALOGUE: Record<string, CropDefinition> = {
  bread_wheat: {
    id: 'bread_wheat',
    commonName: 'Bread Wheat',
    scientificName: 'Triticum aestivum',
    family: 'Poaceae',
    category: 'cereal',
    packId: 'temperate_mediterranean_v1',
    description: 'Major staple cool-season cereal. Deep fibrous root system with high commercial market liquidity.',
    thermal: {
      baseTempC: 4.0,
      optimumTempC: { min: 15.0, max: 24.0 },
      floweringFrostThresholdC: -1.5,
      heatStressThresholdC: 32.0,
      frostTolerance: 'high',
    },
    water: {
      indicativeSeasonalWaterMm: { min: 350, max: 650, typical: 450 },
      droughtHardiness: 'moderate',
      waterloggingSensitivity: 'moderate',
      irrigationSuitability: 'rainfed_and_irrigated',
    },
    soil: {
      phOptimal: { min: 6.0, max: 7.5 },
      phAbsolute: { min: 5.2, max: 8.5 },
      toleratesHeavyClay: true,
      toleratesCoarseSand: false,
      drainageRequirement: 'moderate',
    },
    rotation: {
      minYearsBeforeReplant: 1, // Continuous wheat allowed but carries high Crown Rot / Take-all penalty
      isNitrogenFixer: false,
      nitrogenContributionNote: null,
      residueLevel: 'high',
      residueCoverDurationMonths: 4,
      diseaseBreakFor: ['Rhizoctonia in brassicas'],
      diseaseSusceptibleTo: ['Crown Rot (Fusarium pseudograminearum)', 'Take-all (Gaeumannomyces tritici)', 'Septoria tritici blotch'],
    },
    calendar: {
      northernHemisphere: {
        plantingMonths: [10, 11], // Oct-Nov autumn sowing
        harvestMonths: [6, 7],    // June-July
        seasonType: 'winter',
        cycleDurationDays: { min: 210, max: 270, typical: 240 },
      },
      southernHemisphere: {
        plantingMonths: [4, 5, 6], // April-June autumn sowing
        harvestMonths: [11, 12],   // Nov-Dec
        seasonType: 'winter',
        cycleDurationDays: { min: 180, max: 240, typical: 210 },
      },
    },
    citations: [
      {
        source: 'FAO Irrigation and Drainage Paper No. 33',
        citation: 'Doorenbos, J. & Kassam, A.H. (1979). Yield response to water. FAO, Rome.',
        urlOrDoi: 'https://www.fao.org/3/ah857e/AH857E00.htm',
        tableOrSection: 'Part B: Wheat (Triticum aestivum), Table 33 (seasonal water 350-650 mm, yield response factor Ky = 1.0)',
        applicableConditions: 'Temperate and Mediterranean winter and spring wheat; rainfed or deficit-irrigated.',
      },
      {
        source: 'FAO GAEZ v5 Model Documentation',
        citation: 'FAO & IIASA (2021). Global Agro-Ecological Zones (GAEZ v5) Model Documentation.',
        urlOrDoi: 'https://github.com/un-fao/gaezv5/wiki',
        tableOrSection: 'Section 3.2: Crop thermal requirements (T-base 4.0 °C, optimum 15.0-24.0 °C, flowering frost threshold -1.5 °C)',
        applicableConditions: 'Commercial winter wheat cultivars in latitudes 28°-48°N and 28°-45°S.',
      },
      {
        source: 'GRDC Crop Sequencing Guide',
        citation: 'Grains Research and Development Corporation (2018). Crop Placement and Sequencing in Mediterranean Environments.',
        urlOrDoi: 'https://grdc.com.au',
        tableOrSection: 'Section 4: Root disease break intervals (Take-all and Crown Rot management across cereal phases)',
        applicableConditions: 'Semi-arid cropping systems on alkaline and neutral soils.',
      },
    ],
    reviewStatus: 'Literature Sourced — Human Agronomic Review Pending',
  },

  feed_barley: {
    id: 'feed_barley',
    commonName: 'Feed Barley',
    scientificName: 'Hordeum vulgare',
    family: 'Poaceae',
    category: 'cereal',
    packId: 'temperate_mediterranean_v1',
    description: 'Hardy cool-season grain with earlier maturity and superior salinity and drought tolerance compared to wheat.',
    thermal: {
      baseTempC: 3.0,
      optimumTempC: { min: 15.0, max: 22.0 },
      floweringFrostThresholdC: -1.0,
      heatStressThresholdC: 30.0,
      frostTolerance: 'high',
    },
    water: {
      indicativeSeasonalWaterMm: { min: 300, max: 550, typical: 380 },
      droughtHardiness: 'high',
      waterloggingSensitivity: 'moderate',
      irrigationSuitability: 'rainfed_and_irrigated',
    },
    soil: {
      phOptimal: { min: 6.5, max: 8.0 },
      phAbsolute: { min: 5.8, max: 8.8 },
      toleratesHeavyClay: true,
      toleratesCoarseSand: true,
      drainageRequirement: 'moderate',
    },
    rotation: {
      minYearsBeforeReplant: 1,
      isNitrogenFixer: false,
      nitrogenContributionNote: null,
      residueLevel: 'high',
      residueCoverDurationMonths: 4,
      diseaseBreakFor: ['Ascochyta in pulses'],
      diseaseSusceptibleTo: ['Spot Form of Net Blotch', 'Scald (Rhynchosporium secalis)'],
    },
    calendar: {
      northernHemisphere: {
        plantingMonths: [10, 11],
        harvestMonths: [5, 6],
        seasonType: 'winter',
        cycleDurationDays: { min: 180, max: 230, typical: 200 },
      },
      southernHemisphere: {
        plantingMonths: [5, 6],
        harvestMonths: [10, 11],
        seasonType: 'winter',
        cycleDurationDays: { min: 160, max: 200, typical: 180 },
      },
    },
    citations: [
      {
        source: 'FAO Irrigation and Drainage Paper No. 33',
        citation: 'Doorenbos, J. & Kassam, A.H. (1979). Yield response to water: Barley. FAO, Rome.',
        urlOrDoi: 'https://www.fao.org/3/ah857e/AH857E00.htm',
        tableOrSection: 'Part B: Barley (Hordeum vulgare), Table 20 (seasonal water 300-550 mm; Ky = 1.0; salinity threshold ECe 8.0 dS/m)',
        applicableConditions: 'Drought-prone semi-arid Mediterranean winter cropping.',
      },
      {
        source: 'FAO GAEZ v5 Model Documentation',
        citation: 'FAO & IIASA (2021). Global Agro-Ecological Zones (GAEZ v5) Model Documentation.',
        urlOrDoi: 'https://github.com/un-fao/gaezv5/wiki',
        tableOrSection: 'Section 3.2: Barley thermal limits (T-base 3.0 °C, optimum 15.0-22.0 °C)',
        applicableConditions: 'Temperate and Mediterranean barley production.',
      },
      {
        source: 'GRDC Barley Disease Management Guide',
        citation: 'GRDC (2019). Managing Foliar and Root Pathogens in Barley Sequences.',
        urlOrDoi: 'https://grdc.com.au',
        tableOrSection: 'Section 2: Spot form of net blotch and scald rotational separation rules (minimum 1 year break)',
        applicableConditions: 'Stubble-borne pathogen control in Mediterranean winter grain zones.',
      },
    ],
    reviewStatus: 'Literature Sourced — Human Agronomic Review Pending',
  },

  chickpea: {
    id: 'chickpea',
    commonName: 'Chickpea (Desi / Kabuli)',
    scientificName: 'Cicer arietinum',
    family: 'Fabaceae',
    category: 'pulse',
    packId: 'temperate_mediterranean_v1',
    description: 'Deep-rooting grain legume providing biological nitrogen fixation and an effective disease break for cereal root pathogens.',
    thermal: {
      baseTempC: 7.0,
      optimumTempC: { min: 18.0, max: 28.0 },
      floweringFrostThresholdC: -0.5,
      heatStressThresholdC: 35.0,
      frostTolerance: 'moderate',
    },
    water: {
      indicativeSeasonalWaterMm: { min: 280, max: 450, typical: 350 },
      droughtHardiness: 'high',
      waterloggingSensitivity: 'high', // Very sensitive to waterlogged, un-aerated root zones
      irrigationSuitability: 'rainfed_and_irrigated',
    },
    soil: {
      phOptimal: { min: 6.2, max: 8.2 },
      phAbsolute: { min: 5.5, max: 8.8 },
      toleratesHeavyClay: true,
      toleratesCoarseSand: false,
      drainageRequirement: 'well_drained', // Critical requirement
    },
    rotation: {
      minYearsBeforeReplant: 3, // Mandatory 3-year break to manage Ascochyta and Phytophthora root rot
      isNitrogenFixer: true,
      nitrogenContributionNote: 'Atmospheric nitrogen (N₂) fixation via Rhizobium leguminosarum bv. ciceri; net soil nitrogen benefit depends on residue retention and grain harvest removal.',
      residueLevel: 'low',
      residueCoverDurationMonths: 2,
      diseaseBreakFor: ['Take-all (Gaeumannomyces tritici)', 'Crown Rot in wheat'],
      diseaseSusceptibleTo: ['Ascochyta Blight (Ascochyta rabiei)', 'Phytophthora Root Rot'],
    },
    calendar: {
      northernHemisphere: {
        plantingMonths: [2, 3], // Early spring sowing in Mediterranean / temperate
        harvestMonths: [6, 7],
        seasonType: 'spring',
        cycleDurationDays: { min: 110, max: 150, typical: 130 },
      },
      southernHemisphere: {
        plantingMonths: [5, 6], // Late autumn / early winter in southern Mediterranean
        harvestMonths: [11, 12],
        seasonType: 'winter',
        cycleDurationDays: { min: 140, max: 180, typical: 160 },
      },
    },
    citations: [
      {
        source: 'FAO Plant Production and Protection Paper 176',
        citation: 'Yadav et al. (2007). Chickpea Breeding and Management. FAO/CABI.',
        urlOrDoi: 'https://www.fao.org/publications',
        tableOrSection: 'Chapter 4: Pulse water extraction profiles (seasonal water 280-450 mm; high waterlogging sensitivity)',
        applicableConditions: 'Desi and Kabuli chickpeas in semi-arid Mediterranean and temperate winter/spring seasons.',
      },
      {
        source: 'FAO GAEZ v5 Model Documentation',
        citation: 'FAO & IIASA (2021). Global Agro-Ecological Zones (GAEZ v5) Model Documentation.',
        urlOrDoi: 'https://github.com/un-fao/gaezv5/wiki',
        tableOrSection: 'Section 3.3: Chickpea agro-climatic thermal requirements (T-base 7.0 °C, optimum 18.0-28.0 °C; pH 6.2-8.2)',
        applicableConditions: 'Well-drained neutral-to-alkaline soils with low waterlogging risk.',
      },
      {
        source: 'Australian Pulse Agronomy Guides',
        citation: 'Pulse Australia (2020). Chickpea management guidelines and disease break intervals.',
        urlOrDoi: 'https://pulseaus.com.au',
        tableOrSection: 'Chickpea disease management: Mandatory 3-year paddock separation rule to manage Ascochyta blight (Ascochyta rabiei)',
        applicableConditions: 'Broadacre pulse rotations in winter-rainfall Mediterranean environments.',
      },
    ],
    reviewStatus: 'Literature Sourced — Human Agronomic Review Pending',
  },

  field_pea: {
    id: 'field_pea',
    commonName: 'Field Pea',
    scientificName: 'Pisum sativum',
    family: 'Fabaceae',
    category: 'pulse',
    packId: 'temperate_mediterranean_v1',
    description: 'Fast-growing cool-season pulse crop. Low water requirement and rapid early canopy closure with high nitrogen fixation.',
    thermal: {
      baseTempC: 4.0,
      optimumTempC: { min: 13.0, max: 21.0 },
      floweringFrostThresholdC: -1.0,
      heatStressThresholdC: 28.0, // Highly sensitive to high temperatures during flowering
      frostTolerance: 'moderate',
    },
    water: {
      indicativeSeasonalWaterMm: { min: 250, max: 400, typical: 320 },
      droughtHardiness: 'moderate',
      waterloggingSensitivity: 'high',
      irrigationSuitability: 'rainfed_and_irrigated',
    },
    soil: {
      phOptimal: { min: 6.0, max: 7.5 },
      phAbsolute: { min: 5.5, max: 8.5 },
      toleratesHeavyClay: false, // Compaction/cloddy soils restrict nodulation
      toleratesCoarseSand: true,
      drainageRequirement: 'well_drained',
    },
    rotation: {
      minYearsBeforeReplant: 3, // Essential to prevent black spot (Mycosphaerella pinodes)
      isNitrogenFixer: true,
      nitrogenContributionNote: 'High nodulation capacity; leaves residual mineral nitrogen for following cereal crop.',
      residueLevel: 'low',
      residueCoverDurationMonths: 2,
      diseaseBreakFor: ['Cereal cyst nematode', 'Take-all in cereals'],
      diseaseSusceptibleTo: ['Black Spot Complex (Mycosphaerella)', 'Powdery Mildew'],
    },
    calendar: {
      northernHemisphere: {
        plantingMonths: [3, 4],
        harvestMonths: [7, 8],
        seasonType: 'spring',
        cycleDurationDays: { min: 90, max: 120, typical: 105 },
      },
      southernHemisphere: {
        plantingMonths: [5, 6],
        harvestMonths: [10, 11],
        seasonType: 'winter',
        cycleDurationDays: { min: 120, max: 150, typical: 135 },
      },
    },
    citations: [
      {
        source: 'FAO Irrigation and Drainage Paper No. 33',
        citation: 'Doorenbos, J. & Kassam, A.H. (1979). Pea crop coefficients and water response. FAO, Rome.',
        urlOrDoi: 'https://www.fao.org/3/ah857e/AH857E00.htm',
        tableOrSection: 'Part B: Pea (Pisum sativum), Table 29 (seasonal water 250-400 mm; Ky = 1.15; waterlogging sensitivity)',
        applicableConditions: 'Cool-season pulse production under rainfed or supplemental irrigation.',
      },
      {
        source: 'FAO GAEZ v5 Model Documentation',
        citation: 'FAO/IIASA (2021). GAEZ v5 Soil and Terrain Suitability for Pulses.',
        urlOrDoi: 'https://github.com/un-fao/gaezv5/wiki',
        tableOrSection: 'Section 4.1: Soil and Terrain Suitability (Pisum sativum sensitivity to heavy clay Vertisols due to poor structure and waterlogging)',
        applicableConditions: 'Loamy and sandy-loam soils; unsuitable for heavy, poorly drained clay.',
      },
      {
        source: 'INRAE Crop Rotation Database',
        citation: 'Justes, E. et al. (2012). Benefits of grain legumes in crop rotations. Agronomy for Sustainable Development.',
        urlOrDoi: 'https://doi.org/10.1007/s13593-011-0036-7',
        tableOrSection: 'Table 2: Preceding crop effects and nitrogen carryover from pea to following winter cereals',
        applicableConditions: 'Temperate European and Mediterranean conservation rotations.',
      },
    ],
    reviewStatus: 'Literature Sourced — Human Agronomic Review Pending',
  },

  canola: {
    id: 'canola',
    commonName: 'Canola / Oilseed Rape',
    scientificName: 'Brassica napus',
    family: 'Brassicaceae',
    category: 'oilseed',
    packId: 'temperate_mediterranean_v1',
    description: 'High-value oilseed with a deep, tap-rooted architecture. Produces biofumigant glucosinolates that naturally suppress cereal root pathogens.',
    thermal: {
      baseTempC: 3.5,
      optimumTempC: { min: 14.0, max: 21.0 },
      floweringFrostThresholdC: -1.5,
      heatStressThresholdC: 30.0,
      frostTolerance: 'high',
    },
    water: {
      indicativeSeasonalWaterMm: { min: 380, max: 650, typical: 480 },
      droughtHardiness: 'moderate',
      waterloggingSensitivity: 'high', // Sensitive during emergence and rosette stage
      irrigationSuitability: 'rainfed_and_irrigated',
    },
    soil: {
      phOptimal: { min: 6.0, max: 7.2 },
      phAbsolute: { min: 5.2, max: 8.2 },
      toleratesHeavyClay: true,
      toleratesCoarseSand: false,
      drainageRequirement: 'moderate',
    },
    rotation: {
      minYearsBeforeReplant: 3, // Mandatory 3-year break to suppress Blackleg (Leptosphaeria maculans) and Sclerotinia
      isNitrogenFixer: false,
      nitrogenContributionNote: null,
      residueLevel: 'medium',
      residueCoverDurationMonths: 3,
      diseaseBreakFor: ['Take-all (Gaeumannomyces tritici)', 'Crown Rot (Fusarium)'],
      diseaseSusceptibleTo: ['Blackleg (Leptosphaeria maculans)', 'Sclerotinia Stem Rot (Sclerotinia sclerotiorum)'],
    },
    calendar: {
      northernHemisphere: {
        plantingMonths: [8, 9], // Winter rape late summer sowing, or March spring sowing
        harvestMonths: [6, 7],
        seasonType: 'winter',
        cycleDurationDays: { min: 240, max: 300, typical: 270 },
      },
      southernHemisphere: {
        plantingMonths: [4, 5], // Mid autumn
        harvestMonths: [11, 12],
        seasonType: 'winter',
        cycleDurationDays: { min: 180, max: 230, typical: 205 },
      },
    },
    citations: [
      {
        source: 'FAO Irrigation and Drainage Paper No. 56',
        citation: 'Allen, R.G. et al. (1998). Crop evapotranspiration: Guidelines for computing crop water requirements. FAO, Rome.',
        urlOrDoi: 'https://www.fao.org/3/x0490e/x0490e0b.htm',
        tableOrSection: 'Chapter 6, Table 12: Canola single crop coefficient (Kc-mid 1.15; seasonal water 380-650 mm; root depth 1.0-1.5 m)',
        applicableConditions: 'Winter and spring oilseed rape under rainfed (>= 380 mm) or irrigated management.',
      },
      {
        source: 'Australian Oilseeds Federation Guide',
        citation: 'AOF (2019). Better Canola agronomic and rotational guidelines.',
        urlOrDoi: 'https://www.australianoilseeds.com',
        tableOrSection: 'Section 3: Blackleg (Leptosphaeria maculans) risk management (minimum 3-year break between canola crops in same paddock)',
        applicableConditions: 'Intensive canola rotations subject to stubble-borne airborne ascospore pressure.',
      },
    ],
    reviewStatus: 'Literature Sourced — Human Agronomic Review Pending',
  },

  grain_sorghum: {
    id: 'grain_sorghum',
    commonName: 'Grain Sorghum',
    scientificName: 'Sorghum bicolor',
    family: 'Poaceae',
    category: 'cereal',
    packId: 'temperate_mediterranean_v1',
    description: 'Warm-season C4 grain with remarkable drought hardiness and heat tolerance. Grown as a summer rotation option where soil moisture or summer rain permits.',
    thermal: {
      baseTempC: 10.0, // High base temp; will not germinate in cold soils < 15°C
      optimumTempC: { min: 25.0, max: 34.0 },
      floweringFrostThresholdC: 0.0, // Extremely frost sensitive
      heatStressThresholdC: 38.0,
      frostTolerance: 'low',
    },
    water: {
      indicativeSeasonalWaterMm: { min: 350, max: 550, typical: 420 },
      droughtHardiness: 'high',
      waterloggingSensitivity: 'moderate',
      irrigationSuitability: 'rainfed_and_irrigated',
    },
    soil: {
      phOptimal: { min: 6.0, max: 7.5 },
      phAbsolute: { min: 5.0, max: 8.5 },
      toleratesHeavyClay: true,
      toleratesCoarseSand: false,
      drainageRequirement: 'moderate',
    },
    rotation: {
      minYearsBeforeReplant: 2,
      isNitrogenFixer: false,
      nitrogenContributionNote: null,
      residueLevel: 'high',
      residueCoverDurationMonths: 6, // Heavy, persistent stubble that protects against summer/autumn soil evaporation
      diseaseBreakFor: ['Winter cereal root pathogens'],
      diseaseSusceptibleTo: ['Ergot (Claviceps africana)', 'Charcoal Rot (Macrophomina phaseolina)'],
    },
    calendar: {
      northernHemisphere: {
        plantingMonths: [5, 6], // Late spring sowing once soil warms > 16°C
        harvestMonths: [9, 10],
        seasonType: 'summer',
        cycleDurationDays: { min: 110, max: 140, typical: 125 },
      },
      southernHemisphere: {
        plantingMonths: [10, 11, 12],
        harvestMonths: [3, 4],
        seasonType: 'summer',
        cycleDurationDays: { min: 110, max: 140, typical: 125 },
      },
    },
    citations: [
      {
        source: 'FAO Irrigation and Drainage Paper No. 33',
        citation: 'Doorenbos, J. & Kassam, A.H. (1979). Yield response to water: Sorghum. FAO, Rome.',
        urlOrDoi: 'https://www.fao.org/3/ah857e/AH857E00.htm',
        tableOrSection: 'Part B: Sorghum (Sorghum bicolor), Table 31 (seasonal water 350-550 mm; Ky = 0.9; drought response and stomatal regulation)',
        applicableConditions: 'Summer cropping in semi-arid zones with >= 350 mm growing-season rainfall or stored subsoil moisture.',
      },
      {
        source: 'USDA-ARS Sorghum Research',
        citation: 'Rooney, W.L. (2014). Sorghum Breeding and Genetics in Water-Limited Environments.',
        urlOrDoi: 'https://www.ars.usda.gov',
        tableOrSection: 'Section 2: Sorghum thermal thresholds (T-base 10.0 °C; flowering heat threshold 38.0 °C; stay-green traits and summer water efficiency)',
        applicableConditions: 'Warm-season semi-arid grain production on structured soils.',
      },
    ],
    reviewStatus: 'Literature Sourced — Human Agronomic Review Pending',
  },

  cover_vetch_oats: {
    id: 'cover_vetch_oats',
    commonName: 'Cover Crop (Oat & Vetch Mixture)',
    scientificName: 'Avena sativa + Vicia sativa',
    family: 'Poaceae + Fabaceae',
    category: 'cover_crop',
    packId: 'temperate_mediterranean_v1',
    description: 'Biculture cover crop blending fibrous oat rooting (scavenging nitrate and building mycorrhizae) with vetch atmospheric nitrogen fixation and rapid ground cover.',
    thermal: {
      baseTempC: 3.5,
      optimumTempC: { min: 14.0, max: 22.0 },
      floweringFrostThresholdC: -3.0,
      heatStressThresholdC: 30.0,
      frostTolerance: 'high',
    },
    water: {
      indicativeSeasonalWaterMm: { min: 200, max: 350, typical: 250 },
      droughtHardiness: 'high',
      waterloggingSensitivity: 'moderate',
      irrigationSuitability: 'rainfed_and_irrigated',
    },
    soil: {
      phOptimal: { min: 5.8, max: 7.5 },
      phAbsolute: { min: 5.0, max: 8.5 },
      toleratesHeavyClay: true,
      toleratesCoarseSand: true,
      drainageRequirement: 'moderate',
    },
    rotation: {
      minYearsBeforeReplant: 0, // Managed non-cash biculture terminated before seed set; does not have a statutory multi-year replant ban
      isNitrogenFixer: true,
      nitrogenContributionNote: 'If terminated in early spring and retained as surface mulch, supplies 40-80 kg N/ha equivalent depending on biomass and vetch proportion. Net water benefit depends on terminating before subsoil water depletion.',
      residueLevel: 'high',
      residueCoverDurationMonths: 5,
      diseaseBreakFor: ['Brassica blackleg', 'Fusarium root rot in pulses (efficacy depends on following crop)'],
      diseaseSusceptibleTo: ['Cereal crown rot carryover (via oat component if following wheat/barley)', 'Rhizoctonia if terminated late'],
    },
    calendar: {
      northernHemisphere: {
        plantingMonths: [9, 10], // Autumn sowing for winter ground cover
        harvestMonths: [3, 4],   // Spring termination before main cash crop
        seasonType: 'winter',
        cycleDurationDays: { min: 120, max: 180, typical: 150 },
      },
      southernHemisphere: {
        plantingMonths: [4, 5],
        harvestMonths: [9, 10],
        seasonType: 'winter',
        cycleDurationDays: { min: 120, max: 180, typical: 150 },
      },
    },
    citations: [
      {
        source: 'FAO Soil Bulletin No. 80',
        citation: 'FAO (2005). The importance of soil organic matter: Key to drought-resistant soil. FAO, Rome.',
        urlOrDoi: 'https://www.fao.org/3/a0100e/a0100e00.htm',
        tableOrSection: 'Chapter 5: Cover crops in conservation agriculture (residue decomposition, organic matter maintenance, and moisture conservation)',
        applicableConditions: 'Semi-arid and Mediterranean conservation cropping with non-inversion tillage.',
      },
      {
        source: 'USDA-NRCS Cover Crop Specification Guide',
        citation: 'USDA Natural Resources Conservation Service (2020). Cover Crop (Code 340) Standard.',
        urlOrDoi: 'https://www.nrcs.usda.gov',
        tableOrSection: 'Practice Code 340 Standard: Cereal-legume biculture seeding rates, biomass targets, and termination rules (pp. 1-6)',
        applicableConditions: 'Cover crop systems terminated prior to cash crop planting; not grown to grain maturity.',
      },
    ],
    reviewStatus: 'Literature Sourced — Human Agronomic Review Pending',
    componentEvidence:
      'Component 1 (Avena sativa - Oat, Poaceae): Fibrous root system, high C:N ratio (>30:1), scavenges residual nitrate, builds aggregate organic carbon; host to cereal root pathogens (Take-all, Crown rot) if followed by susceptible cereals. Sourced from USDA-NRCS Standard 340 and FAO Soils Bulletin 80.\nComponent 2 (Vicia sativa - Common Vetch, Fabaceae): Taproot system, low C:N ratio (<15:1), biological nitrogen fixation (N₂) via Rhizobium leguminosarum bv. viciae; susceptible to pulse root-rot complexes. Sourced from FAO Plant Production Paper 182 and USDA-NRCS.\nMixture Assumptions: Typically co-seeded in 60:40 to 70:30 seed weight ratio. Biomass and nitrogen crediting (40-80 kg N/ha equivalent) depend strictly on termination timing (roller-crimping or herbicide in early spring before seed set and before subsoil moisture is depleted) rather than statutory universal break rules. It does not carry a hard replant constraint.',
  },
};

/**
 * Normalizes free-text user crop input and matches to catalogue where possible.
 */
export function matchCropToCatalogue(inputName: string): CropDefinition | null {
  const clean = inputName.trim().toLowerCase();
  if (!clean) return null;

  for (const crop of Object.values(CROP_CATALOGUE)) {
    if (crop.id === clean) return crop;
    if (crop.commonName.toLowerCase() === clean) return crop;
    if (crop.scientificName.toLowerCase() === clean) return crop;
    
    // Alias / keyword matches
    if (clean.includes('wheat') && crop.id === 'bread_wheat') return crop;
    if (clean.includes('barley') && crop.id === 'feed_barley') return crop;
    if (clean.includes('chickpea') && crop.id === 'chickpea') return crop;
    if (clean.includes('garbanzo') && crop.id === 'chickpea') return crop;
    if (clean.includes('pea') && crop.id === 'field_pea') return crop;
    if ((clean.includes('canola') || clean.includes('rapeseed') || clean.includes('oilseed') || clean.includes('rape')) && crop.id === 'canola') return crop;
    if (clean.includes('sorghum') && crop.id === 'grain_sorghum') return crop;
    if ((clean.includes('vetch') || clean.includes('cover')) && crop.id === 'cover_vetch_oats') return crop;
  }

  return null;
}
