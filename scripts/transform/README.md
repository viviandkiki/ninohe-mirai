# scripts/transform

Transform raw data into standardized processed JSON.

## Purpose

Scripts in this directory read from `data/raw/` and write to `data/processed/`.
They normalize field names, units, and date formats to match Zod schemas.

## Conventions

- Input: `data/raw/<source>/<date>/*.json|csv`
- Output: `data/processed/<dataset>.json`
- Validate output against Zod schemas before writing (import from `lib/schemas.ts`)
- Log record count and any dropped/skipped rows

## Planned scripts

- `transform-population.ts` — normalize population data from e-Stat
- `transform-industry.ts` — normalize industry data from RESAS
- `transform-indicators.ts` — merge all indicator sources into `indicators.json`

## Running

```bash
pnpm tsx scripts/transform/transform-population.ts
```
