import {
  ResponsiveContainer,
  LineChart,
  Line,
  Bar,
  BarChart,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { weeklyAvailability, quarterlyCompliance, quarterlyImpact } from "@/data";

// Bento "test screen" chart styling: primary series = dark ink, comparison line = coral.
// Bento hard-codes those two; here they map to the nearest semantic tokens. Further stacked
// series continue with the ranked data-visualization tokens (category 2, 3, …).
const SERIES_1 = "var(--color-background-primary-pressed)";
const SERIES_2 = "var(--color-border-negative)";
const cat = (n: number) => (n === 1 ? SERIES_1 : `var(--color-data-visualization-category-${n})`);
const tick = {
  fill: "var(--color-text-neutral-subtle)",
  fontSize: 11,
  fontFamily: "var(--font-family-graphik)",
};
const grid = "var(--color-border-neutral)";
const tooltip = {
  contentStyle: {
    background: "var(--color-background-neutral)",
    border: "1px solid var(--color-border-muted)",
    borderRadius: "var(--radius-component-set-3)",
    boxShadow: "var(--shadow-3)",
    color: "var(--color-text-neutral)",
    fontSize: 12,
  },
  cursor: { fill: "var(--color-background-neutral-hover)" },
};

export function Legend({ items }: { items: { label: string; color: string; dashed?: boolean }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-(--spacing-2xl) gap-y-(--spacing-2xs) nuclios-type-body-small-regular text-(--color-text-neutral)">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-(--spacing-xs)">
          {i.dashed ? (
            <span
              className="h-0 w-5 border-t-2"
              style={{ borderColor: i.color }}
            />
          ) : (
            <span
              className="h-2.5 w-4 rounded-(--radius-component-set-4)"
              style={{ background: i.color }}
            />
          )}
          {i.label}
        </li>
      ))}
    </ul>
  );
}

const Axis = ({ label }: { label: string }) => (
  <span className="[writing-mode:vertical-rl] rotate-180 self-center nuclios-type-body-x-small-regular text-(--color-text-neutral-muted)">
    {label}
  </span>
);

export function AvailabilityChart({ title }: { title: string }) {
  return (
    <figure className="flex h-full flex-col gap-(--spacing-s)" aria-label={`${title} line chart`}>
      <div className="flex min-h-0 flex-1">
        <Axis label="Availability" />
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={weeklyAvailability} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
            <CartesianGrid vertical stroke={grid} strokeOpacity={0.5} />
            <XAxis
              dataKey="week"
              tick={tick}
              tickFormatter={(w: string) => w.replace("WK ", "W")}
              interval={2}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[85, 100]}
              ticks={[85, 90, 95, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={tick}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip {...tooltip} formatter={(v) => `${Number(v).toFixed(1)}%`} />
            <Line
              dataKey="actual"
              name="Actual"
              stroke={SERIES_2}
              strokeWidth={2}
              
              dot={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="forecast"
              name="Forecast"
              stroke={cat(1)}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <Legend
        items={[
          { label: "Forecast", color: SERIES_1 },
          { label: "Actual", color: SERIES_2, dashed: true },
        ]}
      />
    </figure>
  );
}

export function ComplianceChart() {
  return (
    <figure
      className="flex h-full flex-col gap-(--spacing-s)"
      aria-label="Quarterly compliance bar chart"
    >
      <div className="flex min-h-0 flex-1">
        <Axis label="Volume" />
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={quarterlyCompliance}
            margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
          >
            <CartesianGrid vertical stroke={grid} strokeOpacity={0.5} />
            <XAxis dataKey="quarter"
              tickFormatter={(q: string) => q.replace(" 20", " '")} tick={tick} tickLine={false} axisLine={false} interval={0} />
            <YAxis
              domain={[85, 95]}
              ticks={[85, 90, 95]}
              tickFormatter={(v) => `${v}%`}
              tick={tick}
              tickLine={false}
              axisLine={false}
              allowDataOverflow
            />
            <Tooltip {...tooltip} />
            <Bar
              dataKey="compliance"
              name="Compliance"
              fill={cat(1)}
              barSize={16}
              radius={[2, 2, 0, 0]}
              isAnimationActive={false}
            />
            <Line
              dataKey="threshold"
              name="Risk Threshold"
              stroke={SERIES_2}
              strokeWidth={2}
              
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <Legend
        items={[
          { label: "Compliance", color: SERIES_1 },
          { label: "Risk Threshold", color: SERIES_2, dashed: true },
        ]}
      />
    </figure>
  );
}

const impact = [
  ["noImpact", "No Impact"],
  ["concession", "Concession"],
  ["minor", "Minor Impact"],
  ["major", "Major Impact"],
  ["rejected", "Rejected"],
] as const;

export function ImpactChart() {
  return (
    <figure
      className="flex h-full flex-col gap-(--spacing-s)"
      aria-label="Quarterly impact contribution stacked bar chart"
    >
      <div className="flex min-h-0 flex-1">
        <Axis label="Incidents" />
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={quarterlyImpact} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid vertical stroke={grid} strokeOpacity={0.5} />
            <XAxis dataKey="quarter"
              tickFormatter={(q: string) => q.replace(" 20", " '")} tick={tick} tickLine={false} axisLine={false} interval={0} />
            <YAxis tick={tick} tickLine={false} axisLine={false} />
            <Tooltip {...tooltip} />
            {impact.map(([k, label], i) => (
              <Bar
                key={k}
                dataKey={k}
                name={label}
                stackId="i"
                fill={cat(i + 1)}
                barSize={16}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <Legend items={impact.map(([, label], i) => ({ label, color: cat(i + 1) }))} />
    </figure>
  );
}
