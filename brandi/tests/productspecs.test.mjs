import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, mkdir, writeFile, rm, cp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as S from '../scripts/productspecs.mjs';

const FIXTURE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'platform');
const text = await readFile(path.join(FIXTURE, 'ios-ipados', 'Button.md'), 'utf8');
const sources = S.loadSources();

describe('the source registry', () => {
  test('every key the platform reference lists, with its URL and marker', () => {
    assert.equal(sources.size, 110);
    assert.equal(sources.get('APL-2').url, 'https://developer.apple.com/design/human-interface-guidelines/buttons');
    assert.equal(sources.get('WEB-1').urls.length, 2, 'a row naming two pages keeps both');
    for (const prefix of ['APL', 'MAT', 'AND', 'WIN', 'FLU', 'WEB']) assert.ok([...sources.keys()].some((k) => k.startsWith(prefix)), prefix);
  });
});

describe('a platform spec', () => {
  const spec = S.parseSpec(text, 'ios-ipados/Button.md');

  test('reads its stamp without a YAML library, comments and all', () => {
    assert.equal(spec.stamp.component, 'Button');
    assert.equal(spec.stamp.platform, 'ios-ipados');
    assert.equal(spec.stamp.status, 'current');
    assert.equal(spec.stamp.sources.length, 4);
    assert.deepEqual(spec.stamp.sources[1], { key: 'APL-2', url: 'https://developer.apple.com/design/human-interface-guidelines/buttons', marker: '2025-12-16', read: '2026-10-27' });
    assert.equal(Object.keys(spec.fields).length, 13);
  });

  test('the reference\'s worked example is complete', () => {
    assert.deepEqual(S.checkSpec(spec, { sources, components: ['Button'] }), []);
  });

  test('a spec that drops a field, cites nothing, cites an unstamped key or names a stranger is refused', () => {
    const missing = S.parseSpec(text.replace(/^\| Haptics \|.*\n/m, ''), 'x.md');
    assert.ok(S.checkSpec(missing, { sources }).some((p) => /no "Haptics" field/.test(p)));
    const uncited = S.parseSpec(text.replace('| Motion | Under Reduce Motion, cut automatic animation and swap slides for fades [APL-1]. |', '| Motion | Fades. |'), 'x.md');
    assert.ok(S.checkSpec(uncited, { sources }).some((p) => /"Motion" cites no source key/.test(p)));
    const unstamped = S.parseSpec(text.replace('[APL-1]. |\n| Accessibility', '[APL-9]. |\n| Accessibility'), 'x.md');
    assert.ok(S.checkSpec(unstamped, { sources }).some((p) => /cites APL-9, which the stamp does not list/.test(p)));
    const stranger = S.parseSpec(text.replace('component: Button', 'component: Gizmo'), 'x.md');
    assert.ok(S.checkSpec(stranger, { sources, components: ['Button'] }).some((p) => /Gizmo is not a component/.test(p)));
    const badPlatform = S.parseSpec(text.replace('platform: ios-ipados', 'platform: ios'), 'x.md');
    assert.ok(S.checkSpec(badPlatform, { sources }).some((p) => /platform must be one of/.test(p)));
    const notInRegistry = S.parseSpec(text.replace(/key: APL-4/, 'key: APL-999'), 'x.md');
    assert.ok(S.checkSpec(notInRegistry, { sources }).some((p) => /APL-999 is not in the reference's registry/.test(p)));
  });

  test('coverage names every component and platform pair without a spec', () => {
    const cov = S.coverage([spec], { components: ['Button', 'Dialog'], platforms: ['web', 'ios-ipados'] });
    assert.equal(cov.total, 4);
    assert.equal(cov.present, 1);
    assert.deepEqual(cov.missing.map((m) => `${m.component}|${m.platform}`).sort(), ['Button|web', 'Dialog|ios-ipados', 'Dialog|web']);
  });
});

describe('the monthly standards check', () => {
  const spec = { ...S.parseSpec(text, 'ios-ipados/Button.md') };

  test('a moved marker names the specs it touches; an unfetched one is never called unchanged', () => {
    const result = S.compareMarkers([spec], { 'APL-2': { marker: '2026-11-02', level: 'Review', note: 'Updated guidance for Liquid Glass.' }, 'APL-3': { marker: '2025-12-16' }, 'APL-4': { error: 'answered 503' } });
    assert.deepEqual(result.changes.map((c) => c.key), ['APL-2']);
    assert.deepEqual(result.changes[0].specs, ['Button on ios-ipados']);
    assert.deepEqual(result.unchanged, ['APL-3']);
    assert.deepEqual(result.notFetched.map((n) => n.key).sort(), ['APL-1', 'APL-4']);
    const report = S.standardsReport(result, { date: '2026-11-27', sources });
    assert.match(report, /^# Standards check, 2026-11-27\n\nVerdict: 1 changes\. 0 must change, 1 review, 0 log only\. 2 sources not fetched\./);
    assert.match(report, /\| APL-2 \| 2025-12-16 \| 2026-11-02 \| Review \|/);
    assert.match(report, /### APL-2 HIG: Buttons \(Review\)\n- What changed: Updated guidance for Liquid Glass\.\n- Specs affected: Button on ios-ipados/);
    assert.match(report, /- APL-4: answered 503\. Unchecked, not unchanged\./);
  });

  test('markers are compared by what they assert, so a first run does not mark every spec stale', () => {
    const same = [
      ['Recommendation 2024-12-12, errata 2026-10-01', 'W3C Recommendation 12 December 2024; errata 2026-10-01'],
      ['iOS 26.0+, macOS 26.0+', 'iOS 26.0+, iPadOS 26.0+, Mac Catalyst 26.0+, macOS 26.0+'],
      ['updated 2026-10-23', '2026-10-23'],
      ['2026-09-09, new page', '2026-09-09'],
    ];
    const moved = [
      ['Recommendation 2024-12-12, errata 2026-10-01', 'W3C Recommendation 12 December 2024; errata 2027-02-01'],
      ['iOS 26.0+, macOS 26.0+', 'iOS 26.0+, macOS 26.1+'],
      ['iOS 13.0+, macOS 10.15+', 'iOS 13.0+, macOS 10.15+ deprecated 27.0'],
      ['`ms.date` 2026-10-07', '2026-11-02'],
    ];
    for (const [was, now] of same) assert.equal(S.markerMoved(was, now).verdict, 'same', `${was} | ${now}`);
    for (const [was, now] of moved) assert.equal(S.markerMoved(was, now).verdict, 'moved', `${was} | ${now}`);
  });

  test('a marker with nothing to compare is unchecked: never unchanged, never stale', () => {
    const undated = S.markerMoved('undated', 'text 1a2b3c4d5e6f');
    assert.equal(undated.verdict, 'unchecked');
    assert.match(undated.reason, /put that in the registry/);
    assert.equal(S.markerMoved('2025-06-09', 'text 1a2b3c4d5e6f').verdict, 'unchecked', 'a page that stopped showing a date');
    const apg = { ...spec, stamp: { ...spec.stamp, sources: [{ key: 'WEB-3', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/button/', marker: 'undated' }] } };
    const result = S.compareMarkers([apg], { 'WEB-3': { marker: 'text 1a2b3c4d5e6f' } });
    assert.deepEqual(result.changes, []);
    assert.deepEqual(result.unchanged, []);
    assert.deepEqual(result.notFetched.map((n) => n.key), ['WEB-3']);
  });

  test('marking a spec stale changes its status and nothing else', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-specs-'));
    await cp(FIXTURE, dir, { recursive: true });
    const specs = S.loadSpecs(dir);
    const result = S.compareMarkers(specs, { 'APL-2': { marker: '2026-11-02' } });
    assert.deepEqual(S.writeStale(specs, result.changes, '2026-11-27'), [path.join('ios-ipados', 'Button.md')]);
    const after = await readFile(path.join(dir, 'ios-ipados', 'Button.md'), 'utf8');
    assert.match(after, /^status: stale since 2026-11-27$/m);
    assert.equal(after.replace('status: stale since 2026-11-27', 'status: current'), text);
    await rm(dir, { recursive: true, force: true });
  });

  test('markers come from where each owner publishes them; Material is left to a browser', async () => {
    const stub = (body, ok = true) => async () => ({ ok, status: ok ? 200 : 500, text: async () => body, json: async () => JSON.parse(body) });
    const hig = await S.fetchMarker('APL-2', 'https://developer.apple.com/design/human-interface-guidelines/buttons', { fetchImpl: stub('{"changes":[{"date":"June 9, 2025"},{"date":"December 16, 2025"}]}') });
    assert.deepEqual(hig, { marker: '2025-12-16' });
    const learn = await S.fetchMarker('WIN-5', 'https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/typography', { fetchImpl: stub('<p>Last updated on 04/14/2026</p>') });
    assert.deepEqual(learn, { marker: '2026-04-14' });
    // The served page carries the date in updated_at; ms.date is years older on some pages.
    const served = await S.fetchMarker('WIN-12', 'https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/geometry', { fetchImpl: stub('<meta name="ms.date" content="2021-06-24T00:00:00Z"><meta name="updated_at" content="2026-02-19T16:38:00Z">') });
    assert.deepEqual(served, { marker: '2026-02-19' });
    const material = await S.fetchMarker('MAT-5', 'https://m3.material.io/components/buttons/overview', { fetchImpl: stub('') });
    assert.match(material.error, /renders in a browser/);
    const down = await S.fetchMarker('AND-1', 'https://developer.android.com/x', { fetchImpl: stub('', false) });
    assert.match(down.error, /answered 500/);
  });
});
