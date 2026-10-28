import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { judgeRound, roundMarkdown, findDetector, collectPages, runDetector, reflowPages, BAR, WIDTHS, REFLOW_WIDTH } from '../scripts/productgates.mjs';

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

  test('the record says which axe rules boards skipped, and that the routes ran them', () => {
    const g = clean();
    g.axe.skipped = { kinds: ['component', 'board'], rules: ['landmark-no-duplicate-main', 'landmark-main-is-top-level', 'landmark-unique'] };
    const md = roundMarkdown(g, judgeRound(g), { system: { name: 'Acme' } });
    assert.match(md, /axe ran every rule on the routes\. On component pages and board pages, which show a page frame more than once, it skipped landmark-no-duplicate-main, landmark-main-is-top-level, landmark-unique\./);
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

