import type { Metadata } from "next";
import { TabNav } from "./components/TabNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "まとめるNewS",
  description: "日々のニュースをRSSで収集して一覧表示する個人用ダイジェスト",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen">
        <TabNav />
        {children}
      </body>
    </html>
  );
}
