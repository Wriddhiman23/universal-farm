# Start Here — Universal Farm Next Build

This pack contains instructions for the existing Antigravity project. It is **not replacement application code**, an already completed integration, or a certificate of field readiness. It preserves the working NASA POWER feature and specifies the remaining decision-support functionality.

## Included documents

1. `ANTIGRAVITY_BUILD_PROMPT.md` — master implementation task.
2. `RESOURCE_MAP.md` — challenge datasets mapped to useful features, coverage and access conditions.
3. `ROTATION_ENGINE_SPEC.md` — real crop catalogue, feasibility, calendar, comparison and evidence requirements.
4. `READINESS_CHECKLIST.md` — software acceptance plus external agronomic/field-validation gates.
5. `START_HERE.md` — these instructions.

## 1. Download and extract without replacing your project

Download `universal-farm-field-ready-plan.zip` from this conversation.

The ZIP contains only a `field-ready-plan/` subfolder. It does not include a replacement `web/`, `AGENTS.md`, or package file.

In a Linux/WSL shell, adjusting the project/download paths if necessary:

```bash
cd "$HOME/projects/universal-farm"
unzip -n "$HOME/Downloads/universal-farm-field-ready-plan.zip" -d .
ls field-ready-plan
```

If your browser downloaded through Windows, use its actual Windows download path from WSL, for example `/mnt/c/Users/YOUR_WINDOWS_USERNAME/Downloads/universal-farm-field-ready-plan.zip`. Replace that username placeholder. Never overwrite unrelated project files.

If a `field-ready-plan/` folder already exists, review versions before merging. `unzip -n` does not overwrite old files, so an older extracted pack may need deliberate updating.

## 2. Use the existing Antigravity conversation

Do not run two agents editing the same project concurrently. When the current task is finished, paste this into its conversation:

```text
Read field-ready-plan/START_HERE.md, ANTIGRAVITY_BUILD_PROMPT.md, RESOURCE_MAP.md, ROTATION_ENGINE_SPEC.md, and READINESS_CHECKLIST.md, resolving all of those filenames inside field-ready-plan/.

Use this pack as the specification for the next functional release of my existing Universal Farm project. Preserve the working NASA POWER integration and current frontend. This authorizes planning beyond the earlier frontend-only/POWER-only stages, not a rebuild. Audit the actual code, identify evidence or access blockers, and present the implementation plan for my approval. Do not claim field readiness from software tests alone.
```

If starting a fresh CLI session instead, run from the project root:

```bash
agy -i "Read all Markdown files in field-ready-plan/ and audit the existing Universal Farm project. Follow field-ready-plan/ANTIGRAVITY_BUILD_PROMPT.md. Present the implementation plan and blockers first; wait for approval before editing."
```

If your installed CLI does not support `-i`, run `agy` and paste the same instruction into the conversation. Keep action confirmations enabled.

## 3. Review and approve one coherent plan

Confirm that the agent intends to:

- preserve the existing application and verified NASA POWER functionality;
- implement a real cited crop catalogue and deterministic rotation comparisons, not renamed demo cards;
- keep worldwide input with honest crop/evidence coverage;
- justify any backend before adding it, without unnecessary migration of the working POWER connection; add verified source adapters;
- avoid invented thresholds, reviews, datasets, API endpoints or successful test claims;
- implement tests and report human validation as pending until it actually happens.

The agent may need you to confirm the first crop/production-system evidence pack. This is a validation decision, not a permanent country limitation on Universal Farm. Provide actual crops/conditions and any local references or reviewer access; do not ask it to fabricate missing knowledge.

Then send:

```text
Approved. Implement the agreed plan in tested milestones, preserving existing work. Update implementation status after each milestone. Continue independent work if an optional source is unavailable, but record blockers and never invent missing data or agronomic rules. Use normal tool confirmations and ask before paid services, credentials, destructive changes, or public deployment.
```

## 4. Require actual demonstrations and reports

At the end, request:

- a working location-to-evidence-to-rotation-comparison walkthrough;
- source URLs/product versions and actual access results;
- test commands and execution results;
- `IMPLEMENTATION_STATUS.md` and `READINESS_REPORT.md`;
- startup and approved deployment instructions;
- an explicit list of remaining data, agronomic-review and field-pilot requirements.

A source listed in a catalogue is not automatically an integrated API. A built application is not automatically a globally validated farm advisory product. Do not close essential blockers by changing status labels.

## Scope reminder

This remains a crop-rotation decision-support project. Do not expand it into pesticide/fertilizer prescriptions, guaranteed yield/profit forecasts, autonomous equipment control, or an unrelated general farm-management suite.

Primary challenge resources reviewed on 14 November 2026:
https://www.spaceappschallenge.org/2026/challenges/adapting-farms-with-nasa-data/?tab=resources
