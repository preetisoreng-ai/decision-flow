import * as React from "react";
import { MessagesSquare, SlidersHorizontal, X } from "lucide-react";
import { Button, Checkbox, Modal, ModalClose, Popover, Toast } from "@nuclios";
import { scopeLabels, type ScopeId, type Thread } from "@/data";
import { Composer } from "./composer";
import { ThreadView } from "./thread";
import type { CommentsApi } from "./use-comments";

type FilterKey = "bookmarked" | "resolved" | "deleted";
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "bookmarked", label: "Bookmarked" },
  { key: "resolved", label: "Resolved" },
  { key: "deleted", label: "Deleted" },
];

const visibleThreads = (threads: Thread[], active: FilterKey[]) =>
  active.length
    ? threads.filter((t) => active.some((k) => t[k]) && (active.includes("deleted") || !t.deleted))
    : threads.filter((t) => !t.deleted);

export function CommentPanel({
  scope,
  api,
  focusThreadId,
  focusKey,
  onClose,
}: {
  scope: ScopeId;
  api: CommentsApi;
  focusThreadId?: string | null;
  /** Changes on every "View Comment" so an already-open panel re-scrolls and re-highlights. */
  focusKey?: number;
  onClose: () => void;
}) {
  const [filters, setFilters] = React.useState<FilterKey[]>([]);
  const [toast, setToast] = React.useState<string | null>(null);
  const [confirmId, setConfirmId] = React.useState<string | null>(null);
  const [flash, setFlash] = React.useState<string | null>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const threads = api.store[scope] ?? [];
  const visible = visibleThreads(threads, filters);

  React.useEffect(() => setFilters([]), [scope]);

  React.useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(id);
  }, [toast]);

  React.useEffect(() => {
    if (!focusThreadId) return;
    const el = document.getElementById(`thread-${focusThreadId}`);
    const list = listRef.current;
    if (el && list) {
      const top =
        el.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop;
      list.scrollTo({ top: top - list.clientHeight / 2 + el.clientHeight / 2, behavior: "smooth" });
    }
    setFlash(focusThreadId);
    const id = setTimeout(() => setFlash(null), 2600);
    return () => clearTimeout(id);
  }, [focusThreadId, focusKey, scope]);

  const copyLink = async (id: string) => {
    const url = `${location.origin}${location.pathname}#${scope}/${id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      history.replaceState(null, "", `#${scope}/${id}`);
    }
    setToast("Link copied successfully");
  };

  return (
    <aside
      aria-label="Comments"
      className="relative flex h-full w-[416px] shrink-0 animate-[panel-in_260ms_ease-out] flex-col border-l border-(--color-border-subtle) bg-(--color-background-neutral) motion-reduce:animate-none"
    >
      <header className="flex min-h-[54px] items-center justify-between gap-(--spacing-s) border-b border-(--color-border-subtle) px-(--spacing-2xl) py-(--spacing-xs)">
        <div className="min-w-0">
          <h2 className="nuclios-type-heading-h5-medium text-(--color-text-neutral)">Comments</h2>
          <p className="truncate nuclios-type-body-small-regular text-(--color-text-neutral-muted)">
            {scopeLabels[scope]}
          </p>
        </div>
        <div className="flex items-center gap-(--spacing-2xs)">
          <Popover
            align="end"
            title="Filter comments"
            trigger={
              <Button
                size="small"
                variant={filters.length ? "secondary" : "ghost"}
                aria-label={`Filter comments${filters.length ? `, ${filters.length} applied` : ""}`}
                leadingIcon={<SlidersHorizontal className="size-4 text-(--color-icons-neutral-subtle)" />}
              >
                {filters.length > 0 && filters.length}
              </Button>
            }
          >
            <div className="flex flex-col gap-(--spacing-l)">
              {FILTERS.map((f) => (
                <Checkbox
                  key={f.key}
                  id={`filter-${f.key}`}
                  size="m"
                  label={f.label}
                  checked={filters.includes(f.key)}
                  onCheckedChange={(on) =>
                    setFilters((fs) => (on ? [...fs, f.key] : fs.filter((k) => k !== f.key)))
                  }
                />
              ))}
              <div className="flex justify-end border-t border-(--color-border-muted) pt-(--spacing-s)">
                <Button
                  size="small"
                  variant="link"
                  disabled={!filters.length}
                  onClick={() => setFilters([])}
                >
                  Reset
                </Button>
              </div>
            </div>
          </Popover>
          <Button
            size="small"
            variant="ghost"
            iconOnly
            aria-label="Close comments"
            onClick={onClose}
          >
            <X className="size-4 text-(--color-icons-neutral-subtle)" />
          </Button>
        </div>
      </header>

      {toast && (
        <div className="absolute inset-x-(--spacing-2xl) top-(--spacing-l) z-20">
          <Toast
            type="success"
            layout="horizontal"
            title={toast}
            onClose={() => setToast(null)}
            className="shadow-(--shadow-4)"
          />
        </div>
      )}

      <div ref={listRef} className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-(--spacing-s) border-b border-(--color-border-subtle) px-(--spacing-2xl) py-(--spacing-2xl)">
          <span className="nuclios-type-body-large-regular text-(--color-text-neutral)">
            Add Comment
          </span>
          <Composer key={scope} variant="post" onSubmit={(d) => api.addThread(scope, d)} />
        </div>

        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-(--spacing-l) px-(--spacing-6xl) py-(--spacing-19xl) text-center">
            <span className="inline-flex size-14 items-center justify-center rounded-(--radius-pill) bg-(--color-background-primary-muted) text-(--color-icons-neutral-subtle)">
              <MessagesSquare className="size-6" aria-hidden />
            </span>
            <p className="nuclios-type-body-large-medium text-(--color-text-neutral)">
              {filters.length ? "No comments match these filters" : "No Comment Added"}
            </p>
            <p className="nuclios-type-body-default-regular text-(--color-text-neutral-muted)">
              {filters.length
                ? "Try clearing a filter."
                : "Start the conversation — type @ to mention a teammate."}
            </p>
          </div>
        ) : (
          visible.map((t) => (
            <ThreadView
              key={t.id}
              thread={t}
              highlighted={flash === t.id}
              h={{
                onSubscribe: () => {
                  api.setFlag(scope, t.id, "subscribed", !t.subscribed);
                  setToast(
                    t.subscribed
                      ? "Thread notifications turned off"
                      : "You’ll be notified about new replies in this thread"
                  );
                },
                onResolve: () => {
                  api.setFlag(scope, t.id, "resolved", !t.resolved);
                  setToast(
                    t.resolved ? "Comment thread reopened" : "Comment thread resolved successfully"
                  );
                },
                onBookmark: () => {
                  api.setFlag(scope, t.id, "bookmarked", !t.bookmarked);
                  setToast(
                    t.bookmarked ? "Bookmark removed" : "Comment thread bookmarked successfully"
                  );
                },
                onCopyLink: () => copyLink(t.id),
                onDelete: () => setConfirmId(t.id),
                onReply: (d) => api.addReply(scope, t.id, d),
                onEdit: (rid, d) => api.editComment(scope, t.id, rid, d),
                onRemoveFile: (rid, fid) => api.removeAttachment(scope, t.id, rid, fid),
              }}
            />
          ))
        )}
      </div>

      <Modal
        open={!!confirmId}
        onOpenChange={(o) => !o && setConfirmId(null)}
        size="xs"
        title="Delete Thread"
        description="Are you sure you want to delete this comment thread?"
        footer={
          <>
            <ModalClose asChild>
              <Button variant="border">Cancel</Button>
            </ModalClose>
            <Button
              destructive
              onClick={() => {
                if (confirmId) api.deleteThread(scope, confirmId);
                setConfirmId(null);
                setToast("Comment thread deleted successfully");
              }}
            >
              Delete
            </Button>
          </>
        }
      />
    </aside>
  );
}
