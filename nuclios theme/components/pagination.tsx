import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Dropdown } from "./dropdown";

/**
 * Table pagination: "Rows per page" select · "1–10 of 50" · first / previous / next / last.
 * Bento table footer pattern; styled with NucliOS tokens only.
 */
export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  className,
}: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const icon = "size-4 text-(--color-icons-neutral-subtle)";
  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex flex-wrap items-center justify-end gap-(--spacing-6xl) nuclios-type-body-small-regular text-(--color-text-neutral-subtle)",
        className
      )}
    >
      {onPageSizeChange && (
        <div className="flex items-center gap-(--spacing-s)">
          <span id="rows-per-page">Rows per page</span>
          <Dropdown
            id="rows-per-page-select"
            header="none"
            size="m"
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
            options={pageSizeOptions.map((n) => ({ value: String(n), label: String(n) }))}
            className="w-20"
          />
        </div>
      )}
      <span aria-live="polite">
        {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-(--spacing-3xs)">
        <Button
          size="small"
          variant="ghost"
          iconOnly
          aria-label="First page"
          disabled={page <= 1}
          onClick={() => onPageChange(1)}
        >
          <ChevronsLeft className={icon} />
        </Button>
        <Button
          size="small"
          variant="ghost"
          iconOnly
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className={icon} />
        </Button>
        <Button
          size="small"
          variant="ghost"
          iconOnly
          aria-label="Next page"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className={icon} />
        </Button>
        <Button
          size="small"
          variant="ghost"
          iconOnly
          aria-label="Last page"
          disabled={page >= pages}
          onClick={() => onPageChange(pages)}
        >
          <ChevronsRight className={icon} />
        </Button>
      </div>
    </nav>
  );
}
