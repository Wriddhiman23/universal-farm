import { RotationComparisonResult, isWeatherBoundToCoordinates } from './rotationEngine';
import { FarmState } from '../types/farm';
import { NasaPowerNormalizedPayload } from '../types/nasaPower';

export interface ExportPayload {
  reportTitle: string;
  generatedAt: string;
  softwareVersion: string;
  evidencePack: {
    id: string;
    name: string;
    version: string;
    reviewStatus: string;
  };
  farmProfile: {
    farmName: string;
    locationLabel: string;
    coordinates: {
      latitude: string;
      longitude: string;
    };
    soilType: string;
    irrigationType: string;
    priorities: {
      mainPriority: string;
      additionalPriorities: string[];
    };
  };
  environmentalEvidence: {
    source: string;
    period: string | null;
    timeStandard: string;
    recordsCount: number;
    periodPrecipitationTotalMm: number | null;
    annualPrecipitationEstimateMm: number | null;
    isAnnualObservation: boolean;
    isWeatherBoundToCoordinates: boolean;
  };
  comparisonResults: {
    sufficiencyStatus: string;
    sufficiencySummary: string;
    identifiedGaps: string[];
    baseline: {
      title: string;
      crops: string[];
      durationYears: number;
      averageWaterDemandMm: number | null;
      whatChanges: string[];
      whatToInvestigate: string[];
      localChecks: string[];
    };
    feasibleAlternatives: Array<{
      title: string;
      categoryTag: string;
      crops: string[];
      durationYears: number;
      annualAverageWaterDemandMm: number | null;
      whatChanges: string[];
      whatToInvestigate: string[];
      localChecks: string[];
    }>;
    disqualifiedCandidates: Array<{
      title: string;
      attemptedCrops: string[];
      reason: string;
      rule: string;
    }>;
  };
  advisoryDisclaimer: string;
}

export function buildExportPayload(
  comparison: RotationComparisonResult,
  farmState: FarmState,
  weatherData: NasaPowerNormalizedPayload | null
): ExportPayload {
  return {
    reportTitle: 'Universal Farm — Crop Rotation Decision Support Report',
    generatedAt: comparison.generatedAt,
    softwareVersion: 'Universal Farm (Field-Ready Prototype)',
    evidencePack: {
      id: comparison.evidencePack.id,
      name: comparison.evidencePack.name,
      version: comparison.evidencePack.version,
      reviewStatus: comparison.evidencePack.reviewStatus,
    },
    farmProfile: {
      farmName: farmState.farmName || 'Unspecified Farm',
      locationLabel: farmState.locationLabel || 'Unspecified Region',
      coordinates: farmState.coordinates,
      soilType: farmState.soilType,
      irrigationType: farmState.irrigationType,
      priorities: farmState.priorities,
    },
    environmentalEvidence: {
      source: weatherData ? 'NASA POWER Daily Point API (MERRA2, POWER assimilation)' : 'None loaded (Published Literature Baselines)',
      period: weatherData ? `${weatherData.metadata.requestedStartDate} to ${weatherData.metadata.requestedEndDate}` : null,
      timeStandard: weatherData ? weatherData.metadata.timeStandard : 'N/A',
      recordsCount: weatherData ? weatherData.records.length : 0,
      periodPrecipitationTotalMm: weatherData?.summary.precipSum ?? null,
      annualPrecipitationEstimateMm:
        weatherData && (weatherData.records.length >= 365 || weatherData.summary.daysTotal >= 365)
          ? weatherData.summary.precipSum
          : null,
      isAnnualObservation: Boolean(
        weatherData && (weatherData.records.length >= 365 || weatherData.summary.daysTotal >= 365)
      ),
      isWeatherBoundToCoordinates: Boolean(
        weatherData && isWeatherBoundToCoordinates(weatherData, farmState.coordinates.latitude, farmState.coordinates.longitude)
      ),
    },
    comparisonResults: {
      sufficiencyStatus: comparison.sufficiency.status,
      sufficiencySummary: comparison.sufficiency.summaryMessage,
      identifiedGaps: comparison.sufficiency.identifiedGaps,
      baseline: {
        title: comparison.baselinePlan.title,
        crops: comparison.baselinePlan.cropSequence,
        durationYears: comparison.baselinePlan.metrics.totalDurationYears,
        averageWaterDemandMm: comparison.baselinePlan.metrics.annualAverageWaterDemandMm,
        whatChanges: comparison.baselinePlan.whatChanges,
        whatToInvestigate: comparison.baselinePlan.whatMightBeWorthInvestigating,
        localChecks: comparison.baselinePlan.whatNeedsCheckingLocally,
      },
      feasibleAlternatives: comparison.feasibleAlternatives.map((alt) => ({
        title: alt.title,
        categoryTag: alt.categoryTag,
        crops: alt.cropSequence,
        durationYears: alt.metrics.totalDurationYears,
        annualAverageWaterDemandMm: alt.metrics.annualAverageWaterDemandMm,
        whatChanges: alt.whatChanges,
        whatToInvestigate: alt.whatMightBeWorthInvestigating,
        localChecks: alt.whatNeedsCheckingLocally,
      })),
      disqualifiedCandidates: comparison.disqualifiedCandidates.map((d) => ({
        title: d.candidateTitle,
        attemptedCrops: d.attemptedCrops,
        reason: d.reason,
        rule: d.disqualifyingRule,
      })),
    },
    advisoryDisclaimer:
      'Universal Farm is a decision-support and exploration system developed for the NASA Space Apps Challenge. Sourced rules reflect published FAO and agricultural extension documentation. It does not replace on-farm soil testing or accredited local agricultural advice.',
  };
}

export function downloadReportAsJson(
  comparison: RotationComparisonResult,
  farmState: FarmState,
  weatherData: NasaPowerNormalizedPayload | null
) {
  const payload = buildExportPayload(comparison, farmState, weatherData);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (farmState.farmName || 'farm_plan').toLowerCase().replace(/[^a-z0-9]/g, '_');
  a.href = url;
  a.download = `universal_farm_${safeName}_${new Date().toISOString().substring(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
