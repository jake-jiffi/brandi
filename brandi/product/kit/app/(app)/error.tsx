"use client"

import { PageError } from "@/components/app/page-states"

/** A page inside the shell failed. The rail stays, so people can go elsewhere without starting again. */
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <div className="flex min-h-full items-center justify-center py-10">
      <PageError error={error} retry={retry} />
    </div>
  )
}
