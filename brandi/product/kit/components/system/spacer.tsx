import * as React from "react"

import { cn } from "@/lib/utils"

export type SpacerProps = Omit<React.ComponentPropsWithoutRef<"div">, "children">

/** A flexible gap inside a Toolbar that pushes what follows to the far end. */
export const Spacer = React.forwardRef<HTMLDivElement, SpacerProps>(function Spacer({ className, ...rest }, ref) {
  return <div ref={ref} aria-hidden="true" data-slot="spacer" className={cn("min-w-0 flex-1", className)} {...rest} />
})
