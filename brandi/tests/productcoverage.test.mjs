import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { canvasCoverage, surfacePrefix, boardWidth, moduleWords, DEFAULT_WIDTHS, CORE_PAGES } from '../scripts/productcoverage.mjs';
import { judgeRound, roundMarkdown, WIDTHS } from '../scripts/productgates.mjs';

const surfaces = [
  { name: 'Ops console', boards: 'Console', widths: [1440, 820, 390], modules: ['Rosters', 'Opening hours', 'Menu'] },
  { name: 'Staff app', boards: 'Staff', widths: [390] },
  { name: 'Email and messaging', boards: 'Mail', widths: [600] },
];
const files = [
  'Main.dc.html', 'ComponentsActions1440.dc.html',
  'ConsoleHome1440.dc.html', 'ConsoleHome1440Dark.dc.html', 'ConsoleHome390.dc.html', 'ConsoleShell820.dc.html', 'ConsoleMenu1440.dc.html',
  'ConsoleRostersStates1440.dc.html', 'ConsoleOpeningHoursWeekStates1440.dc.html',
  'StaffShift390.dc.html',
  '_probe1440.dc.html',
];

describe('the canvas covers every surface the product ships on', () => {
  test('a board name gives its width, the last number before Dark, and a surface its prefix', () => {
    assert.equal(boardWidth('ConsoleRosters1440Dark.dc.html'), 1440);
    assert.equal(boardWidth('ConsoleRostersC820.dc.html'), 820);
    assert.equal(boardWidth('Main.dc.html'), null);
    assert.equal(surfacePrefix({ name: 'Ops console', boards: 'Console' }), 'Console');
    assert.equal(surfacePrefix({ name: 'In-store tablet tool' }), 'InStoreTabletTool', 'the name in PascalCase when it gives none');
    assert.deepEqual(moduleWords('Opening hours'), ['Opening', 'hours']);
    assert.deepEqual(moduleWords('Menu'), ['Menu'], 'a module of short words is named whole');
    assert.deepEqual(DEFAULT_WIDTHS, [...WIDTHS]);
  });

  test('a surface wants a board at each of its widths and a states board for each module, and says what is missing', () => {
    const cov = canvasCoverage({ surfaces, files });
    const by = Object.fromEntries(cov.surfaces.map((s) => [s.name, s]));
    assert.deepEqual(by['Ops console'].missing, ['no states board for the Menu module (a board named Console, a word of Menu, then States, as ConsoleMenuStates1440)']);
    assert.equal(by['Ops console'].boards, 7, 'ConsoleMenu1440 is a page of the Menu module, not its states board');
    assert.deepEqual(by['Staff app'].missing, []);
    assert.deepEqual(by['Email and messaging'].missing, ['no board at all: name each one Mail, its screen, then its width, as MailHome600']);
    assert.equal(cov.covered, false);
  });

  test('a board belongs to the longest prefix it carries, and only at a word boundary', () => {
    const cov = canvasCoverage({
      surfaces: [{ name: 'App', boards: 'App', widths: [390] }, { name: 'App staff', boards: 'AppStaff', widths: [820] }],
      files: ['AppStaffShift820.dc.html', 'ApplesHome390.dc.html'],
    });
    assert.deepEqual(cov.surfaces.map((s) => s.boards), [0, 1], 'AppStaff boards are not App boards, and Apples is not App');
  });

  test('a surface says which modules drew options and which reused a written pattern, read from the option boards\' letters', () => {
    const drawn = [...files, 'ConsoleRostersA1440.dc.html', 'ConsoleRostersB1440.dc.html', 'ConsoleRostersC1440.dc.html', 'ConsoleRostersD1440.dc.html', 'ConsoleRostersB1440Dark.dc.html', 'ConsoleMenuA1440.dc.html', 'ConsoleRostersStatesA1440.dc.html'];
    const consoleSurface = canvasCoverage({ surfaces, files: drawn }).surfaces[0];
    assert.deepEqual(consoleSurface.options, [{ module: 'Rosters', letters: ['A', 'B', 'C', 'D'] }]);
    assert.deepEqual(consoleSurface.reused, ['Opening hours', 'Menu'], 'one lettered board is not a set of options');
    assert.deepEqual(canvasCoverage({ surfaces, files: drawn }).surfaces[1].options, [], 'a surface with no modules has none to say');
  });

  test('two surfaces with one prefix are reported, since each would count the other\'s boards', () => {
    const cov = canvasCoverage({ surfaces: [{ name: 'A', boards: 'Console', widths: [1440] }, { name: 'B', boards: 'Console', widths: [1440] }], files: ['ConsoleHome1440.dc.html'] });
    assert.deepEqual(cov.surfaces[1].missing, ['its prefix Console is also A\'s: give each surface its own boards prefix']);
  });

  test('without widths a surface is held to the three checked widths, and no surfaces at all is not covered', () => {
    const cov = canvasCoverage({ surfaces: [{ name: 'Portal', boards: 'Portal' }], files: ['PortalHome1440.dc.html'] });
    assert.deepEqual(cov.surfaces[0].widths, [1440, 820, 390]);
    assert.deepEqual(cov.surfaces[0].missing, ['no board at 820', 'no board at 390']);
    const none = canvasCoverage({ surfaces: [], files });
    assert.equal(none.covered, false);
    assert.match(none.skipped, /product\.json lists no surfaces/);
  });
});

describe('the core pages a surface with modules shows', () => {
  // A run drew no create and edit screen at all and met the bar: coverage checked widths and states boards only, and
  // its craft review then lost points on error prevention and user control, which those screens carry.
  const app = (pages) => ({ name: 'Ops console', boards: 'Console', widths: [1440], modules: ['Rosters'], pages });
  const drawn = ['Main.dc.html', 'ConsoleHome1440.dc.html', 'ConsoleRosters1440.dc.html', 'ConsoleRoster1440.dc.html', 'ConsoleRostersStates1440.dc.html', 'ConsoleReport1440.dc.html', 'ConsoleSettings1440.dc.html', 'ConsoleRosterEdit1440Dark.dc.html', 'ConsoleSignIn1440.dc.html', 'StaffHome390.dc.html'];
  const all = {
    Home: 'ConsoleHome1440', Records: 'ConsoleRosters1440', 'List and detail': { skip: 'no queue: each roster is opened from its list' },
    Record: 'ConsoleRoster1440.dc.html', Report: 'ConsoleReport1440', Settings: 'ConsoleSettings1440', 'Create and edit': 'ConsoleRosterEdit1440Dark',
    Setup: { skip: 'stores are set up by head office, outside the product' }, 'the assistant': { skip: 'the console has no assistant yet' }, 'Sign in': 'ConsoleSignIn1440',
  };

  test('the patterns are the ten 04-written-system.md teaches, in its order, so the gate and the written system say the same thing', async () => {
    const text = await readFile(new URL('../skills/product-system/references/04-written-system.md', import.meta.url), 'utf8');
    const block = text.slice(text.indexOf('The ten core patterns:'), text.indexOf('A product that needs a page none of these covers'));
    assert.deepEqual([...block.matchAll(/^ {2}- \*([^*]+?)\.?\*/gm)].map((m) => m[1]), [...CORE_PAGES]);
  });

  test('each pattern named on a board of the surface or skipped with a reason covers it, and the skips keep their reasons', () => {
    const s = canvasCoverage({ surfaces: [app(all)], files: drawn }).surfaces[0];
    assert.deepEqual(s.missing, []);
    assert.deepEqual(s.core.named.map((n) => `${n.pattern} ${n.board}`), ['Home ConsoleHome1440', 'Records ConsoleRosters1440', 'Record ConsoleRoster1440', 'Report ConsoleReport1440', 'Settings ConsoleSettings1440', 'Create and edit ConsoleRosterEdit1440Dark', 'Sign in ConsoleSignIn1440']);
    assert.deepEqual(s.core.skipped, [
      { pattern: 'List and detail', reason: 'no queue: each roster is opened from its list' },
      { pattern: 'Setup', reason: 'stores are set up by head office, outside the product' },
      { pattern: 'The assistant', reason: 'the console has no assistant yet' },
    ], 'a key is matched without its case or a leading "the"');
  });

  test('a pattern neither named nor skipped, named on a board not on the canvas or of another surface, or skipped with no reason fails, as does a name that is no pattern', () => {
    const { 'Create and edit': _ce, Report: _r, ...rest } = all;
    const pages = { ...rest, Settings: 'ConsoleSettings820', Home: 'StaffHome390', Setup: { skip: ' ' }, Help: 'ConsoleHome1440' };
    const cov = canvasCoverage({ surfaces: [app(pages), { name: 'Staff app', boards: 'Staff', widths: [390] }], files: drawn });
    assert.equal(cov.covered, false);
    assert.deepEqual(cov.surfaces[0].missing, [
      'core pages neither named nor skipped: Report, Create and edit (under the surface\'s pages in product.json, name the board that shows each, as "Report": "ConsoleReport1440", or skip it with { "skip": "why the surface has none" })',
      'Home is named on StaffHome390, which is not a Console board',
      'Settings is named on ConsoleSettings820, which is not on the canvas',
      'Setup is skipped with no reason: say why the surface has none',
      'pages names Help, which is not a core pattern (04-written-system.md, Screen patterns: Home, Records, List and detail, Record, Report, Settings, Create and edit, Setup, The assistant, Sign in)',
    ]);
    assert.deepEqual(cov.surfaces[1].missing, [], 'the other surface is listed apart');
  });

  test('a surface with modules and no pages is still covered, its core pages unchecked; one with neither has nothing to check', () => {
    const cov = canvasCoverage({ surfaces: [app(undefined), { name: 'Staff app', boards: 'Staff', widths: [390] }], files: drawn });
    assert.equal(cov.covered, true);
    assert.deepEqual(cov.surfaces[0].core, { unchecked: true, named: [], skipped: [], missing: [] });
    assert.equal(cov.surfaces[1].core, null);
    const opted = canvasCoverage({ surfaces: [{ name: 'Staff app', boards: 'Staff', widths: [390], pages: { Home: 'StaffHome390' } }], files: drawn }).surfaces[0];
    assert.match(opted.missing[0] ?? '', /^core pages neither named nor skipped: Records, List and detail/, 'a surface that names its pages is held to all ten');
  });
});

describe('coverage as a gate', () => {
  const clean = () => ({
    round: 2, at: '2026-10-29T00:00:00.000Z', widths: [...WIDTHS],
    versions: { detector: { version: '1' }, 'axe-core': '4', playwright: '1' },
    tokens: { summary: 'ok', fails: 0 }, drift: { differences: [], unchecked: [] },
    detector: { pages: 1, findings: [], errors: [], skipped: null }, axe: { pages: 1, violations: 0, errors: 0, results: [] }, checks: { passed: 1, failed: [] },
  });

  test('a surface missing a width or a states board fails the round, and the record lists what is missing by surface', () => {
    const g = clean();
    g.coverage = canvasCoverage({ surfaces, files });
    const judged = judgeRound(g);
    const verdict = judged.verdicts.find((v) => v.gate === 'Coverage');
    assert.equal(verdict.pass, false);
    assert.match(verdict.detail, /^1 of 3 surfaces covered; missing: Ops console \(1\), Email and messaging \(1\); core pages unchecked on Ops console until product\.json names them$/);
    const md = roundMarkdown(g, judged);
    assert.match(md, /## Coverage\n\n- Ops console \(Console\*, 7 boards\): no states board for the Menu module/);
    assert.match(md, /- Staff app \(Staff\*, 1 board\): covered at 390\n/);
  });

  test('the record says, surface by surface, which modules drew options A to D and which reused a written pattern', () => {
    const g = clean();
    g.coverage = canvasCoverage({ surfaces: surfaces.slice(0, 1), files: [...files, 'ConsoleMenuStates1440.dc.html', ...['A', 'B', 'C', 'D'].map((l) => `ConsoleOpeningHours${l}1440.dc.html`)] });
    const md = roundMarkdown(g, judgeRound(g));
    assert.match(md, /- Ops console \(Console\*, 12 boards\): covered at 1440, 820, 390, with a states board for Rosters, Opening hours, Menu; options A to D for Opening hours; a written pattern reused for Rosters, Menu; core pages unchecked until product\.json names them \(06-canvas\.md\)\n/);
  });

  test('the record prints each core page on its board and each skip with its reason, and the Coverage line says which surfaces left them unchecked', () => {
    const named = { name: 'Ops console', boards: 'Console', widths: [1440], modules: ['Menu'], pages: {
      Home: 'ConsoleHome1440', Records: 'ConsoleMenu1440', 'List and detail': { skip: 'no queue.' }, Record: 'ConsoleMenu1440', Report: { skip: 'figures live in the head office tool' },
      Settings: 'ConsoleShell820', 'Create and edit': 'ConsoleMenu1440', Setup: { skip: 'set up by head office' }, 'The assistant': { skip: 'none yet' }, 'Sign in': 'ConsoleHome390' } };
    const g = clean();
    g.coverage = canvasCoverage({ surfaces: [named, { name: 'Tablet tool', boards: 'Staff', widths: [390], modules: ['Shifts'] }], files: [...files, 'ConsoleMenuStates1440.dc.html', 'StaffShiftsStates390.dc.html'] });
    const judged = judgeRound(g);
    const verdict = judged.verdicts.find((v) => v.gate === 'Coverage');
    assert.equal(verdict.pass, true, 'unchecked is not missing');
    assert.equal(verdict.detail, '2 of 2 surfaces covered; core pages unchecked on Tablet tool until product.json names them');
    const md = roundMarkdown(g, judged);
    assert.match(md, /- Ops console \(Console\*, \d+ boards\): covered at 1440, with a states board for Menu; a written pattern reused for Menu\n {2}- Core pages: Home on ConsoleHome1440, Records on ConsoleMenu1440, Record on ConsoleMenu1440, Settings on ConsoleShell820, Create and edit on ConsoleMenu1440, Sign in on ConsoleHome390\n {2}- Skipped: List and detail \(no queue\), Report \(figures live in the head office tool\), Setup \(set up by head office\), The assistant \(none yet\)\n/);
    assert.match(md, /- Tablet tool \(Staff\*, 2 boards\): covered at 390, with a states board for Shifts; a written pattern reused for Shifts; core pages unchecked until product.json names them \(06-canvas\.md\)\n/);
  });

  test('a covered canvas passes, and a round from before the gate has no line for it', () => {
    const g = clean();
    g.coverage = canvasCoverage({ surfaces: surfaces.slice(1, 2), files });
    assert.equal(judgeRound(g).verdicts.find((v) => v.gate === 'Coverage').pass, true);
    assert.equal(judgeRound(clean()).verdicts.some((v) => v.gate === 'Coverage'), false);
  });
});
