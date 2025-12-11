/**
 * @file HomepageActions.tsx
 * @description Client CTA buttons for upload and jobs navigation, with Zustand store gating.
 * @description クライアントCTAボタン。アップロード/求人への遷移と Zustandストアによるガードを提供します。
 * @author Virginia Zhang
 * @remarks Uses shadcn/ui Button. Disables jobs button when resume is absent in Zustand store.
 * @remarks shadcn/ui の Button を使用。Zustandストアにレジュメがない場合、求人ボタンを無効化します。
 */
"use client";

import {
  CTA_UPLOAD_JA,
  CTA_UPLOADED_JA,
  ROUTE_JOBS,
  ROUTE_UPLOAD,
} from "@/app/constants/constants";
import { PrimaryCtaButton, SecondaryCtaButton } from "@/components/common/buttons/CtaButtons";
import { useResumeStore } from "@/store/resume";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * @component HomepageActions
 * @description Renders two CTA buttons with proper gating and navigation.
 * @description 2つのCTAボタンをレンダリングし、ガードと遷移を実装します。
 */
export default function HomepageActions(): React.ReactElement {
  const router = useRouter();
  
  // Subscribe to resume state from Zustand store to react to hydration and updates
  // ハイドレーションと更新に反応するため、Zustandストアからレジュメ状態を購読
  const resumeStorageKey = useResumeStore((state) => state.resumeStorageKey);
  
  // Track hydration to prevent SSR/CSR mismatch
  // SSR/CSR ミスマッチを防ぐため水合状態を追跡
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated after client-side mount
    // クライアントサイドマウント後に水合完了とマーク
    setIsHydrated(true);
  }, []);

  // Only enable button after hydration and when resume exists
  // ハイドレーション完了後、かつレジュメが存在する場合のみボタンを有効化
  const hasResume = isHydrated && Boolean(resumeStorageKey);

  return (
    <div className="flex flex-wrap gap-4 justify-center px-4 w-full lg:w-auto">
      <PrimaryCtaButton onClick={() => router.push(ROUTE_UPLOAD)}>
        {CTA_UPLOAD_JA}
      </PrimaryCtaButton>
      <SecondaryCtaButton
        disabled={!hasResume}
        aria-disabled={!hasResume}
        onClick={() => hasResume && router.push(ROUTE_JOBS)}
      >
        {CTA_UPLOADED_JA}
      </SecondaryCtaButton>
    </div>
  );
}
