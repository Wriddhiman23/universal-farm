import React from 'react';
import { Droplets, Sparkles, TrendingUp, CheckCircle, Scale, Info } from 'lucide-react';
import { FarmerPriorities, PriorityChoice } from '../../types/farm';

interface PriorityControlsProps {
  priorities: FarmerPriorities;
  onChange: (priorities: FarmerPriorities) => void;
}

export const PriorityControls: React.FC<PriorityControlsProps> = ({
  priorities,
  onChange,
}) => {
  const priorityOptions: Array<{
    id: PriorityChoice;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
    tag: string;
  }> = [
    {
      id: 'water',
      title: 'Save water',
      description: 'Focus on drought-hardy crops, retaining soil moisture, and reducing water stress during dry spells.',
      icon: Droplets,
      tag: 'Water resilience',
    },
    {
      id: 'soil',
      title: 'Improve soil condition',
      description: 'Focus on building organic matter, natural nitrogen from legumes, and reducing soil erosion.',
      icon: Sparkles,
      tag: 'Soil fertility',
    },
    {
      id: 'market',
      title: 'Explore crops with suitable markets',
      description: 'Focus on crops that have reliable local buyers, clear grain handling, or established demand.',
      icon: TrendingUp,
      tag: 'Market demand',
    },
  ];

  const handleSetMainPriority = (choice: PriorityChoice | 'balanced') => {
    if (choice === 'balanced') {
      onChange({
        mainPriority: 'balanced',
        additionalPriorities: [],
      });
      return;
    }

    // If already main, keep it; remove from additional if present
    const updatedAdditional = priorities.additionalPriorities.filter((p) => p !== choice);
    onChange({
      mainPriority: choice,
      additionalPriorities: updatedAdditional,
    });
  };

  const handleToggleAdditional = (choice: PriorityChoice) => {
    if (priorities.mainPriority === choice) {
      // Cannot add main priority as additional
      return;
    }
    const isPresent = priorities.additionalPriorities.includes(choice);
    const updated = isPresent
      ? priorities.additionalPriorities.filter((p) => p !== choice)
      : [...priorities.additionalPriorities, choice];

    onChange({
      ...priorities,
      additionalPriorities: updated,
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-charcoal-900 flex items-center gap-2">
          <span>What matters most to you right now?</span>
        </h3>
        <p className="mt-1 text-sm sm:text-base text-charcoal-700 leading-relaxed">
          Choose the main goal you want to explore. These preferences guide your comparison checklist—they do not trigger automated suitability scores or computer-generated crop rankings.
        </p>
      </div>

      {/* Selectable Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {priorityOptions.map((opt) => {
          const Icon = opt.icon;
          const isMain = priorities.mainPriority === opt.id;
          const isAdditional = priorities.additionalPriorities.includes(opt.id);

          return (
            <div
              key={opt.id}
              className={`border-2 rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-all ${
                isMain
                  ? 'border-forest-700 bg-forest-50/70 shadow-sm ring-1 ring-forest-700'
                  : isAdditional
                  ? 'border-accent-blue-400 bg-accent-blue-50/50'
                  : 'border-sand-300 bg-white hover:border-sand-400'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isMain ? 'bg-forest-700 text-white' : 'bg-sand-200 text-charcoal-700'
                  }`}>
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  {isMain ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-forest-900 bg-forest-100 px-2.5 py-1 rounded-full border border-forest-300">
                      <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      Main Goal
                    </span>
                  ) : isAdditional ? (
                    <span className="text-xs font-semibold text-accent-blue-800 bg-accent-blue-100 px-2.5 py-1 rounded-full border border-accent-blue-300">
                      Also interested
                    </span>
                  ) : null}
                </div>

                <div>
                  <h4 className="text-base sm:text-lg font-bold text-charcoal-900">
                    {opt.title}
                  </h4>
                  <p className="mt-1.5 text-sm text-charcoal-700 leading-relaxed">
                    {opt.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons for Card */}
              <div className="mt-4 pt-3 border-t border-sand-200 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleSetMainPriority(opt.id)}
                  aria-pressed={isMain}
                  className={`w-full min-h-[44px] px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:outline-none flex items-center justify-center gap-2 ${
                    isMain
                      ? 'bg-forest-800 text-white'
                      : 'bg-sand-200 text-charcoal-800 hover:bg-forest-100 hover:text-forest-900'
                  }`}
                >
                  {isMain ? 'Selected as main goal' : 'Set as main goal'}
                </button>

                {!isMain && (
                  <button
                    type="button"
                    onClick={() => handleToggleAdditional(opt.id)}
                    aria-pressed={isAdditional}
                    className={`w-full min-h-[38px] px-3 py-1.5 text-xs font-medium rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:outline-none ${
                      isAdditional
                        ? 'bg-accent-blue-100 text-accent-blue-900 border border-accent-blue-300'
                        : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-sand-100'
                    }`}
                  >
                    {isAdditional ? '✓ Included as additional interest' : '+ Add as secondary interest'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Balanced option button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-sand-200/60 border border-sand-300 rounded-xl">
        <div className="flex items-center gap-2.5 text-sm text-charcoal-800">
          <Scale className="w-5 h-5 text-forest-800 shrink-0" aria-hidden="true" />
          <span>Prefer not to choose one over the others?</span>
        </div>
        <button
          type="button"
          onClick={() => handleSetMainPriority('balanced')}
          className={`min-h-[44px] px-4 py-2 text-sm font-semibold rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:outline-none ${
            priorities.mainPriority === 'balanced'
              ? 'bg-forest-800 text-white'
              : 'bg-white border border-sand-300 text-charcoal-800 hover:bg-sand-100'
          }`}
        >
          {priorities.mainPriority === 'balanced' ? '✓ Balanced approach selected' : 'Keep balanced / equal focus'}
        </button>
      </div>

      {/* Clear Note on Preferences vs Calculations */}
      <div className="p-3 bg-white border border-sand-300 rounded-lg text-xs sm:text-sm text-charcoal-700 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="leading-relaxed">
          <strong className="text-charcoal-900 font-semibold">Preferences only:</strong> Your selections tell the system which trade-off checklists to highlight in the next tab. Universal Farm does not calculate scores, artificial percentage matches, or financial estimates.
        </p>
      </div>
    </div>
  );
};
