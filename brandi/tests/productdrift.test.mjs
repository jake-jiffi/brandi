import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { driftCheck, driftReport } from '../scripts/productdrift.mjs';
import { buildProductTokens, toProductCss } from '../scripts/producttokens.mjs';
import { toStarterGlobals } from '../scripts/productglobals.mjs';
import { buildSystem } from '../scripts/system.mjs';
import { artboard, canvasManifest } from '../scripts/canvas.mjs';
import { resolveLogicNs } from '../scripts/productdocs.mjs';

const tokens = buildProductTokens(buildSystem({ primary: '#1F6F4A', type: { display: 'Bitter', body: 'Karla' } }), { name: 'Acme product system' });
const system = { name: 'Acme', namespace: 'acme', global: 'Acme', version: '1.0.0' };
const buttonDef = `export default { name: "Button", group: "Actions", job: "The pressable action.", status: "proven",
  props: [{ name: "variant", type: "string", doc: "x." }, { name: "icon", type: "string", doc: "x." }],
  examples: [{ id: "a", title: "A", markup: '<x-import component-from-global-scope="NS.Button">Go</x-import>' }] }\n`;

async function product({ drift = false } = {}) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-drift-'));
  const starter = path.join(dir, 'starter');
  for (const d of ['system', 'app', 'components/system', 'canvas/dist']) await mkdir(path.join(starter, d), { recursive: true });
  await mkdir(path.join(dir, 'canvas', 'ds', 'acme', 'components'), { recursive: true });
  await mkdir(path.join(dir, 'components'), { recursive: true });
  await writeFile(path.join(dir, 'tokens.json'), JSON.stringify(tokens, null, 2));
  await writeFile(path.join(starter, 'system', 'tokens.json'), `${JSON.stringify(tokens, null, 2)}\n`);
  await writeFile(path.join(starter, 'system', 'system.json'), JSON.stringify(system));
  await writeFile(path.join(starter, 'app', 'globals.css'), toStarterGlobals(tokens) + (drift ? '\n/* hand edit */\n' : ''));
  await writeFile(path.join(starter, 'components', 'system', 'button.tsx'), 'export function Button() { return null }\n');
  await writeFile(path.join(starter, 'components', 'system', 'button.def.mjs'), buttonDef);
  const copy = structuredClone(tokens);
  if (drift) copy.color.tokens.find((t) => t.name === 'text-muted').value = { light: '#5B6470', dark: '#9AA3AE' };
  await writeFile(path.join(dir, 'canvas', 'ds', 'acme', 'tokens.json'), JSON.stringify(copy));
  await writeFile(path.join(dir, 'canvas', 'ds', 'acme', 'tokens.css'), toProductCss(tokens));
  for (const d of [path.join(dir, 'components'), path.join(starter, 'canvas', 'dist'), path.join(dir, 'canvas', 'ds', 'acme', 'components')]) {
    await writeFile(path.join(d, 'bundle.js'), drift && d.includes(path.join('ds', 'acme')) ? 'var Acme = {old: 1}' : 'var Acme = {}');
    await writeFile(path.join(d, 'bundle.css'), '.x{}');
  }
  await writeFile(path.join(dir, 'components', 'manifest.json'), JSON.stringify({ exports: ['Button', 'Root'] }));
  const good = artboard({ name: 'Main', system: 'acme', preview: { width: 600, height: 400 }, body: '<x-import component-from-global-scope="Acme.Root" theme="light"><x-import component-from-global-scope="Acme.Button" variant="primary" icon="Check">Go</x-import></x-import>' });
  await writeFile(path.join(dir, 'canvas', 'Main.dc.html'), good);
  const entries = [{ file: 'Main.dc.html', w: 600, h: 400 }];
  if (drift) {
    await writeFile(path.join(dir, 'canvas', 'Bad.dc.html'), artboard({ name: 'Bad', system: 'acme', preview: { width: 600, height: 400 }, body: '<div style="color: #FF0000; padding: 8px"><x-import component-from-global-scope="Acme.Button" label-position="end">Go</x-import><x-import component-from-global-scope="Acme.Gizmo"></x-import></div>' }));
    await writeFile(path.join(dir, 'canvas', '_probe.dc.html'), artboard({ name: 'Probe', body: '<p>x</p>' }));
    await writeFile(path.join(starter, 'components', 'system', 'orphan.tsx'), 'export function Orphan() { return null }\n');
    entries.push({ file: 'Bad.dc.html', w: 600, h: 900 });
  }
  await writeFile(path.join(dir, 'canvas', 'canvas.json'), JSON.stringify(canvasManifest(entries)));
  return { dir, starter };
}

describe('the drift check', () => {
  test('a component that passes native props through may take them on a board; one that does not may not', async () => {
    const { dir, starter } = await product();
    await writeFile(path.join(starter, 'components', 'system', 'field-box.tsx'), 'export function FieldBox() { return null }\n');
    await writeFile(path.join(starter, 'components', 'system', 'field-box.def.mjs'), `export default { name: "FieldBox", group: "Inputs", job: "A box.", status: "proven",
  props: [{ name: "size", type: "string", doc: "Its size." }, { name: "placeholder, readOnly and the rest", type: "native", doc: "Every native input prop passes through." }],
  examples: [{ id: "a", title: "A", markup: '<x-import component-from-global-scope="NS.FieldBox"></x-import>' }] }\n`);
    await writeFile(path.join(dir, 'components', 'manifest.json'), JSON.stringify({ exports: ['Button', 'FieldBox', 'Root'] }));
    await writeFile(path.join(dir, 'canvas', 'Main.dc.html'), artboard({ name: 'Main', system: 'acme', preview: { width: 600, height: 400 }, body: '<x-import component-from-global-scope="Acme.Root" theme="light"><x-import component-from-global-scope="Acme.FieldBox" placeholder="[Search]" readonly="true"></x-import><x-import component-from-global-scope="Acme.Button" on-click="{{go}}">Go</x-import></x-import>' }));
    const { differences } = await driftCheck({ productDir: dir, starter });
    const props = differences.filter((d) => d.area === 'prop').map((d) => d.found);
    assert.deepEqual(props, ['Acme.Button on-click='], 'Button declares no native row; FieldBox does');
    await rm(dir, { recursive: true, force: true });
  });

  test('a product whose canvas, system and code agree has nothing to report', async () => {
    const { dir, starter } = await product();
    const result = await driftCheck({ productDir: dir, starter });
    assert.deepEqual(result.differences, []);
    assert.match(driftReport(result), /^drift: 0 differences, gate passed/);
    assert.match(driftReport(result), /not checked automatically: Screens on the canvas/);
    await rm(dir, { recursive: true, force: true });
  });

  test('every planted difference is found, with both values and where each lives', async () => {
    const { dir, starter } = await product({ drift: true });
    const { differences } = await driftCheck({ productDir: dir, starter });
    const by = (area) => differences.filter((d) => d.area === area);
    assert.ok(by('token').some((d) => /text-muted/.test(d.where) && /product\/tokens\.json text-muted/.test(d.expected)), 'a canvas copy that predates a token change');
    assert.equal(by('globals').length, 1, 'a hand edit in globals.css');
    assert.ok(by('bundle').some((d) => /bundle\.js/.test(d.where)), 'a bundle copy out of step');
    assert.ok(by('prop').some((d) => /label-position=/.test(d.found) && /no labelPosition/.test(d.expected)), 'a prop the system does not have');
    assert.ok(by('prop').some((d) => /Acme\.Gizmo/.test(d.found)), 'a component the manifest does not have');
    assert.ok(by('size').some((d) => d.where === 'Bad.dc.html'), 'a frame that disagrees with its $preview');
    assert.ok(by('raw').some((d) => d.found === '#FF0000'), 'a raw colour typed into a board');
    assert.ok(by('publish').some((d) => d.where === '_probe.dc.html'), 'a probe board in the canvas folder');
    assert.ok(by('catalogue').some((d) => /Orphan/.test(d.where)), 'a component with no card');
    assert.match(driftReport({ differences, unchecked: [] }), new RegExp(`^drift: ${differences.length} differences, gate failed`));
    await rm(dir, { recursive: true, force: true });
  });
});

describe('a definition\'s logic', () => {
  test('NS.<Export> in logic resolves to the bundle on the page, and nothing else changes', () => {
    assert.equal(resolveLogicNs('actions: React.createElement(NS.Button, { variant: "primary" }, "Save")', 'Acme'), 'actions: React.createElement(window.Acme.Button, { variant: "primary" }, "Save")');
    assert.equal(resolveLogicNs('a: self.NS.x, b: "NS.y"', 'Acme'), 'a: self.NS.x, b: "window.Acme.y"');
  });
});
