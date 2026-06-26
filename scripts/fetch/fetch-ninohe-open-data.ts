#!/usr/bin/env tsx
/**
 * 岩手県オープンデータカタログ（dataeye.jp）から二戸市のデータセット一覧を取得。
 * CKAN API 非対応のカスタムポータルのため HTML スクレイプで対応。
 *
 * 取得先: https://iwate.dataeye.jp/datasets?organization_id=13
 *
 * 実行: npx tsx scripts/fetch/fetch-ninohe-open-data.ts
 * 出力: data/raw/ninohe-open-data-catalog.json
 */

import { parse as parseHtml } from "node-html-parser";
import fs from "fs";
import path from "path";

const BASE_URL = "https://iwate.dataeye.jp";
const INDEX_URL = `${BASE_URL}/datasets?organization_id=13`;
const RAW_OUT = path.join(process.cwd(), "data/raw/ninohe-open-data-catalog.json");

interface DatasetEntry {
  id: string;
  title: string;
  pageUrl: string;
  resourceUrl: string | null;  // CSV ダウンロード URL
  releasedAt: string | null;
}

interface CatalogOutput {
  fetchedAt: string;
  totalCount: number;
  openDataCountIndicator: number;  // A01 用: 件数
  datasets: DatasetEntry[];
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "NinoheMinai-DataBot/1.0 (hellovivikiki@gmail.com; public-dashboard)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "ja,en;q=0.9",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      console.warn(`  HTTP ${res.status}: ${url}`);
      return null;
    }
    return res.text();
  } catch (err) {
    console.warn(`  ネットワークエラー: ${url} — ${err}`);
    return null;
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchDatasetDetail(id: string): Promise<{ resourceUrl: string | null; releasedAt: string | null }> {
  const html = await fetchHtml(`${BASE_URL}/datasets/${id}`);
  if (!html) return { resourceUrl: null, releasedAt: null };

  const root = parseHtml(html);

  // リソースダウンロードリンク: href="/resources/NNN"
  const resLink = root.querySelector('a[href^="/resources/"]');
  const resourceUrl = resLink ? `${BASE_URL}${resLink.getAttribute("href")}` : null;

  // リリース日: <time> タグまたは日付テキスト
  const timeEl = root.querySelector("time");
  const releasedAt = timeEl?.getAttribute("datetime") ?? timeEl?.text?.trim() ?? null;

  return { resourceUrl, releasedAt };
}

async function main() {
  console.log("=".repeat(60));
  console.log("岩手県オープンデータ 二戸市データセット取得");
  console.log("=".repeat(60));

  const indexHtml = await fetchHtml(INDEX_URL);
  if (!indexHtml) {
    console.warn("  ✗ インデックスページ取得失敗 — スキップ");
    process.exit(0);
  }

  const root = parseHtml(indexHtml);

  // /datasets/NNN 形式のリンクを収集（相対・絶対URL両対応・重複除去）
  const datasetLinks = root.querySelectorAll("a");
  const idSet = new Set<string>();
  for (const a of datasetLinks) {
    const href = a.getAttribute("href") ?? "";
    const m = href.match(/\/datasets\/(\d+)$/);
    if (m) idSet.add(m[1]);
  }
  const ids = [...idSet];

  console.log(`  → ${ids.length} データセット検出`);

  const datasets: DatasetEntry[] = [];

  for (const id of ids) {
    const pageUrl = `${BASE_URL}/datasets/${id}`;
    const html = await fetchHtml(pageUrl);

    let title = `dataset-${id}`;
    let resourceUrl: string | null = null;
    let releasedAt: string | null = null;

    if (html) {
      const pageRoot = parseHtml(html);
      // タイトル: h1.p-ttl-ds span.p-ttl-ds__name → <title> タグ → fallback
      const nameSpan = pageRoot.querySelector(".p-ttl-ds__name");
      const titleTag = pageRoot.querySelector("title");
      if (nameSpan?.text?.trim()) {
        title = nameSpan.text.trim();
      } else if (titleTag?.text) {
        title = titleTag.text.split("|")[0].trim();
      }

      // リソースダウンロードリンク（相対・絶対URL両対応）
      const allLinks = pageRoot.querySelectorAll("a");
      for (const a of allLinks) {
        const href = a.getAttribute("href") ?? "";
        if (href.match(/\/resources\/\d+/)) {
          resourceUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;
          break;
        }
      }

      // 日付
      const timeEl = pageRoot.querySelector("time");
      releasedAt = timeEl?.getAttribute("datetime") ?? timeEl?.text?.trim() ?? null;
    }

    datasets.push({ id, title, pageUrl, resourceUrl, releasedAt });
    console.log(`  ✓ ${title}`);

    await sleep(800);
  }

  const output: CatalogOutput = {
    fetchedAt: new Date().toISOString(),
    totalCount: datasets.length,
    openDataCountIndicator: datasets.length,  // A01: 市の公開データ件数
    datasets,
  };

  fs.mkdirSync(path.dirname(RAW_OUT), { recursive: true });
  fs.writeFileSync(RAW_OUT, JSON.stringify(output, null, 2), "utf-8");

  console.log(`\n✓ 保存: ${RAW_OUT}`);
  console.log(`  合計 ${datasets.length} 件`);

  process.exit(0);
}

main().catch((err) => {
  console.error("[fetch-ninohe-open-data] Fatal:", err);
  process.exit(1);
});
