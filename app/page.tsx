import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase";
import { runFetchNewsBatch } from "@/lib/fetchNews";
import type { Article, Keyword } from "@/lib/types";

export const dynamic = "force-dynamic";

async function refreshNow() {
  "use server";
  await runFetchNewsBatch();
  revalidatePath("/");
}

const CATEGORY_PALETTE = [
  "bg-blue-100 text-blue-800",
  "bg-purple-100 text-purple-800",
  "bg-amber-100 text-amber-800",
  "bg-emerald-100 text-emerald-800",
  "bg-pink-100 text-pink-800",
  "bg-orange-100 text-orange-800",
  "bg-cyan-100 text-cyan-800",
  "bg-rose-100 text-rose-800",
];

function categoryColor(category: string) {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  }
  return CATEGORY_PALETTE[hash % CATEGORY_PALETTE.length];
}

const SOURCE_BRANDS: Record<string, string> = {
  "yahoo.co.jp": "Yahoo",
  "nhk.or.jp": "NHK",
};

function sourceHost(link: string) {
  try {
    return new URL(link).hostname.replace(/^www\d*\./, "");
  } catch {
    return null;
  }
}

function sourceBrand(link: string, fallback: string | null) {
  const host = sourceHost(link);
  if (!host) return fallback ?? "";
  const known = Object.entries(SOURCE_BRANDS).find(([domain]) =>
    host.endsWith(domain)
  );
  if (known) return known[1];
  const base = host.split(".")[0];
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function faviconUrl(link: string) {
  const host = sourceHost(link);
  return host
    ? `https://www.google.com/s2/favicons?domain=${host}&sz=32`
    : null;
}

const JST = "Asia/Tokyo";

function formatDateHeading(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ja-JP", {
    timeZone: JST,
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

function formatTime(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("ja-JP", {
    timeZone: JST,
    hour: "2-digit",
    minute: "2-digit",
  });
}

function groupByDate(articles: Article[]) {
  const groups = new Map<string, Article[]>();
  for (const article of articles) {
    const dateKey = new Date(
      article.published_at ?? article.created_at
    ).toLocaleDateString("ja-JP", { timeZone: JST });
    if (!groups.has(dateKey)) groups.set(dateKey, []);
    groups.get(dateKey)!.push(article);
  }
  return groups;
}

function ArticleCard({ article }: { article: Article }) {
  const favicon = faviconUrl(article.link);
  return (
    <li className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        {article.category && (
          <span
            className={`rounded px-2 py-0.5 text-xs font-medium ${categoryColor(
              article.category
            )}`}
          >
            {article.category}
          </span>
        )}
        <span className="flex items-center gap-1 text-xs text-gray-400">
          {favicon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={favicon} alt="" className="h-3.5 w-3.5 rounded-sm" />
          )}
          {sourceBrand(article.link, article.source_name)} ・{" "}
          {formatTime(article.published_at)}
        </span>
      </div>
      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-base font-semibold text-gray-900 hover:underline"
      >
        {article.title}
      </a>
      {article.summary && (
        <p className="mt-2 whitespace-pre-line text-sm text-gray-600">
          {article.summary}
        </p>
      )}
    </li>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const supabase = getSupabaseServerClient();
  const selectedCategory = searchParams.category;

  const [{ data: articlesData, error }, { data: keywordsData }] =
    await Promise.all([
      supabase
        .from("articles")
        .select("*")
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(150),
      supabase
        .from("keywords")
        .select("*")
        .order("created_at", { ascending: true }),
    ]);

  const allArticles = (articlesData as Article[]) ?? [];
  const keywords = (keywordsData as Keyword[]) ?? [];

  const categories = Array.from(
    new Set(
      allArticles
        .map((a) => a.category)
        .filter((c): c is string => Boolean(c))
    )
  );

  const visibleArticles = selectedCategory
    ? allArticles.filter((a) => a.category === selectedCategory)
    : allArticles;

  // キーワードごとに最新1件だけを拾う（同じ記事が複数キーワードにヒットした場合は重複させない）
  const seenMatchIds = new Set<number>();
  const matchedArticles: Article[] = [];
  for (const k of keywords) {
    const keywordLower = k.keyword.toLowerCase();
    const match = visibleArticles.find((a) => {
      if (seenMatchIds.has(a.id)) return false;
      const haystack = `${a.title} ${a.summary ?? ""}`.toLowerCase();
      return haystack.includes(keywordLower);
    });
    if (match) {
      matchedArticles.push(match);
      seenMatchIds.add(match.id);
    }
  }
  matchedArticles.sort((a, b) => {
    const at = new Date(a.published_at ?? a.created_at).getTime();
    const bt = new Date(b.published_at ?? b.created_at).getTime();
    return bt - at;
  });

  const grouped = groupByDate(visibleArticles);

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-sm text-gray-500">
          RSSで収集したニュースの一覧
        </p>
        <form action={refreshNow}>
          <button
            type="submit"
            className="shrink-0 rounded-full bg-gray-900 px-3 py-1.5 text-xs font-medium text-white"
          >
            今すぐ更新
          </button>
        </form>
      </header>

      {categories.length > 0 && (
        <nav className="mb-6 flex flex-wrap gap-2">
          <a
            href="/"
            className={`rounded-full px-3 py-1 text-sm ${
              !selectedCategory
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            すべて
          </a>
          {categories.map((cat) => (
            <a
              key={cat}
              href={`/?category=${encodeURIComponent(cat)}`}
              className={`rounded-full px-3 py-1 text-sm ${
                selectedCategory === cat
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {cat}
            </a>
          ))}
        </nav>
      )}

      {error && (
        <p className="rounded bg-red-50 p-3 text-sm text-red-700">
          読み込みエラー: {error.message}
        </p>
      )}

      {!error && matchedArticles.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-indigo-600">
            キーワード一致
          </h2>
          <ul className="space-y-3">
            {matchedArticles.map((article) => (
              <ArticleCard article={article} key={`matched-${article.id}`} />
            ))}
          </ul>
        </section>
      )}

      {!error && grouped.size === 0 && (
        <p className="text-sm text-gray-500">
          まだ記事がありません。バッチ処理（/api/cron/fetch-news）が実行されると表示されます。
        </p>
      )}

      {Array.from(grouped.entries()).map(([dateKey, items]) => (
        <section key={dateKey} className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-gray-500">
            {formatDateHeading(items[0].published_at ?? items[0].created_at)}
          </h2>
          <ul className="space-y-3">
            {items.map((article) => (
              <ArticleCard article={article} key={article.id} />
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
