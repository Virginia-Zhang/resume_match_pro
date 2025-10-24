/**
 * @file mock.ts
 * @description 10件のIT関連職種のモックデータ（日本語）。
 * @description 10 Japanese mock job details for IT roles.
 */
import { JobDetailV2 } from "@/types/jobs_v2";

export const jobsMock: JobDetailV2[] = [
  // 1. フロントエンドエンジニア（メルカリ）
  {
    id: "fe-1",
    title: "フロントエンドエンジニア",
    company: "メルカリ",
    category: "Frontend Engineer",
    location: "東京都",
    tags: ["frontend"],
    postedAt: new Date("2025-10-01").toISOString(),
    logoUrl: "/file.svg",
    salary: "年収 600万〜1000万円",
    employmentType: "正社員",
    interviewType: "オンライン面接",
    remotePolicy: { fromOverseas: true, fromJapan: true },
    languageRequirements: { ja: "N2+", en: "Daily Conversation" },
    recruitFromOverseas: true,
    description: {
      whoWeAre:
        "私たちはフリマアプリを中心に、誰もが価値を簡単に循環させられる世界の実現を目指すプロダクトチームです。数千万ユーザーが利用する大規模サービスを支える技術力と、ユーザー体験を最優先に考えるプロダクトマインドを持ったエンジニアが集まっています。チームでは技術的な挑戦とビジネス成果の両立を重視し、継続的な学習と改善を通じて成長し続けています。",
      products:
        "Web/モバイルのコア機能から、検索、決済、CSツールまで複数の領域で継続的に改善を行っています。メルカリアプリは月間アクティブユーザー数が数千万人を超える大規模サービスで、商品検索、出品、購入、配送管理など多岐にわたる機能を提供しています。また、メルカリペイやメルカリカラーミーなど関連サービスも含め、エコシステム全体の技術基盤を支えています。",
      productIntro:
        "膨大なトラフィックを扱うSPA基盤上で、パフォーマンス最適化とアクセシビリティ向上を同時に達成するUIを提供します。Core Web Vitals の継続的な改善により、ユーザー体験の質を数値で管理し、ビジネス成果に直結する技術改善を推進しています。また、デザインシステムの運用により、一貫性のあるUI/UXを提供しながら、開発効率の向上も実現しています。",
      responsibilities: [
        "React/Next.js を用いた機能開発とSSR/SSG 最適化、LCP/INP 指標の継続改善。大規模SPAにおけるパフォーマンスボトルネックの特定と解決、バンドルサイズの最適化、コード分割戦略の実装を行います。",
        "デザインシステム運用と Storybook によるコンポーネント品質担保、UIテスト自動化の推進。再利用可能なコンポーネントの設計・実装、アクセシビリティガイドラインの遵守、ビジュアルリグレッションテストの導入・運用を担当します。",
        "バックエンド/検索基盤/分析と連携した仕様検討、データドリブンな改善提案の実行。API設計の最適化、A/Bテストの実装・分析、ユーザー行動データに基づく機能改善の提案を行います。",
        "モバイルアプリとの連携機能開発、PWA対応、オフライン機能の実装。プログレッシブウェブアプリの技術を活用し、ネイティブアプリに近い体験をWebで提供する機能の開発を担当します。",
        "セキュリティ要件の実装、脆弱性対策、プライバシー保護機能の開発。GDPR/CCPA対応、データ暗号化、認証・認可機能の強化など、セキュリティ面での技術実装を行います。",
      ],
    },
    devInfo: {
      frontEnd: {
        languages: ["TypeScript"],
        frameworks: ["React", "Next.js"],
      },
      backEnd: {
        languages: ["Go", "TypeScript"],
        frameworks: ["gRPC", "NestJS"],
      },
      database: ["MySQL", "Redis"],
      infra: {
        cloud: ["GCP", "AWS"],
        containers: ["Kubernetes", "Docker"],
        monitoring: ["Datadog", "Grafana"],
      },
      tools: {
        repository: ["GitHub"],
        documentation: ["Confluence"],
        communication: ["Slack"],
        taskManagement: ["Jira"],
      },
      methodology: "Scrum",
    },
    requirements: {
      must: [
        "大規模SPAの開発運用経験があり、パフォーマンスとアクセシビリティを指標で説明し改善を継続できること。Core Web Vitals の理解と改善実績、バンドルサイズ最適化、レンダリングパフォーマンスの向上経験が必要です。",
        "TypeScript と React の実務経験があり、設計思想や状態管理の選定理由を具体的に説明できること。関数型プログラミングの理解、カスタムフックの設計、状態管理ライブラリ（Redux、Zustand等）の適切な使い分けができることが求められます。",
        "デザインシステム運用経験があり、UI一貫性と可用性を両立したコンポーネント設計ができること。Storybook でのコンポーネント管理、アクセシビリティガイドラインの遵守、デザイントークンの活用経験が必要です。",
      ],
      want: [
        "Next.js による SSR/SSG の最適化やエッジ配信の知見があり、効果検証まで自走できること。App Router の理解、ISR の活用、エッジランタイムでの最適化、SEO 対策の実装経験があると望ましいです。",
        "E2E/ビジュアル回帰テストの自動化導入経験があり、継続的に運用改善ができること。Playwright や Cypress でのテスト実装、CI/CD パイプラインでの自動テスト実行、テスト結果の分析と改善提案ができることが望ましいです。",
        "モバイルアプリ開発経験（React Native、Flutter等）があり、クロスプラットフォーム開発の課題と解決策を理解していること。ネイティブ機能との連携、パフォーマンス最適化、アプリストア対応の経験があると望ましいです。",
      ],
    },
    candidateRequirements: [
      "ユーザー体験の改善を数値で語り、チームを巻き込みながら継続できる方。データドリブンな意思決定を行い、A/Bテストの設計・実施・分析を通じてビジネス成果に貢献できることが求められます。",
      "ドメイン知識の学習を厭わず、越境して成果にコミットできる方。フリマサービスの特性を理解し、ユーザー行動やビジネスロジックを技術的に解決する提案ができることが重要です。",
      "技術的な挑戦を楽しみ、継続的な学習と成長を重視する方。新しい技術や手法への関心が高く、チーム全体の技術力向上に貢献できることが望ましいです。",
    ],
    workingConditions: {
      workingLocation: "東京都（フルリモート可・オフィス選択制）",
      access: ["六本木駅 直結"],
      workingHours: "フレックスタイム（コアタイムなし）",
      workSystem: "裁量労働制",
      probation: "試用期間3ヶ月",
      benefits: [
        "在宅手当、語学学習支援、カンファレンス参加補助",
        "ストックオプション、企業型DC、健康診断",
      ],
      remoteNote: "国内外フルリモート可（条件あり）",
    },
    portfolioNote: ["GitHub アカウント", "登壇資料/テックブログ"],
    selectionProcess: ["書類選考", "一次面接", "最終面接"],
  },

  // 2. バックエンドエンジニア（楽天）
  {
    id: "be-1",
    title: "バックエンドエンジニア",
    company: "楽天グループ",
    category: "Backend Engineer",
    location: "東京都",
    tags: ["backend"],
    postedAt: new Date("2025-10-04").toISOString(),
    logoUrl: "/globe.svg",
    salary: "年収 650万〜1100万円",
    employmentType: "正社員",
    interviewType: "オンライン面接",
    remotePolicy: { fromOverseas: false, fromJapan: true },
    languageRequirements: { ja: "N1", en: "Business" },
    recruitFromOverseas: true,
    description: {
      whoWeAre:
        "EC/金融/通信など多事業で拡大を続けるグローバルテックカンパニーです。楽天グループは日本を代表するインターネットサービス企業として、EC、金融、通信、スポーツ、エンターテイメントなど多岐にわたる事業を展開しています。私たちのバックエンドチームは、これらの多様な事業を支える共通基盤の開発・運用を担当し、数千万ユーザーが利用する大規模システムの安定稼働を実現しています。",
      products:
        "会員基盤/決済/ポイント/広告配信を横断するバックエンド群を開発運用しています。楽天会員システム、楽天ペイ決済基盤、楽天ポイントシステム、楽天広告配信プラットフォームなど、複数のマイクロサービスが連携してエコシステム全体を支えています。また、楽天市場、楽天トラベル、楽天ブックスなどの各事業サイトが利用する共通APIの提供も重要な役割です。",
      productIntro:
        "高負荷下で可用性を維持しつつ、スループットと遅延を最適化したAPI群を継続的に提供します。楽天のサービスは24時間365日稼働が求められ、特に決済やポイント処理では高い信頼性とパフォーマンスが不可欠です。私たちは分散システムの設計原則に基づき、障害に強いアーキテクチャの構築と、リアルタイム監視による品質保証を実現しています。",
      responsibilities: [
        "REST/GraphQL API の設計・実装・運用、および認証認可の堅牢化とパフォーマンス最適化。楽天会員システムの認証基盤、OAuth 2.0/OpenID Connect の実装、API レート制限、キャッシュ戦略の設計・実装を担当します。",
        "分散トレーシング・メトリクスの可視化に基づくボトルネック特定とチューニング。Jaeger や Zipkin を使った分散トレーシング、Prometheus/Grafana によるメトリクス収集・可視化、SLO/SLI の設定・監視を行います。",
        "スキーマ進化に耐えるデータモデル設計と後方互換を考慮した移行計画の策定。PostgreSQL のスキーマ設計、マイグレーション戦略、データ整合性の保証、パフォーマンスチューニングを担当します。",
        "マイクロサービス間の通信最適化、サービスメッシュ（Istio）の運用、gRPC による高性能通信の実装。サービス間の依存関係管理、サーキットブレーカーパターンの実装、フォールトトレランスの向上を行います。",
        "セキュリティ要件の実装、脆弱性対策、コンプライアンス対応。PCI DSS 対応、データ暗号化、セキュリティ監査、ペネトレーションテストの実施・対応を担当します。",
      ],
    },
    devInfo: {
      frontEnd: {
        languages: ["TypeScript"],
        frameworks: ["Next.js"],
      },
      backEnd: {
        languages: ["Java", "Kotlin"],
        frameworks: ["Spring Boot", "gRPC"],
      },
      database: ["PostgreSQL", "Redis"],
      infra: {
        cloud: ["AWS"],
        containers: ["Kubernetes", "Docker"],
        monitoring: ["Datadog", "Prometheus"],
      },
      tools: {
        repository: ["GitHub", "GitLab"],
        documentation: ["Confluence"],
        communication: ["Slack"],
        taskManagement: ["Jira"],
      },
      methodology: "Scrum",
    },
    requirements: {
      must: [
        "マイクロサービスの設計運用経験があり、可用性・スケーラビリティ・保守性の観点で意思決定ができること。Docker/Kubernetes でのコンテナ化、サービス間通信の設計、API ゲートウェイの運用、障害時の影響範囲の最小化ができることが求められます。",
        "RDB/NoSQL の特性を理解し、インデックス設計やクエリ最適化を計画的に実施できること。PostgreSQL/MySQL のパフォーマンスチューニング、Redis/Memcached のキャッシュ戦略、データベースのスケーリング手法の実装経験が必要です。",
        "可観測性の仕組み（ログ/メトリクス/トレース）を整備し、SLO を維持運用できること。ELK Stack や Fluentd でのログ収集、Prometheus/Grafana でのメトリクス監視、Jaeger/Zipkin での分散トレーシングの実装・運用経験が求められます。",
      ],
      want: [
        "ゼロダウンタイムなマイグレーションや Blue-Green/Canary の運用経験があること。データベーススキーマの段階的移行、アプリケーションの段階的デプロイ、ロールバック戦略の実装、A/Bテストの運用経験があると望ましいです。",
        "セキュリティ要件を踏まえた API 設計や秘密情報管理のベストプラクティスに精通していること。OAuth 2.0/OpenID Connect の実装、JWT トークンの管理、API セキュリティの実装、シークレット管理システム（HashiCorp Vault等）の運用経験があると望ましいです。",
        "クラウドネイティブなアーキテクチャの設計・実装経験があること。AWS/GCP/Azure でのサービス活用、サーバーレスアーキテクチャの実装、CI/CD パイプラインの構築、Infrastructure as Code（Terraform等）の運用経験があると望ましいです。",
      ],
    },
    candidateRequirements: [
      "複数利害を調整し全体最適を図れる方。フロントエンド、バックエンド、インフラ、QA など異なる専門性を持つチームメンバーとの連携を図り、技術的な課題を解決できることが求められます。",
      "品質とデリバリーの均衡を取れる方。高い品質を維持しながら、ビジネス要求に応じた迅速な機能提供を実現できることが重要です。",
      "大規模システムの運用経験があり、障害対応やパフォーマンス改善に積極的に取り組める方。24時間365日稼働するシステムの安定性向上に貢献できることが望ましいです。",
    ],
    workingConditions: {
      workingLocation: "東京都（ハイブリッド勤務）",
      access: ["品川駅 徒歩5分", "田町駅 徒歩8分"],
      workingHours: "フレックスタイム（10:00-19:00、コアタイム11:00-15:00）",
      workSystem: "裁量労働制",
      probation: "試用期間6ヶ月",
      benefits: [
        "在宅手当、通勤手当、語学学習支援",
        "ストックオプション、企業型DC、健康診断",
        "カンファレンス参加補助、書籍購入補助",
      ],
      remoteNote: "週2-3日リモートワーク可",
    },
    selectionProcess: ["書類選考", "技術面接", "最終面接"],
  },

  // 3. DevOps エンジニア（LINEヤフー）
  {
    id: "devops-1",
    title: "DevOpsエンジニア",
    company: "LINEヤフー",
    category: "DevOps Engineer",
    location: "東京都",
    tags: ["sre/devops/infra"],
    postedAt: new Date("2025-10-05").toISOString(),
    logoUrl: "/next.svg",
    salary: "年収 650万〜1000万円",
    employmentType: "正社員",
    interviewType: "オンライン面接",
    remotePolicy: { fromOverseas: false, fromJapan: true },
    languageRequirements: { ja: "N2+", en: "Daily Conversation" },
    recruitFromOverseas: true,
    description: {
      whoWeAre:
        "巨大トラフィック環境で信頼性と提供速度を両立するための基盤開発組織です。LINEヤフーは日本最大級のメッセージングアプリ「LINE」と検索・ポータルサービス「Yahoo!」を運営し、数億ユーザーが利用する大規模システムを支えています。私たちのDevOpsチームは、これらのサービスが24時間365日安定稼働するためのインフラ基盤の設計・構築・運用を担当し、開発チームの生産性向上とサービスの高可用性実現を両立しています。",
      products:
        "CI/CD、IaC、観測性を横断してデリバリー効率を最大化しています。LINEヤフーの開発組織では、数百のマイクロサービスが連携して複雑なエコシステムを構成しており、これらのサービス群の継続的デリバリーを支えるCI/CDパイプライン、Infrastructure as Codeによるインフラ管理、包括的な監視・観測性の仕組みを提供しています。また、開発者の体験向上を重視し、デプロイからロールバック、リリース品質の可視化まで一貫した自動化を実現しています。",
      productIntro:
        "デプロイからロールバック、リリースメトリクス可視化までを一貫自動化し開発者体験を向上します。私たちはGitOpsの原則に基づき、コードの変更から本番環境への反映までを完全自動化し、人間のミスを排除しながら高速なデリバリーを実現しています。また、SLO/SLIに基づく品質管理により、リリースの品質を数値で管理し、問題の早期発見と迅速な対応を可能にしています。",
      responsibilities: [
        "モノレポ/ポリレポ混在組織での CI パイプライン最適化とキャッシュ戦略の設計。数百のリポジトリを効率的にビルド・テストするための分散ビルドシステムの構築、依存関係の最適化、並列実行による高速化を担当します。",
        "Terraform によるマルチアカウント運用の標準化と Drift 検知自動化。AWS マルチアカウント戦略の実装、Terraform モジュールの標準化、インフラの設定ドリフト検知と自動修正の仕組み構築を行います。",
        "SLO 違反の早期検知に向けたダッシュボード・アラート戦略の整備。Prometheus/Grafana を使ったメトリクス収集・可視化、アラートルールの設計、エラーバジェット管理、インシデント対応の自動化を担当します。",
        "Kubernetes クラスターの運用・最適化とセキュリティ強化。EKS クラスターの設計・構築、Pod のリソース最適化、ネットワークポリシーの実装、RBAC の設定・管理を行います。",
        "セキュリティスキャンとコンプライアンス対応の自動化。脆弱性スキャンの CI/CD パイプライン統合、セキュリティポリシーの自動検証、コンプライアンス要件の継続的監視を担当します。",
      ],
    },
    devInfo: {
      frontEnd: {
        languages: ["TypeScript"],
        frameworks: ["Next.js"],
      },
      backEnd: { languages: ["Go", "Python"], frameworks: ["gRPC", "FastAPI"] },
      database: ["MySQL", "ElastiCache"],
      infra: {
        cloud: ["AWS"],
        containers: ["EKS", "Docker"],
        monitoring: ["Datadog", "Grafana"],
      },
      tools: {
        repository: ["GitHub"],
        documentation: ["Confluence"],
        communication: ["Slack"],
        taskManagement: ["Jira"],
      },
      methodology: "Kanban",
    },
    requirements: {
      must: [
        "CI/CD パイプラインを設計から運用まで主導し、ビルド時間と失敗率の継続的削減を実現できること。Jenkins、GitHub Actions、GitLab CI などの CI/CD ツールの活用、パイプラインの最適化、テスト自動化の統合、デプロイ戦略の実装経験が必要です。",
        "Terraform 等の IaC を用いて環境差分管理を標準化し、再現可能性の高い構築ができること。Terraform、CloudFormation、Pulumi などの IaC ツールの実装、モジュール設計、状態管理、環境間の差分管理の経験が求められます。",
        "可観測性の指標を定義し、SLO/エラーバジェットによる運用品質の改善に取り組めること。Prometheus、Grafana、Jaeger などの監視ツールの活用、メトリクス設計、アラート設定、SLO/SLI の定義・運用経験が必要です。",
      ],
      want: [
        "カオスエンジニアリングや GameDay の実践経験があり、障害復旧力の継続向上を推進できること。Chaos Monkey、Litmus などのツールを使った障害注入テスト、障害対応訓練の企画・実施、復旧手順の自動化経験があると望ましいです。",
        "コスト可視化/最適化の取り組みを継続し、事業KPIと整合する改善提案ができること。AWS Cost Explorer、CloudHealth などのコスト管理ツールの活用、リソース最適化、予算管理、コスト削減提案の経験があると望ましいです。",
        "Kubernetes の運用経験があり、クラスターの設計・構築・最適化ができること。EKS、GKE、AKS などのマネージド Kubernetes サービスの活用、Helm チャートの作成・管理、オートスケーリングの設定経験があると望ましいです。",
      ],
    },
    candidateRequirements: [
      "仕組みづくりでチームを支えることに喜びを感じる方。開発チームの生産性向上を目的としたツールやプロセスの改善提案、自動化の推進、ドキュメント整備に積極的に取り組めることが求められます。",
      "大規模システムの運用経験があり、障害対応やパフォーマンス改善に積極的に取り組める方。24時間365日稼働するシステムの安定性向上、インシデント対応、パフォーマンスチューニングの経験が重要です。",
      "技術的な挑戦を楽しみ、継続的な学習と成長を重視する方。新しい技術や手法への関心が高く、チーム全体の技術力向上に貢献できることが望ましいです。",
    ],
    workingConditions: {
      workingLocation: "東京都（ハイブリッド勤務）",
      access: ["恵比寿駅 徒歩3分", "代官山駅 徒歩8分"],
      workingHours: "フレックスタイム（9:00-18:00、コアタイム10:00-16:00）",
      workSystem: "裁量労働制",
      probation: "試用期間3ヶ月",
      benefits: [
        "在宅手当、通勤手当、語学学習支援",
        "ストックオプション、企業型DC、健康診断",
        "カンファレンス参加補助、書籍購入補助",
      ],
      remoteNote: "週3-4日リモートワーク可",
    },
    selectionProcess: ["書類選考", "技術面接", "最終面接"],
  },

  // 4. QA エンジニア（DeNA）
  {
    id: "qa-1",
    title: "QAエンジニア",
    company: "DeNA",
    category: "QA Engineer",
    location: "東京都",
    tags: ["qa"],
    postedAt: new Date("2025-09-06").toISOString(),
    logoUrl: "/vercel.svg",
    salary: "年収 500万〜850万円",
    employmentType: "正社員",
    interviewType: "オンライン面接",
    remotePolicy: { fromOverseas: false, fromJapan: true },
    languageRequirements: { ja: "N3+", en: "Greetings/None" },
    recruitFromOverseas: true,
    description: {
      whoWeAre:
        "多様なサービスの品質を横断的に高め、ユーザー体験の底上げを図るQA組織です。DeNAはゲーム、モバイル、ヘルスケア、スポーツなど多岐にわたる事業を展開し、それぞれのサービスが高い品質を維持することが重要です。私たちのQAチームは、これらの多様なサービスに対して一貫した品質基準を適用し、ユーザーが安心して利用できるサービスを提供するための品質保証活動を担当しています。",
      products:
        "モバイルアプリ/ウェブサービスの品質保証と自動化を推進しています。DeNAのサービスは、モバイルゲーム、ヘルスケアアプリ、スポーツ関連サービスなど、ユーザーの生活に密着した重要なサービスが多く、これらの品質は直接的にユーザー体験に影響します。私たちは、機能テスト、パフォーマンステスト、セキュリティテスト、アクセシビリティテストなど、多角的な観点から品質を評価し、継続的な改善を推進しています。",
      productIntro:
        "探索的テストと自動化のハイブリッド戦略で、安定運用と迅速なデリバリーを両立します。私たちは、自動化テストによる効率的な回帰テストと、探索的テストによる新機能の品質検証を組み合わせることで、高い品質を維持しながら迅速なリリースを実現しています。また、品質メトリクスの可視化により、開発チーム全体で品質意識を共有し、継続的な改善サイクルを構築しています。",
      responsibilities: [
        "テスト戦略の策定とリスクベースの計画、優先度に応じた実行および結果分析。プロダクトの特性を理解し、リスクの高い機能を特定して重点的なテストを実施、テスト結果の分析と改善提案を行います。",
        "E2E/回帰テストの自動化設計とメンテナンス、失敗分析に基づく改善。Playwright、Cypress などのツールを使った自動化テストの設計・実装、テストの安定性向上、失敗時の原因分析と対策を担当します。",
        "品質メトリクスの定義と可視化、組織横断での継続的な改善サイクル推進。バグ発見率、テストカバレッジ、リリース品質などの指標を定義し、ダッシュボードで可視化、チーム全体での品質向上活動を推進します。",
        "パフォーマンステストの設計・実施とボトルネックの特定・改善提案。JMeter、k6 などのツールを使った負荷テストの実施、パフォーマンスボトルネックの特定、改善提案の作成を行います。",
        "セキュリティテストの実施と脆弱性の検証・対策提案。OWASP ZAP、Burp Suite などのツールを使ったセキュリティテストの実施、脆弱性の検証、対策の提案と検証を担当します。",
      ],
    },
    devInfo: {
      frontEnd: {
        languages: ["TypeScript"],
        frameworks: ["React"],
      },
      backEnd: {
        languages: ["Python", "TypeScript"],
        frameworks: ["FastAPI", "NestJS"],
      },
      database: ["PostgreSQL"],
      infra: {
        cloud: ["AWS"],
        containers: ["ECS", "Docker"],
        monitoring: ["Datadog", "Sentry"],
      },
      tools: {
        repository: ["GitHub"],
        documentation: ["Confluence"],
        communication: ["Slack"],
        taskManagement: ["Jira"],
      },
      methodology: "Scrum",
    },
    requirements: {
      must: [
        "Web/モバイル双方のテスト戦略を立案し、ステークホルダーと合意形成のうえで実行できること。機能テスト、UIテスト、APIテスト、パフォーマンステストなど、多角的なテスト戦略の策定と実行、テスト結果の分析と改善提案の経験が必要です。",
        "自動化フレームワーク（Playwright/Cypress 等）の選定と設計、運用改善を継続できること。テスト自動化ツールの選定・導入、フレームワークの設計・実装、テストの安定性向上、メンテナンス性の改善経験が求められます。",
        "品質メトリクスを定義し、重要指標の維持改善を再現性高く進められる実務経験があること。バグ発見率、テストカバレッジ、リリース品質などの指標の定義、ダッシュボードの構築、継続的な改善活動の推進経験が必要です。",
      ],
      want: [
        "負荷/セキュリティテストの導入経験や外部ベンダー連携を含む品質保証の実務経験があること。JMeter、k6 などの負荷テストツールの活用、OWASP ZAP などのセキュリティテストツールの使用、外部ベンダーとの連携経験があると望ましいです。",
        "PM/デザイナー/エンジニアと協働し、開発プロセス全体の品質向上をリードできること。アジャイル開発プロセスでの品質向上活動、チーム間の連携促進、品質意識の向上活動の経験があると望ましいです。",
        "探索的テストやユーザビリティテストの実施経験があること。探索的テストの手法、ユーザビリティテストの設計・実施、ユーザー体験の観点からの品質評価経験があると望ましいです。",
      ],
    },
    candidateRequirements: [
      "ユーザー視点でプロダクト価値を高める意識の高い方。ユーザーの立場に立って品質を考えることができ、ユーザー体験の向上に貢献できることが求められます。",
      "品質に対する責任感が強く、継続的な改善に取り組める方。品質問題に対して真摯に向き合い、根本原因の分析と対策の実施、再発防止の仕組みづくりに積極的に取り組めることが重要です。",
      "チームワークを重視し、多様な専門性を持つメンバーと協働できる方。開発チーム、デザインチーム、プロダクトチームなど、異なる専門性を持つメンバーとの連携を図り、品質向上に貢献できることが望ましいです。",
    ],
    workingConditions: {
      workingLocation: "東京都（ハイブリッド勤務）",
      access: ["渋谷駅 徒歩5分", "恵比寿駅 徒歩8分"],
      workingHours: "フレックスタイム（9:00-18:00、コアタイム10:00-16:00）",
      workSystem: "裁量労働制",
      probation: "試用期間3ヶ月",
      benefits: [
        "在宅手当、通勤手当、語学学習支援",
        "ストックオプション、企業型DC、健康診断",
        "カンファレンス参加補助、書籍購入補助",
      ],
      remoteNote: "週2-3日リモートワーク可",
    },
    selectionProcess: ["書類選考", "面接(複数)"],
  },

  // 5. フロントエンドエンジニア（サイボウズ）
  {
    id: "fe-2",
    title: "フロントエンドエンジニア",
    company: "サイボウズ",
    category: "Frontend Engineer",
    location: "東京都",
    tags: ["frontend"],
    postedAt: new Date("2025-09-16").toISOString(),
    logoUrl: "/window.svg",
    salary: "年収 600万〜1000万円",
    employmentType: "正社員",
    interviewType: "オンライン面接",
    remotePolicy: { fromOverseas: true, fromJapan: true },
    languageRequirements: { ja: "N2+", en: "Daily Conversation" },
    recruitFromOverseas: true,
    description: {
      whoWeAre:
        "Vue.js を中心としたモダンフロントエンド開発で、ユーザー体験の向上に取り組むチームです。サイボウズは「チームワークあふれる社会を創る」というミッションのもと、kintone、Garoon、Officeなどのコラボレーションツールを提供し、企業の働き方改革を支援しています。私たちのフロントエンドチームは、Vue.js エコシステムを活用し、直感的で使いやすいユーザーインターフェースの開発を通じて、顧客の生産性向上に貢献することを目指しています。",
      products:
        "kintone のフロントエンド機能とユーザーインターフェースの開発・改善を担当しています。サイボウズの主力プロダクトであるkintoneは、ノーコード・ローコードプラットフォームとして、企業の業務効率化とデジタル変革を支援しています。私たちは、kintoneのダッシュボード、フォームビルダー、レポート機能、モバイルアプリなど、ユーザーが直接触れる部分の開発を担当し、直感的で効率的なユーザー体験の実現に取り組んでいます。",
      productIntro:
        "Vue 3 Composition API と TypeScript を活用し、保守性とパフォーマンスを両立したコンポーネント設計を実現します。私たちは、Vue 3の最新機能であるComposition APIを活用し、再利用可能で保守性の高いコンポーネントライブラリを構築しています。また、TypeScriptによる型安全性の確保、Viteによる高速な開発環境、Piniaによる状態管理の最適化など、モダンなフロントエンド開発手法を積極的に取り入れています。",
      responsibilities: [
        "Vue 3 Composition API を用いたコンポーネント設計と実装、TypeScript による型安全な開発。Vue 3の最新機能を活用したコンポーネント設計、TypeScriptによる型定義、再利用可能なコンポーネントライブラリの構築、開発効率の向上を担当します。",
        "Vite による高速開発環境の構築と最適化、HMR の活用による開発体験向上。Viteを使った開発環境の構築・最適化、Hot Module Replacementの活用、バンドルサイズの最適化、開発効率の向上を担当します。",
        "Pinia による状態管理の設計と実装、グローバル状態の最適化。Piniaを使った状態管理の設計・実装、グローバル状態の最適化、データフローの設計、状態の永続化と同期を担当します。",
        "レスポンシブデザインとアクセシビリティの実装、WCAG 準拠のUI開発。レスポンシブデザインの実装、アクセシビリティ機能の実装、WCAG 2.1 AA準拠のUI開発、ユーザビリティの向上を担当します。",
        "E2E テストとユニットテストの実装、品質保証の自動化。Vitestを使ったユニットテストの実装、Playwrightを使ったE2Eテストの実装、テストカバレッジの向上、品質保証の自動化を担当します。",
      ],
    },
    devInfo: {
      frontEnd: {
        languages: ["TypeScript", "JavaScript"],
        frameworks: ["Vue.js", "Vite"],
      },
      backEnd: {
        languages: ["Go", "TypeScript"],
        frameworks: ["gRPC", "NestJS"],
      },
      database: ["PostgreSQL"],
      infra: {
        cloud: ["GCP", "AWS"],
        containers: ["Kubernetes", "Docker"],
        monitoring: ["Datadog"],
      },
      tools: {
        repository: ["GitHub"],
        documentation: ["Confluence"],
        communication: ["Slack"],
        taskManagement: ["Jira"],
      },
      methodology: "Scrum",
    },
    requirements: {
      must: [
        "Vue.js 3 の実務経験があり、Composition API を使ったコンポーネント設計ができること。Vue 3のComposition APIの理解、コンポーネント設計の経験、TypeScriptとの組み合わせ、再利用可能なコンポーネントの設計経験が必要です。",
        "TypeScript の実務経験があり、型安全なフロントエンド開発ができること。TypeScriptの型システムの理解、型定義の作成、型安全な開発、インターフェース設計の経験が求められます。",
        "モダンフロントエンド開発ツール（Vite、Pinia等）の使用経験があり、開発効率の向上に取り組めること。Viteを使った開発環境の構築、Piniaを使った状態管理、モダンツールの活用、開発効率の向上経験が必要です。",
      ],
      want: [
        "E2E テスト（Playwright、Cypress等）の実装経験があり、品質保証の自動化ができること。Playwright、CypressなどのE2Eテストツールの使用、テスト自動化の実装、CI/CDパイプラインでのテスト実行経験があると望ましいです。",
        "アクセシビリティ（WCAG）への理解があり、ユニバーサルデザインを考慮した開発ができること。WCAG 2.1 AA準拠の実装、アクセシビリティテストの実施、ユニバーサルデザインの理解があると望ましいです。",
        "パフォーマンス最適化の経験があり、Core Web Vitals の改善に取り組めること。バンドルサイズの最適化、レンダリングパフォーマンスの改善、Core Web Vitalsの理解、パフォーマンス監視の経験があると望ましいです。",
      ],
    },
    candidateRequirements: [
      "ユーザー体験の向上に強い関心を持ち、継続的な改善に取り組める方。ユーザーの立場に立って開発を考えることができ、ユーザー体験の向上に積極的に取り組めることが求められます。",
      "技術的な挑戦を楽しみ、新しい技術や手法への学習意欲が高い方。Vue.jsエコシステムの最新動向への関心、新しい技術の習得、チーム全体の技術力向上に貢献できることが重要です。",
      "チームワークを重視し、多様な専門性を持つメンバーと協働できる方。デザイナー、バックエンドエンジニア、プロダクトマネージャーなど異なる専門性を持つメンバーとの連携を図り、チーム全体の成果向上に貢献できることが望ましいです。",
    ],
    workingConditions: {
      workingLocation: "東京都（フルリモート可）",
      access: ["新宿駅 徒歩5分", "渋谷駅 徒歩8分"],
      workingHours: "フレックスタイム（9:00-18:00、コアタイム10:00-16:00）",
      workSystem: "裁量労働制",
      probation: "試用期間3ヶ月",
      benefits: [
        "在宅手当、通勤手当、語学学習支援",
        "ストックオプション、企業型DC、健康診断",
        "カンファレンス参加補助、書籍購入補助",
      ],
      remoteNote: "フルリモートワーク可（月1-2回出社推奨）",
    },
    selectionProcess: ["書類選考", "技術面接", "最終面接"],
  },

  // 6. フルスタックエンジニア（フロントエンド寄り）（Sansan）
  {
    id: "fullstack-1",
    title: "フルスタックエンジニア（フロントエンド寄り）",
    company: "Sansan",
    category: "Full Stack Engineer",
    location: "東京都",
    tags: ["fullstack", "frontend"],
    postedAt: new Date("2025-10-07").toISOString(),
    logoUrl: "/file.svg",
    salary: "年収 650万〜1100万円",
    employmentType: "正社員",
    interviewType: "オンライン面接",
    remotePolicy: { fromOverseas: false, fromJapan: true },
    languageRequirements: { ja: "N1", en: "Business" },
    recruitFromOverseas: false,
    description: {
      whoWeAre:
        "フロントエンドとバックエンドの両方を扱い、特にフロントエンドに重点を置いた開発で、法人向けSaaSの価値向上に取り組むチームです。Sansanは「出会いからイノベーションを生み出す」というミッションのもと、名刺管理サービス「Sansan」、請求書管理サービス「Bill One」、契約管理サービス「Contract One」など、法人向けの業務効率化SaaSを提供しています。私たちの全栈チームは、フロントエンドの技術力を活かしながら、バックエンドの理解も深く、エンドツーエンドでプロダクトの価値向上に貢献することを目指しています。",
      products:
        "名刺/コンタクト管理、請求/契約の業務SaaS群のフルスタック開発を担当しています。Sansanの主力サービスである名刺管理サービス「Sansan」は、名刺のデジタル化とコンタクト管理を効率化し、営業活動の生産性向上を支援しています。私たちは、React/Next.jsによるフロントエンド開発、Node.js/ExpressによるAPI開発、データベース設計、インフラ構築まで、プロダクト全体の技術実装を担当し、ユーザー体験とシステム性能の両方を最適化しています。",
      productIntro:
        "React/Next.js と Node.js を組み合わせ、パフォーマンスと開発効率を両立したフルスタック開発を実現します。私たちは、Next.jsのSSR/SSG機能を活用した高速なフロントエンド開発、Node.js/ExpressによるRESTful APIの構築、Prismaを使った型安全なデータベース操作、Vercel/AWSを使ったスケーラブルなインフラ構築など、モダンなフルスタック開発手法を積極的に取り入れています。また、フロントエンドの技術力を活かし、ユーザー体験の向上と開発効率の最適化を両立しています。",
      responsibilities: [
        "React/Next.js によるフロントエンド開発とSSR/SSG最適化、パフォーマンス改善。Next.jsを使ったフロントエンド開発、SSR/SSGの最適化、Core Web Vitalsの改善、バンドルサイズの最適化、ユーザー体験の向上を担当します。",
        "Node.js/Express によるAPI開発とデータベース設計、バックエンド機能の実装。Node.js/Expressを使ったRESTful APIの開発、Prismaを使ったデータベース設計・操作、認証・認可機能の実装、APIのパフォーマンス最適化を担当します。",
        "フルスタックでの機能開発とエンドツーエンドテストの実装。フロントエンドからバックエンドまで一貫した機能開発、E2Eテストの実装、APIテストの自動化、品質保証の仕組みづくりを担当します。",
        "インフラ構築とデプロイメント自動化、CI/CDパイプラインの運用。Vercel/AWSを使ったインフラ構築、GitHub Actionsを使ったCI/CDパイプラインの構築・運用、自動デプロイメントの実現、監視・ログ収集の設定を担当します。",
        "技術選定とアーキテクチャ設計、チーム内での技術共有。新しい技術の調査・選定、システムアーキテクチャの設計、技術的な意思決定、チーム内での技術共有・教育を担当します。",
      ],
    },
    devInfo: {
      frontEnd: {
        languages: ["TypeScript", "JavaScript"],
        frameworks: ["React", "Next.js"],
      },
      backEnd: {
        languages: ["Node.js", "TypeScript"],
        frameworks: ["Express", "Prisma"],
      },
      database: ["PostgreSQL", "Redis"],
      infra: {
        cloud: ["Vercel", "AWS"],
        containers: ["Docker"],
        monitoring: ["Vercel Analytics", "Sentry"],
      },
      tools: {
        repository: ["GitHub"],
        documentation: ["Notion", "Confluence"],
        communication: ["Slack"],
        taskManagement: ["Jira"],
      },
      methodology: "Scrum",
    },
    requirements: {
      must: [
        "React/Next.js の実務経験があり、SSR/SSG の最適化とパフォーマンス改善ができること。React/Next.jsでの開発経験、SSR/SSGの理解と最適化、Core Web Vitalsの改善、バンドルサイズの最適化経験が必要です。",
        "Node.js/Express の実務経験があり、RESTful API の設計・実装ができること。Node.js/ExpressでのAPI開発経験、RESTful APIの設計、データベース操作、認証・認可機能の実装経験が求められます。",
        "フルスタックでの開発経験があり、フロントエンドからバックエンドまで一貫した開発ができること。フロントエンドとバックエンドの両方での開発経験、エンドツーエンドでの機能実装、技術的な意思決定の経験が必要です。",
      ],
      want: [
        "Prisma や TypeORM などのORMの使用経験があり、型安全なデータベース操作ができること。Prisma、TypeORMなどのORMの使用、型安全なデータベース操作、マイグレーション管理、データベース設計の経験があると望ましいです。",
        "Vercel/AWS などのクラウドサービスの使用経験があり、インフラ構築ができること。Vercel、AWSなどのクラウドサービスの活用、インフラ構築、CI/CDパイプラインの構築、監視・ログ収集の設定経験があると望ましいです。",
        "E2E テスト（Playwright、Cypress等）の実装経験があり、品質保証の自動化ができること。Playwright、CypressなどのE2Eテストツールの使用、テスト自動化の実装、CI/CDパイプラインでのテスト実行経験があると望ましいです。",
      ],
    },
    candidateRequirements: [
      "フロントエンドの技術力を活かしながら、バックエンドの理解も深く、エンドツーエンドで価値を提供できる方。フロントエンドの技術力を活かし、バックエンドの理解も深く、プロダクト全体の価値向上に貢献できることが求められます。",
      "技術的な挑戦を楽しみ、新しい技術や手法への学習意欲が高い方。フルスタック開発の最新動向への関心、新しい技術の習得、チーム全体の技術力向上に貢献できることが重要です。",
      "チームワークを重視し、多様な専門性を持つメンバーと協働できる方。フロントエンドエンジニア、バックエンドエンジニア、デザイナーなど異なる専門性を持つメンバーとの連携を図り、チーム全体の成果向上に貢献できることが望ましいです。",
    ],
    workingConditions: {
      workingLocation: "東京都（ハイブリッド勤務）",
      access: ["六本木駅 徒歩3分", "乃木坂駅 徒歩5分"],
      workingHours: "フレックスタイム（9:00-18:00、コアタイム10:00-16:00）",
      workSystem: "裁量労働制",
      probation: "試用期間3ヶ月",
      benefits: [
        "在宅手当、通勤手当、語学学習支援",
        "ストックオプション、企業型DC、健康診断",
        "カンファレンス参加補助、書籍購入補助",
      ],
      remoteNote: "週2-3日リモートワーク可",
    },
    selectionProcess: ["書類選考", "技術面接", "最終面接"],
  },

  // 7. データエンジニア（SmartNews）
  {
    id: "data-1",
    title: "データエンジニア",
    company: "SmartNews",
    category: "Data Engineer",
    location: "東京都",
    tags: ["data"],
    postedAt: new Date("2025-09-05").toISOString(),
    logoUrl: "/globe.svg",
    salary: "年収 650万〜1100万円",
    employmentType: "正社員",
    interviewType: "オンライン面接",
    remotePolicy: { fromOverseas: true, fromJapan: true },
    languageRequirements: { ja: "N2+", en: "Business" },
    recruitFromOverseas: true,
    description: {
      whoWeAre:
        "世界の良質な情報を必要な人に届けるためのデータ基盤を提供しています。SmartNewsは「世界の良質な情報を必要な人に届ける」というミッションのもと、ニュースアプリ「SmartNews」を運営し、ユーザーに最適な情報を配信しています。私たちのデータエンジニアリングチームは、数千万ユーザーの行動データ、コンテンツデータ、広告データなどを効率的に処理・分析し、レコメンデーションエンジンや広告配信システムの精度向上に貢献するデータ基盤の構築・運用を担当しています。",
      products:
        "配信/レコメンド/広告の分析基盤、ETL/ストリーミング処理を運用しています。SmartNewsのデータ基盤は、ユーザーの行動データ、記事のコンテンツデータ、広告データなど、多様なデータソースからリアルタイムでデータを収集・処理し、レコメンデーションアルゴリズムの改善、広告配信の最適化、コンテンツキュレーションの精度向上に活用されています。また、データサイエンティストやプロダクトチームが迅速にデータ分析を行えるよう、セルフサービス型のデータプラットフォームを提供しています。",
      productIntro:
        "信頼性と再現性に優れたデータパイプラインを構築し、プロダクト意思決定を高速化します。私たちは、Apache Airflow、Apache Flinkなどの最新のデータ処理技術を活用し、バッチ処理とストリーミング処理を組み合わせたハイブリッドなデータパイプラインを構築しています。また、データ品質の監視、スキーマの進化管理、メタデータの管理などにより、信頼性の高いデータ基盤を維持し、プロダクトチームが迅速かつ正確な意思決定を行えるよう支援しています。",
      responsibilities: [
        "ETL/ELT 設計とメタデータ管理、スキーマ進化を見据えた耐障害性の高いジョブ設計。Apache Airflow、dbtなどのツールを使ったETL/ELTパイプラインの設計・実装、メタデータ管理、スキーマ進化への対応、障害時の自動復旧機能の実装を行います。",
        "データマート整備とパフォーマンス最適化、BI 連携による可視化の推進。BigQuery、PostgreSQLなどのデータウェアハウスでのデータマート設計・構築、クエリパフォーマンスの最適化、Tableau、LookerなどのBIツールとの連携、ダッシュボードの構築を担当します。",
        "データ品質監視/KPI 可視化、異常検知とインシデント対応の標準化。データ品質の監視・アラート設定、KPIダッシュボードの構築、異常検知システムの実装、インシデント対応プロセスの標準化と自動化を担当します。",
        "ストリーミングデータ処理の設計・実装とリアルタイム分析基盤の構築。Apache Flink、Apache Kafkaなどのストリーミング処理技術の活用、リアルタイムデータパイプラインの設計・実装、ストリーミング分析基盤の構築を行います。",
        "データガバナンスとセキュリティの実装・運用。データアクセス制御、個人情報保護、データ暗号化、監査ログの管理、コンプライアンス対応など、データガバナンスとセキュリティの実装・運用を担当します。",
      ],
    },
    devInfo: {
      frontEnd: {
        languages: ["TypeScript"],
        frameworks: ["Next.js"],
      },
      backEnd: {
        languages: ["Python", "Go"],
        frameworks: ["Airflow", "Flink"],
      },
      database: ["BigQuery", "PostgreSQL"],
      infra: {
        cloud: ["GCP"],
        containers: ["Kubernetes", "Docker"],
        monitoring: ["Grafana", "Cloud Monitoring"],
      },
      tools: {
        repository: ["GitHub"],
        documentation: ["Confluence"],
        communication: ["Slack"],
        taskManagement: ["Jira"],
      },
      methodology: "Scrum",
    },
    requirements: {
      must: [
        "ETL/ストリーミング双方の特性を理解し、スループットとレイテンシの最適点を設計できること。Apache Airflow、Apache Flink、Apache KafkaなどのETL/ストリーミング処理技術の理解、バッチ処理とストリーミング処理の特性把握、スループットとレイテンシのトレードオフを考慮した設計経験が必要です。",
        "データモデリングとマート設計に精通し、ビジネス要件から論理/物理設計へ落とし込めること。正規化・非正規化の理解、スタースキーマ・スノーフレークスキーマの設計、ビジネス要件の分析とデータモデルへの変換、論理設計から物理設計への落とし込み経験が求められます。",
        "データ品質/監視/アラートの整備を自走し、継続的に改善できる実務経験があること。データ品質の定義・測定、監視ダッシュボードの構築、アラート設定、異常検知システムの実装、継続的な改善活動の経験が必要です。",
      ],
      want: [
        "コスト/パフォーマンス最適化の継続運用経験があり、定量的に効果を説明できること。BigQuery、Redshiftなどのデータウェアハウスのコスト最適化、クエリパフォーマンスの改善、リソース使用量の最適化、定量的な効果測定と説明の経験があると望ましいです。",
        "プライバシー/セキュリティ要件を踏まえたデータ管理の設計/運用経験があること。GDPR、CCPAなどのプライバシー規制への対応、データ暗号化、アクセス制御、監査ログの管理、コンプライアンス対応の経験があると望ましいです。",
        "機械学習パイプラインの構築・運用経験があり、MLOpsの理解があること。MLflow、KubeflowなどのMLOpsツールの活用、機械学習モデルの本番環境へのデプロイ、モデルの監視・管理、A/Bテストの実施経験があると望ましいです。",
      ],
    },
    candidateRequirements: [
      "正確性と再現性を重視し、事業成果に繋げられる方。データの正確性と処理の再現性を重視し、ビジネス価値の創出に貢献できることが求められます。",
      "技術的な挑戦を楽しみ、継続的な学習と成長を重視する方。新しい技術や手法への関心が高く、データエンジニアリングの最新トレンドをキャッチアップし、チーム全体の技術力向上に貢献できることが重要です。",
      "チームワークを重視し、多様な専門性を持つメンバーと協働できる方。データサイエンティスト、プロダクトマネージャー、エンジニアなど異なる専門性を持つメンバーとの連携を図り、データドリブンな意思決定の支援に貢献できることが望ましいです。",
    ],
    workingConditions: {
      workingLocation: "東京都（フルリモート可）",
      access: ["恵比寿駅 徒歩3分", "代官山駅 徒歩8分"],
      workingHours: "フレックスタイム（9:00-18:00、コアタイム10:00-16:00）",
      workSystem: "裁量労働制",
      probation: "試用期間3ヶ月",
      benefits: [
        "在宅手当、通勤手当、語学学習支援",
        "ストックオプション、企業型DC、健康診断",
        "カンファレンス参加補助、書籍購入補助",
      ],
      remoteNote: "フルリモートワーク可（月1-2回出社推奨）",
    },
    selectionProcess: ["書類選考", "技術面接", "最終面接"],
  },

  // 8. 機械学習エンジニア（PKSHA）
  {
    id: "ml-1",
    title: "機械学習エンジニア",
    company: "PKSHA Technology",
    category: "ML Engineer",
    location: "東京都",
    tags: ["ai"],
    postedAt: new Date("2025-09-15").toISOString(),
    logoUrl: "/next.svg",
    salary: "年収 700万〜1200万円",
    employmentType: "正社員",
    interviewType: "オンライン面接",
    remotePolicy: { fromOverseas: false, fromJapan: true },
    languageRequirements: { ja: "N1", en: "Business" },
    recruitFromOverseas: false,
    description: {
      whoWeAre:
        "ML/LLM を社会実装するためのアルゴリズムとプラットフォームを提供しています。PKSHA Technologyは「AIで社会を豊かにする」というミッションのもと、機械学習と大規模言語モデル（LLM）を活用したAIソリューションを提供しています。私たちの機械学習エンジニアリングチームは、レコメンデーション、検索、対話システムなどのAI機能をモジュール化し、様々な企業のビジネス課題解決に貢献するAIプラットフォームの開発・運用を担当しています。",
      products:
        "レコメンド/検索/対話のモジュール化されたAI機能を開発運用しています。PKSHAのAIプラットフォームは、レコメンデーションエンジン、検索システム、対話AI、異常検知など、多様なAI機能をモジュール化して提供しています。これらの機能は、ECサイト、メディア、金融、製造業など様々な業界の企業に導入され、ユーザー体験の向上とビジネス成果の最大化に貢献しています。また、カスタマイズ可能なAI機能により、各企業の独自の要件に対応したソリューションを提供しています。",
      productIntro:
        "LLM と従来型モデルを適材適所で使い分け、品質とコストの最適化を実現します。私たちは、大規模言語モデル（LLM）の強力な言語理解能力と、従来型機械学習モデルの高速・低コストな推論能力を組み合わせ、用途に応じて最適なモデルを選択・運用しています。また、モデルの品質監視、ドリフト検知、自動再学習などのMLOps機能により、本番環境でのAIシステムの安定運用と継続的な改善を実現しています。",
      responsibilities: [
        "特徴量エンジニアリングとデータ前処理、モデル学習/検証/継続運用のパイプライン整備。データの前処理・クリーニング、特徴量の設計・抽出、モデルの学習・検証、本番環境へのデプロイ、継続的な運用・改善まで一連のMLパイプラインの構築・運用を行います。",
        "オンライン推論基盤の設計と最適化、A/B テストによる継続的改善。リアルタイム推論システムの設計・実装、推論性能の最適化、A/Bテストの企画・実施、モデル性能の継続的な改善を担当します。",
        "モデル監視/KPI 設計、ドリフト検知と再学習フローの自動化。モデルの性能監視、データドリフトの検知、モデル劣化の早期発見、自動再学習フローの構築、MLOps基盤の整備を担当します。",
        "LLM の活用と従来型モデルとの統合、ハイブリッドAIシステムの構築。大規模言語モデルの活用、従来型機械学習モデルとの統合、ハイブリッドAIシステムの設計・実装、コストと性能の最適化を担当します。",
        "AI機能のモジュール化とAPI化、プラットフォーム機能の拡張。AI機能のモジュール化、RESTful APIの設計・実装、プラットフォーム機能の拡張、カスタマイズ可能なAIソリューションの提供を担当します。",
      ],
    },
    devInfo: {
      frontEnd: {
        languages: ["TypeScript"],
        frameworks: ["Next.js"],
      },
      backEnd: { languages: ["Python", "Go"], frameworks: ["FastAPI", "Ray"] },
      database: ["PostgreSQL", "Redis"],
      infra: {
        cloud: ["AWS"],
        containers: ["Kubernetes", "Docker"],
        monitoring: ["Prometheus", "Grafana"],
      },
      tools: {
        repository: ["GitHub"],
        documentation: ["Confluence"],
        communication: ["Slack"],
        taskManagement: ["Jira"],
      },
      methodology: "Scrum",
    },
    requirements: {
      must: [
        "統計/機械学習の基礎を実務に応用し、再現可能な実験設計と評価ができること。線形代数、統計学、確率論の基礎理解、機械学習アルゴリズムの理解、実験設計、A/Bテストの企画・実施、モデル評価指標の設計・運用経験が必要です。",
        "オンライン推論のレイテンシ/スループット最適化を設計段階から意識し実装できること。リアルタイム推論システムの設計、レイテンシとスループットの最適化、モデルの軽量化、推論エンジンの最適化、パフォーマンスチューニングの経験が求められます。",
        "モデル監視/ドリフト検知/再学習の運用を整備し、品質を維持向上できること。モデル性能の監視、データドリフトの検知、モデル劣化の早期発見、自動再学習フローの構築、MLOps基盤の整備経験が必要です。",
      ],
      want: [
        "LLM API/ベクトルDB/プロンプト設計に関する実務経験があり、効果的に活用できること。OpenAI API、Anthropic APIなどのLLM APIの活用、Pinecone、Weaviateなどのベクトルデータベースの使用、プロンプトエンジニアリング、RAG（Retrieval-Augmented Generation）の実装経験があると望ましいです。",
        "MLOps 基盤（Feature Store/Model Registry など）の導入運用経験があること。MLflow、Kubeflow、FeastなどのMLOpsツールの活用、Feature Storeの構築・運用、Model Registryの管理、CI/CD for MLの実装経験があると望ましいです。",
        "深層学習フレームワークの実装経験があり、GPU/TPUの活用ができること。PyTorch、TensorFlow、JAXなどの深層学習フレームワークの実装、GPU/TPUの活用、分散学習の実装、モデルの最適化経験があると望ましいです。",
      ],
    },
    candidateRequirements: [
      "仮説検証を素早く回し、学びを組織に還元できる方。データに基づいた仮説立案、迅速な実験・検証、学びの組織内共有、継続的な改善活動に積極的に取り組めることが求められます。",
      "技術的な挑戦を楽しみ、AI/MLの最新技術に興味を持つ方。機械学習、深層学習、LLMなどの最新技術への関心が高く、継続的な学習と技術力向上に取り組めることが重要です。",
      "ビジネス価値の創出を重視し、技術とビジネスの両面を理解できる方。技術的な実現可能性とビジネス価値の両方を考慮し、最適なソリューションを提案できることが望ましいです。",
    ],
    workingConditions: {
      workingLocation: "東京都（ハイブリッド勤務）",
      access: ["新宿駅 徒歩5分", "渋谷駅 徒歩8分"],
      workingHours: "フレックスタイム（9:00-18:00、コアタイム10:00-16:00）",
      workSystem: "裁量労働制",
      probation: "試用期間3ヶ月",
      benefits: [
        "在宅手当、通勤手当、語学学習支援",
        "ストックオプション、企業型DC、健康診断",
        "カンファレンス参加補助、書籍購入補助",
      ],
      remoteNote: "週2-3日リモートワーク可",
    },
    selectionProcess: ["書類選考", "技術面接", "最終面接"],
  },

  // 9. SRE（リクルート）
  {
    id: "sre-1",
    title: "SRE",
    company: "リクルート",
    category: "Site Reliability Engineer",
    location: "東京都",
    tags: ["sre/devops/infra"],
    postedAt: new Date("2025-09-20").toISOString(),
    logoUrl: "/vercel.svg",
    salary: "年収 700万〜1200万円",
    employmentType: "正社員",
    interviewType: "オンライン面接",
    remotePolicy: { fromOverseas: false, fromJapan: true },
    languageRequirements: { ja: "N2+", en: "Daily Conversation" },
    recruitFromOverseas: false,
    description: {
      whoWeAre:
        "多事業を支えるプラットフォームの信頼性向上に取り組む横断SREチームです。リクルートは「みんなで働く、みんなで生きる」というミッションのもと、求人、教育、住宅、結婚、旅行など多岐にわたる事業を展開し、数千万ユーザーにサービスを提供しています。私たちのSREチームは、これらの多様な事業を支える共通プラットフォームの信頼性向上に取り組み、ユーザーが安心してサービスを利用できる環境の構築・維持を担当しています。",
      products:
        "観測性/自動化/回復力向上のための仕組みを横断提供しています。リクルートのSREチームは、監視・観測性の向上、自動化の推進、システムの回復力向上を目的とした横断的な仕組みを提供しています。これには、統一された監視ダッシュボード、自動化されたデプロイメントパイプライン、障害対応の自動化、キャパシティプランニング、コスト最適化などが含まれます。これらの仕組みにより、各事業チームが効率的にサービスを運用できるよう支援しています。",
      productIntro:
        "事前の障害予防と迅速な復旧を両輪で回し、ユーザー体験の毀損を最小化します。私たちは、Chaos Engineering、SLO/SLA設計、エラーバジェット運用などの手法を用いて、事前にシステムの脆弱性を発見・改善し、障害の発生を予防します。また、インシデント発生時には迅速な対応と復旧を行い、ユーザーへの影響を最小限に抑えます。これらの活動により、高可用性と優れたユーザー体験を両立したサービス運用を実現しています。",
      responsibilities: [
        "SLO/SLA 設計とエラーバジェット運用、オンコール/インシデント対応の標準化。サービスレベル目標（SLO）とサービスレベル合意（SLA）の設計、エラーバジェットの運用、オンコール体制の構築、インシデント対応プロセスの標準化と改善を担当します。",
        "Chaos Engineering に基づく回復力評価と改善、レジリエンスの継続向上。Chaos Monkey、Litmusなどのツールを使った障害注入テストの実施、システムの回復力評価、脆弱性の特定と改善、レジリエンスの継続的な向上活動を担当します。",
        "キャパシティプランニング/コスト最適化とガバナンスの整備。リソース使用量の監視・予測、キャパシティプランニング、コスト最適化、リソースガバナンスの整備、予算管理とコスト削減提案を担当します。",
        "監視・観測性の向上とアラート最適化。Prometheus、Grafana、Datadogなどの監視ツールの活用、メトリクス設計、アラートルールの最適化、ダッシュボードの構築、観測性の向上を担当します。",
        "自動化の推進とDevOps文化の浸透。CI/CDパイプラインの改善、インフラの自動化、障害対応の自動化、DevOps文化の浸透、開発チームとの連携強化を担当します。",
      ],
    },
    devInfo: {
      frontEnd: {
        languages: ["TypeScript"],
        frameworks: ["Next.js"],
      },
      backEnd: { languages: ["Go", "Ruby"], frameworks: ["gRPC", "Rails"] },
      database: ["MySQL", "Redis"],
      infra: {
        cloud: ["GCP", "AWS"],
        containers: ["Kubernetes", "Docker"],
        monitoring: ["Datadog", "Grafana"],
      },
      tools: {
        repository: ["GitHub"],
        documentation: ["Confluence"],
        communication: ["Slack"],
        taskManagement: ["Jira"],
      },
      methodology: "Kanban",
    },
    requirements: {
      must: [
        "可用性/遅延/スループットの指標を用いてサービス信頼性を説明し、継続改善をリードできること。SLO/SLAの設計、エラーバジェットの運用、可用性・遅延・スループットの監視、信頼性指標の可視化、継続的な改善活動の推進経験が必要です。",
        "インシデントレスポンスの標準化を主導し、振り返りと学びをプロセスへ定着させられること。インシデント対応プロセスの設計・標準化、オンコール体制の構築、振り返り（Post-mortem）の実施、学びの組織内共有、プロセスの継続的改善経験が求められます。",
        "容量/コスト最適化を継続的に実施し、事業とのバランスを取りながら意思決定できること。リソース使用量の監視・予測、キャパシティプランニング、コスト最適化、事業KPIとのバランスを考慮した意思決定、定量的な効果測定経験が必要です。",
      ],
      want: [
        "耐障害性検証を継続運用し、回復力向上を定量的に実証できる評価基盤を整備できること。Chaos Engineeringの実践、障害注入テストの継続運用、回復力の定量的評価、脆弱性の特定と改善、評価基盤の構築経験があると望ましいです。",
        "SRE のプラクティスを開発組織へ浸透させ、文化として根付かせる活動を牽引できること。SREプラクティスの組織内展開、DevOps文化の浸透、開発チームとの連携強化、教育・トレーニングの企画・実施経験があると望ましいです。",
        "大規模システムの運用経験があり、マイクロサービスアーキテクチャの理解があること。大規模分散システムの運用、マイクロサービスアーキテクチャの理解、サービス間通信の最適化、分散システムの監視・運用経験があると望ましいです。",
      ],
    },
    candidateRequirements: [
      "困難な状況でも冷静に意志決定し、周囲を導ける方。インシデント発生時の冷静な判断、迅速な意思決定、チームのリーダーシップ、周囲を導く能力が求められます。",
      "継続的な改善と学習を重視し、技術的な挑戦を楽しむ方。新しい技術や手法への関心が高く、継続的な学習と技術力向上に取り組めることが重要です。",
      "チームワークを重視し、多様な専門性を持つメンバーと協働できる方。開発チーム、インフラチーム、ビジネスチームなど異なる専門性を持つメンバーとの連携を図り、組織全体の成果向上に貢献できることが望ましいです。",
    ],
    workingConditions: {
      workingLocation: "東京都（ハイブリッド勤務）",
      access: ["新宿駅 徒歩3分", "渋谷駅 徒歩8分"],
      workingHours: "フレックスタイム（9:00-18:00、コアタイム10:00-16:00）",
      workSystem: "裁量労働制",
      probation: "試用期間3ヶ月",
      benefits: [
        "在宅手当、通勤手当、語学学習支援",
        "ストックオプション、企業型DC、健康診断",
        "カンファレンス参加補助、書籍購入補助",
      ],
      remoteNote: "週2-3日リモートワーク可",
    },
    selectionProcess: ["書類選考", "技術面接", "最終面接"],
  },

  // 10. モバイルアプリエンジニア（LINEヤフー）
  {
    id: "mobile-1",
    title: "モバイルアプリエンジニア",
    company: "LINEヤフー",
    category: "Mobile Engineer",
    location: "東京都",
    tags: ["mobile"],
    postedAt: new Date("2025-09-28").toISOString(),
    logoUrl: "/window.svg",
    salary: "年収 600万〜1000万円",
    employmentType: "正社員",
    interviewType: "オンライン面接",
    remotePolicy: { fromOverseas: false, fromJapan: true },
    languageRequirements: { ja: "N2+", en: "Daily Conversation" },
    recruitFromOverseas: false,
    description: {
      whoWeAre:
        "数千万MAUのモバイルサービスで、体験価値を最大化する開発チームです。LINEヤフーは日本最大級のメッセージングアプリ「LINE」と検索・ポータルサービス「Yahoo!」を運営し、数億ユーザーが利用する大規模モバイルサービスを提供しています。私たちのモバイルアプリエンジニアリングチームは、これらのサービスが提供するメッセージング、決済、コンテンツ配信、検索などの機能を、ユーザーにとって使いやすく、信頼性の高いモバイルアプリとして実現することを目指しています。",
      products:
        "メッセージ/決済/コンテンツ配信など複合的なアプリ群を展開しています。LINEヤフーのモバイルアプリは、メッセージング、決済、コンテンツ配信、検索、ニュース、ショッピングなど、多様な機能を統合した複合的なアプリ群として展開されています。これらの機能は、ユーザーの日常生活に密着した重要なサービスであり、高い可用性と優れたユーザー体験が求められます。また、iOS/Android両プラットフォームでの一貫した体験提供と、プラットフォーム固有の最適化を両立しています。",
      productIntro:
        "現場ユースケースを重視したスムーズで信頼性の高い操作体験を、安定した配信基盤上で提供します。私たちは、ユーザーの実際の使用シーンを深く理解し、その場面に最適化されたUI/UXを設計・実装しています。また、Flutter/React Nativeなどのクロスプラットフォーム技術を活用し、効率的な開発と一貫した体験提供を実現しています。さらに、CI/CDパイプラインによる自動化されたビルド・配信により、安定したリリース品質を維持し、ユーザーに信頼性の高いサービスを提供しています。",
      responsibilities: [
        "Flutter/React Native による新機能実装とパフォーマンス最適化、スクロール/描画の滑らかさ改善。クロスプラットフォーム開発フレームワークを使った新機能の実装、アプリのパフォーマンス最適化、スクロール性能の改善、描画処理の最適化、メモリ使用量の削減を担当します。",
        "通知/認証/決済等のプラットフォーム連携、OS アップデートへの迅速な追随。プッシュ通知、生体認証、決済システムなどのプラットフォーム機能との連携、iOS/AndroidのOSアップデートへの対応、新機能の迅速な実装、プラットフォーム固有の最適化を担当します。",
        "CI/CD によるビルド/配信自動化とリリース品質の継続的向上。GitHub Actions、Fastlaneなどのツールを使ったCI/CDパイプラインの構築・運用、自動ビルド・配信の実現、リリース品質の監視・改善、テスト自動化の推進を担当します。",
        "ユーザー体験の向上とアクセシビリティの実装。ユーザビリティテストの実施、アクセシビリティ機能の実装、ユーザーフィードバックの分析・反映、継続的なUX改善を担当します。",
        "アプリの安定性向上とクラッシュ対策。Firebase Crashlyticsなどのツールを使ったクラッシュ監視、バグの早期発見・修正、アプリの安定性向上、ユーザー体験の品質維持を担当します。",
      ],
    },
    devInfo: {
      frontEnd: {
        languages: ["Dart", "TypeScript"],
        frameworks: ["Flutter", "React Native"],
      },
      backEnd: { languages: ["Kotlin", "Go"], frameworks: ["Ktor", "gRPC"] },
      database: ["SQLite", "PostgreSQL"],
      infra: {
        cloud: ["GCP", "AWS"],
        containers: ["Kubernetes", "Docker"],
        monitoring: ["Firebase Crashlytics", "Datadog"],
      },
      tools: {
        repository: ["GitHub"],
        documentation: ["Confluence"],
        communication: ["Slack"],
        taskManagement: ["Jira"],
      },
      methodology: "Scrum",
    },
    requirements: {
      must: [
        "Flutter または React Native での実務経験があり、描画最適化やメモリ管理まで踏み込んだ改善ができること。クロスプラットフォーム開発フレームワークでの実装経験、パフォーマンス最適化、メモリリークの対策、描画処理の最適化、スクロール性能の改善経験が必要です。",
        "iOS/Android のプラットフォーム特性を理解し、通知/認証/決済等の連携を安定提供できること。iOS/Androidのプラットフォーム固有の機能理解、プッシュ通知、生体認証、決済システムなどの連携実装、OSアップデートへの対応、プラットフォーム固有の最適化経験が求められます。",
        "ビルド/配信の自動化を設計運用し、ユーザー影響を最小化したリリースが実行できること。CI/CDパイプラインの構築・運用、自動ビルド・配信の実現、段階的リリース（Staged Rollout）の実施、リリース品質の監視・改善経験が必要です。",
      ],
      want: [
        "ネイティブブリッジやパフォーマンス計測の知見があり、複雑なUIでも滑らかな体験を提供できること。ネイティブコードとの連携、パフォーマンス計測ツールの活用、複雑なUIの実装、アニメーションの最適化、ユーザー体験の向上経験があると望ましいです。",
        "アクセシビリティや多言語対応を考慮した設計ができ、国際展開に耐える品質を担保できること。WCAG準拠のアクセシビリティ実装、多言語対応（i18n）、国際化（l10n）の実装、グローバル展開への対応経験があると望ましいです。",
        "ユーザビリティテストやA/Bテストの実施経験があり、データドリブンな改善ができること。ユーザビリティテストの企画・実施、A/Bテストの実装・分析、ユーザーフィードバックの分析、データに基づく改善提案の経験があると望ましいです。",
      ],
    },
    candidateRequirements: [
      "体験品質に強い執着を持ち、継続的に磨ける方。ユーザー体験の品質向上に強い関心を持ち、細部までこだわって継続的に改善を進められることが求められます。",
      "技術的な挑戦を楽しみ、モバイル開発の最新技術に興味を持つ方。新しい技術や手法への関心が高く、モバイル開発の最新トレンドをキャッチアップし、チーム全体の技術力向上に貢献できることが重要です。",
      "チームワークを重視し、多様な専門性を持つメンバーと協働できる方。デザイナー、プロダクトマネージャー、バックエンドエンジニアなど異なる専門性を持つメンバーとの連携を図り、チーム全体の成果向上に貢献できることが望ましいです。",
    ],
    workingConditions: {
      workingLocation: "東京都（ハイブリッド勤務）",
      access: ["恵比寿駅 徒歩3分", "代官山駅 徒歩8分"],
      workingHours: "フレックスタイム（9:00-18:00、コアタイム10:00-16:00）",
      workSystem: "裁量労働制",
      probation: "試用期間3ヶ月",
      benefits: [
        "在宅手当、通勤手当、語学学習支援",
        "ストックオプション、企業型DC、健康診断",
        "カンファレンス参加補助、書籍購入補助",
      ],
      remoteNote: "週2-3日リモートワーク可",
    },
    selectionProcess: ["書類選考", "技術面接", "最終面接"],
  },
];

export function findJobById(id: string): JobDetailV2 | null {
  return jobsMock.find(j => j.id === id) ?? null;
}