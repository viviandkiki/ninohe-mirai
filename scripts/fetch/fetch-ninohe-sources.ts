#!/usr/bin/env tsx
/**
 * 二戸市・岩手県の公開資料から手動更新が必要なデータのチェックリストを出力する。
 *
 * 完全自動取得が難しいデータソースについて、
 * 更新確認先URLと最終更新日を管理するスクリプト。
 *
 * 実行: npx tsx scripts/fetch/fetch-ninohe-sources.ts
 */

interface ManualSource {
  id: string;
  name: string;
  url: string;
  updateFrequency: string;
  lastChecked: string;
  dataFile: string;
  note?: string;
}

const MANUAL_SOURCES: ManualSource[] = [
  {
    id: "ninohe-statistics",
    name: "二戸市統計書",
    url: "https://www.city.ninohe.iwate.jp/",
    updateFrequency: "年1回（例年3〜5月頃）",
    lastChecked: "2026-06-26",
    dataFile: "data/processed/indicators.json",
    note: "就業率・世帯数・産業別就業者を手動更新",
  },
  {
    id: "ninohe-council",
    name: "二戸市議会 審議情報 [自動取得]",
    url: "https://www.city.ninohe.lg.jp/menu/21",
    updateFrequency: "毎日 (GitHub Actions / fetch-ninohe-council.ts)",
    lastChecked: "2026-06-26",
    dataFile: "data/raw/council-sessions.json → data/processed/movements.json",
    note: "定例会・臨時会の審議日程・一般質問・議決結果PDFリンクを自動取得",
  },
  {
    id: "ninohe-migration",
    name: "移住定住実績",
    url: "https://www.city.ninohe.iwate.jp/",
    updateFrequency: "年度末報告（4〜5月頃）",
    lastChecked: "2026-06-26",
    dataFile: "data/processed/indicators.json",
  },
  {
    id: "iwate-tourism",
    name: "岩手県観光統計",
    url: "https://www.pref.iwate.jp/",
    updateFrequency: "年1回（翌年春頃）",
    lastChecked: "2026-06-26",
    dataFile: "data/processed/indicators.json",
  },
  {
    id: "ninohe-education",
    name: "二戸市教育委員会資料",
    url: "https://www.city.ninohe.iwate.jp/",
    updateFrequency: "年1回",
    lastChecked: "2026-06-26",
    dataFile: "data/processed/indicators.json",
    note: "学校数・文化財件数の更新",
  },
];

function main() {
  console.log("=".repeat(60));
  console.log("二戸市データソース 手動更新チェックリスト");
  console.log("=".repeat(60));
  console.log();

  for (const source of MANUAL_SOURCES) {
    console.log(`📋 ${source.name}`);
    console.log(`   URL: ${source.url}`);
    console.log(`   更新頻度: ${source.updateFrequency}`);
    console.log(`   最終確認: ${source.lastChecked}`);
    console.log(`   更新先ファイル: ${source.dataFile}`);
    if (source.note) console.log(`   備考: ${source.note}`);
    console.log();
  }

  console.log(`合計 ${MANUAL_SOURCES.length} ソースの手動確認が必要です。`);
  console.log("自動取得可能なデータ: e-Stat (fetch-estat.ts) / RESAS (fetch-resas.ts)");
}

main();
