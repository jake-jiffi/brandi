"use client"

import { PageError, StandalonePage } from "@/components/app/page-states"

/** The whole page failed, outside the shell. Inside it, app/(app)/error.tsx catches first and keeps the rail. */
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <StandalonePage>
      <PageError error={error} retry={retry} />
    </StandalonePage>
  )
}
