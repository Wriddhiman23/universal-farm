/**
 * Static illustrative demonstration data.
 *
 * SCIENTIFIC HONESTY NOTICE:
 * These numbers and scenario cards are static demonstration fixtures for UI evaluation.
 * - They are NOT live NASA observations or validated agricultural predictions.
 * - They do NOT represent any specific farm, location, or crop model.
 * - Changing the coordinates in "Your Farm" will NOT change these static fixtures.
 */

export interface DemonstrationMetric {
  period: string;
  surfaceMoistureIndex: number;
  thermalHoursIndex: number;
}

export const ILLUSTRATIVE_FIXTURE_LABEL = "Illustrative sample — not NASA observations";

export const ILLUSTRATIVE_FIXTURE_EXPLANATION =
  "This chart shows fixed demonstration numbers for evaluating the interface. Live satellite data is not connected for this sample chart. These lines remain illustrative regardless of entered coordinates.";

export const ILLUSTRATIVE_SAMPLE_METRICS: DemonstrationMetric[] = [
  { period: "Interval 1", surfaceMoistureIndex: 42, thermalHoursIndex: 28 },
  { period: "Interval 2", surfaceMoistureIndex: 58, thermalHoursIndex: 35 },
  { period: "Interval 3", surfaceMoistureIndex: 65, thermalHoursIndex: 50 },
  { period: "Interval 4", surfaceMoistureIndex: 72, thermalHoursIndex: 68 },
  { period: "Interval 5", surfaceMoistureIndex: 60, thermalHoursIndex: 75 },
  { period: "Interval 6", surfaceMoistureIndex: 45, thermalHoursIndex: 82 },
  { period: "Interval 7", surfaceMoistureIndex: 38, thermalHoursIndex: 78 },
  { period: "Interval 8", surfaceMoistureIndex: 30, thermalHoursIndex: 70 },
  { period: "Interval 9", surfaceMoistureIndex: 35, thermalHoursIndex: 62 },
  { period: "Interval 10", surfaceMoistureIndex: 48, thermalHoursIndex: 52 },
  { period: "Interval 11", surfaceMoistureIndex: 55, thermalHoursIndex: 40 },
  { period: "Interval 12", surfaceMoistureIndex: 46, thermalHoursIndex: 32 },
];

export const DEMO_ALTERNATIVE_A = {
  id: "alt-a",
  title: "Alternative A: Adding Legumes for Soil Health",
  tag: "Soil Health Demonstration",
  summary:
    "An example crop plan that introduces a nitrogen-fixing legume crop between main crops to build soil organic matter and reduce synthetic fertilizer demand.",
  crops: ["Deep-Rooting Cereal or Grain", "Nitrogen-Fixing Pulse / Legume", "Cover Crop / Biomass Builder"],
  whatChanges: [
    "Replaces back-to-back heavy feeder crops with a nitrogen-fixing legume phase.",
    "Keeps the soil covered for more weeks of the year to prevent topsoil erosion.",
    "Introduces roots with different depths to break up subsoil layers naturally.",
  ],
  whatToInvestigate: [
    "How much synthetic nitrogen fertilizer could be reduced in the following crop cycle.",
    "Whether local seed suppliers stock certified inoculated legume varieties suitable for your climate.",
    "How labor and equipment demands during planting and harvest fit into your current seasonal schedule.",
  ],
  whatNeedsLocalChecking: [
    "Check local soil pH with a laboratory test (legumes struggle in soils with high acidity below pH 5.5).",
    "Consult local agricultural extension officers or neighboring farmers about pest cycles for this legume.",
    "Verify whether local grain elevators or buyers offer fair contracts for this pulse crop.",
  ],
  whatInformationIsMissing: [
    "Demonstration status: Illustrative sample only. Sourced evaluation requires entering coordinates and crops in the rotation explorer.",
    "Exact regional planting and harvesting calendar dates are not calculated in this demonstration card.",
    "Expected harvest yield and market price comparisons must be checked with local buyers.",
  ],
};

export const DEMO_ALTERNATIVE_B = {
  id: "alt-b",
  title: "Alternative B: Saving Water & Ground Cover",
  tag: "Water Conservation Demonstration",
  summary:
    "An example crop plan that uses drought-hardy crops and protective crop residue (mulch) to keep moisture in the soil during hot, dry spells.",
  crops: ["Drought-Tolerant Grain (Sorghum / Millet type)", "Protective Stubble / Cover Crop", "Deep Tap-Rooted Crop"],
  whatChanges: [
    "Swaps high-water crops for varieties known for drought tolerance in dry growing seasons.",
    "Leaves plant stalks and mulch on the field after harvest instead of bare-soil fallow.",
    "Uses crops that send roots deep into the subsoil to access deeper moisture reserves.",
  ],
  whatToInvestigate: [
    "Whether your planter or seeder can handle planting directly through surface stubble (minimum tillage).",
    "How much soil evaporation is reduced by keeping stubble on the soil surface.",
    "Whether crop yields are more stable from year to year during dry periods.",
  ],
  whatNeedsLocalChecking: [
    "Check with local agronomy advisors on the best termination timing for cover crops so they do not take water from the main crop.",
    "Inspect fields for hardpan compaction layers that could stop deep taproots from reaching subsoil water.",
    "Review local water rights, irrigation allocation rules, or seasonal rainfall reliability.",
  ],
  whatInformationIsMissing: [
    "Demonstration status: Illustrative sample only. Sourced evaluation requires entering coordinates and crops in the rotation explorer.",
    "Regional weed and insect pressures under mulch retention are not evaluated in this prototype.",
    "Local market liquidity and transport costs for alternative grains must be checked independently.",
  ],
};
