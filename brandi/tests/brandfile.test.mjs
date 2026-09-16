import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import * as B from '../scripts/brandfile.mjs';
import { buildSystem } from '../scripts/system.mjs';

const FIXTURE = path.join(import.meta.dirname, 'fixtures', 'muddy-paws.json');
const loadFixture = async () => JSON.parse(await readFile(FIXTURE, 'utf8'));

describe('emptyBrand', () => {
  test('has every section a downstream consumer reads', () => {
    const b = B.emptyBrand({ name: 'Acme' });
    for (const key of ['brandi', 'meta', 'evidence', 'strategy', 'identity', 'voice', 'governance', 'applications']) {
      assert.ok(b[key] !== undefined, `missing ${key}`);
    }
    assert.equal(b.meta.name, 'Acme');
    assert.equal(b.meta.slug, 'acme');
    assert.equal(b.brandi.phase, 'recon');
  });

  test('validates as an empty but well-formed file', () => {
    assert.equal(B.validateBrand(B.emptyBrand()).ok, true);
  });

  test('is serialisable and survives a round trip', () => {
    const b = B.emptyBrand({ name: 'Acme' });
    assert.deepEqual(JSON.parse(JSON.stringify(b)), b);
  });
});

describe('slugify', () => {
  test('handles the awkward cases', () => {
    assert.equal(B.slugify('Muddy Paws'), 'muddy-paws');
    assert.equal(B.slugify("Jane's Café & Co."), 'jane-s-cafe-co');
    assert.equal(B.slugify('  --Trim Me--  '), 'trim-me');
    assert.equal(B.slugify('!!!'), 'brand', 'never returns an empty slug');
    assert.ok(B.slugify('x'.repeat(200)).length <= 64);
  });
});

describe('evidence and decisions', () => {
  test('records provenance and derives confidence from it', () => {
    const b = B.emptyBrand();
    const e = B.addEvidence(b, { claim: 'The sign is green.', provenance: 'extracted', source: 'photo' });
    assert.equal(e.confidence, 'high');
    assert.equal(b.evidence.length, 1);
    const a = B.addEvidence(b, { claim: 'They probably want warmth.', provenance: 'assumed' });
    assert.equal(a.confidence, 'medium');
    assert.equal(a.id, 'e2');
  });

  test('refuses evidence with no claim or an invented provenance tier', () => {
    const b = B.emptyBrand();
    assert.throws(() => B.addEvidence(b, { claim: '', provenance: 'supplied' }), TypeError);
    assert.throws(() => B.addEvidence(b, { claim: 'x', provenance: 'vibes' }), TypeError);
  });

  test('a decision without a reason is not a decision', () => {
    const b = B.emptyBrand();
    assert.throws(() => B.addDecision(b, { decision: 'Green.' }), TypeError);
    const d = B.addDecision(b, { decision: 'Green.', rationale: 'It is already on the shopfront.' });
    assert.match(d.date, /^\d{4}-\d{2}-\d{2}$/);
  });

  test('an open question records what was assumed meanwhile', () => {
    const b = B.emptyBrand();
    assert.throws(() => B.addOpenQuestion(b, { question: 'When is peak?' }), TypeError);
    const q = B.addOpenQuestion(b, { question: 'When is peak?', whyItMatters: 'It decides the headline.', assumedMeanwhile: 'Weekday evenings.' });
    assert.equal(q.status, 'open');
    assert.equal(q.assumedMeanwhile, 'Weekday evenings.');
  });
});

describe('validateBrand', () => {
  test('the fixture is complete and clean', async () => {
    const v = B.validateBrand(await loadFixture(), { phase: 'publish' });
    assert.equal(v.ok, true, v.errors.map((e) => `${e.field}: ${e.message}`).join('\n'));
    assert.deepEqual(v.warnings, [], v.warnings.map((w) => `${w.field}: ${w.message}`).join('\n'));
  });

  test('rejects a colour that is not a colour', async () => {
    const b = await loadFixture();
    b.identity.colour.primary = 'forest green';
    const v = B.validateBrand(b);
    assert.equal(v.ok, false);
    assert.ok(v.errors.some((e) => e.field === 'identity.colour.primary'));
  });

  test('rejects body type below the legibility floor', async () => {
    const b = await loadFixture();
    b.identity.type.basePx = 10;
    assert.equal(B.validateBrand(b).ok, false);
  });

  test('warns about body type below the browser default', async () => {
    const b = await loadFixture();
    b.identity.type.basePx = 14;
    const v = B.validateBrand(b);
    assert.equal(v.ok, true);
    assert.ok(v.warnings.some((w) => w.field === 'identity.type.basePx'));
  });

  test('warns when there is no pairing, only a font', async () => {
    const b = await loadFixture();
    b.identity.type.display = b.identity.type.body;
    assert.ok(B.validateBrand(b).warnings.some((w) => /no pairing/.test(w.message)));
  });

  test('warns about a missing font licence', async () => {
    const b = await loadFixture();
    b.identity.type.licences = [];
    const v = B.validateBrand(b);
    assert.equal(v.warnings.filter((w) => /licence/.test(w.message)).length, 3);
  });

  test('warns about too many accents', async () => {
    const b = await loadFixture();
    b.identity.colour.accents = ['#111111', '#222222', '#333333'];
    assert.ok(B.validateBrand(b).warnings.some((w) => /stops accenting/.test(w.message)));
  });

  test('rejects neutrals that are not neutral', async () => {
    const b = await loadFixture();
    b.identity.colour.neutralChroma = 0.2;
    assert.equal(B.validateBrand(b).ok, false);
  });

  test('rejects a spacing base that fights every UI kit', async () => {
    const b = await loadFixture();
    b.identity.spaceBase = 7;
    assert.equal(B.validateBrand(b).ok, false);
  });

  test('warns about a messaging pillar with no proof', async () => {
    const b = await loadFixture();
    b.strategy.messaging.pillars.push({ claim: 'The best in the world', proof: [] });
    assert.ok(B.validateBrand(b).warnings.some((w) => /no proof points/.test(w.message)));
  });

  test('warns about a logo with too few documented misuses', async () => {
    const b = await loadFixture();
    b.identity.logo.misuse = ['stretch it'];
    const w = B.validateBrand(b).warnings.find((x) => x.field === 'identity.logo.misuse');
    assert.ok(w, 'a one-item misuse list must warn');
    assert.match(w.fix, /at least six/);
  });

  test('warns about a logo with no vector master', async () => {
    const b = await loadFixture();
    b.identity.logo.files = [{ path: 'logo.png' }];
    assert.ok(B.validateBrand(b).warnings.some((w) => /vector/.test(w.message)));
  });

  test('warns about a voice attribute with no opposite', async () => {
    const b = await loadFixture();
    delete b.voice.attributes[0].notThis;
    assert.ok(B.validateBrand(b).warnings.some((w) => /no opposite/.test(w.message)));
  });

  test('rejects an unknown phase', () => {
    const b = B.emptyBrand();
    b.brandi.phase = 'vibing';
    assert.equal(B.validateBrand(b).ok, false);
  });

  test('survives being handed rubbish', () => {
    for (const junk of [null, undefined, 'a string', 42]) {
      assert.equal(B.validateBrand(junk).ok, false);
    }
  });
});

describe('phase readiness', () => {
  test('an empty brand cannot start strategy', () => {
    const v = B.validateBrand(B.emptyBrand(), { phase: 'strategy' });
    assert.equal(v.ok, false);
    assert.ok(v.errors.some((e) => e.field === 'strategy.purpose'));
    assert.ok(v.errors.some((e) => /nobody/.test(e.message)), 'the message should say why, not just what');
  });

  test('the fixture is ready for every phase', async () => {
    const b = await loadFixture();
    for (const p of B.PHASES) {
      assert.equal(B.validateBrand(b, { phase: p.id }).ok, true, `not ready for ${p.id}`);
    }
  });

  test('phases run in order and end', () => {
    assert.equal(B.nextPhase('recon'), 'intake');
    assert.equal(B.nextPhase('publish'), null);
    assert.equal(B.nextPhase('nonsense'), null);
  });

  test('completing a phase advances the cursor', async () => {
    const b = await loadFixture();
    b.brandi.completed = [];
    b.brandi.phase = 'recon';
    assert.equal(B.completePhase(b, 'recon'), 'intake');
    assert.deepEqual(b.brandi.completed, ['recon']);
  });

  test('completing twice does not duplicate', async () => {
    const b = await loadFixture();
    b.brandi.completed = [];
    B.completePhase(b, 'recon');
    B.completePhase(b, 'recon');
    assert.deepEqual(b.brandi.completed, ['recon']);
  });

  test('refuses to advance past a file that is not ready', () => {
    const b = B.emptyBrand();
    assert.throws(() => B.completePhase(b, 'strategy'), /Cannot complete/);
    assert.equal(b.brandi.phase, 'recon', 'a refused advance must not move the cursor');
  });

  test('refuses an unknown phase', () => {
    assert.throws(() => B.completePhase(B.emptyBrand(), 'vibing'), TypeError);
  });

  test('refuses a phase whose predecessors are not complete', async () => {
    const b = await loadFixture();
    b.brandi.completed = [];
    b.brandi.phase = 'recon';
    assert.throws(() => B.completePhase(b, 'intake'), /before "recon" is complete/);
    assert.equal(b.brandi.phase, 'recon', 'a refused completion must not move the cursor');
    assert.deepEqual(b.brandi.completed, []);
    B.completePhase(b, 'recon');
    assert.equal(B.completePhase(b, 'intake'), 'strategy');
  });

  test('re-completing an earlier phase leaves the cursor on the first incomplete one', async () => {
    const b = await loadFixture();
    b.brandi.completed = ['recon', 'intake'];
    b.brandi.phase = 'strategy';
    assert.equal(B.completePhase(b, 'recon'), 'strategy');
    b.brandi.completed = B.PHASES.map((p) => p.id);
    assert.equal(B.completePhase(b, 'recon'), 'publish', 'nothing is pending, so the cursor stays at the end');
  });
});

describe('checkFieldPath', () => {
  let schema;
  before(async () => {
    schema = JSON.parse(await readFile(path.join(import.meta.dirname, '..', 'schemas', 'brand.schema.json'), 'utf8'));
  });

  test('walks properties, list indexes and nested objects', () => {
    for (const p of ['meta.name', 'strategy.audiences.0.name', 'brandi.completed.3']) {
      assert.equal(B.checkFieldPath(schema, p, 'x').ok, true, p);
    }
    // A number field takes a number, so the walk into it is tested with one
    // (R2-N-03 refuses the string 'x' there, as the shape test below asserts).
    assert.equal(B.checkFieldPath(schema, 'identity.logo.minSize.screenPx', 28).ok, true);
    assert.equal(B.checkFieldPath(schema, 'identity.logo.minSize.screenPx', '28').value, 28, 'the string the command line passes');
    assert.equal(B.checkFieldPath(schema, 'identity.colour.accents.1', '#1F6F4A').ok, true);
  });

  test('refuses a key the schema does not have, and names the nearest one', () => {
    const r = B.checkFieldPath(schema, 'voice.attributes.0.not', 'gushing');
    assert.equal(r.ok, false);
    assert.equal(r.suggestion, 'voice.attributes.0.notThis');
    assert.match(B.checkFieldPath(schema, 'metta.name', 'x').error, /Did you mean meta/);
    const far = B.checkFieldPath(schema, 'nonexistent.path.here', 'x');
    assert.equal(far.ok, false);
    assert.equal(far.suggestion, null);
    assert.match(far.error, /The fields under the brand file are/);
  });

  test('refuses an index into something that is not a list, and a key on a scalar', () => {
    assert.match(B.checkFieldPath(schema, 'meta.0', 'x').error, /not a list/);
    assert.match(B.checkFieldPath(schema, 'identity.colour.primary.foo', 'x').error, /not an object/);
  });

  test('lets free-form parts of the file through', () => {
    assert.equal(B.checkFieldPath(schema, 'applications.0.anything.at.all', 'x').ok, true);
    assert.equal(B.checkFieldPath(schema, 'voice.mechanics.contractions', 'yes').ok, true);
  });

  test('R2-N-03: refuses a value whose shape is not the schema\'s, naming the shape it wants', () => {
    const licences = B.checkFieldPath(schema, 'identity.type.licences', { display: 'x' });
    assert.equal(licences.ok, false);
    assert.match(licences.error, /identity\.type\.licences must be a list, not an object/);
    assert.match(licences.error, /Expected shape: \[\{"family": …, "source": …, "permits": …\}\]/);
    const audiences = B.checkFieldPath(schema, 'strategy.audiences', '"s"');
    assert.equal(audiences.ok, false);
    assert.match(audiences.error, /strategy\.audiences must be a list, not a string/);
    const misuse = B.checkFieldPath(schema, 'identity.logo.misuse', { a: 1 });
    assert.equal(misuse.ok, false);
    assert.match(misuse.error, /identity\.logo\.misuse must be a list, not an object/);
    // Scalars are held to their type too.
    assert.match(B.checkFieldPath(schema, 'meta.name', true).error, /meta\.name must be a string \(or null\), not a boolean/);
    assert.match(B.checkFieldPath(schema, 'identity.logo.minSize.screenPx', 'wide').error, /must be a number \(or null\), not a string\. Expected shape: 0/);
    assert.match(B.checkFieldPath(schema, 'voice.tagline.locked', 'no').error, /must be true or false \(or null\), not a string/);
  });

  test('R2-N-03: the right shape passes, a numeric string becomes a number, and a oneOf list takes either member', () => {
    const ok = (p, v) => { const r = B.checkFieldPath(schema, p, v); assert.equal(r.ok, true, `${p}: ${r.error}`); return r.value; };
    assert.deepEqual(ok('identity.type.licences', [{ family: 'Bitter', source: 'Google Fonts', permits: 'OFL' }]), [{ family: 'Bitter', source: 'Google Fonts', permits: 'OFL' }]);
    assert.deepEqual(ok('strategy.audiences', [{ name: 'Regulars' }]), [{ name: 'Regulars' }]);
    assert.deepEqual(ok('identity.logo.misuse', ['stretch it', { what: 'rotate it', why: 'it reads as a mistake' }]), ['stretch it', { what: 'rotate it', why: 'it reads as a mistake' }]);
    assert.equal(ok('identity.logo.misuse.0', 'stretch it'), 'stretch it');
    assert.deepEqual(ok('identity.logo.misuse.0', { what: 'rotate it' }), { what: 'rotate it' });
    assert.equal(ok('identity.logo.minSizes.0.printMm', '22'), 22, 'a numeric string offered to a number field');
    assert.equal(ok('identity.logo.minSizes.0.printMm', 22), 22);
    assert.equal(ok('voice.tagline.locked', false), false);
    assert.equal(ok('voice.tagline.lockup', null), null, 'a nullable string takes null');
    assert.equal(ok('meta.name', '007'), '007', 'a string field keeps a numeric-looking string');
  });

  test('refuses a non-hex where the schema says hex, in a scalar and in a list', () => {
    assert.match(B.checkFieldPath(schema, 'identity.colour.primary', '#GG0000').error, /not a hex colour/);
    assert.match(B.checkFieldPath(schema, 'identity.colour.accents.0', 'green').error, /not a hex colour/);
    assert.match(B.checkFieldPath(schema, 'identity.colour.accents', ['#1F6F4A', '#GG0000']).error, /#GG0000/);
    assert.equal(B.checkFieldPath(schema, 'identity.colour.primary', '#1F6F4A').ok, true);
    assert.equal(B.checkFieldPath(schema, 'identity.colour.primary', null).ok, true, 'null is how a colour is unset');
  });
});

describe('status', () => {
  test('reports the journey in order with the current step marked', async () => {
    const s = B.status(await loadFixture());
    assert.equal(s.name, 'Muddy Paws');
    assert.equal(s.phases.length, B.PHASES.length);
    assert.equal(s.phases.filter((p) => p.current).length, 1);
    assert.equal(s.phases.at(-1).current, true, 'the fixture sits at publish');
    assert.equal(s.counts.openQuestions, 2);
    assert.equal(s.counts.decisions, 3);
  });

  test('handles a brand with nothing in it', () => {
    const s = B.status(B.emptyBrand());
    assert.equal(s.name, '(unnamed)');
    assert.equal(s.counts.evidence, 0);
  });
});

describe('systemInputFromBrand', () => {
  test('carries every decision through to the system builder', async () => {
    const b = await loadFixture();
    const input = B.systemInputFromBrand(b);
    assert.equal(input.primary, '#1F6F4A');
    assert.deepEqual(input.accents, ['#D4823A']);
    assert.equal(input.shape, 'rounded');
    assert.equal(input.motion, 'restrained');
    assert.equal(input.type.display, 'Bitter');
    assert.equal(input.type.ratio, 'perfect-fourth');
    assert.equal(input.measureChars, 64);
  });

  test('an empty accents array means derive one, not have none', () => {
    const b = B.emptyBrand();
    b.identity.colour.primary = '#2563EB';
    assert.equal(B.systemInputFromBrand(b).accentCount, 1);
  });

  test('an explicit zero really means none', () => {
    const b = B.emptyBrand();
    b.identity.colour.primary = '#2563EB';
    b.identity.colour.accentCount = 0;
    const sys = buildSystem(B.systemInputFromBrand(b));
    assert.equal(sys.palettes.accent1, undefined);
  });

  test('the fixture builds a system that passes its own audit', async () => {
    const sys = buildSystem(B.systemInputFromBrand(await loadFixture()));
    assert.equal(sys.audit.ok, true, JSON.stringify(sys.audit.findings, null, 1));
    assert.equal(sys.audit.errors, 0);
  });
});

describe('disk', () => {
  test('load rejects a file that is not JSON with a message naming the file', async () => {
    await assert.rejects(
      () => B.loadBrand(path.join(import.meta.dirname, 'brandfile.test.mjs')),
      /not valid JSON/,
    );
  });
});

describe('the provenance model', () => {
  test('every tier is weighted and explained', () => {
    for (const [name, p] of Object.entries(B.PROVENANCE)) {
      assert.equal(typeof p.weight, 'number', `${name} needs a weight`);
      assert.ok(p.weight >= 0 && p.weight <= 1);
      assert.ok(p.note.length > 10, `${name} needs an explanation`);
    }
  });

  test('an open question carries no weight, by design', () => {
    assert.equal(B.PROVENANCE.open.weight, 0);
  });

  test('what the client said and what was decided rank highest', () => {
    assert.equal(B.PROVENANCE.supplied.weight, 1);
    assert.equal(B.PROVENANCE.decided.weight, 1);
    assert.ok(B.PROVENANCE.assumed.weight < B.PROVENANCE.extracted.weight);
  });
});

describe('R3-N-08: a decision carries the day it was taken, where it was taken', () => {
  test('a late-evening decision is dated locally, not in UTC', () => {
    // 23:30 UTC on 15 September is already the 16th in Melbourne. The brand
    // file's locale is en-AU and the decision log is read as evidence of when
    // the work was done, so the UTC day is the wrong day.
    const b = B.emptyBrand({ name: 'Acme' });
    const late = new Date('2026-09-15T23:30:00Z');
    const entry = B.addDecision(b, { decision: 'Green, not blue', rationale: 'It is already the shop colour', now: late });
    assert.equal(entry.date, B.localDate(late));
    assert.match(entry.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(entry.date, `${late.getFullYear()}-${String(late.getMonth() + 1).padStart(2, '0')}-${String(late.getDate()).padStart(2, '0')}`);
    // In any zone east of Greenwich that instant is the following day.
    if (-late.getTimezoneOffset() >= 30) assert.notEqual(entry.date, late.toISOString().slice(0, 10));
  });

  test('localDate pads and never drifts across the month boundary', () => {
    assert.equal(B.localDate(new Date(2026, 0, 1, 0, 0, 0)), '2026-01-01');
    assert.equal(B.localDate(new Date(2026, 11, 31, 23, 59, 0)), '2026-12-31');
    assert.equal(B.localDate(new Date(2026, 8, 5, 12, 0, 0)), '2026-09-05');
  });

  test('evidence keeps a full UTC instant, because that is a moment, not a day', () => {
    const b = B.emptyBrand({ name: 'Acme' });
    const e = B.addEvidence(b, { claim: 'They said green', provenance: 'supplied', now: new Date('2026-09-15T23:30:00Z') });
    assert.equal(e.recorded, '2026-09-15T23:30:00.000Z');
  });
});
