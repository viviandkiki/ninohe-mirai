import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const revalidate = 3600; // 1時間ISRキャッシュ

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "12"), 50);
  const offset = parseInt(searchParams.get("offset") ?? "0");
  const sessionType = searchParams.get("type"); // "定例会" | "臨時会" | null

  try {
    const supabase = createServiceClient();
    let query = supabase
      .from("council_videos")
      .select("id,video_id,title,session,session_date,session_type,topics,summary,youtube_url,thumbnail_url,published_at,duration_seconds,member_names", { count: "exact" })
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (sessionType) {
      query = query.eq("session_type", sessionType);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({ videos: data ?? [], total: count ?? 0 });
  } catch (err) {
    console.error("[api/council-videos]", err);
    return NextResponse.json({ videos: [], total: 0 }, { status: 500 });
  }
}
