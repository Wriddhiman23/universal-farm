# Universal Farm — Antigravity Stage 1 Build Prompt

Act as a senior full-stack engineer, product designer, and test engineer. Build a professional-quality, maintainable frontend prototype for **Universal Farm**, an independent project addressing the NASA Space Apps challenge **“Field Shift: Adapting Farms with NASA Data.”**

## Product purpose

The eventual application will combine NASA environmental evidence, local soil information, crop characteristics, and farmer priorities to help people explore crop-rotation strategies. It must support—not replace—farmers and local agricultural experts.

**Geographic scope: location-agnostic, worldwide farm input.** Do not hard-code West Bengal, India, a default country, Northern Hemisphere seasons, or one regional crop calendar. Worldwide input does not establish worldwide dataset availability or validated agricultural advice.

## Inspect and plan before implementation

1. Read `AGENTS.md` and inspect this workspace.
2. Preserve the root instruction files. Create the application in a new `web/` subdirectory; do not scaffold over the root or delete existing files.
3. Present the proposed architecture, dependencies, files, commands, risks, and validation plan.
4. Wait for explicit approval before editing files or installing dependencies.

## Stage 1 boundaries

Implement the frontend only. Do not add NASA API calls, a backend, authentication, databases, payments, a chatbot, remote geocoding, GPS permission requests, or agricultural prediction models. Do not add a weather forecast or claim the application has live observations.

Use React, TypeScript, Vite, and a compatible Tailwind CSS integration. Use a committed package lockfile and modular, typed components. Avoid unnecessary dependencies or heavy 3D effects.

## Design direction

Create a premium agricultural decision-support workspace—not just a landing page. Use forest green, warm off-white, charcoal text, restrained blue accents, strong typography, generous spacing, polished cards, readable visualizations, and purposeful transitions. Support reduced motion, keyboard navigation, visible focus, labelled inputs, and readable contrast.

Make the interface work at mobile, tablet, and desktop widths. Use English in Stage 1 without claiming multilingual support. Display units explicitly; do not silently mix temperature, rainfall, or area units. Do not use NASA logos or imply NASA endorsement.

## Required working interface

### 1. My Farm

- Optional farm name and country/region/place labels, entered by the user. Do not infer administrative boundaries without a verified geographic service.
- Latitude and longitude entry for a location anywhere worldwide. Accept zero and negative values. Validate finite numbers, latitude from -90 to 90, and longitude from -180 to 180. Do not substitute a default farm when input is missing.
- Clearly distinguish valid coordinates from verified farmland or supported data coverage. Geographic validity alone establishes neither.
- Current crop-rotation input that does not assume specific crops or seasons.
- Soil-type selector with Unknown and Other options, and an irrigation selector including Unknown.
- Priority controls for water conservation, soil improvement, and market suitability. These are user preferences—not measured scientific scores.
- A working Reset button and an immediate summary of the entered farm information.
- Keep farm inputs in local application state. Do not transmit or persist them remotely.

A real map is not required in Stage 1. A polished location panel is sufficient; never present a decorative map or invented boundary as a real observation.

### 2. Rotation Explorer

- Three clearly marked demonstration cards: Existing Rotation, Alternative A, and Alternative B.
- Reflect the user's current rotation where supplied; otherwise show an honest empty state.
- For each card, expandable sections for evidence needed, potential trade-offs to investigate, information gaps, and local review requirements.
- No automatically recommended crops, invented ranking, suitability percentages, yield forecasts, water-saving estimates, soil-health scores, or market prices.
- Priority changes update the displayed preference summary, not fabricated model results.

### 3. Evidence & Limitations

- Explicit status: NASA data is not connected in Stage 1.
- Separate user-entered information, illustrative fixtures, future data needs, and unimplemented calculations.
- Explain that soil/crop information, growing calendars, markets, and dataset coverage vary by location.
- Explain that satellite estimates are not automatically field measurements, and historical observations are not forecasts.

## Sample-data rules

Display a visible **“Prototype—not for farming decisions”** banner. If you include sample charts, keep their fixed fixtures in a separate file and label each chart **“Illustrative sample—not NASA observations.”** Do not generate random environmental readings. Changing location must not pretend to fetch or change environmental observations; explain that any sample chart is a location-independent interface demonstration.

## Validation and handoff

After approval, implement Stage 1 only. Ensure every visible control works or is explicitly unavailable. Validate tab switching, preference changes, Reset, empty inputs, zero/negative coordinates, and invalid coordinate ranges.

Provide working `npm run lint` and `npm run build` commands in `web/`, run them, and fix failures. Add lightweight interaction or validation tests where practical. If browser tools are available, check desktop and mobile layouts; otherwise explicitly report that browser checks were not run. Never claim tests passed without execution evidence.

Update the root README with actual commands, implemented features, results, and limitations. Summarize changed files and remaining work. Do not leave a development server running; the user will start it separately. Stop after Stage 1 and wait for further instructions.
