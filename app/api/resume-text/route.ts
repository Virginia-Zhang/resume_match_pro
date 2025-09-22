/**
 * @file route.ts
 * @description GET resume text from S3 by resumeId. Returns { resumeId, resumeKey, resumeText }.
 * @description レジュメIDからS3のテキストを取得し、{ resumeId, resumeKey, resumeText } を返します。
 * @author Virginia Zhang
 * @remarks Server route (App Router). Uses lib/s3 getText + resumeKey. No secrets exposed.
 * @remarks サーバールート（App Router）。lib/s3 の getText と resumeKey を使用。機密情報は公開しません。
 */

import { NextRequest, NextResponse } from "next/server";
import { getText, resumeKey } from "@/lib/s3";

/**
 * @description GET handler. Requires query `resumeId`. Returns 400/404/200 JSON.
 * @description GET ハンドラー。クエリ `resumeId` が必須。400/404/200 のJSONを返します。
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const resumeId = (searchParams.get("resumeId") || "").trim();

  if (!resumeId) {
    return NextResponse.json({ error: "Missing resumeId" }, { status: 400 });
  }

  try {
    const key = resumeKey(resumeId);
    const text = await getText(key);
    if (text == null) {
      return NextResponse.json(
        { error: "Not found", resumeId },
        { status: 404 }
      );
    }
    return NextResponse.json({ resumeId, resumeKey: key, resumeText: text });
  } catch (err: unknown) {
    console.error("❌ Failed to read resume text:", err);
    return NextResponse.json(
      { error: "Failed to read resume text" },
      { status: 500 }
    );
  }
}
