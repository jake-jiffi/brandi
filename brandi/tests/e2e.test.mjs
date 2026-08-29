/**
 * The whole journey, through the real command line, on a real temporary
 * project. If this passes, someone can actually use the thing.
 */
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile, writeFile, mkdir, readdir, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import path from 'node:path';

const run = promisify(execFile);
const CLI = path.join(import.meta.dirname, '..', 'scripts', 'brandi.mjs');
const FIXTURE = path.join(import.meta.dirname, 'fixtures', 'muddy-paws.json');

let dir;

/** Run the CLI and return parsed JSON. Throws with the real message on failure. */
async function cli(args, { cwd = dir, expectFail = false } = {}) {
  try {
    const { stdout } = await run(process.execPath, [CLI, ...args, '--json'], { cwd, timeout: 120000 });
    const parsed = JSON.parse(stdout);
    if (!expectFail && parsed.ok === false) {
      throw new Error(`brandi ${args[0]} reported failure: ${parsed.error ?? JSON.stringify(parsed).slice(0, 300)}`);
    }
    return parsed;
  } catch (e) {
    if (e.stdout) {
      try {
        const parsed = JSON.parse(e.stdout);
        if (expectFail) return parsed;
        throw new Error(`brandi ${args.join(' ')} failed: ${parsed.error ?? e.message}`);
      } catch (parseError) {
        if (expectFail) throw e;
      }
    }
    throw e;
  }
}

before(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'brandi-e2e-'));
});

after(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe('a brand from nothing', () => {
  test('init creates a brand file and the folders around it', async () => {
    const r = await cli(['init', '--name', 'Muddy Paws']);
    assert.equal(r.ok, true);
    assert.equal(r.phase, 'recon');
    assert.ok(existsSync(path.join(dir, 'brand', 'brand.json')));
    assert.ok(existsSync(path.join(dir, 'brand', 'assets', 'logos')));
    assert.ok(existsSync(path.join(dir, 'brand', 'canvas')));
  });

  test('init refuses to silently discard an existing brand', async () => {
    const r = await cli(['init', '--name', 'Other'], { expectFail: true });
    assert.equal(r.ok, false);
    assert.match(r.error, /already exists/);
    const brand = JSON.parse(await readFile(path.join(dir, 'brand', 'brand.json'), 'utf8'));
    assert.equal(brand.meta.name, 'Muddy Paws', 'the original must be untouched');
  });

  test('status reports the journey and what is blocking', async () => {
    const r = await cli(['status']);
    assert.equal(r.name, 'Muddy Paws');
    assert.equal(r.phases.length, 8);
    assert.equal(r.phases.filter((p) => p.current).length, 1);
  });

  test('scan finds what is already on disk and says when there is nothing', async () => {
    await mkdir(path.join(dir, 'site'), { recursive: true });
    await writeFile(path.join(dir, 'site', 'theme.css'), ':root { --a: #1F6F4A; --b: #1F6F4A; --c: #D4823A; }\nbody { font-family: "Bitter", serif; }');
    await writeFile(path.join(dir, 'site', 'logo.svg'), '<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    const r = await cli(['scan']);
    assert.equal(r.ok, true);
    assert.ok(r.vectorLogos.some((f) => f.endsWith('logo.svg')));
    assert.ok(r.tokenFiles.some((f) => f.endsWith('theme.css')));
    assert.equal(r.coloursInUse[0].hex, '#1F6F4A', 'the most used colour comes first');
    assert.ok(r.fontFamiliesInUse.includes('Bitter'));
  });

  test('system refuses to build before the decisions exist', async () => {
    const r = await cli(['system'], { expectFail: true });
    assert.equal(r.ok, false);
    assert.match(r.error, /not ready/);
  });

  test('set writes single fields, coercing types sensibly', async () => {
    await cli(['set', 'identity.colour.primary', '#1F6F4A']);
    await cli(['set', 'identity.school', 'craft-heritage']);
    await cli(['set', 'identity.type.display', 'Bitter']);
    await cli(['set', 'identity.type.body', 'Karla']);
    await cli(['set', 'identity.type.mono', 'JetBrains Mono']);
    await cli(['set', 'identity.shape', 'rounded']);
    await cli(['set', 'identity.spaceBase', '4']);
    await cli(['set', 'strategy.purpose', 'Make washing the dog the best twenty minutes of the walk.']);
    const brand = JSON.parse(await readFile(path.join(dir, 'brand', 'brand.json'), 'utf8'));
    assert.equal(brand.identity.colour.primary, '#1F6F4A');
    assert.equal(brand.identity.spaceBase, 4, 'a numeric string becomes a number');
    assert.equal(typeof brand.identity.school, 'string');
  });

  test('system resolves and passes its own audit', async () => {
    const r = await cli(['system']);
    assert.equal(r.ok, true);
    assert.equal(r.audit.errors, 0, JSON.stringify(r.audit.findings, null, 1));
    assert.ok(existsSync(path.join(dir, 'brand', 'system.json')));
  });

  test('tokens writes every format', async () => {
    const r = await cli(['tokens']);
    const names = r.files.map((f) => path.basename(f)).sort();
    assert.deepEqual(names, [
      'tailwind.css', 'tokens.css', 'tokens.json', 'tokens.style-dictionary.json', 'tokens.ts',
    ]);
    for (const f of r.files) assert.ok(existsSync(path.join(dir, f)), `${f} should exist`);
  });

  test('the emitted tokens are valid in their own formats', async () => {
    const base = path.join(dir, 'brand', 'tokens');
    const dtcg = JSON.parse(await readFile(path.join(base, 'tokens.json'), 'utf8'));
    assert.equal(dtcg.$schema, 'https://tr.designtokens.org/format/');
    assert.equal(dtcg.color.$type, 'color');

    const css = await readFile(path.join(base, 'tokens.css'), 'utf8');
    assert.equal((css.match(/\{/g) ?? []).length, (css.match(/\}/g) ?? []).length, 'braces must balance');
    assert.equal(/\{color\./.test(css), false, 'no unresolved aliases');

    const ts = await readFile(path.join(base, 'tokens.ts'), 'utf8');
    assert.doesNotThrow(() => JSON.parse(ts.slice(ts.indexOf('{'), ts.lastIndexOf('} as const;') + 1)));
  });

  test('sheets writes the specification artboards and a manifest', async () => {
    const r = await cli(['sheets']);
    assert.equal(r.ok, true);
    assert.deepEqual(
      [...r.files].sort(),
      ['Components.dc.html', 'ComponentsDark.dc.html', 'Icons.dc.html', 'Logo.dc.html', 'Main.dc.html',
        'Palette.dc.html', 'Production.dc.html', 'Tokens.dc.html', 'Typography.dc.html', 'Voice.dc.html'],
    );
    const files = await readdir(path.join(dir, 'brand', 'canvas'));
    assert.ok(files.includes('canvas.json'));
    for (const f of r.files) assert.ok(files.includes(f), `${f} missing`);
  });

  test('the generated artboards pass validation', async () => {
    const r = await cli(['validate', '--dir', 'brand/canvas'], { expectFail: true });
    assert.deepEqual(r.errors, [], JSON.stringify(r.errors, null, 1));
    // `sheets` writes its own contents page as Main, so a freshly generated set
    // has no warnings at all. It used to warn about its own output.
    assert.deepEqual(r.warnings, [], JSON.stringify(r.warnings));
  });

  test('validate refuses a canvas whose manifest names a missing file', async () => {
    const manifestPath = path.join(dir, 'brand', 'canvas', 'canvas.json');
    const original = await readFile(manifestPath, 'utf8');
    const m = JSON.parse(original);
    m.artboards.push({ file: 'Ghost.dc.html', x: 9000, y: 9000, w: 100, h: 100, page: 'spec' });
    await writeFile(manifestPath, JSON.stringify(m));
    const r = await cli(['validate', '--dir', 'brand/canvas'], { expectFail: true });
    assert.ok(r.errors.some((e) => /not written to disk/.test(e.message)));
    await writeFile(manifestPath, original);
  });

  test('an authored artboard takes the Main slot from the generated contents page', async () => {
    const { artboard } = await import('../scripts/canvas.mjs');
    const main = artboard({
      name: 'Main',
      fonts: 'https://fonts.googleapis.com/css2?family=Bitter:wght@400;700&display=swap',
      systemNote: 'Craft heritage. Bitter 72 display, Karla 17 body. Green ground, sand paper, orange once.',
      body: `<div style="display:flex; flex-direction:column; gap:32px; padding:80px; background:#F4EFE6; min-height:100%">
        <h1 style="margin:0; font-family:'Bitter', Georgia, serif; font-size:72px; line-height:1.05; letter-spacing:-0.022em; color:#12271E">The good kind of wet dog</h1>
        <p style="margin:0; font-family:'Karla', system-ui, sans-serif; font-size:20px; line-height:1.55; max-width:52ch; color:#3A4640">Two wash bays. Warm water, a dryer that actually dries, and somebody who will show you how.</p>
        <a href="#book" style="align-self:flex-start; background:#1F6F4A; color:#FFFFFF; font-family:'Karla', system-ui, sans-serif; font-size:17px; font-weight:700; padding:16px 28px; border-radius:10px; text-decoration:none">Bring the dog in</a>
      </div>`,
    });
    await writeFile(path.join(dir, 'brand', 'canvas', 'Main.dc.html'), main);
    await cli(['sheets']);
    const r = await cli(['validate', '--dir', 'brand/canvas']);
    assert.equal(r.ok, true, JSON.stringify(r.errors, null, 1));
    assert.deepEqual(r.warnings, [], JSON.stringify(r.warnings, null, 1));
  });

  test('the manifest places Main on the design page and the sheets on their own', async () => {
    const m = JSON.parse(await readFile(path.join(dir, 'brand', 'canvas', 'canvas.json'), 'utf8'));
    assert.equal(m.artboards.find((a) => a.file === 'Main.dc.html').page, 'work');
    assert.equal(m.artboards.find((a) => a.file === 'Palette.dc.html').page, 'spec');
    assert.deepEqual(m.launch, { view: 'canvas', page: 'work' });
  });

  test('book writes a self-contained HTML brand book', async () => {
    const r = await cli(['book']);
    const html = await readFile(path.join(dir, 'brand', 'brand-book.html'), 'utf8');
    assert.match(html, /<!doctype html>/i);
    assert.match(html, /Muddy Paws/);
    assert.equal((html.match(/<section/g) ?? []).length >= 12, true, 'a brand book needs its sections');
    assert.equal(html.includes('—'), false, 'no em dashes in generated output');
    assert.match(html, /Not recorded yet/, 'unfilled sections say so rather than inventing content');
  });

  test('guardian emits a working companion skill', async () => {
    const r = await cli(['guardian', '--out', 'guardian-skill']);
    assert.equal(r.ok, true);
    const skill = await readFile(path.join(dir, 'guardian-skill', 'SKILL.md'), 'utf8');
    assert.match(skill, /^---\nname: muddy-paws-brand\n/);
    const rules = JSON.parse(await readFile(path.join(dir, 'guardian-skill', 'rules.json'), 'utf8'));
    assert.equal(rules.brand, 'Muddy Paws');
  });

  test('check finds real problems in real files', async () => {
    await writeFile(path.join(dir, 'site', 'bad.css'), [
      '.hero { background: linear-gradient(135deg, #8b5cf6, #6366f1); }',
      'body { font-family: Inter, sans-serif; }',
      '.btn:focus { outline: none; }',
      '.x::after { content: "Lorem ipsum"; }',
    ].join('\n'));
    const r = await cli(['check', 'site'], { expectFail: true });
    assert.equal(r.ok, false);
    const rules = new Set(r.findings.map((f) => f.rule));
    for (const expected of ['gradient-of-banned-hue', 'banned-font', 'focus-outline-removed', 'filler', 'off-palette']) {
      assert.ok(rules.has(expected), `check should have found ${expected}`);
    }
  });

  test('check passes clean work', async () => {
    await mkdir(path.join(dir, 'clean'), { recursive: true });
    await writeFile(path.join(dir, 'clean', 'ok.css'), [
      '@import "../brand/tokens/tokens.css";',
      '.hero { background: var(--surface-page); color: var(--text-primary); font-family: var(--font-body); }',
      '.btn:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }',
    ].join('\n'));
    const r = await cli(['check', 'clean']);
    assert.equal(r.ok, true, JSON.stringify(r.findings, null, 1));
  });

  test('complete refuses to advance past an incomplete phase', async () => {
    const r = await cli(['complete', 'publish'], { expectFail: true });
    assert.equal(r.ok, false);
    assert.match(r.error, /Cannot complete/);
  });

  test('complete advances when the phase is genuinely done', async () => {
    const r = await cli(['complete', 'recon']);
    assert.equal(r.phase, 'intake');
    const s = await cli(['status']);
    assert.equal(s.phases.find((p) => p.id === 'recon').done, true);
  });

  test('an unknown command fails loudly rather than doing nothing', async () => {
    const r = await cli(['frobnicate'], { expectFail: true });
    assert.equal(r.ok, false);
    assert.match(r.error, /Unknown command/);
  });
});

describe('a fully specified brand', () => {
  let full;

  before(async () => {
    full = await mkdtemp(path.join(tmpdir(), 'brandi-e2e-full-'));
    await mkdir(path.join(full, 'brand'), { recursive: true });
    await copyFile(FIXTURE, path.join(full, 'brand', 'brand.json'));
  });

  after(async () => {
    await rm(full, { recursive: true, force: true });
  });

  test('the whole pipeline runs clean end to end', async () => {
    const sys = await cli(['system'], { cwd: full });
    assert.equal(sys.audit.errors, 0);
    await cli(['tokens'], { cwd: full });
    await cli(['sheets'], { cwd: full });
    await cli(['book'], { cwd: full });
    await cli(['guardian', '--out', 'gs'], { cwd: full });
    for (const f of ['brand/system.json', 'brand/tokens/tokens.css', 'brand/brand-book.html', 'gs/SKILL.md']) {
      assert.ok(existsSync(path.join(full, f)), `${f} should exist`);
    }
  });

  test('the brand book carries the real content, not placeholders', async () => {
    const html = await readFile(path.join(full, 'brand', 'brand-book.html'), 'utf8');
    assert.match(html, /The good kind of wet dog/);
    assert.match(html, /the best twenty minutes of the walk/);
    assert.match(html, /Clear space on every side/);
    assert.match(html, /Is the 4pm to 6pm weekday peak real/, 'open questions must survive into the book');
    assert.match(html, /Keep the existing shopfront green/, 'the decision log must survive into the book');
    assert.equal(/Not recorded yet/.test(html), false, 'a complete brand needs no placeholders');
  });

  test('the book states where every claim came from', async () => {
    const html = await readFile(path.join(full, 'brand', 'brand-book.html'), 'utf8');
    assert.match(html, /Supplied/);
    assert.match(html, /Assumed/);
    assert.match(html, /traceable/);
  });

  test('running the pipeline twice produces identical output', async () => {
    const before1 = await readFile(path.join(full, 'brand', 'tokens', 'tokens.css'), 'utf8');
    await cli(['tokens'], { cwd: full });
    const after1 = await readFile(path.join(full, 'brand', 'tokens', 'tokens.css'), 'utf8');
    assert.equal(before1, after1, 'token generation must be deterministic');
  });
});

describe('the brand file schema ships with the brand file', () => {
  test('init writes the schema its $schema points at', async () => {
    const schemaPath = path.join(dir, 'brand', 'brand.schema.json');
    assert.ok(existsSync(schemaPath), 'a dangling $schema reference is worse than none');
    const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
    assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
    const brand = JSON.parse(await readFile(path.join(dir, 'brand', 'brand.json'), 'utf8'));
    assert.equal(brand.$schema, './brand.schema.json');
  });

  test('the schema describes every field of every section', async () => {
    const schema = JSON.parse(await readFile(path.join(dir, 'brand', 'brand.schema.json'), 'utf8'));
    const { emptyBrand } = await import('../scripts/brandfile.mjs');
    const walk = (value, node, trail) => {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) return;
      for (const [k, v] of Object.entries(value)) {
        if (k === '$schema') continue;
        const child = node?.properties?.[k];
        assert.ok(child, `the schema does not describe ${[...trail, k].join('.')}`);
        walk(v, child, [...trail, k]);
      }
    };
    walk(emptyBrand({ name: 'X' }), schema, []);
  });

  test('the schema constrains values to exactly what the code accepts', async () => {
    const schema = JSON.parse(await readFile(path.join(dir, 'brand', 'brand.schema.json'), 'utf8'));
    const { SHAPE_STANCES, MOTION_STANCES } = await import('../scripts/system.mjs');
    const { PHASES, PROVENANCE } = await import('../scripts/brandfile.mjs');
    const id = schema.properties.identity.properties;
    assert.deepEqual([...id.shape.enum].sort(), Object.keys(SHAPE_STANCES).sort());
    assert.deepEqual([...id.motion.enum].sort(), Object.keys(MOTION_STANCES).sort());
    assert.deepEqual(schema.properties.brandi.properties.phase.enum, PHASES.map((p) => p.id));
    assert.deepEqual(
      [...schema.properties.evidence.items.properties.provenance.enum].sort(),
      Object.keys(PROVENANCE).sort(),
    );
  });
});

describe('provenance is usable from the command line, not just in theory', () => {
  test('evidence records a claim with its tier and derives confidence', async () => {
    const r = await cli(['evidence', '--claim', 'The sign is deep green.', '--provenance', 'extracted', '--source', 'shopfront photo', '--field', 'identity.colour.primary']);
    assert.equal(r.ok, true);
    assert.equal(r.entry.provenance, 'extracted');
    assert.equal(r.entry.confidence, 'high');
    assert.equal(r.entry.field, 'identity.colour.primary');
  });

  test('an assumption is recorded as an assumption, at lower confidence', async () => {
    const r = await cli(['evidence', '--claim', 'They probably want warmth.', '--provenance', 'assumed']);
    assert.equal(r.entry.confidence, 'medium');
  });

  test('evidence refuses an invented tier', async () => {
    const r = await cli(['evidence', '--claim', 'x', '--provenance', 'vibes'], { expectFail: true });
    assert.equal(r.ok, false);
    assert.match(r.error, /unknown provenance/);
  });

  test('evidence refuses a claim with no tier, and says what the tiers are', async () => {
    const r = await cli(['evidence', '--claim', 'x'], { expectFail: true });
    assert.match(r.error, /supplied/);
    assert.match(r.error, /extracted/);
  });

  test('a decision needs its reason', async () => {
    const bad = await cli(['decision', '--decision', 'Green.'], { expectFail: true });
    assert.equal(bad.ok, false);
    assert.match(bad.error, /not a decision/);
    const good = await cli(['decision', '--decision', 'Keep the green.', '--rationale', 'It is already recognised.', '--alternatives', 'a brighter green|a repositioning']);
    assert.equal(good.entry.alternatives.length, 2);
    assert.match(good.entry.date, /^\d{4}-\d{2}-\d{2}$/);
  });

  test('an open question records what was assumed meanwhile', async () => {
    const bad = await cli(['question', '--question', 'When is peak?'], { expectFail: true });
    assert.match(bad.error, /inventing an answer/);
    const good = await cli(['question', '--question', 'When is peak?', '--why', 'It decides the headline.', '--assumed', 'Weekday evenings.']);
    assert.equal(good.entry.status, 'open');
    assert.equal(good.entry.assumedMeanwhile, 'Weekday evenings.');
  });

  test('everything recorded survives into the brand file and the status count', async () => {
    const brand = JSON.parse(await readFile(path.join(dir, 'brand', 'brand.json'), 'utf8'));
    assert.ok(brand.evidence.length >= 2);
    assert.ok(brand.governance.decisions.length >= 1);
    assert.ok(brand.governance.openQuestions.length >= 1);
    const s = await cli(['status']);
    assert.equal(s.counts.evidence, brand.evidence.length);
    assert.equal(s.counts.openQuestions, brand.governance.openQuestions.filter((q) => q.status === 'open').length);
  });

  test('and into the brand book', async () => {
    await cli(['book']);
    const html = await readFile(path.join(dir, 'brand', 'brand-book.html'), 'utf8');
    assert.match(html, /Keep the green\./);
    assert.match(html, /It is already recognised\./);
    assert.match(html, /When is peak\?/);
    assert.match(html, /Weekday evenings\./);
  });
});
