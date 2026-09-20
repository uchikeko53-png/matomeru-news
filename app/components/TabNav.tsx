"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SETTINGS_PATHS = ["/settings", "/keywords", "/feeds", "/links"];

const TABS = [
  { href: "/", label: "NewS一覧", match: (p: string) => p === "/" },
  {
    href: "/site-list",
    label: "サイト一覧",
    match: (p: string) => p === "/site-list",
  },
  {
    href: "/settings",
    label: "⚙各種設定",
    match: (p: string) => SETTINGS_PATHS.includes(p),
  },
];

export function TabNav() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <nav className="flex border-b border-gray-200 bg-white">
      {TABS.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`min-w-0 flex-1 border-b-2 px-1 py-3 text-center text-sm font-medium ${
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
