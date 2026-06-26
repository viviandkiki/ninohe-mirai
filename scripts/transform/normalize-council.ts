#!/usr/bin/env tsx
/**
 * data/raw/council-sessions.json を読み込み、
 * 新規セッションを data/processed/movements.json に追加する。
 *
 * 実行: npx tsx scripts/transform/normalize-council.ts
 */

import fs from "fs";
import path from "path";
import type { CouncilRawData, CouncilSession } from "../fetch/fetch-ninohe-council";
import type { Movement } from "../../lib/schemas";

const RAW_IN = path.join(process.cwd(), "data/raw/council-sessions.json");
const MOVEMENTS_FILE = path.join(process.cwd(), "data/processed/movements.json");

function sessionToMovementId(session: CouncilSession): string {
  return `mov-council-${session.id}`;
}

function sessionToMovement(session: CouncilSession): Movement {
  const pdfLinks: string[] = [];
  if (session.pdfs.schedule) pdfLinks.push(`審議日程: ${session.pdfs.schedule}`);
  if (session.pdfs.questions) pdfLinks.push(`一般質問一覧: ${session.pdfs.questions}`);
  if (session.pdfs.results) pdfLinks.push(`議決結果: ${session.pdfs.results}`);

  const pdfNote =
    pdfLinks.length > 0
      ? `関連資料（PDF）: ${pdfLinks.join(" / ")}`
      : "資料は市議会ウェブサイトで公開予定。";

  const typeLabel = session.sessionType === "臨時会" ? "臨時会" : "定例会";
  const summary =
    `二戸市議会${session.name}が開催されました。` +
    (session.pdfs.questions ? "一般質問では各議員が市政課題について質問を行いました。" : "") +
    (session.pdfs.results ? "議決結果は市議会ウェブサイトで公開されています。" : "") +
    (pdfLinks.length === 0 ? "詳細は市議会ウェブサイトをご確認ください。" : "");

  const movType = typeLabel === "臨時会" ? "announcement" : "policy";

  return {
    id: sessionToMovementId(session),
    date: `${session.date}-01`,
    title: session.name,
    summary,
    type: movType as Movement["type"],
    actorIds: ["actor-council-chair"],
    powerSlugs: ["work"],
    sourceId: "src-ninohe-council",
  };
}

function main() {
  console.log("=".repeat(60));
  console.log("二戸市議会 審議情報 → movements.json 変換");
  console.log("=".repeat(60));

  if (!fs.existsSync(RAW_IN)) {
    console.error(`✗ 生データが見つかりません: ${RAW_IN}`);
    console.error("  先に scripts/fetch/fetch-ninohe-council.ts を実行してください。");
    process.exit(1);
  }

  const raw: CouncilRawData = JSON.parse(fs.readFileSync(RAW_IN, "utf-8"));
  const movements: Movement[] = JSON.parse(fs.readFileSync(MOVEMENTS_FILE, "utf-8"));

  const existingIds = new Set(movements.map((m) => m.id));
  let addedCount = 0;

  for (const session of raw.sessions) {
    const id = sessionToMovementId(session);
    if (existingIds.has(id)) {
      console.log(`  スキップ (既存): ${session.name}`);
      continue;
    }

    const movement = sessionToMovement(session);
    movements.push(movement);
    existingIds.add(id);
    addedCount++;
    console.log(`  ✓ 追加: ${movement.date} ${movement.title}`);
  }

  // 日付降順で並び替え
  movements.sort((a, b) => b.date.localeCompare(a.date));

  fs.writeFileSync(MOVEMENTS_FILE, JSON.stringify(movements, null, 2), "utf-8");
  console.log(`\n完了: ${addedCount} 件追加 / 合計 ${movements.length} 件`);
}

main();
