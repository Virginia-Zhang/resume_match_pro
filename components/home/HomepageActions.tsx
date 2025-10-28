/**
 * @file HomepageActions.tsx
 * @description Client CTA buttons for upload and jobs navigation, with localStorage gating.
 * @description クライアントCTAボタン。アップロード/求人への遷移と localStorage によるガードを提供します。
 * @author Virginia Zhang
 * @remarks Uses shadcn/ui Button. Disables jobs button when `resume:current` is absent.
 * @remarks shadcn/ui の Button を使用。`resume:current` がない場合、求人ボタンを無効化します。
 */
"use client";

import {
  CTA_UPLOAD_JA,
  CTA_UPLOADED_JA,
  ROUTE_JOBS,
  ROUTE_UPLOAD,
} from "@/app/constants/constants";
import { PrimaryCtaButton, SecondaryCtaButton } from "@/components/common/buttons/CtaButtons";
import { resumePointer } from "@/lib/storage";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * @component HomepageActions
 * @description Renders two CTA buttons with proper gating and navigation.
 * @description 2つのCTAボタンをレンダリングし、ガードと遷移を実装します。
 */
export default function HomepageActions(): React.ReactElement {
  const router = useRouter();
  const [hasResume, setHasResume] = useState<boolean>(false);

  useEffect(() => {
    // Check presence of resume pointer in localStorage on mount
    // マウント時に localStorage のポインタ有無を確認
    const p = resumePointer.load();
    setHasResume(Boolean(p?.resumeId));
  }, []);

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
