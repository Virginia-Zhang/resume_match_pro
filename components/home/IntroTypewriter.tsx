/**
 * @file IntroTypewriter.tsx
 * @description Client component that renders the animated intro text using react-simple-typewriter.
 * @description クライアントコンポーネント。react-simple-typewriter を用いて紹介文をアニメ表示します。
 * @author Virginia Zhang
 * @remarks Client-only. Place below product name and logo in the hero section.
 * @remarks クライアント専用。Hero セクションの製品名とロゴの下に配置します。
 */
"use client";

import React from "react";
import { Typewriter } from "react-simple-typewriter";

/**
 * @component IntroTypewriter
 * @description Renders the typewriter animation for the fixed product intro string.
 * @description 製品紹介文のタイプライターアニメーションを表示します。
 * @returns {JSX.Element} Animated text / アニメ表示テキスト
 */
export default function IntroTypewriter(): React.ReactElement {
  const text =
    "高度なAI分析技術により、レジュメと求人の適合度を精密に測定。IT開発者の転職活動を効率化し、理想のキャリアを実現するためのツールです。";

  return (
    <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
      <Typewriter
        words={[text]}
        cursor
        cursorStyle="_"
        typeSpeed={30}
        deleteSpeed={0}
        delaySpeed={10000}
        loop={false}
      />
    </p>
  );
}
