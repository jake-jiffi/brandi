import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { summarise, measureSite } from '../scripts/productmeasure.mjs';
import { findChrome } from '../scripts/preview.mjs';

describe("measuring a brand's live work for its shapes", () => {
  test('each family takes the radius most of its elements share, with a source naming the count and the rest', () => {
    const raw = {
      url: 'https://example.test/',
      press: [{ radius: 6, w: 120, h: 40 }, { radius: 6, w: 150, h: 44 }, { radius: 6, w: 90, h: 40 }, { radius: 20, w: 113, h: 38 }],
      control: [{ radius: 4, w: 300, h: 40 }],
      card: [{ radius: 30, w: 439, h: 628 }, { radius: 30, w: 439, h: 628 }, { radius: 5, w: 372, h: 221 }],
      frame: [{ radius: 0, w: 303, h: 175 }, { radius: 0, w: 500, h: 300 }, { radius: 20, w: 303, h: 175 }],
      shell: { radius: 0, w: 1440, left: 0, top: 0, viewport: 1440, tag: 'header' },
    };
    const s = summarise(raw, { date: new Date('2026-10-29T00:00:00Z') });
    assert.equal(s.families.press.px, 6);
    assert.match(s.families.press.source, /^https:\/\/example\.test\/, computed style on 2026-10-29: 3 of 4 visible filled buttons and links are 6px; the others pill x1\.$/, 'a 38px-tall button at 20px is a pill');
    assert.equal(s.families.control.px, 4);
    assert.equal(s.families.card.px, 30);
    assert.match(s.families.card.source, /2 of 3 .* are 30px; the others 5px x1/);
    assert.equal(s.families.frame.px, 0);
    assert.equal(s.shell.form, 'edge');
    const floating = summarise({ ...raw, shell: { radius: 16, w: 1392, left: 24, top: 24, viewport: 1440, tag: 'nav' } });
    assert.equal(floating.shell.form, 'floating');
    assert.deepEqual(summarise({ url: 'x', press: [], control: [], card: [], frame: [], shell: null }), { families: {}, shell: null }, 'a page that shows nothing suggests nothing');
  });

  test('measures a real page in the installed Chrome, over the DevTools protocol', { skip: findChrome() ? false : 'no headless browser on this machine' }, async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-measure-test-'));
    const page = `<!doctype html><html><body style="margin:0;font:16px sans-serif">
      <header style="display:flex;justify-content:space-between;padding:16px;background:#111;color:#fff;border-radius:0">Brand <a href="#" style="background:#2a7;color:#000;padding:10px 16px;border-radius:6px">Order now</a></header>
      <main style="padding:40px;display:flex;flex-direction:column;gap:24px">
        <div style="display:flex;gap:16px"><a href="#" style="background:#2a7;padding:10px 16px;border-radius:6px">Find a restaurant</a><button style="background:#2a7;border:0;padding:10px 16px;border-radius:6px">Join</button></div>
        <div style="display:flex;gap:16px"><a href="#" style="display:block;width:160px;height:44px;background:#000;border-radius:22px"><img alt="Get it on an app store" style="width:160px;height:44px"></a><a href="#" style="display:block;width:160px;height:44px;background:#000;border-radius:22px"><img alt="Download on another" style="width:160px;height:44px"></a><button aria-label="Next" style="width:44px;height:44px;border-radius:50%;background:#2a7;border:0"></button></div>
        <input placeholder="Suburb" style="width:300px;height:40px;border:1px solid #888;border-radius:4px">
        <div style="display:flex;gap:16px">
          <article style="width:300px;height:200px;background:#eee;border-radius:16px;padding:16px">A card</article>
          <article style="width:300px;height:200px;background:#eee;border-radius:16px;padding:16px">Another card</article>
        </div>
        <img alt="A photo" style="width:400px;height:240px;background:#ccc" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='240'/%3E">
      </main></body></html>`;
    await writeFile(path.join(dir, 'site.html'), page);
    const raw = await measureSite(pathToFileURL(path.join(dir, 'site.html')).href, { settle: 300 });
    const s = summarise(raw);
    assert.equal(s.families.press.px, 6, JSON.stringify(raw.press));
    assert.equal(s.families.control.px, 4);
    assert.equal(s.families.card.px, 16);
    assert.equal(s.families.frame.px, 0);
    assert.equal(s.shell.form, 'edge');
    await rm(dir, { recursive: true, force: true });
  });
});
