import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { LocaleProvider } from "@/lib/i18n/context";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ninohe-mirai.example.com";
const SITE_NAME = "ニノヘミライ";
const SITE_DESCRIPTION = "二戸市の6つの力を軸に、資源・指標・地域の動きを市民にわかりやすく示す公共ダッシュボード。人口だけでは見えない、二戸の底力を可視化します。";

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
        <LocaleProvider>
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </LocaleProvider>
      </body>
    </html>
  );
}
