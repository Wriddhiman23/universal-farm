import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, Compass, Info, Map as MapIcon, Edit3 } from 'lucide-react';
import { Coordinates, validateCoordinates } from '../../types/farm';
import { MapPointPicker } from '../map/MapPointPicker';

interface CoordinateInputProps {
  coordinates: Coordinates;
  onChange: (coords: Coordinates) => void;
}

export const CoordinateInput: React.FC<CoordinateInputProps> = ({
  coordinates,
  onChange,
}) => {
  const hasExistingValues = Boolean(coordinates.latitude.trim() || coordinates.longitude.trim());
  const [isOpen, setIsOpen] = useState(hasExistingValues);
  const [inputMode, setInputMode] = useState<'map' | 'manual'>('map');

  const validation = validateCoordinates(coordinates.latitude, coordinates.longitude);

  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...coordinates,
      latitude: e.target.value,
    });
  };

  const handleLonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...coordinates,
      longitude: e.target.value,
    });
  };

  return (
    <div className="border border-sand-300 rounded-2xl bg-sand-50/70 p-4 sm:p-6 space-y-4">
      {/* Header with expand toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="coordinates-section"
        className="w-full flex items-center justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 rounded-xl p-1.5 -m-1.5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest-100 border border-forest-300 flex items-center justify-center text-forest-800 shrink-0">
            <Compass className="w-5 h-5 text-forest-700" aria-hidden="true" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold text-charcoal-900 block">
              Farm location on map or coordinates
            </span>
            <span className="text-xs sm:text-sm text-charcoal-600 block">
              {validation.isValid
                ? `Location point set: ${validation.parsedLat?.toFixed(3)}°, ${validation.parsedLon?.toFixed(3)}°`
                : 'Click to select your field on an interactive map or type coordinates.'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-forest-800 hidden sm:inline">
            {isOpen ? 'Collapse location selector' : '+ Select location'}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-charcoal-600 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-forest-800' : ''
            }`}
            aria-hidden="true"
          />
        </div>
      </button>

      {/* Expandable coordinate selection tools */}
      {isOpen && (
        <div id="coordinates-section" className="space-y-5 pt-4 border-t border-sand-200">
          {/* Mode Switcher: Interactive Map vs Manual Numbers */}
          <div className="flex items-center justify-between border-b border-sand-200 pb-3">
            <span className="text-xs sm:text-sm font-semibold text-charcoal-800">
              Choose location method:
            </span>
            <div className="flex items-center gap-1 bg-sand-200 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setInputMode('map')}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  inputMode === 'map'
                    ? 'bg-white text-forest-900 shadow-xs'
                    : 'text-charcoal-700 hover:text-charcoal-900'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5 text-forest-700" aria-hidden="true" />
                <span>Interactive Map</span>
              </button>
              <button
                type="button"
                onClick={() => setInputMode('manual')}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  inputMode === 'manual'
                    ? 'bg-white text-forest-900 shadow-xs'
                    : 'text-charcoal-700 hover:text-charcoal-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5 text-forest-700" aria-hidden="true" />
                <span>Type Coordinates</span>
              </button>
            </div>
          </div>

          {/* Mode 1: Interactive Map Picker */}
          {inputMode === 'map' && (
            <MapPointPicker
              coordinates={coordinates}
              onChange={onChange}
            />
          )}

          {/* Mode 2: Manual Numbers */}
          {inputMode === 'manual' && (
            <div className="space-y-4 pt-1">
              <p className="text-sm text-charcoal-700 leading-relaxed">
                Type exact geographic coordinates for any location worldwide. Universal Farm accepts negative numbers for southern/western locations and zero at the equator.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Latitude Field */}
                <div>
                  <label htmlFor="latitude-input" className="block text-sm font-semibold text-charcoal-800 mb-1.5">
                    Latitude (°N / °S)
                  </label>
                  <input
                    id="latitude-input"
                    type="text"
                    inputMode="decimal"
                    value={coordinates.latitude}
                    onChange={handleLatChange}
                    placeholder="e.g. -33.8688 or 45.0000"
                    aria-describedby="latitude-error lat-lon-caveat"
                    aria-invalid={Boolean(validation.latitudeError)}
                    className={`w-full min-h-[46px] px-4 py-2.5 text-base rounded-xl border bg-white text-charcoal-900 transition-colors focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:outline-none ${
                      validation.latitudeError
                        ? 'border-red-500 focus:border-red-600 ring-1 ring-red-400'
                        : coordinates.latitude.trim() && !validation.latitudeError
                        ? 'border-forest-600 focus:border-forest-700'
                        : 'border-sand-300 focus:border-forest-700'
                    }`}
                  />
                  {validation.latitudeError && (
                    <p id="latitude-error" className="mt-1.5 text-xs sm:text-sm text-red-700 font-medium flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" aria-hidden="true" />
                      <span>{validation.latitudeError}</span>
                    </p>
                  )}
                </div>

                {/* Longitude Field */}
                <div>
                  <label htmlFor="longitude-input" className="block text-sm font-semibold text-charcoal-800 mb-1.5">
                    Longitude (°E / °W)
                  </label>
                  <input
                    id="longitude-input"
                    type="text"
                    inputMode="decimal"
                    value={coordinates.longitude}
                    onChange={handleLonChange}
                    placeholder="e.g. 151.2093 or 10.0000"
                    aria-describedby="longitude-error lat-lon-caveat"
                    aria-invalid={Boolean(validation.longitudeError)}
                    className={`w-full min-h-[46px] px-4 py-2.5 text-base rounded-xl border bg-white text-charcoal-900 transition-colors focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:outline-none ${
                      validation.longitudeError
                        ? 'border-red-500 focus:border-red-600 ring-1 ring-red-400'
                        : coordinates.longitude.trim() && !validation.longitudeError
                        ? 'border-forest-600 focus:border-forest-700'
                        : 'border-sand-300 focus:border-forest-700'
                    }`}
                  />
                  {validation.longitudeError && (
                    <p id="longitude-error" className="mt-1.5 text-xs sm:text-sm text-red-700 font-medium flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" aria-hidden="true" />
                      <span>{validation.longitudeError}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Validation Feedback */}
          {validation.isValid ? (
            <div className="p-3 bg-forest-100/80 border border-forest-300 rounded-xl flex items-start gap-2.5 text-sm text-forest-950">
              <CheckCircle2 className="w-5 h-5 text-forest-700 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="font-semibold">Evaluated point location:</span>{' '}
                {validation.parsedLat?.toFixed(4)}°, {validation.parsedLon?.toFixed(4)}°
              </div>
            </div>
          ) : null}

          {/* Geographic Disclaimer */}
          <div
            id="lat-lon-caveat"
            className="p-3.5 bg-white border border-sand-300 rounded-xl flex items-start gap-2.5 text-xs sm:text-sm text-charcoal-700"
          >
            <Info className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="leading-relaxed">
              <strong className="text-charcoal-900 font-semibold">Location distinction:</strong> An evaluated point identifies a geographical coordinate. It does not represent a surveyed field boundary, establish crop-suitability coverage, or imply that local agronomic recommendations are universally available for that point.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
