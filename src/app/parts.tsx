import * as React from "react";
import { Download, FileText, Trash2 } from "lucide-react";
import { Button } from "@nuclios";
import { cn } from "@/lib/utils";
import type { Attachment } from "@/data";

/** Splits text so every tagged name renders as a mention. */
export function splitMentions(text: string, mentions: string[]) {
  const names = [...new Set(mentions)].filter(Boolean).sort((a, b) => b.length - a.length);
  if (!names.length) return [{ text, mention: false }];
  const re = new RegExp(
    `(${names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "g"
  );
  return text
    .split(re)
    .filter(Boolean)
    .map((t) => ({ text: t, mention: names.includes(t) }));
}

export function RichText({
  text,
  mentions,
  className,
}: {
  text: string;
  mentions: string[];
  className?: string;
}) {
  return (
    <p className={cn("whitespace-pre-wrap break-words", className)}>
      {splitMentions(text, mentions).map((p, i) =>
        p.mention ? (
          <span key={i} className="font-medium text-(--color-text-link)">
            {p.text}
          </span>
        ) : (
          <React.Fragment key={i}>{p.text}</React.Fragment>
        )
      )}
    </p>
  );
}

/** "9.15 am | 2 May 24" */
export function Timestamp({ at }: { at: number }) {
  const d = new Date(at);
  const h = d.getHours();
  const time = `${h % 12 || 12}.${String(d.getMinutes()).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
  const date = `${d.getDate()} ${d.toLocaleString("en-GB", { month: "short" })} ${String(d.getFullYear()).slice(2)}`;
  return (
    <time
      dateTime={d.toISOString()}
      className="nuclios-type-body-x-small-regular text-(--color-text-neutral-muted) whitespace-nowrap"
    >
      {time} <span aria-hidden>|</span> {date}
    </time>
  );
}

export function downloadFile(f: Attachment) {
  const a = document.createElement("a");
  a.href =
    f.url ?? URL.createObjectURL(new Blob([`${f.name} (${f.size})`], { type: "text/plain" }));
  a.download = f.url ? f.name : `${f.name}.txt`;
  a.click();
}

export function FileRow({ file, onRemove }: { file: Attachment; onRemove?: () => void }) {
  return (
    <div className="flex h-9 items-center gap-(--spacing-s) rounded-(--radius-component-set-1) bg-(--color-background-subtle) pl-(--spacing-s) pr-(--spacing-2xs)">
      <FileText className="size-4 shrink-0 text-(--color-icons-neutral-subtle)" aria-hidden />
      <span className="min-w-0 truncate nuclios-type-body-default-regular text-(--color-text-neutral)">
        {file.name}
      </span>
      <span className="shrink-0 nuclios-type-body-x-small-regular text-(--color-text-neutral-muted)">
        {file.size}
      </span>
      <span className="flex-1" />
      <Button
        size="small"
        variant="ghost"
        iconOnly
        aria-label={`Download ${file.name}`}
        onClick={() => downloadFile(file)}
      >
        <Download className="size-4 text-(--color-icons-neutral-subtle)" />
      </Button>
      {onRemove && (
        <Button
          size="small"
          variant="ghost"
          iconOnly
          aria-label={`Remove ${file.name}`}
          onClick={onRemove}
        >
          <Trash2 className="size-4 text-(--color-icons-neutral-subtle)" />
        </Button>
      )}
    </div>
  );
}
