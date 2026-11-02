import * as React from "react";
import { Bell, BellRing, Settings, Share2, SlidersHorizontal, X } from "lucide-react";
import { Avatar, Button, Menu, Popover, Toast, Tooltip } from "@nuclios";
import { cn } from "@/lib/utils";
import { personById, scopeLabels, type ScopeId, type Thread } from "@/data";

export type NotificationType = "mention" | "alert" | "comment" | "other";

export interface AppNotification {
  id: string;
  type: NotificationType;
  /** Who triggered it; system alerts have none. */
  personId?: string;
  title: string;
  /** Second line, e.g. the screen the comment lives on. */
  location: string;
  /** Longer detail shown on the All Notifications page. */
  description?: string;
  /** Mentions and comments link to an exact thread. */
  scope?: ScopeId;
  threadId?: string;
  at: number;
  read: boolean;
}

const H = 3600_000;
const now = Date.now();

export const seedNotifications: AppNotification[] = [
  {
    id: "n-1",
    type: "mention",
    personId: "ashishs",
    title: "Ashish Shrivastava mentioned you in a comment",
    location: scopeLabels["screen:demand-sizing"],
    scope: "screen:demand-sizing",
    threadId: "t-2",
    at: now - 0.2 * H,
    read: false,
  },
  {
    id: "n-2",
    type: "mention",
    personId: "jayant",
    title: "Jayant Driwedi mentioned you in a comment",
    location: scopeLabels["screen:size-opportunity"],
    scope: "screen:size-opportunity",
    threadId: "t-3",
    at: now - 2 * H,
    read: false,
  },
  {
    id: "n-3",
    type: "mention",
    personId: "ashishs",
    title: "Ashish Shrivastava mentioned you in a comment",
    location: scopeLabels["widget:quarterly-compliance"],
    scope: "widget:quarterly-compliance",
    threadId: "t-4",
    at: now - 26 * H,
    read: false,
  },
  {
    id: "n-4",
    type: "comment",
    personId: "john",
    title: "John Maddar replied to your comment",
    location: scopeLabels["screen:demand-sizing"],
    scope: "screen:demand-sizing",
    threadId: "t-1",
    at: now - 30 * H,
    read: false,
  },
  {
    id: "n-5",
    type: "alert",
    title: "Contract Compliance dropped below 9%",
    location: "Demand Sizing · KPI alert",
    at: now - 4 * 24 * H,
    read: false,
  },
  {
    id: "n-6",
    type: "alert",
    title: "Weekly forecast refresh completed",
    location: "Integrated Demand Forecasting",
    at: now - 6 * 24 * H,
    read: true,
  },
  ...Array.from({ length: 17 }, (_, i): AppNotification => ({
    id: `n-a${i + 1}`,
    type: "alert",
    title: "Below Industry Growth Rise",
    description: "The below industry growth for test has reached at b7",
    location: i % 4 === 3 ? "Portfolio Volume 2019" : "Demand Growth Across Regions",
    at: now - (2 + i * 1.3) * 24 * H,
    read: i % 3 !== 0,
  })),
  {
    id: "n-7",
    type: "other",
    personId: "deepak",
    title: "Deepak Sahu shared Size & Opportunity with you",
    location: "Demand Analysis",
    at: now - 8 * 24 * H,
    read: true,
  },
];

export const FILTERS: { key: "all" | NotificationType; menu: string; label: string }[] = [
  { key: "all", menu: "All", label: "All" },
  { key: "mention", menu: "@Mention", label: "@Mentions" },
  { key: "alert", menu: "Alerts", label: "Alerts" },
  { key: "comment", menu: "Comments", label: "Comments" },
  { key: "other", menu: "Others", label: "Others" },
];

function relative(at: number) {
  const h = (Date.now() - at) / H;
  if (h < 1) return "Just now";
  if (h < 24) return `${Math.floor(h)}h ago`;
  if (h < 48) return "Yesterday";
  if (h < 24 * 7) return `${Math.floor(h / 24)} days ago`;
  return "Last week";
}

const excerpt = (t?: Thread) =>
  t ? (t.text.length > 90 ? `${t.text.slice(0, 90)}…` : t.text) : "";

/** Pop-up card shown when a mention arrives. */
export function NotificationToast({
  n,
  thread,
  onView,
  onClose,
}: {
  n: AppNotification;
  thread?: Thread;
  onView: () => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute right-(--spacing-6xl) top-[62px] z-30 w-[380px] shadow-(--shadow-6)">
      <Toast
        type="informative"
        title={n.personId ? `${personById(n.personId).name} mentioned you` : n.title}
        description={`in ${n.location} — “${excerpt(thread)}”`}
        onClose={onClose}
        actions={
          <Button size="small" onClick={onView}>
            View Comment
          </Button>
        }
      />
    </div>
  );
}

export function Leading({ n }: { n: AppNotification }) {
  if (n.personId) {
    const p = personById(n.personId);
    return <Avatar name={p.name} tone={p.tone} size="m" />;
  }
  return (
    <span
      aria-hidden
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-(--radius-pill) bg-(--color-background-primary-muted) text-(--color-icons-primary)"
    >
      {n.type === "alert" ? <BellRing className="size-4" /> : <Share2 className="size-4" />}
    </span>
  );
}

/**
 * Header bell + Notifications dropdown.
 * Bell: highlighted while the pop-up card shows; red count badge for unread items.
 * Dropdown: title + close, active filter (tab-style) with a filter menu, scrolling list, View All / Mark all as read.
 */
export function NotificationBell({
  items,
  highlighted,
  open,
  onOpenChange,
  onSelect,
  onMarkAllRead,
  onViewAll,
  onSettings,
}: {
  items: AppNotification[];
  highlighted: boolean;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSelect: (n: AppNotification) => void;
  onMarkAllRead: () => void;
  /** Opens the All Notifications page. */
  onViewAll: () => void;
  /** Opens Notification Settings. */
  onSettings: () => void;
}) {
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]["key"]>("all");
  const unread = items.filter((n) => !n.read).length;
  const shown = items.filter((n) => filter === "all" || n.type === filter);
  const active = FILTERS.find((f) => f.key === filter)!;

  return (
    <Popover
      align="end"
      open={open}
      onOpenChange={onOpenChange}
      className="flex max-h-[min(560px,calc(100vh-72px))] w-[340px] flex-col p-0"
      trigger={
        <Button
          size="small"
          variant="ghost"
          iconOnly
          aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
          className={cn(
            "relative",
            highlighted || open
              ? "bg-(--color-background-primary-muted) text-(--color-icons-primary)"
              : "text-(--color-icons-neutral)"
          )}
        >
          <Bell className="size-4" />
          {unread > 0 && !highlighted && (
            <span
              aria-hidden
              className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-(--radius-pill) bg-(--color-background-negative) px-(--spacing-3xs) nuclios-type-body-x-small-medium text-(--color-text-onprimary) ring-2 ring-(--color-background-neutral)"
            >
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Button>
      }
    >
      {/* Header */}
      <div className="flex items-center justify-between px-(--spacing-2xl) pt-(--spacing-l)">
        <h2 className="nuclios-type-heading-h5-regular text-(--color-text-neutral)">
          Notifications
        </h2>
        <div className="flex items-center gap-(--spacing-3xs)">
          <Tooltip content="Notification settings">
            <Button
              size="small"
              variant="ghost"
              iconOnly
              aria-label="Notification settings"
              onClick={onSettings}
            >
              <Settings className="size-4 text-(--color-icons-neutral-subtle)" />
            </Button>
          </Tooltip>
          <Button
            size="small"
            variant="ghost"
            iconOnly
            aria-label="Close notifications"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-4 text-(--color-icons-neutral-subtle)" />
          </Button>
        </div>
      </div>

      {/* Active filter (tab-style) + filter menu */}
      <div className="mx-(--spacing-2xl) mt-(--spacing-s) flex items-end justify-between border-b border-(--color-border-subtle)">
        <span className="-mb-px border-b-[length:var(--border-width-medium)] border-(--color-border-primary) pb-(--spacing-xs) nuclios-type-body-small-medium text-(--color-text-neutral)">
          {active.label}
        </span>
        <Menu
          align="end"
          trigger={
            <Button
              size="small"
              variant="ghost"
              iconOnly
              aria-label={`Filter notifications: ${active.menu}`}
              className="mb-(--spacing-3xs)"
            >
              <SlidersHorizontal className="size-4 text-(--color-icons-neutral-subtle)" />
            </Button>
          }
          items={FILTERS.map((f) => ({
            label: f.menu,
            selected: f.key === filter,
            onSelect: () => setFilter(f.key),
          }))}
        />
      </div>

      {/* List */}
      {shown.length === 0 ? (
        <p className="px-(--spacing-2xl) py-(--spacing-14xl) text-center nuclios-type-body-default-regular text-(--color-text-neutral-muted)">
          No {active.label === "All" ? "" : active.label.toLowerCase() + " "}notifications.
        </p>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
          {shown.map((n) => (
            <li
              key={n.id}
              className="relative after:absolute after:inset-x-(--spacing-2xl) after:bottom-0 after:h-px after:bg-(--color-border-subtle) last:after:hidden"
            >
              <button
                type="button"
                onClick={() => onSelect(n)}
                className="flex w-full gap-(--spacing-l) px-(--spacing-2xl) py-(--spacing-l) text-left cursor-pointer hover:bg-(--color-background-neutral-hover) focus-visible:outline-none focus-visible:bg-(--color-background-neutral-hover)"
              >
                <Leading n={n} />
                <span className="flex min-w-0 flex-1 flex-col gap-(--spacing-2xs)">
                  <span
                    className={cn(
                      "break-words nuclios-type-body-small-regular text-(--color-text-neutral)",
                      !n.read && "font-(--font-weight-medium)!"
                    )}
                  >
                    {n.title}
                    {!n.read && <span className="sr-only"> (unread)</span>}
                  </span>
                  <span className="flex items-end justify-between gap-(--spacing-s)">
                    <span className="truncate nuclios-type-body-x-small-regular text-(--color-text-neutral-subtle)">
                      {n.location}
                    </span>
                    <span className="shrink-0 nuclios-type-body-x-small-regular text-(--color-text-neutral-muted)">
                      {relative(n.at)}
                    </span>
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-(--color-border-subtle) px-(--spacing-2xl) py-(--spacing-l)">
        <Button
          size="small"
          variant="link"
          className="underline"
          onClick={() => {
            setFilter("all");
            onViewAll();
          }}
        >
          View All
        </Button>
        <Button
          size="small"
          variant="link"
          disabled={!unread}
          onClick={onMarkAllRead}
          className="text-(--color-text-neutral-muted) hover:text-(--color-text-neutral) disabled:text-(--color-text-neutral-disabled)"
        >
          Mark all as read
        </Button>
      </div>
    </Popover>
  );
}
