import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { productMd, designMd, impeccablePlatform, CONTEXT_MARKER, PRODUCT_SCHEMA } from '../scripts/productcontext.mjs';
import { checkDefinition, loadDefinitions } from '../scripts/productdocs.mjs';
import { systemIdentity, writeStarter, KIT } from '../scripts/productstarter.mjs';
import { buildProductTokens } from '../scripts/producttokens.mjs';
import { buildSystem } from '../scripts/system.mjs';

const tokens = buildProductTokens(buildSystem({ primary: '#1F6F4A', accents: ['#D9822B'], type: { display: 'Bitter', body: 'Karla', mono: 'JetBrains Mono' } }), { name: 'Acme product system' });
const identity = systemIdentity({}, { brandName: 'Acme' });

describe('PRODUCT.md, from the intake', () => {
  test('the platform is the value Impeccable reads', () => {
    assert.equal(impeccablePlatform(['web']), 'web');
    assert.equal(impeccablePlatform(['web', 'macos', 'windows']), 'web');
    assert.equal(impeccablePlatform(['ios-ipados']), 'ios');
    assert.equal(impeccablePlatform(['android']), 'android');
    assert.equal(impeccablePlatform(['ios', 'android']), 'adaptive');
    assert.equal(impeccablePlatform(['web', 'ios-ipados']), 'adaptive');
    assert.equal(impeccablePlatform([]), 'web');
  });

  test('it carries the schema line verbatim, and a gap in the intake stays a bracketed gap', () => {
    const md = productMd({ identity, product: { surfaces: [{ name: 'Staff app', platforms: ['android'] }] } });
    assert.ok(md.startsWith(`# Product\n\n${PRODUCT_SCHEMA}\n`));
    assert.match(md, /\[who uses it\], on the Staff app \(android\): \[what they do there\]\./);
    assert.match(md, /## Platform\n\nandroid\n/);
    assert.ok(md.includes(CONTEXT_MARKER));
  });

  test('a section the intake never answered is left out, not filled with prose', () => {
    const md = productMd({ identity, product: {} });
    for (const h of ['## Users', '## Product Purpose', '## Positioning', '## Operating Context', '## Evidence on Hand']) {
      assert.equal(md.includes(h), false, h);
    }
  });

  test('every outside system lists how it fails, and the copy names it', () => {
    const md = productMd({ identity, product: { systems: [{ name: '[Rostering system]', reads: 'shifts', fails: ['not responding', 'a shift keyed outside store hours'] }] } });
    assert.match(md, /\[Rostering system\]: reads shifts\. Failure modes: not responding; a shift keyed outside store hours\. Each is a state on a states board, and the copy names \[Rostering system\]\./);
  });

  test('what the assistant may do, and every open question, is written down', () => {
    const md = productMd({ identity, product: {
      assistant: { drafts: ['replies', 'reminders'], approves: 'each action, or the rule behind it', never: ['pays'] },
      openQuestions: [{ question: 'Does the staff app work offline?', assumed: 'No.' }],
    } });
    assert.match(md, /drafts replies and reminders\. A person sends\./);
    assert.match(md, /never pays\./);
    assert.match(md, /Undecided: Does the staff app work offline\? Working assumption: No\./);
    assert.match(md, /formatted for en-AU in AUD/);
  });
});

describe('DESIGN.md, from the tokens and the definitions', () => {
  test('the frontmatter carries every role as a value, never as an alias of another role', async () => {
    const aliased = tokens.color.tokens.find((t) => /^\{/.test(t.value?.light ?? ''));
    assert.ok(aliased, 'the fixture has an aliased role, so the test can fail');
    const md = designMd({ tokens, identity, defs: await loadDefinitions(path.join(KIT, 'components', 'system')) });
    assert.ok(md.startsWith('---\nname: '));
    const front = md.split('\n---\n')[0];
    for (const t of tokens.color.tokens) assert.match(front, new RegExp(`\\n  ${t.name}: "`), t.name);
    assert.equal(/: "\{(?!colors\.|typography\.|rounded\.)/.test(front), false, 'a primitive refers to another');
  });

  test('its sections come in the canonical order', async () => {
    const md = designMd({ tokens, identity, defs: await loadDefinitions(path.join(KIT, 'components', 'system')) });
    const order = ['## Overview', '## Colors', '## Typography', '## Layout', '## Elevation & Depth', '## Shapes', '## Components', "## Do's and Don'ts"].map((h) => md.indexOf(`\n${h}\n`));
    assert.ok(order.every((i) => i > 0), `missing: ${order}`);
    assert.deepEqual([...order].sort((a, b) => a - b), order);
  });

  test('a component row names roles, and a role the tokens lack is dropped rather than invented', () => {
    const defs = [{ name: 'Chip', group: 'Actions', job: 'A chip.', design: { 'chip-default': { backgroundColor: 'surface', textColor: 'no-such-role', height: '28px' } } }];
    const md = designMd({ tokens, identity, defs });
    assert.match(md, /\n {2}chip-default:\n {4}backgroundColor: "\{colors\.surface\}"\n {4}height: "28px"\n/);
    assert.equal(md.includes('no-such-role'), false);
  });

  test('a design row with a prop the format cannot hold is refused by the definition check', () => {
    const def = {
      name: 'Chip', group: 'Actions', job: 'A chip.', status: 'proven', props: [],
      examples: [{ id: 'a', title: 'A', markup: '<x-import component-from-global-scope="NS.Chip"></x-import>' }],
      design: { 'chip-default': { boxShadow: '0 1px 2px' } },
    };
    assert.ok(checkDefinition(def).some((p) => /boxShadow is not one of/.test(p)), checkDefinition(def).join('\n'));
  });
});

describe('the starter writes both, and leaves a file a person took over alone', () => {
  test('written on the first run, rewritten while the marker stays, kept once it goes', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-context-'));
    const out = path.join(dir, 'starter');
    const first = await writeStarter({ out, tokens, identity, product: { surfaces: [{ name: 'Ops console', people: 'Managers', jobs: 'Approve rosters', platforms: ['web'] }] } });
    assert.ok(first.written.includes('PRODUCT.md') && first.written.includes('DESIGN.md'));
    assert.match(await readFile(path.join(out, 'PRODUCT.md'), 'utf8'), /Managers, on the Ops console/);
    assert.match(await readFile(path.join(out, 'DESIGN.md'), 'utf8'), /\n {2}button-primary:\n/);
    await writeFile(path.join(out, 'DESIGN.md'), '# Ours now\n');
    const second = await writeStarter({ out, tokens, identity });
    assert.deepEqual(second.kept, ['DESIGN.md']);
    assert.equal(await readFile(path.join(out, 'DESIGN.md'), 'utf8'), '# Ours now\n');
    assert.ok(second.written.includes('PRODUCT.md'), 'a file that still carries the marker is rewritten');
    await rm(dir, { recursive: true, force: true });
  });
});
