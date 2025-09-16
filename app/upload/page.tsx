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
import { Button } from "@/components/ui/button";
import Skeleton from "@/components/ui/skeleton";
import { resumePointer } from "@/lib/storage";
import { fetchJson } from "@/lib/fetcher";
import { useRouter } from "next/navigation";

/**
 * Extract text content from PDF file using pdfjs-dist
 * pdfjs-distを使用してPDFファイルからテキストを抽出
 *
 * @param file - PDF file to extract text from / テキストを抽出するPDFファイル
 * @returns Promise resolving to extracted text / 抽出されたテキストを解決するプロミス
 */
async function extractPdfText(file: File): Promise<string> {
  console.log(
    "🔍 Starting PDF extraction for file:",
    file.name,
    "size:",
    file.size
  );

  try {
    // Lazy import pdfjs to keep bundle smaller
    // バンドルを小さく保つため遅延インポート
    console.log("📦 Loading pdfjs-dist...");
    const pdfjs = (await import("pdfjs-dist")) as typeof import("pdfjs-dist");
    console.log("✅ pdfjs-dist loaded successfully");

    console.log("👷 Setting up PDF worker...");
    // Set worker source using unpkg CDN with correct build path
    // unpkg CDNの正しいビルドパスを使用してワーカーソースを設定
    // Type assertion for GlobalWorkerOptions to set worker source
    // ワーカーソース設定のためのGlobalWorkerOptions型アサーション
    const pdfVersion = (pdfjs as { version?: string }).version || "4.10.38";
    console.log("📋 PDF.js version:", pdfVersion);
    (pdfjs.GlobalWorkerOptions as { workerSrc?: string }).workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
    console.log("✅ PDF worker configured successfully");

    console.log("📄 Converting file to ArrayBuffer...");
    const array = await file.arrayBuffer();
    console.log("✅ ArrayBuffer created, size:", array.byteLength);

    console.log("📖 Loading PDF document...");
    const doc = await pdfjs.getDocument({ data: array }).promise;
    console.log("✅ PDF document loaded, pages:", doc.numPages);

    let text = "";
    for (let i = 1; i <= doc.numPages; i++) {
      console.log(`📄 Processing page ${i}/${doc.numPages}...`);
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const items = content.items as Array<{ str?: string }>;
      const pageText = items.map(it => it.str ?? "").join(" ");
      text += pageText + "\n";
      console.log(`✅ Page ${i} processed, text length:`, pageText.length);
    }

    const result = text.trim();
    console.log(
      "🎉 PDF extraction completed, total text length:",
      result.length
    );
    console.log("📝 First 200 chars:", result.substring(0, 200));

    return result;
  } catch (error) {
    console.error("❌ PDF extraction failed:", error);
    throw error;
  }
}

/**
 * Upload page component for PDF parsing and resume text input
 * PDF解析と履歴書テキスト入力用のアップロードページコンポーネント
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

  /**
   * Handle PDF parsing with error handling and user feedback
   * エラーハンドリングとユーザーフィードバック付きのPDF解析処理
   */
  async function handleParse() {
    setError(null);
    if (!file) {
      setError("Please choose a PDF file");
      return;
    }
    setParsing(true);
    try {
      const t = await extractPdfText(file);
      if (!t) {
        console.warn("⚠️ PDF parsing returned empty text");
        setError("Empty PDF text; please paste manually");
      } else {
        setText(t);
      }
    } catch (error) {
      console.error("❌ PDF parsing error:", error);
      setError(
        `PDF parse failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Please retry or paste text manually.`
      );
    } finally {
      setParsing(false);
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
      setError("No text to submit");
      return;
    }
    const res = await fetch("/api/resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      setError(`Upload failed: ${t}`);
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
    router.push(`/jobs?${q.toString()}`);
  }

  // Prefill from S3 if resume:current exists
  // resume:current が存在する場合、S3 から事前入力
  React.useEffect(() => {
    const p = resumePointer.load();
    if (!p?.resumeId) return;
    let cancelled = false;
    (async () => {
      try {
        setPrefilling(true);
        const url = `/api/resume-text?resumeId=${encodeURIComponent(p.resumeId)}`;
        const data = await fetchJson<{ resumeText: string }>(url, {
          timeoutMs: 15000,
        });
        if (!cancelled && data?.resumeText && !text) {
          setText(data.resumeText);
        }
      } catch (e) {
        // silent fail; user can still paste
      } finally {
        if (!cancelled) setPrefilling(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">
        Upload Resume（PDF / テキスト）
      </h1>

      <div className="space-y-3">
        <input
          type="file"
          accept="application/pdf"
          onChange={e => setFile(e.target.files?.[0] || null)}
        />
        <div className="flex items-center gap-3">
          <Button onClick={handleParse} disabled={!file || parsing}>
            Parse PDF
          </Button>
          {parsing && <Skeleton className="h-8 w-24" />}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">
          If parsing fails, paste your resume text here. /
          解析失敗時はこちらへ貼り付け
        </label>
        <textarea
          className="w-full h-64 rounded-md border p-3"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste resume text..."
        />
        {prefilling && <Skeleton className="h-4 w-24" />}
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div>
        <Button onClick={handleSubmit} disabled={!text.trim()}>
          Continue → Jobs
        </Button>
      </div>
    </div>
  );
}
