#!/usr/bin/env tsx
/**
 * indicator_registry.json + data/raw/ のデータを合成し、
 * indicators.json を補完する。既存 18 件は変更しない。
 *
 * 実行: npx tsx scripts/transform/build-indicators.ts
 */

import fs from "fs";
import path from "path";

interface IndicatorRegistry {
  id: string;
  name: string;
  category: string;
  powerSlug: string;
  jsonKey: string;
  status: string;
}

interface Indicator {
  id: string;
  powerId: string;
  name: string;
  value: number;
  unit: string;
  year: number;
  trend: Array<{ year: number; value: number }>;
  sourceId: string;
  notes?: string;
}

interface CatalogOutput {
  totalCount: number;
  datasets: Array<{ id: string; name: string; title: string }>;
}

const REGISTRY_FILE = path.join(process.cwd(), "data/manual/indicator_registry.json");
const INDICATORS_FILE = path.join(process.cwd(), "data/processed/indicators.json");
const CATALOG_FILE = path.join(process.cwd(), "data/raw/ninohe-open-data-catalog.json");

const POWER_ID_MAP: Record<string, string> = {
  work: "power-work",
  earn: "power-earn",
  inherit: "power-inherit",
  connect: "power-connect",
  prepare: "power-prepare",
  live: "power-live",
};

function main() {
  console.log("=".repeat(60));
  console.log("指標台帳 → indicators.json 補完");
  console.log("=".repeat(60));

  const registry: IndicatorRegistry[] = JSON.parse(
    fs.readFileSync(REGISTRY_FILE, "utf-8")
  );
  const indicators: Indicator[] = JSON.parse(
    fs.readFileSync(INDICATORS_FILE, "utf-8")
  );

  const existingIds = new Set(indicators.map((i) => i.id));
  let addedCount = 0;
  let skippedCount = 0;

  // A01: オープンデータ件数を実値で更新/追加
  const catalogExists = fs.existsSync(CATALOG_FILE);
  let openDataCount: number | null = null;
  if (catalogExists) {
    const catalog: CatalogOutput = JSON.parse(fs.readFileSync(CATALOG_FILE, "utf-8"));
    openDataCount = catalog.totalCount;
    console.log(`\n  オープンデータカタログ: ${openDataCount} 件検出`);
  }

  const currentYear = new Date().getFullYear();

  for (const reg of registry) {
    // active 指標のみ indicators.json に反映対象
    if (reg.status !== "active") {
      skippedCount++;
      continue;
    }

    const indicatorId = `ind-registry-${reg.id.toLowerCase()}`;
    if (existingIds.has(indicatorId)) {
      // 既存エントリを更新
      const existing = indicators.find((i) => i.id === indicatorId);
      if (existing && reg.id === "A01" && openDataCount !== null) {
        existing.value = openDataCount;
        existing.year = currentYear;
        existing.trend = [...existing.trend.filter((t) => t.year < currentYear), { year: currentYear, value: openDataCount }];
        console.log(`  ✓ 更新: ${reg.name} = ${openDataCount}`);
      }
      continue;
    }

    // 新規追加（active のみ）
    let value = 0;
    if (reg.id === "A01" && openDataCount !== null) {
      value = openDataCount;
    }

    if (value === 0) {
      skippedCount++;
      continue;
    }

    const newIndicator: Indicator = {
      id: indicatorId,
      powerId: POWER_ID_MAP[reg.powerSlug] ?? "power-work",
      name: reg.name,
      value,
      unit: "件",
      year: currentYear,
      trend: [{ year: currentYear, value }],
      sourceId: "src-ninohe-open-data",
      notes: `台帳ID: ${reg.id}. 岩手県オープンデータカタログから自動取得。`,
    };

    indicators.push(newIndicator);
    existingIds.add(indicatorId);
    addedCount++;
    console.log(`  ✓ 追加: ${reg.name} = ${value}`);
  }

  // 日付降順維持
  indicators.sort((a, b) => a.powerId.localeCompare(b.powerId) || a.id.localeCompare(b.id));

  fs.writeFileSync(INDICATORS_FILE, JSON.stringify(indicators, null, 2), "utf-8");

  console.log(`\n台帳サマリー:`);
  const statusCount: Record<string, number> = {};
  for (const r of registry) statusCount[r.status] = (statusCount[r.status] ?? 0) + 1;
  for (const [status, count] of Object.entries(statusCount)) {
    console.log(`  ${status}: ${count} 件`);
  }
  console.log(`\n完了: ${addedCount} 件追加 / ${skippedCount} 件スキップ / 合計 ${indicators.length} 件`);
}

main();
