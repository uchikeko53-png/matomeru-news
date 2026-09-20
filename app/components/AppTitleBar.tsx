import { Shippori_Mincho } from "next/font/google";

const shipporiMincho = Shippori_Mincho({
  subsets: ["latin"],
  weight: "700",
  display: "swap",
});

function GlobeMark() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-gray-900"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="3.7" ry="9" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <path d="M4.5 8.2c2 .9 4.9 1.4 7.5 1.4s5.5-.5 7.5-1.4" />
      <path d="M4.5 15.8c2-.9 4.9-1.4 7.5-1.4s5.5.5 7.5 1.4" />
    </svg>
  );
}

export function AppTitleBar() {
  return (
    <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-2.5">
      <GlobeMark />
      <span
        className={`${shipporiMincho.className} text-lg tracking-wide text-gray-900`}
      >
        まとめるNewS
      </span>
    </div>
  );
}
