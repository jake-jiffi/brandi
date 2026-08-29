/**
 * One test per defect found in review-01. These are the joints, not the units:
 * every serious finding in that review lived where two pieces met, and unit
 * tests on either side would not have caught any of them.
 */
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import path from 'node:path';

import * as C from '../scripts/color.mjs';
import * as K from '../scripts/canvas.mjs';
import { buildSystem, assertPublishable, resolveToken } from '../scripts/system.mjs';
import { systemInputFromBrand, validateBrand, completePhase, emptyBrand } from '../scripts/brandfile.mjs';
import { renderBrandBook } from '../scripts/brandbook.mjs';
import * as A from '../scripts/artboards.mjs';
import { componentsArtboard, paletteArtboard } from '../scripts/artboards.mjs';
import { checkFiles, emitGuardianSkill } from '../scripts/guardian.mjs';
import { toCss, toTailwind, toTypeScript, toDtcg } from '../scripts/tokens.mjs';
import { toPreviewHtml, previewArtboard } from '../scripts/preview.mjs';

const run = promisify(execFile);
const CLI = path.join(import.meta.dirname, '..', 'scripts', 'brandi.mjs');
const FIXTURE = path.join(import.meta.dirname, 'fixtures', 'muddy-paws.json');

let dir;
let brand;
let system;

before(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'brandi-regress-'));
  brand = JSON.parse(await readFile(FIXTURE, 'utf8'));
  system = buildSystem(systemInputFromBrand(brand));
});
after(async () => { await rm(dir, { recursive: true, force: true }); });

const cli = async (args, cwd) => {
  try {
    const { stdout } = await run(process.execPath, [CLI, ...args, '--json'], { cwd, timeout: 90000 });
    return JSON.parse(stdout);
  } catch (e) {
    if (e.stdout) { try { return JSON.parse(e.stdout); } catch { /* fall through */ } }
    throw e;
  }
};

describe('C1: the book never asserts what its own audit disproves', () => {
  test('a failing audit is admitted, not buried under a conformance claim', () => {
    const broken = JSON.parse(JSON.stringify(system));
    broken.audit = { ok: false, errors: 1, warnings: 0, findings: [{ level: 'error', area: 'contrast.light', message: 'body text is 1.02:1', fix: 'darken it' }] };
    const html = renderBrandBook({ brand, system: broken });
    assert.match(html, /does not currently pass its own audit/);
    assert.equal(/Body text clears WCAG/.test(html), false);
  });

  test('the label row is graded at 4.5:1, because a button label is normal text', () => {
    for (const src of [renderBrandBook({ brand, system }), paletteArtboard(system)]) {
      assert.match(src, /Label on the brand fill \(normal text\)/);
      assert.equal(/Label on the brand fill<\/td>[\s\S]{0,400}?needs 3:1/.test(src), false);
    }
  });

  test('the ring geometry it states is a real token, not a number someone typed', () => {
    assert.equal(system.focus.widthPx, 2);
    assert.equal(system.focus.offsetPx, 2);
    const css = toCss(system);
    assert.match(css, /--focus-ring-width: 2px;/);
    assert.match(renderBrandBook({ brand, system }), /2px outline at 2px offset/);
  });
});

describe('C2: the audit binds every deliverable, not just the report', () => {
  test('a failing system is refused', () => {
    const broken = { audit: { ok: false, errors: 1, findings: [{ level: 'error', area: 'x', message: 'nope', fix: 'fix it' }] } };
    const r = assertPublishable(broken);
    assert.equal(r.ok, false);
    assert.match(r.message, /will not be published/);
    assert.match(r.message, /nope/);
  });

  test('--force lets it through, and says so on the record', () => {
    const broken = { audit: { ok: false, errors: 1, findings: [{ level: 'error', area: 'x', message: 'nope' }] } };
    const r = assertPublishable(broken, { force: true });
    assert.equal(r.ok, true);
    assert.equal(r.forced, true);
    assert.match(r.message, /Produced anyway/);
  });

  test('a system that was never audited is not publishable either', () => {
    assert.equal(assertPublishable({}).ok, false);
  });

  test('a healthy system passes with nothing to say', () => {
    assert.deepEqual(assertPublishable(system), { ok: true, forced: false, message: null });
  });
});

describe('C3: the validator catches what it exists to catch', () => {
  const wrap = ({ head = '', css = '', html = '<p>x</p>', after = '' }) =>
    `<!doctype html><html><head><meta charset="utf-8">${head}<script src="./support.js"></script></head>` +
    `<body><x-dc><helmet><style>${css}</style></helmet>${html}</x-dc>${after}</body></html>`;

  test('a QUOTED banned font is caught, the way anyone actually writes it', () => {
    const r = K.validateArtboard(wrap({ css: "h1{font-family:'Inter',sans-serif}" }));
    // p0 in the contract, so it lands as an error rather than a warning. It was
    // a warning when canvas.mjs kept its own list, and a hard ban is right: the
    // waiver is the escape hatch, not a softer severity.
    assert.ok(r.errors.some((e) => /Inter/.test(e.message)), JSON.stringify(r));
    const double = K.validateArtboard(wrap({ css: 'h1{font-family:"Roboto",sans-serif}' }));
    assert.ok(double.errors.some((e) => /Roboto/.test(e.message)));
  });

  test('a network-reaching url() in CSS is an error', () => {
    const r = K.validateArtboard(wrap({ css: '.a{background-image:url(https://x.com/a.png)}' }));
    assert.ok(r.errors.some((e) => /no network egress/.test(e.message)));
  });

  test('an @import from anywhere but Google Fonts is an error', () => {
    assert.ok(K.validateArtboard(wrap({ css: '@import url("https://cdn.example.com/a.css");' })).errors.length > 0);
    assert.equal(K.validateArtboard(wrap({ css: '@import url("https://fonts.googleapis.com/css2?family=Bitter");' })).errors.length, 0);
  });

  test('embedded media reaching the network is an error', () => {
    for (const tag of ['iframe', 'video', 'object', 'embed']) {
      const r = K.validateArtboard(wrap({ html: `<${tag} src="https://example.com/x"></${tag}>` }));
      assert.ok(r.errors.some((e) => /no network egress/.test(e.message)), `${tag} should be caught`);
    }
  });

  test('attribute order does not hide a malformed logic block', () => {
    const r = K.validateArtboard(wrap({ after: `<script data-props='{bad}' data-dc-script>class Component extends DCLogic {}</script>` }));
    assert.ok(r.errors.some((e) => /valid JSON/.test(e.message)));
  });

  test('a second logic block is seen, not skipped', () => {
    const r = K.validateArtboard(wrap({
      after: '<script data-dc-script>class Component extends DCLogic {}</script><script data-dc-script></script>',
    }));
    assert.ok(r.errors.some((e) => /empty/i.test(e.message)));
    assert.ok(r.warnings.some((w) => /logic blocks/.test(w.message)));
  });

  test('a question mark after a hole is copy, not a ternary', () => {
    const r = K.validateArtboard(wrap({ html: '<p>Ready to go, {{name}}?</p>' }));
    assert.equal(r.ok, true, JSON.stringify(r.errors));
  });

  test('a real ternary in an attribute is still an error', () => {
    const r = K.validateArtboard(wrap({ html: `<p style="color: {{x}} ? 'a' : 'b'">t</p>` }));
    assert.ok(r.errors.some((e) => /ternary/.test(e.message)));
  });

  test('the spacing the recipe promises really is checked', () => {
    const tight = K.canvasManifest([
      { file: 'A.dc.html', w: 400, h: 400, x: 0, y: 0 },
      { file: 'B.dc.html', w: 400, h: 400, x: 460, y: 0 },
    ]);
    const crowd = K.findCrowding(tight);
    assert.equal(crowd.length, 1);
    assert.equal(crowd[0].axis, 'x');
    const src = K.artboard({ name: 'Main', body: '<div style="padding:8px">x</div>' });
    const r = K.validateCanvas({
      artboards: [{ file: 'A.dc.html', source: src }, { file: 'B.dc.html', source: src }, { file: 'Main.dc.html', source: src }],
      manifest: K.canvasManifest([
        { file: 'A.dc.html', w: 400, h: 400, x: 0, y: 0 },
        { file: 'B.dc.html', w: 400, h: 400, x: 460, y: 0 },
        { file: 'Main.dc.html', w: 400, h: 400, x: 2000, y: 0 },
      ]),
    });
    assert.ok(r.warnings.some((w) => /canvas chrome wants/.test(w.message)));
  });
});

describe('C4: sheets keeps the layout it was given', () => {
  let project;
  before(async () => {
    project = path.join(dir, 'c4');
    await mkdir(project, { recursive: true });
    await cli(['init', '--name', 'C4'], project);
    for (const [k, v] of [['identity.colour.primary', '#1F6F4A'], ['identity.school', 'craft'], ['identity.type.display', 'Bitter'], ['identity.type.body', 'Karla']]) {
      await cli(['set', k, v], project);
    }
    await cli(['sheets'], project);
    await writeFile(path.join(project, 'brand', 'canvas', 'Main.dc.html'),
      K.artboard({ name: 'Main', body: '<div style="padding:32px;background:#fff">home</div>' }));
    await cli(['sheets'], project);
  });

  test('an authored artboard keeps the size it was given', async () => {
    const manifestPath = path.join(project, 'brand', 'canvas', 'canvas.json');
    const m = JSON.parse(await readFile(manifestPath, 'utf8'));
    m.artboards.find((a) => a.file === 'Main.dc.html').h = 1600;
    await writeFile(manifestPath, JSON.stringify(m, null, 2));
    await cli(['sheets'], project);
    const after = JSON.parse(await readFile(manifestPath, 'utf8'));
    assert.equal(after.artboards.find((a) => a.file === 'Main.dc.html').h, 1600,
      'a re-run must not shrink an authored artboard back to a desktop frame');
  });

  test('it says which artboards it had to guess a size for', async () => {
    const fresh = path.join(dir, 'c4b');
    await mkdir(path.join(fresh, 'brand', 'canvas'), { recursive: true });
    await cli(['init', '--name', 'C4b'], fresh);
    for (const [k, v] of [['identity.colour.primary', '#1F6F4A'], ['identity.school', 'craft'], ['identity.type.display', 'Bitter'], ['identity.type.body', 'Karla']]) {
      await cli(['set', k, v], fresh);
    }
    await writeFile(path.join(fresh, 'brand', 'canvas', 'Poster.dc.html'),
      K.artboard({ name: 'Poster', body: '<div style="padding:32px;background:#fff">p</div>' }));
    const r = await cli(['sheets'], fresh);
    assert.ok(r.unsized.includes('Poster.dc.html'));
  });

  test('the layout it produces never overlaps', async () => {
    const m = JSON.parse(await readFile(path.join(project, 'brand', 'canvas', 'canvas.json'), 'utf8'));
    assert.deepEqual(K.findOverlaps(m), []);
  });

  test('it lands on the design page, not the specification', async () => {
    const m = JSON.parse(await readFile(path.join(project, 'brand', 'canvas', 'canvas.json'), 'utf8'));
    assert.deepEqual(m.launch, { view: 'canvas', page: 'work' });
  });
});

describe('C5: a manifest cannot be poisoned by a missing number', () => {
  test('a missing width is refused rather than turning the layout to NaN', () => {
    assert.throws(() => K.canvasManifest([{ file: 'Main.dc.html' }, { file: 'B.dc.html', w: 400, h: 400 }]), TypeError);
    assert.throws(() => K.canvasManifest([{ file: 'A.dc.html', w: NaN, h: 10 }]), TypeError);
    assert.throws(() => K.canvasManifest([{ file: 'A.dc.html', w: 10, h: 0 }]), RangeError);
    assert.throws(() => K.canvasManifest([{ file: 'A.dc.html', w: 10, h: 10, x: Infinity }]), TypeError);
  });

  test('validateCanvas catches a hand-edited manifest with null geometry', () => {
    const src = K.artboard({ name: 'Main', body: '<p>x</p>' });
    const r = K.validateCanvas({
      artboards: [{ file: 'Main.dc.html', source: src }],
      manifest: { artboards: [{ file: 'Main.dc.html', x: null, y: 0, w: 100, h: 100 }] },
    });
    assert.ok(r.errors.some((e) => /cannot lay out/.test(e.message)));
  });
});

describe('C6: the focus ring clears the surface it actually sits on', () => {
  test('the boundary seed that used to fail now passes', () => {
    const sys = buildSystem({ primary: '#00A692' });
    assert.equal(sys.audit.errors, 0, JSON.stringify(sys.audit.findings.filter((f) => f.level === 'error')));
  });

  test('the ring is measured against the neutral page, across many hues', () => {
    for (let h = 0; h < 360; h += 7) {
      const seed = C.oklchToHex(C.gamutMapOklch({ L: 0.55, C: 0.14, h }));
      for (const mode of ['light', 'dark']) {
        const sys = buildSystem({ primary: seed });
        const ring = resolveToken(sys.semantic[mode]['focus.ring'], sys, mode);
        const page = resolveToken(sys.semantic[mode]['surface.page'], sys, mode);
        assert.ok(C.contrastRatio(ring, page) >= 3, `${seed} ${mode}: ring ${C.contrastRatio(ring, page).toFixed(2)}:1`);
      }
    }
  });

  test('a failure message can never read "3.00:1, below the 3:1 it needs"', () => {
    const sys = buildSystem({ primary: '#2563EB' });
    for (const f of sys.audit.findings) {
      const m = /is ([\d.]+):1, below the ([\d.]+):1/.exec(f.message);
      if (m) assert.notEqual(m[1], m[2], `unreadable message: ${f.message}`);
    }
  });
});

describe('C7: the components sheet keeps its own rules', () => {
  test('the hover label survives, across every seed', () => {
    for (let h = 0; h < 360; h += 11) {
      for (const L of [0.45, 0.6, 0.75]) {
        const seed = C.oklchToHex(C.gamutMapOklch({ L, C: 0.16, h }));
        for (const mode of ['light', 'dark']) {
          const ramp = C.tonalRamp(seed, { mode });
          const lc = Math.abs(C.apcaContrast(ramp.solidStrongHover.text, ramp.solidStrongHover.hex));
          assert.ok(lc >= 60, `${seed} ${mode}: hover label only Lc ${lc.toFixed(1)}`);
        }
      }
    }
  });

  test('the rationale is only printed when something was actually adjusted', () => {
    const untouched = buildSystem({ primary: '#2563EB', type: { display: 'Bitter', body: 'Karla' } });
    assert.equal(untouched.palettes.brand.light.solidStrong.adjusted, false);
    const src = componentsArtboard(untouched, { mode: 'light' });
    assert.equal(/not the raw brand colour/.test(src), false, 'it must not claim an adjustment it did not make');
    assert.match(src, /The primary fill is the brand colour itself/);

    const adjusted = buildSystem({ primary: '#16A34A', type: { display: 'Bitter', body: 'Karla' } });
    assert.equal(adjusted.palettes.brand.light.solidStrong.adjusted, true);
    assert.match(componentsArtboard(adjusted, { mode: 'light' }), /rather than the raw brand colour/);
  });
});

describe('C8: a malformed brand file is reported, never thrown', () => {
  test('a list field holding a non-list does not crash the validator', () => {
    for (const junk of [{ evidence: {} }, { evidence: 'x' }, { voice: { attributes: 7 } }, { identity: { logo: { misuse: 'no' } } }]) {
      const v = validateBrand(junk);
      assert.equal(v.ok, false);
      assert.ok(Array.isArray(v.errors));
    }
  });

  test('an unknown phase names the real ones', () => {
    assert.throws(() => completePhase(emptyBrand(), 'vibing'), /recon.*publish/s);
  });
});

describe('C9: the dark contrast table is readable on a light sheet', () => {
  test('table text clears AA against the sheet it is painted on', () => {
    const src = paletteArtboard(system);
    const page = system.palettes.neutral.light.steps[0].hex;
    const bodies = [...src.matchAll(/<tbody style="color: (#[0-9A-F]{6});"/g)].map((m) => m[1]);
    assert.ok(bodies.length >= 2, 'both themes should have a table');
    for (const c of bodies) {
      assert.ok(C.contrastRatio(c, page) >= 4.5, `${c} on ${page} is only ${C.contrastRatio(c, page).toFixed(2)}:1`);
    }
  });
});

describe('C10: a boolean flag never eats a path', () => {
  test('--json before a path keeps the path', async () => {
    const p = path.join(dir, 'c10');
    await mkdir(path.join(p, 'src'), { recursive: true });
    await cli(['init', '--name', 'C10'], p);
    for (const [k, v] of [['identity.colour.primary', '#1F6F4A'], ['identity.school', 'craft'], ['identity.type.display', 'Bitter'], ['identity.type.body', 'Karla']]) {
      await cli(['set', k, v], p);
    }
    await writeFile(path.join(p, 'src', 'a.css'), '.a{color:#FF00FF}');
    await writeFile(path.join(p, 'src', 'b.css'), '.b{color:#00FF00}');
    const before = await cli(['check', 'src/a.css'], p);
    const after = await cli(['check', 'src/a.css'], p);
    assert.equal(before.filesChecked, 1);
    assert.equal(after.filesChecked, 1);
  });
});

describe('C11: set never confirms a write it discarded', () => {
  let p;
  before(async () => {
    p = path.join(dir, 'c11');
    await mkdir(p, { recursive: true });
    await cli(['init', '--name', 'C11'], p);
  });

  test('a repeated path segment still lands in the file', async () => {
    const r = await cli(['set', 'voice.examples.0.examples.title', 'probe'], p);
    assert.equal(r.ok, true);
    const saved = JSON.parse(await readFile(path.join(p, 'brand', 'brand.json'), 'utf8'));
    assert.equal(saved.voice.examples[0].examples.title, 'probe');
  });

  test('a numeric-looking string stays a string where the schema says string', async () => {
    await cli(['set', 'meta.tagline', '2024'], p);
    const saved = JSON.parse(await readFile(path.join(p, 'brand', 'brand.json'), 'utf8'));
    assert.strictEqual(saved.meta.tagline, '2024');
  });

  test('a genuinely numeric field is still a number', async () => {
    await cli(['set', 'identity.type.basePx', '18'], p);
    const saved = JSON.parse(await readFile(path.join(p, 'brand', 'brand.json'), 'utf8'));
    assert.strictEqual(saved.identity.type.basePx, 18);
  });

  test('a path that is not a path is refused', async () => {
    const r = await cli(['set', 'not a path!', 'x'], p);
    assert.equal(r.ok, false);
    assert.match(r.error, /not a field path/);
  });
});

describe('C12: the book carries what the brand file holds', () => {
  test('applications are rendered', () => {
    const html = renderBrandBook({ brand, system });
    assert.match(html, /id="applications"/);
    for (const a of brand.applications) assert.ok(html.includes(a.name), `${a.name} missing`);
  });

  test('a supplied logo is shown, and a missing one is admitted', () => {
    const shown = renderBrandBook({ brand, system, assets: { 'assets/logos/muddy-paws-primary.svg': { kind: 'svg', markup: '<svg id="mark"></svg>' } } });
    assert.match(shown, /id="mark"/);
    assert.match(renderBrandBook({ brand, system }), /recorded but not embedded/);
  });

  test('the book says which sections it does not generate', () => {
    assert.match(renderBrandBook({ brand, system }), /What this book does not cover/);
  });
});

describe('C13: the WCAG citations are the right ones', () => {
  test('nothing cites 2.4.11 for a visible focus indicator', () => {
    const sources = [renderBrandBook({ brand, system }), toCss(system)];
    for (const src of sources) {
      const around = src.split('2.4.11');
      for (let i = 1; i < around.length; i++) {
        assert.match(around[i - 1].slice(-120) + around[i].slice(0, 120), /Focus Not Obscured|different thing/,
          '2.4.11 is Focus Not Obscured, not the visible-indicator or contrast requirement');
      }
    }
  });

  test('the removed-outline rule cites 2.4.7, and it does so in the contract where it belongs', async () => {
    const { loadContract } = await import('../scripts/slop.mjs');
    const c = await loadContract();
    const rule = c.css_patterns.focus_outline_removed;
    assert.match(rule.rule, /2\.4\.7/);
    assert.equal(/2\.4\.11/.test(rule.rule), false, '2.4.11 is target size, not focus visibility');
    assert.equal(rule.severity, 'p0', 'a removed focus outline is not a matter of taste');

    // And it reaches a brand's own guardian, derived rather than restated.
    const out = path.join(dir, 'c13-guardian');
    await emitGuardianSkill({ brand, system, dir: out, brandFile: 'brand/brand.json', cliPath: CLI });
    const rules = JSON.parse(await readFile(path.join(out, 'rules.json'), 'utf8'));
    assert.ok(rules.slopRules.some((r) => r.rule === 'css_patterns.focus_outline_removed'));
  });

  test('reduced motion is described as AAA, not as a flat requirement', () => {
    assert.match(renderBrandBook({ brand, system }), /2\.3\.3 is Level AAA/);
    assert.match(toCss(system), /Level AAA/);
  });
});

describe('C14: the generated guardian names a command that resolves', () => {
  test('it embeds the absolute path of the CLI that generated it', async () => {
    const out = path.join(dir, 'c14-guardian');
    await emitGuardianSkill({ brand, system, dir: out, brandFile: 'brand/brand.json', cliPath: CLI });
    const skill = await readFile(path.join(out, 'SKILL.md'), 'utf8');
    assert.ok(skill.includes(CLI), 'the fallback must be a path that exists on this machine');
    assert.equal(/<clone>/.test(skill), false, 'a placeholder is not a fallback');
  });
});

describe('C15: labels are picked by the metric they are judged by', () => {
  test('a mid-tone green gets the label that actually passes', () => {
    const pick = C.bestTextOn('#338637');
    assert.equal(pick.color, '#FFFFFF');
    assert.ok(Math.abs(pick.apca) >= 60);
  });

  test('accessibleSolid does not report an adjustment it did not make', () => {
    const a = C.accessibleSolid('#338637');
    assert.equal(a.adjusted, false);
    assert.equal(a.moved, 0);
  });
});

describe('C16: the guardian sees every colour notation', () => {
  test('rgb, hsl, oklch and named colours are all checked', async () => {
    const p = path.join(dir, 'c16');
    await mkdir(p, { recursive: true });
    await writeFile(path.join(p, 'a.css'), [
      '.a { color: rgb(255 0 255); }',
      '.b { background: hsl(300 100% 50%); }',
      '.c { border-color: rebeccapurple; }',
      '.d { color: oklch(60% 0.25 320); }',
    ].join('\n'));
    const r = await checkFiles({ brand, system, targets: ['.'], root: p });
    const notations = r.findings.filter((f) => f.rule === 'off-palette').map((f) => f.message);
    assert.ok(notations.some((m) => /rgb\(/.test(m)), 'rgb() must be seen');
    assert.ok(notations.some((m) => /rebeccapurple/.test(m)), 'named colours must be seen');
    assert.ok(notations.some((m) => /oklch\(/.test(m)), 'oklch() must be seen');
  });

  test('a hex quoted in documentation is a warning, not a failure', async () => {
    const p = path.join(dir, 'c16-docs');
    await mkdir(p, { recursive: true });
    await writeFile(path.join(p, 'notes.md'), 'Their brand is #FF00FF, ours is not.');
    const r = await checkFiles({ brand, system, targets: ['.'], root: p });
    assert.equal(r.ok, true);
    assert.ok(r.findings.some((f) => f.rule === 'off-palette' && f.level === 'warn'));
  });
});

describe('C17: the colour engine refuses input it cannot mean', () => {
  test('NaN never becomes a hex string', () => {
    assert.throws(() => C.gamutMapOklch({ L: 0.5, C: 0.2, h: NaN }), TypeError);
    assert.throws(() => C.oklchToHex({ L: NaN, C: 0.1, h: 10 }), TypeError);
    assert.throws(() => C.inSrgbGamut({ L: 0.5, C: Infinity, h: 10 }), TypeError);
  });

  test('negative chroma is refused rather than rendering the opposite hue', () => {
    assert.throws(() => C.gamutMapOklch({ L: 0.5, C: -0.1, h: 200 }), RangeError);
  });

  test('the Machado matrices carry their published precision', () => {
    // Deuteranopia row 2, column 1 is 0.280085, not 0.28009.
    const red = C.toHex({ r: 1, g: 0, b: 0 });
    const expected = C.toHex({
      r: C.linearToSrgb(0.367322), g: C.linearToSrgb(0.280085), b: C.linearToSrgb(0),
    });
    assert.equal(C.simulateCvd(red, 'deuteranopia'), expected);
  });
});

describe('C18: the things that were fixed mid-review stay fixed', () => {
  test('a preview PNG is a render, not a browser error page', async () => {
    const p = path.join(dir, 'c18');
    await mkdir(p, { recursive: true });
    const file = path.join(p, 'Main.dc.html');
    await writeFile(file, K.artboard({ name: 'Main', body: '<div style="padding:32px;background:#F4EFE6">hello</div>' }));
    // Relative out dir was the shape that produced file://preview/x.html and
    // silently saved Chrome's error page as the artboard.
    const res = await previewArtboard(file, { outDir: path.join(p, 'out'), png: false });
    assert.ok(path.isAbsolute(res.html));
    const html = await readFile(res.html, 'utf8');
    assert.match(html, /hello/);
    assert.equal(/ERR_INVALID_URL|ERR_FILE_NOT_FOUND/.test(html), false);
  });

  test('the preview shim never leaves a relative file URL to be resolved', () => {
    const out = toPreviewHtml(K.artboard({ name: 'Main', body: '<p>x</p>' }));
    assert.equal(/file:\/\/[^/]/.test(out), false);
  });

  test('the question command exists and records what was assumed', async () => {
    const p = path.join(dir, 'c18-q');
    await mkdir(p, { recursive: true });
    await cli(['init', '--name', 'Q'], p);
    const r = await cli(['question', '--question', 'When is peak?', '--why', 'It decides the headline.', '--assumed', 'Weekday evenings.'], p);
    assert.equal(r.ok, true);
    assert.equal(r.entry.assumedMeanwhile, 'Weekday evenings.');
  });
});

describe('S1: a direction round still produces a Main', () => {
  test('the skill says to write one, and the validator warns when it is missing', async () => {
    const skill = await readFile(path.join(import.meta.dirname, '..', 'skills', 'brand-system', 'SKILL.md'), 'utf8');
    assert.match(skill, /Also write `Main\.dc\.html`/);
    const src = K.artboard({ name: 'DirectionA', body: '<p>x</p>' });
    const r = K.validateCanvas({ artboards: [{ file: 'DirectionA.dc.html', source: src }] });
    assert.ok(r.warnings.some((w) => /No Main artboard/.test(w.message)));
  });
});

describe('S4: a typeface that will not load is reported, not silently substituted', () => {
  test('the audit always names the constraint', () => {
    assert.ok(system.audit.findings.some((f) => f.area === 'type' && /Google Fonts and nowhere else/.test(f.message)));
  });

  test('there is a command that actually checks', async () => {
    const help = await readFile(CLI, 'utf8');
    assert.match(help.slice(0, help.indexOf(' */')), /brandi fonts/);
  });
});

describe('addendum: claims the tooling makes about itself', () => {
  test('DTCG is never called a W3C standard, because it is not one', async () => {
    const dtcg = (await import('../scripts/tokens.mjs')).toDtcg(system);
    assert.match(dtcg.$description, /Community Group Report/);
    assert.match(dtcg.$description, /not a W3C standard/);
    const surfaces = [
      renderBrandBook({ brand, system }),
      await readFile(path.join(import.meta.dirname, '..', 'skills', 'brand-system', 'SKILL.md'), 'utf8'),
      await readFile(path.join(import.meta.dirname, '..', 'scripts', 'tokens.mjs'), 'utf8'),
    ];
    for (const src of surfaces) {
      assert.equal(/W3C design tokens|W3C DTCG|W3C Design Tokens Community/.test(src), false,
        'DTCG is a Community Group Report, not on the W3C Standards Track');
    }
  });

  test('the Tailwind theme has no self-referential declarations', async () => {
    const { toTailwind } = await import('../scripts/tokens.mjs');
    const tw = toTailwind(system);
    const selfRef = [...tw.matchAll(/^\s*(--[\w-]+):\s*var\((--[\w-]+)\)\s*;/gm)].filter((m) => m[1] === m[2]);
    assert.deepEqual(selfRef.map((m) => m[1]), [], 'a token defined as itself only works by accident of import order');
    assert.equal((tw.match(/\/\*/g) ?? []).length, (tw.match(/\*\//g) ?? []).length, 'comments must balance');
  });

  test('a structured misuse entry renders as a sentence, not [object Object]', () => {
    const b = JSON.parse(JSON.stringify(brand));
    b.identity.logo.misuse = [
      'stretch it',
      { what: 'place it on a busy photograph', why: 'The counters fill in.', source: 'real' },
      { rule: 'retype the wordmark' },
      { unusable: true },
      null,
    ];
    const html = renderBrandBook({ brand: b, system });
    assert.equal(html.includes('[object Object]'), false);
    // Drawn now, not listed: the book is the document of record and it was
    // printing prose while the Logo sheet drew the same eight properly.
    assert.match(html, /Never place it on a busy photograph\./);
    assert.match(html, /The counters fill in\./);
    assert.match(html, /seen in the wild/);
    assert.match(html, /&#10005;/, 'each one carries a cross, because a rule people have seen broken is one they remember');
    assert.equal(/<li><\/li>/.test(html), false, 'an unusable entry produces no bullet, not an empty one');
  });

  test('the Main-less seed claim matches what the helper actually does', async () => {
    // Settled empirically against helper 2.1.251: it warns and falls back to the
    // first artboard. Nothing in the docs may call it a hard requirement.
    const recipe = await readFile(path.join(import.meta.dirname, '..', 'skills', 'brand-system', 'references', '05-canvas-recipes.md'), 'utf8');
    assert.match(recipe, /WARNS rather than refuses/);
    const r = K.validateCanvas({ artboards: [{ file: 'DirectionA.dc.html', source: K.artboard({ name: 'DirectionA', body: '<p>x</p>' }) }] });
    const w = r.warnings.find((x) => /No Main artboard/.test(x.message));
    assert.ok(w);
    assert.match(w.message, /warns/);
  });
});

describe('the "I have a logo and a sentence" case, which is the headline one', () => {
  let project;
  before(async () => {
    project = path.join(dir, 'light-support');
    await mkdir(path.join(project, 'assets'), { recursive: true });
    await writeFile(path.join(project, 'assets', 'logo.svg'),
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 64">
        <rect x="0" y="8" width="48" height="48" rx="10" fill="#7A3E9D"/>
        <path d="M12 32h24" stroke="#F5C518" stroke-width="6"/>
        <text x="62" y="44" font-family="Georgia, serif" fill="#2B1B33">Fernpost</text>
      </svg>`);
    await mkdir(path.join(project, 'src'), { recursive: true });
    await writeFile(path.join(project, 'src', 'misc.css'), '.a{color:#3B7A57}.b{color:#3B7A57}.c{color:#3B7A57}');
    await cli(['init', '--name', 'Fernpost'], project);
  });

  test('recon reads the colours out of the logo, which is the strongest evidence there is', async () => {
    const r = await cli(['scan'], project);
    const hexes = r.coloursInUse.map((c) => c.hex);
    for (const expected of ['#7A3E9D', '#F5C518', '#2B1B33']) {
      assert.ok(hexes.includes(expected), `${expected} is in the logo and must be found`);
    }
  });

  test('a logo colour outranks one merely repeated in a stylesheet', async () => {
    const r = await cli(['scan'], project);
    assert.equal(r.coloursInUse[0].from, 'logo', `ranked ${r.coloursInUse[0].hex} above the logo's own colours`);
    const incidental = r.coloursInUse.find((c) => c.hex === '#3B7A57');
    if (incidental) {
      assert.notEqual(incidental.from, 'logo');
      assert.ok(r.coloursInUse.indexOf(incidental) > 2, 'the three logo colours should come first');
    }
  });

  test('it says the logo colours are supplied, not candidates', async () => {
    const { stdout } = await run(process.execPath, [CLI, 'scan'], { cwd: project, timeout: 60000 });
    assert.match(stdout, /came out of the logo itself/);
    assert.match(stdout, /supplied rather than as candidates/);
  });

  test('a typeface named in the logo is found too', async () => {
    const r = await cli(['scan'], project);
    assert.ok(r.fontFamiliesInUse.includes('Georgia'));
    assert.ok(r.typefacesFromLogo.includes('Georgia'), 'and it is known to have come from the logo');
  });

  test('the journey runs to a book from a logo and one sentence', async () => {
    for (const [k, v] of [
      ['identity.colour.primary', '#7A3E9D'],
      ['identity.school', 'warm-humanist'],
      ['identity.type.display', 'Instrument Serif'],
      ['identity.type.body', 'Figtree'],
      ['strategy.purpose', 'Make a postcard from home arrive while it still feels like news.'],
    ]) await cli(['set', k, v], project);
    await cli(['set', 'identity.logo.files', '[{"path":"assets/logo.svg","role":"primary"}]'], project);

    const sys = await cli(['system'], project);
    assert.equal(sys.audit.errors, 0, JSON.stringify(sys.audit.findings.filter((f) => f.level === 'error')));
    await cli(['tokens'], project);
    await cli(['book'], project);
    const html = await readFile(path.join(project, 'brand', 'brand-book.html'), 'utf8');
    assert.match(html, /Fernpost/);
    assert.match(html, /still feels like news/);
    assert.match(html, /<svg/, 'the supplied logo must appear in the book');
  });
});

describe('a banned typeface is caught where the decision is made', () => {
  test('the audit warns, rather than leaving it to an artboard render', () => {
    const banned = buildSystem({ primary: '#2563EB', type: { display: 'Fraunces', body: 'Figtree' } });
    const w = banned.audit.findings.find((f) => f.area === 'type' && /Fraunces/.test(f.message));
    assert.ok(w, 'Fraunces is on the banned list and must be flagged at buildSystem time');
    assert.equal(w.level, 'warn');
    assert.match(w.fix, /decision log/);
  });

  test('every banned face is caught, in any role', async () => {
    const { BANNED_FONTS } = await import('../scripts/canvas.mjs');
    for (const font of BANNED_FONTS) {
      const sys = buildSystem({ primary: '#2563EB', type: { display: 'Instrument Serif', body: 'Figtree', mono: font } });
      assert.ok(
        sys.audit.findings.some((f) => f.area === 'type' && f.message.includes(font)),
        `${font} as the mono face should be flagged`,
      );
    }
  });

  test('a face with a point of view passes without comment', () => {
    const fine = buildSystem({ primary: '#2563EB', type: { display: 'Instrument Serif', body: 'Figtree' } });
    assert.equal(fine.audit.findings.some((f) => f.area === 'type' && /machine-generated/.test(f.message)), false);
  });
});

describe('a logo path in a data file cannot read outside the project', () => {
  test('traversal and absolute paths are refused, the real file is not', async () => {
    const p = path.join(dir, 'traversal');
    await mkdir(path.join(p, 'assets'), { recursive: true });
    await writeFile(path.join(p, 'assets', 'logo.svg'), '<svg xmlns="http://www.w3.org/2000/svg" id="real"></svg>');
    await cli(['init', '--name', 'Trav'], p);
    for (const [k, v] of [
      ['identity.colour.primary', '#2563EB'],
      ['identity.school', 'swiss'],
      ['identity.type.display', 'Instrument Serif'],
      ['identity.type.body', 'Figtree'],
    ]) await cli(['set', k, v], p);
    await cli(['set', 'identity.logo.files',
      '[{"path":"../../../../etc/hosts"},{"path":"/etc/hosts"},{"path":"assets/logo.svg"}]'], p);

    const r = await cli(['book'], p);
    assert.equal(r.logosNamed, 3);
    assert.equal(r.logosEmbedded, 1, 'only the file inside the project may be read');
    const html = await readFile(path.join(p, 'brand', 'brand-book.html'), 'utf8');
    assert.match(html, /id="real"/);
    assert.equal(/127\.0\.0\.1|localhost/.test(html), false, 'nothing from outside the project may leak in');
  });
});

describe('scanning a real codebase, not a synthetic one', () => {
  let project;
  before(async () => {
    project = path.join(dir, 'real-shaped');
    // The shapes a real project actually uses: colour in markup and components,
    // not in a stylesheet. Reading only .css found nothing at all in a real
    // repository whose twenty-one HTML files were full of hex.
    await mkdir(path.join(project, 'src', 'components'), { recursive: true });
    await writeFile(path.join(project, 'index.html'),
      '<div style="background:#1A1120;color:#FF3A8C">hi</div><style>body{font-family:"Lora",serif}</style>');
    await writeFile(path.join(project, 'src', 'components', 'Hero.tsx'),
      'export const Hero = () => <h1 style={{ color: "#4680F5" }}>Hi</h1>;');
    await writeFile(path.join(project, 'src', 'components', 'Card.vue'),
      '<style scoped>.c{border-color:#D4B896;font-family:Manrope,sans-serif}</style>');
    await cli(['init', '--name', 'Realish'], project);
  });

  test('colour is found in markup and components, not only stylesheets', async () => {
    const r = await cli(['scan'], project);
    const hexes = r.coloursInUse.map((c) => c.hex);
    for (const expected of ['#1A1120', '#FF3A8C', '#4680F5', '#D4B896']) {
      assert.ok(hexes.includes(expected), `${expected} lives in real project shapes and must be found`);
    }
  });

  test('typefaces are found in the same places', async () => {
    const r = await cli(['scan'], project);
    assert.ok(r.fontFamiliesInUse.includes('Lora'));
    assert.ok(r.fontFamiliesInUse.includes('Manrope'));
  });

  test('an unresolved template literal is not reported as a typeface', async () => {
    const p = path.join(dir, 'templated');
    await mkdir(p, { recursive: true });
    await writeFile(path.join(p, 'gen.astro'), '<style>h1{font-family:${display};color:#123456}</style>');
    await cli(['init', '--name', 'Templated'], p);
    const r = await cli(['scan'], p);
    for (const f of r.fontFamiliesInUse) {
      assert.equal(/[${}`]/.test(f), false, `"${f}" is an interpolation, not a typeface`);
    }
  });

  test('arbitrary source modules are not mined for colour, because constants are not brand decisions', async () => {
    const p = path.join(dir, 'noisy-source');
    await mkdir(p, { recursive: true });
    await writeFile(path.join(p, 'constants.ts'), 'export const BANNED = ["#8B5CF6", "#6366F1"];');
    await cli(['init', '--name', 'Noisy'], p);
    const r = await cli(['scan'], p);
    assert.deepEqual(r.coloursInUse.map((c) => c.hex), [],
      'a hex in a .ts constant is not evidence of a brand colour');
  });
});

/**
 * Found by pointing `check` at a real 566MB monorepo rather than at a fixture.
 * Both defects only appear at that scale: a hex heuristic that is fine on a
 * stylesheet is wrong on a hundred thousand lines of TypeScript, and a report
 * shape that reads well at ten findings is unusable at forty thousand.
 */
describe('a real repository, checked at its real size', () => {
  test('an issue reference is not a colour, however many digits it has', () => {
    const prose = 'Fixes #847, see #160 and #3408; regression from #12ab34.';
    assert.deepEqual(C.extractColors(prose).map((c) => c.raw), ['#12ab34'],
      'only the six-digit hex is a colour here; the rest are ticket numbers');
  });

  test('a three-digit hex in a value position is still a colour', () => {
    const css = '.a{color:#847}.b{fill="#abc"}.c{border:1px solid #f00}';
    const hexes = C.extractColors(css).map((c) => c.hex);
    for (const expected of ['#884477', '#AABBCC', '#FF0000']) {
      assert.ok(hexes.includes(expected), `${expected} is written as a value and must be read as one`);
    }
  });

  test('a three-digit grey in shorthand is a colour, because that is where greys live', () => {
    const css = '.a{border: 1px solid #111}\n  box-shadow: 0 0 2px #000 inset;\n  color: #333;';
    const hexes = C.extractColors(css).map((c) => c.hex);
    for (const expected of ['#111111', '#000000', '#333333']) {
      assert.ok(hexes.includes(expected), `${expected} sits in a declaration and must be read as a colour`);
    }
  });

  test('a changelog entry is not a palette', () => {
    const changelog = [
      '- feat: add thing ([#892])',
      '- This list grew out of [PR #194]',
      '- Media generation survives restart (#648). ([#884])',
      '> Related: issue #744 ("alternative path")',
      '- fix: closes #784',
    ].join('\n');
    assert.deepEqual(C.extractColors(changelog), [],
      'brackets and reference words say plainly that these are tickets');
  });

  test('a fragment reference is not a colour, however hexadecimal it spells', () => {
    assert.deepEqual(C.extractColors('<use href="#abc"/>'), []);
    assert.deepEqual(C.extractColors('<use xlink:href="#a1b2c3"/>'), []);
    assert.deepEqual(C.extractColors('filter:url(#fade)'), []);
    assert.equal(C.extractColors('<path fill="#abc" stroke="#1677ff"/>').length, 2,
      'fill and stroke on the same element still carry real colour');
  });

  test('minified CSS stays linear, because minified CSS is one very long line', () => {
    // The declaration check originally took the whole line prefix. On a single-line
    // bundle that is quadratic: 115KB took 1.2s, so 1MB would have taken 90.
    const decl = (n) => Array.from({ length: n }, (_, i) => `.c${i}{border:1px solid #111}`).join('');
    const time = (t) => { const started = performance.now(); C.extractColors(t); return performance.now() - started; };
    time(decl(2000)); // warm, so the comparison is of work and not of compilation
    const small = time(decl(2000));
    const large = time(decl(20000));
    assert.equal(C.extractColors(decl(2000)).length, 2000, 'every declaration is still found');
    assert.ok(large < small * 40, `ten times the input took ${(large / small).toFixed(1)}x the time, which is not linear`);
  });

  test('a CSS keyword that reads like a reference word does not eat the colour', () => {
    assert.equal(C.extractColors('background: fixed #333;').length, 1,
      '`fixed` is background-attachment, not "fixed #333" the ticket');
  });

  test('eight-digit hex with alpha survives the tightening', () => {
    assert.equal(C.extractColors('background:#1677ffcc').length, 1);
    assert.equal(C.extractColors('#1677ffcc').at(0).hex, '#1677FF');
  });

  test('a large check reports by rule and caps the detail, because a report nobody reads is not a report', async () => {
    const p = path.join(dir, 'oversized');
    await mkdir(p, { recursive: true });
    // Two hundred off-palette declarations: far past what anyone reads line by line.
    for (let i = 0; i < 20; i++) {
      const rules = Array.from({ length: 10 }, (_, j) => `.x${j}{color:#${(i * 10 + j).toString(16).padStart(6, '0')}}`);
      await writeFile(path.join(p, `sheet-${i}.css`), rules.join('\n'));
    }
    await run('node', [CLI, 'init', '--name', 'Capped'], { cwd: p });
    await writeFile(path.join(p, 'brand', 'brand.json'), await readFile(FIXTURE, 'utf8'));

    const { stdout } = await run('node', [CLI, 'check', '.', '--limit', '5'], { cwd: p }).catch((e) => e);
    assert.match(stdout, /By rule:/, 'the shape of the problem comes before its instances');
    assert.match(stdout, /off-palette/);
    assert.match(stdout, /Worst files:/, 'a reader needs to know where to start');
    assert.match(stdout, /pass --limit to see further/);
    assert.match(stdout, /wider than the brand/, 'it must say what a count this large usually means');
    assert.equal((stdout.match(/^ERROR /gm) ?? []).length, 5, '--limit caps the detailed list exactly');
  });

  test('a small check still prints every finding, uncapped', async () => {
    const p = path.join(dir, 'small-check');
    await mkdir(p, { recursive: true });
    await writeFile(path.join(p, 'a.css'), '.a{color:#8B5CF6}');
    await run('node', [CLI, 'init', '--name', 'Small'], { cwd: p });
    await writeFile(path.join(p, 'brand', 'brand.json'), await readFile(FIXTURE, 'utf8'));
    const { stdout } = await run('node', [CLI, 'check', '.'], { cwd: p }).catch((e) => e);
    assert.match(stdout, /Every finding, worst first:/);
    assert.doesNotMatch(stdout, /wider than the brand/, 'do not lecture someone with one problem');
  });

  test('the grouped counts are in --json too, not only in the prose', async () => {
    const p = path.join(dir, 'json-check');
    await mkdir(p, { recursive: true });
    await writeFile(path.join(p, 'a.css'), '.a{color:#8B5CF6}.b{color:#6366F1}');
    await run('node', [CLI, 'init', '--name', 'Jsonish'], { cwd: p });
    await writeFile(path.join(p, 'brand', 'brand.json'), await readFile(FIXTURE, 'utf8'));
    const { stdout } = await run('node', [CLI, 'check', '.', '--json'], { cwd: p }).catch((e) => e);
    const r = JSON.parse(stdout);
    assert.ok(Array.isArray(r.byRule) && r.byRule.length, 'byRule rides along for anything scripting this');
    assert.ok(r.byRule.every((x) => typeof x.count === 'number' && x.rule));
    assert.ok(Array.isArray(r.worstFiles));
    assert.ok(Array.isArray(r.findings), 'json is never truncated: only the human report is');
  });
});

describe('the specification set has an entry artboard', () => {
  let p;
  before(async () => {
    p = path.join(dir, 'sheets-main');
    await mkdir(p, { recursive: true });
    await run('node', [CLI, 'init', '--name', 'Muddy Paws'], { cwd: p });
    await writeFile(path.join(p, 'brand', 'brand.json'), await readFile(FIXTURE, 'utf8'));
  });

  test('sheets writes a Main, and the validator finds no fault with the artboards themselves', async () => {
    await run('node', [CLI, 'sheets', '--out', 'brand/canvas'], { cwd: p });
    assert.ok(existsSync(path.join(p, 'brand', 'canvas', 'Main.dc.html')));
    const { stdout } = await run('node', [CLI, 'validate', '--dir', 'brand/canvas', '--json'], { cwd: p }).catch((e) => e);
    const r = JSON.parse(stdout);
    assert.deepEqual(r.errors, [], 'the tool must not fault its own output');
    assert.deepEqual(r.warnings, [], JSON.stringify(r.warnings));
    // The fixture brand declares four logo variants and ships none, which is
    // the promises pass talking, not the artboard pass.
    assert.ok(r.promises.some((f) => f.rule === 'missing-logo-variant'));
  });

  test('a rerun regenerates its own contents page, because a stale one is drift', async () => {
    const file = path.join(p, 'brand', 'canvas', 'Main.dc.html');
    await writeFile(file, (await readFile(file, 'utf8')).replace('Muddy Paws design system', 'STALE'));
    await run('node', [CLI, 'sheets', '--out', 'brand/canvas'], { cwd: p });
    const after = await readFile(file, 'utf8');
    assert.doesNotMatch(after, /STALE/);
    assert.match(after, /Muddy Paws design system/);
  });

  test('an authored Main is kept, because the entry artboard belongs to the designer', async () => {
    const file = path.join(p, 'brand', 'canvas', 'Main.dc.html');
    const authored = await readFile(path.join(p, 'brand', 'canvas', 'Palette.dc.html'), 'utf8');
    await writeFile(file, authored);
    const { stdout } = await run('node', [CLI, 'sheets', '--out', 'brand/canvas'], { cwd: p });
    assert.equal(await readFile(file, 'utf8'), authored, 'the generator must not overwrite authored work');
    assert.match(stdout, /kept as it is/, 'and it must say so, rather than doing it silently');
  });

  test('an authored Main does not inherit the contents page frame, which would clip it', async () => {
    const canvas = path.join(p, 'brand', 'canvas');
    await run('node', [CLI, 'sheets', '--out', 'brand/canvas', '--force'], { cwd: p });
    const generated = JSON.parse(await readFile(path.join(canvas, 'canvas.json'), 'utf8'))
      .artboards.find((a) => a.file === 'Main.dc.html');

    // A home page authored over the contents page is a different artboard at the
    // same path. Keeping the recorded frame put 1600px of page in a 1286px frame.
    await writeFile(path.join(canvas, 'Main.dc.html'), await readFile(path.join(canvas, 'Palette.dc.html'), 'utf8'));
    const { stdout } = await run('node', [CLI, 'sheets', '--out', 'brand/canvas'], { cwd: p });
    const after = JSON.parse(await readFile(path.join(canvas, 'canvas.json'), 'utf8'))
      .artboards.find((a) => a.file === 'Main.dc.html');

    assert.notDeepEqual([after.w, after.h], [generated.w, generated.h],
      'the frame of the file that is gone must not be reused');
    assert.match(stdout, /nothing said otherwise: Main\.dc\.html/, 'and it has to say so out loud');
    assert.equal(after.page, 'work');
  });

  test('--force replaces an authored Main, because the escape hatch has to exist', async () => {
    await run('node', [CLI, 'sheets', '--out', 'brand/canvas', '--force'], { cwd: p });
    const after = await readFile(path.join(p, 'brand', 'canvas', 'Main.dc.html'), 'utf8');
    assert.match(after, /Muddy Paws design system/);
  });
});

/**
 * Generating a clean brand and immediately checking it reported 27 errors and
 * 14 warnings against the tool's own output. The brand book's misuse pages and
 * the palette sheet's colour-blindness simulations are deliberately wrong: that
 * is what they are for. A first run that accuses you of everything teaches you
 * to ignore the tool.
 */
describe('check does not audit what it generated', () => {
  let p;
  before(async () => {
    p = path.join(dir, 'self-check');
    await mkdir(p, { recursive: true });
    await run('node', [CLI, 'init', '--name', 'Muddy Paws'], { cwd: p });
    await writeFile(path.join(p, 'brand', 'brand.json'), await readFile(FIXTURE, 'utf8'));
    await run('node', [CLI, 'sheets', '--out', 'brand/canvas'], { cwd: p });
    await run('node', [CLI, 'book'], { cwd: p });
    await writeFile(path.join(p, 'off.css'), '.a{color:#8B5CF6;font-family:Inter}');
  });

  test('a freshly generated brand reports only the work that is actually off-brand', async () => {
    const { stdout } = await run('node', [CLI, 'check', '.', '--json'], { cwd: p }).catch((e) => e);
    const r = JSON.parse(stdout);
    assert.ok(r.generatedSkipped.length >= 7, 'the sheets and the book are all generated');
    assert.ok(r.generatedSkipped.some((f) => f.includes('brand-book.html')));
    assert.ok(r.generatedSkipped.some((f) => f.includes('Palette.dc.html')));
    for (const f of r.findings) {
      assert.match(f.file, /off\.css/, `${f.file} is generated from the brand and must not be audited against it`);
    }
    assert.ok(r.findings.length >= 2, 'and the genuinely off-brand file is still caught');
  });

  test('an authored artboard in the same directory is still checked', async () => {
    const { artboard } = await import('../scripts/canvas.mjs');
    await writeFile(path.join(p, 'brand', 'canvas', 'Hero.dc.html'), artboard({
      name: 'Hero',
      systemNote: 'Authored by hand, deliberately off-brand.',
      body: '<div style="font-family:Inter;color:#8B5CF6">Welcome to our website</div>',
    }));
    const { stdout } = await run('node', [CLI, 'check', '.', '--json'], { cwd: p }).catch((e) => e);
    const r = JSON.parse(stdout);
    assert.ok(r.findings.some((f) => f.file.includes('Hero.dc.html')),
      'no marker means it is design work, and design work is what this checks');
  });

  test('a file that merely quotes the marker in its body is not exempt', async () => {
    const q = path.join(dir, 'quoter');
    await mkdir(q, { recursive: true });
    await run('node', [CLI, 'init', '--name', 'Quoter'], { cwd: q });
    await writeFile(path.join(q, 'brand', 'brand.json'), await readFile(FIXTURE, 'utf8'));
    await writeFile(path.join(q, 'a.css'), `${'/* filler */\n'.repeat(400)}\n/* generated from the resolved system */\n.a{color:#8B5CF6}`);
    const { stdout } = await run('node', [CLI, 'check', '.', '--json'], { cwd: q }).catch((e) => e);
    const r = JSON.parse(stdout);
    assert.equal(r.generatedSkipped.length, 0, 'the marker only counts in the head, where generators put it');
    assert.ok(r.findings.some((f) => f.file.includes('a.css')));
  });
});

/**
 * From the canvas critique. Every one of these was a gap in what the tool
 * GENERATES, found by reading the rendered artboards rather than the code.
 */
describe('the gaps a design critic found in the generated sheets', () => {
  const built = () => buildSystem(systemInputFromBrand(brand));

  test('loading is a state the component sheet actually draws', () => {
    const src = componentsArtboard(built(), { brandName: 'Muddy Paws' });
    assert.ok(A.BUTTON_STATES.includes('loading'), 'a control that fetches has a state between pressed and done');
    assert.match(src, /aria-busy="true"/, 'and it has to be announced, not only drawn');
    assert.match(src, /Waiting/, 'a skeleton block, because a spinner over an empty page moves the layout');
    assert.match(src, /prefers-reduced-motion/, 'and it says what to do when motion is unwelcome');
    for (const state of ['rest', 'hover', 'active', 'focus', 'disabled', 'loading']) {
      assert.ok(src.includes(`>${state}<`), `${state} is missing from the sheet`);
    }
  });

  test('the primary button is labelled the way the brand says to label it', () => {
    const src = componentsArtboard(built(), { brandName: 'Muddy Paws', voice: brand.voice });
    assert.ok(src.includes('Book a groom'), 'the brand quoted its own example; use it');
    assert.equal(A.primaryButtonLabel(brand.voice.mechanics.buttons), 'Book a groom');
  });

  test('a button rule with no example, or only a counter-example, falls back rather than inventing', () => {
    assert.equal(A.primaryButtonLabel(undefined), 'Get started');
    assert.equal(A.primaryButtonLabel('Sentence case everywhere.'), 'Get started');
    assert.equal(A.primaryButtonLabel('Never "Submit".'), 'Get started', 'the word after "not"/"never" is what to avoid');
    assert.equal(A.primaryButtonLabel('Use "Book a groom", not "Submit".'), 'Book a groom');
  });

  test('breakpoints exist, are derived where they can be, and reach every token format', () => {
    const system2 = built();
    const names = system2.layout.breakpoints.map((b) => b.name);
    assert.deepEqual(names, ['sm', 'md', 'lg', 'xl']);
    assert.equal(system2.layout.breakpoints.at(-1).px, system2.type.scale.viewports.maxVw,
      'xl is where the fluid type stops growing, not a number copied from a framework');
    assert.ok(system2.layout.contentMaxPx > system2.type.measure.approxPx,
      'the content column is the measure plus its gutters');
    for (const b of system2.layout.breakpoints) assert.ok(b.use, `${b.name} has to say what it is for`);

    const css = toCss(system2);
    assert.match(css, /--bp-md: 768px/);
    assert.match(css, /--content-max: \d+px/);
    assert.match(css, /cannot be used inside a media query/, 'the caveat matters more than the value');
    assert.match(toTailwind(system2), /--breakpoint-md: 768px/, 'Tailwind v4 builds its variants from these');
    assert.match(toTypeScript(system2), /breakpoint/);
    assert.ok(toDtcg(system2).breakpoint.md, 'and the interchange format carries them too');
  });

  test('the token sheet and the contents page both state the breakpoints', () => {
    const sheets = A.specificationSheets(built(), { brandName: 'Muddy Paws' });
    const tokens = sheets.find((x) => x.file === 'Tokens.dc.html').source;
    const contents = sheets.find((x) => x.file === 'Main.dc.html').source;
    assert.match(tokens, /--bp-lg/);
    assert.match(tokens, /Breakpoints are a starting set/);
    assert.match(contents, /Breakpoints/);
  });
});

/**
 * The critic's strongest findings were not about how anything looked. They were
 * contradictions between the brand file and the deliverable: four logo variants
 * documented and one drawn, a favicon pointing at a file that does not exist,
 * an art direction written and no image anywhere. Every one is two facts the
 * brand file already contains, so the tool can find them without taste.
 */
describe('promises the brand file makes that the deliverable has to keep', () => {
  let p;
  const canvas = () => path.join(p, 'brand', 'canvas');
  const validate = async () => JSON.parse(
    (await run('node', [CLI, 'validate', '--dir', 'brand/canvas', '--json'], { cwd: p }).catch((e) => e)).stdout,
  );

  before(async () => {
    p = path.join(dir, 'promises');
    await mkdir(p, { recursive: true });
    await run('node', [CLI, 'init', '--name', 'Muddy Paws'], { cwd: p });
    await writeFile(path.join(p, 'brand', 'brand.json'), await readFile(FIXTURE, 'utf8'));
    await run('node', [CLI, 'sheets', '--out', 'brand/canvas'], { cwd: p });
  });

  test('a documented logo variant that is not on disk is an error', async () => {
    const r = await validate();
    const missing = r.promises.filter((f) => f.rule === 'missing-logo-variant');
    assert.equal(missing.length, 4, 'the fixture documents four variants and ships none');
    assert.ok(r.promises.some((f) => f.rule === 'missing-favicon'), 'including the one the favicon points at');
    assert.ok(missing.every((f) => f.level === 'error' && f.fix), 'each says what to do about it');
  });

  test('drawing the file clears the finding, which is what makes it worth reporting', async () => {
    const assets = path.join(p, 'assets', 'logos');
    await mkdir(assets, { recursive: true });
    for (const f of ['muddy-paws-primary.svg', 'muddy-paws-stacked.svg', 'muddy-paws-mark.svg', 'muddy-paws-reversed.svg']) {
      await writeFile(path.join(assets, f), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"></svg>');
    }
    const r = await validate();
    assert.deepEqual(r.promises.filter((f) => f.rule.startsWith('missing-logo')), []);
    assert.deepEqual(r.promises.filter((f) => f.rule === 'missing-favicon'), []);
  });

  test('an application named in the brief and never drawn is a warning', async () => {
    const r = await validate();
    const undrawn = r.promises.filter((f) => f.rule === 'application-not-drawn').map((f) => f.message);
    assert.ok(undrawn.some((m) => m.includes('Mobile.dc.html')));
    assert.ok(undrawn.some((m) => m.includes('Main.dc.html')),
      'the generated contents page standing at Main is not the home page being drawn');
  });

  test('an application with no artboard named for it is caught, not exempted', async () => {
    // The hole the gap review found: the check only looked at applications that
    // already had a file, so the two that slipped through were the shopfront and
    // the bay instructions. The physical work is the part a client checks first.
    const r = await validate();
    const unassigned = r.promises.filter((f) => f.rule === 'application-not-assigned').map((f) => f.message);
    assert.ok(unassigned.some((m) => m.includes('Shopfront')), JSON.stringify(unassigned));
    assert.ok(unassigned.some((m) => m.includes('Bay instructions')));
    assert.ok(r.promises.filter((f) => f.rule === 'application-not-assigned').every((f) => f.fix),
      'described is not designed, and it has to say what to do about it');
  });

  test('a written art direction with no image anywhere is an error, once there is design work to judge', async () => {
    const before = await validate();
    assert.deepEqual(before.promises.filter((f) => f.rule === 'signature-not-shown'), [],
      'silent while nothing has been authored: the proof round simply has not happened');

    const { artboard } = await import('../scripts/canvas.mjs');
    await writeFile(path.join(canvas(), 'Hero.dc.html'), artboard({
      name: 'Hero', systemNote: 'Authored by hand.',
      body: '<div style="padding:60px">The good kind of wet dog.</div>',
    }));
    const after = await validate();
    assert.ok(after.promises.some((f) => f.rule === 'signature-not-shown' && f.level === 'error'),
      'the brand wrote a shot list and shot nothing');

    await writeFile(path.join(canvas(), 'Hero.dc.html'), artboard({
      name: 'Hero', systemNote: 'Authored by hand.',
      body: '<div style="padding:60px">[PHOTOGRAPH: a dog mid-shake, cropped past two edges]</div>',
    }));
    const fixed = await validate();
    assert.deepEqual(fixed.promises.filter((f) => f.rule === 'signature-not-shown'), [],
      'a captioned placeholder is honest, and honest is what clears it');
  });

  test('the exit code follows the errors, so this can gate anything', async () => {
    const e = await run('node', [CLI, 'validate', '--dir', 'brand/canvas'], { cwd: p }).catch((err) => err);
    assert.match(e.stdout ?? '', /The brief and the deliverable disagree/);
  });

  test('a brand with nothing declared is not nagged', async () => {
    const q = path.join(dir, 'promises-empty');
    await mkdir(q, { recursive: true });
    await run('node', [CLI, 'init', '--name', 'Bare'], { cwd: q });
    await run('node', [CLI, 'set', 'identity.colour.primary', '#1F6F4A'], { cwd: q });
    await run('node', [CLI, 'set', 'identity.school', 'swiss-modernist'], { cwd: q });
    await run('node', [CLI, 'sheets', '--out', 'brand/canvas'], { cwd: q });
    const { stdout } = await run('node', [CLI, 'validate', '--dir', 'brand/canvas', '--json'], { cwd: q }).catch((e) => e);
    assert.deepEqual(JSON.parse(stdout).promises, [], 'nothing promised, nothing to keep');
  });
});

describe('a brand file written before the rename still opens', () => {
  test('the atelier block becomes the brandi block, and keeps its place', async () => {
    const { migrateBrand } = await import('../scripts/brandfile.mjs');
    const old = { atelier: { version: '1.0.0', phase: 'proof', completed: ['recon'] }, meta: { name: 'X' } };
    const moved = migrateBrand(old);
    assert.deepEqual(moved.brandi, old.atelier);
    assert.equal(moved.atelier, undefined);
    assert.equal(Object.keys(moved)[0], 'brandi', 'and it stays the first key, as it was');
    assert.equal(moved.meta.name, 'X');
  });

  test('a current file is untouched, and a file carrying both keeps the new one', async () => {
    const { migrateBrand } = await import('../scripts/brandfile.mjs');
    const current = { brandi: { version: '2' }, meta: {} };
    assert.equal(migrateBrand(current), current);
    const both = { atelier: { version: '1' }, brandi: { version: '2' }, meta: {} };
    assert.equal(migrateBrand(both).brandi.version, '2');
  });

  test('the CLI opens one end to end, rather than refusing it', async () => {
    const p = path.join(dir, 'old-format');
    await mkdir(path.join(p, 'brand'), { recursive: true });
    const fixture = JSON.parse(await readFile(FIXTURE, 'utf8'));
    const { brandi: block, ...rest } = fixture;
    await writeFile(path.join(p, 'brand', 'brand.json'), JSON.stringify({ atelier: block, ...rest }, null, 2));
    const { stdout } = await run('node', [CLI, 'status', '--json'], { cwd: p });
    assert.equal(JSON.parse(stdout).ok, true, 'an older file is an older file, not a broken one');
  });
});

/**
 * The gap review found this in the part of the tool that is supposed to be
 * strongest: five token formats carrying sizes, line heights and letter
 * spacing, and nothing at all saying what weight a heading is.
 */
describe('the weight ladder', () => {
  const built = () => buildSystem(systemInputFromBrand(brand));

  test('the system resolves weights, and only ones it loads', () => {
    const w = built().type.weights;
    assert.deepEqual(w.map((x) => x.value), [400, 500, 700]);
    for (const x of w) assert.ok(x.use, `${x.name} has to say what it is for`);
  });

  test('the request and the ladder cannot drift, because they are the same list', async () => {
    const A = await import('../scripts/artboards.mjs');
    const url = A.googleFontsUrl(['Bitter']);
    for (const x of built().type.weights) {
      assert.ok(url.includes(String(x.value)), `${x.value} is documented but never downloaded`);
    }
    // The one that started it: the components sheet set 600, which was the one
    // weight the font request never asked for, so the browser synthesised it.
    assert.equal(url.includes('600'), false);
    const sheets = A.specificationSheets(built(), { brandName: 'Acme' });
    for (const sheet of sheets) {
      for (const [, value] of sheet.source.matchAll(/font-weight:\s*(\d{3,4})/g)) {
        assert.ok([400, 500, 700, 1000].includes(Number(value)),
          `${sheet.file} sets font-weight ${value}, which the system does not load`);
      }
    }
  });

  test('it reaches every token format', () => {
    const s2 = built();
    assert.match(toCss(s2), /--font-weight-bold: 700/);
    assert.match(toTailwind(s2), /--font-weight-medium: 500/);
    assert.match(toTypeScript(s2), /fontWeight/);
    assert.equal(toDtcg(s2).fontWeight.regular.$value, 400);
    assert.equal(toDtcg(s2).fontWeight.$type, 'fontWeight');
  });

  test('the specimen sheet and the book both state it', async () => {
    const A = await import('../scripts/artboards.mjs');
    const typography = A.specificationSheets(built(), { brandName: 'Muddy Paws' })
      .find((x) => x.file === 'Typography.dc.html').source;
    assert.match(typography, /--font-weight-regular/);
    assert.match(renderBrandBook({ brand, system: built() }), /--font-weight-bold/);
  });
});

describe('colour that leaves the screen', () => {
  test('print shows the brand colour, not the variant adjusted for a screen', () => {
    // Caught by rendering the sheet: the accent row showed #B56514, the version
    // adjusted so a label on it stays readable, next to a Pantone matched
    // against #D4823A. That is how a printer orders the wrong ink.
    const system2 = buildSystem(systemInputFromBrand(brand));
    const accent = system2.print.swatches.find((w) => w.role === 'accent1.solid');
    assert.equal(accent.hex.toUpperCase(), brand.identity.colour.accents[0].toUpperCase(),
      'the swatch has to be the colour the Pantone was matched against');
    assert.equal(system2.print.swatches.find((w) => w.role === 'brand.solid').hex.toUpperCase(),
      system2.palettes.brand.light.steps[8].hex.toUpperCase(), 'step 9 is the colour itself');
  });

  test('a recorded value always beats a computed one, and says which it is', () => {
    const system2 = buildSystem(systemInputFromBrand(brand));
    const recorded = system2.print.swatches.find((w) => w.role === 'brand.solid');
    assert.equal(recorded.computed, false, 'the fixture records CMYK for this one');
    assert.equal(recorded.cmykString, '88/29/78/16');
    assert.equal(recorded.verified, true);
    const computed = system2.print.swatches.find((w) => w.role === 'neutral.paper');
    assert.equal(computed.computed, true);
    assert.equal(computed.verified, false, 'nobody proofed it, so it must not claim they did');
  });

  test('a Pantone is never invented', () => {
    const bare = buildSystem({ primary: '#1F6F4A', type: { display: 'Bitter', body: 'Karla' } });
    for (const w of bare.print.swatches) {
      assert.equal(w.pantoneCoated, null, 'a guessed Pantone is worse than an absent one: it gets ordered');
      assert.equal(w.ral, null);
      assert.equal(w.verified, false);
      assert.ok(w.cmykString, 'CMYK is computed, and marked as computed');
    }
    assert.match(bare.print.caveat, /uncalibrated/);
  });
});

describe('the seam with the logo forge', () => {
  test('a colourway recorded as a file is not treated as a master', async () => {
    // The forge writes `primary`, `mono-black` and `mono-white` into
    // identity.logo.files. `assets` DERIVES mono and reversed, so building a
    // pack per recorded file would derive five colourways of a colourway.
    const p = path.join(dir, 'roles');
    await mkdir(path.join(p, 'brand', 'logo', 'master'), { recursive: true });
    await run('node', [CLI, 'init', '--name', 'Roles'], { cwd: p });
    const b = JSON.parse(await readFile(FIXTURE, 'utf8'));
    b.identity.logo.files = [
      { path: 'logo/master/primary.svg', role: 'primary' },
      { path: 'logo/master/mono-black.svg', role: 'mono-black' },
      { path: 'logo/master/mono-white.svg', role: 'mono-white' },
    ];
    await writeFile(path.join(p, 'brand', 'brand.json'), JSON.stringify(b, null, 2));
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 150"><circle cx="120" cy="75" r="40" fill="#1F6F4A"/></svg>';
    for (const f of ['primary.svg', 'mono-black.svg', 'mono-white.svg']) {
      await writeFile(path.join(p, 'brand', 'logo', 'master', f), svg);
    }
    const { stdout } = await run('node', [CLI, 'assets', '--json'], { cwd: p });
    const r = JSON.parse(stdout);
    assert.equal(r.packs.length, 1, 'one master, one pack');
    assert.equal(r.packs[0].role, 'primary');
  });

  test('nothing but colourways is refused, with what to record instead', async () => {
    const p = path.join(dir, 'no-master');
    await mkdir(path.join(p, 'brand', 'logo'), { recursive: true });
    await run('node', [CLI, 'init', '--name', 'NoMaster'], { cwd: p });
    const b = JSON.parse(await readFile(FIXTURE, 'utf8'));
    b.identity.logo.files = [{ path: 'logo/mono-black.svg', role: 'mono-black' }];
    await writeFile(path.join(p, 'brand', 'brand.json'), JSON.stringify(b, null, 2));
    await writeFile(path.join(p, 'brand', 'logo', 'mono-black.svg'),
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle r="4" fill="#000"/></svg>');
    const e = await run('node', [CLI, 'assets'], { cwd: p }).catch((err) => err);
    assert.match(e.stderr, /colourway rather than a master/);
    assert.match(e.stderr, /role "primary"/);
  });

  test('the logo round travels in the handover, because a mark needs its argument', async () => {
    const { PARTS } = await import('../scripts/handoff.mjs');
    const logo = PARTS.find((x) => x.id === 'logo');
    assert.ok(logo, 'the round and the provenance are part of what is handed over');
    assert.equal(logo.optional, true, 'a brand with no mark yet still has a handover');
    assert.match(logo.what, /provenance/);
  });
});

describe('the icon set', () => {
  test('is drawn to whatever grid and stroke the brand recorded, not to 24 and 2', async () => {
    const A = await import('../scripts/artboards.mjs');
    const system2 = buildSystem(systemInputFromBrand(brand));
    const src = A.iconsArtboard(system2, { brandName: 'X', iconography: { grid: 32, strokePx: 3, style: 'square terminals' } });
    assert.match(src, /viewBox="0 0 32 32"/);
    assert.match(src, /stroke-width="3"/);
    assert.match(src, /stroke-linecap="butt"/, 'a square-terminal brand does not get round caps');
  });

  test('it ships no third-party artwork, because that would break the brand rule on day one', async () => {
    const A = await import('../scripts/artboards.mjs');
    const src = A.iconsArtboard(buildSystem(systemInputFromBrand(brand)), { brandName: 'X' });
    assert.equal(/feather|lucide|heroicons|material-icons|fontawesome/i.test(src), false);
    assert.match(src, /Drawn in-house/);
    assert.match(src, /Redraw at 16 rather than scaling to it/, 'and it says where the stroke breaks');
  });

  test('every icon is a line icon, since one filled icon in a line set is the one you see', async () => {
    const A = await import('../scripts/artboards.mjs');
    const src = A.iconsArtboard(buildSystem(systemInputFromBrand(brand)), { brandName: 'X' });
    for (const [, attrs] of src.matchAll(/<svg ([^>]*viewBox="0 0 24 24"[^>]*)>/g)) {
      assert.match(attrs, /fill="none"/);
      assert.match(attrs, /stroke-width="2"/);
    }
  });
});

/**
 * A symlink is not a string.
 *
 * The logo forge had a lexical `within()` that a symlink walked straight
 * through, and the same shape was here: `path.resolve` plus `startsWith` on a
 * logo path. This one was worse, because the file it reads is inlined into the
 * brand book, which is a document that gets handed to a client.
 */
describe('a logo path cannot escape the project through a symlink', () => {
  test('a link pointing outside is refused, and its contents never reach the book', async () => {
    const p = path.join(dir, 'escape');
    const outside = path.join(dir, 'escape-outside');
    await mkdir(path.join(p, 'assets'), { recursive: true });
    await mkdir(outside, { recursive: true });
    await writeFile(path.join(outside, 'secret.svg'),
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><!--SECRET MATERIAL--><circle r="4" fill="#000"/></svg>');
    await run('node', [CLI, 'init', '--name', 'Escape'], { cwd: p });

    const b = JSON.parse(await readFile(FIXTURE, 'utf8'));
    b.identity.logo.files = [{ path: 'assets/leak.svg', role: 'primary' }];
    await writeFile(path.join(p, 'brand', 'brand.json'), JSON.stringify(b, null, 2));
    await symlink(path.join(outside, 'secret.svg'), path.join(p, 'assets', 'leak.svg'));

    await run('node', [CLI, 'book'], { cwd: p });
    const book = await readFile(path.join(p, 'brand', 'brand-book.html'), 'utf8');
    assert.equal(book.includes('SECRET MATERIAL'), false,
      'a lexical guard let this through, and the book is what a client is handed');
  });

  test('a real file inside the project still loads, so the fix did not just break it', async () => {
    const p = path.join(dir, 'no-escape');
    await mkdir(path.join(p, 'assets'), { recursive: true });
    await run('node', [CLI, 'init', '--name', 'Fine'], { cwd: p });
    const b = JSON.parse(await readFile(FIXTURE, 'utf8'));
    b.identity.logo.files = [{ path: 'assets/mark.svg', role: 'primary' }];
    await writeFile(path.join(p, 'brand', 'brand.json'), JSON.stringify(b, null, 2));
    await writeFile(path.join(p, 'assets', 'mark.svg'),
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle r="4" fill="#1F6F4A"/></svg>');
    await run('node', [CLI, 'book'], { cwd: p });
    assert.match(await readFile(path.join(p, 'brand', 'brand-book.html'), 'utf8'), /#1F6F4A/);
  });

  test('a symlink that stays inside the project is fine, because that is a legitimate layout', async () => {
    const p = path.join(dir, 'inside-link');
    await mkdir(path.join(p, 'assets'), { recursive: true });
    await mkdir(path.join(p, 'design'), { recursive: true });
    await run('node', [CLI, 'init', '--name', 'Inside'], { cwd: p });
    const b = JSON.parse(await readFile(FIXTURE, 'utf8'));
    b.identity.logo.files = [{ path: 'assets/mark.svg', role: 'primary' }];
    await writeFile(path.join(p, 'brand', 'brand.json'), JSON.stringify(b, null, 2));
    await writeFile(path.join(p, 'design', 'real.svg'),
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle r="4" fill="#D4823A"/></svg>');
    await symlink(path.join(p, 'design', 'real.svg'), path.join(p, 'assets', 'mark.svg'));
    await run('node', [CLI, 'book'], { cwd: p });
    assert.match(await readFile(path.join(p, 'brand', 'brand-book.html'), 'utf8'), /#D4823A/,
      'the guard is about leaving the project, not about symlinks');
  });

  test('the handover does not follow a symlinked directory out either', async () => {
    const { buildHandoff } = await import('../scripts/handoff.mjs');
    const p = path.join(dir, 'handoff-escape');
    const outside = path.join(dir, 'handoff-outside');
    await mkdir(path.join(p, 'brand'), { recursive: true });
    await mkdir(outside, { recursive: true });
    await writeFile(path.join(outside, 'leak.txt'), 'SECRET MATERIAL');
    await writeFile(path.join(p, 'brand', 'brand.json'), '{}');
    await writeFile(path.join(p, 'brand', 'brand-book.html'), '<html>');
    await symlink(outside, path.join(p, 'brand', 'assets'));
    const out = path.join(p, 'handover');
    await buildHandoff({ brandDir: path.join(p, 'brand'), outDir: out, brand: { meta: { name: 'X' } }, system });
    const leaked = existsSync(path.join(out, 'assets', 'leak.txt'))
      && (await readFile(path.join(out, 'assets', 'leak.txt'), 'utf8')).includes('SECRET');
    assert.equal(leaked, false);
  });
});

describe('counts read as English', () => {
  test('one file is a file, not files', async () => {
    const p = path.join(dir, 'plural');
    await mkdir(p, { recursive: true });
    // Not a purple: #8B5CF6 is off-palette AND in the contract's indigo set, so
    // it is legitimately two findings and would not test the singular.
    await writeFile(path.join(p, 'a.css'), '.a{color:#B3261E}');
    await run('node', [CLI, 'init', '--name', 'Plural'], { cwd: p });
    await writeFile(path.join(p, 'brand', 'brand.json'), await readFile(FIXTURE, 'utf8'));
    const { stdout } = await run('node', [CLI, 'check', '.'], { cwd: p }).catch((e) => e);
    assert.match(stdout, /Checked 1 file against/);
    assert.match(stdout, /\b1 error, 0 warnings, 0 notes\./);
    assert.doesNotMatch(stdout, /\b1 (files|errors|warnings|notes)\b/);
  });
});

describe('numeric flags refuse to be silently wrong', () => {
  test('a junk --limit is an error, not an empty report that reads as a pass', async () => {
    const p = path.join(dir, 'junk-limit');
    await mkdir(p, { recursive: true });
    await writeFile(path.join(p, 'a.css'), '.a{color:#8B5CF6}');
    await run('node', [CLI, 'init', '--name', 'Junk'], { cwd: p });
    await writeFile(path.join(p, 'brand', 'brand.json'), await readFile(FIXTURE, 'utf8'));
    const e = await run('node', [CLI, 'check', '.', '--limit', 'lots'], { cwd: p }).catch((err) => err);
    assert.match(e.stderr, /--limit takes a whole number/);
    assert.notEqual(e.code, 0);
  });

  test('a bare --limit is junk too, not a report of one finding', async () => {
    const p = path.join(dir, 'bare-limit');
    await mkdir(p, { recursive: true });
    await writeFile(path.join(p, 'a.css'), '.a{color:#8B5CF6}');
    await run('node', [CLI, 'init', '--name', 'Bare'], { cwd: p });
    await writeFile(path.join(p, 'brand', 'brand.json'), await readFile(FIXTURE, 'utf8'));
    const e = await run('node', [CLI, 'check', '.', '--limit'], { cwd: p }).catch((err) => err);
    assert.match(e.stderr, /--limit takes a whole number/);
  });

  test('a junk --depth on scan is caught the same way', async () => {
    const p = path.join(dir, 'junk-depth');
    await mkdir(p, { recursive: true });
    await run('node', [CLI, 'init', '--name', 'Depthy'], { cwd: p });
    const e = await run('node', [CLI, 'scan', '--depth', '0'], { cwd: p }).catch((err) => err);
    assert.match(e.stderr, /--depth takes a whole number/);
  });
});
