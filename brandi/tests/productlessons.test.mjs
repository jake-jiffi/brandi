import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadDefinitions } from '../scripts/productdocs.mjs';

// product/lessons.json is what testing on real brands has taught the product layer. Each lesson names the
// checks and tests that fail without its fix, so a guard renamed, removed or never written fails here
// instead of leaving a lesson that nothing holds.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { lessons } = JSON.parse(readFileSync(path.join(ROOT, 'product', 'lessons.json'), 'utf8'));
const TRAITS = path.join(ROOT, 'product', 'traits');
const traits = readdirSync(TRAITS).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort();

/**
 * The titles a test file gives node:test, as written: test('...') and describe('...') opening a line, in any
 * quote. One commented out, skipped with test.skip or built at run time is not a title a guard can lean on.
 */
function testTitles(source) {
  const titles = new Set();
  for (const m of source.matchAll(/^\s*(?:await\s+)?(?:test|describe)\(\s*(['"`])((?:\\.|(?!\1)[^\\])*)\1/gm)) {
    if (m[1] === '`' && m[2].includes('${')) continue;
    titles.add(m[2].replace(/\\(.)/g, '$1'));
  }
  return titles;
}

/** The names of the starter's own checks (kit/tools/check-starter.mjs), as written: one built at run time is not one. */
function starterChecks(source) {
  const names = new Set();
  for (const m of source.matchAll(/^\s*name:\s*(["'`])((?:\\.|(?!\1)[^\\])*)\1/gm)) {
    if (m[1] === '`' && m[2].includes('${')) continue;
    names.add(m[2].replace(/\\(.)/g, '$1'));
  }
  return names;
}

/** Every guard a lesson names that the code does not have, as sentences. */
function unmetGuards(list, { defs, titlesOf, starter }) {
  const problems = [];
  for (const l of list) {
    for (const g of l.guards) {
      const def = defs.find((d) => d.name === g.component);
      if (g.kind === 'check') {
        if (!def) problems.push(`${l.id}: no definition for ${g.component}`);
        else if (!(def.checks ?? []).some((c) => c.name === g.name)) problems.push(`${l.id}: ${g.component} has no check named "${g.name}"`);
      } else if (g.kind === 'test') {
        const titles = titlesOf(g.file);
        if (!titles) problems.push(`${l.id}: no test file ${g.file}`);
        else if (!titles.has(g.name)) problems.push(`${l.id}: ${g.file} has no test titled "${g.name}"`);
      } else if (g.kind === 'starter') {
        if (!starter.has(g.name)) problems.push(`${l.id}: check-starter.mjs has no check named "${g.name}"`);
      } else if (g.kind === 'detector') {
        if (!def) problems.push(`${l.id}: no definition for ${g.component}`);
        if (!l.trait) problems.push(`${l.id}: a detector guard runs under the lesson's trait, and it names none`);
      } else {
        problems.push(`${l.id}: a guard is a check, a test, a starter check or a detector, not ${JSON.stringify(g.kind)}`);
      }
    }
  }
  return problems;
}

const starter = starterChecks(readFileSync(path.join(ROOT, 'product', 'kit', 'tools', 'check-starter.mjs'), 'utf8'));
const titlesOf = (file) => {
  const full = path.join(ROOT, file);
  return existsSync(full) ? testTitles(readFileSync(full, 'utf8')) : null;
};

describe('lessons.json, held to the code', () => {
  let defs;
  before(async () => {
    defs = await loadDefinitions(path.join(ROOT, 'product', 'kit', 'components', 'system'));
  });

  test('every lesson has the next id, a sentence saying what broke, a guard and a teaching', () => {
    assert.ok(lessons.length > 0, 'no lessons');
    lessons.forEach((l, i) => {
      assert.equal(l.id, `L${i + 1}`, 'ids run L1, L2 and on, in order, with none reused');
      assert.match(l.broke, /^[A-Z].*\.$/, `${l.id}: what broke is one sentence`);
      assert.doesNotMatch(l.broke, /—/, `${l.id}: no em dash`);
      assert.ok(l.guards?.length, `${l.id}: a lesson nothing guards is a lesson that can come back`);
      assert.ok(l.teaches?.file && l.teaches?.heading, `${l.id}: says where its rule is taught`);
      assert.ok(l.trait === null || typeof l.trait === 'string', `${l.id}: trait is a trait's id or null`);
    });
  });

  test("every check and test a lesson names exists under that exact name, and a detector guard has a trait to run under", () => {
    assert.deepEqual(unmetGuards(lessons, { defs, titlesOf, starter }), []);
  });

  test('a guard renamed or removed is reported, so a lesson cannot outlive its check', () => {
    const real = lessons.find((l) => l.guards.some((g) => g.kind === 'check'));
    const check = real.guards.find((g) => g.kind === 'check');
    const planted = [
      { id: 'P1', trait: null, guards: [{ ...check, name: `${check.name}, renamed` }] },
      { id: 'P2', trait: null, guards: [{ kind: 'test', file: 'tests/productlessons.test.mjs', name: 'a test nobody wrote' }] },
      { id: 'P3', trait: null, guards: [{ kind: 'detector', component: check.component }] },
      { id: 'P4', trait: null, guards: [{ kind: 'starter', name: 'a starter check nobody wrote' }] },
    ];
    const without = defs.map((d) => (d.name === check.component ? { ...d, checks: d.checks.filter((c) => c.name !== check.name) } : d));
    assert.deepEqual(unmetGuards(planted, { defs, titlesOf, starter }).map((p) => p.split(':')[0]), ['P1', 'P2', 'P3', 'P4']);
    assert.equal(unmetGuards([real], { defs: without, titlesOf, starter }).length, 1, 'the check removed from its definition');
  });

  test('a test title is read as written, in any quote, and one commented out, skipped or built at run time is not one', () => {
    const titles = testTitles("test('it\\'s one', () => {});\n  describe(\"two\", () => {});\n  await test(`three`, () => {});\ntest(`${x} four`, () => {});\n// test('five', () => {});\ntest.skip('six', () => {});");
    assert.deepEqual([...titles], ["it's one", 'two', 'three']);
  });

  test('every trait a lesson names is a fixture in product/traits', () => {
    const named = [...new Set(lessons.map((l) => l.trait).filter(Boolean))];
    assert.deepEqual(named.filter((t) => !traits.includes(t)), []);
  });

  test('every trait fixture says what it is, changes only the input and product.json, and proves only its own lessons', () => {
    for (const id of traits) {
      const t = JSON.parse(readFileSync(path.join(TRAITS, `${id}.json`), 'utf8'));
      assert.match(t.trait ?? '', /\.$/, `${id}: one sentence saying what the trait is`);
      assert.deepEqual(Object.keys(t).filter((k) => !['trait', 'input', 'product', 'proven'].includes(k)), [], `${id}: only trait, input, product and proven`);
      if (!t.proven) continue;
      assert.ok(t.proven.lessons?.length && /\.$/.test(t.proven.how ?? ''), `${id}: proven names its lessons and says in a sentence how the kit was unfixed`);
      const own = lessons.filter((l) => l.trait === id).map((l) => l.id);
      assert.deepEqual(t.proven.lessons.filter((x) => !own.includes(x)), [], `${id}: proves only lessons that name it`);
    }
    assert.ok(traits.includes('baseline'), 'the fixture as it is, to tell a trait from the kit');
  });

  test('every reference a lesson teaches from exists and carries its heading', () => {
    const problems = [];
    for (const l of lessons) {
      const file = path.join(ROOT, l.teaches.file);
      if (!existsSync(file)) { problems.push(`${l.id}: no ${l.teaches.file}`); continue; }
      const heading = l.teaches.heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (!new RegExp(`^#{1,6} ${heading}\\s*$`, 'm').test(readFileSync(file, 'utf8'))) problems.push(`${l.id}: ${l.teaches.file} has no heading "${l.teaches.heading}"`);
    }
    assert.deepEqual(problems, []);
  });

  test("the traits README lists every trait, with exactly the lessons that name it and those it is proven on", () => {
    const readme = readFileSync(path.join(TRAITS, 'README.md'), 'utf8');
    const ids = (cell) => [...cell.matchAll(/L\d+/g)].map((x) => x[0]);
    const rows = new Map([...readme.matchAll(/^\| `([a-z0-9-]+)` \|.*\| ([^|]*) \| ([^|]*) \|$/gm)].map((m) => [m[1], { lessons: ids(m[2]), proven: ids(m[3]) }]));
    assert.deepEqual([...rows.keys()].sort(), traits, 'one row a trait');
    for (const id of traits) {
      const t = JSON.parse(readFileSync(path.join(TRAITS, `${id}.json`), 'utf8'));
      assert.deepEqual(rows.get(id).lessons, lessons.filter((l) => l.trait === id).map((l) => l.id), `${id}: the lessons it guards`);
      assert.deepEqual(rows.get(id).proven, t.proven?.lessons ?? [], `${id}: the lessons its file says it is proven on`);
    }
  });
});
