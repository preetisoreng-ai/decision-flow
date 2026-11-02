import * as React from "react"
import { cn } from "@/lib/utils"

// Left Nav (Sidebar)
export interface LeftNavItem {
  label: string
  icon: React.ComponentType<{ className?: string }>
  active?: boolean
  onClick?: () => void
}

export interface LeftNavProps {
  items: LeftNavItem[]
  logoText: string
  logoIcon?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function LeftNav({
  items,
  logoText,
  logoIcon,
  footer,
  className,
}: LeftNavProps) {
  return (
    <aside
      className={cn(
        "flex flex-col w-64 border-r border-border bg-card text-card-foreground h-full",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center space-x-3 px-6 py-5 border-b border-border">
        {logoIcon && <div className="text-primary">{logoIcon}</div>}
        <span className="font-black text-lg tracking-tight uppercase text-foreground">
          {logoText}
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto text-left">
        {items.map((item, idx) => {
          const Icon = item.icon
          return (
            <button
              key={idx}
              onClick={item.onClick}
              className={cn(
                "flex items-center space-x-3 w-full px-4 py-2.5 text-sm font-semibold transition-all text-left cursor-pointer border-0 border-l-4",
                item.active
                  ? "border-l-primary bg-[var(--color-background-primary-selected)] text-primary font-bold shadow-sm rounded-r-md rounded-l-none"
                  : "border-l-transparent text-muted-foreground hover:bg-secondary hover:text-foreground rounded-md"
              )}
            >
              <Icon className="className h-4 w-4 stroke-[2]" />
              <span className="flex-1">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      {footer && (
        <div className="p-4 border-t border-border bg-secondary/10">
          {footer}
        </div>
      )}
    </aside>
  )
}

// Top Nav (Navbar)
export interface TopNavProps {
  logoText?: string
  logoIcon?: React.ReactNode
  title?: string
  actions?: React.ReactNode
  className?: string
}

export function TopNav({
  logoText,
  logoIcon,
  title,
  actions,
  className,
}: TopNavProps) {
  return (
    <header
      className={cn(
        "flex items-center justify-between h-16 px-6 border-b border-border bg-card text-card-foreground w-full",
        className
      )}
    >
      <div className="flex items-center space-x-4">
        {/* Mobile menu trigger or logo */}
        {(logoText || logoIcon) && (
          <div className="flex items-center space-x-2 mr-4 md:hidden">
            {logoIcon && <div className="text-primary">{logoIcon}</div>}
            {logoText && (
              <span className="font-black tracking-tight text-foreground text-sm uppercase">
                {logoText}
              </span>
            )}
          </div>
        )}
        {title && (
          <h1 className="text-base font-bold text-foreground text-left">
            {title}
          </h1>
        )}
      </div>

      {/* Actions (Buttons, search input, notification bell, profile trigger) */}
      <div className="flex items-center space-x-4">
        {actions}
      </div>
    </header>
  )
}
