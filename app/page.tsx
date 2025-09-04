import { Button } from "@/components/ui/button";

/**
 *
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ResumeMatch Pro
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Next.js + TypeScript + Tailwind CSS + shadcn/ui 项目骨架已就绪
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="text-lg px-8">
              开始使用
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              查看文档
            </Button>
            <Button variant="secondary" size="lg" className="text-lg px-8">
              GitHub
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border">
              <h3 className="text-xl font-semibold mb-3">⚡ 快速开发</h3>
              <p className="text-slate-600 dark:text-slate-400">
                使用 Turbopack 提升开发体验，热更新极速响应
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border">
              <h3 className="text-xl font-semibold mb-3">🎨 现代 UI</h3>
              <p className="text-slate-600 dark:text-slate-400">
                shadcn/ui + Tailwind CSS 打造精美用户界面
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border">
              <h3 className="text-xl font-semibold mb-3">🔧 类型安全</h3>
              <p className="text-slate-600 dark:text-slate-400">
                TypeScript 提供完整的类型检查和智能提示
              </p>
            </div>
          </div>

          <div className="mt-16 p-6 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              ✅ 项目骨架已完成
            </h3>
            <p className="text-blue-700 dark:text-blue-300">
              Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
              已配置完毕，可以开始开发了！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
