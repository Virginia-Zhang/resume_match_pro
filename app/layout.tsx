import { PRODUCT_NAME_EN } from "@/app/constants/constants";
import PageFrame from "@/components/common/PageFrame";
import SiteHeader from "@/components/common/SiteHeader";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  variable: "--font-geist-sans",
  display: "swap",
  preload: true,
  src: [
    {
      // Local Geist variable font
      // ローカルの Geist 可変フォント
      path: "../public/fonts/geist/Geist-VariableFont_wght.ttf",
      style: "normal",
      weight: "100 900",
    },
  ],
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "sans-serif",
  ],
});

const geistMono = localFont({
  variable: "--font-geist-mono",
  display: "swap",
  preload: true,
  src: [
    {
      // Local Geist Mono variable font
      // ローカルの Geist Mono 可変フォント
      path: "../public/fonts/geist-mono/GeistMono-VariableFont_wght.ttf",
      style: "normal",
      weight: "100 900",
    },
  ],
  fallback: [
    "ui-monospace",
    "SFMono-Regular",
    "Monaco",
    "Consolas",
    "Liberation Mono",
    "Courier New",
    "monospace",
  ],
});

// Noto Sans JP as primary UI font for Japanese
const notoSansJp = localFont({
  display: "swap",
  preload: true,
  variable: "--font-noto-sans-jp",
  src: [
    {
      // Local Noto Sans JP variable font
      // ローカルの Noto Sans JP 可変フォント
      path: "../public/fonts/noto-sans-jp/NotoSansJP-VariableFont_wght.ttf",
      style: "normal",
      weight: "100 900",
    },
  ],
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "sans-serif",
    "Hiragino Sans",
    "Hiragino Kaku Gothic ProN",
    "Meiryo",
    "MS Gothic",
  ],
});

// Heavily rounded Japanese font for strong pill-like CTA typography
// より丸みの強い日本語フォント（CTAで視覚的な丸ゴシック感を強調）
const zenMaru = localFont({
  display: "swap",
  preload: true,
  variable: "--font-zen-maru",
  src: [
    {
      path: "../public/fonts/zen-maru-gothic/ZenMaruGothic-Light.ttf",
      style: "normal",
      weight: "300",
    },
    {
      path: "../public/fonts/zen-maru-gothic/ZenMaruGothic-Regular.ttf",
      style: "normal",
      weight: "400",
    },
    {
      path: "../public/fonts/zen-maru-gothic/ZenMaruGothic-Medium.ttf",
      style: "normal",
      weight: "500",
    },
    {
      path: "../public/fonts/zen-maru-gothic/ZenMaruGothic-Bold.ttf",
      style: "normal",
      weight: "700",
    },
    {
      path: "../public/fonts/zen-maru-gothic/ZenMaruGothic-Black.ttf",
      style: "normal",
      weight: "900",
    },
  ],
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "sans-serif",
    "Hiragino Sans",
    "Hiragino Kaku Gothic ProN",
    "Meiryo",
    "MS Gothic",
  ],
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
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansJp.variable} ${zenMaru.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <SiteHeader />
            <PageFrame>{children}</PageFrame>
            {/* Toast window to display notifications */}
            {/* 通知を表示するトーストウィンドウ */}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
