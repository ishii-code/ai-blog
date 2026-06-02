// アプリ全体で使用する型定義を一元管理する。

/** structure_type の取りうる値（1〜7） */
export type StructureType = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * blog_articles テーブルの 1 レコードを表す型。
 * DB のカラムをアプリ側で扱いやすい形に正規化したもの。
 */
export interface Article {
  id: number;
  title: string;
  /** Markdown 本文 */
  content: string;
  published: boolean;
  /** トピックタグ（JSONB 配列） */
  topicTags: string[];
  /** 固有表現（JSONB 配列）。存在しない場合は空配列 */
  namedEntities: string[];
  /** 記事構成タイプ（1〜7）。不明な場合は null */
  structureType: number | null;
  /** 出典タイトル（単一）。なければ null */
  sourceTitle: string | null;
  /** 出典 URL（単一）。なければ null */
  sourceUrl: string | null;
  /** カバー画像（DALL-E 3 自動生成）の公開 URL。なければ null */
  coverImageUrl: string | null;
  /** ISO8601 文字列（タイムゾーン付き） */
  createdAt: string;
  updatedAt: string;
}

/** 一覧表示・カード用の軽量版（本文を含まず抜粋のみ） */
export interface ArticleSummary {
  id: number;
  title: string;
  excerpt: string;
  topicTags: string[];
  structureType: number | null;
  coverImageUrl: string | null;
  createdAt: string;
}

/** タグ集計の 1 件 */
export interface TagCount {
  tag: string;
  count: number;
}

/** listArticles の検索パラメータ */
export interface ListArticlesParams {
  limit?: number;
  offset?: number;
  /** 指定するとそのタグを含む記事のみ返す */
  tag?: string;
  /** true のとき published=true のみ（既定 true） */
  publishedOnly?: boolean;
}

/** 一覧 API のレスポンス型 */
export interface ArticleListResponse {
  articles: ArticleSummary[];
  limit: number;
  offset: number;
}

/** 単一記事 API のレスポンス型 */
export interface ArticleResponse {
  article: Article;
}

/** エラーレスポンス型 */
export interface ErrorResponse {
  error: string;
}
