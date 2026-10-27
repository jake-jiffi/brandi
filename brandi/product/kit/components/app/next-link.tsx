"use client"

import NextLink from "next/link"
import * as React from "react"

import { LinkProvider, type LinkProps } from "@/lib/link"

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link({ href, ...props }, ref) {
  return <NextLink ref={ref} href={href} {...props} />
})

/** Every system component renders its links through next/link in the product. */
export function NextLinkProvider({ children }: { children: React.ReactNode }) {
  return <LinkProvider component={Link}>{children}</LinkProvider>
}
