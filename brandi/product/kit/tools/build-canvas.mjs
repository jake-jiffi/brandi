#!/usr/bin/env node
/**
 * Build the canvas bundle from this starter's own components.
 *
 *   node tools/build-canvas.mjs [--out canvas/dist]
 *
 * Writes bundle.js (one script under the system's namespace), bundle.css (this app's globals.css,
 * compiled by Tailwind with every class the components use) and manifest.json (the exports, with
 * the version and checksums). Boards on the Design canvas mount what this writes, so a board shows
 * exactly what production renders: there is one implementation, built twice.
 *
 * React and ReactDOM come from the page. The canvas supplies React 18.3.1 on every artboard, and a
 * bundle carrying its own React cannot share hooks with the page's, so every react import resolves
 * to the shims in canvas/shims.
 */

import { build } from "esbuild"
import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { writeIndex } from "./build-index.mjs"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const argOut = process.argv.indexOf("--out")
const out = path.resolve(argOut >= 0 ? process.argv[argOut + 1] : path.join(root, "canvas", "dist"))
const system = JSON.parse(readFileSync(path.join(root, "system", "system.json"), "utf8"))
if (!/^[A-Z][A-Za-z0-9]*$/.test(system.global ?? "")) {
  throw new Error(`system/system.json needs a "global": the bundle's namespace in PascalCase, such as Acme. Got ${JSON.stringify(system.global)}`)
}

writeIndex(root)
mkdirSync(out, { recursive: true })

const shims = path.join(root, "canvas", "shims")
const pageReact = {
  name: "page-react",
  setup(b) {
    b.onResolve({ filter: /^react(-dom)?(\/.*)?$/ }, (args) => {
      const map = {
        react: "react.js",
        "react/jsx-runtime": "jsx-runtime.js",
        "react/jsx-dev-runtime": "jsx-runtime.js",
        "react-dom": "react-dom.js",
        "react-dom/client": "react-dom.js",
      }
      const file = map[args.path]
      if (!file) return { errors: [{ text: `${args.path} has no page equivalent on the canvas. Only react, react/jsx-runtime, react-dom and react-dom/client are mapped.` }] }
      return { path: path.join(shims, file) }
    })
  },
}

await build({
  entryPoints: [path.join(root, "canvas", "entry.tsx")],
  bundle: true,
  format: "iife",
  globalName: system.global,
  platform: "browser",
  target: "es2020",
  jsx: "automatic",
  minify: true,
  legalComments: "eof",
  define: { "process.env.NODE_ENV": '"production"' },
  tsconfig: path.join(root, "tsconfig.json"),
  plugins: [pageReact],
  outfile: path.join(out, "bundle.js"),
  banner: {
    js: `/* ${system.name} components ${system.version}. Namespace ${system.global}: mount with component-from-global-scope="${system.global}.<Export>", inside ${system.global}.Root. React 18 comes from the page. Built from the starter by tools/build-canvas.mjs. */`,
  },
  logLevel: "warning",
})

// bundle.css is this app's globals.css compiled, so the canvas and production share one stylesheet.
const tailwind = path.join(root, "node_modules", ".bin", "tailwindcss")
if (!existsSync(tailwind)) throw new Error("Tailwind's command line is missing: run npm install in the starter first.")
execFileSync(tailwind, ["-i", path.join(root, "app", "globals.css"), "-o", path.join(out, "bundle.css"), "--minify"], { cwd: root, stdio: "pipe" })

// An IIFE has no exports to report, so one more pass in ESM, written nowhere, lists them.
const listed = await build({
  entryPoints: [path.join(root, "canvas", "entry.tsx")],
  bundle: true,
  format: "esm",
  platform: "browser",
  jsx: "automatic",
  write: false,
  metafile: true,
  outdir: out,
  tsconfig: path.join(root, "tsconfig.json"),
  plugins: [pageReact],
  logLevel: "silent",
})
const exports = [...new Set(Object.values(listed.metafile.outputs).flatMap((o) => o.exports ?? []))].sort()
const sum = (f) => createHash("sha256").update(readFileSync(path.join(out, f))).digest("hex")
const manifest = {
  name: system.name,
  namespace: system.namespace,
  global: system.global,
  version: system.version,
  react: "18.3.1 (the page's)",
  exports,
  files: Object.fromEntries(["bundle.js", "bundle.css"].map((f) => [f, { bytes: readFileSync(path.join(out, f)).length, sha256: sum(f) }])),
}
writeFileSync(path.join(out, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`)
process.stdout.write(`canvas bundle: ${exports.length} exports, bundle.js ${(manifest.files["bundle.js"].bytes / 1024).toFixed(0)} KB, bundle.css ${(manifest.files["bundle.css"].bytes / 1024).toFixed(0)} KB -> ${path.relative(process.cwd(), out) || "."}\n`)
