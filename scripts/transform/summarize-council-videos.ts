#!/usr/bin/env tsx
/**
 * Supabase の council_videos テーブルから字幕はあるが要約未生成の動画を対象に
 * Claude Haiku で要約・トピック・議員名を抽出してSupabaseを更新する
 *
 * 実行: npx tsx scripts/transform/summarize-council-videos.ts
 * 費用目安: claude-haiku-4-5 = 約 $0.00025/動画（字幕8000字）
 */

import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import "dotenv/config";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY!;
const BATCH_SIZE = 10;
const MAX_TRANSCRIPT_CHARS = 8000;

interface SummaryResult {
  summary: string;
  topics: string[];
  member_names: string[];
}

function truncateTranscript(text: string): string {
  if (text.length <= MAX_TRANSCRIPT_CHARS) return text;
  const head = Math.floor(MAX_TRANSCRIPT_CHARS * 0.65);
  const tail = MAX_TRANSCRIPT_CHARS - head;
  return text.slice(0, head) + "\n...(中略)...\n" + text.slice(-tail);
}

async function summarize(
  client: Anthropic,
  title: string,
  transcript: string
): Promise<SummaryResult> {
  const text = truncateTranscript(transcript);

  const prompt = `以下は「${title}」という二戸市議会の動画の字幕テキストです。

字幕テキスト:
${text}

以下の情報を JSON のみで返してください（余計な前置きは不要）。
評価・解釈・政党の優劣は含めないこと。事実の記述のみ。

{
  "summary": "この議会でどのような議題が扱われたかを200字以内で箇条書き（出典:字幕）",
  "topics": ["主要議題キーワード（最大5個）"],
  "member_names": ["発言が確認できた議員名（確実に特定できるもののみ、最大8名）"]
}`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`JSON not found in: ${content.text.slice(0, 100)}`);

  const result = JSON.parse(jsonMatch[0]) as Partial<SummaryResult>;
  return {
    summary: result.summary ?? "",
    topics: Array.isArray(result.topics) ? result.topics.slice(0, 5) : [],
    member_names: Array.isArray(result.member_names) ? result.member_names.slice(0, 8) : [],
  };
}

async function main() {
  console.log("=".repeat(60));
  console.log("議会動画 AI要約スクリプト（Claude Haiku）");
  console.log("=".repeat(60));

  if (!ANTHROPIC_KEY) throw new Error("ANTHROPIC_API_KEY が未設定です");
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Supabase の環境変数が未設定です");

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });

  // 字幕あり・要約なしの動画
  const { data: videos, error } = await supabase
    .from("council_videos")
    .select("id, title, transcript_text")
    .not("transcript_text", "is", null)
    .neq("transcript_text", "")
    .is("summary", null)
    .order("published_at", { ascending: false })
    .limit(BATCH_SIZE);

  if (error) { console.error("✗ Supabase エラー:", error.message); process.exit(1); }
  if (!videos?.length) { console.log("\n✓ 要約対象の動画はありません"); return; }

  console.log(`\n▶ ${videos.length} 件を要約します（最大 ${BATCH_SIZE} 件/回）`);

  let success = 0;
  let failed = 0;

  for (const video of videos) {
    process.stdout.write(`  "${video.title.slice(0, 40)}..." → `);

    try {
      const result = await summarize(anthropic, video.title, video.transcript_text!);

      await supabase
        .from("council_videos")
        .update({
          summary: result.summary,
          topics: result.topics,
          member_names: result.member_names,
        })
        .eq("id", video.id);

      console.log(`✓ トピック: [${result.topics.join(", ")}]`);
      success++;
    } catch (err) {
      console.log(`✗ ${(err as Error).message?.slice(0, 60)}`);
      failed++;
    }

    // Anthropic レート制限回避
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`\n✓ 完了: ${success}件要約, ${failed}件エラー`);
  if (videos.length === BATCH_SIZE) {
    console.log(`  ※ まだ未処理の動画があります。再度スクリプトを実行してください。`);
  }
}

main().catch((err) => {
  console.error("[summarize-council-videos] Fatal:", err);
  process.exit(1);
});
