/**
 * @file route.ts
 * @description API route to parse a PDF file and return the text content.
 * @description PDFファイルを解析し、テキスト内容を返すAPIルート。
 * @author Virginia Zhang
 * @remarks Server route (App Router). Accepts a file upload and returns the text content.
 * @remarks サーバールート（App Router）。ファイルアップロードを受け付け、テキスト内容を返す。
 * @remarks The file is expected to be a PDF file.
 * @remarks ファイルはPDFファイルとして期待されています。
 */

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(req: Request): Promise<Response> {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "invalid file type" }, { status: 400 });
    }
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json({ error: "file too large" }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { default: pdfParse } = (await import("pdf-parse/lib/pdf-parse.js")) as {
      default: (b: Buffer) => Promise<{ text?: string }>;
    };
    const result = await pdfParse(buffer);
    const text = (result?.text ?? "").trim();
    return NextResponse.json({ resumeText: text });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "parse failed" },
      { status: 500 }
    );
  }
}


