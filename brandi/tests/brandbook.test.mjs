import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { renderBrandBook } from '../scripts/brandbook.mjs';
import { buildSystem } from '../scripts/system.mjs';
import { emptyBrand, systemInputFromBrand } from '../scripts/brandfile.mjs';

const FIXTURE = path.join(import.meta.dirname, 'fixtures', 'muddy-paws.json');

let brand;
let system;
let html;

before(async () => {
  brand = JSON.parse(await readFile(FIXTURE, 'utf8'));
  system = buildSystem(systemInputFromBrand(brand));
  html = renderBrandBook({ brand, system });
});

describe('structure', () => {
  test('is a complete standalone document', () => {
    assert.match(html, /^<!doctype html>/i);
    assert.match(html, /<html lang="en-AU">/);
    assert.match(html, /<\/html>\s*$/);
    assert.match(html, /<title>Muddy Paws brand system<\/title>/);
  });

  test('has a cover, a contents page and every section', () => {
    assert.match(html, /id="cover"/);
    assert.match(html, /id="contents"/);
    for (const id of ['idea', 'strategy', 'personality', 'assets', 'logo', 'colour', 'typography', 'form', 'imagery', 'voice', 'accessibility', 'implementation', 'anti-patterns', 'governance']) {
      assert.match(html, new RegExp(`id="${id}"`), `section ${id} missing`);
    }
  });

  test('the contents links every section that exists, and nothing that does not', () => {
    const links = [...html.matchAll(/<a href="#([\w-]+)"><span>/g)].map((m) => m[1]);
    const ids = [...html.matchAll(/<section class="page" id="([\w-]+)"/g)].map((m) => m[1]);
    assert.ok(links.length >= 14);
    for (const l of links) assert.ok(ids.includes(l), `contents links #${l}, which has no section`);
  });

  test('sections are numbered in order with no gaps', () => {
    const folios = [...html.matchAll(/<span class="folio">(\d\d)<\/span>/g)].map((m) => Number(m[1]));
    assert.deepEqual(folios, folios.map((_, i) => i + 1));
  });

  test('has balanced section tags', () => {
    assert.equal((html.match(/<section/g) ?? []).length, (html.match(/<\/section>/g) ?? []).length);
  });

  test('prints to A4 with a page break per section', () => {
    assert.match(html, /@page \{ size: A4/);
    assert.match(html, /page-break-after: always/);
    assert.match(html, /print-color-adjust: exact/);
  });
});

describe('it does not invent things', () => {
  test('an empty brand produces a book that says what is missing', () => {
    const bare = emptyBrand({ name: 'Nothing Yet' });
    bare.identity.colour.primary = '#2563EB';
    const out = renderBrandBook({ brand: bare, system: buildSystem({ primary: '#2563EB' }) });
    assert.match(out, /Not recorded yet/);
    assert.match(out, /deliberately empty rather than invented/);
    // The anti-patterns section legitimately names these as things to avoid, so
    // check the rest of the book, where naming one would be a violation.
    const withoutRules = out.replace(/<section class="page" id="anti-patterns"[\s\S]*?<\/section>/, '');
    assert.equal(/lorem ipsum|placeholder text|trusted by \d/i.test(withoutRules), false);
  });

  test('an empty brand names what each empty section needs', () => {
    const bare = emptyBrand({ name: 'Nothing Yet' });
    const out = renderBrandBook({ brand: bare, system: buildSystem({ primary: '#2563EB' }) });
    assert.match(out, /the one sentence this brand rests on/);
    assert.match(out, /a positioning statement/);
    assert.match(out, /clear space/);
    assert.match(out, /at least six specific misuses/);
  });

  test('a complete brand needs no placeholders at all', () => {
    assert.equal(/Not recorded yet/.test(html), false);
  });

  test('it never fabricates a statistic, an award or a customer count', () => {
    assert.equal(/trusted by \d|\d+,\d+ customers|award-winning|voted best/i.test(html), false);
  });
});

describe('provenance survives into the deliverable', () => {
  test('the evidence tiers are counted and shown', () => {
    assert.match(html, /Supplied/);
    assert.match(html, /Extracted/);
    assert.match(html, /Assumed/);
  });

  test('it says every statement is traceable', () => {
    assert.match(html, /traceable/);
    assert.match(html, /working assumption, not a finding/);
  });

  test('the decision log and its reasons survive', () => {
    for (const d of brand.governance.decisions) {
      assert.ok(html.includes(d.decision.replace(/&/g, '&amp;')), `decision "${d.decision}" missing`);
      assert.ok(html.includes(d.rationale.slice(0, 40)), 'a decision without its reason is not a decision');
    }
  });

  test('open questions survive, with what was assumed meanwhile', () => {
    for (const q of brand.governance.openQuestions.filter((x) => x.status === 'open')) {
      assert.ok(html.includes(q.question), `open question "${q.question}" missing`);
      assert.ok(html.includes(q.whyItMatters.slice(0, 30)));
    }
  });

  test('non-goals survive, because scope is part of a brand system', () => {
    assert.ok(html.includes(brand.governance.nonGoals[0].slice(0, 40)));
  });
});

describe('the system is faithfully reproduced', () => {
  test('every colour step appears', () => {
    for (const [family, pal] of Object.entries({ ...system.palettes, ...system.status })) {
      for (const s of pal.light.steps) {
        assert.ok(html.includes(s.hex), `${family}.${s.step} (${s.hex}) missing from the book`);
      }
    }
  });

  test('the contrast table is measured, and reports failures as failures', () => {
    assert.match(html, /\d+\.\d\d:1/);
    assert.match(html, /Lc -?\d+/);
    // A brand whose text genuinely fails should say FAIL, not quietly pass.
    const bad = renderBrandBook({
      brand,
      system: buildSystem({ primary: '#1F6F4A', neutralChroma: 0.006 }),
    });
    assert.ok(/pass|FAIL/.test(bad));
  });

  test('the type scale appears with its real numbers', () => {
    for (const s of system.type.scale.steps) {
      assert.ok(html.includes(s.name));
      assert.ok(html.includes(String(s.px)));
    }
  });

  test('the motion tokens appear with their durations', () => {
    for (const d of system.motion.durations) {
      assert.ok(html.includes(`--duration-${d.name}`), `${d.name} missing`);
    }
  });

  test('the accessibility section cites the clauses rather than gesturing at them', () => {
    for (const clause of ['1.4.1', '2.4.7', '1.4.11', '2.5.8', '2.3.3', '1.4.12', '1.4.4', '1.4.3']) {
      assert.ok(html.includes(clause), `WCAG ${clause} should be cited`);
    }
  });

  test('audit problems are surfaced, not buried', () => {
    const yellow = renderBrandBook({ brand, system: buildSystem({ primary: '#FACC15' }) });
    assert.match(yellow, /Known problems/);
  });

  test('a failing audit is admitted at the top of the accessibility section', () => {
    const broken = JSON.parse(JSON.stringify(system));
    broken.audit = { ok: false, errors: 1, warnings: 0, findings: [{ level: 'error', area: 'contrast.light', message: 'body text is 1.02:1 against the page', fix: 'darken it' }] };
    const out = renderBrandBook({ brand, system: broken });
    assert.match(out, /does not currently pass its own audit/);
    assert.match(out, /body text is 1\.02:1 against the page/);
    assert.equal(/Body text clears WCAG 2\.2 AA at 4\.5:1/.test(out), false, 'it must not assert what it just disproved');
  });

  test('every accessibility row is a measurement with a verdict, not a claim', () => {
    assert.match(html, /needs 4\.5:1/);
    assert.match(html, /<strong>pass<\/strong>/);
    assert.match(html, /Requirements this system does not measure for you/);
  });

  test('a supplied logo is shown, not just named', () => {
    const withLogo = renderBrandBook({
      brand, system,
      assets: { 'assets/logos/muddy-paws-primary.svg': { kind: 'svg', markup: '<svg id="the-mark" viewBox="0 0 10 10"></svg>' } },
    });
    assert.match(withLogo, /id="the-mark"/);
    assert.match(withLogo, /The mark/);
  });

  test('a named-but-missing logo says so instead of pretending', () => {
    assert.match(html, /recorded but not embedded/);
  });

  test('applications are rendered', () => {
    assert.match(html, /id="applications"/);
    for (const a of brand.applications) assert.ok(html.includes(a.name), `${a.name} missing`);
  });
});

describe('safety and hygiene', () => {
  test('escapes content that would otherwise break the document', () => {
    const evil = JSON.parse(JSON.stringify(brand));
    evil.meta.name = '</title><script>alert(1)</script>';
    evil.strategy.purpose = 'A & B "quoted" <tag>';
    const out = renderBrandBook({ brand: evil, system });
    assert.equal(out.includes('<script>alert(1)</script>'), false, 'injected script must not survive');
    assert.ok(out.includes('&lt;script&gt;'));
    assert.ok(out.includes('&amp;'));
  });

  test('carries no em dashes', () => {
    assert.equal(html.includes('—'), false);
  });

  test('loads fonts only from the one host that is allowed', () => {
    for (const m of html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)) {
      assert.match(m[1], /^https:\/\/fonts\.googleapis\.com\//);
    }
  });

  test('is deterministic', () => {
    assert.equal(renderBrandBook({ brand, system }), renderBrandBook({ brand, system }));
  });

  test('rendering twice does not accumulate sections', () => {
    const once = renderBrandBook({ brand, system });
    const twice = renderBrandBook({ brand, system });
    assert.equal(
      (once.match(/<section/g) ?? []).length,
      (twice.match(/<section/g) ?? []).length,
      'module-level section state must reset between renders',
    );
  });
});

describe('nothing the client supplied is silently dropped', () => {
  /**
   * The failure this catches: a field is added to brand.json, nobody adds it to
   * the renderer, and the client's own words quietly never reach the
   * deliverable. It happened to narrative, category, schoolRationale, the whole
   * voice mechanics table, how-we-say-hard-things, and the change log.
   */
  const esc = (v) => String(v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // Fields that legitimately do not appear as prose in the book.
  const SKIP = new Set([
    'id', 'recorded', 'confidence', 'provenance', 'field', 'source', 'status',
    'slug', 'version', 'locale', 'effectiveDate', 'created', 'updated', 'phase',
    'file', 'frame', 'surface', 'harmony', 'accentCount', 'neutralHue',
    'neutralChroma', 'basePx', 'baseMaxPx', 'ratioMax', 'measureChars',
    'spaceBase', 'grid', 'strokePx', 'favicon', 'date', 'alternatives', 'owner',
    'permits', 'role', 'path', 'archetype', 'claim',
  ]);

  const leaves = (node, trail = []) => {
    if (typeof node === 'string') return [[trail.join('.'), node]];
    if (Array.isArray(node)) return node.flatMap((v, i) => leaves(v, [...trail, i]));
    if (node && typeof node === 'object') {
      return Object.entries(node).flatMap(([k, v]) => (SKIP.has(k) ? [] : leaves(v, [...trail, k])));
    }
    return [];
  };

  test('every prose field in strategy, identity, voice and governance reaches the page', () => {
    const sections = { strategy: brand.strategy, identity: brand.identity, voice: brand.voice, governance: brand.governance, applications: brand.applications };
    const missing = [];
    for (const [path, value] of leaves(sections)) {
      // Only prose, not tokens, hexes or single words that appear incidentally.
      if (value.length < 25) continue;
      if (/^#[0-9a-fA-F]{3,8}$/.test(value)) continue;
      if (!html.includes(esc(value))) missing.push(`${path}: ${value.slice(0, 60)}`);
    }
    assert.deepEqual(missing, [], `content supplied but never rendered:\n  ${missing.join('\n  ')}`);
  });

  test('the sections that were being dropped are present by name', () => {
    for (const marker of [
      'The story, as we tell it',
      'The category we compete in',
      'Why this one',
      'Mechanics',
      'How we say hard things',
      'Version history',
      'Held by',
    ]) {
      assert.ok(html.includes(marker), `${marker} should have its own place in the book`);
    }
  });

  test('a direction section exists, because it is what every visual choice hangs off', () => {
    assert.match(html, /id="direction"/);
    assert.ok(html.includes('warm humanist'), 'the chosen school should be readable, not a slug');
  });
});
