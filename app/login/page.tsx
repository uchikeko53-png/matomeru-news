import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE } from "@/middleware";

export const dynamic = "force-dynamic";

const SESSION_MAX_AGE = 60 * 60 * 24 * 180; // 180日

async function login(formData: FormData) {
  "use server";
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  const expectedUser = process.env.BASIC_AUTH_USER;
  const expectedPass = process.env.BASIC_AUTH_PASS;

  if (
    !expectedUser ||
    !expectedPass ||
    username !== expectedUser ||
    password !== expectedPass
  ) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }

  cookies().set(AUTH_COOKIE, expectedPass, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  redirect(next.startsWith("/") ? next : "/");
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; next?: string };
}) {
  const next = searchParams.next ?? "/";

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-bold">まとめるNewS</h1>
        <form
          action={login}
          className="space-y-3 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          <input type="hidden" name="next" value={next} />
          {searchParams.error && (
            <p className="rounded bg-red-50 p-2 text-sm text-red-700">
              ユーザー名またはパスワードが違います
            </p>
          )}
          <input
            type="text"
            name="username"
            required
            autoComplete="username"
            placeholder="ユーザー名"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            placeholder="パスワード"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="w-full rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white"
          >
            ログイン
          </button>
        </form>
      </div>
    </main>
  );
}
