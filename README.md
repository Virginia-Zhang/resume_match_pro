  日本語 / [English README](./README.en.md)

## プロジェクト概要

ResumeMatch Pro は、**日本での就職を目指す海外エンジニア（外国人開発者）向け**の Web アプリケーションです。候補者が自分のレジュメ（履歴書）をアップロードすると、日本のエンジニア求人と自動的にマッチングし、応募や企業への問い合わせまでを一気通貫でサポートすることを目指しています。  
このリポジトリは、Next.js（App Router）をベースに、TanStack Query、Zustand、nuqs、Zod、Supabase、AWS S3、Resend などのモダンなフロントエンド / フルスタック技術を組み合わせた、**ポートフォリオ集の一環**です。

**重要: 現在の開発状況**  
このプロジェクトは **現在開発中** です。本 README に記載されている一部の機能は、設計済みまたは実装途中であり、まだ本番レベルではありません。実装が完了していない機能には、機能一覧で **`(開発中 / in progress)`** と明記しています。

---

## 想定ユーザー & ユースケース

このサービスは主に次のようなユーザーを想定しています。

- **海外エンジニア / 外国人開発者**
  - 日本でエンジニアとして就職・転職したい
  - 自分のレジュメとマッチする求人を素早く見つけたい
  - 日本語にまだ慣れていなくても、分かりやすい UI で応募まで進みたい
- **日本企業（採用担当者）**
  - 自社のエンジニア求人を掲載したい **(開発中 / in progress)**
  - AI マッチングを活用して、海外エンジニアを効率的に採用したい **(開発中 / in progress)**

---

## 機能一覧（ユーザー視点）

### 候補者向け機能

- **レジュメアップロード & 管理**（PDF レジュメをアップロードし、ローカルに状態を保持）
  - Zustand + `persist` ミドルウェアによるクライアント状態管理 **(開発中 / in progress)**  
  - レジュメのポインタ情報（ID やストレージキー、タイムスタンプなど）のみを localStorage に保持し、実際のメタデータは Supabase、ファイル本体は AWS S3 に保存
- **求人マッチング機能（バッチマッチング）**
  - アップロードしたレジュメと求人情報をまとめてマッチング  
  - マッチスコアの算出と、関連するスキル・条件のハイライト表示
  - 段階的に結果が更新される UI（進捗バー等）
- **求人一覧ページ & 詳細ページ（SSG + SEO 対応）**   
  - Next.js App Router による一覧 / 詳細表示  
  - SSG（Static Site Generation）による高速表示  
  - title / description / Open Graph などのメタデータ設定 **(開発中 / in progress)**
- **求人フィルタ & 検索（nuqs による URL 状態管理）**
  - カテゴリ、勤務地、キーワードなどで求人をフィルタ  
  - nuqs + Zod による URL クエリパラメータのスキーマ化 **(開発中 / in progress)**  
  - ブラウザの戻る / 進むに対応した URL ベースの状態管理 **(開発中 / in progress)**
- **マッチ結果のスコア表示・ハイライト** 
  - レジュメと求人の一致度をスコアリング  
  - マッチしているスキルや経験を UI 上でハイライト表示
- **求人への応募フロー（Apply for Job）**  **(開発中 / in progress)**
  - 求人詳細ページから応募モーダルを開き、応募者情報を入力 
  - Zod + React Hook Form によるフォームバリデーション 
  - 応募内容とレジュメを紐づけて Supabase に保存  
  - Resend + React Email による応募完了メール送信（応募者 & 企業  
  - AWS S3 上のレジュメファイルへの期限付きアクセス URL（プリサインド URL

### 企業向け機能　**(開発中 / in progress)**  

- **企業向けランディングページ「求人掲載について」** 
  - 企業向けの価値提案・利用フロー・料金イメージの説明  
  - 日本語での分かりやすいコピーと CTA ボタン
- **求人掲載・問い合わせフォーム（Post a Job）**  
  - 会社名、担当者名、メール、電話、会社規模、業界、掲載予定職種数、予算感、お問い合わせ内容などの入力  
  - Zod + React Hook Form による厳密なバリデーション  
  - Supabase への問い合わせ保存
- **企業向けメール通知**  
  - 企業からの問い合わせ内容をオーナー宛にメール送信  
  - 企業向け自動返信メール（受付完了、今後の流れ）

### 共通 UX 機能

- レスポンシブデザイン（スマホ / タブレット / PC 対応）
- ローディングインジケータやスケルトンスクリーンによる滑らかな読み込み体験
- エラー表示と再試行ボタンなど、分かりやすい失敗時の UX

---

## 技術スタック

- **フレームワーク**
  - Next.js (App Router, React Server Components, Route Handlers)
  - TypeScript（strict モードを想定）
- **状態管理**
  - TanStack Query：サーバー状態・データフェッチ・キャッシュ管理 **(開発中 / in progress)**
  - Zustand：レジュメなどのクライアントグローバル状態管理 **(開発中 / in progress)**
  - nuqs：URL ベースの状態管理（フィルタやページング）**(開発中 / in progress)**
- **バリデーション & スキーマ**
  - Zod：API リクエスト / レスポンス、フォーム、URL クエリ、環境変数のスキーマ定義 **(開発中 / in progress)**
- **バックエンド & データストア**
  - Supabase：求人 / 応募 / マッチング結果の管理
  - AWS S3：レジュメファイルおよび求人画像の保存（レジュメはプリサインド URL による一時的アクセス）
- **メール & 通知**
  - Resend + React Email：応募通知メール・確認メールの送信 **(開発中 / in progress)**
- **テスト & 品質**
  - Jest：ユニットテスト / 統合テスト **(開発中 / in progress)**
  - React Testing Library（RTL）：コンポーネントテスト **(開発中 / in progress)**
  - MSW（Mock Service Worker）：API モック **(開発中 / in progress)**
  - ESLint + Prettier：コード品質とフォーマット 
  - **テストカバレッジ目標：70%以上**（Statements / Branches / Functions / Lines ベース）
- **CI/CD & デプロイ**
  - GitHub Actions：Lint, Type Check, Test, Build の自動実行 **(開発中 / in progress)**
  - AWS Amplify：本番環境デプロイ先として利用予定 **(開発中 / in progress)**

---

## アーキテクチャ概要

- **フロントエンド**
  - Next.js App Router ベースの構成（`app/` ディレクトリ）
  - Server Components と Client Components を使い分け、データ取得や SEO を最適化
- **API レイヤー**
  - Next.js Route Handlers (`app/api/**/route.ts`) による REST 風 API
  - すべてのリクエスト / レスポンスを Zod で検証し、型安全性とエラー整形を行う
- **データアクセス**
  - `lib/db/**` に Supabase への型安全なクエリ関数を配置 
  - Zod で DB からのレスポンスを検証してからフロントに渡す
- **状態管理レイヤー**
  - TanStack Query でサーバーサイドのデータ取得・キャッシュ 
  - Zustand でクライアント側のグローバル状態（レジュメなど）を管理 
  - nuqs で URL を単一の「真実のソース」として扱うフィルタ状態管理

---

## 品質とテスト

- **テスト戦略**
  - Hooks テスト（例：`useBatchMatching`, Query Hooks）  
  - 主要コンポーネントテスト（求人一覧、フィルタ、応募モーダルなど）  
  - ユニットテスト + 軽い統合テスト
  - エンドツーエンドテスト（Playwright）で主要なユーザーフロー（レジュメアップロード → マッチング → 応募など）を検証
- **テストカバレッジ**
  - 目標: **70%以上**
  - Jest のカバレッジ機能（Istanbul ベース）を利用予定
  - 例: `pnpm test -- --coverage` あるいは専用スクリプト `pnpm test:coverage` を定義 **(開発中 / in progress)**
- **CI 連携**
  - GitHub Actions 上で Lint / Type Check / Test / Build を自動実行し、プルリクエスト時に品質を確認

---

## パフォーマンス & SEO

- **パフォーマンス最適化** **(開発中 / in progress)**
  - `@next/bundle-analyzer` によるバンドルサイズ分析  
  - 動的インポート・コード分割・遅延ロードの活用  
  - `next/image` と `next/font` による画像・フォント最適化  
- **SEO 対応** **(開発中 / in progress)**
  - SSG（Static Site Generation）を活用した高速で SEO フレンドリーなページ  
  - 適切な `<title>` / `<meta name="description">` / Open Graph メタタグ  
  - `sitemap.xml` や `robots.txt` の提供

---

## セットアップ & 起動方法

### 前提条件

- Node.js（推奨: Node.js 20 LTS バージョン）
- pnpm（推奨） / npm / yarn のいずれか

### インストール

```bash
pnpm install
```

### 開発サーバーの起動

```bash
pnpm dev
```

ブラウザで `http://localhost:3000` を開くと、アプリケーションを確認できます。

### 代表的な pnpm スクリプト（予定を含む）

- `pnpm dev` : 開発サーバーを起動
- `pnpm build` : 本番ビルド 
- `pnpm start` : 本番ビルドの起動 
- `pnpm lint` : ESLint による静的解析 
- `pnpm test` : Jest + React Testing Library によるテスト実行 
- `pnpm test:coverage` : カバレッジ付きテスト実行 

### 環境変数（例）

以下は想定される環境変数の一例です。実際のキー名・内容は開発の進行に応じて調整されます。

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`（必要に応じて）
- `AWS_REGION`
- `AWS_S3_BUCKET`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_SITE_URL`

---

## プロジェクト構成

```text
app/
  layout.tsx            # 全ページ共通レイアウト
  page.tsx              # ホーム / トップページ
  not-found.tsx         # 404 ページ
  globals.css           # グローバルスタイル
  constants/
    constants.ts        # アプリ全体で使う定数
  upload/
    page.tsx            # レジュメアップロードページ
  jobs/
    page.tsx            # 求人一覧ページ
    JobsListClient.tsx  # クライアント側の求人一覧コンポーネント
    [id]/
      page.tsx          # 求人詳細ページ
      charts.tsx        # 求人詳細のチャート表示
      JobDetailClient.tsx # 求人詳細のクライアントコンポーネント
  api/                  # Route Handlers ベースの API 群
    jobs/
      route.ts          # 求人一覧 API
      [id]/
        route.ts        # 求人詳細 API
    job-categories/
      route.ts          # 求人カテゴリ API
    match/
      route.ts          # マッチング API（単発）
      batch/
        route.ts        # バッチマッチング API
    parse/
      route.ts          # レジュメ解析 API
    resume/
      route.ts          # レジュメメタデータ保存 API
    resume-text/
      route.ts          # レジュメテキスト取得 API

components/
  common/               # 共通 UI コンポーネント
    SiteHeader.tsx
    PageFrame.tsx
    BrandBar.tsx
    Breadcrumbs.tsx
    ErrorDisplay.tsx
    buttons/
      BackButton.tsx
      CtaButtons.tsx
  home/                 # ホームページ専用コンポーネント
    HomepageActions.tsx
    FeatureCard.tsx
    TypewriterText.tsx
  jobs/                 # 求人関連コンポーネント
    JobItem.tsx
    JobFilters.tsx
  guards/
    ResumeGate.tsx      # レジュメ必須ガード
  providers/
    query-provider.tsx  # TanStack Query プロバイダ
    theme-provider.tsx  # テーマ（ダーク / ライト）プロバイダ
  skeleton/             # スケルトンローディング用コンポーネント
    JobDetailSkeleton.tsx
    MatchResultSkeleton.tsx
    ChartsSummarySkeleton.tsx
    ChartsDetailsSkeleton.tsx
  ui/                   # shadcn/ui ベースの低レベル UI コンポーネント
    button.tsx
    card.tsx
    dialog.tsx
    select.tsx
    progress.tsx
    skeleton.tsx
    ...                 # そのほか UI パーツ

hooks/
  queries/              # TanStack Query 用カスタムフック
    useJobs.ts
    useMatch.ts
    useResume.ts
  useBatchMatching.ts   # バッチマッチングロジック用フック
  useMatchData.ts       # マッチ結果データの保持・取得用フック

lib/
  api/                  # フロントエンド用 API クライアント
    jobs.ts
    match.ts
    resume.ts
    helpers.ts
    types.ts
  supabase/
    client.ts           # ブラウザ用 Supabase クライアント
    server.ts           # サーバーサイド用 Supabase クライアント
  react-query/
    get-query-client.ts # QueryClient の生成
    query-keys.ts       # Query Key の集中定義
  s3.ts                 # AWS S3 との連携ヘルパー
  jobs.ts               # 求人データ変換・ユーティリティ
  storage.ts            # ブラウザストレージ（localStorage 等）ユーティリティ
  errorHandling.ts      # エラーハンドリング共通処理
  runtime-config.ts     # ランタイム設定
  utils.ts              # 汎用ユーティリティ

types/
  jobs_v2.ts            # 求人データ型定義
  matching.ts           # マッチング関連の型定義
  pdf-parse.d.ts        # PDF パース用型定義

store/
  resume.ts             # レジュメ状態管理（Zustand）(開発中)

public/
  upload/               # アップロードページ用イラスト・画像
  animations/           # アニメーション用 SVG
  icons/                # アイコン類
  ...                   # ロゴや背景画像など

tests/                  # Jest + RTL + MSW テストコード (開発中)
```

---

## デプロイ

- 本プロジェクトは **AWS Amplify** でのデプロイを前提としています
- GitHub Actions で Lint / Type Check / Test / Build を実行し、すべて成功した場合のみ AWS Amplify でデプロイする CI/CD パイプラインを構成する予定です。

---

## 貢献 & ライセンス

- 現時点では主にポートフォリオとして開発中です。今後、外部からのコントリビュートを受け付ける段階になったら `CONTRIBUTING.md` を追加する予定です。  
- ライセンスは暫定的に **MIT License** を想定しています。実際の公開時には `LICENSE` ファイルを追加します。


