import * as React from "react"

import { cn } from "@/lib/utils"

export interface FormRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Two or three short fields side by side. */
  columns?: 2 | 3
}

/** Short fields that belong together, side by side, dropping to one column before any is narrower than 180px. */
export const FormRow = React.forwardRef<HTMLDivElement, FormRowProps>(function FormRow(
  { columns = 2, className, children, ...rest },
  ref
) {
  return (
    <div ref={ref} data-slot="form-row" data-columns={columns} className={cn("@container", className)} {...rest}>
      {/* Two fields need 2 x 180 + 16px of row, three need 3 x 180 + 32px; below that, one column. */}
      <div className={cn("grid grid-cols-1 gap-x-4 gap-y-5", columns === 3 ? "@min-[572px]:grid-cols-3" : "@min-[376px]:grid-cols-2")}>
        {children}
      </div>
    </div>
  )
})
