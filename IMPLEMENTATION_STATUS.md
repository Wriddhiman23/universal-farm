# Universal Farm — Implementation Status Report

**Date**: November 2026  
**Milestone**: Field-Ready Prototype & Evidence Pack 1 Integration  
**Architecture**: Pure client-side React 18 + TypeScript + Vite (zero backend credentials, local memory privacy)

---

## 1. Executive Summary

Universal Farm has been extended from a demonstration prototype into an evidence-backed crop rotation decision-support system. It integrates:
1. **Evidence Pack 1**: A non-fabricated, literature-sourced agronomic catalogue of 7 temperate and Mediterranean semi-arid crops with traceable citations to FAO and agricultural extension guides.
2. **Deterministic Rotation Feasibility Engine**: Replaces static demonstration cards with an algorithmic engine that evaluates the farmer's real baseline sequence, applies hard agronomic constraints (water deficit, clay intolerance, disease breaks), and generates feasible multi-year alternatives answering 4 farmer-centered questions.
3. **OpenStreetMap Point Picker**: An interactive map point picker with manual coordinate fallback and explicit device-location confirmation (*"Is this device located at your farm?"*).
4. **Multi-Year Environmental Analysis**: Chunked multi-year historical weather aggregation via the public NASA POWER Daily Point API.
5. **Decision-Support Export**: Machine-readable JSON export preserving farm profile inputs, weather evidence, comparisons, and advisory disclaimers.

---

## 2. Implemented Software Modules

| Module Path | Primary Purpose | Key Functionality |
| :--- | :--- | :--- |
| `web/src/data/cropCatalogue.ts` | Machine-readable agronomic catalogue | Defines `CropDefinition`, `EvidencePackMetadata`, and 7 temperate/Mediterranean crops with thermal thresholds, water demands, soil pH/clay tolerances, 3-year break rules, calendar windows for both hemispheres, and traceable citations. Includes fuzzy crop name matcher (`matchCropToCatalogue`). |
| `web/src/services/rotationEngine.ts` | Deterministic rotation feasibility engine | Implements `assessInputSufficiency` (checks latitude bounds 28°–48°N and 28°–45°S), `evaluateBaseline` (analyzes farmer sequence without synthetic substitution), `generateFeasibleAlternatives` (applies hard constraints and generates 2 distinct feasible alternatives), and `executeRotationComparison`. |
| `web/src/components/map/MapPointPicker.tsx` | Interactive location selection | Slippy map with OpenStreetMap tiles, zoom/pan controls, coordinate crosshair/pin, OSM attribution notice, and `"Use my device location"` with explicit farm location confirmation modal. |
| `web/src/components/farm/CoordinateInput.tsx` | Coordinate entry orchestration | Allows seamless toggling between interactive map point picking and manual numeric coordinate entry with full validation. |
| `web/src/services/nasaPowerMultiYear.ts` | Multi-year weather analysis | Queries bounded annual slices (e.g. 2020–2024) from NASA POWER, aggregates annual precipitation, identifies driest/wettest years, counts frost/heat stress days, and caches results in memory. |
| `web/src/components/crops/CropCatalogueModal.tsx` | Farmer-facing catalogue browser | Accessible modal allowing farmers to inspect all 7 crops, their parameters, break intervals, and literature citations. |
| `web/src/services/exportReport.ts` | Decision-support report export | Builds and downloads an authentic JSON export containing farm inputs, weather observations, rotation evaluations, and scientific disclaimers. |
| `web/src/components/explorer/RotationExplorer.tsx` | Decision-support interface | Renders input sufficiency status, baseline evaluation, feasible alternatives answering 4 farmer questions, disqualified candidate audit, catalogue modal, and JSON export button. |

---

## 3. Evidence Pack 1 — Sourced Crop Catalogue

**Pack ID**: `temperate_mediterranean_v1`  
**Target Agroclimate**: Cool, moist winters and warm-to-hot semi-arid summers (latitudes 28°–48°N and 28°–45°S; annual rainfall 250–800 mm).  
**Crops Sourced (7 total)**:
1. **Bread Wheat** (*Triticum aestivum*, Poaceae) — Cereal
2. **Feed Barley** (*Hordeum vulgare*, Poaceae) — Cereal
3. **Chickpea** (*Cicer arietinum*, Fabaceae) — Pulse / Legume
4. **Field Pea** (*Pisum sativum*, Fabaceae) — Pulse / Legume
5. **Canola / Oilseed Rape** (*Brassica napus*, Brassicaceae) — Oilseed
6. **Grain Sorghum** (*Sorghum bicolor*, Poaceae) — Summer Cereal
7. **Cover Crop Mixture** (*Vicia sativa + Avena sativa*, Fabaceae + Poaceae) — Green manure / cover

### Traceable Literature Sources:
- **FAO GAEZ v5**: Global Agro-Ecological Zones v5 Model Documentation & Crop Requirements (FAO/IIASA, 2021).
- **FAO Irrigation & Drainage Paper No. 33**: Yield response to water (Doorenbos & Kassam, 1979).
- **FAO Irrigation & Drainage Paper No. 56**: Crop evapotranspiration (Allen et al., 1998).
- **FAO Soils Bulletin No. 80**: The importance of soil organic matter (FAO, 2005).
- **Australian Oilseeds Federation**: Better Soils & Blackleg Management Guide (2019).
- **Pulse Australia**: Chickpea & Field Pea Disease Management & Break Crop Guidelines (2020).
- **USDA-NRCS Standard 340**: Cover Crop Conservation Practice Standard (2020).

---

## 4. Real-Source Adapters & Privacy Disclosures

### 1. NASA POWER Daily Point API
- **Endpoint**: `https://power.larc.nasa.gov/api/temporal/daily/point`
- **Parameters**: `T2M`, `T2M_MAX`, `T2M_MIN`, `PRECTOTCORR`, `community=AG`, `time-standard=LST`, `format=JSON`.
- **Privacy**: Only numeric coordinates and requested date range are transmitted. No farm names or personal data leave the device.
- **Verification**: Verified with live integration test returning HTTP 200, MERRA-2/POWER assimilation data, and valid records.

### 2. OpenStreetMap Tile Server
- **Endpoint**: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
- **Attribution**: Clearly displayed as *“© OpenStreetMap contributors”* with link to OSM copyright and tile usage policy.
- **Privacy Disclosure**: Explains to the user that loading map tiles transmits tile coordinates to the OpenStreetMap tile server.

---

## 5. Automated Verification Results

All automated quality gates have been executed and passed:

- **Vitest Unit & Integration Tests**: **56 passed** across 8 test suites (0 failed).
  - `coordinateValidation.test.ts` (9 tests)
  - `farmState.test.ts` (5 tests)
  - `nasaPowerService.test.ts` (15 tests)
  - `nasaPowerLive.integration.test.ts` (1 live network test)
  - `cropCatalogue.test.ts` (4 tests)
  - `rotationEngine.test.ts` (17 tests)
  - `nasaPowerMultiYear.test.ts` (3 tests)
  - `exportReport.test.ts` (2 tests)
- **ESLint Code Quality**: **0 errors, 0 warnings** across all files.
- **TypeScript & Vite Production Build**: **Passed** (`dist/` generated with clean chunks, gzip sizes computed).

---

## 6. Agronomic Review & Field Readiness Boundaries

> [!IMPORTANT]
> **Human Agronomic Review Pending**: While all agronomic properties and sequence break rules in Evidence Pack 1 are directly cited from official FAO and agricultural extension publications, they have **not yet been reviewed by an identifiable, certified local agronomist or extension specialist** for specific regional cultivars.
>
> **Supervised Field Trials Pending**: No controlled multi-year farm trials have been conducted under this software.
>
> **Scientific Guardrails Enforced**:
> - Universal Farm does NOT calculate synthetic 0–100 suitability scores or fabricate yield/income projections.
> - Comparisons present clear trade-offs across 4 questions: *What changes?*, *What might be worth investigating?*, *What needs checking locally?*, and *What information is missing?*.
> - Any farm location outside Evidence Pack 1's geographic boundaries (28°–48°N, 28°–45°S) receives an honest `insufficient_evidence` result.
