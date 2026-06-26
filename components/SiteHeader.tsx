"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useLocale } from "@/lib/i18n/context";
import LanguageToggle from "./LanguageToggle";

export default function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLocale();

  const NAV_LINKS = [
    { href: "/powers", label: t.nav.powers },
    { href: "/graph", label: t.nav.graph },
    { href: "/movement", label: t.nav.movement },
    { href: "/actors", label: t.nav.actors },
    { href: "/methodology", label: t.nav.methodology },
    { href: "/about", label: t.nav.about },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 border-b border-[#e2e8f0] backdrop-blur-md shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity shrink-0">
          <Image
            src="/rogo.png"
            alt="ニノヘミライ ロゴ"
            width={44}
            height={44}
            className="rounded-lg object-contain"
            priority
          />
          <div className="flex flex-col leading-none">
            <span className="text-base font-bold text-[#0f172a] tracking-tight">{t.siteName}</span>
            <span className="text-xs text-[#475569] hidden sm:block">{t.siteTagline}</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded text-base transition-colors font-medium ${
                pathname.startsWith(link.href)
                  ? "bg-[#e0f2f7] text-[#0e6b7c] font-semibold"
                  : "text-[#475569] hover:text-[#0f172a] hover:bg-[#f1f5f9]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <LanguageToggle />
          <button
            className="md:hidden p-2 rounded text-[#475569] hover:bg-[#f1f5f9] transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="メニュー"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-[#e2e8f0] bg-white">
          <nav className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-3 rounded text-base font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? "bg-[#e0f2f7] text-[#0e6b7c]"
                    : "text-[#475569] hover:text-[#0f172a] hover:bg-[#f1f5f9]"
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
