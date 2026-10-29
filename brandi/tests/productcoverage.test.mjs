import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { canvasCoverage, surfacePrefix, boardWidth, moduleWords, DEFAULT_WIDTHS } from '../scripts/productcoverage.mjs';
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
    assert.match(verdict.detail, /^1 of 3 surfaces covered; missing: Ops console \(1\), Email and messaging \(1\)$/);
    const md = roundMarkdown(g, judged);
    assert.match(md, /## Coverage\n\n- Ops console \(Console\*, 7 boards\): no states board for the Menu module/);
    assert.match(md, /- Staff app \(Staff\*, 1 board\): covered at 390\n/);
  });

  test('a covered canvas passes, and a round from before the gate has no line for it', () => {
    const g = clean();
    g.coverage = canvasCoverage({ surfaces: surfaces.slice(1, 2), files });
    assert.equal(judgeRound(g).verdicts.find((v) => v.gate === 'Coverage').pass, true);
    assert.equal(judgeRound(clean()).verdicts.some((v) => v.gate === 'Coverage'), false);
  });
});
