import { cn } from "@/lib/utils";

/**
 * Avatar (initials). Not a documented Bento page — added for comment/people UIs.
 * Fill colours rotate through the ranked data-visualization tokens so they follow brand modes.
 * Size: xs (20) | s (24) | m (32) | l (40)
 */
const sizes = {
  xs: "size-5 nuclios-type-body-x-small-medium",
  s: "size-6 nuclios-type-body-x-small-medium",
  m: "size-8 nuclios-type-body-small-medium",
  l: "size-10 nuclios-type-body-default-medium",
};

export interface AvatarProps {
  name: string;
  /** 1–10: which data-visualization category colour to use. Defaults to a hash of the name. */
  tone?: number;
  size?: keyof typeof sizes;
  className?: string;
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

export function Avatar({ name, tone, size = "m", className }: AvatarProps) {
  const t = tone ?? (hash(name) % 10) + 1;
  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-(--radius-pill) text-(--color-text-neutral)",
        sizes[size],
        className
      )}
      style={{ background: `var(--color-data-visualization-category-${t})` }}
    >
      {initials(name)}
    </span>
  );
}
