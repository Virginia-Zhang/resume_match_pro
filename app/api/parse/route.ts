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
    // Use pdf-parse via explicit entry to avoid Turbopack pulling test assets
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


