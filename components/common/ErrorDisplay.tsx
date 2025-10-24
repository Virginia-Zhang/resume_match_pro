/**
 * @file ErrorDisplay.tsx
 * @description Reusable error display component with user-friendly messages.
 * @description ユーザーフレンドリーなメッセージ付きの再利用可能なエラー表示コンポーネント。
 * @author Virginia Zhang
 * @remarks Client component for displaying errors with retry options.
 * @remarks 再試行オプション付きでエラーを表示するクライアントコンポーネント。
 */
"use client";

import React from "react";
import { FriendlyErrorMessage } from "@/lib/errorHandling";

/**
 * @description Props for ErrorDisplay component
 * @description ErrorDisplayコンポーネントのプロパティ
 */
interface ErrorDisplayProps {
  /** Error title / エラータイトル */
  title: string;
  /** Friendly error message and retry info / フレンドリーなエラーメッセージと再試行情報 */
  errorInfo: FriendlyErrorMessage;
  /** Optional upload page route for resume-related errors / レジュメ関連エラー用のオプションのアップロードページルート */
  uploadRoute?: string;
  /** Optional additional CSS classes / オプションの追加CSSクラス */
  className?: string;
}

/**
 * @component ErrorDisplay
 * @description Reusable error display component with consistent styling and behavior
 * @description 一貫したスタイリングと動作を持つ再利用可能なエラー表示コンポーネント
 * @param props Component props
 * @param props コンポーネントのプロパティ
 * @returns Error display JSX element
 * @returns エラー表示JSX要素
 */
export default function ErrorDisplay({
  title,
  errorInfo,
  uploadRoute,
  className = "",
}: ErrorDisplayProps): React.JSX.Element {
  return (
    <div className={`p-4 border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 rounded-md ${className}`}>
      <h3 className="text-red-800 dark:text-red-200 font-medium">{title}</h3>
      <p className="text-red-600 dark:text-red-300 mt-1">{errorInfo.message}</p>
      
      {errorInfo.isRetryable && (
        <div className="mt-3 space-y-2">
          <button
            className="px-4 py-2 text-sm rounded border bg-white hover:bg-gray-50 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-600 text-gray-700 dark:text-gray-300 transition-colors"
            onClick={() => window.location.reload()}
          >
            ページを更新して再試行
          </button>
          <p className="text-xs text-red-500 dark:text-red-400">
            問題が解決しない場合は、管理者にお問い合わせください：
            <a href="mailto:zhangsakurayi@qq.com" className="underline ml-1">
              zhangsakurayi@qq.com
            </a>
          </p>
        </div>
      )}
      
      {uploadRoute && (
        <p className="text-xs text-muted-foreground mt-3">
          レジュメが見つからない場合は、
          <a href={uploadRoute} className="underline">
            アップロードページ
          </a>
          から再度アップロードしてください。
        </p>
      )}
    </div>
  );
}
