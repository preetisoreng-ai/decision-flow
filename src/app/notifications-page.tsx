import * as React from "react";
import { CheckCheck, ChevronLeft, Settings, SlidersHorizontal, Trash2 } from "lucide-react";
import { Button, DataTable, Menu, Tooltip, type Column } from "@nuclios";
import { cn } from "@/lib/utils";
import { personById, type Thread } from "@/data";
import { FILTERS, type AppNotification } from "./notifications";

const fmt = (at: number) => {
  const d = new Date(at);
  const p = (n: number) => String(n).padStart(2, "0");
  const h = d.getHours();
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${String(d.getFullYear()).slice(2)} | ${p(h % 12 || 12)}:${p(d.getMinutes())} ${h < 12 ? "AM" : "PM"}`;
};

const icon = "size-4 text-(--color-icons-neutral-subtle)";

/**
 * All Notifications page (Figma "Final Design for All Notification Screen", used as a wireframe):
 * back + title, Filters menu, bulk actions (N selected · delete · mark as read / mark all as read),
 * selectable paginated table with unread dot + bold unread rows and per-row actions.
 */
export function NotificationsPage({
  items,
  threadFor,
  onBack,
  onOpen,
  onMarkRead,
  onDelete,
  onSettings,
}: {
  items: AppNotification[];
  threadFor: (n: AppNotification) => Thread | undefined;
  onBack: () => void;
  onOpen: (n: AppNotification) => void;
  onMarkRead: (ids: string[]) => void;
  onDelete: (ids: string[]) => void;
  onSettings: () => void;
}) {
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]["key"]>("all");
  const [selected, setSelected] = React.useState<string[]>([]);
  const shown = items
    .filter((n) => filter === "all" || n.type === filter)
    .sort((a, b) => b.at - a.at); // newest first; the Timestamp column can re-sort
  const active = FILTERS.find((f) => f.key === filter)!;
  const unread = items.filter((n) => !n.read).length;

  // Drop selections that are no longer visible (filtered out or deleted).
  React.useEffect(() => {
    setSelected((s) => s.filter((id) => shown.some((n) => n.id === id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, items]);

  const columns: Column<AppNotification>[] = [
    {
      key: "title",
      header: "Title",
      render: (n) => {
        const detail = n.description ?? threadFor(n)?.text ?? "";
        return (
          <button
            type="button"
            onClick={() => onOpen(n)}
            className="flex max-w-[460px] flex-col items-start text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-primary-focused) rounded-(--radius-component-set-1)"
          >
            <span className={cn("nuclios-type-body-default-regular hover:underline", !n.read && "font-(--font-weight-medium)!")}>{n.title}</span>
            {detail && (
              <span className="line-clamp-1 nuclios-type-body-small-regular font-(--font-weight-regular)! text-(--color-text-neutral-subtle)">
                {detail}
              </span>
            )}
          </button>
        );
      },
    },
    { key: "location", header: "Visual Component / Screen", className: "min-w-48" },
    {
      key: "personId",
      header: "Shared By",
      className: "whitespace-nowrap",
      render: (n) => (n.personId ? personById(n.personId).name : "System"),
    },
    {
      key: "at",
      header: "Timestamp",
      sortable: true,
      sortValue: (n) => n.at,
      render: (n) => <span className="whitespace-nowrap">{fmt(n.at)}</span>,
    },
    {
      key: "id",
      header: "Actions",
      align: "right",
      render: (n) => (
        <span className="inline-flex items-center gap-(--spacing-3xs)">
          <Tooltip content={n.read ? "Already read" : "Mark as read"}>
            <Button
              size="small"
              variant="ghost"
              iconOnly
              aria-label={`Mark "${n.title}" as read`}
              disabled={n.read}
              onClick={() => onMarkRead([n.id])}
            >
              <CheckCheck className={icon} />
            </Button>
          </Tooltip>
          <Tooltip content="Delete">
            <Button
              size="small"
              variant="ghost"
              iconOnly
              aria-label={`Delete "${n.title}"`}
              onClick={() => onDelete([n.id])}
            >
              <Trash2 className={icon} />
            </Button>
          </Tooltip>
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-(--spacing-2xl) px-(--spacing-6xl) pt-(--spacing-l) pb-(--spacing-14xl)">
      {/* Back + title */}
      <div className="relative flex h-11 items-center justify-center border-b border-(--color-border-subtle)">
        <Button
          size="small"
          variant="ghost"
          iconOnly
          aria-label="Back"
          onClick={onBack}
          className="absolute left-0"
        >
          <ChevronLeft className="size-5 text-(--color-icons-neutral)" />
        </Button>
        <h2 className="nuclios-type-heading-h5-regular text-(--color-text-neutral)">
          All Notifications
        </h2>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-(--spacing-l)">
        <Menu
          trigger={
            <Button
              size="small"
              variant="border"
              leadingIcon={<SlidersHorizontal className="size-4" />}
            >
              Filters{filter !== "all" ? `: ${active.label}` : ""}
            </Button>
          }
          items={FILTERS.map((f) => ({
            label: f.menu,
            selected: f.key === filter,
            onSelect: () => setFilter(f.key),
          }))}
        />
        <div className="flex items-center gap-(--spacing-l)">
          <Tooltip content="Notification settings">
            <Button size="small" variant="ghost" iconOnly aria-label="Notification settings" onClick={onSettings}>
              <Settings className={icon} />
            </Button>
          </Tooltip>
          {selected.length > 0 && (
            <span
              className="nuclios-type-body-small-medium text-(--color-text-neutral)"
              aria-live="polite"
            >
              {selected.length} {selected.length === 1 ? "row" : "rows"} selected
            </span>
          )}
          <Tooltip content="Delete selected">
            <Button
              size="small"
              variant="ghost"
              iconOnly
              aria-label="Delete selected notifications"
              disabled={!selected.length}
              onClick={() => {
                onDelete(selected);
                setSelected([]);
              }}
            >
              <Trash2 className={icon} />
            </Button>
          </Tooltip>
          {selected.length > 0 ? (
            <Button
              size="small"
              variant="link"
              onClick={() => {
                onMarkRead(selected);
                setSelected([]);
              }}
            >
              Mark as read
            </Button>
          ) : (
            <Button
              size="small"
              variant="link"
              disabled={!unread}
              onClick={() => onMarkRead(items.map((n) => n.id))}
              className="text-(--color-text-neutral-subtle) disabled:text-(--color-text-neutral-disabled)"
            >
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      <DataTable<AppNotification>
        columns={columns}
        rows={shown}
        rowKey={(n) => n.id}
        selection={{ selected, onChange: setSelected, label: (n) => n.title }}
        rowLeading={(n) =>
          n.read ? null : (
            <span className="size-2 rounded-(--radius-pill) bg-(--color-background-negative)">
              <span className="sr-only">Unread</span>
            </span>
          )
        }
        rowClassName={(n) =>
          cn(!n.read && "[&_td]:font-(--font-weight-medium)!")
        }
        pagination={{ pageSize: 10, pageSizeOptions: [10, 25, 50] }}
        emptyMessage={
          filter === "all"
            ? "You’re all caught up! You have no notifications."
            : `No ${active.label.toLowerCase()} notifications.`
        }
        className="overflow-x-auto rounded-(--radius-container-set-2) [&_th]:whitespace-nowrap"
      />
    </div>
  );
}
