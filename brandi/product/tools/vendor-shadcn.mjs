#!/usr/bin/env node
/**
 * Vendor shadcn/ui primitives into the product kit, and make the mechanical
 * changes every one of them needs before a person touches it.
 *
 *   node brandi/product/tools/vendor-shadcn.mjs --from <dir of registry JSON> [--out <dir>]
 *   node brandi/product/tools/vendor-shadcn.mjs --fetch <name,name,...> --from <dir>
 *
 * --fetch downloads each registry item from the radix-vega style into --from,
 * so a re-vendor starts from a dated snapshot on disk. Without it the script
 * reads what is already there. Nothing here runs when a product is built: the
 * kit ships the transformed files, and the per-component patches in
 * 07-starter.md are edits made to them afterwards, by hand, as design work.
 *
 * Three transforms, each loud when the source stops matching:
 *
 *   1. Imports. Registry paths become the kit's aliases.
 *   2. React 18. The Design canvas runs React 18.3.1, which drops a ref passed
 *      to a plain function component. shadcn v4 relies on React 19 passing it
 *      as a prop, so a Radix trigger built from a shadcn Button lost its anchor
 *      and its focus return on a board. Every wrapper that spreads props onto
 *      an element that takes a ref is rewritten as React.forwardRef.
 *   3. Focus. The system draws one focus outline from the base styles. Stock
 *      classes that cancel it (outline-none) or draw a second ring
 *      (focus-visible:ring-*) come out.
 *
 * shadcn/ui is MIT licensed; the notice travels with the files (LICENSE-shadcn.md).
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const REGISTRY = 'https://ui.shadcn.com/r/styles/radix-vega';

// Radix parts that render no element of their own, so a ref has nowhere to go, and the kit's own
// wrappers around them.
const NO_REF = /\b(?:Dialog|AlertDialog|Popover|DropdownMenu|Select|Tooltip|HoverCard|ContextMenu|Menubar|Sheet)Primitive\.(?:Root|Portal|Provider|Sub)\b/;
const NO_REF_WRAPPER = /^(?:Dialog|AlertDialog|Sheet|Popover|DropdownMenu|DropdownMenuSub|DropdownMenuPortal|Select|Tooltip|TooltipProvider|HoverCard|DialogPortal|SheetPortal|ContextMenu|DayPicker|Sonner|Drawer\w*)$/;

/** Index of the bracket that closes the one at `open`, skipping strings and template literals. */
export function matching(src, open) {
  const pairs = { '(': ')', '{': '}', '[': ']' };
  const stack = [];
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    if (c === '"' || c === "'") {
      i = skipString(src, i, c);
      continue;
    }
    if (c === '`') {
      i = skipTemplate(src, i);
      continue;
    }
    if (c === '/' && src[i + 1] === '/') {
      i = src.indexOf('\n', i);
      if (i < 0) return -1;
      continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      i = src.indexOf('*/', i + 2) + 1;
      continue;
    }
    if (pairs[c]) stack.push(pairs[c]);
    else if (c === ')' || c === '}' || c === ']') {
      if (stack.pop() !== c) throw new Error(`unbalanced ${c} at ${i}`);
      if (!stack.length) return i;
    }
  }
  return -1;
}

function skipString(src, i, q) {
  for (let j = i + 1; j < src.length; j++) {
    if (src[j] === '\\') { j++; continue; }
    if (src[j] === q) return j;
    if (src[j] === '\n') return j; // JSX text with an apostrophe: not a string
  }
  return src.length;
}

function skipTemplate(src, i) {
  for (let j = i + 1; j < src.length; j++) {
    if (src[j] === '\\') { j++; continue; }
    if (src[j] === '`') return j;
    if (src[j] === '$' && src[j + 1] === '{') j = matching(src, j + 1);
  }
  return src.length;
}

/**
 * Rewrite each top-level `function Name(params) { ... }` component that spreads
 * `{...props}` onto an element taking a ref as `const Name = React.forwardRef(...)`.
 * Returns the new source and what it did, so a re-vendor can be checked.
 */
export function forwardRefs(src) {
  const done = [];
  const skipped = [];
  let out = '';
  let at = 0;
  const re = /^function ([A-Z]\w*)\(/gm;
  let m;
  while ((m = re.exec(src))) {
    const name = m[1];
    const parenOpen = m.index + m[0].length - 1;
    const parenClose = matching(src, parenOpen);
    const braceOpen = src.indexOf('{', parenClose);
    // A return type annotation between ) and { would also hold a brace; shadcn writes none.
    if (src.slice(parenClose + 1, braceOpen).trim()) { skipped.push(`${name}: return type`); continue; }
    const braceClose = matching(src, braceOpen);
    const body = src.slice(braceOpen, braceClose + 1);
    const spread = body.indexOf('{...props}');
    if (spread < 0) { skipped.push(`${name}: no props spread`); continue; }
    // The element receiving the spread: the nearest `<Tag` before it.
    const tagStart = body.lastIndexOf('<', spread);
    const tag = /^<([\w.]+)/.exec(body.slice(tagStart))?.[1] ?? '';
    if (NO_REF.test(tag) || NO_REF_WRAPPER.test(tag)) { skipped.push(`${name}: ${tag} takes no ref`); continue; }
    // A component that already manages a ref of its own keeps it; a second would collide.
    if (/\b(?:const|let) ref\b|\bref=\{/.test(body)) { skipped.push(`${name}: has its own ref`); continue; }
    const params = src.slice(parenOpen + 1, parenClose);
    const newBody = `${body.slice(0, spread)}{...props}\n      ref={ref}${body.slice(spread + '{...props}'.length)}`;
    out += src.slice(at, m.index)
      + `const ${name} = React.forwardRef(function ${name}(${params.trimEnd()}, ref: React.ForwardedRef<any>) ${newBody})`;
    at = braceClose + 1;
    re.lastIndex = at;
    done.push(name);
  }
  out += src.slice(at);
  if (done.length && !/import \* as React from "react"/.test(out)) {
    out = out.replace(/^("use client"\n+)?/, (d) => `${d ?? ''}import * as React from "react"\n`);
  }
  return { src: out, done, skipped };
}

/**
 * The registry writes icons as <IconPlaceholder lucide="XIcon" tabler="..." ...>, which the shadcn
 * command line swaps for the project's icon library. The kit's library is Lucide.
 */
export function resolveIcons(src) {
  const used = new Set();
  let out = src.replace(/<IconPlaceholder\b([\s\S]*?)\/>/g, (whole, attrs) => {
    const lucide = /\blucide="([A-Za-z0-9]+)"/.exec(attrs)?.[1];
    if (!lucide) throw new Error(`an IconPlaceholder with no lucide name: ${whole.slice(0, 80)}`);
    used.add(lucide);
    return `<${lucide}${attrs.replace(/\s*\b(?:lucide|tabler|hugeicons|phosphor|remixicon)="[^"]*"/g, '')}/>`;
  });
  const placeholder = 'import { IconPlaceholder } from "@/app/(create)/components/icon-placeholder"\n';
  if (out.includes('IconPlaceholder')) {
    if (!out.includes(placeholder)) throw new Error('IconPlaceholder is used but imported in a way this script does not know');
    out = out.replace(placeholder, used.size ? `import { ${[...used].sort().join(', ')} } from "lucide-react"\n` : '');
  }
  return out;
}

/** Registry import paths to the kit's aliases. */
export function rewriteImports(src) {
  return src
    .replaceAll('@/registry/radix-vega/ui/', '@/components/ui/')
    .replaceAll('@/registry/radix-vega/lib/utils', '@/lib/utils')
    .replaceAll('@/registry/radix-vega/hooks/', '@/hooks/')
    .replace(/from "cn"/g, 'from "@/lib/utils"');
}

/**
 * Take out the classes that hide the system's focus outline or draw a second
 * ring. The invalid state's border stays; its glow goes with the other rings.
 */
export function stripFocusClasses(src) {
  // Class strings are double-quoted and often hold single quotes ([class*='size-']), so each quote
  // kind is its own pass rather than one pattern that gives up on a string holding the other.
  return [/"([^"\n]*)"/g, /'([^'\n]*)'/g, /`([^`]*)`/g].reduce((text, re) => text.replace(re, (whole, body) => {
    const q = whole[0]
    if (!/\b(outline-none|ring-|focus-visible:|outline-hidden)/.test(body)) return whole;
    const kept = body.split(/\s+/).filter((cls) => cls && !(
      cls === 'outline-none' || cls === 'outline-hidden'
      || /^(?:[\w-]+:)*focus-visible:ring/.test(cls)
      || /^(?:[\w-]+:)*focus-visible:border-ring/.test(cls)
      || /^(?:[\w-]+:)*focus-visible:outline/.test(cls)
      || /^(?:[\w-]+:)*aria-invalid:ring/.test(cls)
      || /^(?:[\w-]+:)*focus:ring/.test(cls)
      || /^ring-ring\//.test(cls)
    ));
    const leading = /^\s/.test(body) ? ' ' : '';
    const trailing = /\s$/.test(body) ? ' ' : '';
    return `${q}${leading}${kept.join(' ')}${trailing}${q}`;
  }), src);
}

async function fetchItems(names, dir) {
  mkdirSync(dir, { recursive: true });
  for (const n of names) {
    const res = await fetch(`${REGISTRY}/${n}.json`);
    if (!res.ok) throw new Error(`${n}: ${res.status} from the registry`);
    writeFileSync(path.join(dir, `${n}.json`), await res.text());
  }
}

function main(argv) {
  const arg = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
  const from = arg('--from');
  const out = arg('--out') ?? path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'kit', 'components', 'ui');
  if (!from) throw new Error('--from <dir of registry JSON> is required');
  return (async () => {
    if (arg('--fetch')) await fetchItems(arg('--fetch').split(','), from);
    mkdirSync(out, { recursive: true });
    const report = [];
    for (const f of readdirSync(from).filter((x) => x.endsWith('.json')).sort()) {
      const item = JSON.parse(readFileSync(path.join(from, f), 'utf8'));
      for (const file of item.files ?? []) {
        if (file.type !== 'registry:ui') continue;
        const base = path.basename(file.path);
        const target = path.join(out, base);
        // A hand-patched file is design work: a re-vendor reports it and leaves it alone.
        if (existsSync(target) && readFileSync(target, 'utf8').includes('// Patched (07-starter.md') && !argv.includes('--force')) {
          report.push(`${base}: kept, hand-patched (pass --force to replace it)`);
          continue;
        }
        let src = resolveIcons(rewriteImports(file.content));
        const fr = forwardRefs(src);
        src = stripFocusClasses(fr.src);
        const header = `// Vendored from the shadcn/ui registry (${REGISTRY}/${item.name}.json), MIT licence:\n// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per\n// 07-starter.md. Edit here, never in a product.\n`;
        const body = src.startsWith('"use client"') ? src.replace('"use client"\n', `"use client"\n\n${header}`) : `${header}\n${src}`;
        writeFileSync(target, body);
        report.push(`${base}: forwardRef ${fr.done.length}${fr.skipped.length ? `, skipped ${fr.skipped.join('; ')}` : ''}`);
      }
    }
    if (!existsSync(path.join(out, 'LICENSE-shadcn.md'))) {
      writeFileSync(path.join(out, 'LICENSE-shadcn.md'), `The files in this folder are adapted from shadcn/ui.\n\nMIT License\n\nCopyright (c) 2023 shadcn\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the "Software"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n`);
    }
    process.stdout.write(`${report.join('\n')}\n`);
  })();
}

const invoked = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (invoked) main(process.argv.slice(2)).catch((e) => { process.stderr.write(`${e.message}\n`); process.exitCode = 1; });
