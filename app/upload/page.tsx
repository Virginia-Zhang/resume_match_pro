/**
 * @file page.tsx
 * @description Upload page: parse PDF on server via pdf-parse, fallback to textarea, POST to /api/resume.
 * @description アップロードページ：pdf-parseでサーバー側PDF解析、テキストエリアにフォールバックし、/api/resumeへPOST。
 * @author Virginia Zhang
 * @remarks Client component. Never store resume_text in localStorage; 
 * @remarks クライアントコンポーネント。localStorageに保存しない。
 */
"use client";

import {
  ROUTE_JOBS,
  UPLOAD_FEATURES,
  UPLOAD_FILE_SIZE_ERROR_JA,
  UPLOAD_MAX_FILE_SIZE_BYTES,
  UPLOAD_STEPS,
  UPLOAD_TEXTAREA_GUIDELINES
} from "@/app/constants/constants";
import { PrimaryCtaButton } from "@/components/common/buttons/CtaButtons";
import ErrorDisplay from "@/components/common/ErrorDisplay";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Skeleton from "@/components/ui/skeleton";
import { useParsePdfMutation, useResumeText, useUploadResumeMutation } from "@/hooks/queries/useResume";
import { getFriendlyErrorMessage } from "@/lib/errorHandling";
import { clearBatchMatchCache } from "@/lib/storage";
import { useResumeStore } from "@/store/resume";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Upload page component for PDF parsing and resume text input
 * PDF解析とレジュメテキスト入力用のアップロードページコンポーネント
 *
 * @returns JSX element / JSX要素
 */
export default function UploadPage(): React.JSX.Element {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  // Initialize prefilling state to false to ensure SSR/client consistency
  // prefillingの状態をfalseで初期化し、SSR/クライアントの一貫性を確保
  const [prefilling, setPrefilling] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const dropRef = useRef<HTMLButtonElement | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // Track if user has uploaded a new file or modified the text
  // ユーザーが新しいファイルをアップロードしたか、テキストを変更したかを追跡
  const [hasNewUpload, setHasNewUpload] = useState(false);
  /**
   * @description TanStack Query mutations for parsing PDFs and uploading resume text.
   * @description PDF解析とレジュメアップロード用の TanStack Query ミューテーション。
   */
  const parsePdfMutation = useParsePdfMutation();
  const uploadResumeMutation = useUploadResumeMutation();

  /**
   * @description Validates whether the uploaded file is in PDF format for both PC and mobile platforms.
   * @description PC・モバイル両プラットフォームでアップロードされたファイルがPDF形式かどうかを検証します。
   * @param {File} f - The file to validate | 検証するファイル
   * @returns {boolean} True if the file is PDF, false otherwise | PDFファイルの場合はtrue、そうでなければfalse
   * @remarks Prefers MIME type check, falls back to file extension for iOS compatibility (iOS may provide empty MIME type).
   * @remarks MIMEタイプチェックを優先し、iOS互換性のため拡張子にフォールバック（iOSではMIMEタイプが空の場合がある）。
   */
  const isPdfFile = useCallback((f: File): boolean => {
    if (!f) return false;
    if (f.type === "application/pdf") return true;
    if (!f.type && /\.pdf$/i.test(f.name)) return true;
    return false;
  }, []);

  /**
   * @description Open the hidden file input with graceful fallback when `showPicker` fails.
   * @description `showPicker` が失敗した場合にフォールバックでファイル入力を開きます。
   * @returns {void} No return value | 返り値なし
   * @remarks Prefers `showPicker` for modern UX, reverts to `click` when blocked.
   * @remarks モダンな UX のため `showPicker` を優先し、拒否された場合は `click` に戻します。
   */
  const openFilePicker = useCallback(() => {
    const input = fileInputRef.current;
    if (!input) return;
    input.click();
  }, []);


  /**
   * @description Reset the file input value and blur to prevent immediate re-triggering.
   * @description ファイル入力の値をリセットし、即時再トリガーを防ぐために blur します。
   * @returns {void} No return value | 返り値なし
   * @remarks Keeps upload error flow consistent across browsers.
   * @remarks ブラウザ間でアップロードエラー時の挙動を統一します。
   */
  const resetFileInput = useCallback(() => {
    const input = fileInputRef.current;
    if (!input) return;
    input.value = "";
    // Blur to prevent immediate re-trigger of the picker on certain browsers
    // 一部ブラウザで即座にダイアログが再表示されるのを防ぐため blur を実行
    input.blur();
  }, []);

  /**
   * @description Handle container click event to open file picker.
   * @description ファイルピッカーを開くためのコンテナクリックイベントを処理します。
   * @param {React.MouseEvent} event - The mouse event | マウスイベント
   * @returns {void} No return value | 返り値なし
   * @remarks Prevents event bubbling to avoid double trigger.
   * @remarks イベントバブリングを防止し、二重トリガーを回避します。
   */
  /**
   * @description Handle drag over event to activate drop zone visual feedback.
   * @description ドロップゾーンの視覚的フィードバックを有効にするためのドラッグオーバーイベントを処理します。
   * @param {React.DragEvent} event - The drag event | ドラッグイベント
   * @returns {void} No return value | 返り値なし
   */
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(true);
  }, []);

  /**
   * @description Handle drag leave event to deactivate drop zone visual feedback.
   * @description ドロップゾーンの視覚的フィードバックを無効にするためのドラッグリーブイベントを処理します。
   * @param {React.DragEvent} event - The drag event | ドラッグイベント
   * @returns {void} No return value | 返り値なし
   * @remarks Only deactivates if leaving the actual drop zone container.
   * @remarks 実際のドロップゾーンコンテナを離れた場合のみ無効化します。
   */
  const handleDragLeave = useCallback((event: React.DragEvent) => {
    if (!dropRef.current?.contains(event.relatedTarget as Node)) {
      setDragActive(false);
    }
  }, []);

  /**
   * @description Handle file drop event with validation (file type and size).
   * @description ファイルドロップイベントを検証付きで処理します（ファイルタイプとサイズ）。
   * @param {React.DragEvent} event - The drag event | ドラッグイベント
   * @returns {void} No return value | 返り値なし
   * @remarks Validates PDF format and file size before setting the file state.
   * @remarks ファイルの状態を設定する前にPDF形式とファイルサイズを検証します。
   */
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
    const dropped = event.dataTransfer.files?.[0];
    if (!dropped) return;
    
    if (!isPdfFile(dropped)) {
      setUploadError("PDF ファイルのみアップロードできます");
      setFile(null);
      setText("");
      resetFileInput();
      return;
    }
    
    if (dropped.size > UPLOAD_MAX_FILE_SIZE_BYTES) {
      setUploadError(UPLOAD_FILE_SIZE_ERROR_JA);
      setFile(null);
      setText("");
      event.dataTransfer.clearData();
      resetFileInput();
      return;
    }
    
    setFile(dropped);
    setText("");
    setError(null);
    setUploadError(null);
    setHasNewUpload(true); // Mark as new upload
  }, [isPdfFile, resetFileInput]);

  /**
   * @description Handle file input change event with validation (file type and size).
   * @description ファイル入力変更イベントを検証付きで処理します（ファイルタイプとサイズ）。
   * @param {React.ChangeEvent<HTMLInputElement>} event - The change event | 変更イベント
   * @returns {void} No return value | 返り値なし
   * @remarks Validates PDF format and file size before setting the file state.
   * @remarks ファイルの状態を設定する前にPDF形式とファイルサイズを検証します。
   */
  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    
    if (!isPdfFile(selected)) {
      setUploadError("PDF ファイルのみアップロードできます");
      setFile(null);
      setText("");
      return;
    }
    
    if (selected.size > UPLOAD_MAX_FILE_SIZE_BYTES) {
      setUploadError(UPLOAD_FILE_SIZE_ERROR_JA);
      setFile(null);
      setText("");
      return;
    }
    
    setFile(selected);
    setText("");
    setError(null);
    setUploadError(null);
    setHasNewUpload(true); // Mark as new upload
  }, [isPdfFile]);

  /**
   * Handle PDF parsing with error handling and user feedback
   * エラーハンドリングとユーザーフィードバック付きのPDF解析処理
   */
  async function handleParse() {
    setError(null);
    if (!file) {
      setError("PDFファイルを選択してください");
      return;
    }
    try {
      const data = await parsePdfMutation.mutateAsync({ file });
      const t = (data.resumeText || "").trim();
      if (!t) {
        throw new Error("Empty parse result");
      }
      setText(t);
      setHasNewUpload(true); // Mark as new upload after parsing
    } catch (error) {
      console.error("PDF parsing error:", error);
      setError(
        "PDFの解析に失敗しました。再試行するか、テキストを手動で貼り付けてください。"
      );
    }
  }

  /**
   * Handle form submission to API and redirect to jobs page
   * APIへのフォーム送信と求人ページへのリダイレクト処理
   */
  async function handleSubmit() {
    setError(null);
    const payload = { resume_text: text.trim() };
    if (!payload.resume_text) {
      setError("送信できるテキストがありません");
      return;
    }
    let response: {
      resumeId: string;
      resumeHash: string;
    };
    try {
      response = await uploadResumeMutation.mutateAsync({
        resumeText: payload.resume_text,
      });
    } catch (err) {
      console.error("Resume upload failed:", err);
      setError(
        `アップロードに失敗しました: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      return;
    }

    // Clear previous batch matching results only if user uploaded a new resume
    // ユーザーが新しいレジュメをアップロードした場合のみ、以前のバッチマッチング結果をクリア
    if (hasNewUpload) {
      clearBatchMatchCache();
    }

    // Save resume info to Zustand store for future sessions (non-sensitive)
    // 将来のセッション用のレジュメ情報をZustandストアに保存（非機密情報）
    try {
      const { setResume } = useResumeStore.getState();
      setResume(response.resumeId);
    } catch {}

    // Redirect to jobs list with ids using Next.js router
    // Next.jsのルーターを使用して求人一覧ページへ遷移
    const q = new URLSearchParams();
    q.set("resumeId", response.resumeId);
    router.push(`${ROUTE_JOBS}?${q.toString()}`);
  }

  // Get resume storage key from Zustand store
  // Zustandストアからレジュメストレージキーを取得
  const resumeStorageKey = useResumeStore((state) => state.resumeStorageKey);

  // Prefill from S3 if resume exists in Zustand store using TanStack Query
  // Zustandストアにレジュメが存在する場合、TanStack Queryを使用してS3から事前入力
  const {
    data: resumeTextData,
    isLoading: isResumeTextLoading,
    isError: isResumeTextError,
  } = useResumeText(resumeStorageKey, {
    enabled: Boolean(resumeStorageKey) && !text, // Only fetch if resume exists and text is empty
    // resumeIdが存在し、テキストが空の場合のみ取得
  });

  // Set prefilling state based on loading status
  // ローディング状態に基づいてprefilling状態を設定
  useEffect(() => {
    setPrefilling(isResumeTextLoading);
  }, [isResumeTextLoading]);

  // Update text when resume data is loaded
  // レジュメデータが読み込まれたらテキストを更新
  useEffect(() => {
    if (resumeTextData?.resumeText && !text) {
      setText(resumeTextData.resumeText);
    }
  }, [resumeTextData, text]);

  // Silent failure for prefilling errors; user can still paste manually
  // 事前入力エラーはサイレント失敗；ユーザーは手動で貼り付け可能
  useEffect(() => {
    if (isResumeTextError) {
      console.error("Prefilling error: Failed to load resume text");
    }
  }, [isResumeTextError]);

  return (
    <div className="mx-auto max-w-7xl 2xl:max-w-[85vw] px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero */}
      <div className="space-y-6">
        <div className="flex items-center gap-5">
          <div className="relative h-16 w-16 sm:h-20 sm:w-20">
            <Image
              src="/upload/pdf-txt.svg"
              alt="PDF to Text"
              fill
              sizes="80px"
              className="object-contain"
            />
          </div>
          <div className="text-left">
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              レジュメアップロード（PDF → テキスト）
      </h1>
            <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
              PDF のままアップロード、または本文を貼り付けて AI マッチングを開始。
            </p>
          </div>
        </div>

        <button
          ref={dropRef}
          className={`relative flex w-full flex-col items-center justify-center rounded-3xl border border-slate-100/80 px-10 py-18 min-h-[400px] bg-sky-50/80 dark:bg-slate-600/20 shadow-[0_30px_90px_rgba(15,23,42,0.12)] transition-all ${
            dragActive ? "ring-2 ring-sky-400 ring-offset-4" : ""
          }`}
          type="button"
          onClick={openFilePicker}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div
            className={`w-full max-w-4xl rounded-2xl border-2 border-dashed px-12 py-20 min-h-[340px] text-center transition-colors ${
              dragActive ? "border-[#2c6ee8] bg-[#eaf1ff]/70" : "border-slate-200 dark:border-slate-500"
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-300">
                <div id="upload-title" className="text-lg font-medium">
                  PDFファイルをここにドラッグ＆ドロップ
                </div>
              </div>
              <p id="upload-instructions" className="text-sm text-slate-500">
                または
              </p>
              <span className="inline-flex h-12 px-10 items-center justify-center rounded-full bg-white text-slate-900 text-base font-medium shadow-sm border border-slate-200">
                ファイルを選択
              </span>
              {file && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-full px-4">
                      <p className="text-xs text-slate-600 dark:text-slate-200 truncate cursor-help">
                        選択中: {file.name}
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs break-words">{file.name}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </button>
        <input
          id="upload-input"
          className="sr-only"
          type="file"
          accept="application/pdf,.pdf"
          multiple={false}
          ref={fileInputRef}
          onChange={handleFileInputChange}
        />
        {uploadError && (
          <div className="mt-3">
            <ErrorDisplay
              title="アップロードエラー"
              errorInfo={{
                message: "ファイルのアップロードに問題があります。ファイル形式（PDF）とサイズ（5MB以下）を確認して、正しいファイルを選択してください。",
                isRetryable: false,
              }}
            />
          </div>
        )}
      </div>

      {/* Parse button */}
      <div className="flex flex-col items-center gap-4 max-w-4xl mx-auto w-full">
        <PrimaryCtaButton
          onClick={handleParse}
          disabled={!file || parsePdfMutation.isPending}
        >
          PDFを解析
        </PrimaryCtaButton>
        {parsePdfMutation.isPending && (
          <div className="w-full max-w-md text-center space-y-2">
            <Progress indeterminate aria-label="PDF解析の進捗" className="h-3" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">解析中...</p>
          </div>
        )}
      </div>

      {/* Resume text area (middle section wrapped in Card) */}
      {/* レジュメテキストエリア（中央セクション、Cardでラップ） */}
      <Card className="shadow-[0_24px_80px_rgba(15,23,42,0.1)] border border-slate-200/80 dark:border-slate-700/70 bg-sky-50/80 dark:bg-slate-600/20">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100">
            レジュメ本文
          </CardTitle>
          <CardDescription>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-sm mt-3">
              {UPLOAD_TEXTAREA_GUIDELINES.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          {prefilling ? (
            <div className="w-full min-h-[440px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3">
              {Array.from({ length: 20 }, (_, index) => (
                <Skeleton 
                  key={index} 
                  className={index === 0 ? "h-4 w-[50%]" : "h-4 w-full"} 
                />
              ))}
            </div>
          ) : (
            <textarea
              className="w-full min-h-[440px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm leading-7"
              value={text}
              onChange={e => {
                setText(e.target.value);
                setHasNewUpload(true); // Mark as modified
              }}
              placeholder="レジュメテキストを貼り付け..."
            />
          )}
          {error && (
            <div className="mt-4">
              <ErrorDisplay
                title="処理エラー"
                errorInfo={getFriendlyErrorMessage(error)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* CTA button below text area, above operation steps */}
      {/* テキストエリア下、操作手順の上のCTAボタン */}
      <div className="flex justify-center">
        <PrimaryCtaButton
          onClick={handleSubmit}
          disabled={!text.trim() || uploadResumeMutation.isPending}
        >
          求人一覧へ進む
        </PrimaryCtaButton>
      </div>

      {/* Operation steps: image on left, text on right */}
      {/* 操作手順：左側に画像、右側にテキスト */}
      <section className="rounded-2xl bg-sky-50/80 dark:bg-slate-600/20 px-6 sm:px-10 py-10 shadow-[0_24px_80px_rgba(56,189,248,0.12)] border border-sky-100/80 dark:border-slate-600/60">
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-8">
          操作手順
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="flex justify-center lg:justify-start">
            <div className="relative w-full max-w-[480px] aspect-[3/2]">
              <Image
                src="/upload/steps.webp"
                alt="操作手順"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 80vw, 480px"
              />
            </div>
          </div>
          <div className="space-y-5">
            {UPLOAD_STEPS.map((step, index) => (
              <div key={step} className="flex items-start gap-4">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#39addf] text-white text-lg font-semibold shadow-[0_6px_16px_rgba(57,173,223,0.35)]">
                  {index + 1}
                </span>
                <p className="text-sm sm:text-base leading-6 text-slate-700 dark:text-slate-200">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {UPLOAD_FEATURES.map(feature => (
          <Card
            key={feature.title}
            className="border border-slate-200/70 dark:border-slate-600/60 shadow-[0_30px_90px_rgba(15,23,42,0.12)] bg-sky-100/80 dark:bg-slate-600/50 rounded-3xl py-8 px-5"
            aria-label={feature.title}
          >
            <CardHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative h-8 w-8">
                  <Image
                    src={feature.icon}
                    alt={feature.title}
                    fill
                    sizes="32px"
                    className="object-contain"
                  />
                </div>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {feature.title}
                </CardTitle>
      </div>
              <CardDescription className="text-sm text-slate-600 dark:text-slate-300 leading-6">
                {feature.body}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  );
}
