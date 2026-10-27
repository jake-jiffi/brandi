"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

import { figureContext } from "./chart"

export interface ChartFigureProps extends Omit<React.ComponentPropsWithoutRef<"figure">, "title"> {
  /** The heading that names the chart. It is the figure's accessible name. */
  title: string
  /** The takeaway in one sentence. It is the figure's accessible description, and the chart's. */
  summary: string
  /** The heading's level, so no page skips one. */
  headingLevel?: 2 | 3 | 4 | 5 | 6
  /** One chart: BarChart, LineChart, HBarChart or ShareBar. */
  children?: React.ReactNode
}

/**
 * A chart's frame: a heading that names it, the takeaway in one sentence, then the chart on a
 * surface, whose numbers follow as a visually hidden table.
 */
export const ChartFigure = React.forwardRef<HTMLElement, ChartFigureProps>(function ChartFigure(
  { title, summary, headingLevel = 2, className, children, ...rest },
  ref
) {
  const id = React.useId()
  const titleId = `${id}-title`
  const summaryId = `${id}-summary`
  const Heading = `h${headingLevel}` as "h2"
  const info = React.useMemo(() => ({ titleId, summaryId, title }), [titleId, summaryId, title])
  return (
    <figure
      ref={ref}
      data-slot="chart-figure"
      aria-labelledby={titleId}
      aria-describedby={summaryId}
      className={cn("@container min-w-0 rounded-md border border-line bg-surface shadow-sm", className)}
      {...rest}
    >
      {/* The figure is the container; this inner box is what tightens when the figure is narrow. */}
      <div className="flex flex-col gap-5 p-5 @max-[479px]:gap-4 @max-[479px]:p-4">
        <figcaption className="flex flex-col gap-1">
          <Heading id={titleId} data-slot="chart-figure-title" className="type-heading text-text-strong">
            {title}
          </Heading>
          <p id={summaryId} data-slot="chart-figure-summary" className="max-w-measure type-body text-pretty text-text-muted">
            {summary}
          </p>
        </figcaption>
        <figureContext.Provider value={info}>{children}</figureContext.Provider>
      </div>
    </figure>
  )
})
