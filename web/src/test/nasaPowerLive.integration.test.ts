import { describe, it, expect } from 'vitest';
import { fetchNasaPowerWeather } from '../services/nasaPower';

describe('NASA POWER Live API Integration Test (Real Network Request)', () => {
  it('successfully connects to NASA POWER and returns real historical records for demo point (45N, 10E)', async () => {
    const data = await fetchNasaPowerWeather(45.0, 10.0, '20250101', '20250107', {
      bypassCache: true,
      timeoutMs: 25000,
    });

    expect(data).toBeDefined();
    expect(data.records).toHaveLength(7);

    // Verify first day
    const day1 = data.records[0];
    expect(day1.dateStr).toBe('20250101');
    expect(day1.displayDate).toBe('2025-01-01');
    expect(typeof day1.t2m).toBe('number');
    expect(typeof day1.t2mMax).toBe('number');
    expect(typeof day1.t2mMin).toBe('number');
    expect(typeof day1.prectotcorr).toBe('number');

    // Verify metadata returned directly from live NASA endpoint
    expect(data.metadata.sources).toEqual(expect.arrayContaining(['MERRA2', 'POWER']));
    expect(data.metadata.timeStandard).toBe('LST');
    expect(data.metadata.apiVersion).toBe('v2.10.3');
    expect(data.metadata.units.temperature).toBe('C');
    expect(data.metadata.units.precipitation).toBe('mm/day');
    expect(data.summary.daysTotal).toBe(7);
    expect(data.summary.daysWithValidT2M).toBe(7);
    expect(data.summary.daysWithValidPrecip).toBe(7);
  }, 30000);
});
