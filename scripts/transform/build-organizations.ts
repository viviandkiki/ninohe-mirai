#!/usr/bin/env tsx
/**
 * organization_registry.json と actors.json の整合性チェック。
 * ファイルは変更しない（チェックのみ）。
 *
 * 実行: npx tsx scripts/transform/build-organizations.ts
 */

import fs from "fs";
import path from "path";

interface OrgRegistry {
  id: string;
  name: string;
  sector: string;
  role: string;
  sourceUrl: string;
  relatedPowerSlugs: string[];
  status: string;
  actorId: string | null;
  note: string;
}

interface Actor {
  id: string;
  type: string;
  name: string;
  role: string;
  affiliation: string;
}

const ORG_FILE = path.join(process.cwd(), "data/manual/organization_registry.json");
const ACTORS_FILE = path.join(process.cwd(), "data/processed/actors.json");

function main() {
  console.log("=".repeat(60));
  console.log("団体台帳 ↔ actors.json 整合性チェック");
  console.log("=".repeat(60));

  const orgs: OrgRegistry[] = JSON.parse(fs.readFileSync(ORG_FILE, "utf-8"));
  const actors: Actor[] = JSON.parse(fs.readFileSync(ACTORS_FILE, "utf-8"));
  const actorIds = new Set(actors.map((a) => a.id));

  let okCount = 0;
  let warnCount = 0;

  console.log(`\n団体台帳: ${orgs.length} 件 / actors.json: ${actors.length} 件\n`);

  for (const org of orgs) {
    const hasActor = org.actorId !== null;
    if (!hasActor) {
      console.log(`  [planned] ${org.id} ${org.name} — actorId なし（${org.status}）`);
      okCount++;
      continue;
    }

    if (actorIds.has(org.actorId!)) {
      const actor = actors.find((a) => a.id === org.actorId);
      console.log(`  [OK] ${org.id} ${org.name} → ${org.actorId} (${actor?.name})`);
      okCount++;
    } else {
      console.warn(`  [WARN] ${org.id} ${org.name} → actorId "${org.actorId}" が actors.json に存在しない`);
      warnCount++;
    }
  }

  console.log(`\n結果: OK ${okCount} / 警告 ${warnCount}`);

  if (warnCount > 0) {
    console.warn("\n⚠ 不整合があります。actors.json に該当 actorId を追加するか、organization_registry.json の actorId を修正してください。");
  } else {
    console.log("✓ 整合性OK");
  }
}

main();
