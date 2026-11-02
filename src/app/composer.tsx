import * as React from "react";
import { AtSign, Cloud, Paperclip, Smile, Upload, X } from "lucide-react";
import { Avatar, Button, Menu, Popover, controlClass } from "@nuclios";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { allPeople, currentUser, type Attachment } from "@/data";
import { uid, type Draft } from "./use-comments";
import { FileRow, splitMentions } from "./parts";

const EMOJI = [
  "😀",
  "😃",
  "😄",
  "😁",
  "😆",
  "😅",
  "😂",
  "🙂",
  "😉",
  "😊",
  "😍",
  "🤩",
  "🤔",
  "🤨",
  "😐",
  "🙄",
  "😮",
  "😢",
  "😭",
  "😤",
  "😡",
  "🥳",
  "😎",
  "🤓",
  "👍",
  "👎",
  "👏",
  "🙌",
  "🙏",
  "💪",
  "🔥",
  "✅",
  "❌",
  "⚠️",
  "📈",
  "📉",
  "💡",
  "🎯",
  "🚀",
  "👀",
];

const sizeOf = (b: number) =>
  b > 1048576 ? `${(b / 1048576).toFixed(1)}Mb` : `${Math.max(1, Math.round(b / 1024))}Kb`;

export interface ComposerProps {
  variant: "post" | "reply" | "edit";
  placeholder?: string;
  initial?: Draft;
  onSubmit: (d: Draft) => void;
  onCancel?: () => void;
}

/** Comment / reply / edit box. Mentions (@), emoji, attachments; Enter sends, Shift+Enter breaks a line. */
export function Composer({
  variant,
  placeholder = "Add a comment",
  initial,
  onSubmit,
  onCancel,
}: ComposerProps) {
  const [text, setText] = React.useState(initial?.text ?? "");
  const [mentions, setMentions] = React.useState<string[]>(initial?.mentions ?? []);
  const [files, setFiles] = React.useState<Attachment[]>(initial?.attachments ?? []);
  const [open, setOpen] = React.useState(variant === "edit");
  const [query, setQuery] = React.useState<string | null>(null);
  const [hi, setHi] = React.useState(0);
  const ta = React.useRef<HTMLTextAreaElement>(null);
  const mirror = React.useRef<HTMLDivElement>(null);
  const fileInput = React.useRef<HTMLInputElement>(null);
  const listId = React.useId();

  const live = mentions.filter((m) => text.includes(m));
  const matches =
    query === null
      ? []
      : allPeople.filter(
          (p) => p.id !== currentUser.id && p.name.toLowerCase().includes(query.toLowerCase())
        );
  const changed =
    text.trim() !== (initial?.text ?? "").trim() ||
    files.length !== (initial?.attachments.length ?? 0);
  const canSend = variant === "edit" ? changed && !!text.trim() : !!text.trim() || files.length > 0;

  React.useLayoutEffect(() => {
    const el = ta.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(Math.max(el.scrollHeight, variant === "post" ? 64 : 44), 180)}px`;
  }, [text, open, variant]);

  React.useEffect(() => {
    if (open) {
      const el = ta.current;
      el?.focus();
      el?.setSelectionRange(el.value.length, el.value.length);
    }
  }, [open]);

  const detect = (value: string, caret: number) => {
    const m = /(^|\s)@(\w*)$/.exec(value.slice(0, caret));
    setQuery(m ? m[2] : null);
    setHi(0);
  };

  const insert = (str: string, back = 0) => {
    const el = ta.current;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    setText(text.slice(0, start - back) + str + text.slice(end));
    requestAnimationFrame(() => {
      const pos = start - back + str.length;
      el?.focus();
      el?.setSelectionRange(pos, pos);
    });
  };

  const pick = (name: string) => {
    insert(`${name} `, (query?.length ?? 0) + 1);
    setMentions((m) => [...new Set([...m, name])]);
    setQuery(null);
  };

  const reset = () => {
    setText("");
    setMentions([]);
    setFiles([]);
    setQuery(null);
    setOpen(false);
  };

  const submit = () => {
    if (!canSend) return;
    onSubmit({ text: text.trim(), mentions: live, attachments: files });
    if (variant !== "edit") reset();
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (matches.length) {
      if (e.key === "ArrowDown")
        return (e.preventDefault(), setHi((h) => (h + 1) % matches.length));
      if (e.key === "ArrowUp")
        return (e.preventDefault(), setHi((h) => (h - 1 + matches.length) % matches.length));
      if (e.key === "Enter" || e.key === "Tab") return (e.preventDefault(), pick(matches[hi].name));
      if (e.key === "Escape") return (e.preventDefault(), setQuery(null));
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
    if (e.key === "Escape")
      variant === "edit" ? onCancel?.() : !text && !files.length && setOpen(false);
  };

  const reply = variant === "reply";

  if (!open) {
    return (
      <div className="flex items-center gap-(--spacing-s)">
        {reply && <Avatar name={currentUser.name} tone={currentUser.tone} size="m" />}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            controlClass(reply ? "m" : "l"),
            "cursor-text text-left text-(--color-text-neutral-muted)"
          )}
        >
          {placeholder}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-(--spacing-s)">
      {reply && (
        <Avatar
          name={currentUser.name}
          tone={currentUser.tone}
          size="m"
          className="mt-(--spacing-2xs)"
        />
      )}
      <div className="relative min-w-0 flex-1">
        <div className="rounded-(--radius-component-set-4) border border-(--color-border-primary) bg-(--color-background-neutral)">
          <div className="relative px-(--spacing-l) pt-(--spacing-m)">
            {/* Mention highlight layer under a transparent textarea — same metrics, so the caret stays aligned. */}
            <div
              ref={mirror}
              aria-hidden
              className="pointer-events-none absolute inset-x-(--spacing-l) top-(--spacing-m) bottom-0 overflow-hidden whitespace-pre-wrap break-words nuclios-type-body-default-regular text-(--color-text-neutral)"
            >
              {splitMentions(text, live).map((p, i) =>
                p.mention ? (
                  <span key={i} className="text-(--color-text-link)">
                    {p.text}
                  </span>
                ) : (
                  <React.Fragment key={i}>{p.text}</React.Fragment>
                )
              )}
              {"​"}
            </div>
            <textarea
              ref={ta}
              value={text}
              rows={2}
              placeholder={variant === "edit" ? "" : `${placeholder} — type @ to mention`}
              aria-label={variant === "edit" ? "Edit comment" : placeholder}
              aria-autocomplete="list"
              aria-controls={matches.length ? listId : undefined}
              aria-expanded={matches.length > 0}
              onChange={(e) => {
                setText(e.target.value);
                detect(e.target.value, e.target.selectionStart);
              }}
              onSelect={(e) => detect(e.currentTarget.value, e.currentTarget.selectionStart)}
              onScroll={(e) =>
                mirror.current && (mirror.current.scrollTop = e.currentTarget.scrollTop)
              }
              onKeyDown={onKey}
              className="relative block w-full resize-none bg-transparent nuclios-type-body-default-regular text-transparent caret-(--color-text-neutral) placeholder:text-(--color-text-neutral-muted) focus:outline-none"
            />
          </div>

          {files.length > 0 && (
            <div className="flex flex-col gap-(--spacing-2xs) px-(--spacing-s) pt-(--spacing-s)">
              {files.map((f) => (
                <FileRow
                  key={f.id}
                  file={f}
                  onRemove={() => setFiles((fs) => fs.filter((x) => x.id !== f.id))}
                />
              ))}
            </div>
          )}

          <div className="mx-(--spacing-s) mt-(--spacing-s) flex items-center justify-between border-t border-(--color-border-muted) py-(--spacing-xs)">
            <div className="flex items-center gap-(--spacing-2xs)">
              <Menu
                trigger={
                  <Button size="small" variant="ghost" iconOnly aria-label="Attach file">
                    <Paperclip className="size-4 text-(--color-icons-neutral-subtle)" />
                  </Button>
                }
                items={[
                  {
                    label: "Attach Cloud File",
                    icon: <Cloud className="size-4 text-(--color-icons-neutral-subtle)" />,
                    onSelect: () =>
                      setFiles((fs) => [
                        ...fs,
                        { id: uid("f"), name: "Demand_Forecast.xlsx", size: "50Kb" },
                      ]),
                  },
                  {
                    label: "Upload from this device",
                    icon: <Upload className="size-4 text-(--color-icons-neutral-subtle)" />,
                    onSelect: () => fileInput.current?.click(),
                  },
                ]}
              />
              <Popover
                side="bottom"
                trigger={
                  <Button size="small" variant="ghost" iconOnly aria-label="Insert emoji">
                    <Smile className="size-4 text-(--color-icons-neutral-subtle)" />
                  </Button>
                }
              >
                <div
                  className="grid grid-cols-8 gap-(--spacing-3xs)"
                  role="group"
                  aria-label="Emoji"
                >
                  {EMOJI.map((em) => (
                    <button
                      key={em}
                      type="button"
                      aria-label={`Insert ${em}`}
                      onClick={() => insert(em)}
                      className="h-7 rounded-(--radius-component-set-1) text-[18px] leading-none hover:bg-(--color-background-neutral-hover) cursor-pointer"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </Popover>
              <Button
                size="small"
                variant="ghost"
                iconOnly
                aria-label="Mention someone"
                onClick={() => insert("@")}
              >
                <AtSign className="size-4 text-(--color-icons-neutral-subtle)" />
              </Button>
            </div>
            {variant === "edit" ? (
              <div className="flex items-center gap-(--spacing-2xs)">
                <Button
                  size="small"
                  variant="ghost"
                  iconOnly
                  aria-label="Cancel editing"
                  onClick={onCancel}
                >
                  <X className="size-4 text-(--color-icons-neutral-subtle)" />
                </Button>
                <Button
                  size="small"
                  iconOnly
                  aria-label="Save comment"
                  disabled={!canSend}
                  onClick={submit}
                >
                  <Icons.check className="size-4 text-(--color-icons-onprimary)" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-(--spacing-2xs)">
                {!text && !files.length && (
                  <Button size="small" variant="ghost" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                )}
                <Button
                  size="small"
                  iconOnly
                  aria-label={reply ? "Send reply" : "Send comment"}
                  disabled={!canSend}
                  onClick={submit}
                >
                  <Icons.arrowRight className="size-4 -rotate-90 text-(--color-icons-onprimary)" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {matches.length > 0 && (
          <ul
            id={listId}
            role="listbox"
            aria-label="People"
            className="absolute inset-x-(--spacing-s) top-(--spacing-14xl) z-30 max-h-56 overflow-y-auto rounded-(--radius-container-set-1) border border-(--color-border-muted) bg-(--color-background-neutral) py-(--spacing-2xs) shadow-(--shadow-4)"
          >
            {matches.map((p, i) => (
              <li key={p.id} role="option" aria-selected={i === hi}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setHi(i)}
                  onClick={() => pick(p.name)}
                  className={cn(
                    "flex h-9 w-full items-center gap-(--spacing-s) px-(--spacing-s) nuclios-type-body-default-regular text-(--color-text-neutral) cursor-pointer",
                    i === hi && "bg-(--color-background-neutral-hover)"
                  )}
                >
                  <Avatar name={p.name} tone={p.tone} size="s" />
                  {p.name}
                </button>
              </li>
            ))}
          </ul>
        )}
        <input
          ref={fileInput}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            const list = Array.from(e.target.files ?? []).map((f) => ({
              id: uid("f"),
              name: f.name,
              size: sizeOf(f.size),
              url: URL.createObjectURL(f),
            }));
            setFiles((fs) => [...fs, ...list]);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
