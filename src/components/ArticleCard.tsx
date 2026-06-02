import Link from "next/link";
import type { ArticleSummary } from "@/types";
import { formatDate, toDateTimeAttr, structureLabel } from "@/lib/format";

/**
 * 記事一覧用カード。
 * カード全体を記事詳細へのリンクにし、タグは別リンクとして内包する。
 */
export function ArticleCard({ article }: { article: ArticleSummary }) {
  const struct = structureLabel(article.structureType);
  const visibleTags = article.topicTags.slice(0, 4);
  const restCount = article.topicTags.length - visibleTags.length;

  return (
    <article className="group flex h-full flex-col rounded-peco-lg border border-peco-border bg-peco-surface shadow-peco-sm transition-shadow hover:shadow-peco-md">
      <Link
        href={`/articles/${article.id}`}
        className="flex flex-1 flex-col gap-3 rounded-peco-lg p-5"
      >
        <div className="flex items-center gap-2 text-xs text-peco-gray-500">
          <time dateTime={toDateTimeAttr(article.createdAt)}>
            {formatDate(article.createdAt)}
          </time>
          {struct ? (
            <>
              <span aria-hidden>·</span>
              <span className="font-medium text-peco-primary-dark">{struct}</span>
            </>
          ) : null}
        </div>

        <h2 className="text-lg font-bold leading-snug text-peco-gray-900 transition-colors group-hover:text-peco-primary-dark">
          {article.title}
        </h2>

        {article.excerpt ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-peco-gray-700">
            {article.excerpt}
          </p>
        ) : null}
      </Link>

      {visibleTags.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5 px-5 pb-5">
          {visibleTags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              className="inline-flex items-center rounded-peco-sm bg-peco-surface-muted px-2 py-0.5 text-xs font-medium text-peco-gray-700 transition-colors hover:text-peco-primary-dark"
            >
              #{tag}
            </Link>
          ))}
          {restCount > 0 ? (
            <span className="text-xs text-peco-gray-500">+{restCount}</span>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
