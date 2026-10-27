import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
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
});
