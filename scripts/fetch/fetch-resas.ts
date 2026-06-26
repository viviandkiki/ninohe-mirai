#!/usr/bin/env tsx
/**
 * RESAS API からデータを取得する。
 *
 * API仕様: https://opendata.resas-portal.go.jp/docs/api/v1/index.html
 * 必要な環境変数: RESAS_API_KEY
 *
 * 主な取得対象:
 *   - 人口推移 /api/v1/population/sum/estimate
 *   - 人口構成 /api/v1/population/composition/perYear
 *   - 産業分類別 /api/v1/industry/power/forMap
 *   - 農業 /api/v1/agriculture/crops/forMap
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const RESAS_BASE = "https://opendata.resas-portal.go.jp/api/v1";
const API_KEY = process.env.RESAS_API_KEY;
const RAW_DIR = join(process.cwd(), "data", "raw");

// 岩手県 = 3, 二戸市 = 3203
const PREF_CODE = "3";
const CITY_CODE = "3203";

async function fetchResas(endpoint: string, params: Record<string, string | undefined> = {}): Promise<unknown> {
  if (!API_KEY) {
    console.warn("[fetch-resas] RESAS_API_KEY not set. Using stub data.");
    return { result: null, message: "STUB - no API key" };
  }

  const merged: Record<string, string> = { prefCode: PREF_CODE, cityCode: CITY_CODE };
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) merged[k] = v;
  }
  const query = new URLSearchParams(merged);
  const url = `${RESAS_BASE}${endpoint}?${query}`;
  console.log(`[fetch-resas] GET ${endpoint}`);

  const res = await fetch(url, {
    headers: { "X-API-KEY": API_KEY },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const json = await res.json() as { message?: string };
  if (json.message === "Forbidden.") throw new Error("RESAS: invalid API key");
  return json;
}

async function main() {
  mkdirSync(RAW_DIR, { recursive: true });

  const TARGETS: { name: string; endpoint: string; params: Record<string, string>; description: string }[] = [
    {
      name: "population-estimate",
      endpoint: "/population/sum/estimate",
      params: {},
      description: "人口推移（実績 + 推計）",
    },
    {
      name: "population-composition",
      endpoint: "/population/composition/perYear",
      params: { addStationFlg: "0" },
      description: "人口構成（年齢別）",
    },
    {
      name: "industry-power",
      endpoint: "/industry/power/forMap",
      params: { year: "2021", matter: "1" },
      description: "産業別付加価値額",
    },
  ];

  for (const target of TARGETS) {
    try {
      console.log(`[fetch-resas] Fetching: ${target.description}`);
      const data = await fetchResas(target.endpoint, target.params);

      const outPath = join(RAW_DIR, `resas-${target.name}.json`);
      writeFileSync(outPath, JSON.stringify(data, null, 2), "utf-8");
      console.log(`[fetch-resas] Saved: ${outPath}`);

      // RESAS rate limit: 15,000 req/day / ~10req/sec
      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      console.error(`[fetch-resas] Failed ${target.name}:`, err);
    }
  }
}

main().catch(console.error);
