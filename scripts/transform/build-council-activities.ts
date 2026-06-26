#!/usr/bin/env tsx
/**
 * council_activity_registry.json の内容を actors.json に反映する。
 * - summary が短い場合は topicSummary で補完
 * - lastActive を updatedAt で更新（新しい方を採用）
 *
 * 実行: npx tsx scripts/transform/build-council-activities.ts
 */

import fs from "fs";
import path from "path";

interface CouncilActivity {
  id: string;
  memberName: string;
  role: string;
  affiliation: string;
  actorId: string;
  topicSummary: string;
  recurringTopics: string[];
  powerFocus: string[];
  sourceLinks: string[];
  sourceIssue: string;
  updatedAt: string;
}

interface Actor {
  id: string;
  type: string;
  name: string;
  role: string;
  affiliation: string;
  focusPowers: string[];
  lastActive: string;
  summary: string;
}

const CACT_FILE = path.join(process.cwd(), "data/manual/council_activity_registry.json");
const ACTORS_FILE = path.join(process.cwd(), "data/processed/actors.json");

function main() {
  console.log("=".repeat(60));
  console.log("議員活動台帳 → actors.json 反映");
  console.log("=".repeat(60));

  const activities: CouncilActivity[] = JSON.parse(fs.readFileSync(CACT_FILE, "utf-8"));
  const actors: Actor[] = JSON.parse(fs.readFileSync(ACTORS_FILE, "utf-8"));

  let updatedCount = 0;
  let skippedCount = 0;

  for (const cact of activities) {
    const actor = actors.find((a) => a.id === cact.actorId);
    if (!actor) {
      console.warn(`  [WARN] actorId "${cact.actorId}" が actors.json に見つかりません — スキップ`);
      skippedCount++;
      continue;
    }

    let changed = false;

    // summary が短い（80文字未満）なら topicSummary で補完
    if (actor.summary.length < 80 && cact.topicSummary) {
      actor.summary = cact.topicSummary;
      changed = true;
    }

    // lastActive: 新しい方を採用
    const actorDate = actor.lastActive.replace(/^(\d{4})-(\d{2})$/, "$1-$2-01");
    const cactDate = cact.updatedAt;
    if (cactDate > actorDate) {
      actor.lastActive = cact.updatedAt.slice(0, 7); // YYYY-MM
      changed = true;
    }

    if (changed) {
      console.log(`  ✓ 更新: ${actor.name} (${cact.actorId})`);
      updatedCount++;
    } else {
      console.log(`  スキップ: ${actor.name} — 変更なし`);
      skippedCount++;
    }
  }

  fs.writeFileSync(ACTORS_FILE, JSON.stringify(actors, null, 2), "utf-8");
  console.log(`\n完了: ${updatedCount} 件更新 / ${skippedCount} 件スキップ`);
}

main();
