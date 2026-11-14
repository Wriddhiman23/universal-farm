import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { NasaPowerNormalizedPayload } from '../../types/nasaPower';

interface BannerProps {
  nasaData?: NasaPowerNormalizedPayload | null;
}

export const Banner: React.FC<BannerProps> = ({ nasaData }) => {
  return (
    <aside
      aria-label="Prototype status warning"
      className={`${
        nasaData
          ? 'bg-emerald-50 border-b border-emerald-300 text-charcoal-900'
          : 'bg-amber-100 border-b border-amber-300 text-charcoal-900'
      } px-4 py-2.5 transition-colors`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm sm:text-base">
        <div className="flex items-center gap-2.5 font-medium">
          {nasaData ? (
            <>
              <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0" aria-hidden="true" />
              <p className="leading-snug">
                <strong className="font-semibold text-emerald-950">
                  NASA POWER Weather Active:
                </strong>{' '}
                <span className="text-charcoal-800">
                  Historical weather observations loaded for {nasaData.metadata.requestedStartDate} to {nasaData.metadata.requestedEndDate}. Crop rotation feasibility evaluated with Evidence Pack 1.
                </span>
              </p>
            </>
          ) : (
            <>
              <AlertTriangle className="w-5 h-5 text-amber-800 shrink-0" aria-hidden="true" />
              <p className="leading-snug">
                <strong className="font-semibold text-amber-950">
                  Prototype for demonstration — Not for farming decisions.
                </strong>{' '}
                <span className="text-charcoal-800">
                  Connect real NASA POWER weather history in Step 1 or browse demonstration crop plans.
                </span>
              </p>
            </>
          )}
        </div>
        <div
          className={`text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-md border shrink-0 ${
            nasaData
              ? 'text-emerald-900 bg-emerald-100 border-emerald-300'
              : 'text-amber-900 bg-amber-200/80 border-amber-300'
          }`}
        >
          {nasaData ? 'NASA Weather Active' : 'Offline / Demonstration Mode'}
        </div>
      </div>
    </aside>
  );
};
