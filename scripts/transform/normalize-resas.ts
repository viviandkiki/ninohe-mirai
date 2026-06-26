#!/usr/bin/env tsx
/**
 * RESAS の raw JSON を processed/indicators.json 形式に変換する。
 *
 * 入力: data/raw/resas-*.json
 * 出力: data/processed/indicators.json の該当フィールドを上書き
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const RAW_DIR = join(process.cwd(), "data", "raw");
const PROCESSED_DIR = join(process.cwd(), "data", "processed");

interface TrendPoint {
  year: number;
  value: number;
}

interface ResasPopulation {
  year: number;
  value: number;
}

interface ResasPopulationResult {
  data?: Array<{
    label: string;
    data: ResasPopulation[];
  }>;
}

interface RawResasResponse {
  result?: ResasPopulationResult | null;
  message?: string;
}

function normalizePopulationEstimate(): TrendPoint[] {
  const path = join(RAW_DIR, "resas-population-estimate.json");
  if (!existsSync(path)) {
    console.warn("[normalize-resas] population-estimate.json not found, skipping.");
    return [];
  }

  const raw: RawResasResponse = JSON.parse(readFileSync(path, "utf-8"));
  if (!raw.result || raw.message === "STUB - no API key") return [];

  // RESAS returns multiple series; "総人口" is the total population series
  const totalSeries = (raw.result as ResasPopulationResult).data?.find(
    (d) => d.label === "総人口",
  );
  if (!totalSeries) return [];

  const points: TrendPoint[] = totalSeries.data.map((d) => ({
    year: d.year,
    value: d.value,
  }));

  console.log(`[normalize-resas] population-estimate: ${points.length} data points`);
  return points;
}

function normalizeIndustryPower(): { gdpBillion: number; year: number } | null {
  const path = join(RAW_DIR, "resas-industry-power.json");
  if (!existsSync(path)) {
    console.warn("[normalize-resas] industry-power.json not found, skipping.");
    return null;
  }

  const raw: RawResasResponse = JSON.parse(readFileSync(path, "utf-8"));
  if (!raw.result || raw.message === "STUB - no API key") return null;

  // RESAS industry/power/forMap returns prefecture-level totals — extract city if available
  const result = raw.result as { data?: { value?: number; year?: number } };
  if (!result?.data?.value) return null;

  return {
    gdpBillion: Math.round(result.data.value / 1_000_000_000),
    year: result.data.year ?? 2021,
  };
}

function updateIndicators(
  populationPoints: TrendPoint[],
  industryData: { gdpBillion: number; year: number } | null,
) {
  const indicatorsPath = join(PROCESSED_DIR, "indicators.json");
  const raw = JSON.parse(readFileSync(indicatorsPath, "utf-8")) as {
    indicators?: { id: string; trend?: TrendPoint[]; value?: number }[];
  };
  const indicators = raw.indicators ?? (raw as unknown as { id: string; trend?: TrendPoint[]; value?: number }[]);

  let updated = 0;

  for (const ind of (Array.isArray(indicators) ? indicators : [])) {
    if (ind.id === "total-population" && populationPoints.length > 0) {
      ind.trend = populationPoints;
      ind.value = populationPoints.at(-1)?.value ?? ind.value;
      updated++;
    }
    if (ind.id === "gdp-per-capita" && industryData) {
      ind.value = industryData.gdpBillion;
      updated++;
    }
  }

  const output = Array.isArray(indicators) ? indicators : raw;
  writeFileSync(indicatorsPath, JSON.stringify(output, null, 2), "utf-8");
  console.log(`[normalize-resas] Updated ${updated} indicators in indicators.json`);
}

async function main() {
  const populationPoints = normalizePopulationEstimate();
  const industryData = normalizeIndustryPower();

  if (populationPoints.length > 0 || industryData) {
    updateIndicators(populationPoints, industryData);
  } else {
    console.log("[normalize-resas] No new data to merge.");
  }
}

main().catch(console.error);
