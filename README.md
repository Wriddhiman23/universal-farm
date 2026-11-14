# Universal Farm — Agricultural Decision-Support Workspace

A farmer-centred, location-agnostic decision-support prototype addressing the NASA Space Apps Challenge **“Field Shift: Adapting Farms with NASA Data.”**

---

## Current Status: Field-Ready Prototype & Evidence Pack 1 Integration

Universal Farm combines real historical Earth observation data with a deterministic crop rotation feasibility engine and literature-sourced agronomic knowledge:

1. **Evidence Pack 1 (Temperate & Mediterranean Semi-Arid Cropping System, v1.0.0)**:
   - Contains 7 literature-sourced crops: Bread Wheat, Feed Barley, Chickpea, Field Pea, Canola, Grain Sorghum, and an Oat & Vetch Cover Crop mixture.
   - All physiological thresholds (thermal limits, indicative water demand, soil pH and clay tolerance, 3-year replant break intervals) are traceable to published literature: **FAO GAEZ v5**, **FAO Irrigation & Drainage Paper No. 33**, **FAO Paper No. 56**, and regional agricultural extension pathology guides.
2. **Deterministic Rotation Feasibility Engine**:
   - Replaces static demonstration cards with an algorithmic pipeline that evaluates the farmer's actual crop sequence without synthetic substitution.
   - Applies hard constraints: moisture deficits under rainfed conditions (e.g. disqualifying Sorghum when annual precipitation < 350 mm) and soil texture sensitivities (e.g. disqualifying Field Pea on poorly drained clay soils).
   - Generates 2 feasible multi-year alternatives: **Alternative A (Diversified 4-Year Cereal-Pulse-Oilseed Rotation)** and **Alternative B (Moisture-Retention & Continuous Cover Rotation)**.
   - Answers 4 structured farmer-centered questions for every plan:
     - *What changes?*
     - *What might be worth investigating?*
     - *What needs checking locally?*
     - *What information is missing?*
   - Transparently audits and displays disqualified candidate sequences.
3. **Interactive OpenStreetMap Point Picker**:
   - Leaflet/OSM slippy map with tile caching, zoom/pan controls, coordinate crosshairs, and OSM attribution.
   - Manual coordinate input preserved as first-class fallback.
   - *"Use my device location"* action protected by a mandatory confirmation modal asking *"Is this device located at your farm?"* to prevent silently assuming device position represents the farm.
4. **NASA POWER Multi-Year Historical Analysis**:
   - Real connection to the public **NASA POWER Daily Point API** (`T2M`, `T2M_MAX`, `T2M_MIN`, `PRECTOTCORR`).
   - Supports single-period seasonal loads (up to 366 days) and chunked multi-year climate summaries (annual precipitation, driest/wettest years, frost days, and heat stress days).
5. **Decision-Support Report Export**:
   - One-click machine-readable JSON export capturing farm profile inputs, weather observations, rotation evaluations, and advisory disclaimers.
6. **Farmer-Centered Simple View (4 Large Visual Tools)**:
   - High-contrast visual interface with touch targets ≥ 48 CSS pixels, large text, and distinct iconography without relying on color alone.
   - Organised into four large tool cards:
     - **My Field**: Location status, water availability, and soil texture picture choices with "Not sure" fallbacks.
     - **What I See**: Visual scouting picture choices strictly bounded as visual notes—never confirmed diagnoses or chemical treatment advice.
     - **Past Weather**: Real observed NASA POWER daily history bound to field coordinates, explicit units (`°C`, `mm`), satellite coverage disclosure, non-forecast warning, short-period warning, and period rainfall distinction.
     - **My Crop Plan**: Deterministic feasibility evaluation against Evidence Pack 1, showing feasible next crops, disqualified sequences with agronomic citations, and multi-year alternatives.
   - Detailed charts, tables, manual coordinates, and citations kept accessible under expandable `<details>` sections.

---

## Quality Gate Verification Results

All automated quality checks have been executed and passed:

| Gate | Command | Actual Result |
| :--- | :--- | :--- |
| **Unit & Integration Tests** | `npm run test` | **PASSED** (63 tests passed across 9 test suites in non-watch mode via Vitest) |
| **Live NASA API Integration** | `src/test/nasaPowerLive.integration.test.ts` | **PASSED** (Real live network call to `power.larc.nasa.gov` verified in 1180ms) |
| **Linting** | `npm run lint` | **PASSED** (0 errors, 0 warnings across all files via ESLint 9 + TypeScript-ESLint) |
| **Production Build** | `npm run build` | **PASSED** (Vite v6 production bundle built successfully in `web/dist/` in 5.88s) |
| **Browser Layout Checks** | MCP Browser Tools | **NOT RUN** (Browser DevTools MCP tools not available in this environment; verify manually via browser) |

### Test Suites Breakdown (63 tests total):
- `simpleView.test.ts` (7 tests): Verifies 4 large tool cards (My Field, What I See, Past Weather, My Crop Plan), touch targets >= 48px, "Not sure" options, non-diagnosis observation boundaries, weather safeguards (non-forecast warning, short-period warning, period rainfall distinction), and deterministic crop rotation feasibility.
- `cropCatalogue.test.ts` (4 tests): Verifies 7 crops, parameter bounds, literature citations, component evidence vs mixture assumptions, and fuzzy name matching.
- `rotationEngine.test.ts` (17 tests): Verifies sufficiency checks, baseline evaluation without substitution, botanical family repetition warnings, candidate generation, hard constraints (sorghum moisture deficit, pea clay sensitivity), calendar-backed schedule generation across both hemispheres, honest gap reporting for unmapped crops, and deterministic reproducibility.
- `nasaPowerMultiYear.test.ts` (3 tests): Verifies annual chunk aggregation, driest/wettest year calculation, frost/heat stress counts, and in-memory caching.
- `exportReport.test.ts` (2 tests): Verifies authentic report payload structure, farm inputs preservation, and literature disclaimers.
- `coordinateValidation.test.ts` (9 tests): Global coordinate validation, negative/zero coordinate handling, and boundary error messages.
- `farmState.test.ts` (5 tests): State persistence, priority selection, and form resets.
- `nasaPowerService.test.ts` (15 tests): URLSearchParams building, -999 sentinel parsing, rate limiting, and network drop recovery.
- `nasaPowerLive.integration.test.ts` (1 test): Live HTTP 200 request to NASA POWER endpoint.

---

## Privacy & Architectural Safeguards

- **Pure Client-Side Execution**: All processing, crop matching, rotation feasibility evaluations, and report generation execute directly in the user's browser.
- **Zero Server-Side Credentials**: No API keys, secret tokens, or cloud databases are stored or required.
- **Data Minimization Guarantee**:
  - Only numeric latitude, numeric longitude, and date ranges are transmitted to NASA POWER.
  - Only map tile coordinates are transmitted to OpenStreetMap.
  - Farm names, field boundaries, crop histories, soil observations, and farmer priorities remain strictly in local memory and are never transmitted to external services.
- **No Silent Fallback**: If coordinates are missing or NASA requests fail, the application surfaces clear error feedback rather than silently falling back to demonstration fixtures.

---

## Deployment & Continuous Delivery

Universal Farm is continuously deployed to Netlify directly from the public GitHub repository:

- **Public GitHub Repository**: [https://github.com/Wriddhiman23/universal-farm](https://github.com/Wriddhiman23/universal-farm)
- **Production URL**: [https://flame-in-freefall.netlify.app](https://flame-in-freefall.netlify.app)
- **Production Branch**: `main`
- **Build Pipeline**: Netlify GitHub App continuous integration
  - Base directory: `web`
  - Build command: `npm run build`
  - Publish directory: `dist` (relative to `web`)
  - SPA Routing: Configured via root `netlify.toml` with 200 rewrite for client-side routing

---

## Directory & File Structure

```text
universal-farm/
├── AGENTS.md                  # Project-wide engineering and evidence standards
├── ANTIGRAVITY_PROMPT.md       # Stage 1 baseline requirements
├── IMPLEMENTATION_STATUS.md   # Detailed software module inventory and source adapters
├── READINESS_REPORT.md        # Field-readiness audit following READINESS_CHECKLIST.md
├── README.md                  # System overview, test results, and startup instructions
├── universal-farm-field-ready-plan/ # Upstream field-ready architecture and resource specifications
└── web/                       # React 18 + TypeScript + Vite application
    ├── package.json           # Scripts (dev, build, lint, test) and locked dependencies
    ├── package-lock.json       # Committed lockfile
    ├── tsconfig.json          # TypeScript project references
    ├── vite.config.ts         # Vite bundler configuration
    ├── tailwind.config.js     # Forest green, warm off-white, and charcoal tokens
    ├── eslint.config.js       # Flat ESLint configuration
    ├── index.html             # Accessible semantic HTML shell
    └── src/
        ├── App.tsx            # Main application shell with dynamic header and navigation
        ├── data/
        │   └── cropCatalogue.ts       # Evidence Pack 1: 7 crops, break rules, and FAO citations
        ├── services/
        │   ├── rotationEngine.ts      # Deterministic rotation feasibility and comparison engine
        │   ├── nasaPower.ts           # NASA POWER single-period fetcher, parser, and cache
        │   ├── nasaPowerMultiYear.ts  # Multi-year climate aggregation and caching
        │   └── exportReport.ts        # Decision-support report builder and JSON download
        ├── components/
        │   ├── farm/
        │   │   ├── CoordinateInput.tsx # Toggle between Map Point Picker and numeric input
        │   │   ├── FarmForm.tsx        # 4-step farmer workflow with NASA weather panel
        │   │   └── PriorityControls.tsx # Farmer goal cards (water, soil, markets)
        │   ├── map/
        │   │   └── MapPointPicker.tsx  # Leaflet/OSM slippy map with device location confirmation
        │   ├── crops/
        │   │   └── CropCatalogueModal.tsx # Accessible modal browsing crop parameters & citations
        │   ├── explorer/
        │   │   └── RotationExplorer.tsx # Evaluated baseline, feasible alternatives & disqualified audit
        │   ├── nasa/
        │   │   └── NasaWeatherPanel.tsx # Weather data controls, charts, tables, and provenance
        │   └── evidence/
        │       └── EvidenceAndLimitations.tsx # Transparent data provenance and advisory boundaries
        └── test/
            ├── cropCatalogue.test.ts
            ├── rotationEngine.test.ts
            ├── nasaPowerMultiYear.test.ts
            ├── exportReport.test.ts
            ├── coordinateValidation.test.ts
            ├── farmState.test.ts
            ├── nasaPowerService.test.ts
            └── nasaPowerLive.integration.test.ts
```

---

## Local Verification & Startup Commands

**Prerequisites**: Node.js (v22+ or v24) and npm.

### 1. Run All Automated Quality Gates

```bash
cd /home/wriddhiman/projects/universal-farm/web

# Run all 53 unit and integration tests in non-watch mode
npm run test

# Run ESLint (zero errors/warnings expected)
npm run lint

# Verify TypeScript compilation and production bundle build
npm run build
```

### 2. Start the Local Development Server

```bash
cd /home/wriddhiman/projects/universal-farm/web
npm run dev -- --host 0.0.0.0 --port 5173 --strictPort
```

Open `http://localhost:5173` in your browser. (Press `Ctrl+C` in the terminal when finished to stop the server; do not leave dev servers running).

---

## Scientific Honesty & Readiness Boundaries

See [READINESS_REPORT.md](file:///home/wriddhiman/projects/universal-farm/READINESS_REPORT.md) and [IMPLEMENTATION_STATUS.md](file:///home/wriddhiman/projects/universal-farm/IMPLEMENTATION_STATUS.md) for full acceptance status.

- **Human Agronomic Review Pending**: While all agronomic rules in Evidence Pack 1 are directly cited from official FAO and agricultural extension publications, they have **not yet been reviewed by an identifiable, certified local agronomist or extension specialist** for specific regional cultivars.
- **Supervised Field Trials Pending**: No controlled multi-year farm trials have been conducted under this software.
- **No Fabricated Scores**: Universal Farm does not calculate synthetic 0–100 suitability scores, projected income gains, or fabricated yield predictions.
- **Geographic Scope**: Evidence Pack 1 is explicitly scoped for temperate & Mediterranean semi-arid cropping systems (latitudes 28°–48°N and 28°–45°S). Other geographic zones yield an actionable `insufficient_evidence` result.
- **Decision-Support Only**: This application does not replace local soil testing, weed scouting, or accredited agricultural extension advice.

---

*Developed for the NASA Space Apps Challenge “Field Shift: Adapting Farms with NASA Data.” Not endorsed by or affiliated with NASA.*
