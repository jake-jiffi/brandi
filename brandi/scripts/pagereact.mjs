/**
 * The React a board renders on, outside the Design canvas.
 *
 * The canvas gives every artboard React 18.3.1 and ReactDOM, and a product system's bundle uses
 * that copy rather than its own. A local preview, a component preview page and the quality gates
 * need the same two files, so they are fetched once from cdnjs into a cache, checked against the
 * hashes below, and reused. Nothing is installed and nothing joins Brandi's dependencies.
 *
 * The cache lives in $BRANDI_CACHE, else $XDG_CACHE_HOME/brandi, else ~/.cache/brandi.
 */

import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export const PAGE_REACT = Object.freeze({
  version: '18.3.1',
  files: Object.freeze([
    {
      name: 'react.production.min.js',
      url: 'https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js',
      sha256: 'd949f1c3687aedadcedac85261865f29b17cd273997e7f6b2bfc53b2f9d4c4dd',
    },
    {
      name: 'react-dom.production.min.js',
      url: 'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js',
      sha256: '35f4f974f4b2bcd44da73963347f8952e341f83909e4498227d4e26b98f66f0d',
    },
  ]),
});

export function cacheDir(env = process.env) {
  if (env.BRANDI_CACHE) return path.resolve(env.BRANDI_CACHE);
  const base = env.XDG_CACHE_HOME ? path.resolve(env.XDG_CACHE_HOME) : path.join(os.homedir(), '.cache');
  return path.join(base, 'brandi');
}

export const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

/**
 * Paths to React and ReactDOM 18.3.1, fetching what the cache lacks. A file whose hash does not
 * match is never used: it is fetched again, and a second mismatch is an error, not a fallback.
 */
export async function ensurePageReact({ dir = path.join(cacheDir(), `react-${PAGE_REACT.version}`), fetchImpl = globalThis.fetch } = {}) {
  await mkdir(dir, { recursive: true });
  const out = {};
  for (const f of PAGE_REACT.files) {
    const file = path.join(dir, f.name);
    if (existsSync(file) && sha256(await readFile(file)) === f.sha256) {
      out[f.name] = file;
      continue;
    }
    let res;
    try {
      res = await fetchImpl(f.url);
    } catch (e) {
      throw new Error(`Could not fetch ${f.url} (${e.message}). Boards that mount components need React ${PAGE_REACT.version} to render outside the canvas; connect once and it is cached in ${dir}.`);
    }
    if (!res.ok) throw new Error(`${f.url} answered ${res.status}.`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (sha256(buf) !== f.sha256) throw new Error(`${f.url} does not match its pinned hash, so it is not used.`);
    await writeFile(`${file}.part`, buf);
    await rename(`${file}.part`, file);
    out[f.name] = file;
  }
  return { react: out['react.production.min.js'], reactDom: out['react-dom.production.min.js'] };
}

export default { PAGE_REACT, ensurePageReact, cacheDir, sha256 };
