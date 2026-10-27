import * as React from "react"

import { BRAND, type MarkRendition } from "@/lib/brand"
import { PRODUCT } from "@/lib/product"
import { cn } from "@/lib/utils"
// A namespace import read by property, so the bundle keeps only the keys the email uses.
import * as tokens from "@/system/tokens.json"

export type EmailScheme = "light" | "dark"
export type EmailFooterLine = string | { label: string; href: string }

export interface EmailProps {
  /** What happened, as the email's one heading: "[14] timesheets need your approval". */
  heading: string
  /** The body: a paragraph, or several. Plain text. */
  body: string | string[]
  /** The one primary action, verb first. A link, because it goes somewhere. */
  action?: { label: string; href: string }
  /** The line inboxes show after the subject. Hidden in the email itself. */
  preheader?: string
  /** Small print under the card: why they got it, a settings link, who sent it. */
  footer?: EmailFooterLine[]
  /** The product's name in the lockup. lib/product.ts by default. */
  product?: string
  /** The logo as a hosted image, for sending: a PNG of the wordmark in public/brand/. Without it the mark is drawn inline, which a canvas and Apple Mail show and Gmail does not. */
  logoSrc?: string
  /** Light or dark, to see how a mail app in that mode shows it. Sent emails carry both. */
  scheme?: EmailScheme
  /** The heading's level on a board. A sent email's heading is always its one h1. */
  headingLevel?: 1 | 2 | 3 | 4
  className?: string
}

// The system's values, read from its tokens: a mail client honours no stylesheet and no custom
// property, so every colour, size and radius goes inline as the value itself.
interface Tokens {
  color?: { tokens?: Array<{ name: string; value: string | { light?: string; dark?: string } }> }
  type?: { families?: Record<string, string>; groups?: Array<{ styles?: TypeStyle[] }> }
  radius?: { tokens?: Array<{ name: string; value: string }> }
}
interface TypeStyle {
  name: string
  fontSize: string
  lineHeight: string
  fontWeight: number
  letterSpacing?: string
}
const SYSTEM: Tokens = { color: tokens.color as Tokens["color"], type: tokens.type as Tokens["type"], radius: tokens.radius as Tokens["radius"] }
const COLOURS = new Map((SYSTEM.color?.tokens ?? []).map((t) => [t.name, t.value]))
const STYLES = new Map((SYSTEM.type?.groups ?? []).flatMap((g) => g.styles ?? []).map((s) => [s.name, s]))
const RADII = new Map((SYSTEM.radius?.tokens ?? []).map((t) => [t.name, t.value]))
// Mail clients skip a face they do not have, so the brand's stack ends on faces every client has.
const SANS = `${String(SYSTEM.type?.families?.sans ?? "Arial, sans-serif").replace(/"/g, "'")}, Arial, Helvetica, sans-serif`

/** A role's value in one scheme, following aliases such as {surface}. */
function role(name: string, scheme: EmailScheme, depth = 0): string {
  const v = COLOURS.get(name)
  const raw = (typeof v === "string" ? v : (v?.[scheme] ?? v?.light) ?? "").trim()
  const alias = /^\{([a-z0-9-]+)\}$/.exec(raw)
  return alias && depth < 8 ? role(alias[1], scheme, depth + 1) : raw
}
/** A type style as inline declarations: "body-lg" is 16px on a 24px line. */
function type(name: string, weight?: number) {
  const s = STYLES.get(name)
  return {
    "font-family": SANS,
    "font-size": s?.fontSize ?? "16px",
    "line-height": s?.lineHeight ?? "24px",
    "font-weight": String(weight ?? s?.fontWeight ?? 400),
    "letter-spacing": s?.letterSpacing && s.letterSpacing !== "0" ? s.letterSpacing : undefined,
  }
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;")
const css = (o: Record<string, string | undefined>) =>
  esc(
    Object.entries(o)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => `${k}:${v}`)
      .join(";")
  )
/** Only addresses a mail client can follow: http, https and mailto, and # for a board. */
const safeHref = (href: string) => (/^(https?:|mailto:|#)/i.test(String(href).trim()) ? esc(String(href).trim()) : "#")
/** An image address: http or https, or a raster image written in, which runs nothing. */
const safeSrc = (src: string) => (/^(https?:|data:image\/(png|jpeg|gif|webp);)/i.test(String(src).trim()) ? esc(String(src).trim()) : "")
/** Paragraphs from a list, or from one string split at its blank lines. */
const paragraphs = (body: string | string[]) =>
  (Array.isArray(body) ? body : String(body ?? "").split(/\n\s*\n/))
    .map((p) => String(p).trim())
    .filter(Boolean)
/**
 * A layout table's opening tag. Separate borders are a mail client's default and are written in anyway,
 * because a webmail's reset (or a page's, on a board) that collapses them squares off rounded cells.
 */
const table = (style: Record<string, string | undefined> = {}, attrs = "") =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0"${attrs} style="${css({ "border-collapse": "separate", ...style })}">`

/** A mark's own ids (clip paths, gradients) made unique to one copy, as Logo does: a sent email carries two. */
function scopeIds(svg: string, scope: string) {
  let out = svg
  for (const id of new Set([...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))) {
    const safe = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    out = out
      .replace(new RegExp(`(\\sid=")${safe}"`, "g"), `$1${scope}-${id}"`)
      .replace(new RegExp(`url\\(#${safe}\\)`, "g"), `url(#${scope}-${id})`)
      .replace(new RegExp(`(href=")#${safe}"`, "g"), `$1#${scope}-${id}"`)
  }
  return out
}

/** The mark as inline SVG with its colours written in, in one scheme. */
function inlineMark(scheme: EmailScheme, height: number, label: string, scope: string) {
  const name: MarkRendition = scheme === "dark" && BRAND.marks["full-on-dark"] ? "full-on-dark" : "full"
  const svg = scopeIds(BRAND.marks[name] ?? BRAND.marks.full, `${scope}-${scheme}`)
  const box = /viewBox="([\d.\s-]+)"/.exec(svg)?.[1].trim().split(/\s+/).map(Number) ?? [0, 0, 4, 1]
  const width = Math.round((height * (box[2] || 4)) / (box[3] || 1))
  return svg
    .replace(/var\(--([a-z0-9-]+)\)/g, (m, r: string) => role(r, scheme) || m)
    .replace(/currentColor/g, role("text-strong", scheme))
    .replace(/<svg\b/, `<svg width="${width}" height="${height}" role="img" aria-label="${esc(label)}" style="display:block"`)
}
/** The logo's width at a height, from the mark's own proportions, so a hosted image gets both dimensions. */
function markWidth(height: number) {
  const box = /viewBox="([\d.\s-]+)"/.exec(BRAND.marks.full)?.[1].trim().split(/\s+/).map(Number) ?? [0, 0, 4, 1]
  return Math.round((height * (box[2] || 4)) / (box[3] || 1))
}

interface Built {
  props: EmailProps
  scheme: EmailScheme
  level: number
  /** In a sent email: both schemes' marks, the dark one shown by the stylesheet. */
  bothMarks?: boolean
}

/** The email's body as mail clients need it: nested layout tables, every style inline, 600px at most. */
function bodyHtml({ props, scheme, level, bothMarks }: Built) {
  const scope = "em"
  const c = (r: string) => role(r, scheme)
  const product = props.product ?? PRODUCT.name
  const h = Math.max(BRAND.logo.height, BRAND.logo.minHeight)
  const mark = props.logoSrc && safeSrc(props.logoSrc)
    ? `<img src="${safeSrc(props.logoSrc)}" alt="${esc(BRAND.name)}" width="${markWidth(h)}" height="${h}" style="${css({ display: "block", border: "0", height: `${h}px`, width: `${markWidth(h)}px` })}">`
    : bothMarks
      ? `<div class="em-mark-light">${inlineMark("light", h, BRAND.name, scope)}</div><div class="em-mark-dark" style="display:none;mso-hide:all">${inlineMark("dark", h, BRAND.name, scope)}</div>`
      : inlineMark(scheme, h, BRAND.name, scope)
  const lockup = `${table()}<tr><td style="vertical-align:middle">${mark}</td><td style="padding:0 12px;vertical-align:middle">${table()}<tr><td class="em-rule" width="1" height="20" style="${css({ width: "1px", height: "20px", "background-color": c("line"), "font-size": "0", "line-height": "0" })}">&nbsp;</td></tr></table></td><td class="em-strong" style="${css({ ...type("heading"), color: c("text-strong"), "vertical-align": "middle" })}">${esc(product)}</td></tr></table>`
  const radius = RADII.get("radius-md") ?? "12px"
  const pill = RADII.get("radius-action") ?? "9999px"
  const tag = `h${level}`
  // Balanced headings and no stranded last words where a client can do it; the rest ignore the line.
  const heading = `<${tag} class="em-strong" style="${css({ margin: "0 0 16px", ...type("heading-lg"), color: c("text-strong"), "text-wrap": "balance" })}">${esc(props.heading)}</${tag}>`
  const body = paragraphs(props.body)
    .map((p, i, all) => `<p class="em-text" style="${css({ margin: i === all.length - 1 ? "0" : "0 0 16px", ...type("body-lg"), color: c("text"), "text-wrap": "pretty" })}">${esc(p)}</p>`)
    .join("")
  const action = props.action
    ? `${table({ "margin-top": "28px" })}<tr><td class="em-button" style="${css({ "border-radius": pill, "background-color": c("primary") })}"><a class="em-button" href="${safeHref(props.action.href)}" style="${css({ display: "inline-block", padding: "12px 28px", border: `1px solid ${c("primary")}`, "border-radius": pill, "background-color": c("primary"), ...type("body-lg", STYLES.get("label")?.fontWeight ?? 500), color: c("on-primary"), "text-decoration": "none" })}"><span class="em-button-label" style="${css({ color: c("on-primary") })}">${esc(props.action.label)}</span></a></td></tr></table>`
    : ""
  const footer = (props.footer ?? [])
    .map((line, i, all) => {
      const text =
        typeof line === "string"
          ? esc(line)
          : `<a class="em-link" href="${safeHref(line.href)}" style="${css({ color: c("link"), "text-decoration": "underline" })}">${esc(line.label)}</a>`
      return `<p class="em-muted" style="${css({ margin: i === all.length - 1 ? "0" : "0 0 8px", ...type("meta"), color: c("text-muted"), "text-wrap": "pretty" })}">${text}</p>`
    })
    .join("")
  const preheader = props.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;opacity:0">${esc(props.preheader)}</div>`
    : ""
  return [
    preheader,
    `${table({ width: "100%", "background-color": c("canvas") }, ' width="100%" class="em-canvas"')}<tr><td align="center" style="padding:32px 16px">`,
    `${table({ width: "100%", "max-width": "600px" }, ' width="600"')}`,
    `<tr><td style="padding:0 4px 20px">${lockup}</td></tr>`,
    `<tr><td class="em-card" style="${css({ padding: "32px", "background-color": c("surface"), border: `1px solid ${c("line")}`, "border-radius": radius })}">${heading}${body}${action}</td></tr>`,
    footer ? `<tr><td style="padding:24px 4px 0">${footer}</td></tr>` : "",
    "</table>",
    "</td></tr></table>",
  ].join("")
}

/** The whole email to send: a document with both schemes, the dark one for mail apps that ask for it. */
function html(props: EmailProps) {
  const d = (r: string) => role(r, "dark")
  const dark = [
    `.em-canvas{background-color:${d("canvas")}!important}`,
    `.em-card{background-color:${d("surface")}!important;border-color:${d("line")}!important}`,
    `.em-strong{color:${d("text-strong")}!important}`,
    `.em-text{color:${d("text")}!important}`,
    `.em-muted{color:${d("text-muted")}!important}`,
    `.em-link{color:${d("link")}!important}`,
    `.em-rule{background-color:${d("line")}!important}`,
    `.em-button{background-color:${d("primary")}!important;border-color:${d("primary")}!important}`,
    `.em-button-label{color:${d("on-primary")}!important}`,
    ".em-mark-light{display:none!important}",
    ".em-mark-dark{display:block!important}",
  ].join("")
  return [
    "<!doctype html>",
    `<html lang="${esc(PRODUCT.lang)}">`,
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta name="x-apple-disable-message-reformatting">',
    '<meta name="color-scheme" content="light dark">',
    '<meta name="supported-color-schemes" content="light dark">',
    `<title>${esc(props.heading)}</title>`,
    `<style>:root{color-scheme:light dark;supported-color-schemes:light dark}@media (max-width:480px){.em-card{padding:24px!important}}@media (prefers-color-scheme:dark){${dark}}</style>`,
    "</head>",
    `<body class="em-canvas" style="${css({ margin: "0", padding: "0", "background-color": role("canvas", "light") })}">`,
    bodyHtml({ props, scheme: "light", level: 1, bothMarks: true }),
    "</body>",
    "</html>",
    "",
  ].join("\n")
}

/** The plain-text part every email carries: the same words, in the same order, with each link written out. */
function text(props: EmailProps) {
  const product = props.product ?? PRODUCT.name
  const lines = [`${BRAND.name} ${product}`.trim(), "", props.heading.trim(), "", ...paragraphs(props.body).flatMap((p) => [p, ""])]
  if (props.action) lines.push(`${props.action.label}: ${props.action.href}`, "")
  for (const line of props.footer ?? []) lines.push(typeof line === "string" ? line : `${line.label}: ${line.href}`)
  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`
}

/**
 * The system's layout for product emails: the lockup, one heading, the body, one primary action and the
 * footer, in layout tables with every style inline, so mail clients render it. On a board it shows the
 * very markup that is sent; Email.html() gives the whole document and Email.text() its plain-text part.
 */
const EmailLayout = React.forwardRef<HTMLDivElement, EmailProps>(function Email(
  { scheme = "light", headingLevel = 1, className, ...props },
  ref
) {
  const level = [1, 2, 3, 4].includes(Number(headingLevel)) ? Number(headingLevel) : 1
  const view: EmailScheme = scheme === "dark" ? "dark" : "light"
  // No hooks: server code imports this module to send mail. Ids are scoped by scheme, which is enough,
  // since two copies in one scheme draw the same mark.
  const markup = bodyHtml({ props: { ...props, scheme: view }, scheme: view, level })
  return <div ref={ref} data-slot="email" data-scheme={view} className={cn("w-full", className)} dangerouslySetInnerHTML={{ __html: markup }} />
})

export const Email = Object.assign(EmailLayout, { html, text })
