import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Bento "KPI Card" → "_Standard KPI Cards" + PDF Directions Page 2 & Page 3 variants:
 * - Page 2: Label → Big Value → Delta badge (`↑ 11.8%`) + comparison text (`vs last year`)
 * - Page 3: Same header + bottom sparkline slot (`sparkline`)
 */
export interface KpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  delta?: {
    value: string;
    direction: "up" | "down";
    positive?: boolean;
    label?: string;
  };
  caption?: React.ReactNode;
  icon?: React.ReactNode;
  sparkline?: React.ReactNode;
  layout?: "inline" | "stacked" | "centered";
}

export function KpiCard({
  label,
  value,
  delta,
  caption,
  icon,
  sparkline,
  layout = "stacked",
  className,
  ...props
}: KpiCardProps) {
  const good = delta ? (delta.positive ?? delta.direction === "up") : false;
  return (
    <Card
      className={cn(
        "justify-between gap-(--spacing-l) rounded-(--radius-container-set-2) border-(--color-border-subtle) bg-(--color-background-neutral) px-(--spacing-2xl) py-(--spacing-l) shadow-none",
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
      <div className="flex min-w-0 flex-1 flex-col gap-(--spacing-xs)">
        <p className="nuclios-type-body-small-regular text-(--color-text-neutral-subtle)">
          {label}
        </p>
        <div
          className={cn(
            "flex flex-wrap items-baseline gap-(--spacing-s)",
            layout === "centered" && "justify-center"
          )}
        >
          <span className="nuclios-type-heading-h3-medium tracking-tight text-(--color-text-neutral)">
            {value}
          </span>
        </div>
        {(delta || caption) && (
          <div className="mt-(--spacing-3xs) flex flex-wrap items-center gap-(--spacing-xs)">
            {delta && (
              <span
                className={cn(
                  "inline-flex items-center gap-(--spacing-3xs) rounded-(--radius-component-set-1) px-(--spacing-xs) py-(--spacing-3xs) nuclios-type-body-x-small-medium",
                  good
                    ? "bg-(--color-background-positive-subtle) text-(--color-text-positive)"
                    : "bg-(--color-background-negative-subtle) text-(--color-text-negative)"
                )}
              >
                <span aria-hidden>{delta.direction === "up" ? "↑" : "↓"}</span>
                {delta.value}
              </span>
            )}
            {(delta?.label || caption) && (
              <span className="nuclios-type-body-x-small-regular text-(--color-text-neutral-subtle)">
                {delta?.label ?? caption}
              </span>
            )}
          </div>
        )}
      </div>
      {sparkline && <div className="mt-(--spacing-xs) h-10 w-full">{sparkline}</div>}
    </Card>
  );
}
