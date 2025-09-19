import Image from "next/image";
import TypewriterText from "@/components/home/TypewriterText";
import HomepageActions from "@/components/home/HomepageActions";
import LottieHero from "@/components/home/LottieHero";
import ThemeToggle from "@/components/theme-toggle";
import {
  PRODUCT_MARK,
  PRODUCT_NAME_EN,
  PRODUCT_NAME_JA,
  ASSET_LOGO_LIGHT,
  ASSET_LOGO_DARK,
  FEATURE_CARDS,
  VP_JA,
  VP_EN,
  ICON_GITHUB_LIGHT,
  ICON_GITHUB_DARK,
  ICON_MAIL_LIGHT,
  ICON_MAIL_DARK,
} from "@/app/constants/constants";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen fluid-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        {/* Top-Right Brand + Theme Toggle */}
        <div className="flex items-center justify-end gap-4 mb-4">
          <div className="text-sm md:text-base font-semibold tracking-wide text-foreground">
            {PRODUCT_MARK}
          </div>
          <ThemeToggle />
        </div>
        {/* Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-6 pt-20">
            <div className="flex items-center gap-4">
              {/* light */}
              <Image
                src={ASSET_LOGO_LIGHT}
                alt="MatchPro ロゴ"
                width={100}
                height={100}
                className="h-[100px] w-[100px] rounded dark:hidden"
                priority
              />
              {/* dark */}
              <Image
                src={ASSET_LOGO_DARK}
                alt="MatchPro ロゴ"
                width={100}
                height={100}
                className="h-[100px] w-[100px] rounded hidden dark:inline-block"
                priority
              />
              <div>
                <div className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  {PRODUCT_NAME_EN}
                </div>
                <div className="text-3xl md:text-4xl font-bold tracking-tight mt-1">
                  {PRODUCT_NAME_JA}
                </div>
              </div>
            </div>
            <TypewriterText
              className="text-base md:text-lg text-slate-700 dark:text-slate-100 leading-relaxed"
              text="高度なAI分析技術により、レジュメと求人の適合度を精密に測定。IT開発者の転職活動を効率化し、理想のキャリアを実現するためのツールです。"
              typeSpeed={60}
              delaySpeed={10000}
              loop={false}
            />
          </div>
          <div className="relative mt-10">
            <LottieHero />
          </div>
        </section>

        {/* Features */}
        <section className="mt-16 lg:mt-20">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURE_CARDS.map(card => (
              <Card
                key={card.title}
                className="group rounded-xl border shadow-sm bg-white/5 dark:bg-slate-800/5 backdrop-blur hover:-translate-y-1.5 transition-transform duration-300 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600"
              >
                <CardHeader>
                  <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/40 dark:bg-slate-700/40 border text-xl group-hover:animate-[swing_500ms_ease]">
                    <span>{card.icon}</span>
                  </div>
                  <CardTitle className="text-lg mb-1">{card.title}</CardTitle>
                  <CardDescription className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {card.desc}
                  </CardDescription>
                </CardHeader>
              </Card>
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
