/** 表示用フォーマット系のヘルパー。 */

/** ISO 文字列を「2026年6月2日」形式へ。 */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/** ISO 文字列を datetime 属性用にそのまま返す（無効なら空）。 */
export function toDateTimeAttr(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

/**
 * structure_type（1〜7）の表示ラベル。
 * 値の意味が不明・範囲外でも安全にフォールバックする。
 */
const STRUCTURE_LABELS: Record<number, string> = {
  1: "解説",
  2: "比較",
  3: "時系列",
  4: "論考",
  5: "リスト",
  6: "Q&A",
  7: "ケーススタディ",
};

export function structureLabel(type: number | null): string | null {
  if (type == null) return null;
  return STRUCTURE_LABELS[type] ?? `構成 ${type}`;
}
