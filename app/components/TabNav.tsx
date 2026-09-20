"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "一覧" },
  { href: "/keywords", label: "キーワード設定" },
  { href: "/feeds", label: "ソース管理" },
];

export function TabNav() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <nav className="sticky top-0 z-10 flex border-b border-gray-200 bg-white">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 py-3 text-center text-sm font-medium ${
              active
                ? "border-b-2 border-gray-900 text-gray-900"
                : "text-gray-500"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
