"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/powers", label: "6つの力" },
  { href: "/graph", label: "論点マップ" },
  { href: "/movement", label: "動き" },
  { href: "/actors", label: "担い手" },
  { href: "/methodology", label: "調査方法" },
  { href: "/about", label: "このサイトについて" },
];

function MountainLogo() {
  return (
    <svg width="28" height="22" viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M14 2L24 20H4L14 2Z" fill="#2e7d8c" fillOpacity="0.85" />
      <path d="M21 8L27 20H15L21 8Z" fill="#2e7d8c" fillOpacity="0.4" />
      <path d="M8 11L13 20H3L8 11Z" fill="#b8872a" fillOpacity="0.5" />
    </svg>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#f7f4ef] border-b border-[#e5e1da] shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <MountainLogo />
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold text-[#1a1a2e] tracking-tight">ニノヘミライ</span>
            <span className="text-[10px] text-[#6b7280] hidden sm:block">二戸の資源と未来を見える化する</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                pathname.startsWith(link.href)
                  ? "bg-[#2e7d8c]/10 text-[#2e7d8c] font-medium"
                  : "text-[#6b7280] hover:text-[#1a1a2e] hover:bg-[#e5e1da]/60"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          className="md:hidden p-2 rounded text-[#6b7280] hover:bg-[#e5e1da] transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="メニュー"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-[#e5e1da] bg-[#f7f4ef]">
          <nav className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2.5 rounded text-sm transition-colors ${
                  pathname.startsWith(link.href)
                    ? "bg-[#2e7d8c]/10 text-[#2e7d8c] font-medium"
                    : "text-[#6b7280] hover:text-[#1a1a2e] hover:bg-[#e5e1da]/60"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
