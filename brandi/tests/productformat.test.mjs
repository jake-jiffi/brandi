import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { formatNumber, formatTime, formatTimeRange, NUMBER_STYLES } from '../product/kit/lib/format.js';

// The kit's one formatter: the starter imports it and the canvas bundle is built from it, so this
// table is the parity proof for both. 7 styles by 17 values, the reference build's 119 cases.
const VALUES = [0, -0, 1, -1, 0.5, 1.005, 0.004, 0.005, 12.5, 1234.5, -1200, 2490, 36120, 1250000, 1e12, null, NaN];
const TABLE = {
  "number": [
    "0",
    "0",
    "1",
    "-1",
    "0.5",
    "1.01",
    "0",
    "0.01",
    "12.5",
    "1,234.5",
    "-1,200",
    "2,490",
    "36,120",
    "1,250,000",
    "1,000,000,000,000",
    "",
    ""
  ],
  "currency": [
    "$0",
    "$0",
    "$1",
    "-$1",
    "$0.50",
    "$1.01",
    "$0",
    "$0.01",
    "$12.50",
    "$1,234.50",
    "-$1,200",
    "$2,490",
    "$36,120",
    "$1,250,000",
    "$1,000,000,000,000",
    "",
    ""
  ],
  "compact": [
    "0",
    "0",
    "1",
    "-1",
    "0.5",
    "1",
    "0.004",
    "0.005",
    "13",
    "1.2K",
    "-1.2K",
    "2.5K",
    "36K",
    "1.3M",
    "1T",
    "",
    ""
  ],
  "compact-currency": [
    "$0",
    "$0",
    "$1",
    "-$1",
    "$0.5",
    "$1",
    "$0.004",
    "$0.005",
    "$13",
    "$1.2K",
    "-$1.2K",
    "$2.5K",
    "$36K",
    "$1.3M",
    "$1T",
    "",
    ""
  ],
  "percent": [
    "0%",
    "0%",
    "1%",
    "-1%",
    "0.5%",
    "1%",
    "0%",
    "0%",
    "12.5%",
    "1,234.5%",
    "-1,200%",
    "2,490%",
    "36,120%",
    "1,250,000%",
    "1,000,000,000,000%",
    "",
    ""
  ],
  "points": [
    "0 pts",
    "0 pts",
    "1 pt",
    "-1 pt",
    "0.5 pts",
    "1 pt",
    "0 pts",
    "0 pts",
    "12.5 pts",
    "1,234.5 pts",
    "-1,200 pts",
    "2,490 pts",
    "36,120 pts",
    "1,250,000 pts",
    "1,000,000,000,000 pts",
    "",
    ""
  ],
  "hours": [
    "0 h",
    "0 h",
    "1 h",
    "-1 h",
    "0.5 h",
    "1.01 h",
    "0 h",
    "0.01 h",
    "12.5 h",
    "1,234.5 h",
    "-1,200 h",
    "2,490 h",
    "36,120 h",
    "1,250,000 h",
    "1,000,000,000,000 h",
    "",
    ""
  ]
};

describe('the number formatter', () => {
  test('the contract\'s own examples', () => {
    assert.equal(formatNumber(1234.5, 'number'), '1,234.5');
    assert.equal(formatNumber(2490.5, 'currency'), '$2,490.50');
    assert.equal(formatNumber(2490, 'currency'), '$2,490', 'cents only when there are cents');
    assert.equal(formatNumber(1300, 'compact'), '1.3K');
    assert.equal(formatNumber(36120, 'compact-currency'), '$36K');
    assert.equal(formatNumber(12.5, 'percent'), '12.5%', 'percentage points, never multiplied by 100');
    assert.equal(formatNumber(0.8, 'percent'), '0.8%', 'the round 1 defect: 0.8% was shown as 80%');
    assert.equal(formatNumber(3, 'points'), '3 pts');
    assert.equal(formatNumber(1, 'points'), '1 pt');
    assert.equal(formatNumber(37.75, 'hours'), '37.75 h');
    assert.equal(formatNumber(-1200, 'currency'), '-$1,200', 'negative money is -$1,200, never ($1,200)');
  });

  test('missing and non-finite values format to nothing, never NaN or 0', () => {
    for (const style of NUMBER_STYLES) {
      for (const v of [null, undefined, '', NaN, Infinity, -Infinity, 'twelve']) assert.equal(formatNumber(v, style), '', `${style} ${String(v)}`);
    }
  });

  test('a value that rounds to zero is never shown as -0', () => {
    // The fixed-place styles round -0.001 away; the compact ones keep significant digits, so for them
    // only a true zero is zero.
    for (const style of ['number', 'currency', 'percent', 'points', 'hours']) {
      assert.equal(/^-|^-\$/.test(formatNumber(-0.001, style)), false, style);
    }
    for (const style of ['compact', 'compact-currency']) assert.equal(formatNumber(-0, style).startsWith('-'), false, style);
  });

  test('every style against every value: 119 cases, unchanged', () => {
    let cases = 0;
    for (const style of NUMBER_STYLES) {
      VALUES.forEach((v, i) => { assert.equal(formatNumber(v, style), TABLE[style][i], `${style} ${String(v)}`); cases++; });
    }
    assert.equal(cases, 119);
  });

  test('the type file names exactly the styles the formatter knows', async () => {
    const dts = await readFile(new URL('../product/kit/lib/format.d.ts', import.meta.url), 'utf8');
    const declared = /export type NumberStyle = ([^\n]+)/.exec(dts)[1].match(/"([a-z-]+)"/g).map((s) => s.slice(1, -1));
    assert.deepEqual(declared, [...NUMBER_STYLES]);
  });
});

describe('the time formatter', () => {
  const at = (h, m) => new Date(2026, 0, 5, h, m);
  test("the kit's own way: minutes kept, a space before am or pm", () => {
    assert.equal(formatTime(570), '9:30 am', 'minutes after midnight');
    assert.equal(formatTime(at(9, 0)), '9:00 am');
    assert.equal(formatTime(at(0, 0), { onTheHour: 'drop' }), '12 am');
    assert.equal(formatTime('9:30'), '', 'not a time, so nothing');
  });

  test('a span shares its am or pm, and "pair" drops minutes only when both ends are on the hour', () => {
    assert.equal(formatTimeRange(at(8, 0), at(10, 0), { onTheHour: 'pair' }), '8 to 10 am');
    assert.equal(formatTimeRange(at(8, 0), at(12, 0), { onTheHour: 'pair' }), '8 am to 12 pm');
    assert.equal(formatTimeRange(at(7, 0), at(12, 30), { onTheHour: 'pair' }), '7:00 am to 12:30 pm');
    // Minutes after midnight read the same as Dates: "pair" once ignored them and kept the minutes.
    assert.equal(formatTimeRange(480, 600, { onTheHour: 'pair' }), '8 to 10 am');
    assert.equal(formatTimeRange(420, 750, { onTheHour: 'pair' }), '7:00 am to 12:30 pm');
  });

  test("a brand's own way reaches every time: 11am to 10.30pm", () => {
    const time = { minutes: '.', onTheHour: 'drop', space: false };
    assert.equal(formatTime(at(11, 0), { time }), '11am');
    assert.equal(formatTime(at(22, 30), { time }), '10.30pm');
    assert.equal(formatTimeRange(at(11, 0), at(22, 30), { time }), '11am to 10.30pm');
    assert.equal(formatTimeRange(at(9, 0), at(11, 0), { time }), '9 to 11am');
  });
});

