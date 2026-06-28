#!/usr/bin/env tsx
/**
 * 二戸市議会YouTubeチャンネルから動画一覧を取得してSupabaseに保存する
 *
 * 事前準備:
 *   1. COUNCIL_YOUTUBE_CHANNEL_ID を .env.local に設定
 *      → YouTubeチャンネルページ右クリック → ソース → "channelId" で検索
 *   2. YOUTUBE_API_KEY を .env.local に設定
 *   3. Supabase に council_videos テーブルを作成済みであること
 *
 * 実行:
 *   npx tsx scripts/fetch/fetch-council-youtube.ts
 *   (または pnpm fetch-youtube)
 */

import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const API_KEY = process.env.YOUTUBE_API_KEY!;
const CHANNEL_ID = process.env.COUNCIL_YOUTUBE_CHANNEL_ID!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;

interface SearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: { medium?: { url: string }; default?: { url: string } };
  };
}

interface VideoDetail {
  id: string;
  snippet: SearchItem["snippet"];
  contentDetails: { duration: string };
}

function parseISODuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1] ?? "0") * 3600) + (parseInt(m[2] ?? "0") * 60) + parseInt(m[3] ?? "0");
}

async function yt<T>(path: string, params: Record<string, string>): Promise<T> {
  const p = new URLSearchParams({ ...params, key: API_KEY });
  const res = await fetch(`${YOUTUBE_API_BASE}/${path}?${p}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube API ${path} ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

function inferSession(title: string) {
  const matchFull = title.match(/(令和\d+年\d+月(?:定例会|臨時会))/);
  const matchType = title.match(/(定例会|臨時会)/);
  const matchYM = title.match(/令和(\d+)年(\d+)月/);

  let sessionDate = "";
  if (matchYM) {
    const year = 2018 + parseInt(matchYM[1]);
    const month = String(parseInt(matchYM[2])).padStart(2, "0");
    sessionDate = `${year}-${month}`;
  }

  return {
    session: matchFull?.[1] ?? "",
    sessionType: matchType?.[1] ?? null,
    sessionDate,
  };
}

async function main() {
  console.log("=".repeat(60));
  console.log("二戸市議会 YouTube動画 取得スクリプト");
  console.log("=".repeat(60));

  if (!API_KEY) throw new Error("YOUTUBE_API_KEY が未設定です（.env.local を確認）");
  if (!CHANNEL_ID) throw new Error("COUNCIL_YOUTUBE_CHANNEL_ID が未設定です（.env.local を確認）");
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Supabase の環境変数が未設定です");

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

  // ── Step 1: search.list でチャンネルの動画ID一覧を取得 ──────────────────
  const allItems: SearchItem[] = [];
  let pageToken: string | undefined;
  let page = 1;

  do {
    console.log(`\n▶ search ページ ${page}...`);
    const data = await yt<{ items: SearchItem[]; nextPageToken?: string }>("search", {
      channelId: CHANNEL_ID,
      type: "video",
      order: "date",
      maxResults: "50",
      part: "id,snippet",
      ...(pageToken ? { pageToken } : {}),
    });
    allItems.push(...(data.items ?? []));
    pageToken = data.nextPageToken;
    page++;
    await new Promise((r) => setTimeout(r, 300));
  } while (pageToken);

  console.log(`\n▶ 合計 ${allItems.length} 件の動画を検出`);

  // ── Step 2: videos.list で contentDetails (duration) を取得 ──────────────
  const videoIds = allItems.map((i) => i.id.videoId);
  const detailsMap = new Map<string, VideoDetail>();

  for (let i = 0; i < videoIds.length; i += 50) {
    const chunk = videoIds.slice(i, i + 50);
    const data = await yt<{ items: VideoDetail[] }>("videos", {
      id: chunk.join(","),
      part: "snippet,contentDetails",
    });
    for (const d of data.items ?? []) detailsMap.set(d.id, d);
    await new Promise((r) => setTimeout(r, 300));
  }

  // ── Step 3: Supabase に upsert ─────────────────────────────────────────────
  const rows = allItems.map((item) => {
    const videoId = item.id.videoId;
    const { session, sessionType, sessionDate } = inferSession(item.snippet.title);
    const detail = detailsMap.get(videoId);
    const thumb =
      item.snippet.thumbnails?.medium?.url ??
      item.snippet.thumbnails?.default?.url ??
      null;

    return {
      video_id: videoId,
      title: item.snippet.title,
      description: item.snippet.description?.slice(0, 1000) ?? null,
      session,
      session_date: sessionDate,
      session_type: sessionType,
      youtube_url: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnail_url: thumb,
      published_at: item.snippet.publishedAt ?? null,
      duration_seconds: detail ? parseISODuration(detail.contentDetails.duration) : null,
      member_names: [] as string[],
      topics: [] as string[],
      summary: null as string | null,
      transcript_text: null as string | null,
    };
  });

  const { error } = await supabase
    .from("council_videos")
    .upsert(rows, { onConflict: "video_id" });

  if (error) {
    console.error("✗ Supabase upsert エラー:", error.message);
    process.exit(1);
  }

  console.log(`\n✓ ${rows.length} 件を Supabase に保存しました`);
  rows.slice(0, 5).forEach((r) =>
    console.log(`  - ${r.session_date || "日付不明"} ${r.title.slice(0, 40)}`)
  );
}

main().catch((err) => {
  console.error("[fetch-council-youtube] Fatal:", err);
  process.exit(1);
});
