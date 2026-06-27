import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export type NewsArticle = {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  publishedLabel: string;
};

function extractTag(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, "i"));
  return m?.[1]?.trim() ?? "";
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["'][^>]*>`, "i"));
  return m?.[1]?.trim() ?? "";
}

function parseGoogleNewsRSS(xml: string): NewsArticle[] {
  const articles: NewsArticle[] = [];
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? [];

  for (const item of itemMatches) {
    const rawTitle = extractTag(item, "title");
    // Google News タイトルは "記事名 - 媒体名" 形式なので末尾の媒体名を除去
    const title = rawTitle.replace(/ - [^-]+$/, "").trim();

    // Google News の <link> は自己終了タグの後に URL が来ることがある
    const urlFromLink = extractTag(item, "link");
    const urlFromGuid = extractTag(item, "guid");
    const url = urlFromLink || urlFromGuid || "";

    const source = extractAttr(item, "source", "url")
      ? extractTag(item, "source")
      : rawTitle.match(/ - ([^-]+)$/)?.[1]?.trim() ?? "";

    const pubDate = extractTag(item, "pubDate");
    const date = pubDate ? new Date(pubDate) : new Date();
    const publishedLabel = isNaN(date.getTime())
      ? pubDate
      : `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;

    if (title && url) {
      articles.push({ title, url, source, publishedAt: pubDate, publishedLabel });
    }
  }

  return articles;
}

export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get("q") ?? "";
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? "5"), 10);

  if (!keyword.trim()) {
    return NextResponse.json({ articles: [] });
  }

  // Google News RSS（APIキー不要）
  const query = encodeURIComponent(`${keyword} 二戸 OR 岩手`);
  const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=ja&gl=JP&ceid=JP:ja`;

  try {
    const res = await fetch(rssUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; NinoheBot/1.0)" },
      next: { revalidate: 1800 }, // 30分キャッシュ
    });

    if (!res.ok) {
      return NextResponse.json({ articles: [] });
    }

    const xml = await res.text();
    const articles = parseGoogleNewsRSS(xml).slice(0, limit);

    return NextResponse.json(
      { articles },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      }
    );
  } catch {
    return NextResponse.json({ articles: [] });
  }
}
