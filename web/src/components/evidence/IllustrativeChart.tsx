import React from 'react';
import {
  ILLUSTRATIVE_FIXTURE_LABEL,
  ILLUSTRATIVE_FIXTURE_EXPLANATION,
  ILLUSTRATIVE_SAMPLE_METRICS,
} from '../../fixtures/illustrativeSample';
import { AlertCircle, Eye, Info } from 'lucide-react';
import { Badge } from '../common/Badge';

export const IllustrativeChart: React.FC = () => {
  const data = ILLUSTRATIVE_SAMPLE_METRICS;
  const maxVal = 100;
  const height = 180;
  const width = 600;
  const paddingX = 40;
  const paddingY = 25;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;

  // Generate SVG points for moisture and thermal indexes
  const moisturePoints = data
    .map((d, i) => {
      const x = paddingX + (i / (data.length - 1)) * plotWidth;
      const y = height - paddingY - (d.surfaceMoistureIndex / maxVal) * plotHeight;
      return `${x},${y}`;
    })
    .join(' ');

  const thermalPoints = data
    .map((d, i) => {
      const x = paddingX + (i / (data.length - 1)) * plotWidth;
      const y = height - paddingY - (d.thermalHoursIndex / maxVal) * plotHeight;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="bg-white border border-sand-300 rounded-xl p-5 shadow-sm space-y-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sand-200 pb-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-forest-700" aria-hidden="true" />
          <h3 className="font-bold text-sm text-charcoal-900">
            Environmental Parameter Visualization (Mock Fixture)
          </h3>
        </div>
        <Badge variant="amber" size="sm">
          {ILLUSTRATIVE_FIXTURE_LABEL}
        </Badge>
      </div>

      {/* Explanatory callout */}
      <div className="p-3 bg-amber-500/10 border border-amber-300/80 rounded-lg text-xs text-charcoal-800 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <span className="font-bold text-amber-950">Notice regarding sample fixtures: </span>
          <span>{ILLUSTRATIVE_FIXTURE_EXPLANATION}</span>
        </div>
      </div>

      {/* SVG Chart Rendering */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[500px]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto text-charcoal-600 select-none"
            role="img"
            aria-label="Illustrative demonstration chart of environmental index values over 12 intervals"
          >
            {/* Horizontal Grid lines */}
            {[0, 25, 50, 75, 100].map((val) => {
              const y = height - paddingY - (val / maxVal) * plotHeight;
              return (
                <g key={val}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke="#e2ded4"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    fontSize="9"
                    fill="#717a86"
                    className="font-mono"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Bottom X Axis */}
            <line
              x1={paddingX}
              y1={height - paddingY}
              x2={width - paddingX}
              y2={height - paddingY}
              stroke="#b5ad9e"
              strokeWidth="1.5"
            />

            {/* Moisture Line (Blue) */}
            <polyline
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={moisturePoints}
            />

            {/* Thermal Line (Forest Green) */}
            <polyline
              fill="none"
              stroke="#1d352c"
              strokeWidth="2.5"
              strokeDasharray="4 3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={thermalPoints}
            />

            {/* Data points */}
            {data.map((d, i) => {
              const x = paddingX + (i / (data.length - 1)) * plotWidth;
              const yM = height - paddingY - (d.surfaceMoistureIndex / maxVal) * plotHeight;
              const yT = height - paddingY - (d.thermalHoursIndex / maxVal) * plotHeight;
              return (
                <g key={i}>
                  <circle cx={x} cy={yM} r="3" fill="#2563eb" />
                  <circle cx={x} cy={yT} r="3" fill="#1d352c" />
                  <text
                    x={x}
                    y={height - paddingY + 14}
                    textAnchor="middle"
                    fontSize="8"
                    fill="#717a86"
                  >
                    T{i + 1}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Legend & explicit unit notes */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-t border-sand-200 pt-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 bg-accent-blue-600 rounded-full inline-block" />
            <span className="text-charcoal-800 font-medium">Demonstration Moisture Index</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 bg-forest-900 border-b border-dashed border-white inline-block" />
            <span className="text-charcoal-800 font-medium">Demonstration Thermal Accumulation</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-charcoal-500 text-[11px]">
          <Info className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Normalized 0–100 demo scale (arbitrary units)</span>
        </div>
      </div>
    </div>
  );
};
