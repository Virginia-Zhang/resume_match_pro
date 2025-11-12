/**
 * @file route.ts
 * @description API route to persist resume_text to S3, store metadata in resumes table, and return { resumeId, resumeHash }.
 * @description レジュメテキストをS3に保存し、メタデータをresumesテーブルに保存し、{ resumeId, resumeHash } を返すAPIルート。
 * @author Virginia Zhang
 * @remarks Server route (App Router). Accepts JSON { resume_text } only; no secrets exposed.
 * @remarks サーバールート（App Router）。JSON { resume_text } のみ受け付け、機密情報は公開しない。
 */

import {
  SUPABASE_ERROR_NO_ROWS,
  SUPABASE_ERROR_UNIQUE_CONSTRAINT,
} from "@/app/constants/constants";
import { sha256Hex } from "@/lib/hash";
import { putText, resumeKey } from "@/lib/s3";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Request body schema for resume upload
 * リクエストボディのスキーマ
 */
interface ResumePostBody {
  resume_text: string;
}

/**
 * HTTP POST handler to save resume text to S3 and metadata to Supabase.
 * レジュメテキストをS3に保存し、メタデータをSupabaseに保存するHTTP POSTハンドラー。
 *
 * @param req NextRequest - Request object / リクエストオブジェクト
 * @returns NextResponse - JSON { resumeId, resumeHash } / JSON { resumeId, resumeHash }
 * @remarks Uses resume_hash for idempotency: if same hash exists, returns existing record
 * @remarks 冪等性のために resume_hash を使用：同じハッシュが存在する場合、既存のレコードを返す
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

    // Compute hash for idempotency check
    // 冪等性チェック用にハッシュを計算
    const resumeHash = await sha256Hex(resumeText);

    // Check if resume with same hash already exists in database
    // 同じハッシュのレジュメがデータベースに既に存在するかチェック
    const supabase = await createClient();
    const { data: existingResume, error: queryError } = await supabase
      .from("resumes")
      .select("id, resume_hash")
      .eq("resume_hash", resumeHash)
      .single();

    // Handle query result: if resume exists, return it
    // クエリ結果を処理：レジュメが存在する場合は返す
    // PGRST116 error means no rows found (expected when resume doesn't exist)
    // PGRST116 エラーは行が見つからないことを意味する（レジュメが存在しない場合に期待される）
    if (existingResume && !queryError) {
      return NextResponse.json({
        resumeId: existingResume.id,
        resumeHash: existingResume.resume_hash,
      });
    }

    // If error is not PGRST116 (no rows), it's an unexpected error
    // PGRST116（行なし）以外のエラーは予期しないエラー
    if (queryError && queryError.code !== SUPABASE_ERROR_NO_ROWS) {
      console.error("Unexpected error querying resumes:", queryError);
      return NextResponse.json(
        { error: "Failed to check existing resume", details: queryError.message },
        { status: 500 }
      );
    }

    // Resume doesn't exist, proceed with insert
    // レジュメが存在しないため、挿入を続行
    // Use temporary storage_key, will update after getting UUID
    // 一時的なstorage_keyを使用し、UUID取得後に更新
    const tempStorageKey = `resume/${resumeHash.slice(0, 16)}.txt`;
    const { data: newResume, error: insertError } = await supabase
      .from("resumes")
      .insert({
        resume_hash: resumeHash,
        storage_key: tempStorageKey,
      })
      .select("id, resume_hash")
      .single();

    // Handle insert error: if unique constraint violation, another request inserted first
    // 挿入エラーを処理：一意制約違反の場合、別のリクエストが先に挿入した
    if (insertError || !newResume) {
      // Check if error is due to unique constraint violation (concurrent insert)
      // エラーが一意制約違反（同時挿入）によるものかチェック
      const isUniqueConstraintError =
        insertError?.code === SUPABASE_ERROR_UNIQUE_CONSTRAINT ||
        insertError?.message?.includes("duplicate key") ||
        insertError?.message?.includes("unique constraint");

      if (isUniqueConstraintError) {
        // Another request inserted the same resume_hash concurrently
        // 別のリクエストが同じ resume_hash を同時に挿入した
        // Query again to get the existing record
        // 既存のレコードを取得するために再度クエリ
        const { data: concurrentResume, error: retryError } = await supabase
          .from("resumes")
          .select("id, resume_hash")
          .eq("resume_hash", resumeHash)
          .single();

        if (concurrentResume && !retryError) {
          // Return the existing record (idempotent behavior)
          // 既存のレコードを返す（冪等性の動作）
          return NextResponse.json({
            resumeId: concurrentResume.id,
            resumeHash: concurrentResume.resume_hash,
          });
        }

        // If retry query also fails, return error
        // 再試行クエリも失敗した場合、エラーを返す
        console.error("Failed to retrieve concurrent resume:", retryError);
        return NextResponse.json(
          { error: "Failed to store resume metadata" },
          { status: 500 }
        );
      }

      // Other insert errors
      // その他の挿入エラー
      console.error("Failed to insert resume metadata:", insertError);
      return NextResponse.json(
        { error: "Failed to store resume metadata", details: insertError?.message },
        { status: 500 }
      );
    }

    // Store resume text in S3 using UUID-based key
    // UUIDベースのキーを使用してレジュメテキストをS3に保存
    const finalStorageKey = resumeKey(newResume.id);
    try {
      await putText(finalStorageKey, resumeText);
    } catch (s3Error) {
      // If S3 upload fails, rollback database insert to avoid orphaned records
      // S3アップロードが失敗した場合、孤立レコードを避けるためにデータベース挿入をロールバック
      console.error("S3 upload failed, rolling back database insert:", s3Error);
      await supabase
        .from("resumes")
        .delete()
        .eq("id", newResume.id);
      
      // Re-throw the error to be caught by outer catch block
      // 外側のcatchブロックでキャッチされるようにエラーを再スロー
      throw s3Error;
    }

    // Update storage_key in database to use UUID
    // UUIDを使用するようにデータベースのstorage_keyを更新
    if (tempStorageKey !== finalStorageKey) {
      const { error: updateError } = await supabase
        .from("resumes")
        .update({ storage_key: finalStorageKey })
        .eq("id", newResume.id);
      
      // If update fails, log error but don't fail the request (S3 upload succeeded)
      // 更新が失敗した場合、エラーをログに記録するがリクエストは失敗させない（S3アップロードは成功）
      if (updateError) {
        console.error("Failed to update storage_key in database:", updateError);
      }
    }

    return NextResponse.json({
      resumeId: newResume.id,
      resumeHash: newResume.resume_hash,
    });
  } catch (error: unknown) {
    // Log detailed error for debugging
    // デバッグ用の詳細エラーログ
    console.error("Resume storage error:", error);

    if (error instanceof Error) {
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);
    }

    if (error && typeof error === "object") {
      const errorObj = error as Record<string, unknown>;
      if ("code" in errorObj) {
        console.error("Error code:", errorObj.code);
      }
      if ("$metadata" in errorObj) {
        console.error("AWS metadata:", errorObj.$metadata);
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
