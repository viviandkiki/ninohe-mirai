import Link from "next/link";

function MountainLogoSmall() {
  return (
    <svg
      width="20"
      height="16"
      viewBox="0 0 28 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M14 2L24 20H4L14 2Z" fill="#2e7d8c" fillOpacity="0.7" />
      <path d="M21 8L27 20H15L21 8Z" fill="#2e7d8c" fillOpacity="0.35" />
      <path d="M8 11L13 20H3L8 11Z" fill="#b8872a" fillOpacity="0.45" />
    </svg>
  );
}

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[#1e2a3a] bg-[#050810] text-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 font-bold mb-3">
              <span className="text-xl text-white font-black tracking-tight">ニノヘミライ</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-3">
              二戸市の公開情報を市民に分かりやすく届ける公共ダッシュボード。
              特定の候補者・政党を支持・批判するものではありません。
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">
              コンテンツ
            </p>
            <nav className="flex flex-col gap-2">
              {[
                { href: "/powers", label: "まちの今：6つのレンズ" },
                { href: "/graph", label: "言葉の地図" },
                { href: "/movement", label: "議会と地域の動き" },
                { href: "/actors", label: "担い手" },
                { href: "/methodology", label: "データの根拠" },
                { href: "/about", label: "このサイトについて" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-base text-white/60 hover:text-[#4dd4e7] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Data policy */}
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">
              データポリシー
            </p>
            <ul className="space-y-2 text-base text-white/60 leading-relaxed">
              <li>・ 掲載データは公開情報に基づきます</li>
              <li>・ 事実と編集部の要約は分けて表示します</li>
              <li>・ 私人の個人情報は掲載しません</li>
              <li>・ 発言量だけで人物を評価しません</li>
              <li>・ 候補者の優劣・ランキングは行いません</li>
            </ul>
            <p className="text-xs text-white/40 mt-3">
              主な出典：二戸市・岩手県・国統計・二戸市議会
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-xs text-white/30 leading-relaxed">
            掲載データは公開情報をもとに編集部が独自に整理したものです。
            最新・正確な情報は各公式サイトをご確認ください。
          </p>
          <p className="text-xs text-white/20 shrink-0">© 2026 ニノヘミライ編集部</p>
        </div>
      </div>
    </footer>
  );
}
