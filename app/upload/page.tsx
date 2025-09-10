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
  const [file, setFile] = React.useState<File | null>(null);
  const [parsing, setParsing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [text, setText] = React.useState("");

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
      console.log("🚀 Starting PDF parse for file:", file.name);
      const t = await extractPdfText(file);
      if (!t) {
        console.warn("⚠️ PDF parsing returned empty text");
        setError("Empty PDF text; please paste manually");
      } else {
        console.log("✅ PDF parsing successful, setting text");
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

    // In development mode, save resume text to sessionStorage
    // 開発モードでは、履歴書テキストを sessionStorage に保存
    if (response.resumeText) {
      try {
        sessionStorage.setItem(
          `resume:${response.resumeId}`,
          response.resumeText
        );
        console.log("✅ Resume text saved to sessionStorage for development");
      } catch (err) {
        console.warn("⚠️ Failed to save resume text to sessionStorage:", err);
      }
    }

    // Redirect to jobs list with ids
    // ID付きで求人一覧へ遷移
    window.location.href = `/jobs?resumeId=${encodeURIComponent(
      response.resumeId
    )}&resumeHash=${encodeURIComponent(response.resumeHash)}`;
  }

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
