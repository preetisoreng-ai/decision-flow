import * as React from "react";
import { ChevronLeft, ChevronRight, Info, X } from "lucide-react";
import {
  Button,
  CaretDown,
  CaretRight,
  Dropdown,
  Modal,
  Radio,
  RadioGroup,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
} from "@nuclios";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Model                                                               */
/* ------------------------------------------------------------------ */
export type Level = "all" | "mentions" | "off" | "custom";
type Leaf = Exclude<Level, "custom">;
type AlertLevel = "all" | "critical" | "off";

interface TabNode {
  id: string;
  name: string;
}
interface SubNode {
  id: string;
  name: string;
  tabs: TabNode[];
}
interface ScreenNode {
  id: string;
  name: string;
  subs: SubNode[];
}

export const APPS = [
  { id: "idf", name: "Integrated Demand Forecasting" },
  { id: "mmm", name: "MMM" },
  { id: "mmx", name: "MMX" },
  { id: "assortment", name: "Assortment and Planning" },
  { id: "marketing", name: "Marketing" },
  { id: "sml", name: "Social Media Listening" },
];

/** Screens of Integrated Demand Forecasting (mirrors the left nav). */
export const SCREENS: ScreenNode[] = [
  {
    id: "demand",
    name: "Demand Analysis",
    subs: [
      {
        id: "size",
        name: "Size & Opportunity",
        tabs: [
          { id: "tab-demand-sizing", name: "Demand Sizing" },
          { id: "tab-size-opportunity", name: "Opportunity Breakdown" },
        ],
      },
      {
        id: "pattern",
        name: "Pattern Analysis",
        tabs: [
          { id: "tab-characteristics", name: "Characteristics" },
          { id: "tab-seasonality", name: "Seasonality" },
        ],
      },
    ],
  },
  {
    id: "forecast",
    name: "Forecast",
    subs: [
      {
        id: "industry",
        name: "Industry",
        tabs: [
          { id: "tab-industry-volume", name: "Industry Volume" },
          { id: "tab-industry-share", name: "Share Outlook" },
        ],
      },
    ],
  },
  { id: "collab", name: "Collaborative Planning", subs: [] },
  { id: "growth", name: "Growth Lever Simulation", subs: [] },
];

const ALL_SUBS = SCREENS.flatMap((s) => s.subs);
const ALL_TABS = ALL_SUBS.flatMap((s) => s.tabs);
export const tabName = (id: string) => ALL_TABS.find((t) => t.id === id)?.name ?? id;

export interface NotificationSettings {
  comments: {
    apps: Record<string, Level>;
    screens: Record<string, Level>;
    subs: Record<string, Level>;
    tabs: Record<string, Leaf>;
  };
  alerts: Record<string, AlertLevel>;
}

export function defaultSettings(): NotificationSettings {
  const fill = <T,>(ids: string[], v: T) =>
    Object.fromEntries(ids.map((id) => [id, v])) as Record<string, T>;
  return {
    comments: {
      apps: {
        ...fill(
          APPS.map((a) => a.id),
          "off" as Level
        ),
        idf: "all",
      },
      screens: fill(
        SCREENS.map((s) => s.id),
        "all" as Level
      ),
      subs: fill(
        ALL_SUBS.map((s) => s.id),
        "all" as Level
      ),
      tabs: fill(
        ALL_TABS.map((t) => t.id),
        "all" as Leaf
      ),
    },
    alerts: {
      ...fill(
        APPS.map((a) => a.id),
        "off" as AlertLevel
      ),
      idf: "all",
    },
  };
}

const uniform = (vals: Level[]): Level =>
  vals.length && vals.every((v) => v === vals[0]) ? vals[0] : "custom";

/** Recompute parents bottom-up so a parent is "custom" whenever its children differ. */
function rollUp(c: NotificationSettings["comments"]) {
  for (const sc of SCREENS) {
    for (const sub of sc.subs) c.subs[sub.id] = uniform(sub.tabs.map((t) => c.tabs[t.id]));
    if (sc.subs.length) c.screens[sc.id] = uniform(sc.subs.map((s) => c.subs[s.id]));
  }
  c.apps.idf = uniform(SCREENS.map((s) => c.screens[s.id]));
}

/** Tabs affected by a change at a given node. */
export function tabsUnder(kind: "app" | "screen" | "sub" | "tab", id: string): string[] {
  if (kind === "tab") return [id];
  if (kind === "sub") return ALL_SUBS.find((s) => s.id === id)?.tabs.map((t) => t.id) ?? [];
  if (kind === "screen")
    return SCREENS.find((s) => s.id === id)?.subs.flatMap((s) => s.tabs.map((t) => t.id)) ?? [];
  return id === "idf" ? ALL_TABS.map((t) => t.id) : [];
}

const COMMENT_OPTIONS = [
  { value: "off", label: "Off" },
  { value: "all", label: "Notify for all comments" },
  { value: "mentions", label: "Notify for @mention" },
];
const ALERT_OPTIONS = [
  { value: "off", label: "Off" },
  { value: "all", label: "All alerts" },
  { value: "critical", label: "Critical alerts only" },
];

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */
function HeadCell({ children, info }: { children: React.ReactNode; info?: string }) {
  return (
    <span className="inline-flex items-center gap-(--spacing-2xs) nuclios-type-body-default-medium text-(--color-text-neutral)">
      {children}
      {info && (
        <Tooltip content={info}>
          <button
            type="button"
            aria-label={info}
            className="inline-flex cursor-help text-(--color-icons-neutral-subtle)"
          >
            <Info className="size-4" />
          </button>
        </Tooltip>
      )}
    </span>
  );
}

function LevelSelect({
  id,
  label,
  value,
  onChange,
  custom,
  options = COMMENT_OPTIONS,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  custom?: boolean;
  options?: { value: string; label: string }[];
}) {
  return (
    <Dropdown
      id={id}
      header="none"
      size="m"
      variant="underline"
      active={value === "custom"}
      label={label}
      value={value}
      onValueChange={onChange}
      options={custom ? [...options, { value: "custom", label: "Custom" }] : options}
      className="w-60"
    />
  );
}

const RADIO_COLS = [
  { v: "all", label: "Notify for all comments" },
  { v: "mentions", label: "Notify for @mentions" },
  { v: "off", label: "Disable All Notification" },
  { v: "custom", label: "Custom" },
];
const grid = "grid grid-cols-[minmax(200px,1.4fr)_repeat(4,minmax(110px,1fr))] items-center";

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export interface SubscribedThread {
  scope: string;
  threadId: string;
  tab: string;
}

export function NotificationSettingsPage({
  saved,
  subscribed,
  onSave,
  onUnsubscribe,
  onBack,
  onClose,
  onDirtyChange,
}: {
  saved: NotificationSettings;
  subscribed: SubscribedThread[];
  onSave: (s: NotificationSettings) => void;
  onUnsubscribe: (threads: SubscribedThread[]) => void;
  onBack: () => void;
  onClose: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [draft, setDraft] = React.useState<NotificationSettings>(() => structuredClone(saved));
  const [appView, setAppView] = React.useState<string | null>(null);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const [openSub, setOpenSub] = React.useState<string | null>(null);
  const [confirm, setConfirm] = React.useState<{
    screens: string[];
    threads: SubscribedThread[];
    apply: () => void;
  } | null>(null);

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  React.useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  React.useEffect(() => setDraft(structuredClone(saved)), [saved]);

  const c = draft.comments;

  /** Apply a change; if it disables notifications over a subscribed thread, ask first. */
  const change = (kind: "app" | "screen" | "sub" | "tab", id: string, value: Level) => {
    const apply = () =>
      setDraft((d) => {
        const n = structuredClone(d);
        const cc = n.comments;
        if (value !== "custom") for (const t of tabsUnder(kind, id)) cc.tabs[t] = value;
        if (kind === "app") cc.apps[id] = value;
        if (kind === "screen") cc.screens[id] = value;
        if (kind === "sub") cc.subs[id] = value;
        if (value !== "custom" && (kind !== "app" || id === "idf")) {
          if (kind === "screen")
            SCREENS.find((s) => s.id === id)?.subs.forEach((s) => (cc.subs[s.id] = value));
          if (kind === "app" && id === "idf") {
            SCREENS.forEach((s) => (cc.screens[s.id] = value));
            ALL_SUBS.forEach((s) => (cc.subs[s.id] = value));
          }
          rollUp(cc);
        }
        return n;
      });

    if (value === "off") {
      const affected = tabsUnder(kind, id);
      const threads = subscribed.filter((t) => affected.includes(t.tab));
      if (threads.length) {
        setConfirm({ screens: [...new Set(threads.map((t) => tabName(t.tab)))], threads, apply });
        return;
      }
    }
    apply();
    if (value === "custom") {
      if (kind === "app" && id === "idf") setAppView("idf");
      if (kind === "screen") setExpanded((e) => ({ ...e, [id]: true }));
      if (kind === "sub") setOpenSub(id);
    }
  };

  return (
    <div className="flex min-h-full flex-col gap-(--spacing-2xl) px-(--spacing-6xl) pt-(--spacing-l) pb-(--spacing-6xl)">
      {/* Back + title */}
      <div className="relative flex h-11 items-center justify-center border-b border-(--color-border-subtle)">
        <Tooltip content="Back to dashboard">
          <Button
            size="small"
            variant="ghost"
            iconOnly
            aria-label="Back to dashboard"
            onClick={onBack}
            className="absolute left-0"
          >
            <ChevronLeft className="size-5 text-(--color-icons-neutral)" />
          </Button>
        </Tooltip>
        <h2 className="nuclios-type-heading-h5-regular text-(--color-text-neutral)">
          Notification Settings
        </h2>
      </div>

      <Tabs defaultValue="comments" className="flex flex-1 flex-col">
        <div className="flex items-end justify-between gap-(--spacing-2xl)">
          <TabsList type="stroke" size="small" tone="brand" className="w-auto border-b-0">
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>
          <Button
            size="small"
            variant="neutral"
            leadingIcon={<X className="size-4" />}
            onClick={onClose}
            className="mb-(--spacing-2xs)"
          >
            Close
          </Button>
        </div>

        {/* ---------------- Comments ---------------- */}
        <TabsContent value="comments" className="mt-(--spacing-2xl) flex-1">
          {appView === null ? (
            <section
              aria-label="Application notification settings"
              className="rounded-(--radius-container-set-2) border border-(--color-border-subtle)"
            >
              <div className="flex items-center justify-between rounded-t-(--radius-container-set-2) bg-(--color-background-subtle) px-(--spacing-2xl) py-(--spacing-l)">
                <HeadCell info="Choose how you’re notified about comments in each application">
                  Applications
                </HeadCell>
                <span className="w-60">
                  <HeadCell info="Applies to every screen, sub screen and tab in the application">
                    Settings
                  </HeadCell>
                </span>
              </div>
              <ul>
                {APPS.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between border-t border-(--color-border-subtle) px-(--spacing-2xl) py-(--spacing-s)"
                  >
                    {a.id === "idf" ? (
                      <button
                        type="button"
                        onClick={() => setAppView("idf")}
                        className="inline-flex items-center gap-(--spacing-2xs) nuclios-type-body-default-regular text-(--color-text-neutral) hover:underline cursor-pointer"
                      >
                        {a.name}
                        <ChevronRight className="size-4 text-(--color-icons-neutral-subtle)" />
                      </button>
                    ) : (
                      <span className="nuclios-type-body-default-regular text-(--color-text-neutral)">
                        {a.name}
                      </span>
                    )}
                    <LevelSelect
                      id={`app-${a.id}`}
                      label={`${a.name} comment notifications`}
                      value={c.apps[a.id]}
                      custom={a.id === "idf"}
                      onChange={(v) => change("app", a.id, v as Level)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <div className="flex flex-col gap-(--spacing-s)">
              <div>
                <Button
                  size="small"
                  variant="ghost"
                  leadingIcon={<ChevronLeft className="size-4" />}
                  onClick={() => setAppView(null)}
                  className="-ml-(--spacing-s) text-(--color-text-neutral-subtle)"
                >
                  Back to Application list
                </Button>
              </div>
              <section
                aria-label="Integrated Demand Forecasting screen settings"
                className="rounded-(--radius-container-set-2) border border-(--color-border-subtle)"
              >
                <div className="flex items-center justify-between rounded-t-(--radius-container-set-2) bg-(--color-background-subtle) px-(--spacing-2xl) py-(--spacing-s)">
                  <HeadCell info="Settings at main-screen level apply to all its sub screens and tabs">
                    Integrated Demand Forecasting
                  </HeadCell>
                  <LevelSelect
                    id="app-idf-detail"
                    label="Integrated Demand Forecasting comment notifications"
                    value={c.apps.idf}
                    custom
                    onChange={(v) => change("app", "idf", v as Level)}
                  />
                </div>
                <ul>
                  {SCREENS.map((sc) => {
                    const isOpen = !!expanded[sc.id] || c.screens[sc.id] === "custom";
                    return (
                      <li key={sc.id} className="border-t border-(--color-border-subtle)">
                        <div className="flex items-center justify-between px-(--spacing-2xl) py-(--spacing-s)">
                          {sc.subs.length ? (
                            <button
                              type="button"
                              aria-expanded={isOpen}
                              onClick={() => setExpanded((e) => ({ ...e, [sc.id]: !isOpen }))}
                              className="inline-flex items-center gap-(--spacing-s) nuclios-type-body-default-medium text-(--color-text-neutral) cursor-pointer"
                            >
                              {isOpen ? (
                                <CaretDown className="size-4 text-(--color-icons-neutral-subtle)" />
                              ) : (
                                <CaretRight className="size-4 text-(--color-icons-neutral-subtle)" />
                              )}
                              {sc.name}
                            </button>
                          ) : (
                            <span className="pl-6 nuclios-type-body-default-regular text-(--color-text-neutral)">
                              {sc.name}
                            </span>
                          )}
                          <LevelSelect
                            id={`screen-${sc.id}`}
                            label={`${sc.name} comment notifications`}
                            value={c.screens[sc.id]}
                            custom={sc.subs.length > 0}
                            onChange={(v) => change("screen", sc.id, v as Level)}
                          />
                        </div>

                        {isOpen && sc.subs.length > 0 && (
                          <div className="mx-(--spacing-2xl) mb-(--spacing-l) overflow-x-auto rounded-(--radius-container-set-1) border border-(--color-border-subtle) bg-(--color-background-subtle)">
                            <div
                              className={cn(
                                grid,
                                "border-b border-(--color-border-subtle) px-(--spacing-l) py-(--spacing-s) nuclios-type-body-small-medium text-(--color-text-neutral)"
                              )}
                              role="row"
                            >
                              <span>Sub screens &amp; Tabs</span>
                              {RADIO_COLS.map((col) => (
                                <span key={col.v} className="text-center">
                                  {col.label}
                                </span>
                              ))}
                            </div>
                            {sc.subs.map((sub) => {
                              const subOpen =
                                openSub === sub.id ||
                                (c.subs[sub.id] === "custom" && openSub === null);
                              return (
                                <div key={sub.id}>
                                  <RadioGroup
                                    aria-label={`${sub.name} notification setting`}
                                    value={c.subs[sub.id]}
                                    onValueChange={(v) => change("sub", sub.id, v as Level)}
                                    className={cn(grid, "gap-0 px-(--spacing-l) py-(--spacing-s)")}
                                  >
                                    <button
                                      type="button"
                                      aria-expanded={subOpen}
                                      onClick={() => setOpenSub(subOpen ? "" : sub.id)}
                                      className="inline-flex items-center gap-(--spacing-s) text-left nuclios-type-body-small-medium text-(--color-text-neutral) cursor-pointer"
                                    >
                                      {subOpen ? (
                                        <CaretDown className="size-4 text-(--color-icons-neutral-subtle)" />
                                      ) : (
                                        <CaretRight className="size-4 text-(--color-icons-neutral-subtle)" />
                                      )}
                                      {sub.name}
                                    </button>
                                    {RADIO_COLS.map((col) => (
                                      <span key={col.v} className="flex justify-center">
                                        <Radio
                                          id={`${sub.id}-${col.v}`}
                                          value={col.v}
                                          aria-label={`${sub.name}: ${col.label}`}
                                        />
                                      </span>
                                    ))}
                                  </RadioGroup>
                                  {subOpen &&
                                    sub.tabs.map((t) => (
                                      <RadioGroup
                                        key={t.id}
                                        aria-label={`${t.name} tab notification setting`}
                                        value={c.tabs[t.id]}
                                        onValueChange={(v) => change("tab", t.id, v as Level)}
                                        className={cn(
                                          grid,
                                          "gap-0 bg-(--color-background-neutral) px-(--spacing-l) py-(--spacing-s)"
                                        )}
                                      >
                                        <span className="pl-8 nuclios-type-body-small-regular text-(--color-text-neutral-subtle)">
                                          {t.name}
                                        </span>
                                        {RADIO_COLS.slice(0, 3).map((col) => (
                                          <span key={col.v} className="flex justify-center">
                                            <Radio
                                              id={`${t.id}-${col.v}`}
                                              value={col.v}
                                              aria-label={`${t.name}: ${col.label}`}
                                            />
                                          </span>
                                        ))}
                                        <span aria-hidden />
                                      </RadioGroup>
                                    ))}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            </div>
          )}
        </TabsContent>

        {/* ---------------- Alerts ---------------- */}
        <TabsContent value="alerts" className="mt-(--spacing-2xl) flex-1">
          <section
            aria-label="Application alert settings"
            className="rounded-(--radius-container-set-2) border border-(--color-border-subtle)"
          >
            <div className="flex items-center justify-between rounded-t-(--radius-container-set-2) bg-(--color-background-subtle) px-(--spacing-2xl) py-(--spacing-l)">
              <HeadCell info="Choose which system alerts you receive for each application">
                Applications
              </HeadCell>
              <span className="w-60">
                <HeadCell>Settings</HeadCell>
              </span>
            </div>
            <ul>
              {APPS.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between border-t border-(--color-border-subtle) px-(--spacing-2xl) py-(--spacing-s)"
                >
                  <span className="nuclios-type-body-default-regular text-(--color-text-neutral)">
                    {a.name}
                  </span>
                  <LevelSelect
                    id={`alert-${a.id}`}
                    label={`${a.name} alerts`}
                    value={draft.alerts[a.id]}
                    options={ALERT_OPTIONS}
                    onChange={(v) =>
                      setDraft((d) => ({ ...d, alerts: { ...d.alerts, [a.id]: v as AlertLevel } }))
                    }
                  />
                </li>
              ))}
            </ul>
          </section>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-(--color-border-subtle) pt-(--spacing-2xl)">
        <Button
          size="medium"
          variant="ghost"
          onClick={() => setDraft(defaultSettings())}
          className="text-(--color-text-neutral)"
        >
          Reset all to default
        </Button>
        <Button size="medium" disabled={!dirty} onClick={() => onSave(draft)}>
          Save Changes
        </Button>
      </div>

      {/* Disabling notifications over a thread-level subscription */}
      <Modal
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        size="s"
        title={<span className="text-(--color-text-negative)">Error</span>}
        description={`Screen: ${confirm?.screens.join(", ") ?? ""}`}
        footer={
          <>
            <Button onClick={() => setConfirm(null)}>Cancel</Button>
            <Button
              variant="border"
              onClick={() => {
                confirm?.apply();
                if (confirm) onUnsubscribe(confirm.threads);
                setConfirm(null);
              }}
            >
              Yes
            </Button>
          </>
        }
      >
        <p>
          You have already subscribed at thread level on this screen. Disabling notification will
          disable any notifications related to the subscribed thread.
        </p>
        <p className="mt-(--spacing-l)">Would you still want to continue?</p>
      </Modal>
    </div>
  );
}
