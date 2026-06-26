#!/usr/bin/env tsx
/**
 * e-Stat API からデータを取得する。
 *
 * API仕様: https://api.e-stat.go.jp/rest/3.0/api-info/statsdata
 * 必要な環境変数: ESTAT_APP_ID
 *
 * 主な取得対象:
 *   - 国勢調査 人口・世帯数（statsDataId: 0003410379）
 *   - 住民基本台帳人口移動報告（statsDataId: 0003214677）
 *   - 社会・人口統計体系 市区町村データ
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const ESTAT_BASE = "https://api.e-stat.go.jp/rest/3.0/app/json";
const APP_ID = process.env.ESTAT_APP_ID;
const RAW_DIR = join(process.cwd(), "data", "raw");

// 二戸市の行政コード (岩手県03 + 二戸市203 → 03203)
const NINOHE_CODE = "03203";

interface EStatParams {
  statsDataId: string;
  cdArea?: string;
  startPosition?: number;
  limit?: number;
}

async function fetchStats(params: EStatParams): Promise<unknown> {
  if (!APP_ID) {
    console.warn("[fetch-estat] ESTAT_APP_ID not set. Using stub data.");
    return { GET_STATS_DATA: { STATISTICAL_DATA: { DATA_INF: { VALUE: [] } } } };
  }

  const query = new URLSearchParams({
    appId: APP_ID,
    statsDataId: params.statsDataId,
    ...(params.cdArea ? { cdArea: params.cdArea } : {}),
    ...(params.startPosition ? { startPosition: String(params.startPosition) } : {}),
    ...(params.limit ? { limit: String(params.limit) } : {}),
    metaGetFlg: "Y",
    cntGetFlg: "N",
    explanationGetFlg: "N",
    annotationGetFlg: "N",
    sectionHeaderFlg: "1",
    replaceSpChars: "0",
  });

  const url = `${ESTAT_BASE}/getStatsData?${query}`;
  console.log(`[fetch-estat] GET ${url.replace(APP_ID, "***")}`);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

async function main() {
  mkdirSync(RAW_DIR, { recursive: true });

  const TARGETS = [
    {
      name: "census-population",
      statsDataId: "0003410379",
      description: "国勢調査 人口・世帯",
      cdArea: NINOHE_CODE,
    },
    {
      name: "migration-report",
      statsDataId: "0003214677",
      description: "住民基本台帳人口移動報告",
      cdArea: NINOHE_CODE,
    },
  ];

  for (const target of TARGETS) {
    try {
      console.log(`[fetch-estat] Fetching: ${target.description}`);
      const data = await fetchStats({
        statsDataId: target.statsDataId,
        cdArea: target.cdArea,
        limit: 1000,
      });

      const outPath = join(RAW_DIR, `estat-${target.name}.json`);
      writeFileSync(outPath, JSON.stringify(data, null, 2), "utf-8");
      console.log(`[fetch-estat] Saved: ${outPath}`);

      // Rate limit: e-Stat recommends ≤ 1req/sec
      await new Promise((r) => setTimeout(r, 1100));
    } catch (err) {
      console.error(`[fetch-estat] Failed ${target.name}:`, err);
    }
  }
}

main().catch(console.error);
