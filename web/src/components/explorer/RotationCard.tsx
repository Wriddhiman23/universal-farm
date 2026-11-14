import React from 'react';
import { Layers, Scale, AlertOctagon, UserCheck, CheckCircle2 } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Accordion } from '../common/Accordion';

interface RotationCardProps {
  cardId: string;
  title: string;
  categoryTag: string;
  badgeVariant?: 'forest' | 'blue' | 'sand' | 'amber' | 'neutral' | 'charcoal';
  summary: string;
  cropSequence: string[];
  whatChanges: string[];
  whatToInvestigate: string[];
  whatNeedsLocalChecking: string[];
  whatInformationIsMissing: string[];
  emptyStateMessage?: string;
  isExistingRotation?: boolean;
}

export const RotationCard: React.FC<RotationCardProps> = ({
  cardId,
  title,
  categoryTag,
  badgeVariant = 'forest',
  summary,
  cropSequence,
  whatChanges,
  whatToInvestigate,
  whatNeedsLocalChecking,
  whatInformationIsMissing,
  emptyStateMessage,
  isExistingRotation = false,
}) => {
  const hasCrops = cropSequence.length > 0;

  return (
    <div className="bg-white border-2 border-sand-300 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between transition-all hover:border-sand-400">
      <div className="space-y-4">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-sand-200 pb-3">
          <div>
            <span className="text-xs font-bold text-forest-800 tracking-wider uppercase block mb-1">
              Demonstration Plan
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-charcoal-900 leading-snug">
              {title}
            </h3>
          </div>
          <Badge variant={badgeVariant} size="md" className="self-start sm:self-auto py-1 px-3 text-xs sm:text-sm">
            {categoryTag}
          </Badge>
        </div>

        {/* Plain Language Summary */}
        <p className="text-sm sm:text-base text-charcoal-700 leading-relaxed">
          {summary}
        </p>

        {/* Crops in this plan */}
        <div className="p-3.5 bg-sand-50 border border-sand-200 rounded-xl space-y-2">
          <div className="text-xs sm:text-sm font-semibold text-charcoal-800 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-forest-700" aria-hidden="true" />
            <span>Crop sequence on the field:</span>
          </div>

          {hasCrops ? (
            <div className="flex flex-wrap items-center gap-2">
              {cropSequence.map((crop, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-sand-300 text-charcoal-900 rounded-lg text-xs sm:text-sm font-medium shadow-2xs"
                >
                  <span className="text-xs text-forest-700 font-mono font-bold">
                    #{idx + 1}
                  </span>
                  <span>{crop}</span>
                  {idx < cropSequence.length - 1 && (
                    <span className="text-charcoal-400 ml-1">→</span>
                  )}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-sm text-charcoal-500 italic py-1">
              {emptyStateMessage || 'No crops specified for this sequence.'}
            </div>
          )}
        </div>

        {/* Clear Demonstration Note (No predictions) */}
        <div className="p-3 bg-amber-500/10 border border-amber-300 rounded-xl text-xs sm:text-sm text-amber-950 flex items-start gap-2">
          <span className="font-bold shrink-0">Demonstration Notice:</span>
          <span>No yield projections, soil health scores, or suitability percentages are generated.</span>
        </div>

        {/* Consistent Farmer Question Accordions */}
        <div className="space-y-2.5 pt-1">
          {/* 1. What changes? */}
          <Accordion
            id={`${cardId}-changes`}
            title="What changes?"
            badge={`${whatChanges.length} points`}
            defaultOpen={false}
          >
            <div className="flex items-start gap-2 pt-1 mb-2 text-xs sm:text-sm font-semibold text-forest-950">
              <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" aria-hidden="true" />
              <span>How this sequence differs from standard single-crop patterns:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-charcoal-700 leading-relaxed">
              {whatChanges.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </Accordion>

          {/* 2. What might be worth investigating? */}
          <Accordion
            id={`${cardId}-investigate`}
            title="What might be worth investigating?"
            badge={`${whatToInvestigate.length} items`}
            defaultOpen={false}
          >
            <div className="flex items-start gap-2 pt-1 mb-2 text-xs sm:text-sm font-semibold text-charcoal-900">
              <Scale className="w-4 h-4 text-charcoal-700 shrink-0 mt-0.5" aria-hidden="true" />
              <span>Potential practical advantages and trade-offs to evaluate:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-charcoal-700 leading-relaxed">
              {whatToInvestigate.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </Accordion>

          {/* 3. What needs checking locally? */}
          <Accordion
            id={`${cardId}-local`}
            title="What needs checking locally?"
            badge="Local validation"
            defaultOpen={false}
          >
            <div className="flex items-start gap-2 pt-1 mb-2 text-xs sm:text-sm font-semibold text-forest-950">
              <UserCheck className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" aria-hidden="true" />
              <span>Questions for your local agricultural advisor or agronomist:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-charcoal-700 leading-relaxed">
              {whatNeedsLocalChecking.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </Accordion>

          {/* 4. What information is missing? */}
          <Accordion
            id={`${cardId}-missing`}
            title="What information is missing?"
            badge="Not assessed yet"
            defaultOpen={false}
          >
            <div className="flex items-start gap-2 pt-1 mb-2 text-xs sm:text-sm font-semibold text-amber-950">
              <AlertOctagon className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
              <span>Unmeasured factors not available in this prototype:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-charcoal-700 leading-relaxed">
              {whatInformationIsMissing.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </Accordion>
        </div>
      </div>

      {isExistingRotation && !hasCrops && (
        <div className="mt-4 pt-3 border-t border-sand-200 text-xs sm:text-sm text-forest-800 font-medium">
          Tip: Enter your current crops in Tab 1 (Your Farm) to see your baseline crop sequence compared here.
        </div>
      )}
    </div>
  );
};
