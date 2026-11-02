import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as MenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const closeBtn =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-(--radius-component-set-1) text-(--color-icons-neutral) hover:bg-(--color-background-neutral-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-primary-focused) cursor-pointer";

/* ------------------------------------------------------------------ */
/* Bento "Modal Main Component": Size Xl | L | M | S | Xs               */
/* ------------------------------------------------------------------ */
const modalWidth = {
  xs: "max-w-[400px]",
  s: "max-w-[560px]",
  m: "max-w-[720px]",
  l: "max-w-[960px]",
  xl: "max-w-[1800px]",
};

export interface ModalProps {
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
  trigger?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  size?: keyof typeof modalWidth;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

export function Modal({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  size = "s",
  footer,
  children,
}: ModalProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-(--color-surface-30-inverse-static)" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 flex-col gap-(--spacing-14xl) overflow-y-auto rounded-(--radius-container-set-2) bg-(--color-surface-overlay) p-(--spacing-14xl) text-(--color-text-neutral) shadow-(--shadow-8) focus:outline-none",
            size === "xs" || size === "s" ? "gap-(--spacing-6xl) p-(--spacing-6xl)" : "",
            modalWidth[size]
          )}
        >
          <div className="flex items-start justify-between gap-(--spacing-2xl)">
            <div className="flex flex-col gap-(--spacing-2xs)">
              <DialogPrimitive.Title className="nuclios-type-heading-h5-medium">
                {title}
              </DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="nuclios-type-body-default-regular text-(--color-text-neutral-muted)">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close className={closeBtn} aria-label="Close">
              <Icons.close className="size-5" />
            </DialogPrimitive.Close>
          </div>
          {children && <div className="nuclios-type-body-default-regular">{children}</div>}
          {footer && <div className="flex justify-end gap-(--spacing-l)">{footer}</div>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export const ModalClose = DialogPrimitive.Close;

/* ------------------------------------------------------------------ */
/* Bento "Drawer": Type Default Drawer (500px) | Medium Drawer         */
/* ------------------------------------------------------------------ */
export function Drawer({
  open,
  onOpenChange,
  trigger,
  title,
  footer,
  children,
  size = "default",
  side = "right",
}: Omit<ModalProps, "size" | "description"> & {
  size?: "default" | "medium";
  side?: "right" | "left";
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-(--color-surface-30-inverse-static)" />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-y-(--spacing-s) z-50 flex w-[calc(100%-16px)] flex-col gap-(--spacing-6xl) rounded-(--radius-container-set-1) border border-(--color-border-neutral) bg-(--color-surface-surface-3) p-(--spacing-2xl) text-(--color-text-neutral) shadow-(--shadow-8) focus:outline-none",
            side === "right" ? "right-(--spacing-s)" : "left-(--spacing-s)",
            size === "default" ? "max-w-[500px]" : "max-w-[720px]"
          )}
        >
          <div className="flex items-center justify-between">
            <DialogPrimitive.Title className="nuclios-type-heading-h5-medium">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close className={closeBtn} aria-label="Close">
              <Icons.close className="size-5" />
            </DialogPrimitive.Close>
          </div>
          <DialogPrimitive.Description asChild>
            <div className="min-h-0 flex-1 overflow-y-auto nuclios-type-body-default-regular">
              {children}
            </div>
          </DialogPrimitive.Description>
          {footer && <div className="flex justify-end gap-(--spacing-l)">{footer}</div>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/* ------------------------------------------------------------------ */
/* Bento "Popover"                                                     */
/* ------------------------------------------------------------------ */
export function Popover({
  trigger,
  title,
  children,
  side = "bottom",
  align = "start",
  open,
  onOpenChange,
  className,
}: {
  trigger: React.ReactNode;
  title?: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  /** Optional controlled state (e.g. to close the popover from inside its content). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}) {
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side={side}
          align={align}
          sideOffset={6}
          collisionPadding={16}
          className={cn(
            "z-50 w-72 max-w-[calc(100vw-32px)] rounded-(--radius-container-set-2) border border-(--color-border-muted) bg-(--color-background-neutral) p-(--spacing-2xl) text-(--color-text-neutral) shadow-(--shadow-5) focus:outline-none",
            className
          )}
        >
          {title && <p className="mb-(--spacing-s) nuclios-type-body-large-medium">{title}</p>}
          <div className="flex min-h-0 flex-1 flex-col nuclios-type-body-default-regular text-(--color-text-neutral-subtle)">
            {children}
          </div>
          <PopoverPrimitive.Arrow className="fill-(--color-background-neutral)" />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

/* ------------------------------------------------------------------ */
/* Bento "Menu" + "_Action_list_items": Size L|M|S · Type Header|Text  */
/*                                      State Static|Hover|Selected    */
/* ------------------------------------------------------------------ */
export type MenuEntry =
  | { type: "header"; label: string }
  | {
      type?: "item";
      label: string;
      icon?: React.ReactNode;
      selected?: boolean;
      disabled?: boolean;
      onSelect?: () => void;
    };

export function Menu({
  trigger,
  items,
  align = "start",
}: {
  trigger: React.ReactNode;
  items: MenuEntry[];
  align?: "start" | "center" | "end";
}) {
  return (
    <MenuPrimitive.Root>
      <MenuPrimitive.Trigger asChild>{trigger}</MenuPrimitive.Trigger>
      <MenuPrimitive.Portal>
        <MenuPrimitive.Content
          align={align}
          sideOffset={4}
          className="z-50 min-w-40 overflow-hidden rounded-(--radius-container-set-1) border border-(--color-border-muted) bg-(--color-background-neutral) py-(--spacing-2xs) shadow-(--shadow-4)"
        >
          {items.map((it, i) =>
            it.type === "header" ? (
              <MenuPrimitive.Label
                key={i}
                className="px-(--spacing-s) py-(--spacing-s) nuclios-type-body-large-medium text-(--color-text-neutral-muted)"
              >
                {it.label}
              </MenuPrimitive.Label>
            ) : (
              <MenuPrimitive.Item
                key={i}
                disabled={it.disabled}
                onSelect={it.onSelect}
                className={cn(
                  "mx-(--spacing-2xs) flex h-9 cursor-pointer select-none items-center gap-(--spacing-s) rounded-(--radius-container-set-1) px-(--spacing-s) nuclios-type-body-default-regular text-(--color-text-neutral) outline-none",
                  "data-[highlighted]:bg-(--color-background-neutral-hover) data-[disabled]:text-(--color-text-neutral-disabled) data-[disabled]:cursor-not-allowed",
                  it.selected && "bg-(--color-background-primary-muted) font-medium"
                )}
              >
                {it.icon}
                {it.label}
              </MenuPrimitive.Item>
            )
          )}
        </MenuPrimitive.Content>
      </MenuPrimitive.Portal>
    </MenuPrimitive.Root>
  );
}

/* ------------------------------------------------------------------ */
/* Bento "Accordian" (216): Type Ghost|Filled|Stroke · Size S|M|L      */
/*                          Trigger Left|Right|None · IsExpanded        */
/* ------------------------------------------------------------------ */
export interface AccordionItemData {
  value: string;
  title: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export function Accordion({
  items,
  type = "ghost",
  size = "medium",
  trigger = "left",
  multiple,
  defaultValue,
  className,
}: {
  items: AccordionItemData[];
  type?: "ghost" | "filled" | "stroke";
  size?: "small" | "medium" | "large";
  trigger?: "left" | "right" | "none";
  multiple?: boolean;
  defaultValue?: string[];
  className?: string;
}) {
  const titleType =
    size === "small"
      ? "nuclios-type-body-small-medium"
      : size === "medium"
        ? "nuclios-type-body-default-medium"
        : "nuclios-type-body-large-medium";
  const chevron = (
    <Icons.chevronDown
      className="size-4 shrink-0 text-(--color-icons-neutral) transition-transform duration-200 [[data-state=open]>&]:rotate-180"
      aria-hidden
    />
  );
  const items_ = items.map((it) => (
    <AccordionPrimitive.Item
      key={it.value}
      value={it.value}
      disabled={it.disabled}
      className={cn(
        "rounded-(--radius-container-set-1) px-(--spacing-s) py-(--spacing-2xs)",
        type === "filled" && "bg-(--color-background-subtle)",
        type === "stroke" && "border border-(--color-border-subtle)"
      )}
    >
      <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger
          className={cn(
            "flex w-full items-center gap-(--spacing-s) rounded-(--radius-component-set-1) py-(--spacing-s) text-left text-(--color-text-neutral) hover:bg-(--color-background-neutral-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-primary-focused) disabled:text-(--color-text-neutral-disabled) cursor-pointer",
            titleType
          )}
        >
          {trigger === "left" && chevron}
          <span className="flex-1">{it.title}</span>
          {trigger === "right" && chevron}
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content
        className={cn(
          "overflow-hidden pb-(--spacing-s) nuclios-type-body-small-regular text-(--color-text-neutral)",
          trigger === "left" && "pl-6"
        )}
      >
        {it.content}
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  ));
  const cls = cn("flex w-full flex-col gap-(--spacing-s)", className);
  return multiple ? (
    <AccordionPrimitive.Root type="multiple" defaultValue={defaultValue} className={cls}>
      {items_}
    </AccordionPrimitive.Root>
  ) : (
    <AccordionPrimitive.Root
      type="single"
      collapsible
      defaultValue={defaultValue?.[0]}
      className={cls}
    >
      {items_}
    </AccordionPrimitive.Root>
  );
}
