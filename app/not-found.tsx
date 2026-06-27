import type { Metadata } from "next";
import Link from "next/link";
import { Mountain, ArrowLeft, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "ページが見つかりません",
  description: "お探しのページは存在しないか、移動した可能性があります。",
};

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-[#f7f4ef] rounded-2xl">
            <Mountain className="w-10 h-10 text-[#2e7d8c]" aria-hidden="true" />
          </div>
        </div>

        <p className="text-5xl font-bold text-[#2e7d8c] mb-3 tabular-nums">404</p>
        <h1 className="text-xl font-bold text-[#1a1a2e] mb-3">
          ページが見つかりません
        </h1>
        <p className="text-sm text-[#6b7280] leading-relaxed mb-8">
          お探しのページは存在しないか、移動した可能性があります。
          URLをご確認のうえ、以下のリンクからお探しください。
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-[#2e7d8c] hover:bg-[#256e7c] text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            トップへ戻る
          </Link>
          <Link
            href="/powers"
            className="inline-flex items-center justify-center gap-2 bg-white border border-[#e5e1da] hover:bg-[#f7f4ef] text-[#1a1a2e] font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
          >
            <Search className="w-4 h-4" />
            市の現状を見る
          </Link>
        </div>

        <div className="mt-10 text-xs text-[#6b7280] space-y-1">
          <p>よく見られるページ：</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-1">
            {[
              { href: "/movement", label: "動き" },
              { href: "/actors", label: "担い手" },
              { href: "/methodology", label: "調査方法" },
              { href: "/about", label: "このサイトについて" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#2e7d8c] hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
