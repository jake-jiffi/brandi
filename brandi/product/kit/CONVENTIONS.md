# Building a component in the kit

Every file in `components/system/` is built twice: into the product (Next.js, React 19) and into the
canvas bundle (the Design canvas, React 18.3.1 from the page). A board mounts exactly what production
renders. These rules keep both builds working and keep each component at the system's bar.

The catalogue and each component's contract live in the product-system skill:
`skills/product-system/references/05-components.md` (sections 2 and 3, and 4 for the default set) and
`10-ai-catalogue.md` for the assistant. The contract there is the spec. Where this file and the
reference disagree on behaviour, the reference wins; where they disagree on how the kit is built,
this file wins.

## Files

- `components/system/<kebab-name>.tsx`: the component, as a named PascalCase export. Small parts that
  only make sense together (`NavGroup` and `NavItem`) may share a file.
- `components/system/<kebab-name>.def.mjs`: its one definition. One per catalogue entry. Copy the
  shape of `button.def.mjs`.
- `components/system/index.ts` is generated. Never edit it.
- `components/ui/*.tsx` are the shadcn primitives. Use them for anything Radix does better than a
  hand-rolled widget (focus traps, roving focus, positioning, dismissal). To change one, edit it and
  put `// Patched (07-starter.md, <what>)` beside the change; a re-vendor then leaves it alone.

## React 18 and 19, both

- Any component that renders one root element forwards its ref: `React.forwardRef`. React 18 drops a
  ref given to a plain function component, and Radix anchors popovers and returns focus through refs.
- No React 19-only API: no `use()`, no ref as a prop, no `useActionState`, `useOptimistic` or
  `useFormStatus`, no `<form action={fn}>`, no `<Context>` as a provider (write `<Context.Provider>`).
- No Next.js import in `components/system`. Links render through `useLink()` from `@/lib/link`,
  which is a plain `<a>` on a board and next/link in the starter.
- `"use client"` at the top of any file with state, effects or handlers.

## Tokens, never raw values

- Colours are role utilities only: `bg-surface`, `bg-surface-subtle`, `text-text-muted`,
  `border-line-control`, `bg-primary text-on-primary`, `bg-danger-surface text-danger`, and so on
  (the role list is in `system/tokens.json`). No hex, rgb or named colour, and no arbitrary colour
  except `var(--<role>)`.
- Type is the `type-*` utilities: `type-hero`, `type-display`, `type-title`, `type-heading-lg`,
  `type-heading`, `type-heading-sm`, `type-kpi`, `type-kpi-sm`, `type-body-lg`, `type-body`,
  `type-label`, `type-meta`, `type-caption`, `type-eyebrow`, `type-code`. Never `text-sm font-medium`.
- Corners follow the radius tokens' usages: `rounded-xs` (checkboxes, keys, tiny marks), `rounded-sm`
  (badges, tags, tooltips), `rounded-control` (inputs, selects, menu items), `rounded-action`
  (whatever a person can press: buttons, chips, segmented controls, the switch), `rounded-md` (cards,
  menus, toasts), `rounded-lg` (panes, dialogs, sheets, the rail), `rounded-xl` (sign-in frames),
  `rounded-full` (avatars, dots). Shadows: `shadow-xs` to `shadow-xl`.
- Spacing is Tailwind's 4px scale. Control heights: 32, 36, 44px (`h-8`, `h-9`, `h-11`).

## Behaviour every component meets

- **Focus.** Never `outline-none` or a `focus:ring`. The base styles draw one outline on
  `:focus-visible`. Inputs show a 2px edge instead. Inside anything that scrolls or clips, draw focus
  inside: `focus-visible:outline-offset-[-2px]`.
- **Touch.** `pointer-coarse:` sizes things up: controls 40, 44 and 48px; anything pressable 40px at
  least; 24px hit areas for checkboxes, switches and inline links; 8px between targets; 16px input
  text on touch.
- **Its own width.** Respond to the container, never the window: `@container` on the root and
  `@max-[639px]:` style variants. Never `sm:` or `lg:` for a component's layout.
- **Screen readers.** Real elements (`button`, `a href`, `input` with `label`). Status never rides on
  colour alone: a word or an icon too. Live regions are polite and speak on change only.
  `role="alert"` only for something that went wrong while the person was there.
- **Reduced motion.** Movement under `motion-safe:`. Fades may stay.
- **Forced colours.** Give every part a `data-slot`. Anything current, selected or pressed stays
  visible in forced colours (`forced-colors:` utilities), and nothing draws an outline at rest.
- **Loading, empty, error.** Data components take them as props (`loading`, `empty`, `error`, or
  `state`). A missing value says so; it is never drawn as zero.
- **On a canvas.** Lists take `items`, tables `columns` and `rows`, charts `data` and `series`.
  Transient states render in place on request: `open` (Select, Menu, Tooltip, CommandMenu),
  `inline` (Dialog, Sheet, Menu), `dragOver` (FileDrop), `state` (MetricCard, charts, AIProposal).
  Anything that renders a heading takes `headingLevel`.
- **Icons** are `<Icon name="..." />`, names from `ICON_NAMES` in `lib/icons.ts`. Never emoji. Do not
  edit `lib/icons.ts`: ask for a missing icon in your report and use the nearest one meanwhile.
- **Numbers** go through `formatNumber` from `@/lib/format`.

## Writing

Sentence case. Australian English. No em dashes anywhere, code strings and definitions included.
Status copy names the state, then the next step; errors name the system that failed. Sample names
go in [brackets]. Buttons are one to three words, verb first.

## The definition

`<name>.def.mjs` exports `{ name, group, job, status, props, tables?, notes, examples, checks,
frame?, state?, logic? }`.

- `status` is `"proven"` for the 74 reference components, `"to build"` for the default set.
- `notes` uses the reference's labels: Behaviour, Layout, States, Copy, Rules, Review, Accepted, Open.
- `examples` are board markup mounting through `NS.<Export>` (the build swaps in the namespace).
  Non-string props go through `{{holes}}` with values in `vals`. Show every variant and every state
  the reference names, including empty, loading and error where the component has them.
- `checks` run in Chrome through Playwright: `run({ page, scope, expect, theme })`, where `scope` is
  the example's section. Options: `themes: ["light", "dark"]`, `touch`, `reducedMotion`,
  `forcedColors`, `viewport`. Every rule marked Review gets a check. Prove keyboard paths, focus
  return, Escape order and focus after an action with real key presses.

## The loop

```bash
node brandi/product/tools/try.mjs --scratch <dir> --modules <node_modules> --tokens <tokens.json> --only Button,Dialog
```

Green means: the typecheck passes, the bundle builds, every named component has a complete
definition, its preview renders in light and dark, the pinned detector finds nothing in either
theme, and every check passes. Look at the preview PNGs it prints, in both themes, before calling a
component done: a passing check is not a good-looking component.
