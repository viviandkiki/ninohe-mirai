import type { Metadata } from "next";
import PageContainer from "@/components/PageContainer";
import SectionHeading from "@/components/SectionHeading";
import { Mountain, Heart, BookOpen, ExternalLink, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "このサイトについて",
  description: "ニノヘミライの運営方針・目的・チームを紹介します。",
};

export default function AboutPage() {
  return (
    <PageContainer narrow>
      <div className="mb-8">
        <p className="text-[11px] font-semibold text-[#2e7d8c] uppercase tracking-widest mb-1">ABOUT</p>
        <SectionHeading title="このサイトについて" />
      </div>

      <div className="space-y-10">
        <section className="flex items-start gap-4">
          <div className="p-3 bg-[#2e7d8c]/10 rounded-xl shrink-0">
            <Mountain className="w-6 h-6 text-[#2e7d8c]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1a1a2e] mb-2">ニノヘミライとは</h2>
            <p className="text-sm text-[#6b7280] leading-relaxed mb-3">
              ニノヘミライは、岩手県二戸市の資源と未来を見える化する公共ダッシュボードです。
              「監視する」のではなく、「一緒に考える」ための場として設計されています。
            </p>
            <p className="text-sm text-[#6b7280] leading-relaxed">
              人口だけでは見えない二戸の底力。働く力・稼ぐ力・受け継ぐ力・つながる力・備える力・暮らせる力の
              6つの視点から、見える資本と見えない資本の両方を市民に届けます。
            </p>
          </div>
        </section>

        <section className="flex items-start gap-4">
          <div className="p-3 bg-red-50 rounded-xl shrink-0">
            <Heart className="w-6 h-6 text-[#c9614a]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1a1a2e] mb-3">大切にしていること</h2>
            <ul className="space-y-3 text-sm text-[#6b7280]">
              {[
                { title: "公正性", desc: "特定の政党・人物を応援・批判するためのサイトではありません。データと事実を中心に据えます。" },
                { title: "透明性", desc: "データの出典と加工方法を明示します。カスコアの算出根拠も公開します。" },
                { title: "市民目線", desc: "専門用語を避け、誰でも理解しやすい表現を心がけます。" },
                { title: "建設性", desc: "課題だけでなく、可能性と資源も同様に示します。弱みを責めるのではなく、強みを活かす視点を大切にします。" },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#2e7d8c] mt-0.5 shrink-0">✓</span>
                  <span>
                    <strong className="text-[#1a1a2e]">{item.title}：</strong>
                    {item.desc}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="flex items-start gap-4">
          <div className="p-3 bg-amber-50 rounded-xl shrink-0">
            <Shield className="w-6 h-6 text-[#b8872a]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1a1a2e] mb-3">編集方針</h2>
            <div className="space-y-3 text-sm text-[#6b7280] leading-relaxed">
              <p>
                ニノヘミライは特定の政治団体・企業・行政機関の広報媒体ではありません。
                掲載内容はすべて編集部の判断によるもので、スポンサーシップによる内容の変更はありません。
              </p>
              <p>
                カスコア（総合評価指数）は公開データに基づきますが、指標の選定・重みづけには編集部の判断が入ります。
                これをもって公式評価とは異なることをご承知おきください。
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-start gap-4">
          <div className="p-3 bg-[#f7f4ef] rounded-xl shrink-0">
            <BookOpen className="w-6 h-6 text-[#6b7280]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1a1a2e] mb-3">運営</h2>
            <div className="space-y-4 text-sm text-[#6b7280]">
              <div className="border-l-2 border-[#2e7d8c] pl-4">
                <p className="font-semibold text-[#1a1a2e] mb-1">ニノヘミライ編集部</p>
                <p className="leading-relaxed">
                  二戸市の未来に関心を持つ市民・関係者のボランティアグループです。
                  特定の政治団体・企業とは関係を持っていません。
                </p>
              </div>
              <div className="border-l-2 border-[#b8872a] pl-4">
                <p className="font-semibold text-[#1a1a2e] mb-1">企画・制作</p>
                <p>荻野光希</p>
              </div>
            </div>
          </div>
        </section>

        {/* What this site is not */}
        <section className="bg-white border border-[#e5e1da] rounded-xl p-5">
          <h2 className="text-sm font-bold text-[#1a1a2e] mb-3">このサイトはこれではありません</h2>
          <ul className="space-y-2 text-sm text-[#6b7280]">
            {[
              "二戸市の公式サイトではありません",
              "特定候補・政党の支援サイトではありません",
              "行政批判を目的としたサイトではありません",
              "企業・団体の広告媒体ではありません",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[#c9614a] mt-0.5 shrink-0">✗</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-[#f7f4ef] border border-[#e5e1da] rounded-xl p-5">
          <h2 className="text-sm font-bold text-[#1a1a2e] mb-2">訂正・ご意見</h2>
          <p className="text-sm text-[#6b7280] leading-relaxed mb-3">
            掲載内容に誤りがある場合や、ご意見・データ提供のご連絡は下記までお願いします。
            個人情報に関する削除依頼にも対応します。
          </p>
          <a
            href="mailto:hellovivikiki@gmail.com"
            className="inline-flex items-center gap-1.5 text-sm text-[#2e7d8c] hover:underline"
          >
            hellovivikiki@gmail.com
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </section>
      </div>
    </PageContainer>
  );
}
