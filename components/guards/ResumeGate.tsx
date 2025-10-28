/**
 * @file ResumeGate.tsx
 * @description Minimal client-only gate: checks `localStorage` key `resume:current`; shows Skeleton then redirect to /upload when missing.
 * @description 最小のクライアントゲート。`localStorage` の `resume:current` を確認し、無ければ Skeleton 表示後 /upload へ遷移。
 */
"use client";

import { ROUTE_UPLOAD } from "@/app/constants/constants";
import Skeleton from "@/components/ui/skeleton";
import { resumePointer } from "@/lib/storage";
import { cloneElement, isValidElement, useEffect, useState } from "react";
import { toast, Toaster } from "sonner";

/**
 * Minimal client-only gate component that blocks requests when resumeId is not present
 * 最小のクライアントゲートコンポーネント。`resume:current` がない場合、リクエストをブロック。
 */
type ResumeGateProps = {
  children: React.ReactElement<{ resumeId?: string }>;
};

export default function ResumeGate({
  children,
}: ResumeGateProps): React.ReactElement {
  const [ok, setOk] = useState<boolean | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);

  // Check if resume is present
  // レジュメが存在するか確認
  useEffect(() => {
    const p = resumePointer.load();
    if (!p?.resumeId) {
      // Set state to false first to render GateSkeleton with Toaster
      // まず状態をfalseに設定してToaster付きのGateSkeletonをレンダリング
      setOk(false);
      
      // Use setTimeout to ensure GateSkeleton is rendered before showing toast
      // GateSkeletonがレンダリングされた後にtoastを表示するためsetTimeoutを使用
      setTimeout(() => {
        toast.warning('あなたはまだレジュメをアップロードしていないか、レジュメが保存されていません。', {
          description: 'アップロードページに移動し、レジュメをアップロードしてください。',
          duration: 3000,
        });
      }, 100);
      
      // Redirect to upload page if resume is not present
      // レジュメがない場合はアップロードページへリダイレクト
      const t = setTimeout(() => window.location.replace(ROUTE_UPLOAD), 3000);
      return () => clearTimeout(t);
    }
    setResumeId(p.resumeId);
    setOk(true);
  }, []);

  if (ok !== true) return <GateSkeleton />;
  
  // Always inject resumeId to children
  // 常に子コンポーネントに resumeId を注入
  if (isValidElement(children) && resumeId) {
    const child = children as React.ReactElement<{ resumeId?: string }>;
    return cloneElement(child, { resumeId });
  }
  
  return <>{children}</>;
}

/**
 * @description Loading skeleton for gate component
 * @description ゲートコンポーネントのローディングスケルトン
 */
function GateSkeleton() {
  return (
    <>
      {/* Ensure Toaster is available in this component tree */}
      {/* このコンポーネントツリーでToasterが利用可能であることを保証 */}
      <Toaster />
      <div className="mx-auto max-w-4xl p-6 space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-30 w-full" />
          ))}
        </div>
      </div>
    </>
  );
}
