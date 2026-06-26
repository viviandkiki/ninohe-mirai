#!/usr/bin/env tsx
/**
 * 二戸市議会公式サイトから定例会・臨時会の審議情報を自動取得する。
 *
 * 取得先 (HTMLスクレイプ、APIキー不要):
 *   https://www.city.ninohe.lg.jp/Info/4487  令和8年
 *   https://www.city.ninohe.lg.jp/Info/4021  令和7年
 *   https://www.city.ninohe.lg.jp/Info/3623  令和6年
 *
 * HTML構造: <div class="colcount1">
 *              <h2 class="xtitle">■令和7年12月定例会</h2>  ← R7形式（年付き）
 *              <h2 class="xtitle">６月定例会</h2>            ← R8形式（全角・年なし）
 *              <h3 class="xtxt"><a href="...">●審議日程</a></h3>
 *           </div>
 *
 * 出力: data/raw/council-sessions.json
 * 実行: npx tsx scripts/fetch/fetch-ninohe-council.ts
 */

import { parse as parseHtml } from "node-html-parser";
import fs from "fs";
import path from "path";

const BASE_URL = "https://www.city.ninohe.lg.jp";
const RAW_OUT = path.join(process.cwd(), "data/raw/council-sessions.json");

// 取得対象の年インデックスページ (reiwaYear, infoUrl)
const YEAR_PAGES: Array<{ reiwaYear: number; url: string }> = [
  { reiwaYear: 8, url: `${BASE_URL}/Info/4487` },
  { reiwaYear: 7, url: `${BASE_URL}/Info/4021` },
  { reiwaYear: 6, url: `${BASE_URL}/Info/3623` },
];

export interface CouncilPdfs {
  schedule: string | null;   // 審議日程
  questions: string | null;  // 一般質問一覧
  results: string | null;    // 議決結果
}

export interface CouncilSession {
  id: string;
  name: string;
  reiwaYear: number;
  year: number;   // 西暦
  month: number;
  sessionType: "定例会" | "臨時会" | "その他";
  date: string;   // YYYY-MM
  pdfs: CouncilPdfs;
  sourceUrl: string;
}

export interface CouncilRawData {
  fetchedAt: string;
  sessions: CouncilSession[];
}

function reiwaToGregorian(reiwaYear: number): number {
  return 2018 + reiwaYear;
}

function toHalfWidth(str: string): string {
  return str.replace(/[０-９]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0xff10 + 0x30)
  );
}

function cleanHeadingText(text: string): string {
  return toHalfWidth(text)
    .replace(/^[■●◆▶◎\s]+/, "")
    .trim();
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "NinoheMinai-DataBot/1.0 (hellovivikiki@gmail.com; public-dashboard)",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "ja,en;q=0.9",
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${url}`);
  }
  return res.text();
}

function parseSessions(
  html: string,
  reiwaYear: number,
  sourceUrl: string
): CouncilSession[] {
  const root = parseHtml(html);
  const sessions: CouncilSession[] = [];
  const idCounts: Record<string, number> = {};

  // 各セルは <div class="colcount1"> 単位
  const cells = root.querySelectorAll("div.colcount1");

  for (const cell of cells) {
    const h2 = cell.querySelector("h2.xtitle");
    const h3 = cell.querySelector("h3.xtxt");
    if (!h2) continue;

    const rawText = cleanHeadingText(h2.text);

    // パターンA: "令和7年12月定例会" (令和付き)
    // パターンB: "6月定例会" or "12月臨時会" (年なし、全角→半角済み)
    let month = 0;
    let sessionType: "定例会" | "臨時会" | "その他" = "その他";
    let sessionName = rawText;

    const matchA = rawText.match(/令和(\d+)年(\d+)月(定例会|臨時会)/);
    const matchB = rawText.match(/^(\d+)月(定例会|臨時会)/);

    if (matchA) {
      month = parseInt(matchA[2], 10);
      sessionType = matchA[3] as "定例会" | "臨時会";
      // セッション名を正規化（■等が既に除去済み）
      sessionName = rawText;
    } else if (matchB) {
      month = parseInt(matchB[1], 10);
      sessionType = matchB[2] as "定例会" | "臨時会";
      // 年を補完: "6月定例会" → "令和8年6月定例会"
      sessionName = `令和${reiwaYear}年${month}月${sessionType}`;
    } else {
      continue; // 対象外の見出し（広告、サイドバー等）
    }

    const gregYear = reiwaToGregorian(reiwaYear);
    const mm = String(month).padStart(2, "0");
    const suffix = sessionType === "臨時会" ? "rinji" : "teireikai";
    const baseId = `r${reiwaYear}-${mm}-${suffix}`;

    idCounts[baseId] = (idCounts[baseId] ?? 0) + 1;
    const id = idCounts[baseId] > 1 ? `${baseId}-${idCounts[baseId]}` : baseId;

    // PDF リンク収集
    const pdfs: CouncilPdfs = { schedule: null, questions: null, results: null };
    if (h3) {
      for (const a of h3.querySelectorAll("a")) {
        const href = a.getAttribute("href") ?? "";
        const linkText = a.text.trim();
        const fullUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;
        const lhref = href.toLowerCase();

        if (linkText.includes("審議日程") || lhref.includes("nittei")) {
          pdfs.schedule = fullUrl;
        } else if (
          linkText.includes("一般質問") ||
          lhref.includes("ippan") ||
          lhref.includes("situmon")
        ) {
          pdfs.questions = fullUrl;
        } else if (
          linkText.includes("議決") ||
          lhref.includes("giketukekka") ||
          lhref.includes("kekka")
        ) {
          pdfs.results = fullUrl;
        }
      }
    }

    sessions.push({
      id,
      name: sessionName,
      reiwaYear,
      year: gregYear,
      month,
      sessionType,
      date: `${gregYear}-${mm}`,
      pdfs,
      sourceUrl,
    });
  }

  return sessions;
}

async function main() {
  console.log("=".repeat(60));
  console.log("二戸市議会 審議情報 自動取得");
  console.log("=".repeat(60));

  const allSessions: CouncilSession[] = [];
  const seenIds = new Set<string>();

  for (const { reiwaYear, url } of YEAR_PAGES) {
    console.log(`\n▶ 令和${reiwaYear}年 (${url})`);
    try {
      const html = await fetchPage(url);
      const sessions = parseSessions(html, reiwaYear, url);
      console.log(`  → ${sessions.length} セッション検出`);

      for (const s of sessions) {
        if (!seenIds.has(s.id)) {
          seenIds.add(s.id);
          allSessions.push(s);
        }
      }
    } catch (err) {
      console.error(`  ✗ 取得失敗: ${err}`);
    }

    await sleep(1500);
  }

  // 新しい順に並び替え
  allSessions.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  const output: CouncilRawData = {
    fetchedAt: new Date().toISOString(),
    sessions: allSessions,
  };

  fs.mkdirSync(path.dirname(RAW_OUT), { recursive: true });
  fs.writeFileSync(RAW_OUT, JSON.stringify(output, null, 2), "utf-8");

  console.log(`\n✓ 保存: ${RAW_OUT}`);
  console.log(`  合計 ${allSessions.length} セッション`);
  allSessions.slice(0, 8).forEach((s) => {
    const marks: string[] = [];
    if (s.pdfs.schedule) marks.push("日程");
    if (s.pdfs.questions) marks.push("質問");
    if (s.pdfs.results) marks.push("議決");
    console.log(`  - ${s.date} ${s.name} [${marks.join("/")}]`);
  });
}

main().catch((err) => {
  console.error("[fetch-ninohe-council] Fatal:", err);
  process.exit(1);
});
