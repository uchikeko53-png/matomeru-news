import { NextRequest, NextResponse } from "next/server";

export const AUTH_COOKIE = "matomeru_auth";

// /api/cron/* はGitHub Actionsからのバッチ呼び出し用で、
// 別途 CRON_SECRET ヘッダーで保護されているため対象外にする。
// /login はログイン自体が対象外でないと、ログイン画面にすら辿り着けなくなる。
// アイコン・マニフェスト関連は、ホーム画面への追加時にOS側が未ログイン状態で
// 直接取得するため対象外にする（認証をかけると正しくアイコンが表示されない）。
export const config = {
  matcher: [
    "/((?!api/cron|login|_next/static|_next/image|favicon.ico|apple-icon.png|icon.svg|manifest.webmanifest|icons/).*)",
  ],
};

export function middleware(req: NextRequest) {
  const pass = process.env.BASIC_AUTH_PASS;

  if (!pass) {
    // 環境変数未設定時は認証をかけようがないため素通し（ローカル動作確認用）。
    return NextResponse.next();
  }

  const cookie = req.cookies.get(AUTH_COOKIE)?.value;
  if (cookie === pass) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}
