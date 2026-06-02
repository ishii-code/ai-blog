import { PecoLogo } from "@/components/peco";

/**
 * サイト共通フッター。
 */
export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-peco-border bg-peco-surface">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col items-start gap-3 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-6">
        <PecoLogo size="sm" color="primary" subtitle="AI Journal" />
        <p className="text-xs text-peco-gray-500">
          © 2026 株式会社PECO — Smart Pet Medical / AI が執筆した記事を掲載しています。
        </p>
      </div>
    </footer>
  );
}
