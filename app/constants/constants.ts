/**
 * @file constants.ts
 * @description Centralized app constants and their types (routes, storage keys, product names, API paths, etc.).
 * @description ルート・ストレージキー・製品名・API パスなど、アプリ共通の定数と型を集約します。
 * @author Virginia Zhang
 * @remarks Co-locate constant values with lightweight types for maintainability.
 * @remarks メンテ性のため、軽量な型と値を同居させます。
 */

// ---------- Branding / Product ----------
export const PRODUCT_NAME_EN = "MatchPro for Dev" as const;
export const PRODUCT_NAME_JA = "マッチプロ for Dev" as const;
export const PRODUCT_MARK = "MatchPro for Dev™" as const;

/**
 * Union of product-facing labels.
 * 製品表示用ラベルのユニオン。
 */
export type ProductLabel =
  | typeof PRODUCT_NAME_EN
  | typeof PRODUCT_NAME_JA
  | typeof PRODUCT_MARK;

// ---------- Routes ----------
export const ROUTE_UPLOAD = "/upload" as const;
export const ROUTE_JOBS = "/jobs" as const;

export const API_RESUME = "/api/resume" as const;
export const API_RESUME_TEXT = "/api/resume-text" as const;
export const API_MATCH_SUMMARY = "/api/match/summary" as const;
export const API_MATCH_DETAILS = "/api/match/details" as const;

/**
 * API route path union.
 * API ルートのユニオン。
 */
export type ApiPath =
  | typeof API_RESUME
  | typeof API_RESUME_TEXT
  | typeof API_MATCH_SUMMARY
  | typeof API_MATCH_DETAILS;

// ---------- Storage Keys ----------
export const STORAGE_RESUME_POINTER_KEY = "resume:current" as const;
/**
 * Pointer to the latest uploaded resume in local storage.
 * 最新のアップロード履歴書を示すローカルストレージのポインタ。
 */
export interface ResumePointer {
  resumeId: string;
  savedAt: string; // ISO string / ISO 文字列
}

// ---------- S3 Key Helpers ----------
export const S3_RESUME_PREFIX = "resume/" as const;
export const S3_RESUME_SUFFIX = ".txt" as const;

/**
 * Build S3 key for a resume id.
 * 履歴書IDからS3キーを生成します。
 *
 * @param resumeId Resume identifier | 履歴書ID
 * @returns S3 object key | S3 オブジェクトキー
 */
export function buildResumeKey(resumeId: string): string {
  return `${S3_RESUME_PREFIX}${resumeId}${S3_RESUME_SUFFIX}`;
}

// ---------- Assets ----------
export const ASSET_LOGO_LIGHT = "/match_pro_dev_logo.webp" as const;
export const ASSET_LOGO_DARK = "/match_pro_dev_logo_dark.webp" as const;
/**
 * Hero animation SVG path.
 * ヒーローアニメーション SVG パス。
 */
export const ASSET_HERO_ANIMATION = "/animations/hero_animation.svg" as const;
export const ICON_GITHUB_LIGHT = "/icons/github.svg" as const;
export const ICON_GITHUB_DARK = "/icons/github-dark.svg" as const;
export const ICON_MAIL_LIGHT = "/icons/mail.svg" as const;
export const ICON_MAIL_DARK = "/icons/mail-dark.svg" as const;

// ---------- Feature Cards ----------
/**
 * Feature card content model.
 * 機能カードの内容モデル。
 */
export interface FeatureCard {
  title: string;
  desc: string;
  icon: string; // emoji kept for lightweight visuals
}

export const FEATURE_CARDS: ReadonlyArray<FeatureCard> = [
  {
    title: "外国人開発者特化プラットフォーム",
    desc: "外国人IT開発職に特化。掲載求人はエンジニア職のみ。評価軸と用語は開発者基準。",
    icon: "💻",
  },
  {
    title: "レジュメ解析と正規化",
    desc: "PDFから経験・スキルを抽出し、評価に適した形へ正規化。",
    icon: "🧩",
  },
  {
    title: "マッチ度スコア（総合＋5指標）",
    desc: "求人要件との一致度を総合スコアと5つの指標で定量評価。",
    icon: "📊",
  },
  {
    title: "可視化インサイト",
    desc: "指標内訳やハイライトをグラフで直感的に把握。",
    icon: "📈",
  },
  {
    title: "サマリー生成",
    desc: "結果の背景と要点を簡潔に要約して提示。",
    icon: "📝",
  },
  {
    title: "強み／弱みと面接対策",
    desc: "ポジションに対する強み・弱みを明確化し、具体的な面接準備ポイントを提案。",
    icon: "🎯",
  },
] as const;

// ---------- Misc Labels ----------
export const CTA_UPLOAD_JA = "レジュメをアップロード／再アップロード" as const;
export const CTA_UPLOADED_JA = "レジュメはアップロード済み？" as const;
export const VP_JA =
  "外国人IT開発者の転職を加速。職務との適合度・強み弱み・面接対策をすばやく把握。" as const;
export const VP_EN =
  "Supercharge your IT career move with instant job-match analysis and interview tips." as const;

// ---------- Attribution ----------
/**
 * Attribution text for Storyset illustrations.
 * Storyset イラストのクレジット文。
 */
export const ATTRIBUTION_STORYSET_TEXT =
  "© Business illustrations by Storyset" as const;
/**
 * Attribution URL for Storyset Business illustrations page.
 * Storyset Business イラストの URL。
 */
export const ATTRIBUTION_STORYSET_URL =
  "https://storyset.com/business" as const;

/**
 * Route path union used in navigation.
 * ナビゲーションで使用するルートパスのユニオン。
 */
export type RoutePath = typeof ROUTE_UPLOAD | typeof ROUTE_JOBS;
/**
 * Asset path union used in UI.
 * UI で使用するアセットパスのユニオン。
 */
export type AssetPath =
  | typeof ASSET_LOGO_LIGHT
  | typeof ASSET_LOGO_DARK
  | typeof ASSET_HERO_ANIMATION
  | typeof ICON_GITHUB_LIGHT
  | typeof ICON_GITHUB_DARK
  | typeof ICON_MAIL_LIGHT
  | typeof ICON_MAIL_DARK;
