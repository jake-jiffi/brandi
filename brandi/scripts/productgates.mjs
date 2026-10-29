/**
 * Brandi product layer: the quality gates, run as a round, and the record a round leaves.
 *
 * `brandi product gates` renders every component preview and canvas board through the runtime shim
 * (and the starter's routes, when a running starter is given), then runs the machine gates:
 *
 *   tokens     every declared contrast pair, both themes          brandi product audit
 *   detector   the pinned Impeccable engine at 1440, 820 and 390, light and dark
 *   axe        axe-core in Chrome, light and dark
 *   reflow     every fluid board and route at 320px wide: nothing scrolls sideways (WCAG 1.4.10)
 *   checks     every definition's scripted checks, real keyboard
 *   sizes      every board's frame against its content, and no box on a board hiding its own content
 *   coverage   every surface product.json lists: a board at each of its widths, a states board per module, and
 *              each core page on a board or skipped with a reason
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

import { auditProductTokens, auditSummary, shapeKitDefaults } from './producttokens.mjs';
import { previewArtboard, manifestFrames, declaredFrame, findChrome } from './preview.mjs';
import { driftCheck } from './productdrift.mjs';
import { canvasCoverage, canvasBoards } from './productcoverage.mjs';
import { deviceHeight, wantedHeight, frameFit } from './productboards.mjs';

export const WIDTHS = Object.freeze([1440, 820, 390]);
/** WCAG 1.4.10's width: 1280 at 400% zoom, and a small phone. Only reflow is measured here. */
export const REFLOW_WIDTH = 320;
/** The gates a round runs by machine, in the order `brandi product gates` prints them; the judged ones are Craft and Rules. */
export const MACHINE_GATES = Object.freeze(['Tokens', 'Drift', 'Detector', 'Accessibility', 'Canvas runtime', 'Board sizes', 'Coverage', 'Record']);
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
      // A fluid board fills whatever window it is in, so it is drawn without its frame's width: drawn at
      // 1440 and scanned at 390, it scrolled sideways on every page.
      const url = await render(canvas, f, fluid ? { w: undefined, h: frame.h } : frame, 'board');
      // A twin that is already dark is scanned as it is; a board with a dark tweak, both ways.
      const themes = /Dark\.dc\.html$/.test(f) ? ['dark'] : /"dark":\{"editor":"boolean"/.test(src) ? ['light', 'dark'] : ['light'];
      for (const width of fluid ? widths : [frame.w]) {
        for (const theme of themes) pages.push({ kind: 'board', label: f.replace(/\.dc\.html$/, ''), url, width, height: frame.h, theme, fluid, frame: { w: frame.w, h: frame.h } });
      }
    }
  }
  return pages;
}

/**
 * The pages reflow is measured on: each fluid board and each route once, at 320px, in light. A board drawn at a
 * fixed frame is a picture of one width, so it is left out; overflow does not change with the theme.
 */
export function reflowPages(pages) {
  const picked = pages.filter((p) => (p.kind === 'board' && p.fluid) || p.kind === 'route');
  return [...new Map(picked.map((p) => [p.url, { kind: p.kind, label: p.label, url: p.url, width: REFLOW_WIDTH, height: 800 }])).values()];
}

const withTheme = (page) => (page.theme === 'dark' && page.kind !== 'route' ? `${page.url}${page.url.includes('?') ? '&' : '?'}props=${encodeURIComponent('{"dark":true}')}` : page.kind === 'route' && page.theme === 'dark' ? `${page.url}${page.url.includes('?') ? '&' : '?'}theme=dark` : page.url);

/** Run the detector on every page, a few at a time. Returns every finding with where it was. */
export async function runDetector(pages, detector, { concurrency = 4, status = httpStatus } = {}) {
  const findings = [];
  const errors = [];
  // A route that answers 404 is not scanned by the detector, which then reports nothing: that read as
  // clean. It is listed instead, and axe still covers it.
  const unscanned = [];
  let next = 0;
  const one = async (page) => {
    if (page.kind === 'route') {
      const code = await status(page.url);
      if (code >= 400) { unscanned.push({ page: page.label, width: page.width, theme: page.theme, reason: `answers ${code}` }); return; }
    }
    await scan(page);
  };
  const scan = (page) => new Promise((resolve) => {
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
  return { findings, errors, unscanned };
}

/**
 * The pages the size gate measures: each board once, at its own frame's width, opened in its device's window, and
 * first drawn at its declared frame, as the canvas draws it.
 */
export function sizePages(pages) {
  const boards = pages.filter((p) => p.kind === 'board' && p.frame);
  return [...new Map(boards.map((p) => [p.label, { url: p.url, label: p.label, width: p.frame.w, height: deviceHeight(p.frame.w), frame: p.frame, fluid: Boolean(p.fluid) }])).values()];
}

/**
 * What a round keeps of the boards' sizes: `measured` is measure-boards.mjs's output, `boards` each board's
 * { label, width, declared, fluid }. A frame is off when it clips its content or leaves it a stretch blank; a page
 * (fluid) is held to its device's window at least. `heights` is every height a frame should have, for
 * `brandi product boards --heights` or a script that writes the boards.
 */
export function sizeGate({ measured, boards }) {
  if (!measured || !('__clipped' in measured)) return { skipped: "the starter's tools/measure-boards.mjs cannot check sizes: refresh its kit with brandi product starter --kit" };
  const off = [];
  const errors = [];
  const heights = {};
  for (const b of boards) {
    const m = measured[b.label];
    if (typeof m !== 'number') { errors.push({ board: b.label, error: m?.error ?? 'no height came back' }); continue; }
    const want = wantedHeight({ measured: m, width: b.width, fluid: b.fluid });
    heights[b.label] = want;
    const fit = frameFit(b.declared, want);
    if (fit !== 'fits') off.push({ board: b.label, declared: b.declared, want, fit });
  }
  const clipped = Object.entries(measured.__clipped ?? {}).flatMap(([board, boxes]) => boxes.map((box) => ({ board, ...box })));
  return { boards: boards.length, off, clipped, errors, heights };
}

/** A page's HTTP status, or 0 when it does not answer. */
async function httpStatus(url) {
  try { return (await fetch(url, { redirect: 'manual' })).status; } catch { return 0; }
}

/** The Design canvas's runtime, saved beside the product, or named by BRANDI_DC_RUNTIME; null when neither is there. */
export function canvasRuntime(productDir, env = process.env) {
  const named = env.BRANDI_DC_RUNTIME && path.resolve(env.BRANDI_DC_RUNTIME);
  if (named && existsSync(named)) return named;
  const saved = path.join(productDir, '.cache', 'dc-runtime.js');
  return existsSync(saved) ? saved : null;
}

const nodeScript = (starter, script, args, timeout = 1800000) => {
  const r = spawnSync(process.execPath, [path.join('tools', script), ...args], { cwd: starter, encoding: 'utf8', timeout });
  return { status: r.status, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
};

const freePort = () => new Promise((resolve, reject) => {
  const srv = net.createServer();
  srv.unref();
  srv.on('error', reject);
  srv.listen(0, '127.0.0.1', () => { const { port } = srv.address(); srv.close(() => resolve(port)); });
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
  // This machine only: a gates run has no reason to put the starter on the network.
  const child = spawn(process.execPath, [next, 'start', '-p', String(port), '-H', '127.0.0.1'], { cwd: starter, env, stdio: 'ignore' });
  const base = `http://127.0.0.1:${port}`;
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
 * What a round keeps of axe's record: its counts, every page that failed or was not scanned, and every route
 * axe loaded a second time because no h1 showed in ten seconds. A route that passed on its second load is not
 * a result, so it is listed apart, and a slow page stays on the record.
 */
export function axeGate(axe) {
  const retriedRoutes = (axe.results ?? []).filter((r) => r.retried).map((r) => ({ label: r.label, width: r.width, theme: r.theme }));
  return { pages: axe.pages ?? 0, violations: axe.violations, errors: axe.errors, skipped: axe.skipped ?? null, results: (axe.results ?? []).filter((r) => r.violations.length || r.error), retried: retriedRoutes.length, retriedRoutes };
}

/**
 * A scripted check that failed, run once more alone with its component's other checks: on a loaded machine a key
 * pressed before a menu took focus failed one run's gates, and the same check passed alone. Given only the first run,
 * the components to run again; given the second too, the merge: a check that passed the second time is counted as
 * passed and named under `retried`, for the record, as a route axe loaded twice is; one that failed again still fails.
 */
export function retryChecks(first, again) {
  const failed = first.failed.filter((f) => f.check !== 'runner');
  if (again === undefined) return [...new Set(failed.map((f) => f.check.split(':')[0]))];
  if (!again) return { ...first, retried: [] };
  const still = (f) => f.check === 'runner' || again.failed.some((a) => a.check === f.check);
  const retried = first.failed.filter((f) => !still(f));
  return { passed: first.passed + retried.length, failed: first.failed.filter(still), retried };
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

  // Reflow at 320px on the fluid boards and the routes: the website header that overflowed there was seen by
  // no gate, because none looked below 390.
  const reflowList = reflowPages(pages);
  let reflow = { width: REFLOW_WIDTH, pages: 0, overflow: [], errors: [] };
  if (reflowList.length && !existsSync(path.join(starter, 'tools', 'reflow-pages.mjs'))) {
    reflow.errors.push({ page: 'runner', error: 'the starter has no tools/reflow-pages.mjs: refresh its kit with brandi product starter --kit' });
  } else if (reflowList.length) {
    writeFileSync(path.join(outDir, 'reflow-pages.json'), JSON.stringify(reflowList, null, 2));
    const reflowRun = nodeScript(starter, 'reflow-pages.mjs', ['--pages', path.join(outDir, 'reflow-pages.json'), '--json', path.join(outDir, 'reflow.json')]);
    const measured = existsSync(path.join(outDir, 'reflow.json')) ? JSON.parse(readFileSync(path.join(outDir, 'reflow.json'), 'utf8')) : null;
    reflow = measured
      ? { width: REFLOW_WIDTH, pages: measured.pages, overflow: measured.results.filter((r) => r.overflow).map((r) => ({ page: r.label, kind: r.kind, scrollWidth: r.scrollWidth, clientWidth: r.clientWidth, worst: r.worst })), errors: measured.results.filter((r) => r.error).map((r) => ({ page: r.label, error: r.error })) }
      : { width: REFLOW_WIDTH, pages: 0, overflow: [], errors: [{ page: 'runner', error: reflowRun.out.slice(-400) }] };
  }
  log(`reflow: ${reflow.overflow.length} of ${reflow.pages} pages scroll sideways at ${REFLOW_WIDTH}px${reflow.errors.length ? `, ${reflow.errors.length} not measured` : ''}`);

  const previews = path.join(productDir, 'components', 'previews');
  const checkRun = existsSync(previews)
    ? nodeScript(starter, 'check-components.mjs', ['--previews', pagesDir, ...(only ? ['--only', only.join(',')] : []), '--json', path.join(outDir, 'checks.json')])
    : { status: 0, out: '' };
  let checks = existsSync(path.join(outDir, 'checks.json')) ? JSON.parse(readFileSync(path.join(outDir, 'checks.json'), 'utf8')) : { passed: 0, failed: [{ check: 'runner', reason: checkRun.out.slice(-400) }] };
  const again = retryChecks(checks);
  if (again.length) {
    log(`checks: ${checks.failed.length} failed; running ${again.join(', ')} again alone`);
    const retryFile = path.join(outDir, 'checks-retry.json');
    nodeScript(starter, 'check-components.mjs', ['--previews', pagesDir, '--only', again.join(','), '--json', retryFile]);
    checks = retryChecks(checks, existsSync(retryFile) ? JSON.parse(readFileSync(retryFile, 'utf8')) : null);
  }
  log(`checks: ${checks.passed} passed, ${checks.failed.length} failed${checks.retried?.length ? `, ${checks.retried.length} of them only when run again` : ''}`);

  // Every board under the Design canvas's own runtime, in a cross-origin frame as the canvas draws it: the previews
  // use a shim as the top page, and a board that broke only on the canvas passed every other gate.
  const runtimeFile = canvasRuntime(productDir);
  let runtime;
  if (!existsSync(path.join(productDir, 'canvas'))) runtime = { skipped: 'no canvas folder to render' };
  else if (!runtimeFile) runtime = { skipped: `no canvas runtime at ${path.relative(process.cwd(), path.join(productDir, '.cache', 'dc-runtime.js'))}: read artifact-type/dc-runtime.js from any Design canvas and save it there (06-canvas.md)` };
  else if (!existsSync(path.join(starter, 'tools', 'canvas-runtime.mjs'))) runtime = { skipped: 'the starter has no tools/canvas-runtime.mjs: refresh its kit with brandi product starter --kit' };
  else {
    const run = nodeScript(starter, 'canvas-runtime.mjs', ['--boards', path.join(productDir, 'canvas'), '--runtime', runtimeFile, '--json', path.join(outDir, 'runtime.json')]);
    runtime = existsSync(path.join(outDir, 'runtime.json')) ? JSON.parse(readFileSync(path.join(outDir, 'runtime.json'), 'utf8')) : { skipped: `the runtime check did not finish: ${run.out.slice(-300)}` };
  }
  log(runtime.skipped ? `canvas runtime: not run (${runtime.skipped})` : `canvas runtime: ${runtime.failed.length} of ${runtime.boards} boards with errors`);

  // Every board's frame against what it holds: canvas.json's heights were written by hand or not at all, so boards
  // were left clipped or a third blank, and a Card squeezed in a phone frame hid a total, with no gate to say so.
  const sizeList = sizePages(pages);
  let sizes;
  if (!sizeList.length) sizes = { boards: 0, off: [], clipped: [], errors: [], heights: {} };
  else {
    writeFileSync(path.join(outDir, 'size-pages.json'), JSON.stringify(sizeList, null, 2));
    const run = nodeScript(starter, 'measure-boards.mjs', ['--pages', path.join(outDir, 'size-pages.json')]);
    const line = run.out.trim().split('\n').reverse().find((l) => l.startsWith('{'));
    let measured = null;
    try { measured = JSON.parse(line); } catch { /* reported below */ }
    sizes = measured ? sizeGate({ measured, boards: sizeList.map((p) => ({ label: p.label, width: p.width, declared: p.frame.h, fluid: p.fluid })) }) : { skipped: `the size check did not finish: ${run.out.slice(-300)}` };
    if (sizes.heights) writeFileSync(path.join(outDir, 'heights.json'), `${JSON.stringify(sizes.heights, null, 2)}\n`);
  }
  log(sizes.skipped ? `sizes: not run (${sizes.skipped})` : `sizes: ${sizes.off.length} of ${sizes.boards} frames off their content, ${new Set(sizes.clipped.map((c) => c.board)).size} boards hiding content`);

  // What the canvas has to cover, from the surfaces product.json lists: every gate above checks what was drawn,
  // and a run that drew one surface in depth passed them all.
  let product = {};
  try { product = JSON.parse(readFileSync(path.join(productDir, 'product.json'), 'utf8')); } catch { /* no surfaces to hold the canvas to */ }
  const coverage = canvasCoverage({ surfaces: product.surfaces, files: canvasBoards(path.join(productDir, 'canvas')) });
  log(coverage.skipped ? `coverage: not checked (${coverage.skipped})` : `coverage: ${coverage.surfaces.filter((s) => !s.missing.length).length} of ${coverage.surfaces.length} surfaces covered`);

  const gates = {
    round,
    at: new Date().toISOString(),
    versions: toolVersions({ starter, detector }),
    widths,
    tokens: { summary: auditSummary(audit), fails: audit.fails.length, pairs: audit.pairs },
    // Where the kit speaks instead of the brand: a radius nobody measured, a shell or shape move never named.
    shape: { kitDefaults: shapeKitDefaults(tokens) },
    drift: { differences: drift.differences, unchecked: drift.unchecked },
    detector: { pages: pages.length, findings: detection.findings, errors: detection.errors, skipped: detection.skipped ?? null, unscanned: detection.unscanned ?? [] },
    axe: axeGate(axe),
    reflow,
    checks: { passed: checks.passed, failed: checks.failed, retried: checks.retried ?? [] },
    runtime,
    sizes,
    coverage,
  };
  writeFileSync(path.join(outDir, 'gates.json'), `${JSON.stringify(gates, null, 2)}\n`);
  return gates;
}

const STATUSES = ['open', 'fixed', 'accepted'];

/**
 * The findings whose status is a word outside open, fixed and accepted, named in a sentence, or ''. They still
 * count as open: reviewers once wrote "closed" on every finding they had checked, and the gates listed 20 as open
 * with nothing to say why. A finding with no status is open, and says nothing.
 */
function strayStatuses(findings) {
  const stray = findings.filter((f) => f.status != null && f.status !== '' && !STATUSES.includes(f.status));
  if (!stray.length) return '';
  const by = new Map();
  for (const f of stray) by.set(String(f.status), [...(by.get(String(f.status)) ?? []), f.id ?? f.title]);
  return `${stray.length} finding${stray.length === 1 ? ' has' : 's have'} a status outside open, fixed or accepted: ${[...by].map(([status, names]) => `${status} (${names.join(', ')})`).join(', ')}, counted as open`;
}

const count = (n, word, many = `${word}s`) => `${n} ${n === 1 ? word : many}`;
const acceptanceName = (a) => `${a?.rule ?? '(no rule)'} on ${a?.page ?? '(no page)'}`;

/**
 * Detector findings a person has accepted as recorded deviations: product.json "accepted", each entry
 * { rule, page, selector?, reason }. A finding matches an entry with its rule, a page whose name starts with the
 * entry's page (a board or route name, or the start of one), and a selector holding the entry's, when it gives one.
 * A generator's finding once blocked the bar with no fix on the product's side but changing a brand decision.
 * Returns the findings still open, the accepted ones by entry, and every entry not used: one with no rule, page or
 * reason accepts nothing, and one matching nothing is named so a stale acceptance does not linger.
 */
export function acceptFindings(findings, accepted = []) {
  if (accepted != null && !Array.isArray(accepted)) return { open: [...findings], accepted: [], unused: [{ name: 'accepted in product.json', why: 'is not a list' }] };
  const text = (v) => typeof v === 'string' && v.trim() !== '';
  const valid = (a) => text(a?.rule) && text(a?.page) && text(a?.reason) && (a.selector == null || typeof a.selector === 'string');
  const entries = (accepted ?? []).filter(valid).map((entry) => ({ entry, findings: [] }));
  const matches = (a, f) => f.rule === a.rule && String(f.page ?? '').startsWith(a.page) && (!a.selector || String(f.selector ?? '').includes(a.selector));
  const open = [];
  for (const f of findings) {
    const hit = entries.find((e) => matches(e.entry, f));
    if (hit) hit.findings.push(f);
    else open.push(f);
  }
  // A finding goes to the first entry that matches it, so an entry whose every match an earlier one took is said so.
  const why = (a) => (!valid(a) ? 'needs a rule, a page and a reason'
    : entries.find((e) => e.entry === a).findings.length ? null
      : findings.some((f) => matches(a, f)) ? 'accepts nothing an earlier entry has not' : 'matches no finding this round');
  const unused = (accepted ?? []).filter(why).map((a) => ({ name: acceptanceName(a), why: why(a) }));
  return { open, accepted: entries.filter((e) => e.findings.length), unused };
}

/**
 * Hold a round's results against the bar. `critique` is the Impeccable craft critique
 * ({ method, heuristics: [{ name, score, note }], findings: [{ severity: 'P0'..'P3', title, status, where, evidence, owner,
 * class, reason }] }); `rules` is the ui-ux-pro-max review ({ method, findings: [{ severity: 'Critical'|'High'|'Medium'
 * |'Low', title, ... }] }); `accepted` is product.json's list of accepted detector findings.
 * Returns each gate with pass or fail and why, whether the bar is met, and the detector findings sorted into open,
 * accepted and acceptances not used.
 */
export function judgeRound(gates, { critique = null, rules = null, accepted = null } = {}) {
  const verdicts = [];
  const add = (gate, pass, detail) => verdicts.push({ gate, pass, detail });
  add('Tokens', gates.tokens.fails === 0, gates.tokens.summary);
  const differences = gates.drift?.differences;
  add('Drift', Array.isArray(differences) && differences.length === 0,
    !Array.isArray(differences) ? 'no drift check recorded for this round' : differences.length ? `${differences.length} differences between the canvas, the system and the code` : 'canvas, system and code agree; the screens are compared by eye, in by-eye.md beside the record');
  const detector = acceptFindings(gates.detector.findings, accepted);
  const acceptedCount = detector.accepted.reduce((n, e) => n + e.findings.length, 0);
  add('Detector', !gates.detector.skipped && detector.open.length === 0 && gates.detector.errors.length === 0,
    `${gates.detector.skipped ?? `${count(detector.open.length, 'finding')} across ${gates.detector.pages} renders at ${gates.widths.join(', ')}, light and dark`}${acceptedCount ? `; ${acceptedCount} accepted as recorded deviations` : ''}${detector.unused.length ? `; ${count(detector.unused.length, 'acceptance')} unused: ${detector.unused.map((u) => `${u.name} ${u.why}`).join('; ')}` : ''}`);
  // A round from before the reflow measure has none to count; one that measured fails on any page that overflowed.
  const overflow = gates.reflow?.overflow?.length ?? 0;
  const unmeasured = gates.reflow?.errors?.length ?? 0;
  // A page axe could not scan is not a clean page: the line says how many, so a board that never loads is not missed.
  add('Accessibility', gates.axe.violations === 0 && !gates.axe.errors && gates.checks.failed.length === 0 && overflow === 0 && unmeasured === 0,
    `axe ${gates.axe.violations} violations on ${gates.axe.pages} pages${gates.axe.errors ? `, ${gates.axe.errors} not scanned` : ''}; ${gates.checks.passed} scripted checks passed, ${gates.checks.failed.length} failed${gates.checks.retried?.length ? `, ${gates.checks.retried.length} of them only when run again` : ''}${gates.reflow ? `; at ${gates.reflow.width}px ${overflow} of ${gates.reflow.pages} pages scroll sideways${unmeasured ? `, ${unmeasured} not measured` : ''}` : ''}`);
  // A round from before this gate has no line for it; one that could not run it has not passed it.
  if (gates.runtime) {
    add('Canvas runtime', !gates.runtime.skipped && gates.runtime.failed.length === 0,
      gates.runtime.skipped ? `not run: ${gates.runtime.skipped}` : `${gates.runtime.failed.length} of ${gates.runtime.boards} boards with errors under the Design canvas's own runtime, in a cross-origin frame`);
  }
  // Likewise for sizes: a round from before the gate has no line for it, and one that could not measure has not passed.
  if (gates.sizes) {
    const z = gates.sizes;
    const hiding = new Set((z.clipped ?? []).map((c) => c.board)).size;
    const by = (fit) => z.off.filter((o) => o.fit === fit).length;
    const faults = [
      z.off.length ? `${z.off.length} of ${z.boards} frames off their content (${by('clipped')} clipped, ${by('blank')} blank)` : '',
      hiding ? `${count(hiding, 'board')} ${hiding === 1 ? 'hides' : 'hide'} content in a box that clips it` : '',
      z.errors?.length ? `${z.errors.length} not measured` : '',
    ].filter(Boolean);
    add('Board sizes', !z.skipped && !faults.length,
      z.skipped ? `not run: ${z.skipped}` : faults.length ? faults.join('; ') : `every frame fits its content on ${count(z.boards, 'board')}, and nothing on a board hides its own content`);
  }
  // Likewise: a round from before coverage has no line for it, and one with no surfaces to hold the canvas to fails.
  if (gates.coverage) {
    const short = (gates.coverage.surfaces ?? []).filter((s) => s.missing.length);
    add('Coverage', !gates.coverage.skipped && !short.length,
      gates.coverage.skipped ?? `${gates.coverage.surfaces.length - short.length} of ${gates.coverage.surfaces.length} surfaces covered${short.length ? `; missing: ${short.map((s) => `${s.name} (${s.missing.length})`).join(', ')}` : ''}`);
  }
  if (critique) {
    const scores = critique.heuristics ?? [];
    const total = scores.reduce((n, h) => n + h.score, 0);
    const low = scores.filter((h) => h.score < BAR.craftMinimum);
    const open = (critique.findings ?? []).filter((f) => BAR.critiqueOpen.includes(f.severity) && !['fixed', 'accepted'].includes(f.status));
    const stray = strayStatuses(critique.findings ?? []);
    // A score under 4 says what cost the point (08-quality-gates.md): five heuristics at 3 with no reason left nobody
    // knowing where the points went, and a lost point with no reason cannot be acted on in the next round. Each one
    // without a note fails the gate, named.
    const unexplained = scores.filter((h) => h.score < 4 && !given(h.note));
    add('Craft', scores.length === 10 && total >= BAR.craftTotal && !low.length && !open.length && !unexplained.length,
      `${total}/40 on ${scores.length} heuristics${low.length ? `; under ${BAR.craftMinimum}: ${low.map((h) => h.name).join(', ')}` : ''}${open.length ? `; open: ${open.map((f) => `${f.severity} ${f.title}`).join('; ')}` : ''}${stray ? `; ${stray}` : ''}${unexplained.length ? `; under 4 with no note on what cost the point: ${unexplained.map((h) => h.name).join(', ')}` : ''}`);
  } else {
    add('Craft', false, 'no critique recorded for this round');
  }
  if (rules) {
    const open = (rules.findings ?? []).filter((f) => BAR.rulesOpen.includes(f.severity) && !['fixed', 'accepted'].includes(f.status));
    const stray = strayStatuses(rules.findings ?? []);
    add('Rules', open.length === 0, `${open.length ? `open: ${open.map((f) => `${f.severity} ${f.title}`).join('; ')}` : `no Critical, High or Medium open (${(rules.findings ?? []).length} findings in all)`}${stray ? `; ${stray}` : ''}`);
  } else {
    add('Rules', false, 'no rules review recorded for this round');
  }
  add('Record', Boolean(gates.versions?.detector?.version && gates.versions?.['axe-core'] && gates.versions?.playwright), 'every tool version pinned and written down');
  return { met: verdicts.every((v) => v.pass), verdicts, detector };
}

const sentence = (s) => String(s).trim().replace(/\.+$/, '');
const given = (v) => v != null && String(v).trim() !== '';

/** One reviewed finding as the record prints it: severity, title and status, then where, evidence, owner and class when given. */
function findingLine(f) {
  const head = `- ${f.severity}: ${f.title}${f.status ? ` (${f.status})` : ''}`;
  const details = [['Where', f.where], ['Evidence', f.evidence], ['Owner', f.owner], ['Class', f.class]].filter(([, v]) => given(v));
  return details.length ? `${head}. ${details.map(([k, v]) => `${k}: ${sentence(v)}.`).join(' ')}` : head;
}

/**
 * The "## Published" section of a round record, to its next heading, or ''. It is written after the round (the
 * system's and the canvas's version ids, 06-canvas.md step 10), so a rerun of the round keeps it.
 */
export function publishedSection(record) {
  const m = /(?:^|\n)(## Published[^\n]*\n[\s\S]*?)(?=\n## |\s*$)/.exec(String(record ?? ''));
  return m ? `${m[1].trimEnd()}\n` : '';
}

/** The round record as a person reads it. */
export function roundMarkdown(gates, judged, { system = {}, critique = null, rules = null, signOff = null, byEye = null } = {}) {
  const lines = [`# Round ${gates.round}: ${system.name ?? 'product system'} ${system.version ?? ''}`.trimEnd(), '', `Run ${gates.at}. ${judged.met ? 'The bar is met.' : 'The bar is not met yet.'}`, '', '| Gate | Result | Detail |', '| --- | --- | --- |'];
  for (const v of judged.verdicts) lines.push(`| ${v.gate} | ${v.pass ? 'pass' : 'fail'} | ${String(v.detail).replace(/\|/g, '\\|')} |`);
  if (gates.axe.skipped?.rules?.length) lines.push('', `axe ran every rule on the routes. On ${gates.axe.skipped.kinds.map((k) => `${k} pages`).join(' and ')}, which show a page frame more than once, it skipped ${gates.axe.skipped.rules.join(', ')}.`);
  const slow = gates.axe.retriedRoutes ?? [];
  if (slow.length) lines.push('', `axe found no h1 after 10s on the first load of ${slow.length === 1 ? '1 route render' : `${slow.length} route renders`}, and loaded ${slow.length === 1 ? 'it' : 'each'} once more before scanning: ${slow.map((r) => `${r.label} at ${r.width}, ${r.theme}`).join('; ')}.`);
  lines.push('', '## Tool versions', '');
  for (const [k, v] of Object.entries(gates.versions)) lines.push(`- ${k}: ${typeof v === 'object' && v ? `${v.version ?? ''} (${v.path ?? ''})` : v ?? 'not found'}`);
  const unscanned = [...new Set((gates.detector.unscanned ?? []).map((u) => `${u.page} (${u.reason})`))];
  if (unscanned.length) lines.push('', `The detector did not scan ${unscanned.join(', ')}, at any width; axe covered ${unscanned.length === 1 ? 'it' : 'them'}.`);
  const detector = judged.detector ?? { open: gates.detector.findings, accepted: [], unused: [] };
  if (detector.open.length) {
    lines.push('', '## Detector findings', '');
    for (const f of detector.open) lines.push(`- ${f.page} at ${f.width}, ${f.theme}: ${f.rule} on ${f.selector ?? '?'} (${f.snippet ?? ''})`);
  }
  if (gates.axe.results.length) {
    lines.push('', '## axe', '');
    for (const r of gates.axe.results) lines.push(`- ${r.label} at ${r.width}, ${r.theme}: ${r.error ?? r.violations.map((v) => `${v.id} (${v.impact})`).join(', ')}`);
  }
  if (gates.reflow?.overflow?.length || gates.reflow?.errors?.length) {
    lines.push('', `## Reflow at ${gates.reflow.width}px`, '');
    for (const r of gates.reflow.overflow) lines.push(`- ${r.page}: ${r.scrollWidth}px wide in a ${r.clientWidth}px window${r.worst ? `, furthest out ${r.worst.what} at ${r.worst.right}px` : ''}`);
    for (const r of gates.reflow.errors) lines.push(`- ${r.page}: not measured (${r.error})`);
  }
  if (gates.runtime?.skipped) lines.push('', '## Canvas runtime', '', `Not run: ${gates.runtime.skipped}`);
  else if (gates.runtime?.failed?.length) {
    lines.push('', '## Canvas runtime', '');
    for (const f of gates.runtime.failed) lines.push(`- ${f.board}: ${f.errors.join('; ')}`);
  }
  if (gates.sizes?.skipped) lines.push('', '## Board sizes', '', `Not run: ${gates.sizes.skipped}`);
  else if (gates.sizes && (gates.sizes.off.length || gates.sizes.clipped.length || gates.sizes.errors.length)) {
    lines.push('', '## Board sizes', '', "Each board measured at its width in its device's window, a page at its whole height. Write the heights with `brandi product boards --heights` (06-canvas.md, Sizes); fix a box that hides content in the board or the component.", '');
    for (const o of gates.sizes.off) lines.push(`- ${o.board}: frame ${o.declared}px, content ${o.want}px (${o.fit})`);
    for (const c of gates.sizes.clipped) lines.push(`- ${c.board}: ${c.what}${c.text ? ` "${c.text}"` : ''} shows ${c.shown}px of ${c.content}px`);
    for (const e of gates.sizes.errors) lines.push(`- ${e.board}: not measured (${e.error})`);
  }
  if (gates.coverage) {
    lines.push('', '## Coverage', '');
    if (gates.coverage.skipped) lines.push(`Not checked: ${gates.coverage.skipped}.`);
    // Which modules drew options A to D and which reused a written pattern, from the boards' names (06-canvas.md).
    const letters = (l) => (l.join('') === 'ABCD' ? 'A to D' : l.join(', '));
    const trail = (s) => [
      ...(s.options ?? []).map((o) => `options ${letters(o.letters)} for ${o.module}`),
      ...(s.reused?.length ? [`a written pattern reused for ${s.reused.join(', ')}`] : []),
    ].map((t) => `; ${t}`).join('');
    for (const s of gates.coverage.surfaces ?? []) {
      lines.push(`- ${s.name} (${s.prefix}*, ${count(s.boards, 'board')}): ${s.missing.length ? s.missing.join('; ') : `covered at ${s.widths.join(', ')}${s.modules.length ? `, with a states board for ${s.modules.join(', ')}` : ''}`}${trail(s)}`);
      // Each core page on its board, and each skip with its reason, so a reviewer can open the screen or question the skip.
      if (s.core?.named?.length) lines.push(`  - Core pages: ${s.core.named.map((n) => `${n.pattern} on ${n.board}`).join(', ')}`);
      if (s.core?.skipped?.length) lines.push(`  - Skipped: ${s.core.skipped.map((k) => `${k.pattern} (${sentence(k.reason)})`).join(', ')}`);
    }
  }
  if (gates.shape) {
    lines.push('', '## Shape the kit chose', '');
    if (!gates.shape.kitDefaults.length) lines.push("Every shape and shell choice is the brand's, each with its source.");
    for (const d of gates.shape.kitDefaults) lines.push(`- ${d.choice}, ${d.value}: ${d.how}`);
  }
  if (gates.drift?.differences?.length) {
    lines.push('', '## Drift', '');
    for (const d of gates.drift.differences) lines.push(`- ${d.area}: ${d.where}${d.found ? ` ${d.found}` : ''}, ${d.expected}`);
  }
  for (const u of gates.drift?.unchecked ?? []) lines.push('', `Not checked automatically: ${u}`);
  // What was compared by eye goes in the record, or the record says it is still to do: a run read "noted in the
  // record" and found nowhere that asked for the note or kept it.
  lines.push('', '## Screens checked by eye', '', byEye?.trim() ? byEye.trim() : `Not recorded yet. Compare each screen with its pattern, page by page, and write what you compared and found in by-eye.md beside this record, then run \`brandi product round --round ${gates.round}\` again.`);
  const rerun = gates.checks.retried ?? [];
  if (rerun.length) lines.push('', `${rerun.length === 1 ? '1 scripted check' : `${rerun.length} scripted checks`} failed in the full run and passed run again alone, with ${rerun.length === 1 ? "its component's" : 'their components\''} other checks: ${rerun.map((f) => `${f.check} (first: ${f.reason})`).join('; ')}.`);
  if (gates.checks.failed.length) {
    lines.push('', '## Failed checks', '');
    for (const f of gates.checks.failed) lines.push(`- ${f.check}: ${f.reason}`);
  }
  // How each review ran (single-context, or isolation by procedure) goes beside its scores (08-quality-gates.md).
  const method = (review) => (given(review.method) ? [`How it ran: ${String(review.method).trim()}`, ''] : []);
  if (critique) {
    // Each score with what cost its points beside it; a record from before the notes keeps its two columns.
    const noted = (critique.heuristics ?? []).some((h) => given(h.note));
    const cell = (v) => String(v).trim().replace(/\|/g, '\\|');
    lines.push('', '## Craft critique', '', ...method(critique), ...(noted ? ['| Heuristic | Score | What cost the point |', '| --- | --- | --- |'] : ['| Heuristic | Score |', '| --- | --- |']));
    for (const h of critique.heuristics ?? []) lines.push(noted ? `| ${h.name} | ${h.score} | ${given(h.note) ? cell(h.note) : ''} |` : `| ${h.name} | ${h.score} |`);
    for (const f of critique.findings ?? []) lines.push(findingLine(f));
  }
  if (rules) {
    lines.push('', '## Rules review', '', ...method(rules));
    for (const f of rules.findings ?? []) lines.push(findingLine(f));
  }
  const reviewed = [...(critique?.findings ?? []).map((f) => ['Craft', f]), ...(rules?.findings ?? []).map((f) => ['Rules', f])];
  const deviations = [
    ...detector.accepted.map(({ entry, findings }) => `- Detector ${entry.rule} on ${entry.page}${entry.selector ? ` (selector ${entry.selector})` : ''}, ${count(findings.length, 'finding')}: ${sentence(entry.reason)}.`),
    ...reviewed.filter(([, f]) => f.status === 'accepted').map(([gate, f]) => `- ${gate} ${f.severity}: ${sentence(f.title)}. ${given(f.reason) ? `${sentence(f.reason)}.` : 'No reason recorded.'}`),
  ];
  lines.push('', '## Accepted deviations', '', ...(deviations.length ? deviations : ['None.']));
  if (detector.unused.length) lines.push('', 'Not used from product.json "accepted":', '', ...detector.unused.map((u) => `- ${u.name}: ${u.why}`));
  if (critique || rules) {
    // Every finding not fixed or accepted, at any severity: a P3 or a Low may stay open, but only with an owner.
    const open = reviewed.filter(([, f]) => !['fixed', 'accepted'].includes(f.status));
    lines.push('', '## Still open', '', ...(open.length ? open.map(([gate, f]) => `- ${gate} ${f.severity}: ${sentence(f.title)}. Owner: ${given(f.owner) ? sentence(f.owner) : 'none named'}.`) : ['Nothing.']));
  }
  lines.push('', '## Sign-off', '', signOff ? `Signed off by ${signOff}.` : 'Not signed off.', '');
  return lines.join('\n');
}

export default { runGates, retryChecks, axeGate, acceptFindings, judgeRound, roundMarkdown, publishedSection, findDetector, toolVersions, collectPages, runDetector, reflowPages, sizePages, sizeGate, canvasRuntime, WIDTHS, REFLOW_WIDTH, BAR, MACHINE_GATES };
