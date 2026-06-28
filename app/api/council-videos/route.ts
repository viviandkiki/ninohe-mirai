import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { CouncilVideoRecord } from "@/scripts/fetch/fetch-council-youtube";

export const revalidate = 3600;

const DATA_FILE = path.join(process.cwd(), "data/raw/council-videos.json");

function loadVideos(): CouncilVideoRecord[] {
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    const raw = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    return (raw.videos ?? []) as CouncilVideoRecord[];
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit  = Math.min(parseInt(searchParams.get("limit")  ?? "12"), 50);
  const offset = parseInt(searchParams.get("offset") ?? "0");
  const type   = searchParams.get("type"); // "定例会" | "臨時会"

  const all = loadVideos();

  const filtered = type ? all.filter((v) => v.session_type === type) : all;

  // transcript_text は UI に不要なので省く
  const paginated = filtered.slice(offset, offset + limit).map(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ transcript_text, ...rest }) => rest
  );

  return NextResponse.json({ videos: paginated, total: filtered.length });
}
