import type { Metadata, Viewport } from "next";
import { AppTitleBar } from "./components/AppTitleBar";
import { TabNav } from "./components/TabNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "まとめるNewS",
  description: "日々のニュースをRSSで収集して一覧表示する個人用ダイジェスト",
  appleWebApp: {
    capable: true,
    title: "まとめるNewS",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#4169E1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen">
        <div className="sticky top-0 z-10">
          <AppTitleBar />
          <TabNav />
        </div>
        {children}
      </body>
    </html>
  );
}
