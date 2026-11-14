import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateDateRange,
  buildNasaPowerUrl,
  normalizeNasaPowerResponse,
  fetchNasaPowerWeather,
  generateCacheKey,
} from '../services/nasaPower';
import { NasaPowerApiRawResponse } from '../types/nasaPower';

describe('NASA POWER Service - Date Validation and URL Construction', () => {
  it('validates a correct historical date range within 366 days', () => {
    const result = validateDateRange('2025-01-01', '2025-01-07');
    expect(result.isValid).toBe(true);
    expect(result.startDateFormatted).toBe('20250101');
    expect(result.endDateFormatted).toBe('20250107');
    expect(result.dayCount).toBe(7);
    expect(result.error).toBeUndefined();
  });

  it('rejects start date after end date', () => {
    const result = validateDateRange('2025-01-10', '2025-01-05');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Start date must be on or before end date.');
  });

  it('rejects blank or missing dates', () => {
    const result = validateDateRange('', '2025-01-05');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Please choose both a start date and an end date.');
  });

  it('rejects invalid calendar days (e.g. February 30)', () => {
    const result = validateDateRange('2025-02-30', '2025-03-05');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('The start date is not a valid calendar day.');
  });

  it('rejects date ranges exceeding 366 days', () => {
    const result = validateDateRange('2023-01-01', '2024-01-15'); // 380 days
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('limits weather history requests to 366 days');
  });

  it('rejects future dates', () => {
    // 2099 is definitely in the future
    const result = validateDateRange('2099-01-01', '2099-01-10');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('future dates cannot be requested');
  });

  it('builds URL using URLSearchParams with verified query parameters', () => {
    const url = buildNasaPowerUrl(45.0, 10.0, '20250101', '20250107');
    const parsed = new URL(url);

    expect(parsed.origin).toBe('https://power.larc.nasa.gov');
    expect(parsed.pathname).toBe('/api/temporal/daily/point');
    expect(parsed.searchParams.get('parameters')).toBe('T2M,T2M_MAX,T2M_MIN,PRECTOTCORR');
    expect(parsed.searchParams.get('community')).toBe('AG');
    expect(parsed.searchParams.get('latitude')).toBe('45');
    expect(parsed.searchParams.get('longitude')).toBe('10');
    expect(parsed.searchParams.get('start')).toBe('20250101');
    expect(parsed.searchParams.get('end')).toBe('20250107');
    expect(parsed.searchParams.get('format')).toBe('JSON');
    expect(parsed.searchParams.get('time-standard')).toBe('LST');
  });

  it('generates consistent cache keys for identical coordinates and dates', () => {
    const key1 = generateCacheKey(45.0, 10.0, '20250101', '20250107');
    const key2 = generateCacheKey(45.0000, 10.0000, '20250101', '20250107');
    expect(key1).toBe(key2);
  });
});

describe('NASA POWER Response Normalization & Fill-Value Handling', () => {
  const sampleRawResponse: NasaPowerApiRawResponse = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [10.0, 45.0, 170.0],
    },
    header: {
      title: 'NASA/POWER Native Daily Data',
      api: { version: 'v2.10.3', name: 'POWER Daily API' },
      sources: ['MERRA2', 'POWER'],
      fill_value: -999.0,
      time_standard: 'LST',
      start: '20250101',
      end: '20250103',
    },
    properties: {
      parameter: {
        T2M: {
          '20250101': 5.5,
          '20250102': -3.2, // Valid negative temperature
          '20250103': -999.0, // Sentinel fill value -> should be null
        },
        T2M_MAX: {
          '20250101': 10.2,
          '20250102': 0.0, // Valid zero
          '20250103': -999.0,
        },
        T2M_MIN: {
          '20250101': 1.0,
          '20250102': -7.5,
          '20250103': -999.0,
        },
        PRECTOTCORR: {
          '20250101': 0.0, // Valid zero rainfall
          '20250102': 4.5,
          '20250103': -999.0, // Sentinel fill value -> should be null
        },
      },
    },
    parameters: {
      T2M: { units: 'C', longname: 'Temperature at 2 Meters' },
      T2M_MAX: { units: 'C', longname: 'Temperature at 2 Meters Maximum' },
      T2M_MIN: { units: 'C', longname: 'Temperature at 2 Meters Minimum' },
      PRECTOTCORR: { units: 'mm/day', longname: 'Precipitation Corrected' },
    },
    messages: [],
  };

  it('normalizes daily records, converts -999 fill_value to null, and preserves 0 and negative numbers', () => {
    const normalized = normalizeNasaPowerResponse(
      sampleRawResponse,
      45.0,
      10.0,
      '20250101',
      '20250103'
    );

    expect(normalized.records).toHaveLength(3);

    // Day 1: standard positive values and 0.0 precipitation
    const day1 = normalized.records[0];
    expect(day1.dateStr).toBe('20250101');
    expect(day1.displayDate).toBe('2025-01-01');
    expect(day1.t2m).toBe(5.5);
    expect(day1.t2mMax).toBe(10.2);
    expect(day1.t2mMin).toBe(1.0);
    expect(day1.prectotcorr).toBe(0.0); // 0.0 is valid data

    // Day 2: negative temperature
    const day2 = normalized.records[1];
    expect(day2.displayDate).toBe('2025-01-02');
    expect(day2.t2m).toBe(-3.2); // Negative temp preserved
    expect(day2.t2mMax).toBe(0.0); // Zero temp preserved
    expect(day2.t2mMin).toBe(-7.5);
    expect(day2.prectotcorr).toBe(4.5);

    // Day 3: fill_value -999 sentinel converted to null
    const day3 = normalized.records[2];
    expect(day3.displayDate).toBe('2025-01-03');
    expect(day3.t2m).toBeNull();
    expect(day3.t2mMax).toBeNull();
    expect(day3.t2mMin).toBeNull();
    expect(day3.prectotcorr).toBeNull();
  });

  it('computes summary statistics and coverage without counting missing days as zeros', () => {
    const normalized = normalizeNasaPowerResponse(
      sampleRawResponse,
      45.0,
      10.0,
      '20250101',
      '20250103'
    );

    expect(normalized.summary.daysTotal).toBe(3);
    expect(normalized.summary.daysWithValidT2M).toBe(2);
    expect(normalized.summary.daysWithValidPrecip).toBe(2);
    // Mean of 5.5 and -3.2 is 1.15
    expect(normalized.summary.t2mMean).toBe(1.15);
    expect(normalized.summary.t2mMaxPeak).toBe(10.2);
    expect(normalized.summary.t2mMinLowest).toBe(-7.5);
    // Sum of 0.0 and 4.5 is 4.5
    expect(normalized.summary.precipSum).toBe(4.5);
    expect(normalized.summary.precipCoveragePercent).toBe(67);
    expect(normalized.summary.isCompleteCoverage).toBe(false);
  });

  it('preserves metadata including sources, time standard LST, and parameter units', () => {
    const normalized = normalizeNasaPowerResponse(
      sampleRawResponse,
      45.0,
      10.0,
      '20250101',
      '20250103'
    );

    expect(normalized.metadata.sources).toEqual(['MERRA2', 'POWER']);
    expect(normalized.metadata.timeStandard).toBe('LST');
    expect(normalized.metadata.apiVersion).toBe('v2.10.3');
    expect(normalized.metadata.units.temperature).toBe('C');
    expect(normalized.metadata.units.precipitation).toBe('mm/day');
    expect(normalized.metadata.fillValueSentinel).toBe(-999.0);
    expect(normalized.metadata.requestedCoordinates).toEqual({ latitude: 45.0, longitude: 10.0 });
  });
});

describe('NASA POWER Fetch, Caching, and Failure Integrity', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handles HTTP error without falling back to sample fixtures', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({ messages: ['Internal server error in MERRA2 pipeline'] }),
    } as unknown as Response);

    await expect(
      fetchNasaPowerWeather(45.0, 10.0, '20250101', '20250102', { bypassCache: true })
    ).rejects.toThrow(/NASA POWER service error \(HTTP 500\)/);
  });

  it('handles rate limit HTTP 429 honestly', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: vi.fn().mockResolvedValue({ detail: 'Rate limit exceeded' }),
    } as unknown as Response);

    await expect(
      fetchNasaPowerWeather(45.0, 10.0, '20250101', '20250102', { bypassCache: true })
    ).rejects.toThrow(/NASA POWER rate limit reached/);
  });

  it('handles network failure without fake sample fallback', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

    await expect(
      fetchNasaPowerWeather(45.0, 10.0, '20250101', '20250102', { bypassCache: true })
    ).rejects.toThrow(/Unable to reach NASA POWER service/);
  });

  it('handles request abortion cleanly', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      fetchNasaPowerWeather(45.0, 10.0, '20250101', '20250102', {
        bypassCache: true,
        signal: controller.signal,
      })
    ).rejects.toThrow(/Request cancelled/);
  });
});
