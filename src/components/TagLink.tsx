import Link from "next/link";

/**
 * タグページへのリンク付きバッジ。
 * peco トークンの色を使い、ダークモードにも追従する。
 */
export function TagLink({ tag, count }: { tag: string; count?: number }) {
  return (
    <Link
      href={`/tags/${encodeURIComponent(tag)}`}
      className="inline-flex items-center gap-1 rounded-peco-sm border border-peco-border bg-peco-surface-muted px-2.5 py-1 text-xs font-medium text-peco-gray-700 transition-colors hover:border-peco-primary hover:text-peco-primary-dark"
    >
      <span aria-hidden className="text-peco-primary">#</span>
      <span>{tag}</span>
      {typeof count === "number" ? (
        <span className="text-peco-gray-500">({count})</span>
      ) : null}
    </Link>
  );
}
