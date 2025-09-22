/**
 * @file TypewriterText.tsx
 * @description Reusable client component for typewriter text animation using react-simple-typewriter.
 * @description 再利用可能なクライアントコンポーネント。react-simple-typewriter によるタイプライター文字アニメーション。
 * @author Virginia Zhang
 * @remarks Client-only. Use below headings or in highlights where a typewriter effect is desired.
 * @remarks クライアント専用。見出しの下や強調テキストにタイプライター効果を適用。
 */
"use client";

import React from "react";
import { Typewriter } from "react-simple-typewriter";

export type TypewriterTextProps = {
  /**
   * @description Text content to animate.
   * @description アニメーション表示する文字列。
   */
  text: string;
  /**
   * @description Optional className to style the container element.
   * @description コンテナ要素へ適用する任意の className。
   */
  className?: string;
  /** @description Typing speed (ms per char) / 1 文字あたりの速度(ms) */
  typeSpeed?: number;
  /** @description Initial delay before typing / 開始前の遅延(ms) */
  delaySpeed?: number;
  /** @description Whether to loop / ループするか */
  loop?: boolean;
};

/**
 * @component TypewriterText
 * @description Renders the given text with a typewriter animation.
 * @description 指定テキストをタイプライターアニメーションで表示します。
 * @param props Component props / コンポーネントのプロパティ
 * @returns {JSX.Element} Animated text / アニメーションテキスト
 */
export default function TypewriterText({
  text,
  className,
  typeSpeed = 60,
  delaySpeed = 250,
  loop = false,
}: TypewriterTextProps): React.ReactElement {
  return (
    <div
      className={
        "min-h-[64px] md:min-h-[72px] w-full flex items-center justify-center text-center " +
        (className ?? "")
      }
    >
      <Typewriter
        words={[text]}
        cursor
        cursorStyle="_"
        typeSpeed={typeSpeed}
        deleteSpeed={0}
        delaySpeed={delaySpeed}
        loop={loop}
      />
    </div>
  );
}
