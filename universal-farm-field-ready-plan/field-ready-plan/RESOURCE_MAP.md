# Resource-to-Feature Map

Source review date: **14 November 2026**.

Primary challenge catalogue: https://www.spaceappschallenge.org/2026/challenges/adapting-farms-with-nasa-data/?tab=resources

This is a selection and integration plan—not a claim that the application has connected every listed source. Only NASA POWER requests have been independently exercised in this conversation. Other landing pages or documentation were reviewed as noted; each actual product/API/file still needs an access test and metadata checks in the application.

## A. Required evidence bundle

### NASA POWER — preserve and extend the working connection

- Official service: https://power.larc.nasa.gov/
- Daily API documentation: https://power.larc.nasa.gov/docs/services/api/temporal/daily/
- Verified public point endpoint: `https://power.larc.nasa.gov/api/temporal/daily/point`
- Use: historical temperature and precipitation evidence, seasonal summaries, and transparent exposure indicators.
- Implementation: configurable multi-year reference history, bounded requests, cache/deduplication, missing-value coverage, explicit LST/UTC, and response provenance. Preserve the existing four-parameter feature before expanding.
- Limits: these selected POWER variables are gridded weather estimates; they are not a farm sensor, soil test, future weather forecast, or proof of soil-health change.
- Do not repeatedly request an entire catalogue or poll the same location. Follow the service's documented usage constraints.

### Farmer/local soil and management evidence — necessary context

- Capture soil reports or farmer-entered observations with provenance, date, units and depth where available. Keep measured, reported and modeled values separate.
- Capture irrigation availability, crop history, practical constraints, intended planting windows and priorities.
- For U.S. fields, inspect Web Soil Survey and SSURGO/STATSGO2 access from the challenge catalogue. Do not query them as a global soil service.
- Outside supported survey coverage, use appropriate local sources or explicitly marked regional/global model context. Unknown values cannot be silently filled with favorable assumptions.

### FAO GAEZ — crop suitability context, not a farm-specific oracle

- Challenge-listed portal: https://gaez.fao.org/
- Current FAO overview: https://www.fao.org/gaez/en
- GAEZ v5 portal linked by FAO: https://data.apps.fao.org/gaez/?lang=en
- Official model documentation: https://github.com/un-fao/gaezv5/wiki
- Use: compare the crop's broad agroclimatic/soil/terrain suitability under documented input, irrigation and management assumptions.
- Implementation: identify and obtain the exact layer or source record, version, crop, baseline/scenario and management assumptions. Cache a permitted subset or import an authentic source extract. Verify actual data access; do not invent an endpoint from a portal URL.
- Limits: GAEZ does not supply all local crop-calendar, pest, market, or cultivar knowledge needed for a rotation plan. Its modeled attainable yield is not a prediction of the user's harvest. Do not mix v4/v5 results without explicit provenance.

### Cited crop/rotation knowledge

Use GAEZ methodology and traceable local research/extension references to define crop requirements and sequence rules. USDA Ag Data Commons can supply relevant research records, but individual studies must be checked for applicability and reuse terms. A resource list is not a ready-made global agronomy rules database.

## B. Prioritized Earth-observation enhancements

| Source | Application feature to consider | Integration and interpretation conditions |
|---|---|---|
| SMAP | Moisture context for water-limited rotations | Select a specific current product. Check quality/freeze/water flags, native support and dates; distinguish surface retrievals from modeled root-zone products. Coarse information is regional context, not a measurement of every small field. |
| GPM / IMERG | Rainfall history and extreme-rain context | Select product/run/version and latency. Convert rates to accumulation using the actual interval. Do not call IMERG a field rain gauge or relabel POWER rainfall as IMERG. |
| Landsat / Sentinel-2 | Vegetation seasonality and periods of limited cover | Apply cloud/shadow masks and document bands/resolution and within-field valid-pixel coverage. NDVI is not direct yield, disease diagnosis, or complete soil health. |
| MODIS / VIIRS | Longer-area seasonal vegetation context | Validate the exact platform/product and continuity. Do not present coarse pixels as precise small-field boundaries. |
| SRTM | Slope/terrain context relevant to runoff and erosion | Check the dataset footprint and voids. Elevation/slope alone is not a quantitative soil-loss estimate; SRTM is not complete worldwide coverage. |
| ECOSTRESS | Surface-temperature/ET context when relevant acquisitions exist | Use an appropriate current collection and quality masks. Surface temperature differs from air temperature; ET is model-derived. Do not invent acquisitions where none exist. |
| GLDAS / NLDAS | Model-based land-surface context and continuity | Confirm the chosen system's geography and product support; do not assume NLDAS has GLDAS's geographic extent or that model estimates are field measurements. |
| ERA5 | Consistent historical reanalysis context where useful | Keep ERA5 product identity, grid/time definitions, and source distinct from NASA products. Reanalysis is not a future forecast. |

Primary documentation reviewed for this plan:

- SMAP: https://www.earthdata.nasa.gov/data/platforms/space-based-platforms/smap
- GPM access, products and policy: https://gpm.nasa.gov/data
- SRTM: https://www.earthdata.nasa.gov/data/instruments/srtm
- ECOSTRESS access and collections: https://ecostress.jpl.nasa.gov/data
- Sentinel access: https://dataspace.copernicus.eu/
- ERA5 link from the challenge: https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels?tab=overview

### Current continuity issue to handle

NASA reports that **new Suomi NPP science-data delivery ended on 2 November 2026**. Archived Suomi NPP data remain useful; this is not the end of all VIIRS data. For a current VIIRS pipeline, review the NOAA-20/NOAA-21 transition and product-specific compatibility rather than assuming new Suomi NPP acquisitions will arrive.

Official notice reviewed: https://www.earthdata.nasa.gov/data/alerts-outages/reminder-new-suomi-npp-observations-cease-november-2-2026

## C. Conditional regional and validation resources

These catalogue resources are not universal defaults:

| Resource group | Appropriate role and coverage check |
|---|---|
| Web Soil Survey; NRCS SSURGO/STATSGO2 | U.S. survey-based soil context, with field/regional scale and survey limitations retained. |
| CropScape/CDL | U.S. crop-history context; classifications require accuracy/availability checks and do not reveal all management practices. |
| NAIP; NLCD; LANDFIRE | U.S.-focused imagery/landscape context. Verify the particular footprint, acquisition year, and feature needed. |
| PRISM | U.S. climate context where applicable; not a replacement for global coverage. |
| USDA NASS QuickStats | Regional agricultural statistics, not an individual-field yield forecast. |
| USDA AMS Market News | Relevant market reports where location, commodity, date and reporting basis match; do not show U.S. prices as local prices elsewhere. |
| USGS NWIS | U.S. water monitoring relevant to a verified hydrologic setting; the nearest station is not automatically the farm's water supply. |
| CoCoRaHS | Available North American volunteer precipitation observations for contextual checks, with station/time/quality coverage. |
| OpenET | Satellite-model ET evidence within the chosen product's actual footprint and access terms; verify current coverage rather than assuming global availability. |
| USDA Ag Data Commons | Traceable agricultural studies/datasets; inspect each record's geography, methods, license and applicability. |
| GEDI | Woody vegetation/landscape structural context when relevant; not a default annual-crop yield or soil-N product. |

OpenET's current website redirects to https://etdata.org/ . Its methods page describes an ensemble of ET models: https://etdata.org/methods/ . Treat these outputs as modeled estimates, not automatically independent ground truth, even where a challenge blurb uses that phrase.

GRACE/GRACE-FO are mentioned in the challenge's Details tab. They may supply large-scale water-storage context, but not farm-well measurements. They are not required to complete the first coherent rotation-comparison release.

## D. Mandatory source-adapter contract

For every observation, model layer, source extract, or catalogue fact, retain as applicable:

- authoritative provider URL/identifier and version;
- access route and a tested request or authentic file provenance;
- spatial and temporal coverage/support, units, depth/band, time standard;
- requested location versus actual pixel/footprint or aggregation;
- quality flags, missing values, valid coverage and warnings;
- baseline/scenario/management assumptions;
- retrieval timestamp and immutable source reference/checksum where practical;
- license, attribution and redistribution constraints;
- actual availability/authentication state and failure reason.

Harmonize units and time intervals deliberately. Do not sum precipitation rates without accounting for duration, merge LST and UTC days silently, interpolate across cloud gaps without labeling the method, or claim finer measurement precision after resampling.

## E. Delivery priority

1. Complete the POWER + local inputs + sourced crop knowledge core and deterministic comparison engine.
2. Obtain and verify GAEZ context where accessible and applicable.
3. Add the single enhancement addressing the most important unanswered decision question for the supported use case.
4. Expand source and evidence coverage incrementally; do not block all supported functionality on every optional integration.

A link can be listed as a resource without being an implemented integration. Display that distinction honestly.
