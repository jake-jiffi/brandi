// ESLint with Next.js's own rules, as a flat config: Core Web Vitals and TypeScript. `npm run lint` passes on a
// fresh starter with no changes, and anything it finds after that is the product's to fix.
import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTypescript from "eslint-config-next/typescript"

// The React Compiler's readiness rules, which eslint-plugin-react-hooks 7 turns on. The kit does not build with
// the compiler: its components are memoised by hand and run on the canvas's React 18 as well as React 19.
const COMPILER_RULES = [
  "static-components",
  "use-memo",
  "void-use-memo",
  "preserve-manual-memoization",
  "incompatible-library",
  "immutability",
  "globals",
  "refs",
  "set-state-in-effect",
  "error-boundaries",
  "purity",
  "set-state-in-render",
  "unsupported-syntax",
  "config",
  "gating",
]
const off = (names) => Object.fromEntries(names.map((name) => [name, "off"]))

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    // Taking a prop out with a rest sibling keeps it off the DOM element, which is a use, not a leftover.
    rules: { "@typescript-eslint/no-unused-vars": ["warn", { ignoreRestSiblings: true }] },
  },
  {
    // The system's code, copied in by `brandi product starter --kit` and checked in Brandi's own loop. It departs
    // from three of Next's defaults on purpose, so the product's lint does not hold it to them.
    files: ["components/system/**", "components/ui/**", "canvas/**", "lib/refs.ts"],
    rules: off(COMPILER_RULES.map((name) => `react-hooks/${name}`)),
  },
  {
    // A component renders on the canvas as well as in Next.js, so it never imports next/image (CONVENTIONS.md).
    files: ["components/system/**"],
    rules: { "@next/next/no-img-element": "off" },
  },
  {
    // shadcn's primitives as the vendoring script writes them: its forwardRef wrappers type their refs as any.
    files: ["components/ui/**"],
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  },
  {
    // A definition is one default-exported object, and its checks take the arguments they are given.
    files: ["components/system/**/*.def.mjs"],
    rules: { "import/no-anonymous-default-export": "off", "@typescript-eslint/no-unused-vars": ["warn", { args: "none", caughtErrors: "none", ignoreRestSiblings: true }] },
  },
  // Build output, generated files and the previews Brandi renders: none of it is written by hand.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "canvas/dist/**",
    "canvas/previews/**",
    "components/system/index.ts",
    "tools/build-globals.mjs",
  ]),
])
