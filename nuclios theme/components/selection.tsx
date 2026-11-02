import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as RadioPrimitive from "@radix-ui/react-radio-group";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { Minus } from "lucide-react";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/**
 * Bento selection controls:
 *  - "Checkbox" (36): Size S|M|L · State Rest|Hover|Focused|Disabled · Selection Un-selected|Selected|Indeterminate
 *  - "Radio" (24):    Size S|M|L · State … · Selection Un-selected|Selected
 *  - "Toggle" (48):   Pressed Off|On · Size S|M|L · State … · Text Right|Left
 * Each takes an optional label + supporting description (Body/Small/Medium + Body/X-small/Regular muted).
 */
type Size = "s" | "m" | "l";
const box = { s: "size-4", m: "size-5", l: "size-6" };
const icon = { s: "size-3", m: "size-3.5", l: "size-4" };

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-primary-focused) focus-visible:ring-offset-1";

function Labelled({
  id,
  label,
  description,
  children,
  reverse,
  indent,
  disabled,
}: {
  id: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  reverse?: boolean;
  indent: string;
  disabled?: boolean;
}) {
  if (!label) return <>{children}</>;
  return (
    <div className={cn("inline-flex flex-col gap-(--spacing-2xs)", disabled && "opacity-60")}>
      <div
        className={cn(
          "flex items-center gap-(--spacing-s)",
          reverse && "flex-row-reverse justify-end"
        )}
      >
        {children}
        <label
          htmlFor={id}
          className={cn(
            "nuclios-type-body-small-medium text-(--color-text-neutral)",
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          )}
        >
          {label}
        </label>
      </div>
      {description && (
        <p
          className={cn(
            "nuclios-type-body-x-small-regular text-(--color-text-neutral-muted)",
            !reverse && indent
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

export interface CheckboxProps extends React.ComponentPropsWithoutRef<
  typeof CheckboxPrimitive.Root
> {
  id: string;
  size?: Size;
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ id, size = "s", label, description, className, ...props }, ref) => (
    <Labelled
      id={id}
      label={label}
      description={description}
      indent="pl-6"
      disabled={props.disabled}
    >
      <CheckboxPrimitive.Root
        ref={ref}
        id={id}
        className={cn(
          box[size],
          "inline-flex shrink-0 items-center justify-center rounded-(--radius-component-set-4) border border-(--color-border-neutral) bg-(--color-background-neutral) text-(--color-icons-onprimary) transition-colors cursor-pointer",
          "hover:border-(--color-border-neutral-selected) data-[state=checked]:border-(--color-background-primary) data-[state=checked]:bg-(--color-background-primary) data-[state=indeterminate]:border-(--color-background-primary) data-[state=indeterminate]:bg-(--color-background-primary)",
          "disabled:cursor-not-allowed disabled:border-(--color-border-neutral-disabled) disabled:bg-(--color-background-neutral-disabled) disabled:data-[state=checked]:bg-(--color-background-primary-disabled)",
          focusRing,
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator>
          {props.checked === "indeterminate" ? (
            <Minus className={icon[size]} strokeWidth={3} />
          ) : (
            <Icons.check className={icon[size]} />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    </Labelled>
  )
);
Checkbox.displayName = "NucliosCheckbox";

export const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadioPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioPrimitive.Root
    ref={ref}
    className={cn("flex flex-col gap-(--spacing-l)", className)}
    {...props}
  />
));
RadioGroup.displayName = "NucliosRadioGroup";

export interface RadioProps extends React.ComponentPropsWithoutRef<typeof RadioPrimitive.Item> {
  id: string;
  size?: Size;
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Bento "Style": Dot (default) or Tick */
  indicator?: "dot" | "tick";
}

export const Radio = React.forwardRef<HTMLButtonElement, RadioProps>(
  ({ id, size = "s", label, description, indicator = "dot", className, ...props }, ref) => (
    <Labelled
      id={id}
      label={label}
      description={description}
      indent="pl-7"
      disabled={props.disabled}
    >
      <RadioPrimitive.Item
        ref={ref}
        id={id}
        className={cn(
          box[size],
          "m-(--spacing-3xs) inline-flex shrink-0 items-center justify-center rounded-(--radius-pill) border border-(--color-border-subtle) bg-(--color-background-neutral) transition-colors cursor-pointer",
          "hover:border-(--color-border-neutral-selected) data-[state=checked]:border-(--color-background-primary)",
          indicator === "tick" && "data-[state=checked]:bg-(--color-background-primary)",
          "disabled:cursor-not-allowed disabled:bg-(--color-background-neutral-disabled)",
          focusRing,
          className
        )}
        {...props}
      >
        <RadioPrimitive.Indicator className="flex items-center justify-center">
          {indicator === "dot" ? (
            <span className="size-[50%] min-w-2 min-h-2 rounded-full bg-(--color-background-primary)" />
          ) : (
            <Icons.check className={cn(icon[size], "text-(--color-icons-onprimary)")} />
          )}
        </RadioPrimitive.Indicator>
      </RadioPrimitive.Item>
    </Labelled>
  )
);
Radio.displayName = "NucliosRadio";

const track = { s: "h-4 w-8", m: "h-5 w-10", l: "h-6 w-12" };
const thumb = {
  s: "size-3 data-[state=checked]:translate-x-4",
  m: "size-4 data-[state=checked]:translate-x-5",
  l: "size-5 data-[state=checked]:translate-x-6",
};

export interface ToggleProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  id: string;
  size?: Size;
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Bento "Text": label on the Right (default) or Left */
  textPosition?: "right" | "left";
}

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ id, size = "s", label, description, textPosition = "right", className, ...props }, ref) => (
    <Labelled
      id={id}
      label={label}
      description={description}
      indent="pl-10"
      reverse={textPosition === "left"}
      disabled={props.disabled}
    >
      <SwitchPrimitive.Root
        ref={ref}
        id={id}
        className={cn(
          track[size],
          "inline-flex shrink-0 items-center rounded-(--radius-pill) p-(--spacing-3xs) transition-colors cursor-pointer",
          "bg-(--color-background-subtle-selected) hover:bg-(--color-border-neutral-selected) data-[state=checked]:bg-(--color-background-primary) data-[state=checked]:hover:bg-(--color-background-primary-hover)",
          "disabled:cursor-not-allowed disabled:bg-(--color-background-neutral-disabled) disabled:data-[state=checked]:bg-(--color-background-primary-subtle-disabled)",
          focusRing,
          className
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            thumb[size],
            "block rounded-full bg-(--color-background-neutral) shadow-(--shadow-1) transition-transform"
          )}
        />
      </SwitchPrimitive.Root>
    </Labelled>
  )
);
Toggle.displayName = "NucliosToggle";
