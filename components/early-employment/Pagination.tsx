import { cn } from "@/lib/cn";
import { getVisiblePages } from "@/lib/early-employment/pagination";

type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  const tokens = getVisiblePages(page, pageCount);

  return (
    <nav aria-label="페이지" className="flex flex-wrap items-center gap-1">
      <PageButton
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        이전
      </PageButton>
      {tokens.map((token, index) =>
        token === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="px-1.5 text-sm text-slate-400"
            aria-hidden="true"
          >
            ...
          </span>
        ) : (
          <PageButton
            key={token}
            current={token === page}
            onClick={() => onPageChange(token)}
          >
            {token}
          </PageButton>
        ),
      )}
      <PageButton
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        다음
      </PageButton>
    </nav>
  );
}

function PageButton({
  children,
  current = false,
  disabled = false,
  onClick,
}: {
  children: React.ReactNode;
  current?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-current={current ? "page" : undefined}
      onClick={onClick}
      className={cn(
        "h-8 min-w-8 rounded-md px-2 text-sm transition-colors",
        current
          ? "bg-navy-900 font-semibold text-white"
          : "text-slate-600 hover:bg-slate-100",
        disabled && "cursor-not-allowed text-slate-300 hover:bg-transparent",
      )}
    >
      {children}
    </button>
  );
}
