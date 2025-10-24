/**
 * @file not-found.tsx
 * @description Custom 404 page for ResumeMatch Pro application
 * @description ResumeMatch Pro アプリケーション用のカスタム404ページ
 * @author Virginia Zhang
 * @remarks Client component that provides user-friendly 404 error handling
 * @remarks ユーザーフレンドリーな404エラーハンドリングを提供するクライアントコンポーネント
 */

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Home, Search } from "lucide-react";

/**
 * @component NotFound
 * @description Custom 404 page component with navigation options
 * @description ナビゲーションオプション付きのカスタム404ページコンポーネント
 * @returns {JSX.Element} Custom 404 page markup
 * @returns カスタム404ページマークアップ
 * @remarks Provides helpful navigation and maintains brand consistency
 * @remarks 有用なナビゲーションを提供し、ブランド一貫性を維持
 */
export default function NotFound(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            ページが見つかりません
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            お探しのページは存在しないか、移動された可能性があります。
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              エラーコード: 404
            </p>
          </div>
          
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/" className="flex items-center justify-center gap-2">
                <Home className="w-4 h-4" />
                ホームページに戻る
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/jobs" className="flex items-center justify-center gap-2">
                <Search className="w-4 h-4" />
                求人一覧を見る
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/upload" className="flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                レジュメをアップロード
              </Link>
            </Button>
          </div>
          
          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              ResumeMatch Pro - AI レジュメマッチングサービス
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
