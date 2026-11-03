import * as React from "react";
import { CalendarDays, Download } from "lucide-react";
import { Button, ChartCard, DataTable, Dropdown, KpiCard, type Column } from "@nuclios";
import { previewColumns, previewRows, type ScopeId } from "@/data";
import { AvailabilityChart, ComplianceChart, ImpactChart } from "./charts";

/* Filter row: PDF Page 1 & 2 inline-label filled dropdowns + Apply filters (no top-right time tabs). */
export function FilterBar() {
  const [product, setProduct] = React.useState("all");
  const [region, setRegion] = React.useState("all");
  const [range, setRange] = React.useState("q118-q220");
  return (
    <div className="flex flex-wrap items-center gap-(--spacing-s)">
      <Dropdown
        id="filter-product"
        header="inline"
        variant="filled"
        size="m"
        label="Product"
        value={product}
        onValueChange={setProduct}
        className="min-w-[200px] flex-1"
        options={[
          { value: "all", label: "All products" },
          { value: "beer", label: "Beer" },
          { value: "soft", label: "Soft drinks" },
          { value: "snacks", label: "Snacks" },
        ]}
      />
      <Dropdown
        id="filter-region"
        header="inline"
        variant="filled"
        size="m"
        label="Region"
        value={region}
        onValueChange={setRegion}
        className="min-w-[196px] flex-1"
        options={[
          { value: "all", label: "All regions" },
          { value: "na", label: "North America" },
          { value: "eu", label: "Europe" },
          { value: "apac", label: "APAC" },
        ]}
      />
      <Dropdown
        id="filter-range"
        header="inline"
        variant="filled"
        size="m"
        label="Date range"
        leadingIcon={<CalendarDays className="size-4" />}
        value={range}
        onValueChange={setRange}
        className="min-w-[240px] flex-1"
        options={[
          { value: "q118-q220", label: "Q1 2018 – Q2 2020" },
          { value: "2019", label: "CY 2019" },
          { value: "2020", label: "CY 2020" },
        ]}
      />
      <Button size="medium" className="px-(--spacing-l)">
        Apply filters
      </Button>
    </div>
  );
}

/* Shared comment wiring for every widget card. */
export interface WidgetComments {
  isOpen: (s: ScopeId) => boolean;
  count: (s: ScopeId) => number;
  toggle: (s: ScopeId) => void;
}

const MENU = [{ label: "Download PNG" }, { label: "Download CSV" }, { label: "Expand" }];

export function WidgetDashboard({ comments }: { comments: WidgetComments }) {
  const c = (scope: ScopeId) => ({
    open: comments.isOpen(scope),
    count: comments.count(scope),
    onToggle: () => comments.toggle(scope),
  });
  const availability: { scope: ScopeId; title: string }[] = [
    { scope: "widget:availability-overview", title: "Availability — Overview" },
    { scope: "widget:availability-products", title: "Availability — Products" },
    { scope: "widget:availability-regions", title: "Availability — Regions" },
  ];
  return (
    <div className="flex flex-col gap-(--spacing-6xl)">
      <div className="grid gap-(--spacing-6xl) xl:grid-cols-3">
        {availability.map((w) => (
          <ChartCard
            key={w.scope}
            title={w.title}
            info="Weekly availability: forecast vs actual"
            comments={c(w.scope)}
            menu={MENU}
            bodyClassName="mt-(--spacing-l) h-[210px]"
          >
            <AvailabilityChart title={w.title} />
          </ChartCard>
        ))}
      </div>
      <div className="grid gap-(--spacing-6xl) xl:grid-cols-2">
        <ChartCard
          title="Quarterly Compliance vs Benchmark"
          info="Compliance vs the 90% risk threshold"
          comments={c("widget:quarterly-compliance")}
          menu={MENU}
          bodyClassName="h-[300px]"
        >
          <ComplianceChart />
        </ChartCard>
        <ChartCard
          title="Quarterly Impact Contribution"
          info="Incidents by impact category per quarter"
          comments={c("widget:quarterly-impact")}
          menu={MENU}
          bodyClassName="h-[300px]"
        >
          <ImpactChart />
        </ChartCard>
      </div>
    </div>
  );
}

/* "Demand Sizing" tab: KPI row + data previews. */
type Kpi = { label: string; value: string; delta?: "up" | "down" };
function KpiRow({ items }: { items: Kpi[] }) {
  return (
    <div
      className="grid gap-(--spacing-6xl)"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
    >
      {items.map((k) => (
        <KpiCard
          key={k.label}
          label={k.label}
          value={k.value}
          delta={
            k.delta
              ? {
                  value: "8%",
                  direction: k.delta,
                  label: "vs last year",
                }
              : undefined
          }
        />
      ))}
    </div>
  );
}

type Row = Record<string, string>;
const columns: Column<Row>[] = previewColumns.map((c, i) => ({
  key: `c${i}`,
  header: c,
  sortable: i < 2,
  align: (["Sales", "Price", "CPI", "Unemployment Rate"].includes(c) ? "right" : "left") as
    "right" | "left",
}));
const rows: Row[] = previewRows.map((r, ri) =>
  Object.fromEntries([["id", String(ri)], ...r.map((v, i) => [`c${i}`, v])])
);

export function DataPreview() {
  return (
    <div className="flex flex-col gap-(--spacing-6xl)">
      <KpiRow
        items={[
          { label: "Industry Volume 2019", value: "424K Units", delta: "down" },
          { label: "Portfolio Volume 2019", value: "178K Units", delta: "up" },
          { label: "Volume Opportunity 2020", value: "424K Units", delta: "down" },
          { label: "Value Opportunity 2020", value: "$567 Mn", delta: "down" },
        ]}
      />
      {["Data Preview", "Future Regressor Data Preview"].map((t) => (
        <DataTable<Row>
          key={t}
          title={t}
          actions={
            <Button size="small" variant="neutral" leadingIcon={<Download className="size-3.5" />}>
              Export
            </Button>
          }
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          className="overflow-x-auto rounded-(--radius-container-set-2) border-(--color-border-subtle) [&_th]:whitespace-nowrap"
        />
      ))}
    </div>
  );
}
