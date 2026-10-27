import type { Metadata } from "next"

import { KitControls } from "@/components/app/example-kit"
import { PageHeader, SampleBadge } from "@/components/system"

export const metadata: Metadata = { title: "Kit" }

/** Every control in the system, live, in this product's theme. */
export default function KitPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Kit" description="Every control in the system, live and in this product's theme, to try before building a screen." meta={<SampleBadge />} />
      <KitControls />
    </div>
  )
}
