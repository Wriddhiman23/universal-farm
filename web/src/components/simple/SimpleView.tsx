import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MapPin,
  RefreshCw,
  Download,
  Compass,
  Info,
  Calendar,
  Layers,
  ChevronDown,
  CloudSun,
  Eye,
} from 'lucide-react';
import { FarmState, SoilType, IrrigationType, validateCoordinates, Coordinates } from '../../types/farm';
import { NasaPowerNormalizedPayload } from '../../types/nasaPower';
import { fetchNasaPowerWeather, validateDateRange } from '../../services/nasaPower';
import { executeRotationComparison, isWeatherBoundToCoordinates } from '../../services/rotationEngine';
import { downloadReportAsJson } from '../../services/exportReport';
import { MapPointPicker } from '../map/MapPointPicker';
import {
  FieldIllustration,
  ObservationIllustration,
  WeatherIllustration,
  CropPlanIllustration,
  RainOnlyIllustration,
  IrrigationIllustration,
  NotSureWaterIllustration,
  LoamIllustration,
  ClayIllustration,
  SandIllustration,
  NotSureSoilIllustration,
  YellowingLeafIllustration,
  WiltingPlantIllustration,
  LeafSpotsIllustration,
  StandingWaterIllustration,
  StuntedGrowthIllustration,
  HealthyGrowthIllustration,
  NotSureObservationIllustration,
  WheatIllustration,
  BarleyIllustration,
  ChickpeaIllustration,
  FieldPeaIllustration,
  CanolaIllustration,
  SorghumIllustration,
  CoverMixIllustration,
  OtherCropIllustration,
} from './SimpleIllustrations';

interface SimpleViewProps {
  farmState: FarmState;
  onChange: React.Dispatch<React.SetStateAction<FarmState>>;
  nasaData: NasaPowerNormalizedPayload | null;
  onNasaDataLoaded: (data: NasaPowerNormalizedPayload | null) => void;
  onSwitchToStandard?: () => void;
}

export const SimpleView: React.FC<SimpleViewProps> = ({
  farmState,
  onChange,
  nasaData,
  onNasaDataLoaded,
  onSwitchToStandard,
}) => {
  // Map disclosure state in Card 1
  const [showMap, setShowMap] = useState(false);

  // Weather loading state for Card 3
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [weatherPreset, setWeatherPreset] = useState<'year' | 'week'>('year');

  // Observations state
  const currentObservations = farmState.observations || [];

  // Coordinate validation
  const coordVal = validateCoordinates(
    farmState.coordinates.latitude,
    farmState.coordinates.longitude
  );

  // Rotation comparison result
  const comparison = executeRotationComparison(farmState, nasaData);
  const { sufficiency, feasibleAlternatives, disqualifiedCandidates } = comparison;

  // Strict eligibility determination:
  // Recommendations are only eligible if coordinates are valid, geographically supported,
  // sufficiency status is not 'insufficient_evidence', and at least one previous crop is chosen.
  const isGeographicallySupported = coordVal.isValid && sufficiency.isGeographicallyApplicable && sufficiency.status !== 'insufficient_evidence';
  const hasPreviousCrop = farmState.cropRotationList.length > 0;
  const areRecommendationsEligible = isGeographicallySupported && hasPreviousCrop;

  // Weather query coordinate binding check
  const isWeatherBound = isWeatherBoundToCoordinates(
    nasaData,
    farmState.coordinates.latitude,
    farmState.coordinates.longitude
  );

  // ─────────────────────────────────────────────────────────────
  // Action Handlers
  // ─────────────────────────────────────────────────────────────

  const handleUseDemoLocation = () => {
    onChange((prev) => ({
      ...prev,
      coordinates: { latitude: '45.0', longitude: '10.0' },
      locationLabel: 'Po Valley, Italy (Temperate Semi-Arid 45°N, 10°E)',
    }));
  };

  const handleSelectWater = (type: IrrigationType) => {
    onChange((prev) => ({ ...prev, irrigationType: type }));
  };

  const handleSelectSoil = (type: SoilType) => {
    onChange((prev) => ({ ...prev, soilType: type }));
  };

  const handleToggleObservation = (obsKey: string) => {
    onChange((prev) => {
      const existing = prev.observations || [];
      if (obsKey === 'unknown') {
        // If selecting "not sure / none", reset other observations
        return { ...prev, observations: existing.includes('unknown') ? [] : ['unknown'] };
      }
      const withoutUnknown = existing.filter((k) => k !== 'unknown');
      const next = withoutUnknown.includes(obsKey)
        ? withoutUnknown.filter((k) => k !== obsKey)
        : [...withoutUnknown, obsKey];
      return { ...prev, observations: next };
    });
  };

  const handleSelectCrop = (cropName: string) => {
    onChange((prev) => ({
      ...prev,
      cropRotationList: cropName === 'unknown' ? [] : [cropName],
      cropRotationInput: cropName === 'unknown' ? '' : cropName,
    }));
  };

  const handleLoadWeather = async (preset: 'year' | 'week') => {
    if (!coordVal.isValid || coordVal.parsedLat === null || coordVal.parsedLon === null) {
      setWeatherError('Please set your field location in Card 1 before loading weather.');
      return;
    }

    setWeatherPreset(preset);
    setIsWeatherLoading(true);
    setWeatherError(null);

    // Full 2024 calendar year (366 days, leap year) or 7-day recent sample
    const startDate = preset === 'year' ? '2024-01-01' : '2025-01-01';
    const endDate = preset === 'year' ? '2024-12-31' : '2025-01-07';

    const dateVal = validateDateRange(startDate, endDate);
    if (!dateVal.isValid) {
      setWeatherError(dateVal.error || 'Invalid date range.');
      setIsWeatherLoading(false);
      return;
    }

    try {
      const payload = await fetchNasaPowerWeather(
        coordVal.parsedLat,
        coordVal.parsedLon,
        dateVal.startDateFormatted,
        dateVal.endDateFormatted
      );
      onNasaDataLoaded(payload);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to connect to NASA POWER.';
      setWeatherError(message);
    } finally {
      setIsWeatherLoading(false);
    }
  };

  const handleDownloadReport = () => {
    downloadReportAsJson(comparison, farmState, nasaData);
  };

  // Observation labels and icons for visual summary chips
  const observationMap: Record<string, { label: string; icon: string }> = {
    yellowing: { label: 'Yellowing leaves', icon: '🍃' },
    wilting: { label: 'Wilting / dry', icon: '🥀' },
    leaf_spots: { label: 'Leaf spots', icon: '🍂' },
    standing_water: { label: 'Standing water', icon: '💧' },
    stunted: { label: 'Stunted growth', icon: '🌱' },
    healthy: { label: 'Healthy crop', icon: '🌿' },
    unknown: { label: 'No symptoms noted', icon: '❓' },
  };

  const selectedObservationItems = currentObservations
    .map((k) => ({ key: k, ...(observationMap[k] || { label: k, icon: '🔍' }) }))
    .filter((item) => item.key !== 'unknown');

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome & Mode Switch Banner */}
      <div className="bg-forest-900 text-white p-6 sm:p-8 rounded-3xl border-2 border-forest-950 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-forest-800 text-forest-200 border border-forest-700 rounded-full text-xs font-bold uppercase tracking-wider">
              <span>Farmer Simple View</span>
              <span>·</span>
              <span>4 Large Tools</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Visual Farm Tools
            </h2>
            <p className="text-base sm:text-lg text-forest-100 max-w-2xl leading-relaxed">
              Touch the picture choices below to describe your field, record visual notes, inspect past satellite weather, and review feasible crop sequences.
            </p>
          </div>

          {onSwitchToStandard && (
            <button
              type="button"
              onClick={onSwitchToStandard}
              className="min-h-[48px] px-5 py-3 bg-forest-800 hover:bg-forest-700 text-white rounded-2xl text-base font-bold border-2 border-forest-600 transition-colors flex items-center justify-center gap-2.5 shadow-sm focus-visible:ring-4 focus-visible:ring-forest-300"
            >
              <Layers className="w-5 h-5 text-forest-200" aria-hidden="true" />
              <span>Switch to Standard Workspace</span>
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          VISUAL SUMMARY: YOUR FIELD AT A GLANCE
          ───────────────────────────────────────────────────────────── */}
      <section
        id="card-field-summary"
        aria-label="Field summary at a glance"
        className="bg-sand-50 border-3 border-forest-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between border-b border-sand-300 pb-3">
          <div className="flex items-center gap-2.5">
            <Eye className="w-5 h-5 text-forest-800" aria-hidden="true" />
            <h3 className="text-lg sm:text-xl font-extrabold text-charcoal-900">
              Your Field at a Glance
            </h3>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider bg-sand-200 text-charcoal-700 px-2.5 py-1 rounded-full">
            Status Summary
          </span>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {/* Location Chip */}
          <div className="p-3 bg-white rounded-xl border border-sand-300 space-y-1">
            <div className="text-xs font-bold uppercase text-charcoal-500">Location</div>
            <div className="font-bold text-charcoal-900 truncate">
              {coordVal.isValid
                ? `${farmState.coordinates.latitude}°, ${farmState.coordinates.longitude}°`
                : 'Not set yet'}
            </div>
            <div className="text-xs text-charcoal-600">
              {coordVal.isValid
                ? sufficiency.isGeographicallyApplicable
                  ? '✓ In Evidence Band'
                  : '⚠️ Outside Scope'
                : 'Enter in Tool 1'}
            </div>
          </div>

          {/* Water Chip */}
          <div className="p-3 bg-white rounded-xl border border-sand-300 space-y-1">
            <div className="text-xs font-bold uppercase text-charcoal-500">Water Source</div>
            <div className="font-bold text-charcoal-900 capitalize">
              {farmState.irrigationType === 'rainfed'
                ? 'Rain only'
                : farmState.irrigationType === 'unknown'
                ? 'Not sure'
                : farmState.irrigationType}
            </div>
            <div className="text-xs text-charcoal-600">
              {farmState.irrigationType === 'rainfed' ? 'Rainfed production' : 'Irrigation available'}
            </div>
          </div>

          {/* Soil Chip */}
          <div className="p-3 bg-white rounded-xl border border-sand-300 space-y-1">
            <div className="text-xs font-bold uppercase text-charcoal-500">Soil Texture</div>
            <div className="font-bold text-charcoal-900 capitalize">
              {farmState.soilType === 'unknown' ? 'Not sure' : farmState.soilType}
            </div>
            <div className="text-xs text-charcoal-600">
              {farmState.soilType === 'clay' ? 'Heavy / low drainage' : 'Standard drainage'}
            </div>
          </div>

          {/* Weather Chip */}
          <div className="p-3 bg-white rounded-xl border border-sand-300 space-y-1">
            <div className="text-xs font-bold uppercase text-charcoal-500">Weather History</div>
            <div className="font-bold text-charcoal-900 truncate">
              {nasaData
                ? isWeatherBound
                  ? `${nasaData.records.length} days loaded`
                  : '⚠️ Coords Mismatched'
                : 'None loaded'}
            </div>
            <div className="text-xs text-charcoal-600">
              {nasaData && isWeatherBound
                ? `${nasaData.summary.precipSum ?? 0} mm rain recorded`
                : 'Load in Tool 3'}
            </div>
          </div>
        </div>

        {/* Farmer Observations Badges */}
        <div className="pt-2 border-t border-sand-300">
          <div className="text-xs font-bold uppercase text-charcoal-600 mb-2 flex items-center justify-between">
            <span>Visual Observations Recorded (Personal Scouting Notes):</span>
            <span className="text-[11px] font-normal lowercase text-charcoal-500">*not agronomic diagnoses</span>
          </div>

          {selectedObservationItems.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {selectedObservationItems.map((obs) => (
                <span
                  key={obs.key}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-300 text-amber-950 rounded-full text-xs font-bold"
                >
                  <span aria-hidden="true">{obs.icon}</span>
                  <span>{obs.label}</span>
                </span>
              ))}
              {currentObservations.includes('healthy') && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-full text-xs font-bold">
                  <span aria-hidden="true">🌿</span>
                  <span>Healthy crop growth</span>
                </span>
              )}
            </div>
          ) : (
            <div className="text-xs text-charcoal-600 italic">
              No symptoms noted yet. Touch picture choices in Tool 2 (What I See) to record field observations.
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          TOOL CARD 1: MY FIELD
          ───────────────────────────────────────────────────────────── */}
      <section
        id="card-my-field"
        aria-labelledby="heading-my-field"
        className="bg-white border-3 border-charcoal-700 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
      >
        <div className="flex items-start sm:items-center gap-4 border-b-2 border-sand-200 pb-5">
          <FieldIllustration className="w-14 h-14 shrink-0" />
          <div>
            <div className="text-xs font-bold text-forest-800 uppercase tracking-wider">
              Tool 1 of 4
            </div>
            <h3 id="heading-my-field" className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
              My Field
            </h3>
            <p className="text-base sm:text-lg text-charcoal-700 mt-0.5">
              Where your field is, what water you have, and your soil texture.
            </p>
          </div>
        </div>

        {/* Section 1A: Location Status & Picture Choices */}
        <div className="space-y-3">
          <div className="text-base sm:text-lg font-bold text-charcoal-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-forest-800" aria-hidden="true" />
            <span>Field Location</span>
          </div>

          {/* Current location display */}
          <div className="p-4 bg-sand-50 border-2 border-sand-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
                Current Location Status
              </div>
              <div className="text-base sm:text-lg font-bold text-charcoal-900 flex items-center gap-2">
                {coordVal.isValid ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" aria-hidden="true" />
                    <span>
                      {farmState.coordinates.latitude}°, {farmState.coordinates.longitude}°
                      {farmState.locationLabel ? ` (${farmState.locationLabel})` : ''}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" aria-hidden="true" />
                    <span>No valid field location set yet</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
              <button
                type="button"
                onClick={handleUseDemoLocation}
                className="min-h-[48px] px-4 py-2.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-sm sm:text-base font-bold transition-colors shadow-sm focus-visible:ring-4 focus-visible:ring-forest-700"
              >
                📍 Use Demo Field (45°N, 10°E)
              </button>
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                aria-expanded={showMap}
                className="min-h-[48px] px-4 py-2.5 bg-white hover:bg-sand-100 text-charcoal-900 border-2 border-charcoal-700 rounded-xl text-sm sm:text-base font-bold transition-colors focus-visible:ring-4 focus-visible:ring-forest-700"
              >
                🗺️ {showMap ? 'Hide Map Picker' : 'Pick on Map'}
              </button>
            </div>
          </div>

          {/* Inline Map Picker (if toggled) */}
          {showMap && (
            <div className="p-4 bg-sand-100 border-2 border-forest-700 rounded-2xl space-y-3">
              <div className="text-sm font-bold text-charcoal-900">
                Click or drag on the map below to position your field pin:
              </div>
              <MapPointPicker
                coordinates={farmState.coordinates}
                onChange={(coords: Coordinates) =>
                  onChange((prev) => ({ ...prev, coordinates: coords }))
                }
              />
            </div>
          )}
        </div>

        {/* Section 1B: Water Available for Farming (Picture Choices) */}
        <div className="space-y-3 pt-2">
          <div className="text-base sm:text-lg font-bold text-charcoal-900">
            How do your crops get water?
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Choice 1: Rain only */}
            <button
              type="button"
              onClick={() => handleSelectWater('rainfed')}
              className={`min-h-[64px] p-4 rounded-2xl border-3 flex items-center gap-4 text-left transition-all focus-visible:ring-4 focus-visible:ring-forest-700 ${
                farmState.irrigationType === 'rainfed'
                  ? 'bg-forest-50 border-forest-800 text-forest-950 font-bold ring-2 ring-forest-800'
                  : 'bg-white border-charcoal-400 text-charcoal-900 hover:border-charcoal-700'
              }`}
            >
              <RainOnlyIllustration className="w-12 h-12 shrink-0" />
              <div className="flex-1">
                <div className="text-lg font-extrabold flex items-center justify-between">
                  <span>Rain only</span>
                  {farmState.irrigationType === 'rainfed' && (
                    <span className="text-xs bg-forest-800 text-white px-2 py-0.5 rounded-full font-bold">
                      Selected
                    </span>
                  )}
                </div>
                <div className="text-sm text-charcoal-700">No irrigation equipment</div>
              </div>
            </button>

            {/* Choice 2: Irrigation available */}
            <button
              type="button"
              onClick={() => handleSelectWater('sprinkler')}
              className={`min-h-[64px] p-4 rounded-2xl border-3 flex items-center gap-4 text-left transition-all focus-visible:ring-4 focus-visible:ring-forest-700 ${
                farmState.irrigationType !== 'rainfed' && farmState.irrigationType !== 'unknown'
                  ? 'bg-forest-50 border-forest-800 text-forest-950 font-bold ring-2 ring-forest-800'
                  : 'bg-white border-charcoal-400 text-charcoal-900 hover:border-charcoal-700'
              }`}
            >
              <IrrigationIllustration className="w-12 h-12 shrink-0" />
              <div className="flex-1">
                <div className="text-lg font-extrabold flex items-center justify-between">
                  <span>Irrigation available</span>
                  {farmState.irrigationType !== 'rainfed' && farmState.irrigationType !== 'unknown' && (
                    <span className="text-xs bg-forest-800 text-white px-2 py-0.5 rounded-full font-bold">
                      Selected
                    </span>
                  )}
                </div>
                <div className="text-sm text-charcoal-700">Drip, sprinkler, or canal water</div>
              </div>
            </button>

            {/* Choice 3: Not sure */}
            <button
              type="button"
              onClick={() => handleSelectWater('unknown')}
              className={`min-h-[64px] p-4 rounded-2xl border-3 flex items-center gap-4 text-left transition-all focus-visible:ring-4 focus-visible:ring-forest-700 ${
                farmState.irrigationType === 'unknown'
                  ? 'bg-forest-50 border-forest-800 text-forest-950 font-bold ring-2 ring-forest-800'
                  : 'bg-white border-charcoal-400 text-charcoal-900 hover:border-charcoal-700'
              }`}
            >
              <NotSureWaterIllustration className="w-12 h-12 shrink-0" />
              <div className="flex-1">
                <div className="text-lg font-extrabold flex items-center justify-between">
                  <span>Not sure</span>
                  {farmState.irrigationType === 'unknown' && (
                    <span className="text-xs bg-forest-800 text-white px-2 py-0.5 rounded-full font-bold">
                      Selected
                    </span>
                  )}
                </div>
                <div className="text-sm text-charcoal-700">Water source unconfirmed</div>
              </div>
            </button>
          </div>
        </div>

        {/* Section 1C: Soil Type (Picture Choices) */}
        <div className="space-y-3 pt-2">
          <div className="text-base sm:text-lg font-bold text-charcoal-900">
            What does your field soil feel like?
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Choice 1: Loam */}
            <button
              type="button"
              onClick={() => handleSelectSoil('loam')}
              className={`min-h-[64px] p-4 rounded-2xl border-3 flex items-center gap-3.5 text-left transition-all focus-visible:ring-4 focus-visible:ring-forest-700 ${
                farmState.soilType === 'loam'
                  ? 'bg-forest-50 border-forest-800 text-forest-950 font-bold ring-2 ring-forest-800'
                  : 'bg-white border-charcoal-400 text-charcoal-900 hover:border-charcoal-700'
              }`}
            >
              <LoamIllustration className="w-11 h-11 shrink-0" />
              <div className="flex-1">
                <div className="text-base sm:text-lg font-extrabold flex items-center justify-between">
                  <span>Loam / Medium</span>
                  {farmState.soilType === 'loam' && (
                    <span className="text-xs bg-forest-800 text-white px-1.5 py-0.5 rounded font-bold">✓</span>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-charcoal-700">Crumbles nicely, balanced</div>
              </div>
            </button>

            {/* Choice 2: Clay */}
            <button
              type="button"
              onClick={() => handleSelectSoil('clay')}
              className={`min-h-[64px] p-4 rounded-2xl border-3 flex items-center gap-3.5 text-left transition-all focus-visible:ring-4 focus-visible:ring-forest-700 ${
                farmState.soilType === 'clay'
                  ? 'bg-forest-50 border-forest-800 text-forest-950 font-bold ring-2 ring-forest-800'
                  : 'bg-white border-charcoal-400 text-charcoal-900 hover:border-charcoal-700'
              }`}
            >
              <ClayIllustration className="w-11 h-11 shrink-0" />
              <div className="flex-1">
                <div className="text-base sm:text-lg font-extrabold flex items-center justify-between">
                  <span>Clay / Heavy</span>
                  {farmState.soilType === 'clay' && (
                    <span className="text-xs bg-forest-800 text-white px-1.5 py-0.5 rounded font-bold">✓</span>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-charcoal-700">Sticky wet, hard when dry</div>
              </div>
            </button>

            {/* Choice 3: Sand */}
            <button
              type="button"
              onClick={() => handleSelectSoil('sand')}
              className={`min-h-[64px] p-4 rounded-2xl border-3 flex items-center gap-3.5 text-left transition-all focus-visible:ring-4 focus-visible:ring-forest-700 ${
                farmState.soilType === 'sand'
                  ? 'bg-forest-50 border-forest-800 text-forest-950 font-bold ring-2 ring-forest-800'
                  : 'bg-white border-charcoal-400 text-charcoal-900 hover:border-charcoal-700'
              }`}
            >
              <SandIllustration className="w-11 h-11 shrink-0" />
              <div className="flex-1">
                <div className="text-base sm:text-lg font-extrabold flex items-center justify-between">
                  <span>Sand / Light</span>
                  {farmState.soilType === 'sand' && (
                    <span className="text-xs bg-forest-800 text-white px-1.5 py-0.5 rounded font-bold">✓</span>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-charcoal-700">Loose, drains fast</div>
              </div>
            </button>

            {/* Choice 4: Not sure */}
            <button
              type="button"
              onClick={() => handleSelectSoil('unknown')}
              className={`min-h-[64px] p-4 rounded-2xl border-3 flex items-center gap-3.5 text-left transition-all focus-visible:ring-4 focus-visible:ring-forest-700 ${
                farmState.soilType === 'unknown'
                  ? 'bg-forest-50 border-forest-800 text-forest-950 font-bold ring-2 ring-forest-800'
                  : 'bg-white border-charcoal-400 text-charcoal-900 hover:border-charcoal-700'
              }`}
            >
              <NotSureSoilIllustration className="w-11 h-11 shrink-0" />
              <div className="flex-1">
                <div className="text-base sm:text-lg font-extrabold flex items-center justify-between">
                  <span>Not sure</span>
                  {farmState.soilType === 'unknown' && (
                    <span className="text-xs bg-forest-800 text-white px-1.5 py-0.5 rounded font-bold">✓</span>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-charcoal-700">Soil type unconfirmed</div>
              </div>
            </button>
          </div>
        </div>

        {/* Details Section for Tool Card 1 */}
        <details className="mt-4 p-4 bg-sand-100 rounded-2xl border-2 border-sand-300">
          <summary className="font-bold text-base text-charcoal-900 cursor-pointer min-h-[48px] flex items-center justify-between">
            <span>Show field coordinates &amp; soil details</span>
            <ChevronDown className="w-5 h-5 text-charcoal-600" aria-hidden="true" />
          </summary>
          <div className="pt-3 space-y-4 text-sm text-charcoal-800 border-t border-sand-300 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="simple-lat" className="block font-bold text-charcoal-900 mb-1">
                  Latitude (-90 to +90)
                </label>
                <input
                  id="simple-lat"
                  type="text"
                  value={farmState.coordinates.latitude}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      coordinates: { ...prev.coordinates, latitude: e.target.value },
                    }))
                  }
                  className="w-full min-h-[48px] p-3 rounded-xl border-2 border-charcoal-400 bg-white font-mono text-base"
                  placeholder="e.g. 45.0"
                />
              </div>
              <div>
                <label htmlFor="simple-lon" className="block font-bold text-charcoal-900 mb-1">
                  Longitude (-180 to +180)
                </label>
                <input
                  id="simple-lon"
                  type="text"
                  value={farmState.coordinates.longitude}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      coordinates: { ...prev.coordinates, longitude: e.target.value },
                    }))
                  }
                  className="w-full min-h-[48px] p-3 rounded-xl border-2 border-charcoal-400 bg-white font-mono text-base"
                  placeholder="e.g. 10.0"
                />
              </div>
            </div>
            <div className="p-3 bg-white rounded-xl border border-sand-300 space-y-1">
              <div className="font-bold text-charcoal-900">Privacy &amp; Data Scope:</div>
              <p className="text-xs text-charcoal-700">
                All farm coordinates, soil selections, and crop sequences stay strictly in your device&apos;s browser memory. Coordinates are only sent to the public NASA POWER endpoint when loading weather history.
              </p>
            </div>
          </div>
        </details>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          TOOL CARD 2: WHAT I SEE
          ───────────────────────────────────────────────────────────── */}
      <section
        id="card-what-i-see"
        aria-labelledby="heading-what-i-see"
        className="bg-white border-3 border-charcoal-700 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
      >
        <div className="flex items-start sm:items-center gap-4 border-b-2 border-sand-200 pb-5">
          <ObservationIllustration className="w-14 h-14 shrink-0" />
          <div>
            <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Tool 2 of 4
            </div>
            <h3 id="heading-what-i-see" className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
              What I See
            </h3>
            <p className="text-base sm:text-lg text-charcoal-700 mt-0.5">
              Look at your crops and soil. Touch picture choices to record visual field notes.
            </p>
          </div>
        </div>

        {/* Agronomic Boundary Notice */}
        <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-2xl flex items-start gap-3.5 text-amber-950">
          <AlertTriangle className="w-6 h-6 text-amber-800 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1 text-sm sm:text-base leading-relaxed">
            <div className="font-bold text-amber-900">
              Field Observations are Visual Notes — Not Agronomic Diagnoses
            </div>
            <p>
              Observation choices are recorded for your personal scouting logs. They are <strong>NOT confirmed disease diagnoses</strong> or chemical treatment instructions. Always consult an accredited local agronomist or extension laboratory before applying fertilizers, fungicides, or pesticides.
            </p>
          </div>
        </div>

        {/* Visual Picture Choices for Field Observations */}
        <div className="space-y-3">
          <div className="text-base sm:text-lg font-bold text-charcoal-900">
            Select anything you notice in your field:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* 1. Yellowing */}
            <button
              type="button"
              onClick={() => handleToggleObservation('yellowing')}
              className={`min-h-[56px] p-4 rounded-2xl border-3 flex items-center gap-3.5 text-left transition-all focus-visible:ring-4 focus-visible:ring-forest-700 ${
                currentObservations.includes('yellowing')
                  ? 'bg-amber-50 border-amber-800 ring-2 ring-amber-800 font-bold'
                  : 'bg-white border-charcoal-400 hover:border-charcoal-700'
              }`}
            >
              <YellowingLeafIllustration className="w-11 h-11 shrink-0" />
              <div className="flex-1">
                <div className="text-base sm:text-lg font-extrabold text-charcoal-900 flex items-center justify-between">
                  <span>Yellowing leaves</span>
                  {currentObservations.includes('yellowing') && (
                    <span className="text-xs bg-amber-800 text-white px-2 py-0.5 rounded-full font-bold">
                      Noted
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-charcoal-700">Pale or yellow leaves</div>
              </div>
            </button>

            {/* 2. Wilting */}
            <button
              type="button"
              onClick={() => handleToggleObservation('wilting')}
              className={`min-h-[56px] p-4 rounded-2xl border-3 flex items-center gap-3.5 text-left transition-all focus-visible:ring-4 focus-visible:ring-forest-700 ${
                currentObservations.includes('wilting')
                  ? 'bg-amber-50 border-amber-800 ring-2 ring-amber-800 font-bold'
                  : 'bg-white border-charcoal-400 hover:border-charcoal-700'
              }`}
            >
              <WiltingPlantIllustration className="w-11 h-11 shrink-0" />
              <div className="flex-1">
                <div className="text-base sm:text-lg font-extrabold text-charcoal-900 flex items-center justify-between">
                  <span>Wilting or dry plants</span>
                  {currentObservations.includes('wilting') && (
                    <span className="text-xs bg-amber-800 text-white px-2 py-0.5 rounded-full font-bold">
                      Noted
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-charcoal-700">Drooping stems or dry soil</div>
              </div>
            </button>

            {/* 3. Leaf spots */}
            <button
              type="button"
              onClick={() => handleToggleObservation('leaf_spots')}
              className={`min-h-[56px] p-4 rounded-2xl border-3 flex items-center gap-3.5 text-left transition-all focus-visible:ring-4 focus-visible:ring-forest-700 ${
                currentObservations.includes('leaf_spots')
                  ? 'bg-amber-50 border-amber-800 ring-2 ring-amber-800 font-bold'
                  : 'bg-white border-charcoal-400 hover:border-charcoal-700'
              }`}
            >
              <LeafSpotsIllustration className="w-11 h-11 shrink-0" />
              <div className="flex-1">
                <div className="text-base sm:text-lg font-extrabold text-charcoal-900 flex items-center justify-between">
                  <span>Leaf spots or holes</span>
                  {currentObservations.includes('leaf_spots') && (
                    <span className="text-xs bg-amber-800 text-white px-2 py-0.5 rounded-full font-bold">
                      Noted
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-charcoal-700">Dark patches or insect bites</div>
              </div>
            </button>

            {/* 4. Standing water */}
            <button
              type="button"
              onClick={() => handleToggleObservation('standing_water')}
              className={`min-h-[56px] p-4 rounded-2xl border-3 flex items-center gap-3.5 text-left transition-all focus-visible:ring-4 focus-visible:ring-forest-700 ${
                currentObservations.includes('standing_water')
                  ? 'bg-amber-50 border-amber-800 ring-2 ring-amber-800 font-bold'
                  : 'bg-white border-charcoal-400 hover:border-charcoal-700'
              }`}
            >
              <StandingWaterIllustration className="w-11 h-11 shrink-0" />
              <div className="flex-1">
                <div className="text-base sm:text-lg font-extrabold text-charcoal-900 flex items-center justify-between">
                  <span>Standing water</span>
                  {currentObservations.includes('standing_water') && (
                    <span className="text-xs bg-amber-800 text-white px-2 py-0.5 rounded-full font-bold">
                      Noted
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-charcoal-700">Puddling after rain / poor drainage</div>
              </div>
            </button>

            {/* 5. Stunted growth */}
            <button
              type="button"
              onClick={() => handleToggleObservation('stunted')}
              className={`min-h-[56px] p-4 rounded-2xl border-3 flex items-center gap-3.5 text-left transition-all focus-visible:ring-4 focus-visible:ring-forest-700 ${
                currentObservations.includes('stunted')
                  ? 'bg-amber-50 border-amber-800 ring-2 ring-amber-800 font-bold'
                  : 'bg-white border-charcoal-400 hover:border-charcoal-700'
              }`}
            >
              <StuntedGrowthIllustration className="w-11 h-11 shrink-0" />
              <div className="flex-1">
                <div className="text-base sm:text-lg font-extrabold text-charcoal-900 flex items-center justify-between">
                  <span>Stunted growth</span>
                  {currentObservations.includes('stunted') && (
                    <span className="text-xs bg-amber-800 text-white px-2 py-0.5 rounded-full font-bold">
                      Noted
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-charcoal-700">Shorter than normal plants</div>
              </div>
            </button>

            {/* 6. Healthy growth */}
            <button
              type="button"
              onClick={() => handleToggleObservation('healthy')}
              className={`min-h-[56px] p-4 rounded-2xl border-3 flex items-center gap-3.5 text-left transition-all focus-visible:ring-4 focus-visible:ring-forest-700 ${
                currentObservations.includes('healthy')
                  ? 'bg-emerald-50 border-emerald-800 ring-2 ring-emerald-800 font-bold'
                  : 'bg-white border-charcoal-400 hover:border-charcoal-700'
              }`}
            >
              <HealthyGrowthIllustration className="w-11 h-11 shrink-0" />
              <div className="flex-1">
                <div className="text-base sm:text-lg font-extrabold text-charcoal-900 flex items-center justify-between">
                  <span>Healthy crop growth</span>
                  {currentObservations.includes('healthy') && (
                    <span className="text-xs bg-emerald-800 text-white px-2 py-0.5 rounded-full font-bold">
                      Noted
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-charcoal-700">Vigorous, good green color</div>
              </div>
            </button>

            {/* 7. Not sure / None */}
            <button
              type="button"
              onClick={() => handleToggleObservation('unknown')}
              className={`min-h-[56px] p-4 rounded-2xl border-3 flex items-center gap-3.5 text-left transition-all focus-visible:ring-4 focus-visible:ring-forest-700 ${
                currentObservations.includes('unknown') || currentObservations.length === 0
                  ? 'bg-sand-100 border-charcoal-800 font-bold'
                  : 'bg-white border-charcoal-400 hover:border-charcoal-700'
              }`}
            >
              <NotSureObservationIllustration className="w-11 h-11 shrink-0" />
              <div className="flex-1">
                <div className="text-base sm:text-lg font-extrabold text-charcoal-900 flex items-center justify-between">
                  <span>Not sure / None</span>
                  {(currentObservations.includes('unknown') || currentObservations.length === 0) && (
                    <span className="text-xs bg-charcoal-800 text-white px-2 py-0.5 rounded-full font-bold">
                      Selected
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-charcoal-700">No clear symptoms noticed</div>
              </div>
            </button>
          </div>
        </div>

        {/* Selected Observations Scouting Notes (NOT a diagnosis) */}
        {currentObservations.filter((k) => k !== 'unknown' && k !== 'healthy').length > 0 && (
          <div className="p-4 bg-sand-100 border-2 border-sand-400 rounded-2xl space-y-2.5">
            <div className="text-sm font-bold text-charcoal-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-forest-800" aria-hidden="true" />
              <span>Visual Scouting Reminders (Check with Local Agronomist):</span>
            </div>
            <ul className="space-y-1.5 text-xs sm:text-sm text-charcoal-800 list-disc list-inside">
              {currentObservations.includes('yellowing') && (
                <li>
                  <strong>Yellowing leaves:</strong> Can be caused by nitrogen shortage, waterlogged roots, or natural plant maturity. Check root depth and test soil nitrogen locally.
                </li>
              )}
              {currentObservations.includes('wilting') && (
                <li>
                  <strong>Wilting:</strong> Can indicate low root-zone moisture or intense heat stress. Check moisture 10 cm below ground surface.
                </li>
              )}
              {currentObservations.includes('leaf_spots') && (
                <li>
                  <strong>Leaf spots:</strong> Can be fungal, bacterial, or insect damage. Take clear photos of both leaf sides to show an extension diagnostic clinic.
                </li>
              )}
              {currentObservations.includes('standing_water') && (
                <li>
                  <strong>Standing water:</strong> Indicates slow infiltration or soil compaction. Avoid driving heavy equipment on wet ground to prevent deeper compaction.
                </li>
              )}
              {currentObservations.includes('stunted') && (
                <li>
                  <strong>Stunted growth:</strong> Can stem from hardpan compaction, cold spring soils, or nematode feeding. Compare root systems between healthy and stunted plants.
                </li>
              )}
            </ul>
            <div className="text-xs text-charcoal-600 italic pt-1">
              * Remember: Universal Farm does not prescribe chemicals or make definitive biological diagnoses.
            </div>
          </div>
        )}

        {/* Details Section for Tool Card 2 */}
        <details className="mt-4 p-4 bg-sand-100 rounded-2xl border-2 border-sand-300">
          <summary className="font-bold text-base text-charcoal-900 cursor-pointer min-h-[48px] flex items-center justify-between">
            <span>Show field scouting guidelines &amp; extension contacts</span>
            <ChevronDown className="w-5 h-5 text-charcoal-600" aria-hidden="true" />
          </summary>
          <div className="pt-3 space-y-2.5 text-xs sm:text-sm text-charcoal-800 border-t border-sand-300 mt-2">
            <p>
              <strong>Best Practices for Field Scouting:</strong> Walk a representative W-shaped path across your field rather than checking only the edges. Examine at least 10 random plants.
            </p>
            <p>
              <strong>When to seek professional diagnosis:</strong> If symptoms spread rapidly or threaten crop establishment, contact your local university extension office or certified crop advisor immediately.
            </p>
          </div>
        </details>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          TOOL CARD 3: PAST WEATHER
          ───────────────────────────────────────────────────────────── */}
      <section
        id="card-past-weather"
        aria-labelledby="heading-past-weather"
        className="bg-white border-3 border-charcoal-700 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
      >
        <div className="flex items-start sm:items-center gap-4 border-b-2 border-sand-200 pb-5">
          <WeatherIllustration className="w-14 h-14 shrink-0" />
          <div>
            <div className="text-xs font-bold text-blue-800 uppercase tracking-wider">
              Tool 3 of 4
            </div>
            <h3 id="heading-past-weather" className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
              Past Weather
            </h3>
            <p className="text-base sm:text-lg text-charcoal-700 mt-0.5">
              Observed historical daily weather from NASA satellites for your field coordinates.
            </p>
          </div>
        </div>

        {/* Location Binding Status */}
        <div className="p-4 bg-sand-50 border-2 border-sand-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
              Weather Bound to Coordinates
            </div>
            <div className="text-base font-bold text-charcoal-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-forest-800" aria-hidden="true" />
              {coordVal.isValid ? (
                <span>
                  {farmState.coordinates.latitude}°, {farmState.coordinates.longitude}°
                </span>
              ) : (
                <span className="text-amber-800">
                  Please set coordinates in Card 1 first
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={!coordVal.isValid || isWeatherLoading}
              onClick={() => handleLoadWeather('year')}
              className={`min-h-[48px] px-5 py-2.5 rounded-xl text-base font-bold transition-all shadow-sm flex items-center gap-2 focus-visible:ring-4 focus-visible:ring-blue-600 ${
                coordVal.isValid && !isWeatherLoading
                  ? 'bg-blue-800 hover:bg-blue-900 text-white'
                  : 'bg-sand-200 text-charcoal-400 cursor-not-allowed border border-sand-300'
              }`}
            >
              {isWeatherLoading && weatherPreset === 'year' ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" aria-hidden="true" />
                  <span>Loading NASA Weather...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" aria-hidden="true" />
                  <span>Load 1-Year History (2024)</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={!coordVal.isValid || isWeatherLoading}
              onClick={() => handleLoadWeather('week')}
              className="min-h-[48px] px-4 py-2 bg-sand-100 hover:bg-sand-200 text-charcoal-900 border-2 border-charcoal-700 rounded-xl text-sm font-bold transition-colors focus-visible:ring-4 focus-visible:ring-forest-700"
            >
              7-Day Sample
            </button>
          </div>
        </div>

        {/* Warning if coordinates changed or mismatched */}
        {nasaData && !isWeatherBound && (
          <div className="p-4 bg-amber-100 border-2 border-amber-500 rounded-2xl text-amber-950 flex items-start gap-3 text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <div className="font-bold text-amber-900">
                Weather Data Mismatched With Field Location
              </div>
              <p>
                Loaded weather history was requested for coordinates ({nasaData.metadata.requestedCoordinates.latitude}°, {nasaData.metadata.requestedCoordinates.longitude}°), but your field is currently set to ({farmState.coordinates.latitude}°, {farmState.coordinates.longitude}°). Weather observations cannot be applied until you reload weather for this location.
              </p>
            </div>
          </div>
        )}

        {/* Weather Error */}
        {weatherError && (
          <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl text-red-950 flex items-start gap-3 text-sm">
            <XCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <div className="font-bold text-red-900">Weather Request Failed</div>
              <p>{weatherError}</p>
            </div>
          </div>
        )}

        {/* Display NASA Weather Data */}
        {nasaData ? (
          <div className="space-y-4">
            {/* Short period warning if < 365 days */}
            {nasaData.records.length < 365 && (
              <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-2xl text-amber-950 text-sm leading-relaxed flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <div className="font-bold text-amber-900">
                    {`Short Observation Window (${nasaData.records.length} days)`}
                  </div>
                  <p>
                    {`This data covers ${nasaData.metadata.requestedStartDate} to ${nasaData.metadata.requestedEndDate}. `}<strong>A 7-day or short period is NOT full agricultural evidence</strong> and does not reflect a full annual growing season.
                  </p>
                </div>
              </div>
            )}

            {/* Observed Dates Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-charcoal-700 bg-sand-50 p-3 rounded-xl border border-sand-300">
              <div className="flex items-center gap-2 font-bold text-charcoal-900">
                <Calendar className="w-4 h-4 text-forest-800" aria-hidden="true" />
                <span>
                  {`Observed Dates: ${nasaData.metadata.requestedStartDate} to ${nasaData.metadata.requestedEndDate} (${nasaData.records.length} days)`}
                </span>
              </div>
              <div className="text-xs text-charcoal-500 font-mono">
                Source: NASA POWER API v2 (Local Solar Time)
              </div>
            </div>

            {/* Four Large Metric Tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Tile 1: Average Temperature */}
              <div className="p-4 bg-white border-3 border-charcoal-700 rounded-2xl shadow-xs">
                <div className="text-xs font-bold text-charcoal-600 uppercase tracking-wider">
                  Mean Temperature
                </div>
                <div className="text-2xl sm:text-3xl font-black text-charcoal-900 mt-1">
                  {nasaData.summary.t2mMean !== null ? `${nasaData.summary.t2mMean} °C` : '—'}
                </div>
                <div className="text-xs text-charcoal-600 mt-1">
                  Daily average over {nasaData.summary.daysWithValidT2M} valid days
                </div>
              </div>

              {/* Tile 2: Peak High */}
              <div className="p-4 bg-white border-3 border-charcoal-700 rounded-2xl shadow-xs">
                <div className="text-xs font-bold text-red-700 uppercase tracking-wider">
                  Warmest Single Day
                </div>
                <div className="text-2xl sm:text-3xl font-black text-red-700 mt-1">
                  {nasaData.summary.t2mMaxPeak !== null ? `${nasaData.summary.t2mMaxPeak} °C` : '—'}
                </div>
                <div className="text-xs text-charcoal-600 mt-1">
                  Peak maximum recorded
                </div>
              </div>

              {/* Tile 3: Lowest Low */}
              <div className="p-4 bg-white border-3 border-charcoal-700 rounded-2xl shadow-xs">
                <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Coldest Single Day
                </div>
                <div className="text-2xl sm:text-3xl font-black text-blue-700 mt-1">
                  {nasaData.summary.t2mMinLowest !== null ? `${nasaData.summary.t2mMinLowest} °C` : '—'}
                </div>
                <div className="text-xs text-charcoal-600 mt-1">
                  Lowest minimum recorded
                </div>
              </div>

              {/* Tile 4: Period Rainfall (Explicitly NOT annual unless 365d) */}
              <div className="p-4 bg-white border-3 border-charcoal-700 rounded-2xl shadow-xs">
                <div className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                  Period Total Rain
                </div>
                <div className="text-2xl sm:text-3xl font-black text-charcoal-900 mt-1">
                  {nasaData.summary.precipSum !== null ? `${nasaData.summary.precipSum} mm` : '—'}
                </div>
                <div className="text-xs text-charcoal-600 mt-1">
                  {nasaData.records.length >= 365
                    ? 'Total rain during this full 1-year period'
                    : `Total rain during these ${nasaData.records.length} days (NOT annual rainfall)`}
                </div>
              </div>
            </div>

            {/* Satellite Coverage & Missing Data Disclosure */}
            <div className="p-3.5 bg-sand-50 border border-sand-300 rounded-xl text-xs sm:text-sm text-charcoal-800 flex flex-wrap items-center justify-between gap-2">
              <div>
                <strong>Data Completeness:</strong> {nasaData.summary.daysWithValidT2M} of {nasaData.records.length} days valid temperature · {nasaData.summary.daysWithValidPrecip} of {nasaData.records.length} days valid rainfall.
              </div>
              <div className="font-semibold text-charcoal-700">
                {nasaData.summary.isCompleteCoverage
                  ? '✓ 100% complete coverage'
                  : 'Missing readings converted to null'}
              </div>
            </div>

            {/* Non-Forecast & Safety Disclaimer */}
            <div className="p-4 bg-sand-100 border border-sand-300 rounded-2xl text-xs sm:text-sm text-charcoal-700 space-y-1">
              <div className="font-bold text-charcoal-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-forest-800" aria-hidden="true" />
                <span>Historical Data Only — Not a Weather Forecast</span>
              </div>
              <p>
                These figures reflect real past satellite observations from NASA POWER, <strong>NOT a forecast</strong>. Past weather does not imply a safe, healthy, or risk-free field for upcoming seasons.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-sand-50 border-2 border-dashed border-sand-300 rounded-2xl space-y-3">
            <CloudSun className="w-12 h-12 text-forest-700 mx-auto" aria-hidden="true" />
            <div className="text-lg font-bold text-charcoal-900">
              No Past Weather Loaded Yet
            </div>
            <p className="text-sm text-charcoal-600 max-w-md mx-auto">
              Touch the &quot;Load 1-Year History (2024)&quot; button above to download real daily temperature and rainfall records directly from NASA satellites for your field coordinates.
            </p>
          </div>
        )}

        {/* Details Section for Tool Card 3 */}
        <details className="mt-4 p-4 bg-sand-100 rounded-2xl border-2 border-sand-300">
          <summary className="font-bold text-base text-charcoal-900 cursor-pointer min-h-[48px] flex items-center justify-between">
            <span>Show detailed daily weather table &amp; technical sources</span>
            <ChevronDown className="w-5 h-5 text-charcoal-600" aria-hidden="true" />
          </summary>
          <div className="pt-3 space-y-4 text-xs sm:text-sm text-charcoal-800 border-t border-sand-300 mt-2">
            {nasaData && (
              <div className="overflow-x-auto max-h-72 border border-sand-300 rounded-xl bg-white">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-sand-100 font-sans font-bold border-b border-sand-300 sticky top-0">
                    <tr>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Mean (°C)</th>
                      <th className="p-2.5">Max (°C)</th>
                      <th className="p-2.5">Min (°C)</th>
                      <th className="p-2.5">Rain (mm)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-200">
                    {nasaData.records.slice(0, 30).map((r) => (
                      <tr key={r.dateStr} className="hover:bg-sand-50">
                        <td className="p-2 font-sans font-medium">{r.displayDate}</td>
                        <td className="p-2">{r.t2m !== null ? `${r.t2m.toFixed(1)}°C` : '—'}</td>
                        <td className="p-2 text-red-700">{r.t2mMax !== null ? `${r.t2mMax.toFixed(1)}°C` : '—'}</td>
                        <td className="p-2 text-blue-700">{r.t2mMin !== null ? `${r.t2mMin.toFixed(1)}°C` : '—'}</td>
                        <td className="p-2 font-bold">{r.prectotcorr !== null ? `${r.prectotcorr.toFixed(1)}mm` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="p-3 bg-white rounded-xl border border-sand-300 space-y-1">
              <div className="font-bold text-charcoal-900">Technical Data Provenance:</div>
              <p className="text-xs text-charcoal-700">
                Data provided by NASA Langley Research Center POWER Project. Resolution is ~0.5° latitude by 0.625° longitude. Sentinels (-999) are safely converted to null.
              </p>
            </div>
          </div>
        </details>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          TOOL CARD 4: MY CROP PLAN
          ───────────────────────────────────────────────────────────── */}
      <section
        id="card-my-crop-plan"
        aria-labelledby="heading-my-crop-plan"
        className="bg-white border-3 border-charcoal-700 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
      >
        <div className="flex items-start sm:items-center gap-4 border-b-2 border-sand-200 pb-5">
          <CropPlanIllustration className="w-14 h-14 shrink-0" />
          <div>
            <div className="text-xs font-bold text-forest-800 uppercase tracking-wider">
              Tool 4 of 4
            </div>
            <h3 id="heading-my-crop-plan" className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
              My Crop Plan
            </h3>
            <p className="text-base sm:text-lg text-charcoal-700 mt-0.5">
              Pick what grew last season to see feasible next crops based on agronomic science.
            </p>
          </div>
        </div>

        {/* Section 4A: What crop was grown last season? */}
        <div className="space-y-3">
          <div className="text-base sm:text-lg font-bold text-charcoal-900">
            What crop was grown in this field last season?
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Bread Wheat */}
            <button
              type="button"
              onClick={() => handleSelectCrop('Bread Wheat')}
              className={`min-h-[64px] p-3.5 rounded-2xl border-3 flex flex-col items-center text-center transition-all focus-visible:ring-4 focus-visible:ring-forest-700 ${
                farmState.cropRotationList.includes('Bread Wheat')
                  ? 'bg-forest-50 border-forest-800 text-forest-950 font-bold ring-2 ring-forest-800'
                  : 'bg-white border-charcoal-400 text-charcoal-900 hover:border-charcoal-700'
              }`}
            >
              <WheatIllustration className="w-10 h-10 mb-1" />
              <div className="text-base font-extrabold">Bread Wheat</div>
              <div className="text-xs text-charcoal-600">Winter cereal</div>
            </button>

            {/* Feed Barley */}
            <button
              type="button"
              onClick={() => handleSelectCrop('Feed Barley')}
              className={`min-h-[64px] p-3.5 rounded-2xl border-3 flex flex-col items-center text-center transition-all focus-visible:ring-4 focus-visible:ring-forest-700 ${
                farmState.cropRotationList.includes('Feed Barley')
                  ? 'bg-forest-50 border-forest-800 text-forest-950 font-bold ring-2 ring-forest-800'
                  : 'bg-white border-charcoal-400 text-charcoal-900 hover:border-charcoal-700'
              }`}
            >
              <BarleyIllustration className="w-10 h-10 mb-1" />
              <div className="text-base font-extrabold">Feed Barley</div>
              <div className="text-xs text-charcoal-600">Drought cereal</div>
            </button>

            {/* Chickpea */}
            <button
              type="button"
              onClick={() => handleSelectCrop('Chickpea')}
              className={`min-h-[64px] p-3.5 rounded-2xl border-3 flex flex-col items-center text-center transition-all focus-visible:ring-4 focus-visible:ring-forest-700 ${
                farmState.cropRotationList.includes('Chickpea')
                  ? 'bg-forest-50 border-forest-800 text-forest-950 font-bold ring-2 ring-forest-800'
                  : 'bg-white border-charcoal-400 text-charcoal-900 hover:border-charcoal-700'
              }`}
            >
              <ChickpeaIllustration className="w-10 h-10 mb-1" />
              <div className="text-base font-extrabold">Chickpea</div>
              <div className="text-xs text-charcoal-600">Nitrogen pulse</div>
            </button>

            {/* Field Pea */}
            <button
              type="button"
              onClick={() => handleSelectCrop('Field Pea')}
              className={`min-h-[64px] p-3.5 rounded-2xl border-3 flex flex-col items-center text-center transition-all focus-visible:ring-4 focus-visible:ring-forest-700 ${
                farmState.cropRotationList.includes('Field Pea')
                  ? 'bg-forest-50 border-forest-800 text-forest-950 font-bold ring-2 ring-forest-800'
                  : 'bg-white border-charcoal-400 text-charcoal-900 hover:border-charcoal-700'
              }`}
            >
              <FieldPeaIllustration className="w-10 h-10 mb-1" />
              <div className="text-base font-extrabold">Field Pea</div>
              <div className="text-xs text-charcoal-600">Grain pulse</div>
            </button>

            {/* Canola */}
            <button
              type="button"
              onClick={() => handleSelectCrop('Canola')}
              className={`min-h-[64px] p-3.5 rounded-2xl border-3 flex flex-col items-center text-center transition-all focus-visible:ring-4 focus-visible:ring-forest-700 ${
                farmState.cropRotationList.includes('Canola')
                  ? 'bg-forest-50 border-forest-800 text-forest-950 font-bold ring-2 ring-forest-800'
                  : 'bg-white border-charcoal-400 text-charcoal-900 hover:border-charcoal-700'
              }`}
            >
              <CanolaIllustration className="w-10 h-10 mb-1" />
              <div className="text-base font-extrabold">Canola</div>
              <div className="text-xs text-charcoal-600">Brassica oilseed</div>
            </button>

            {/* Grain Sorghum */}
            <button
              type="button"
              onClick={() => handleSelectCrop('Grain Sorghum')}
              className={`min-h-[64px] p-3.5 rounded-2xl border-3 flex flex-col items-center text-center transition-all focus-visible:ring-4 focus-visible:ring-forest-700 ${
                farmState.cropRotationList.includes('Grain Sorghum')
                  ? 'bg-forest-50 border-forest-800 text-forest-950 font-bold ring-2 ring-forest-800'
                  : 'bg-white border-charcoal-400 text-charcoal-900 hover:border-charcoal-700'
              }`}
            >
              <SorghumIllustration className="w-10 h-10 mb-1" />
              <div className="text-base font-extrabold">Grain Sorghum</div>
              <div className="text-xs text-charcoal-600">Summer cereal</div>
            </button>

            {/* Oat & Vetch Cover */}
            <button
              type="button"
              onClick={() => handleSelectCrop('Oat & Vetch Cover Crop')}
              className={`min-h-[64px] p-3.5 rounded-2xl border-3 flex flex-col items-center text-center transition-all focus-visible:ring-4 focus-visible:ring-forest-700 ${
                farmState.cropRotationList.includes('Oat & Vetch Cover Crop')
                  ? 'bg-forest-50 border-forest-800 text-forest-950 font-bold ring-2 ring-forest-800'
                  : 'bg-white border-charcoal-400 text-charcoal-900 hover:border-charcoal-700'
              }`}
            >
              <CoverMixIllustration className="w-10 h-10 mb-1" />
              <div className="text-base font-extrabold">Oat &amp; Vetch</div>
              <div className="text-xs text-charcoal-600">Cover mixture</div>
            </button>

            {/* Not sure / Other */}
            <button
              type="button"
              onClick={() => handleSelectCrop('unknown')}
              className={`min-h-[64px] p-3.5 rounded-2xl border-3 flex flex-col items-center text-center transition-all focus-visible:ring-4 focus-visible:ring-forest-700 ${
                farmState.cropRotationList.length === 0
                  ? 'bg-sand-100 border-charcoal-800 text-charcoal-950 font-bold'
                  : 'bg-white border-charcoal-400 text-charcoal-900 hover:border-charcoal-700'
              }`}
            >
              <OtherCropIllustration className="w-10 h-10 mb-1" />
              <div className="text-base font-extrabold">Not sure / Other</div>
              <div className="text-xs text-charcoal-600">Unspecified previous crop</div>
            </button>
          </div>
        </div>

        {/* Section 4B: Feasible Next Crops Evaluation */}
        <div className="space-y-4 pt-2">
          <div className="text-base sm:text-lg font-bold text-charcoal-900">
            Agronomic Rotation Evaluation
          </div>

          {/* CRITICAL CHECK 1: If coordinates missing or invalid */}
          {!coordVal.isValid && (
            <div className="p-5 bg-sand-100 border-2 border-charcoal-400 rounded-2xl space-y-2 text-charcoal-900">
              <div className="font-bold text-base flex items-center gap-2 text-charcoal-900">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" aria-hidden="true" />
                <span>Field Location Required</span>
              </div>
              <p className="text-sm leading-relaxed text-charcoal-700">
                Please enter valid field coordinates or choose &quot;Use Demo Field&quot; in <strong>Tool 1 (My Field)</strong> before crop recommendations can be evaluated. Universal Farm never fabricates recommendations without a field location.
              </p>
            </div>
          )}

          {/* CRITICAL CHECK 2: If outside Evidence Pack 1 geographic scope */}
          {coordVal.isValid && (!sufficiency.isGeographicallyApplicable || sufficiency.status === 'insufficient_evidence') && (
            <div className="p-5 bg-amber-50 border-2 border-amber-400 rounded-2xl space-y-2 text-amber-950">
              <div className="font-bold text-base flex items-center gap-2 text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-800 shrink-0" aria-hidden="true" />
                <span>Geographic Scope Warning: Insufficient Evidence for this Location</span>
              </div>
              <p className="text-sm leading-relaxed">
                Evidence Pack 1 is explicitly scoped for temperate and Mediterranean semi-arid zones (latitudes 28°–48°N and 28°–45°S). Universal Farm does not fabricate synthetic recommendations outside tested geographic boundaries.
              </p>
            </div>
          )}

          {/* CRITICAL CHECK 3: If location is valid and in scope, but no previous crop selected */}
          {isGeographicallySupported && !hasPreviousCrop && (
            <div className="p-5 bg-sand-100 border-2 border-forest-600 rounded-2xl space-y-2 text-charcoal-900">
              <div className="font-bold text-base flex items-center gap-2 text-forest-900">
                <Info className="w-5 h-5 text-forest-800 shrink-0" aria-hidden="true" />
                <span>Select Previous Crop Above</span>
              </div>
              <p className="text-sm leading-relaxed text-charcoal-700">
                Touch one of the crop picture choices above to select what grew last season in this field. Feasible rotation candidates and disease-break alternatives will be evaluated once your previous crop is selected.
              </p>
            </div>
          )}

          {/* ONLY DISPLAY FEASIBLE CANDIDATES WHEN STRICTLY ELIGIBLE */}
          {areRecommendationsEligible && (
            <>
              {/* Feasible Next Crops Cards */}
              <div className="space-y-3">
                <div className="text-sm font-bold uppercase tracking-wider text-charcoal-600">
                  Feasible Next Crop Candidates:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Feasible Card: Chickpea */}
                  <div className="p-4 bg-emerald-50/80 border-2 border-emerald-600 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-extrabold text-lg text-emerald-950 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" aria-hidden="true" />
                        <span>Chickpea (Pulse)</span>
                      </div>
                      <span className="text-xs font-bold bg-emerald-800 text-white px-2.5 py-1 rounded-full uppercase tracking-wider">
                        FEASIBLE NEXT CROP
                      </span>
                    </div>
                    <p className="text-sm text-emerald-950 leading-relaxed">
                      Excellent rotation break after cereals. Fixes atmospheric nitrogen and breaks cereal fungal root disease cycles.
                    </p>
                    <div className="text-xs text-emerald-900 font-medium">
                      Indicative Water Demand: ~350–500 mm · Soil: Well-drained loams/sands
                    </div>
                  </div>

                  {/* Feasible Card: Canola */}
                  <div className="p-4 bg-emerald-50/80 border-2 border-emerald-600 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-extrabold text-lg text-emerald-950 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" aria-hidden="true" />
                        <span>Canola (Oilseed)</span>
                      </div>
                      <span className="text-xs font-bold bg-emerald-800 text-white px-2.5 py-1 rounded-full uppercase tracking-wider">
                        FEASIBLE NEXT CROP
                      </span>
                    </div>
                    <p className="text-sm text-emerald-950 leading-relaxed">
                      Deep taproot conditions subsoil and breaks cereal root diseases. High market oil value.
                    </p>
                    <div className="text-xs text-emerald-900 font-medium">
                      Indicative Water Demand: ~400–600 mm · Soil: Loam to clay loam
                    </div>
                  </div>
                </div>
              </div>

              {/* Monoculture Cereal Warning if repeated cereal selected */}
              {(farmState.cropRotationList.includes('Bread Wheat') || farmState.cropRotationList.includes('Feed Barley')) && (
                <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-amber-950 text-sm space-y-1">
                  <div className="font-bold text-amber-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-800 shrink-0" aria-hidden="true" />
                    <span>Cereal Repetition Caution:</span>
                  </div>
                  <p>
                    Growing another cereal immediately after {farmState.cropRotationList[0]} elevates the risk of Take-all fungus (<em>Gaeumannomyces graminis</em>) and crown rot. Alternating with broadleaf crops (Chickpea or Canola) breaks disease carryover.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Disqualified or Caution Candidates */}
          {disqualifiedCandidates.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="text-sm font-bold uppercase tracking-wider text-charcoal-600">
                Disqualified or High-Risk Sequences:
              </div>
              <div className="space-y-2.5">
                {disqualifiedCandidates.map((dq) => (
                  <div
                    key={dq.candidateTitle}
                    className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl text-red-950 space-y-1 text-sm"
                  >
                    <div className="flex items-center justify-between font-bold text-red-900">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-700 shrink-0" aria-hidden="true" />
                        <span>{dq.candidateTitle}</span>
                      </div>
                      <span className="text-xs bg-red-800 text-white px-2 py-0.5 rounded-full font-bold">
                        DISQUALIFIED
                      </span>
                    </div>
                    <p className="text-red-900">{dq.reason}</p>
                    <div className="text-xs text-red-700 italic">
                      Agronomic Rule: {dq.disqualifyingRule} ({dq.citation})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Multi-Year Feasible Rotation Alternatives (Only when eligible) */}
          {areRecommendationsEligible && feasibleAlternatives.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="text-sm font-bold uppercase tracking-wider text-charcoal-600">
                Recommended Multi-Year Sequences:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feasibleAlternatives.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-5 bg-sand-50 border-2 border-forest-700 rounded-2xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-lg text-charcoal-900">
                        {plan.title}
                      </h4>
                      <span className="text-xs font-bold bg-forest-800 text-white px-2 py-0.5 rounded-full">
                        {plan.categoryTag}
                      </span>
                    </div>

                    {/* Step-by-step sequence progression */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-charcoal-600">Rotation Sequence:</div>
                      <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-charcoal-900">
                        {plan.cropSequence.map((crop, idx) => (
                          <React.Fragment key={`${plan.id}-${crop}-${idx}`}>
                            <span className="px-3 py-1.5 bg-white border border-sand-300 rounded-xl shadow-xs">
                              Yr {idx + 1}: {crop}
                            </span>
                            {idx < plan.cropSequence.length - 1 && (
                              <span className="text-forest-700 font-bold" aria-hidden="true">→</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-charcoal-700 leading-relaxed">
                      {plan.calendarDescription}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Export Action Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleDownloadReport}
              className="min-h-[48px] w-full sm:w-auto px-6 py-3 bg-forest-800 hover:bg-forest-900 text-white rounded-2xl text-base font-bold transition-colors flex items-center justify-center gap-2.5 shadow-sm focus-visible:ring-4 focus-visible:ring-forest-700"
            >
              <Download className="w-5 h-5 text-forest-200" aria-hidden="true" />
              <span>Download Crop Plan &amp; Evidence Report (JSON)</span>
            </button>
          </div>
        </div>

        {/* Details Section for Tool Card 4 */}
        <details className="mt-4 p-4 bg-sand-100 rounded-2xl border-2 border-sand-300">
          <summary className="font-bold text-base text-charcoal-900 cursor-pointer min-h-[48px] flex items-center justify-between">
            <span>Show full scientific rotation rules &amp; FAO citations</span>
            <ChevronDown className="w-5 h-5 text-charcoal-600" aria-hidden="true" />
          </summary>
          <div className="pt-3 space-y-3 text-xs sm:text-sm text-charcoal-800 border-t border-sand-300 mt-2">
            <div className="p-3 bg-white rounded-xl border border-sand-300 space-y-2">
              <div className="font-bold text-charcoal-900">Traceable Scientific Citations:</div>
              <ul className="list-disc list-inside space-y-1 text-xs text-charcoal-700">
                <li>
                  <strong>FAO GAEZ v5:</strong> Thermal ranges and base growing temperatures for temperate cereals and pulses.
                </li>
                <li>
                  <strong>FAO Irrigation &amp; Drainage Paper No. 33 &amp; 56:</strong> Crop water requirements and yield response to water deficits.
                </li>
                <li>
                  <strong>Extension Pathology Guides:</strong> 3-year mandatory break intervals between susceptible cereal phases to prevent take-all fungus (<em>Gaeumannomyces graminis</em>).
                </li>
              </ul>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-xs text-amber-950">
              <strong>Human Review Advisory:</strong> This software evaluates deterministic literature rules. Local cultivar varieties, seed availability, and local herbicide carryover must always be verified with a certified local agronomist.
            </div>
          </div>
        </details>
      </section>
    </div>
  );
};
