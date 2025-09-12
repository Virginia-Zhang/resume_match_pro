/**
 * @file route.ts
 * @description API route to persist resume_text to S3 and return { resumeId, resumeHash }.
 * @description 履歴書テキストをS3に保存し、{ resumeId, resumeHash } を返すAPIルート。
 * @author Virginia Zhang
 * @remarks Server route (App Router). Accepts JSON { resume_text } only; no secrets exposed.
 * @remarks サーバールート（App Router）。JSON { resume_text } のみ受け付け、機密情報は公開しない。
 */

import { NextRequest, NextResponse } from "next/server";
import { putText, resumeKey } from "@/lib/s3";
import { sha256Hex } from "@/lib/hash";

/**
 * Request body schema for resume upload
 * リクエストボディのスキーマ
 */
interface ResumePostBody {
  resume_text: string;
}

/**
 * HTTP POST handler to save resume text. 履歴書テキストを保存するHTTP POSTハンドラー。
 *
 * @param req NextRequest - Request object / リクエストオブジェクト
 * @returns NextResponse - JSON { resumeId, resumeHash } / JSON { resumeId, resumeHash }
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as Partial<ResumePostBody>;
    const resumeText = (body?.resume_text || "").toString();
    if (!resumeText || resumeText.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing resume_text" },
        { status: 400 }
      );
    }

    // 开发模式：返回模拟数据，简历文本由前端保存到 sessionStorage
    // 開発モード：モックデータを返す、履歴書テキストはフロントエンドで sessionStorage に保存
    if (process.env.NODE_ENV === "development" && !process.env.ENABLE_S3_TEST) {
      const resumeHash = "mock-hash-" + Date.now();
      const resumeId = "mock-id-" + Date.now();

      // 在开发模式下，简历文本由前端保存到 sessionStorage
      // 開発モードでは、履歴書テキストはフロントエンドで sessionStorage に保存される
      return NextResponse.json({
        resumeId,
        resumeHash,
        resumeText, // 返回给前端，让前端保存到 sessionStorage
      });
    }

    // 生产环境：实际存储到 S3
    // 本番環境：実際にS3に保存
    console.log("🚀 Storing resume to S3...");
    console.log("📦 S3 Bucket:", process.env.AWS_S3_BUCKET);
    console.log("🌍 AWS Region:", process.env.AWS_REGION);

    // Compute hash and generate a simple ID
    // ハッシュを計算し、簡易IDを生成
    const resumeHash = await sha256Hex(resumeText);
    const resumeId = `${Date.now().toString(36)}-${resumeHash.slice(0, 12)}`;

    console.log("💾 Resume ID:", resumeId);
    console.log("🔑 Resume Hash:", resumeHash);
    console.log("Resume Key:", resumeKey(resumeId));

    await putText(resumeKey(resumeId), resumeText);
    console.log("✅ Resume stored to S3 successfully!");

    return NextResponse.json({ resumeId, resumeHash });
  } catch (error: unknown) {
    // Log detailed error for debugging
    // デバッグ用の詳細エラーログ
    console.error("❌ S3 storage error:", error);

    if (error instanceof Error) {
      console.error("❌ Error type:", error.constructor.name);
      console.error("❌ Error message:", error.message);
    }

    if (error && typeof error === "object") {
      const errorObj = error as Record<string, unknown>;
      if ("code" in errorObj) {
        console.error("❌ Error code:", errorObj.code);
      }
      if ("$metadata" in errorObj) {
        console.error("❌ AWS metadata:", errorObj.$metadata);
      }
    }

    // Avoid echoing sensitive text; return minimal error
    // 機密テキストを返さず、最小限のエラーのみ
    return NextResponse.json(
      { error: "Failed to store resume" },
      { status: 500 }
    );
  }
}
