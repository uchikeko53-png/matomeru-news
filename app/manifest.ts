import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "まとめるNewS",
    short_name: "まとめるNewS",
    description: "RSSで収集したニュースを一覧表示する個人用ダイジェスト",
    start_url: "/",
    display: "standalone",
    background_color: "#F9FAFB",
    theme_color: "#111827",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
