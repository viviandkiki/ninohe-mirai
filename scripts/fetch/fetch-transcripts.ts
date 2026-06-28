#!/usr/bin/env tsx
/**
 * data/raw/council-videos.json から字幕未取得の動画を対象に
 * youtube-transcript で字幕テキストを取得してJSONを更新する
 *
 * 実行:
 *   npx tsx scripts/fetch/fetch-transcripts.ts
 *   (環境変数不要)
 */

import fs from "fs";
import path from "path";
import { YoutubeTranscript } from "youtube-transcript";
import type { CouncilVideosJson } from "./fetch-council-youtube";

const OUT_FILE = path.join(process.cwd(), "data/raw/council-videos.json");
const BATCH_SIZE = 20;

async function main() {
  console.log("=".repeat(60));
  console.log("YouTube 字幕取得スクリプト");
  console.log("=".repeat(60));

  if (!fs.existsSync(OUT_FILE)) {
    throw new Error(`${OUT_FILE} が見つかりません。先に pnpm fetch-youtube を実行してください`);
  }

  const data: CouncilVideosJson = JSON.parse(fs.readFileSync(OUT_FILE, "utf-8"));

  // transcript_text が null の動画のみ対象（'' はスキップ済み扱い）
  const targets = data.videos
    .filter((v) => v.transcript_text === null)
    .slice(0, BATCH_SIZE);

  if (targets.length === 0) {
    console.log("\n✓ 字幕未取得の動画はありません");
    return;
  }

  console.log(`\n▶ ${targets.length} 件の字幕を取得します（最大 ${BATCH_SIZE} 件/回）`);

  let success = 0;
  let skipped = 0;

  for (const video of targets) {
    const label = `${video.video_id} "${video.title.slice(0, 30)}..."`;
    process.stdout.write(`  ${label} → `);

    let text: string | null = null;

    // 日本語字幕 → 自動生成字幕の順にフォールバック
    for (const lang of ["ja", undefined]) {
      try {
        const opts = lang ? { lang } : {};
        const segments = await YoutubeTranscript.fetchTranscript(video.video_id, opts);
        text = segments.map((s) => s.text).join(" ").replace(/\s+/g, " ").trim();
        break;
      } catch {
        // 次のフォールバックへ
      }
    }

    if (text) {
      video.transcript_text = text;
      console.log(`✓ ${text.length.toLocaleString()}文字`);
      success++;
    } else {
      video.transcript_text = ""; // スキップ済みフラグ
      console.log("⚠ 字幕なし（スキップ）");
      skipped++;
    }

    await new Promise((r) => setTimeout(r, 1000));
  }

  // JSONを上書き保存
  fs.writeFileSync(OUT_FILE, JSON.stringify(data, null, 2), "utf-8");

  console.log(`\n✓ 完了: ${success}件取得, ${skipped}件スキップ`);

  const remaining = data.videos.filter((v) => v.transcript_text === null).length;
  if (remaining > 0) {
    console.log(`  ※ まだ ${remaining} 件未処理です。再度スクリプトを実行してください。`);
  }
}

main().catch((err) => {
  console.error("[fetch-transcripts] Fatal:", err);
  process.exit(1);
});
