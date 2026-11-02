import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts"

export interface ChartDataPoint {
  name: string
  value: number
  [key: string]: any
}

interface AreaChartProps {
  data: ChartDataPoint[]
  dataKey: string
  color?: string
}

export function TokenAreaChart({
  data,
  dataKey,
  color = "var(--color-background-primary)",
}: AreaChartProps) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" opacity={0.5} />
          <XAxis
            dataKey="name"
            stroke="var(--color-text-neutral-muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={10}
            fontFamily="var(--font-sans)"
          />
          <YAxis
            stroke="var(--color-text-neutral-muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            fontFamily="var(--font-sans)"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-background-neutral)",
              borderColor: "var(--color-border-subtle)",
              borderRadius: "var(--radius-component-set-1)",
              fontFamily: "var(--font-sans)",
              fontSize: "12px",
              color: "var(--color-text-neutral)",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.07)",
            }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

interface BarChartProps {
  data: ChartDataPoint[]
  dataKey: string
  color?: string
}

export function TokenBarChart({
  data,
  dataKey,
  color = "var(--color-background-primary)",
}: BarChartProps) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" opacity={0.5} />
          <XAxis
            dataKey="name"
            stroke="var(--color-text-neutral-muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={10}
            fontFamily="var(--font-sans)"
          />
          <YAxis
            stroke="var(--color-text-neutral-muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            fontFamily="var(--font-sans)"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-background-neutral)",
              borderColor: "var(--color-border-subtle)",
              borderRadius: "var(--radius-component-set-1)",
              fontFamily: "var(--font-sans)",
              fontSize: "12px",
              color: "var(--color-text-neutral)",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.07)",
            }}
          />
          <Bar
            dataKey={dataKey}
            fill={color}
            radius={[4, 4, 0, 0]}
            maxBarSize={45}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
