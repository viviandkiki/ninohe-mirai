#!/usr/bin/env tsx
/**
 * 二戸市議会YouTubeチャンネルから動画一覧を取得して
 * data/raw/council-videos.json に保存する（Supabase 不要）
 *
 * 事前準備:
 *   .env.local に YOUTUBE_API_KEY と COUNCIL_YOUTUBE_CHANNEL_ID を設定
 *
 * 実行:
 *   node --env-file=.env.local node_modules/.bin/tsx scripts/fetch/fetch-council-youtube.ts
 *   または: pnpm fetch-youtube  (YOUTUBE_API_KEY を環境変数に設定した状態で)
 */

import fs from "fs";
import path from "path";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const API_KEY = process.env.YOUTUBE_API_KEY!;
const CHANNEL_ID = process.env.COUNCIL_YOUTUBE_CHANNEL_ID!;
const OUT_FILE = path.join(process.cwd(), "data/raw/council-videos.json");

export interface CouncilVideoRecord {
  video_id: string;
  title: string;
  description: string | null;
  session: string;
  session_date: string;
  session_type: string | null;
  member_names: string[];
  topics: string[];
  summary: string | null;
  transcript_text: string | null;
  youtube_url: string;
  thumbnail_url: string | null;
  published_at: string | null;
  duration_seconds: number | null;
}

export interface CouncilVideosJson {
  fetchedAt: string;
  videos: CouncilVideoRecord[];
}

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
  contentDetails: { duration: string };
}

function parseISODuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1] ?? "0") * 3600) + (parseInt(m[2] ?? "0") * 60) + parseInt(m[3] ?? "0");
}

async function yt<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  const p = new URLSearchParams({ ...params, key: API_KEY });
  const res = await fetch(`${YOUTUBE_API_BASE}/${endpoint}?${p}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube API ${endpoint} ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

function inferSession(title: string) {
  const matchFull = title.match(/(令和\d+年\d+月(?:定例会|臨時会))/);
  const matchType = title.match(/(定例会|臨時会)/);
  const matchYM   = title.match(/令和(\d+)年(\d+)月/);
  let sessionDate = "";
  if (matchYM) {
    const year  = 2018 + parseInt(matchYM[1]);
    const month = String(parseInt(matchYM[2])).padStart(2, "0");
    sessionDate = `${year}-${month}`;
  }
  return { session: matchFull?.[1] ?? "", sessionType: matchType?.[1] ?? null, sessionDate };
}

function readExisting(): CouncilVideosJson {
  if (!fs.existsSync(OUT_FILE)) return { fetchedAt: "", videos: [] };
  return JSON.parse(fs.readFileSync(OUT_FILE, "utf-8")) as CouncilVideosJson;
}

async function main() {
  console.log("=".repeat(60));
  console.log("二戸市議会 YouTube動画 取得スクリプト");
  console.log("=".repeat(60));

  if (!API_KEY)    throw new Error("YOUTUBE_API_KEY が未設定です");
  if (!CHANNEL_ID) throw new Error("COUNCIL_YOUTUBE_CHANNEL_ID が未設定です");

  // ── Step 1: search.list で動画ID一覧を収集 ──────────────────────────────
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

  // ── Step 2: videos.list で duration を取得 ─────────────────────────────
  const videoIds = allItems.map((i) => i.id.videoId);
  const detailsMap = new Map<string, VideoDetail>();

  for (let i = 0; i < videoIds.length; i += 50) {
    const chunk = videoIds.slice(i, i + 50);
    const data = await yt<{ items: VideoDetail[] }>("videos", {
      id: chunk.join(","),
      part: "contentDetails",
    });
    for (const d of data.items ?? []) detailsMap.set(d.id, d);
    await new Promise((r) => setTimeout(r, 300));
  }

  // ── Step 3: 既存JSONと merge して保存 ─────────────────────────────────
  const existing = readExisting();
  const existingMap = new Map(existing.videos.map((v) => [v.video_id, v]));

  for (const item of allItems) {
    const videoId = item.id.videoId;
    const { session, sessionType, sessionDate } = inferSession(item.snippet.title);
    const detail = detailsMap.get(videoId);
    const thumb  = item.snippet.thumbnails?.medium?.url ?? item.snippet.thumbnails?.default?.url ?? null;

    const prev = existingMap.get(videoId);
    existingMap.set(videoId, {
      // 既存の字幕・要約・トピックは保持する
      transcript_text: prev?.transcript_text ?? null,
      summary:         prev?.summary         ?? null,
      topics:          prev?.topics          ?? [],
      member_names:    prev?.member_names    ?? [],
      // YouTube から取得する最新値
      video_id:        videoId,
      title:           item.snippet.title,
      description:     item.snippet.description?.slice(0, 1000) ?? null,
      session,
      session_date:    sessionDate,
      session_type:    sessionType,
      youtube_url:     `https://www.youtube.com/watch?v=${videoId}`,
      thumbnail_url:   thumb,
      published_at:    item.snippet.publishedAt ?? null,
      duration_seconds: detail ? parseISODuration(detail.contentDetails.duration) : prev?.duration_seconds ?? null,
    });
  }

  // 公開日降順でソート
  const videos = [...existingMap.values()].sort((a, b) => {
    if (!a.published_at) return 1;
    if (!b.published_at) return -1;
    return b.published_at.localeCompare(a.published_at);
  });

  const output: CouncilVideosJson = { fetchedAt: new Date().toISOString(), videos };
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), "utf-8");

  console.log(`\n✓ ${videos.length} 件を ${OUT_FILE} に保存しました`);
  videos.slice(0, 5).forEach((v) =>
    console.log(`  - ${v.session_date || "日付不明"} ${v.title.slice(0, 40)}`)
  );
}

main().catch((err) => {
  console.error("[fetch-council-youtube] Fatal:", err);
  process.exit(1);
});
