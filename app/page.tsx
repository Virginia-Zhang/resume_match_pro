import Image from "next/image";
import TypewriterText from "@/components/home/TypewriterText";
import HomepageActions from "@/components/home/HomepageActions";
import {
  PRODUCT_NAME_EN,
  PRODUCT_NAME_JA,
  ASSET_LOGO_LIGHT,
  ASSET_LOGO_DARK,
  ASSET_HERO_ANIMATION,
  FEATURE_CARDS,
  VP_JA,
  VP_EN,
  ICON_GITHUB_LIGHT,
  ICON_GITHUB_DARK,
  ICON_MAIL_LIGHT,
  ICON_MAIL_DARK,
  ATTRIBUTION_STORYSET_TEXT,
  ATTRIBUTION_STORYSET_URL,
} from "@/app/constants/constants";
import FeatureCard from "@/components/home/FeatureCard";

/**
 * Landing page with hero graphic, features, CTA, and footer.
 * ヒーロー画像、機能カード、CTA、フッターを備えたランディングページ。
 *
 * @component Home
 * @returns {JSX.Element} Page element | ページ要素
 * @remarks Server Component; composes client components (Typewriter, Actions).
 * @remarks サーバーコンポーネント。クライアント要素を合成。
 */
export default function Home() {
  return (
    <div className="min-h-screen fluid-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        {/* Top bar: left attribution for Storyset (lg+). BrandBar is global in layout */}
        {/* 上部バー: Storyset のクレジット（lg+）。ブランドバーはレイアウト側で表示 */}
        <div className="flex items-center justify-end lg:justify-between mb-4">
          <a
            className="hidden lg:inline text-xs text-muted-foreground hover:underline"
            href={ATTRIBUTION_STORYSET_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            {ATTRIBUTION_STORYSET_TEXT}
          </a>
        </div>
        {/* Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-6 pt-10">
            <div className="flex items-center gap-4 justify-center lg:justify-start">
              {/* light */}
              <Image
                src={ASSET_LOGO_LIGHT}
                alt="MatchPro ロゴ"
                width={100}
                height={100}
                className="h-14 w-14 sm:h-[100px] sm:w-[100px] rounded dark:hidden"
                priority
              />
              {/* dark */}
              <Image
                src={ASSET_LOGO_DARK}
                alt="MatchPro ロゴ"
                width={100}
                height={100}
                className="h-14 w-14 sm:h-[100px] sm:w-[100px] rounded hidden dark:inline-block"
                priority
              />
              <div className="text-center lg:text-left">
                <div className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight">
                  {PRODUCT_NAME_EN}
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mt-1">
                  {PRODUCT_NAME_JA}
                </div>
              </div>
            </div>
            <TypewriterText
              className="text-base md:text-lg text-slate-700 dark:text-slate-100 leading-relaxed text-center lg:text-left"
              text="高度なAI分析技術により、レジュメと求人の適合度を精密に測定。外国人IT開発者の転職活動を効率化し、理想のキャリアを実現するためのツールです。"
              typeSpeed={60}
              delaySpeed={10000}
              loop={false}
            />
          </div>
          <div className="relative mt-10">
            <div className="relative aspect-video rounded-xl border bg-white/5 dark:bg-slate-900/5 overflow-hidden max-w-[560px] mx-auto lg:ml-auto">
              <Image
                src={ASSET_HERO_ANIMATION}
                alt="Hero graphic"
                width={500}
                height={500}
                className="h-full w-full object-cover"
              />
            </div>
            {/* Mobile-only attribution below hero graphic */}
            {/* モバイルのみの Storyset のクレジット */}
            <div className="mt-2 text-xs text-muted-foreground text-center lg:hidden">
              <a
                className="hover:underline"
                href={ATTRIBUTION_STORYSET_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {ATTRIBUTION_STORYSET_TEXT}
              </a>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mt-16 lg:mt-20">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURE_CARDS.map(card => (
              <FeatureCard
                key={card.title}
                icon={card.icon}
                title={card.title}
                desc={card.desc}
              />
            ))}
          </div>
        </section>

        {/* CTA moved below features */}
        <div className="mt-25 flex justify-center">
          <HomepageActions />
        </div>

        {/* Value proposition (JA line) + EN small caption */}
        <section className="mt-15 text-center">
          <p className="text-xl md:text-2xl font-semibold tracking-tight gradient-text">
            {VP_JA}
          </p>
          <TypewriterText
            className="text-lg text-slate-700 dark:text-slate-200 mt-3"
            text={VP_EN}
            typeSpeed={60}
            delaySpeed={10000}
            loop={false}
          />
        </section>

        {/* Footer */}
        <footer className="mt-20 py-8 border-t text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            © {new Date().getFullYear()} {PRODUCT_NAME_EN}. All rights
            reserved.
          </div>
          <div className="flex items-center gap-4">
            <a
              className="inline-flex items-center gap-1 hover:underline text-foreground"
              href="https://github.com/Virginia-Zhang/resume_match_pro"
              target="_blank"
              rel="noopener noreferrer"
            >
              {/* light */}
              <Image
                src={ICON_GITHUB_LIGHT}
                alt="GitHub"
                width={16}
                height={16}
                className="h-4 w-4 dark:hidden"
              />
              {/* dark */}
              <Image
                src={ICON_GITHUB_DARK}
                alt="GitHub"
                width={16}
                height={16}
                className="h-4 w-4 hidden dark:inline-block"
              />
              GitHub
            </a>
            <a
              className="inline-flex items-center gap-1 hover:underline text-foreground"
              href="mailto:zhangsakurayi@qq.com"
            >
              {/* light */}
              <Image
                src={ICON_MAIL_LIGHT}
                alt="Email"
                width={16}
                height={16}
                className="h-4 w-4 dark:hidden"
              />
              {/* dark */}
              <Image
                src={ICON_MAIL_DARK}
                alt="Email"
                width={16}
                height={16}
                className="h-4 w-4 hidden dark:inline-block"
              />
              Contact Me
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
