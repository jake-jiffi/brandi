/**
 * Brandi product layer: platform specs and the monthly standards check.
 *
 * Every component gets one spec per platform it can ship on (web, iOS and iPadOS, macOS, Android,
 * Windows), written against that platform's own guidance and stamped with the markers it was checked
 * against (11-platform-layer.md). Native code is generated from a spec on demand and never kept, so
 * the spec and its stamp are what persist, and a stale stamp blocks generation.
 *
 * This file reads and checks specs, reports coverage, and runs the standards check: it compares every
 * stamped marker with a fresh one, marks the specs a moved marker touches as stale, and writes the
 * report the reference describes. Sources the plain web can serve are fetched here; the rest (the
 * Material site needs a headless browser) are read by the agent and passed in as a markers file. A
 * source nobody fetched is "not fetched", never "unchanged".
 */

import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PLATFORMS = Object.freeze(['web', 'ios-ipados', 'macos', 'android', 'windows']);
export const FIELDS = Object.freeze([
  'Native control', 'Target and spacing', 'Type', 'Colour and theme', 'States', 'Motion', 'Accessibility API',
  'Navigation placement', 'Keyboard, pointer, trackpad', 'Haptics', 'Brand may change', 'Platform owns', 'Not confirmed',
]);
export const REFERENCE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'skills', 'product-system', 'references', '11-platform-layer.md');

const KEY = /\b(APL|MAT|AND|WIN|FLU|WEB)-\d+\b/g;

/** The source registry: every key the reference lists, with its page, URL and marker on the day it was read. */
export function loadSources(file = REFERENCE) {
  const sources = new Map();
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = /^\| ((?:APL|MAT|AND|WIN|FLU|WEB)-\d+) \| ([^|]+) \| ([^|]+) \| ([^|]*) \|$/.exec(line.trim());
    if (!m) continue;
    // Some rows name more than one page (a spec and its errata); the first is the one a stamp cites.
    const urls = m[3].match(/https?:\/\/[^\s,`)]+/g) ?? [];
    if (urls.length) sources.set(m[1], { page: m[2].trim(), url: urls[0], urls, marker: m[4].trim() });
  }
  return sources;
}

/** The stamp: the small YAML block the reference shows, read without a YAML library. */
export function parseStamp(yaml) {
  const stamp = { sources: [] };
  let current = null;
  for (const raw of yaml.split('\n')) {
    const line = raw.replace(/\s+#.*$/, '');
    if (!line.trim()) continue;
    let m;
    if ((m = /^\s*-\s+([a-z_]+):\s*(.*)$/.exec(line))) {
      current = { [m[1]]: m[2].trim() };
      stamp.sources.push(current);
    } else if ((m = /^\s{2,}([a-z_]+):\s*(.*)$/.exec(line)) && current) {
      current[m[1]] = m[2].trim();
    } else if ((m = /^([a-z_]+):\s*(.*)$/.exec(line))) {
      current = null;
      if (m[1] !== 'sources') stamp[m[1]] = m[2].trim();
    }
  }
  return stamp;
}

/** A spec file: a title, the stamp in a yaml fence, and the fields table. */
export function parseSpec(text, file = 'spec') {
  const stampMatch = /```yaml\n([\s\S]*?)```/.exec(text);
  const stamp = stampMatch ? parseStamp(stampMatch[1]) : null;
  const fields = {};
  for (const line of text.split('\n')) {
    const m = /^\| ([^|]+) \| (.+) \|$/.exec(line.trim());
    if (m && FIELDS.includes(m[1].trim())) fields[m[1].trim()] = m[2].trim();
  }
  return { file, title: /^# (.+)$/m.exec(text)?.[1] ?? null, stamp, fields };
}

/** What a spec lacks, as sentences. Empty means the spec is complete and every key resolves. */
export function checkSpec(spec, { sources = loadSources(), components = null } = {}) {
  const problems = [];
  const at = spec.file;
  const s = spec.stamp;
  if (!s) return [`${at}: no stamp (a yaml block with component, platform, checked_against, checked_on, status and sources)`];
  if (!s.component) problems.push(`${at}: the stamp names no component`);
  if (components && s.component && !components.includes(s.component)) problems.push(`${at}: ${s.component} is not a component in the system`);
  if (!PLATFORMS.includes(s.platform)) problems.push(`${at}: platform must be one of ${PLATFORMS.join(', ')}`);
  if (!s.checked_against) problems.push(`${at}: checked_against names no release`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s.checked_on ?? '')) problems.push(`${at}: checked_on must be a date (YYYY-MM-DD)`);
  if (!/^(current|stale since \d{4}-\d{2}-\d{2})$/.test(s.status ?? '')) problems.push(`${at}: status is "current" or "stale since YYYY-MM-DD"`);
  if (!s.sources.length) problems.push(`${at}: the stamp lists no sources`);
  for (const src of s.sources) {
    if (!src.key || !src.url || !src.marker || !src.read) problems.push(`${at}: source ${src.key ?? '?'} needs key, url, marker and read`);
    if (src.key && !sources.has(src.key)) problems.push(`${at}: source ${src.key} is not in the reference's registry`);
  }
  const stamped = new Set(s.sources.map((x) => x.key));
  for (const field of FIELDS) {
    const value = spec.fields[field];
    if (value === undefined) { problems.push(`${at}: no "${field}" field`); continue; }
    const cited = value.match(KEY) ?? [];
    const settled = /not confirmed|^none\b|^no\b/i.test(value);
    if (!cited.length && !settled && field !== 'Not confirmed') problems.push(`${at}: "${field}" cites no source key`);
    for (const k of cited) if (!stamped.has(k)) problems.push(`${at}: "${field}" cites ${k}, which the stamp does not list`);
  }
  return problems;
}

/** Every spec under a platform folder. */
export function loadSpecs(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const platform of readdirSync(dir).filter((d) => PLATFORMS.includes(d)).sort()) {
    for (const f of readdirSync(path.join(dir, platform)).filter((x) => x.endsWith('.md')).sort()) {
      const file = path.join(dir, platform, f);
      out.push({ ...parseSpec(readFileSync(file, 'utf8'), path.relative(dir, file)), path: file });
    }
  }
  return out;
}

/** Which component and platform pairs have no spec yet. */
export function coverage(specs, { components, platforms }) {
  const have = new Set(specs.map((s) => `${s.stamp?.component}|${s.stamp?.platform}`));
  const missing = [];
  for (const p of platforms) for (const c of components) if (!have.has(`${c}|${p}`)) missing.push({ component: c, platform: p });
  return { total: components.length * platforms.length, present: components.length * platforms.length - missing.length, missing };
}

/**
 * Compare every stamped marker with a fresh one. `fresh` maps a key to { marker } or { error };
 * a key with neither was not fetched. Returns the moved markers with the specs each touches.
 */
export function compareMarkers(specs, fresh) {
  const stampedBy = new Map();
  for (const spec of specs) {
    for (const src of spec.stamp?.sources ?? []) {
      const entry = stampedBy.get(src.key) ?? { was: new Set(), specs: [] };
      entry.was.add(src.marker);
      entry.specs.push(`${spec.stamp.component} on ${spec.stamp.platform}`);
      stampedBy.set(src.key, entry);
    }
  }
  const changes = [];
  const notFetched = [];
  const unchanged = [];
  for (const [key, entry] of [...stampedBy].sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true }))) {
    const now = fresh[key];
    if (!now || now.error || !now.marker) { notFetched.push({ key, reason: now?.error ?? 'not fetched this run' }); continue; }
    const verdicts = [...entry.was].map((w) => markerMoved(w, now.marker));
    if (verdicts.some((v) => v.verdict === 'moved')) changes.push({ key, was: [...entry.was].join(', '), now: now.marker, specs: [...new Set(entry.specs)].sort(), level: now.level ?? null, note: now.note ?? null });
    else if (verdicts.every((v) => v.verdict === 'same')) unchanged.push(key);
    else notFetched.push({ key, reason: verdicts.find((v) => v.verdict === 'unchecked').reason });
  }
  return { changes, notFetched, unchanged };
}

/** The report, in the shape the reference sets: a verdict, the markers, the changes, what was not fetched. */
export function standardsReport(result, { date, sources = loadSources() } = {}) {
  const count = (lvl) => result.changes.filter((c) => c.level === lvl).length;
  const open = result.changes.filter((c) => !c.level).length;
  const lines = [
    `# Standards check, ${date}`,
    '',
    `Verdict: ${result.changes.length} changes. ${count('Must change')} must change, ${count('Review')} review, ${count('Log only')} log only${open ? `, ${open} still to classify` : ''}. ${result.notFetched.length} sources not fetched.`,
    '',
    '## Markers',
    '| Key | Was | Now | Level |',
    '|---|---|---|---|',
    ...result.changes.map((c) => `| ${c.key} | ${c.was} | ${c.now} | ${c.level ?? 'to classify'} |`),
    '',
    '## Changes',
  ];
  for (const c of result.changes) {
    lines.push(`### ${c.key} ${sources.get(c.key)?.page ?? ''} (${c.level ?? 'to classify'})`.replace(/\s+\(/, ' ('),
      `- What changed: ${c.note ?? '<quote the owner\'s own words>'}`,
      `- Specs affected: ${c.specs.join('; ')}`,
      '- What it means for the system: <tokens that move, components whose behaviour changes, decisions needed>',
      `- Action: review the specs above; regenerate no native code from them until the review clears.`,
      '');
  }
  lines.push('## Not fetched');
  for (const n of result.notFetched) lines.push(`- ${n.key}: ${n.reason}. Unchecked, not unchanged.`);
  if (!result.notFetched.length) lines.push('- None.');
  return `${lines.join('\n')}\n`;
}

/** Set a spec's status to stale, keeping everything else exactly as it was. */
export function markStale(text, date) {
  return text.replace(/^status:\s*.*$/m, `status: stale since ${date}`);
}

// --- Fetching the markers the plain web serves -----------------------------------------------

const hash = (text) => `text ${createHash('sha256').update(text.replace(/\s+/g, ' ').trim()).digest('hex').slice(0, 12)}`;
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

/** A published date as a calendar day, read the same in every time zone (a local parse moved days). */
export function toDay(text) {
  const s = String(text).trim();
  let m;
  if ((m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s))) return `${m[1]}-${m[2]}-${m[3]}`;
  if ((m = /^([A-Za-z]+) (\d{1,2}), (\d{4})$/.exec(s)) && MONTHS.includes(m[1].toLowerCase())) {
    return `${m[3]}-${String(MONTHS.indexOf(m[1].toLowerCase()) + 1).padStart(2, '0')}-${m[2].padStart(2, '0')}`;
  }
  if ((m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s))) return `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
  return null;
}
const DATE = /(20\d{2}-\d{2}-\d{2})/;

const MONTH = '(January|February|March|April|May|June|July|August|September|October|November|December)';
const iso = (y, month, d) => `${y}-${String(MONTHS.indexOf(month.toLowerCase()) + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
/** Every date a marker names, as YYYY-MM-DD, oldest first: 2024-12-12, 12 December 2024 and December 12, 2024 alike. */
export function datesIn(text) {
  const s = String(text ?? '');
  const out = [...s.matchAll(/\b(20\d{2})-(\d{2})-(\d{2})\b/g)].map((m) => `${m[1]}-${m[2]}-${m[3]}`);
  for (const m of s.matchAll(new RegExp(`\\b(\\d{1,2}) ${MONTH} (20\\d{2})\\b`, 'g'))) out.push(iso(m[3], m[2], m[1]));
  for (const m of s.matchAll(new RegExp(`\\b${MONTH} (\\d{1,2}), (20\\d{2})\\b`, 'g'))) out.push(iso(m[3], m[1], m[2]));
  return [...new Set(out)].sort();
}

const availability = (s) => new Map([...String(s).matchAll(/\b(iOS|iPadOS|Mac Catalyst|macOS|tvOS|visionOS|watchOS) (\d+(?:\.\d+)*)\+/g)].map((m) => [m[1], m[2]]));

/**
 * Has a source moved since a spec recorded it? A marker is written for people ("Recommendation
 * 2024-12-12, errata 2026-10-01", "iOS 13.0+, macOS 10.15+") and read by machine (a status line, every
 * platform an API lists), so the two are compared by what they assert, never as strings. A string
 * comparison marked every spec stale on the first run.
 *
 * Dates: moved when the page now names a date later than any on record. Availability: moved when a
 * platform version on record is gone or different, or the API is now deprecated. Nothing comparable
 * on record ("undated", "macOS"), or a page that no longer shows a date: unchecked, with the reason.
 */
export function markerMoved(recorded, fetched) {
  const r = String(recorded ?? '').trim();
  const f = String(fetched ?? '').trim();
  if (r === f) return { verdict: 'same' };
  const ra = availability(r);
  if (ra.size) {
    const fa = availability(f);
    if (!fa.size) return { verdict: 'unchecked', reason: `the page lists no platform versions now (it read "${f}"): read it by hand` };
    if (/deprecated/i.test(f) && !/deprecated/i.test(r)) return { verdict: 'moved' };
    return [...ra].every(([platform, version]) => fa.get(platform) === version) ? { verdict: 'same' } : { verdict: 'moved' };
  }
  const rd = datesIn(r);
  if (rd.length) {
    const fd = datesIn(f);
    if (!fd.length) return { verdict: 'unchecked', reason: `the page shows no date now (it read "${f}"): read it by hand` };
    return fd.at(-1) > rd.at(-1) ? { verdict: 'moved' } : { verdict: 'same' };
  }
  return { verdict: 'unchecked', reason: `no date or version on record ("${r}"), so there is nothing to compare. This run read "${f}": put that in the registry to track the page` };
}

/**
 * Read one source's marker the way the reference says its owner publishes it. Returns { marker }
 * or { error }. Material's site needs a headless browser, so it is left to the agent.
 */
export async function fetchMarker(key, url, { fetchImpl = globalThis.fetch } = {}) {
  try {
    if (/^MAT-/.test(key)) return { error: 'the Material site renders in a browser: read it with one and pass the marker in' };
    if (/developer\.apple\.com\/design\/human-interface-guidelines\//.test(url)) {
      const page = url.split('/human-interface-guidelines/')[1].replace(/\/$/, '');
      const res = await fetchImpl(`https://developer.apple.com/tutorials/data/design/human-interface-guidelines/${page}.json`);
      if (!res.ok) return { error: `HIG JSON answered ${res.status}` };
      const text = await res.text();
      const days = [...text.matchAll(/"(?:date|text)"\s*:\s*"([A-Z][a-z]+ \d{1,2}, 20\d{2}|20\d{2}-\d{2}-\d{2})"/g)].map((m) => toDay(m[1])).filter(Boolean).sort();
      return days.length ? { marker: days.at(-1) } : { marker: hash(text) };
    }
    if (/developer\.apple\.com\/documentation\//.test(url)) {
      const doc = url.split('/documentation/')[1].replace(/\/$/, '');
      const res = await fetchImpl(`https://developer.apple.com/tutorials/data/documentation/${doc}.json`);
      if (!res.ok) return { error: `API JSON answered ${res.status}` };
      const data = await res.json();
      const platforms = (data.metadata?.platforms ?? []).map((p) => `${p.name} ${p.introducedAt ?? '?'}+${p.deprecatedAt ? ` deprecated ${p.deprecatedAt}` : ''}`);
      return platforms.length ? { marker: platforms.join(', ') } : { error: 'no platforms in the API JSON' };
    }
    const res = await fetchImpl(url, { redirect: 'follow' });
    if (!res.ok) return { error: `answered ${res.status}` };
    const html = await res.text();
    if (/learn\.microsoft\.com/.test(url)) {
      const updated = /Last updated on\s*([0-9/]+)/i.exec(html)?.[1] ?? /<meta name="ms\.date" content="([^"]+)"/i.exec(html)?.[1];
      return updated && toDay(updated) ? { marker: toDay(updated) } : { error: 'no "Last updated on" or ms.date on the page' };
    }
    if (/developer\.android\.com/.test(url)) {
      const updated = /Last updated ([0-9]{4}-[0-9]{2}-[0-9]{2})/i.exec(html)?.[1];
      return updated ? { marker: updated } : { marker: hash(html.replace(/<script[\s\S]*?<\/script>/g, '')) };
    }
    if (/w3\.org/.test(url)) {
      const status = /<p id="w3c-state"[^>]*>([\s\S]*?)<\/p>/i.exec(html)?.[1] ?? /<h2[^>]*>(W3C [^<]+)<\/h2>/i.exec(html)?.[1];
      return status ? { marker: status.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() } : { marker: hash(html) };
    }
    const main = /<main[\s\S]*?<\/main>/i.exec(html)?.[0] ?? html;
    return { marker: DATE.exec(main)?.[1] ? `${DATE.exec(main)[1]}` : hash(main.replace(/<[^>]+>/g, ' ')) };
  } catch (e) {
    return { error: String(e.message ?? e) };
  }
}

export function writeStale(specs, changes, date) {
  const touched = new Set(changes.flatMap((c) => c.specs));
  const written = [];
  for (const spec of specs) {
    if (!touched.has(`${spec.stamp?.component} on ${spec.stamp?.platform}`)) continue;
    writeFileSync(spec.path, markStale(readFileSync(spec.path, 'utf8'), date));
    written.push(spec.file);
  }
  return written;
}

export default { PLATFORMS, FIELDS, loadSources, parseStamp, parseSpec, checkSpec, loadSpecs, coverage, compareMarkers, standardsReport, markStale, fetchMarker, writeStale };
