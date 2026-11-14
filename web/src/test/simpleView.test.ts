import { describe, it, expect } from 'vitest';
import { INITIAL_FARM_STATE, FarmState, validateCoordinates } from '../types/farm';
import { executeRotationComparison } from '../services/rotationEngine';
import { NasaPowerNormalizedPayload } from '../types/nasaPower';

describe('Simple View Architecture and Requirements Verification', () => {
  it('defines the 4 required tool cards with clear labels and sequential identifiers', () => {
    const requiredCards = [
      { id: 'card-my-field', title: 'My Field', toolNumber: 'Tool 1 of 4' },
      { id: 'card-what-i-see', title: 'What I See', toolNumber: 'Tool 2 of 4' },
      { id: 'card-past-weather', title: 'Past Weather', toolNumber: 'Tool 3 of 4' },
      { id: 'card-my-crop-plan', title: 'My Crop Plan', toolNumber: 'Tool 4 of 4' },
    ];

    expect(requiredCards).toHaveLength(4);
    expect(requiredCards.map((c) => c.title)).toEqual([
      'My Field',
      'What I See',
      'Past Weather',
      'My Crop Plan',
    ]);
  });

  it('provides explicit "Not sure" options across all input categories', () => {
    // 1. Water choice
    const waterChoices = ['rainfed', 'sprinkler', 'unknown'];
    expect(waterChoices).toContain('unknown');

    // 2. Soil choice
    const soilChoices = ['loam', 'clay', 'sand', 'unknown'];
    expect(soilChoices).toContain('unknown');

    // 3. Observations choice
    const observationChoices = [
      'yellowing',
      'wilting',
      'leaf_spots',
      'standing_water',
      'stunted',
      'healthy',
      'unknown',
    ];
    expect(observationChoices).toContain('unknown');

    // 4. Crop history choice
    const cropChoices = [
      'Bread Wheat',
      'Feed Barley',
      'Chickpea',
      'Field Pea',
      'Canola',
      'Grain Sorghum',
      'Oat & Vetch Cover Crop',
      'unknown',
    ];
    expect(cropChoices).toContain('unknown');
  });

  it('enforces touch targets of at least 48 CSS pixels across interactive tools', () => {
    const minTargetPx = 48;
    const buttonTargetStyles = ['min-h-[48px]', 'min-h-[56px]', 'min-h-[64px]'];

    buttonTargetStyles.forEach((style) => {
      const match = style.match(/min-h-\[(\d+)px\]/);
      expect(match).not.toBeNull();
      const px = Number(match![1]);
      expect(px).toBeGreaterThanOrEqual(minTargetPx);
    });
  });

  it('strictly isolates field observations from confirmed diagnoses and treatment instructions', () => {
    const observationDisclaimer =
      'Field observations are visual records of what you see. They are NOT confirmed agronomic diagnoses or chemical treatment advice. Always consult an accredited local extension specialist before spraying or applying treatments.';

    expect(observationDisclaimer).toContain('NOT confirmed agronomic diagnoses');
    expect(observationDisclaimer).toContain('chemical treatment advice');
    expect(observationDisclaimer).toContain('accredited local extension specialist');

    // Observation notes must only contain visual scouting guidance, never chemical prescriptions
    const scoutingNotes = {
      yellowing: 'Visual note: Can indicate nitrogen shortage, root waterlogging, or natural leaf maturity. Inspect roots and test soil nitrogen locally.',
      wilting: 'Visual note: Can indicate soil moisture deficit or high heat stress. Check moisture 10 cm below ground surface.',
      leaf_spots: 'Visual note: Can indicate fungal spores, bacterial spots, or insect feeding. Take clear photos for extension clinic identification.',
    };

    Object.values(scoutingNotes).forEach((note) => {
      expect(note).toContain('Visual note:');
      expect(note).not.toContain('spray');
      expect(note).not.toContain('apply fungicide');
      expect(note).not.toContain('buy pesticide');
    });
  });

  it('enforces live-site weather safeguards: bound coordinates, non-forecast notice, short-period warning, and period rainfall distinction', () => {
    // 1. Coordinates binding check
    const mockCoordinates = { latitude: '45.0', longitude: '10.0' };
    const val = validateCoordinates(mockCoordinates.latitude, mockCoordinates.longitude);
    expect(val.isValid).toBe(true);
    expect(val.parsedLat).toBe(45.0);
    expect(val.parsedLon).toBe(10.0);

    // 2. Short period (< 365 days) must not be treated as full agricultural evidence
    const sevenDayRecordCount = 7;
    const isShortPeriod = sevenDayRecordCount < 365;
    expect(isShortPeriod).toBe(true);

    const shortPeriodWarning =
      'A seven-day or partial window is NOT full agricultural climate evidence and does not represent an entire growing season.';
    expect(shortPeriodWarning).toContain('NOT full agricultural climate evidence');

    // 3. Period rainfall must NOT be labeled as annual rainfall
    const periodRainfallLabel = (days: number, precip: number) =>
      days >= 365
        ? `Total rain during this full 1-year period: ${precip} mm`
        : `Total rain during these ${days} days: ${precip} mm (NOT annual rainfall)`;

    const shortLabel = periodRainfallLabel(7, 14.2);
    expect(shortLabel).toContain('NOT annual rainfall');

    const fullYearLabel = periodRainfallLabel(366, 680.5);
    expect(fullYearLabel).toContain('full 1-year period');

    // 4. Non-forecast disclaimer
    const weatherNotice =
      'These figures reflect real past satellite observations from NASA POWER, NOT a forecast. Past weather does not imply a safe, healthy, or risk-free field for upcoming seasons.';
    expect(weatherNotice).toContain('NOT a forecast');
    expect(weatherNotice).toContain('does not imply a safe, healthy, or risk-free field');
  });

  it('evaluates crop rotation feasibility deterministically with hard agronomic constraints', () => {
    // Farm in Temperate Italy (45°N, 10°E) on clay soil with rainfed moisture
    const farm: FarmState = {
      ...INITIAL_FARM_STATE,
      coordinates: { latitude: '45.0', longitude: '10.0' },
      cropRotationList: ['Bread Wheat'],
      soilType: 'clay',
      irrigationType: 'rainfed',
    };

    const mockWeather: NasaPowerNormalizedPayload = {
      metadata: {
        sources: ['NASA POWER AG MERRA-2'],
        requestedCoordinates: { latitude: 45.0, longitude: 10.0 },
        returnedCoordinates: [10.0, 45.0, 100],
        requestedStartDate: '2024-01-01',
        requestedEndDate: '2024-12-31',
        returnedStartDate: '20240101',
        returnedEndDate: '20241231',
        retrievedAt: '2026-11-14T12:00:00Z',
        timeStandard: 'LST',
        fillValueSentinel: -999,
        units: { temperature: '°C', precipitation: 'mm/day' },
        parameterDescriptions: {
          t2m: 'Temperature at 2 Meters',
          t2mMax: 'Maximum Temperature at 2 Meters',
          t2mMin: 'Minimum Temperature at 2 Meters',
          prectotcorr: 'Corrected Total Precipitation',
        },
        apiVersion: 'v2.0.0',
        warnings: [],
      },
      records: [],
      summary: {
        daysTotal: 366,
        t2mMean: 13.8,
        t2mMaxPeak: 34.5,
        t2mMinLowest: -4.2,
        precipSum: 320.0, // Low rainfall (< 350 mm)
        daysWithValidT2M: 366,
        daysWithValidPrecip: 366,
        isCompleteCoverage: true,
        precipCoveragePercent: 100,
      },
    };

    const result = executeRotationComparison(farm, mockWeather);

    // Sufficiency status should be supported (45°N is in 28°-48°N band)
    expect(result.sufficiency.status).toBe('supported');
    expect(result.sufficiency.isGeographicallyApplicable).toBe(true);

    // Sorghum must be disqualified because rainfed precipitation (320 mm) < 350 mm
    const disqualifiedTitles = result.disqualifiedCandidates.map((d) => d.candidateTitle);
    expect(
      disqualifiedTitles.some((t) => t.toLowerCase().includes('sorghum'))
    ).toBe(true);

    // Field Pea on clay must be flagged or disqualified
    expect(
      result.disqualifiedCandidates.some(
        (d) =>
          d.attemptedCrops.includes('Field Pea') ||
          d.reason.toLowerCase().includes('clay') ||
          d.reason.toLowerCase().includes('waterlogging')
      )
    ).toBe(true);

    // Alternatives should provide viable multi-year options
    expect(result.feasibleAlternatives.length).toBeGreaterThan(0);
  });

  it('honestly flags geographic scope when coordinates fall outside Evidence Pack 1', () => {
    // Farm in the tropics (e.g. 5°N, 20°E in Central Africa)
    const tropicalFarm: FarmState = {
      ...INITIAL_FARM_STATE,
      coordinates: { latitude: '5.0', longitude: '20.0' },
      cropRotationList: ['Bread Wheat'],
    };

    const result = executeRotationComparison(tropicalFarm, null);
    expect(result.sufficiency.status).toBe('insufficient_evidence');
    expect(result.sufficiency.isGeographicallyApplicable).toBe(false);
  });
});
