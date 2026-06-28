"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Play, Clock, Calendar, Tag } from "lucide-react";
import type { CouncilVideo } from "@/lib/supabase";
import PageContainer from "@/components/PageContainer";

type VideoWithoutTranscript = Omit<CouncilVideo, "transcript_text">;

function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}時間${m}分`;
  return `${m}分`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function VideoCard({ video }: { video: VideoWithoutTranscript }) {
  return (
    <div className="bg-white border border-[#e5e1da] rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      {/* サムネイル */}
      <a
        href={video.youtube_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative aspect-video bg-[#1a1a2e] group"
        aria-label={`${video.title} をYouTubeで見る`}
      >
        {video.thumbnail_url ? (
          <Image
            src={video.thumbnail_url}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Play className="w-12 h-12 text-white/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-90 transition-opacity drop-shadow" />
        </div>
        {video.duration_seconds ? (
          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-mono">
            {formatDuration(video.duration_seconds)}
          </span>
        ) : null}
      </a>

      {/* 情報 */}
      <div className="p-4">
        {/* セッション・日付 */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {video.session_type && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              video.session_type === "定例会"
                ? "bg-[#e0f2f7] text-[#0e6b7c]"
                : "bg-[#fef3c7] text-[#92400e]"
            }`}>
              {video.session_type}
            </span>
          )}
          {video.session && (
            <span className="text-xs text-[#475569] font-medium">{video.session}</span>
          )}
          {video.published_at && (
            <span className="text-xs text-[#94a3b8] flex items-center gap-1 ml-auto">
              <Calendar className="w-3 h-3" />
              {formatDate(video.published_at)}
            </span>
          )}
        </div>

        {/* タイトル */}
        <h2 className="text-base font-bold text-[#0f172a] leading-snug mb-3 line-clamp-2">
          {video.title}
        </h2>

        {/* AI要約 */}
        {video.summary ? (
          <div className="mb-3 text-sm text-[#475569] leading-relaxed bg-[#f8fafc] border-l-2 border-[#2e7d8c]/40 pl-3 py-2 rounded-r">
            <p className="text-xs font-semibold text-[#0e6b7c] mb-1">
              AI要約（字幕より・出典: YouTube字幕）
            </p>
            {video.summary}
          </div>
        ) : null}

        {/* トピックチップ */}
        {video.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            <Tag className="w-3.5 h-3.5 text-[#94a3b8] shrink-0 mt-0.5" />
            {video.topics.map((t) => (
              <span key={t} className="text-xs px-2 py-0.5 bg-[#f1f5f9] text-[#475569] rounded-full">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* 発言議員 */}
        {video.member_names.length > 0 && (
          <p className="text-xs text-[#94a3b8] mb-3">
            発言確認: {video.member_names.join("・")}
          </p>
        )}

        <a
          href={video.youtube_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm font-semibold text-[#0e6b7c] hover:text-[#0f172a] transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          YouTubeで見る
        </a>
      </div>
    </div>
  );
}

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="py-20 text-center">
      <Play className="w-12 h-12 text-[#cbd5e1] mx-auto mb-4" />
      {hasFilter ? (
        <p className="text-[#6b7280]">この種別の動画はありません</p>
      ) : (
        <>
          <p className="text-lg font-semibold text-[#0f172a] mb-2">動画データがまだありません</p>
          <p className="text-sm text-[#6b7280] max-w-md mx-auto">
            スクリプトを実行してYouTubeから動画を取得してください。
          </p>
          <code className="block mt-4 text-xs bg-[#f1f5f9] px-4 py-2 rounded-lg text-[#475569] max-w-xs mx-auto">
            pnpm fetch-youtube
          </code>
        </>
      )}
    </div>
  );
}

type FilterType = "all" | "定例会" | "臨時会";

export default function CouncilVideosPage() {
  const [videos, setVideos] = useState<VideoWithoutTranscript[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [offset, setOffset] = useState(0);
  const LIMIT = 12;

  useEffect(() => {
    setLoading(true);
    setOffset(0);
    const params = new URLSearchParams({ limit: String(LIMIT), offset: "0" });
    if (filter !== "all") params.set("type", filter);

    fetch(`/api/council-videos?${params}`)
      .then((r) => r.json())
      .then((d) => { setVideos(d.videos ?? []); setTotal(d.total ?? 0); })
      .catch(() => { setVideos([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [filter]);

  function loadMore() {
    const next = offset + LIMIT;
    const params = new URLSearchParams({ limit: String(LIMIT), offset: String(next) });
    if (filter !== "all") params.set("type", filter);

    fetch(`/api/council-videos?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setVideos((prev) => [...prev, ...(d.videos ?? [])]);
        setOffset(next);
      });
  }

  const hasMore = videos.length < total;

  return (
    <PageContainer>
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#0f172a] mb-2">議会放送アーカイブ</h1>
        <p className="text-base text-[#475569] max-w-2xl leading-relaxed">
          二戸市議会のYouTube放送をまとめています。字幕をもとにAIが議題・発言者を整理しています。
        </p>
        <p className="text-xs text-[#94a3b8] mt-2">
          出典: 二戸市議会公式YouTube / AI要約はyoutube-transcript取得字幕をもとに生成（Claude Haiku）
        </p>
      </div>

      {/* フィルター */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "定例会", "臨時会"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? "bg-[#2e7d8c] text-white"
                : "bg-white border border-[#e2e8f0] text-[#475569] hover:border-[#2e7d8c]"
            }`}
          >
            {f === "all" ? "すべて" : f}
            {f === "all" && total > 0 && (
              <span className="ml-1.5 text-xs opacity-70">{total}</span>
            )}
          </button>
        ))}
      </div>

      {/* 一覧 */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white border border-[#e5e1da] overflow-hidden animate-pulse">
              <div className="aspect-video bg-[#f1f5f9]" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-[#f1f5f9] rounded w-1/3" />
                <div className="h-4 bg-[#f1f5f9] rounded w-full" />
                <div className="h-4 bg-[#f1f5f9] rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <EmptyState hasFilter={filter !== "all"} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {videos.map((v) => <VideoCard key={v.id} video={v} />)}
          </div>

          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={loadMore}
                className="px-6 py-2.5 border border-[#2e7d8c] text-[#0e6b7c] font-semibold rounded-xl hover:bg-[#e0f2f7] transition-colors text-sm"
              >
                さらに読み込む ({total - videos.length}件)
              </button>
            </div>
          )}
        </>
      )}

      <div className="mt-10 p-4 bg-[#f7f4ef] border border-[#e5e1da] rounded-xl">
        <p className="text-xs text-[#6b7280] leading-relaxed">
          AI要約は字幕テキストをもとに自動生成したものです。発言内容の正確性は各動画の映像でご確認ください。
          議員の評価・順位付けは行っていません。
        </p>
      </div>

      <div className="mt-4 flex gap-4 text-sm">
        <Link href="/movement" className="text-[#0e6b7c] hover:underline">← 議会と地域の動き</Link>
        <a
          href="https://www.youtube.com/results?search_query=二戸市議会"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#0e6b7c] hover:underline flex items-center gap-1"
        >
          YouTube で検索 <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </PageContainer>
  );
}
