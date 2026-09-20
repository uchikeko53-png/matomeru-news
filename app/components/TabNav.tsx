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
    <nav className="flex border-b border-gray-200 bg-white">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 border-b-2 py-3 text-center text-sm font-medium ${
              active
                ? "border-[#4169E1] text-[#4169E1]"
                : "border-transparent text-gray-500"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
