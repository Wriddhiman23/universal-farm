import React, { useState } from 'react';
import { BookOpen, X, Droplet, Thermometer, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { CROP_CATALOGUE, EVIDENCE_PACK_1_METADATA } from '../../data/cropCatalogue';

interface CropCatalogueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CropCatalogueModal: React.FC<CropCatalogueModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedCropId, setSelectedCropId] = useState<string>('bread_wheat');

  if (!isOpen) return null;

  const crops = Object.values(CROP_CATALOGUE);
  const selectedCrop = CROP_CATALOGUE[selectedCropId] || crops[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="catalogue-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-charcoal-950/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
    >
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-sand-300 flex flex-col">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-forest-900 text-white flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-forest-800 text-forest-200 text-xs font-mono font-bold uppercase tracking-wider">
                {EVIDENCE_PACK_1_METADATA.name}
              </span>
              <span className="text-xs text-forest-300">v{EVIDENCE_PACK_1_METADATA.version}</span>
            </div>
            <h2 id="catalogue-title" className="text-xl sm:text-2xl font-bold mt-1.5 flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-forest-300 shrink-0" aria-hidden="true" />
              <span>Sourced Crop Knowledge Catalogue</span>
            </h2>
            <p className="text-xs sm:text-sm text-forest-200 mt-1 max-w-2xl leading-relaxed">
              Every crop requirement, thermal limit, and sequence break rule is cited from published agronomic literature (FAO GAEZ v5, FAO Papers 33/56, and regional extension bulletins).
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-forest-800/80 hover:bg-forest-700 text-white flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-white shrink-0"
            aria-label="Close Crop Catalogue"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left Tab Sidebar + Right Detail Panel */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-sand-300">
          {/* Crop List Sidebar */}
          <div className="w-full md:w-64 bg-sand-50/80 p-3 sm:p-4 space-y-1.5 overflow-x-auto md:overflow-y-auto flex md:flex-col shrink-0">
            {crops.map((crop) => {
              const isSelected = crop.id === selectedCropId;
              return (
                <button
                  key={crop.id}
                  type="button"
                  onClick={() => setSelectedCropId(crop.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex flex-col min-w-[200px] md:min-w-0 ${
                    isSelected
                      ? 'bg-forest-800 text-white font-semibold shadow-xs'
                      : 'hover:bg-sand-200 text-charcoal-800'
                  }`}
                >
                  <span className="text-sm font-bold block">{crop.commonName}</span>
                  <span className={`text-xs italic block ${isSelected ? 'text-forest-200' : 'text-charcoal-500'}`}>
                    {crop.scientificName}
                  </span>
                  <span className={`text-[10px] mt-1 font-mono uppercase tracking-wider block ${
                    isSelected ? 'text-forest-300' : 'text-forest-700 font-bold'
                  }`}>
                    {crop.family} · {crop.category}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Crop Details View */}
          <div className="flex-1 p-5 sm:p-7 space-y-6 overflow-y-auto">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sand-200 pb-3">
                <div>
                  <h3 className="text-2xl font-bold text-charcoal-900">
                    {selectedCrop.commonName}
                  </h3>
                  <div className="text-sm italic text-charcoal-600">
                    {selectedCrop.scientificName} · Family: <strong className="text-charcoal-900">{selectedCrop.family}</strong>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-forest-100 text-forest-900 border border-forest-300 text-xs font-bold uppercase tracking-wider">
                  {selectedCrop.category.replace('_', ' ')}
                </span>
              </div>
              <p className="mt-2 text-sm text-charcoal-700 leading-relaxed">
                {selectedCrop.description}
              </p>
            </div>

            {/* Grid of Agronomic Attributes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              {/* Thermal Profile */}
              <div className="p-4 bg-sand-50 rounded-2xl border border-sand-300 space-y-2">
                <div className="font-bold text-charcoal-900 flex items-center gap-1.5 uppercase tracking-wider text-xs">
                  <Thermometer className="w-4 h-4 text-red-600" />
                  <span>Thermal Requirements</span>
                </div>
                <div className="space-y-1 text-charcoal-800">
                  <div>Base Temperature (T-base): <strong>{selectedCrop.thermal.baseTempC} °C</strong></div>
                  <div>Optimal Range: <strong>{selectedCrop.thermal.optimumTempC.min}°–{selectedCrop.thermal.optimumTempC.max} °C</strong></div>
                  <div>Frost Sensitivity: <strong className="capitalize">{selectedCrop.thermal.frostTolerance}</strong> (Floral damage below {selectedCrop.thermal.floweringFrostThresholdC} °C)</div>
                  <div>Heat Stress Threshold: <strong>{selectedCrop.thermal.heatStressThresholdC} °C</strong> (Flowering/grain-fill)</div>
                </div>
              </div>

              {/* Water Profile */}
              <div className="p-4 bg-sand-50 rounded-2xl border border-sand-300 space-y-2">
                <div className="font-bold text-charcoal-900 flex items-center gap-1.5 uppercase tracking-wider text-xs">
                  <Droplet className="w-4 h-4 text-blue-600" />
                  <span>Water & Irrigation Profile</span>
                </div>
                <div className="space-y-1 text-charcoal-800">
                  <div>Indicative Seasonal Water: <strong>{selectedCrop.water.indicativeSeasonalWaterMm.min}–{selectedCrop.water.indicativeSeasonalWaterMm.max} mm</strong> (Typical: ~{selectedCrop.water.indicativeSeasonalWaterMm.typical} mm)</div>
                  <div>Drought Hardiness: <strong className="capitalize">{selectedCrop.water.droughtHardiness}</strong></div>
                  <div>Waterlogging Sensitivity: <strong className="capitalize">{selectedCrop.water.waterloggingSensitivity}</strong></div>
                  <div>Irrigation Mode: <strong className="capitalize">{selectedCrop.water.irrigationSuitability.replace(/_/g, ' ')}</strong></div>
                </div>
              </div>

              {/* Soil Profile */}
              <div className="p-4 bg-sand-50 rounded-2xl border border-sand-300 space-y-2">
                <div className="font-bold text-charcoal-900 flex items-center gap-1.5 uppercase tracking-wider text-xs">
                  <FileText className="w-4 h-4 text-forest-700" />
                  <span>Soil Tolerances</span>
                </div>
                <div className="space-y-1 text-charcoal-800">
                  <div>Optimal pH: <strong>{selectedCrop.soil.phOptimal.min}–{selectedCrop.soil.phOptimal.max}</strong> (Absolute range: {selectedCrop.soil.phAbsolute.min}–{selectedCrop.soil.phAbsolute.max})</div>
                  <div>Heavy Clay Tolerance: <strong>{selectedCrop.soil.toleratesHeavyClay ? 'Tolerant' : 'Sensitive (restricts nodulation/drainage)'}</strong></div>
                  <div>Drainage Requirement: <strong className="capitalize">{selectedCrop.soil.drainageRequirement.replace('_', ' ')}</strong></div>
                </div>
              </div>

              {/* Rotation & Break Rules */}
              <div className="p-4 bg-sand-50 rounded-2xl border border-sand-300 space-y-2">
                <div className="font-bold text-charcoal-900 flex items-center gap-1.5 uppercase tracking-wider text-xs">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  <span>Rotation Break Rules</span>
                </div>
                <div className="space-y-1 text-charcoal-800">
                  <div>Mandatory Replant Break: <strong>{selectedCrop.rotation.minYearsBeforeReplant > 0 ? `${selectedCrop.rotation.minYearsBeforeReplant} year(s)` : '0 years (Managed cover crop)'}</strong></div>
                  <div>Biological Nitrogen Fixer: <strong>{selectedCrop.rotation.isNitrogenFixer ? 'Yes (Atmospheric N₂ fixation)' : 'No (Nitrogen consumer)'}</strong></div>
                  <div>Stubble Residue: <strong className="capitalize">{selectedCrop.rotation.residueLevel}</strong> (~{selectedCrop.rotation.residueCoverDurationMonths} months ground cover)</div>
                  {selectedCrop.rotation.diseaseBreakFor.length > 0 && (
                    <div className="text-xs text-forest-900">
                      <strong>Breaks:</strong> {selectedCrop.rotation.diseaseBreakFor.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Component Evidence vs Mixture Assumptions (For Bicultures / Cover Crops) */}
            {selectedCrop.componentEvidence && (
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-300 space-y-2 text-xs">
                <div className="font-bold text-emerald-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-800" />
                  <span>Component Evidence vs Mixture Assumptions</span>
                </div>
                <div className="text-charcoal-800 leading-relaxed whitespace-pre-line">
                  {selectedCrop.componentEvidence}
                </div>
              </div>
            )}

            {/* Traceable Citations Box */}
            <div className="p-4 bg-sand-100 rounded-2xl border border-sand-300 space-y-2 text-xs">
              <div className="font-bold text-charcoal-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-forest-700" />
                <span>Traceable Literature Citations</span>
              </div>
              <ul className="space-y-2 divide-y divide-sand-200">
                {selectedCrop.citations.map((c, i) => (
                  <li key={i} className="pt-1.5 first:pt-0">
                    <strong className="text-charcoal-900">{c.source}:</strong> {c.citation} ({c.tableOrSection})
                    <div className="mt-0.5">
                      <a
                        href={c.urlOrDoi}
                        target="_blank"
                        rel="noreferrer"
                        className="text-forest-800 hover:text-forest-950 underline font-mono text-[10px]"
                      >
                        {c.urlOrDoi}
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="text-[11px] text-charcoal-600 border-t border-sand-200 pt-2 italic">
                Status: {selectedCrop.reviewStatus}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-sand-100 border-t border-sand-300 flex items-center justify-between text-xs text-charcoal-600">
          <span>All properties reflect published FAO and agricultural extension documentation.</span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-5 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl font-bold transition-colors"
          >
            Close Catalogue
          </button>
        </div>
      </div>
    </div>
  );
};
