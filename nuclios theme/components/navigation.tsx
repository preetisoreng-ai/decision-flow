import * as React from "react";
import { cn } from "@/lib/utils";
import { CaretDoubleLeft, CaretDoubleRight, CaretDown, CaretRight } from "./bento-icons";

/**
 * Bento "Top Navigation" (Top nav - Horizontal scroll | Top nav - Side nav)
 * and "Side navigation" (View Collapsed | Expand | Hover · With icons | No icons).
 * Colours come from the Navigation/* semantic tokens.
 */
export interface NavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children?: { id: string; label: string }[];
}

export function TopNav({
  brand,
  items,
  activeId,
  onSelect,
  actions,
  className,
}: {
  brand: React.ReactNode;
  items: NavItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex h-16 items-center gap-(--spacing-17xl) border-b border-(--color-border-subtle) bg-(--color-background-subtle) px-(--spacing-6xl)",
        className
      )}
    >
      <div className="shrink-0">{brand}</div>
      <nav
        aria-label="Main"
        className="flex h-full min-w-0 flex-1 items-stretch gap-(--spacing-xs) overflow-x-auto"
      >
        {items.map((it) => {
          const active = it.id === activeId;
          return (
            <button
              key={it.id}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => onSelect?.(it.id)}
              className={cn(
                "relative flex items-center gap-(--spacing-s) px-(--spacing-l) nuclios-type-body-default-regular text-(--color-navigation-top-navigation-secondary-onrest) whitespace-nowrap cursor-pointer",
                "hover:bg-(--color-navigation-top-navigation-secondary-bg-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--color-border-primary-focused)",
                active &&
                  "font-medium bg-(--color-navigation-top-navigation-secondary-bg-selected) after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-(--color-background-primary)"
              )}
            >
              {it.icon}
              {it.label}
            </button>
          );
        })}
      </nav>
      {actions && <div className="flex shrink-0 items-center gap-(--spacing-l)">{actions}</div>}
    </header>
  );
}

export function SideNav({
  items,
  activeId,
  onSelect,
  collapsed,
  onToggle,
  footer,
  className,
}: {
  items: NavItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  collapsed?: boolean;
  onToggle?: () => void;
  footer?: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = React.useState<Record<string, boolean>>({});
  return (
    <nav
      aria-label="Section"
      className={cn(
        "flex h-full flex-col border-r border-(--color-border-neutral) bg-(--color-background-neutral) py-(--spacing-l) transition-[width] duration-200",
        collapsed ? "w-14 items-center" : "w-[252px] px-(--spacing-s)",
        className
      )}
    >
      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          aria-expanded={!collapsed}
          className="mb-(--spacing-2xl) inline-flex size-9 items-center justify-center self-end rounded-(--radius-component-set-1) text-(--color-icons-neutral) hover:bg-(--color-background-neutral-hover) cursor-pointer"
        >
          {collapsed ? <CaretDoubleRight className="size-5" /> : <CaretDoubleLeft className="size-5" />}
        </button>
      )}
      <ul className="flex flex-1 flex-col gap-(--spacing-2xs)">
        {items.map((it) => {
          const active = it.id === activeId || it.children?.some((c) => c.id === activeId);
          const expanded = open[it.id] ?? !!active;
          return (
            <li key={it.id}>
              <button
                type="button"
                title={collapsed ? it.label : undefined}
                aria-current={it.id === activeId ? "page" : undefined}
                aria-expanded={it.children && !collapsed ? expanded : undefined}
                onClick={() =>
                  it.children ? setOpen((o) => ({ ...o, [it.id]: !expanded })) : onSelect?.(it.id)
                }
                className={cn(
                  "flex h-10 w-full items-center gap-(--spacing-s) rounded-(--radius-component-set-1) px-(--spacing-s) text-left nuclios-type-body-default-regular text-(--color-text-neutral) cursor-pointer",
                  "hover:bg-(--color-navigation-side-navigation-secondary-bg-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-primary-focused)",
                  // Selected (or parent of the selected page): primary text + icon, Bento Bold weight.
                  active && "text-(--color-text-primary) font-(--font-weight-bold)!",
                  // Only the page itself gets the selected background; a parent of the selected page does not.
                  it.id === activeId && "bg-(--color-navigation-side-navigation-secondary-bg-selected)",
                  // Collapsed rail: 40×40 icon tile; the selected section (or parent of the selected page)
                  // gets a rounded selected background so it stays visible without labels.
                  collapsed && "mx-auto size-10 justify-center px-0 rounded-(--radius-component-set-3)",
                  collapsed && active && "bg-(--color-navigation-side-navigation-secondary-bg-selected)"
                )}
              >
                {it.icon && (
                  <span
                    className={cn(
                      "inline-flex size-5 items-center justify-center",
                      active ? "text-(--color-icons-primary)" : "text-(--color-icons-neutral-subtle)"
                    )}
                    aria-hidden
                  >
                    {it.icon}
                  </span>
                )}
                {!collapsed && <span className="flex-1 truncate">{it.label}</span>}
                {!collapsed && it.children && (
                  <span aria-hidden className={cn("inline-flex", active ? "text-(--color-icons-primary)" : "text-(--color-icons-neutral-subtle)")}>
                    {expanded ? <CaretDown className="size-4" /> : <CaretRight className="size-4" />}
                  </span>
                )}
              </button>
              {!collapsed && it.children && expanded && (
                <ul className="ml-(--spacing-xl) mt-(--spacing-2xs) flex flex-col gap-(--spacing-2xs) border-l border-(--color-border-subtle) pl-(--spacing-s)">
                  {it.children.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        aria-current={c.id === activeId ? "page" : undefined}
                        onClick={() => onSelect?.(c.id)}
                        className={cn(
                          "flex h-9 w-full items-center rounded-(--radius-component-set-1) px-(--spacing-s) text-left nuclios-type-body-small-regular text-(--color-text-neutral-subtle) cursor-pointer hover:bg-(--color-background-neutral-hover)",
                          c.id === activeId &&
                            "font-(--font-weight-bold)! text-(--color-text-primary) bg-(--color-navigation-side-navigation-secondary-bg-selected)"
                        )}
                      >
                        {c.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
      {footer && !collapsed && (
        <div className="border-t border-(--color-border-subtle) pt-(--spacing-l)">{footer}</div>
      )}
    </nav>
  );
}
