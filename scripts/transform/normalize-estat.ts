#!/usr/bin/env tsx
/**
 * e-Stat の raw JSON を processed/indicators.json 形式に変換する。
 *
 * 入力: data/raw/estat-*.json
 * 出力: data/processed/indicators.json の該当フィールドを上書き
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const RAW_DIR = join(process.cwd(), "data", "raw");
const PROCESSED_DIR = join(process.cwd(), "data", "processed");

interface EStatValue {
  "@unit": string;
  "@time": string;
  "@area": string;
  $: string;
}

interface RawEStatData {
  GET_STATS_DATA?: {
    STATISTICAL_DATA?: {
      DATA_INF?: {
        VALUE?: EStatValue[];
      };
    };
  };
}

interface TrendPoint {
  year: number;
  value: number;
}

function parseEStatValues(raw: RawEStatData): TrendPoint[] {
  const values = raw?.GET_STATS_DATA?.STATISTICAL_DATA?.DATA_INF?.VALUE;
  if (!values || !Array.isArray(values)) return [];

  return values
    .map((v) => ({
      year: parseInt(v["@time"]?.slice(0, 4) ?? "0", 10),
      value: parseFloat(v["$"] ?? "0"),
    }))
    .filter((p) => !isNaN(p.year) && !isNaN(p.value))
    .sort((a, b) => a.year - b.year);
}

export function normalizePopulationData(): TrendPoint[] {
  const path = join(RAW_DIR, "estat-census-population.json");
  if (!existsSync(path)) {
    console.warn("[normalize-estat] census-population.json not found, skipping.");
    return [];
  }

  const raw: RawEStatData = JSON.parse(readFileSync(path, "utf-8"));
  const points = parseEStatValues(raw);
  console.log(`[normalize-estat] population: ${points.length} data points`);
  return points;
}

export function normalizeMigrationData(): TrendPoint[] {
  const path = join(RAW_DIR, "estat-migration-report.json");
  if (!existsSync(path)) {
    console.warn("[normalize-estat] migration-report.json not found, skipping.");
    return [];
  }

  const raw: RawEStatData = JSON.parse(readFileSync(path, "utf-8"));
  const points = parseEStatValues(raw);
  console.log(`[normalize-estat] migration: ${points.length} data points`);
  return points;
}

function updateIndicators(
  populationPoints: TrendPoint[],
  migrationPoints: TrendPoint[],
) {
  if (migrationPoints.length > 0) {
    console.log(`[normalize-estat] ${migrationPoints.length} migration points available (future indicator mapping)`);
  }
  const indicatorsPath = join(PROCESSED_DIR, "indicators.json");
  const indicators = JSON.parse(readFileSync(indicatorsPath, "utf-8")) as {
    id: string;
    trend?: TrendPoint[];
    value?: number;
  }[];

  let updated = 0;

  for (const ind of indicators) {
    if (ind.id === "total-population" && populationPoints.length > 0) {
      ind.trend = populationPoints;
      ind.value = populationPoints.at(-1)?.value ?? ind.value;
      updated++;
    }
    // 追加の指標マッピングはここに追加
  }

  writeFileSync(indicatorsPath, JSON.stringify({ indicators }, null, 2), "utf-8");
  console.log(`[normalize-estat] Updated ${updated} indicators in indicators.json`);
}

async function main() {
  const populationPoints = normalizePopulationData();
  const migrationPoints = normalizeMigrationData();

  if (populationPoints.length > 0 || migrationPoints.length > 0) {
    updateIndicators(populationPoints, migrationPoints);
  } else {
    console.log("[normalize-estat] No new data to merge.");
  }
}

main().catch(console.error);
