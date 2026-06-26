# scripts/sync

Build derived data from processed sources.

## Purpose

Scripts in this directory read from `data/processed/` and `data/manual/`
and write to `data/derived/` (planned). Derived data combines multiple
processed sources and pre-computes values used at runtime.

## Planned scripts

### build-derived-data.ts

Merges `scores.json` values into the power objects and pre-computes
radar chart data for the homepage.

```bash
pnpm tsx scripts/sync/build-derived-data.ts
```

### sync-scores.ts

Syncs editorial score overrides from `data/manual/scores.json` into
the powers processed data.

## When to run

Run after:
1. Any change to `data/manual/scores.json`
2. Major re-runs of transform scripts
3. Quarterly data updates
