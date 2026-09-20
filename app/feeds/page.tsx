import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { Feed } from "@/lib/types";

export const dynamic = "force-dynamic";

async function addFeed(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  if (!name || !url) return;

  const supabase = getSupabaseServerClient();
  await supabase.from("feeds").insert({
    name,
    url,
    category: category || null,
  });
  revalidatePath("/feeds");
  revalidatePath("/");
}

async function toggleFeed(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const enabled = formData.get("enabled") === "true";
  if (!id) return;

  const supabase = getSupabaseServerClient();
  await supabase.from("feeds").update({ enabled: !enabled }).eq("id", id);
  revalidatePath("/feeds");
  revalidatePath("/");
}

async function deleteFeed(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  if (!id) return;

  const supabase = getSupabaseServerClient();
  await supabase.from("feeds").delete().eq("id", id);
  revalidatePath("/feeds");
  revalidatePath("/");
}

export default async function FeedsPage() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("feeds")
    .select("*")
    .order("created_at", { ascending: true });

  const feeds = (data as Feed[]) ?? [];

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <header className="mb-6">
        <p className="text-sm text-gray-500">
          ニュースの取得元（RSSフィード）とカテゴリを管理します。無効化したフィードは新規記事を取得しません。
        </p>
      </header>

      <form
        action={addFeed}
        key={feeds.length}
        className="mb-6 space-y-2 rounded-lg border border-gray-200 bg-white p-4"
      >
        <input
          type="text"
          name="name"
          required
          placeholder="サイト名（例: NHKニュース - 主要）"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="url"
          name="url"
          required
          placeholder="RSSのURL（例: https://www.nhk.or.jp/rss/news/cat0.xml）"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="text"
          name="category"
          placeholder="カテゴリ（任意、例: 国内）"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="w-full rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white"
        >
          追加
        </button>
      </form>

      {error && (
        <p className="rounded bg-red-50 p-3 text-sm text-red-700">
          読み込みエラー: {error.message}
        </p>
      )}

      {!error && feeds.length === 0 && (
        <p className="text-sm text-gray-500">
          まだフィードが登録されていません。
        </p>
      )}

      <ul className="space-y-2">
        {feeds.map((feed) => (
          <li
            key={feed.id}
            className="rounded-lg border border-gray-200 bg-white p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-gray-900">
                    {feed.name}
                  </span>
                  {feed.category && (
                    <span className="shrink-0 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {feed.category}
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-gray-400">{feed.url}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <form action={toggleFeed}>
                  <input type="hidden" name="id" value={feed.id} />
                  <input
                    type="hidden"
                    name="enabled"
                    value={String(feed.enabled)}
                  />
                  <button
                    type="submit"
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      feed.enabled
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {feed.enabled ? "有効" : "無効"}
                  </button>
                </form>
                <form action={deleteFeed}>
                  <input type="hidden" name="id" value={feed.id} />
                  <button
                    type="submit"
                    className="text-xs text-red-600 hover:underline"
                  >
                    削除
                  </button>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
