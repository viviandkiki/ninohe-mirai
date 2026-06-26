"use client";

import { useLocale } from "@/lib/i18n/context";

export default function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center gap-0.5 text-xs font-medium" role="group" aria-label="言語切替 / Language">
      <button
        onClick={() => setLocale("ja")}
        aria-pressed={locale === "ja"}
        className={`px-2 py-1 rounded-l-md border transition-colors ${
          locale === "ja"
            ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
            : "bg-white text-[#4b5563] border-[#e2ddd6] hover:bg-[#f5f2ec]"
        }`}
      >
        日本語
      </button>
      <button
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={`px-2 py-1 rounded-r-md border-t border-r border-b transition-colors ${
          locale === "en"
            ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
            : "bg-white text-[#4b5563] border-[#e2ddd6] hover:bg-[#f5f2ec]"
        }`}
      >
        English
      </button>
    </div>
  );
}
