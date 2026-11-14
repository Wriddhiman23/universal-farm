# Universal Farm — Evidence-Based Rotation Planner Build Prompt

Act as a senior full-stack engineer, Earth-observation data engineer, agricultural decision-support architect, and test engineer. Implement the next functional release of the **existing Universal Farm application** for the NASA Space Apps challenge **Field Shift: Adapting Farms with NASA Data**.

Read all documents in this `field-ready-plan/` folder. They form the implementation specification. Your engineering role does not constitute an independent agronomic review.

## 1. Scope and authorization

This task authorizes development beyond the earlier frontend-only and NASA-POWER-only stages. Preserve existing working features and the farmer-friendly visual design. Update outdated project instructions to reflect this authorized scope while retaining privacy, evidence, and safety rules.

Do not recreate the application, switch website builders, or discard existing tests. Inspect the actual project structure and Git status before editing. Avoid overwriting unrelated work. The expected frontend is `web/`, but verify rather than assume.

First present a concise implementation plan, proposed source integrations, and blocking decisions. Wait for one initial approval. After approval, execute in small tested milestones, keeping a progress document. Continue independent tasks when optional resources are unavailable; identify genuine blockers rather than fabricating completion. Keep normal action confirmations. Do not push, deploy publicly, spend money, or make system-wide changes without permission.

**Target:** a working, evidence-backed crop-rotation comparison application and a documented path to supervised field use. Do not claim that software tests alone establish field readiness. Never fabricate expert review, field trials, source access, or validation results.

## 2. Preserve and audit the current NASA POWER feature

- Verify the existing request path, charts, daily table, summaries, missing-value handling, caching, errors, and stale-response protection.
- Preserve valid zero rainfall/temperature and negative temperatures. Read fill values and units from metadata; missing values are not zeros.
- Fix chart/table rendering if tests reveal a problem. Do not infer a chart bug merely from an incomplete screenshot.
- Keep historical values labelled as historical gridded estimates, not forecasts or field sensors.
- A previously verified regression case is 45 N, 10 E, 1–7 January 2025, LST, parameters T2M/T2M_MAX/T2M_MIN/PRECTOTCORR. It yielded mean 4.85 C, maximum 13.09 C, minimum 0 C, total precipitation 14.8 mm. These are test expectations for that historical response, never production defaults or a runtime fallback. Record source revisions if a fresh response differs.

## 3. Choose a justified architecture and provenance layer

The working direct-browser POWER integration does not inherently require a backend. Keep it unless the approved architecture provides a concrete reason to change it. Crop-domain logic can also run locally when public data, bundle size and processing needs permit.

Assess whether shared caching, protected provider credentials, heavier geospatial processing, or an agreed persistence requirement justifies a server. If so, propose a small Python FastAPI service in `api/` or reuse an equivalent existing backend. Implement the server only after that architecture is approved. Do not require a migration to Replit, Supabase or another platform to complete this task.

Provide typed domain/service contracts for environmental history and coverage, the versioned crop catalogue, rotation comparison, and source/method metadata. If a backend is approved, expose corresponding documented routes plus health/readiness. Keep one clear data path per source through a typed frontend service adapter; do not introduce competing fetch paths.

For your own backend, browser code must use relative `/api/...` URLs. Configure Vite's server-side proxy for development and an explicit production routing arrangement. External public-provider requests may remain direct when supported. Do not hard-code browser-facing localhost backend URLs. Bind hosted services to 0.0.0.0 and use environment-configured ports.

Use caching appropriate to the architecture; do not add user accounts or remote personal-record storage without a defined privacy/access design. If a server needs a persistent public-data cache, SQLite is acceptable for a single-instance pilot; document the move to a shared database before multi-instance operation. Keep any protected Earthdata/provider credentials server-side, outside version control. Never place confidential tokens in a browser bundle, disable TLS verification, or invent credentials. If no server is approved, leave integrations requiring protected credentials unavailable or use a legitimate documented import workflow.

Move large raster processing or asynchronous Earthdata subset jobs outside interactive request handlers. Do not install a heavy geospatial stack unless an active integration needs it.

## 4. Implement the minimum real evidence bundle first

Follow `RESOURCE_MAP.md`:

1. Keep the existing short-period NASA POWER weather view and add a separate configurable multi-year analysis using bounded, cached requests. Preserve the existing 366-day single-view product guard unless a deliberate approved change is needed; multi-year analysis can fetch validated chunks without calling that guard a NASA service limit. A proposed initial reference is the last ten complete calendar years; disclose the actual period and completeness and do not call it a 30-year climate normal. Separate longer-term context from recent-season anomalies when the available data justify both.
2. Capture farmer-provided soil information with units, depth/date/source where available, irrigation constraints, crop history, intended growing windows, equipment/market constraints, and priorities. Unknown must remain unknown.
3. Build a versioned, cited crop-knowledge catalogue and use verified GAEZ suitability context where accessible and relevant. A portal link alone is not an integrated dataset. Do not invent a GAEZ API endpoint or crop values.
4. Add regional soil datasets only within their actual coverage. U.S. resources are not worldwide defaults.

Before claiming farm-specific comparisons, confirm the first evidence pack: candidate crops, production system, applicable geography/agroclimate, planting-window source, and review status. Ask the user once for the missing context rather than silently choosing a country from earlier work. A bounded initial evidence pack is not a permanent country restriction on the global interface.

Source crop traits from official agricultural research/extension references, dataset documentation, and traceable published methods. AI may assist extraction, but unsupported values must not enter the catalogue. If essential evidence is unavailable, build the software and report the exact blocker; do not manufacture an apparently complete agricultural engine.

## 5. Replace placeholder crop cards with the actual rotation engine

Implement `ROTATION_ENGINE_SPEC.md` as pure, testable domain logic, not LLM-generated recommendations.

- Evaluate input/evidence sufficiency and supported conditions.
- Preserve the farmer's existing rotation as the baseline, including any identified limitations.
- Generate chronological, calendar-backed alternatives from supported crop records and documented sequence rules.
- Apply documented hard constraints before comparing preferences.
- Aim to compare the baseline with at least two feasible alternatives when evidence permits. Never fabricate alternatives to fill three cards.
- Explain water-related exposure, planned soil cover, crop-family/rotation considerations, and market/practical constraints only where supported.
- Keep observed indicators, modeled assessments, qualitative literature-supported benefits, and unknown information distinct.
- Make all prioritization deterministic and inspectable. No unexplained 0–100 suitability or confidence values.
- Do not infer water sufficiency from rainfall alone, or promise yield, profit, nitrogen gain, erosion reduction, or soil-carbon percentages without a suitable documented and validated method.
- Handle unsupported crops/locations or critical gaps with an actionable insufficient-evidence result, not a reassuring default plan.

## 6. Add selected Earth-observation enhancements, not every catalogue entry

After the core bundle and engine work, implement the highest-value accessible enhancement for the supported use case: SMAP moisture context, GPM IMERG precipitation, Landsat/Sentinel vegetation/cover, SRTM terrain context, or ECOSTRESS stress/ET context.

For each integration, identify the actual product/version, footprint, dates, quality flags, authentication and license, and test a real retrieval or authentic imported subset. Record provenance. Distinguish available, configured, retrieved, unavailable, and not integrated. Do not mark all NASA sources connected when only POWER works.

If an enhancement is essential to a particular assessment, its absence must block that claim. If optional, its absence must not break unrelated supported comparisons. Never substitute fixtures or a different product without an explicit user-visible explanation.

Do not relabel POWER precipitation as IMERG, POWER wetness as SMAP, air temperature as ECOSTRESS surface temperature, or greenness as yield/soil health. Resampling does not create field-level information.

## 7. Complete the farmer workflow

- Retain worldwide input and show the evidence coverage applicable to the selected farm.
- Add a real map point picker with provider attribution/terms and a manual-coordinate fallback. Do not represent a point as a surveyed field boundary. Add place search only through a real, documented service.
- Request device location only after an explicit action; ask whether it is the farm location. Never auto-prompt on page load.
- Disclose which data go to each external provider or your server. Send NASA only the coordinates, dates and technical query fields needed for its request—not farm names, soil reports or crop histories. Treat precise farm locations as sensitive.
- Use understandable crop names, questions, unknown options, editable crop sequences, growing windows, and priorities.
- Present each plan's calendar, rationale, trade-offs, evidence, gaps, and required local checks. Let the farmer inspect or reject assumptions.
- Export a readable report plus machine-readable results containing input assumptions, data period, sources, rule version, and limitations.
- Support mobile, keyboard access, visible focus, reduced motion, and correct unit conversions. Do not claim translations or offline support that are not implemented and tested.

Use the product name Universal Farm without unnecessary development-stage badges. Keep source status and unfinished/unsupported assessments clear beside the relevant output. Do not solve missing functionality by deleting warnings or renaming demo cards.

## 8. Verification, deployment, and reporting

Execute `READINESS_CHECKLIST.md`. Include frontend/domain unit tests, backend tests if a server is implemented, contract/integration tests, end-to-end scenarios, real-source verification, and production build checks. Test realistic failure and abstention cases, not only successful demo coordinates.

Create an honest `IMPLEMENTATION_STATUS.md` and `READINESS_REPORT.md` distinguishing:

- implemented and tested software;
- verified source integrations;
- sourced but unreviewed agricultural rules;
- actual human agronomic review;
- field-pilot evidence;
- actual deployment status;
- remaining blockers and unsupported conditions.

Provide reproducible Linux startup commands, configuration examples without secrets, deployment instructions, and rollback/backup guidance where relevant. Do not leave duplicate development servers running or stop unrelated processes. Do not claim that configuration instructions equal a deployed service.

Finish by demonstrating one genuine end-to-end supported comparison, or explicitly identify the exact missing evidence preventing that demonstration. Report changed files, actual commands/results, source access results, limitations, and the next human validation action. Do not declare the tool field-ready until the corresponding external validation gates have evidence.
