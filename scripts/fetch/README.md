# scripts/fetch

Raw data fetchers from external sources.

## Purpose

Scripts in this directory download raw data from official sources:
- e-Stat API
- RESAS API  
- 二戸市公式サイト
- 岩手県オープンデータポータル

## Conventions

- Write raw output to `data/raw/<source-name>/YYYY-MM-DD/`
- Never transform in fetch scripts — only download and save
- Log the fetch URL and response status
- Store each run with a date-stamped directory

## Planned scripts

- `fetch-estat-population.ts` — 国勢調査・住民基本台帳人口
- `fetch-resas-industry.ts` — RESAS産業構造データ
- `fetch-ninohe-city.ts` — 二戸市公式発表データ

## Running

```bash
pnpm tsx scripts/fetch/fetch-estat-population.ts
```

Requires: `ESTAT_API_KEY` environment variable.
