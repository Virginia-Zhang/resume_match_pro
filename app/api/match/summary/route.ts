/**
 * @file route.ts
 * @description Match summary API: resolves overall score, five-dimension scores, and overview with S3 cache.
 * @description マッチ要約API：総合スコア、5次元スコア、概要をS3キャッシュ付きで返す。
 * @author Virginia Zhang
 * @remarks Server route. Accepts { resumeId, jobId, job_description, phase? } or { resume_text, ... }.
 * @remarks サーバールート。{ resumeId, jobId, job_description, phase? } または { resume_text, ... } を受け付ける。
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

type Phase = "summary" | "details";

interface DifyRequestBody {
  inputs: {
    resume_text: string;
    job_description: string;
    phase: string;
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
  overview: string;
}

interface Envelope {
  meta: {
    jobId: string;
    phase: Phase;
    resumeHash: string;
    source: "cache" | "dify";
    timestamp: string;
    version: "v1";
  };
  data: SummaryData;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as Partial<DifyRequestBody>;

    const jobId = (body.jobId || "").toString();
    const jobDesc = (body.inputs?.job_description || "").toString();
    const phase: Phase = (body.inputs?.phase as Phase) || "summary";
    if (!jobId || !jobDesc) {
      return NextResponse.json(
        { error: "Missing jobId or job_description" },
        { status: 400 }
      );
    }

    let resumeText: string | null = null;
    let resumeHash: string | undefined = body.resumeHash as string | undefined;

    if (body.inputs?.resume_text) {
      resumeText = body.inputs.resume_text.toString();
      resumeHash = await sha256Hex(resumeText);
    } else if (body.resumeId) {
      // Try S3 if configured, otherwise require resume_text in request body
      // S3が設定されている場合はS3から取得、そうでなければリクエストボディのresume_textが必要
      if (isS3Configured()) {
        resumeText = await getText(resumeKey(body.resumeId.toString()));
        if (!resumeText) {
          return NextResponse.json(
            { error: "Resume not found in S3" },
            { status: 404 }
          );
        }
        resumeHash = await sha256Hex(resumeText);
      } else {
        // Development mode: require resume_text in request body
        // 開発モード：リクエストボディにresume_textが必要
        return NextResponse.json(
          {
            error:
              "In development mode, resume_text must be provided in request body",
          },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Missing resumeId or resume_text" },
        { status: 400 }
      );
    }

    // 必须提供 Dify 配置
    // Dify 設定は必須
    const difyUrl = process.env.DIFY_WORKFLOW_URL || "";
    const apiKey = process.env.DIFY_API_KEY || "";
    if (!difyUrl || !apiKey) {
      return NextResponse.json({ error: "Missing Dify env" }, { status: 500 });
    }

    // 检查缓存（生产环境）
    // キャッシュをチェック（本番環境）
    const key = cacheKey(jobId, phase, resumeHash);
    if (isS3Configured()) {
      const cached = await getJson<Envelope>(key);
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    // Call Dify Workflow (non-streaming)
    // Difyワークフローを呼び出す（非ストリーミング）
    console.log("🚀 Calling Dify API for summary analysis...");

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
          phase: "summary",
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

    // overview text
    const overview =
      ((outputs as { overview?: unknown }).overview as string) ||
      ((outputs as { summary?: unknown }).summary as string) ||
      "";

    const data: SummaryData = { overall, scores, overview };

    const envelope: Envelope = {
      meta: {
        jobId,
        phase: "summary",
        resumeHash,
        source: "dify",
        timestamp: new Date().toISOString(),
        version: "v1",
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
