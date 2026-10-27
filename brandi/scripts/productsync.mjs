/**
 * Brandi product layer: sync, pulling a shipped product back into the system.
 *
 * Once a product ships it is the reference build. This compares its tokens and components with the
 * system's: roles added, removed and changed, components new, removed and changed (by their props).
 * With --apply it copies the shipped tokens in as they are and records where they came from. It never
 * deletes: removals are listed for a person to decide.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { loadDefinitions } from './productdocs.mjs';
import { auditProductTokens, auditSummary } from './producttokens.mjs';

function tokensIn(root) {
  for (const f of ['system/tokens.json', 'tokens.json', 'product/tokens.json']) {
    if (existsSync(path.join(root, f))) return { file: path.join(root, f), tokens: JSON.parse(readFileSync(path.join(root, f), 'utf8')) };
  }
  return null;
}

/** Where a shipped product sits in git, so the record names the commit it came from. */
export function provenance(root) {
  const git = (args) => {
    try { return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return null; }
  };
  return { path: root, remote: git(['config', '--get', 'remote.origin.url']), commit: git(['rev-parse', 'HEAD']), dirty: Boolean(git(['status', '--porcelain'])) };
}

/** The differences between a shipped product and the system, as lists a person can act on. */
export async function compareProduct({ shipped, system }) {
  const a = tokensIn(shipped);
  const b = tokensIn(system);
  const roles = { added: [], removed: [], changed: [] };
  if (a && b) {
    const mine = new Map(b.tokens.color.tokens.map((t) => [t.name, JSON.stringify(t.value)]));
    const theirs = new Map(a.tokens.color.tokens.map((t) => [t.name, JSON.stringify(t.value)]));
    for (const [name, v] of theirs) {
      if (!mine.has(name)) roles.added.push(name);
      else if (mine.get(name) !== v) roles.changed.push({ name, system: mine.get(name), shipped: v });
    }
    for (const name of mine.keys()) if (!theirs.has(name)) roles.removed.push(name);
  }
  const defsOf = async (root) => (existsSync(path.join(root, 'components', 'system')) ? loadDefinitions(path.join(root, 'components', 'system')) : []);
  const mineDefs = new Map((await defsOf(system)).map((d) => [d.name, d]));
  const theirDefs = new Map((await defsOf(shipped)).map((d) => [d.name, d]));
  const components = { added: [], removed: [], changed: [] };
  for (const [name, d] of theirDefs) {
    const m = mineDefs.get(name);
    if (!m) { components.added.push(name); continue; }
    const mp = new Set(m.props.map((p) => p.name));
    const tp = new Set(d.props.map((p) => p.name));
    const gained = [...tp].filter((p) => !mp.has(p));
    const lost = [...mp].filter((p) => !tp.has(p));
    const retyped = d.props.filter((p) => mp.has(p.name) && m.props.find((q) => q.name === p.name).type !== p.type).map((p) => p.name);
    if (gained.length || lost.length || retyped.length) components.changed.push({ name, gained, lost, retyped });
  }
  for (const name of mineDefs.keys()) if (!theirDefs.has(name)) components.removed.push(name);
  return { shippedTokens: a, systemTokens: b, roles, components };
}

export function syncReport(diff, prov) {
  const lines = [
    `Sync from ${prov.remote ?? prov.path}${prov.commit ? ` at ${prov.commit.slice(0, 12)}` : ''}${prov.dirty ? ' (with uncommitted changes)' : ''}.`,
    `Roles: ${diff.roles.added.length} added, ${diff.roles.changed.length} changed, ${diff.roles.removed.length} removed.`,
    ...diff.roles.changed.map((c) => `  changed  ${c.name}: system ${c.system}, shipped ${c.shipped}`),
    ...diff.roles.added.map((n) => `  added    ${n}`),
    ...diff.roles.removed.map((n) => `  removed  ${n} (listed, not deleted)`),
    `Components: ${diff.components.added.length} new, ${diff.components.changed.length} changed, ${diff.components.removed.length} removed.`,
    ...diff.components.added.map((n) => `  new      ${n}: promote it with its card, previews, platform specs and pairs`),
    ...diff.components.changed.map((c) => `  changed  ${c.name}:${c.gained.length ? ` gained ${c.gained.join(', ')}` : ''}${c.lost.length ? ` lost ${c.lost.join(', ')}` : ''}${c.retyped.length ? ` retyped ${c.retyped.join(', ')}` : ''}`),
    ...diff.components.removed.map((n) => `  removed  ${n} (listed, not deleted)`),
  ];
  return lines.join('\n');
}

/** Copy the shipped tokens in as they are, recording the repo, the commit and the method, then audit them. */
export function applyTokens(diff, { productDir, prov, date = new Date().toISOString().slice(0, 10) }) {
  if (!diff.shippedTokens) throw new Error('The shipped product has no tokens.json to copy.');
  const tokens = structuredClone(diff.shippedTokens.tokens);
  tokens.meta = { ...(tokens.meta ?? {}), syncedFrom: { repo: prov.remote ?? prov.path, commit: prov.commit, dirty: prov.dirty, method: 'copied as shipped by brandi product sync', on: date } };
  writeFileSync(path.join(productDir, 'tokens.json'), `${JSON.stringify(tokens, null, 2)}\n`);
  const audit = auditProductTokens(tokens);
  return { summary: auditSummary(audit), fails: audit.fails };
}

export default { compareProduct, syncReport, applyTokens, provenance };
