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
  const hasResume = Boolean(resumeStorageKey);

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
