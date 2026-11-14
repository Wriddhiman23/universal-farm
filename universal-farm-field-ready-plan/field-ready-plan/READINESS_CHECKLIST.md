# Acceptance and Field-Readiness Checklist

All items start **unassessed**. Check them only with evidence. Creating this file, passing a build, or describing a test is not completion. Optional datasets are not mandatory release requirements unless a displayed assessment depends on them.

## A. Existing application and data regression

- [ ] Current code and Git state inspected; unrelated work preserved.
- [ ] POWER request, chart, table and source metadata function in the actual application.
- [ ] Zero values and negative temperatures remain valid; missing/sentinel values are not rendered as zero.
- [ ] Loading, errors, cancellation and changed-location/date states are tested.
- [ ] No runtime sample fallback is used for failed real requests.
- [ ] Check the previously verified 45 N, 10 E, 1–7 Jan 2025 LST case against the recorded results: 4.85 C mean, 13.09 C maximum, 0 C minimum, 14.8 mm total precipitation and seven valid days. The original raw response was not retained in this pack; save a fresh authentic response with metadata for reproducible fixture tests. Document any source revision rather than hiding it by hard-coding runtime values.

## B. Source provenance and coverage

- [ ] Every enabled adapter has a verified request or authentic imported dataset extract, product/version, license, units and access state.
- [ ] Geographic footprint, time range, native support and quality/missing coverage are checked for the selected farm.
- [ ] Historical data, scenarios, modeled context and direct/user observations are distinguished.
- [ ] LST/UTC differences and rate-to-accumulation conversions are explicit.
- [ ] Coarse or resampled data are not presented as precise field sensors.
- [ ] Multi-year reference period and completeness are disclosed; no unsupported climate-normal or future-weather claim.
- [ ] U.S./regional data sources are not used as global defaults.
- [ ] Suomi NPP/VIIRS continuity and any other relevant current product alert are handled if those adapters are used.
- [ ] Optional unavailable sources are clearly indicated without breaking unrelated supported features.

## C. Real crop-rotation functionality

- [ ] At least one non-fabricated, sourced crop/production-system pack supports an actual end-to-end comparison.
- [ ] Each used crop fact and rule has applicability, units, citation and review status.
- [ ] Baseline is the farmer's input, not a substituted example.
- [ ] Candidate calendars respect durations, planting/harvest windows and applicable sequence rules.
- [ ] Hard constraints and preferences are separate and explained.
- [ ] Baseline plus feasible alternatives are compared; insufficient alternatives produce an honest explanation.
- [ ] Missing evidence triggers partial/insufficient assessment rather than an invented favorable score.
- [ ] Quantitative claims have documented methods, required inputs, coverage and appropriate validation.
- [ ] Identical input/evidence versions reproduce the comparison.
- [ ] Catalogue coverage and unsupported conditions are visible to users.

## D. Farmer-facing use

- [ ] Real location selection works, with manual fallback and no automatic GPS permission request.
- [ ] Device position is confirmed as the farm location before use.
- [ ] Unknown options, local crop-name ambiguity and editable assumptions are handled.
- [ ] Plain-language plans, calendars, evidence and local checks are understandable.
- [ ] Mobile, keyboard, focus, contrast, touch targets and reduced motion are tested.
- [ ] Exported report retains sources, dates, assumptions and limitations.
- [ ] Only implemented translations/offline capabilities are advertised.
- [ ] Retained/offline results show their actual age and are not presented as current conditions.

## E. Engineering and privacy

- [ ] Typed frontend/domain service contracts, and backend API contracts where present, are documented and tested.
- [ ] Browser calls use intended routing; production code has no accidental local-machine backend dependency.
- [ ] Dependency locks, reproducible startup, health checks and production builds are verified.
- [ ] Caching/deduplication, timeouts, limited retries, rate controls and external-service failures are tested.
- [ ] Credentials remain server-side; no secrets in code, URLs exposed to users, logs, exports or repository history introduced by this task.
- [ ] Storage/telemetry disclosures reflect actual behaviour; farm records are not public by default.
- [ ] If records persist remotely, ownership/authorization, deletion, retention and backups are implemented and tested.
- [ ] If no authorization system exists, the application does not expose durable personal farm records through a shared anonymous store.
- [ ] No unsupported cross-user access, injection path or unsafe file-upload path is left untested where those features exist.
- [ ] Deployment/HTTPS and environment configuration are actually verified for the intended release, not merely documented.
- [ ] Monitoring, service-cost limits and operational recovery responsibilities are documented.

## F. Human agricultural and field validation — cannot be self-certified by an AI agent

- [ ] An identifiable qualified reviewer or appropriate local agricultural service has reviewed rules for the stated crops, management systems and conditions; record the scope/date and permitted attribution.
- [ ] Historical/reference cases are checked against authoritative guidance; limitations and disagreements are documented.
- [ ] Farmers or extension staff have tried the complete workflow and understood its boundaries.
- [ ] A supervised pilot has an agreed purpose, locations/production systems, observations, feedback route and stop/escalation criteria.
- [ ] Actual pilot outcomes and problematic recommendations are recorded; no simulated testimonials or fabricated trials.
- [ ] Claims about longer-term soil, water, yield or income benefits are limited to the available evidence; software tests are not substituted for field evidence.
- [ ] Release scope, supported conditions and the process for reporting problems are explicit.

## Required final report

Create `READINESS_REPORT.md` with:

| Area | Status | Evidence | Blockers/limits | Next action/owner |
|---|---|---|---|---|
| Software implementation | Unassessed | | | |
| Real-source integration | Unassessed | | | |
| Crop/rule source completeness | Unassessed | | | |
| Human agronomic review | Unassessed | | | |
| Farmer usability checks | Unassessed | | | |
| Supervised field-pilot evidence | Unassessed | | | |
| Deployment/operations | Unassessed | | | |

Use accurate statuses such as implemented-and-tested, pending, blocked, unsupported, or not applicable. Never label human review or field trials complete because an agent assumed an expert role.

The software can be delivered as a functional evidence-backed release while human gates remain pending. Claim readiness for a supervised field pilot or broader use only within the scope supported by the corresponding evidence—not by removing a banner.
