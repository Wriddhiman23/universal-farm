import {
  NasaPowerNormalizedPayload,
} from '../types/nasaPower';
import { fetchNasaPowerWeather } from './nasaPower';

export interface AnnualClimateSummary {
  year: number;
  totalPrecipitationMm: number | null;
  meanTemperatureC: number | null;
  maxTemperaturePeakC: number | null;
  minTemperatureLowestC: number | null;
  frostDaysCount: number; // Days with T2M_MIN <= 0.0 °C
  heatDaysCount: number;  // Days with T2M_MAX >= 32.0 °C
  validDays: number;
  totalDays: number;
  isCompleteYear: boolean;
}

export interface MultiYearAnalysisResult {
  latitude: number;
  longitude: number;
  startYear: number;
  endYear: number;
  annualSummaries: AnnualClimateSummary[];
  overallAverages: {
    meanAnnualPrecipitationMm: number | null;
    driestYear: { year: number; precipitationMm: number } | null;
    wettestYear: { year: number; precipitationMm: number } | null;
    averageAnnualFrostDays: number;
    averageAnnualHeatDays: number;
  };
  retrievedAt: string;
  sourceDisclaimer: string;
}

const multiYearCache = new Map<string, MultiYearAnalysisResult>();

/**
 * Fetches and compiles a multi-year historical analysis from NASA POWER
 * by querying bounded single-year chunks (e.g. 2020 through 2024).
 * Enforces in-memory caching to avoid redundant NASA requests.
 */
export async function fetchMultiYearAnalysis(
  latitude: number,
  longitude: number,
  startYear = 2020,
  endYear = 2024,
  options: { signal?: AbortSignal; bypassCache?: boolean } = {}
): Promise<MultiYearAnalysisResult> {
  const cacheKey = `multi_${latitude.toFixed(4)}_${longitude.toFixed(4)}_${startYear}_${endYear}`;
  if (!options.bypassCache && multiYearCache.has(cacheKey)) {
    return multiYearCache.get(cacheKey)!;
  }

  const annualSummaries: AnnualClimateSummary[] = [];

  for (let yr = startYear; yr <= endYear; yr++) {
    if (options.signal?.aborted) {
      throw new Error('Multi-year analysis request cancelled.');
    }

    const startYYYYMMDD = `${yr}0101`;
    const endYYYYMMDD = `${yr}1231`;

    let yearData: NasaPowerNormalizedPayload;
    try {
      yearData = await fetchNasaPowerWeather(
        latitude,
        longitude,
        startYYYYMMDD,
        endYYYYMMDD,
        {
          signal: options.signal,
          bypassCache: options.bypassCache,
          timeoutMs: 25000,
        }
      );
    } catch (err: unknown) {
      // If one year fails, report specific failure rather than silent fabrication
      const msg = err instanceof Error ? err.message : 'Network error';
      throw new Error(`Failed to retrieve year ${yr} from NASA POWER: ${msg}`);
    }

    const records = yearData.records;
    const totalDays = records.length;
    const validPrecip = records.map((r) => r.prectotcorr).filter((v): v is number => v !== null);
    const validT2M = records.map((r) => r.t2m).filter((v): v is number => v !== null);
    const validT2MMax = records.map((r) => r.t2mMax).filter((v): v is number => v !== null);
    const validT2MMin = records.map((r) => r.t2mMin).filter((v): v is number => v !== null);

    const totalPrecip = validPrecip.length > 0 ? Number(validPrecip.reduce((sum, v) => sum + v, 0).toFixed(1)) : null;
    const meanTemp = validT2M.length > 0 ? Number((validT2M.reduce((sum, v) => sum + v, 0) / validT2M.length).toFixed(2)) : null;
    const maxTemp = validT2MMax.length > 0 ? Math.max(...validT2MMax) : null;
    const minTemp = validT2MMin.length > 0 ? Math.min(...validT2MMin) : null;

    const frostDays = records.filter((r) => r.t2mMin !== null && r.t2mMin <= 0.0).length;
    const heatDays = records.filter((r) => r.t2mMax !== null && r.t2mMax >= 32.0).length;

    annualSummaries.push({
      year: yr,
      totalPrecipitationMm: totalPrecip,
      meanTemperatureC: meanTemp,
      maxTemperaturePeakC: maxTemp,
      minTemperatureLowestC: minTemp,
      frostDaysCount: frostDays,
      heatDaysCount: heatDays,
      validDays: records.filter((r) => r.t2m !== null && r.prectotcorr !== null).length,
      totalDays,
      isCompleteYear: totalDays >= 365,
    });
  }

  // Calculate overall multi-year averages
  const validAnnualPrecips = annualSummaries
    .map((s) => (s.totalPrecipitationMm !== null ? { year: s.year, mm: s.totalPrecipitationMm } : null))
    .filter((v): v is { year: number; mm: number } => v !== null);

  const meanAnnualPrecip =
    validAnnualPrecips.length > 0
      ? Number((validAnnualPrecips.reduce((sum, v) => sum + v.mm, 0) / validAnnualPrecips.length).toFixed(1))
      : null;

  let driestYear: { year: number; precipitationMm: number } | null = null;
  let wettestYear: { year: number; precipitationMm: number } | null = null;

  if (validAnnualPrecips.length > 0) {
    const sorted = [...validAnnualPrecips].sort((a, b) => a.mm - b.mm);
    driestYear = { year: sorted[0].year, precipitationMm: sorted[0].mm };
    wettestYear = { year: sorted[sorted.length - 1].year, precipitationMm: sorted[sorted.length - 1].mm };
  }

  const avgFrost = Math.round(
    annualSummaries.reduce((sum, s) => sum + s.frostDaysCount, 0) / Math.max(annualSummaries.length, 1)
  );

  const avgHeat = Math.round(
    annualSummaries.reduce((sum, s) => sum + s.heatDaysCount, 0) / Math.max(annualSummaries.length, 1)
  );

  const result: MultiYearAnalysisResult = {
    latitude,
    longitude,
    startYear,
    endYear,
    annualSummaries,
    overallAverages: {
      meanAnnualPrecipitationMm: meanAnnualPrecip,
      driestYear,
      wettestYear,
      averageAnnualFrostDays: avgFrost,
      averageAnnualHeatDays: avgHeat,
    },
    retrievedAt: new Date().toISOString(),
    sourceDisclaimer:
      'Multi-year historical analysis from NASA POWER gridded daily data. Covers complete calendar years. This is a recent multi-year observational baseline, not an official 30-year WMO climate normal or a future weather forecast.',
  };

  multiYearCache.set(cacheKey, result);
  return result;
}
