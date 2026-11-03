import * as React from "react";
import {
  Table as BaseTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { Checkbox } from "./selection";
import { Pagination } from "./pagination";

/**
 * Bento "Tables" + NucliOS Dashboard Directions PDF table styling:
 * - Subtle top header bar (when `title` or `actions` is passed) with `bg-(--color-background-subtle)`
 *   like Page 1 ("Top products" + "Export") and Page 2 ("Top products" + "View all")
 * - Clean white column header row with muted labels (`text-(--color-text-neutral-subtle)`)
 * - Crisp `border-(--color-border-subtle)` row dividers, tabular numbers on right-aligned columns
 */
export interface Column<T> {
  key: keyof T & string;
  header: string;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  /** Value used for sorting when the displayed value differs (e.g. a timestamp). */
  sortValue?: (row: T) => string | number;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  selectedKey?: string;
  onRowClick?: (row: T) => void;
  /** Checkbox selection; select-all applies to the current page. */
  selection?: {
    selected: string[];
    onChange: (keys: string[]) => void;
    label?: (row: T) => string;
  };
  /** Rendered before the checkbox / first cell, e.g. an unread dot. */
  rowLeading?: (row: T) => React.ReactNode;
  rowClassName?: (row: T) => string | undefined;
  pagination?: { pageSize?: number; pageSizeOptions?: number[] };
  emptyMessage?: React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  title,
  subtitle,
  actions,
  columns,
  rows,
  rowKey,
  selectedKey,
  onRowClick,
  selection,
  rowLeading,
  rowClassName,
  pagination,
  emptyMessage = "Nothing to show.",
  className,
}: DataTableProps<T>) {
  const [sort, setSort] = React.useState<{ key: string; dir: "up" | "down" } | null>(null);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(pagination?.pageSize ?? 10);

  const sorted = React.useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    const val = (r: T) =>
      col?.sortValue ? col.sortValue(r) : (r[sort.key as keyof T] as unknown as string | number);
    return [...rows].sort((a, b) => {
      const av = val(a);
      const bv = val(b);
      const r = av > bv ? 1 : av < bv ? -1 : 0;
      return sort.dir === "up" ? r : -r;
    });
  }, [rows, sort, columns]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  React.useEffect(() => {
    if (page > pages) setPage(pages);
  }, [page, pages]);
  const visible = pagination ? sorted.slice((page - 1) * pageSize, page * pageSize) : sorted;

  const pageKeys = visible.map(rowKey);
  const selectedOnPage = selection
    ? pageKeys.filter((k) => selection.selected.includes(k)).length
    : 0;
  const allState: boolean | "indeterminate" =
    selectedOnPage === 0 ? false : selectedOnPage === pageKeys.length ? true : "indeterminate";
  const toggleAll = () => {
    if (!selection) return;
    const others = selection.selected.filter((k) => !pageKeys.includes(k));
    selection.onChange(allState === true ? others : [...others, ...pageKeys]);
  };
  const toggleOne = (k: string) => {
    if (!selection) return;
    selection.onChange(
      selection.selected.includes(k)
        ? selection.selected.filter((x) => x !== k)
        : [...selection.selected, k]
    );
  };
  const lead = !!(selection || rowLeading);

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-(--radius-container-set-2) border border-(--color-border-subtle) bg-(--color-background-neutral)",
        className
      )}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between gap-(--spacing-2xl) border-b border-(--color-border-subtle) bg-(--color-background-subtle) px-(--spacing-2xl) py-(--spacing-m)">
          <div className="flex flex-col gap-(--spacing-3xs)">
            <div className="nuclios-type-body-default-medium text-(--color-text-neutral)">{title}</div>
            {subtitle && (
              <p className="nuclios-type-body-x-small-regular text-(--color-text-neutral-subtle)">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-(--spacing-s)">{actions}</div>
        </div>
      )}
      <BaseTable className="nuclios-type-body-default-regular text-(--color-text-neutral)">
        <TableHeader
          className={cn(
            "border-b border-(--color-border-subtle)",
            title || actions ? "bg-(--color-background-neutral)" : "bg-(--color-background-subtle)"
          )}
        >
          <TableRow className="border-0 hover:bg-transparent">
            {lead && (
              <TableHead className="h-10 w-14 pl-(--spacing-l) pr-0">
                <span className="flex items-center gap-(--spacing-s)">
                  <span className="w-2" aria-hidden />
                  {selection && (
                    <Checkbox
                      id="select-all-rows"
                      aria-label="Select all rows on this page"
                      checked={allState}
                      onCheckedChange={toggleAll}
                    />
                  )}
                </span>
              </TableHead>
            )}
            {columns.map((c) => {
              const active = sort?.key === c.key;
              const ariaSort = active
                ? sort!.dir === "up"
                  ? "ascending"
                  : "descending"
                : c.sortable
                  ? "none"
                  : undefined;
              return (
                <TableHead
                  key={c.key}
                  aria-sort={ariaSort}
                  className={cn(
                    "h-10 px-(--spacing-2xl) nuclios-type-body-small-medium text-(--color-text-neutral-subtle)",
                    lead && c === columns[0] && "pl-(--spacing-l)",
                    c.align === "right" && "text-right",
                    c.align === "center" && "text-center",
                    c.className
                  )}
                >
                  {c.sortable ? (
                    <button
                      type="button"
                      onClick={() =>
                        setSort((s) =>
                          s?.key === c.key
                            ? { key: c.key, dir: s.dir === "up" ? "down" : "up" }
                            : { key: c.key, dir: "up" }
                        )
                      }
                      className="inline-flex items-center gap-(--spacing-2xs) rounded-(--radius-component-set-1) hover:text-(--color-text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-primary-focused) cursor-pointer"
                    >
                      {c.header}
                      {active ? (
                        sort!.dir === "up" ? (
                          <Icons.chevronUp className="size-3.5" aria-hidden />
                        ) : (
                          <Icons.chevronDown className="size-3.5" aria-hidden />
                        )
                      ) : (
                        <Icons.chevronDown className="size-3.5 opacity-30" aria-hidden />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columns.length + (lead ? 1 : 0)}
                className="py-(--spacing-14xl) text-center text-(--color-text-neutral-muted)"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
          {visible.map((r) => {
            const k = rowKey(r);
            const checked = selection?.selected.includes(k) ?? false;
            return (
              <TableRow
                key={k}
                data-state={selectedKey === k || checked ? "selected" : undefined}
                onClick={onRowClick ? () => onRowClick(r) : undefined}
                className={cn(
                  "border-b border-(--color-border-subtle) last:border-b-0 hover:bg-(--color-background-neutral-hover) data-[state=selected]:bg-(--color-background-primary-muted)",
                  onRowClick && "cursor-pointer",
                  rowClassName?.(r)
                )}
              >
                {lead && (
                  <TableCell
                    className="w-14 pl-(--spacing-l) pr-0 py-(--spacing-m)"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="flex items-center gap-(--spacing-s)">
                      <span className="flex w-2 justify-center">{rowLeading?.(r)}</span>
                      {selection && (
                        <Checkbox
                          id={`select-${k}`}
                          aria-label={`Select ${selection.label?.(r) ?? "row"}`}
                          checked={checked}
                          onCheckedChange={() => toggleOne(k)}
                        />
                      )}
                    </span>
                  </TableCell>
                )}
                {columns.map((c) => (
                  <TableCell
                    key={c.key}
                    className={cn(
                      "px-(--spacing-2xl) py-(--spacing-m)",
                      lead && c === columns[0] && "pl-(--spacing-l)",
                      c.align === "right" && "text-right tabular-nums",
                      c.align === "center" && "text-center",
                      c.className
                    )}
                  >
                    {c.render ? c.render(r) : String(r[c.key] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </BaseTable>
      {pagination && (
        <div className="border-t border-(--color-border-subtle) px-(--spacing-2xl) py-(--spacing-s)">
          <Pagination
            page={page}
            pageSize={pageSize}
            total={sorted.length}
            onPageChange={setPage}
            onPageSizeChange={(n) => {
              setPageSize(n);
              setPage(1);
            }}
            pageSizeOptions={pagination.pageSizeOptions}
          />
        </div>
      )}
    </div>
  );
}
