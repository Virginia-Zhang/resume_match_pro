/**
 * @file FeatureCard.tsx
 * @description Mobile-friendly feature card with a 150ms pressed float and icon swing.
 * @description モバイルでも150msの浮き上がりとアイコンのスイングを提供するカード。
 * @author Virginia Zhang
 */
"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";

export interface FeatureCardProps {
  /** Icon node shown in the emblem area | エンブレム領域に表示するアイコン */
  icon: React.ReactNode;
  /** Title text | タイトル */
  title: string;
  /** Description text | 説明文 */
  desc: string;
}

/**
 * @component FeatureCard
 * @description Adds a touch-friendly pressed state that keeps the card floated for ~150ms.
 * @description タッチでも150msほど浮き上がりをキープするカード。
 * @returns {React.ReactElement} Card element | カード要素
 */
export default function FeatureCard(
  props: FeatureCardProps
): React.ReactElement {
  const { icon, title, desc } = props;
  const [isPressed, setIsPressed] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  // Clear any pending timer on unmount
  // アンマウント時に保留中タイマーを解除
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const startPress = (): void => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPressed(true);
    // Keep floated for 150ms even after pointer up
    // ポインタを離した後も150msキープ
    timerRef.current = window.setTimeout(() => {
      setIsPressed(false);
      timerRef.current = null;
    }, 300);
  };

  return (
    <Card
      tabIndex={0}
      role="group"
      onPointerDown={startPress}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          startPress();
        }
      }}
      className={
        "group rounded-xl border shadow-sm bg-white/5 dark:bg-slate-800/5 backdrop-blur " +
        "transition-transform duration-300 " +
        // Desktop hover + keyboard focus-visible (avoid sticky focus on mobile)
        "hover:-translate-y-1.5 focus-visible:-translate-y-1.5 hover:shadow-lg focus-visible:shadow-lg " +
        "hover:border-slate-300 focus-visible:border-slate-300 dark:hover:border-slate-600 dark:focus-visible:border-slate-600 " +
        // Programmatic pressed state for mobile tap
        (isPressed
          ? " -translate-y-1.5 shadow-lg border-slate-300 dark:border-slate-600 "
          : "")
      }
    >
      <CardHeader>
        <div
          className={
            "mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg " +
            "bg-white/40 dark:bg-slate-700/40 border text-xl " +
            // Hover (desktop) + pressed (mobile) + keyboard focus-visible
            "group-hover:animate-[swing_500ms_ease] focus-visible:animate-[swing_500ms_ease] " +
            (isPressed ? " animate-[swing_500ms_ease] " : "") +
            " motion-reduce:animate-none"
          }
        >
          <span>{icon}</span>
        </div>
        <CardTitle className="text-lg mb-1">{title}</CardTitle>
        <CardDescription className="text-slate-700 dark:text-slate-300 leading-relaxed">
          {desc}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
