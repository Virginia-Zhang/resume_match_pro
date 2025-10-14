/**
 * @file route.ts
 * @description Match summary API: returns overall score, and five-dimension scores with S3 cache.
 * @description マッチ要約API：総合スコア、5次元スコアをS3キャッシュ付きで返す。
 * @author Virginia Zhang
 * @remarks Server route.
 * @remarks サーバールート。
 */

import { NextRequest, NextResponse } from "next/server";
import {
  cacheKey,
  getJson,
  putJson,
  getText,
  resumeKey,
  isS3Configured,
} from "@/lib/s3";
import { sha256Hex } from "@/lib/hash";

interface DifyRequestBody {
  inputs: {
    job_description: string;
  };
  response_mode: string;
  user: string;
  // Internal tracking fields
  jobId: string;
  resumeId: string;
  resumeHash: string;
}

interface SummaryData {
  overall: number;
  scores: Record<string, number>;
}

interface Envelope {
  meta: {
    jobId: string;
    resumeHash: string;
    source: "cache" | "dify";
    timestamp: string;
    version: "v1" | "v2";
  };
  data: SummaryData;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as Partial<DifyRequestBody>;

    const jobId = (body.jobId || "").toString();
    const jobDesc = (body.inputs?.job_description || "").toString();
    if (!jobId || !jobDesc) {
      return NextResponse.json(
        { error: "Missing jobId or job_description" },
        { status: 400 }
      );
    }

    // Resume text must be retrieved from S3
    // レジュメテキストはS3から取得する必要がある
    if (!body.resumeId) {
      return NextResponse.json({ error: "Missing resumeId" }, { status: 400 });
    }

    if (!isS3Configured()) {
      return NextResponse.json(
        { error: "S3 is not configured" },
        { status: 500 }
      );
    }

    const resumeText = await getText(resumeKey(body.resumeId.toString()));
    if (!resumeText) {
      return NextResponse.json(
        { error: "Resume not found in S3" },
        { status: 404 }
      );
    }

    const resumeHash = await sha256Hex(resumeText);

    // Dify configuration is required
    // Dify 設定は必須
    const difyUrl = process.env.DIFY_WORKFLOW_URL || "";
    const apiKey = process.env.DIFY_API_KEY || "";
    if (!difyUrl || !apiKey) {
      return NextResponse.json({ error: "Missing Dify env" }, { status: 500 });
    }

    // Check cache (production environment)
    // キャッシュをチェック（本番環境）
    const key = cacheKey(jobId, "summary", resumeHash);
    if (isS3Configured()) {
      const cached = await getJson<Envelope>(key);
      // Version check: only use v2 cached data (data structure changed for summary and details APIs, v1 cache invalidated)
      // バージョンチェック：v2 バージョンのキャッシュのみを使用
      if (cached && cached.meta?.version === "v2") {
        return NextResponse.json(cached);
      }
    }

    // Call Dify Workflow (non-streaming)
    // Difyワークフローを呼び出す（非ストリーミング）
    const res = await fetch(difyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        inputs: {
          resume_text: resumeText,
          job_description: jobDesc,
        },
        response_mode: "blocking",
        user: "Virginia Zhang",
      }),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `Dify HTTP ${res.status}: ${msg}` },
        { status: 502 }
      );
    }

    const payload = await res.json();
    // Parse Dify workflow response: expect data.outputs to contain fields
    // Dify ワークフロー応答を解析: data.outputs 内のフィールドを利用
    const outputs = (payload?.data?.outputs ?? {}) as Record<string, unknown>;

    // overall
    const overall = Number((outputs as { overall?: unknown }).overall ?? 0);

    // scores: expect object with string keys and number values
    const rawScores = (outputs as { scores?: Record<string, unknown> }).scores;
    const scores: Record<string, number> = {};
    if (rawScores && typeof rawScores === "object") {
      for (const [key, value] of Object.entries(rawScores)) {
        const num = Number(value);
        if (!Number.isNaN(num)) {
          scores[key] = num;
        }
      }
    }

    const data: SummaryData = { overall, scores };

    const envelope: Envelope = {
      meta: {
        jobId,
        resumeHash,
        source: "dify",
        timestamp: new Date().toISOString(),
        version: "v2",
      },
      data,
    };

    if (isS3Configured()) {
      await putJson(key, envelope);
    }
    return NextResponse.json(envelope);
  } catch (error) {
    console.error("❌ Match summary API error:", error);
    return NextResponse.json(
      {
        error: "Match summary failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
