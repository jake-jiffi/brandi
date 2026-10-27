"use client"

import * as React from "react"

export type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

const LinkContext = React.createContext<React.ElementType<LinkProps>>("a")

/**
 * The element every system component renders a link with. Plain <a> by default, which is what a
 * canvas board and a preview need; the starter's root layout passes next/link, so production gets
 * client navigation without any component importing Next.js.
 */
export function LinkProvider({ component, children }: { component: React.ElementType<LinkProps>; children: React.ReactNode }) {
  return <LinkContext.Provider value={component}>{children}</LinkContext.Provider>
}

export function useLink() {
  return React.useContext(LinkContext)
}
