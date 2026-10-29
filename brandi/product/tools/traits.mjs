#!/usr/bin/env node
/**
 * The kit loop over every brand trait that has broken the kit before. Each trait in brandi/product/traits
 * is the kit's fixture brand with one thing changed, or a deliberate pair: a black rail, times written
 * "9.30am", a condensed display face set in capitals. For each, this writes its product tokens, runs
 * try.mjs on them in batches of components, and prints a table: one row a trait.
 *
 *   node brandi/product/tools/traits.mjs --scratch <dir> --modules <node_modules> \
 *     [--only black-rail,time-dot] [--components Avatar,NavItem] [--batch 8] [--no-detect]
 *
 * --modules is an installed node_modules for the kit, as try.mjs takes. --components defaults to every
 * component a lesson in brandi/product/lessons.json guards, with a check or the detector. A full-kit run outlasts try.mjs's
 * ten minutes, so the components go through in batches (--batch, 8 by default). Each batch's whole output
 * is kept as <scratch>/<trait>/batch-N.log, and the table as <scratch>/results.json. Exits 1 when any
 * trait failed, 2 when a tool it needs is missing (the detector included, unless --no-detect).
 */

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { migrateBrand, systemInputFromBrand } from '../../scripts/brandfile.mjs';
import { findChrome } from '../../scripts/preview.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const brandi = path.resolve(here, '..', '..');
const TRAITS = path.resolve(here, '..', 'traits');
const LESSONS = path.resolve(here, '..', 'lessons.json');
// Every trait is this brand with its own change laid over it, so a trait that fails differs from the
// baseline by that change alone.
const FIXTURE = path.join(brandi, 'tests', 'fixtures', 'muddy-paws.json');

const arg = (k) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : undefined; };
const list = (k) => arg(k)?.split(',').map((s) => s.trim()).filter(Boolean);
if (!arg('--scratch') || !arg('--modules')) {
  process.stderr.write('usage: traits.mjs --scratch <dir> --modules <node_modules> [--only a,b] [--components A,B] [--batch 8] [--no-detect]\n');
  process.exit(2);
}
const scratch = path.resolve(arg('--scratch'));
const modules = path.resolve(arg('--modules'));
const size = Number(arg('--batch') ?? 8);
const noDetect = process.argv.includes('--no-detect');
if (!Number.isInteger(size) || size < 1) {
  process.stderr.write('--batch is how many components go through try.mjs at once: a whole number, 1 or more\n');
  process.exit(2);
}

// Said before anything runs, rather than as a failure halfway through the first trait.
const missing = [];
if (!existsSync(modules)) missing.push(`no node_modules at ${modules}: run npm install in a starter and pass its node_modules`);
else {
  for (const [dep, why] of [['typescript', 'the typecheck runs on it'], ['esbuild', 'the canvas bundle is built with it'], ['playwright', 'the checks drive Chrome through it']]) {
    if (!existsSync(path.join(modules, dep))) missing.push(`${dep} is not in ${modules}: ${why}`);
  }
}
if (!findChrome()) missing.push('no Chrome: the previews and the checks draw in one. Install Google Chrome, or set CHROME_PATH');
if (missing.length) {
  process.stderr.write(`Cannot run the traits:\n  ${missing.join('\n  ')}\n`);
  process.exit(2);
}

const all = readdirSync(TRAITS).filter((f) => f.endsWith('.json')).sort()
  .map((f) => ({ id: f.slice(0, -5), ...JSON.parse(readFileSync(path.join(TRAITS, f), 'utf8')) }));
const only = list('--only');
const unknown = (only ?? []).filter((id) => !all.some((t) => t.id === id));
if (unknown.length) {
  process.stderr.write(`No trait named ${unknown.join(', ')}. The traits: ${all.map((t) => t.id).join(', ')}\n`);
  process.exit(2);
}
const traits = all.filter((t) => !only || only.includes(t.id));
const { lessons } = JSON.parse(readFileSync(LESSONS, 'utf8'));
const components = list('--components')
  ?? [...new Set(lessons.flatMap((l) => l.guards).filter((g) => g.component).map((g) => g.component))].sort();

const brand = migrateBrand(JSON.parse(readFileSync(FIXTURE, 'utf8')));
const base = { name: brand.meta?.name, ...systemInputFromBrand(brand) };

/** One try.mjs run's result, read from what it prints. */
function readTry(out, status) {
  const r = { passed: 0, failed: [], detector: null, problems: [] };
  for (const step of ['index', 'typecheck', 'canvas bundle', 'definitions']) {
    if (new RegExp(`^${step}: FAILED`, 'm').test(out)) r.problems.push(`${step} failed`);
  }
  for (const m of out.matchAll(/^no definition for (\S+)/gm)) r.problems.push(`no definition for ${m[1]}`);
  const checks = /^\{"passed":.*\}$/m.exec(out);
  if (checks) {
    const res = JSON.parse(checks[0]);
    r.passed = res.passed;
    r.failed = res.failed.map((f) => `${f.check}: ${f.reason}`);
  } else if (/^checks: (ok|FAILED)/m.test(out)) {
    // Never a silent pass: checks that ran and printed no count (stopped, or crashed) are a run nobody can read.
    r.problems.push('the checks printed no result');
  }
  r.noDetector = /^detector: not found.*$/m.exec(out)?.[0];
  if (/^detector: clean/m.test(out)) r.detector = 0;
  else {
    const m = /^detector: (\d+) finding\(s\)\n((?: {2}.*\n?)*)/m.exec(out);
    if (m) { r.detector = Number(m[1]); r.findings = m[2].split('\n').map((s) => s.trim()).filter(Boolean); }
  }
  if (status !== 0 && !r.problems.length && !r.failed.length && !r.findings?.length) {
    r.problems.push(status === null ? 'try.mjs was stopped before it finished' : `try.mjs exited ${status}`);
  }
  return r;
}

const rows = [];
for (const t of traits) {
  const dir = path.join(scratch, t.id);
  mkdirSync(path.join(dir, 'product'), { recursive: true });
  // A last run's tokens would be tested in place of this run's if this run's cannot be written.
  rmSync(path.join(dir, 'product', 'tokens.json'), { force: true });
  const input = { ...base, ...t.input, type: { ...base.type, ...t.input?.type } };
  writeFileSync(path.join(dir, 'input.json'), `${JSON.stringify(input, null, 2)}\n`);
  writeFileSync(path.join(dir, 'product', 'product.json'), `${JSON.stringify(t.product ?? {}, null, 2)}\n`);
  const row = { trait: t.id, tokens: null, passed: 0, failed: [], findings: [], detector: 0, problems: [], logs: [] };
  rows.push(row);
  process.stdout.write(`\n${t.id}: ${t.trait}\n`);

  const tok = spawnSync(process.execPath, [path.join(brandi, 'scripts', 'brandi.mjs'), 'product', 'tokens', '--input', 'input.json', '--out', 'product'], { cwd: dir, encoding: 'utf8' });
  const summary = /colour tokens \d+ \| pairs checked \d+ \| fails \d+/.exec(tok.stdout ?? '')?.[0];
  row.tokens = summary ?? `failed: ${(tok.stderr || tok.stdout).trim().split('\n')[0]}`;
  process.stdout.write(`  tokens: ${row.tokens}\n`);
  if (tok.status !== 0) row.problems.push('the tokens fail their audit');
  if (!existsSync(path.join(dir, 'product', 'tokens.json'))) continue;

  for (let i = 0; i < components.length; i += size) {
    const batch = components.slice(i, i + size);
    const log = path.join(dir, `batch-${i / size + 1}.log`);
    const r = spawnSync(process.execPath, [
      path.join(here, 'try.mjs'), '--scratch', path.join(dir, 'try'), '--modules', modules,
      '--tokens', path.join(dir, 'product', 'tokens.json'), '--product', path.join(dir, 'product', 'product.json'),
      '--only', batch.join(','), '--no-png', ...(noDetect ? ['--no-detect'] : []),
    ], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
    const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
    writeFileSync(log, out);
    row.logs.push(path.relative(scratch, log));
    const got = readTry(out, r.status);
    if (got.noDetector) {
      process.stderr.write(`${got.noDetector}. Pass --no-detect to run the traits without it.\n`);
      process.exit(2);
    }
    row.passed += got.passed;
    row.failed.push(...got.failed);
    row.problems.push(...got.problems.map((p) => `${batch[0]} to ${batch.at(-1)}: ${p}`));
    row.detector += got.detector ?? 0;
    row.findings.push(...(got.findings ?? []));
    process.stdout.write(`  ${batch.join(', ')}: ${got.passed} passed, ${got.failed.length} failed${got.detector ? `, ${got.detector} detector finding(s)` : ''}${got.problems.length ? `, ${got.problems.join('; ')}` : ''}\n`);
  }
}

for (const row of rows) row.ok = !row.problems.length && !row.failed.length && !row.findings.length;
const width = Math.max(5, ...rows.map((r) => r.trait.length));
const tokensCell = (r) => { const f = /fails (\d+)/.exec(r.tokens)?.[1]; return f === undefined ? 'failed' : f === '0' ? 'ok' : `${f} fails`; };
const detectorCell = (r) => (noDetect ? 'not run' : r.detector ? `${r.detector} found` : 'clean');
const lines = [
  '',
  `${'trait'.padEnd(width)}  ${'tokens'.padEnd(8)}  ${'checks'.padEnd(22)}  ${'detector'.padEnd(9)}  result`,
  ...rows.map((r) => `${r.trait.padEnd(width)}  ${tokensCell(r).padEnd(8)}  ${`${r.passed} passed, ${r.failed.length} failed`.padEnd(22)}  ${detectorCell(r).padEnd(9)}  ${r.ok ? 'pass' : 'FAIL'}`),
];
for (const r of rows.filter((x) => !x.ok)) {
  lines.push('', `${r.trait}:`, ...r.problems.map((p) => `  ${p}`), ...r.failed.map((f) => `  ${f}`), ...r.findings.map((f) => `  detector: ${f}`));
}
if (noDetect) lines.push('', 'Run with --no-detect: no trait was scanned by the detector, so no detector guard was tested.');
lines.push('', `Components: ${components.join(', ')}`, `Logs and results.json: ${scratch}`);
process.stdout.write(`${lines.join('\n')}\n`);
writeFileSync(path.join(scratch, 'results.json'), `${JSON.stringify({ components, traits: rows }, null, 2)}\n`);
if (rows.some((r) => !r.ok)) process.exitCode = 1;
