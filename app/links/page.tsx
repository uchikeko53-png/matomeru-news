import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { Bookmark } from "@/lib/types";

export const dynamic = "force-dynamic";

async function addBookmark(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  if (!name || !url) return;

  const supabase = getSupabaseServerClient();
  await supabase.from("bookmarks").insert({ name, url });
  revalidatePath("/links");
  revalidatePath("/site-list");
}

async function deleteBookmark(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  if (!id) return;

  const supabase = getSupabaseServerClient();
  await supabase.from("bookmarks").delete().eq("id", id);
  revalidatePath("/links");
  revalidatePath("/site-list");
}

export default async function LinksPage() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("bookmarks")
    .select("*")
    .order("created_at", { ascending: true });

  const bookmarks = (data as Bookmark[]) ?? [];

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <header className="mb-6">
        <a href="/settings" className="text-sm text-gray-500 hover:underline">
          ← 各種設定に戻る
        </a>
        <p className="mt-2 text-sm text-gray-500">
          登録したサイトが「サイト一覧」タブに表示されます。
        </p>
      </header>

      <form
        action={addBookmark}
        key={bookmarks.length}
        className="mb-6 space-y-2 rounded-lg border border-gray-200 bg-white p-4"
      >
        <input
          type="text"
          name="name"
          required
          placeholder="サイト名（例: 天気予報）"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="url"
          name="url"
          required
          placeholder="URL（例: https://example.com）"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="w-full rounded bg-[#4169E1] px-4 py-2 text-sm font-medium text-white"
        >
          追加
        </button>
      </form>

      {error && (
        <p className="rounded bg-red-50 p-3 text-sm text-red-700">
          読み込みエラー: {error.message}
        </p>
      )}

      {!error && bookmarks.length === 0 && (
        <p className="text-sm text-gray-500">まだ登録されていません。</p>
      )}

      <ul className="space-y-2">
        {bookmarks.map((b) => (
          <li
            key={b.id}
            className="flex items-center justify-between gap-2 rounded border border-gray-200 bg-white px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">
                {b.name}
              </p>
              <p className="truncate text-xs text-gray-400">{b.url}</p>
            </div>
            <form action={deleteBookmark}>
              <input type="hidden" name="id" value={b.id} />
              <button
                type="submit"
                className="shrink-0 text-xs text-red-600 hover:underline"
              >
                削除
              </button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
