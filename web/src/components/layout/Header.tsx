import React from 'react';
import { Globe2, Radio, Compass, CheckCircle2 } from 'lucide-react';
import { Badge } from '../common/Badge';
import { NasaPowerNormalizedPayload } from '../../types/nasaPower';

interface HeaderProps {
  nasaData?: NasaPowerNormalizedPayload | null;
}

export const Header: React.FC<HeaderProps> = ({ nasaData }) => {
  return (
    <header className="bg-forest-900 text-white border-b border-forest-950 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-forest-800 border border-forest-700 flex items-center justify-center text-forest-200 shrink-0 shadow-inner">
              <Compass className="w-7 h-7 text-forest-300" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Universal Farm
              </h1>
              <p className="text-sm sm:text-base text-forest-200 mt-0.5">
                Explore crop rotation plans with environmental evidence
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2 md:pt-0 border-t border-forest-800/80 md:border-t-0">
            <Badge variant="forest" size="md" className="bg-forest-800 text-forest-100 border-forest-700 flex items-center gap-1.5 py-1 px-3">
              <Globe2 className="w-4 h-4 text-forest-300" aria-hidden="true" />
              <span>Worldwide farm input</span>
            </Badge>

            {nasaData ? (
              <Badge variant="forest" size="md" className="bg-emerald-900 text-emerald-100 border-emerald-700 flex items-center gap-1.5 py-1 px-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                <span>NASA POWER: Loaded ({nasaData.records.length}d)</span>
              </Badge>
            ) : (
              <Badge variant="amber" size="md" className="flex items-center gap-1.5 py-1 px-3">
                <Radio className="w-4 h-4 text-amber-700" aria-hidden="true" />
                <span>NASA POWER: Ready to load</span>
              </Badge>
            )}

            <Badge variant="neutral" size="md" className="bg-charcoal-800 text-charcoal-300 border-charcoal-700 flex items-center gap-1 py-1 px-2.5 text-xs">
              <span>Other NASA APIs: Disconnected</span>
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
};
