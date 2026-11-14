import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, ZoomIn, ZoomOut, Compass, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, AlertCircle, Check, Info } from 'lucide-react';
import { Coordinates, validateCoordinates } from '../../types/farm';

interface MapPointPickerProps {
  coordinates: Coordinates;
  onChange: (coords: Coordinates) => void;
}

export const MapPointPicker: React.FC<MapPointPickerProps> = ({
  coordinates,
  onChange,
}) => {
  const coordVal = validateCoordinates(coordinates.latitude, coordinates.longitude);

  // Map state (zoom level 1 to 14, center lat/lon)
  const initialLat = coordVal.isValid && coordVal.parsedLat !== null ? coordVal.parsedLat : 35.0;
  const initialLon = coordVal.isValid && coordVal.parsedLon !== null ? coordVal.parsedLon : 10.0;
  const initialZoom = coordVal.isValid ? 6 : 3;

  const [center, setCenter] = useState<{ lat: number; lon: number }>({ lat: initialLat, lon: initialLon });
  const [zoom, setZoom] = useState<number>(initialZoom);
  const [devicePrompt, setDevicePrompt] = useState<{ lat: number; lon: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Synchronize center if coordinates change externally
  useEffect(() => {
    if (coordVal.isValid && coordVal.parsedLat !== null && coordVal.parsedLon !== null) {
      setCenter({ lat: coordVal.parsedLat, lon: coordVal.parsedLon });
    }
  }, [coordinates.latitude, coordinates.longitude, coordVal.isValid, coordVal.parsedLat, coordVal.parsedLon]);

  // Convert lat/lon to OpenStreetMap tile numbers
  const lon2tile = (lon: number, z: number) => Math.floor(((lon + 180) / 360) * Math.pow(2, z));
  const lat2tile = (lat: number, z: number) => {
    const latRad = (lat * Math.PI) / 180;
    return Math.floor(
      ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * Math.pow(2, z)
    );
  };

  // Convert tile pixel to lat/lon
  const tile2lon = (x: number, z: number) => (x / Math.pow(2, z)) * 360 - 180;
  const tile2lat = (y: number, z: number) => {
    const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
    return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  };

  const centerTileX = lon2tile(center.lon, zoom);
  const centerTileY = lat2tile(center.lat, zoom);
  const maxTile = Math.pow(2, zoom);

  // Generate 3x3 grid of surrounding tiles
  const tiles: Array<{ x: number; y: number; relX: number; relY: number }> = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const tx = (centerTileX + dx + maxTile) % maxTile;
      const ty = centerTileY + dy;
      if (ty >= 0 && ty < maxTile) {
        tiles.push({ x: tx, y: ty, relX: dx, relY: dy });
      }
    }
  }

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left - rect.width / 2;
    const clickY = e.clientY - rect.top - rect.height / 2;

    // Approximate lat/lon offset based on zoom level and 256px tile size
    const pixelsPerTile = 256;
    const currentTileX = (center.lon + 180) / 360 * Math.pow(2, zoom);
    const latRad = (center.lat * Math.PI) / 180;
    const currentTileY = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * Math.pow(2, zoom);

    const targetTileX = currentTileX + clickX / pixelsPerTile;
    const targetTileY = currentTileY + clickY / pixelsPerTile;

    const newLon = Number(tile2lon(targetTileX, zoom).toFixed(4));
    const newLat = Number(tile2lat(targetTileY, zoom).toFixed(4));

    if (newLat >= -90 && newLat <= 90 && newLon >= -180 && newLon <= 180) {
      onChange({
        latitude: newLat.toString(),
        longitude: newLon.toString(),
      });
      setCenter({ lat: newLat, lon: newLon });
    }
  };

  const handlePan = (dLat: number, dLon: number) => {
    const factor = 180 / Math.pow(2, zoom);
    setCenter((prev) => ({
      lat: Math.max(-85, Math.min(85, prev.lat + dLat * factor * 0.4)),
      lon: Math.max(-180, Math.min(180, prev.lon + dLon * factor * 0.4)),
    }));
  };

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.max(2, Math.min(13, prev + delta)));
  };

  const handleRequestDeviceLocation = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lon = Number(pos.coords.longitude.toFixed(4));
        // Prompt for explicit confirmation asking if this device position is the farm
        setDevicePrompt({ lat, lon });
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('Location request declined. You can type coordinates or click on the map.');
        } else {
          setGeoError(`Unable to obtain location (${err.message}).`);
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleConfirmDeviceLocation = (confirmed: boolean) => {
    if (confirmed && devicePrompt) {
      onChange({
        latitude: devicePrompt.lat.toString(),
        longitude: devicePrompt.lon.toString(),
      });
      setCenter({ lat: devicePrompt.lat, lon: devicePrompt.lon });
      setZoom(8);
    }
    setDevicePrompt(null);
  };

  return (
    <div className="space-y-4">
      {/* Map Header & Device Location Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs sm:text-sm font-semibold text-charcoal-900 flex items-center gap-2">
            <Compass className="w-4 h-4 text-forest-700" aria-hidden="true" />
            <span>Interactive Map Point Picker</span>
          </span>
          <p className="text-xs text-charcoal-600 mt-0.5">
            Click or tap anywhere on the map to place your farm evaluation point.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRequestDeviceLocation}
          disabled={isLocating}
          className="self-start sm:self-auto min-h-[44px] px-3.5 py-2 text-xs font-semibold rounded-xl border border-forest-600 text-forest-900 bg-forest-50 hover:bg-forest-100 transition-colors flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-forest-700"
        >
          <Navigation className={`w-4 h-4 text-forest-700 ${isLocating ? 'animate-spin' : ''}`} aria-hidden="true" />
          <span>{isLocating ? 'Locating device...' : 'Use my device location'}</span>
        </button>
      </div>

      {/* Device Position Confirmation Modal / Alert */}
      {devicePrompt && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-3 text-sm text-charcoal-900">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <strong className="block font-bold text-amber-950">
                Confirm your farm location
              </strong>
              <p className="mt-1 leading-relaxed">
                Your device reported coordinates: <strong>{devicePrompt.lat}° Lat, {devicePrompt.lon}° Lon</strong>.
                Is this device currently located at or near your farm?
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => handleConfirmDeviceLocation(true)}
              className="min-h-[44px] px-4 py-2 bg-forest-800 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-forest-900 transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-forest-700"
            >
              <Check className="w-4 h-4" aria-hidden="true" />
              <span>Yes, set as farm location</span>
            </button>
            <button
              type="button"
              onClick={() => handleConfirmDeviceLocation(false)}
              className="min-h-[44px] px-4 py-2 bg-white border border-sand-300 text-charcoal-700 rounded-xl text-xs sm:text-sm font-medium hover:bg-sand-100 transition-colors"
            >
              Cancel / I am elsewhere
            </button>
          </div>
        </div>
      )}

      {geoError && (
        <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
          {geoError}
        </p>
      )}

      {/* Map Tile Display Area */}
      <div className="relative border-2 border-sand-300 rounded-2xl overflow-hidden bg-sand-200 shadow-inner">
        <div
          ref={containerRef}
          onClick={handleMapClick}
          className="w-full h-72 sm:h-80 cursor-crosshair relative overflow-hidden select-none"
          role="region"
          aria-label="Map showing farm location point. Click to place coordinates."
          tabIndex={0}
        >
          {/* Centered Tile Container */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-[768px] h-[768px]">
              {tiles.map((t) => (
                <img
                  key={`${zoom}-${t.x}-${t.y}`}
                  src={`https://tile.openstreetmap.org/${zoom}/${t.x}/${t.y}.png`}
                  alt=""
                  loading="lazy"
                  className="absolute w-64 h-64 pointer-events-none"
                  style={{
                    left: `${(t.relX + 1) * 256}px`,
                    top: `${(t.relY + 1) * 256}px`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Marker Pin at Selected Location */}
          {coordVal.isValid && coordVal.parsedLat !== null && coordVal.parsedLon !== null && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="flex flex-col items-center -translate-y-5 animate-bounce">
                <div className="w-9 h-9 rounded-full bg-forest-800 text-white flex items-center justify-center shadow-lg border-2 border-white">
                  <MapPin className="w-5 h-5 text-amber-300" aria-hidden="true" />
                </div>
                <div className="w-2.5 h-1 bg-charcoal-800/40 rounded-full blur-2xs mt-0.5" />
              </div>
            </div>
          )}

          {/* Map Controls Overlay (Pan & Zoom) */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-auto">
            <div className="bg-white/95 backdrop-blur-xs rounded-xl shadow-md border border-sand-300 p-1 flex flex-col gap-1">
              <button
                type="button"
                onClick={() => handleZoom(1)}
                className="w-9 h-9 flex items-center justify-center hover:bg-sand-100 rounded-lg text-charcoal-800 focus-visible:ring-2 focus-visible:ring-forest-700"
                aria-label="Zoom in map"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleZoom(-1)}
                className="w-9 h-9 flex items-center justify-center hover:bg-sand-100 rounded-lg text-charcoal-800 focus-visible:ring-2 focus-visible:ring-forest-700"
                aria-label="Zoom out map"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>

            {/* D-Pad Pan Controls */}
            <div className="bg-white/95 backdrop-blur-xs rounded-xl shadow-md border border-sand-300 p-1 grid grid-cols-3 gap-0.5">
              <div />
              <button
                type="button"
                onClick={() => handlePan(1, 0)}
                className="w-8 h-8 flex items-center justify-center hover:bg-sand-100 rounded text-charcoal-700"
                aria-label="Pan map north"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <div />
              <button
                type="button"
                onClick={() => handlePan(0, -1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-sand-100 rounded text-charcoal-700"
                aria-label="Pan map west"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <div className="w-8 h-8 flex items-center justify-center text-[10px] text-charcoal-400 font-mono">
                z{zoom}
              </div>
              <button
                type="button"
                onClick={() => handlePan(0, 1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-sand-100 rounded text-charcoal-700"
                aria-label="Pan map east"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <div />
              <button
                type="button"
                onClick={() => handlePan(-1, 0)}
                className="w-8 h-8 flex items-center justify-center hover:bg-sand-100 rounded text-charcoal-700"
                aria-label="Pan map south"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <div />
            </div>
          </div>

          {/* Coordinate Readout Badge Overlay */}
          <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl shadow-md border border-sand-300 text-xs font-mono text-charcoal-800">
            {coordVal.isValid && coordVal.parsedLat !== null && coordVal.parsedLon !== null ? (
              <span className="font-semibold text-forest-900">
                {coordVal.parsedLat.toFixed(4)}°, {coordVal.parsedLon.toFixed(4)}°
              </span>
            ) : (
              <span className="text-charcoal-500 italic">Click map to set point</span>
            )}
          </div>

          {/* OpenStreetMap Attribution Bar (Mandatory) */}
          <div className="absolute bottom-0 inset-x-0 bg-white/90 backdrop-blur-xs px-3 py-1 text-[11px] text-charcoal-600 border-t border-sand-300 flex flex-wrap items-center justify-between gap-2 z-20">
            <div>
              Map data &copy;{' '}
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-charcoal-900"
              >
                OpenStreetMap contributors
              </a>
            </div>
            <div className="hidden sm:inline text-charcoal-500">
              Point picker representation only; does not establish a surveyed field boundary.
            </div>
          </div>
        </div>
      </div>

      {/* Provider Privacy Disclosure */}
      <div className="p-3 bg-sand-50 border border-sand-300 rounded-xl text-xs text-charcoal-600 flex items-start gap-2">
        <Info className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="leading-relaxed">
          <strong>Map tile data transfer notice:</strong> Browsing this map fetches geographic map tiles directly from OpenStreetMap servers in accordance with the OSM Tile Usage Policy. Only the standard map tile coordinates (zoom level and tile indices: z, x, y) are requested from OSM.
        </p>
      </div>
    </div>
  );
};
