import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Button as BaseButton } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/**
 * Bento "Button" (450 variants).
 * Size: Large | Medium | Small · Type: Filled | Border | Ghost | Link | Neutral | Secondary
 * isDestructive · State: Default | Hover | Focus | Disabled | Loading · isFullWidth · iconOnly
 * Composes the base Button — styling is token-driven overrides only.
 */
export const nucliosButton = cva(
  "gap-(--spacing-s) rounded-(--radius-component-set-1) border font-medium shadow-none transition-colors focus-visible:ring-2 focus-visible:ring-(--color-border-primary-focused) focus-visible:ring-offset-1 disabled:opacity-100",
  {
    variants: {
      size: {
        large: "h-11 px-(--spacing-2xl) py-(--spacing-m) nuclios-type-body-large-medium",
        medium: "h-9 px-(--spacing-l) py-(--spacing-s) nuclios-type-body-default-medium",
        small: "h-7 px-(--spacing-s) py-(--spacing-xs) nuclios-type-body-small-medium",
      },
      type: {
        filled:
          "border-transparent bg-(--color-background-primary) text-(--color-text-onprimary) hover:bg-(--color-background-primary-hover) active:bg-(--color-background-primary-pressed) disabled:bg-(--color-background-primary-disabled) disabled:text-(--color-text-onprimary-disabled)",
        border:
          "border-(--color-border-primary) bg-(--color-surface-0) text-(--color-text-primary) hover:bg-(--color-background-primary-muted) active:bg-(--color-background-primary-muted-pressed) disabled:border-(--color-border-primary-disabled) disabled:text-(--color-text-primary-disabled)",
        ghost:
          "border-transparent bg-transparent text-(--color-text-primary) hover:bg-(--color-background-primary-muted) active:bg-(--color-background-primary-muted-pressed) disabled:text-(--color-text-primary-disabled)",
        link: "h-auto border-transparent bg-transparent px-0 py-0 text-(--color-text-link) underline-offset-4 hover:underline hover:text-(--color-text-link-hover) disabled:text-(--color-text-link-disabled)",
        neutral:
          "border-(--color-border-neutral) bg-(--color-background-neutral) text-(--color-text-neutral) hover:bg-(--color-background-neutral-hover) active:bg-(--color-background-neutral-pressed) disabled:text-(--color-text-neutral-disabled)",
        secondary:
          "border-transparent bg-(--color-background-secondary) text-(--color-text-onsecondary) hover:bg-(--color-background-secondary-hover) active:bg-(--color-background-secondary-pressed) disabled:bg-(--color-background-secondary-disabled) disabled:text-(--color-text-onsecondary-disabled)",
      },
      destructive: { true: "", false: "" },
      fullWidth: { true: "w-full", false: "" },
      iconOnly: { true: "px-0 aspect-square", false: "" },
    },
    compoundVariants: [
      {
        type: "filled",
        destructive: true,
        class:
          "bg-(--color-background-negative) hover:bg-(--color-background-negative-hover) active:bg-(--color-background-negative-pressed) disabled:bg-(--color-background-negative-disabled)",
      },
      {
        type: ["border", "ghost", "link", "neutral"],
        destructive: true,
        class:
          "text-(--color-text-negative) border-(--color-border-negative) hover:bg-(--color-background-negative-subtle)",
      },
    ],
    defaultVariants: {
      size: "medium",
      type: "filled",
      destructive: false,
      fullWidth: false,
      iconOnly: false,
    },
  }
);

export interface NucliosButtonProps
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type">,
    Omit<VariantProps<typeof nucliosButton>, "type"> {
  /** HTML button type (the Bento "Type" prop is `variant` here to avoid the clash). */
  htmlType?: "button" | "submit" | "reset";
  variant?: VariantProps<typeof nucliosButton>["type"];
  loading?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, NucliosButtonProps>(
  (
    {
      className,
      size,
      variant,
      destructive,
      fullWidth,
      iconOnly,
      loading,
      leadingIcon,
      trailingIcon,
      children,
      disabled,
      htmlType = "button",
      ...props
    },
    ref
  ) => (
    <BaseButton
      ref={ref}
      type={htmlType}
      variant="ghost"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        nucliosButton({ size, type: variant, destructive, fullWidth, iconOnly }),
        className
      )}
      {...props}
    >
      {loading ? <Icons.spinner className="size-4 animate-spin" aria-hidden /> : leadingIcon}
      {!iconOnly && children}
      {iconOnly && !loading && children}
      {!loading && trailingIcon}
    </BaseButton>
  )
);
Button.displayName = "NucliosButton";
