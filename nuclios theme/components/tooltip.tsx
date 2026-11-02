import * as React from "react";
import {
  Tooltip as BaseTooltip,
  TooltipContent as BaseContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * Bento "Tooltip" (36 variants).
 * Variant: Light Tooltip | Dark Tooltip · Supporting text · Arrow placement (→ Radix `side`/`align`).
 */
export { TooltipProvider, TooltipTrigger };

export interface TooltipProps {
  content: React.ReactNode;
  supportingText?: React.ReactNode;
  variant?: "light" | "dark";
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  children: React.ReactElement;
}

export function Tooltip({
  content,
  supportingText,
  variant = "light",
  side = "top",
  align = "center",
  children,
}: TooltipProps) {
  return (
    <BaseTooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <BaseContent
        side={side}
        align={align}
        className={cn(
          "max-w-[280px] border-0 rounded-(--radius-component-set-3) px-(--spacing-l) py-(--spacing-s) shadow-(--shadow-3)",
          variant === "light"
            ? "bg-(--color-background-neutral) text-(--color-text-neutral) dark:bg-(--color-background-neutral) dark:text-(--color-text-neutral)"
            : "bg-(--color-background-inverse) text-(--color-text-inverse) dark:bg-(--color-background-inverse) dark:text-(--color-text-inverse)"
        )}
      >
        <p className="nuclios-type-body-small-medium">{content}</p>
        {supportingText && (
          <p className="mt-(--spacing-2xs) nuclios-type-body-x-small-regular opacity-80">
            {supportingText}
          </p>
        )}
      </BaseContent>
    </BaseTooltip>
  );
}
