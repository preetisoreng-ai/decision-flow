import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

// Context to share variant from TabsList to TabsTrigger
const TabsListContext = React.createContext<{ variant: "default" | "line" }>({
  variant: "line",
})

const TabsList = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: "default" | "line"
  }
>(({ className, variant = "line", ...props }, ref) => (
  <TabsListContext.Provider value={{ variant }}>
    <TabsPrimitive.List
      ref={ref as any}
      data-variant={variant}
      className={cn(
        "group/tabs-list inline-flex items-center w-full justify-start text-muted-foreground",
        variant === "default" && "rounded-sm bg-secondary p-1 border-2 border-primary",
        variant === "line" && "rounded-none border-b border-muted gap-6 bg-transparent",
        className
      )}
      {...props}
    />
  </TabsListContext.Provider>
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  const { variant } = React.useContext(TabsListContext)

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
        // Default (pill style) specific classes:
        variant === "default" && [
          "rounded-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
          "data-[state=active]:font-bold data-[state=active]:border-none",
        ],
        // Line variant (Carbon Style) specific classes:
        variant === "line" && [
          "rounded-none relative py-3 px-1 font-normal text-muted-foreground bg-transparent border-none",
          "aria-selected:text-foreground aria-selected:font-bold",
          "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-primary after:opacity-0 after:transition-opacity",
          "aria-selected:after:opacity-100",
          // Radix Tooltip wrapping fix selectors matching skill specifications:
          "group-data-[variant=line]/tabs-list:aria-selected:font-bold",
          "group-data-[variant=line]/tabs-list:aria-selected:after:opacity-100",
        ],
        className
      )}
      {...props}
    />
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex flex-col w-full",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
