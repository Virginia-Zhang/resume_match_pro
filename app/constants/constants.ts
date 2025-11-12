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
export const API_MATCH = "/api/match" as const;
export const API_MATCH_SUMMARY = `${API_MATCH}?type=summary` as const;
export const API_MATCH_DETAILS = `${API_MATCH}?type=details` as const;
export const API_MATCH_BATCH = `${API_MATCH}/batch` as const;
export const API_JOBS = "/api/jobs" as const;

/**
 * API route path union.
 * API ルートのユニオン。
 */
export type ApiPath =
  | typeof API_RESUME
  | typeof API_RESUME_TEXT
  | typeof API_MATCH_SUMMARY
  | typeof API_MATCH_DETAILS
  | typeof API_MATCH_BATCH
  | typeof API_JOBS;

// ---------- AI Matching Configuration ----------
/**
 * Number of jobs per batch for AI matching.
 * AI マッチングのバッチあたりの求人数。
 */
export const BATCH_SIZE = 3 as const;

/**
 * Maximum retry attempts for failed batch matching requests.
 * 失敗したバッチマッチングリクエストの最大再試行回数。
 */
export const MAX_BATCH_RETRIES = 1 as const;

// ---------- Storage Keys ----------
export const STORAGE_RESUME_POINTER_KEY = "resume:current" as const;
/**
 * Pointer to the latest uploaded resume in local storage.
 * 最新のアップロードレジュメを示すローカルストレージのポインタ。
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
 * レジュメIDからS3キーを生成します。
 *
 * @param resumeId Resume identifier | レジュメID
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

// ---------- Upload Page ----------
export const CTA_UPLOAD_JA = "レジュメをアップロード／再アップロード" as const;
export const CTA_UPLOADED_JA = "レジュメはアップロード済み？" as const;

export const UPLOAD_FEATURES = [
  {
    icon: "/upload/job_hunting.svg",
    title: "無料で使える転職サポート",
    body: "開発系かつ外国人歓迎の求人を厳選。登録不要ですぐに利用でき、理想の仕事へワンクリックで近づけます。",
  },
  {
    icon: "/upload/safety.svg",
    title: "セキュリティ重視",
    body: "レジュメは安全なクラウドサービス（Amazon S3）に保管され、第三者がアクセスすることはありません。マッチング分析と応募以外には利用しません。",
  },
  {
    icon: "/upload/devices.svg",
    title: "どのデバイスでも快適",
    body: "レスポンシブ設計で PC でもスマホでも快適。レジュメのアップロードから応募まで、いつでもどこでも進められます。",
  },
] as const;

export const UPLOAD_STEPS = [
  "レジュメの PDF をファイル選択ダイアログから選ぶか、このページのアップロード領域へドラッグ＆ドロップしてください。",
  "アップロード後に『PDFを解析』をクリックして解析を開始します。成功するとテキストは下の入力欄に表示されます（画像などは対象外です）。",
  "アップロードや解析に失敗した場合は、レジュメのテキストをそのまま下の入力欄に貼り付けてご利用いただけます。",
  "準備ができたら『求人一覧へ進む』をクリック。気になる求人の詳細ページで、AI がレジュメと求人情報をもとにマッチ度、強み・弱み、面接対策を提示します。",
] as const;

export const UPLOAD_TEXTAREA_GUIDELINES = [
  "アップロードや解析に失敗した場合は、ここにレジュメのテキストを貼り付けてご利用ください。",
  "解析はテキストのみを対象とし、画像などの非テキスト要素は含まれません。",
  "解析結果は AI 分析を主目的とした素のテキストであり、再レイアウトは行いません。",
  "以前にレジュメをアップロード、保存済みの場合、その解析テキストが自動的に表示されます。",
] as const;

export const UPLOAD_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const UPLOAD_FILE_SIZE_ERROR_JA =
  "アップロードされたファイルがサイズ制限（5MB）を超えています。5MB 以下の PDF を選択してください。" as const;

// ---------- Supabase Error Codes ----------
/**
 * PostgREST error code for "no rows returned" (when using .single()).
 * PostgREST の「行が返されない」エラーコード（.single() 使用時）。
 * @remarks This is returned when a query with .single() finds no matching rows.
 * @remarks .single() を使用したクエリで一致する行が見つからない場合に返される。
 */
export const SUPABASE_ERROR_NO_ROWS = "PGRST116" as const;

/**
 * PostgreSQL error code for unique constraint violation.
 * PostgreSQL の一意制約違反エラーコード。
 * @remarks This is returned when an insert/update violates a unique constraint (e.g., duplicate key).
 * @remarks 挿入/更新が一意制約に違反した場合（例：重複キー）に返される。
 */
export const SUPABASE_ERROR_UNIQUE_CONSTRAINT = "23505" as const;

