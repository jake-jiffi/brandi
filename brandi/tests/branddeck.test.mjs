/**
 * The brand book as a deck: page order, page count, contents numbers, the
 * placeholder rule, the pairing matrix, the logo fallback, and the print flag.
 * The Chrome-backed cases check the PDF, the composition of every page (no
 * dead lower halves, no corner mark over the tiles, aligned contents columns,
 * a drawn co-branding gap), the phone reflow and the artboard render for real.
 */
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, copyFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { renderBrandDeck, pairingMatrix, table, titleise, frameLabel, PLACEHOLDER, PAGE_W, PAGE_H } from '../scripts/branddeck.mjs';
import { renderBrandBook } from '../scripts/brandbook.mjs';
import { findChrome, runChrome } from '../scripts/preview.mjs';
import { buildSystem } from '../scripts/system.mjs';
import { emptyBrand, systemInputFromBrand } from '../scripts/brandfile.mjs';
import { wcagCheck } from '../scripts/color.mjs';
import { encodePng, decodePng } from '../scripts/png.mjs';
import { artboard } from '../scripts/canvas.mjs';

const run = promisify(execFile);
const CLI = path.join(import.meta.dirname, '..', 'scripts', 'brandi.mjs');
const FIXTURE = path.join(import.meta.dirname, 'fixtures', 'muddy-paws.json');
const SCRATCH_SVG = '<svg xmlns="http://www.w3.org/2000/svg" id="the-mark" viewBox="0 0 300 100"><rect width="300" height="100" fill="#1F6F4A"/></svg>';
const SCRATCH_ASSETS = {
  'assets/logos/muddy-paws-primary.svg': { kind: 'svg', markup: SCRATCH_SVG },
  'assets/logos/muddy-paws-mark.svg': { kind: 'svg', markup: '<svg xmlns="http://www.w3.org/2000/svg" id="the-favicon" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#1F6F4A"/></svg>' },
};

let brand;
let system;
let deck;

before(async () => {
  brand = JSON.parse(await readFile(FIXTURE, 'utf8'));
  system = buildSystem(systemInputFromBrand(brand));
  deck = renderBrandDeck({ brand, system });
});

const pageIds = (html) => [...html.matchAll(/<section class="page(?: divider)?" id="([\w-]+)"/g)].map((m) => m[1]);
const pageOf = (html, id) => new RegExp(`<section class="page" id="${id}"[^>]*>([\\s\\S]*?)</section>`).exec(html)?.[1] ?? null;
const clone = (b) => JSON.parse(JSON.stringify(b));

// The fixture's page count, and the count once artboards are supplied.
const FIXTURE_PAGES = 54;

describe('the deck is a 16:9 presentation, in the order the brief lists', () => {
  test('every page is one 1920x1080 section and the page list agrees with the markup', () => {
    const ids = pageIds(deck.html);
    const listed = deck.pages.filter((p) => !p.absent);
    assert.equal(ids.length, listed.length);
    assert.deepEqual(ids, listed.map((p) => p.id));
    assert.deepEqual(listed.map((p) => p.n), listed.map((_, i) => i + 1), 'page numbers are positions');
    assert.match(deck.html, new RegExp(`@page \\{ size: ${PAGE_W}px ${PAGE_H}px; margin: 0; \\}`));
    assert.equal(/@page \{ size: A4/.test(deck.html), false);
  });

  test('cover, intro, contents, eight chapters with a divider each, and a closing page, in order', () => {
    const ids = pageIds(deck.html);
    assert.deepEqual(ids.slice(0, 3), ['cover', 'intro', 'contents']);
    assert.equal(ids.at(-1), 'closing');
    const dividers = ids.filter((id) => id.startsWith('chapter-'));
    assert.deepEqual(dividers, ['chapter-framework', 'chapter-logo', 'chapter-colour', 'chapter-typography', 'chapter-assets', 'chapter-system', 'chapter-in-use', 'chapter-governance']);
    // Chapter pages, in the brief's order, with the round 3 additions: the
    // field, personality, tone by situation, colour off the screen and the
    // applications page.
    const expected = [
      'purpose', 'driver', 'field', 'pillars', 'personality', 'proposition', 'tone', 'tone-situations', 'key-messaging', 'writing',
      'our-logo', 'variants', 'colourways', 'clear-space', 'minimum-size', 'misuse', 'cobranding', 'tagline-lockup', 'favicon',
      'primary-palette', 'production', 'ramps', 'colour-usage', 'pairings', 'scalability',
      'primary-typeface', 'secondary-typeface', 'hierarchy', 'type-scale', 'type-examples',
      'imagery', 'photography', 'icons', 'shape', 'device',
      'space-layout', 'motion', 'accessibility', 'implementation',
      'applications',
      'anti-patterns', 'decisions',
    ];
    const content = ids.filter((id) => !id.startsWith('chapter-') && !['cover', 'intro', 'contents', 'closing'].includes(id));
    assert.deepEqual(content, expected);
    assert.equal(ids.length, FIXTURE_PAGES);
  });

  test('the contents page numbers are the positions of the pages they name', () => {
    const toc = /<nav class="toc"[^>]*>([\s\S]*?)<\/nav>/.exec(deck.html)[1];
    const entries = [...toc.matchAll(/<a[^>]*href="#([\w-]+)"[^>]*><span>[^<]*<\/span><span>(\d+)<\/span>/g)];
    assert.ok(entries.length >= 40);
    const ids = pageIds(deck.html);
    for (const [, id, n] of entries) assert.equal(Number(n), ids.indexOf(id) + 1, `${id} is listed as page ${n}`);
    // Each chapter and its entries are one unbreakable block.
    assert.equal((toc.match(/<div class="toc-chapter"/g) ?? []).length, 8);
  });

  test('content pages carry a running footer with the chapter, the brand and version, and the page number', () => {
    const page = pageOf(deck.html, 'misuse');
    assert.match(page, /<div class="footer"/);
    assert.match(page, /Logo<\/span>/);
    assert.match(page, /Muddy Paws brand guidelines \/ v1\.0\.0/);
    assert.match(page, /<span class="folio"[^>]*>21<\/span>/);
  });

  test('one h1 per page, a lang attribute, alt text on every image, and a visible focus style', () => {
    const pages = deck.html.split('<section class="page').slice(1);
    for (const p of pages) assert.equal((p.match(/<h1[\s>]/g) ?? []).length, 1, 'exactly one h1 per page');
    assert.match(deck.html, /<html lang="en-AU">/);
    for (const img of deck.html.matchAll(/<img\b[^>]*>/g)) assert.match(img[0], /\balt="[^"]+"/);
    assert.match(deck.html, /a:focus-visible \{ outline: 3px solid/);
    assert.match(deck.html, /generated from the resolved system/, 'check must recognise it as generated');
  });

  test('the closing page is a colophon that calls the deck a living document', () => {
    assert.match(deck.html, /Thank you for using the brand correctly/);
    assert.match(deck.html, /living document/);
    assert.match(deck.html, /Built with Brandi/);
  });
});

describe('R2-N-01: everything the print book carries reaches the deck', () => {
  test('tone by situation, the elevator pitch, competitors, personality, print production and the chart palette are all on a page', () => {
    const html = deck.html;
    const tonePage = pageOf(html, 'tone-situations');
    for (const t of brand.voice.tone) assert.ok(tonePage.includes(t.situation), `situation "${t.situation}"`);
    const field = pageOf(html, 'field');
    assert.ok(field.includes(brand.voice.elevatorPitch), 'the elevator pitch');
    for (const c of brand.strategy.competitors) assert.ok(field.includes(c.name), `competitor "${c.name}"`);
    const personality = pageOf(html, 'personality');
    for (const a of brand.strategy.personality.attributes) {
      assert.ok(personality.includes(`>${a.name}<`), `attribute "${a.name}"`);
      assert.ok(personality.includes(a.notThis), `not "${a.notThis}"`);
    }
    const production = pageOf(html, 'production');
    assert.match(production, /RAL 6005/);
    assert.match(production, /3M 180mC-77/);
    assert.match(production, /Madeira Polyneon 1751/);
    for (const hex of system.dataViz.categorical) assert.ok(production.includes(hex), `chart colour ${hex}`);
    const apps = pageOf(html, 'applications');
    for (const a of brand.applications) {
      assert.ok(apps.includes(a.name), `application "${a.name}"`);
      if (a.notes) assert.ok(apps.includes(a.notes.replace(/"/g, '&quot;')), `notes for "${a.name}"`);
    }
  });

  test('a promise of "the next page" is kept, and not made when there is nothing to follow it', () => {
    const ids = pageIds(deck.html);
    for (const m of deck.html.matchAll(/(?:next|following) pages?/g)) {
      const before = deck.html.slice(0, m.index);
      const current = [...before.matchAll(/<section class="page(?: divider)?" id="([\w-]+)"/g)].at(-1)[1];
      assert.equal(ids[ids.indexOf(current) + 1], 'tone-situations', `"${m[0]}" on ${current} is followed by the situations`);
    }
    assert.ok(/next page/.test(pageOf(deck.html, 'tone')), 'the fixture tone page points at the situations');
    const noTone = clone(brand);
    delete noTone.voice.tone;
    const out = renderBrandDeck({ brand: noTone, system });
    assert.equal(/(?:next|following) pages?/.test(out.html), false, 'nothing promised when there is no situations page');
    assert.ok(out.pages.find((p) => p.id === 'tone-situations').absent);
  });
});

describe('it does not invent things', () => {
  test('a placeholder is bracketed and marked, and the fixture only carries the ones its data cannot fill', () => {
    const found = [...deck.html.matchAll(new RegExp(`\\[${PLACEHOLDER}: ([^\\]]+)\\]`, 'g'))].map((m) => m[1]);
    assert.ok(found.length > 0);
    // Every placeholder names a thing the fixture genuinely lacks.
    const allowed = [/why this pillar matters/, /story behind the mark/, /logo artwork/, /an approved colourway/, /co-branding rule/, /favicon artwork/, /coated match/, /uncoated match/, /usage rights/, /price or opening hours/, /proof artboards/];
    for (const f of found) assert.ok(allowed.some((re) => re.test(f)), `unexpected placeholder: ${f}`);
    assert.ok(found.some((f) => /co-branding rule/.test(f)), 'the fixture has no co-branding rule');
  });

  test('a page whose data is entirely absent is listed in the contents as not yet recorded', () => {
    const bare = emptyBrand({ name: 'Nothing Yet' });
    bare.identity.colour.primary = '#2563EB';
    const out = renderBrandDeck({ brand: bare, system: buildSystem({ primary: '#2563EB' }) });
    const absent = out.pages.filter((p) => p.absent).map((p) => p.id);
    for (const id of ['pillars', 'proposition', 'tone', 'tone-situations', 'personality', 'field', 'tagline-lockup', 'favicon', 'device', 'applications']) assert.ok(absent.includes(id), `${id} should be absent for an empty brand`);
    assert.equal(pageIds(out.html).includes('pillars'), false);
    assert.match(out.html, /\[not yet recorded\]/);
    // The anti-patterns page legitimately names lorem ipsum as a thing to avoid.
    const withoutRules = out.html.replace(/<section class="page" id="anti-patterns"[\s\S]*?<\/section>/, '');
    assert.equal(/lorem ipsum|trusted by \d/i.test(withoutRules), false);
    assert.equal(pageIds(out.html).length, out.pages.filter((p) => !p.absent).length);
  });

  test('the illustration and dial-up pages are omitted rather than placeholdered when there is nothing behind them', () => {
    assert.equal(pageIds(deck.html).includes('illustration'), false);
    const withIll = clone(brand);
    withIll.identity.illustration = { style: 'Flat, two colours, no outlines.', themes: ['Dogs at work', 'Water'], dos: ['Keep it flat'], donts: ['No gradients'] };
    const html = renderBrandDeck({ brand: withIll, system }).html;
    assert.ok(pageIds(html).includes('illustration'));
    // R2-N-12: themes, dos and do-nots are tiles, not bullets.
    const page = pageOf(html, 'illustration');
    assert.equal((page.match(/class="card illustration-theme"/g) ?? []).length, 2);
    assert.equal((page.match(/data-verdict="do"/g) ?? []).length, 1);
    assert.equal((page.match(/data-verdict="dont"/g) ?? []).length, 1);
  });

  test('hostile content is escaped, not obeyed', () => {
    const evil = clone(brand);
    evil.strategy.purpose = '</p><script>x()</script>';
    const out = renderBrandDeck({ brand: evil, system }).html;
    assert.equal(out.includes('<script>x()</script>'), false);
    assert.ok(out.includes('&lt;script&gt;'));
  });
});

describe('the logo', () => {
  test('is inlined on every logo page when the file is supplied, with a corner mark on content pages', () => {
    const withLogo = renderBrandDeck({ brand, system, assets: SCRATCH_ASSETS });
    assert.ok((withLogo.html.match(/id="the-mark"/g) ?? []).length >= 20);
    assert.match(withLogo.html, /<div class="corner-mark"/);
    assert.equal(/\[Not recorded yet: the logo artwork/.test(withLogo.html), false);
  });

  test('falls back to the typeset wordmark, and says so in a bracketed tile, when the file is not on disk', () => {
    assert.match(deck.html, /\[Not recorded yet: the logo artwork\. 1 logo file recorded but not found on disk/);
    assert.match(deck.html, /class="wordmark"[^>]*>Muddy Paws</);
    assert.equal(/class="corner-mark"/.test(deck.html), false);
  });

  test('draws the clear space with a measuring square on all four sides and the minimum size at the recorded figures', () => {
    const cs = pageOf(deck.html, 'clear-space');
    assert.equal((cs.match(/position:absolute;width:\d+px;height:\d+px;background/g) ?? []).length, 4);
    assert.match(cs, /Clear space on every side equals the height of the letter M/);
    const ms = pageOf(deck.html, 'minimum-size');
    assert.match(ms, /22mm \/ 140px/);
    assert.match(ms, /18mm \/ 72px/);
    assert.match(ms, /140px wide/);
  });

  test('R2-N-06: with a supplied file and no reversed artwork, the brand-colour and dark cells reverse it by filter, and a supplied reversed file is drawn as it is', () => {
    const withLogo = renderBrandDeck({ brand, system, assets: SCRATCH_ASSETS }).html;
    const page = pageOf(withLogo, 'variants');
    const cells = (ground) => [...page.matchAll(new RegExp(`<div data-ground="${ground}"[^>]*>([\\s\\S]*?)</div>`, 'g'))].map((m) => m[1]);
    assert.equal(cells('primary').length, 4);
    for (const c of cells('primary')) assert.match(c, /filter:brightness\(0\) invert\(1\)/, 'reverse filter on the brand ground');
    for (const c of cells('dark')) assert.match(c, /filter:brightness\(0\) invert\(1\)/);
    for (const c of cells('light')) assert.equal(/filter:/.test(c), false, 'the light ground shows the artwork in its own colours');
    assert.match(page, /shown as a silhouette made by filter/);
    // A reversed file on disk is drawn unfiltered on the brand ground.
    const withReversed = renderBrandDeck({ brand, system, assets: { ...SCRATCH_ASSETS, 'assets/logos/muddy-paws-reversed.svg': { kind: 'svg', markup: '<svg id="reversed-mark" viewBox="0 0 300 100"><rect width="300" height="100" fill="#fff"/></svg>' } } }).html;
    const rev = [...pageOf(withReversed, 'variants').matchAll(/<div data-ground="primary"[^>]*>([\s\S]*?)<\/div>/g)].map((m) => m[1]).find((c) => c.includes('reversed-mark'));
    assert.ok(rev, 'the reversed variant row uses the reversed file');
    assert.equal(/filter:/.test(rev), false);
    // The typeset fallback never has a filter to apply.
    for (const c of [...pageOf(deck.html, 'variants').matchAll(/<div data-ground="primary"[^>]*>([\s\S]*?)<\/div>/g)]) assert.equal(/filter:/.test(c[1]), false);
  });

  test('R2-N-07: a rule that forbids the lockup shows the tagline alone, and a boolean decides either way', () => {
    // The fixture says "Never locked to the mark".
    const page = pageOf(deck.html, 'tagline-lockup');
    assert.equal(/class="mark"|class="wordmark"/.test(page.split('<div class="canvas')[1]), false, 'no mark drawn beside the tagline');
    assert.match(page, /Headline position, alone/);
    assert.match(page, /The good kind of wet dog\./);
    assert.match(page, /Never locked to the mark/);
    assert.match(page, /<h1>Tagline<\/h1>/);
    // A brand whose rule allows it gets the two drawn formats.
    const allows = clone(brand);
    allows.voice.tagline.lockup = 'Locks under the mark at one M-height, left aligned.';
    const drawn = pageOf(renderBrandDeck({ brand: allows, system }).html, 'tagline-lockup');
    assert.match(drawn, /Large format/);
    assert.match(drawn, /Small format/);
    assert.ok(/class="wordmark"/.test(drawn.split('<div class="canvas')[1]));
    // locked: false wins over a permissive sentence; locked: true over a refusal.
    allows.voice.tagline.locked = false;
    assert.match(pageOf(renderBrandDeck({ brand: allows, system }).html, 'tagline-lockup'), /Headline position, alone/);
    const forced = clone(brand);
    forced.voice.tagline.locked = true;
    assert.match(pageOf(renderBrandDeck({ brand: forced, system }).html, 'tagline-lockup'), /Large format/);
  });

  test('R2-N-12: the co-branding gap is drawn as a measuring element at the recorded value', () => {
    const cob = clone(brand);
    cob.identity.logo.cobranding = { rule: 'Partner sits to the right of the mark.', alignment: 'Baseline of the wordmark', gap: '48px', partnerMax: 'never taller than the M' };
    const page = pageOf(renderBrandDeck({ brand: cob, system }).html, 'cobranding');
    assert.match(page, /class="cobranding-gap" data-gap="48" style="[^"]*width:48px/);
    assert.match(page, /at the recorded 48px/);
    assert.match(page, /align-items:flex-end/, 'baseline alignment puts the partner on the foot line');
    assert.match(page, /never taller than the M/);
    // A gap in words is drawn at X and labelled as such.
    const fixturePage = pageOf(deck.html, 'cobranding');
    assert.match(fixturePage, /class="cobranding-gap" data-gap="86"/);
    assert.match(fixturePage, /the same X as the clear-space page/);
  });
});

describe('the colour pages', () => {
  test('R2-N-05: a Pantone value is prefixed once', () => {
    assert.equal(/PMS PMS/.test(deck.html), false);
    assert.match(pageOf(deck.html, 'primary-palette'), /PMS 349 C \/ 349 U/);
    assert.match(pageOf(deck.html, 'production'), />349 C</);
  });

  test('cells are the system\'s own AA verdicts for normal text', () => {
    const m = pairingMatrix(system);
    const at = (a, b) => m.cells[m.colours.findIndex((c) => c.name === a)][m.colours.findIndex((c) => c.name === b)];
    const hex = (n) => m.colours.find((c) => c.name === n).hex;
    // Three cells recomputed from scratch.
    assert.equal(at('Ink', 'Page'), wcagCheck(hex('Ink'), hex('Page')).AA);
    assert.equal(at('Accent 1', 'Page'), wcagCheck(hex('Accent 1'), hex('Page')).AA);
    assert.equal(at('White', 'Brand'), wcagCheck(hex('White'), hex('Brand')).AA);
    assert.equal(at('Ink', 'Page'), true);
    assert.equal(at('Accent 1', 'Page'), false);
    assert.equal(at('White', 'Brand'), true);
  });

  test('a colour that fails as text everywhere is named in plain words', () => {
    const m = pairingMatrix(system);
    assert.deepEqual(m.neverText, ['Accent 1']);
    assert.match(deck.html, /Accent 1 is not to be used for text under any circumstances/);
  });

  test('R2-N-14: the page draws one tick or cross per cell as SVG paths, never as typed glyphs, and a pale cross gets an outline', () => {
    const m = pairingMatrix(system);
    const page = pageOf(deck.html, 'pairings');
    const cells = [...page.matchAll(/<td data-pair="(pass|fail)"[^>]*>([\s\S]*?)<\/td>/g)];
    assert.equal(cells.length, m.colours.length ** 2);
    for (const [, verdict, inner] of cells) {
      assert.match(inner, /<svg class="glyph"/);
      assert.equal((inner.match(/<path/g) ?? []).length >= 1, true);
      if (verdict === 'pass') assert.match(inner, /M4 12\.5 9\.5 18 20 6\.5/);
      else assert.match(inner, /M5 5 19 19M19 5 5 19/);
    }
    // White text on the brand tint fails and would be near-invisible: outlined.
    const white = m.colours.findIndex((c) => c.name === 'White');
    const tint = m.colours.findIndex((c) => c.name === 'Brand tint');
    const cell = cells[white * m.colours.length + tint][2];
    assert.equal((cell.match(/<path/g) ?? []).length, 2, 'a contrasting outline path behind the cross');
    // Nowhere in the deck is a tick or cross a text glyph.
    assert.equal(/&#10003;|&#10005;|✓|✕/.test(deck.html), false);
  });
});

describe('the pages that were text on white', () => {
  test('photography yes / no are tiles with a drawn verdict', () => {
    const page = pageOf(deck.html, 'photography');
    assert.equal((page.match(/data-verdict="yes"/g) ?? []).length, brand.identity.imagery.dos.length);
    assert.equal((page.match(/data-verdict="no"/g) ?? []).length, brand.identity.imagery.donts.length);
  });

  test('a signature move whose rule can be drawn gets a diagram; one that cannot keeps the sentence', () => {
    assert.match(pageOf(deck.html, 'device'), /<svg class="device-diagram" data-kind="crop past two edges"/);
    const band = clone(brand);
    band.identity.signatureMoves = [{ name: 'The green band', primitive: 'A band of the brand green runs edge to edge across every hero.' }];
    assert.match(pageOf(renderBrandDeck({ brand: band, system }).html, 'device'), /data-kind="band"/);
    const words = clone(brand);
    words.identity.signatureMoves = [{ name: 'The pause', primitive: 'Every headline is followed by a full stop and a beat.' }];
    const page = pageOf(renderBrandDeck({ brand: words, system }).html, 'device');
    assert.equal(/device-diagram/.test(page), false);
    assert.match(page, /Every headline is followed by a full stop/);
  });

  test('easing curves are drawn from their control points', () => {
    const page = pageOf(deck.html, 'motion');
    assert.equal((page.match(/<svg class="easing-curve"/g) ?? []).length, Object.keys(system.motion.easings).length);
    assert.match(page, /C 24\.0 120\.0, 0\.0 0\.0, 120 0/, 'cubic-bezier(0.2, 0, 0, 1) as a path');
  });
});

describe('the command line', () => {
  let dir;
  before(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'brandi-deck-'));
    await mkdir(path.join(dir, 'brand'), { recursive: true });
    await copyFile(FIXTURE, path.join(dir, 'brand', 'brand.json'));
  });
  after(async () => { await rm(dir, { recursive: true, force: true }); });
  // The CLI's own PDF step allows Chrome 180 s; the test waits longer than
  // that so a slow machine fails on the tool's message, not on the harness.
  const cli = async (args) => JSON.parse((await run(process.execPath, [CLI, ...args, '--json'], { cwd: dir, timeout: 240000, maxBuffer: 64 * 1024 * 1024 })).stdout);

  test('`book` writes the deck by default and reports its format and page count', async () => {
    const r = await cli(['book']);
    assert.equal(r.format, 'deck');
    assert.equal(r.pages, FIXTURE_PAGES);
    const html = await readFile(path.join(dir, 'brand', 'brand-book.html'), 'utf8');
    assert.equal(pageIds(html).length, FIXTURE_PAGES);
    assert.match(html, /@page \{ size: 1920px 1080px/);
  });

  test('`book --print` still writes the A4 book with its existing content, to its own file, and counts sections until a PDF exists', async () => {
    const { stdout } = await run(process.execPath, [CLI, 'book', '--print'], { cwd: dir, timeout: 120000 });
    assert.match(stdout, /21 sections, A4 print book/);
    const r = await cli(['book', '--print']);
    assert.equal(r.format, 'print');
    assert.equal(r.pages, null, 'no PDF, so no page count is claimed');
    assert.equal(r.sections, 21);
    assert.ok(r.files.some((f) => f.endsWith('brand-book-print.html')));
    const html = await readFile(path.join(dir, 'brand', 'brand-book-print.html'), 'utf8');
    assert.match(html, /@page \{ size: A4/);
    assert.match(html, /id="anti-patterns"/);
    assert.equal(html, renderBrandBook({ brand, system, assets: {} }));
    // And the deck it wrote a moment ago is untouched.
    assert.match(await readFile(path.join(dir, 'brand', 'brand-book.html'), 'utf8'), /@page \{ size: 1920px 1080px/);
  });

  test('`check` skips both books and the token files as generated', async () => {
    await cli(['tokens']);
    const r = await cli(['check', 'brand/tokens', 'brand/brand-book.html', 'brand/brand-book-print.html']);
    assert.equal(r.findings.length, 0, JSON.stringify(r.findings.slice(0, 3)));
    assert.ok(r.generatedSkipped.some((f) => f.endsWith('tokens.css')));
    assert.ok(r.generatedSkipped.some((f) => f.endsWith('brand-book.html')));
    assert.ok(r.generatedSkipped.some((f) => f.endsWith('brand-book-print.html')));
  });

  const chrome = findChrome();
  const gate = { skip: chrome ? false : 'no headless browser on this machine' };

  test('the PDF has one page per deck page, at 1920x1080, with the fonts embedded', gate, async (t) => {
    // R2-N-11: no wall-clock bound. Under load a build that takes 2 s alone
    // took 24 s; the tool's own 180 s Chrome timeout is the limit, and the
    // elapsed time is logged so a regression is still visible.
    const started = Date.now();
    const r = await cli(['book', '--pdf']);
    t.diagnostic(`book --pdf took ${Date.now() - started}ms`);
    assert.ok(r.pdf && existsSync(r.pdf), 'the PDF was written before the tool gave up');
    const pdf = await readFile(r.pdf, 'latin1');
    const pageObjects = (pdf.match(/\/Type\s*\/Page(?![s])/g) ?? []).length;
    assert.equal(pageObjects, r.pages);
    assert.match(pdf, /\/MediaBox\s*\[\s*0\s+0\s+1440\s+810\s*\]/, '1920x1080px is 1440x810pt');
    // Chrome embeds web fonts as Type 3 glyph programs, which carry no
    // FontFile stream; either form means the text is selectable and the
    // glyphs travel with the file.
    assert.match(pdf, /\/FontFile|\/Subtype\s*\/Type3/, 'fonts are embedded');
    // pdftotext, where it exists, confirms every page prints its own number;
    // pdffonts, where it exists, confirms nothing fell back to a system face.
    try {
      const { stdout } = await run('pdftotext', ['-layout', r.pdf, '-']);
      const pages = stdout.split('\f').slice(0, -1);
      assert.equal(pages.length, r.pages);
      for (let i = 2; i <= pages.length; i++) assert.ok(pages[i - 1].split(/\s+/).includes(String(i)), `page ${i} does not print its number`);
      const fonts = (await run('pdffonts', [r.pdf])).stdout.split('\n').slice(2).map((l) => l.split(/\s+/)[0]).filter(Boolean);
      assert.ok(fonts.length > 0);
      for (const f of fonts) assert.match(f, /Bitter|Karla|JetBrainsMono/, `${f} is not a brand face`);
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
    }
  });

  test('R2-N-09: `book --print --pdf` reports the PDF page count, which is more than its section count', gate, async () => {
    const r = await cli(['book', '--print', '--pdf']);
    assert.ok(r.pdf && existsSync(r.pdf));
    const pdf = await readFile(r.pdf, 'latin1');
    const pageObjects = (pdf.match(/\/Type\s*\/Page(?![s])/g) ?? []).length;
    assert.equal(r.pages, pageObjects);
    assert.equal(r.sections, 21);
    assert.ok(r.pages > r.sections, `${r.pages} PDF pages from ${r.sections} sections`);
    const { stdout } = await run(process.execPath, [CLI, 'book', '--print', '--pdf'], { cwd: dir, timeout: 240000 });
    assert.match(stdout, new RegExp(`${pageObjects} pages, A4 print book`));
  });

  test('a supplied SVG is inlined; the deck says when it is not', gate, async () => {
    await mkdir(path.join(dir, 'assets', 'logos'), { recursive: true });
    await writeFile(path.join(dir, 'assets', 'logos', 'muddy-paws-primary.svg'), '<svg xmlns="http://www.w3.org/2000/svg" id="scratch" viewBox="0 0 300 100"><rect width="300" height="100" fill="#1F6F4A"/></svg>');
    const r = await cli(['book']);
    assert.equal(r.logosEmbedded, 1);
    const html = await readFile(path.join(dir, 'brand', 'brand-book.html'), 'utf8');
    assert.ok((html.match(/id="scratch"/g) ?? []).length >= 20);
    await rm(path.join(dir, 'assets'), { recursive: true, force: true });
    await cli(['book']);
    assert.match(await readFile(path.join(dir, 'brand', 'brand-book.html'), 'utf8'), /\[Not recorded yet: the logo artwork/);
  });

  test('a proof artboard and a mockup each get a page, a mockup\'s photograph reaches the render, and a tall artboard is rendered at its full height', gate, async () => {
    const canvas = path.join(dir, 'brand', 'canvas');
    await mkdir(canvas, { recursive: true });
    // A solid red "photograph", referenced by a relative path the way `mockup build` writes it.
    const red = encodePng({ width: 40, height: 40, channels: 3, data: Buffer.from(Array.from({ length: 40 * 40 }, () => [220, 30, 30]).flat()) });
    await writeFile(path.join(canvas, 'photo.png'), red);
    await writeFile(path.join(canvas, 'MockupVan.dc.html'), artboard({
      name: 'MockupVan', fonts: null, systemNote: 'generated from the resolved system',
      body: '<div style="position:relative;width:600px;height:400px"><img src="photo.png" alt="" style="position:absolute;inset:0;width:100%;height:100%"></div>',
    }));
    await writeFile(path.join(canvas, 'Poster.dc.html'), artboard({
      name: 'Poster', fonts: null, systemNote: 'authored',
      body: '<div style="background:#1F6F4A;width:600px;height:400px"></div>',
    }));
    // R2-N-08: 1400px of content declared as a 600x400 frame.
    await writeFile(path.join(canvas, 'Tall.dc.html'), artboard({
      name: 'Tall', fonts: null, systemNote: 'authored',
      body: '<div style="background:#E8F7EE;width:600px;height:1400px"></div>',
    }));
    await writeFile(path.join(canvas, 'canvas.json'), JSON.stringify({ artboards: [{ file: 'MockupVan.dc.html', x: 0, y: 0, w: 600, h: 400 }, { file: 'Poster.dc.html', x: 700, y: 0, w: 600, h: 400 }, { file: 'Tall.dc.html', x: 1400, y: 0, w: 600, h: 400 }] }));
    const r = await cli(['book']);
    assert.equal(r.pages, FIXTURE_PAGES + 3, 'one page per artboard, after the applications page');
    const html = await readFile(path.join(dir, 'brand', 'brand-book.html'), 'utf8');
    assert.match(html, /alt="Mockup: Van"/);
    assert.match(html, /alt="Artboard: Poster"/);
    assert.match(html, /3 drawn: MockupVan\.dc\.html, Poster\.dc\.html, Tall\.dc\.html/);
    const data = /<img src="data:image\/png;base64,([^"]+)" alt="Mockup: Van"/.exec(html)[1];
    const png = decodePng(Buffer.from(data, 'base64'));
    let reds = 0;
    for (let i = 0; i < png.width * png.height; i++) {
      const o = i * png.channels;
      if (png.data[o] > 180 && png.data[o + 1] < 80 && png.data[o + 2] < 80) reds++;
    }
    assert.ok(reds > png.width * png.height * 0.5, `the photograph should fill the mockup render, got ${reds} red pixels of ${png.width * png.height}`);
    const tall = decodePng(Buffer.from(/<img src="data:image\/png;base64,([^"]+)" alt="Artboard: Tall"/.exec(html)[1], 'base64'));
    assert.equal(tall.width, 600);
    assert.ok(tall.height >= 1400, `the tall artboard is rendered at its scroll height, got ${tall.height}`);
    assert.match(html, /Tall\.dc\.html \/ 600x400, rendered at its full height of 1400px/);
    const poster = decodePng(Buffer.from(/<img src="data:image\/png;base64,([^"]+)" alt="Artboard: Poster"/.exec(html)[1], 'base64'));
    assert.equal(poster.height, 400, 'an artboard that fits its frame is rendered at the frame');
    await rm(canvas, { recursive: true, force: true });
  });

  test('the HTML deck never scrolls sideways: scrollWidth <= innerWidth at phone and desktop widths', gate, async () => {
    const html = await readFile(path.join(dir, 'brand', 'brand-book.html'), 'utf8');
    const probe = html.replace('</body>', '<script>window.addEventListener("load",function(){document.fonts.ready.then(function(){var d=document.documentElement;d.setAttribute("data-probe",d.scrollWidth+"/"+window.innerWidth+"/"+document.querySelector(".slide").getBoundingClientRect().width);});});</script></body>');
    const probePath = path.join(dir, 'probe.html');
    await writeFile(probePath, probe);
    // Headless Chrome will not open a window narrower than 500px, so 500 stands
    // in for a phone here; the scale is a function of innerWidth either way.
    for (const width of [500, 1440]) {
      const { stdout } = await runChrome(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', '--virtual-time-budget=3000', `--window-size=${width},900`, '--dump-dom', pathToFileURL(probePath).href]);
      const m = /data-probe="(\d+)\/(\d+)\/([\d.]+)"/.exec(stdout);
      assert.ok(m, `no probe result at ${width}`);
      const [, scrollWidth, innerWidth, slide] = m;
      assert.ok(Number(scrollWidth) <= Number(innerWidth), `scrollWidth ${scrollWidth} > innerWidth ${innerWidth} at ${width}`);
      assert.ok(Number(slide) <= Number(innerWidth), 'the page fits inside the viewport');
    }
  });
});

/**
 * Measurements taken in headless Chrome on the rendered deck: where the last
 * piece of content on each page ends, whether the corner mark touches
 * anything, where the contents columns start, and how wide the drawn
 * co-branding gap is. Rects are expressed in page pixels (divided by the
 * fit scale) so the numbers mean the same thing at any window size.
 */
const MEASURE = `
(function () {
  var s = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--s')) || 1;
  function visible(el) { var cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return false; var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
  function isContent(el, boxH) {
    if (el.closest('.footer') || el.closest('.corner-mark')) return false;
    var tag = el.tagName.toLowerCase();
    if (tag === 'img' || tag === 'svg') return true;
    if (el.closest('svg')) return false;
    for (var i = 0; i < el.childNodes.length; i++) { var n = el.childNodes[i]; if (n.nodeType === 3 && n.textContent.trim()) return true; }
    var cs = getComputedStyle(el);
    var painted = cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent';
    var bordered = parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderBottomWidth) > 0;
    return (painted || bordered) && el.getBoundingClientRect().height / s < boxH * 0.6;
  }
  var out = { s: s, pages: [] };
  document.querySelectorAll('.page').forEach(function (p) {
    var box = p.querySelector('.canvas') || p;
    var b = box.getBoundingClientRect();
    var boxH = b.height / s;
    var last = 0;
    box.querySelectorAll('*').forEach(function (el) { if (!visible(el) || !isContent(el, boxH)) return; var r = el.getBoundingClientRect(); var bottom = (r.bottom - b.top) / s; if (bottom > last) last = bottom; });
    var overlaps = [];
    var mark = p.querySelector('.corner-mark');
    if (mark) {
      var m = mark.getBoundingClientRect();
      p.querySelectorAll('*').forEach(function (el) { if (!visible(el) || el.closest('.corner-mark') || el.closest('.footer') || el.closest('.rail') || el === p) return; if (!isContent(el, boxH)) return; var r = el.getBoundingClientRect(); if (r.left < m.right && r.right > m.left && r.top < m.bottom && r.bottom > m.top) overlaps.push(el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.split(' ')[0] : '')); });
    }
    out.pages.push({ id: p.id, divider: p.classList.contains('divider'), boxHeight: boxH, lastContentBottom: last, overlaps: overlaps.slice(0, 4) });
  });
  var toc = document.querySelector('.toc');
  if (toc) {
    var pb = toc.closest('.page').getBoundingClientRect();
    out.toc = Array.prototype.map.call(toc.querySelectorAll('.toc-chapter'), function (c) {
      var links = Array.prototype.slice.call(c.querySelectorAll('a'));
      return { id: c.getAttribute('data-chapter'), lefts: links.map(function (a) { return Math.round((a.getBoundingClientRect().left - pb.left) / s); }), top: (links[0].getBoundingClientRect().top - pb.top) / s, bottom: (links[links.length - 1].getBoundingClientRect().bottom - pb.top) / s };
    });
    out.tocPageHeight = pb.height / s;
  }
  function edges(sel, side) { return Array.prototype.map.call(document.querySelectorAll(sel), function (e) { return Math.round(e.getBoundingClientRect()[side] / s); }); }
  var firstTile = function (v) { var t = document.querySelector('#photography .photo-tile[data-verdict="' + v + '"]'); return t ? Math.round(t.getBoundingClientRect().top / s) : null; };
  out.align = {
    pillars: edges('#pillars h2', 'top'),
    keyMessaging: edges('#key-messaging h2', 'top'),
    palette: edges('#primary-palette h2', 'top'),
    photography: [firstTile('yes'), firstTile('no')],
    ladder: edges('#minimum-size .ladder > *', 'bottom'),
  };
  var gap = document.querySelector('.cobranding-gap');
  if (gap) out.gap = { recorded: Number(gap.getAttribute('data-gap')), width: gap.getBoundingClientRect().width / s };
  // Every image that reaches the accessibility tree, and whether it has a name.
  // An <svg> inside a [role=img] wrapper is not its own image: the wrapper is.
  out.images = { total: 0, unnamed: [] };
  Array.prototype.forEach.call(document.querySelectorAll('img, svg, [role="img"]'), function (el) {
    if (el.parentElement && el.parentElement.closest('[role="img"]')) return;
    if (el.closest('[aria-hidden="true"]') || el.getAttribute('role') === 'presentation' || el.getAttribute('role') === 'none') return;
    out.images.total += 1;
    var label = el.getAttribute('aria-label');
    var alt = el.getAttribute('alt');
    var title = el.querySelector(':scope > title');
    if ((label && label.trim()) || (alt && alt.trim()) || (title && title.textContent.trim())) return;
    out.images.unnamed.push(((el.closest('.page') || {}).id || '?') + ' ' + el.tagName.toLowerCase());
  });
  document.documentElement.setAttribute('data-measure', JSON.stringify(out));
})();
`;

describe('the composition of every page, measured in a browser', () => {
  const chrome = findChrome();
  const gate = { skip: chrome ? false : 'no headless browser on this machine' };
  let dir;
  let measured;
  before(async () => {
    if (!chrome) return;
    dir = await mkdtemp(path.join(tmpdir(), 'brandi-measure-'));
    // The with-logo deck, so the corner mark exists to be measured against.
    const withLogo = renderBrandDeck({ brand, system, assets: SCRATCH_ASSETS });
    // A heavier brand than the fixture: the framework and photography pages
    // set their type large for the fixture and must step down, not clip.
    const heavy = clone(brand);
    const long = 'Warm water in every bay, a dryer that actually dries, and somebody on the floor who will show you how it works.';
    heavy.strategy.messaging.pillars = Array.from({ length: 4 }, (_, i) => ({ claim: `Pillar number ${i + 1} with a longer claim`, why: long, proof: Array.from({ length: 5 }, () => 'Quiet dryers rated for nervous dogs, every bay') }));
    heavy.strategy.personality.attributes = ['Practical', 'Warm', 'Unhurried', 'Straight', 'Local'].map((name) => ({ name, notThis: 'clinical', meaning: long }));
    heavy.voice.keyMessages = Array.from({ length: 6 }, () => ({ message: long }));
    heavy.strategy.differentiators = Array.from({ length: 6 }, () => ({ claim: long }));
    heavy.identity.imagery.dos = Array.from({ length: 6 }, () => long);
    heavy.identity.imagery.donts = Array.from({ length: 6 }, () => long);
    // Round 4 added two blocks that grow with the brand file: the hard-things
    // cards under the tone situations, and the brand's own anti-patterns in
    // place of the nine house rules. Both are measured here or nowhere.
    heavy.voice.vocabulary.hardThings = Array.from({ length: 4 }, (_, i) => ({ situation: `A situation that takes a whole line to describe, number ${i + 1}`, say: long }));
    // Round 5: `voice.mechanics` is an open object and every recorded rule now
    // reaches a page. Twenty long ones is what makes the writing page run on
    // and the contents step its type down, and both have to hold.
    heavy.voice.mechanics = Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`ruleNumber${i}Here`, `${long} Rule ${i + 1}.`]));
    heavy.governance.antiPatterns = Array.from({ length: 9 }, (_, i) => `${i + 1}. ${long}`);
    await writeFile(path.join(dir, 'heavy.html'), renderBrandDeck({ brand: heavy, system: buildSystem(systemInputFromBrand(heavy)) }).html);
    // Three approved colourways, so the Colourways page has real rows to
    // measure. The mark is two inks so the colourway has two regions to map.
    const coloured = clone(brand);
    const CW_INK = '#1F6F4A';
    const CW_ASSETS = {
      ...SCRATCH_ASSETS,
      'assets/logos/muddy-paws-primary.svg': { kind: 'svg', markup: `<svg xmlns="http://www.w3.org/2000/svg" id="the-mark" viewBox="0 0 300 100"><rect width="220" height="100" fill="${CW_INK}"/><circle cx="260" cy="50" r="38" fill="#C9A227"/></svg>` },
    };
    coloured.identity.logo.colourways = ['brand.solid', 'accent1.solid', 'neutral.ink'].map((role, i) => ({
      id: `cw-${i + 1}`, name: `Treatment ${i + 1}`, idea: 'dealt from the palette', basis: 'dealt',
      ground: ['neutral.paper', 'neutral.ink', 'brand.solid'][i], approvedBy: 'Jake',
      regions: [{ region: 'region-1', ink: CW_INK, role }, { region: 'region-2', ink: '#C9A227', role: 'neutral.ink' }],
    }));
    await writeFile(path.join(dir, 'colour.html'), renderBrandDeck({ brand: coloured, system, assets: CW_ASSETS }).html);
    // The Colourways page with three treatments: the column heads are printed
    // once, and every small render sits on a ground the size of the mark.
    const COLOUR = `function colour(d){var p=d.querySelector('#colourways');if(!p)return null;var heads=Array.prototype.map.call(p.querySelectorAll('.label'),function(e){return e.textContent.trim();});var tiles=Array.prototype.map.call(p.querySelectorAll('.size-tile'),function(t){var g=t.firstElementChild;var m=t.querySelector('.mark');return {px:Number(t.getAttribute('data-px')),ground:g.getBoundingClientRect().height,mark:m.getBoundingClientRect().height};});var grounds=Array.prototype.map.call(p.querySelectorAll('[data-ground-cell]'),function(e){return e.getBoundingClientRect().height;});return {heads:heads,tiles:tiles,grounds:grounds};}`;
    // Text that reaches the footer band or the right edge of its page.
    const OVERFLOW = `function overflow(d){var out=[];d.querySelectorAll('.page').forEach(function(p){var pb=p.getBoundingClientRect();p.querySelectorAll('*').forEach(function(el){if(el.closest('.footer')||el.closest('.corner-mark'))return;if(!Array.prototype.some.call(el.childNodes,function(n){return n.nodeType===3&&n.textContent.trim();}))return;var r=el.getBoundingClientRect();if(r.bottom>pb.top+${PAGE_H}-90||r.right>pb.left+${PAGE_W}+1)out.push(p.id+': '+el.textContent.trim().slice(0,40));});});return out;}`;
    const script = `<iframe id="heavy-deck" src="heavy.html" style="width:2000px;height:1200px;border:0" title="heavy"></iframe><iframe id="colour-deck" src="colour.html" style="width:2000px;height:1200px;border:0" title="colour"></iframe><script>${OVERFLOW}${COLOUR}window.addEventListener("load",function(){var h=document.getElementById("heavy-deck").contentDocument;var c=document.getElementById("colour-deck").contentDocument;Promise.all([document.fonts.ready,h.fonts.ready,c.fonts.ready]).then(function(){${MEASURE}var m=JSON.parse(document.documentElement.getAttribute("data-measure"));m.heavyOverflow=overflow(h);m.colour=colour(c);document.documentElement.setAttribute("data-measure",JSON.stringify(m));});});</script>`;
    const probePath = path.join(dir, 'measure.html');
    await writeFile(probePath, withLogo.html.replace('</body>', `${script}</body>`));
    // A 2000px window keeps the fit scale at 1, so rects are page pixels.
    const { stdout } = await runChrome(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', '--allow-file-access-from-files', '--virtual-time-budget=4000', '--window-size=2000,1200', '--dump-dom', pathToFileURL(probePath).href], { timeout: 120000 });
    const m = /data-measure="([^"]+)"/.exec(stdout);
    assert.ok(m, 'the measurement probe ran');
    measured = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
  });
  after(async () => { if (dir) await rm(dir, { recursive: true, force: true }); });

  test('R2-N-02: no content page leaves more than 25 percent of its canvas empty below its last piece of content', gate, () => {
    const content = measured.pages.filter((p) => !p.divider && !['cover', 'intro', 'contents', 'closing'].includes(p.id));
    assert.ok(content.length >= 40);
    const dead = content.map((p) => ({ id: p.id, empty: (p.boxHeight - p.lastContentBottom) / p.boxHeight })).filter((p) => p.empty > 0.25);
    assert.deepEqual(dead, [], `pages with a dead lower half: ${dead.map((p) => `${p.id} ${(p.empty * 100).toFixed(0)}%`).join(', ')}`);
    // And the measurement is real: a page cannot have content below its box.
    for (const p of content) assert.ok(p.lastContentBottom > 0 && p.lastContentBottom <= p.boxHeight + 1, `${p.id} measured ${p.lastContentBottom} of ${p.boxHeight}`);
  });

  test('R2-N-04: the corner mark touches nothing on any page', gate, () => {
    const hits = measured.pages.filter((p) => p.overlaps.length);
    assert.deepEqual(hits, [], `corner mark overlaps: ${hits.map((p) => `${p.id}: ${p.overlaps.join(', ')}`).join('; ')}`);
    // The tight pages of round 2 are among those measured with a mark present.
    for (const id of ['misuse', 'pairings', 'type-examples', 'icons', 'anti-patterns']) assert.ok(measured.pages.some((p) => p.id === id), id);
  });

  test('R2-N-13: the contents columns share a top line and no chapter breaks across a column', gate, () => {
    assert.equal(measured.toc.length, 8);
    for (const ch of measured.toc) assert.equal(new Set(ch.lefts).size, 1, `${ch.id} sits in one column`);
    const columns = [...new Set(measured.toc.map((ch) => ch.lefts[0]))].sort((a, b) => a - b);
    assert.equal(columns.length, 3, 'three columns');
    const tops = columns.map((left) => Math.min(...measured.toc.filter((ch) => ch.lefts[0] === left).map((ch) => ch.top)));
    assert.ok(Math.max(...tops) - Math.min(...tops) <= 2, `column tops ${tops.join(', ')}`);
    for (const ch of measured.toc) assert.ok(ch.bottom < measured.tocPageHeight - 60, `${ch.id} stays above the footer`);
  });

  test('columns that sit side by side start on one line: pillars, key messages, palette names, photography tiles, and the size ladder on one baseline', gate, () => {
    for (const [name, values] of Object.entries(measured.align)) {
      assert.ok(values.length >= 2 && values.every((v) => v != null), `${name} measured: ${values}`);
      assert.ok(Math.max(...values) - Math.min(...values) <= 2, `${name} is not aligned: ${values.join(', ')}`);
    }
    assert.equal(measured.align.ladder.length, 5, 'four ladder steps and the absolute minimum');
  });

  test('R2-N-12: the drawn co-branding gap is as wide as the value it records', gate, () => {
    assert.ok(measured.gap, 'the gap element rendered');
    assert.ok(Math.abs(measured.gap.width - measured.gap.recorded) < 1, `${measured.gap.width} vs ${measured.gap.recorded}`);
  });

  test('R5-03: every image that reaches the accessibility tree has a name', gate, () => {
    assert.ok(measured.images.total >= 30, `only ${measured.images.total} images measured`);
    assert.deepEqual(measured.images.unnamed, [], `images with no accessible name: ${measured.images.unnamed.join(', ')}`);
  });

  test('R5-04: the colour stage prints its column heads once and draws each small render on a ground the size of the mark', gate, () => {
    const c = measured.colour;
    assert.ok(c, 'the colourways page was measured');
    // Three treatments, so the heads are printed above the rows, once each.
    for (const head of ['On its ground', 'Greyscale']) {
      assert.equal(c.heads.filter((h) => h === head).length, 1, `"${head}" is printed ${c.heads.filter((h) => h === head).length} times`);
    }
    // Every small render at its real size, on a tile that is the mark plus its
    // air rather than a panel the height of the proofs beside it.
    assert.ok(c.tiles.length >= 3, `${c.tiles.length} size tiles`);
    for (const t of c.tiles) {
      assert.ok(Math.abs(t.mark - t.px) <= 1, `a ${t.px}px render drew at ${t.mark}px`);
      assert.ok(t.ground <= t.px + 26, `a ${t.px}px render sits in a ${t.ground}px box`);
    }
    // And the proof grounds are pinned to their marks, not stretched to the row.
    assert.ok(c.grounds.length >= 6, `${c.grounds.length} proof grounds`);
    assert.ok(Math.max(...c.grounds) <= 260, `a proof ground is ${Math.max(...c.grounds)}px tall`);
  });

  test('a heavier brand than the fixture still fits: no text runs under the footer or off the page', gate, () => {
    // Measured in the same browser run as the fixture deck, from an iframe,
    // so the check costs no extra Chrome process under load.
    assert.ok(Array.isArray(measured.heavyOverflow), 'the heavy deck was measured');
    assert.deepEqual(measured.heavyOverflow, []);
  });

  test('R2-N-10: at 390px the two-panel pages reflow with readable type and no sideways scroll', gate, async () => {
    // Headless Chrome will not open a 390px window, so the deck is loaded in
    // a 390px iframe, which is a real 390px viewport as far as CSS is concerned.
    const deckPath = path.join(dir, 'phone-deck.html');
    await writeFile(deckPath, deck.html);
    const wrapper = `<!doctype html><html><body style="margin:0"><iframe id="f" src="phone-deck.html" style="width:390px;height:800px;border:0"></iframe><script>
      document.getElementById('f').addEventListener('load', function () { setTimeout(function () {
        var w = document.getElementById('f').contentWindow; var d = w.document;
        var rail = d.querySelector('#purpose .rail p'); var canvasText = d.querySelector('#purpose .canvas p');
        var two = d.querySelector('#purpose .two'); var railBox = d.querySelector('#purpose .rail').getBoundingClientRect(); var canvasBox = d.querySelector('#purpose .canvas').getBoundingClientRect();
        document.documentElement.setAttribute('data-phone', JSON.stringify({ innerWidth: w.innerWidth, scrollWidth: d.documentElement.scrollWidth, railPx: parseFloat(w.getComputedStyle(rail).fontSize), canvasPx: parseFloat(w.getComputedStyle(canvasText).fontSize), h1Px: parseFloat(w.getComputedStyle(d.querySelector('#purpose h1')).fontSize), stacked: railBox.bottom <= canvasBox.top + 1, pageWidth: d.querySelector('#purpose').getBoundingClientRect().width, transform: w.getComputedStyle(d.querySelector('#purpose')).transform, pairing: (function () { var t = d.querySelector('table.pairing'); var c = d.querySelector('td[data-pair]'); return { tableW: t.getBoundingClientRect().width, cellW: c.getBoundingClientRect().width, glyphW: c.querySelector('svg.glyph').getBoundingClientRect().width, say: c.querySelector('.sr-only').textContent, sayVisible: c.querySelector('.sr-only').getBoundingClientRect().width }; })() }));
      }, 300); });
    </script></body></html>`;
    const wrapperPath = path.join(dir, 'phone.html');
    await writeFile(wrapperPath, wrapper);
    const { stdout } = await runChrome(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', '--allow-file-access-from-files', '--virtual-time-budget=5000', '--window-size=800,900', '--dump-dom', pathToFileURL(wrapperPath).href], { timeout: 120000 });
    const m = /data-phone="([^"]+)"/.exec(stdout);
    assert.ok(m, 'the phone probe ran');
    const r = JSON.parse(m[1].replace(/&quot;/g, '"'));
    assert.equal(r.innerWidth, 390);
    assert.ok(r.scrollWidth <= r.innerWidth, `scrollWidth ${r.scrollWidth} > ${r.innerWidth}`);
    assert.ok(r.railPx >= 14, `rail text ${r.railPx}px`);
    assert.ok(r.canvasPx >= 14, `canvas text ${r.canvasPx}px`);
    assert.ok(r.h1Px >= 24 && r.h1Px <= 40, `h1 ${r.h1Px}px`);
    assert.ok(r.stacked, 'the rail sits above the canvas');
    assert.ok(r.pageWidth <= 390 && r.pageWidth > 300, `page width ${r.pageWidth}`);
    assert.equal(r.transform, 'none', 'no thumbnail scaling on a phone');
    // R3-N-04 on a phone: nine columns still fit, the drawn verdicts shrink
    // with their cells instead of spilling across them, and the word is in the
    // document without being on the screen.
    assert.ok(r.pairing.tableW <= r.innerWidth, `pairing table ${r.pairing.tableW}px`);
    assert.ok(r.pairing.glyphW <= r.pairing.cellW, `glyph ${r.pairing.glyphW}px in a ${r.pairing.cellW}px cell`);
    assert.ok(['passes', 'fails'].includes(r.pairing.say), `the cell says "${r.pairing.say}"`);
    assert.ok(r.pairing.sayVisible <= 1, 'the word is clipped out of sight, not laid out');
  });
});

describe('R3-N-03: the voice chapter says only what the brand file says', () => {
  test('the tone statement is the recorded one, and a bracketed placeholder when there is none', () => {
    const tone = pageOf(deck.html, 'tone');
    assert.ok(tone.includes(brand.voice.statement), 'the recorded statement');
    // The trait names joined into a sentence is what it used to print instead.
    const names = brand.voice.attributes.map((a) => a.name);
    const synthesised = `${names.slice(0, -1).join(', ')} and ${names.at(-1)}.`;
    assert.equal(tone.includes(synthesised), false, `it manufactured "${synthesised}"`);

    const silent = clone(brand);
    delete silent.voice.statement;
    const page = pageOf(renderBrandDeck({ brand: silent, system }).html, 'tone');
    assert.match(page, new RegExp(`\\[${PLACEHOLDER}: a one-line tone statement \\(voice\\.statement\\)\\]`));
    assert.equal(page.includes(synthesised), false);
  });

  test('an example line appears under a trait only when that trait records it', () => {
    const tone = pageOf(deck.html, 'tone');
    for (const a of brand.voice.attributes) {
      for (const line of a.examples) assert.ok(tone.includes(line), `"${line}" under ${a.name}`);
    }
    // Nothing from the general examples or the hard-things list is dealt out
    // to a trait: those belong to their own pages.
    for (const e of brand.voice.examples) assert.equal(tone.includes(e.good), false, `"${e.good}" is not a trait's example`);
    for (const h of brand.voice.vocabulary.hardThings) assert.equal(tone.includes(h.say), false, `"${h.say}" is not a trait's example`);

    // And a trait with no examples recorded gets no italic line at all.
    const bare = clone(brand);
    bare.voice.attributes = bare.voice.attributes.map(({ examples, ...rest }) => rest);
    const page = pageOf(renderBrandDeck({ brand: bare, system }).html, 'tone');
    assert.equal(/class="voice-example"/.test(page), false);
    assert.equal((page.match(/class="voice-trait"/g) ?? []).length, brand.voice.attributes.length);
  });

  test('the hard-things lines are on the situations page, with their own situations', () => {
    const situations = pageOf(deck.html, 'tone-situations');
    assert.match(situations, /How we say hard things/);
    for (const h of brand.voice.vocabulary.hardThings) {
      assert.ok(situations.includes(h.situation), `situation "${h.situation}"`);
      assert.ok(situations.includes(h.say), `line for "${h.situation}"`);
    }
    const none = clone(brand);
    delete none.voice.vocabulary.hardThings;
    assert.equal(/How we say hard things/.test(pageOf(renderBrandDeck({ brand: none, system }).html, 'tone-situations')), false);
  });
});

describe('R3-N-04: the pairing matrix reaches a screen reader', () => {
  test('it is a real table, every cell carries the verdict in words, and the glyphs stay drawn', () => {
    const m = pairingMatrix(system);
    const page = pageOf(deck.html, 'pairings');
    assert.match(page, /<table class="pairing pairing-matrix"/);
    assert.match(page, /<caption class="sr-only">/);
    // One column header per colour plus the corner, one row header per colour.
    assert.equal((page.match(/<th scope="col"/g) ?? []).length, m.colours.length + 1);
    assert.equal((page.match(/<th scope="row"/g) ?? []).length, m.colours.length);
    const cells = [...page.matchAll(/<td data-pair="(pass|fail)"[^>]*>([\s\S]*?)<\/td>/g)];
    assert.equal(cells.length, m.colours.length ** 2);
    for (const [i, [, verdict, inner]] of cells.entries()) {
      const want = verdict === 'pass' ? 'passes' : 'fails';
      assert.match(inner, new RegExp(`<span class="sr-only">${want}</span>`), `cell ${i} says ${want}`);
      assert.match(inner, /<svg class="glyph"/, `cell ${i} still draws its glyph`);
    }
    // The verdicts in words agree with the measured matrix, row by row.
    const said = cells.map(([, v]) => v === 'pass');
    assert.deepEqual(said, m.cells.flat());
    // The visually hidden class is defined, or none of this reaches anybody.
    assert.match(deck.html, /\.sr-only \{[^}]*clip-path: inset\(50%\)/);
    // And "Text on" stays decoration: the real column header is the word.
    assert.match(page, /<span class="sr-only">Text colour<\/span>/);
  });
});

describe('R3-N-06: "What not to do" is this brand\'s list, and never contradicts its own type page', () => {
  test('a brand that keeps a refused face under the waiver is not told that face is banned', () => {
    const waived = clone(brand);
    waived.identity.type.display = 'Montserrat';
    // The house list is what carries the font sentence, so the waiver case has
    // to be a brand that has not recorded its own rules.
    delete waived.governance.antiPatterns;
    const html = renderBrandDeck({ brand: waived, system: buildSystem(systemInputFromBrand(waived)) }).html;
    const page = pageOf(html, 'anti-patterns');
    assert.match(page, /No default typefaces\./);
    assert.equal(/Montserrat/.test(page), false, 'it banned the face the type page sets');
    assert.match(page, /Inter, Roboto, Arial, Poppins are banned outright/);
    // The type page still says the brand uses it, so the two pages agree.
    assert.ok(pageOf(html, 'primary-typeface').includes('Montserrat'));
  });

  test('recorded anti-patterns replace the house list entirely', () => {
    // The fixture records its own, so the worked example shows this brand's
    // habits rather than nine sentences every brand's book would carry.
    const own = brand.governance.antiPatterns;
    assert.ok(own.length >= 6, 'the fixture records its own anti-patterns');
    const page = pageOf(deck.html, 'anti-patterns');
    assert.equal((page.match(/data-rule-source="brand"/g) ?? []).length, own.length);
    assert.equal(/data-rule-source="house"/.test(page), false);
    for (const r of own) assert.ok(page.includes(r.replace(/"/g, '&quot;')), r);
    assert.equal(/gradient orbs/.test(page), false, 'the house list is gone');
    assert.equal(/governance\.antiPatterns/.test(page), false, 'and it does not ask for what it has');
  });

  test('without them the house list stands, says so, and is still nine rules', () => {
    const none = clone(brand);
    delete none.governance.antiPatterns;
    const house = pageOf(renderBrandDeck({ brand: none, system }).html, 'anti-patterns');
    assert.equal((house.match(/data-rule-source="house"/g) ?? []).length, 9);
    assert.match(house, /governance\.antiPatterns/);
    assert.match(house, /gradient orbs/);
    // An empty list is not a recorded list.
    none.governance.antiPatterns = ['', null];
    const still = pageOf(renderBrandDeck({ brand: none, system }).html, 'anti-patterns');
    assert.equal((still.match(/data-rule-source="house"/g) ?? []).length, 9);
  });
});

describe('R3-N-07: the type-scale sample column says what it actually does', () => {
  test('a step drawn smaller than its desktop size is declared, and the cap is named', () => {
    const page = pageOf(deck.html, 'type-scale');
    const drawn = new Map([...page.matchAll(/data-sample="([\w]+)" data-drawn="([\d.]+)"/g)].map((m) => [m[1], Number(m[2])]));
    assert.ok(drawn.size >= 8);
    for (const s of system.type.scale.steps) {
      assert.equal(drawn.get(s.name), Math.min(s.maxPx, 64), `${s.name} drawn size`);
    }
    const capped = system.type.scale.steps.filter((s) => s.maxPx > 64).map((s) => s.name);
    assert.deepEqual(capped, ['3xl', '4xl'], 'the fixture has two steps above the cap');
    assert.match(page, /Set in its own face, up to 64px/);
    assert.equal(/Set at its desktop size/.test(page), false);
    for (const name of capped) assert.ok(page.includes(name));
    assert.match(page, /drawn at 64px to fit the row\. The real size is in the Desktop column/);
    assert.equal(/set in its own face at its desktop size/.test(page), false);
  });

  test('a scale with nothing above the cap keeps the plain header and makes no excuse', () => {
    const input = systemInputFromBrand(brand);
    const small = buildSystem({ ...input, type: { ...input.type, ratio: 'minor-second', ratioMax: 'minor-second' } });
    const page = pageOf(renderBrandDeck({ brand, system: small }).html, 'type-scale');
    assert.ok(small.type.scale.steps.every((s) => s.maxPx <= 64), 'no step above the cap');
    assert.match(page, /Set at its desktop size/);
    assert.equal(/to fit the row/.test(page), false);
  });
});

describe('R3-N-10 and R3-N-11: the decision log and the misuse tiles', () => {
  test('a decision date never wraps', () => {
    const page = pageOf(deck.html, 'decisions');
    for (const d of brand.governance.decisions.slice(0, 6)) {
      assert.ok(page.includes(`<td class="mono" style="white-space:nowrap">${d.date}</td>`), `${d.date} on one line`);
    }
  });

  test('every misuse tile either draws the fault or says it cannot be drawn here', () => {
    const page = pageOf(renderBrandDeck({ brand, system, assets: SCRATCH_ASSETS }).html, 'misuse');
    const tiles = [...page.matchAll(/<div class="card" data-misuse-drawn="(yes|no)"[\s\S]*?<p style="font-size:15px[^>]*>Never ([^.<]+)/g)];
    assert.equal(tiles.length, brand.identity.logo.misuse.length);
    for (const [whole, drawn, rule] of tiles) {
      if (drawn === 'no') {
        assert.match(whole, /This one cannot be drawn/, `"${rule}" admits it`);
        assert.equal(whole.includes('id="the-mark"'), false, `"${rule}" must not show a correct lockup`);
      } else {
        // A drawn fault is never the mark as it should appear: something in the
        // picture is transformed, filtered, retyped or crowded.
        const picture = /padding:8px 0">([\s\S]*?)<\/div>\s*<div style="display:flex;gap:10px/.exec(whole)[1];
        assert.ok(/transform:|filter:|repeating-linear-gradient|border:3px|border-top:2px|class="wordmark"/.test(picture),
          `"${rule}" draws a plain correct lockup`);
      }
    }
    // The three the round 3 critic found showing a correct lockup.
    const byRule = new Map(tiles.map(([whole, drawn, rule]) => [rule.trim(), { whole, drawn }]));
    const crowd = [...byRule].find(([r]) => /crowd/.test(r))[1];
    assert.equal(crowd.drawn, 'yes');
    assert.match(crowd.whole, /OPEN 7 DAYS/, 'the crowding is drawn by the neighbours');
    const retype = [...byRule].find(([r]) => /reconstruct/.test(r))[1];
    assert.equal(retype.drawn, 'yes');
    assert.match(retype.whole, /class="wordmark"/, 'the retyped wordmark is typeset, not the artwork');
    assert.equal(retype.whole.includes('id="the-mark"'), false);
    const markOnly = [...byRule].find(([r]) => /mark-only/.test(r))[1];
    assert.equal(markOnly.drawn, 'no', 'which file is used cannot be drawn from one lockup');
  });

  test('a brand whose mark IS its typeset name does not get a "retyped" tile that shows the real thing', () => {
    // With no artwork the lockup is the name in the display face, so a tile
    // typesetting the name would be the correct mark under the word Never.
    const page = pageOf(deck.html, 'misuse');
    const retype = /data-misuse-drawn="(yes|no)"(?:(?!data-misuse-drawn)[\s\S])*?Never reconstruct/.exec(page);
    assert.equal(retype[1], 'no');
  });
});

describe('R3-N-05: a brand-in-use page is the shape of the thing on it', () => {
  const frame = (html, id) => {
    const page = pageOf(html, id);
    return /<div style="([^"]*)"><img src="data:image\/png/.exec(page)?.[1] ?? null;
  };
  const png = 'data:image/png;base64,iVBORw0KGgo=';
  const board = (over) => ({ file: 'X.dc.html', stem: 'X', kind: 'proof', title: 'X', png, ...over });

  test('the box carries the artboard\'s ratio and is bounded in both directions', () => {
    // A phone. Bounding only the height left a 390-wide render letterboxed
    // sideways across a full-width box; bounding only the width did the same
    // the other way for a 1400x582 composite.
    const tall = frame(renderBrandDeck({ brand, system, artboards: [board({ w: 390, h: 844, renderedH: 924 })] }).html, 'in-use-1-x');
    assert.match(tall, /aspect-ratio:390 \/ 924/);
    assert.match(tall, new RegExp(`max-height:${PAGE_H - 240}px`));
    // The width bound is the height bound carried through the ratio.
    assert.match(tall, new RegExp(`max-width:${Math.round((PAGE_H - 240) * (390 / 924))}px`));
    assert.match(tall, /align-self:center/);
    assert.match(tall, /height:auto/);

    const wide = frame(renderBrandDeck({ brand, system, artboards: [board({ kind: 'mockup', w: 1400, h: 582, renderedH: 582 })] }).html, 'in-use-1-x');
    assert.match(wide, /aspect-ratio:1400 \/ 582/);
    assert.match(wide, new RegExp(`max-width:${Math.round((PAGE_H - 240) * (1400 / 582))}px`));
  });

  test('an artboard whose size is unknown keeps the fixed box rather than a broken ratio', () => {
    const unknown = frame(renderBrandDeck({ brand, system, artboards: [board({ w: null, h: null })] }).html, 'in-use-1-x');
    assert.equal(/aspect-ratio/.test(unknown), false);
    assert.match(unknown, new RegExp(`height:${PAGE_H - 240}px`));
  });
});

describe('R5-01: every recorded writing mechanic reaches the deck under its own key', () => {
  // `voice.mechanics` is an open object. The deck used to hardcode four keys
  // and print their values with no key at all, so the fixture's eight recorded
  // rules reached the page as four anonymous sentences and the print book,
  // which renders every key, disagreed with the deck about what was decided.
  const six = {
    sentenceLength: 'Short. Two ideas is two sentences.',
    contractions: 'Yes, always.',
    oxfordComma: 'Only where it removes an ambiguity.',
    numerals: 'Numerals from one upward in prices and times.',
    dates: '29 August, never 29th August.',
    quoteMarks: 'Curly, and single inside double.',
  };

  test('a brand with six mechanics has all six in the deck, each under its titleised key', () => {
    const b = clone(brand);
    b.voice.mechanics = six;
    const out = renderBrandDeck({ brand: b, system: buildSystem(systemInputFromBrand(b)) });
    const labels = [...out.html.matchAll(/<dt>([^<]*)<\/dt>/g)].map((m) => m[1]);
    assert.deepEqual(labels.slice().sort(), Object.keys(six).map(titleise).sort());
    for (const [k, v] of Object.entries(six)) {
      assert.ok(out.html.includes(`<dt>${titleise(k)}</dt><dd>${v}</dd>`), `${k} is missing its key or its value`);
    }
  });

  test('the deck and the print book carry the same set', () => {
    const b = clone(brand);
    b.voice.mechanics = six;
    const sys = buildSystem(systemInputFromBrand(b));
    const deckHtml = renderBrandDeck({ brand: b, system: sys }).html;
    const bookHtml = renderBrandBook({ brand: b, system: sys });
    for (const [k, v] of Object.entries(six)) {
      assert.ok(deckHtml.includes(titleise(k)), `the deck drops ${k}`);
      assert.ok(bookHtml.includes(titleise(k)), `the book drops ${k}`);
      assert.ok(deckHtml.includes(v) && bookHtml.includes(v), `${k}'s value is in one document and not the other`);
    }
    // Neither document invents a mechanic the other does not have.
    const inDeck = new Set([...deckHtml.matchAll(/<dt>([^<]*)<\/dt>/g)].map((m) => m[1]));
    for (const label of inDeck) assert.ok(bookHtml.includes(label), `the deck shows ${label} and the book does not`);
  });

  test('the fixture\'s own eight mechanics all reach a page, including the four the deck used to drop', () => {
    const recorded = Object.keys(brand.voice.mechanics);
    assert.ok(recorded.length >= 8, 'the fixture records at least eight mechanics');
    for (const k of recorded) assert.ok(deck.html.includes(`<dt>${titleise(k)}</dt>`), `${k} reaches no page`);
    // The four that used to be the whole list are still there, now with keys.
    for (const k of ['sentenceLength', 'contractions', 'headings', 'buttons']) {
      assert.ok(deck.html.includes(`<dt>${titleise(k)}</dt>`), k);
    }
  });

  test('a set too long for one page runs on to a second rather than being cut', () => {
    const b = clone(brand);
    b.voice.mechanics = Object.fromEntries(Array.from({ length: 15 }, (_, i) => [`ruleNumber${i}`, `The ${i}th rule, written down so nobody has the argument again.`]));
    const out = renderBrandDeck({ brand: b, system: buildSystem(systemInputFromBrand(b)) });
    assert.ok(out.pages.some((pg) => pg.id === 'writing-mechanics'), 'the continuation page is planned');
    const labels = [...out.html.matchAll(/<dt>([^<]*)<\/dt>/g)].map((m) => m[1]);
    assert.equal(labels.length, 15);
    assert.deepEqual(labels.slice().sort(), Object.keys(b.voice.mechanics).map(titleise).sort());
    // And the contents lists it, so nobody has to find it by accident.
    assert.match(out.html, /Writing guidance, continued/);
  });

  test('no mechanics at all is a placeholder, not an empty list', () => {
    const b = clone(brand);
    delete b.voice.mechanics;
    const out = renderBrandDeck({ brand: b, system: buildSystem(systemInputFromBrand(b)) });
    assert.equal(/<dt>/.test(out.html), false);
    assert.match(out.html, new RegExp(`${PLACEHOLDER}: voice mechanics`));
    assert.equal(out.pages.some((pg) => pg.id === 'writing-mechanics'), false);
  });
});

describe('R5-02: every table in the deck reaches a screen reader with a name', () => {
  test('the helper will not build a table without a caption', () => {
    assert.throws(() => table({ head: '<th>a</th>', body: '<tr><td>b</td></tr>' }), /caption/);
    assert.throws(() => table({ caption: '  ', head: '', body: '' }), /caption/);
    assert.match(table({ caption: 'What this is', head: '<th>a</th>', body: '<tr><td>b</td></tr>' }), /<caption class="sr-only">What this is<\/caption>/);
  });

  test('every table in the built markup opens with its caption', () => {
    const opens = deck.html.split('<table').slice(1);
    assert.ok(opens.length >= 8, `${opens.length} tables`);
    for (const frag of opens) {
      const after = frag.slice(frag.indexOf('>') + 1).trimStart();
      assert.ok(after.startsWith('<caption'), `a table opens with ${after.slice(0, 40)}`);
      const caption = /^<caption[^>]*>([\s\S]*?)<\/caption>/.exec(after);
      assert.ok(caption && caption[1].trim().length > 12, `a table's caption is ${caption ? `"${caption[1]}"` : 'missing'}`);
    }
  });
});

describe('R5-05: an application frame reads as a size in both shapes', () => {
  // The applications tile prints surface, frame and file on one line. A frame
  // written as a list reached it as "1440,1600", which is not a size anybody
  // writes, and the print book had the same fault on the same field.
  const tileOf = (frame) => {
    const b = clone(brand);
    b.applications = [{ name: 'Home page', surface: 'web', frame, file: 'Main.dc.html' }];
    const page = pageOf(renderBrandDeck({ brand: b, system }).html, 'applications');
    return /<span class="mono" style="color:var\(--muted\)">([^<]*)<\/span>/.exec(page)[1];
  };

  test('a list frame reads the same as the string a person would have typed', () => {
    assert.equal(tileOf([1440, 1600]), 'web / 1440x1600 / Main.dc.html');
    assert.equal(tileOf('1440x1600'), 'web / 1440x1600 / Main.dc.html');
  });

  test('a frame that is not a pair of sane numbers is shown as it stands, and no frame is dropped', () => {
    assert.equal(tileOf([1440]), 'web / 1440 / Main.dc.html');
    assert.equal(tileOf(undefined), 'web / Main.dc.html');
    assert.equal(tileOf([]), 'web / Main.dc.html', 'an empty list is no frame at all');
    assert.equal(frameLabel([390, 844]), '390x844');
  });
});
