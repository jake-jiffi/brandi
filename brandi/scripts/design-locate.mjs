/**
 * Find the `/design` canvas helper.
 *
 * The design skill is extracted to a temporary directory whose path contains
 * the Claude Code version and a content hash, and it only exists after the
 * skill has been invoked in the session:
 *
 *   /private/tmp/claude-<uid>/bundled-skills/<version>/<hash>/design/
 *
 * So the path can never be hardcoded. This walks the likely roots, picks the
 * newest copy, and says plainly what to do when it finds nothing rather than
 * failing somewhere further downstream.
 */

import { readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const ROOTS = [
  '/private/tmp',
  '/tmp',
  os.tmpdir(),
  path.join(os.homedir(), '.claude'),
];

async function safeReaddir(dir) {
  try {
    return await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

/**
 * Every copy of the design skill on this machine, newest first.
 * @returns {Promise<Array<{dir: string, helper: string, template: string, mtime: number}>>}
 */
export async function findDesignSkills() {
  const found = new Map();
  const roots = [...new Set(ROOTS.filter(Boolean))];

  for (const root of roots) {
    for (const a of await safeReaddir(root)) {
      if (!a.isDirectory()) continue;
      // Both /private/tmp/claude-501/bundled-skills/... and, defensively,
      // a bundled-skills directory sitting directly under the root.
      const candidates = [
        path.join(root, a.name, 'bundled-skills'),
        a.name === 'bundled-skills' ? path.join(root, a.name) : null,
      ].filter(Boolean);

      for (const base of candidates) {
        for (const version of await safeReaddir(base)) {
          if (!version.isDirectory()) continue;
          for (const hash of await safeReaddir(path.join(base, version.name))) {
            if (!hash.isDirectory()) continue;
            const dir = path.join(base, version.name, hash.name, 'design');
            const helper = path.join(dir, 'seed-canvas.mjs');
            const template = path.join(dir, 'payload.template.html');
            if (existsSync(helper) && existsSync(template) && !found.has(dir)) {
              let mtime = 0;
              try { mtime = (await stat(helper)).mtimeMs; } catch { /* keep 0 */ }
              found.set(dir, { dir, helper, template, mtime, version: version.name });
            }
          }
        }
      }
    }
  }

  return [...found.values()].sort((a, b) => b.mtime - a.mtime);
}

/**
 * The design helper to use, or null.
 * Never read `payload.template.html` into context: it is about 2.4 MB of
 * minified editor code and it is only ever passed to the helper by path.
 */
export async function locateDesignHelper() {
  const all = await findDesignSkills();
  return all[0] ?? null;
}

export const NOT_FOUND_MESSAGE = [
  'The /design canvas helper is not on this machine yet.',
  '',
  'It is extracted to a temporary directory the first time the design skill runs',
  'in a session, so it will not exist until then. Run /design once (any prompt',
  'will do) and try again.',
].join('\n');

export default { findDesignSkills, locateDesignHelper, NOT_FOUND_MESSAGE };
