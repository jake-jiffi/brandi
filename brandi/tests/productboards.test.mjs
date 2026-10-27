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
    await B.writeBoards({ productDir: dir, starter, measure: false });
    const after = await readdir(path.join(dir, 'canvas'));
    assert.equal(after.includes('ComponentsStatus1440.dc.html'), false, 'a board for a group that no longer exists is removed');
    assert.ok(after.includes('ConsoleRosters1440.dc.html'));
    await rm(dir, { recursive: true, force: true });
  });
});
