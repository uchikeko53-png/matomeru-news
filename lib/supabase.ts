import { createClient } from "@supabase/supabase-js";

// サーバー側（API Route / Server Component）専用。
// SUPABASE_SERVICE_ROLE_KEY は絶対にクライアントに露出させないこと（NEXT_PUBLIC_を付けない）。
export function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が設定されていません（.env.local を確認してください）"
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
