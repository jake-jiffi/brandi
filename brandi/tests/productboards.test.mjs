import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import * as B from '../scripts/productboards.mjs';
import { buildProductTokens } from '../scripts/producttokens.mjs';
import { buildSystem } from '../scripts/system.mjs';
import { artboard, validateCanvas } from '../scripts/canvas.mjs';

const tokens = buildProductTokens(buildSystem({ primary: '#1F6F4A', accents: ['#D9822B'], type: { display: 'Bitter', body: 'Karla' } }), { name: 'Acme product system' });
const system = { name: 'Acme', namespace: 'acme', global: 'Acme', version: '1.0.0', lang: 'en-AU' };
const def = (name, group) => `export default { name: "${name}", group: "${group}", job: "Does a thing.", status: "proven", props: [],
  examples: [{ id: "a", title: "Default", markup: '<x-import component-from-global-scope="NS.${name}">Go</x-import>' }] }\n`;

describe('the boards a system generates for itself', () => {
  test('the colour board shows every role, its values in both themes, and aliases by name', () => {
    const b = B.colourBoard(tokens, system);
    for (const role of ['canvas', 'text-muted', 'primary', 'danger-solid', 'series-1', 'tag-grey', 'brand-hover']) assert.match(b.source, new RegExp(`background: var\\(--${role}\\)`), role);
    assert.match(b.source, /same as /, 'an alias reads as the role it follows');
    assert.equal(/\{surface\}/.test(b.source), false);
    assert.match(b.source, /Brand values/);
    assert.match(b.source, /pairs checked, 0 below their floor/);
  });

  test('type and shape boards set each style and value from the tokens', () => {
    const type = B.typeBoard(tokens, system).source;
    for (const g of tokens.type.groups) for (const s of g.styles) assert.match(type, new RegExp(`type-${s.name}<br>`), s.name);
    const shape = B.shapeBoard(tokens, system).source;
    for (const t of tokens.shadow.tokens) assert.match(shape, new RegExp(`box-shadow: var\\(--${t.name}\\)`));
  });

  test('the shape board says where each corner came from: the brand, with its source, or the kit, and how', () => {
    const measured = buildProductTokens(buildSystem({ primary: '#1F6F4A', accents: ['#D9822B'] }), { shape: { families: { card: { px: 12, source: 'the cards on p12' } }, shell: { form: 'edge', source: "the site's navigation" } } });
    const shape = B.shapeBoard(measured, system).source;
    assert.match(shape, /radius-md · 12px[\s\S]*?The brand's: the cards on p12/);
    assert.match(shape, /radius-control · \d+px[\s\S]*?The kit's: from the brand's scale, its md step \(\d+px\)/);
    assert.match(shape, /The rail meets the window edge, square\. The brand's: the site's navigation/);
    assert.match(shape, /No shape move of the brand's own is carried yet\./);
    const move = { name: 'The paper ground', source: 'p13', where: ['the sign-in hero'], file: 'textures/paper.jpg', kind: 'texture', strength: 0.3 };
    const textured = B.shapeBoard(buildProductTokens(buildSystem({ primary: '#1F6F4A' }), { shape: { moves: [move] } }), system).source;
    assert.match(textured, /<div class="brand-texture" style="[^"]*background: var\(--brand\)/, 'the texture is shown laid on the brand colour, as a screen carries it');
  });

  test('one component board per group, each built from the definitions\' own examples', () => {
    const defs = [
      { name: 'Button', group: 'Actions', job: 'The pressable action.', status: 'proven', props: [], examples: [{ id: 'a', title: 'Variants', markup: '<x-import component-from-global-scope="NS.Button">Go</x-import>', vals: { yes: true } }] },
      { name: 'Badge', group: 'Status', job: 'A status.', status: 'to build', props: [], examples: [{ id: 'a', title: 'Tones', markup: '<x-import component-from-global-scope="NS.Badge">New</x-import>' }] },
    ];
    const boards = B.componentBoards(defs, system);
    assert.deepEqual(boards.map((b) => b.name), ['ComponentsActions1440', 'ComponentsStatus1440']);
    assert.match(boards[0].source, /component-from-global-scope="Acme\.Button"/);
    assert.match(boards[1].source, /To build, not yet proven\./);
    assert.match(boards[0].source, /"c0_yes":true/);
  });

  test('each component keeps its own scope on a group board, so two keys of one name cannot collide', () => {
    const a = { name: 'Alpha', group: 'Data', job: 'A.', status: 'proven', props: [], state: { open: false }, logic: 'flip: () => self.setState({ open: !self.state.open }), open: self.state.open',
      examples: [{ id: 'a', title: 'A', markup: '<x-import component-from-global-scope="NS.Alpha" rows="{{rows}}" open="{{open}}"></x-import><sc-for list="{{rows}}" as="a">{{a.name}}</sc-for>', vals: { rows: [1, 2] } }] };
    const b = { name: 'Beta', group: 'Data', job: 'B.', status: 'proven', props: [], state: { open: true }, logic: 'open: self.state.open',
      examples: [{ id: 'b', title: 'B', markup: '<x-import component-from-global-scope="NS.Beta" rows="{{rows}}"></x-import>', vals: { rows: 'not an array' } }] };
    const [data] = B.componentBoards([a, b], { global: 'Acme', namespace: 'acme', name: 'Acme' });
    assert.match(data.source, /"c0_rows":\[1,2\]/);
    assert.match(data.source, /"c1_rows":"not an array"/);
    assert.match(data.source, /rows="\{\{c0_rows\}\}" open="\{\{c0_open\}\}"/);
    assert.match(data.source, /\{\{a\.name\}\}/, 'a loop variable is left alone');
    assert.match(data.source, /state = \{"c0":\{"open":false\},"c1":\{"open":true\}\}/, 'each slice of state is its own');
    assert.equal(B.scopeHoles('{{theme}} {{x.y}}', 'c2'), '{{theme}} {{c2_x.y}}');  });

  test('a group too tall for the canvas packs into parts in order, each under the limit, and a giant is reported', () => {
    // A Data board measured 20,251px; the canvas takes 8000. Sections are the components' measured heights.
    const sections = { Card: 3000, MetricCard: 2500, DataTable: 4200, Pagination: 900, List: 2600, ListRow: 2200, Timeline: 1800 };
    const total = 154 + Object.values(sections).reduce((n, h) => n + h + 40, 0);
    const { parts, tooTall } = B.packParts({ total, sections });
    assert.deepEqual(parts.flat(), Object.keys(sections), 'every component, once, in order');
    assert.ok(parts.length >= 3, `${parts.length} parts`);
    for (const part of parts) {
      const h = 154 + part.reduce((n, k) => n + sections[k] + 40, 0);
      assert.ok(h <= 8000 - 400, `a part of ${part.join(', ')} is ${h}px, past the limit less its margin`);
    }
    assert.deepEqual(tooTall, []);
    assert.deepEqual(B.packParts({ total: 6000, sections: { A: 3000, B: 2800 } }).parts, [['A', 'B']], 'a board that fits stays whole');
    const giant = B.packParts({ total: 154 + 9000 + 40 + 500 + 40, sections: { Huge: 9000, Small: 500 } });
    assert.deepEqual(giant.parts, [['Huge'], ['Small']], 'a component too tall alone takes a part of its own');
    assert.deepEqual(giant.tooTall.map((t) => t.name), ['Huge'], 'and is reported, not clipped quietly');
  });

  test('the parts of a split group are boards of their own: the first keeps the group\'s name, each says which of how many it is', () => {
    const mk = (name) => ({ name, group: 'Data', job: 'A thing.', status: 'proven', props: [], examples: [{ id: 'a', title: 'A', markup: `<x-import component-from-global-scope="NS.${name}"></x-import>` }] });
    const defs = ['Card', 'MetricCard', 'DataTable', 'Pagination'].map(mk);
    const parts = B.partBoards(defs, system, 'Data', [['Card', 'MetricCard'], ['DataTable'], ['Pagination']]);
    assert.deepEqual(parts.map((p) => p.name), ['ComponentsData1440', 'ComponentsDataDataTable1440', 'ComponentsDataPagination1440']);
    assert.deepEqual(parts.map((p) => p.title), ['Components: data, 1 of 3', 'Components: data, 2 of 3', 'Components: data, 3 of 3']);
    for (const p of parts) assert.match(p.name, /^[A-Z][A-Za-z0-9]*$/, 'a name the board rules take');
    assert.match(parts[1].source, /data-board-section="DataTable"/);
    assert.equal(/Acme\.Card"/.test(parts[1].source), false, 'each part holds only its own components');
    assert.equal(validateCanvas({ artboards: parts.map((p) => ({ file: p.file, source: p.source })), systems: ['acme'] }).errors.length, 0);
    const twin = B.twin(parts[1], system, 5200);
    assert.equal(twin.file, 'ComponentsDataDataTable1440Dark.dc.html', 'its dark twin splits the same way');
  });

  test("a part's heading keeps numerals out of the display face, which a brand may never set them in: the part number sits under it in the body face", () => {
    const mk = (name) => ({ name, group: 'Data', job: 'A thing.', status: 'proven', props: [], examples: [{ id: 'a', title: 'A', markup: `<x-import component-from-global-scope="NS.${name}"></x-import>` }] });
    const defs = ['Card', 'DataTable'].map(mk);
    const parts = B.partBoards(defs, system, 'Data', [['Card'], ['DataTable']]);
    for (const [i, p] of parts.entries()) {
      const h1s = p.source.match(/<h1\b[^>]*>[^<]*<\/h1>/g) ?? [];
      assert.equal(h1s.length, 1, `${p.name} keeps one h1`);
      const [, style, text] = /<h1 style="([^"]*)">([^<]*)<\/h1>/.exec(h1s[0]);
      assert.match(style, /font-family: var\(--font-display\)/, 'the heading is set in the display face');
      assert.equal(/\d/.test(text), false, `${p.name}'s heading "${text}" sets numerals in the display face`);
      const note = new RegExp(`<p style="([^"]*)">Part ${i + 1} of 2</p>`).exec(p.source);
      assert.ok(note, `${p.name} says which part it is`);
      assert.equal(/font-display/.test(note[1]), false, 'and says it in the body face');
    }
    assert.equal(parts[1].title, 'Components: data, 2 of 2', 'the canvas label still carries the part');
    assert.equal(/>Part \d/.test(B.componentBoards(defs, system)[0].source), false, 'a board that is whole carries no part number');
  });

  test('an example wider than the board is drawn down to fit, layout box and all, and says so; one that fits is left alone', () => {
    // A 1440px shell in a 1440px board padded 56px each side lost its right 56px, the page's primary with it.
    const frame = (w, h) => `<div data-shell="x" style="width: ${w}px; height: ${h}px;"><x-import component-from-global-scope="NS.AppShell"></x-import></div>`;
    const shell = { name: 'AppShell', group: 'Navigation', job: 'The frame.', status: 'proven', props: [], examples: [
      { id: 'full', title: 'At 1440', markup: frame(1440, 900), layout: 'block' },
      { id: 'tablet', title: 'At 820', markup: frame(820, 700), layout: 'block' },
      { id: 'bounds', title: 'Bounds', markup: '<div style="min-width: 1600px; max-width: 2000px;">Not a width</div>', layout: 'block' },
    ] };
    const [nav] = B.componentBoards([shell], system);
    const zooms = [...nav.source.matchAll(/zoom: ([\d.]+);/g)].map((m) => Number(m[1]));
    assert.equal(zooms.length, 1, 'only the example wider than the board is scaled');
    assert.ok(1440 * zooms[0] <= 1440 - 2 * 56, `drawn ${1440 * zooms[0]}px wide in a 1328px content box`);
    assert.ok(1440 * zooms[0] > 1320, 'and no smaller than it has to be');
    // Zoom on the example's own container: the shell inside still lays out at 1440, its full layout.
    assert.match(nav.source, /zoom: 0\.92\d*;"><div data-shell="x" style="width: 1440px/);
    assert.match(nav.source, /At 1440, drawn at 92% to fit<\/h3>/, 'its title says it is drawn smaller');
    assert.equal(/At 820, drawn/.test(nav.source), false);
    assert.equal(validateCanvas({ artboards: [{ file: nav.file, source: nav.source }], systems: ['acme'] }).errors.length, 0);
  });

  test("board prose is capped at the system's measure, never in ch, so a long description keeps to about 70 characters", () => {
    const long = { ...system, name: 'Acme' };
    const main = B.contentsBoard(long, [{ label: 'Foundations', first: 'FoundationsColour1440.dc.html', note: 'Colour, type and shape.' }]);
    const boards = [main, B.colourBoard(tokens, system), B.iconBoard(system), ...B.componentBoards([{ name: 'Button', group: 'Actions', job: 'The pressable action, with a long enough job to wrap at any width a board is drawn at.', status: 'proven', props: [], examples: [] }], system)];
    for (const b of boards) {
      assert.equal(/max-width:\s*\d+ch/.test(b.source), false, `${b.name} caps prose in ch, the width of a zero`);
      // Running prose has a cap, and the cap is the measure; a tile's caption in a narrow grid cell needs none.
      for (const p of b.source.match(/<p style="[^"]*max-width[^"]*"/g) ?? []) assert.match(p, /max-width: var\(--measure/, `${b.name}: ${p.slice(0, 80)}`);
    }
    assert.match(main.source, /max-width: var\(--measure, 30em\)/, 'the contents paragraph takes the measure');
  });

  test("the contents board lists every section the canvas has, the title notes a person wrote included, in canvas order", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-main-'));
    const starter = path.join(dir, 'starter');
    await mkdir(path.join(starter, 'system'), { recursive: true });
    await mkdir(path.join(starter, 'components', 'system'), { recursive: true });
    await mkdir(path.join(dir, 'canvas'), { recursive: true });
    await writeFile(path.join(dir, 'tokens.json'), JSON.stringify(tokens));
    await writeFile(path.join(starter, 'system', 'system.json'), JSON.stringify(system));
    await writeFile(path.join(starter, 'components', 'system', 'button.def.mjs'), def('Button', 'Actions'));
    const boards = ['ConsoleDirectionA1440', 'AppDirectionB390', 'ConsoleHome1440', 'ConsoleSettings1440', 'ConsoleHoursA1440', 'LooseIdea1440'];
    for (const name of boards) await writeFile(path.join(dir, 'canvas', `${name}.dc.html`), artboard({ name, system: 'acme', title: name, body: '<x-import component-from-global-scope="Acme.Root"><p style="margin:0">x</p></x-import>', preview: { width: 1440, height: 900 } }));
    const note = (id, y, text) => ({ id, x: 0, y, text, kind: 'title1', maxW: 3000 });
    // Written out of order, and with a note nothing sits under. LooseIdea sits above every note, so under none.
    await writeFile(path.join(dir, 'canvas', 'canvas.json'), JSON.stringify({
      artboards: [
        { file: 'LooseIdea1440.dc.html', x: 0, y: 200, w: 1440, h: 600 },
        { file: 'ConsoleHome1440.dc.html', x: 0, y: 3300, w: 1440, h: 900 },
        { file: 'ConsoleSettings1440.dc.html', x: 1560, y: 3300, w: 1440, h: 900 },
        { file: 'AppDirectionB390.dc.html', x: 1560, y: 1300, w: 390, h: 844 },
        { file: 'ConsoleDirectionA1440.dc.html', x: 0, y: 1300, w: 1440, h: 900 },
        { file: 'ConsoleHoursA1440.dc.html', x: 0, y: 6300, w: 1440, h: 900 },
      ],
      annotations: [note('screens', 3000, 'Console · the working day, light and dark'), note('directions', 1000, 'Directions · two per surface family'), note('empty', 5000, 'Parked'), note('hours', 6000, 'Trading hours')],
    }));
    await B.writeBoards({ productDir: dir, starter, measure: false });
    const links = async () => [...(await readFile(path.join(dir, 'canvas', 'Main.dc.html'), 'utf8')).matchAll(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g)].map((m) => [m[2], m[1]]);
    assert.deepEqual(await links(), [
      ['Foundations', 'FoundationsColour1440.dc.html'],
      ['Components', 'ComponentsActions1440.dc.html'],
      ['Loose', 'LooseIdea1440.dc.html'],
      ['Directions', 'ConsoleDirectionA1440.dc.html'],
      ['Console', 'ConsoleHome1440.dc.html'],
      ['Trading hours', 'ConsoleHoursA1440.dc.html'],
    ]);
    assert.match(await readFile(path.join(dir, 'canvas', 'Main.dc.html'), 'utf8'), /the working day, light and dark\. 2 boards\./, "the rest of a note's text says what the section holds");
    // A note added since is listed on the next run.
    const manifest = JSON.parse(await readFile(path.join(dir, 'canvas', 'canvas.json'), 'utf8'));
    const home = manifest.artboards.find((a) => a.file === 'ConsoleHome1440.dc.html');
    const settings = manifest.artboards.find((a) => a.file === 'ConsoleSettings1440.dc.html');
    Object.assign(settings, { x: 0, y: home.y + 1300 });
    manifest.annotations.push(note('settings', settings.y - 150, 'Settings · one page'));
    await writeFile(path.join(dir, 'canvas', 'canvas.json'), JSON.stringify(manifest));
    await B.writeBoards({ productDir: dir, starter, measure: false });
    assert.deepEqual((await links()).map(([label]) => label), ['Foundations', 'Components', 'Loose', 'Directions', 'Console', 'Settings', 'Trading hours']);
    await rm(dir, { recursive: true, force: true });
  });

  test('a dark twin imports its light board with the theme flipped', () => {
    const light = B.colourBoard(tokens, system);
    const t = B.twin(light, system, 2400);
    assert.equal(t.file, 'FoundationsColour1440Dark.dc.html');
    assert.match(t.source, /<dc-import name="FoundationsColour1440" dark="\{\{yes\}\}" hint-size="1440px,2400px"><\/dc-import>/);
  });

  test('regenerating keeps authored boards where they are, declares the namespace, and validates clean', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-boards-'));
    const starter = path.join(dir, 'starter');
    await mkdir(path.join(starter, 'system'), { recursive: true });
    await mkdir(path.join(starter, 'components', 'system'), { recursive: true });
    await mkdir(path.join(dir, 'canvas'), { recursive: true });
    await writeFile(path.join(dir, 'tokens.json'), JSON.stringify(tokens));
    await writeFile(path.join(starter, 'system', 'system.json'), JSON.stringify(system));
    await writeFile(path.join(starter, 'components', 'system', 'button.def.mjs'), def('Button', 'Actions'));
    await writeFile(path.join(starter, 'components', 'system', 'badge.def.mjs'), def('Badge', 'Status'));
    const authored = artboard({ name: 'ConsoleRosters1440', system: 'acme', title: 'Rosters', body: '<x-import component-from-global-scope="Acme.Root"><p style="margin:0">Rosters</p></x-import>', preview: { width: 1440, height: 900 } });
    await writeFile(path.join(dir, 'canvas', 'ConsoleRosters1440.dc.html'), authored);
    await writeFile(path.join(dir, 'canvas', 'canvas.json'), JSON.stringify({ artboards: [{ file: 'ConsoleRosters1440.dc.html', x: 0, y: 200, w: 1440, h: 900 }], annotations: [{ id: 'console', x: 0, y: -100, text: 'Ops console', kind: 'title1', maxW: 1440 }] }));

    const first = await B.writeBoards({ productDir: dir, starter, measure: false });
    const files = await readdir(path.join(dir, 'canvas'));
    for (const f of ['Main.dc.html', 'FoundationsColour1440.dc.html', 'FoundationsColour1440Dark.dc.html', 'ComponentsActions1440.dc.html', 'ComponentsStatus1440Dark.dc.html', 'ConsoleRosters1440.dc.html']) assert.ok(files.includes(f), f);
    assert.equal(await readFile(path.join(dir, 'canvas', 'ConsoleRosters1440.dc.html'), 'utf8'), authored, 'an authored board is never rewritten');
    const manifest = JSON.parse(await readFile(path.join(dir, 'canvas', 'canvas.json'), 'utf8'));
    assert.deepEqual(manifest.designSystems, [{ title: 'Acme product system', namespace: 'acme' }]);
    const roster = manifest.artboards.find((a) => a.file === 'ConsoleRosters1440.dc.html');
    const lowest = Math.max(...manifest.artboards.filter((a) => a.file !== roster.file).map((a) => a.y + a.h));
    assert.ok(roster.y > lowest, 'the authored board moved below the generated rows');
    assert.ok(manifest.annotations.some((n) => n.id === 'console' && n.y === -100 + first.shifted), 'its title note moved with it');
    assert.match(await readFile(path.join(dir, 'canvas', 'Main.dc.html'), 'utf8'), /href="ConsoleRosters1440\.dc\.html"/, 'the contents board links each section');

    const artboards = await Promise.all(files.filter((f) => f.endsWith('.dc.html')).map(async (f) => ({ file: f, source: await readFile(path.join(dir, 'canvas', f), 'utf8') })));
    const check = validateCanvas({ artboards, manifest });
    assert.deepEqual(check.errors, []);

    await rm(path.join(starter, 'components', 'system', 'badge.def.mjs'));
    // An older run measured its pages inside the canvas folder and left them there.
    await mkdir(path.join(dir, 'canvas', '.measure'), { recursive: true });
    await writeFile(path.join(dir, 'canvas', '.measure', 'Old.preview.html'), '<p>old</p>');
    await B.writeBoards({ productDir: dir, starter, measure: false });
    const after = await readdir(path.join(dir, 'canvas'));
    assert.equal(after.includes('.measure'), false, 'no measuring pages left in the canvas folder');
    assert.equal(after.includes('ComponentsStatus1440.dc.html'), false, 'a board for a group that no longer exists is removed');
    assert.ok(after.includes('ConsoleRosters1440.dc.html'));
    await rm(dir, { recursive: true, force: true });
  });
});
