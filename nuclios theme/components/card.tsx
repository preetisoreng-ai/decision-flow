import * as React from "react";
import { Card as BaseCard, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Bento "Card" (+ _card_header, _card_body, _card_footer).
 * Layout: Default | Custom · State: Rest | Hover | Selected | Focused | Disabled
 */
export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  leading?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  interactive?: boolean;
}

export function Card({
  title,
  subtitle,
  leading,
  action,
  footer,
  selected,
  disabled,
  interactive,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <BaseCard
      aria-disabled={disabled || undefined}
      data-selected={selected || undefined}
      tabIndex={interactive && !disabled ? 0 : undefined}
      className={cn(
        "gap-(--spacing-3xs) rounded-(--radius-container-set-1) border-(--color-border-subtle) bg-(--color-background-neutral) shadow-none text-(--color-text-neutral)",
        interactive &&
          "cursor-pointer transition-colors hover:border-(--color-border-neutral-selected) hover:shadow-(--shadow-2) focus-visible:outline-none focus-visible:border-(--color-border-primary-focused) focus-visible:ring-2 focus-visible:ring-(--color-border-primary-focused)",
        selected && "border-(--color-border-primary)",
        disabled &&
          "pointer-events-none bg-(--color-background-neutral-disabled) text-(--color-text-neutral-disabled)",
        className
      )}
      {...props}
    >
      {(title || action || leading) && (
        <CardHeader className="flex-row items-center gap-(--spacing-l) space-y-0 border-b-0 p-(--spacing-l)">
          {leading}
          <div className="min-w-0 flex-1">
            {title && <h3 className="nuclios-type-body-large-medium truncate">{title}</h3>}
            {subtitle && (
              <p className="nuclios-type-body-small-regular text-(--color-text-neutral-muted)">
                {subtitle}
              </p>
            )}
          </div>
          {action}
        </CardHeader>
      )}
      <CardContent className="px-(--spacing-l) pt-0 pb-(--spacing-l) nuclios-type-body-small-regular text-(--color-text-neutral-subtle)">
        {children}
      </CardContent>
      {footer && (
        <CardFooter className="justify-end gap-(--spacing-l) border-t border-(--color-border-muted) p-(--spacing-l)">
          {footer}
        </CardFooter>
      )}
    </BaseCard>
  );
}
