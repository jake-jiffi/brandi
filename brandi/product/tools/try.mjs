#!/usr/bin/env node
/**
 * The inner loop for building components in the kit: one command that copies the kit into a scratch
 * product, builds it, renders each named component's preview in light and dark, and runs its
 * scripted checks in a real browser.
 *
 *   node brandi/product/tools/try.mjs --scratch <dir> --modules <node_modules> --tokens <tokens.json> \
 *     [--only Button,Dialog] [--no-checks] [--no-png]
 *
 * --modules is an installed node_modules for the kit (it is linked, never copied). --tokens is a
 * product tokens file (`brandi product tokens` writes one). Prints where the previews landed, the
 * typecheck result, the bundle's size and the checks' result. Exits 1 when anything failed.
 */

import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync, symlinkSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { loadDefinitions, checkDefinition, componentReadme, previewBoard, hostedFontsUrl } from '../../scripts/productdocs.mjs';
import { previewArtboard } from '../../scripts/preview.mjs';
import { toStarterGlobals } from '../../scripts/productglobals.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const kit = path.resolve(here, '..', 'kit');
const arg = (k) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : undefined; };
const scratch = path.resolve(arg('--scratch') ?? '');
const modules = path.resolve(arg('--modules') ?? '');
const tokensFile = path.resolve(arg('--tokens') ?? '');
const only = arg('--only')?.split(',').map((s) => s.trim()).filter(Boolean);
if (!arg('--scratch') || !existsSync(modules) || !existsSync(tokensFile)) {
  process.stderr.write('usage: try.mjs --scratch <dir> --modules <node_modules> --tokens <tokens.json> [--only A,B] [--no-checks] [--no-png]\n');
  process.exit(2);
}

const starter = path.join(scratch, 'starter');
mkdirSync(starter, { recursive: true });
// The kit as it stands, minus anything a product generates for itself.
for (const entry of readdirSync(kit)) {
  if (['node_modules', '.next', 'system'].includes(entry)) continue;
  cpSync(path.join(kit, entry), path.join(starter, entry), { recursive: true, force: true });
}
const linked = path.join(starter, 'node_modules');
if (!existsSync(linked)) symlinkSync(modules, linked, 'dir');
mkdirSync(path.join(starter, 'system'), { recursive: true });
const tokens = JSON.parse(readFileSync(tokensFile, 'utf8'));
writeFileSync(path.join(starter, 'system', 'tokens.json'), JSON.stringify(tokens, null, 2));
const system = { name: tokens.name ?? 'Product', namespace: 'kit', global: 'Kit', version: '0.0.0-try', lang: 'en-AU', fontsUrl: hostedFontsUrl(tokens) };
writeFileSync(path.join(starter, 'system', 'system.json'), JSON.stringify(system, null, 2));
writeFileSync(path.join(starter, 'app', 'globals.css'), toStarterGlobals(tokens));

let failed = false;
const step = (label, file, args, opts = {}) => {
  const r = spawnSync(file, args, { cwd: starter, encoding: 'utf8', ...opts });
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`.trim();
  if (r.status !== 0) { failed = true; process.stdout.write(`\n${label}: FAILED\n${out}\n`); return null; }
  process.stdout.write(`${label}: ok${out ? `\n${out.split('\n').slice(-3).join('\n')}` : ''}\n`);
  return out;
};

step('index', process.execPath, ['tools/build-index.mjs']);
step('typecheck', path.join(starter, 'node_modules', '.bin', 'tsc'), ['--noEmit', '-p', 'tsconfig.json']);
const built = step('canvas bundle', process.execPath, ['tools/build-canvas.mjs']);
if (!built) process.exit(1);

// The system installed beside the boards, as on a canvas.
const canvas = path.join(scratch, 'canvas');
rmSync(canvas, { recursive: true, force: true });
mkdirSync(path.join(canvas, 'ds', system.namespace, 'components'), { recursive: true });
for (const f of ['bundle.js', 'bundle.css']) cpSync(path.join(starter, 'canvas', 'dist', f), path.join(canvas, 'ds', system.namespace, 'components', f));
writeFileSync(path.join(canvas, 'ds', system.namespace, 'tokens.css'), '');

const defs = (await loadDefinitions(path.join(starter, 'components', 'system'))).filter((d) => !only || only.includes(d.name));
const problems = defs.flatMap(checkDefinition);
if (problems.length) { failed = true; process.stdout.write(`\ndefinitions: FAILED\n  ${problems.join('\n  ')}\n`); }
if (only) for (const name of only) if (!defs.some((d) => d.name === name)) { failed = true; process.stdout.write(`\nno definition for ${name}\n`); }

const previews = path.join(scratch, 'previews');
mkdirSync(previews, { recursive: true });
for (const def of defs) {
  writeFileSync(path.join(scratch, `${def.name}.README.md`), componentReadme(def, system));
  const board = path.join(canvas, `${def.name}Preview.dc.html`);
  writeFileSync(board, previewBoard(def, system));
  const size = { width: def.frame?.width ?? 960, height: def.frame?.height ?? 600 };
  const png = !process.argv.includes('--no-png');
  const light = await previewArtboard(board, { outDir: previews, ...size, png });
  const dark = await previewArtboard(board, { outDir: previews, ...size, png, props: { dark: true }, suffix: '.dark' });
  process.stdout.write(`${def.name}: ${light.png ?? light.html}${dark.png ? `  ${dark.png}` : ''}\n`);
}

// The pinned detector on every preview, light and dark, unless told not to.
const detector = process.env.IMPECCABLE_BIN ?? path.join(process.env.HOME ?? '', '.impeccable', 'bin', '0.1.18', 'impeccable');
if (!process.argv.includes('--no-detect')) {
  if (!existsSync(detector)) {
    process.stdout.write(`detector: not found at ${detector} (set IMPECCABLE_BIN)\n`);
  } else {
    const findings = [];
    for (const def of defs) {
      for (const dark of [false, true]) {
        const url = `${pathToFileURL(path.join(previews, `${def.name}Preview.preview.html`)).href}${dark ? `?props=${encodeURIComponent('{"dark":true}')}` : ''}`;
        const r = spawnSync(detector, ['detect', '--json', '--no-config', '--viewport', `${def.frame?.width ?? 960}x${def.frame?.height ?? 600}`, url], { encoding: 'utf8', timeout: 180000 });
        let list = [];
        try { list = JSON.parse(r.stdout || '[]'); } catch { list = [{ antipattern: 'detector-output', description: (r.stdout || r.stderr || '').slice(0, 200) }]; }
        for (const f of list) findings.push(`${def.name}${dark ? ' (dark)' : ''}: ${f.antipattern} at ${f.selector ?? '?'}: ${f.snippet ?? f.description ?? ''}`);
      }
    }
    if (findings.length) { failed = true; process.stdout.write(`\ndetector: ${findings.length} finding(s)\n  ${findings.join('\n  ')}\n`); } else process.stdout.write('detector: clean, light and dark\n');
  }
}

if (!process.argv.includes('--no-checks') && defs.some((d) => d.checks?.length)) {
  step('checks', process.execPath, ['tools/check-components.mjs', '--previews', previews, ...(only ? ['--only', only.join(',')] : [])], { timeout: 600000 });
}
process.stdout.write(failed ? '\nSomething failed: see above.\n' : '\nAll green.\n');
if (failed) process.exitCode = 1;
