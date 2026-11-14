import React from 'react';
import { RotateCcw, ArrowRight, Check, FileText, MapPin, Layers, Droplet, UserCheck, AlertCircle } from 'lucide-react';
import { FarmState, validateCoordinates } from '../../types/farm';

interface FarmSummaryProps {
  farmState: FarmState;
  onReset: () => void;
  onContinue: () => void;
}

export const FarmSummary: React.FC<FarmSummaryProps> = ({
  farmState,
  onReset,
  onContinue,
}) => {
  const coordVal = validateCoordinates(
    farmState.coordinates.latitude,
    farmState.coordinates.longitude
  );

  const soilLabels: Record<string, string> = {
    unknown: 'Not sure / Unknown',
    clay: 'Clay soil',
    silt: 'Silt soil',
    sand: 'Sandy soil',
    loam: 'Loam (balanced)',
    peat: 'Peat soil',
    chalk: 'Chalky / Alkaline soil',
    other: 'Other / Mixed soil',
  };

  const irrigationLabels: Record<string, string> = {
    unknown: 'Not sure / Unknown',
    rainfed: 'Rain only (Rainfed)',
    drip: 'Drip irrigation',
    sprinkler: 'Sprinklers',
    flood: 'Flood / Furrow',
    other: 'Other watering method',
  };

  const getPrioritySummaryText = () => {
    if (farmState.priorities.mainPriority === 'balanced') {
      return 'Balanced approach across water, soil, and markets';
    }
    const map = {
      water: 'Save water (Main focus)',
      soil: 'Improve soil condition (Main focus)',
      market: 'Explore crops with suitable markets (Main focus)',
    };
    const mainText = map[farmState.priorities.mainPriority];
    if (farmState.priorities.additionalPriorities.length > 0) {
      const additionalTitles = farmState.priorities.additionalPriorities.map((p) => {
        if (p === 'water') return 'Water';
        if (p === 'soil') return 'Soil';
        return 'Markets';
      });
      return `${mainText} + also reviewing ${additionalTitles.join(', ')}`;
    }
    return mainText;
  };

  return (
    <div className="bg-sand-50 border-2 border-sand-300 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sand-300 pb-4">
        <div className="flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-forest-800 shrink-0" aria-hidden="true" />
          <h3 className="text-base sm:text-lg font-bold text-charcoal-900">
            Summary of your entered farm details
          </h3>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-lg border border-red-300 bg-white text-sm font-semibold text-red-700 hover:bg-red-50 hover:border-red-400 transition-colors focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:outline-none"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          <span>Start over / Reset</span>
        </button>
      </div>

      {/* Grid of Entered Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        {/* Farm & Location Description */}
        <div className="p-4 bg-white border border-sand-200 rounded-xl space-y-1.5">
          <div className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
            Your Farm Identification
          </div>
          <div className="font-bold text-charcoal-900 text-base">
            {farmState.farmName.trim() || <span className="text-charcoal-400 font-normal">Farm name not specified</span>}
          </div>
          <div className="text-charcoal-700 flex items-center gap-1.5 text-sm">
            <MapPin className="w-4 h-4 text-charcoal-400 shrink-0" aria-hidden="true" />
            <span>{farmState.locationLabel.trim() || 'No town/region description entered'}</span>
          </div>
        </div>

        {/* Location Coordinates Status */}
        <div className="p-4 bg-white border border-sand-200 rounded-xl space-y-1.5">
          <div className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
            Location Coordinates
          </div>
          {coordVal.isValid ? (
            <div>
              <div className="font-bold text-forest-900 text-base flex items-center gap-1.5">
                <Check className="w-4 h-4 text-forest-700" aria-hidden="true" />
                <span>
                  {coordVal.parsedLat?.toFixed(3)}° Lat, {coordVal.parsedLon?.toFixed(3)}° Lon
                </span>
              </div>
              <p className="text-xs text-charcoal-600 mt-0.5">
                Coordinates confirmed for weather history and rotation assessment.
              </p>
            </div>
          ) : (
            <div>
              <div className="text-sm font-medium text-charcoal-800 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-charcoal-500" aria-hidden="true" />
                <span>No coordinates entered</span>
              </div>
              <p className="text-xs text-charcoal-600 mt-0.5">
                You can still explore all demo crop plans without typing coordinates.
              </p>
            </div>
          )}
        </div>

        {/* Soil & Water details */}
        <div className="p-4 bg-white border border-sand-200 rounded-xl space-y-1.5">
          <div className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-charcoal-400" aria-hidden="true" />
            <span>Soil & Water Available</span>
          </div>
          <div className="text-charcoal-800">
            <span className="font-medium text-charcoal-600">Soil:</span> {soilLabels[farmState.soilType]}
          </div>
          <div className="text-charcoal-800 flex items-center gap-1">
            <Droplet className="w-3.5 h-3.5 text-accent-blue-600 shrink-0" aria-hidden="true" />
            <span>
              <span className="font-medium text-charcoal-600">Water:</span> {irrigationLabels[farmState.irrigationType]}
            </span>
          </div>
        </div>

        {/* Selected Priorities */}
        <div className="p-4 bg-white border border-sand-200 rounded-xl space-y-1.5">
          <div className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-forest-700" aria-hidden="true" />
            <span>Your Focus For Review</span>
          </div>
          <div className="font-semibold text-forest-950 text-sm">
            {getPrioritySummaryText()}
          </div>
          <p className="text-xs text-charcoal-600">
            Used to organize comparison checklists in the next tab.
          </p>
        </div>
      </div>

      {/* Current rotation sequence */}
      <div className="p-4 bg-white border border-sand-200 rounded-xl space-y-2 text-sm">
        <div className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
          Current Crops on this Field:
        </div>
        {farmState.cropRotationList.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {farmState.cropRotationList.map((crop, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-forest-50 border border-forest-200 text-forest-950 rounded-lg font-medium text-sm"
              >
                <span className="text-xs text-forest-700 font-mono font-bold">Crop {idx + 1}:</span>
                <span>{crop}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-charcoal-600 italic">
            No crops entered yet. You can add them above or proceed to explore demo options.
          </p>
        )}
      </div>

      {/* Continue Action Button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-charcoal-600 text-center sm:text-left">
          All details stay strictly on your device. Nothing is sent to external servers.
        </p>
        <button
          type="button"
          onClick={onContinue}
          className="w-full sm:w-auto min-h-[48px] px-6 py-3 bg-forest-800 text-white rounded-xl text-base font-bold hover:bg-forest-900 transition-colors shadow-sm flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:outline-none"
        >
          <span>Continue to crop plans</span>
          <ArrowRight className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
