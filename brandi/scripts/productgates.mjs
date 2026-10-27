/**
 * Brandi product layer: the quality gates, run as a round, and the record a round leaves.
 *
 * `brandi product gates` renders every component preview and canvas board through the runtime shim
 * (and the starter's routes, when a running starter is given), then runs the machine gates:
 *
 *   tokens     every declared contrast pair, both themes          brandi product audit
 *   detector   the pinned Impeccable engine at 1440, 820 and 390, light and dark
 *   axe        axe-core in Chrome, light and dark
 *   checks     every definition's scripted checks, real keyboard
 *
 * The judged gates (the Impeccable craft critique against Nielsen's heuristics, the ui-ux-pro-max
 * rules review) are run by reviewers, not by this file. `brandi product round` folds their results
 * into the round record with the machine gates and says, gate by gate, whether the bar is met.
 */

import { spawn, spawnSync } from 'node:child_process';
import net from 'node:net';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { auditProductTokens, auditSummary } from './producttokens.mjs';
import { previewArtboard, manifestFrames, declaredFrame, findChrome } from './preview.mjs';
import { driftCheck } from './productdrift.mjs';

export const WIDTHS = Object.freeze([1440, 820, 390]);
export const BAR = Object.freeze({
  craftTotal: 34,
  craftMinimum: 3,
  rulesOpen: ['Critical', 'High', 'Medium'],
  critiqueOpen: ['P0', 'P1', 'P2'],
});

/** The newest verified Impeccable engine, unless IMPECCABLE_BIN pins one. */
export function findDetector(env = process.env) {
  if (env.IMPECCABLE_BIN) return existsSync(env.IMPECCABLE_BIN) ? env.IMPECCABLE_BIN : null;
  const root = path.join(os.homedir(), '.impeccable', 'bin');
  if (!existsSync(root)) return null;
  const versions = readdirSync(root)
    .filter((v) => existsSync(path.join(root, v, 'impeccable')) && existsSync(path.join(root, v, 'impeccable.verified')))
    .sort((a, b) => a.split('.').map(Number).reduce((r, n, i) => r || n - Number(b.split('.')[i] ?? 0), 0));
  return versions.length ? path.join(root, versions.at(-1), 'impeccable') : null;
}

const versionOf = (file, args = ['--version']) => {
  try {
    return spawnSync(file, args, { encoding: 'utf8', timeout: 20000 }).stdout.trim().split('\n')[0] || null;
  } catch {
    return null;
  }
};

/** Every tool version a round depends on, so the record says exactly what ran. */
export function toolVersions({ starter, detector }) {
  const pkg = (name) => {
    try {
      return JSON.parse(readFileSync(path.join(starter, 'node_modules', name, 'package.json'), 'utf8')).version;
    } catch {
      return null;
    }
  };
  const brandi = (() => {
    try {
      return JSON.parse(readFileSync(new URL('../.claude-plugin/plugin.json', import.meta.url), 'utf8')).version;
    } catch {
      return null;
    }
  })();
  const chrome = findChrome();
  const plugin = (name) => {
    try {
      const root = path.join(os.homedir(), '.claude', 'plugins', 'cache', name);
      const versions = readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory()).flatMap((d) => readdirSync(path.join(root, d.name)).map((v) => path.join(root, d.name, v)));
      const found = versions.map((dir) => { try { return JSON.parse(readFileSync(path.join(dir, '.claude-plugin', 'plugin.json'), 'utf8')).version; } catch { return null; } }).filter(Boolean);
      return found.sort((a, b) => a.localeCompare(b, 'en', { numeric: true })).at(-1) ?? null;
    } catch {
      return null;
    }
  };
  return {
    'impeccable skill': plugin('impeccable'),
    'ui-ux-pro-max': plugin('ui-ux-pro-max-skill'),
    brandi,
    node: process.version,
    chrome: chrome ? versionOf(chrome) : null,
    detector: detector ? { path: detector, version: versionOf(detector) } : null,
    playwright: pkg('playwright'),
    'axe-core': pkg('axe-core'),
    next: pkg('next'),
    react: pkg('react'),
    'react on the canvas': '18.3.1',
    tailwindcss: pkg('tailwindcss'),
    'radix-ui': pkg('radix-ui'),
    shadcn: pkg('shadcn'),
    esbuild: pkg('esbuild'),
    typescript: pkg('typescript'),
  };
}

/** The pages a round scans: every component preview and canvas board, at the widths that apply. */
export async function collectPages({ productDir, outDir, widths = WIDTHS, only = null }) {
  const pages = [];
  const render = async (dir, file, frame, kind) => {
    const res = await previewArtboard(path.join(dir, file), { outDir, width: frame.w, height: frame.h, png: false });
    return pathToFileURL(res.html).href;
  };
  const previews = path.join(productDir, 'components', 'previews');
  if (existsSync(previews)) {
    for (const f of readdirSync(previews).filter((x) => x.endsWith('.dc.html')).sort()) {
      const name = f.replace(/Preview\.dc\.html$/, '');
      if (only && !only.includes(name)) continue;
      const src = readFileSync(path.join(previews, f), 'utf8');
      const frame = declaredFrame(src) ?? { w: 960, h: 600 };
      const url = await render(previews, f, frame, 'component');
      for (const theme of ['light', 'dark']) pages.push({ kind: 'component', label: name, url, width: frame.w, height: frame.h, theme });
    }
  }
  const canvas = path.join(productDir, 'canvas');
  if (existsSync(canvas)) {
    const frames = await manifestFrames(canvas);
    let manifest = null;
    try { manifest = JSON.parse(readFileSync(path.join(canvas, 'canvas.json'), 'utf8')); } catch { /* no manifest */ }
    for (const f of readdirSync(canvas).filter((x) => x.endsWith('.dc.html') && !x.startsWith('_')).sort()) {
      if (only && !only.some((o) => f.startsWith(o))) continue;
      const src = readFileSync(path.join(canvas, f), 'utf8');
      const frame = frames.get(f) ?? declaredFrame(src) ?? { w: 1440, h: 900 };
      const entry = manifest?.artboards?.find((a) => a.file === f);
      const fluid = entry?.expand === 'fill';
      const url = await render(canvas, f, frame, 'board');
      // A twin that is already dark is scanned as it is; a board with a dark tweak, both ways.
      const themes = /Dark\.dc\.html$/.test(f) ? ['dark'] : /"dark":\{"editor":"boolean"/.test(src) ? ['light', 'dark'] : ['light'];
      for (const width of fluid ? widths : [frame.w]) {
        for (const theme of themes) pages.push({ kind: 'board', label: f.replace(/\.dc\.html$/, ''), url, width, height: frame.h, theme });
      }
    }
  }
  return pages;
}

const withTheme = (page) => (page.theme === 'dark' && page.kind !== 'route' ? `${page.url}${page.url.includes('?') ? '&' : '?'}props=${encodeURIComponent('{"dark":true}')}` : page.kind === 'route' && page.theme === 'dark' ? `${page.url}${page.url.includes('?') ? '&' : '?'}theme=dark` : page.url);

/** Run the detector on every page, a few at a time. Returns every finding with where it was. */
export async function runDetector(pages, detector, { concurrency = 4 } = {}) {
  const findings = [];
  const errors = [];
  let next = 0;
  const one = (page) => new Promise((resolve) => {
    const url = withTheme(page);
    const child = spawn(detector, ['detect', '--json', '--no-config', '--viewport', `${page.width}x${page.height ?? 900}`, url]);
    let out = '';
    child.stdout.on('data', (d) => { out += d; });
    child.on('close', () => {
      try {
        for (const f of JSON.parse(out || '[]')) findings.push({ page: page.label, kind: page.kind, width: page.width, theme: page.theme, rule: f.antipattern, severity: f.severity, selector: f.selector, snippet: f.snippet });
      } catch {
        errors.push({ page: page.label, width: page.width, theme: page.theme, output: out.slice(0, 200) });
      }
      resolve();
    });
  });
  await Promise.all(Array.from({ length: Math.min(concurrency, pages.length) }, async () => {
    while (next < pages.length) await one(pages[next++]);
  }));
  return { findings, errors };
}

const nodeScript = (starter, script, args, timeout = 1800000) => {
  const r = spawnSync(process.execPath, [path.join('tools', script), ...args], { cwd: starter, encoding: 'utf8', timeout });
  return { status: r.status, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
};

const freePort = () => new Promise((resolve, reject) => {
  const srv = net.createServer();
  srv.unref();
  srv.on('error', reject);
  srv.listen(0, () => { const { port } = srv.address(); srv.close(() => resolve(port)); });
});

/**
 * Build the starter and start it on a free port, for the gates to scan its routes. Returns the base
 * URL and a stop function. Throws with the build's own words when it does not build.
 */
export async function serveStarter(starter, { log = () => {} } = {}) {
  const next = path.join(starter, 'node_modules', 'next', 'dist', 'bin', 'next');
  if (!existsSync(next)) throw new Error(`${starter} has no Next.js installed. Run npm install there first.`);
  const env = { ...process.env, NEXT_TELEMETRY_DISABLED: '1' };
  log('starter: building');
  const built = spawnSync(process.execPath, [next, 'build'], { cwd: starter, env, encoding: 'utf8', timeout: 900000 });
  if (built.status !== 0) throw new Error(`The starter did not build:\n${`${built.stdout}${built.stderr}`.trim().split('\n').slice(-15).join('\n')}`);
  const port = await freePort();
  const child = spawn(process.execPath, [next, 'start', '-p', String(port)], { cwd: starter, env, stdio: 'ignore' });
  const base = `http://localhost:${port}`;
  for (let i = 0; i < 120; i++) {
    try {
      const res = await fetch(base, { redirect: 'manual' });
      if (res.status < 500) break;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  log(`starter: serving on ${base}`);
  return { base, stop: () => child.kill() };
}

/** The routes a starter declares for the gates, in tools/routes.json. */
export function starterRoutes(starter, base) {
  const file = path.join(starter, 'tools', 'routes.json');
  const list = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : [{ path: '/', label: 'Home' }];
  return list.map((r) => ({ url: `${base}${r.path}`, label: r.label ?? r.path }));
}

/**
 * Run the machine gates for one round. Writes rounds/round-<n>/gates.json and returns it.
 * `routes` are a running starter's pages ({ url, label }), scanned at every width, light and dark.
 */
export async function runGates({ productDir, starter, round, widths = WIDTHS, only = null, routes = [], detector = findDetector(), log = () => {} }) {
  const outDir = path.join(productDir, 'rounds', `round-${round}`);
  const pagesDir = path.join(outDir, 'pages');
  mkdirSync(pagesDir, { recursive: true });

  const tokens = JSON.parse(readFileSync(path.join(productDir, 'tokens.json'), 'utf8'));
  const audit = auditProductTokens(tokens);
  log(`tokens: ${auditSummary(audit)}`);
  const drift = await driftCheck({ productDir, starter });
  log(`drift: ${drift.differences.length} differences`);

  const pages = await collectPages({ productDir, outDir: pagesDir, widths, only });
  for (const r of routes) for (const width of widths) for (const theme of ['light', 'dark']) pages.push({ kind: 'route', label: r.label ?? r.url, url: r.url, width, height: 900, theme });
  log(`pages: ${pages.length} renders (${pages.filter((p) => p.kind === 'component').length} component, ${pages.filter((p) => p.kind === 'board').length} board, ${pages.filter((p) => p.kind === 'route').length} route)`);

  let detection = { findings: [], errors: [], skipped: 'no detector found: set IMPECCABLE_BIN' };
  if (detector) {
    detection = await runDetector(pages, detector);
    log(`detector: ${detection.findings.length} findings, ${detection.errors.length} pages it could not read`);
  }

  // axe on every render the detector saw: a phone layout is a different document, not a narrower one.
  const unique = [...new Map(pages.map((p) => [`${p.url}|${p.width}|${p.theme}`, { ...p, url: withTheme(p) }])).values()];
  writeFileSync(path.join(outDir, 'axe-pages.json'), JSON.stringify(unique, null, 2));
  const axeRun = nodeScript(starter, 'axe-pages.mjs', ['--pages', path.join(outDir, 'axe-pages.json'), '--json', path.join(outDir, 'axe.json')]);
  const axe = existsSync(path.join(outDir, 'axe.json')) ? JSON.parse(readFileSync(path.join(outDir, 'axe.json'), 'utf8')) : { violations: null, errors: 1, results: [], failure: axeRun.out.slice(-400) };
  log(`axe: ${axe.violations} violations on ${axe.pages ?? 0} pages${axe.errors ? `, ${axe.errors} not scanned` : ''}`);

  const previews = path.join(productDir, 'components', 'previews');
  const checkRun = existsSync(previews)
    ? nodeScript(starter, 'check-components.mjs', ['--previews', pagesDir, ...(only ? ['--only', only.join(',')] : []), '--json', path.join(outDir, 'checks.json')])
    : { status: 0, out: '' };
  const checks = existsSync(path.join(outDir, 'checks.json')) ? JSON.parse(readFileSync(path.join(outDir, 'checks.json'), 'utf8')) : { passed: 0, failed: [{ check: 'runner', reason: checkRun.out.slice(-400) }] };
  log(`checks: ${checks.passed} passed, ${checks.failed.length} failed`);

  const gates = {
    round,
    at: new Date().toISOString(),
    versions: toolVersions({ starter, detector }),
    widths,
    tokens: { summary: auditSummary(audit), fails: audit.fails.length, pairs: audit.pairs },
    drift: { differences: drift.differences, unchecked: drift.unchecked },
    detector: { pages: pages.length, findings: detection.findings, errors: detection.errors, skipped: detection.skipped ?? null },
    axe: { pages: axe.pages ?? 0, violations: axe.violations, errors: axe.errors, skipped: axe.skipped ?? null, results: (axe.results ?? []).filter((r) => r.violations.length || r.error) },
    checks: { passed: checks.passed, failed: checks.failed },
  };
  writeFileSync(path.join(outDir, 'gates.json'), `${JSON.stringify(gates, null, 2)}\n`);
  return gates;
}

/**
 * Hold a round's results against the bar. `critique` is the Impeccable craft critique
 * ({ heuristics: [{ name, score }], findings: [{ severity: 'P0'..'P3', title }] }); `rules` is the
 * ui-ux-pro-max review ({ findings: [{ severity: 'Critical'|'High'|'Medium'|'Low', title }] }).
 * Returns each gate with pass or fail and why, and whether the bar is met.
 */
export function judgeRound(gates, { critique = null, rules = null } = {}) {
  const verdicts = [];
  const add = (gate, pass, detail) => verdicts.push({ gate, pass, detail });
  add('Tokens', gates.tokens.fails === 0, gates.tokens.summary);
  const differences = gates.drift?.differences;
  add('Drift', Array.isArray(differences) && differences.length === 0,
    !Array.isArray(differences) ? 'no drift check recorded for this round' : differences.length ? `${differences.length} differences between the canvas, the system and the code` : 'canvas, system and code agree; screens checked by eye are noted in the record');
  add('Detector', !gates.detector.skipped && gates.detector.findings.length === 0 && gates.detector.errors.length === 0,
    gates.detector.skipped ?? `${gates.detector.findings.length} findings across ${gates.detector.pages} renders at ${gates.widths.join(', ')}, light and dark`);
  add('Accessibility', gates.axe.violations === 0 && !gates.axe.errors && gates.checks.failed.length === 0,
    `axe ${gates.axe.violations} violations on ${gates.axe.pages} pages; ${gates.checks.passed} scripted checks passed, ${gates.checks.failed.length} failed`);
  if (critique) {
    const scores = critique.heuristics ?? [];
    const total = scores.reduce((n, h) => n + h.score, 0);
    const low = scores.filter((h) => h.score < BAR.craftMinimum);
    const open = (critique.findings ?? []).filter((f) => BAR.critiqueOpen.includes(f.severity) && !['fixed', 'accepted'].includes(f.status));
    add('Craft', scores.length === 10 && total >= BAR.craftTotal && !low.length && !open.length,
      `${total}/40 on ${scores.length} heuristics${low.length ? `; under ${BAR.craftMinimum}: ${low.map((h) => h.name).join(', ')}` : ''}${open.length ? `; open: ${open.map((f) => `${f.severity} ${f.title}`).join('; ')}` : ''}`);
  } else {
    add('Craft', false, 'no critique recorded for this round');
  }
  if (rules) {
    const open = (rules.findings ?? []).filter((f) => BAR.rulesOpen.includes(f.severity) && !['fixed', 'accepted'].includes(f.status));
    add('Rules', open.length === 0, open.length ? `open: ${open.map((f) => `${f.severity} ${f.title}`).join('; ')}` : `no Critical, High or Medium open (${(rules.findings ?? []).length} findings in all)`);
  } else {
    add('Rules', false, 'no rules review recorded for this round');
  }
  add('Record', Boolean(gates.versions?.detector?.version && gates.versions?.['axe-core'] && gates.versions?.playwright), 'every tool version pinned and written down');
  return { met: verdicts.every((v) => v.pass), verdicts };
}

/** The round record as a person reads it. */
export function roundMarkdown(gates, judged, { system = {}, critique = null, rules = null, signOff = null } = {}) {
  const lines = [`# Round ${gates.round}: ${system.name ?? 'product system'} ${system.version ?? ''}`.trimEnd(), '', `Run ${gates.at}. ${judged.met ? 'The bar is met.' : 'The bar is not met yet.'}`, '', '| Gate | Result | Detail |', '| --- | --- | --- |'];
  for (const v of judged.verdicts) lines.push(`| ${v.gate} | ${v.pass ? 'pass' : 'fail'} | ${String(v.detail).replace(/\|/g, '\\|')} |`);
  if (gates.axe.skipped?.rules?.length) lines.push('', `axe ran every rule on the routes. On ${gates.axe.skipped.kinds.map((k) => `${k} pages`).join(' and ')}, which show a page frame more than once, it skipped ${gates.axe.skipped.rules.join(', ')}.`);
  lines.push('', '## Tool versions', '');
  for (const [k, v] of Object.entries(gates.versions)) lines.push(`- ${k}: ${typeof v === 'object' && v ? `${v.version ?? ''} (${v.path ?? ''})` : v ?? 'not found'}`);
  if (gates.detector.findings.length) {
    lines.push('', '## Detector findings', '');
    for (const f of gates.detector.findings) lines.push(`- ${f.page} at ${f.width}, ${f.theme}: ${f.rule} on ${f.selector ?? '?'} (${f.snippet ?? ''})`);
  }
  if (gates.axe.results.length) {
    lines.push('', '## axe', '');
    for (const r of gates.axe.results) lines.push(`- ${r.label} at ${r.width}, ${r.theme}: ${r.error ?? r.violations.map((v) => `${v.id} (${v.impact})`).join(', ')}`);
  }
  if (gates.drift?.differences?.length) {
    lines.push('', '## Drift', '');
    for (const d of gates.drift.differences) lines.push(`- ${d.area}: ${d.where}${d.found ? ` ${d.found}` : ''}, ${d.expected}`);
  }
  for (const u of gates.drift?.unchecked ?? []) lines.push('', `Not checked automatically: ${u}`);
  if (gates.checks.failed.length) {
    lines.push('', '## Failed checks', '');
    for (const f of gates.checks.failed) lines.push(`- ${f.check}: ${f.reason}`);
  }
  if (critique) {
    lines.push('', '## Craft critique', '', '| Heuristic | Score |', '| --- | --- |');
    for (const h of critique.heuristics ?? []) lines.push(`| ${h.name} | ${h.score} |`);
    for (const f of critique.findings ?? []) lines.push(`- ${f.severity}: ${f.title}${f.status ? ` (${f.status})` : ''}`);
  }
  if (rules) {
    lines.push('', '## Rules review', '');
    for (const f of rules.findings ?? []) lines.push(`- ${f.severity}: ${f.title}${f.status ? ` (${f.status})` : ''}`);
  }
  lines.push('', '## Sign-off', '', signOff ? `Signed off by ${signOff}.` : 'Not signed off.', '');
  return lines.join('\n');
}

export default { runGates, judgeRound, roundMarkdown, findDetector, toolVersions, collectPages, runDetector, WIDTHS, BAR };
