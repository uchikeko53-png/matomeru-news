import { NextRequest, NextResponse } from "next/server";

// /api/cron/* はGitHub Actionsからのバッチ呼び出し用で、
// 別途 CRON_SECRET ヘッダーで保護されているためBasic認証の対象外にする。
export const config = {
  matcher: ["/((?!api/cron|_next/static|_next/image|favicon.ico).*)"],
};

export function middleware(req: NextRequest) {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASS;

  if (!user || !pass) {
    // 環境変数未設定時は認証をかけようがないため素通し（ローカル動作確認用）。
    return NextResponse.next();
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Basic ")) {
    const decoded = atob(authHeader.slice(6));
    const [reqUser, reqPass] = decoded.split(":");
    if (reqUser === user && reqPass === pass) {
      return NextResponse.next();
    }
  }

  return new NextResponse("認証が必要です", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="matomeru-news"' },
  });
}
