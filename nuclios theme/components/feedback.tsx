import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { Info } from "lucide-react";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Bento "Toast Message" (8): Type Informative|Warning|Success|Danger  */
/*                            Content Vertical|Horizontal              */
/* ------------------------------------------------------------------ */
type ToastType = "informative" | "warning" | "success" | "danger";
const toastStyle: Record<ToastType, { box: string; icon: React.ReactNode }> = {
  informative: {
    box: "bg-(--color-background-information-subtle) border-(--color-border-information)",
    icon: <Info className="size-6 text-(--color-icons-information)" />,
  },
  warning: {
    box: "bg-(--color-background-warning-subtle) border-(--color-border-warning)",
    icon: <Icons.alertCircle className="size-6 text-(--color-icons-warning)" />,
  },
  success: {
    box: "bg-(--color-background-positive-subtle) border-(--color-border-positive)",
    icon: <Icons.checkCircle className="size-6 text-(--color-icons-positive)" />,
  },
  danger: {
    box: "bg-(--color-background-negative-subtle) border-(--color-border-negative)",
    icon: <Icons.alertCircle className="size-6 text-(--color-icons-negative)" />,
  },
};

export interface ToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  type?: ToastType;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  layout?: "vertical" | "horizontal";
  onClose?: () => void;
}

export function Toast({
  type = "informative",
  title,
  description,
  actions,
  layout = "vertical",
  onClose,
  className,
  ...props
}: ToastProps) {
  const s = toastStyle[type];
  return (
    <div
      role={type === "danger" ? "alert" : "status"}
      className={cn(
        "flex w-full max-w-[650px] gap-(--spacing-s) rounded-(--radius-component-set-1) border p-(--spacing-l) text-(--color-text-neutral)",
        s.box,
        className
      )}
      {...props}
    >
      <span className="shrink-0" aria-hidden>
        {s.icon}
      </span>
      <div
        className={cn(
          "flex min-w-0 flex-1 gap-(--spacing-l)",
          layout === "vertical" ? "flex-col" : "flex-row items-center justify-between"
        )}
      >
        <div className="flex flex-col gap-(--spacing-2xs)">
          <p className="nuclios-type-body-large-medium">{title}</p>
          {description && (
            <p className="nuclios-type-body-default-regular text-(--color-text-neutral-subtle)">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex gap-(--spacing-l)">{actions}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onClose}
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-(--radius-component-set-1) text-(--color-icons-neutral) hover:bg-(--color-surface-30-inverse) cursor-pointer"
        >
          <Icons.close className="size-4" />
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bento "Progress bar" (66): Progress 0–100% · Label False|Right|Bottom|Top floating… */
/* ------------------------------------------------------------------ */
export interface ProgressProps extends React.ComponentPropsWithoutRef<
  typeof ProgressPrimitive.Root
> {
  value: number;
  label?: "none" | "right" | "bottom" | "top";
  text?: string;
  indicatorClassName?: string;
}

export function Progress({
  value,
  label = "none",
  text,
  indicatorClassName,
  className,
  ...props
}: ProgressProps) {
  const pct = Math.max(0, Math.min(100, value));
  const caption = (
    <span className="nuclios-type-body-small-medium text-(--color-text-neutral) whitespace-nowrap">
      {text ?? `${Math.round(pct)}%`}
    </span>
  );
  return (
    <div
      className={cn(
        "flex w-full gap-(--spacing-l)",
        label === "right" ? "flex-row items-center" : "flex-col",
        className
      )}
    >
      {label === "top" && caption}
      <ProgressPrimitive.Root
        value={pct}
        className="relative h-2 w-full overflow-hidden rounded-(--radius-component-set-4) bg-(--color-background-subtle)"
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full rounded-(--radius-component-set-4) bg-(--color-background-primary) transition-[width] duration-300",
            indicatorClassName
          )}
          style={{ width: `${pct}%` }}
        />
      </ProgressPrimitive.Root>
      {(label === "right" || label === "bottom") && caption}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bento "Breadcrumb": items Rest|Hover|Selected|Disabled|Current       */
/*                     Divider Type ArrowRight|CaretRight|Slash         */
/* ------------------------------------------------------------------ */
export interface Crumb {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export function Breadcrumb({
  items,
  divider = "slash",
  size = "s",
  className,
}: {
  items: Crumb[];
  divider?: "slash" | "caret" | "arrow";
  size?: "s" | "m" | "l";
  className?: string;
}) {
  const sep = divider === "slash" ? "/" : divider === "caret" ? "›" : "→";
  const type =
    size === "s"
      ? "nuclios-type-body-small-regular"
      : size === "m"
        ? "nuclios-type-body-default-regular"
        : "nuclios-type-body-large-regular";
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-(--spacing-2xs)">
        {items.map((c, i) => {
          const current = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-(--spacing-2xs)">
              {current ? (
                <span
                  aria-current="page"
                  className={cn(
                    "flex items-center gap-(--spacing-xs) font-(--font-weight-medium)! text-(--color-text-primary)",
                    type
                  )}
                >
                  {c.icon}
                  {c.label}
                </span>
              ) : (
                <a
                  href={c.href ?? "#"}
                  onClick={(e) => {
                    if (c.onClick) {
                      e.preventDefault();
                      c.onClick();
                    }
                  }}
                  className={cn(
                    "flex items-center gap-(--spacing-xs) rounded-(--radius-component-set-1) text-(--color-text-neutral-muted) hover:text-(--color-text-neutral) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-primary-focused)",
                    type
                  )}
                >
                  {c.icon}
                  {c.label}
                </a>
              )}
              {!current && (
                <span aria-hidden className="px-(--spacing-3xs) text-(--color-text-neutral-muted)">
                  {sep}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
