import * as React from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardHeader, CardContent, CardFooter } from "./card"
import { cn } from "@/lib/utils"

export interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: string
    isPositive: boolean
  }
  chart?: React.ReactNode
  footerText?: string
  className?: string
}

export function KpiCard({
  title,
  value,
  subtitle,
  trend,
  chart,
  footerText,
  className,
}: KpiCardProps) {
  return (
    <Card className={cn("text-left", className)}>
      <CardHeader className="p-4 border-b border-border">
        <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
          {title}
        </span>
        {subtitle && (
          <span className="text-sm font-medium text-muted-foreground mt-0.5">
            {subtitle}
          </span>
        )}
      </CardHeader>

      <CardContent className="p-4 flex flex-col justify-between space-y-4">
        <div className="flex items-baseline justify-between">
          <span className="text-4xl font-black font-mono tracking-tight text-foreground">
            {value}
          </span>
          {trend && (
            <div
              className={cn(
                "inline-flex items-center px-2 py-0.5 text-xs font-bold border rounded-sm",
                trend.isPositive
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : "bg-destructive/10 text-destructive border-destructive/20"
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="mr-1 h-3 w-3 stroke-[2.5]" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 stroke-[2.5]" />
              )}
              {trend.value}
            </div>
          )}
        </div>

        {chart && <div className="w-full pt-2">{chart}</div>}
      </CardContent>

      <CardFooter className="p-4 bg-secondary/10 border-t border-border text-xs font-medium text-muted-foreground">
        {footerText || "Metrics up to date"}
      </CardFooter>
    </Card>
  )
}
