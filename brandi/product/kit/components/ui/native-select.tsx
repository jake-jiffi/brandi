// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/native-select.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cn } from "@/lib/utils"

import { ChevronDownIcon } from "lucide-react"

type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> & {
  size?: "sm" | "default"
}

const NativeSelect = React.forwardRef(function NativeSelect({
  className,
  size = "default",
  ...props
}: NativeSelectProps, ref: React.ForwardedRef<any>) {
  return (
    <div
      className={cn(
        "group/native-select relative w-fit has-[select:disabled]:opacity-50",
        className
      )}
      data-slot="native-select-wrapper"
      data-size={size}
    >
      <select
        data-slot="native-select"
        data-size={size}
        // Patched (07-starter.md, select trigger): the input's edge (line-control border, a 2px focus edge in place
        // of the outline, a danger edge that stays danger when focused), 32 or 36px, 40 or 44px with 16px text on
        // touch, so iOS never zooms.
        className="h-9 w-full min-w-0 appearance-none rounded-control border border-line-control bg-surface py-1 pr-9 pl-3 type-body text-text select-none hover:bg-surface-subtle focus-visible:border-focus focus-visible:shadow-[0_0_0_1px_var(--focus)] focus-visible:outline-hidden disabled:cursor-not-allowed aria-invalid:border-danger aria-invalid:focus-visible:border-danger aria-invalid:focus-visible:shadow-[0_0_0_1px_var(--danger)] pointer-coarse:h-11 pointer-coarse:type-body-lg data-[size=sm]:h-8 data-[size=sm]:pointer-coarse:h-10"
        {...props}
      ref={ref}
      />
      <ChevronDownIcon
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-text-muted select-none"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  )
})

const NativeSelectOption = React.forwardRef(function NativeSelectOption({
  className,
  ...props
}: React.ComponentProps<"option">, ref: React.ForwardedRef<any>) {
  return (
    <option
      data-slot="native-select-option"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
      ref={ref}
    />
  )
})

const NativeSelectOptGroup = React.forwardRef(function NativeSelectOptGroup({
  className,
  ...props
}: React.ComponentProps<"optgroup">, ref: React.ForwardedRef<any>) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
      ref={ref}
    />
  )
})

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption }
