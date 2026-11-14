import React, { useState } from 'react';
import { Plus, X, Sprout, Building, MapPin, HelpCircle } from 'lucide-react';
import { FarmState, SoilType, IrrigationType, Coordinates, FarmerPriorities } from '../../types/farm';
import { CoordinateInput } from './CoordinateInput';
import { PriorityControls } from './PriorityControls';
import { FarmSummary } from './FarmSummary';
import { NasaWeatherPanel } from '../nasa/NasaWeatherPanel';
import { NasaPowerNormalizedPayload } from '../../types/nasaPower';

interface FarmFormProps {
  farmState: FarmState;
  onChange: (state: FarmState) => void;
  onReset: () => void;
  onContinueToExplorer: () => void;
  onNasaDataLoaded: (data: NasaPowerNormalizedPayload | null) => void;
}

export const FarmForm: React.FC<FarmFormProps> = ({
  farmState,
  onChange,
  onReset,
  onContinueToExplorer,
  onNasaDataLoaded,
}) => {
  const [cropInputText, setCropInputText] = useState('');
  const [showSoilHelp, setShowSoilHelp] = useState(false);
  const [showWaterHelp, setShowWaterHelp] = useState(false);

  const handleCoordinatesChange = (coords: Coordinates) => {
    onChange({
      ...farmState,
      coordinates: coords,
    });
  };

  const handlePrioritiesChange = (priorities: FarmerPriorities) => {
    onChange({
      ...farmState,
      priorities,
    });
  };

  const handleAddCrop = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = cropInputText.trim();
    if (!trimmed) return;
    onChange({
      ...farmState,
      cropRotationList: [...farmState.cropRotationList, trimmed],
    });
    setCropInputText('');
  };

  const handleRemoveCrop = (indexToRemove: number) => {
    onChange({
      ...farmState,
      cropRotationList: farmState.cropRotationList.filter((_, idx) => idx !== indexToRemove),
    });
  };

  return (
    <div className="space-y-10">
      {/* SECTION 1: Your farm */}
      <section aria-labelledby="section-your-farm" className="bg-white border border-sand-300 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <span className="text-xs sm:text-sm font-bold text-forest-800 uppercase tracking-wider">
            Step 1 of 3
          </span>
          <h2 id="section-your-farm" className="text-xl sm:text-2xl font-bold text-charcoal-900 mt-1 flex items-center gap-2.5">
            <Building className="w-6 h-6 text-forest-700 shrink-0" aria-hidden="true" />
            <span>Your farm</span>
          </h2>
          <p className="mt-1 text-sm sm:text-base text-charcoal-700 leading-relaxed">
            Name your farm or parcel and tell us where it is located. Universal Farm works for any location worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Farm Name */}
          <div>
            <label htmlFor="farm-name" className="block text-sm sm:text-base font-semibold text-charcoal-900 mb-1.5">
              Farm or Field Name <span className="text-charcoal-500 font-normal">(Optional)</span>
            </label>
            <input
              id="farm-name"
              type="text"
              value={farmState.farmName}
              onChange={(e) => onChange({ ...farmState, farmName: e.target.value })}
              placeholder="e.g. River Field or Plot 4"
              className="w-full min-h-[46px] px-4 py-2.5 text-base rounded-xl border border-sand-300 bg-white text-charcoal-900 focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:outline-none"
            />
            <p className="mt-1 text-xs sm:text-sm text-charcoal-600">
              For your own identification while using this tool.
            </p>
          </div>

          {/* Place Description (Prominent) */}
          <div>
            <label htmlFor="location-label" className="block text-sm sm:text-base font-semibold text-charcoal-900 mb-1.5">
              Where is your farm located? <span className="text-charcoal-500 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-charcoal-400 absolute left-3.5 top-3 pointer-events-none" aria-hidden="true" />
              <input
                id="location-label"
                type="text"
                value={farmState.locationLabel}
                onChange={(e) => onChange({ ...farmState, locationLabel: e.target.value })}
                placeholder="e.g. Near Wagga Wagga, NSW or Salina, Kansas"
                className="w-full min-h-[46px] pl-11 pr-4 py-2.5 text-base rounded-xl border border-sand-300 bg-white text-charcoal-900 focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:outline-none"
              />
            </div>
            <p className="mt-1 text-xs sm:text-sm text-charcoal-600">
              A typed place description helps you identify your farm in this prototype. It is not currently matched to satellite coordinates or sent anywhere.
            </p>
          </div>
        </div>

        {/* Expandable Manual Coordinates */}
        <div className="pt-2">
          <CoordinateInput
            coordinates={farmState.coordinates}
            onChange={handleCoordinatesChange}
          />
        </div>

        {/* Real NASA POWER Weather Integration Panel */}
        <div className="pt-4 border-t border-sand-200">
          <NasaWeatherPanel
            coordinates={farmState.coordinates}
            onSetCoordinates={handleCoordinatesChange}
            onDataLoaded={onNasaDataLoaded}
          />
        </div>
      </section>

      {/* SECTION 2: Your crops and water */}
      <section aria-labelledby="section-crops-water" className="bg-white border border-sand-300 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <span className="text-xs sm:text-sm font-bold text-forest-800 uppercase tracking-wider">
            Step 2 of 3
          </span>
          <h2 id="section-crops-water" className="text-xl sm:text-2xl font-bold text-charcoal-900 mt-1 flex items-center gap-2.5">
            <Sprout className="w-6 h-6 text-forest-700 shrink-0" aria-hidden="true" />
            <span>Your crops and water</span>
          </h2>
          <p className="mt-1 text-sm sm:text-base text-charcoal-700 leading-relaxed">
            <strong>What is crop rotation?</strong> The sequence of crops grown on the same field over time. Adding your current crops helps compare your baseline with demonstration plans.
          </p>
        </div>

        {/* Crop Rotation Input */}
        <div className="space-y-3 pt-2">
          <label htmlFor="crop-input" className="block text-sm sm:text-base font-semibold text-charcoal-900">
            Current crops grown on this field
          </label>
          <p className="text-xs sm:text-sm text-charcoal-600">
            Type each crop in the order you usually plant it, then click Add.
          </p>

          <form onSubmit={handleAddCrop} className="flex flex-col sm:flex-row gap-2.5">
            <input
              id="crop-input"
              type="text"
              value={cropInputText}
              onChange={(e) => setCropInputText(e.target.value)}
              placeholder="e.g. Wheat, Chickpeas, Sunflower, or Pasture"
              className="flex-1 min-h-[48px] px-4 py-2.5 text-base rounded-xl border border-sand-300 bg-white text-charcoal-900 focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:outline-none"
            />
            <button
              type="button"
              onClick={() => handleAddCrop()}
              className="min-h-[48px] px-5 py-2.5 bg-forest-800 text-white rounded-xl text-base font-semibold hover:bg-forest-900 transition-colors flex items-center justify-center gap-2 shrink-0 focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:outline-none"
            >
              <Plus className="w-5 h-5" aria-hidden="true" />
              <span>Add crop</span>
            </button>
          </form>

          {/* Crop Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {farmState.cropRotationList.map((crop, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-sand-200 border border-sand-300 text-charcoal-900 rounded-xl text-sm font-medium"
              >
                <span className="text-forest-800 font-bold font-mono text-xs">Crop {idx + 1}:</span>
                <span>{crop}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCrop(idx)}
                  className="hover:text-red-700 p-1 rounded-full hover:bg-sand-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500"
                  aria-label={`Remove ${crop}`}
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </span>
            ))}
            {farmState.cropRotationList.length === 0 && (
              <p className="text-sm text-charcoal-500 italic py-1">
                No crops added yet. You can still continue to explore demo options.
              </p>
            )}
          </div>
        </div>

        {/* Soil and Water available */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-sand-200">
          {/* Soil Type */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="soil-type" className="block text-sm sm:text-base font-semibold text-charcoal-900">
                Soil type
              </label>
              <button
                type="button"
                onClick={() => setShowSoilHelp(!showSoilHelp)}
                className="text-xs text-forest-800 hover:text-forest-950 underline font-medium flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-forest-700"
              >
                <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{showSoilHelp ? 'Hide explanation' : 'What does this mean?'}</span>
              </button>
            </div>

            <select
              id="soil-type"
              value={farmState.soilType}
              onChange={(e) => onChange({ ...farmState, soilType: e.target.value as SoilType })}
              className="w-full min-h-[48px] px-4 py-2.5 text-base rounded-xl border border-sand-300 bg-white text-charcoal-900 focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:outline-none"
            >
              <option value="unknown">Not sure / Unknown (Don&apos;t force a guess)</option>
              <option value="clay">Clay (heavy, holds water well, slow draining)</option>
              <option value="silt">Silt (smooth, easily eroded, medium moisture)</option>
              <option value="sand">Sandy (gritty, fast draining, dries quickly)</option>
              <option value="loam">Loam (balanced mix of sand, silt, and clay)</option>
              <option value="peat">Peat (dark, high organic matter)</option>
              <option value="chalk">Chalky / Alkaline (shallow, stony)</option>
              <option value="other">Other or mixed soil</option>
            </select>

            {showSoilHelp && (
              <div className="p-3 bg-sand-100 border border-sand-300 rounded-lg text-xs sm:text-sm text-charcoal-700 mt-2 space-y-1">
                <p>
                  <strong>Why we ask:</strong> Different soils hold water and nutrients differently. For example, sandy soils dry faster, while clay soils hold moisture longer.
                </p>
                <p>
                  If you are not sure or have not had a laboratory soil test, choose <strong>Not sure / Unknown</strong>. Universal Farm never guesses your soil.
                </p>
              </div>
            )}
          </div>

          {/* Water available for farming */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="irrigation-type" className="block text-sm sm:text-base font-semibold text-charcoal-900">
                Water available for farming
              </label>
              <button
                type="button"
                onClick={() => setShowWaterHelp(!showWaterHelp)}
                className="text-xs text-forest-800 hover:text-forest-950 underline font-medium flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-forest-700"
              >
                <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{showWaterHelp ? 'Hide explanation' : 'What does this mean?'}</span>
              </button>
            </div>

            <select
              id="irrigation-type"
              value={farmState.irrigationType}
              onChange={(e) => onChange({ ...farmState, irrigationType: e.target.value as IrrigationType })}
              className="w-full min-h-[48px] px-4 py-2.5 text-base rounded-xl border border-sand-300 bg-white text-charcoal-900 focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:outline-none"
            >
              <option value="unknown">Not sure / Unknown</option>
              <option value="rainfed">Rain only (No irrigation equipment)</option>
              <option value="drip">Drip irrigation (Pipes near root zone)</option>
              <option value="sprinkler">Sprinklers or center pivots</option>
              <option value="flood">Flood / Furrow irrigation</option>
              <option value="other">Other watering setup</option>
            </select>

            {showWaterHelp && (
              <div className="p-3 bg-sand-100 border border-sand-300 rounded-lg text-xs sm:text-sm text-charcoal-700 mt-2 space-y-1">
                <p>
                  <strong>Why we ask:</strong> If a field is rain-dependent, drought resilience is often a top concern. If irrigation is available, crops with higher water needs might be possible.
                </p>
                <p>
                  If you are not sure, choose <strong>Not sure / Unknown</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 3: What matters most? */}
      <section aria-labelledby="section-priorities" className="bg-white border border-sand-300 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <span className="text-xs sm:text-sm font-bold text-forest-800 uppercase tracking-wider">
            Step 3 of 3
          </span>
          <h2 id="section-priorities" className="text-xl sm:text-2xl font-bold text-charcoal-900 mt-1">
            What matters most?
          </h2>
        </div>

        <PriorityControls
          priorities={farmState.priorities}
          onChange={handlePrioritiesChange}
        />
      </section>

      {/* SECTION 4: Summary & Explore options */}
      <section aria-label="Review and continue">
        <FarmSummary
          farmState={farmState}
          onReset={onReset}
          onContinue={onContinueToExplorer}
        />
      </section>
    </div>
  );
};
