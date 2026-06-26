#!/usr/bin/env tsx
/**
 * データ更新の全体オーケストレーター。
 * GitHub Actions の update-data.yml から呼ばれる。
 *
 * 実行: pnpm update-data
 * 環境変数: ESTAT_APP_ID, RESAS_API_KEY, UPDATE_MODE (light|full)
 */

import { execSync } from "child_process";

const MODE = (process.env.UPDATE_MODE ?? "light") as "light" | "full";

function run(label: string, cmd: string) {
  console.log(`\n[update-all] ▶ ${label}`);
  try {
    execSync(cmd, { stdio: "inherit", cwd: process.cwd() });
    console.log(`[update-all] ✓ ${label}`);
  } catch (err) {
    console.error(`[update-all] ✗ ${label} failed:`, err);
    // スクリプト失敗は差分なし扱いにして続行（API障害で全体が止まるのを防ぐ）
  }
}

async function main() {
  const startedAt = new Date().toISOString();
  console.log(`=`.repeat(60));
  console.log(`ニノヘミライ データ更新 [mode=${MODE}]`);
  console.log(`開始: ${startedAt}`);
  console.log(`=`.repeat(60));

  // --- Step 1: Fetch raw data ---
  // e-Stat は毎日取得（APIが無料かつ安定）
  run("fetch: e-Stat", `npx tsx scripts/fetch/fetch-estat.ts`);

  // RESAS は full モードのみ（毎日15,000リクエスト上限があるため）
  if (MODE === "full") {
    run("fetch: RESAS", `npx tsx scripts/fetch/fetch-resas.ts`);
  }

  // 二戸市議会 審議情報は毎日取得（APIキー不要・公開HTMLスクレイプ）
  run("fetch: 二戸市議会", `npx tsx scripts/fetch/fetch-ninohe-council.ts`);

  // 岩手県オープンデータカタログ（二戸市）
  run("fetch: 二戸市オープンデータカタログ", `npx tsx scripts/fetch/fetch-ninohe-open-data.ts`);

  // 二戸市公式ページの更新状況確認
  run("fetch: 二戸市公式ページ更新確認", `npx tsx scripts/fetch/fetch-ninohe-public-pages.ts`);

  // e-Stat コア統計は full モードのみ（APIキー必須）
  if (MODE === "full") {
    run("fetch: e-Stat コア統計", `npx tsx scripts/fetch/fetch-estat-core.ts`);
  }

  // --- Step 2: Transform ---
  run("transform: normalize e-Stat", `npx tsx scripts/transform/normalize-estat.ts`);

  if (MODE === "full") {
    run("transform: normalize RESAS", `npx tsx scripts/transform/normalize-resas.ts`);
  }

  // 議会セッション → movements.json に差分追加
  run("transform: normalize council", `npx tsx scripts/transform/normalize-council.ts`);

  // 指標台帳 → indicators.json 補完
  run("transform: build indicators", `npx tsx scripts/transform/build-indicators.ts`);

  // 団体台帳 整合性チェック
  run("transform: build organizations", `npx tsx scripts/transform/build-organizations.ts`);

  // 議員活動台帳 → actors.json 反映（full モードのみ）
  if (MODE === "full") {
    run("transform: build council activities", `npx tsx scripts/transform/build-council-activities.ts`);
  }

  // --- Step 3: Build derived data ---
  run("sync: build derived data", `npx tsx scripts/sync/build-derived-data.ts`);

  const finishedAt = new Date().toISOString();
  console.log(`\n${"=".repeat(60)}`);
  console.log(`完了: ${finishedAt}`);
  console.log(`=`.repeat(60));
}

main().catch((err) => {
  console.error("[update-all] Fatal error:", err);
  process.exit(1);
});
