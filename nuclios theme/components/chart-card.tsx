import * as React from "react";
import { Info, MessageCircle, MoreHorizontal } from "lucide-react";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Menu, type MenuEntry } from "./overlays";
import { Tooltip } from "./tooltip";

/**
 * Dashboard widget card: bordered container (Border/subtle, container set 2 radius) with a header
 * row — title + inline info tooltip, optional subtitle or headline metric (Page 1 below-title big
 * metric or Page 2 right-aligned status metric), and standard widget actions (comments toggle with
 * count, horizontal overflow menu). Body holds the chart.
 */
export interface ChartCardProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title: string;
  subtitle?: React.ReactNode;
  metric?: {
    value: React.ReactNode;
    caption?: React.ReactNode;
    delta?: { value: string; direction: "up" | "down"; positive?: boolean };
    placement?: "below" | "right";
  };
  /** Tooltip text for the info icon next to the title; omit to hide the icon. */
  info?: string;
  /** Comments toggle; omit to hide. */
  comments?: { open: boolean; count?: number; onToggle: () => void };
  /** Overflow menu entries; omit to hide the ⋯ button. */
  menu?: MenuEntry[];
  /** Extra header actions rendered before the standard ones. */
  actions?: React.ReactNode;
  bodyClassName?: string;
}

const icon = "size-4 text-(--color-icons-neutral-subtle)";

/**
 * Widget comments toggle.
 * - no comments: ghost icon button
 * - has comments: Background/subtle (grey) with icon + count (matches PDF "[💬 3]" pill)
 * - hover / open: Background/primary-muted with Icons/primary + Text/primary
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
        leadingIcon={has ? <MessageCircle className={cn("size-3.5", tone)} /> : undefined}
        onClick={onToggle}
        className={cn(
          "group/comments transition-shadow hover:bg-(--color-background-primary-muted)",
          has && !open && "border border-(--color-border-subtle) bg-(--color-background-subtle)",
          open && "bg-(--color-background-primary-muted)",
          flash &&
            "ring-2 ring-(--color-border-primary) ring-offset-1 ring-offset-(--color-background-neutral)"
        )}
      >
        {has ? (
          <span
            className={cn(
              "nuclios-type-body-small-medium",
              open
                ? "text-(--color-text-primary)"
                : "text-(--color-text-neutral) group-hover/comments:text-(--color-text-primary)"
            )}
          >
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
  subtitle,
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
  const placement = metric?.placement ?? "below";
  const good = metric?.delta ? (metric.delta.positive ?? metric.delta.direction === "up") : false;

  return (
    <section
      aria-label={title}
      className={cn(
        "flex min-w-0 flex-col gap-(--spacing-6xl) rounded-(--radius-container-set-2) border border-(--color-border-subtle) bg-(--color-background-neutral) px-(--spacing-2xl) pt-(--spacing-l) pb-(--spacing-2xl)",
        className
      )}
      {...props}
    >
      <header className="flex flex-col gap-(--spacing-2xs)">
        <div className="flex items-center justify-between gap-(--spacing-l)">
          <div className="flex min-w-0 items-center gap-(--spacing-xs)">
            <h3 className="truncate nuclios-type-body-default-medium text-(--color-text-neutral)">
              {title}
            </h3>
            {info && (
              <Tooltip content={info}>
                <button
                  type="button"
                  aria-label={`About ${title}`}
                  className="inline-flex size-5 shrink-0 items-center justify-center rounded-(--radius-component-set-1) text-(--color-icons-neutral-subtle) hover:bg-(--color-background-neutral-hover) hover:text-(--color-icons-neutral) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-primary-focused) cursor-pointer"
                >
                  <Info className="size-3.5" />
                </button>
              </Tooltip>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-(--spacing-2xs)">
            {placement === "right" && metric && (
              <span className="nuclios-type-body-small-regular text-(--color-text-neutral-subtle)">
                {metric.value}
                {metric.caption ? ` ${metric.caption}` : ""}
              </span>
            )}
            {actions}
            {comments && <CommentsToggle title={title} {...comments} />}
            {menu && (
              <Menu
                align="end"
                trigger={
                  <Button
                    size="small"
                    variant="ghost"
                    iconOnly
                    aria-label={`${title} options`}
                    className="border border-transparent hover:border-(--color-border-subtle)"
                  >
                    <MoreHorizontal className={icon} />
                  </Button>
                }
                items={menu}
              />
            )}
          </div>
        </div>

        {subtitle && (
          <p className="nuclios-type-body-small-regular text-(--color-text-neutral-subtle)">
            {subtitle}
          </p>
        )}

        {placement === "below" && metric && (
          <div className="mt-(--spacing-3xs) flex flex-wrap items-baseline gap-(--spacing-s)">
            <span className="nuclios-type-heading-h3-medium tracking-tight text-(--color-text-neutral)">
              {metric.value}
            </span>
            {metric.delta && (
              <span
                className={cn(
                  "inline-flex items-center gap-(--spacing-3xs) rounded-(--radius-component-set-1) px-(--spacing-xs) py-(--spacing-3xs) nuclios-type-body-x-small-medium",
                  good
                    ? "bg-(--color-background-positive-subtle) text-(--color-text-positive)"
                    : "bg-(--color-background-negative-subtle) text-(--color-text-negative)"
                )}
              >
                {metric.delta.direction === "up" ? (
                  <Icons.trendingUp className="size-3" aria-hidden />
                ) : (
                  <Icons.trendingDown className="size-3" aria-hidden />
                )}
                {metric.delta.value}
              </span>
            )}
            {metric.caption && (
              <span className="nuclios-type-body-small-regular text-(--color-text-neutral-subtle)">
                {metric.caption}
              </span>
            )}
          </div>
        )}
      </header>
      <div className={cn("min-h-0 w-full", bodyClassName)}>{children}</div>
    </section>
  );
}
