/**
 * @file LottieHero.tsx
 * @description Client wrapper for DotLottieReact to be used inside server pages.
 * @description サーバーページ内で使用するための DotLottieReact のクライアントラッパー。
 * @author Virginia Zhang
 * @remarks Client-only. Prevents "useRef only works in Client Components" errors.
 * @remarks クライアント専用。"useRef はクライアントコンポーネントのみ" エラーを防ぎます。
 */
"use client";

import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

/**
 * @component LottieHero
 * @description Displays the selected Lottie animation in a responsive container.
 * @description レスポンシブなコンテナで選択した Lottie アニメーションを表示します。
 */
export default function LottieHero(): React.ReactElement {
  return (
    <div className="aspect-video rounded-xl border bg-white/60 dark:bg-slate-900/40 overflow-hidden">
      <DotLottieReact
        src="https://lottie.host/9befc7ab-8be0-4287-b02b-7a925b5b7143/puTcJdZsHa.lottie"
        loop
        autoplay
      />
    </div>
  );
}
