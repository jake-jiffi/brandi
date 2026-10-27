"use client"

import * as React from "react"

import { Card, DescriptionList, Kbd, TextLink } from "@/components/system"
import { useShortcuts } from "@/hooks/use-shortcuts"

/** The keys that work everywhere. While single-key shortcuts are off, the list says so instead of showing a key that does nothing. */
export function ShortcutList() {
  const [on] = useShortcuts()
  return (
    <Card id="keyboard-shortcuts" title="Keyboard shortcuts" className="scroll-mt-6">
      <DescriptionList
        items={[
          { label: "Search, jump to a page or run a command", value: <Kbd>⌘K</Kbd> },
          {
            label: "Search the list on this page",
            value: on ? (
              <Kbd>/</Kbd>
            ) : (
              <>
                Off. <TextLink href="/settings#keyboard">Turn on single-key shortcuts</TextLink>
              </>
            ),
          },
          { label: "Go to the newest notification", value: <Kbd>⌥T</Kbd> },
          { label: "Close what opened last", value: <Kbd>Esc</Kbd> },
        ]}
      />
    </Card>
  )
}
