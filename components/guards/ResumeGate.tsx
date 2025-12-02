/**
 * @file ResumeGate.tsx
 * @description Minimal client-only gate: checks resume state via Zustand store; shows Skeleton then redirect to /upload when missing.
 * @description 最小のクライアントゲート。Zustandストア経由でレジュメ状態を確認し、無ければ Skeleton 表示後 /upload へ遷移。
 */
"use client";

import { ROUTE_UPLOAD } from "@/app/constants/constants";
import Skeleton from "@/components/ui/skeleton";
import { useResumeStore } from "@/store/resume";
import { useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { toast, Toaster } from "sonner";

/**
 * Context for providing resumeId to child components
 * 子コンポーネントに resumeId を提供するためのコンテキスト
 */
const ResumeIdContext = createContext<string | null>(null);

/**
 * Hook to access resumeId from ResumeGate context
 * ResumeGate コンテキストから resumeId にアクセスするためのフック
 * @returns resumeId string or null
 * @returns resumeId 文字列または null
 */
export function useResumeId(): string | null {
  return useContext(ResumeIdContext);
}

/**
 * Minimal client-only gate component that blocks requests when resumeId is not present
 * 最小のクライアントゲートコンポーネント。`resume:current` がない場合、リクエストをブロック。
 */
interface ResumeGateProps {
  readonly children: React.ReactNode;
}

export default function ResumeGate({
  children,
}: ResumeGateProps): React.ReactElement {
  const [ok, setOk] = useState<boolean | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const urlResumeId = searchParams.get("resumeId");
  
  // Get resume state from Zustand store
  // Zustandストアからレジュメ状態を取得
  const { resumeStorageKey, setResume } = useResumeStore();

  // Check if resume is present
  // レジュメが存在するか確認
  useEffect(() => {
    // First, check resumeId from URL (for immediate access after upload)
    // まず、URL から取得した resumeId を確認（アップロード直後の即座アクセス用）
    // Then check Zustand store (for subsequent visits)
    // 次に、Zustandストアを確認（その後の訪問用）
    
    // Use URL param if available, otherwise use Zustand store
    // URLパラメータが利用可能な場合はそれを使用、そうでなければZustandストアを使用
    const finalResumeId = urlResumeId || resumeStorageKey;
    
    if (!finalResumeId) {
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
      const t = setTimeout(() => {
        globalThis.location?.replace(ROUTE_UPLOAD);
      }, 3000);
      return () => clearTimeout(t);
    }
    
    // If URL param exists but Zustand store doesn't, sync it
    // URLパラメータが存在するがZustandストアにない場合、同期する
    if (urlResumeId && resumeStorageKey !== urlResumeId) {
      try {
        setResume(urlResumeId);
      } catch (error) {
        console.warn('Failed to save resumeId to Zustand store:', error);
      }
    }
    
    setResumeId(finalResumeId);
    setOk(true);
  }, [urlResumeId, resumeStorageKey, setResume]);

  if (ok !== true) {
    return <GateSkeleton />;
  }
  
  // Only render children when resumeId is available to avoid warnings
  // resumeId が利用可能な場合のみ子コンポーネントをレンダリングして警告を回避
  if (!resumeId) {
    return <GateSkeleton />;
  }
  
  // Provide resumeId via Context API instead of cloneElement
  // cloneElement の代わりに Context API で resumeId を提供
  return (
    <ResumeIdContext.Provider value={resumeId}>
      {children}
    </ResumeIdContext.Provider>
  );
}

/**
 * @description Loading skeleton for gate component
 * @description ゲートコンポーネントのローディングスケルトン
 */
function GateSkeleton() {
  const skeletonRowIds = [1, 2, 3, 4, 5];

  return (
    <>
      {/* Ensure Toaster is available in this component tree */}
      {/* このコンポーネントツリーでToasterが利用可能であることを保証 */}
      <Toaster />
      <div className="mx-auto max-w-4xl p-6 space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="space-y-3">
          {skeletonRowIds.map(rowId => (
            <Skeleton key={`gate-skeleton-row-${rowId}`} className="h-30 w-full" />
          ))}
        </div>
      </div>
    </>
  );
}
