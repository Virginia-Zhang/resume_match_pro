/**
 * @file page.tsx
 * @description Upload page: parse PDF on client via pdfjs-dist, fallback to textarea, POST to /api/resume.
 * @description アップロードページ：pdfjs-distでクライアント側PDF解析、テキストエリアにフォールバックし、/api/resumeへPOST。
 * @author Virginia Zhang
 * @remarks Client component. Never store resume_text in localStorage; only transient state.
 * @remarks クライアントコンポーネント。localStorageに保存しない。状態は一時的のみ。
 */
"use client";

import React from "react";
import Image from "next/image";
import { PrimaryCtaButton, SecondaryCtaButton } from "@/components/common/buttons/CtaButtons";
import Skeleton from "@/components/ui/skeleton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { resumePointer } from "@/lib/storage";
import {
  API_RESUME,
  API_RESUME_TEXT,
  ROUTE_JOBS,
  UPLOAD_FEATURES,
  UPLOAD_STEPS,
  UPLOAD_TEXTAREA_GUIDELINES,
  UPLOAD_MAX_FILE_SIZE_BYTES,
  UPLOAD_FILE_SIZE_ERROR_JA,
} from "@/app/constants/constants";
import { fetchJson } from "@/lib/fetcher";
import { useRouter } from "next/navigation";

import { Progress } from "@/components/ui/progress";
import { extractPdfText } from "@/lib/pdf";

/**
 * Upload page component for PDF parsing and resume text input
 * PDF解析とレジュメテキスト入力用のアップロードページコンポーネント
 *
 * @returns JSX element / JSX要素
 */
export default function UploadPage(): React.JSX.Element {
  const router = useRouter();
  const [file, setFile] = React.useState<File | null>(null);
  const [parsing, setParsing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [text, setText] = React.useState("");
  const [prefilling, setPrefilling] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const [parseProgress, setParseProgress] = React.useState<number>(0);
  const dropRef = React.useRef<HTMLDivElement | null>(null);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

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
    setParsing(true);
    setParseProgress(0);
    try {
      const t = await extractPdfText(file, progress => setParseProgress(progress));
      if (!t) {
        console.warn("⚠️ PDF parsing returned empty text");
        setError("PDFからテキストを抽出できません。手動で貼り付けてください。");
      } else {
        setText(t);
      }
      setParseProgress(100);
    } catch (error) {
      console.error("❌ PDF parsing error:", error);
      setError(
        `PDFの解析に失敗しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }。再試行するか、テキストを手動で貼り付けてください。`
      );
    } finally {
      setParsing(false);
      setTimeout(() => setParseProgress(0), 800);
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
    const res = await fetch(API_RESUME, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      setError(`アップロードに失敗しました: ${t}`);
      return;
    }
    const response = (await res.json()) as {
      resumeId: string;
      resumeHash: string;
      resumeText?: string; // Development mode may include resume text
    };

    // Save pointer to localStorage for future sessions (non-sensitive)
    // 将指针保存到 localStorage 以便后续会话使用（非敏感）
    try {
      resumePointer.save(response.resumeId);
    } catch {}

    // Redirect to jobs list with ids using Next.js router
    // Next.js の router を用いて求人一覧へ遷移
    const q = new URLSearchParams();
    q.set("resumeId", response.resumeId);
    router.push(`${ROUTE_JOBS}?${q.toString()}`);
  }

  // Prefill from S3 if resume:current exists
  // resume:current が存在する場合、S3 から事前入力
  React.useEffect(() => {
    const p = resumePointer.load();
    if (!p?.resumeId || text) return;
    let cancelled = false;
    (async () => {
      try {
        setPrefilling(true);
        const url = `${API_RESUME_TEXT}?resumeId=${encodeURIComponent(p.resumeId)}`;
        const data = await fetchJson<{ resumeText: string }>(url, {
          timeoutMs: 15000,
        });
        if (!cancelled && data?.resumeText && !text) {
          setText(data.resumeText);
        }
      } catch (error) {
        console.error("❌ Prefilling error:", error);
        // silent fail; user can still paste
      } finally {
        if (!cancelled) setPrefilling(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [text]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
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
              priority
            />
          </div>
          <div className="text-left">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              レジュメアップロード（PDF → テキスト）
      </h1>
            <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
              PDF のままアップロード、または本文を貼り付けて AI マッチングを開始。
            </p>
          </div>
        </div>

        <div
          ref={dropRef}
          className={`relative flex flex-col items-center justify-center rounded-3xl border border-slate-100/80 px-10 py-18 min-h-[400px] bg-sky-50/80 dark:bg-slate-600/20 shadow-[0_30px_90px_rgba(15,23,42,0.12)] transition-all ${
            dragActive ? "ring-2 ring-sky-400 ring-offset-4" : ""
          }`}
          role="button"
          tabIndex={0}
          aria-labelledby="upload-title"
          aria-describedby="upload-instructions"
          onClick={() => document.getElementById("upload-input")?.click()}
          onKeyDown={event => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              document.getElementById("upload-input")?.click();
            }
          }}
          onDragOver={event => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={event => {
            if (!dropRef.current?.contains(event.relatedTarget as Node)) {
              setDragActive(false);
            }
          }}
          onDrop={event => {
            event.preventDefault();
            setDragActive(false);
            const dropped = event.dataTransfer.files?.[0];
            if (!dropped) return;
            if (dropped.type !== "application/pdf") {
              setUploadError("PDF ファイルのみアップロードできます");
              return;
            }
            if (dropped.size > UPLOAD_MAX_FILE_SIZE_BYTES) {
              setUploadError(UPLOAD_FILE_SIZE_ERROR_JA);
              return;
            }
            setFile(dropped);
            setText("");
            setError(null);
            setUploadError(null);
          }}
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
              <SecondaryCtaButton
                className="h-12 px-10 text-base"
                onClick={() => document.getElementById("upload-input")?.click()}
              >
                ファイルを選択
              </SecondaryCtaButton>
        <input
                id="upload-input"
                className="sr-only"
          type="file"
          accept="application/pdf"
                onChange={event => {
                  const selected = event.target.files?.[0];
                  if (!selected) return;
                  if (selected.type !== "application/pdf") {
                    setUploadError("PDF ファイルのみアップロードできます");
                    return;
                  }
                  if (selected.size > UPLOAD_MAX_FILE_SIZE_BYTES) {
                    setUploadError(UPLOAD_FILE_SIZE_ERROR_JA);
                    return;
                  }
                  setFile(selected);
                  setText("");
                  setError(null);
                  setUploadError(null);
                }}
              />
              {file && (
                <p className="text-xs text-slate-600 dark:text-slate-200 truncate max-w-[320px]">
                  選択中: {file.name}
                </p>
              )}
            </div>
          </div>
        </div>
        {uploadError && (
          <div className="mt-3 flex justify-center">
            <p className="text-sm text-red-600 text-center" role="alert" aria-live="assertive">
              {uploadError}
            </p>
          </div>
        )}
      </div>

      {/* Parse button */}
      <div className="flex flex-col items-center gap-4">
        <PrimaryCtaButton onClick={handleParse} disabled={!file || parsing}>
          PDFを解析
        </PrimaryCtaButton>
        {parseProgress > 0 && (
          <div className="w-full max-w-md text-center space-y-2">
            <Progress value={parseProgress} aria-label="PDF解析の進捗" className="h-3" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {`${Math.min(100, Math.round(parseProgress))}%`}
            </p>
          </div>
        )}
      </div>

      {/* 中段：Textarea 区域（放入 Card） */}
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
        <textarea
            className="w-full min-h-[440px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm leading-7"
          value={text}
          onChange={e => setText(e.target.value)}
            placeholder="レジュメテキストを貼り付け..."
          />
          {prefilling && <Skeleton className="h-4 w-24 mt-2" />}
          {error && (
            <div className="mt-4 flex justify-center">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CTA 放在文本框区域下方、手順上方 */}
      <div className="flex justify-center">
        <PrimaryCtaButton onClick={handleSubmit} disabled={!text.trim()}>
          求人一覧へ進む
        </PrimaryCtaButton>
      </div>

      {/* 操作手順：左图右文 */}
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
            role="group"
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
