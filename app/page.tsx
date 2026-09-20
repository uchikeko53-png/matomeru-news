import { getSupabaseServerClient } from "@/lib/supabase";
import type { Article } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatDateHeading(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

function formatTime(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function groupByDate(articles: Article[]) {
  const groups = new Map<string, Article[]>();
  for (const article of articles) {
    const dateKey = new Date(
      article.published_at ?? article.created_at
    ).toLocaleDateString("ja-JP");
    if (!groups.has(dateKey)) groups.set(dateKey, []);
    groups.get(dateKey)!.push(article);
  }
  return groups;
}

export default async function Home() {
  const supabase = getSupabaseServerClient();

  const { data: articles, error } = await supabase
    .from("articles")
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(100);

  const grouped = groupByDate((articles as Article[]) ?? []);

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">まとめるNewS</h1>
        <p className="mt-1 text-sm text-gray-500">
          RSSで収集したニュースの一覧
        </p>
      </header>

      {error && (
        <p className="rounded bg-red-50 p-3 text-sm text-red-700">
          読み込みエラー: {error.message}
        </p>
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
              <li
                key={article.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {article.source_name} ・ {formatTime(article.published_at)}
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
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
