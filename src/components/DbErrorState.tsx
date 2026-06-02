/**
 * DB 接続/取得に失敗したときの汎用エラー表示。
 * スタックトレース等の内部情報は一切出さない。
 */
export function DbErrorState({
  message = "記事の読み込みに失敗しました。時間をおいて再度お試しください。",
}: {
  message?: string;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-peco-lg border border-peco-danger/30 bg-peco-danger-light px-6 py-12 text-center"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-10 w-10 text-peco-danger"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
        />
      </svg>
      <p className="font-semibold text-peco-gray-900">読み込みエラー</p>
      <p className="max-w-md text-sm text-peco-gray-700">{message}</p>
    </div>
  );
}
