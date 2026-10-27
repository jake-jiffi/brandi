// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/alert.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Patched (07-starter.md, alert): the status tones from the role tokens, the system's corners and type.
// Each tone sets the icon's colour through --alert-icon, so the grid below can colour whatever icon it holds.
const alertVariants = cva(
  "@container/alert relative w-full rounded-md border px-4 py-3 text-left type-body text-text",
  {
    variants: {
      variant: {
        default: "border-line bg-surface [--alert-icon:var(--text-muted)]",
        info: "border-info-line bg-info-surface [--alert-icon:var(--info)]",
        success: "border-success-line bg-success-surface [--alert-icon:var(--success)]",
        warning: "border-warning-line bg-warning-surface [--alert-icon:var(--warning)]",
        destructive: "border-danger-line bg-danger-surface [--alert-icon:var(--danger)]",
        ai: "border-ai-line bg-ai-surface [--alert-icon:var(--ai)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type AlertVariant = NonNullable<VariantProps<typeof alertVariants>["variant"]>

// Patched (07-starter.md, alert): only danger and warning interrupt. Every other tone is a polite status,
// and a caller passes role="status" for a warning that is already showing when the page loads.
const INTERRUPTS: AlertVariant[] = ["destructive", "warning"]

// Patched (07-starter.md, alert): the parts sit in a grid inside the container, so AlertAction can move with
// the alert's own width: under the text below 640px, beside it from 640px. shadcn floated it over the text.
const Alert = React.forwardRef(function Alert({
  className,
  variant,
  role,
  children,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="alert"
      data-variant={variant ?? "default"}
      role={role ?? (INTERRUPTS.includes(variant ?? "default") ? "alert" : "status")}
      className={cn(alertVariants({ variant }), className)}
      {...props}
      ref={ref}
    >
      <div
        data-slot="alert-grid"
        className="group/alert grid grid-cols-[minmax(0,1fr)] items-start gap-x-3 gap-y-0.5 has-[>svg]:grid-cols-[auto_minmax(0,1fr)] @min-[640px]/alert:has-[>[data-slot=alert-action]]:grid-cols-[minmax(0,1fr)_auto] @min-[640px]/alert:has-[>svg]:has-[>[data-slot=alert-action]]:grid-cols-[auto_minmax(0,1fr)_auto] *:[svg]:mt-0.5 *:[svg]:text-(--alert-icon) has-[>[data-slot=alert-title]]:*:[svg]:row-span-2 *:[svg:not([class*='size-'])]:size-4"
      >
        {children}
      </div>
    </div>
  )
})

// Patched (07-starter.md, alert): the title in the strong text colour and the label style. Long unbroken words
// (an address, a URL) wrap instead of running out of the box.
const AlertTitle = React.forwardRef(function AlertTitle({ className, ...props }: React.ComponentProps<"div">, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-1 type-label wrap-break-word text-text-strong group-has-[>svg]/alert:col-start-2 [&_a]:text-link [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-link-hover",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

// Patched (07-starter.md, alert): body text in the muted role, long words wrapping, and no viewport breakpoint.
const AlertDescription = React.forwardRef(function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-1 type-body text-pretty wrap-break-word text-text-muted group-has-[>svg]/alert:col-start-2 [&_a]:text-link [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-link-hover [&_p:not(:last-child)]:mb-4",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

// Patched (07-starter.md, alert): in the grid's last column, which is the text column below 640px of the
// alert's width (so the actions sit under the text) and a column of its own from 640px (beside it).
const AlertAction = React.forwardRef(function AlertAction({ className, ...props }: React.ComponentProps<"div">, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="alert-action"
      className={cn(
        "col-[-2/-1] mt-2 flex flex-wrap items-center gap-2 @min-[640px]/alert:row-start-1 @min-[640px]/alert:mt-0 @min-[640px]/alert:self-center @min-[640px]/alert:justify-end group-has-[>[data-slot=alert-title]]/alert:@min-[640px]/alert:row-end-3",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

export { Alert, AlertTitle, AlertDescription, AlertAction }
