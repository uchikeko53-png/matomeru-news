export const dynamic = "force-dynamic";

const SETTINGS_ITEMS = [
  {
    href: "/keywords",
    label: "キーワード設定",
    description: "登録したキーワードに一致する記事を「NewS一覧」の上部に表示します。",
  },
  {
    href: "/feeds",
    label: "ソース管理",
    description: "ニュースの取得元（RSSフィード）とカテゴリを管理します。",
  },
  {
    href: "/links",
    label: "リンクサイト設定",
    description: "RSSとは別の、お気に入りサイトを「サイト一覧」タブに登録します。",
  },
];

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <header className="mb-6">
        <p className="text-sm text-gray-500">各種設定メニュー</p>
      </header>

      <ul className="space-y-3">
        {SETTINGS_ITEMS.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:bg-gray-50"
            >
              <p className="font-semibold text-gray-900">{item.label}</p>
              <p className="mt-1 text-sm text-gray-500">{item.description}</p>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
