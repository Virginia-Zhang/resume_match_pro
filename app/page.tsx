import Image from "next/image";
import IntroTypewriter from "@/components/home/IntroTypewriter";
import HomepageActions from "@/components/home/HomepageActions";
import LottieHero from "@/components/home/LottieHero";
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        {/* Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Image
                src="/match_pro_dev_logo.webp"
                alt="MatchPro ロゴ"
                width={56}
                height={56}
                className="h-14 w-14 rounded"
                priority
              />
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                MatchPro / マッチプロ
              </h1>
            </div>
            <IntroTypewriter />
            <HomepageActions />
          </div>
          <div className="relative">
            <LottieHero />
          </div>
        </section>

        {/* Features */}
        <section className="mt-16 lg:mt-20">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold mb-2">
                開発者特化プラットフォーム
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                IT開発職に特化。掲載求人はエンジニア職のみ。評価軸と用語は開発者基準。
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold mb-2">
                レジュメ解析と正規化
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                PDFから経験・スキルを抽出し、評価に適した形へ正規化。
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold mb-2">
                マッチ度スコア（総合＋5指標）
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                求人要件との一致度を総合スコアと5つの指標で定量評価。
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold mb-2">可視化インサイト</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                指標内訳やハイライトをグラフで直感的に把握。
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold mb-2">サマリー生成</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                結果の背景と要点を簡潔に要約して提示。
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold mb-2">
                強み／弱みと面接対策
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                ポジションに対する強み・弱みを明確化し、具体的な面接準備ポイントを提案。
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 py-8 border-t text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            © {new Date().getFullYear()} MatchPro. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <a
              className="inline-flex items-center gap-1 hover:underline"
              href="https://github.com/Virginia-Zhang/resume_match_pro"
              target="_blank"
              rel="noopener noreferrer"
            >
              {/* Inline GitHub mark to avoid extra dependency */}
              {/* 追加依存を避けるためのインラインGitHubマーク */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.486 2 12.021c0 4.428 2.865 8.186 6.839 9.504.5.093.682-.218.682-.485 0-.241-.009-.876-.014-1.72-2.782.605-3.369-1.343-3.369-1.343-.454-1.156-1.11-1.465-1.11-1.465-.908-.62.069-.607.069-.607 1.003.071 1.531 1.033 1.531 1.033.892 1.529 2.341 1.087 2.91.832.091-.647.35-1.087.636-1.338-2.22-.253-4.555-1.113-4.555-4.953 0-1.094.39-1.99 1.029-2.689-.103-.253-.446-1.27.098-2.646 0 0 .84-.27 2.75 1.027A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.116 2.504.34 1.909-1.297 2.748-1.027 2.748-1.027.545 1.376.202 2.393.099 2.646.64.699 1.028 1.595 1.028 2.689 0 3.849-2.338 4.697-4.566 4.947.359.31.679.92.679 1.855 0 1.338-.012 2.418-.012 2.748 0 .269.18.582.688.483C19.139 20.204 22 16.448 22 12.02 22 6.486 17.523 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              GitHub
            </a>
            <a className="hover:underline" href="mailto:zhangsakurayi@qq.com">
              zhangsakurayi@qq.com
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
