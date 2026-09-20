import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { Keyword } from "@/lib/types";

export const dynamic = "force-dynamic";

async function addKeyword(formData: FormData) {
  "use server";
  const keyword = String(formData.get("keyword") ?? "").trim();
  if (!keyword) return;

  const supabase = getSupabaseServerClient();
  await supabase.from("keywords").insert({ keyword });
  revalidatePath("/keywords");
  revalidatePath("/");
}

async function deleteKeyword(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  if (!id) return;

  const supabase = getSupabaseServerClient();
  await supabase.from("keywords").delete().eq("id", id);
  revalidatePath("/keywords");
  revalidatePath("/");
}

export default async function KeywordsPage() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("keywords")
    .select("*")
    .order("created_at", { ascending: true });

  const keywords = (data as Keyword[]) ?? [];

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <header className="mb-6">
        <p className="text-sm text-gray-500">
          登録したキーワードがタイトルや概要に含まれる記事が、「一覧」タブの上部「キーワード一致」に表示されます。
        </p>
      </header>

      <form action={addKeyword} className="mb-6 flex gap-2">
        <input
          type="text"
          name="keyword"
          required
          placeholder="キーワードを入力（例: 台風）"
          className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white"
        >
          追加
        </button>
      </form>

      {error && (
        <p className="rounded bg-red-50 p-3 text-sm text-red-700">
          読み込みエラー: {error.message}
        </p>
      )}

      {!error && keywords.length === 0 && (
        <p className="text-sm text-gray-500">
          まだキーワードが登録されていません。
        </p>
      )}

      <ul className="space-y-2">
        {keywords.map((k) => (
          <li
            key={k.id}
            className="flex items-center justify-between rounded border border-gray-200 bg-white px-3 py-2"
          >
            <span className="text-sm text-gray-900">{k.keyword}</span>
            <form action={deleteKeyword}>
              <input type="hidden" name="id" value={k.id} />
              <button
                type="submit"
                className="text-xs text-red-600 hover:underline"
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
