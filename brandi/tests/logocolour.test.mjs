/**
 * The colour stage.
 *
 * The rule this whole file is holding in place: you have to love the mark as a
 * silhouette before colour enters. That is enforced by a gate, by a mapping
 * that cannot hold a colour of its own, and by an audit that rules out any
 * treatment carrying meaning the silhouette cannot carry alone. Each of those
 * three has tests here, because each of them is the kind of rule that survives
 * in prose and quietly stops being true in code.
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import os from 'node:os';

import * as C from '../scripts/logocolour.mjs';
import * as L from '../scripts/logo.mjs';
import { colourwayBoards } from '../scripts/logoboard.mjs';
import { buildSystem } from '../scripts/system.mjs';
import { systemInputFromBrand } from '../scripts/brandfile.mjs';
import { validateArtboard } from '../scripts/canvas.mjs';
import { findChrome, runChrome } from '../scripts/preview.mjs';
import { renderBrandDeck, PLACEHOLDER } from '../scripts/branddeck.mjs';
import { buildAssetPack } from '../scripts/assets.mjs';
import { checkLogoColour } from '../scripts/guardian.mjs';
import { decodePng, toGrey } from '../scripts/png.mjs';

const FIXTURE = path.join(import.meta.dirname, 'fixtures', 'muddy-paws.json');
const CLI = path.join(import.meta.dirname, '..', 'scripts', 'brandi.mjs');
const run = promisify(execFile);
const CHROME = findChrome();
const needsChrome = { skip: CHROME ? false : 'no headless browser on this machine' };

/** One ink. Every mark the concept round produces looks like this. */
const ONE_INK = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="#111111"><path d="M50 10 L90 82 H10 Z"/></g></svg>';

/** Two inks on two shapes that do not touch: the split survives one colour. */
const TWO_APART = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="#111111" d="M14 54 h72 a36 36 0 0 1 -72 0 z"/><path fill="#6E6E6E" d="M26 22 a9 9 0 0 1 12 -6 h24 a9 9 0 1 1 0 18 h-24 a9 9 0 0 1 -12 -6 z"/></svg>';

/** The same two inks on shapes that TOUCH: only hue tells them apart. */
const TWO_TOUCHING = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="#111111" d="M14 54 h72 a36 36 0 0 1 -72 0 z"/><path fill="#6E6E6E" d="M26 46 a9 9 0 0 1 12 -6 h24 a9 9 0 1 1 0 18 h-24 a9 9 0 0 1 -12 -6 z"/></svg>';

let brand;
let system;
let root;

before(async () => {
  brand = JSON.parse(await readFile(FIXTURE, 'utf8'));
  system = buildSystem(systemInputFromBrand(brand));
  root = await mkdtemp(path.join(os.tmpdir(), 'brandi-colour-test-'));
});
after(async () => {
  if (root) await rm(root, { recursive: true, force: true });
});

/** A project with a mastered mark, ready for the colour stage. */
async function project(name, { mark = ONE_INK, approvedBy = 'Jake', withBrand = true } = {}) {
  const dir = path.join(root, name);
  await mkdir(path.join(dir, 'brand'), { recursive: true });
  if (withBrand) await writeFile(path.join(dir, 'brand', 'brand.json'), JSON.stringify(brand, null, 2));
  await L.planRound(dir, { count: 4, brief: { name: 'Muddy Paws', category: 'pet services' } });
  const state = await L.loadState(dir);
  const into = path.join(dir, 'brand', 'logo', 'concepts', 'round-01');
  await mkdir(into, { recursive: true });
  const id = state.rounds[0].slots[0].id;
  await writeFile(path.join(into, `${id}.svg`), mark);
  await L.importConcepts(dir, [into], { model: 'test' });
  const after2 = await L.loadState(dir);
  // The concept round, finished: measured, boarded and shortlisted. Without the
  // last two the forge's `next` is still pointing back at the concept round,
  // which is correct and is not what these tests are about.
  for (const c of after2.rounds[0].candidates) c.audit = { verdict: 'contender', findings: [], contexts: [] };
  after2.rounds[0].canvas = 'brand/logo/canvas';
  after2.rounds[0].shortlist = [id];
  await L.saveState(dir, after2);
  await L.promoteToMaster(dir, id, { approvedBy, chrome: null });
  return { dir, id };
}

// ---------------------------------------------------------------------------
// The gate
// ---------------------------------------------------------------------------

describe('colour does not open until the silhouette is approved and the palette resolves', () => {
  test('with no master at all it refuses and names the command that makes one', async () => {
    const dir = path.join(root, 'gate-nomaster');
    await mkdir(path.join(dir, 'brand'), { recursive: true });
    await writeFile(path.join(dir, 'brand', 'brand.json'), JSON.stringify(brand, null, 2));
    const gate = await L.colourGate(dir);
    assert.equal(gate.ok, false);
    assert.equal(gate.reason, 'no-master');
    assert.match(gate.message, /one-colour press/);
    assert.match(gate.message, /logo master <id> --approved-by/);
  });

  test('a master nobody approved is refused, and the refusal names that master', async () => {
    const { dir, id } = await project('gate-unapproved', { approvedBy: null });
    const gate = await L.colourGate(dir);
    assert.equal(gate.ok, false);
    assert.equal(gate.reason, 'unapproved-master');
    assert.match(gate.message, /nobody has approved it/);
    assert.match(gate.message, new RegExp(`logo master ${id} --approved-by`));
  });

  test('a refusal writes nothing, so nothing is half-planned', async () => {
    const { dir } = await project('gate-writes-nothing', { approvedBy: null });
    const res = await L.planColourStage(dir);
    assert.equal(res.ok, false);
    const state = await L.loadState(dir);
    assert.equal(state.colour, undefined, 'no colour state was written');
    assert.equal(existsSync(path.join(dir, 'brand', 'logo', 'canvas-colour')), false);
  });

  test('every command a refusal prints can be copied, because it starts with brandi', async () => {
    const bare = path.join(root, 'gate-copyable-bare');
    await mkdir(path.join(bare, 'brand'), { recursive: true });
    await writeFile(path.join(bare, 'brand', 'brand.json'), JSON.stringify(brand, null, 2));

    const unapproved = await project('gate-copyable-unapproved', { approvedBy: null });
    const missing = await project('gate-copyable-missing');
    await rm(path.join(missing.dir, 'brand', 'logo', 'master', 'primary.svg'));
    const nopalette = await project('gate-copyable-nopalette');
    const file = path.join(nopalette.dir, 'brand', 'brand.json');
    const b = JSON.parse(await readFile(file, 'utf8'));
    b.identity.colour.primary = null;
    await writeFile(file, JSON.stringify(b, null, 2));
    const nameless = await project('gate-copyable-nameless');
    await L.planColourStage(nameless.dir);

    const refusals = [
      await L.colourGate(bare),
      await L.colourGate(unapproved.dir),
      await L.colourGate(missing.dir),
      await L.colourGate(nopalette.dir),
      await L.colourGate(path.join(root, 'gate-copyable-nobrand-does-not-exist')),
      await L.approveColourway(nameless.dir, 'brand-on-paper', {}),
    ];
    assert.equal(refusals.length, 6);
    for (const r of refusals) {
      assert.equal(r.ok, false);
      assert.ok(r.message, `${r.reason} has no message`);
      // `logo colour approve ...` typed at a shell is "command not found".
      assert.equal(
        /(?<!brandi )\blogo (?:plan|refine|wordmark|lockup|import|audit|board|pick|master|colour|status)\b/.test(r.message),
        false,
        `${r.reason} names a command without its binary:\n${r.message}`,
      );
    }
    // And the forms that do name one are still there to be copied.
    assert.match(refusals[0].message, /brandi logo master <id> --approved-by/);
    assert.match(refusals[5].message, /brandi logo colour approve brand-on-paper --approved-by/);
  });

  test('a master recorded but not on disk is refused, not opened with an ENOENT', async () => {
    const { dir, id } = await project('gate-nofile');
    await rm(path.join(dir, 'brand', 'logo', 'master', 'primary.svg'));
    const gate = await L.colourGate(dir);
    assert.equal(gate.ok, false);
    assert.equal(gate.reason, 'no-master-file');
    assert.match(gate.message, /nothing to take a view of/);
    assert.match(gate.message, new RegExp(`logo master ${id} --approved-by`));
  });

  test('with no brand file the refusal says colour comes from the palette', async () => {
    const { dir } = await project('gate-nobrand', { withBrand: false });
    const gate = await L.colourGate(dir);
    assert.equal(gate.ok, false);
    assert.equal(gate.reason, 'no-brand');
    assert.match(gate.message, /palette, not from the mark/);
    assert.match(gate.message, /brandi init/);
  });

  test('with no primary colour recorded the refusal names the field to set', async () => {
    const { dir } = await project('gate-nopalette');
    const file = path.join(dir, 'brand', 'brand.json');
    const b = JSON.parse(await readFile(file, 'utf8'));
    b.identity.colour.primary = null;
    await writeFile(file, JSON.stringify(b, null, 2));
    const gate = await L.colourGate(dir);
    assert.equal(gate.ok, false);
    assert.equal(gate.reason, 'no-palette');
    assert.match(gate.message, /identity\.colour\.primary/);
  });

  test('with both in place the gate opens and hands back the resolved system', async () => {
    const { dir } = await project('gate-open');
    const gate = await L.colourGate(dir);
    assert.equal(gate.ok, true);
    assert.equal(gate.system.palettes.brand.seed, '#1F6F4A');
  });

  test('the forge says the colour stage is next once a person has approved the mark', async () => {
    const { dir } = await project('gate-status');
    const before2 = await L.forgeStatus(dir);
    assert.equal(before2.next, 'logo colour plan');
    assert.equal(before2.colour, null);
    await L.planColourStage(dir);
    assert.equal((await L.forgeStatus(dir)).next, 'logo colour audit');
  });
});

// ---------------------------------------------------------------------------
// Regions and the mapping
// ---------------------------------------------------------------------------

describe('a region is an ink the mark was drawn in', () => {
  test('one ink is one region, whether the fill sits on the shape or on a group', () => {
    assert.equal(C.regionsOf(ONE_INK).regions.length, 1);
    assert.equal(C.regionsOf(ONE_INK).regions[0].ink, '#111111');
    assert.equal(C.regionsOf(ONE_INK).regions[0].share, 1);
  });

  test('two inks are two regions, ordered by how much of the drawing each covers', () => {
    const { regions } = C.regionsOf(TWO_APART);
    assert.equal(regions.length, 2);
    assert.deepEqual(regions.map((r) => r.id), ['region-1', 'region-2']);
    assert.ok(regions[0].share > regions[1].share, 'the larger ink is region-1');
  });

  test('#111 and #111111 are the same region, not two', () => {
    const mixed = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="#111" d="M0 0 h40 v40 h-40 z"/><path fill="#111111" d="M50 50 h40 v40 h-40 z"/></svg>';
    assert.equal(C.regionsOf(mixed).regions.length, 1);
  });

  test('a painted node with no explicit fill is reported rather than given a role', () => {
    // It is painted black by the SVG initial value and there is no ink in the
    // file to map, so a colourway could never reach it.
    const implicit = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M0 0 h40 v40 h-40 z"/></svg>';
    const { regions, unpainted } = C.regionsOf(implicit);
    assert.deepEqual(regions, []);
    assert.deepEqual(unpainted, ['path']);
  });

  test('a colourway paints the mark from its roles, and holds no colour of its own', () => {
    const { regions } = C.regionsOf(ONE_INK);
    const cw = { id: 'x', ground: 'neutral.paper', regions: [{ region: 'region-1', ink: '#111111', role: 'brand.solid' }] };
    const painted = C.renderColourway(ONE_INK, cw, { system, regions });
    assert.match(painted, /#1F6F4A/);
    assert.equal(/#111111/.test(painted), false);
    assert.equal(JSON.stringify(cw).includes('#1F6F4A'), false, 'the record names a role, never a colour');
  });

  test('the same mapping follows the palette when the palette moves', () => {
    const { regions } = C.regionsOf(ONE_INK);
    const cw = { id: 'x', ground: 'neutral.paper', regions: [{ region: 'region-1', ink: '#111111', role: 'brand.solid' }] };
    const other = buildSystem({ primary: '#7A2FBF' });
    assert.match(C.renderColourway(ONE_INK, cw, { system: other, regions }), /#7A2FB/i);
  });

  test('two inks swapping places swap once, not twice', () => {
    // A single pass over the ORIGINAL string, so a swap is a swap. A pass that
    // re-read its own output would put both regions in one ink.
    const swapped = C.recolourSvg(TWO_APART, { '#111111': '#6e6e6e', '#6e6e6e': '#111111' });
    const inks = C.regionsOf(swapped).regions.map((r) => r.ink).sort();
    assert.deepEqual(inks, ['#111111', '#6e6e6e']);
    assert.notEqual(swapped, TWO_APART);
  });

  test('a role the palette does not define is refused, not guessed', () => {
    const { regions } = C.regionsOf(ONE_INK);
    const res = C.resolveColourway({ id: 'x', regions: [{ ink: '#111111', role: 'accent9.solid' }] }, { system, regions });
    assert.equal(res.ok, false);
    assert.match(res.errors[0], /which this palette does not define/);
  });

  test('a mapping written against a different mark is refused', () => {
    const { regions } = C.regionsOf(ONE_INK);
    const res = C.resolveColourway({ id: 'x', regions: [{ ink: '#C0FFEE', role: 'brand.solid' }] }, { system, regions });
    assert.equal(res.ok, false);
    assert.match(res.errors[0], /an ink the mark no longer carries/);
  });

  test('a mapping that says nothing about a region is refused, so nothing renders half-painted', () => {
    const { regions } = C.regionsOf(TWO_APART);
    const res = C.resolveColourway({ id: 'x', regions: [{ ink: '#111111', role: 'brand.solid' }] }, { system, regions });
    assert.equal(res.ok, false);
    assert.match(res.errors[0], /says nothing about region-2/);
  });

  test('greyscale keeps each colour\'s lightness and drops only its hue', () => {
    assert.equal(C.greyOf('#FFFFFF'), '#FFFFFF');
    assert.equal(C.greyOf('#000000'), '#000000');
    const grey = C.greyOf('#1F6F4A');
    assert.match(grey, /^#([0-9A-F]{2})\1\1$/, `${grey} should be neutral`);
    // A coloured mark, so there is a hue to lose. TWO_APART is already neutral.
    const coloured = C.recolourSvg(TWO_APART, { '#111111': '#1F6F4A', '#6e6e6e': '#D4823A' });
    const flat = C.greyscaleSvg(coloured);
    assert.equal(/#1F6F4A|#D4823A/i.test(flat), false, 'every paint was flattened');
    assert.match(flat, new RegExp(C.greyOf('#1F6F4A')));
    assert.match(flat, new RegExp(C.greyOf('#D4823A')));
  });
});

// ---------------------------------------------------------------------------
// The plan
// ---------------------------------------------------------------------------

describe('the treatments are dealt from the palette and from the mark\'s own geometry', () => {
  test('a one-ink mark gets the four treatments a one-region mark can take, and is told why', () => {
    const { regions } = C.regionsOf(ONE_INK);
    const { colourways, notes } = C.planColourways({ regions, system });
    assert.deepEqual(colourways.map((c) => c.id), ['brand-on-paper', 'reversed-on-brand', 'ink-on-brand', 'one-ink']);
    assert.ok(notes.some((n) => /one ink, so it has one region/.test(n)));
    assert.ok(notes.some((n) => /inventing a region to colour/.test(n)), 'it refuses to invent a boundary');
  });

  test('a two-ink mark also gets the two-colour treatments, split on the mark\'s own boundary', () => {
    const { regions } = C.regionsOf(TWO_APART);
    const { colourways } = C.planColourways({ regions, system });
    assert.equal(colourways.length, 6, 'four to six is the range, and six is the top of it');
    const two = colourways.find((c) => c.id === 'two-colour');
    assert.deepEqual(two.regions.map((r) => r.role), ['brand.solid', 'neutral.ink']);
    assert.match(two.basis, /the 2 inks the mark was drawn in, not a node chosen for it/);
  });

  test('a palette that defines none of the roles deals nothing, rather than an unrenderable set', () => {
    const { regions } = C.regionsOf(TWO_APART);
    const res = C.planColourways({ regions, system: {} });
    assert.deepEqual(res.colourways, [], 'a treatment naming a role nothing resolves is not a treatment');
    assert.ok(res.notes.some((n) => /no brand\.solid/.test(n)));
    assert.ok(res.notes.some((n) => /no neutral ink on paper/.test(n)));
  });

  test('no dealt treatment carries a colour, only roles the palette defines', () => {
    const { regions } = C.regionsOf(TWO_APART);
    const roles = new Set(C.colourRoles(system).keys());
    for (const c of C.planColourways({ regions, system }).colourways) {
      assert.ok(roles.has(c.ground), `${c.id} sits on an unknown ground`);
      for (const r of c.regions) assert.ok(roles.has(r.role), `${c.id} maps ${r.region} to ${r.role}`);
      assert.equal(/#[0-9a-f]{6}/i.test(JSON.stringify(c.regions.map((r) => r.role))), false);
    }
  });

  test('every treatment is a different structural idea, not one idea in several hues', () => {
    const { regions } = C.regionsOf(TWO_APART);
    const seen = new Set();
    for (const c of C.planColourways({ regions, system }).colourways) {
      const shape = `${c.ground}|${c.regions.map((r) => r.role).join(',')}`;
      assert.equal(seen.has(shape), false, `${c.id} repeats a treatment already in the set`);
      seen.add(shape);
    }
  });
});

// ---------------------------------------------------------------------------
// The audit
// ---------------------------------------------------------------------------

describe('the audit measures what colour can break, with the machinery the concept round uses', () => {
  const twoColour = (mark) => {
    const { regions } = C.regionsOf(mark);
    return { regions, cw: C.planColourways({ regions, system }).colourways.find((c) => c.id === 'two-colour') };
  };

  test('a paint count over a context ceiling is deferred to another treatment, not failed', () => {
    const { regions, cw } = twoColour(TWO_APART);
    const a = C.auditColourway(cw, { master: TWO_APART, system, regions });
    const foil = a.contexts.find((r) => r.context === 'foil-stamp');
    assert.equal(foil.status, 'deferred', 'a two-colour mark is not defective for failing foil');
    assert.equal(a.findings.find((f) => f.id === 'over-paint-ceiling').severity, 'note');
  });

  test('a mark that cannot be seen on its own ground is ruled out, with the number', () => {
    const { regions } = C.regionsOf(ONE_INK);
    const inkOnBrand = C.planColourways({ regions, system }).colourways.find((c) => c.id === 'ink-on-brand');
    const a = C.auditColourway(inkOnBrand, { master: ONE_INK, system, regions });
    const low = a.findings.find((f) => f.id === 'low-contrast');
    assert.ok(low, 'the fixture\'s ink on its own green is under 3:1');
    assert.match(low.message, /\d\.\d\d:1/);
    assert.equal(a.verdict, 'rejected');
  });

  test('contrast is reported against every ground the brand uses, not only its own', () => {
    const { regions, cw } = twoColour(TWO_APART);
    const a = C.auditColourway(cw, { master: TWO_APART, system, regions });
    assert.deepEqual([...new Set(a.contrast.map((r) => r.ground))], ['neutral.paper', 'brand.solid', 'neutral.ink']);
    assert.equal(a.contrast.filter((r) => r.own).length > 0, true);
  });

  test('every treatment is simulated for the three dichromacies', () => {
    const { regions, cw } = twoColour(TWO_APART);
    const a = C.auditColourway(cw, { master: TWO_APART, system, regions });
    assert.deepEqual(a.cvd.map((v) => v.type), ['protanopia', 'deuteranopia', 'tritanopia']);
    for (const v of a.cvd) assert.equal(v.inks.length, a.inks.length);
  });

  test('two regions that merge under colour vision are ruled out, and the finding names them', () => {
    const { regions } = C.regionsOf(TWO_APART);
    // Two colours a person with normal vision separates easily and a person
    // with deuteranopia does not.
    const forced = buildSystem({ primary: '#1F6F4A', accents: ['#7A6A12'], accentCount: 1 });
    const cw = {
      id: 'forced',
      ground: 'neutral.paper',
      regions: [
        { region: 'region-1', ink: '#111111', role: 'brand.solid' },
        { region: 'region-2', ink: '#6e6e6e', role: 'accent1.solid' },
      ],
    };
    const a = C.auditColourway(cw, { master: TWO_APART, system: forced, regions });
    const hit = a.findings.find((f) => f.id === 'cvd-collapse');
    assert.ok(hit, `expected a cvd-collapse finding, got ${a.findings.map((f) => f.id).join(', ')}`);
    assert.match(hit.message, /region-1 and region-2/);
  });

  test('a treatment on a ground outside the usual three is still measured against its own', () => {
    // Deriving "own" from the brand's three habitual grounds left an accent
    // ground with no own-ground row, so the one measurement that had to happen
    // was the one that did not.
    const sys = buildSystem({ primary: '#1F6F4A', accents: ['#D4823A'], accentCount: 1 });
    const { regions } = C.regionsOf(TWO_APART);
    const onAccent = {
      id: 'on-accent', ground: 'accent1.solid',
      regions: regions.map((r) => ({ region: r.id, ink: r.ink, role: 'accent1.solid' })),
    };
    const a = C.auditColourway(onAccent, { master: TWO_APART, system: sys, regions });
    assert.equal(a.contrast.filter((r) => r.own).length, 1, 'its own ground is measured');
    assert.ok(a.findings.some((f) => f.id === 'low-contrast'), 'accent on accent is 1:1 and must be ruled out');
    assert.equal(a.verdict, 'rejected');
  });

  test('a treatment that names no ground says so rather than reading as passing', () => {
    const { regions } = C.regionsOf(ONE_INK);
    const a = C.auditColourway({ id: 'groundless', regions: [{ ink: '#111111', role: 'brand.solid' }] }, { master: ONE_INK, system, regions });
    const f = a.findings.find((x) => x.id === 'no-ground');
    assert.ok(f);
    assert.equal(f.severity, 'warn');
  });

  test('a mapping that will not resolve is reported as a finding, not thrown away', () => {
    const { regions } = C.regionsOf(ONE_INK);
    const a = C.auditColourway({ id: 'stale', regions: [{ ink: '#C0FFEE', role: 'brand.solid' }] }, { master: ONE_INK, system, regions });
    assert.equal(a.verdict, 'rejected');
    assert.equal(a.findings[0].id, 'unresolvable');
  });

  test('a split the silhouette cannot carry is ruled out, and the finding names the regions', needsChrome, async () => {
    const { regions, cw } = twoColour(TWO_TOUCHING);
    const res = await C.auditColourways([cw], { master: TWO_TOUCHING, system, regions, chrome: CHROME });
    const a = res.colourways[0];
    const hit = a.findings.find((f) => f.id === 'colour-carries');
    assert.ok(hit, `expected colour-carries, got ${a.findings.map((f) => f.id).join(', ') || 'nothing'}`);
    assert.match(hit.message, /region-1 \(#111111\) and region-2 \(#6e6e6e\)/);
    assert.ok(a.oneColour.colourRegions > a.oneColour.inkRegions);
    assert.equal(a.verdict, 'rejected');
  });

  test('the same split on shapes that do not touch survives one colour', needsChrome, async () => {
    const { regions, cw } = twoColour(TWO_APART);
    const res = await C.auditColourways([cw], { master: TWO_APART, system, regions, chrome: CHROME });
    const a = res.colourways[0];
    assert.equal(a.findings.some((f) => f.id === 'colour-carries'), false, 'a gap is not hue doing the work');
    assert.equal(a.verdict, 'usable');
  });

  test('without a browser nothing claims to have passed the one-colour test', async () => {
    const { regions, cw } = twoColour(TWO_TOUCHING);
    const res = await C.auditColourways([cw], { master: TWO_TOUCHING, system, regions, chrome: null });
    assert.equal(res.rendered, false);
    assert.equal(res.colourways[0].verdict, 'unverified');
  });

  test('a context no treatment in the set can serve is an error against the set', () => {
    const { regions } = C.regionsOf(TWO_APART);
    const roles = C.planColourways({ regions, system }).colourways;
    const onlyTwoColour = roles.filter((c) => c.id.startsWith('two-colour'));
    const a = onlyTwoColour.map((c) => C.auditColourway(c, { master: TWO_APART, system, regions }));
    // Every one of these puts two colours down, so nothing here can be foiled.
    assert.ok(a.every((x) => x.contexts.find((r) => r.context === 'foil-stamp').status === 'deferred'));
  });
});

// ---------------------------------------------------------------------------
// The boards
// ---------------------------------------------------------------------------

describe('the boards show the silhouette still carrying the mark', () => {
  const built = () => {
    const { regions } = C.regionsOf(TWO_APART);
    const colourways = C.planColourways({ regions, system }).colourways.map((c) => ({
      ...c,
      svg: C.renderColourway(TWO_APART, c, { system, regions }),
      audit: C.auditColourway(c, { master: TWO_APART, system, regions }),
    }));
    return colourwayBoards({ colourways, regions, system, brandName: 'Muddy Paws', masterApprovedBy: 'Jake', notes: [], coverage: [], setFindings: [] });
  };

  test('four artboards, each one the canvas validator accepts', () => {
    const boards = built();
    assert.deepEqual(boards.map((b) => b.file), ['Main.dc.html', 'Colourways.dc.html', 'Grounds.dc.html', 'Audit.dc.html']);
    for (const b of boards) {
      const r = validateArtboard(b.source, { file: b.file });
      assert.equal(r.errors.length, 0, `${b.file}: ${r.errors.map((e) => e.message ?? e).join('; ')}`);
      assert.ok(b.h > 0 && b.w > 0);
    }
  });

  test('every treatment appears in colour, in greyscale and at 16 pixels', () => {
    const strip = built().find((b) => b.file === 'Colourways.dc.html').source;
    assert.match(strip, /On its ground/);
    assert.match(strip, /Greyscale/);
    assert.match(strip, /16, 32 and 64 pixels/);
    assert.match(strip, /width:16px;height:16px/);
    // The brand colour is on the board and its own grey is beside it.
    assert.match(strip, /#1F6F4A/);
    assert.match(strip, new RegExp(C.greyOf('#1F6F4A')));
  });

  test('the boards say the mark was approved first, and by whom', () => {
    const main = built().find((b) => b.file === 'Main.dc.html').source;
    assert.match(main, /approved by Jake/);
    assert.match(main, /nothing here may carry meaning the silhouette cannot carry alone/);
  });

  test('the boards are marked generated, so `brandi check` does not audit its own output', () => {
    for (const b of built()) assert.match(b.source, /generated from the resolved system/);
  });

  test('the boards refuse to be built from a set nobody measured', async () => {
    const { dir } = await project('board-unmeasured');
    await L.planColourStage(dir);
    await assert.rejects(() => L.buildColourBoards(dir), /not been audited/);
  });

  test('the colour canvas is its own directory, so the concept round survives', async () => {
    assert.equal(L.LAYOUT.colourCanvas, 'brand/logo/canvas-colour');
    assert.notEqual(L.LAYOUT.colourCanvas, L.LAYOUT.canvas);
  });

  test('every table these boards emit carries a caption, so it reaches a screen reader with a name', () => {
    const boards = built();
    for (const b of boards) {
      const tables = (b.source.match(/<table\b/g) ?? []).length;
      const captions = (b.source.match(/<caption\b/g) ?? []).length;
      assert.equal(captions, tables, `${b.file} emits ${tables} tables and ${captions} captions`);
    }
    // And there really are tables to name, so the check is not passing on zero.
    assert.equal((boards.find((b) => b.file === 'Audit.dc.html').source.match(/<table\b/g) ?? []).length, 2);
    assert.equal((boards.find((b) => b.file === 'Main.dc.html').source.match(/<table\b/g) ?? []).length, 1);
  });

  test('no board carries an em dash, including the row that says colour is carrying the split', () => {
    const { regions } = C.regionsOf(TWO_TOUCHING);
    // The one-colour verdict is measured in a browser, so the failing reading
    // is supplied here: this is about the sentence that row prints, not about
    // the measurement, which has its own tests.
    const colourways = C.planColourways({ regions, system }).colourways.map((c) => ({
      ...c,
      svg: C.renderColourway(TWO_TOUCHING, c, { system, regions }),
      audit: {
        ...C.auditColourway(c, { master: TWO_TOUCHING, system, regions }),
        oneColour: { available: true, colourRegions: 2, inkRegions: 1 },
      },
    }));
    const boards = colourwayBoards({ colourways, regions, system, brandName: 'Muddy Paws', masterApprovedBy: 'Jake' });
    const audit = boards.find((b) => b.file === 'Audit.dc.html').source;
    assert.match(audit, /colour is carrying the split/, 'the failing row is on the board to be read');
    for (const b of boards) {
      assert.equal(b.source.includes('&mdash;'), false, `${b.file} carries an &mdash; entity`);
      assert.equal(b.source.includes('\u2014'), false, `${b.file} carries a literal em dash`);
    }
  });
});

// ---------------------------------------------------------------------------
// Approval, and what it writes
// ---------------------------------------------------------------------------

describe('a colourway carries a name or it carries nothing', () => {
  test('without --approved-by nothing is recorded and the message says so', async () => {
    const { dir } = await project('approve-nameless');
    await L.planColourStage(dir);
    const res = await L.approveColourway(dir, 'brand-on-paper', {});
    assert.equal(res.ok, false);
    assert.equal(res.reason, 'no-approver');
    assert.match(res.message, /Nothing was recorded/);
    const b = JSON.parse(await readFile(path.join(dir, 'brand', 'brand.json'), 'utf8'));
    assert.equal(b.identity.logo.colourways, undefined);
  });

  test('an approval records the mapping, the approver and the date, and writes the rendition', async () => {
    const { dir } = await project('approve-real');
    await L.planColourStage(dir);
    const res = await L.approveColourway(dir, 'brand-on-paper', { approvedBy: 'Jake' });
    assert.equal(res.ok, true);
    const b = JSON.parse(await readFile(path.join(dir, 'brand', 'brand.json'), 'utf8'));
    const [cw] = b.identity.logo.colourways;
    assert.equal(cw.id, 'brand-on-paper');
    assert.equal(cw.approvedBy, 'Jake');
    assert.match(cw.approvedOn, /^\d{4}-\d{2}-\d{2}$/);
    assert.deepEqual(cw.regions, [{ region: 'region-1', ink: '#111111', role: 'brand.solid' }]);
    assert.equal(JSON.stringify(cw.regions).includes('#1F6F4A'), false, 'the record is the mapping, not the colour');
    const painted = await readFile(path.join(dir, cw.file), 'utf8');
    assert.match(painted, /#1F6F4A/);
  });

  test('approving the same treatment twice leaves one record, not two', async () => {
    const { dir } = await project('approve-twice');
    await L.planColourStage(dir);
    await L.approveColourway(dir, 'one-ink', { approvedBy: 'Jake' });
    await L.approveColourway(dir, 'one-ink', { approvedBy: 'Sam' });
    const b = JSON.parse(await readFile(path.join(dir, 'brand', 'brand.json'), 'utf8'));
    assert.equal(b.identity.logo.colourways.length, 1);
    assert.equal(b.identity.logo.colourways[0].approvedBy, 'Sam');
  });

  test('an approval survives a replan, so brand.json and logo.json cannot disagree', async () => {
    const { dir } = await project('approve-replan');
    await L.planColourStage(dir);
    await L.approveColourway(dir, 'brand-on-paper', { approvedBy: 'Jake' });
    const res = await L.planColourStage(dir);
    assert.deepEqual(res.carried, ['brand-on-paper']);
    const state = await L.loadState(dir);
    assert.deepEqual(state.colour.approved, ['brand-on-paper']);
    assert.equal(state.colour.colourways.find((c) => c.id === 'brand-on-paper').approvedBy, 'Jake');
  });

  test('an approval the new set cannot honour is reported rather than left contradicting the book', async () => {
    const { dir } = await project('approve-orphan');
    const file = path.join(dir, 'brand', 'brand.json');
    const b = JSON.parse(await readFile(file, 'utf8'));
    b.identity ??= {};
    b.identity.logo.colourways = [{ id: 'two-colour', name: 'Two colour', ground: 'neutral.paper', regions: [], approvedBy: 'Jake', approvedOn: '2026-09-16' }];
    await writeFile(file, JSON.stringify(b, null, 2));
    // The master here is one ink, so a two-colour treatment is not on offer.
    const res = await L.planColourStage(dir);
    assert.ok(res.notes.some((n) => /records "Two colour" as approved/.test(n)), res.notes.join(' | '));
  });

  test('an id that is not a plain slug is refused, because it becomes a filename', async () => {
    const { dir } = await project('approve-badid');
    await L.planColourStage(dir);
    const state = await L.loadState(dir);
    state.colour.colourways.push({ id: '../../escaped', name: 'Escaped', ground: 'neutral.paper', regions: [{ region: 'region-1', ink: '#111111', role: 'brand.solid' }] });
    await L.saveState(dir, state);
    await assert.rejects(() => L.approveColourway(dir, '../../escaped', { approvedBy: 'Jake' }), /is not a colourway id/);
  });

  test('an unknown id lists what the set actually holds', async () => {
    const { dir } = await project('approve-unknown');
    await L.planColourStage(dir);
    await assert.rejects(() => L.approveColourway(dir, 'chartreuse', { approvedBy: 'Jake' }), /This set has: brand-on-paper/);
  });

  test('the decision log carries why, and what was not chosen', async () => {
    const { dir } = await project('approve-decision');
    await L.planColourStage(dir);
    await L.approveColourway(dir, 'one-ink', { approvedBy: 'Jake' });
    const b = JSON.parse(await readFile(path.join(dir, 'brand', 'brand.json'), 'utf8'));
    const d = b.governance.decisions.at(-1);
    assert.match(d.decision, /one ink colourway is approved/);
    assert.match(d.rationale, /Approved by Jake after the silhouette was approved/);
    assert.ok(d.alternatives.length >= 3);
  });
});

// ---------------------------------------------------------------------------
// Downstream
// ---------------------------------------------------------------------------

describe('what the approved colourway changes downstream', () => {
  test('the asset pack keeps its five variants and gains the colourway', async () => {
    const dir = path.join(root, 'assets-pack');
    const res = await buildAssetPack({
      masterSvg: ONE_INK,
      outDir: dir,
      system,
      brandName: 'Muddy Paws',
      chrome: null,
      colourways: [{ id: 'brand-on-paper', name: 'Brand on paper', svg: C.recolourSvg(ONE_INK, { '#111111': '#1F6F4A' }), why: 'Brand on paper, approved by Jake.' }],
    });
    const svgs = res.written.filter((w) => w.kind === 'svg').map((w) => w.name);
    assert.deepEqual(svgs, ['primary', 'black', 'white', 'brand', 'on-brand', 'colourway-brand-on-paper']);
    const entry = res.written.find((w) => w.name === 'colourway-brand-on-paper');
    assert.match(entry.why, /approved by Jake/, 'the manifest says which file is which');
  });

  test('the pack is unchanged when no colourway is approved', async () => {
    const dir = path.join(root, 'assets-none');
    const res = await buildAssetPack({ masterSvg: ONE_INK, outDir: dir, system, brandName: 'Muddy Paws', chrome: null });
    assert.deepEqual(res.written.filter((w) => w.kind === 'svg').map((w) => w.name), ['primary', 'black', 'white', 'brand', 'on-brand']);
  });

  test('the deck gains a colourway page, which paints the mark from the mapping', () => {
    const b = JSON.parse(JSON.stringify(brand));
    b.identity.logo.colourways = [{
      id: 'brand-on-paper', name: 'Brand on paper', ground: 'neutral.paper',
      regions: [{ region: 'region-1', ink: '#111111', role: 'brand.solid' }],
      approvedBy: 'Jake', approvedOn: '2026-09-16',
    }];
    const out = renderBrandDeck({ brand: b, system, assets: { 'assets/logos/muddy-paws-primary.svg': { kind: 'svg', markup: ONE_INK } } });
    const page = /<section class="page"[^>]*id="colourways"[\s\S]*?<\/section>/.exec(out.html);
    assert.ok(page, 'the deck has a colourways page');
    assert.match(page[0], /Brand on paper/);
    assert.match(page[0], /region-1 in brand\.solid/);
    assert.match(page[0], /#1F6F4A/, 'the mark is painted from the mapping');
    assert.match(page[0], new RegExp(C.greyOf('#1F6F4A')), 'and its greyscale sits beside it');
    assert.match(page[0], /height:16px/, 'and its 16 pixel render');
    assert.equal(page[0].includes(PLACEHOLDER), false);
  });

  test('the deck page names each proof for itself, rather than giving all three the same name', () => {
    const b = JSON.parse(JSON.stringify(brand));
    b.identity.logo.colourways = [{
      id: 'brand-on-paper', name: 'Brand on paper', ground: 'neutral.paper',
      regions: [{ region: 'region-1', ink: '#111111', role: 'brand.solid' }],
      approvedBy: 'Jake', approvedOn: '2026-09-16',
    }];
    const out = renderBrandDeck({ brand: b, system, assets: { 'assets/logos/muddy-paws-primary.svg': { kind: 'svg', markup: ONE_INK } } });
    const page = /<section class="page"[^>]*id="colourways"[\s\S]*?<\/section>/.exec(out.html)[0];
    const labels = [...page.matchAll(/class="mark" role="img" aria-label="([^"]*)"/g)].map((m) => m[1]);
    // The small renders the page actually drew, rather than a number typed
    // here: a wide mark takes only the sizes that fit on its strip.
    const WORDS = { 16: 'sixteen', 32: 'thirty-two', 64: 'sixty-four' };
    const sizes = [...page.matchAll(/class="size-tile" data-px="(\d+)"/g)].map((m) => Number(m[1]));
    assert.ok(sizes.length >= 1, 'the page draws the mark at its small sizes');
    assert.deepEqual(labels, ['Brand on paper', 'Brand on paper, greyscale', ...sizes.map((px) => `Brand on paper, at ${WORDS[px]} pixels`)],
      'the board names its cells apart and the deck has to as well');
    assert.equal(new Set(labels).size, labels.length, 'no two proofs share a name');
  });

  test('a colourway on a dark ground gets a greyscale proof you can see, not a blank cell', needsChrome, async () => {
    const b = JSON.parse(JSON.stringify(brand));
    // Reversed out of the brand colour: the mark IS the paper, so it greys out
    // to near white. On the page's own paper that cell rendered nothing at all.
    b.identity.logo.colourways = [{
      id: 'reversed-on-brand', name: 'Reversed out of the brand ground', ground: 'brand.solid',
      regions: [{ region: 'region-1', ink: '#111111', role: 'neutral.paper' }],
      approvedBy: 'Jake', approvedOn: '2026-09-16',
    }];
    const { html } = renderBrandDeck({ brand: b, system, assets: { 'assets/logos/muddy-paws-primary.svg': { kind: 'svg', markup: ONE_INK } } });
    // The page on its own, so one screenshot at an ordinary window size holds
    // it. The markup and the stylesheet are the deck's, untouched.
    const page = /<section class="page"[^>]*id="colourways"[\s\S]*?<\/section>/.exec(html)[0];
    // The cell measures itself in the same browser pass that takes the picture,
    // so the crop is the box the deck laid out rather than one typed here.
    const probe = `<script>window.addEventListener('load',function(){document.fonts.ready.then(function(){
      var label = [].find.call(document.querySelectorAll('.label'), function (e) { return e.textContent.trim() === 'Greyscale'; });
      var box = label.parentElement.lastElementChild.getBoundingClientRect();
      document.documentElement.setAttribute('data-grey-cell', JSON.stringify([box.left, box.top, box.width, box.height]));
    });});</script>`;
    const dir = path.join(root, 'grey-cell');
    await mkdir(dir, { recursive: true });
    const file = path.join(dir, 'page.html');
    const png = path.join(dir, 'page.png');
    await writeFile(file, `${html.slice(0, html.indexOf('<body>'))}<body>${page}${probe}</body></html>`);
    const { stdout } = await runChrome(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
      '--force-device-scale-factor=1', '--virtual-time-budget=5000', '--window-size=1400,1000',
      '--dump-dom', `--screenshot=${png}`, pathToFileURL(file).href], { timeout: 120000 });
    const m = /data-grey-cell="([^"]+)"/.exec(stdout);
    assert.ok(m, 'the cell reported where it was drawn');
    const [x, y, w, h] = JSON.parse(m[1].replace(/&quot;/g, '"')).map(Math.round);
    assert.ok(w > 40 && h > 40, `the greyscale cell measured ${w}x${h}`);

    const img = decodePng(await readFile(png));
    const grey = toGrey(img);
    // Inside the border, so the rule around the cell cannot supply the contrast.
    const hist = new Map();
    for (let j = y + 4; j < y + h - 4; j++) {
      for (let i = x + 4; i < x + w - 4; i++) {
        const v = grey[j * img.width + i];
        hist.set(v, (hist.get(v) ?? 0) + 1);
      }
    }
    const total = [...hist.values()].reduce((a, c) => a + c, 0);
    // Antialiasing puts a handful of pixels at every level on a boundary, so
    // only a level covering a twentieth of the cell counts as something drawn.
    const solid = [...hist.entries()].filter(([, n]) => n / total >= 0.05).map(([v]) => v).sort((a, c) => a - c);
    assert.ok(
      solid.length >= 2 && solid[solid.length - 1] - solid[0] > 40,
      `the greyscale proof is a blank cell: ${(w - 8)}x${(h - 8)} pixels covering `
      + `${solid.map((v) => `grey ${v} at ${(100 * hist.get(v) / total).toFixed(1)} per cent`).join(', ')}. `
      + 'The mark greys out to near white, so the cell has to be backed by the greyscale of its own ground.',
    );
  });

  test('the colourway page fills its canvas the way the logo pages around it do', needsChrome, async () => {
    const b = JSON.parse(JSON.stringify(brand));
    b.identity.logo.colourways = [{
      id: 'brand-on-paper', name: 'Brand on paper', ground: 'neutral.paper',
      regions: [{ region: 'region-1', ink: '#111111', role: 'brand.solid' }],
      approvedBy: 'Jake', approvedOn: '2026-09-16',
    }];
    const { html } = renderBrandDeck({ brand: b, system, assets: { 'assets/logos/muddy-paws-primary.svg': { kind: 'svg', markup: ONE_INK } } });
    const dir = path.join(root, 'deck-fill');
    await mkdir(dir, { recursive: true });
    const file = path.join(dir, 'deck.html');
    // The share of the canvas column each page's object actually covers. One
    // approved treatment used to leave this page at a quarter of its canvas
    // while its neighbours in the same chapter carried two thirds of theirs.
    const probe = `<script>window.addEventListener('load',function(){document.fonts.ready.then(function(){
      var out = {};
      document.querySelectorAll('.page').forEach(function (p) {
        var c = p.querySelector('.canvas');
        if (!c || !c.firstElementChild) return;
        var cb = c.getBoundingClientRect(); var ob = c.firstElementChild.getBoundingClientRect();
        if (cb.height > 0) out[p.id] = ob.height / cb.height;
      });
      document.documentElement.setAttribute('data-fill', JSON.stringify(out));
    });});</script>`;
    await writeFile(file, html.replace('</body>', `${probe}</body>`));
    const { stdout } = await runChrome(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--virtual-time-budget=5000', '--window-size=2000,1200', '--dump-dom', pathToFileURL(file).href], { timeout: 120000 });
    const m = /data-fill="([^"]+)"/.exec(stdout);
    assert.ok(m, 'the measurement probe ran');
    const fill = JSON.parse(m[1].replace(/&quot;/g, '"'));
    const neighbours = ['our-logo', 'variants', 'clear-space', 'minimum-size', 'misuse'];
    for (const id of neighbours) assert.ok(fill[id] > 0.4, `${id} measured ${fill[id]}`);
    const floor = Math.min(...neighbours.map((id) => fill[id]));
    assert.ok(
      fill.colourways >= floor - 0.01,
      `the colourways page covers ${(fill.colourways * 100).toFixed(1)} per cent of its canvas, against `
      + neighbours.map((id) => `${id} ${(fill[id] * 100).toFixed(1)}`).join(', '),
    );
  });

  test('with nothing approved the page is a bracketed placeholder, not a missing page', () => {
    const out = renderBrandDeck({ brand, system });
    const page = /<section class="page"[^>]*id="colourways"[\s\S]*?<\/section>/.exec(out.html);
    assert.ok(page, 'the page is still there');
    assert.match(page[0], new RegExp(`\\[${PLACEHOLDER}: an approved colourway`));
    assert.equal(out.pages.find((p) => p.id === 'colourways').absent, null, 'it is a rendered page, not an absent one');
  });

  test('a dealt but unapproved colourway is not shown as approved', () => {
    const b = JSON.parse(JSON.stringify(brand));
    b.identity.logo.colourways = [{ id: 'one-ink', name: 'One ink', ground: 'neutral.paper', regions: [{ ink: '#111111', role: 'neutral.ink' }], approvedBy: null }];
    const out = renderBrandDeck({ brand: b, system, assets: { 'assets/logos/muddy-paws-primary.svg': { kind: 'svg', markup: ONE_INK } } });
    const page = /<section class="page"[^>]*id="colourways"[\s\S]*?<\/section>/.exec(out.html);
    assert.match(page[0], new RegExp(`\\[${PLACEHOLDER}: an approved colourway`));
    assert.match(page[0], /nobody has approved one/);
  });

  test('moving the palette leaves the recorded rendition stale, and `brandi assets` is what clears it', async () => {
    const { dir } = await project('palette-move');
    await L.planColourStage(dir);
    const approved = await L.approveColourway(dir, 'brand-on-paper', { approvedBy: 'Jake' });
    assert.equal(approved.ok, true);
    const rendition = path.join(dir, approved.file);
    assert.match(await readFile(rendition, 'utf8'), /#1F6F4A/i, 'approved against the green palette');

    // `check` exits 1 when it finds something, which is the point of it, so
    // the exit code is read from the JSON rather than from the process.
    const brandi = async (args) => {
      try {
        return JSON.parse((await run(process.execPath, [CLI, ...args, '--json'], { cwd: dir, timeout: 120000 })).stdout);
      } catch (e) {
        if (e.stdout) return JSON.parse(e.stdout);
        throw e;
      }
    };
    const offPalette = async () => (await brandi(['check', 'brand'])).findings.filter((f) => f.rule === 'logo-off-palette');

    await brandi(['set', 'identity.colour.primary', '#B31E3C']);
    await brandi(['system']);
    // The recorded rendition is a file, so it does not move with the palette
    // and the guardian is right to say so. This is the half that already worked.
    const stale = await offPalette();
    assert.equal(stale.length, 1, `expected one stale-rendition finding, got ${JSON.stringify(stale)}`);
    assert.match(stale[0].file, /colourway-brand-on-paper\.svg$/);
    assert.match(stale[0].fix, /brandi assets/, 'the fix line names the command that has to clear it');

    // And the command it names has to actually clear it, which is the half
    // that did not: the record is a mapping, so its artwork is derived again.
    const built = await brandi(['assets']);
    assert.deepEqual(built.refreshed, [path.join('brand', 'logo', 'master', 'colourway-brand-on-paper.svg')]);
    const redrawn = await readFile(rendition, 'utf8');
    assert.match(redrawn, /#B31E3C/i, 'redrawn in the palette that is there now');
    assert.equal(/#1F6F4A/i.test(redrawn), false, 'and nothing of the palette that was');
    assert.deepEqual(await offPalette(), [], 'the remedy the tool printed clears the finding it printed');

    // The approval is a decision a person made, and redrawing the artwork is
    // not a reason to claim they made it again.
    const record = JSON.parse(await readFile(path.join(dir, 'brand', 'brand.json'), 'utf8'))
      .identity.logo.colourways.find((c) => c.id === 'brand-on-paper');
    assert.equal(record.approvedBy, 'Jake');
    assert.equal(record.approvedOn, approved.record.approvedOn);
  });

  test('a colourway record pointed at the master does not have `brandi assets` paint over the drawing', async () => {
    const { dir } = await project('palette-point-at-master');
    await L.planColourStage(dir);
    await L.approveColourway(dir, 'brand-on-paper', { approvedBy: 'Jake' });
    // Only a hand-edited brand.json can say this, and a hand-edited brand file
    // is where the damage would come from: the master is the one file in the
    // project that nothing can derive again.
    const brandFile = path.join(dir, 'brand', 'brand.json');
    const b = JSON.parse(await readFile(brandFile, 'utf8'));
    b.identity.logo.colourways[0].file = 'brand/logo/master/primary.svg';
    await writeFile(brandFile, JSON.stringify(b, null, 2));
    const master = path.join(dir, 'brand', 'logo', 'master', 'primary.svg');
    const before = await readFile(master, 'utf8');

    const built = JSON.parse((await run(process.execPath, [CLI, 'assets', '--json'], { cwd: dir, timeout: 120000 })).stdout);
    assert.deepEqual(built.refreshed, [], 'nothing outside the colourway-<id>.svg shape is rewritten');
    assert.equal(await readFile(master, 'utf8'), before, 'the master is byte for byte what it was');
  });

  test('a logo file painted off the palette is a finding', async () => {
    const dir = path.join(root, 'guard-offpalette');
    await mkdir(path.join(dir, 'assets'), { recursive: true });
    await writeFile(path.join(dir, 'assets', 'mark.svg'), C.recolourSvg(ONE_INK, { '#111111': '#7A2FBF' }));
    const b = JSON.parse(JSON.stringify(brand));
    b.identity.logo.files = [{ path: 'assets/mark.svg', role: 'primary' }];
    const findings = await checkLogoColour({ brand: b, system, root: dir });
    assert.equal(findings.length, 1);
    assert.equal(findings[0].rule, 'logo-off-palette');
    assert.equal(findings[0].level, 'error');
    assert.match(findings[0].message, /#7A2FBF/);
    assert.match(findings[0].fix, /defined by role/);
  });

  test('a colourway derived from the palette is not a finding', async () => {
    const dir = path.join(root, 'guard-onpalette');
    await mkdir(path.join(dir, 'assets'), { recursive: true });
    await writeFile(path.join(dir, 'assets', 'mark.svg'), C.recolourSvg(ONE_INK, { '#111111': '#1F6F4A' }));
    const b = JSON.parse(JSON.stringify(brand));
    b.identity.logo.colourways = [{ id: 'brand-on-paper', name: 'Brand on paper', file: 'assets/mark.svg', regions: [], approvedBy: 'Jake' }];
    assert.deepEqual(await checkLogoColour({ brand: b, system, root: dir }), []);
  });

  test('a logo path that climbs out of the project is not read', async () => {
    const dir = path.join(root, 'guard-escape');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(root, 'outside.svg'), C.recolourSvg(ONE_INK, { '#111111': '#7A2FBF' }));
    const b = JSON.parse(JSON.stringify(brand));
    b.identity.logo.files = [{ path: '../outside.svg', role: 'primary' }];
    assert.deepEqual(await checkLogoColour({ brand: b, system, root: dir }), []);
  });

  test('the silhouette and the one-ink rendition are never a finding', async () => {
    const dir = path.join(root, 'guard-neutral');
    await mkdir(path.join(dir, 'assets'), { recursive: true });
    await writeFile(path.join(dir, 'assets', 'black.svg'), ONE_INK);
    await writeFile(path.join(dir, 'assets', 'white.svg'), C.recolourSvg(ONE_INK, { '#111111': '#FFFFFF' }));
    const b = JSON.parse(JSON.stringify(brand));
    b.identity.logo.files = [{ path: 'assets/black.svg', role: 'primary' }, { path: 'assets/white.svg', role: 'mono-white' }];
    assert.deepEqual(await checkLogoColour({ brand: b, system, root: dir }), []);
  });
});

// ---------------------------------------------------------------------------
// End to end
// ---------------------------------------------------------------------------

describe('the whole stage, on a real mark', () => {
  test('plan, audit, board, approve, and the outcome reaches brand.json', needsChrome, async () => {
    const { dir } = await project('e2e-colour', { mark: TWO_APART });

    const plan = await L.planColourStage(dir);
    assert.equal(plan.ok, true);
    assert.equal(plan.colourways.length, 6);

    const audit = await L.auditColourStage(dir, { chrome: CHROME });
    assert.equal(audit.ok, true);
    assert.equal(audit.rendered, true);
    assert.ok(audit.colourways.every((c) => c.verdict !== 'unverified'));

    const boards = await L.buildColourBoards(dir);
    assert.equal(boards.ok, true);
    assert.ok(existsSync(path.join(boards.dir, 'canvas.json')));
    assert.ok(existsSync(path.join(boards.dir, 'Colourways.dc.html')));
    // The concept round's own canvas is untouched.
    assert.equal(path.basename(boards.dir), 'canvas-colour');

    const approved = await L.approveColourway(dir, 'two-colour', { approvedBy: 'Jake' });
    assert.equal(approved.ok, true);
    assert.ok(existsSync(path.join(dir, approved.file)));

    const state = await L.loadState(dir);
    assert.deepEqual(state.colour.approved, ['two-colour']);
    assert.equal((await L.forgeStatus(dir)).next, 'done');
  });
});
