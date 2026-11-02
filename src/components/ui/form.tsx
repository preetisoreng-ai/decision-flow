import * as React from "react"
import * as FormPrimitive from "@radix-ui/react-form"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cn } from "@/lib/utils"

const Form = FormPrimitive.Root

const FormField = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.Field>
>(({ className, ...props }, ref) => {
  return (
    <FormPrimitive.Field
      ref={ref as any}
      className={cn("flex flex-col space-y-2 w-full", className)}
      {...props}
    />
  )
})
FormField.displayName = "FormField"

const Label = React.forwardRef<
  HTMLLabelElement,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-sm font-extrabold leading-none tracking-tight text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70 uppercase",
      className
    )}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.Label>
>(({ className, ...props }, ref) => (
  <FormPrimitive.Label
    ref={ref as any}
    className={cn(
      "text-sm font-extrabold leading-none tracking-tight text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70 uppercase cursor-pointer",
      className
    )}
    {...props}
  />
))
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.Control>
>(({ className, ...props }, ref) => (
  <FormPrimitive.Control
    ref={ref as any}
    className={cn("w-full flex", className)}
    {...props}
  />
))
FormControl.displayName = "FormControl"

const FormMessage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.Message>
>(({ className, ...props }, ref) => (
  <FormPrimitive.Message
    ref={ref as any}
    className={cn(
      "text-xs font-bold text-destructive bg-destructive/10 border border-destructive px-2 py-1 select-none",
      className
    )}
    {...props}
  />
))
FormMessage.displayName = "FormMessage"

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border-2 border-primary bg-input px-3 py-2 text-sm font-semibold text-foreground transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border-2 border-primary bg-input px-3 py-2 text-sm font-semibold text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
  Label,
  Input,
  Textarea,
}
