# scripts/validate

Validate processed JSON files against Zod schemas.

## Purpose

Run before deploying to catch data inconsistencies:
- Type errors
- Out-of-range values
- Missing required fields
- Broken cross-references (e.g., indicatorId not found in indicators.json)

## Scripts

### check-processed.ts

Validates all files in `data/processed/` against their Zod schemas.

```bash
pnpm tsx scripts/validate/check-processed.ts
```

Exit 0 = all valid. Exit 1 = validation errors (details printed to stderr).

### Cross-reference checks

- `powers.json` → `indicatorIds` must exist in `indicators.json`
- `movements.json` → `actorIds` must exist in `actors.json`
- `movements.json` → `powerSlugs` must be valid slugs
- `indicators.json` → `sourceId` must exist in `sources.json`
