# Universal Farm — Project Instructions

## Engineering standard

Work as a senior engineering and product-design team. Prioritize correct behaviour, maintainable typed code, responsive performance, accessible interactions, and evidence-backed reporting. Do not infer standards from the operator's personal background.

## Workspace and approval

- Follow the authorized Field-Ready Build Plan (`field-ready-plan/ANTIGRAVITY_BUILD_PROMPT.md`).
- Preserve root documents. Keep the frontend in `web/`.
- Never delete existing project content to make scaffolding succeed. Inspect and make incremental changes.
- Stay within this workspace. Ask before system-level changes, global configuration changes, or accessing unrelated files.
- Do not push code, deploy publicly, add paid services, or change Git identity without permission.
- Keep credentials out of code, prompts, logs, and version control. Pure client-side browser execution approved; zero credentials in code.

## Worldwide scope

- Do not hard-code a default country, region, crop sequence, hemisphere, or season calendar.
- Coordinate input is global; dataset coverage and agricultural validity must be checked separately.
- Never silently substitute a different location when data or input is missing.
- Validate numbers correctly, including zero and negative latitude/longitude.
- Keep user preferences separate from scientific observations and calculated results.

## Scientific honesty & Evidence Packs

- Stage 2 authorizes real historical environmental-data connections to the public NASA POWER Daily Point API (`T2M`, `T2M_MAX`, `T2M_MIN`, `PRECTOTCORR`).
- Evidence Pack 1 (Temperate & Mediterranean Semi-Arid Cropping System, v1.0.0, 7 crops) is explicitly scoped for latitudes 28°–48°N and 28°–45°S. Any farm outside this band receives an honest `insufficient_evidence` result.
- All crop rules, thermal bounds, water requirements, and rotation break intervals are traceable to published literature (FAO GAEZ v5, FAO Papers 33/56, extension pathology guides).
- Do not fabricate yield, profit, erosion tonnage, or synthetic 0–100 suitability scores.
- Distinguish implemented software from unassessed human agronomic review and field trials. Never claim field readiness on software tests alone.
- Explain missing information rather than inventing it.
- Never imply NASA or FAO endorsement or that the application replaces local agricultural expertise.

## Quality gates

- Follow the field-ready build pack in tested milestones.
- Keep the dependency lockfile and reproducible scripts.
- Run lint/build checks and report actual results. Report skipped tests honestly.
- Update README status, startup commands, and readiness reports after implementation.
- Do not leave servers running after the implementation task.
