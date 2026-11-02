import * as React from "react";
import { Info } from "lucide-react";
import { Label } from "@/components/ui/form";
import { Input as BaseInput, Textarea as BaseTextarea } from "@/components/ui/form";
import { cn } from "@/lib/utils";

/**
 * Bento "Input Fields" (+ Single Line, Multi Line, Email, Password, Number, URL… inputs).
 * Size: L (44px) | M (36px) · Header: Top | Left | None · helper / error text.
 * Shared shell for every labelled control (Input, Textarea, Dropdown).
 */
export interface FieldProps {
  id: string;
  label?: React.ReactNode;
  required?: boolean;
  optional?: boolean;
  info?: string;
  helper?: React.ReactNode;
  error?: React.ReactNode;
  header?: "top" | "left" | "none";
  className?: string;
  children: React.ReactNode;
}

export function Field({
  id,
  label,
  required,
  optional,
  info,
  helper,
  error,
  header = "top",
  className,
  children,
}: FieldProps) {
  const msg = error ?? helper;
  return (
    <div
      className={cn(
        "flex w-full gap-(--spacing-2xs)",
        header === "left" ? "flex-row items-start gap-(--spacing-l)" : "flex-col",
        className
      )}
    >
      {header !== "none" && label && (
        <div
          className={cn(
            "flex items-center gap-(--spacing-2xs)",
            header === "left" && "min-h-11 w-40 shrink-0"
          )}
        >
          <Label
            htmlFor={id}
            className="normal-case tracking-normal nuclios-type-body-large-medium text-(--color-text-neutral)"
          >
            {label}
          </Label>
          {required && (
            <span aria-hidden className="text-(--color-icons-negative)">
              *
            </span>
          )}
          {optional && (
            <span className="nuclios-type-code-default-regular text-(--color-text-neutral)">
              (optional)
            </span>
          )}
          {info && (
            <span title={info} className="inline-flex text-(--color-text-neutral)">
              <Info className="size-4" aria-label={info} />
            </span>
          )}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-(--spacing-2xs)">
        {children}
        {msg && (
          <p
            id={`${id}-msg`}
            className={cn(
              "nuclios-type-body-default-regular",
              error ? "text-(--color-text-negative)" : "text-(--color-text-neutral)"
            )}
          >
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}

export const controlClass = (size: "l" | "m", invalid?: boolean) =>
  cn(
    "w-full rounded-(--radius-component-set-4) border border-(--color-border-neutral) bg-(--color-background-neutral) px-(--spacing-s) font-normal text-(--color-text-neutral) shadow-none transition-colors",
    "placeholder:text-(--color-text-neutral-muted) hover:border-(--color-border-neutral-selected) focus-visible:outline-none focus-visible:ring-0 focus-visible:border-(--color-border-primary) disabled:cursor-not-allowed disabled:bg-(--color-background-neutral-disabled) disabled:text-(--color-text-neutral-disabled) disabled:opacity-100",
    size === "l" ? "h-11 nuclios-type-body-default-regular" : "h-9 nuclios-type-body-small-regular",
    invalid &&
      "border-(--color-border-negative) focus-visible:border-(--color-border-negative-focused)"
  );

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> &
  Omit<FieldProps, "children" | "className"> & {
    size?: "l" | "m";
    className?: string;
    fieldClassName?: string;
  };

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      required,
      optional,
      info,
      helper,
      error,
      header,
      size = "l",
      className,
      fieldClassName,
      ...props
    },
    ref
  ) => (
    <Field
      {...{ id, label, required, optional, info, helper, error, header }}
      className={fieldClassName}
    >
      <BaseInput
        ref={ref}
        id={id}
        required={required}
        aria-invalid={!!error || undefined}
        aria-describedby={helper || error ? `${id}-msg` : undefined}
        className={cn(controlClass(size, !!error), className)}
        {...props}
      />
    </Field>
  )
);
Input.displayName = "NucliosInput";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> &
  Omit<FieldProps, "children" | "className"> & { className?: string; fieldClassName?: string };

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      id,
      label,
      required,
      optional,
      info,
      helper,
      error,
      header,
      className,
      fieldClassName,
      ...props
    },
    ref
  ) => (
    <Field
      {...{ id, label, required, optional, info, helper, error, header }}
      className={fieldClassName}
    >
      <BaseTextarea
        ref={ref}
        id={id}
        required={required}
        aria-invalid={!!error || undefined}
        aria-describedby={helper || error ? `${id}-msg` : undefined}
        className={cn(controlClass("l", !!error), "h-auto min-h-24 py-(--spacing-l)", className)}
        {...props}
      />
    </Field>
  )
);
Textarea.displayName = "NucliosTextarea";
