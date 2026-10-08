import type { Metadata } from "next";
import PageContainer from "@/components/PageContainer";

export const metadata: Metadata = {
  title: "利用条件",
  description: "ニノヘミライの利用条件、情報の位置づけ、外部サービスについて説明します。",
};

export default function TermsPage() {
  return (
    <PageContainer narrow>
      <div className="mb-10">
        <h1 className="text-3xl font-black tracking-tight text-[#0f172a]">利用条件</h1>
        <p className="mt-3 text-sm text-[#6b7280]">最終更新：2026年10月8日</p>
      </div>

      <div className="space-y-9 text-sm leading-relaxed text-[#475569]">
        <section>
          <h2 className="mb-3 text-lg font-bold text-[#0f172a]">サイトの位置づけ</h2>
          <p>
            ニノヘミライは、荻野光希が個人で運営する非公式の地域情報サイトです。
            二戸市、二戸市議会、政党、会派、企業その他の団体が運営する公式サイトではなく、選挙運動や特定候補への投票依頼を目的とするものでもありません。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-[#0f172a]">情報の正確性</h2>
          <p>
            公開された一次情報を優先し、出典と確認日を示すよう努めますが、掲載後に日時、会場、申込条件などが変更される場合があります。
            外出、申込、契約その他の重要な判断をする前に、必ず主催者や行政機関の公式情報をご確認ください。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-[#0f172a]">編集と利害関係</h2>
          <p>
            掲載テーマ、要約、独自指標には運営者の判断が入ります。運営者は二戸市議会議員ですが、本サイトは議員活動の公式報告媒体ではありません。
            掲載料、広告料、協賛、寄付その他の利害関係がある情報を掲載する場合は、その関係を明示します。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-[#0f172a]">著作権と画像</h2>
          <p>
            本サイトが独自に作成した文章やデザインを除き、画像、チラシ、ロゴ、引用文などの権利は各権利者に帰属します。
            出典の表示は、画像などを自由に再利用できることを意味しません。利用条件または許諾を確認できない素材は、原則として元ページへのリンクにとどめます。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-[#0f172a]">Google Maps</h2>
          <p>
            本サイトにはGoogle Mapsの機能とコンテンツが含まれます。Google Mapsの利用には、現在の
            <a className="font-semibold text-[#0e6b7c] hover:underline" href="https://maps.google.com/help/terms_maps/" target="_blank" rel="noopener noreferrer">Google Maps追加利用規約</a>
            と
            <a className="font-semibold text-[#0e6b7c] hover:underline" href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Googleプライバシーポリシー</a>
            が適用されます。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-[#0f172a]">外部リンク</h2>
          <p>
            外部サイトの内容、安全性、継続的な提供について本サイトは管理していません。リンク先の利用条件とプライバシー方針をご確認ください。
          </p>
        </section>
      </div>
    </PageContainer>
  );
}
