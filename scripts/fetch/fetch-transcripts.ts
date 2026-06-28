#!/usr/bin/env tsx
/**
 * Supabase の council_videos テーブルから字幕未取得の動画を対象に
 * youtube-transcript で字幕テキストを取得してSupabaseを更新する
 *
 * 字幕が存在しない動画は transcript_text = '' をセットしてスキップ済みとする
 * 実行: npx tsx scripts/fetch/fetch-transcripts.ts
 */

import { createClient } from "@supabase/supabase-js";
import { YoutubeTranscript } from "youtube-transcript";
import "dotenv/config";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const BATCH_SIZE = 20;

async function main() {
  console.log("=".repeat(60));
  console.log("YouTube 字幕取得スクリプト");
  console.log("=".repeat(60));

  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Supabase の環境変数が未設定です");

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

  // transcript_text が NULL の動画のみ対象（'' はスキップ済み扱い）
  const { data: videos, error } = await supabase
    .from("council_videos")
    .select("id, video_id, title")
    .is("transcript_text", null)
    .order("published_at", { ascending: false })
    .limit(BATCH_SIZE);

  if (error) { console.error("✗ Supabase エラー:", error.message); process.exit(1); }
  if (!videos?.length) { console.log("\n✓ 字幕未取得の動画はありません"); return; }

  console.log(`\n▶ ${videos.length} 件の字幕を取得します（最大 ${BATCH_SIZE} 件/回）`);

  let success = 0;
  let skipped = 0;

  for (const video of videos) {
    const label = `${video.video_id} "${video.title.slice(0, 30)}..."`;
    process.stdout.write(`  ${label} → `);

    try {
      const segments = await YoutubeTranscript.fetchTranscript(video.video_id, { lang: "ja" });
      const text = segments.map((s) => s.text).join(" ").replace(/\s+/g, " ").trim();

      await supabase
        .from("council_videos")
        .update({ transcript_text: text })
        .eq("id", video.id);

      console.log(`✓ ${text.length.toLocaleString()}文字`);
      success++;
    } catch {
      // 自動生成字幕を試みる
      try {
        const segments = await YoutubeTranscript.fetchTranscript(video.video_id);
        const text = segments.map((s) => s.text).join(" ").replace(/\s+/g, " ").trim();
        await supabase.from("council_videos").update({ transcript_text: text }).eq("id", video.id);
        console.log(`✓ (自動字幕) ${text.length.toLocaleString()}文字`);
        success++;
      } catch {
        // 字幕なし: 空文字をセットしてスキップ済みにする
        await supabase.from("council_videos").update({ transcript_text: "" }).eq("id", video.id);
        console.log("⚠ 字幕なし（スキップ）");
        skipped++;
      }
    }

    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(`\n✓ 完了: ${success}件取得, ${skipped}件スキップ`);
  if (videos.length === BATCH_SIZE) {
    console.log(`  ※ まだ未処理の動画があります。再度スクリプトを実行してください。`);
  }
}

main().catch((err) => {
  console.error("[fetch-transcripts] Fatal:", err);
  process.exit(1);
});
