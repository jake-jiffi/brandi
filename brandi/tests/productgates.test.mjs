import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, symlinkSync } from 'node:fs';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import os from 'node:os';
import path from 'node:path';

import { axeGate, judgeRound, roundMarkdown, publishedSection, findDetector, collectPages, runDetector, reflowPages, sizeGate, BAR, WIDTHS, REFLOW_WIDTH, MACHINE_GATES } from '../scripts/productgates.mjs';
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
// Every score under 4 carries what cost the point, as the Craft gate asks (08-quality-gates.md, The round record).
const critique = (scores, findings = []) => ({ heuristics: scores.map((score, i) => ({ name: `H${i + 1}`, score, ...(score < 4 && { note: `ConsoleHome1440: what cost H${i + 1} its point` }) })), findings });
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

  test("the gates' printed summary carries every machine gate the round judges, the canvas runtime and board sizes included", () => {
    const g = clean();
    g.runtime = { boards: 1, failed: [] };
    g.sizes = { boards: 1, off: [], clipped: [], errors: [] };
    g.coverage = { covered: true, surfaces: [] };
    const machine = judgeRound(g).verdicts.map((v) => v.gate).filter((gate) => !['Craft', 'Rules'].includes(gate));
    assert.deepEqual(machine.filter((gate) => !MACHINE_GATES.includes(gate)), [], 'a verdict the summary would leave out');
    assert.ok(MACHINE_GATES.includes('Canvas runtime'));
  });

  test("every board's frame is held to its content, and a box that hides content fails the round, each named in the record", () => {
    const measured = {
      ConsoleHome1440: 1460, ConsoleSignIn1440: 700, MessagingReady600: 497, AppCheckout390: 844, ConsoleStates1440: 1878, Broken1440: { error: 'the board did not render: boom' },
      __sections: {}, __clipped: { AppCheckout390: [{ what: 'card', shown: 327, content: 371, text: '[Northside], pick-up' }] },
    };
    const boards = [
      { label: 'ConsoleHome1440', width: 1440, declared: 900, fluid: true },
      { label: 'ConsoleSignIn1440', width: 1440, declared: 900, fluid: true },
      { label: 'MessagingReady600', width: 600, declared: 600, fluid: false },
      { label: 'AppCheckout390', width: 390, declared: 844, fluid: false },
      { label: 'ConsoleStates1440', width: 1440, declared: 1878, fluid: false },
      { label: 'Broken1440', width: 1440, declared: 900, fluid: false },
    ];
    const sizes = sizeGate({ measured, boards });
    assert.deepEqual(sizes.off, [
      { board: 'ConsoleHome1440', declared: 900, want: 1460, fit: 'clipped' },
      { board: 'MessagingReady600', declared: 600, want: 497, fit: 'blank' },
    ], 'a page under its window is held to the window, not to its content');
    assert.deepEqual(sizes.heights, { ConsoleHome1440: 1460, ConsoleSignIn1440: 900, MessagingReady600: 497, AppCheckout390: 844, ConsoleStates1440: 1878 });
    assert.deepEqual(sizes.errors, [{ board: 'Broken1440', error: 'the board did not render: boom' }]);
    const g = clean();
    g.sizes = sizes;
    const judged = judgeRound(g);
    const verdict = judged.verdicts.find((v) => v.gate === 'Board sizes');
    assert.equal(verdict.pass, false);
    assert.equal(verdict.detail, '2 of 6 frames off their content (1 clipped, 1 blank); 1 board hides content in a box that clips it; 1 not measured');
    const md = roundMarkdown(g, judged);
    assert.match(md, /## Board sizes\n/);
    assert.match(md, /- ConsoleHome1440: frame 900px, content 1460px \(clipped\)/);
    assert.match(md, /- AppCheckout390: card "\[Northside\], pick-up" shows 327px of 371px/);
    assert.match(md, /- Broken1440: not measured \(the board did not render: boom\)/);
    assert.match(md, /brandi product boards --heights/);
    g.sizes = sizeGate({ measured: { ConsoleStates1440: 1878, __clipped: {} }, boards: boards.filter((b) => b.label === 'ConsoleStates1440') });
    assert.equal(judgeRound(g).verdicts.find((v) => v.gate === 'Board sizes').pass, true);
    assert.equal(judgeRound(g).verdicts.find((v) => v.gate === 'Board sizes').detail, 'every frame fits its content on 1 board, and nothing on a board hides its own content');
    assert.match(sizeGate({ measured: { ConsoleStates1440: 1878, __sections: {} }, boards }).skipped, /measure-boards\.mjs.*--kit/, "a starter's older tool says to refresh the kit");
    assert.equal(judgeRound(clean()).verdicts.some((v) => v.gate === 'Board sizes'), false, 'a round from before the gate has no line for it');
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

describe('what the round record holds about the reviews', () => {
  const scores = [4, 4, 4, 4, 4, 4, 4, 3, 3, 3];
  const reviewed = () => ({
    critique: {
      method: 'single-context, isolation by procedure: each gate started from the evidence',
      heuristics: scores.map((score, i) => ({ name: `H${i + 1}`, score })),
      findings: [
        { id: 'C1', severity: 'P3', title: 'Title clipped at 390', status: 'open', where: 'AcmeHome390', evidence: 'shots/home-390.png, the title ends in an ellipsis.', owner: 'Sam', class: 'kit' },
        { id: 'C2', severity: 'P2', title: '14px body on phones', status: 'accepted', reason: 'Interface text stays 14px on phones, as the README records', class: 'brand only' },
        { id: 'C3', severity: 'P1', title: 'Focus lost after approve', status: 'fixed', evidence: 'keyboard path: Approve, then Tab lands on the next row' },
        { id: 'C4', severity: 'P3', title: 'Tight gap in the rail', status: 'open' },
      ],
    },
    rules: { method: 'ui-ux-pro-max rules by domain and stack, single-context', findings: [{ severity: 'Low', title: 'Long label wraps', status: 'open', where: 'Settings', owner: 'Jo' }] },
  });

  test('each review says how it ran, and each finding where, its evidence, its owner and its class', () => {
    const { critique: c, rules: r } = reviewed();
    const md = roundMarkdown(clean(), judgeRound(clean(), { critique: c, rules: r }), { critique: c, rules: r });
    assert.match(md, /## Craft critique\n\nHow it ran: single-context, isolation by procedure: each gate started from the evidence\n/);
    assert.match(md, /## Rules review\n\nHow it ran: ui-ux-pro-max rules by domain and stack, single-context\n/);
    assert.match(md, /- P3: Title clipped at 390 \(open\)\. Where: AcmeHome390\. Evidence: shots\/home-390\.png, the title ends in an ellipsis\. Owner: Sam\. Class: kit\.\n/);
    assert.match(md, /- P1: Focus lost after approve \(fixed\)\. Evidence: keyboard path: Approve, then Tab lands on the next row\.\n/);
    assert.match(md, /- Low: Long label wraps \(open\)\. Where: Settings\. Owner: Jo\.\n/);
  });

  test('accepted deviations are listed with their reasons, and what is still open with its owner', () => {
    const { critique: c, rules: r } = reviewed();
    const md = roundMarkdown(clean(), judgeRound(clean(), { critique: c, rules: r }), { critique: c, rules: r });
    assert.match(md, /## Accepted deviations\n\n- Craft P2: 14px body on phones\. Interface text stays 14px on phones, as the README records\.\n/);
    assert.match(md, /## Still open\n\n- Craft P3: Title clipped at 390\. Owner: Sam\.\n- Craft P3: Tight gap in the rail\. Owner: none named\.\n- Rules Low: Long label wraps\. Owner: Jo\.\n/);
  });

  test('a heuristic under 4 carries a note naming what cost the point, printed beside its score; one without fails the Craft gate, named', () => {
    // A run scored five heuristics 3 of 4 with no reason for any: nobody could tell where the points went, or what
    // the next round should fix. Naming them failed nothing, so a score with no reason could still meet the bar.
    const c = reviewed().critique;
    c.heuristics[7].note = 'AcmeHome390 | the title clipped at 390 (C1)';
    c.heuristics[8].note = '  ';
    const judged = judgeRound(clean(), { critique: c, rules: rules([]) });
    const craft = judged.verdicts.find((v) => v.gate === 'Craft');
    assert.equal(craft.pass, false, 'a lost point with no reason cannot be acted on in the next round');
    assert.equal(judged.met, false);
    assert.match(craft.detail, /; under 4 with no note on what cost the point: H9, H10$/);
    const md = roundMarkdown(clean(), judged, { critique: c });
    assert.match(md, /\| Heuristic \| Score \| What cost the point \|\n\| --- \| --- \| --- \|\n\| H1 \| 4 \|  \|\n/);
    assert.match(md, /\| H8 \| 3 \| AcmeHome390 \\\| the title clipped at 390 \(C1\) \|\n\| H9 \| 3 \|  \|/);
    for (const h of c.heuristics) h.note ??= 'evidence';
    c.heuristics[8].note = 'ConsoleRosters1440: the approve button sits below the fold (C3)';
    const noted = judgeRound(clean(), { critique: c, rules: rules([]) }).verdicts.find((v) => v.gate === 'Craft');
    assert.equal(noted.pass, true, 'every score under 4 has its note');
    assert.doesNotMatch(noted.detail, /no note/, 'nothing said when every score under 4 has its note');
    const full = critique([4, 4, 4, 4, 4, 4, 4, 4, 4, 4]);
    assert.equal(judgeRound(clean(), { critique: full, rules: rules([]) }).verdicts.find((v) => v.gate === 'Craft').pass, true, 'a 4 needs no note');
  });

  test('a record written before these fields still judges and prints as it did, but for a lost point with no note', () => {
    const c = critique(scores.map(() => 4), [{ severity: 'P2', title: 'Old finding', status: 'fixed' }]);
    const judged = judgeRound(clean(), { critique: c, rules: rules([]) });
    assert.equal(judged.met, true);
    const old = { heuristics: scores.map((score, i) => ({ name: `H${i + 1}`, score })), findings: [] };
    assert.equal(judgeRound(clean(), { critique: old, rules: rules([]) }).met, false, 'a 3 from before the notes has no reason either');
    const md = roundMarkdown(clean(), judged, { critique: c, rules: rules([]) });
    assert.match(md, /\n- P2: Old finding \(fixed\)\n/);
    assert.match(md, /\| Heuristic \| Score \|\n\| --- \| --- \|\n/, 'the scores table keeps its two columns when no heuristic has a note');
    assert.doesNotMatch(md, /How it ran/);
    assert.match(md, /## Accepted deviations\n\nNone\.\n/);
    assert.match(md, /## Still open\n\nNothing\.\n/);
  });
});

describe('a detector finding accepted as a recorded deviation', () => {
  const found = () => {
    const g = clean();
    g.detector.findings.push(
      { page: 'AcmeRail1440', width: 1440, theme: 'light', rule: 'gray-on-color', selector: 'nav > p.rail-group', snippet: 'Teams' },
      { page: 'AcmeRail1440Dark', width: 1440, theme: 'dark', rule: 'gray-on-color', selector: 'nav > p.rail-group', snippet: 'Teams' },
      { page: 'AcmeHome1440', width: 820, theme: 'light', rule: 'nested-cards', selector: '.card .card', snippet: '' },
    );
    return g;
  };
  const accepted = [
    { rule: 'gray-on-color', page: 'AcmeRail', selector: 'rail-group', reason: 'The rail labels are the brand rail tint, 4.6:1, decided in pd5' },
    { rule: 'low-contrast', page: 'AcmeOld', reason: 'A board since removed' },
    { rule: 'nested-cards', page: 'AcmeHome' },
  ];

  test('a matching finding leaves the verdict and is listed with its reason; the rest still fail', () => {
    const judged = judgeRound(found(), { accepted });
    const det = judged.verdicts.find((v) => v.gate === 'Detector');
    assert.equal(det.pass, false, 'the nested cards finding is still open: its entry has no reason');
    assert.match(det.detail, /^1 finding across 120 renders/);
    assert.match(det.detail, /2 accepted as recorded deviations/);
    const md = roundMarkdown(found(), judged);
    assert.match(md, /## Detector findings\n\n- AcmeHome1440 at 820, light: nested-cards on \.card \.card/);
    assert.doesNotMatch(md.split('## Detector findings')[1].split('\n## ')[0], /gray-on-color/, 'an accepted finding is not listed as open');
    assert.match(md, /## Accepted deviations\n\n- Detector gray-on-color on AcmeRail \(selector rail-group\), 2 findings: The rail labels are the brand rail tint, 4\.6:1, decided in pd5\.\n/);
  });

  test('an entry that matches nothing, or has no reason, is reported, so a stale one does not linger', () => {
    const judged = judgeRound(found(), { accepted });
    const det = judged.verdicts.find((v) => v.gate === 'Detector');
    assert.match(det.detail, /2 acceptances unused: low-contrast on AcmeOld matches no finding this round; nested-cards on AcmeHome needs a rule, a page and a reason/);
    assert.match(roundMarkdown(found(), judged), /Not used from product\.json "accepted":\n\n- low-contrast on AcmeOld: matches no finding this round\n- nested-cards on AcmeHome: needs a rule, a page and a reason\n/);
  });

  test('every finding accepted passes the gate, and without product.json acceptances nothing changes', () => {
    const all = judgeRound(found(), { accepted: [...accepted.slice(0, 1), { rule: 'nested-cards', page: 'AcmeHome1440', reason: 'Recorded in the fix plan' }] });
    assert.equal(all.verdicts.find((v) => v.gate === 'Detector').pass, true);
    assert.equal(judgeRound(found()).verdicts.find((v) => v.gate === 'Detector').detail.startsWith('3 findings'), true);
    const notAList = judgeRound(found(), { accepted: { rule: 'nested-cards' } }).verdicts.find((v) => v.gate === 'Detector');
    assert.match(notAList.detail, /accepted in product\.json is not a list/);
    const shadowed = judgeRound(found(), { accepted: [accepted[0], { ...accepted[0], page: 'AcmeRail1440Dark', reason: 'The dark twin too' }] }).verdicts.find((v) => v.gate === 'Detector');
    assert.match(shadowed.detail, /1 acceptance unused: gray-on-color on AcmeRail1440Dark accepts nothing an earlier entry has not/);
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

  test('product round reads product.json\'s acceptances, so a reason written after the gates counts without running them again', async () => {
    const product = await mkdtemp(path.join(os.tmpdir(), 'brandi-accepted-'));
    const round = path.join(product, 'rounds', 'round-2');
    await mkdir(round, { recursive: true });
    const g = clean();
    g.detector.findings.push({ page: 'AcmeRail1440', width: 1440, theme: 'light', rule: 'gray-on-color', selector: 'p.rail-group', snippet: 'Teams' });
    await writeFile(path.join(round, 'gates.json'), JSON.stringify(g));
    await writeFile(path.join(product, 'product.json'), JSON.stringify({ name: 'Acme', accepted: [{ rule: 'gray-on-color', page: 'AcmeRail', reason: 'The rail tint is the brand decision pd5' }] }));
    const cli = path.join(path.dirname(KIT), '..', 'scripts', 'brandi.mjs');
    spawnSync(process.execPath, [cli, 'product', 'round', '--round', '2', '--out', product], { encoding: 'utf8' });
    const md = await readFile(path.join(round, 'record.md'), 'utf8');
    assert.match(md, /\| Detector \| pass \| 0 findings across 120 renders at 1440, 820, 390, light and dark; 1 accepted as recorded deviations \|/);
    assert.match(md, /- Detector gray-on-color on AcmeRail, 1 finding: The rail tint is the brand decision pd5\./);
    const json = JSON.parse(await readFile(path.join(round, 'record.json'), 'utf8'));
    assert.deepEqual(json.accepted, [{ rule: 'gray-on-color', page: 'AcmeRail', reason: 'The rail tint is the brand decision pd5', findings: 1 }]);
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
 * Serves `page(path, hit)`'s HTML (null is a 404) on a local port, runs the kit's axe-pages.mjs (or `tool`) on the
 * pages `list(base)` gives, and returns its summary line and its record.
 */
async function axePagesOn(page, list, tool = 'axe-pages.mjs') {
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
  copyFileSync(path.join(KIT, 'tools', tool), path.join(dir, 'tools', tool));
  symlinkSync(KIT_MODULES, path.join(dir, 'node_modules'), 'dir');
  await writeFile(path.join(dir, 'pages.json'), JSON.stringify(list(`http://127.0.0.1:${server.address().port}`)));
  const out = await new Promise((resolve) => {
    const child = spawn(process.execPath, [`tools/${tool}`, '--pages', 'pages.json', '--json', 'axe.json'], { cwd: dir });
    let text = '';
    child.stdout.on('data', (d) => { text += d; });
    child.stderr.on('data', (d) => { text += d; });
    child.on('close', () => resolve(text));
  });
  server.close();
  if (!existsSync(path.join(dir, 'axe.json'))) throw new Error(`${tool} wrote no record:\n${out}`);
  const run = { hits, line: JSON.parse(out.trim().split('\n').pop()), record: JSON.parse(await readFile(path.join(dir, 'axe.json'), 'utf8')) };
  await rm(dir, { recursive: true, force: true });
  const result = (label) => run.record.results.find((r) => r.label === label);
  return { ...run, result, ids: (label) => result(label).violations.map((v) => v.id) };
}

describe('a board with no height of its own', () => {
  // A dialog drawn over its page (06-canvas.md) puts everything in a wrapper at position: absolute; inset: 0, so the
  // document has no height and html never counts as visible. Waiting for a visible html[data-dc-ready] left that
  // board unscanned at every width, by axe and by reflow, for two rounds.
  const flat = '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>A dialog</title></head><body style="margin:0"><x-dc><div style="position:absolute;inset:0;overflow:hidden"><main><h1>A dialog over its page</h1><p>Some text.</p></main></div></x-dc><script src="/runtime/dc-shim.js"></script><script>setTimeout(() => document.documentElement.setAttribute("data-dc-ready", ""), 200)</script></body></html>';
  const list = (base) => [{ kind: 'board', label: 'DialogOverPage1440', url: `${base}/flat`, width: 1440, height: 900, theme: 'light' }];
  const serve = (url) => (url === '/flat' ? flat : null);

  test('axe scans it once it says it is ready', needsKit, async () => {
    const run = await axePagesOn(serve, list);
    assert.equal(run.result('DialogOverPage1440').error, undefined, run.result('DialogOverPage1440').error);
    assert.equal(run.line.errors, 0);
  });

  test('reflow measures it once it says it is ready', needsKit, async () => {
    const run = await axePagesOn(serve, (base) => list(base).map((p) => ({ ...p, width: 320, height: 800 })), 'reflow-pages.mjs');
    assert.equal(run.result('DialogOverPage1440').error, undefined, run.result('DialogOverPage1440').error);
    assert.equal(run.result('DialogOverPage1440').overflow, false);
  });

  // A board with nothing to mount renders without the runtime, so nothing ever marks it ready: axe and reflow waited
  // for the mark on any page with <x-dc>, as measure-boards.mjs once did, and left every static board unscanned
  // after 20 seconds. Only a page that loads the shim waits, and a board the shim could not draw says so at once. A
  // board that mounts components but rendered without the runtime (React not fetched, offline) is no static board:
  // read as one, its unmounted tags would pass.
  const boards = {
    '/unmounted': '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>An unmounted board</title></head><body style="margin:0"><x-dc><main><h1>Mounts a component</h1><x-import component-from-global-scope="Acme.Button">Go</x-import></main></x-dc></body></html>',
    '/static': '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>A static board</title></head><body style="margin:0"><x-dc><main><h1>Drawn in plain markup</h1><p>Nothing to mount.</p></main></x-dc></body></html>',
    '/failed': '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>A broken board</title></head><body style="margin:0"><x-dc><main><h1>Mounts a component</h1></main></x-dc><script src="/runtime/dc-shim.js"></script><script>document.documentElement.setAttribute("data-dc-error", "boom")</script></body></html>',
  };
  const both = (base, width) => Object.keys(boards).map((p) => ({ kind: 'board', label: p, url: `${base}${p}`, width, height: 800, theme: 'light' }));

  test('a static board is scanned and measured with no ready mark; one the shim could not draw, or that rendered without it, fails at once, saying why', needsKit, async () => {
    const axe = await axePagesOn((url) => boards[url] ?? null, (base) => both(base, 1440));
    assert.equal(axe.result('/static').error, undefined, axe.result('/static').error);
    assert.match(axe.result('/failed').error ?? '', /^the board did not render: boom$/);
    assert.match(axe.result('/unmounted').error ?? '', /^the board mounts components and rendered without its runtime/);
    const reflow = await axePagesOn((url) => boards[url] ?? null, (base) => both(base, 320), 'reflow-pages.mjs');
    assert.equal(reflow.result('/static').error, undefined, reflow.result('/static').error);
    assert.equal(reflow.result('/static').overflow, false);
    assert.match(reflow.result('/failed').error ?? '', /^the board did not render: boom$/);
    assert.match(reflow.result('/unmounted').error ?? '', /^the board mounts components and rendered without its runtime/);
  });

  test('measuring a board that mounts components but rendered without its runtime fails it, where a static board is measured', needsKit, async () => {
    const out = await measureOn((url) => boards[url] ?? null, (base) => both(base, 1440));
    assert.equal(typeof out['/static'], 'number', JSON.stringify(out['/static']));
    assert.match(out['/unmounted']?.error ?? '', /^the board mounts components and rendered without its runtime/);
    assert.match(out['/failed']?.error ?? '', /^the board did not render: boom$/);
  });

  test('a page axe could not scan fails the Accessibility gate, and its line says how many', () => {
    const g = clean();
    g.axe.errors = 6;
    const verdict = judgeRound(g).verdicts.find((v) => v.gate === 'Accessibility');
    assert.equal(verdict.pass, false);
    assert.match(verdict.detail, /^axe 0 violations on 120 pages, 6 not scanned;/);
    assert.doesNotMatch(judgeRound(clean()).verdicts.find((v) => v.gate === 'Accessibility').detail, /not scanned/, 'nothing said when every page was scanned');
  });
});

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

/** Serves `page(path)`'s HTML on a local port, runs the kit's measure-boards.mjs on the pages `list(base)` gives, and returns what it prints. */
async function measureOn(page, list) {
  const server = createServer((req, res) => {
    const html = page(req.url);
    if (html === null) return res.writeHead(404).end();
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(html);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-measure-'));
  await mkdir(path.join(dir, 'tools'));
  copyFileSync(path.join(KIT, 'tools', 'measure-boards.mjs'), path.join(dir, 'tools', 'measure-boards.mjs'));
  symlinkSync(KIT_MODULES, path.join(dir, 'node_modules'), 'dir');
  await writeFile(path.join(dir, 'pages.json'), JSON.stringify(list(`http://127.0.0.1:${server.address().port}`)));
  const out = await new Promise((resolve) => {
    const child = spawn(process.execPath, ['tools/measure-boards.mjs', '--pages', 'pages.json'], { cwd: dir });
    let text = '';
    child.stdout.on('data', (d) => { text += d; });
    child.stderr.on('data', (d) => { text += d; });
    child.on('close', () => resolve(text));
  });
  server.close();
  await rm(dir, { recursive: true, force: true });
  try { return JSON.parse(out.trim().split('\n').pop()); } catch { throw new Error(`measure-boards printed no result:\n${out}`); }
}

const boardPage = (body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>A board</title><style>body { margin: 0; } p { margin: 0; line-height: 20px; }</style></head><body><div data-dc-root>${body}</div><script>setTimeout(() => document.documentElement.setAttribute("data-dc-ready", ""), 100)</script></body></html>`;
const lines = (n, word = 'Line') => Array.from({ length: n }, (_, i) => `<p>${word} ${i + 1}</p>`).join('');

describe('a board that hides its own content', () => {
  // A phone frame drawn as a flex column with main scrolling let two Cards shrink: a flex item that clips may shrink
  // below its content, so the checkout's total was cut off inside its card and no gate said so.
  const card = (n, last) => `<section data-slot="card" style="overflow: hidden; border: 1px solid; padding: 12px;">${lines(n)}<p>${last}</p></section>`;
  const phone = (inner) => `<div style="width: 390px; height: 400px; display: flex; flex-direction: column; overflow: hidden;"><header style="height: 56px;">Your booking</header>${inner}<nav style="height: 56px;">Tabs</nav></div>`;
  const pages = {
    '/squeezed': phone(`<main style="flex: 1; overflow: auto; display: flex; flex-direction: column; gap: 16px; padding: 16px;">${card(8, 'Total $42.00')}${card(8, 'Pay with')}</main>`),
    '/block': phone(`<main style="flex: 1; overflow: auto; padding: 16px;"><div style="display: flex; flex-direction: column; gap: 16px;">${card(8, 'Total $42.00')}${card(8, 'Pay with')}</div></main>`),
    '/clip': `<div style="height: 60px; overflow: clip;">${lines(6)}</div>`,
    '/allowed': [
      `<p style="width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${'A very long name '.repeat(6)}</p>`,
      `<p style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; width: 120px;">${'A very long description '.repeat(10)}</p>`,
      `<span style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap;">${lines(4)}</span>`,
      `<div style="height: 80px; overflow: auto;">${lines(10)}</div>`,
      `<div style="position: relative; height: 200px;"><div data-slot="combobox-panel" style="position: absolute; top: 0; max-height: 80px; overflow: hidden;">${lines(10, 'Option')}</div></div>`,
      `<div style="position: relative; height: 200px;"><div aria-hidden="true" inert style="position: relative; height: 100px; overflow: hidden;"><div style="height: 100px; overflow: hidden;">${lines(10)}</div></div></div>`,
    ].join(''),
  };
  let out;
  before(async () => {
    if (needsKit.skip) return;
    out = await measureOn((url) => (pages[url] ? boardPage(pages[url]) : null), (base) => Object.keys(pages).map((p) => ({ url: `${base}${p}`, label: p, width: 390, height: 844, frame: { w: 390, h: 844 } })));
  });

  test('a box that clips content taller than itself is named, with how much of it shows', needsKit, () => {
    const squeezed = out.__clipped['/squeezed'];
    assert.equal(squeezed?.length, 2, JSON.stringify(out.__clipped));
    assert.equal(squeezed[0].what, 'card');
    assert.ok(squeezed[0].shown < squeezed[0].content, 'it shows less than it holds');
    assert.match(squeezed[0].text, /^Line 1/);
    assert.equal(out.__clipped['/clip']?.length, 1, 'overflow: clip clips too');
  });

  test('the phone frame with a plain block in its main holds its cards at their height, and truncation, scrolling, the visually hidden, an overlay drawn open and a page under a scrim are left alone', needsKit, () => {
    assert.equal(out.__clipped['/block'], undefined, JSON.stringify(out.__clipped['/block']));
    assert.equal(out.__clipped['/allowed'], undefined, JSON.stringify(out.__clipped['/allowed']));
  });
});

describe('the height a board is measured at', () => {
  // A shell fills the window and its main scrolls, so a shell page measured the window (900) whatever it held, and
  // boards were left clipped or a third blank. The whole page is the shell's bars plus main's full scroll height.
  const shell = (content) => `<div data-slot="app-shell" style="height: 100dvh; display: flex; overflow: hidden;"><div style="flex: 1; min-height: 0; display: flex; flex-direction: column;"><div style="height: 56px; flex-shrink: 0;">Top bar</div><main data-slot="app-shell-main" style="flex: 1; min-height: 0; overflow-y: auto;"><div style="height: ${content}px;">Page</div></main></div></div>`;
  const pages = {
    '/long': shell(1500),
    '/short': shell(300),
    '/email': '<div style="width: 600px; height: 497px;">An email</div>',
    '/framed': `<div style="width: 390px; height: 844px; overflow: auto;">${shell(1500)}</div>`,
    '/dialog': '<div style="position: absolute; inset: 0; overflow: hidden;"><p>A dialog over its page</p></div>',
    // Main's content keeps a window's height of its own and adds a footer under it, so main always scrolls by the
    // footer: growing the window does not help, and the page is measured once grown, not four times.
    '/scaling': shell(0).replace('<div style="height: 0px;">Page</div>', '<div style="min-height: 100%;">Page</div><div style="height: 200px;">Footer</div>'),
  };
  let out;
  before(async () => {
    if (needsKit.skip) return;
    out = await measureOn((url) => (pages[url] ? boardPage(pages[url]) : null), (base) => Object.keys(pages).map((p) => ({ url: `${base}${p}`, label: p, width: p === '/email' ? 600 : 1440, height: p === '/framed' ? 844 : 900 })));
  });

  test("a shell page measures its bars plus main's whole scroll height, and never less than the window", needsKit, () => {
    assert.equal(out['/long'], 1556);
    assert.equal(out['/short'], 900);
    assert.equal(out['/scaling'], 1100, 'a page whose content grows with the window is grown once');
  });

  test('a board with a height of its own measures that height, a shell framed inside one included, and a board with none is still measured', needsKit, () => {
    assert.equal(out['/email'], 497);
    assert.equal(out['/framed'], 844);
    assert.equal(typeof out['/dialog'], 'number', JSON.stringify(out['/dialog']));
  });
});

describe('axe on a value drawn as text', () => {
  // A text node that is one hole draws its value as it is, an element included. Two holes in one text node, or a
  // hole with words beside it, are joined as a string, and an element in either reads "[object Object]". A board
  // showed "[object Object][object Object]" where a week and a save row belonged, and every gate passed it.
  const pages = {
    '/joined': '<div>[object Object][object Object]</div>',
    '/attribute': '<button aria-label="Save [object Object]">Save</button>',
    '/script': '<p>Fine.</p><script type="text/x-dc">const said = "[object Object]";</script>',
    '/clean': '<p>Week of 3 November</p><button>Save</button>',
  };
  let run;
  before(async () => {
    if (needsKit.skip) return;
    run = await axePagesOn(
      (url) => (pages[url] ? pageOf(`<h1>A board</h1>${pages[url]}`) : null),
      (base) => Object.keys(pages).map((p) => ({ kind: 'board', label: p, url: `${base}${p}`, width: 1440, height: 900, theme: 'light' }))
    );
  });

  test('a board whose text or an attribute reads [object Object] fails, naming where; a script or a clean page does not', needsKit, () => {
    const found = (label) => run.result(label).violations.find((v) => v.id === 'object-as-text');
    assert.deepEqual(found('/joined')?.nodes, ['div: [object Object][object Object]']);
    assert.deepEqual(found('/attribute')?.nodes, ['button aria-label="Save [object Object]"']);
    assert.equal(found('/script'), undefined, 'a script is not text on the board');
    assert.equal(found('/clean'), undefined);
  });
});

describe('axe on a states strip of phone frames', () => {
  // One device frame per state (06-canvas.md, section 3) puts a top bar's header in every frame: at the top level each
  // is a banner, and the strip's title and captions sit outside every landmark. A run's strip failed axe on 65 region
  // nodes and 4 duplicate banners. Each frame in a <section aria-label>, and the title in the strip's own header, is
  // the markup 06 gives: a header inside a section is no banner.
  const frame = (state, wrap) => {
    const inner = `<div style="height: 64px;"><h2>${state}</h2><p>Say what to do next.</p></div>
<div style="width: 390px; height: 844px; display: flex; flex-direction: column; overflow: hidden;">
<header style="height: 56px;"><a href="#">Back</a> Your booking</header>
<main style="flex: 1; overflow: auto; padding: 16px;"><div style="display: flex; flex-direction: column; gap: 16px;"><p>${state}.</p></div></main>
<nav aria-label="App"><a href="#">Home</a> <a href="#">Menu</a></nav>
</div>`;
    return wrap ? `<section aria-label="${state}" style="width: 390px;">${inner}</section>` : `<div style="width: 390px;">${inner}</div>`;
  };
  const states = ['Bookings, nothing yet', 'Bookings, loading', 'Payment, card declined'];
  const strip = (wrap) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Booking states</title></head><body style="margin: 0;"><div style="display: flex; flex-direction: column;">
${wrap ? '<header style="height: 48px;"><h1>App · Bookings, states</h1></header>' : '<h1>App · Bookings, states</h1>'}
<div style="display: flex; gap: 40px;">${states.map((s) => frame(s, wrap)).join('\n')}</div></div></body></html>`;
  let run;
  before(async () => {
    if (needsKit.skip) return;
    run = await axePagesOn(
      (url) => (url === '/strip' ? strip(true) : url === '/bare' ? strip(false) : null),
      (base) => ['/strip', '/bare'].map((p) => ({ kind: 'board', label: p, url: `${base}${p}`, width: 1310, height: 964, theme: 'light' }))
    );
  });

  test('frames in labelled sections under a header pass; bare frames fail on region and duplicate banners', needsKit, () => {
    assert.deepEqual(run.ids('/strip'), [], JSON.stringify(run.result('/strip').violations));
    assert.ok(run.ids('/bare').includes('region'), run.ids('/bare').join(', '));
    assert.ok(run.ids('/bare').includes('landmark-no-duplicate-banner'), run.ids('/bare').join(', '));
  });
});
