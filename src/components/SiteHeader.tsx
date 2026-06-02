import Link from "next/link";
import { PecoLogo } from "@/components/peco";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV_ITEMS: { label: string; href: string }[] = [
  { label: "ホーム", href: "/" },
  { label: "タグ", href: "/tags" },
];

/**
 * サイト共通ヘッダー。PECO ブランドカラー（イエロー）背景にロゴとナビ。
 * ダーク/ライト切り替えボタンを右端に置く。
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-peco-primary shadow-peco-sm">
      <div className="mx-auto flex h-16 w-full max-w-[1100px] items-center justify-between gap-4 px-4 md:px-6">
        <Link
          href="/"
          className="rounded-peco-sm"
          aria-label="AI Journal トップへ"
        >
          <PecoLogo size="md" color="white" subtitle="AI Journal" />
        </Link>

        <nav aria-label="メインナビゲーション" className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex h-11 items-center rounded-peco-md px-3 text-sm font-semibold text-white/90 transition-colors hover:bg-white/15"
            >
              {item.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
