#!/usr/bin/env tsx
/**
 * 二戸市公式サイトの主要ページの更新状況を確認・記録する。
 * ページタイトルと日付パターンを抽出して保存。
 *
 * 実行: npx tsx scripts/fetch/fetch-ninohe-public-pages.ts
 * 出力: data/raw/ninohe-public-pages.json
 */

import { parse as parseHtml } from "node-html-parser";
import fs from "fs";
import path from "path";

const RAW_OUT = path.join(process.cwd(), "data/raw/ninohe-public-pages.json");

const TARGET_PAGES = [
  { url: "https://www.city.ninohe.lg.jp/Info/736",  label: "人口ビジョン・総合戦略" },
  { url: "https://www.city.ninohe.lg.jp/info/1020", label: "総合計画推進委員会" },
  { url: "https://www.city.ninohe.lg.jp/info/1187", label: "財務諸表" },
  { url: "https://www.city.ninohe.lg.jp/info/295",  label: "決算概要" },
  { url: "https://www.city.ninohe.lg.jp/menu/37",   label: "財務・会計" },
  { url: "https://www.city.ninohe.lg.jp/info/2148", label: "議会TOP" },
];

// YYYY年M月D日 or YYYY/MM/DD or YYYY-MM-DD
const DATE_PATTERN = /(\d{4})[年\/\-](\d{1,2})[月\/\-](\d{1,2})/;

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface PageResult {
  url: string;
  label: string;
  title: string | null;
  detectedDate: string | null;
  httpStatus: number | null;
  error?: string;
}

async function fetchPage(url: string, label: string): Promise<PageResult> {
  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        "User-Agent": "NinoheMinai-DataBot/1.0 (hellovivikiki@gmail.com; public-dashboard)",
        Accept: "text/html",
        "Accept-Language": "ja,en;q=0.9",
      },
    });
  } catch (err) {
    return { url, label, title: null, detectedDate: null, httpStatus: null, error: String(err) };
  }

  if (!res.ok) {
    return { url, label, title: null, detectedDate: null, httpStatus: res.status };
  }

  const html = await res.text();
  const root = parseHtml(html);

  // タイトル抽出: .info__title > h1 > title の優先順
  const titleEl =
    root.querySelector(".info__title") ??
    root.querySelector("h1") ??
    root.querySelector("title");
  const title = titleEl?.text?.trim().replace(/\s+/g, " ") ?? null;

  // 日付抽出: <time> タグ → 本文テキストのパターン
  let detectedDate: string | null = null;
  const timeEl = root.querySelector("time");
  if (timeEl) {
    const dt = timeEl.getAttribute("datetime") ?? timeEl.text.trim();
    const m = dt.match(DATE_PATTERN);
    if (m) detectedDate = `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  }
  if (!detectedDate) {
    const bodyText = root.querySelector("body")?.text ?? "";
    const m = bodyText.match(DATE_PATTERN);
    if (m) detectedDate = `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  }

  return { url, label, title, detectedDate, httpStatus: res.status };
}

async function main() {
  console.log("=".repeat(60));
  console.log("二戸市公式ページ更新状況 確認");
  console.log("=".repeat(60));

  const results: PageResult[] = [];

  for (const page of TARGET_PAGES) {
    console.log(`\n▶ ${page.label} (${page.url})`);
    const result = await fetchPage(page.url, page.label);
    results.push(result);

    if (result.error) {
      console.warn(`  ✗ エラー: ${result.error}`);
    } else {
      console.log(`  HTTP ${result.httpStatus} / タイトル: ${result.title?.slice(0, 60) ?? "不明"}`);
      console.log(`  検出日付: ${result.detectedDate ?? "なし"}`);
    }

    await sleep(1000);
  }

  const output = { fetchedAt: new Date().toISOString(), pages: results };
  fs.mkdirSync(path.dirname(RAW_OUT), { recursive: true });
  fs.writeFileSync(RAW_OUT, JSON.stringify(output, null, 2), "utf-8");

  const ok = results.filter((r) => r.httpStatus === 200).length;
  console.log(`\n✓ 保存: ${RAW_OUT}`);
  console.log(`  ${ok}/${results.length} ページ正常取得`);
}

main().catch((err) => {
  console.error("[fetch-ninohe-public-pages] Fatal:", err);
  process.exit(1);
});
