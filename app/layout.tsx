import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ScrollProgress from "@/components/ScrollProgress";
import FadeInSetup from "@/components/FadeInSetup";
import { LocaleProvider } from "@/lib/i18n/context";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ninohe-mirai.example.com";
const SITE_NAME = "ニノヘミライ";
const SITE_DESCRIPTION = "しごと・産業・文化・つながり・医療・暮らしの6つのテーマで、二戸市の現状を市民にわかりやすく示す公共ダッシュボード。人口だけでは見えない、二戸の底力を可視化します。";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: `${SITE_NAME} — 二戸の資源と未来を見える化する`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ["二戸市", "岩手県", "地域活性化", "オープンデータ", "公共ダッシュボード", "まちのデータ"],
  authors: [{ name: "ニノヘミライ編集部" }],
  creator: "荻野光希",
  publisher: "ニノヘミライ編集部",
  icons: {
    icon: [
      { url: "/rogo.png", type: "image/png" },
    ],
    apple: [
      { url: "/rogo.png", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: BASE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — 二戸の資源と未来を見える化する`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/rogo.png",
        width: 1200,
        height: 630,
        alt: "ニノヘミライ — 二戸の資源と未来を見える化する",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — 二戸の資源と未来を見える化する`,
    description: SITE_DESCRIPTION,
    images: ["/rogo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-[#0e6b7c] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-base focus:font-bold focus:no-underline"
        >
          メインコンテンツへスキップ
        </a>
        <ScrollProgress />
        <FadeInSetup />
        <LocaleProvider>
          <SiteHeader />
          <div id="main-content" className="flex-1">{children}</div>
          <SiteFooter />
        </LocaleProvider>
      </body>
    </html>
  );
}
