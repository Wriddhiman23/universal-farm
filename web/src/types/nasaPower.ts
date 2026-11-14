export interface NasaPowerApiRawResponse {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number, number]; // [lon, lat, elevation]
  };
  properties: {
    parameter: {
      T2M?: Record<string, number>;
      T2M_MAX?: Record<string, number>;
      T2M_MIN?: Record<string, number>;
      PRECTOTCORR?: Record<string, number>;
      [key: string]: Record<string, number> | undefined;
    };
  };
  header: {
    title?: string;
    api?: {
      version?: string;
      name?: string;
    };
    sources?: string[];
    fill_value: number;
    time_standard?: string;
    start?: string;
    end?: string;
  };
  messages?: string[];
  parameters?: Record<string, { units: string; longname: string }>;
  times?: { data?: number; process?: number };
}

export interface NasaDailyRecord {
  dateStr: string; // e.g. "20250101"
  displayDate: string; // e.g. "2025-01-01"
  t2m: number | null; // Daily mean temperature
  t2mMax: number | null; // Daily maximum temperature
  t2mMin: number | null; // Daily minimum temperature
  prectotcorr: number | null; // Daily precipitation
}

export interface NasaPowerDataSummary {
  daysTotal: number;
  daysWithValidT2M: number;
  daysWithValidPrecip: number;
  t2mMean: number | null;
  t2mMaxPeak: number | null;
  t2mMinLowest: number | null;
  precipSum: number | null;
  precipCoveragePercent: number;
  isCompleteCoverage: boolean;
}

export interface NasaPowerMetadata {
  requestedCoordinates: { latitude: number; longitude: number };
  returnedCoordinates: [number, number, number]; // [lon, lat, elevation]
  requestedStartDate: string; // YYYY-MM-DD
  requestedEndDate: string; // YYYY-MM-DD
  returnedStartDate: string; // YYYYMMDD or YYYY-MM-DD
  returnedEndDate: string; // YYYYMMDD or YYYY-MM-DD
  sources: string[];
  apiVersion: string;
  timeStandard: string; // "LST" (Local Solar Time)
  fillValueSentinel: number;
  units: {
    temperature: string;
    precipitation: string;
  };
  parameterDescriptions: {
    t2m: string;
    t2mMax: string;
    t2mMin: string;
    prectotcorr: string;
  };
  retrievedAt: string;
  warnings: string[];
}

export interface NasaPowerNormalizedPayload {
  records: NasaDailyRecord[];
  summary: NasaPowerDataSummary;
  metadata: NasaPowerMetadata;
}

export type NasaPowerFetchStatus = 'idle' | 'loading' | 'success' | 'error' | 'no-data';

export interface NasaPowerState {
  status: NasaPowerFetchStatus;
  data: NasaPowerNormalizedPayload | null;
  error: string | null;
  lastRequestedKey: string | null;
  retrievedAt: string | null;
}

export interface DateRangeValidationResult {
  isValid: boolean;
  startDateFormatted: string; // YYYYMMDD
  endDateFormatted: string; // YYYYMMDD
  dayCount: number;
  error?: string;
}
