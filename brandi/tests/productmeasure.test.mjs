import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { summarise, measureSite, measurePages } from '../scripts/productmeasure.mjs';
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
    assert.deepEqual(summarise({ url: 'x', press: [], control: [], card: [], frame: [], shell: null }), { families: {}, shell: null, frames: [] }, 'a page that shows nothing suggests nothing');
  });

  test('across pages each family takes the radius most of all its elements share, and the source shows each page\'s own', () => {
    const page = (url, press, control = []) => ({ url, press: press.map((radius) => ({ radius, w: 120, h: 40 })), control: control.map((radius) => ({ radius, w: 300, h: 40 })), card: [], frame: [], shell: null, frames: [] });
    const raws = [
      { ...page('https://example.test/', [6, 6, 6, 6, 20, 0]), shell: { radius: 0, w: 1440, left: 0, top: 0, viewport: 1440, tag: 'header' } },
      page('https://example.test/contact/', [10, 10, 10, 6], [4, 4]),
      page('https://example.test/locations/', [7, 7, 6]),
    ];
    const s = summarise(raws, { date: new Date('2026-10-29T00:00:00Z') });
    assert.equal(s.families.press.px, 6);
    assert.equal(s.families.press.source, 'https://example.test/ and 2 more pages, computed style on 2026-10-29: 6 of 13 visible filled buttons and links across 3 pages are 6px; the others 10px x3, 7px x2, pill x1, 0px x1. By page: / 6px (4 of 6), /contact/ 10px (3 of 4), /locations/ 7px (2 of 3).');
    assert.equal(s.families.control.px, 4);
    assert.match(s.families.control.source, /2 of 2 visible form fields across 3 pages are 4px\. By page: \/contact\/ 4px \(2 of 2\)\.$/, 'a page with no fields is left out of the spread');
    assert.match(s.shell.source, /^https:\/\/example\.test\/, computed style/, 'the shell is the first page\'s');
  });

  test('a frame from another site is named, since a form inside it cannot be measured', () => {
    const s = summarise([{ url: 'https://example.test/contact/', press: [], control: [], card: [], frame: [], shell: null, frames: [{ origin: 'https://forms.example.net', w: 600, h: 720 }] }]);
    assert.deepEqual(s.frames, [{ page: 'https://example.test/contact/', origin: 'https://forms.example.net', w: 600, h: 720 }]);
    assert.equal(s.families.control, undefined);
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

  test('follows the first page\'s navigation to more pages in one browser, reads fields in a frame of its own site, and names a frame from another', { skip: findChrome() ? false : 'no headless browser on this machine' }, async () => {
    const shell = (body) => `<!doctype html><html><body style="margin:0;font:16px sans-serif"><header style="background:#111;padding:16px"><nav><a href="/contact" style="color:#fff">Contact</a> <a href="/about" style="color:#fff">About</a> <a href="https://elsewhere.example/" style="color:#fff">Elsewhere</a> <a href="#top" style="color:#fff">Top</a></nav></header><main style="padding:40px">${body}</main></body></html>`;
    const form = '<!doctype html><html><body><form><input placeholder="Name" style="width:300px;height:40px;border:1px solid #888;border-radius:3px"><textarea style="width:300px;height:80px;border:1px solid #888;border-radius:3px"></textarea></form></body></html>';
    let port;
    const pages = {
      '/': () => shell('<a href="#" style="background:#2a7;padding:10px 16px;border-radius:6px">Order now</a>'),
      '/contact': () => shell('<iframe src="/form" style="width:500px;height:300px;border:0"></iframe>'),
      // localhost is another origin than 127.0.0.1, so this frame is another site's, as an embedded form often is.
      // The second, lazy and far below the fold, has not loaded: it still holds a blank page of this site's own.
      '/about': () => shell(`<iframe src="http://localhost:${port}/form" style="width:500px;height:300px;border:0"></iframe><div style="height:6000px"></div><iframe loading="lazy" src="http://localhost:${port}/form" style="width:400px;height:200px;border:0"></iframe>`),
      '/form': () => form,
    };
    const server = createServer((req, res) => (pages[req.url] ? res.writeHead(200, { 'content-type': 'text/html' }).end(pages[req.url]()) : res.writeHead(404).end()));
    await new Promise((r) => server.listen(0, '127.0.0.1', r));
    port = server.address().port;
    const base = `http://127.0.0.1:${port}`;
    try {
      const one = await measurePages([`${base}/`], { follow: 1, settle: 300 });
      assert.deepEqual(one.errors, []);
      assert.deepEqual(one.pages.map((p) => new URL(p.url).pathname), ['/', '/contact'], 'one link followed, from the navigation, its own site only');
      const s = summarise(one.pages);
      assert.equal(s.families.control?.px, 3, JSON.stringify(one.pages[1].control));
      assert.match(s.families.control.source, /By page: \/contact 3px \(2 of 2\)\.$/);
      const both = await measurePages([`${base}/`, `${base}/about`], { follow: 5, settle: 300 });
      assert.deepEqual(both.pages.map((p) => new URL(p.url).pathname), ['/', '/about', '/contact'], 'given pages first, then followed ones, none twice');
      assert.deepEqual(summarise(both.pages).frames, [{ page: `${base}/about`, origin: `http://localhost:${port}`, w: 500, h: 300 }, { page: `${base}/about`, origin: `http://localhost:${port}`, w: 400, h: 200 }]);
    } finally {
      server.close();
    }
  });

  test('brandi product measure takes --url more than once, and says when a page shows no field rather than leaving it out', { skip: findChrome() ? false : 'no headless browser on this machine' }, async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-measure-cli-'));
    await writeFile(path.join(dir, 'a.html'), '<!doctype html><html><body><a href="#" style="background:#2a7;padding:10px 16px;border-radius:6px">Order now</a></body></html>');
    await writeFile(path.join(dir, 'b.html'), '<!doctype html><html><body><a href="#" style="background:#2a7;padding:10px 16px;border-radius:8px">Join</a></body></html>');
    const cli = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'brandi.mjs');
    const urls = ['a.html', 'b.html'].map((f) => pathToFileURL(path.join(dir, f)).href);
    const human = spawnSync(process.execPath, [cli, 'product', 'measure', '--url', urls[0], '--url', urls[1]], { encoding: 'utf8' });
    assert.equal(human.status, 0, human.stderr);
    assert.match(human.stdout, /^Measured 2 pages at 1440 wide/);
    assert.match(human.stdout, /\n {2}control \(none on the pages measured\)\n/);
    assert.match(human.stdout, /across 2 pages are 6px; the others 8px x1\. By page: /);
    const json = JSON.parse(spawnSync(process.execPath, [cli, 'product', 'measure', '--url', urls[0], '--url', urls[1], '--json'], { encoding: 'utf8' }).stdout);
    assert.deepEqual(json.urls, urls);
    await rm(dir, { recursive: true, force: true });
  });
});
