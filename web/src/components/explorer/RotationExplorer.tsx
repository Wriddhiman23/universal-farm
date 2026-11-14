import React, { useState } from 'react';
import {
  Compass,
  ArrowLeft,
  UserCheck,
  AlertTriangle,
  Download,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  Calendar,
} from 'lucide-react';
import { FarmState } from '../../types/farm';
import { NasaPowerNormalizedPayload } from '../../types/nasaPower';
import {
  executeRotationComparison,
  EvaluatedRotationPlan,
} from '../../services/rotationEngine';
import { CropCatalogueModal } from '../crops/CropCatalogueModal';
import { downloadReportAsJson } from '../../services/exportReport';
import { Accordion } from '../common/Accordion';

interface RotationExplorerProps {
  farmState: FarmState;
  weatherData?: NasaPowerNormalizedPayload | null;
  onNavigateToFarm: () => void;
}

export const RotationExplorer: React.FC<RotationExplorerProps> = ({
  farmState,
  weatherData = null,
  onNavigateToFarm,
}) => {
  const [isCatalogueOpen, setIsCatalogueOpen] = useState(false);

  // Execute deterministic rotation comparison
  const comparison = executeRotationComparison(farmState, weatherData);
  const { sufficiency, baselinePlan, feasibleAlternatives, disqualifiedCandidates, evidencePack } = comparison;

  const handleExport = () => {
    downloadReportAsJson(comparison, farmState, weatherData);
  };

  const getPriorityHeadingText = () => {
    if (farmState.priorities.mainPriority === 'balanced') {
      return 'Balanced approach (Save water, improve soil, and explore markets equally)';
    }
    const map = {
      water: 'Save water (Drought resilience & moisture conservation)',
      soil: 'Improve soil condition (Organic matter & natural nutrients)',
      market: 'Explore crops with suitable markets (Commercial demand & buyers)',
    };
    return map[farmState.priorities.mainPriority];
  };

  return (
    <div className="space-y-8">
      {/* Top Controls Header */}
      <div className="bg-white border border-sand-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-forest-100 text-forest-800 text-xs font-mono font-bold uppercase tracking-wider">
                {evidencePack.name}
              </span>
              <span className="text-xs text-charcoal-500">v{evidencePack.version}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 mt-1 flex items-center gap-2.5">
              <Compass className="w-6 h-6 text-forest-700 shrink-0" aria-hidden="true" />
              <span>Evidence-Based Rotation Comparison Engine</span>
            </h2>
            <p className="mt-1 text-sm sm:text-base text-charcoal-700 leading-relaxed">
              Compares your baseline farm rotation against calendar-feasible alternative sequences generated from published FAO and extension research. All comparisons are deterministic and inspectable.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsCatalogueOpen(true)}
              className="min-h-[44px] px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-sand-300 bg-sand-50 hover:bg-sand-100 text-charcoal-900 transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-forest-700"
            >
              <BookOpen className="w-4 h-4 text-forest-700" aria-hidden="true" />
              <span>Inspect Crop Catalogue</span>
            </button>

            <button
              type="button"
              onClick={handleExport}
              className="min-h-[44px] px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-forest-600 bg-forest-50 hover:bg-forest-100 text-forest-900 transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-forest-700"
            >
              <Download className="w-4 h-4 text-forest-700" aria-hidden="true" />
              <span>Export Report (JSON)</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToFarm}
              className="min-h-[44px] px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-sand-300 bg-white hover:bg-sand-50 text-charcoal-700 transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-forest-700"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Edit Farm</span>
            </button>
          </div>
        </div>

        {/* Sufficiency & Evidence Status Callout */}
        {sufficiency.status === 'insufficient_evidence' && (
          <div className="p-4 sm:p-5 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-2 text-amber-950">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="font-bold text-base text-amber-950 block">
                  Actionable Evidence Blocker — Cannot Generate Rotation Comparisons
                </span>
                <p className="text-sm mt-1 leading-relaxed text-amber-900">
                  {sufficiency.summaryMessage}
                </p>
              </div>
            </div>
            <div className="mt-2 pl-7 space-y-1 text-xs sm:text-sm text-amber-900">
              <strong>Specific gaps identified:</strong>
              <ul className="list-disc pl-5 space-y-1">
                {sufficiency.identifiedGaps.map((gap, i) => (
                  <li key={i}>{gap}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {sufficiency.status === 'partial' && (
          <div className="p-4 bg-sand-100 border border-sand-300 rounded-2xl space-y-1.5 text-xs sm:text-sm text-charcoal-800">
            <div className="flex items-center gap-2 font-bold text-charcoal-900">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
              <span>Partial Assessment Status</span>
            </div>
            <p className="leading-relaxed">
              {sufficiency.summaryMessage}
            </p>
            {sufficiency.identifiedGaps.length > 0 && (
              <ul className="list-disc pl-5 text-xs text-charcoal-600 space-y-0.5 pt-1">
                {sufficiency.identifiedGaps.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {sufficiency.status === 'supported' && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-2.5 text-xs sm:text-sm text-emerald-950">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <strong className="font-bold">Full Evidence Support:</strong>{' '}
              <span>{sufficiency.summaryMessage}</span>
            </div>
          </div>
        )}

        {/* Selected Priorities Reflection Box */}
        <div className="p-4 sm:p-5 bg-sand-50 border border-sand-300 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-charcoal-700 uppercase tracking-wider">
            <UserCheck className="w-4 h-4 text-forest-700" aria-hidden="true" />
            <span>Active Farmer Focus:</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-forest-950">
            {getPriorityHeadingText()}
          </div>
          {farmState.priorities.additionalPriorities.length > 0 && (
            <p className="text-xs sm:text-sm text-charcoal-700">
              Secondary interests:{' '}
              {farmState.priorities.additionalPriorities
                .map((p) => (p === 'water' ? 'Saving water' : p === 'soil' ? 'Improving soil' : 'Markets'))
                .join(', ')}
            </p>
          )}
        </div>
      </div>

      {/* Rotation Plans Grid: Baseline + Feasible Alternatives */}
      {sufficiency.isGeographicallyApplicable && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Farmer Baseline */}
          <PlanCard plan={baselinePlan} hemisphere={sufficiency.hemisphere} />

          {/* Cards 2 & 3: Feasible Alternatives */}
          {feasibleAlternatives.map((plan) => (
            <PlanCard key={plan.id} plan={plan} hemisphere={sufficiency.hemisphere} />
          ))}

          {feasibleAlternatives.length === 0 && (
            <div className="lg:col-span-2 p-8 bg-white border-2 border-dashed border-sand-300 rounded-3xl text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-amber-700 mx-auto" aria-hidden="true" />
              <h3 className="text-lg font-bold text-charcoal-900">
                No Feasible Alternatives Found Under Hard Constraints
              </h3>
              <p className="text-sm text-charcoal-600 max-w-md mx-auto leading-relaxed">
                Documented agronomic constraints (such as rainfed moisture deficits or soil texture restrictions) disqualified potential candidate crops. Universal Farm never invents an unvalidated sequence to fill a card.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Disqualified Candidate Sequences Panel */}
      {disqualifiedCandidates.length > 0 && (
        <div className="bg-white border border-sand-300 rounded-2xl p-5 sm:p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-sand-200 pb-2">
            <h3 className="text-sm sm:text-base font-bold text-charcoal-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <span>Candidate Sequences Disqualified by Documented Hard Constraints ({disqualifiedCandidates.length})</span>
            </h3>
            <span className="text-xs text-charcoal-500 font-mono">Transparent Engine Audit</span>
          </div>
          <p className="text-xs text-charcoal-600">
            To prevent agronomic failure, candidate crop options were filtered against documented moisture and soil rules before comparison:
          </p>

          <div className="space-y-2 pt-1">
            {disqualifiedCandidates.map((d, i) => (
              <div key={i} className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-amber-950">
                  <span>{d.candidateTitle} ({d.attemptedCrops.join(' → ')})</span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-mono">Disqualified</span>
                </div>
                <p className="text-charcoal-800 leading-relaxed">
                  <strong>Reason:</strong> {d.reason}
                </p>
                <div className="text-charcoal-500 text-[11px] font-mono">
                  Rule: {d.disqualifyingRule} · Citation: {d.citation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explanatory Principles Footer Note */}
      <div className="p-5 bg-sand-200/60 border border-sand-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-charcoal-700">
        <div className="flex items-center gap-2.5">
          <HelpCircle className="w-5 h-5 text-forest-800 shrink-0" aria-hidden="true" />
          <p className="leading-relaxed">
            <strong>Advisory Boundary:</strong> Rotation plans reflect literature rules from FAO GAEZ v5 and extension bulletins. Sourced rules are deterministic, but human agronomic review is pending for local cultivars.
          </p>
        </div>
        <span className="text-xs text-charcoal-500 font-mono shrink-0">
          Universal Farm Engine v1.0
        </span>
      </div>

      {/* Modal Inspector for Crop Catalogue */}
      <CropCatalogueModal
        isOpen={isCatalogueOpen}
        onClose={() => setIsCatalogueOpen(false)}
      />
    </div>
  );
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatMonthList(months?: number[]): string {
  if (!months || months.length === 0) return 'Unspecified';
  return months.map((m) => MONTH_NAMES[m - 1]).join('–');
}

interface PlanCardProps {
  plan: EvaluatedRotationPlan;
  hemisphere: 'northern' | 'southern';
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, hemisphere }) => {
  return (
    <div className="bg-white border-2 border-sand-300 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-5 transition-all hover:border-sand-400">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sand-200 pb-3">
          <div>
            <span className="text-xs font-bold text-forest-800 tracking-wider uppercase block mb-1">
              {plan.isBaseline ? 'Your Farm Baseline' : 'Feasible Candidate'}
            </span>
            <h3 className="text-lg font-bold text-charcoal-900 leading-snug">
              {plan.title}
            </h3>
          </div>
          <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold bg-forest-100 text-forest-900 border border-forest-300 shrink-0">
            {plan.categoryTag}
          </span>
        </div>

        {/* Calendar Scope Summary */}
        <p className="text-xs text-charcoal-700 italic border-l-2 border-forest-600 pl-2.5 my-1 leading-relaxed">
          {plan.calendarDescription}
        </p>

        {/* Crop sequence tags */}
        <div className="p-3.5 bg-sand-50 border border-sand-200 rounded-2xl space-y-2">
          <div className="text-xs font-semibold text-charcoal-800 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-forest-700" aria-hidden="true" />
            <span>Chronological crop sequence:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {plan.cropSequence.map((crop, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-sand-300 text-charcoal-900 rounded-xl text-xs font-medium shadow-2xs"
              >
                <span className="text-[10px] text-forest-700 font-mono font-bold">#{idx + 1}</span>
                <span>{crop}</span>
                {idx < plan.cropSequence.length - 1 && (
                  <span className="text-charcoal-400 ml-1">→</span>
                )}
              </span>
            ))}
            {plan.cropSequence.length === 0 && (
              <span className="text-xs text-charcoal-400 italic">No crops recorded.</span>
            )}
          </div>
        </div>

        {/* Calendar Timeline & Agronomic Windows Schedule */}
        {plan.phases.length > 0 && (
          <div className="p-3 bg-sand-50/80 border border-sand-200 rounded-2xl space-y-2">
            <div className="text-xs font-semibold text-charcoal-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-forest-700" aria-hidden="true" />
                <span>Calendar Phases ({hemisphere} hemisphere):</span>
              </span>
            </div>
            <div className="space-y-1.5 divide-y divide-sand-200">
              {plan.phases.map((phase, idx) => {
                const matched = phase.matchedCrop;
                const cal = matched
                  ? hemisphere === 'northern'
                    ? matched.calendar.northernHemisphere
                    : matched.calendar.southernHemisphere
                  : null;

                return (
                  <div key={idx} className="pt-1.5 first:pt-0 text-xs flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-charcoal-900">
                        Phase {idx + 1}: {phase.cropName}
                      </span>
                      <span className="text-[10px] font-mono text-charcoal-500">
                        {phase.family}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-charcoal-700">
                      {cal ? (
                        <>
                          <span className="px-1.5 py-0.5 rounded bg-sand-200/80 text-charcoal-800 font-mono">
                            Sow: {formatMonthList(cal.plantingMonths)}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-sand-200/80 text-charcoal-800 font-mono">
                            Harvest: {formatMonthList(cal.harvestMonths)}
                          </span>
                          <span className="text-charcoal-500 font-mono">~{cal.cycleDurationDays.typical}d</span>
                        </>
                      ) : (
                        <span className="text-charcoal-400 italic">Calendar windows unassessed</span>
                      )}
                      {phase.indicativeWaterDemandMm && (
                        <span className="text-blue-900 font-mono text-[10px]">
                          ~{phase.indicativeWaterDemandMm}mm
                        </span>
                      )}
                    </div>

                    {/* Any specific agronomic warnings */}
                    {phase.breakRuleWarning && (
                      <div className="text-[11px] text-amber-900 bg-amber-100/60 p-1.5 rounded border border-amber-300">
                        ⚠️ {phase.breakRuleWarning}
                      </div>
                    )}
                    {phase.soilSuitabilityWarning && (
                      <div className="text-[11px] text-amber-900 bg-amber-100/60 p-1.5 rounded border border-amber-300">
                        ⚠️ {phase.soilSuitabilityWarning}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Deterministic Metrics Summary */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 bg-sand-100/70 rounded-xl">
            <span className="text-charcoal-500 block">Cycle Duration:</span>
            <span className="font-bold text-charcoal-900">~{plan.metrics.totalDurationYears} year(s)</span>
          </div>
          <div className="p-2.5 bg-sand-100/70 rounded-xl">
            <span className="text-charcoal-500 block">Average Water Demand:</span>
            <span className="font-bold text-charcoal-900">
              {plan.metrics.annualAverageWaterDemandMm ? `~${plan.metrics.annualAverageWaterDemandMm} mm/yr` : 'Unassessed'}
            </span>
          </div>
          <div className="p-2.5 bg-sand-100/70 rounded-xl">
            <span className="text-charcoal-500 block">Ground Cover:</span>
            <span className="font-bold text-charcoal-900">~{plan.metrics.estimatedCoverMonthsPerYear} mo/yr</span>
          </div>
          <div className="p-2.5 bg-sand-100/70 rounded-xl">
            <span className="text-charcoal-500 block">Legume Phase:</span>
            <span className="font-bold text-charcoal-900">
              {plan.metrics.hasNitrogenFixingPhase ? '✓ Yes (N₂ fixed)' : 'No Legume'}
            </span>
          </div>
        </div>

        {/* 4 Farmer-Centered Question Accordions */}
        <div className="space-y-2 pt-1">
          {/* 1. What changes? */}
          <Accordion id={`${plan.id}-changes`} title="What changes?" badge={`${plan.whatChanges.length} items`} defaultOpen={false}>
            <ul className="list-disc pl-5 space-y-1 text-xs text-charcoal-700 leading-relaxed">
              {plan.whatChanges.map((pt, i) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
          </Accordion>

          {/* 2. What might be worth investigating? */}
          <Accordion id={`${plan.id}-investigate`} title="What might be worth investigating?" badge={`${plan.whatMightBeWorthInvestigating.length} items`} defaultOpen={false}>
            <ul className="list-disc pl-5 space-y-1 text-xs text-charcoal-700 leading-relaxed">
              {plan.whatMightBeWorthInvestigating.map((pt, i) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
          </Accordion>

          {/* 3. What needs checking locally? */}
          <Accordion id={`${plan.id}-local`} title="What needs checking locally?" badge="Local Review" defaultOpen={false}>
            <ul className="list-disc pl-5 space-y-1 text-xs text-charcoal-700 leading-relaxed">
              {plan.whatNeedsCheckingLocally.map((pt, i) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
          </Accordion>

          {/* 4. What information is missing? */}
          <Accordion id={`${plan.id}-missing`} title="What information is missing?" badge="Gaps" defaultOpen={false}>
            <ul className="list-disc pl-5 space-y-1 text-xs text-charcoal-700 leading-relaxed">
              {plan.whatInformationIsMissing.map((pt, i) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
          </Accordion>
        </div>
      </div>

      {/* Rules Applied Audit */}
      <div className="pt-2 border-t border-sand-200 text-[11px] text-charcoal-500 flex items-center justify-between">
        <span>Rules: {plan.feasibilityRulesApplied.length} verified constraint(s)</span>
        <span className="font-mono text-[10px]">Citations: {plan.citations.length}</span>
      </div>
    </div>
  );
};
