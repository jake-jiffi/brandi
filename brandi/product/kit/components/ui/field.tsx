"use client"

// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/field.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { useMemo } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

import { CircleAlertIcon } from "lucide-react"

const FieldSet = React.forwardRef(function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">, ref: React.ForwardedRef<any>) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        "flex flex-col gap-6 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const FieldLegend = React.forwardRef(function FieldLegend({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }, ref: React.ForwardedRef<any>) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      // Patched (07-starter.md, field): the legend in the label and heading styles, in text-strong.
      className={cn(
        "mb-3 text-text-strong data-[variant=label]:type-label data-[variant=legend]:type-heading",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const FieldGroup = React.forwardRef(function FieldGroup({ className, ...props }: React.ComponentProps<"div">, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

// Patched (07-starter.md, field): an error never turns the whole field red; the error line carries it.
const fieldVariants = cva(
  "group/field flex w-full gap-3",
  {
    variants: {
      orientation: {
        vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
        horizontal:
          "flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        responsive:
          "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  }
)

const Field = React.forwardRef(function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>, ref: React.ForwardedRef<any>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
      ref={ref}
    />
  )
})

const FieldContent = React.forwardRef(function FieldContent({ className, ...props }: React.ComponentProps<"div">, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="field-content"
      className={cn(
        "group/field-content flex flex-1 flex-col gap-1 leading-snug",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const FieldLabel = React.forwardRef(function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>, ref: React.ForwardedRef<any>) {
  return (
    // Patched (07-starter.md, label): no leading-snug, which fought the label style's line height.
    <Label
      data-slot="field-label"
      className={cn(
        "group/field-label peer/field-label flex w-fit gap-2 group-data-[disabled=true]/field:opacity-50 has-data-checked:border-primary/30 has-data-checked:bg-primary/5 has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border has-[>[data-slot=field]]:not-has-[:disabled,[data-disabled]]:hover:bg-muted/50 has-[>[data-slot=field]]:has-[:focus-visible]:border-ring has-[>[data-slot=field]]:has-[:focus-visible]:ring-3 has-[>[data-slot=field]]:has-[:focus-visible]:ring-ring/50 *:data-[slot=field]:p-3 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const FieldTitle = React.forwardRef(function FieldTitle({ className, ...props }: React.ComponentProps<"div">, ref: React.ForwardedRef<any>) {
  return (
    // Patched (07-starter.md, label): the label style in text-strong.
    <div
      data-slot="field-label"
      className={cn(
        "flex w-fit items-center gap-2 type-label text-text-strong group-data-[disabled=true]/field:opacity-50",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const FieldDescription = React.forwardRef(function FieldDescription({ className, ...props }: React.ComponentProps<"p">, ref: React.ForwardedRef<any>) {
  return (
    // Patched (07-starter.md, field): hints in the meta style.
    <p
      data-slot="field-description"
      className={cn(
        "text-left type-meta text-text-muted group-has-data-horizontal/field:text-balance [[data-variant=legend]+&]:-mt-1.5",
        "last:mt-0 nth-last-2:-mt-1",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

const FieldSeparator = React.forwardRef(function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  children?: React.ReactNode
}, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        "relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2",
        className
      )}
      {...props}
      ref={ref}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  )
})

const FieldError = React.forwardRef(function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>
}, ref: React.ForwardedRef<any>) {
  const content = useMemo(() => {
    if (children) {
      return children
    }

    if (!errors?.length) {
      return null
    }

    const uniqueErrors = [
      ...new Map(errors.map((error) => [error?.message, error])).values(),
    ]

    if (uniqueErrors?.length == 1) {
      return uniqueErrors[0]?.message
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map(
          (error, index) =>
            error?.message && <li key={index}>{error.message}</li>
        )}
      </ul>
    )
  }, [children, errors])

  if (!content) {
    return null
  }

  // Patched (07-starter.md, field): errors in danger text with an icon as well as colour. role="alert" announces
  // one that appears; a system component that keeps a polite live region of its own passes role={undefined}.
  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn("flex items-start gap-1.5 type-meta text-danger", className)}
      {...props}
      ref={ref}
    >
      <CircleAlertIcon aria-hidden="true" focusable="false" className="mt-0.5 size-3.5 shrink-0" />
      <div className="min-w-0">{content}</div>
    </div>
  )
})

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
}
