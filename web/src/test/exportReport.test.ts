import { describe, it, expect } from 'vitest';
import { buildExportPayload } from '../services/exportReport';
import { executeRotationComparison } from '../services/rotationEngine';
import { FarmState } from '../types/farm';
import { NasaPowerNormalizedPayload } from '../types/nasaPower';

const mockFarm: FarmState = {
  farmName: 'Test Mediterranean Farm',
  locationLabel: 'Alentejo, Portugal',
  coordinates: {
    latitude: '38.5000',
    longitude: '-7.9000',
  },
  soilType: 'sand',
  irrigationType: 'rainfed',
  cropRotationInput: 'Bread Wheat, Chickpea (Desi / Kabuli)',
  cropRotationList: ['Bread Wheat', 'Chickpea (Desi / Kabuli)'],
  priorities: {
    mainPriority: 'water',
    additionalPriorities: ['soil'],
  },
};

const mockWeather: NasaPowerNormalizedPayload = {
  metadata: {
    requestedCoordinates: { latitude: 38.5, longitude: -7.9 },
    returnedCoordinates: [-7.9, 38.5, 120],
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
  records: [],
  summary: {
    daysTotal: 365,
    daysWithValidT2M: 365,
    daysWithValidPrecip: 365,
    t2mMean: 16.2,
    t2mMaxPeak: 38.0,
    t2mMinLowest: 1.0,
    precipSum: 480.0,
    precipCoveragePercent: 100,
    isCompleteCoverage: true,
  },
};

describe('Export Report Service', () => {
  it('builds an authentic, structured decision-support report payload', () => {
    const comparison = executeRotationComparison(mockFarm, mockWeather);
    const payload = buildExportPayload(comparison, mockFarm, mockWeather);

    expect(payload.reportTitle).toBe('Universal Farm — Crop Rotation Decision Support Report');
    expect(payload.softwareVersion).toContain('Field-Ready Prototype');
    expect(payload.evidencePack.name).toContain('Temperate & Mediterranean');
    expect(payload.evidencePack.id).toBe('temperate_mediterranean_v1');
    expect(payload.evidencePack.reviewStatus).toContain('Human Agronomic Review Pending');

    // Farm profile preserved without synthetic substitution
    expect(payload.farmProfile.farmName).toBe('Test Mediterranean Farm');
    expect(payload.farmProfile.coordinates.latitude).toBe('38.5000');
    expect(payload.farmProfile.coordinates.longitude).toBe('-7.9000');
    expect(payload.farmProfile.soilType).toBe('sand');
    expect(payload.farmProfile.irrigationType).toBe('rainfed');

    // Environmental evidence metadata
    expect(payload.environmentalEvidence.source).toContain('NASA POWER');
    expect(payload.environmentalEvidence.timeStandard).toBe('LST');
    expect(payload.environmentalEvidence.annualPrecipitationEstimateMm).toBe(480.0);

    // Baseline & alternatives
    expect(payload.comparisonResults.baseline.crops).toEqual(['Bread Wheat', 'Chickpea (Desi / Kabuli)']);
    expect(payload.comparisonResults.feasibleAlternatives.length).toBeGreaterThanOrEqual(1);

    // Advisory disclaimer present
    expect(payload.advisoryDisclaimer).toContain('does not replace on-farm soil testing or accredited local agricultural advice');
  });

  it('handles null weather data gracefully by citing published literature baselines', () => {
    const comparison = executeRotationComparison(mockFarm, null);
    const payload = buildExportPayload(comparison, mockFarm, null);

    expect(payload.environmentalEvidence.source).toContain('Published Literature Baselines');
    expect(payload.environmentalEvidence.period).toBeNull();
    expect(payload.environmentalEvidence.annualPrecipitationEstimateMm).toBeNull();
  });
});
