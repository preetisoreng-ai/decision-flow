import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/**
 * Bento "Chips Component" + "_Chips base".
 * State: Rest | Hover | Disabled | Error | Success | Warning | Selected
 * Size: XS | S | M | L · Type: Default | Avatar | Icon Only
 */
const chip = cva(
  "inline-flex items-center gap-(--spacing-3xs) border-transparent rounded-(--radius-pill) font-normal transition-colors",
  {
    variants: {
      size: {
        xs: "h-[18px] px-(--spacing-2xs) nuclios-type-body-x-small-regular",
        s: "h-5 px-(--spacing-xs) nuclios-type-body-x-small-regular",
        m: "h-6 px-(--spacing-s) nuclios-type-body-small-regular",
        l: "h-7 px-(--spacing-m) nuclios-type-body-default-regular",
      },
      state: {
        rest: "bg-(--color-background-subtle) text-(--color-text-neutral) hover:bg-(--color-background-subtle-hover)",
        selected: "bg-(--color-background-primary-selected) text-(--color-text-primary)",
        error: "bg-(--color-background-negative-subtle) text-(--color-text-negative)",
        success: "bg-(--color-background-positive-subtle) text-(--color-text-positive)",
        warning: "bg-(--color-background-warning-subtle) text-(--color-text-warning)",
        disabled:
          "bg-(--color-background-subtle-disabled) text-(--color-text-neutral-disabled) pointer-events-none",
      },
    },
    defaultVariants: { size: "s", state: "rest" },
  }
);

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof chip> {
  avatar?: React.ReactNode;
  icon?: React.ReactNode;
  onRemove?: () => void;
  removeLabel?: string;
}

export function Chip({
  className,
  size,
  state,
  avatar,
  icon,
  onRemove,
  removeLabel = "Remove",
  children,
  ...props
}: ChipProps) {
  return (
    <Badge
      variant="outline"
      className={cn(chip({ size, state }), className)}
      aria-disabled={state === "disabled" || undefined}
      {...props}
    >
      {avatar && (
        <span className="-ml-0.5 inline-flex size-4 overflow-hidden rounded-full">{avatar}</span>
      )}
      {icon}
      {children}
      {onRemove && (
        <button
          type="button"
          aria-label={removeLabel}
          onClick={onRemove}
          className="ml-0.5 inline-flex size-3 items-center justify-center rounded-full text-(--color-icons-neutral) hover:bg-(--color-background-subtle-pressed) cursor-pointer"
        >
          <Icons.close className="size-3" aria-hidden />
        </button>
      )}
    </Badge>
  );
}
