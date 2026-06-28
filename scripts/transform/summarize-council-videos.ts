#!/usr/bin/env tsx
/**
 * data/raw/council-videos.json から字幕はあるが要約未生成の動画を対象に
 * Claude Haiku で要約・トピック・議員名を抽出してJSONを更新する
 *
 * 実行:
 *   node --env-file=.env.local node_modules/.bin/tsx scripts/transform/summarize-council-videos.ts
 *   または: ANTHROPIC_API_KEY=sk-ant-xxx npx tsx scripts/transform/summarize-council-videos.ts
 *
 * 費用目安: claude-haiku-4-5 ≈ $0.00025/動画（字幕8000字）
 */

import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import type { CouncilVideosJson } from "../fetch/fetch-council-youtube";

const OUT_FILE = path.join(process.cwd(), "data/raw/council-videos.json");
const BATCH_SIZE = 10;
const MAX_CHARS = 8000;

interface SummaryResult {
  summary: string;
  topics: string[];
  member_names: string[];
}

function truncate(text: string): string {
  if (text.length <= MAX_CHARS) return text;
  const head = Math.floor(MAX_CHARS * 0.65);
  return text.slice(0, head) + "\n...(中略)...\n" + text.slice(-(MAX_CHARS - head));
}

async function summarize(client: Anthropic, title: string, transcript: string): Promise<SummaryResult> {
  const prompt = `以下は「${title}」という二戸市議会の動画の字幕テキストです。

字幕テキスト:
${truncate(transcript)}

以下の情報をJSONのみで返してください（前置き不要）。
評価・政党の優劣・議員の順位付けは含めないこと。事実の記述のみ。

{
  "summary": "この議会でどのような議題が扱われたかを200字以内で箇条書き（出典:字幕）",
  "topics": ["主要議題キーワード（最大5個）"],
  "member_names": ["発言が確認できた議員名（確実なもののみ、最大8名）"]
}`;

  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }],
  });

  const content = msg.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  const match = content.text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`JSON が見つかりません: ${content.text.slice(0, 100)}`);

  const result = JSON.parse(match[0]) as Partial<SummaryResult>;
  return {
    summary:      result.summary ?? "",
    topics:       Array.isArray(result.topics)       ? result.topics.slice(0, 5)       : [],
    member_names: Array.isArray(result.member_names) ? result.member_names.slice(0, 8) : [],
  };
}

async function main() {
  console.log("=".repeat(60));
  console.log("議会動画 AI要約スクリプト（Claude Haiku）");
  console.log("=".repeat(60));

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY が未設定です");

  if (!fs.existsSync(OUT_FILE)) {
    throw new Error(`${OUT_FILE} が見つかりません。先に pnpm fetch-youtube を実行してください`);
  }

  const data: CouncilVideosJson = JSON.parse(fs.readFileSync(OUT_FILE, "utf-8"));
  const client = new Anthropic({ apiKey });

  // 字幕あり・要約なしの動画
  const targets = data.videos
    .filter((v) => v.transcript_text && v.transcript_text.length > 100 && v.summary === null)
    .slice(0, BATCH_SIZE);

  if (targets.length === 0) {
    console.log("\n✓ 要約対象の動画はありません");
    return;
  }

  console.log(`\n▶ ${targets.length} 件を要約します（最大 ${BATCH_SIZE} 件/回）`);

  let success = 0;
  let failed  = 0;

  for (const video of targets) {
    process.stdout.write(`  "${video.title.slice(0, 40)}..." → `);

    try {
      const result = await summarize(client, video.title, video.transcript_text!);
      video.summary      = result.summary;
      video.topics       = result.topics;
      video.member_names = result.member_names;
      console.log(`✓ [${result.topics.join(", ")}]`);
      success++;
    } catch (err) {
      console.log(`✗ ${(err as Error).message?.slice(0, 60)}`);
      failed++;
    }

    await new Promise((r) => setTimeout(r, 2000)); // Anthropic レート制限回避
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(data, null, 2), "utf-8");

  console.log(`\n✓ 完了: ${success}件要約, ${failed}件エラー`);

  const remaining = data.videos.filter((v) => v.transcript_text && v.transcript_text.length > 100 && v.summary === null).length;
  if (remaining > 0) {
    console.log(`  ※ まだ ${remaining} 件未処理です。再度スクリプトを実行してください。`);
  }
}

main().catch((err) => {
  console.error("[summarize-council-videos] Fatal:", err);
  process.exit(1);
});
