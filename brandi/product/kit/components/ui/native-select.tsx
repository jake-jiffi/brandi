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
        className="h-9 w-full min-w-0 appearance-none rounded-md border border-input bg-transparent py-1 pr-8 pl-2.5 text-sm shadow-xs transition-[color,box-shadow] select-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:border-destructive data-[size=sm]:h-8 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50"
        {...props}
      ref={ref}
      />
      <ChevronDownIcon
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground select-none"
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
