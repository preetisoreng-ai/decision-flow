import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { Field, controlClass, type FieldProps } from "./field";

/**
 * Bento "Dropdown" (+ _Dropdown Input_L / _M).
 * Size: L | M · Header: Top | Left | None | Inside | Inline · State: Close | Open — built on Radix Select.
 * header="inline" puts the label on the left and the value on the right of one row, split by a separator.
 * header="inside" puts the label inside the box above the value (filter-bar style); leadingIcon
 * renders before the value (e.g. a calendar for date ranges).
 * variant="underline": transparent with only a bottom border (settings tables); `active` turns that line
 * Border/information to show a drill-in (e.g. "Custom") is open.
 * variant="filled": Background/subtle fill with no outline (filter bars); the focus/open state still
 * shows the Border/primary outline for keyboard users.
 */
export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps extends Omit<FieldProps, "children" | "className" | "header"> {
  header?: FieldProps["header"] | "inside" | "inline";
  leadingIcon?: React.ReactNode;
  variant?: "outline" | "filled" | "underline";
  /** underline variant: highlight the bottom line (Border/information). */
  active?: boolean;
  options: DropdownOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  placeholder?: string;
  size?: "l" | "m";
  disabled?: boolean;
  className?: string;
}

export function Dropdown({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select",
  size = "l",
  disabled,
  className,
  header,
  leadingIcon,
  variant = "outline",
  active,
  ...field
}: DropdownProps) {
  const inside = header === "inside";
  const inline = header === "inline";
  return (
    <Field {...field} header={inside || inline ? "none" : header} className={className}>
      <SelectPrimitive.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectPrimitive.Trigger
          id={field.id}
          aria-invalid={!!field.error || undefined}
          aria-label={(inside || inline) && typeof field.label === "string" ? field.label : undefined}
          className={cn(
            controlClass(size, !!field.error),
            "flex items-center justify-between gap-(--spacing-s) text-left data-[placeholder]:text-(--color-text-neutral-muted) data-[state=open]:border-(--color-border-primary) cursor-pointer",
            inside ? "h-14 px-(--spacing-l)" : inline ? "px-(--spacing-l)" : "pr-0",
            variant === "underline" &&
              cn(
                "rounded-none border-0 border-b bg-transparent pl-0 hover:bg-transparent focus-visible:border-(--color-border-primary)",
                active ? "border-b-2 border-(--color-border-information)" : "border-(--color-border-neutral)"
              ),
            variant === "filled" &&
              "border-transparent bg-(--color-background-subtle) hover:border-transparent hover:bg-(--color-background-subtle-hover) focus-visible:border-(--color-border-primary)"
          )}
        >
          {inline ? (
            <span className="flex min-w-0 flex-1 items-center gap-(--spacing-l)">
              <span className="shrink-0 whitespace-nowrap nuclios-type-body-small-regular text-(--color-text-neutral-subtle)">{field.label}</span>
              <span aria-hidden className="h-5 w-px shrink-0 bg-(--color-border-neutral)" />
              <span className="flex min-w-0 items-center gap-(--spacing-s) truncate nuclios-type-body-default-regular text-(--color-text-neutral)">
                {leadingIcon && <span className="inline-flex text-(--color-icons-neutral-subtle)" aria-hidden>{leadingIcon}</span>}
                <SelectPrimitive.Value placeholder={placeholder} />
              </span>
            </span>
          ) : inside ? (
            <span className="flex min-w-0 flex-col items-start gap-(--spacing-3xs)">
              <span className="nuclios-type-body-x-small-regular text-(--color-text-neutral-subtle)">{field.label}</span>
              <span className="flex min-w-0 items-center gap-(--spacing-s) nuclios-type-body-default-regular text-(--color-text-neutral)">
                {leadingIcon && <span className="inline-flex text-(--color-icons-neutral-subtle)" aria-hidden>{leadingIcon}</span>}
                <SelectPrimitive.Value placeholder={placeholder} />
              </span>
            </span>
          ) : (
            <span className="flex min-w-0 items-center gap-(--spacing-s)">
              {leadingIcon && <span className="inline-flex text-(--color-icons-neutral-subtle)" aria-hidden>{leadingIcon}</span>}
              <SelectPrimitive.Value placeholder={placeholder} />
            </span>
          )}
          <span
            className={cn(
              "flex h-full items-center text-(--color-icons-neutral)",
              inside || inline || variant === "underline" ? "" : "border-l border-(--color-border-subtle)",
              !inside && !inline && (variant === "underline" ? "pl-(--spacing-s)" : size === "l" ? "px-(--spacing-xl)" : "px-(--spacing-m)")
            )}
          >
            <SelectPrimitive.Icon asChild>
              <Icons.chevronDown className="size-4 transition-transform [[data-state=open]_&]:rotate-180" />
            </SelectPrimitive.Icon>
          </span>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={4}
            className="z-50 min-w-(--radix-select-trigger-width) overflow-hidden rounded-(--radius-container-set-1) border border-(--color-border-muted) bg-(--color-background-neutral) shadow-(--shadow-4)"
          >
            <SelectPrimitive.Viewport className="p-(--spacing-2xs)">
              {options.map((o) => (
                <SelectPrimitive.Item
                  key={o.value}
                  value={o.value}
                  disabled={o.disabled}
                  className="relative flex h-9 cursor-pointer select-none items-center rounded-(--radius-component-set-1) pl-(--spacing-s) pr-8 nuclios-type-body-default-regular text-(--color-text-neutral) outline-none data-[highlighted]:bg-(--color-background-neutral-hover) data-[state=checked]:bg-(--color-background-primary-muted) data-[disabled]:text-(--color-text-neutral-disabled)"
                >
                  <SelectPrimitive.ItemText>{o.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className="absolute right-(--spacing-s) text-(--color-icons-primary)">
                    <Icons.check className="size-4" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </Field>
  );
}
