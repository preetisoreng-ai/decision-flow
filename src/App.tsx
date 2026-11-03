import * as React from "react";
import { ChartLine, House, MessageCircle, Moon, Settings, Sparkles, Users } from "lucide-react";
import {
  Avatar,
  Button,
  Modal,
  Toast,
  CaretDoubleLeft,
  CaretDoubleRight,
  SideNav,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipProvider,
} from "@nuclios";
import { currentUser, type ScopeId } from "@/data";
import { CommentPanel } from "@/app/comment-panel";
import { DataPreview, FilterBar, WidgetDashboard } from "@/app/dashboard";
import { useComments } from "@/app/use-comments";
import { NotificationsPage } from "@/app/notifications-page";
import {
  NotificationSettingsPage,
  defaultSettings,
  type NotificationSettings,
  type SubscribedThread,
} from "@/app/notification-settings";
import {
  NotificationBell,
  NotificationToast,
  seedNotifications,
  type AppNotification,
} from "@/app/notifications";

type Tab = "size-opportunity" | "demand-sizing";
const screenScope = (t: Tab): ScopeId =>
  t === "size-opportunity" ? "screen:size-opportunity" : "screen:demand-sizing";

function useThemeMode() {
  const [dark, setDark] = React.useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return [dark, setDark] as const;
}

/** Bento header icon button: 28px, component-set-1 radius. */
function HeaderIcon({
  label,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { label: string }) {
  return (
    <Tooltip content={label} side="bottom">
      <Button
        size="small"
        variant="ghost"
        iconOnly
        aria-label={label}
        className="text-(--color-icons-neutral)"
        {...props}
      >
        {children}
      </Button>
    </Tooltip>
  );
}

export default function App() {
  const api = useComments();
  const [dark, setDark] = useThemeMode();
  const [tab, setTab] = React.useState<Tab>("size-opportunity");
  const [panel, setPanel] = React.useState<ScopeId | null>(null);
  const [view, setView] = React.useState<"dashboard" | "notifications" | "settings">("dashboard");
  const [settings, setSettings] = React.useState<NotificationSettings>(() => {
    try {
      const raw = localStorage.getItem("nuclios-notification-settings-v1");
      if (raw) return JSON.parse(raw) as NotificationSettings;
    } catch {
      /* storage unavailable */
    }
    return defaultSettings();
  });
  const [settingsDirty, setSettingsDirty] = React.useState(false);
  const [leaveTo, setLeaveTo] = React.useState<null | (() => void)>(null);
  const [appToast, setAppToast] = React.useState<string | null>(null);

  // Leaving Notification Settings with unsaved changes asks first.
  const guard = (go: () => void) =>
    view === "settings" && settingsDirty ? setLeaveTo(() => go) : go();
  const openSettings = () => {
    setBellOpen(false);
    setToastId(null);
    if (panel) closePanel();
    setView("settings");
  };
  React.useEffect(() => {
    if (!appToast) return;
    const id = setTimeout(() => setAppToast(null), 3200);
    return () => clearTimeout(id);
  }, [appToast]);

  // Threads you subscribed to, mapped to the settings tab they live on.
  const subscribedThreads: SubscribedThread[] = Object.entries(api.store).flatMap(
    ([scope, threads]) =>
      threads
        .filter((t) => t.subscribed && !t.deleted)
        .map((t) => ({
          scope,
          threadId: t.id,
          tab: scope === "screen:demand-sizing" ? "tab-demand-sizing" : "tab-size-opportunity",
        }))
  );
  const [focusThread, setFocusThread] = React.useState<string | null>(null);
  const [navCollapsed, setNavCollapsed] = React.useState(false);
  const [notifications, setNotifications] = React.useState<AppNotification[]>(seedNotifications);
  const [toastId, setToastId] = React.useState<string | null>(null);
  const [bellOpen, setBellOpen] = React.useState(false);
  const [focusKey, setFocusKey] = React.useState(0);
  const [nav, setNav] = React.useState("size");

  const openPanel = (scope: ScopeId, threadId: string | null = null) => {
    setPanel(scope);
    setFocusThread(threadId);
    setFocusKey((k) => k + 1);
    setNavCollapsed(true);
  };

  const threadFor = (n: AppNotification) =>
    n.scope && n.threadId ? api.store[n.scope]?.find((t) => t.id === n.threadId) : undefined;

  // One path for "View Comment" from the pop-up card or the bell list: mark read, open the right tab,
  // slide the comment panel open and scroll to + highlight the exact message.
  const viewNotification = (n: AppNotification) => {
    setToastId(null);
    setBellOpen(false);
    setNotifications((ns) => ns.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    if (!n.scope) return;
    setView("dashboard");
    if (n.scope === "screen:demand-sizing") setTab("demand-sizing");
    else setTab("size-opportunity");
    openPanel(n.scope, n.threadId ?? null);
  };
  const closePanel = () => {
    setPanel(null);
    setFocusThread(null);
    setNavCollapsed(false);
  };
  const togglePanel = (scope: ScopeId) => (panel === scope ? closePanel() : openPanel(scope));

  // Mention notification arrives shortly after load (Figma "v1" screen).
  React.useEffect(() => {
    const id = setTimeout(() => setToastId("n-1"), 1500);
    return () => clearTimeout(id);
  }, []);

  // Deep links produced by "Copy Link": #<scope>/<threadId>
  React.useEffect(() => {
    const m = /^#((?:screen|widget):[\w-]+)\/([\w-]+)$/.exec(decodeURIComponent(location.hash));
    if (m && m[1] in api.store) {
      if (m[1] === "screen:demand-sizing") setTab("demand-sizing");
      openPanel(m[1] as ScopeId, m[2]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const count = (s: ScopeId) => (api.store[s] ?? []).filter((t) => !t.deleted).length;
  const scope = screenScope(tab);

  return (
    <TooltipProvider>
      {/* Bento layout: flat white surfaces, full-width Border/neutral dividers, no page tint. */}
      <div className="relative flex h-screen overflow-hidden bg-(--color-background-neutral) text-(--color-text-neutral)">
        {/* Left rail — logo bar + side navigation */}
        <div className="flex h-full shrink-0 flex-col border-r border-(--color-border-subtle)">
          {/* Logo bar holds the NucliOS brand mark + collapse / expand toggle */}
          <div
            className={
              navCollapsed
                ? "flex h-12 w-14 items-center justify-center"
                : "flex h-12 w-[232px] items-center justify-between pl-(--spacing-2xl) pr-(--spacing-s)"
            }
          >
            {!navCollapsed && (
              <div className="flex items-center gap-(--spacing-s)">
                <span className="nuclios-type-heading-h5-medium text-(--color-text-neutral)">
                  NucliOS
                </span>
              </div>
            )}
            <Button
              size="small"
              variant="ghost"
              iconOnly
              aria-label={navCollapsed ? "Expand navigation" : "Collapse navigation"}
              aria-expanded={!navCollapsed}
              onClick={() => setNavCollapsed((c) => !c)}
              className="size-9 text-(--color-icons-neutral-subtle)"
            >
              {navCollapsed ? (
                <CaretDoubleRight className="size-5" />
              ) : (
                <CaretDoubleLeft className="size-5" />
              )}
            </Button>
          </div>
          <SideNav
            collapsed={navCollapsed}
            activeId={nav}
            onSelect={(id) =>
              guard(() => {
                setNav(id);
                setView("dashboard");
              })
            }
            className={
              navCollapsed
                ? "min-h-0 flex-1 border-r-0"
                : "min-h-0 w-[232px] flex-1 border-r-0 pt-(--spacing-xs)"
            }
            items={[
              { id: "home", label: "Home", icon: <House className="size-5" /> },
              {
                id: "demand",
                label: "Demand Analysis",
                icon: <ChartLine className="size-5" />,
                children: [
                  { id: "size", label: "Size & Opportunity" },
                  { id: "pattern", label: "Pattern Analysis" },
                ],
              },
              { id: "forecast", label: "Forecast", icon: <Sparkles className="size-5" /> },
              { id: "collab", label: "Collaborative Planning", icon: <Users className="size-5" /> },
            ]}
          />
        </div>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-12 shrink-0 items-center gap-(--spacing-xs) border-b border-(--color-border-subtle) px-(--spacing-6xl)">
            <h1 className="nuclios-type-body-large-medium text-(--color-text-neutral)">
              Integrated Demand Forecasting
            </h1>
            <span className="flex-1" />
            <HeaderIcon label="Notification settings" onClick={openSettings}>
              <Settings className="size-4" />
            </HeaderIcon>
            <NotificationBell
              items={notifications}
              highlighted={toastId !== null}
              open={bellOpen}
              onOpenChange={(o) => {
                setBellOpen(o);
                if (o) setToastId(null);
              }}
              onSelect={viewNotification}
              onMarkAllRead={() => setNotifications((ns) => ns.map((n) => ({ ...n, read: true })))}
              onSettings={openSettings}
              onViewAll={() => {
                setBellOpen(false);
                setToastId(null);
                if (panel) closePanel();
                setView("notifications");
              }}
            />
            <HeaderIcon
              label={dark ? "Light mode" : "Dark mode"}
              aria-pressed={dark}
              onClick={() => setDark((d) => !d)}
            >
              <Moon className="size-4" />
            </HeaderIcon>
            <Avatar
              name={currentUser.name}
              size="s"
              className="size-7 bg-(--color-background-primary-muted)!"
            />
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto">
            {view === "settings" ? (
              <NotificationSettingsPage
                saved={settings}
                subscribed={subscribedThreads}
                onDirtyChange={setSettingsDirty}
                onSave={(next) => {
                  setSettings(next);
                  try {
                    localStorage.setItem("nuclios-notification-settings-v1", JSON.stringify(next));
                  } catch {
                    /* ignore */
                  }
                  setAppToast("Your notification settings have been saved");
                }}
                onUnsubscribe={(ts) =>
                  ts.forEach((t) =>
                    api.setFlag(t.scope as ScopeId, t.threadId, "subscribed", false)
                  )
                }
                onBack={() => guard(() => setView("dashboard"))}
                onClose={() => guard(() => setView("notifications"))}
              />
            ) : view === "notifications" ? (
              <NotificationsPage
                items={notifications}
                threadFor={threadFor}
                onBack={() => setView("dashboard")}
                onOpen={viewNotification}
                onMarkRead={(ids) =>
                  setNotifications((ns) =>
                    ns.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n))
                  )
                }
                onDelete={(ids) => setNotifications((ns) => ns.filter((n) => !ids.includes(n.id)))}
                onSettings={openSettings}
              />
            ) : (
              <div className="flex flex-col gap-(--spacing-l) px-(--spacing-10xl) pt-(--spacing-4xl) pb-(--spacing-14xl)">
                {/* Page header: title + screen-level comments (no breadcrumb, no subtitle) */}
                <div className="flex items-center justify-between gap-(--spacing-2xl)">
                  <h2 className="nuclios-type-heading-h4-medium text-(--color-text-neutral)">
                    Size &amp; Opportunity
                  </h2>
                  <Button
                    size="small"
                    variant={panel === scope ? "secondary" : "border"}
                    aria-pressed={panel === scope}
                    leadingIcon={<MessageCircle className="size-4" />}
                    onClick={() => togglePanel(scope)}
                  >
                    Comments{count(scope) ? ` (${count(scope)})` : ""}
                  </Button>
                </div>

                <Tabs
                  value={tab}
                  onValueChange={(v) => {
                    setTab(v as Tab);
                    if (panel?.startsWith("screen:")) setPanel(screenScope(v as Tab));
                  }}
                >
                  <TabsList
                    type="stroke"
                    size="small"
                    tone="brand"
                    className="w-full justify-start gap-(--spacing-2xs)"
                  >
                    <TabsTrigger
                      value="demand-sizing"
                      className="h-9 px-(--spacing-m) nuclios-type-body-default-regular"
                    >
                      Demand Sizing
                    </TabsTrigger>
                    <TabsTrigger
                      value="size-opportunity"
                      className="h-9 px-(--spacing-m) nuclios-type-body-default-regular"
                    >
                      Opportunity Breakdown
                    </TabsTrigger>
                  </TabsList>
                  <div className="mt-(--spacing-2xl)">
                    <FilterBar />
                  </div>
                  <TabsContent value="size-opportunity" className="mt-(--spacing-6xl)">
                    <WidgetDashboard
                      comments={{
                        isOpen: (s) => panel === s,
                        count,
                        toggle: togglePanel,
                      }}
                    />
                  </TabsContent>
                  <TabsContent value="demand-sizing" className="mt-(--spacing-6xl)">
                    <DataPreview />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </main>
        </div>

        {panel && (
          <CommentPanel
            key={panel}
            scope={panel}
            api={api}
            focusThreadId={focusThread}
            focusKey={focusKey}
            onClose={closePanel}
          />
        )}

        {appToast && (
          <div className="absolute right-(--spacing-6xl) top-[56px] z-40 w-[380px] shadow-(--shadow-6)">
            <Toast
              type="success"
              layout="horizontal"
              title={appToast}
              onClose={() => setAppToast(null)}
            />
          </div>
        )}

        <Modal
          open={!!leaveTo}
          onOpenChange={(o) => !o && setLeaveTo(null)}
          size="s"
          title="Unsaved changes"
          description="Changes made will not be saved. Click Save Changes to keep the changes you made."
          footer={
            <>
              <Button variant="border" onClick={() => setLeaveTo(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const go = leaveTo;
                  setLeaveTo(null);
                  setSettingsDirty(false);
                  go?.();
                }}
              >
                Proceed anyway
              </Button>
            </>
          }
        />

        {(() => {
          const n = notifications.find((x) => x.id === toastId);
          return n ? (
            <NotificationToast
              n={n}
              thread={threadFor(n)}
              onView={() => viewNotification(n)}
              onClose={() => setToastId(null)}
            />
          ) : null;
        })()}
      </div>
    </TooltipProvider>
  );
}
