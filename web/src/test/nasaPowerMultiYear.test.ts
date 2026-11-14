import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchMultiYearAnalysis } from '../services/nasaPowerMultiYear';
import * as nasaPowerModule from '../services/nasaPower';
import { NasaPowerNormalizedPayload } from '../types/nasaPower';

function createMockYearPayload(year: number, precipTotal: number, frostDays: number, heatDays: number): NasaPowerNormalizedPayload {
  const records = [];
  for (let i = 1; i <= 10; i++) {
    const isFrost = i <= frostDays;
    const isHeat = i > 10 - heatDays;
    records.push({
      dateStr: `${year}010${i}`,
      displayDate: `${year}-01-0${i}`,
      t2m: 15.0,
      t2mMax: isHeat ? 33.5 : 22.0,
      t2mMin: isFrost ? -1.5 : 8.0,
      prectotcorr: precipTotal / 10,
    });
  }

  return {
    metadata: {
      requestedCoordinates: { latitude: 45, longitude: 10 },
      returnedCoordinates: [10, 45, 50],
      requestedStartDate: `${year}-01-01`,
      requestedEndDate: `${year}-12-31`,
      returnedStartDate: `${year}0101`,
      returnedEndDate: `${year}1231`,
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
    records,
    summary: {
      daysTotal: records.length,
      daysWithValidT2M: records.length,
      daysWithValidPrecip: records.length,
      t2mMean: 15.0,
      t2mMaxPeak: 33.5,
      t2mMinLowest: -1.5,
      precipSum: precipTotal,
      precipCoveragePercent: 100,
      isCompleteCoverage: true,
    },
  };
}

describe('NASA POWER Multi-Year Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('aggregates annual climate summaries and calculates driest/wettest years correctly', async () => {
    vi.spyOn(nasaPowerModule, 'fetchNasaPowerWeather').mockImplementation(async (_lat, _lon, start) => {
      const year = parseInt(start.substring(0, 4), 10);
      if (year === 2021) return createMockYearPayload(2021, 300, 5, 2);
      if (year === 2022) return createMockYearPayload(2022, 600, 2, 8);
      return createMockYearPayload(2023, 450, 3, 4);
    });

    const result = await fetchMultiYearAnalysis(45.0, 10.0, 2021, 2023, { bypassCache: true });

    expect(result.latitude).toBe(45.0);
    expect(result.longitude).toBe(10.0);
    expect(result.startYear).toBe(2021);
    expect(result.endYear).toBe(2023);
    expect(result.annualSummaries).toHaveLength(3);

    // Check individual years
    const y2021 = result.annualSummaries.find((s) => s.year === 2021);
    expect(y2021?.totalPrecipitationMm).toBe(300);
    expect(y2021?.frostDaysCount).toBe(5);
    expect(y2021?.heatDaysCount).toBe(2);

    // Check overall summary
    expect(result.overallAverages.driestYear).toEqual({ year: 2021, precipitationMm: 300 });
    expect(result.overallAverages.wettestYear).toEqual({ year: 2022, precipitationMm: 600 });
    expect(result.overallAverages.meanAnnualPrecipitationMm).toBe(450); // (300 + 600 + 450) / 3
  });

  it('caches results to avoid redundant API calls', async () => {
    const fetchSpy = vi.spyOn(nasaPowerModule, 'fetchNasaPowerWeather').mockImplementation(async (_lat, _lon, start) => {
      const year = parseInt(start.substring(0, 4), 10);
      return createMockYearPayload(year, 400, 2, 2);
    });

    // Call 1
    await fetchMultiYearAnalysis(42.5, 12.5, 2022, 2023);
    const callCountAfterFirst = fetchSpy.mock.calls.length;
    expect(callCountAfterFirst).toBe(2); // 2022, 2023

    // Call 2 with identical coordinates and years
    await fetchMultiYearAnalysis(42.5, 12.5, 2022, 2023);
    expect(fetchSpy.mock.calls.length).toBe(callCountAfterFirst); // No extra calls made
  });

  it('handles abort signal when request is cancelled', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      fetchMultiYearAnalysis(45.0, 10.0, 2022, 2023, { signal: controller.signal, bypassCache: true })
    ).rejects.toThrow('cancelled');
  });
});
