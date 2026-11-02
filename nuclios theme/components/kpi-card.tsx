import * as React from "react";
import { Card } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/**
 * Bento "KPI Card" → "_Standard KPI Cards" (45 variants).
 * Layout: Inline | Stacked | Centered | Split | Hybrid · Content Alignment: Left | Center | Right
 */
export interface KpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  delta?: { value: string; direction: "up" | "down"; positive?: boolean };
  caption?: React.ReactNode;
  icon?: React.ReactNode;
  layout?: "inline" | "stacked" | "centered";
}

export function KpiCard({
  label,
  value,
  delta,
  caption,
  icon,
  layout = "inline",
  className,
  ...props
}: KpiCardProps) {
  const good = delta ? (delta.positive ?? delta.direction === "up") : false;
  return (
    <Card
      className={cn(
        "gap-(--spacing-2xl) rounded-(--radius-container-set-2) border-(--color-border-muted) bg-(--color-background-kpi) p-(--spacing-3xl) shadow-none",
        layout === "inline" ? "flex-row items-start" : "flex-col",
        layout === "centered" && "items-center text-center",
        className
      )}
      {...props}
    >
      {icon && (
        <span
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-(--radius-pill) border border-(--color-border-neutral) text-(--color-icons-neutral)"
          aria-hidden
        >
          {icon}
        </span>
      )}
      <div className="flex min-w-0 flex-col gap-(--spacing-l)">
        <p className="nuclios-type-body-default-regular text-(--color-text-neutral-muted)">
          {label}
        </p>
        <div
          className={cn(
            "flex flex-wrap items-end gap-(--spacing-l)",
            layout === "centered" && "justify-center"
          )}
        >
          <span className="nuclios-type-heading-h3-medium text-(--color-text-neutral)">
            {value}
          </span>
          {delta && (
            <span
              className={cn(
                "mb-1 inline-flex items-center gap-(--spacing-3xs) rounded-(--radius-pill) px-(--spacing-xs) py-(--spacing-3xs) nuclios-type-body-small-medium",
                good
                  ? "bg-(--color-background-positive-subtle) text-(--color-text-positive)"
                  : "bg-(--color-background-negative-subtle) text-(--color-text-negative)"
              )}
            >
              {delta.direction === "up" ? (
                <Icons.trendingUp className="size-3.5" aria-hidden />
              ) : (
                <Icons.trendingDown className="size-3.5" aria-hidden />
              )}
              {delta.value}
            </span>
          )}
        </div>
        {caption && (
          <p className="nuclios-type-body-small-regular text-(--color-text-neutral-muted)">
            {caption}
          </p>
        )}
      </div>
    </Card>
  );
}
