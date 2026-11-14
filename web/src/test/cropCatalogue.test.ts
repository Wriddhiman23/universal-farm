import { describe, it, expect } from 'vitest';
import {
  CROP_CATALOGUE,
  EVIDENCE_PACK_1_METADATA,
  matchCropToCatalogue,
} from '../data/cropCatalogue';

describe('Evidence Pack 1 — Crop Catalogue Integrity & Citations', () => {
  it('contains exactly the 7 scoped temperate/Mediterranean crops', () => {
    const crops = Object.values(CROP_CATALOGUE);
    expect(crops).toHaveLength(7);
    expect(EVIDENCE_PACK_1_METADATA.cropsIncluded).toHaveLength(7);

    for (const cropId of EVIDENCE_PACK_1_METADATA.cropsIncluded) {
      expect(CROP_CATALOGUE[cropId]).toBeDefined();
    }
  });

  it('ensures every crop has traceable literature citations and non-empty URLs', () => {
    for (const crop of Object.values(CROP_CATALOGUE)) {
      expect(crop.citations.length).toBeGreaterThanOrEqual(1);
      for (const citation of crop.citations) {
        expect(citation.source.trim().length).toBeGreaterThan(0);
        expect(citation.citation.trim().length).toBeGreaterThan(0);
        expect(citation.urlOrDoi).toMatch(/^https?:\/\//);
        expect(citation.tableOrSection.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('verifies thermal, water, and soil parameters are within realistic physical bounds', () => {
    for (const crop of Object.values(CROP_CATALOGUE)) {
      // Thermal
      expect(crop.thermal.baseTempC).toBeGreaterThanOrEqual(0);
      expect(crop.thermal.baseTempC).toBeLessThanOrEqual(15);
      expect(crop.thermal.optimumTempC.min).toBeLessThan(crop.thermal.optimumTempC.max);
      expect(crop.thermal.heatStressThresholdC).toBeGreaterThan(crop.thermal.optimumTempC.max);

      // Water
      expect(crop.water.indicativeSeasonalWaterMm.min).toBeGreaterThan(100);
      expect(crop.water.indicativeSeasonalWaterMm.min).toBeLessThan(crop.water.indicativeSeasonalWaterMm.max);
      expect(crop.water.indicativeSeasonalWaterMm.typical).toBeGreaterThanOrEqual(crop.water.indicativeSeasonalWaterMm.min);
      expect(crop.water.indicativeSeasonalWaterMm.typical).toBeLessThanOrEqual(crop.water.indicativeSeasonalWaterMm.max);

      // Soil pH
      expect(crop.soil.phAbsolute.min).toBeGreaterThanOrEqual(4.5);
      expect(crop.soil.phAbsolute.max).toBeLessThanOrEqual(9.5);
      expect(crop.soil.phOptimal.min).toBeGreaterThanOrEqual(crop.soil.phAbsolute.min);
      expect(crop.soil.phOptimal.max).toBeLessThanOrEqual(crop.soil.phAbsolute.max);

      // Rotation break rule (0 for managed non-cash cover crops, 1-5 for grain crops)
      expect(crop.rotation.minYearsBeforeReplant).toBeGreaterThanOrEqual(0);
      expect(crop.rotation.minYearsBeforeReplant).toBeLessThanOrEqual(5);

      // Verify that cover crops distinguish component evidence from mixture assumptions
      if (crop.category === 'cover_crop') {
        expect(crop.componentEvidence).toBeDefined();
        expect(crop.componentEvidence).toContain('Component 1');
        expect(crop.componentEvidence).toContain('Component 2');
        expect(crop.componentEvidence).toContain('Mixture Assumptions');
      }

      // Review status must disclose unreviewed status
      expect(crop.reviewStatus).toContain('Human Agronomic Review Pending');
    }
  });

  it('matches free-text crop names correctly', () => {
    expect(matchCropToCatalogue('Wheat')?.id).toBe('bread_wheat');
    expect(matchCropToCatalogue('Winter wheat')?.id).toBe('bread_wheat');
    expect(matchCropToCatalogue('barley')?.id).toBe('feed_barley');
    expect(matchCropToCatalogue('Chickpeas')?.id).toBe('chickpea');
    expect(matchCropToCatalogue('Garbanzo')?.id).toBe('chickpea');
    expect(matchCropToCatalogue('Field Peas')?.id).toBe('field_pea');
    expect(matchCropToCatalogue('Canola')?.id).toBe('canola');
    expect(matchCropToCatalogue('Oilseed rape')?.id).toBe('canola');
    expect(matchCropToCatalogue('Grain Sorghum')?.id).toBe('grain_sorghum');
    expect(matchCropToCatalogue('Oat and Vetch cover')?.id).toBe('cover_vetch_oats');
    expect(matchCropToCatalogue('Unrecognized Crop XYZ')).toBeNull();
  });
});
