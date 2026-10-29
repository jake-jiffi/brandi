/**
 * Brandi product layer: measure a brand's own live work for its shape families.
 *
 * The guidelines come first (02-brand-to-product.md, Shape). Where they say nothing, the brand's own website is
 * the next evidence, and reading its computed styles by hand in a browser is how one brand's shapes were found:
 * square navigation, 6px buttons, square photos, 30px news cards. This does that reading, in the installed Chrome
 * driven over the DevTools protocol, so nothing is installed. It suggests; the person running the skill checks
 * each family against the guidelines before anything goes into product.json.
 */

import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { findChrome } from './preview.mjs';

/**
 * Runs in the page. Each family's elements, with their top-left corner radius, size and a few words.
 * Visible only, so a closed menu or an off-screen slide says nothing about the brand.
 */
export const IN_PAGE = `(() => {
  const vw = innerWidth;
  const seen = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && Number(s.opacity) > 0; };
  const filled = (s) => s.backgroundColor !== 'rgba(0, 0, 0, 0)' && s.backgroundColor !== 'transparent' || s.backgroundImage !== 'none';
  const lined = (s) => parseFloat(s.borderTopWidth) > 0 && s.borderTopStyle !== 'none';
  const radius = (el) => { const r = getComputedStyle(el).borderTopLeftRadius; return r.endsWith('%') ? (parseFloat(r) >= 50 ? 'round' : r) : parseFloat(r) || 0; };
  const words = (el) => (el.innerText || el.getAttribute('aria-label') || el.alt || '').trim().replace(/\\s+/g, ' ').slice(0, 40);
  const item = (el) => { const b = el.getBoundingClientRect(); return { radius: radius(el), w: Math.round(b.width), h: Math.round(b.height), words: words(el) }; };
  const press = [...document.querySelectorAll('a, button, input[type=submit], input[type=button], [role=button]')]
    // A text button, wider than tall, with words of its own: an app-store badge is someone else's shape, and a round
    // social icon or carousel arrow (often with hidden words) is an icon, not the brand's call to action.
    .filter((el) => { if (!seen(el)) return false; const s = getComputedStyle(el); const b = el.getBoundingClientRect(); return (filled(s) || lined(s)) && b.height >= 24 && b.height <= 80 && b.width >= b.height * 1.5 && b.width < vw * 0.6 && (el.innerText || '').trim().length > 0; })
    .map(item);
  // A form in a frame of the site's own is still the brand's form, so its fields are read through the frame. A frame
  // from another site (a forms service, often) cannot be read from here, so it is named instead of reporting nothing.
  const docs = [document];
  const frames = [];
  for (const f of document.querySelectorAll('iframe')) {
    const b = f.getBoundingClientRect();
    if (!seen(f) || b.width < 100 || b.height < 50) continue;
    // Known by its address, not by whether it can be read: another site's frame not loaded yet still holds a blank
    // page of this one's, which reads as an empty form of the brand's own.
    let origin = location.origin;
    try { if (f.src) origin = new URL(f.src, location.href).origin; } catch { origin = f.src; }
    if (origin === location.origin && f.contentDocument) docs.push(f.contentDocument);
    else frames.push({ origin, w: Math.round(b.width), h: Math.round(b.height) });
  }
  const control = docs.flatMap((d) => [...d.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=submit]):not([type=button]), select, textarea')])
    .filter(seen).map(item);
  const card = [...document.querySelectorAll('div, section, article, li, aside')]
    .filter((el) => { if (!seen(el)) return false; const s = getComputedStyle(el); const b = el.getBoundingClientRect(); return (filled(s) || lined(s)) && b.width >= 160 && b.width <= Math.min(900, vw * 0.8) && b.height >= 80 && words(el).length > 0; })
    .map(item);
  const frame = [...document.querySelectorAll('img, picture, video')]
    .filter((el) => { const b = el.getBoundingClientRect(); return seen(el) && b.width >= 80 && b.height >= 60; })
    .map((el) => { const own = radius(el); const wrap = el.parentElement && getComputedStyle(el.parentElement).overflow === 'hidden' ? radius(el.parentElement) : 0; return { ...item(el), radius: own || wrap }; });
  const bar = document.querySelector('header, [role=banner], nav, [role=navigation]');
  const shell = bar && seen(bar) ? (() => { const b = bar.getBoundingClientRect(); return { radius: radius(bar), w: Math.round(b.width), left: Math.round(b.left), top: Math.round(b.top), viewport: vw, tag: bar.tagName.toLowerCase() }; })() : null;
  // Where --follow goes next: the site's own pages its navigation links to, each once, never a file or the page itself.
  const here = location.href.split('#')[0];
  const links = [...new Set([...document.querySelectorAll('header a[href], nav a[href], [role=banner] a[href], [role=navigation] a[href]')]
    .map((a) => { try { const u = new URL(a.href); u.hash = ''; return u.origin === location.origin ? u.href : null; } catch { return null; } })
    .filter((u) => u && u !== here && !/\\.(pdf|jpe?g|png|gif|svg|webp|zip|mp4)$/i.test(u)))];
  return { url: location.href, press, control, card, frame, shell, frames, links };
})()`;

/** The value most of a family's elements share, and how many share it. */
function mode(items) {
  const counts = new Map();
  for (const i of items) counts.set(i.radius, (counts.get(i.radius) ?? 0) + 1);
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return ranked.length ? { value: ranked[0][0], count: ranked[0][1], others: ranked.slice(1).map(([value, count]) => ({ value, count })) } : null;
}

const NOUNS = { press: 'filled buttons and links', control: 'form fields', card: 'cards and panels', frame: 'photos' };
const px = (v) => (v === 'round' ? 'round' : `${v}px`);

/**
 * Raw measurements of one page, or of several, into suggested families, each with the source line product.json wants.
 * Across pages each family takes the radius most of all its elements share, and the source line shows each page's
 * own, since one site's buttons were 6px on its home page, 10px on its contact page and 7px on its locations page.
 * A press whose radius reaches half its height is a pill. Nothing is suggested for a family no page showed. The shell
 * is the first page's. `frames` lists the frames from other sites the pages showed, which nothing here can read.
 */
export function summarise(input, { date = new Date() } = {}) {
  const raws = (Array.isArray(input) ? input : [input]).filter(Boolean);
  const raw = raws[0];
  const many = raws.length > 1;
  const day = date.toISOString().slice(0, 10);
  const name = (v) => (v === 'pill' ? 'pill' : px(v));
  // A page of the first page's site by its path, so the spread reads "/contact/ 10px (3 of 4)".
  const where = (u) => { try { const x = new URL(u); return x.origin === new URL(raw.url).origin ? `${x.pathname}${x.search}` : u; } catch { return u; } };
  const families = {};
  for (const family of ['press', 'control', 'card', 'frame']) {
    const pages = raws.map((r) => ({ url: r.url, items: (r[family] ?? []).map((i) => (family === 'press' && (i.radius === 'round' || (typeof i.radius === 'number' && i.radius >= i.h / 2 - 1)) ? { ...i, radius: 'pill' } : i)) }));
    const items = pages.flatMap((p) => p.items);
    const m = mode(items);
    if (!m) continue;
    const rest = m.others.length ? `; the others ${m.others.map((o) => `${name(o.value)} x${o.count}`).join(', ')}` : '';
    const spread = many ? ` By page: ${pages.filter((p) => p.items.length).map((p) => { const own = mode(p.items); return `${where(p.url)} ${name(own.value)} (${own.count} of ${p.items.length})`; }).join(', ')}.` : '';
    families[family] = {
      px: m.value === 'round' ? 'pill' : m.value,
      source: `${many ? `${raw.url} and ${raws.length - 1} more ${raws.length === 2 ? 'page' : 'pages'}` : raw.url}, computed style on ${day}: ${m.count} of ${items.length} visible ${NOUNS[family]}${many ? ` across ${raws.length} pages` : ''} are ${m.value === 'pill' ? 'pills' : px(m.value)}${rest}.${spread}`,
    };
    if (families[family].px === 'pill' && family !== 'press') delete families[family];
  }
  const frames = raws.flatMap((r) => (r.frames ?? []).map((f) => ({ page: r.url, ...f })));
  let shell = null;
  if (raw?.shell) {
    const s = raw.shell;
    const edge = s.radius === 0 && s.left <= 2 && s.w >= s.viewport * 0.95;
    shell = {
      form: edge ? 'edge' : 'floating',
      source: `${raw.url}, computed style on ${day}: the site's ${s.tag} is ${s.w}px of a ${s.viewport}px window, ${s.left}px from its left edge, with ${px(s.radius)} corners.`,
    };
  }
  return { families, shell, frames };
}

/**
 * A small DevTools client over the installed Chrome: open each page in its own tab, wait for it to settle, run one
 * expression. One browser for every page. `follow` adds up to that many of the first page's navigation links, its
 * own site only, after the pages given. A page that fails is listed in `errors`, and the rest still run.
 */
export async function measurePages(urls, { follow = 0, chrome = findChrome(), settle = 2000, timeout = 45000, width = 1440, height = 1000 } = {}) {
  if (!chrome) throw new Error('No Chrome found. Install Google Chrome (or Chromium) to measure a live site; nothing else is needed.');
  if (typeof WebSocket !== 'function') throw new Error('This Node has no WebSocket. Use Node 22 or later.');
  const profile = await mkdtemp(path.join(tmpdir(), 'brandi-measure-'));
  const proc = spawn(chrome, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', `--window-size=${width},${height}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
  const kill = async () => { proc.kill('SIGKILL'); await rm(profile, { recursive: true, force: true }).catch(() => {}); };
  try {
    const endpoint = await new Promise((resolve, reject) => {
      let buf = '';
      const timer = setTimeout(() => reject(new Error('Chrome did not open its DevTools port')), 15000);
      proc.stderr.on('data', (d) => { buf += d; const m = /DevTools listening on (ws:\/\/\S+)/.exec(buf); if (m) { clearTimeout(timer); resolve(m[1]); } });
      proc.on('exit', () => reject(new Error(`Chrome exited before it was ready: ${buf.slice(-300)}`)));
    });
    const ws = new WebSocket(endpoint);
    await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = () => reject(new Error('Could not reach Chrome over DevTools')); });
    let id = 0;
    const waiting = new Map();
    const events = [];
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id && waiting.has(msg.id)) { const { resolve, reject } = waiting.get(msg.id); waiting.delete(msg.id); msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result); }
      else if (msg.method) events.push(msg);
    };
    const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => { id += 1; waiting.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) })); });
    const measure = async (url) => {
      const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
      try {
        const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
        await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false }, sessionId);
        await send('Page.enable', {}, sessionId);
        await send('Page.navigate', { url }, sessionId);
        const started = Date.now();
        while (!events.some((e) => e.method === 'Page.loadEventFired' && e.sessionId === sessionId)) {
          if (Date.now() - started > timeout) throw new Error(`${url} did not finish loading in ${timeout / 1000}s`);
          await new Promise((r) => setTimeout(r, 100));
        }
        await new Promise((r) => setTimeout(r, settle));
        const { result, exceptionDetails } = await send('Runtime.evaluate', { expression: IN_PAGE, returnByValue: true }, sessionId);
        if (exceptionDetails) throw new Error(`measuring ${url} failed: ${exceptionDetails.text}`);
        return result.value;
      } finally {
        await send('Target.closeTarget', { targetId }).catch(() => {});
      }
    };
    // Written the way the page's links are, so a followed link never measures a page given already.
    const queue = [...new Set(urls.map((u) => { try { const x = new URL(u); x.hash = ''; return x.href; } catch { return u; } }))];
    const pages = [];
    const errors = [];
    for (let i = 0; i < queue.length; i++) {
      try {
        const raw = await measure(queue[i]);
        pages.push(raw);
        if (i === 0 && follow > 0) queue.push(...(raw.links ?? []).filter((l) => !queue.includes(l)).slice(0, follow));
      } catch (e) {
        errors.push({ url: queue[i], error: e.message });
      }
    }
    ws.close();
    return { pages, errors };
  } finally {
    await kill();
  }
}

/** One page, measured as measurePages measures each. Throws when it could not be measured. */
export async function measureSite(url, options = {}) {
  const { pages, errors } = await measurePages([url], options);
  if (!pages.length) throw new Error(errors[0]?.error ?? `${url} could not be measured`);
  return pages[0];
}

export default { measurePages, measureSite, summarise, IN_PAGE };
