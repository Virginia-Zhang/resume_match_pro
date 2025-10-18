/**
 * @file test-batch-api.js
 * @description Test script for /api/match/batch endpoint using Node.js fetch.
 * @description Node.js fetch を使用した /api/match/batch エンドポイントのテストスクリプト。
 * @author Virginia Zhang
 * @remarks Run with: node test-batch-api.js (requires Node.js 18+ for native fetch)
 * @remarks 実行方法: node test-batch-api.js (ネイティブ fetch のため Node.js 18+ が必要)
 */

// Import test jobs from test-job-list.json
// test-job-list.json からテスト用求人をインポート
const testJobList = require("./test-job-list.json");

// Select first 3 jobs for testing
// テスト用に最初の3つの求人を選択
const testJobs = testJobList.map(job => ({
  id: job.id,
  job_description: job.job_description
}));

const testResumeText = `履歴書
カタカナ
氏名：
Seki
性別：
女
携帯：
080-xxxx-xxxx
生年月日：
1988年xx月xx日
E-mail
：
xxxx@gmail.com
現住所：
千葉県xxx
Github
：
https://github.com/xxxxx
職歴
株式会社xxxxx
事業内容：情報処理技術に関する人材派遣、中日間の人材サービス、業務開発
2023年11月～2024年7月（８ヶ月）
ソフトウェアエンジニア
大手企業のオンラインバンキングシステムプロジェクトに携わり、基本設計から詳細設計、製造、導入、単体テスト、結合テ
ストまで幅広く担当しました。
要件に基づき、カードローンの借入・返済、普通預金・定期預金、取引履歴などの機能に対して、基本設計書と詳細設
計書の作成および編集、実装、テストを実施。ウォーターフォール開発プロセスを熟知し、期限を厳守しながら確実に成
果物を提供しました。
Java17とSpringBootを使用したシステム移行作業を担当。非効率なクエリの最適化やキャッシュ機構の導入により、
システム全体のパフォーマンスを大幅に向上させました。
Reactを使用し、コンポーネントベースの設計を実装。UI要素や機能の再利用可能なコンポーネントを作成し、プロジェ
クト内で一貫性のある設計を維持しながら、コードの重複を削減、メンテナンス性を向上させました。また、共通コンポー
ネントの活用によって、新機能の追加や修正の効率を大幅に改善しました。
写真をはる必要が
ある場合
1．縦36～40㎜
横
24
～
30
㎜
2．本人単身胸から上
職務要約
IT業界において約9年間、多様な分野での大規模システム開発に携
わり、特にフロントエンド開発を中心に活動してきました。Typescriptや
Reactを得意とする一方、バックエンドやデータベースに関する知識も
併せ持ち、技術選定やシステム要件の策定にも積極的に関与してき
ました。
フロントエンドテックリードとしてチームを管理し、プロジェクトの進捗調
整や課題解決をリードしつつ、若手エンジニアの育成にも力を入れて
きました。これまでの経験を通じて、期限厳守を前提にユーザーエクス
ペリエンスを最優先に考え、プロジェクト成功に貢献してきました。
今後は、より複雑な課題に取り組むと同時に、新しい技術や開発手法
を習得し、大規模な開発チームでさらなるスキルを発揮したいと考えて
います。チームの効率を最大化する方法を模索し続け、革新的なプロ
ダクトの開発に貢献することを目指しています。
スキル
Professional
HTML&CSS&JavaScript
Typescript&React&VUE
Node.js&Next.js&Nest.js
Webpack&Vite
Java&SpringBoot&Kotlin
MySQL&Redis&MongoDB
Git&SVN&Linux
テクニカルリーダー経験
チームコミュニケーション
Languages
中国語/広東語（ネイティブ）
日本語（ビジネス）
英語（ビジネス）

JUnitとMockitoを使用して単体テストを実施し、重要な機能について高いテストカバレッジを確保しました。テストケース
を作成し、シナリオに基づいた徹底的な単体テストを実施。テストカバレッジを100%まで引き上げ、不具合が発見された
際には迅速に修正対応を行いました。
使用技術:Java,JavaScript,Typescript,HTML,CSS,SpringBoot,React,JUnit,Mockito,Oracle
xxxx（北京）有限公司
事業内容：法律・教育分野のソフトウェアの開発と運営
2020年9月～2023年7月（3年）
フロントエンドエンジニア
法律・教育アプリケーションの開発を担当し、フロントエンドエンジニアとして会社全体のプロジェクトに幅広く携わりました。
すべてのプロジェクトを予定通りに完了させ、品質向上にも貢献しました。
新機能の追加やUI/UXの改善、フロントエンドアーキテクチャのアップグレードを通じてシステムパフォーマンスを向上さ
せ、ページロード時間を20%以上短縮しました。
ReactやNext.jsなどの技術を用いてWebアプリケーションを構築し、20以上のプロジェクトで新機能開発およびフロント
エンドのリファクタリングを担当しました。Webpackを用いてアーキテクチャを設計し、共通コンポーネントの作成を通じて、
パッケージをリリース、各プロジェクトに導入し、チーム全体の開発効率を向上させました。
フロントエンドテクリードとして、課題解決と品質管理に注力し、コードレビューやフォーマット改善を通じてチーム全体の
技術力向上に貢献しました。
各プロジェクトのドキュメント作成および編集を行い、複雑な業務を効率的に整理。これにより、チーム内での知識共有
が促進され、新規エンジニアの立ち上がりが迅速化しました。若手エンジニアの育成にも力を入れました。
新規システムの開発にも関与し、業務改善のアイデアや技術的な提案を積極的に行いました。
使用技術:JavaScript,Typescript,HTML,CSS,Kotlin,Node,React,Next.js,LESS,MySQL
xxxxサービス有限公司
事業内容：ソフトウェアおよび情報技術サービス
2015年5月～2020年5月（5年）
ソフトウェアエンジニア
SIER企業のプロジェクトに携わり、通信、保険、スマートシティなど多様な業界のシステム開発経験を積みました。これによ
り、どのような業界のプロジェクトにも柔軟に対応できる能力を培いました。
保険会社のオンライン販売システムの開発・保守。API統合、フロントエンド最適化でパフォーマンス向上。
テックリードとして7人チームを管理し、進捗管理やタスク割り振り、プロジェクトを納期通り完了させました。
OA事務システムフロントエンド設計・実装。ユーザビリティ向上、パフォーマンス最適化。
大手会社の大規模な通信インフラプロジェクトでフロントエンド開発作業を担当。業務効率化に貢献。
使用技術:Java,JavaScript,HTML,CSS,VUE,SASS,MySQL
学歴
20xx.09～20xx.07xx外国語大学日本言語文化正規課程卒業
20xx.03～20xx.07xx電子科技大学ソフトウェア工学通信教育卒業
20xx.09～20xx.07中国xx大学技術経営（MEM）非全日制卒業予定`;

// Get API base URL (default to localhost for testing)
// API ベース URL を取得（テスト用にデフォルトは localhost）
const API_BASE = process.env.API_BASE || "http://localhost:3000";
const API_ENDPOINT = `${API_BASE}/api/match/batch`;

/**
 * @description Tests the batch matching API endpoint.
 * @description バッチマッチング API エンドポイントをテストします。
 */
async function testBatchAPI() {
  console.log("🧪 Testing /api/match/batch endpoint...");
  console.log(`📍 API endpoint: ${API_ENDPOINT}`);
  console.log(`📦 Testing with ${testJobs.length} jobs`);
  
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resume_text: testResumeText,
        jobs: testJobs,
      }),
    });

    console.log(`📊 Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error: ${errorText}`);
      return;
    }

    const data = await response.json();
    console.log("✅ API Response:");
    console.log(JSON.stringify(data, null, 2));
    
    // Validate response structure
    // レスポンス構造を検証
    if (!data.match_results || !Array.isArray(data.match_results)) {
      console.error("❌ Invalid response: missing or invalid match_results");
      return;
    }

    console.log(`🎯 Received ${data.match_results.length} match results`);
    
    // Check each result
    // 各結果をチェック
    data.match_results.forEach((result, index) => {
      console.log(`\n📋 Result ${index + 1}:`);
      console.log(`  Job ID: ${result.job_id}`);
      console.log(`  Overall Score: ${result.overall}`);
      console.log(`  Skills: ${result.scores.skills}`);
      console.log(`  Experience: ${result.scores.experience}`);
      console.log(`  Projects: ${result.scores.projects}`);
      console.log(`  Education: ${result.scores.education}`);
      console.log(`  Soft Skills: ${result.scores.soft}`);
    });

    console.log("\n🎉 Batch API test completed successfully!");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
// テストを実行
testBatchAPI();
