import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { Feed } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// 1フィードあたり新着として確認するアイテム数の上限
const MAX_ITEMS_PER_FEED = 15;
// RSSの概要文をDBに保存する際の最大文字数
const MAX_SNIPPET_LENGTH = 200;

const rssParser = new Parser();

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();

  const { data: feeds, error: feedsError } = await supabase
    .from("feeds")
    .select("*")
    .eq("enabled", true);

  if (feedsError) {
    return NextResponse.json({ error: feedsError.message }, { status: 500 });
  }

  const result = {
    feedsProcessed: 0,
    feedsFailed: [] as string[],
    newArticles: 0,
    skippedExisting: 0,
    insertFailed: [] as string[],
  };

  for (const feed of (feeds ?? []) as Feed[]) {
    let items;
    try {
      const parsed = await rssParser.parseURL(feed.url);
      items = (parsed.items ?? []).slice(0, MAX_ITEMS_PER_FEED);
    } catch (err) {
      result.feedsFailed.push(`${feed.name}: ${(err as Error).message}`);
      continue;
    }
    result.feedsProcessed += 1;

    const links = items.map((item) => item.link).filter(Boolean) as string[];
    if (links.length === 0) continue;

    const { data: existing } = await supabase
      .from("articles")
      .select("link")
      .in("link", links);
    const existingLinks = new Set((existing ?? []).map((row) => row.link));

    const newRows = items
      .filter((item) => {
        if (!item.link || existingLinks.has(item.link)) {
          if (item.link) result.skippedExisting += 1;
          return false;
        }
        return true;
      })
      .map((item) => {
        const snippet = (item.contentSnippet ?? item.content ?? "").trim();
        return {
          feed_id: feed.id,
          title: item.title ?? "(タイトルなし)",
          link: item.link as string,
          source_name: feed.name,
          published_at: item.isoDate ?? item.pubDate ?? null,
          summary: snippet ? snippet.slice(0, MAX_SNIPPET_LENGTH) : null,
        };
      });

    if (newRows.length === 0) continue;

    const { error: insertError, count } = await supabase
      .from("articles")
      .insert(newRows, { count: "exact" });

    if (insertError) {
      // unique制約違反（同時実行等での重複）は無視、それ以外は記録
      if (!insertError.message.includes("duplicate")) {
        result.insertFailed.push(`${feed.name}: ${insertError.message}`);
      }
    } else {
      result.newArticles += count ?? newRows.length;
    }
  }

  return NextResponse.json(result);
}
