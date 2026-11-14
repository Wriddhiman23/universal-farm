# Rotation Engine — Functional and Evidence Requirements

## 1. Objective

Replace demonstration cards with reproducible, calendar-backed comparisons of the farmer's existing crop sequence and supported alternatives. This is a rotation decision-support system, not an all-purpose farm-management, chemical-prescription, or yield-guarantee application.

The global interface must remain location-agnostic. Agricultural evidence applicability must be explicit and can expand through versioned knowledge packs. A mathematically valid coordinate is neither verified farmland nor proof of crop-evidence coverage.

## 2. Inputs and provenance

### Farm/management profile

- Confirmed point location and optional real field boundary; do not invent a polygon from a pin.
- Existing crop sequence and relevant history, with dates/windows where known.
- Intended planning horizon and real growing/harvest windows; support cross-year seasons and either hemisphere.
- Soil observations or tests with property, value, unit, depth, date, and measured/reported/modeled origin. Unknown is a first-class value.
- Irrigation/rainfed status and water constraints, including unknown.
- Equipment, labor, market, forage or crop exclusions reported by the farmer, distinguished from verified external data.
- Priorities expressed as preferences. Farmer weights are not scientific measurements.
- Optional management facts that change interpretation, such as residue removal or incorporation. Do not assume a legume's biomass remains in the field.

Reuse the current state and confirmation workflow. Map free-text crop names to supported catalogue entries only with a documented lookup and user confirmation when ambiguous. Do not silently guess an unfamiliar local crop name.

### Environmental evidence

Use actual farm/query-linked source data from the active adapters. For seasonal comparisons use an explicit reference period with valid-data coverage; a seven-day API test is not a suitability baseline. Historical exposure indicators must not be presented as next season's forecast.

## 3. Crop and rule catalogue

Create a machine-readable, versioned catalogue. Each applicable fact/rule needs:

- crop identity and relevant cultivar/production-system distinctions;
- property/rule name, value or range, units and interpretation;
- geography/agroclimate, season, irrigation and management applicability;
- source URL/DOI/document title, publication/version date and a traceable section/page/table;
- original source meaning, extraction/conversion method and limitations;
- review status and evidence of any actual human review.

Potential properties include growing duration/windows, climatic limits, soil constraints, documented water-demand information, crop family, predecessor/break restrictions, cover/residue characteristics, and literature-supported agronomic contributions. Do not require or invent a number for every property. Missing rule information is not proof of safety or compatibility.

Do not create one universal threshold for all cultivars, climates, soil depths or management systems. Do not equate soil organic carbon with organic matter without a justified applicable conversion. Check licenses before redistributing source files; normalized facts still need attribution.

### Initial evidence pack

The first operational pack must specify crops, supported conditions, source references, and review scope. Confirm missing production context with the user; do not automatically select West Bengal, India, or the public Italian API test point. A real initial pack is required before claiming an end-to-end agricultural comparison. Empty schemas or generated example traits do not fulfill this requirement.

Outside supported evidence coverage, provide environmental history and an actionable data-gap message. Do not quietly apply a convenient pack from another region. The worldwide interface stays usable without claiming universally validated advice.

## 4. Deterministic processing pipeline

### A. Assess sufficiency

Determine which comparisons are justified by the available evidence. Return an explicit status such as supported comparison, partial assessment, or insufficient evidence. Explain missing inputs and why they matter. Do not equate all unknown fields to complete suitability or assign an arbitrary confidence percentage.

### B. Evaluate the baseline

Retain the existing rotation even when it has limitations. Show what can and cannot be assessed against current data; do not silently replace it with an invented cereal sequence.

### C. Generate candidates

Construct bounded candidate sequences from supported crops and crop-specific planting/harvest windows over the selected horizon. Preserve chronological feasibility and fallow/cover periods. Do not allow impossible overlaps unless an explicitly supported intercropping model is introduced separately.

Use explicit, traceable sequence rules. Crop-family identity alone does not establish every pest/disease break interval. Do not treat a cover crop or deep-rooting crop as universally beneficial regardless of water and management constraints.

### D. Apply documented hard constraints

Reject or flag a plan only on an applicable documented rule or a farmer's explicit constraint. Distinguish a disqualifier from uncertain evidence. Explain the rule and source behind every rejection.

Do not hard-reject irrigated crops from rainfall alone. Do not infer soil pH or drainage from weather. Do not interpret a coarse regional pixel as a precise plot measurement.

### E. Compare feasible plans

Aim to compare the baseline with at least two alternatives when supported. If fewer are justified, return fewer with a reason; never fabricate a third card.

Criteria may include:

- climate exposure relative to sourced crop/stage requirements;
- water-demand evidence under stated management assumptions;
- planned soil-cover periods as a calendar indicator;
- documented rotation/crop-family considerations;
- potential organic matter or nitrogen-cycling contributions with management caveats;
- farmer-reported feasibility and market acceptance.

Keep absolute measurements, computed indicators, modeled results and qualitative evidence separate. Planned covered days are not measured erosion reduction. A nitrogen-fixing crop does not establish a quantified fertilizer saving. A water-demand range is not automatically the field's irrigation requirement.

If ranking is implemented, publish the formula, normalization, direction, active criteria, weights and missing-evidence policy. Do not silently treat missing criteria as zero, redistribute weights without explanation, or compare scores based on different evidence as equally complete. Prefer clear trade-off comparisons when a total score is not defensible. Test how changing priorities affects ordering.

## 5. Indicators and numerical claims

- Temperature/rainfall summaries require valid-count and period metadata.
- Subzero air-temperature days are not the same as a complete crop frost-damage model.
- Heat exposure needs a documented crop/stage threshold, not a universal arbitrary alarm value.
- Rainfall alone cannot establish root-zone water sufficiency or irrigation savings.
- An evapotranspiration/water-balance model requires a documented method, all necessary inputs/unit conversions, assumptions, tests and appropriate validation. Otherwise leave its output unassessed.
- Do not project soil-carbon increases, yield, profit, erosion tonnage or water-saving percentages from generic heuristics. Such quantitative modules are separate evidence/validation work.
- Market suitability without a relevant price feed can use clearly identified farmer-entered constraints, not fabricated prices or income.

## 6. Required result structure

Each comparison must contain:

1. Assessment status and supported scope.
2. Input snapshot and editable assumptions.
3. Baseline and generated sequences with a readable calendar.
4. Reasons for considering each plan, tied to evidence/rules.
5. Per-criterion trade-offs, coverage and unassessed items.
6. Rejection/limitation reasons where applicable.
7. Source records, reference period, units and method version.
8. Local checks before acting and a clear advisory boundary.
9. Reproducible export data/report without false review claims.

Use clear language: what changes, why consider it, what could make it unsuitable, and what still needs checking. Do not label every plan as recommended merely because it was generated.

## 7. Domain tests

At minimum test:

- zero/negative and invalid coordinates; missing location and unsupported location;
- valid and invalid dates, leap days, cross-year seasons and southern-hemisphere windows;
- unknown soil/irrigation or out-of-scope crop data;
- non-overlapping sequences, duration/window constraints and sourced break rules;
- baseline constraints and no feasible alternatives;
- different priorities, transparent ranking and incomplete evidence;
- valid zeros, negative temperatures, sentinels, partial coverage and mismatched units;
- source unavailability, stale results and no silent demo fallback;
- identical inputs/catalogue/source snapshot yielding identical results.

Historical comparisons and unit tests are not causal proof that a new rotation improves soil health or farm income. Record actual agricultural review and field-pilot evidence separately.
