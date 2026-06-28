-- ============================================================
-- council_videos テーブル
-- 二戸市議会YouTubeチャンネルの動画メタデータ・字幕・AI要約を管理する
-- Supabase Dashboard → SQL Editor でこのファイルの内容を実行する
-- ============================================================

CREATE TABLE IF NOT EXISTS council_videos (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id        text        UNIQUE NOT NULL,
  title           text        NOT NULL,
  description     text,
  session         text        DEFAULT '',
  session_date    text        DEFAULT '',   -- "YYYY-MM" 形式
  session_type    text,                     -- "定例会" | "臨時会" | NULL
  member_names    text[]      DEFAULT '{}',
  topics          text[]      DEFAULT '{}',
  summary         text,                     -- Claude による要約（200字程度）
  transcript_text text,                     -- youtube-transcript で取得した全字幕
  youtube_url     text        NOT NULL,
  thumbnail_url   text,
  published_at    timestamptz,
  duration_seconds integer,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS council_videos_session_date_idx ON council_videos(session_date DESC);
CREATE INDEX IF NOT EXISTS council_videos_published_at_idx ON council_videos(published_at DESC);

-- RLS（公開読み取り・書き込みはサービスキーのみ）
ALTER TABLE council_videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access" ON council_videos;
CREATE POLICY "Public read access" ON council_videos
  FOR SELECT USING (true);

-- updated_at の自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_council_videos_updated_at ON council_videos;
CREATE TRIGGER update_council_videos_updated_at
  BEFORE UPDATE ON council_videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
