import type { Metadata } from "next";
import { PRODUCT_NAME_EN } from "@/app/constants/constants";
import {
  Geist,
  Geist_Mono,
  Noto_Sans_JP,
  Zen_Maru_Gothic,
} from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import SiteHeader from "@/components/common/SiteHeader";
import PageFrame from "@/components/common/PageFrame";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Noto Sans JP as primary UI font for Japanese
const notoSansJp = Noto_Sans_JP({
  weight: ["400", "500", "700"],
  // Use 'swap' to avoid FOIT: render fallback first, then swap to webfont when ready
  // 'swap' を使用して FOIT を回避：まず代替フォントを表示し、読み込み後にウェブフォントへ置換
  display: "swap",
  preload: false,
  variable: "--font-noto-sans-jp",
});

// Heavily rounded Japanese font for strong pill-like CTA typography
// より丸みの強い日本語フォント（CTAで視覚的な丸ゴシック感を強調）
const zenMaru = Zen_Maru_Gothic({
  weight: ["500", "700", "900"],
  display: "swap",
  preload: false,
  variable: "--font-zen-maru",
});

export const metadata: Metadata = {
  title: `${PRODUCT_NAME_EN} - AI Resume Job Matching`,
  description:
    "高度なAI分析技術により、レジュメと求人の適合度を精密に測定。外国人IT開発者の転職活動を効率化し、理想のキャリアを実現するためのツールです。",
};

/**
 *
 * @param root0
 * @param root0.children
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="jp" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansJp.variable} ${zenMaru.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SiteHeader />
          <PageFrame>{children}</PageFrame>
        </ThemeProvider>
      </body>
    </html>
  );
}
