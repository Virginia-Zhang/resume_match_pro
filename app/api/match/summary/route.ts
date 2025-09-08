/**
 * @file route.ts
 * @description Match summary API: resolves overall score, five-dimension scores, and overview with S3 cache.
 * @description マッチ要約API：総合スコア、5次元スコア、概要をS3キャッシュ付きで返す。
 * @author Virginia Zhang
 * @remarks Server route. Accepts { resumeId, jobId, job_description, phase? } or { resume_text, ... }.
 * @remarks サーバールート。{ resumeId, jobId, job_description, phase? } または { resume_text, ... } を受け付ける。
 */

import { NextRequest, NextResponse } from "next/server";
import { cacheKey, getJson, putJson, getText, resumeKey } from "@/lib/s3";
import { sha256Hex } from "@/lib/hash";

type Phase = "summary" | "details";

interface BodyA {
  resumeId: string;
  resumeHash?: string;
  jobId: string;
  job_description: string;
  phase?: Phase; // default "summary"
}

interface BodyB {
  resume_text: string;
  jobId: string;
  job_description: string;
  phase?: Phase; // default "summary"
}

interface SummaryData {
  overall: number;
  scores: number[] | Record<string, number>;
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
    const body = (await req.json()) as Partial<BodyA & BodyB>;

    const jobId = (body.jobId || "").toString();
    const jobDesc = (body.job_description || "").toString();
    const phase: Phase = (body.phase as Phase) || "summary";
    if (!jobId || !jobDesc) {
      return NextResponse.json(
        { error: "Missing jobId or job_description" },
        { status: 400 }
      );
    }

    let resumeText: string | null = null;
    let resumeHash: string | undefined = body.resumeHash as string | undefined;

    if ("resume_text" in body && body.resume_text) {
      resumeText = body.resume_text.toString();
      resumeHash = await sha256Hex(resumeText);
    } else if ("resumeId" in body && body.resumeId) {
      // 开发模式：从内存中获取 mock 数据
      // 開発モード：メモリからモックデータを取得
      if (process.env.NODE_ENV === "development") {
        const globalStorage = global as typeof globalThis & {
          mockResumeStorage?: Map<string, string>;
        };
        resumeText =
          globalStorage.mockResumeStorage?.get(body.resumeId.toString()) ||
          null;
        if (!resumeText) {
          return NextResponse.json(
            { error: "Resume not found in mock storage" },
            { status: 404 }
          );
        }
        resumeHash = (body.resumeHash as string) || "mock-hash";
      } else {
        // 生产模式：从 S3 获取
        // 本番モード：S3から取得
        resumeText = await getText(resumeKey(body.resumeId.toString()));
        if (!resumeText)
          return NextResponse.json(
            { error: "Resume not found" },
            { status: 404 }
          );
        resumeHash = await sha256Hex(resumeText);
      }
    } else {
      return NextResponse.json(
        { error: "Missing resumeId or resume_text" },
        { status: 400 }
      );
    }

    // 本地测试：返回模拟的匹配结果
    // ローカルテスト：モックのマッチ結果を返す
    if (process.env.NODE_ENV === "development") {
      const mockData: SummaryData = {
        overall: 85,
        scores: {
          技術スキル: 80,
          経験: 90,
          コミュニケーション: 75,
          問題解決能力: 85,
          チームワーク: 88,
        },
        overview:
          "この候補者は技術スキルが高く、特にフロントエンド開発経験が豊富です。チームワーク能力も評価できます。",
      };

      const envelope: Envelope = {
        meta: {
          jobId,
          phase: "summary",
          resumeHash,
          source: "dify",
          timestamp: new Date().toISOString(),
          version: "v1",
        },
        data: mockData,
      };

      return NextResponse.json(envelope);
    }

    // 生产环境：实际调用 Dify
    // 本番環境：実際にDifyを呼び出す
    const key = cacheKey(jobId, phase, resumeHash);
    const cached = await getJson<Envelope>(key);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Call Dify Workflow (non-streaming)
    // Difyワークフローを呼び出す（非ストリーミング）
    const difyUrl = process.env.DIFY_WORKFLOW_URL || "";
    const apiKey = process.env.DIFY_API_KEY || "";
    if (!difyUrl || !apiKey) {
      return NextResponse.json({ error: "Missing Dify env" }, { status: 500 });
    }

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
    // Expect payload.output as the model response already structured per your workflow
    // ワークフローに合わせて、出力は既に所定の構造を想定
    const data: SummaryData = payload?.output as SummaryData;

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

    await putJson(key, envelope);
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
