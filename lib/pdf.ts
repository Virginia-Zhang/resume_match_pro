/**
 * @file pdf.ts
 * @description Utilities for client-side PDF text extraction with progress reporting.
 * @description 進捗通知付きでクライアント側 PDF テキスト抽出を行うユーティリティ。
 * @author Virginia Zhang
 * @remarks Uses dynamic import of pdfjs-dist worker for App Router client components.
 * @remarks App Router のクライアントコンポーネント向けに pdfjs-dist ワーカーを動的読み込み。
 */

import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";

/**
 * Progress callback signature for PDF extraction.
 * PDF 抽出時の進捗コールバック形式。
 */
export type PdfProgressUpdate = (progress: number) => void;

interface PdfProgressData {
  loaded: number;
  total?: number;
}

const LOAD_PHASE_WEIGHT = 60;
const PAGE_PHASE_WEIGHT = 39;

/**
 * Extract plain text from a PDF file using pdfjs-dist.
 * pdfjs-dist を使用して PDF ファイルからプレーンテキストを抽出します。
 *
 * @param file PDF file to process | 処理対象の PDF ファイル
 * @param onProgress Optional progress handler (0-100) | 進捗ハンドラー（0〜100）
 * @returns Extracted text content | 抽出されたテキスト
 * @throws If PDF loading or parsing fails | PDF の読み込み・解析に失敗した場合
 */
export async function extractPdfText(
  file: File,
  onProgress?: PdfProgressUpdate
): Promise<string> {
  const pdfjs = (await import("pdfjs-dist")) as typeof import("pdfjs-dist");
  (pdfjs.GlobalWorkerOptions as { workerSrc?: string }).workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const array = await file.arrayBuffer();
  onProgress?.(0);

  const loadingTask = pdfjs.getDocument({ data: array }) as PDFDocumentLoadingTask;
  loadingTask.onProgress = (data: PdfProgressData) => {
    const total = data.total ?? 0;
    if (!total || total <= 0) {
      onProgress?.(0);
      return;
    }
    const loaded = data.loaded;
    const loadPercent = Math.floor((loaded / total) * LOAD_PHASE_WEIGHT);
    onProgress?.(Math.min(LOAD_PHASE_WEIGHT, Math.max(0, loadPercent)));
  };

  const doc = (await loadingTask.promise) as PDFDocumentProxy;

  let text = "";
  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
    const page = await doc.getPage(pageNumber);
    const content = await page.getTextContent();
    const items = content.items as Array<{ str?: string }>;
    const pageText = items.map(item => item.str ?? "").join(" ");
    text += pageText + "\n";
    const pageProgress = Math.floor((pageNumber / doc.numPages) * PAGE_PHASE_WEIGHT);
    onProgress?.(
      LOAD_PHASE_WEIGHT + Math.min(PAGE_PHASE_WEIGHT, Math.max(0, pageProgress))
    );
  }

  return text.trim();
}
