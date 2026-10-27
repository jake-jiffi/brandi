import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { compareProduct, syncReport, applyTokens, provenance } from '../scripts/productsync.mjs';
import { buildProductTokens } from '../scripts/producttokens.mjs';
import { buildSystem } from '../scripts/system.mjs';

const tokens = buildProductTokens(buildSystem({ primary: '#1F6F4A', type: { display: 'Bitter', body: 'Karla' } }), { name: 'Acme product system' });
const def = (name, props) => `export default { name: "${name}", group: "Actions", job: "x.", status: "proven", props: ${JSON.stringify(props)}, examples: [{ id: "a", title: "A", markup: "<b>x</b>" }] }\n`;

async function tree(root, { tokensJson, defs }) {
  await mkdir(path.join(root, 'system'), { recursive: true });
  await mkdir(path.join(root, 'components', 'system'), { recursive: true });
  await writeFile(path.join(root, 'system', 'tokens.json'), JSON.stringify(tokensJson, null, 2));
  for (const [file, src] of Object.entries(defs)) await writeFile(path.join(root, 'components', 'system', file), src);
}

describe('sync from a shipped product', () => {
  test('lists roles and components added, changed and removed, and deletes nothing', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-sync-'));
    const shippedTokens = structuredClone(tokens);
    shippedTokens.color.tokens.find((t) => t.name === 'primary').value = { light: '#155A3B', dark: '#4FB287' };
    shippedTokens.color.tokens.push({ name: 'promo', value: { light: '#FFD54A', dark: '#FFD54A' }, usage: 'x' });
    shippedTokens.color.tokens = shippedTokens.color.tokens.filter((t) => t.name !== 'tag-grey');
    await tree(path.join(dir, 'shipped'), { tokensJson: shippedTokens, defs: {
      'button.def.mjs': def('Button', [{ name: 'variant', type: 'string', doc: 'x.' }, { name: 'tone', type: 'string', doc: 'x.' }]),
      'promo-banner.def.mjs': def('PromoBanner', []),
    } });
    await tree(path.join(dir, 'system'), { tokensJson: tokens, defs: {
      'button.def.mjs': def('Button', [{ name: 'variant', type: 'number', doc: 'x.' }, { name: 'icon', type: 'string', doc: 'x.' }]),
      'badge.def.mjs': def('Badge', []),
    } });
    const diff = await compareProduct({ shipped: path.join(dir, 'shipped'), system: path.join(dir, 'system') });
    assert.deepEqual(diff.roles.added, ['promo']);
    assert.deepEqual(diff.roles.removed, ['tag-grey']);
    assert.deepEqual(diff.roles.changed.map((c) => c.name), ['primary']);
    assert.deepEqual(diff.components.added, ['PromoBanner']);
    assert.deepEqual(diff.components.removed, ['Badge']);
    assert.deepEqual(diff.components.changed, [{ name: 'Button', gained: ['tone'], lost: ['icon'], retyped: ['variant'] }]);
    const report = syncReport(diff, provenance(path.join(dir, 'shipped')));
    assert.match(report, /removed  tag-grey \(listed, not deleted\)/);
    assert.match(report, /changed  Button: gained tone lost icon retyped variant/);

    const productDir = path.join(dir, 'product');
    await mkdir(productDir);
    const applied = applyTokens(diff, { productDir, prov: { path: 'shipped', remote: 'git@example.com:acme/app.git', commit: 'abc123', dirty: false }, date: '2026-10-28' });
    const written = JSON.parse(await readFile(path.join(productDir, 'tokens.json'), 'utf8'));
    assert.deepEqual(written.meta.syncedFrom, { repo: 'git@example.com:acme/app.git', commit: 'abc123', dirty: false, method: 'copied as shipped by brandi product sync', on: '2026-10-28' });
    assert.match(applied.summary, /pairs checked/);
    await rm(dir, { recursive: true, force: true });
  });
});
