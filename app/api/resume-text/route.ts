/**
 * @file route.ts
 * @description GET resume text from S3 by resumeId. Returns { resumeId, resumeKey, resumeText }.
 * @description レジュメIDからS3のテキストを取得し、{ resumeId, resumeKey, resumeText } を返します。
 * @author Virginia Zhang
 * @remarks Server route (App Router). Gets storage_key from database, then fetches from S3. No secrets exposed.
 * @remarks サーバールート（App Router）。データベースからstorage_keyを取得し、S3から取得。機密情報は公開しません。
 */

import { getText, resumeKey } from "@/lib/s3";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * @description GET handler. Requires query `resumeId`. Returns 400/404/200 JSON.
 * @description GET ハンドラー。クエリ `resumeId` が必須。400/404/200 のJSONを返します。
 * @remarks Gets storage_key from database, falls back to resumeKey() if not found
 * @remarks データベースからstorage_keyを取得、見つからない場合はresumeKey()にフォールバック
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const resumeId = (searchParams.get("resumeId") || "").trim();

  if (!resumeId) {
    return NextResponse.json({ error: "Missing resumeId" }, { status: 400 });
  }

  try {
    // Try to get storage_key from database first
    // まずデータベースからstorage_keyを取得を試みる
    let storageKey: string;
    try {
      const supabase = await createClient();
      const { data: resumeRecord, error: dbError } = await supabase
        .from("resumes")
        .select("storage_key")
        .eq("id", resumeId)
        .single();

      if (!dbError && resumeRecord?.storage_key) {
        storageKey = resumeRecord.storage_key;
      } else {
        // Fallback to resumeKey() if not found in database
        // データベースに見つからない場合はresumeKey()にフォールバック
        storageKey = resumeKey(resumeId);
      }
    } catch (dbError) {
      // Fallback to resumeKey() if database query fails
      // データベースクエリが失敗した場合はresumeKey()にフォールバック
      console.warn("Failed to get storage_key from database, using fallback:", dbError);
      storageKey = resumeKey(resumeId);
    }

    const text = await getText(storageKey);
    if (text == null) {
      return NextResponse.json(
        { error: "Not found", resumeId },
        { status: 404 }
      );
    }
    return NextResponse.json({ resumeId, resumeKey: storageKey, resumeText: text });
  } catch (err: unknown) {
    console.error("Failed to read resume text:", err);
    return NextResponse.json(
      { error: "Failed to read resume text" },
      { status: 500 }
    );
  }
}
