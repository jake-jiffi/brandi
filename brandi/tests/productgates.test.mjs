import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, symlinkSync } from 'node:fs';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import os from 'node:os';
import path from 'node:path';

import { axeGate, judgeRound, roundMarkdown, publishedSection, findDetector, collectPages, runDetector, reflowPages, BAR, WIDTHS, REFLOW_WIDTH } from '../scripts/productgates.mjs';
import { KIT } from '../scripts/productstarter.mjs';
import { findChrome } from '../scripts/preview.mjs';

const clean = () => ({
  round: 3,
  at: '2026-10-27T12:00:00.000Z',
  widths: [...WIDTHS],
  versions: { brandi: '1.22.0', detector: { path: '/x/impeccable', version: '0.1.18+engine' }, 'axe-core': '4.14.0', playwright: '1.64.1' },
  tokens: { summary: 'colour tokens 80 | pairs checked 186 | fails 0', fails: 0, pairs: 186 },
  drift: { differences: [], unchecked: ['Screens by eye'] },
  detector: { pages: 120, findings: [], errors: [], skipped: null },
  axe: { pages: 120, violations: 0, errors: 0, results: [] },
  checks: { passed: 210, failed: [] },
});
const critique = (scores, findings = []) => ({ heuristics: scores.map((score, i) => ({ name: `H${i + 1}`, score })), findings });
const rules = (findings) => ({ findings });

describe('a round held against the bar', () => {
  test('the bar is the brief\'s: 34 of 40, no heuristic under 3, no Critical, High or Medium open', () => {
    assert.equal(BAR.craftTotal, 34);
    assert.equal(BAR.craftMinimum, 3);
    assert.deepEqual(BAR.rulesOpen, ['Critical', 'High', 'Medium']);
    assert.deepEqual([...WIDTHS], [1440, 820, 390]);
  });

  test('a clean round with a passing critique and rules review meets it', () => {
    const judged = judgeRound(clean(), { critique: critique([4, 4, 3, 4, 3, 4, 3, 3, 3, 4]), rules: rules([{ severity: 'Low', title: 'x' }]) });
    assert.equal(judged.met, true, JSON.stringify(judged.verdicts));
  });

  test('every failure is named, and one is enough to fail the round', () => {
    const cases = [
      [(g) => { g.tokens.fails = 1; }, 'Tokens'],
      [(g) => { g.detector.findings.push({ page: 'X', width: 820, theme: 'dark', rule: 'low-contrast' }); }, 'Detector'],
      [(g) => { g.detector.skipped = 'no detector found'; }, 'Detector'],
      [(g) => { g.detector.errors.push({ page: 'X' }); }, 'Detector'],
      [(g) => { g.axe.violations = 2; }, 'Accessibility'],
      [(g) => { g.checks.failed.push({ check: 'Dialog: Escape order', reason: 'x' }); }, 'Accessibility'],
      [(g) => { g.versions.detector = null; }, 'Record'],
      [(g) => { g.drift.differences.push({ area: 'prop', where: 'Main.dc.html', found: 'Acme.Button tone=', expected: 'the definition has no tone' }); }, 'Drift'],
      [(g) => { delete g.drift; }, 'Drift'],
      [(g) => { g.reflow = { width: 320, pages: 4, overflow: [{ page: 'WebHome1440', kind: 'board', scrollWidth: 347, clientWidth: 320 }], errors: [] }; }, 'Accessibility'],
      [(g) => { g.reflow = { width: 320, pages: 0, overflow: [], errors: [{ page: 'runner', error: 'no tool' }] }; }, 'Accessibility'],
    ];
    for (const [mutate, gate] of cases) {
      const g = clean();
      mutate(g);
      const judged = judgeRound(g, { critique: critique([4, 4, 4, 4, 4, 4, 4, 3, 3, 3]), rules: rules([]) });
      assert.equal(judged.met, false, gate);
      assert.equal(judged.verdicts.find((v) => v.gate === gate).pass, false, gate);
    }
  });

  test('34 is not enough with a heuristic at 2, and 33 is not enough at all', () => {
    const low = judgeRound(clean(), { critique: critique([5, 5, 5, 4, 4, 3, 2, 2, 2, 2].map((n, i) => (i === 6 ? 2 : n))), rules: rules([]) });
    assert.equal(low.verdicts.find((v) => v.gate === 'Craft').pass, false);
    assert.match(low.verdicts.find((v) => v.gate === 'Craft').detail, /under 3/);
    const short = judgeRound(clean(), { critique: critique([4, 4, 3, 3, 3, 3, 3, 3, 3, 4]), rules: rules([]) });
    assert.equal(short.verdicts.find((v) => v.gate === 'Craft').pass, false, '33 of 40');
    const open = judgeRound(clean(), { critique: critique([4, 4, 4, 4, 4, 4, 4, 3, 3, 3], [{ severity: 'P2', title: 'Clipped title' }]), rules: rules([]) });
    assert.equal(open.verdicts.find((v) => v.gate === 'Craft').pass, false, 'an open P2');
  });

  test('a finding fixed in the round or accepted as a deviation is not open', () => {
    const c = critique([4, 4, 4, 4, 4, 4, 4, 3, 3, 3], [{ severity: 'P1', title: 'Focus lost after approve', status: 'fixed' }, { severity: 'P2', title: '14px body on phones', status: 'accepted' }]);
    assert.equal(judgeRound(clean(), { critique: c, rules: rules([{ severity: 'High', title: 'x', status: 'fixed' }]) }).met, true);
    assert.equal(judgeRound(clean(), { critique: c, rules: rules([{ severity: 'High', title: 'x', status: 'open' }]) }).met, false);
  });

  test('a status outside open, fixed and accepted still counts as open, and the gate names the findings that used it', () => {
    const c = critique([4, 4, 4, 4, 4, 4, 4, 3, 3, 3], [
      { id: 'C1', severity: 'P1', title: 'Focus lost after approve', status: 'closed' },
      { id: 'C2', severity: 'P2', title: 'Title clipped at 390', status: 'closed' },
      { id: 'C3', severity: 'P3', title: 'Tight gap in the rail', status: 'closed' },
      { id: 'C4', severity: 'P2', title: 'Chart labels in dark', status: 'fixed' },
      { severity: 'P2', title: 'Toast covers the action bar' },
    ]);
    const r = rules([{ id: 'R4', severity: 'Low', title: 'Long label wraps', status: 'done' }, { id: 'R5', severity: 'High', title: 'No skip link', status: 'fixed' }]);
    const judged = judgeRound(clean(), { critique: c, rules: r });
    const craft = judged.verdicts.find((v) => v.gate === 'Craft');
    assert.equal(craft.pass, false, 'closed is not fixed');
    assert.match(craft.detail, /open: P1 Focus lost after approve; P2 Title clipped at 390; P2 Toast covers the action bar/);
    assert.match(craft.detail, /3 findings have a status outside open, fixed or accepted: closed \(C1, C2, C3\), counted as open/);
    const rulesGate = judged.verdicts.find((v) => v.gate === 'Rules');
    assert.equal(rulesGate.pass, true, 'a Low finding still does not block');
    assert.match(rulesGate.detail, /1 finding has a status outside open, fixed or accepted: done \(R4\), counted as open/);
    const plain = judgeRound(clean(), { critique: critique([4, 4, 4, 4, 4, 4, 4, 3, 3, 3], [{ severity: 'P2', title: 'No status yet' }]), rules: rules([{ severity: 'Low', title: 'x', status: 'open' }]) });
    assert.doesNotMatch(plain.verdicts.map((v) => v.detail).join(' '), /status outside/, 'no status, and open, say nothing more');
  });

  test('a Medium rules finding fails; a Low does not', () => {
    const c = critique([4, 4, 4, 4, 4, 4, 4, 3, 3, 3]);
    assert.equal(judgeRound(clean(), { critique: c, rules: rules([{ severity: 'Medium', title: 'Error summary focus' }]) }).met, false);
    assert.equal(judgeRound(clean(), { critique: c, rules: rules([{ severity: 'Low', title: 'x' }]) }).met, true);
  });

  test('without a critique or a rules review the round is not met, and says why', () => {
    const judged = judgeRound(clean());
    assert.equal(judged.met, false);
    assert.match(judged.verdicts.find((v) => v.gate === 'Craft').detail, /no critique recorded/);
    assert.match(judged.verdicts.find((v) => v.gate === 'Rules').detail, /no rules review recorded/);
  });

  test('the record names each gate, the tool versions, the findings and the sign-off', () => {
    const g = clean();
    g.detector.findings.push({ page: 'ConsoleRosters1440', width: 820, theme: 'dark', rule: 'side-tab', selector: '.card', snippet: 'border-left' });
    const md = roundMarkdown(g, judgeRound(g), { system: { name: 'Acme', version: '1.2.0' }, signOff: 'Jake' });
    assert.match(md, /^# Round 3: Acme 1\.2\.0/);
    assert.match(md, /\| Detector \| fail \|/);
    assert.match(md, /- detector: 0\.1\.18\+engine/);
    assert.match(md, /ConsoleRosters1440 at 820, dark: side-tab on \.card/);
    assert.match(md, /Signed off by Jake\./);
    assert.doesNotMatch(md, /skipped/, 'no axe scope line when nothing was skipped');
  });

  test('every board must render under the canvas runtime: an error fails the round, and a round that could not run it says why', () => {
    const errored = clean();
    errored.runtime = { boards: 166, failed: [{ board: 'ComponentsOverlays1440.dc.html', errors: ["ComponentsOverlays1440: Cannot read properties of undefined (reading 'filter')"] }] };
    const bad = judgeRound(errored).verdicts.find((v) => v.gate === 'Canvas runtime');
    assert.equal(bad.pass, false);
    assert.match(bad.detail, /1 of 166 boards/);
    assert.match(roundMarkdown(errored, judgeRound(errored)), /## Canvas runtime\n\n- ComponentsOverlays1440\.dc\.html: ComponentsOverlays1440: Cannot read/);
    const missing = clean();
    missing.runtime = { skipped: 'no canvas runtime at product/.cache/dc-runtime.js' };
    const none = judgeRound(missing).verdicts.find((v) => v.gate === 'Canvas runtime');
    assert.equal(none.pass, false, 'not run is not passed');
    assert.match(none.detail, /dc-runtime\.js/);
    const ok = clean();
    ok.runtime = { boards: 166, failed: [] };
    assert.equal(judgeRound(ok).verdicts.find((v) => v.gate === 'Canvas runtime').pass, true);
    assert.equal(judgeRound(clean()).verdicts.some((v) => v.gate === 'Canvas runtime'), false, 'a round from before the gate has no line for it');
  });

  test('the record lists every shape and shell choice the kit made, not the brand, and says so when there are none', () => {
    const g = clean();
    g.shape = { kitDefaults: [{ choice: 'radius-lg', value: '16px', how: "the brand scale's xl step, held to the card radius (16px)" }, { choice: 'moves', value: 'none', how: "no shape move of the brand's own is carried into the product" }] };
    const md = roundMarkdown(g, judgeRound(g));
    assert.match(md, /\n## Shape the kit chose\n/);
    assert.match(md, /- radius-lg, 16px: the brand scale's xl step, held to the card radius \(16px\)/);
    assert.match(md, /- moves, none: no shape move/);
    const measured = clean();
    measured.shape = { kitDefaults: [] };
    assert.match(roundMarkdown(measured, judgeRound(measured)), /Every shape and shell choice is the brand's, each with its source\./);
    assert.doesNotMatch(roundMarkdown(clean(), judgeRound(clean())), /Shape the kit chose/, 'nothing for a round recorded before the listing');
  });

  test('the record says which axe rules boards skipped, and that the routes ran them', () => {
    const g = clean();
    g.axe.skipped = { kinds: ['component', 'board'], rules: ['landmark-no-duplicate-main', 'landmark-main-is-top-level', 'landmark-unique'] };
    const md = roundMarkdown(g, judgeRound(g), { system: { name: 'Acme' } });
    assert.match(md, /axe ran every rule on the routes\. On component pages and board pages, which show a page frame more than once, it skipped landmark-no-duplicate-main, landmark-main-is-top-level, landmark-unique\./);
  });

  test('a route axe loaded twice for a slow h1 stays in the round and is named in the record, whether it then passed or not', () => {
    const slow = 'no h1 after 10s on first load';
    const g = clean();
    g.axe = axeGate({ pages: 3, violations: 1, errors: 0, retried: 2, results: [
      { kind: 'route', label: 'Jobs, filtered', width: 1440, theme: 'dark', retried: slow, violations: [] },
      { kind: 'route', label: 'Job, quote', width: 390, theme: 'light', retried: slow, violations: [{ id: 'page-has-heading-one', impact: 'moderate' }] },
      { kind: 'route', label: 'Home', width: 1440, theme: 'light', violations: [] },
    ] });
    assert.equal(g.axe.retried, 2);
    assert.deepEqual(g.axe.retriedRoutes, [{ label: 'Jobs, filtered', width: 1440, theme: 'dark' }, { label: 'Job, quote', width: 390, theme: 'light' }]);
    assert.deepEqual(g.axe.results.map((r) => r.label), ['Job, quote'], 'a page that passed is still not a result');
    assert.match(roundMarkdown(g, judgeRound(g)), /\naxe found no h1 after 10s on the first load of 2 route renders, and loaded each once more before scanning: Jobs, filtered at 1440, dark; Job, quote at 390, light\.\n/);
    const none = clean();
    none.axe = axeGate({ pages: 1, violations: 0, errors: 0, retried: 0, results: [{ kind: 'route', label: 'Home', width: 1440, theme: 'light', violations: [] }] });
    assert.equal(none.axe.retried, 0);
    assert.doesNotMatch(roundMarkdown(none, judgeRound(none)), /no h1/, 'nothing when no route was loaded twice');
    assert.doesNotMatch(roundMarkdown(clean(), judgeRound(clean())), /no h1/, 'nor for a round recorded before the retry');
  });
});

describe('the round record, rewritten', () => {
  test('a rerun of the round keeps the Published section written after it, once, and a record without one gains none', async () => {
    const product = await mkdtemp(path.join(os.tmpdir(), 'brandi-record-'));
    const round = path.join(product, 'rounds', 'round-3');
    await mkdir(round, { recursive: true });
    await writeFile(path.join(round, 'gates.json'), JSON.stringify(clean()));
    const cli = path.join(path.dirname(KIT), '..', 'scripts', 'brandi.mjs');
    const roundOnce = () => spawnSync(process.execPath, [cli, 'product', 'round', '--round', '3', '--out', product], { encoding: 'utf8' });
    roundOnce();
    const first = await readFile(path.join(round, 'record.md'), 'utf8');
    assert.doesNotMatch(first, /## Published/, 'nothing to keep yet');
    const published = '## Published\n\n- Design System: version 7f3a, 2026-10-29.\n- Canvas: version 91bc, carrying system version 7f3a.\n';
    await writeFile(path.join(round, 'record.md'), `${first.trimEnd()}\n\n${published}`);
    roundOnce();
    roundOnce();
    const again = await readFile(path.join(round, 'record.md'), 'utf8');
    assert.equal(again.split('## Published').length - 1, 1, 'kept once, across two reruns');
    assert.ok(again.includes(published), again.slice(-300));
    assert.match(again, /\| Craft \| fail \|/, 'and the rest is rewritten');
    assert.deepEqual(publishedSection('# Round 3\n\n## Published\n\nA\n\n## Later notes\n\nB\n'), '## Published\n\nA\n', 'to its next heading');
    await rm(product, { recursive: true, force: true });
  });
});

describe('the pinned detector', () => {
  test('IMPECCABLE_BIN wins; otherwise the newest verified engine', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-detector-'));
    assert.equal(findDetector({ IMPECCABLE_BIN: path.join(dir, 'nope') }), null);
    await writeFile(path.join(dir, 'pinned'), '');
    assert.equal(findDetector({ IMPECCABLE_BIN: path.join(dir, 'pinned') }), path.join(dir, 'pinned'));
    await rm(dir, { recursive: true, force: true });
  });
});

describe('the pages a round scans', () => {
  test('a fluid board is drawn at each width it is scanned at, and a fixed one only at its own', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-pages-'));
    await mkdir(path.join(dir, 'canvas'), { recursive: true });
    const board = (name) => `<!doctype html><html><head><meta charset="utf-8"><script src="./support.js"></script></head><body><x-dc><p>${name}</p></x-dc></body></html>`;
    await writeFile(path.join(dir, 'canvas', 'Home1440.dc.html'), board('Home'));
    await writeFile(path.join(dir, 'canvas', 'Poster1440.dc.html'), board('Poster'));
    await writeFile(path.join(dir, 'canvas', 'canvas.json'), JSON.stringify({ artboards: [
      { file: 'Home1440.dc.html', frame: [1440, 900], expand: 'fill' },
      { file: 'Poster1440.dc.html', frame: [1440, 900] },
    ] }));
    const pages = await collectPages({ productDir: dir, outDir: path.join(dir, 'out') });
    const home = pages.filter((p) => p.label === 'Home1440');
    assert.deepEqual(home.map((p) => p.width), [...WIDTHS], 'the fluid board at every width');
    for (const p of home) {
      const html = await readFile(new URL(p.url), 'utf8');
      // Drawn at 1440 and scanned at 390, a fluid board scrolled sideways by 1050px on every page.
      assert.equal(/body > x-dc \{ width: 1440px/.test(html), false, `no 1440px frame on the page scanned at ${p.width}`);
    }
    const poster = pages.filter((p) => p.label === 'Poster1440');
    assert.deepEqual(poster.map((p) => p.width), [1440], 'the fixed board at its own width only');
    assert.match(await readFile(new URL(poster[0].url), 'utf8'), /body > x-dc \{ width: 1440px/);
    await rm(dir, { recursive: true, force: true });
  });
});

describe('reflow at 320px', () => {
  test('each fluid board and each route is measured once at 320, in light; a fixed board is not', () => {
    const pages = [
      ...WIDTHS.flatMap((width) => ['light', 'dark'].map((theme) => ({ kind: 'board', label: 'Home1440', url: 'file:///home.html', width, theme, fluid: true }))),
      { kind: 'board', label: 'Poster1440', url: 'file:///poster.html', width: 1440, theme: 'light', fluid: false },
      { kind: 'component', label: 'Button', url: 'file:///button.html', width: 960, theme: 'light' },
      ...WIDTHS.map((width) => ({ kind: 'route', label: 'Jobs', url: 'http://localhost:3000/jobs', width, theme: 'light' })),
    ];
    const picked = reflowPages(pages);
    assert.equal(REFLOW_WIDTH, 320);
    assert.deepEqual(picked.map((p) => `${p.kind} ${p.label} ${p.width}`), ['board Home1440 320', 'route Jobs 320']);
  });

  test('a page that scrolls sideways at 320 fails the round, and the record names it and what sticks out', () => {
    const g = clean();
    g.reflow = { width: 320, pages: 3, overflow: [{ page: 'WebHome1440', kind: 'board', scrollWidth: 347, clientWidth: 320, worst: { what: 'button.menu', right: 347 } }], errors: [] };
    const judged = judgeRound(g, { critique: critique([4, 4, 4, 4, 4, 4, 4, 3, 3, 3]), rules: rules([]) });
    const verdict = judged.verdicts.find((v) => v.gate === 'Accessibility');
    assert.equal(verdict.pass, false);
    assert.match(verdict.detail, /at 320px 1 of 3 pages scroll sideways/);
    const md = roundMarkdown(g, judged);
    assert.match(md, /## Reflow at 320px/);
    assert.match(md, /WebHome1440: 347px wide in a 320px window, furthest out button\.menu at 347px/);
    const passing = clean();
    passing.reflow = { width: 320, pages: 3, overflow: [], errors: [] };
    assert.equal(judgeRound(passing, { critique: critique([4, 4, 4, 4, 4, 4, 4, 3, 3, 3]), rules: rules([]) }).verdicts.find((v) => v.gate === 'Accessibility').pass, true, 'nothing overflowing passes');
  });

  test('a fluid board carries its fluid mark, so reflow can find it', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-reflow-'));
    await mkdir(path.join(dir, 'canvas'), { recursive: true });
    const board = (name) => `<!doctype html><html><head><meta charset="utf-8"><script src="./support.js"></script></head><body><x-dc><p>${name}</p></x-dc></body></html>`;
    await writeFile(path.join(dir, 'canvas', 'Home1440.dc.html'), board('Home'));
    await writeFile(path.join(dir, 'canvas', 'Poster1440.dc.html'), board('Poster'));
    await writeFile(path.join(dir, 'canvas', 'canvas.json'), JSON.stringify({ artboards: [
      { file: 'Home1440.dc.html', frame: [1440, 900], expand: 'fill' },
      { file: 'Poster1440.dc.html', frame: [1440, 900] },
    ] }));
    const picked = reflowPages(await collectPages({ productDir: dir, outDir: path.join(dir, 'out') }));
    assert.deepEqual(picked.map((p) => p.label), ['Home1440']);
    await rm(dir, { recursive: true, force: true });
  });
});

describe('a route the detector cannot scan', () => {
  test('a route that answers 404 is listed as not scanned rather than counted clean, and the record says so', async () => {
    const pages = [{ kind: 'route', label: 'Page not found', url: 'http://localhost:9/nope', width: 1440, theme: 'light' }];
    const result = await runDetector(pages, '/no/detector/needed', { status: async () => 404 });
    assert.deepEqual(result.findings, []);
    assert.deepEqual(result.unscanned, [{ page: 'Page not found', width: 1440, theme: 'light', reason: 'answers 404' }]);
    const g = clean();
    g.detector.unscanned = result.unscanned;
    assert.match(roundMarkdown(g, judgeRound(g), {}), /The detector did not scan Page not found \(answers 404\), at any width; axe covered it\./);
  });
});

// axe-pages.mjs runs on the kit's own node_modules (Playwright and axe-core), which Brandi does not carry. Point
// BRANDI_KIT_MODULES at an installed starter's node_modules to run these; without one they are skipped out loud.
const KIT_MODULES = process.env.BRANDI_KIT_MODULES && path.resolve(process.env.BRANDI_KIT_MODULES);
const needsKit = { skip: !KIT_MODULES || !existsSync(path.join(KIT_MODULES, 'playwright')) ? 'needs the kit\'s node_modules: set BRANDI_KIT_MODULES' : findChrome() ? false : 'no headless browser on this machine' };

/**
 * Serves `page(path, hit)`'s HTML (null is a 404) on a local port, runs the kit's axe-pages.mjs on the pages
 * `list(base)` gives, and returns its summary line and its record.
 */
async function axePagesOn(page, list) {
  const hits = {};
  const server = createServer((req, res) => {
    hits[req.url] = (hits[req.url] ?? 0) + 1;
    const html = page(req.url, hits[req.url]);
    if (html === null) return res.writeHead(404).end();
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(html);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-axe-'));
  await mkdir(path.join(dir, 'tools'));
  copyFileSync(path.join(KIT, 'tools', 'axe-pages.mjs'), path.join(dir, 'tools', 'axe-pages.mjs'));
  symlinkSync(KIT_MODULES, path.join(dir, 'node_modules'), 'dir');
  await writeFile(path.join(dir, 'pages.json'), JSON.stringify(list(`http://127.0.0.1:${server.address().port}`)));
  const out = await new Promise((resolve) => {
    const child = spawn(process.execPath, ['tools/axe-pages.mjs', '--pages', 'pages.json', '--json', 'axe.json'], { cwd: dir });
    let text = '';
    child.stdout.on('data', (d) => { text += d; });
    child.stderr.on('data', (d) => { text += d; });
    child.on('close', () => resolve(text));
  });
  server.close();
  if (!existsSync(path.join(dir, 'axe.json'))) throw new Error(`axe-pages.mjs wrote no record:\n${out}`);
  const run = { hits, line: JSON.parse(out.trim().split('\n').pop()), record: JSON.parse(await readFile(path.join(dir, 'axe.json'), 'utf8')) };
  await rm(dir, { recursive: true, force: true });
  const result = (label) => run.record.results.find((r) => r.label === label);
  return { ...run, result, ids: (label) => result(label).violations.map((v) => v.id) };
}

const pageOf = (main, extra = '') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>A page</title></head><body><main>${main}</main>${extra}</body></html>`;

describe('axe on a route that is slow to show its heading', () => {
  // Each page's own script adds its h1 this long after each load, as a streamed page's does: the first
  // number for the first load, the last for every load after. null is a page that never shows one.
  const delays = { '/late': [60000, 200], '/never': [null], '/soon': [1500], '/board': [null] };
  let run;
  before(async () => {
    if (needsKit.skip) return;
    run = await axePagesOn(
      (url, hit) => {
        if (!delays[url]) return null;
        const ms = delays[url][Math.min(hit, delays[url].length) - 1];
        return pageOf('<p>Some text.</p>', ms === null ? '' : `<script>setTimeout(() => { const h = document.createElement('h1'); h.textContent = 'A heading'; document.querySelector('main').prepend(h); }, ${ms});</script>`);
      },
      // As a round lists them: a route is marked by its kind and nothing else.
      (base) => Object.keys(delays).map((p) => ({ kind: p === '/board' ? 'board' : 'route', label: p, url: `${base}${p}`, width: 1440, height: 900, theme: 'light' }))
    );
  });

  test('a route with no h1 after ten seconds is loaded once more before axe runs, and the record keeps that it was slow', needsKit, () => {
    assert.equal(run.hits['/late'], 2, 'loaded twice');
    assert.equal(run.result('/late').retried, 'no h1 after 10s on first load');
    assert.equal(run.ids('/late').includes('page-has-heading-one'), false, 'scanned once its heading came');
    assert.equal(run.hits['/never'], 2);
    assert.equal(run.result('/never').retried, 'no h1 after 10s on first load');
    assert.equal(run.ids('/never').includes('page-has-heading-one'), true, 'no h1 on the second load still fails');
    assert.equal(run.line.retried, 2, 'the summary line counts the slow pages');
    assert.equal(run.record.retried, 2);
  });

  test('a route listed by its kind alone waits for its h1, and a board is loaded once, never waited on or retried', needsKit, () => {
    assert.equal(run.hits['/soon'], 1);
    assert.equal(run.result('/soon').retried, undefined);
    assert.equal(run.ids('/soon').includes('page-has-heading-one'), false, 'waited for the h1 its script adds');
    assert.equal(run.hits['/board'], 1);
    assert.equal(run.result('/board').retried, undefined);
  });
});

describe('axe on a form that leaves a required field to the browser', () => {
  const email = '<label for="email">Email</label><input id="email" type="email"';
  const forms = {
    '/required': `<form>${email} required><button>Save</button></form>`,
    '/aria-required': `<form>${email} aria-required="true"><button>Save</button></form>`,
    '/elsewhere': `<form id="far"><button>Save</button></form>${email} form="far" required>`,
    '/novalidate': `<form novalidate>${email} required><button>Save</button></form>`,
    '/optional': `<form>${email}><button>Save</button></form>`,
    '/no-form': `${email} required>`,
  };
  let run;
  before(async () => {
    if (needsKit.skip) return;
    run = await axePagesOn(
      (url) => (forms[url] ? pageOf(`<h1>A form</h1>${forms[url]}`) : null),
      (base) => Object.keys(forms).map((p) => ({ kind: 'board', label: p, url: `${base}${p}`, width: 1440, height: 900, theme: 'light' }))
    );
  });

  test('a form with a required or aria-required field and no noValidate fails, naming the form and its fields', needsKit, () => {
    for (const p of ['/required', '/aria-required', '/elsewhere']) assert.equal(run.ids(p).includes('form-without-novalidate'), true, p);
    const found = run.result('/elsewhere').violations.find((v) => v.id === 'form-without-novalidate');
    assert.deepEqual(found.nodes, ['form#far (required: Email)'], 'a field tied to the form from outside it counts');
    for (const p of ['/novalidate', '/optional', '/no-form']) assert.equal(run.ids(p).includes('form-without-novalidate'), false, p);
  });
});
