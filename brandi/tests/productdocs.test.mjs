import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadDefinitions, checkDefinition, componentReadme, previewBoard, previewPage, typesFile, cardHeight } from '../scripts/productdocs.mjs';
import { validateArtboard } from '../scripts/canvas.mjs';

const KIT_SYSTEM = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'product', 'kit', 'components', 'system');
const system = { name: 'Acme', namespace: 'acme', global: 'Acme', version: '1.0.0', lang: 'en-AU', fontsUrl: 'https://fonts.googleapis.com/css2?family=Karla:wght@400&display=swap' };
const defs = await loadDefinitions(KIT_SYSTEM);
const button = defs.find((d) => d.name === 'Button');

describe('every definition in the kit', () => {
  test('is complete, mounts through the namespace and carries no em dash', () => {
    assert.ok(defs.length >= 2);
    const problems = defs.flatMap(checkDefinition);
    assert.deepEqual(problems, []);
  });

  test('a definition missing what a card needs is refused, sentence by sentence', () => {
    const broken = { ...button, job: 'No full stop', examples: [{ id: 'Bad Id', title: 'x', markup: '<x-import component-from-global-scope="Acme.Button"></x-import>' }], checks: [{ name: 'c', example: 'missing', run() {} }] };
    const problems = checkDefinition(broken);
    assert.ok(problems.some((p) => /job must be one sentence/.test(p)));
    assert.ok(problems.some((p) => /lower-case words/.test(p)));
    assert.ok(problems.some((p) => /NS\.<Export>/.test(p)));
    assert.ok(problems.some((p) => /names example missing/.test(p)));
    assert.ok(checkDefinition({ ...button, job: 'Has a dash — here.' }).some((p) => /em dash/.test(p)));
  });
});

describe('what one definition writes', () => {
  test('the README opens on the name and the job, then the props, the notes, the canvas example and the checks', () => {
    const md = componentReadme(button, system);
    const lines = md.split('\n');
    assert.equal(lines[0], '# Button');
    assert.equal(lines[2], button.job, 'the first sentence is the summary the Design System shows');
    assert.match(md, /\| `variant` \| `"primary" \\\| "secondary"/);
    assert.match(md, /## Variants/);
    assert.ok(md.indexOf('## States') < md.indexOf('## Copy') && md.indexOf('## Copy') < md.indexOf('## Review'), 'notes in the reference\'s order');
    assert.match(md, /component-from-global-scope="Acme\.Button"/);
    assert.equal(md.includes('NS.'), false);
    assert.match(md, /## Scripted checks\n\n- A loading button ignores a second press/);
    assert.match(componentReadme({ ...button, status: 'to build' }, system), /To build, not yet proven/);
  });

  test('the preview board validates, with each example in its own section and a dark tweak', () => {
    const board = previewBoard(button, system);
    assert.equal(validateArtboard(board, { systems: ['acme'] }).ok, true, JSON.stringify(validateArtboard(board, { systems: ['acme'] }).errors));
    for (const ex of button.examples) assert.match(board, new RegExp(`data-example="${ex.id}"`));
    assert.match(board, /"dark":\{"editor":"boolean","default":false\}/);
    assert.match(board, /theme: this\.props\.dark \? "dark" : "light"/);
    assert.match(board, /fonts\.googleapis\.com\/css2\?family=Karla/);
    assert.match(board, /<link rel="stylesheet" href="ds\/acme\/components\/bundle\.css">/);
    assert.equal((board.match(/<main /g) ?? []).length, 1, 'one main landmark, so a page-level scan reads it as a page');
    assert.match(board, /<h1 style="position: absolute;[^"]*">Button<\/h1>/, 'one h1, visually hidden');
  });

  test('the Design System preview leaves the theme to the viewer and carries its runtime inline', () => {
    const page = previewPage(button, system);
    assert.match(page.split('\n')[0], /^<!-- @dsCard group="Actions" height=\d+ -->$/);
    assert.match(page, /component-from-global-scope="Acme\.Root" background="none"/);
    assert.equal(/Acme\.Root" theme=/.test(page), false);
    const inline = page.slice(page.lastIndexOf('<script>'), page.lastIndexOf('</script>'));
    assert.match(inline, /Design Component runtime shim/);
    assert.equal(/<\/script/i.test(inline.slice(8)), false, 'no literal </script inside the inline runtime');
    assert.ok(cardHeight(button) > 100 && cardHeight(button) <= 1200);
  });

  test('the type file declares every component with its props, and the namespace on window', () => {
    const dts = typesFile([button, { ...button, name: 'Thing', props: [{ name: 'label', type: 'string', doc: 'Its name.', required: true }], types: ['type ThingKind = "a" | "b"'] }], system, { icons: ['Check', 'X'], numberStyles: ['number'] });
    assert.match(dts, /declare namespace Acme \{/);
    assert.match(dts, /type IconName = "Check" \| "X"/);
    assert.match(dts, /interface ButtonProps \{[\s\S]*variant\?: "primary"/);
    assert.match(dts, /label: string/, 'a required prop has no question mark');
    assert.match(dts, /type ThingKind = "a" \| "b"/);
    assert.match(dts, /interface Window \{ Acme: typeof Acme \}/);
  });

  test('an attribute name is quoted, and a row documenting native props stays out of the types', () => {
    const field = { ...button, name: 'Search', props: [
      { name: 'aria-label', type: 'string', doc: 'A name other than the placeholder.' },
      { name: 'value, defaultValue, onChange', type: 'native', doc: 'Every native input prop passes through.' },
    ] };
    const dts = typesFile([field], system);
    assert.match(dts, /\n {4}"aria-label"\?: string\n/);
    assert.equal(dts.includes('value, defaultValue'), false);
  });

  test('Root comes from its definition when the kit has one, never twice', () => {
    const root = { ...button, name: 'Root', props: [{ name: 'theme', type: '"light" | "dark"', doc: 'The theme.' }] };
    assert.equal((typesFile([button, root], system).match(/const Root:/g) ?? []).length, 1);
    assert.equal((typesFile([button], system).match(/const Root:/g) ?? []).length, 1, 'a kit without the definition still gets the provider');
  });

  test('functions a component carries on itself are declared on it', () => {
    const queue = { ...button, name: 'Queue', statics: [{ name: 'show', type: '(message: string) => string', doc: 'Adds one.' }] };
    const dts = typesFile([button, queue], system);
    assert.match(dts, /const Queue: ComponentType<QueueProps> & \{\n[\s\S]*?show: \(message: string\) => string\n {2}\}/);
    assert.match(dts, /const Button: ComponentType<ButtonProps>\n/, 'a component with none stays a plain component type');
  });
});

describe('the kit against its catalogue', () => {
  const catalogue = JSON.parse(readFileSync(path.join(path.dirname(KIT_SYSTEM), '..', '..', 'catalogue.json'), 'utf8')).components;

  test('every component the catalogue names has a definition, with the same status', () => {
    const byName = new Map(defs.map((d) => [d.name, d]));
    const missing = catalogue.filter((c) => !byName.has(c.name)).map((c) => c.name);
    assert.deepEqual(missing, [], 'catalogue names with no definition');
    const unlisted = defs.filter((d) => !catalogue.some((c) => c.name === d.name)).map((d) => d.name);
    assert.deepEqual(unlisted, [], 'definitions the catalogue does not list');
    const status = catalogue.filter((c) => byName.get(c.name)?.status !== c.status).map((c) => `${c.name}: ${byName.get(c.name)?.status} for ${c.status}`);
    assert.deepEqual(status, []);
  });

  test('every definition is complete, and every named type is declared by one definition only', () => {
    assert.deepEqual(defs.flatMap(checkDefinition), []);
    const declared = defs.flatMap((d) => (d.types ?? []).map((t) => [/^\s*(?:type|interface)\s+([A-Z]\w*)/.exec(t)?.[1], d.name]));
    const seen = new Map();
    const twice = [];
    for (const [type, owner] of declared) {
      if (seen.has(type)) twice.push(`${type} in ${seen.get(type)} and ${owner}`);
      seen.set(type, owner);
    }
    assert.deepEqual(twice, []);
  });
});

describe("the kit's own components", () => {
  test('a cut label is wrapped in a Tooltip that sizes as the label does, so wrapping it never loops', () => {
    // Badge measured its label, wrapped it in a Tooltip when cut, and the wrapper, which would not shrink, widened a
    // squeezed grid column until the label fitted: unwrapped, cut, wrapped, until React gave up (error 185).
    const wrapped = new Map();
    for (const f of readdirSync(KIT_SYSTEM).filter((x) => x.endsWith('.tsx'))) {
      for (const m of readFileSync(path.join(KIT_SYSTEM, f), 'utf8').matchAll(/\b\w*[cC]ut\s*\?\s*(<Tooltip\b[^>]*>)/g)) wrapped.set(f, m[1]);
    }
    for (const f of ['badge.tsx', 'tag.tsx', 'source.tsx']) assert.ok(wrapped.has(f), `${f} wraps its cut label in a Tooltip`);
    for (const [f, tag] of wrapped) assert.match(tag, /className=\{cutTrigger\}/, `${f}: the Tooltip round its cut label takes cutTrigger`);
    const trigger = /export const cutTrigger = "([^"]+)"/.exec(readFileSync(path.join(KIT_SYSTEM, 'tooltip.tsx'), 'utf8'))?.[1];
    assert.deepEqual(trigger?.split(/\s+/).sort(), ['min-w-0', 'shrink-0'], "the label's own sizing: it can shrink to nothing and never shrinks in a row");
  });

  test('no kit source or definition names a fixture brand, so a test brand never ships as sample copy', () => {
    // The kit's sample business was the fixture brand's own name and trade, so a proof run on that brand found itself
    // already on the kit's screens. The names come from the fixtures, so a fixture added later is held the same way,
    // and they match however they are joined: "Muddy Paws", "muddy-paws", "muddypaws", "MuddyPawsCo". Not inside a
    // lower-case word, so a one-word brand is not found in every word that holds it.
    const fixtures = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');
    const names = readdirSync(fixtures)
      .filter((f) => f.endsWith('.json'))
      .map((f) => JSON.parse(readFileSync(path.join(fixtures, f), 'utf8')).meta?.name?.trim())
      .filter(Boolean);
    assert.ok(names.length > 0, 'the fixtures name at least one brand');
    // Either case by hand, not the i flag: under it the lookahead could not tell "MuddyPawsCo" from "muddypawsy".
    const anyCase = (word) => [...word].map((c) => (c.toLowerCase() !== c.toUpperCase() ? `[${c.toLowerCase()}${c.toUpperCase()}]` : c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).join('');
    const patterns = names.map((n) => new RegExp(`(?<![\\p{L}\\p{N}])${n.split(/[\s_-]+/).map(anyCase).join('[\\s_-]*')}(?![\\p{Ll}\\p{N}])`, 'u'));
    const kit = path.dirname(path.dirname(KIT_SYSTEM));
    const walk = (dir) =>
      readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.name === 'node_modules' ? [] : e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
    const found = walk(kit).flatMap((f) => {
      const src = readFileSync(f, 'utf8');
      return patterns.filter((p) => p.test(src)).map((p) => `${path.relative(kit, f)} names ${src.match(p)[0]}`);
    });
    assert.deepEqual(found, []);
  });
});
