import React from 'react';
import {
  ShieldAlert,
  Database,
  AlertCircle,
  Layers,
  Radio,
  Satellite,
  Binary,
  CheckCircle2,
  CloudSun,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { IllustrativeChart } from './IllustrativeChart';
import { FarmState, validateCoordinates } from '../../types/farm';
import { NasaPowerNormalizedPayload } from '../../types/nasaPower';

interface EvidenceAndLimitationsProps {
  farmState: FarmState;
  nasaData?: NasaPowerNormalizedPayload | null;
}

export const EvidenceAndLimitations: React.FC<EvidenceAndLimitationsProps> = ({
  farmState,
  nasaData,
}) => {
  const coordVal = validateCoordinates(
    farmState.coordinates.latitude,
    farmState.coordinates.longitude
  );

  return (
    <div className="space-y-8">
      {/* Primary Status Banner */}
      <div className="bg-forest-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-forest-950">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {nasaData ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
                  <Badge variant="forest" size="md" className="bg-emerald-900 text-emerald-100 border-emerald-700 py-0.5 px-3">
                    NASA POWER: Connected ({nasaData.records.length} Daily Records Loaded)
                  </Badge>
                </>
              ) : (
                <>
                  <Radio className="w-4 h-4 text-amber-400 animate-pulse" aria-hidden="true" />
                  <Badge variant="amber" size="md" className="py-0.5 px-3">
                    System Status: NASA POWER Ready to Connect
                  </Badge>
                </>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Data Status & Scientific Integrity
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-forest-200 leading-relaxed max-w-3xl">
              Universal Farm enforces strict scientific honesty. A verified connection to the public NASA POWER Daily Point API provides real historical temperatures and rainfall for confirmed coordinates. Other satellite products and crop models remain unimplemented.
            </p>
          </div>

          <div className="shrink-0 text-right">
            <span className="inline-block px-3 py-1.5 bg-forest-800 text-forest-200 border border-forest-700 rounded-xl text-xs sm:text-sm font-mono">
              Active: NASA POWER Weather History
            </span>
          </div>
        </div>
      </div>

      {/* Real NASA POWER Loaded Overview (if available) */}
      {nasaData && (
        <div className="bg-emerald-50/80 border-2 border-emerald-300 rounded-2xl p-5 sm:p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <CloudSun className="w-6 h-6 text-emerald-800 shrink-0" aria-hidden="true" />
            <h3 className="text-base sm:text-lg font-bold text-emerald-950">
              Active Environmental Integration: NASA POWER Daily Point API
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm pt-1">
            <div className="p-3 bg-white rounded-xl border border-emerald-200">
              <span className="text-charcoal-500 block">Observed Period:</span>
              <span className="font-bold text-charcoal-900">
                {nasaData.metadata.requestedStartDate} to {nasaData.metadata.requestedEndDate} ({nasaData.records.length} days)
              </span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-emerald-200">
              <span className="text-charcoal-500 block">Atmospheric Sources:</span>
              <span className="font-bold text-charcoal-900">{nasaData.metadata.sources.join(', ')}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-emerald-200">
              <span className="text-charcoal-500 block">Time Standard:</span>
              <span className="font-bold text-charcoal-900">
                {nasaData.metadata.timeStandard} (Local Solar Time)
              </span>
            </div>
          </div>
          <p className="text-xs text-emerald-900 leading-relaxed">
            Variables retrieved: <strong>T2M</strong> (daily mean air temperature at 2m), <strong>T2M_MAX</strong> (maximum), <strong>T2M_MIN</strong> (minimum), and <strong>PRECTOTCORR</strong> (corrected daily precipitation).
          </p>
        </div>
      )}

      {/* 4-way Separation of Data Categories */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-charcoal-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-forest-700" aria-hidden="true" />
            <span>Information Provenance Separation</span>
          </h3>
          <p className="text-sm sm:text-base text-charcoal-700 mt-1">
            To prevent confusing simulated models with real evidence, all data in Universal Farm is divided into four transparent categories:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          {/* 1. Farmer-Entered Information */}
          <div className="bg-white border border-sand-300 rounded-2xl p-5 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-base sm:text-lg text-charcoal-900 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-forest-600 inline-block" />
                1. What You Entered
              </span>
              <Badge variant="forest" size="sm">Your Input</Badge>
            </div>
            <p className="text-sm text-charcoal-700 leading-relaxed">
              Details entered directly by you (farm identifier, place description, numeric coordinates, crop sequence, soil type, watering setup, and goal priorities).
            </p>
            <div className="text-xs sm:text-sm p-3 bg-sand-50 rounded-xl border border-sand-200 text-charcoal-700">
              <strong>Status:</strong>{' '}
              {coordVal.isValid
                ? `Coordinates defined (${coordVal.parsedLat}°, ${coordVal.parsedLon}°); ${farmState.cropRotationList.length} crop phase(s).`
                : 'No coordinates entered yet; browsing in demo mode.'}
            </div>
          </div>

          {/* 2. Real NASA POWER vs Demonstration Samples */}
          <div className="bg-white border border-sand-300 rounded-2xl p-5 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-base sm:text-lg text-charcoal-900 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
                2. Real NASA Weather vs Demo Plans
              </span>
              <Badge variant="forest" size="sm">Real + Demo</Badge>
            </div>
            <p className="text-sm text-charcoal-700 leading-relaxed">
              Historical weather (T2M, PRECTOTCORR) is real NASA POWER data when loaded in Step 1. In contrast, the crop rotation alternative scenarios (Alternative A and B) remain qualitative demonstration templates.
            </p>
            <div className="text-xs sm:text-sm p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950">
              <strong>Distinction:</strong> NASA POWER data changes with your coordinates. Crop plan cards do <em>not</em> claim to be automated location recommendations.
            </div>
          </div>

          {/* 3. Future Satellite Data Needs */}
          <div className="bg-white border border-sand-300 rounded-2xl p-5 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-base sm:text-lg text-charcoal-900 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-accent-blue-600 inline-block" />
                3. Future Satellite Products (Unimplemented)
              </span>
              <Badge variant="blue" size="sm">Planned Later</Badge>
            </div>
            <p className="text-sm text-charcoal-700 leading-relaxed">
              NASA POWER weather data is active. Additional Earth observation datasets—such as NASA SMAP soil moisture, GPM IMERG precipitation radar, and MODIS/VIIRS vegetation indexes—remain unimplemented.
            </p>
            <div className="text-xs sm:text-sm p-3 bg-sand-50 rounded-xl border border-sand-200 text-charcoal-700">
              <strong>Connection Status:</strong> 1 active connection (NASA POWER). 0 connections for SMAP/GPM.
            </div>
          </div>

          {/* 4. Unimplemented Calculations */}
          <div className="bg-white border border-sand-300 rounded-2xl p-5 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-base sm:text-lg text-charcoal-900 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-charcoal-400 inline-block" />
                4. Unimplemented Calculations
              </span>
              <Badge variant="neutral" size="sm">No Fake Models</Badge>
            </div>
            <p className="text-sm text-charcoal-700 leading-relaxed">
              Weather history alone is not an agricultural recommendation engine. Universal Farm does not calculate yield predictions, profit forecasts, or soil-health scores from historical weather alone.
            </p>
            <div className="text-xs sm:text-sm p-3 bg-sand-50 rounded-xl border border-sand-200 text-charcoal-700">
              <strong>Honesty Guarantee:</strong> No fake prediction or fabricated probability score is output anywhere in this application.
            </div>
          </div>
        </div>
      </div>

      {/* Illustrative Demonstration Chart (with explicit caption) */}
      <div className="space-y-2">
        <div className="text-xs sm:text-sm font-semibold text-charcoal-700">
          Illustrative UI Demonstration Fixture (Not location-specific observations):
        </div>
        <IllustrativeChart />
      </div>

      {/* Agronomic Realities Section */}
      <div className="bg-white border border-sand-300 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
        <h3 className="text-lg sm:text-xl font-bold text-charcoal-900 flex items-center gap-2">
          <Satellite className="w-5 h-5 text-forest-700" aria-hidden="true" />
          <span>Understanding Agricultural Reality & Environmental Data</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm text-charcoal-700">
          <div className="p-4 bg-sand-50 border border-sand-200 rounded-xl space-y-2">
            <h4 className="font-bold text-charcoal-900 text-base flex items-center gap-2">
              <Binary className="w-4 h-4 text-forest-700" aria-hidden="true" />
              <span>Gridded Estimates vs On-Farm Soil Tests</span>
            </h4>
            <p className="leading-relaxed">
              NASA POWER provides gridded assimilation estimates (~0.5° latitude by 0.625° longitude). While valuable for regional climate trends, they cannot replace physical soil tests, spade depth checks, or localized soil chemistry (pH, compaction, salinity).
            </p>
          </div>

          <div className="p-4 bg-sand-50 border border-sand-200 rounded-xl space-y-2">
            <h4 className="font-bold text-charcoal-900 text-base flex items-center gap-2">
              <Database className="w-4 h-4 text-forest-700" aria-hidden="true" />
              <span>Past Records are Not Weather Forecasts</span>
            </h4>
            <p className="leading-relaxed">
              Historical weather records show past seasonal temperatures and precipitation. They are not meteorological forecasts for the upcoming planting season and cannot predict singular extreme convective storms or untimely frost events.
            </p>
          </div>

          <div className="p-4 bg-sand-50 border border-sand-200 rounded-xl space-y-2">
            <h4 className="font-bold text-charcoal-900 text-base flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-forest-700" aria-hidden="true" />
              <span>Worldwide Agro-Ecological Divergence</span>
            </h4>
            <p className="leading-relaxed">
              Growing seasons, pest cycles, and crop tolerances differ fundamentally across agro-ecological zones. Worldwide coordinate support must not be confused with universal agricultural recommendations.
            </p>
          </div>

          <div className="p-4 bg-sand-50 border border-sand-200 rounded-xl space-y-2">
            <h4 className="font-bold text-charcoal-900 text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-forest-700" aria-hidden="true" />
              <span>Supporting Local Agricultural Knowledge</span>
            </h4>
            <p className="leading-relaxed">
              Universal Farm is designed to support conversations between farmers and local agronomists, extension officers, and cooperatives—never to replace their local expertise.
            </p>
          </div>
        </div>
      </div>

      {/* Safety & Challenge Statement */}
      <div className="p-5 bg-sand-200/50 border border-sand-300 rounded-2xl flex items-start gap-3.5 text-sm text-charcoal-700">
        <ShieldAlert className="w-6 h-6 text-forest-800 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="leading-relaxed">
          <strong className="text-charcoal-900 font-semibold">Challenge Scope Statement:</strong>{' '}
          This software is developed independently for the NASA Space Apps Challenge “Field Shift”. It carries no official endorsement from NASA or any government agency. Real farming decisions require on-site ground inspection, professional soil laboratory analysis, and local agricultural expertise.
        </div>
      </div>
    </div>
  );
};
