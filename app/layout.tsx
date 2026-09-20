import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "まとめるNewS",
  description: "日々のニュースをRSSで収集し、Claudeで要約する個人用ダイジェスト",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
