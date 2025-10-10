/**
 * @file jobs_v2.ts
 * @description Rich job detail types aligned with JD spec; used by jobs APIs and pages.
 * @description JD仕様に合わせた詳細な求人タイプ。/api/jobs やページで使用。
 * @author Virginia Zhang
 * @remarks Shared types for server/client. Keep list item lightweight for jobs list.
 * @remarks サーバー/クライアント共有。求人一覧は軽量なリスト型を使用。
 */

/**
 * @description Rich job detail schema for detail pages and APIs
 * @description 詳細ページとAPIで使用するリッチな求人スキーマ
 */
export interface JobDetailV2 {
  /**
   * 基本情報（一覧と共通）/ Basic information (shared with list view)
   */
  id: string; // 求人ID / Job ID
  title: string; // 求人タイトル / Job title
  company: string; // 会社名 / Company name
  category?: string; // 求人カテゴリ（例：Frontend Engineer, Backend Engineer） / Job category
  location: string; // 勤務地 / Location
  tags: string[]; // タグ（表示用） / Tags for display
  postedAt: string; // 投稿日時（ISO形式） / Posted date (ISO format)
  logoUrl: string; // 会社ロゴURL / Company logo URL

  /**
   * 雇用・働き方 / Employment and work style
   */
  salary?: string; // 年収範囲 / Salary range
  employmentType?: string; // 雇用形態（正社員、契約社員など） / Employment type
  interviewType?: string; // 面接形態（オンライン、対面など） / Interview type
  remotePolicy?: { // リモートワークポリシー / Remote work policy
    fromOverseas: boolean; // 海外からのリモート可否 / Remote work allowed from overseas
    fromJapan: boolean; // 国内からのリモート可否 / Remote work allowed from Japan
  };
  languageRequirements: { // 言語要件（日本語・英語レベル） / Language requirements
    ja: string; // 日本語要件（N1, N2+, N3+, Greetings/None） / Japanese requirement
    en: string; // 英語要件（Business, Daily Conversation, Greetings/None） / English requirement
  };
  recruitFromOverseas: boolean; // 海外在住者の採用可否 / Recruitment from overseas allowed

  /**
   * 説明 / Description
   */
  description: {
    whoWeAre?: string; // 会社について / About the company
    products?: string; // 製品・サービス / Products and services
    productIntro?: string; // 製品紹介 / Product introduction
    responsibilities: string[]; // 職務内容 / Responsibilities
  };

  /**
   * 開発情報 / Development information
   */
  devInfo?: {
    frontEnd?: { // フロントエンド技術 / Frontend technologies
      languages?: string[]; // 使用言語 / Programming languages
      frameworks?: string[]; // フレームワーク / Frameworks
    };
    backEnd?: { // バックエンド技術 / Backend technologies
      languages?: string[]; // 使用言語 / Programming languages
      frameworks?: string[]; // フレームワーク / Frameworks
    };
    database?: string[]; // データベース / Databases
    infra?: { // インフラ / Infrastructure
      cloud?: string[]; // クラウドサービス / Cloud services
      containers?: string[]; // コンテナ技術 / Container technologies
      monitoring?: string[]; // 監視ツール / Monitoring tools
    };
    tools?: { // 開発ツール / Development tools
      repository?: string[]; // リポジトリ管理 / Repository management
      documentation?: string[]; // ドキュメント管理 / Documentation
      communication?: string[]; // コミュニケーション / Communication
      taskManagement?: string[]; // タスク管理 / Task management
    };
    methodology?: string; // 開発手法（Scrum, Kanbanなど） / Development methodology
  };

  /**
   * 応募要件 / Requirements
   */
  requirements: {
    must: string[]; // 必須要件 / Must-have requirements
    want?: string[]; // 歓迎要件 / Nice-to-have requirements
  };

  /**
   * 求める人物像 / Ideal candidate profile
   */
  candidateRequirements?: string[];

  /**
   * 勤務条件 / Working conditions
   */
  workingConditions?: {
    workingLocation?: string; // 勤務地詳細 / Detailed working location
    access?: string[]; // アクセス / Access
    workingHours?: string; // 勤務時間 / Working hours
    workSystem?: string; // 勤務制度（フレックス、裁量労働制など） / Work system
    probation?: string; // 試用期間 / Probation period
    benefits?: string[]; // 福利厚生 / Benefits
    remoteNote?: string; // リモートワーク補足 / Remote work notes
  };

  /**
   * ポートフォリオ提出 / Portfolio submission
   */
  portfolioNote?: string[];

  /**
   * 選考プロセス / Selection process
   */
  selectionProcess?: string[];
}
