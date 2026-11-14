import {
  NasaPowerApiRawResponse,
  NasaPowerNormalizedPayload,
  NasaDailyRecord,
  NasaPowerDataSummary,
  DateRangeValidationResult,
} from '../types/nasaPower';

export const NASA_POWER_DAILY_POINT_URL = 'https://power.larc.nasa.gov/api/temporal/daily/point';
export const MAXIMUM_REQUEST_DAYS = 366;

// In-memory cache for identical requests: key -> payload
const inMemoryCache = new Map<string, NasaPowerNormalizedPayload>();

/**
 * Validates a user-supplied historical date range.
 * Requires YYYY-MM-DD or YYYYMMDD, start <= end, <= 366 days, and no future dates.
 */
export function validateDateRange(startInput: string, endInput: string): DateRangeValidationResult {
  const cleanStart = startInput.trim().replace(/-/g, '');
  const cleanEnd = endInput.trim().replace(/-/g, '');

  if (!cleanStart || !cleanEnd) {
    return {
      isValid: false,
      startDateFormatted: cleanStart,
      endDateFormatted: cleanEnd,
      dayCount: 0,
      error: 'Please choose both a start date and an end date.',
    };
  }

  if (!/^\d{8}$/.test(cleanStart) || !/^\d{8}$/.test(cleanEnd)) {
    return {
      isValid: false,
      startDateFormatted: cleanStart,
      endDateFormatted: cleanEnd,
      dayCount: 0,
      error: 'Dates must be in valid format (YYYY-MM-DD).',
    };
  }

  const startYear = parseInt(cleanStart.substring(0, 4), 10);
  const startMonth = parseInt(cleanStart.substring(4, 6), 10) - 1;
  const startDay = parseInt(cleanStart.substring(6, 8), 10);
  const startDate = new Date(Date.UTC(startYear, startMonth, startDay));

  const endYear = parseInt(cleanEnd.substring(0, 4), 10);
  const endMonth = parseInt(cleanEnd.substring(4, 6), 10) - 1;
  const endDay = parseInt(cleanEnd.substring(6, 8), 10);
  const endDate = new Date(Date.UTC(endYear, endMonth, endDay));

  // Verify dates are real calendar dates
  if (
    startDate.getUTCFullYear() !== startYear ||
    startDate.getUTCMonth() !== startMonth ||
    startDate.getUTCDate() !== startDay
  ) {
    return {
      isValid: false,
      startDateFormatted: cleanStart,
      endDateFormatted: cleanEnd,
      dayCount: 0,
      error: 'The start date is not a valid calendar day.',
    };
  }

  if (
    endDate.getUTCFullYear() !== endYear ||
    endDate.getUTCMonth() !== endMonth ||
    endDate.getUTCDate() !== endDay
  ) {
    return {
      isValid: false,
      startDateFormatted: cleanStart,
      endDateFormatted: cleanEnd,
      dayCount: 0,
      error: 'The end date is not a valid calendar day.',
    };
  }

  if (startDate.getTime() > endDate.getTime()) {
    return {
      isValid: false,
      startDateFormatted: cleanStart,
      endDateFormatted: cleanEnd,
      dayCount: 0,
      error: 'Start date must be on or before end date.',
    };
  }

  // Check no future dates (comparing with UTC today)
  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (endDate.getTime() > todayUtc.getTime()) {
    return {
      isValid: false,
      startDateFormatted: cleanStart,
      endDateFormatted: cleanEnd,
      dayCount: 0,
      error: 'NASA POWER provides historical observations; future dates cannot be requested.',
    };
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const dayCount = Math.round((endDate.getTime() - startDate.getTime()) / msPerDay) + 1;

  if (dayCount > MAXIMUM_REQUEST_DAYS) {
    return {
      isValid: false,
      startDateFormatted: cleanStart,
      endDateFormatted: cleanEnd,
      dayCount,
      error: `To keep browser processing responsive, Universal Farm limits weather history requests to ${MAXIMUM_REQUEST_DAYS} days (you requested ${dayCount} days). Please select a shorter date range.`,
    };
  }

  return {
    isValid: true,
    startDateFormatted: cleanStart,
    endDateFormatted: cleanEnd,
    dayCount,
  };
}

/**
 * Builds the verified NASA POWER Daily Point API URL using URLSearchParams.
 */
export function buildNasaPowerUrl(
  latitude: number,
  longitude: number,
  startYYYYMMDD: string,
  endYYYYMMDD: string
): string {
  const params = new URLSearchParams({
    parameters: 'T2M,T2M_MAX,T2M_MIN,PRECTOTCORR',
    community: 'AG',
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    start: startYYYYMMDD,
    end: endYYYYMMDD,
    format: 'JSON',
    'time-standard': 'LST',
  });

  return `${NASA_POWER_DAILY_POINT_URL}?${params.toString()}`;
}

export function generateCacheKey(
  latitude: number,
  longitude: number,
  startYYYYMMDD: string,
  endYYYYMMDD: string
): string {
  return `${latitude.toFixed(4)}_${longitude.toFixed(4)}_${startYYYYMMDD}_${endYYYYMMDD}`;
}

/**
 * Normalizes raw NASA POWER JSON into structured daily records and metadata.
 */
export function normalizeNasaPowerResponse(
  raw: NasaPowerApiRawResponse,
  reqLat: number,
  reqLon: number,
  reqStart: string,
  reqEnd: string
): NasaPowerNormalizedPayload {
  const fillSentinel = raw.header?.fill_value ?? -999.0;
  const params = raw.properties?.parameter || {};

  const t2mMap = params.T2M || {};
  const t2mMaxMap = params.T2M_MAX || {};
  const t2mMinMap = params.T2M_MIN || {};
  const precipMap = params.PRECTOTCORR || {};

  // Gather all unique date keys across parameters
  const dateKeySet = new Set<string>([
    ...Object.keys(t2mMap),
    ...Object.keys(t2mMaxMap),
    ...Object.keys(t2mMinMap),
    ...Object.keys(precipMap),
  ]);

  const sortedDates = Array.from(dateKeySet).sort();

  const isFillOrInvalid = (val: unknown): boolean => {
    if (val === null || val === undefined) return true;
    if (typeof val !== 'number') return true;
    if (isNaN(val) || !isFinite(val)) return true;
    // Check if value equals the fill sentinel (e.g. -999 or -999.0)
    return Math.abs(val - fillSentinel) < 0.0001;
  };

  const records: NasaDailyRecord[] = sortedDates.map((dateStr) => {
    const rawT2M = t2mMap[dateStr];
    const rawT2MMax = t2mMaxMap[dateStr];
    const rawT2MMin = t2mMinMap[dateStr];
    const rawPrecip = precipMap[dateStr];

    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const displayDate = `${year}-${month}-${day}`;

    return {
      dateStr,
      displayDate,
      t2m: isFillOrInvalid(rawT2M) ? null : rawT2M,
      t2mMax: isFillOrInvalid(rawT2MMax) ? null : rawT2MMax,
      t2mMin: isFillOrInvalid(rawT2MMin) ? null : rawT2MMin,
      prectotcorr: isFillOrInvalid(rawPrecip) ? null : rawPrecip,
    };
  });

  // Calculate summary metrics
  const validT2M = records.filter((r) => r.t2m !== null).map((r) => r.t2m as number);
  const validT2MMax = records.filter((r) => r.t2mMax !== null).map((r) => r.t2mMax as number);
  const validT2MMin = records.filter((r) => r.t2mMin !== null).map((r) => r.t2mMin as number);
  const validPrecip = records.filter((r) => r.prectotcorr !== null).map((r) => r.prectotcorr as number);

  const daysTotal = records.length;
  const daysWithValidT2M = validT2M.length;
  const daysWithValidPrecip = validPrecip.length;

  const t2mMean =
    daysWithValidT2M > 0
      ? Number((validT2M.reduce((sum, v) => sum + v, 0) / daysWithValidT2M).toFixed(2))
      : null;

  const t2mMaxPeak = validT2MMax.length > 0 ? Math.max(...validT2MMax) : null;
  const t2mMinLowest = validT2MMin.length > 0 ? Math.min(...validT2MMin) : null;

  const precipSum =
    validPrecip.length > 0
      ? Number(validPrecip.reduce((sum, v) => sum + v, 0).toFixed(2))
      : null;

  const precipCoveragePercent =
    daysTotal > 0 ? Math.round((daysWithValidPrecip / daysTotal) * 100) : 0;

  const isCompleteCoverage = daysTotal > 0 && daysWithValidPrecip === daysTotal && daysWithValidT2M === daysTotal;

  const summary: NasaPowerDataSummary = {
    daysTotal,
    daysWithValidT2M,
    daysWithValidPrecip,
    t2mMean,
    t2mMaxPeak,
    t2mMinLowest,
    precipSum,
    precipCoveragePercent,
    isCompleteCoverage,
  };

  // Parameter metadata
  const paramMeta = raw.parameters || {};
  const tempUnit = paramMeta.T2M?.units || '°C';
  const precipUnit = paramMeta.PRECTOTCORR?.units || 'mm/day';

  return {
    records,
    summary,
    metadata: {
      requestedCoordinates: { latitude: reqLat, longitude: reqLon },
      returnedCoordinates: raw.geometry?.coordinates || [reqLon, reqLat, 0],
      requestedStartDate: reqStart,
      requestedEndDate: reqEnd,
      returnedStartDate: raw.header?.start || reqStart,
      returnedEndDate: raw.header?.end || reqEnd,
      sources: raw.header?.sources || ['MERRA2', 'POWER'],
      apiVersion: raw.header?.api?.version || 'v2.10.3',
      timeStandard: raw.header?.time_standard || 'LST',
      fillValueSentinel: fillSentinel,
      units: {
        temperature: tempUnit,
        precipitation: precipUnit,
      },
      parameterDescriptions: {
        t2m: paramMeta.T2M?.longname || 'Daily mean air temperature at 2 metres',
        t2mMax: paramMeta.T2M_MAX?.longname || 'Daily maximum air temperature at 2 metres',
        t2mMin: paramMeta.T2M_MIN?.longname || 'Daily minimum air temperature at 2 metres',
        prectotcorr: paramMeta.PRECTOTCORR?.longname || 'Daily corrected precipitation',
      },
      retrievedAt: new Date().toISOString(),
      warnings: raw.messages || [],
    },
  };
}

/**
 * Fetches historical daily weather data from the public NASA POWER Daily Point API.
 * Uses in-memory caching to deduplicate identical requests.
 * Uses AbortController for timeouts and cancellations.
 */
export async function fetchNasaPowerWeather(
  latitude: number,
  longitude: number,
  startDateYYYYMMDD: string,
  endDateYYYYMMDD: string,
  options: {
    bypassCache?: boolean;
    signal?: AbortSignal;
    timeoutMs?: number;
  } = {}
): Promise<NasaPowerNormalizedPayload> {
  if (options.signal?.aborted) {
    throw new Error('Request cancelled.');
  }

  const cacheKey = generateCacheKey(latitude, longitude, startDateYYYYMMDD, endDateYYYYMMDD);

  if (!options.bypassCache && inMemoryCache.has(cacheKey)) {
    return inMemoryCache.get(cacheKey)!;
  }

  const url = buildNasaPowerUrl(latitude, longitude, startDateYYYYMMDD, endDateYYYYMMDD);

  const timeoutMs = options.timeoutMs ?? 20000;
  const internalController = new AbortController();

  const handleExternalAbort = () => {
    internalController.abort();
  };

  if (options.signal) {
    options.signal.addEventListener('abort', handleExternalAbort);
  }

  const timer = setTimeout(() => {
    internalController.abort(new Error('NASA POWER request timed out after 20 seconds.'));
  }, timeoutMs);

  try {
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: internalController.signal,
      });
    } catch (networkErr: unknown) {
      if (options.signal?.aborted) {
        throw new Error('Request cancelled.');
      }
      if (internalController.signal.aborted) {
        throw new Error('The request to NASA POWER timed out. Please check your network connection and try again.');
      }
      const errMessage = networkErr instanceof Error ? networkErr.message : 'Network error';
      throw new Error(`Unable to reach NASA POWER service (${errMessage}). Please verify internet connectivity.`);
    }

    if (!response || !response.ok) {
      if (options.signal?.aborted) {
        throw new Error('Request cancelled.');
      }
      let serverErrorMsg = '';
      try {
        const errorJson = await response.json();
        serverErrorMsg = errorJson?.messages?.[0] || errorJson?.detail || '';
      } catch {
        // Response body was not JSON
      }

      if (response.status === 429) {
        throw new Error('NASA POWER rate limit reached. Please wait a moment before trying again.');
      }
      if (response.status >= 500) {
        throw new Error(`NASA POWER service error (HTTP ${response.status}). The service may be undergoing maintenance.`);
      }
      if (response.status === 422 || response.status === 400) {
        throw new Error(`NASA POWER reported invalid parameters: ${serverErrorMsg || `HTTP ${response.status}`}.`);
      }
      throw new Error(`NASA POWER request failed with HTTP ${response.status}${serverErrorMsg ? `: ${serverErrorMsg}` : ''}.`);
    }

    let rawJson: NasaPowerApiRawResponse;
    try {
      rawJson = await response.json();
    } catch {
      throw new Error('Received an unreadable or malformed response from NASA POWER.');
    }

    if (!rawJson.properties?.parameter) {
      throw new Error('NASA POWER response did not contain expected weather parameter data.');
    }

    const normalized = normalizeNasaPowerResponse(
      rawJson,
      latitude,
      longitude,
      startDateYYYYMMDD,
      endDateYYYYMMDD
    );

    if (normalized.records.length === 0) {
      throw new Error('No daily records were returned by NASA POWER for this date range.');
    }

    // Cache successful normalized response
    inMemoryCache.set(cacheKey, normalized);

    return normalized;
  } finally {
    clearTimeout(timer);
    if (options.signal) {
      options.signal.removeEventListener('abort', handleExternalAbort);
    }
  }
}
