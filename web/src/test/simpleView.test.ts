import { describe, it, expect } from 'vitest';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { SimpleView } from '../components/simple/SimpleView';
import { INITIAL_FARM_STATE, FarmState } from '../types/farm';
import { NasaPowerNormalizedPayload } from '../types/nasaPower';

// Helper to render SimpleView into real HTML string
function renderSimpleView(
  farmState: FarmState,
  nasaData: NasaPowerNormalizedPayload | null = null
): string {
  return ReactDOMServer.renderToString(
    React.createElement(SimpleView, {
      farmState,
      onChange: () => {},
      nasaData,
      onNasaDataLoaded: () => {},
      onSwitchToStandard: () => {},
    })
  );
}

// Sample mock weather payloads
function createMockWeather(overrides: {
  lat?: number;
  lon?: number;
  daysTotal?: number;
  precipSum?: number;
  startDate?: string;
  endDate?: string;
} = {}): NasaPowerNormalizedPayload {
  const days = overrides.daysTotal ?? 366;
  const lat = overrides.lat ?? 45.0;
  const lon = overrides.lon ?? 10.0;
  const precip = overrides.precipSum ?? 600.0;
  const start = overrides.startDate ?? '2024-01-01';
  const end = overrides.endDate ?? '2024-12-31';

  return {
    metadata: {
      sources: ['NASA POWER AG MERRA-2'],
      requestedCoordinates: { latitude: lat, longitude: lon },
      returnedCoordinates: [lon, lat, 100],
      requestedStartDate: start,
      requestedEndDate: end,
      returnedStartDate: start.replace(/-/g, ''),
      returnedEndDate: end.replace(/-/g, ''),
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
    records: new Array(days).fill(null).map((_, i) => ({
      dateStr: `202401${String((i % 28) + 1).padStart(2, '0')}`,
      displayDate: `2024-01-${String((i % 28) + 1).padStart(2, '0')}`,
      t2m: 14.2,
      t2mMax: 20.1,
      t2mMin: 8.5,
      prectotcorr: precip / days,
    })),
    summary: {
      daysTotal: days,
      t2mMean: 14.2,
      t2mMaxPeak: 33.1,
      t2mMinLowest: -2.4,
      precipSum: precip,
      daysWithValidT2M: days,
      daysWithValidPrecip: days,
      isCompleteCoverage: true,
      precipCoveragePercent: 100,
    },
  };
}

describe('SimpleView Component Rendered Regression Tests', () => {
  it('renders all 4 primary tool cards with sequential headings and clear labels', () => {
    const html = renderSimpleView(INITIAL_FARM_STATE);

    expect(html).toContain('id="card-my-field"');
    expect(html).toContain('Tool 1 of 4');
    expect(html).toContain('My Field');

    expect(html).toContain('id="card-what-i-see"');
    expect(html).toContain('Tool 2 of 4');
    expect(html).toContain('What I See');

    expect(html).toContain('id="card-past-weather"');
    expect(html).toContain('Tool 3 of 4');
    expect(html).toContain('Past Weather');

    expect(html).toContain('id="card-my-crop-plan"');
    expect(html).toContain('Tool 4 of 4');
    expect(html).toContain('My Crop Plan');
  });

  it('strictly withholds FEASIBLE crops and rotation sequences when field location is blank or invalid', () => {
    const blankFarm: FarmState = {
      ...INITIAL_FARM_STATE,
      coordinates: { latitude: '', longitude: '' },
      cropRotationList: ['Bread Wheat'],
    };

    const html = renderSimpleView(blankFarm);

    // Must show location required prompt
    expect(html).toContain('Field Location Required');
    expect(html).toContain('Tool 1 (My Field)');

    // Must NOT display FEASIBLE crop badges or recommended sequences
    expect(html).not.toContain('FEASIBLE NEXT CROP');
    expect(html).not.toContain('FEASIBLE');
    expect(html).not.toContain('Recommended Multi-Year Sequences:');
  });

  it('strictly withholds FEASIBLE crops and warns honestly when coordinates are outside Evidence Pack 1 scope', () => {
    // 5.0°N is in the tropics (outside 28°–48°N and 28°–45°S)
    const tropicalFarm: FarmState = {
      ...INITIAL_FARM_STATE,
      coordinates: { latitude: '5.0', longitude: '20.0' },
      cropRotationList: ['Bread Wheat'],
    };

    const html = renderSimpleView(tropicalFarm);

    // Must show geographic scope limitation notice
    expect(html).toContain('Geographic Scope Warning: Insufficient Evidence for this Location');
    expect(html).toContain('latitudes 28°–48°N and 28°–45°S');

    // Must NOT display FEASIBLE crop badges or recommended sequences
    expect(html).not.toContain('FEASIBLE NEXT CROP');
    expect(html).not.toContain('FEASIBLE');
    expect(html).not.toContain('Recommended Multi-Year Sequences:');
  });

  it('prompts the farmer to select a previous crop before displaying next crop feasibility', () => {
    // Valid location in Italy (45°N, 10°E), but no crop selected yet
    const noCropFarm: FarmState = {
      ...INITIAL_FARM_STATE,
      coordinates: { latitude: '45.0', longitude: '10.0' },
      cropRotationList: [],
    };

    const html = renderSimpleView(noCropFarm);

    // Must prompt to select previous crop
    expect(html).toContain('Select Previous Crop Above');
    expect(html).toContain('Touch one of the crop picture choices above');

    // Must NOT display FEASIBLE next crops or recommended sequences
    expect(html).not.toContain('FEASIBLE NEXT CROP');
    expect(html).not.toContain('FEASIBLE');
    expect(html).not.toContain('Recommended Multi-Year Sequences:');
  });

  it('renders FEASIBLE next crops, cereal caution, and multi-year alternatives when inputs are fully eligible', () => {
    // Valid location in Italy (45°N, 10°E) + previous crop Bread Wheat + loam soil
    const eligibleFarm: FarmState = {
      ...INITIAL_FARM_STATE,
      coordinates: { latitude: '45.0', longitude: '10.0' },
      cropRotationList: ['Bread Wheat'],
      soilType: 'loam',
      irrigationType: 'rainfed',
    };

    const html = renderSimpleView(eligibleFarm);

    // Feasible candidates should be rendered
    expect(html).toContain('FEASIBLE NEXT CROP');
    expect(html).toContain('Chickpea (Pulse)');
    expect(html).toContain('Canola (Oilseed)');

    // Cereal monoculture caution should be present
    expect(html).toContain('Cereal Repetition Caution:');
    expect(html).toContain('Take-all fungus');

    // Multi-year sequences should be rendered
    expect(html).toContain('Recommended Multi-Year Sequences:');
    expect(html).toContain('Alternative A: Diversified 4-Year Cereal-Pulse-Oilseed Rotation');
  });

  it('correctly displays DISQUALIFIED candidates for agronomic hard constraints', () => {
    // 1. Clay soil disqualifies Field Pea
    const clayFarm: FarmState = {
      ...INITIAL_FARM_STATE,
      coordinates: { latitude: '45.0', longitude: '10.0' },
      cropRotationList: ['Bread Wheat'],
      soilType: 'clay',
      irrigationType: 'rainfed',
    };

    const htmlClay = renderSimpleView(clayFarm);
    expect(htmlClay).toContain('DISQUALIFIED');
    expect(htmlClay).toContain('Early Pulse Rotation with Field Pea');
    expect(htmlClay).toContain('intolerant of heavy, poorly drained clay soils');

    // 2. Confirmed low rainfall (< 350 mm rainfed) disqualifies Sorghum
    const dryWeather = createMockWeather({ precipSum: 310.0, daysTotal: 366 });
    const htmlDry = renderSimpleView(
      { ...clayFarm, soilType: 'loam' },
      dryWeather
    );
    expect(htmlDry).toContain('DISQUALIFIED');
    expect(htmlDry).toContain('Summer Sorghum Rotation Sequence');
    expect(htmlDry).toContain('Rainfed Moisture Deficit Hard Constraint');
  });

  it('detects and warns when loaded weather coordinates do not match field coordinates', () => {
    // Farm is in Po Valley, Italy (45°N, 10°E)
    const farm: FarmState = {
      ...INITIAL_FARM_STATE,
      coordinates: { latitude: '45.0', longitude: '10.0' },
    };

    // Loaded weather is for California (35°N, -119°W)
    const mismatchedWeather = createMockWeather({ lat: 35.0, lon: -119.0 });

    const html = renderSimpleView(farm, mismatchedWeather);

    // Must warn in Card 3
    expect(html).toContain('Weather Data Mismatched With Field Location');
    expect(html).toContain('Loaded weather history was requested for coordinates');

    // Must reflect coordinate mismatch in Visual Summary
    expect(html).toContain('⚠️ Coords Mismatched');
  });

  it('strictly isolates short weather periods (< 365 days) and marks period rainfall honestly', () => {
    const farm: FarmState = {
      ...INITIAL_FARM_STATE,
      coordinates: { latitude: '45.0', longitude: '10.0' },
    };

    // 7-day weather sample with 14 mm rain
    const sevenDayWeather = createMockWeather({
      lat: 45.0,
      lon: 10.0,
      daysTotal: 7,
      precipSum: 14.0,
      startDate: '2025-01-01',
      endDate: '2025-01-07',
    });

    const html = renderSimpleView(farm, sevenDayWeather);

    // Must show short observation warning
    expect(html).toContain('Short Observation Window (7 days)');
    expect(html).toContain('A 7-day or short period is NOT full agricultural evidence');

    // Must label rainfall as period rainfall, NOT annual rainfall
    expect(html).toContain('Period Total Rain');
    expect(html).toContain('14 mm');
    expect(html).toContain('(NOT annual rainfall)');
  });

  it('renders Visual Summary Card ("Your Field at a Glance") with farmer-reported observations', () => {
    const farmWithObs: FarmState = {
      ...INITIAL_FARM_STATE,
      coordinates: { latitude: '45.0', longitude: '10.0' },
      observations: ['yellowing', 'wilting'],
    };

    const html = renderSimpleView(farmWithObs);

    // Summary heading
    expect(html).toContain('Your Field at a Glance');

    // Observation badges
    expect(html).toContain('Yellowing leaves');
    expect(html).toContain('Wilting / dry');

    // Non-diagnostic disclaimer
    expect(html).toContain('*not agronomic diagnoses');
    expect(html).toContain('Field Observations are Visual Notes — Not Agronomic Diagnoses');

    // No arbitrary 15% threshold in scouting text
    expect(html).not.toContain('15% of the field');
    expect(html).not.toContain('spray pesticide');
    expect(html).not.toContain('apply fungicide');
  });

  it('enforces min 48px touch targets and includes "Not sure" choices on interactive controls', () => {
    const html = renderSimpleView(INITIAL_FARM_STATE);

    // Extract all button elements
    const buttonRegex = /<button[^>]*class="([^"]*)"[^>]*>/g;
    let match;
    let buttonCount = 0;

    while ((match = buttonRegex.exec(html)) !== null) {
      buttonCount++;
      const classAttr = match[1];
      const hasValidTouchTarget =
        classAttr.includes('min-h-[48px]') ||
        classAttr.includes('min-h-[56px]') ||
        classAttr.includes('min-h-[64px]');
      expect(
        hasValidTouchTarget,
        `Button missing min 48px height: ${classAttr}`
      ).toBe(true);
    }

    expect(buttonCount).toBeGreaterThan(10);

    // Explicit "Not sure" choices must exist in rendered markup
    expect(html).toContain('Not sure</span>'); // Water & Soil
    expect(html).toContain('Not sure / None'); // Observations
    expect(html).toContain('Not sure / Other'); // Crops
  });
});
