import * as React from "react";
import {
  Tabs as BaseTabs,
  TabsContent as BaseContent,
  TabsList as BaseList,
  TabsTrigger as BaseTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/**
 * Bento "Tabs" (132 variants) built on the base Radix Tabs.
 * Type: Stroke | Ghost | Filled · Size: Small (36px, body-default) | Medium (44px, body-x-large)
 * Orientation: Horizontal | Vertical · Leading Icon
 * tone="brand": selected tab label in Text/primary with a Border/primary underline (Border Width/Medium).
 */
type TabType = "stroke" | "ghost" | "filled";
type TabSize = "small" | "medium";
type TabTone = "neutral" | "brand";
const Ctx = React.createContext<{ type: TabType; size: TabSize; tone: TabTone }>({
  type: "stroke",
  size: "small",
  tone: "neutral",
});

export const Tabs = BaseTabs;

export function TabsList({
  type = "stroke",
  size = "small",
  tone = "neutral",
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseList> & { type?: TabType; size?: TabSize; tone?: TabTone }) {
  return (
    <Ctx.Provider value={{ type, size, tone }}>
      <BaseList
        variant="line"
        className={cn(
          "gap-(--spacing-l) bg-(--color-surface-0) data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch data-[orientation=vertical]:border-b-0",
          type === "stroke" ? "border-b border-(--color-border-subtle)" : "border-b-0",
          className
        )}
        {...props}
      />
    </Ctx.Provider>
  );
}

export function TabsTrigger({
  className,
  icon,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseTrigger> & { icon?: React.ReactNode }) {
  const { type, size, tone } = React.useContext(Ctx);
  return (
    <BaseTrigger
      className={cn(
        "gap-(--spacing-s) p-(--spacing-s) text-(--color-text-neutral) aria-selected:text-(--color-text-neutral) font-normal aria-selected:font-medium group-data-[variant=line]/tabs-list:aria-selected:font-medium",
        "hover:bg-(--color-background-neutral-hover) disabled:text-(--color-text-neutral-disabled)",
        size === "small"
          ? "h-9 nuclios-type-body-default-regular"
          : "h-11 nuclios-type-body-x-large-regular",
        // Type classes set font-weight outside Tailwind's layers, so the selected weight needs "!".
        "aria-selected:font-(--font-weight-medium)!",
        type === "stroke" && "after:bg-(--color-border-inverted)",
        type === "stroke" &&
          tone === "brand" &&
          "aria-selected:text-(--color-text-primary) after:h-(--border-width-medium) after:bg-(--color-border-primary)",
        type === "ghost" &&
          "after:hidden rounded-(--radius-component-set-1) aria-selected:bg-(--color-background-neutral-selected)",
        type === "filled" &&
          "after:hidden rounded-(--radius-component-set-1) aria-selected:bg-(--color-background-primary) aria-selected:text-(--color-text-onprimary)",
        className
      )}
      {...props}
    >
      {icon && (
        <span
          className="inline-flex size-5 items-center justify-center text-(--color-icons-neutral) [[aria-selected=true]_&]:text-current"
          aria-hidden
        >
          {icon}
        </span>
      )}
      {children}
    </BaseTrigger>
  );
}

export function TabsContent({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseContent>) {
  return (
    <BaseContent
      className={cn("mt-(--spacing-2xl) text-(--color-text-neutral)", className)}
      {...props}
    />
  );
}
