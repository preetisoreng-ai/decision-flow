import * as React from "react";
import {
  seedThreads,
  currentUser,
  type Attachment,
  type Reply,
  type ScopeId,
  type Thread,
} from "@/data";

const STORAGE_KEY = "nuclios-theme-comments-v4"; // v4: thread subscriptions

type Store = Record<ScopeId, Thread[]>;

function load(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...seedThreads, ...JSON.parse(raw) };
  } catch {
    /* storage unavailable — fall back to seed data */
  }
  return seedThreads;
}

function save(store: Store) {
  try {
    // Object URLs for uploaded files don't survive a reload, so drop them before persisting.
    const strip = (a: Attachment) => ({ ...a, url: undefined });
    const clean = Object.fromEntries(
      Object.entries(store).map(([k, threads]) => [
        k,
        threads.map((t) => ({
          ...t,
          attachments: t.attachments.map(strip),
          replies: t.replies.map((r) => ({ ...r, attachments: r.attachments.map(strip) })),
        })),
      ])
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  } catch {
    /* ignore quota / privacy-mode failures */
  }
}

let seq = 0;
export const uid = (p: string) => `${p}-${Date.now().toString(36)}-${(seq++).toString(36)}`;

export interface Draft {
  text: string;
  mentions: string[];
  attachments: Attachment[];
}

export function useComments() {
  const [store, setStore] = React.useState<Store>(load);

  React.useEffect(() => save(store), [store]);

  const update = React.useCallback((scope: ScopeId, fn: (threads: Thread[]) => Thread[]) => {
    setStore((s) => ({ ...s, [scope]: fn(s[scope] ?? []) }));
  }, []);

  const patchThread = React.useCallback(
    (scope: ScopeId, id: string, patch: Partial<Thread> | ((t: Thread) => Partial<Thread>)) =>
      update(scope, (ts) =>
        ts.map((t) =>
          t.id === id ? { ...t, ...(typeof patch === "function" ? patch(t) : patch) } : t
        )
      ),
    [update]
  );

  const actions = React.useMemo(
    () => ({
      addThread(scope: ScopeId, d: Draft) {
        const t: Thread = {
          id: uid("t"),
          authorId: currentUser.id,
          ...d,
          createdAt: Date.now(),
          replies: [],
          resolved: false,
          bookmarked: false,
          deleted: false,
        };
        update(scope, (ts) => [t, ...ts]);
      },
      addReply(scope: ScopeId, threadId: string, d: Draft) {
        const r: Reply = { id: uid("r"), authorId: currentUser.id, ...d, createdAt: Date.now() };
        patchThread(scope, threadId, (t) => ({ replies: [...t.replies, r] }));
      },
      editComment(scope: ScopeId, threadId: string, replyId: string | null, d: Draft) {
        patchThread(scope, threadId, (t) =>
          replyId
            ? { replies: t.replies.map((r) => (r.id === replyId ? { ...r, ...d } : r)) }
            : { ...d }
        );
      },
      removeAttachment(scope: ScopeId, threadId: string, replyId: string | null, fileId: string) {
        const drop = (a: Attachment[]) => a.filter((f) => f.id !== fileId);
        patchThread(scope, threadId, (t) =>
          replyId
            ? {
                replies: t.replies.map((r) =>
                  r.id === replyId ? { ...r, attachments: drop(r.attachments) } : r
                ),
              }
            : { attachments: drop(t.attachments) }
        );
      },
      setFlag(scope: ScopeId, threadId: string, key: "resolved" | "bookmarked" | "subscribed", value: boolean) {
        patchThread(scope, threadId, { [key]: value });
      },
      deleteThread(scope: ScopeId, threadId: string) {
        patchThread(scope, threadId, { deleted: true });
      },
    }),
    [update, patchThread]
  );

  return { store, ...actions };
}

export type CommentsApi = ReturnType<typeof useComments>;
