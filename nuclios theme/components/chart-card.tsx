import * as React from "react";
import { Info, MessageCircle, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Menu, type MenuEntry } from "./overlays";
import { Tooltip } from "./tooltip";

/**
 * Dashboard widget card: bordered container (Border/subtle, container set 2 radius) with a header
 * row — title, optional headline metric ("90.6%" over "Forecast"), and the standard widget actions
 * (info tooltip, comments toggle with count, overflow menu). Body holds the chart.
 * Not a documented Bento page; composed from NucliOS Button / Tooltip / Menu for dashboards.
 */
export interface ChartCardProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title: string;
  metric?: { value: React.ReactNode; caption?: React.ReactNode };
  /** Tooltip text for the info icon; omit to hide the icon. */
  info?: string;
  /** Comments toggle; omit to hide. */
  comments?: { open: boolean; count?: number; onToggle: () => void };
  /** Overflow menu entries; omit to hide the ⋮ button. */
  menu?: MenuEntry[];
  /** Extra header actions rendered before the standard ones. */
  actions?: React.ReactNode;
  bodyClassName?: string;
}

const icon = "size-4 text-(--color-icons-neutral-subtle)";

/**
 * Widget comments toggle.
 * - no comments: ghost icon button
 * - has comments: Background/subtle (grey) with icon + count
 * - hover / open: Background/primary-muted (purple) with Icons/primary + Text/primary
 * - when the count goes up (a new comment): a Border/primary ring flashes for ~1.6s
 */
export function CommentsToggle({
  title,
  open,
  count = 0,
  onToggle,
}: {
  title: string;
  open: boolean;
  count?: number;
  onToggle: () => void;
}) {
  const prev = React.useRef(count);
  const [flash, setFlash] = React.useState(false);
  React.useEffect(() => {
    if (count > prev.current) {
      setFlash(true);
      const id = setTimeout(() => setFlash(false), 1600);
      prev.current = count;
      return () => clearTimeout(id);
    }
    prev.current = count;
  }, [count]);

  const has = count > 0;
  const tone = open
    ? "text-(--color-icons-primary)"
    : "text-(--color-icons-neutral-subtle) group-hover/comments:text-(--color-icons-primary)";
  return (
    <Tooltip content={open ? "Hide comments" : "Comments"}>
      <Button
        size="small"
        variant="ghost"
        iconOnly={!has}
        aria-pressed={open}
        aria-label={`Comments on ${title}${has ? ` (${count})` : ""}`}
        leadingIcon={has ? <MessageCircle className={cn("size-4", tone)} /> : undefined}
        onClick={onToggle}
        className={cn(
          "group/comments transition-shadow hover:bg-(--color-background-primary-muted)",
          has && !open && "bg-(--color-background-subtle)",
          open && "bg-(--color-background-primary-muted)",
          flash && "ring-2 ring-(--color-border-primary) ring-offset-1 ring-offset-(--color-background-neutral)"
        )}
      >
        {has ? (
          <span className={cn("nuclios-type-body-small-medium", open ? "text-(--color-text-primary)" : "text-(--color-text-neutral-subtle) group-hover/comments:text-(--color-text-primary)")}>
            {count}
          </span>
        ) : (
          <MessageCircle className={cn("size-4", tone)} />
        )}
      </Button>
    </Tooltip>
  );
}

export function ChartCard({
  title,
  metric,
  info,
  comments,
  menu,
  actions,
  bodyClassName,
  className,
  children,
  ...props
}: ChartCardProps) {
  return (
    <section
      aria-label={title}
      className={cn(
        "flex min-w-0 flex-col gap-(--spacing-l) rounded-(--radius-container-set-2) border border-(--color-border-subtle) bg-(--color-background-neutral) p-(--spacing-2xl)",
        className
      )}
      {...props}
    >
      <header className="flex items-start gap-(--spacing-l)">
        <h3 className="min-w-0 flex-1 line-clamp-2 pt-(--spacing-3xs) nuclios-type-body-large-medium text-(--color-text-neutral)">
          {title}
        </h3>
        {metric && (
          <div className="flex shrink-0 flex-col items-end">
            <span className="nuclios-type-body-large-medium text-(--color-text-neutral)">
              {metric.value}
            </span>
            {metric.caption && (
              <span className="nuclios-type-body-x-small-regular text-(--color-text-neutral-subtle)">
                {metric.caption}
              </span>
            )}
          </div>
        )}
        <div className="flex shrink-0 items-center gap-(--spacing-3xs)">
          {actions}
          {info && (
            <Tooltip content={info}>
              <Button size="small" variant="ghost" iconOnly aria-label={`About ${title}`}>
                <Info className={icon} />
              </Button>
            </Tooltip>
          )}
          {comments && <CommentsToggle title={title} {...comments} />}
          {menu && (
            <Menu
              align="end"
              trigger={
                <Button size="small" variant="ghost" iconOnly aria-label={`${title} options`}>
                  <MoreVertical className={icon} />
                </Button>
              }
              items={menu}
            />
          )}
        </div>
      </header>
      <div className={cn("min-h-0", bodyClassName)}>{children}</div>
    </section>
  );
}
