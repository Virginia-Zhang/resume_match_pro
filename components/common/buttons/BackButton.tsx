/**
 * @file BackButton.tsx
 * @description Back navigation button component for mobile devices.
 * @description モバイルデバイス用の戻るナビゲーションボタンコンポーネント。
 * @author Virginia Zhang
 * @remarks Client component that uses Next.js router for back navigation.
 * @remarks Next.jsルーターを使用して戻るナビゲーションを行うクライアントコンポーネント。
 */
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

/**
 * @component BackButton
 * @description Renders a back button that navigates to the previous page.
 * @description 前のページに戻るボタンをレンダリングします。
 * @param {Object} props - Component props
 * @param {Object} props - コンポーネントのプロパティ
 * @param {() => void} props.onClick - Click handler for back navigation
 * @param {() => void} props.onClick - 戻るナビゲーションのクリックハンドラー
 * @param {string} [props.className] - Optional CSS classes for styling
 * @param {string} [props.className] - スタイリング用のオプションCSSクラス
 * @returns {React.ReactElement} Back button element
 * @returns {React.ReactElement} 戻るボタン要素
 * @remarks Memoized to prevent unnecessary re-renders when props don't change.
 * @remarks propsが変更されない場合の不要な再レンダリングを防ぐためメモ化されています。
 */
const BackButton = React.memo(
  ({ onClick, className }: { onClick: () => void; className?: string }) => (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={className}
      aria-label="前のページに戻る"
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  )
);
BackButton.displayName = "BackButton";

export default BackButton;

