import { getSupabaseServerClient } from "@/lib/supabase";
import type { Bookmark } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SiteListPage() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("bookmarks")
    .select("*")
    .order("created_at", { ascending: true });

  const bookmarks = (data as Bookmark[]) ?? [];

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <header className="mb-6">
        <p className="text-sm text-gray-500">よく使うサイトの一覧です。</p>
      </header>

      {error && (
        <p className="rounded bg-red-50 p-3 text-sm text-red-700">
          読み込みエラー: {error.message}
        </p>
      )}

      {!error && bookmarks.length === 0 && (
        <p className="text-sm text-gray-500">
          まだサイトが登録されていません。「⚙各種設定 → リンクサイト設定」から追加できます。
        </p>
      )}

      <ul className="space-y-2">
        {bookmarks.map((b) => (
          <li key={b.id}>
            <a
              href={b.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:bg-gray-50"
            >
              <p className="font-medium text-gray-900">{b.name}</p>
              <p className="mt-1 truncate text-xs text-gray-400">{b.url}</p>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
