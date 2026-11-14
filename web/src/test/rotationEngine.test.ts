import { describe, it, expect } from 'vitest';
import {
  assessInputSufficiency,
  evaluateBaseline,
  generateFeasibleAlternatives,
  executeRotationComparison,
} from '../services/rotationEngine';
import { FarmState } from '../types/farm';
import { NasaPowerNormalizedPayload } from '../types/nasaPower';

const mockFarmState: FarmState = {
  farmName: 'Po Valley Pilot Farm',
  locationLabel: 'Emilia-Romagna, Italy',
  coordinates: {
    latitude: '45.0000',
    longitude: '10.0000',
  },
  soilType: 'loam',
  irrigationType: 'rainfed',
  cropRotationInput: 'Bread Wheat, Feed Barley',
  cropRotationList: ['Bread Wheat', 'Feed Barley'],
  priorities: {
    mainPriority: 'water',
    additionalPriorities: ['soil'],
  },
};

const mockWeatherData: NasaPowerNormalizedPayload = {
  metadata: {
    requestedCoordinates: { latitude: 45, longitude: 10 },
    returnedCoordinates: [10, 45, 50],
    requestedStartDate: '2024-01-01',
    requestedEndDate: '2024-12-31',
    returnedStartDate: '20240101',
    returnedEndDate: '20241231',
    sources: ['MERRA2', 'POWER'],
    apiVersion: 'v2.4.1',
    timeStandard: 'LST',
    fillValueSentinel: -999,
    units: {
      temperature: '°C',
      precipitation: 'mm/day',
    },
    parameterDescriptions: {
      t2m: 'Daily mean temperature',
      t2mMax: 'Daily maximum temperature',
      t2mMin: 'Daily minimum temperature',
      prectotcorr: 'Corrected precipitation',
    },
    retrievedAt: '2025-01-01T00:00:00.000Z',
    warnings: [],
  },
  records: [
    {
      dateStr: '20240101',
      displayDate: '2024-01-01',
      t2m: 5.2,
      t2mMax: 9.8,
      t2mMin: 1.1,
      prectotcorr: 2.5,
    },
    {
      dateStr: '20240102',
      displayDate: '2024-01-02',
      t2m: 4.8,
      t2mMax: 8.5,
      t2mMin: 0.5,
      prectotcorr: 0.0,
    },
  ],
  summary: {
    daysTotal: 365,
    daysWithValidT2M: 365,
    daysWithValidPrecip: 365,
    t2mMean: 13.5,
    t2mMaxPeak: 34.2,
    t2mMinLowest: -3.8,
    precipSum: 550.0,
    precipCoveragePercent: 100,
    isCompleteCoverage: true,
  },
};

describe('Rotation Engine — Input Sufficiency Assessment', () => {
  it('returns insufficient_evidence if coordinates are missing or invalid', () => {
    const invalidFarm: FarmState = {
      ...mockFarmState,
      coordinates: { latitude: '', longitude: '' },
    };
    const res = assessInputSufficiency(invalidFarm, null);
    expect(res.status).toBe('insufficient_evidence');
    expect(res.isGeographicallyApplicable).toBe(false);
    expect(res.identifiedGaps[0]).toContain('Missing valid numerical latitude and longitude');
  });

  it('returns insufficient_evidence if coordinates are outside Evidence Pack 1 scope', () => {
    // 10°N is tropical, outside 28°-48°N
    const tropicalFarm: FarmState = {
      ...mockFarmState,
      coordinates: { latitude: '10.0000', longitude: '76.0000' },
    };
    const res = assessInputSufficiency(tropicalFarm, null);
    expect(res.status).toBe('insufficient_evidence');
    expect(res.isGeographicallyApplicable).toBe(false);
    expect(res.summaryMessage).toContain('outside the validated geographic scope of Evidence Pack 1');
  });

  it('returns partial if coordinates are within scope but weather data or crops are missing', () => {
    const res = assessInputSufficiency(mockFarmState, null);
    expect(res.status).toBe('partial');
    expect(res.isGeographicallyApplicable).toBe(true);
    expect(res.identifiedGaps.some((g) => g.includes('NASA POWER'))).toBe(true);
  });

  it('returns supported when within scope, weather data loaded, crops entered, and soil specified', () => {
    const res = assessInputSufficiency(mockFarmState, mockWeatherData);
    expect(res.status).toBe('supported');
    expect(res.isGeographicallyApplicable).toBe(true);
    expect(res.identifiedGaps).toHaveLength(0);
  });
});

describe('Rotation Engine — Baseline Evaluation', () => {
  it('evaluates baseline sequence without synthetic substitution', () => {
    const baseline = evaluateBaseline(mockFarmState, 'northern', mockWeatherData);
    expect(baseline.isBaseline).toBe(true);
    expect(baseline.cropSequence).toEqual(['Bread Wheat', 'Feed Barley']);
    expect(baseline.phases).toHaveLength(2);
    expect(baseline.phases[0].cropName).toBe('Bread Wheat');
    expect(baseline.phases[1].cropName).toBe('Feed Barley');
  });

  it('detects consecutive botanical family repetition and flags disease break warning', () => {
    // Bread Wheat and Feed Barley are both Poaceae
    const baseline = evaluateBaseline(mockFarmState, 'northern', mockWeatherData);
    expect(baseline.metrics.familyRepetitionCount).toBe(1);
    expect(baseline.phases[1].breakRuleWarning).toContain('Successive planting of Poaceae');
    expect(baseline.whatMightBeWorthInvestigating[0]).toContain('Investigate disease break intervals');
  });

  it('does not flag family repetition for botanical diverse sequence', () => {
    const diverseFarm: FarmState = {
      ...mockFarmState,
      cropRotationList: ['Bread Wheat', 'Chickpea (Desi / Kabuli)'],
    };
    const baseline = evaluateBaseline(diverseFarm, 'northern', mockWeatherData);
    expect(baseline.metrics.familyRepetitionCount).toBe(0);
    expect(baseline.phases[1].breakRuleWarning).toBeNull();
  });

  it('flags clay soil sensitivity warning when soil is clay and crop does not tolerate it', () => {
    const clayFarm: FarmState = {
      ...mockFarmState,
      soilType: 'clay',
      cropRotationList: ['Field Pea'],
    };
    const baseline = evaluateBaseline(clayFarm, 'northern', mockWeatherData);
    expect(baseline.phases[0].soilSuitabilityWarning).toContain('sensitive to heavy, poorly drained clay soil');
  });
});

describe('Rotation Engine — Feasible Alternatives & Hard Constraints', () => {
  it('generates Alternative A (diversification) and Alternative B (water resilience)', () => {
    const { alternatives } = generateFeasibleAlternatives(mockFarmState, 'northern', mockWeatherData);
    expect(alternatives).toHaveLength(2);

    const altA = alternatives.find((a) => a.id === 'alt_diversified_nitrogen');
    expect(altA).toBeDefined();
    expect(altA?.cropSequence).toEqual([
      'Bread Wheat',
      'Chickpea (Desi / Kabuli)',
      'Canola / Oilseed Rape',
      'Feed Barley',
    ]);
    expect(altA?.metrics.familyRepetitionCount).toBe(0);
    expect(altA?.metrics.hasNitrogenFixingPhase).toBe(true);
    expect(altA?.metrics.hasDiseaseBreakPhase).toBe(true);

    const altB = alternatives.find((a) => a.id === 'alt_water_resilience');
    expect(altB).toBeDefined();
    expect(altB?.cropSequence).toEqual([
      'Feed Barley',
      'Cover Crop (Oat & Vetch Mixture)',
      'Bread Wheat',
    ]);
    expect(altB?.metrics.hasNitrogenFixingPhase).toBe(true);
  });

  it('disqualifies Sorghum under rainfed conditions with annual rainfall < 350 mm', () => {
    const dryWeatherData: NasaPowerNormalizedPayload = {
      ...mockWeatherData,
      summary: {
        ...mockWeatherData.summary,
        precipSum: 220.0,
      },
    };
    const { disqualified } = generateFeasibleAlternatives(mockFarmState, 'northern', dryWeatherData);
    const sorghumDisq = disqualified.find((d) => d.candidateTitle.includes('Sorghum'));
    expect(sorghumDisq).toBeDefined();
    expect(sorghumDisq?.disqualifyingRule).toContain('Rainfed Moisture Deficit');
    expect(sorghumDisq?.citation).toContain('FAO Irrigation and Drainage Paper No. 33');
  });

  it('disqualifies Field Pea candidate when soil is clay', () => {
    const clayFarm: FarmState = {
      ...mockFarmState,
      soilType: 'clay',
    };
    const { disqualified } = generateFeasibleAlternatives(clayFarm, 'northern', mockWeatherData);
    const peaDisq = disqualified.find((d) => d.candidateTitle.includes('Field Pea'));
    expect(peaDisq).toBeDefined();
    expect(peaDisq?.disqualifyingRule).toContain('Soil Drainage & Texture Constraint');
    expect(peaDisq?.citation).toContain('GAEZ v5');
  });

  it('does NOT disqualify Field Pea when soil is loam or sand', () => {
    const loamFarm: FarmState = {
      ...mockFarmState,
      soilType: 'loam',
    };
    const { disqualified } = generateFeasibleAlternatives(loamFarm, 'northern', mockWeatherData);
    const peaDisq = disqualified.find((d) => d.candidateTitle.includes('Field Pea'));
    expect(peaDisq).toBeUndefined();
  });
});

describe('Rotation Engine — Complete Pipeline & 4 Farmer Questions', () => {
  it('populates all 4 farmer questions for baseline and feasible alternatives', () => {
    const result = executeRotationComparison(mockFarmState, mockWeatherData);
    const allPlans = [result.baselinePlan, ...result.feasibleAlternatives];

    for (const plan of allPlans) {
      expect(plan.whatChanges.length).toBeGreaterThanOrEqual(1);
      expect(plan.whatMightBeWorthInvestigating.length).toBeGreaterThanOrEqual(1);
      expect(plan.whatNeedsCheckingLocally.length).toBeGreaterThanOrEqual(1);
      expect(plan.whatInformationIsMissing.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('produces identical deterministic results when called with identical inputs', () => {
    const run1 = executeRotationComparison(mockFarmState, mockWeatherData);
    const run2 = executeRotationComparison(mockFarmState, mockWeatherData);

    expect(run1.baselinePlan.cropSequence).toEqual(run2.baselinePlan.cropSequence);
    expect(run1.baselinePlan.metrics).toEqual(run2.baselinePlan.metrics);
    expect(run1.feasibleAlternatives.length).toBe(run2.feasibleAlternatives.length);
    expect(run1.disqualifiedCandidates.length).toBe(run2.disqualifiedCandidates.length);
  });

  it('demonstrates calendar-backed comparisons in northern hemisphere', () => {
    const result = executeRotationComparison(mockFarmState, mockWeatherData);
    expect(result.sufficiency.hemisphere).toBe('northern');
    expect(result.baselinePlan.calendarDescription).toContain('northern hemisphere');

    const altA = result.feasibleAlternatives.find((a) => a.id === 'alt_diversified_nitrogen');
    expect(altA).toBeDefined();
    expect(altA?.phases).toHaveLength(4);

    // Bread wheat phase in northern hemisphere
    const wheatPhase = altA?.phases[0];
    expect(wheatPhase?.cropName).toBe('Bread Wheat');
    expect(wheatPhase?.matchedCrop?.calendar.northernHemisphere.plantingMonths).toEqual([10, 11]);
    expect(wheatPhase?.matchedCrop?.calendar.northernHemisphere.harvestMonths).toEqual([6, 7]);
    expect(wheatPhase?.matchedCrop?.calendar.northernHemisphere.cycleDurationDays.typical).toBe(240);
  });

  it('demonstrates calendar-backed comparisons in southern hemisphere', () => {
    const southernFarm: FarmState = {
      ...mockFarmState,
      farmName: 'South Australian Grain Farm',
      locationLabel: 'Clare Valley, SA, Australia',
      coordinates: {
        latitude: '-33.8333',
        longitude: '138.6167',
      },
      cropRotationList: ['Bread Wheat', 'Canola / Oilseed Rape'],
    };

    const result = executeRotationComparison(southernFarm, mockWeatherData);
    expect(result.sufficiency.hemisphere).toBe('southern');
    expect(result.baselinePlan.calendarDescription).toContain('southern hemisphere');

    const altA = result.feasibleAlternatives.find((a) => a.id === 'alt_diversified_nitrogen');
    expect(altA).toBeDefined();

    // Bread wheat phase in southern hemisphere (autumn sowing, late spring harvest)
    const wheatPhase = altA?.phases[0];
    expect(wheatPhase?.matchedCrop?.calendar.southernHemisphere.plantingMonths).toEqual([4, 5, 6]);
    expect(wheatPhase?.matchedCrop?.calendar.southernHemisphere.harvestMonths).toEqual([11, 12]);
    expect(wheatPhase?.matchedCrop?.calendar.southernHemisphere.cycleDurationDays.typical).toBe(210);
  });

  it('honestly reports gaps for unmapped crops without synthetic substitution', () => {
    const unmappedFarm: FarmState = {
      ...mockFarmState,
      cropRotationList: ['Cassava', 'Teff'],
    };

    const result = executeRotationComparison(unmappedFarm, mockWeatherData);
    expect(result.baselinePlan.phases[0].matchedCrop).toBeNull();
    expect(result.baselinePlan.phases[0].family).toBe('Unknown family');
    expect(result.baselinePlan.phases[0].seasonType).toBe('unmapped');
    expect(result.baselinePlan.cropSequence).toEqual(['Cassava', 'Teff']); // preserved
  });
});
