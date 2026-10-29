/**
 * Brandi product layer: the brand's faces as files, fetched from Google Fonts where it hosts them.
 *
 * The system ships its faces as files (02-brand-to-product.md, Type), so previews and the canvas never depend on a
 * CDN. A brand whose faces Google hosts has no files to hand over, and one run fetched the latin subsets by hand out
 * of Google's stylesheet. This does that: for each face the product's type names with no file in product/fonts/, the
 * woff2 Google serves a modern browser (the face's whole weight range where it has a weight axis, else the weights
 * the type sets), and the licence file Google's family download carries, with where it came from. Built-in fetch only.
 */

import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

/** Where Google Fonts answers. Overridable, so the tests serve fixtures from 127.0.0.1 and never touch the network. */
export const GOOGLE_FONTS = Object.freeze({ css: 'https://fonts.googleapis.com', site: 'https://fonts.google.com' });

// css2 answers a modern browser with woff2, one file per subset. An old one is answered with something else.
const MODERN_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// The system faces a stack falls back to, which nobody fetches: the list productdocs.mjs and productstarter.mjs hold.
const GENERIC = /^(ui-[a-z-]+|system-ui|-apple-system|serif|sans-serif|monospace|Georgia|"Times New Roman"|Arial|"Segoe UI"|Menlo|Consolas|"SF Mono")$/i;

const slugOf = (family) => family.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const compact = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const query = (family) => encodeURIComponent(family).replace(/%20/g, '+');
const ascending = (set) => [...set].sort((a, b) => a - b);

/**
 * The faces a product's type names: each role's first face, unless it is a system one, with the weights and italics
 * the type's styles set in it, and the rest of its stack, which stands in while the face has no file.
 */
export function typeFaces(tokens) {
  const faces = new Map();
  for (const role of ['display', 'sans', 'mono']) {
    const [first, ...rest] = String(tokens.type?.families?.[role] ?? '').split(',').map((s) => s.trim());
    if (!first || GENERIC.test(first)) continue;
    const family = first.replace(/^["']|["']$/g, '');
    const face = faces.get(family) ?? { family, weights: new Set(), italics: new Set(), fallback: rest.join(', ') };
    for (const g of tokens.type?.groups ?? []) {
      for (const s of g.styles) if ((s.family ?? g.family) === role) (s.fontStyle === 'italic' ? face.italics : face.weights).add(Number(s.fontWeight ?? 400));
    }
    faces.set(family, face);
  }
  return [...faces.values()].map((f) => ({ family: f.family, weights: f.weights.size ? ascending(f.weights) : [400], italics: ascending(f.italics), fallback: f.fallback }));
}

/**
 * What to ask css2 for, from the face's metadata. A weight axis is asked for whole, held to 100 to 900, the range a
 * tokens weight is written in. Otherwise only the weights the type sets that the face has, since Google refuses the
 * whole stylesheet when one weight asked is missing; `missing` names the rest, and with none of its weights used the
 * face's nearest is taken. Italics only where the type sets them.
 */
export function faceRequest({ weights, italics }, meta) {
  const has = Object.keys(meta.fonts ?? {});
  const axis = (meta.axes ?? []).find((a) => a.tag === 'wght' && a.max > a.min);
  if (axis) {
    const range = `${Math.max(100, Math.round(axis.min))}..${Math.min(900, Math.round(axis.max))}`;
    const italic = italics.length > 0 && has.some((k) => k.endsWith('i'));
    return { spec: italic ? `ital,wght@0,${range};1,${range}` : `wght@${range}`, variable: true, missing: italics.length && !italic ? italics.map((w) => `${w} italic`) : [] };
  }
  const upright = has.filter((k) => /^\d+$/.test(k)).map(Number);
  let take = weights.filter((w) => upright.includes(w));
  if (!take.length) take = [upright.sort((a, b) => Math.abs(a - weights[0]) - Math.abs(b - weights[0]))[0] ?? 400];
  const slanted = italics.filter((w) => has.includes(`${w}i`));
  const missing = [...weights.filter((w) => !upright.includes(w)).map(String), ...italics.filter((w) => !slanted.includes(w)).map((w) => `${w} italic`)];
  const spec = slanted.length ? `ital,wght@${[...take.map((w) => `0,${w}`), ...slanted.map((w) => `1,${w}`)].join(';')}` : `wght@${take.join(';')}`;
  return { spec, variable: false, missing };
}

/** Each @font-face in a css2 answer, under the subset comment Google writes above it. */
export function parseFaceCss(css) {
  return [...String(css).matchAll(/\/\*\s*([^*]+?)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g)].map(([, subset, body]) => ({
    subset,
    style: /font-style:\s*([a-z]+)/.exec(body)?.[1] ?? 'normal',
    weight: /font-weight:\s*([\d ]+?)\s*;/.exec(body)?.[1] ?? '400',
    url: /src:\s*url\(([^)]+)\)/.exec(body)?.[1] ?? null,
  })).filter((b) => b.url);
}

/** The licence a face's licence file grants, read from its text. */
export function licenceName(filename, text) {
  if (/SIL Open Font License,? Version 1\.1/i.test(text)) return 'SIL Open Font License 1.1';
  if (/Apache License\s+Version 2\.0/i.test(text)) return 'Apache License 2.0';
  if (/Ubuntu Font Licen[cs]e,? Version 1\.0/i.test(text)) return 'Ubuntu Font Licence 1.0';
  return `the terms in ${filename}`;
}

// Google prefixes its JSON with )]}' so it cannot be run as a script.
const readJson = async (res) => JSON.parse((await res.text()).replace(/^\)\]\}'\s*/, ''));

/** A failure to reach Google at all (no network, refused, timed out), as against an answer Google gave. */
const unreachable = (e) => (e.name === 'TypeError' && e.message === 'fetch failed') || e.name === 'TimeoutError' || e.name === 'AbortError';

/**
 * Fetch each face the type names that has no file in `productDir`/fonts. A face counts as having one when product.json
 * lists it (`tokens.type.fonts`) with its files there, or a font file there starts with its name. Returns
 * `fetched` (each face's fonts entries, with its licence), `present`, `notHosted` (Google does not host it: the brand
 * supplies the files and licence), `offline` (Google could not be reached: the addresses to fetch it by hand) and
 * `failed`. Nothing of a face is written until all of it has arrived. Other subsets than latin are listed first and
 * latin last, so the browser, which tries the last face declared first, finds the common letters there.
 */
export async function fetchFonts({ tokens, productDir, subsets = ['latin'], bases = GOOGLE_FONTS, date = new Date(), timeout = 30000 }) {
  const fontsDir = path.join(productDir, 'fonts');
  const files = existsSync(fontsDir) ? await readdir(fontsDir) : [];
  const listed = tokens.type?.fonts ?? [];
  const day = date.toISOString().slice(0, 10);
  const get = (url) => fetch(url, { headers: { 'User-Agent': MODERN_UA }, signal: AbortSignal.timeout(timeout) });
  const rank = (s) => (s === 'latin' ? subsets.length : subsets.indexOf(s));
  const out = { fetched: [], present: [], notHosted: [], offline: [], failed: [] };
  const faces = typeFaces(tokens);
  // A file not listed is the face its name begins with, the longest that fits: AcmeGroteskWide.otf is Acme Grotesk
  // Wide's, not Acme Grotesk's. A file listed under fonts is its own family's.
  const ownerOf = (file) => faces.map((f) => f.family).filter((name) => compact(file).startsWith(compact(name))).sort((a, b) => b.length - a.length)[0];
  for (const face of faces) {
    const { family } = face;
    const own = listed.filter((f) => f.family === family);
    if (own.length && own.every((f) => files.includes(path.basename(f.file)))) {
      out.present.push({ family, why: 'listed under fonts, with its file' });
      continue;
    }
    const loose = files.find((f) => /\.(woff2?|ttf|otf)$/i.test(f) && !listed.some((l) => path.basename(l.file) === f) && ownerOf(f) === family);
    if (loose) {
      out.present.push({ family, why: `has a file in product/fonts/ not yet listed under fonts: ${loose}` });
      continue;
    }
    try {
      const metaRes = await get(`${bases.site}/metadata/fonts/${encodeURIComponent(family)}`);
      if (metaRes.status === 404) {
        out.notHosted.push({ family, fallback: face.fallback });
        continue;
      }
      if (!metaRes.ok) throw new Error(`Google Fonts answered HTTP ${metaRes.status} for its details`);
      const ask = faceRequest(face, await readJson(metaRes));
      const cssRes = await get(`${bases.css}/css2?family=${query(family)}:${ask.spec}`);
      if (!cssRes.ok) throw new Error(`Google Fonts refused the stylesheet for ${ask.spec} (HTTP ${cssRes.status})`);
      const blocks = parseFaceCss(await cssRes.text());
      const chosen = blocks.filter((b) => subsets.includes(b.subset)).sort((a, b) => rank(a.subset) - rank(b.subset));
      if (!chosen.length) throw new Error(`Google's stylesheet has no ${subsets.join(' or ')} subset of it`);
      const slug = slugOf(family);
      const fonts = [];
      for (const b of chosen) {
        const res = await get(b.url);
        if (!res.ok) throw new Error(`${b.url} answered HTTP ${res.status}`);
        const bytes = Buffer.from(await res.arrayBuffer());
        if (bytes.subarray(0, 4).toString('latin1') !== 'wOF2') throw new Error(`${b.url} is not a woff2 file`);
        const name = `${slug}${ask.variable ? '' : `-${b.weight.replace(/ /g, '-')}`}${b.style === 'italic' ? '-italic' : ''}${b.subset === 'latin' ? '' : `-${b.subset}`}.woff2`;
        fonts.push({ name, bytes, block: b });
      }
      // The family's download manifest carries its licence file, the one Google ships in the zip.
      const source = `${bases.site}/download/list?family=${query(family)}`;
      const dlRes = await get(source);
      const file = dlRes.ok ? ((await readJson(dlRes)).manifest?.files ?? []).find((f) => /^(OFL|LICEN[CS]E|UFL)\b/i.test(f.filename) && f.contents) : null;
      // Its own name only, never a path the answer gives: the file lands in fonts/ and nowhere else.
      const licenceFile = file ? `${slug}-${path.basename(file.filename)}` : null;
      const licence = file ? { name: licenceName(file.filename, file.contents), file: `fonts/${licenceFile}`, source, fetched: day } : null;
      await mkdir(fontsDir, { recursive: true });
      for (const f of fonts) await writeFile(path.join(fontsDir, f.name), f.bytes);
      if (file) await writeFile(path.join(fontsDir, licenceFile), file.contents);
      out.fetched.push({
        family,
        entries: fonts.map((f) => ({ family, file: `fonts/${f.name}`, weight: f.block.weight, style: f.block.style, licence })),
        licence,
        missing: ask.missing,
        absent: subsets.filter((s) => !blocks.some((b) => b.subset === s)),
      });
    } catch (e) {
      if (!unreachable(e)) {
        out.failed.push({ family, error: e.message });
        continue;
      }
      // The real addresses, whatever the run was pointed at, since these are for a person to open.
      out.offline.push({
        family,
        error: e.cause?.code ?? e.cause?.message ?? e.message,
        css: `${GOOGLE_FONTS.css}/css2?family=${query(family)}:wght@${face.weights.join(';')}`,
        specimen: `${GOOGLE_FONTS.site}/specimen/${query(family)}`,
      });
    }
  }
  return out;
}

export default { GOOGLE_FONTS, typeFaces, faceRequest, parseFaceCss, licenceName, fetchFonts };
