#!/usr/bin/env tsx
/**
 * e-Stat API から二戸市（地域コード: 03206）の主要統計値を取得。
 * ESTAT_APP_ID 環境変数が必要。未設定時はスキップ。
 *
 * 実行: npx tsx scripts/fetch/fetch-estat-core.ts
 * 出力: data/raw/estat-core.json
 */

import fs from "fs";
import path from "path";

const APP_ID = process.env.ESTAT_APP_ID;
const NINOHE_CODE = "03206"; // 二戸市の地域コード
const ESTAT_BASE = "https://api.e-stat.go.jp/rest/3.0/app/json";
const RAW_OUT = path.join(process.cwd(), "data/raw/estat-core.json");

interface EstatQuery {
  id: string;
  label: string;
  statsDataId: string;
  cdArea?: string;
  cdCat?: Record<string, string>;
}

// 取得対象の統計
const QUERIES: EstatQuery[] = [
  {
    id: "population_basic_resident_register",
    label: "住民基本台帳人口（二戸市）",
    statsDataId: "0000020201",
    cdArea: NINOHE_CODE,
  },
  {
    id: "economic_census_establishments",
    label: "経済センサス 事業所数（二戸市）",
    statsDataId: "0003107948",
    cdArea: NINOHE_CODE,
  },
];

async function fetchStatData(query: EstatQuery): Promise<unknown> {
  const params = new URLSearchParams({
    appId: APP_ID!,
    lang: "J",
    statsDataId: query.statsDataId,
    metaGetFlg: "Y",
    cntGetFlg: "N",
    explanationGetFlg: "Y",
    annotationGetFlg: "Y",
    sectionHeaderFlg: "1",
    replaceSpChars: "0",
  });

  if (query.cdArea) params.set("cdArea", query.cdArea);

  const url = `${ESTAT_BASE}/getStatsData?${params}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "NinoheMinai-DataBot/1.0 (hellovivikiki@gmail.com)",
    },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

async function main() {
  console.log("=".repeat(60));
  console.log("e-Stat API コア統計取得（二戸市）");
  console.log("=".repeat(60));

  if (!APP_ID) {
    console.warn("[fetch-estat-core] ESTAT_APP_ID が未設定です — スキップ");
    console.warn("  e-Stat API は https://www.e-stat.go.jp/api/ で取得できます");
    return;
  }

  const results: Record<string, unknown> = {};
  let successCount = 0;

  for (const query of QUERIES) {
    console.log(`\n▶ ${query.label} (statsDataId=${query.statsDataId})`);
    try {
      const data = await fetchStatData(query);
      results[query.id] = data;
      successCount++;
      console.log("  ✓ 取得成功");
    } catch (err) {
      console.warn(`  ✗ 失敗: ${err}`);
      results[query.id] = null;
    }
    // API レート制限回避
    await new Promise((r) => setTimeout(r, 1000));
  }

  const output = {
    fetchedAt: new Date().toISOString(),
    queriesTotal: QUERIES.length,
    queriesSuccess: successCount,
    data: results,
  };

  fs.mkdirSync(path.dirname(RAW_OUT), { recursive: true });
  fs.writeFileSync(RAW_OUT, JSON.stringify(output, null, 2), "utf-8");

  console.log(`\n✓ 保存: ${RAW_OUT}`);
  console.log(`  ${successCount}/${QUERIES.length} 統計取得成功`);
}

main().catch((err) => {
  console.error("[fetch-estat-core] Fatal:", err);
  process.exit(1);
});
