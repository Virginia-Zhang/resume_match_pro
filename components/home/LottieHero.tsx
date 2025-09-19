/**
 * @file LottieHero.tsx
 * Client wrapper for DotLottieReact to be used inside server pages.
 * サーバーページ内で使用するための DotLottieReact のクライアントラッパー。
 * @author Virginia Zhang
 * @remarks Client-only. Prevents "useRef only works in Client Components" errors.
 * @remarks クライアント専用。"useRef はクライアントコンポーネントのみ" エラーを防ぎます。
 */
"use client";

import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

/**
 * @component LottieHero
 * Displays the selected Lottie animation in a responsive container.
 * レスポンシブなコンテナで選択した Lottie アニメーションを表示します。
 * @returns React.ReactElement
 */
export default function LottieHero(): React.ReactElement {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [showLoading, setShowLoading] = React.useState(true);

  React.useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const markReady = () => setShowLoading(false);
    const isReady = (): boolean => {
      const el = root.querySelector("canvas, svg") as HTMLElement | null;
      return !!(el && el.clientWidth > 0 && el.clientHeight > 0);
    };

    if (isReady()) {
      markReady();
      return;
    }

    const mo = new MutationObserver(() => {
      if (isReady()) {
        markReady();
        mo.disconnect();
      }
    });
    mo.observe(root, { childList: true, subtree: true });
    const to = window.setTimeout(markReady, 5000);
    return () => {
      mo.disconnect();
      window.clearTimeout(to);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative aspect-video rounded-xl border bg-white/5 dark:bg-slate-900/5 overflow-hidden"
    >
      <DotLottieReact src="/animations/hero.lottie" loop autoplay />
      <div
        aria-live="polite"
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-out ${
          showLoading ? "opacity-100" : "opacity-0 pointer-events-none"
        } bg-gradient-to-br from-white/60 to-white/10 dark:from-slate-900/50 dark:to-slate-900/10`}
      >
        <div className="rounded-md px-4 py-2 text-sm md:text-base font-medium text-slate-700 dark:text-slate-200 select-none">
          MatchPro for Dev, for you ....
        </div>
      </div>
    </div>
  );
}
