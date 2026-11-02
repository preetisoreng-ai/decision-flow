import * as React from "react";
import { Bell, Bookmark, BookmarkCheck, CheckCheck, MoreVertical, Pencil } from "lucide-react";
import { Avatar, Button, CheckCircleFill, Chip, Menu, Tooltip } from "@nuclios";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { personById, type Attachment, type Reply, type Thread } from "@/data";
import { Composer } from "./composer";
import { FileRow, RichText, Timestamp, downloadFile } from "./parts";
import type { Draft } from "./use-comments";

export interface ThreadHandlers {
  onResolve: () => void;
  onSubscribe: () => void;
  onBookmark: () => void;
  onCopyLink: () => void;
  onDelete: () => void;
  onReply: (d: Draft) => void;
  onEdit: (replyId: string | null, d: Draft) => void;
  onRemoveFile: (replyId: string | null, fileId: string) => void;
}

function Files({ files, onRemove }: { files: Attachment[]; onRemove: (id: string) => void }) {
  const [open, setOpen] = React.useState(false);
  if (!files.length) return null;
  const extra = files.length - 1;
  return (
    <div className="mt-(--spacing-s) flex flex-col gap-(--spacing-2xs)">
      {(open || !extra ? files : files.slice(0, 1)).map((f) => (
        <FileRow key={f.id} file={f} onRemove={() => onRemove(f.id)} />
      ))}
      {extra > 0 && (
        <div className="flex items-center justify-between">
          <Button
            size="small"
            variant="link" className="text-(--color-text-neutral) hover:text-(--color-text-neutral-subtle)"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? `Show less` : `+${extra} more ${extra === 1 ? "file" : "files"}`}
          </Button>
          <Button size="small" variant="link" className="text-(--color-text-neutral) hover:text-(--color-text-neutral-subtle)" onClick={() => files.forEach(downloadFile)}>
            Download all
          </Button>
        </div>
      )}
    </div>
  );
}

function Comment({
  item,
  reply,
  onEdit,
  onRemoveFile,
}: {
  item: Reply;
  reply?: boolean;
  onEdit: (d: Draft) => void;
  onRemoveFile: (id: string) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const author = personById(item.authorId);
  return (
    <div className="group/comment flex gap-(--spacing-l)" id={`comment-${item.id}`}>
      <Avatar name={author.name} tone={author.tone} size="m" />
      <div className="min-w-0 flex-1">
        {editing ? (
          <Composer
            variant="edit"
            initial={{ text: item.text, mentions: item.mentions, attachments: item.attachments }}
            onCancel={() => setEditing(false)}
            onSubmit={(d) => {
              onEdit(d);
              setEditing(false);
            }}
          />
        ) : (
          <>
            <div className="flex min-h-7 items-center gap-(--spacing-s)">
              <span className="nuclios-type-body-small-medium text-(--color-text-neutral)">
                {author.name}
              </span>
              <Timestamp at={item.createdAt} />
              <Tooltip content="Edit comment">
                <Button
                  size="small"
                  variant="ghost"
                  iconOnly
                  aria-label="Edit comment"
                  onClick={() => setEditing(true)}
                  className="ml-auto opacity-0 group-hover/comment:opacity-100 focus-visible:opacity-100"
                >
                  <Pencil className="size-3.5 text-(--color-icons-neutral-subtle)" />
                </Button>
              </Tooltip>
            </div>
            <RichText
              text={item.text}
              mentions={item.mentions}
              className={cn(
                "text-(--color-text-neutral)",
                reply ? "nuclios-type-body-small-regular" : "nuclios-type-body-default-regular"
              )}
            />
            <Files files={item.attachments} onRemove={onRemoveFile} />
          </>
        )}
      </div>
    </div>
  );
}

export function ThreadView({
  thread,
  highlighted,
  h,
}: {
  thread: Thread;
  highlighted?: boolean;
  h: ThreadHandlers;
}) {
  const [repliesOpen, setRepliesOpen] = React.useState(false);
  const n = thread.replies.length;
  return (
    <article
      id={`thread-${thread.id}`}
      aria-label={`Comment thread by ${personById(thread.authorId).name}`}
      className={cn(
        "flex flex-col gap-(--spacing-s) border-b border-(--color-border-subtle) px-(--spacing-2xl) py-(--spacing-l) relative isolate",
        highlighted && "comment-highlight"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex gap-(--spacing-2xs)">
          {thread.resolved && (
            <Chip size="s" state="success">
              Resolved
            </Chip>
          )}
          {thread.deleted && (
            <Chip size="s" state="error">
              Deleted
            </Chip>
          )}
        </div>
        {!thread.deleted && (
          <div className="flex items-center gap-(--spacing-3xs)">
            {/* Thread-level subscription: outline bell = off, filled bell = on. */}
            <Tooltip content={thread.subscribed ? "Turn off notifications for this thread" : "Get notified about this thread"}>
              <Button
                size="small"
                variant="ghost"
                iconOnly
                aria-pressed={!!thread.subscribed}
                aria-label={thread.subscribed ? "Unsubscribe from this thread" : "Subscribe to this thread"}
                onClick={h.onSubscribe}
              >
                <Bell
                  className={cn("size-4", thread.subscribed ? "text-(--color-icons-primary)" : "text-(--color-icons-neutral-subtle)")}
                  fill={thread.subscribed ? "currentColor" : "none"}
                />
              </Button>
            </Tooltip>
            <Tooltip content={thread.resolved ? "Reopen thread" : "Resolve thread"}>
              <Button
                size="small"
                variant="ghost"
                iconOnly
                aria-pressed={thread.resolved}
                aria-label={thread.resolved ? "Reopen thread" : "Resolve thread"}
                onClick={h.onResolve}
              >
                {/* Resolved: Bento CheckCircle (Fill) in Icons/positive; reopened: back to the outline tick. */}
                {thread.resolved ? (
                  <CheckCircleFill className="size-5 text-(--color-icons-positive)" />
                ) : (
                  <CheckCheck className="size-4 text-(--color-icons-neutral-subtle)" />
                )}
              </Button>
            </Tooltip>
            <Tooltip content={thread.bookmarked ? "Remove bookmark" : "Bookmark thread"}>
              <Button
                size="small"
                variant={thread.bookmarked ? "secondary" : "ghost"}
                iconOnly
                aria-pressed={thread.bookmarked}
                aria-label={thread.bookmarked ? "Remove bookmark" : "Bookmark thread"}
                onClick={h.onBookmark}
              >
                {thread.bookmarked ? (
                  <BookmarkCheck className="size-4 text-(--color-icons-neutral-subtle)" />
                ) : (
                  <Bookmark className="size-4 text-(--color-icons-neutral-subtle)" />
                )}
              </Button>
            </Tooltip>
            <Menu
              align="end"
              trigger={
                <Button size="small" variant="ghost" iconOnly aria-label="More actions">
                  <MoreVertical className="size-4 text-(--color-icons-neutral-subtle)" />
                </Button>
              }
              items={[
                { label: "Copy Link", onSelect: h.onCopyLink },
                { label: "Delete Thread", onSelect: h.onDelete },
              ]}
            />
          </div>
        )}
      </div>

      <Comment
        item={thread}
        onEdit={(d) => h.onEdit(null, d)}
        onRemoveFile={(id) => h.onRemoveFile(null, id)}
      />

      <div className="flex flex-col gap-(--spacing-l) pl-(--spacing-14xl)">
        {n > 0 && (
          <div>
            <Button
              size="small"
              variant="link" className="text-(--color-text-neutral) hover:text-(--color-text-neutral-subtle)"
              aria-expanded={repliesOpen}
              trailingIcon={
                <Icons.chevronDown className={cn("size-3.5 transition-transform text-(--color-icons-neutral-subtle)", repliesOpen && "rotate-180")}
                />
              }
              onClick={() => setRepliesOpen((o) => !o)}
            >
              {n} {n === 1 ? "Reply" : "Replies"}
            </Button>
          </div>
        )}
        {repliesOpen &&
          thread.replies.map((r) => (
            <Comment
              key={r.id}
              item={r}
              reply
              onEdit={(d) => h.onEdit(r.id, d)}
              onRemoveFile={(id) => h.onRemoveFile(r.id, id)}
            />
          ))}
        {!thread.deleted && (
          <Composer
            variant="reply"
            placeholder="Add a reply"
            onSubmit={(d) => {
              h.onReply(d);
              setRepliesOpen(true);
            }}
          />
        )}
      </div>
    </article>
  );
}
