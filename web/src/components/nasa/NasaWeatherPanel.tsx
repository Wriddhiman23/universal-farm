import React, { useState, useRef } from 'react';
import {
  CloudSun,
  Database,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Table,
  LineChart,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Compass,
} from 'lucide-react';
import { Coordinates, validateCoordinates } from '../../types/farm';
import {
  NasaPowerState,
  NasaPowerNormalizedPayload,
} from '../../types/nasaPower';
import {
  fetchNasaPowerWeather,
  validateDateRange,
  generateCacheKey,
} from '../../services/nasaPower';
import { Accordion } from '../common/Accordion';

interface NasaWeatherPanelProps {
  coordinates: Coordinates;
  onSetCoordinates?: (coords: Coordinates) => void;
  onDataLoaded?: (data: NasaPowerNormalizedPayload | null) => void;
}

export const NasaWeatherPanel: React.FC<NasaWeatherPanelProps> = ({
  coordinates,
  onSetCoordinates,
  onDataLoaded,
}) => {
  // Default to a verified historical 7-day test period
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2025-01-07');
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  const [powerState, setPowerState] = useState<NasaPowerState>({
    status: 'idle',
    data: null,
    error: null,
    lastRequestedKey: null,
    retrievedAt: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const coordVal = validateCoordinates(coordinates.latitude, coordinates.longitude);
  const dateVal = validateDateRange(startDate, endDate);

  const canRequest = coordVal.isValid && dateVal.isValid && powerState.status !== 'loading';

  // Check if current form inputs differ from the loaded data's inputs
  const currentKey =
    coordVal.isValid && dateVal.isValid && coordVal.parsedLat !== null && coordVal.parsedLon !== null
      ? generateCacheKey(coordVal.parsedLat, coordVal.parsedLon, dateVal.startDateFormatted, dateVal.endDateFormatted)
      : null;

  const isDataStale =
    powerState.status === 'success' &&
    powerState.lastRequestedKey !== null &&
    currentKey !== null &&
    powerState.lastRequestedKey !== currentKey;

  const handleLoadWeather = async (bypassCache = false) => {
    if (!coordVal.isValid || coordVal.parsedLat === null || coordVal.parsedLon === null) {
      return;
    }
    if (!dateVal.isValid) {
      return;
    }

    // Cancel any ongoing fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const requestKey = generateCacheKey(
      coordVal.parsedLat,
      coordVal.parsedLon,
      dateVal.startDateFormatted,
      dateVal.endDateFormatted
    );

    setPowerState((prev) => ({
      ...prev,
      status: 'loading',
      error: null,
    }));

    try {
      const payload = await fetchNasaPowerWeather(
        coordVal.parsedLat,
        coordVal.parsedLon,
        dateVal.startDateFormatted,
        dateVal.endDateFormatted,
        {
          bypassCache,
          signal: controller.signal,
          timeoutMs: 20000,
        }
      );

      setPowerState({
        status: 'success',
        data: payload,
        error: null,
        lastRequestedKey: requestKey,
        retrievedAt: payload.metadata.retrievedAt,
      });

      if (onDataLoaded) {
        onDataLoaded(payload);
      }
    } catch (err: unknown) {
      if (controller.signal.aborted) {
        return; // User cancelled or superseded
      }
      const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred while loading NASA data.';
      setPowerState((prev) => ({
        ...prev,
        status: 'error',
        error: errorMsg,
      }));
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setPowerState((prev) => ({
        ...prev,
        status: prev.data ? 'success' : 'idle',
        error: 'Request cancelled by user.',
      }));
    }
  };

  const handleUseDemoPoint = () => {
    if (onSetCoordinates) {
      onSetCoordinates({ latitude: '45.0', longitude: '10.0' });
    }
    setStartDate('2025-01-01');
    setEndDate('2025-01-07');
  };

  const renderChart = (data: NasaPowerNormalizedPayload) => {
    const records = data.records;
    if (records.length === 0) {
      return <p className="text-sm text-charcoal-500 italic py-4">No data points available to graph.</p>;
    }

    // Determine scale for temperature and precipitation
    const temps = records.flatMap((r) => [r.t2m, r.t2mMax, r.t2mMin]).filter((v): v is number => v !== null);
    const precips = records.map((r) => r.prectotcorr).filter((v): v is number => v !== null);

    const minTemp = temps.length > 0 ? Math.floor(Math.min(...temps, 0)) : 0;
    const maxTemp = temps.length > 0 ? Math.ceil(Math.max(...temps, 30)) : 30;
    const tempRange = Math.max(maxTemp - minTemp, 10);

    const maxPrecip = precips.length > 0 ? Math.ceil(Math.max(...precips, 10)) : 10;

    const width = 640;
    const height = 220;
    const paddingX = 45;
    const paddingY = 30;
    const plotWidth = width - paddingX * 2;
    const plotHeight = height - paddingY * 2;

    const getX = (idx: number) => paddingX + (idx / Math.max(records.length - 1, 1)) * plotWidth;
    const getYTemp = (val: number) => height - paddingY - ((val - minTemp) / tempRange) * plotHeight;
    const getYPrecip = (val: number) => height - paddingY - (val / maxPrecip) * (plotHeight * 0.7);

    // Build polyline strings for valid points
    const pointsT2M = records
      .map((r, i) => (r.t2m !== null ? `${getX(i)},${getYTemp(r.t2m)}` : null))
      .filter(Boolean)
      .join(' ');

    const pointsMax = records
      .map((r, i) => (r.t2mMax !== null ? `${getX(i)},${getYTemp(r.t2mMax)}` : null))
      .filter(Boolean)
      .join(' ');

    const pointsMin = records
      .map((r, i) => (r.t2mMin !== null ? `${getX(i)},${getYTemp(r.t2mMin)}` : null))
      .filter(Boolean)
      .join(' ');

    return (
      <div className="w-full overflow-x-auto pt-2">
        <div className="min-w-[560px]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto text-charcoal-700 select-none"
            role="img"
            aria-label="Daily temperature and precipitation chart from NASA POWER"
          >
            {/* Zero line for temperature if within range */}
            {minTemp < 0 && maxTemp > 0 && (
              <line
                x1={paddingX}
                y1={getYTemp(0)}
                x2={width - paddingX}
                y2={getYTemp(0)}
                stroke="#94a3b8"
                strokeDasharray="2 2"
                strokeWidth="1"
              />
            )}

            {/* Precipitation Bars (Light Blue) */}
            {records.map((r, i) => {
              if (r.prectotcorr === null || r.prectotcorr <= 0) return null;
              const x = getX(i) - 6;
              const y = getYPrecip(r.prectotcorr);
              const barHeight = height - paddingY - y;
              return (
                <rect
                  key={`p-${i}`}
                  x={x}
                  y={y}
                  width="12"
                  height={barHeight}
                  fill="#93c5fd"
                  opacity="0.75"
                  rx="1"
                />
              );
            })}

            {/* Temperature Polylines */}
            {pointsMax && (
              <polyline
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
                strokeDasharray="3 2"
                points={pointsMax}
              />
            )}
            {pointsMin && (
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeDasharray="3 2"
                strokeWidth="2"
                points={pointsMin}
              />
            )}
            {pointsT2M && (
              <polyline
                fill="none"
                stroke="#1e3a2f"
                strokeWidth="2.5"
                points={pointsT2M}
              />
            )}

            {/* Daily Data Circles & Labels */}
            {records.map((r, i) => {
              const x = getX(i);
              return (
                <g key={`lbl-${i}`}>
                  {r.t2m !== null && (
                    <circle cx={x} cy={getYTemp(r.t2m)} r="3" fill="#1e3a2f" />
                  )}
                  <text
                    x={x}
                    y={height - paddingY + 16}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#475569"
                    className="font-mono"
                  >
                    {r.displayDate.substring(5)}
                  </text>
                </g>
              );
            })}

            {/* Axes */}
            <line
              x1={paddingX}
              y1={height - paddingY}
              x2={width - paddingX}
              y2={height - paddingY}
              stroke="#64748b"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-charcoal-700 border-t border-sand-200 pt-3">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 bg-forest-900 rounded-full inline-block" />
              <span className="font-medium text-charcoal-900">Mean Temp (°C)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 bg-red-600 border-b border-dashed border-white inline-block" />
              <span>Max Temp (°C)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 bg-blue-600 border-b border-dashed border-white inline-block" />
              <span>Min Temp (°C)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-blue-300 rounded-xs inline-block" />
              <span>Rainfall (mm/day)</span>
            </div>
          </div>
          <span className="text-xs text-charcoal-500 font-mono">
            {records.length} daily entries · Time standard: {data.metadata.timeStandard}
          </span>
        </div>
      </div>
    );
  };

  const renderTable = (data: NasaPowerNormalizedPayload) => {
    return (
      <div className="overflow-x-auto max-h-80 border border-sand-300 rounded-xl bg-white">
        <table className="w-full text-left text-xs sm:text-sm text-charcoal-800">
          <thead className="bg-sand-100 text-charcoal-900 font-semibold border-b border-sand-300 sticky top-0">
            <tr>
              <th className="py-2.5 px-3">Date (YYYY-MM-DD)</th>
              <th className="py-2.5 px-3">Mean Temp ({data.metadata.units.temperature})</th>
              <th className="py-2.5 px-3">Max Temp ({data.metadata.units.temperature})</th>
              <th className="py-2.5 px-3">Min Temp ({data.metadata.units.temperature})</th>
              <th className="py-2.5 px-3">Precipitation ({data.metadata.units.precipitation})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-200 font-mono">
            {data.records.map((r) => (
              <tr key={r.dateStr} className="hover:bg-sand-50/80 transition-colors">
                <td className="py-2 px-3 font-sans font-medium text-charcoal-900">{r.displayDate}</td>
                <td className="py-2 px-3">
                  {r.t2m !== null ? `${r.t2m.toFixed(2)} °C` : <span className="text-charcoal-400 italic">No data</span>}
                </td>
                <td className="py-2 px-3 text-red-700">
                  {r.t2mMax !== null ? `${r.t2mMax.toFixed(2)} °C` : <span className="text-charcoal-400 italic">No data</span>}
                </td>
                <td className="py-2 px-3 text-blue-700">
                  {r.t2mMin !== null ? `${r.t2mMin.toFixed(2)} °C` : <span className="text-charcoal-400 italic">No data</span>}
                </td>
                <td className="py-2 px-3 font-semibold text-charcoal-900">
                  {r.prectotcorr !== null ? (
                    `${r.prectotcorr.toFixed(2)} mm`
                  ) : (
                    <span className="text-charcoal-400 italic">No data</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-white border-2 border-forest-800/40 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sand-300 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-forest-100 text-forest-900 border border-forest-300 text-xs font-bold rounded-full uppercase tracking-wider">
              Public API Connection
            </span>
            <span className="text-xs text-charcoal-500 font-mono">NASA POWER API v2</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-charcoal-900 mt-1 flex items-center gap-2">
            <CloudSun className="w-5 h-5 text-forest-700" aria-hidden="true" />
            <span>NASA POWER Historical Weather Records</span>
          </h3>
          <p className="text-xs sm:text-sm text-charcoal-700 mt-0.5">
            Retrieve real daily temperatures and rainfall from NASA&apos;s global satellite and assimilation models.
          </p>
        </div>

        {/* Quick Demo Point Trigger */}
        {onSetCoordinates && (
          <button
            type="button"
            onClick={handleUseDemoPoint}
            className="self-start sm:self-center text-xs text-forest-800 hover:text-forest-950 bg-forest-50 hover:bg-forest-100 px-3 py-1.5 rounded-lg border border-forest-300 font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-forest-700"
          >
            Fill public demo point (45°N, 10°E)
          </button>
        )}
      </div>

      {/* Privacy Disclosure & Notice */}
      <div className="p-3.5 bg-forest-50/80 border border-forest-200 rounded-xl flex items-start gap-3 text-xs sm:text-sm text-forest-950">
        <ShieldCheck className="w-5 h-5 text-forest-700 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1 leading-relaxed">
          <p>
            <strong>Privacy & Data Flow:</strong> Clicking <em>Load NASA weather history</em> sends only your latitude, longitude, and selected date range to the public NASA POWER endpoint.
          </p>
          <p className="text-forest-900 text-xs">
            Your farm name, typed place notes, crop list, and soil information are <strong>never sent</strong> to NASA or stored on external servers.
          </p>
        </div>
      </div>

      {/* Date Range Controls & Action Button */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        {/* Start Date */}
        <div>
          <label htmlFor="nasa-start-date" className="block text-xs sm:text-sm font-semibold text-charcoal-900 mb-1">
            Historical Start Date
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-charcoal-400 absolute left-3 top-3 pointer-events-none" aria-hidden="true" />
            <input
              id="nasa-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full min-h-[44px] pl-9 pr-3 py-2 text-sm rounded-xl border border-sand-300 bg-white text-charcoal-900 focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:outline-none"
            />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="nasa-end-date" className="block text-xs sm:text-sm font-semibold text-charcoal-900 mb-1">
            Historical End Date
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-charcoal-400 absolute left-3 top-3 pointer-events-none" aria-hidden="true" />
            <input
              id="nasa-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full min-h-[44px] pl-9 pr-3 py-2 text-sm rounded-xl border border-sand-300 bg-white text-charcoal-900 focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:outline-none"
            />
          </div>
        </div>

        {/* Load Action Button */}
        <div className="flex flex-col justify-end">
          {powerState.status === 'loading' ? (
            <button
              type="button"
              onClick={handleCancel}
              className="w-full min-h-[44px] px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:outline-none"
            >
              <XCircle className="w-4 h-4" aria-hidden="true" />
              <span>Cancel Request</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={!canRequest}
              onClick={() => handleLoadWeather(false)}
              className={`w-full min-h-[44px] px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:outline-none ${
                canRequest
                  ? 'bg-forest-800 hover:bg-forest-900 text-white shadow-sm'
                  : 'bg-sand-200 text-charcoal-400 cursor-not-allowed border border-sand-300'
              }`}
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              <span>Load NASA weather history</span>
            </button>
          )}
        </div>
      </div>

      {/* Date & Coordinate Pre-flight Warnings */}
      <div className="space-y-1.5 text-xs sm:text-sm">
        {!coordVal.isValid && (
          <p className="text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-center gap-2">
            <Compass className="w-4 h-4 shrink-0 text-amber-700" aria-hidden="true" />
            <span>
              <strong>Valid coordinates required:</strong> Please enter valid latitude and longitude above before loading NASA weather history. Typed place names are not geocoded.
            </span>
          </p>
        )}
        {!dateVal.isValid && dateVal.error && (
          <p className="text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" aria-hidden="true" />
            <span>{dateVal.error}</span>
          </p>
        )}
      </div>

      {/* Stale Data Warning when User Changed Coordinates/Dates */}
      {isDataStale && (
        <div className="p-3 bg-amber-100 border border-amber-300 rounded-xl text-xs sm:text-sm text-amber-950 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-800" aria-hidden="true" />
            <span>
              <strong>Note:</strong> You changed your coordinates or date range after loading the data below. Click <em>Load NASA weather history</em> to update.
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleLoadWeather(true)}
            className="px-3 py-1 bg-amber-900 text-white text-xs font-semibold rounded-lg hover:bg-amber-950 transition-colors shrink-0"
          >
            Update now
          </button>
        </div>
      )}

      {/* Loading State */}
      {powerState.status === 'loading' && (
        <div className="p-8 text-center bg-sand-50 border border-sand-300 rounded-2xl space-y-3">
          <RefreshCw className="w-8 h-8 text-forest-700 animate-spin mx-auto" aria-hidden="true" />
          <div className="text-base font-bold text-charcoal-900">
            Requesting weather data from NASA POWER...
          </div>
          <p className="text-xs sm:text-sm text-charcoal-600 max-w-md mx-auto">
            Contacting https://power.larc.nasa.gov. Retrieving daily temperatures and corrected precipitation for your coordinates.
          </p>
        </div>
      )}

      {/* Error State */}
      {powerState.status === 'error' && (
        <div className="p-5 bg-red-50 border border-red-300 rounded-2xl space-y-3 text-red-950">
          <div className="flex items-center gap-2.5 font-bold text-base text-red-900">
            <XCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>Unable to load NASA POWER weather records</span>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-red-800">
            {powerState.error}
          </p>
          <div className="pt-1 flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleLoadWeather(true)}
              className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-red-600"
            >
              Retry request
            </button>
          </div>
        </div>
      )}

      {/* Success State: Display NASA Data */}
      {powerState.status === 'success' && powerState.data && (
        <div className="space-y-6 pt-2">
          {/* Status banner */}
          <div className="p-4 bg-forest-100/80 border border-forest-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-forest-950">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-forest-800 shrink-0" aria-hidden="true" />
              <div>
                <span className="font-bold">NASA POWER history loaded successfully:</span>{' '}
                <span>
                  {powerState.data.records.length} days from {powerState.data.metadata.requestedStartDate} to {powerState.data.metadata.requestedEndDate}
                </span>
              </div>
            </div>
            <div className="text-xs text-forest-800 flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Retrieved {new Date(powerState.data.metadata.retrievedAt).toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
            {/* Mean Temp */}
            <div className="p-3.5 bg-sand-50 border border-sand-300 rounded-xl">
              <div className="text-xs text-charcoal-500 font-medium">Mean Temperature</div>
              <div className="text-lg sm:text-xl font-bold text-charcoal-900 mt-1">
                {powerState.data.summary.t2mMean !== null ? `${powerState.data.summary.t2mMean} °C` : '—'}
              </div>
              <div className="text-[11px] text-charcoal-600 mt-0.5">
                Average across {powerState.data.summary.daysWithValidT2M} days
              </div>
            </div>

            {/* Peak Max Temp */}
            <div className="p-3.5 bg-sand-50 border border-sand-300 rounded-xl">
              <div className="text-xs text-charcoal-500 font-medium">Peak Maximum Temp</div>
              <div className="text-lg sm:text-xl font-bold text-red-700 mt-1">
                {powerState.data.summary.t2mMaxPeak !== null ? `${powerState.data.summary.t2mMaxPeak} °C` : '—'}
              </div>
              <div className="text-[11px] text-charcoal-600 mt-0.5">
                Highest single day maximum
              </div>
            </div>

            {/* Lowest Min Temp */}
            <div className="p-3.5 bg-sand-50 border border-sand-300 rounded-xl">
              <div className="text-xs text-charcoal-500 font-medium">Lowest Minimum Temp</div>
              <div className="text-lg sm:text-xl font-bold text-blue-700 mt-1">
                {powerState.data.summary.t2mMinLowest !== null ? `${powerState.data.summary.t2mMinLowest} °C` : '—'}
              </div>
              <div className="text-[11px] text-charcoal-600 mt-0.5">
                Lowest single day minimum
              </div>
            </div>

            {/* Total Rainfall */}
            <div className="p-3.5 bg-sand-50 border border-sand-300 rounded-xl">
              <div className="text-xs text-charcoal-500 font-medium">Period Total Rainfall</div>
              <div className="text-lg sm:text-xl font-bold text-charcoal-900 mt-1">
                {powerState.data.summary.precipSum !== null ? `${powerState.data.summary.precipSum} mm` : '—'}
              </div>
              <div className="text-[11px] text-charcoal-600 mt-0.5">
                {powerState.data.summary.isCompleteCoverage
                  ? '100% complete coverage'
                  : `${powerState.data.summary.precipCoveragePercent}% valid days reported`}
              </div>
            </div>
          </div>

          {/* Toggle View & Chart/Table Rendering */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-sand-200 pb-2">
              <span className="text-xs sm:text-sm font-bold text-charcoal-900 uppercase tracking-wider">
                Daily Records ({powerState.data.records.length} Days)
              </span>
              <div className="flex items-center gap-1 bg-sand-200 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setViewMode('chart')}
                  aria-pressed={viewMode === 'chart'}
                  className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    viewMode === 'chart'
                      ? 'bg-white text-charcoal-900 shadow-xs'
                      : 'text-charcoal-600 hover:text-charcoal-900'
                  }`}
                >
                  <LineChart className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Chart</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  aria-pressed={viewMode === 'table'}
                  className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white text-charcoal-900 shadow-xs'
                      : 'text-charcoal-600 hover:text-charcoal-900'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Table</span>
                </button>
              </div>
            </div>

            {viewMode === 'chart' ? renderChart(powerState.data) : renderTable(powerState.data)}
          </div>

          {/* Technical Provenance Accordion */}
          <Accordion
            id="nasa-provenance"
            title="Data Provenance & Scientific Methodology"
            badge="NASA POWER"
            defaultOpen={false}
          >
            <div className="space-y-3 pt-1 text-xs sm:text-sm text-charcoal-800 leading-relaxed">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white rounded-xl border border-sand-200">
                <div>
                  <span className="text-charcoal-500 block">Atmospheric Models / Sources:</span>
                  <span className="font-semibold text-charcoal-900">
                    {powerState.data.metadata.sources.join(', ')}
                  </span>
                </div>
                <div>
                  <span className="text-charcoal-500 block">API Version:</span>
                  <span className="font-semibold text-charcoal-900">{powerState.data.metadata.apiVersion}</span>
                </div>
                <div>
                  <span className="text-charcoal-500 block">Time Standard:</span>
                  <span className="font-semibold text-charcoal-900">
                    {powerState.data.metadata.timeStandard} (Local Solar Time — not civil clock time)
                  </span>
                </div>
                <div>
                  <span className="text-charcoal-500 block">Fill-value Sentinel:</span>
                  <span className="font-semibold text-charcoal-900">
                    {powerState.data.metadata.fillValueSentinel} (converted to null)
                  </span>
                </div>
                <div>
                  <span className="text-charcoal-500 block">Requested Coordinates:</span>
                  <span className="font-semibold text-charcoal-900">
                    {powerState.data.metadata.requestedCoordinates.latitude}°, {powerState.data.metadata.requestedCoordinates.longitude}°
                  </span>
                </div>
                <div>
                  <span className="text-charcoal-500 block">Grid Cell Coordinates (Lon, Lat, Elev):</span>
                  <span className="font-semibold text-charcoal-900 font-mono">
                    [{powerState.data.metadata.returnedCoordinates.join(', ')}]
                  </span>
                </div>
              </div>

              <div className="p-3 bg-sand-100 rounded-xl space-y-1.5 text-xs text-charcoal-700">
                <p>
                  <strong>Scientific Description:</strong> These values are historical gridded assimilation estimates from NASA POWER (~0.5° latitude by 0.625° longitude resolution). They are not direct on-farm weather station measurements, and historical records do not predict next season&apos;s weather.
                </p>
                <p>
                  <strong>Variables:</strong> T2M, T2M_MAX, and T2M_MIN represent air temperatures at 2 metres. PRECTOTCORR is corrected daily precipitation. These are distinct from NASA SMAP soil moisture or NASA GPM satellite radar products.
                </p>
              </div>
            </div>
          </Accordion>
        </div>
      )}

      {/* Idle / Demo Browsing Note */}
      {powerState.status === 'idle' && (
        <div className="p-4 bg-sand-50 border border-sand-300 rounded-xl text-xs sm:text-sm text-charcoal-600 flex items-start gap-2.5">
          <Database className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" aria-hidden="true" />
          <p>
            Ready to load historical weather data. Enter your farm coordinates and click <em>Load NASA weather history</em> above, or continue browsing demo crop plans without loading external data.
          </p>
        </div>
      )}
    </div>
  );
};
