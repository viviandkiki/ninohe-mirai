import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? supabaseServiceKey;

// Server-side client (service role, for API routes and scripts)
export function createServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

// Client-side client (anon key)
export function createBrowserClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

export type CouncilVideo = {
  id: string;
  video_id: string;
  title: string;
  session: string;
  session_date: string;
  session_type: string | null;
  member_names: string[];
  topics: string[];
  summary: string | null;
  transcript_text: string | null;
  youtube_url: string;
  created_at: string;
  updated_at: string;
};

export type Actor = {
  id: string;
  name: string;
  name_kana: string | null;
  role: string | null;
  faction: string | null;
  mention_count: number;
  description: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
};
