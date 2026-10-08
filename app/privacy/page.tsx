import type { Metadata } from "next";
import PageContainer from "@/components/PageContainer";

export const metadata: Metadata = {
  title: "プライバシー方針",
  description: "ニノヘミライにおける個人情報と外部サービスの取り扱いを説明します。",
};

export default function PrivacyPage() {
  return (
    <PageContainer narrow>
      <div className="mb-10">
        <h1 className="text-3xl font-black tracking-tight text-[#0f172a]">プライバシー方針</h1>
        <p className="mt-3 text-sm text-[#6b7280]">最終更新：2026年10月8日</p>
      </div>

      <div className="space-y-9 text-sm leading-relaxed text-[#475569]">
        <section>
          <h2 className="mb-3 text-lg font-bold text-[#0f172a]">運営者と目的</h2>
          <p>
            ニノヘミライは、荻野光希が個人で運営する非公式の地域情報サイトです。
            二戸市に関する公開情報を整理し、人、場所、出来事、地域の動き、データを市民が見つけやすくするために利用します。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-[#0f172a]">取り扱う情報</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>二戸市、岩手県、国、主催者、公開SNSなどが一般に公開している情報</li>
            <li>イベント名、開催日時、一般公開された会場、主催団体、公式な問い合わせ先、出典URL</li>
            <li>訂正・削除などのお問い合わせ時に、送信者がメールで提供する氏名、メールアドレス、連絡内容</li>
            <li>表示言語の設定。選択内容は利用者のブラウザ内に保存されます</li>
          </ul>
          <p className="mt-3">
            個人の携帯電話番号、個人メールアドレス、自宅などの私有会場、未成年者の情報は、掲載の必要性と公開根拠を確認できる場合を除き掲載しません。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-[#0f172a]">Google Mapsの利用</h2>
          <p>
            イベントページはGoogle Mapsの機能とコンテンツを利用します。本サイトはブラウザの現在地を取得しませんが、地図の表示に伴い、GoogleがIPアドレスなどの情報を受け取る場合があります。
            Googleによる情報の取り扱いは、
            <a className="font-semibold text-[#0e6b7c] hover:underline" href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Googleプライバシーポリシー</a>
            をご確認ください。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-[#0f172a]">利用目的と管理</h2>
          <p>
            お問い合わせで受け取った情報は、内容の確認、回答、訂正、掲載停止への対応にのみ利用し、対応に必要な期間を超えて保有しません。
            法令に基づく場合を除き、本人の同意なく第三者へ提供しません。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-[#0f172a]">訂正・削除・掲載停止</h2>
          <p>
            掲載内容に誤りがある場合や、個人情報、画像、私有会場などの掲載停止を希望する場合は、対象ページと理由を添えて下記へご連絡ください。内容を確認し、必要な訂正または非表示化を行います。
          </p>
          <a className="mt-3 inline-block font-semibold text-[#0e6b7c] hover:underline" href="mailto:hellovivikiki@gmail.com">
            hellovivikiki@gmail.com
          </a>
        </section>
      </div>
    </PageContainer>
  );
}
