"use client"

import * as React from "react"

import { Banner, Button } from "@/components/system"
import { ACCOUNTING } from "@/lib/sample"

/**
 * The source behind the page is down: the banner names it and keeps the last good figures' time. Try again
 * asks it once more, keeping its width and its focus while it works; in the example the source never answers,
 * so the banner says it is still down.
 */
export function SourceDownBanner() {
  const [trying, setTrying] = React.useState(false)
  const [tries, setTries] = React.useState(0)
  const retry = () => {
    setTrying(true)
    window.setTimeout(() => {
      setTrying(false)
      setTries((n) => n + 1)
    }, 1200)
  }
  return (
    <Banner
      tone="danger"
      title={`${ACCOUNTING.name} is ${tries ? "still " : ""}not responding`}
      actions={
        <Button size="sm" icon="RotateCcw" loading={trying} onClick={retry}>
          Try again
        </Button>
      }
    >
      {`Figures below are from ${ACCOUNTING.lastAnswered}.`}
    </Banner>
  )
}
