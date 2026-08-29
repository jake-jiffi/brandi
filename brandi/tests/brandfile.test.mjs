import { test, describe } from 'node:test';
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
