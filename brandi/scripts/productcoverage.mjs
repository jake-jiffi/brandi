/**
 * Brandi product layer: does the canvas cover every surface the product ships on?
 *
 * A round can stop at one surface and look finished. One run drew the console in depth and almost nothing of the
 * website, the app or the messages, and every gate passed, because every gate checks what was drawn and none
 * checks what was not. product.json lists the surfaces (01-routes-and-intake.md); each names the prefix its boards
 * carry (`boards`), the widths it is drawn at (`widths`) and, where it has them, its modules and the board that shows
 * each core page (`pages`). Coverage asks for a board at each width, a states board for each module and each core
 * page named or skipped with a reason, and says what is missing, surface by surface. It reads board names only, as
 * 06-canvas.md writes them: `<Prefix><Screen><Width>`, `<Prefix><Module>States<Width>`, a dark twin ending in `Dark`.
 */

import { existsSync, readdirSync } from 'node:fs';

/** The checked widths (06-canvas.md), for a surface that names none of its own. */
export const DEFAULT_WIDTHS = Object.freeze([1440, 820, 390]);

/**
 * The core page patterns, as 04-written-system.md (Screen patterns) names them, in its order. A surface with modules (an
 * app or a console) shows each on a board or skips it with a reason; a marketing site or messages have none.
 */
export const CORE_PAGES = Object.freeze(['Home', 'Records', 'List and detail', 'Record', 'Report', 'Settings', 'Create and edit', 'Setup', 'The assistant', 'Sign in']);

const pascal = (text) => String(text).split(/[^A-Za-z0-9]+/).filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
const stemOf = (file) => String(file).replace(/\.dc\.html$/, '');

/**
 * A surface's board prefix: its `boards`, or else its name in PascalCase ("Ops console" is OpsConsole). The name is
 * the only default that is unique per surface and needs no guessing; a short `boards` ("Console") reads better.
 */
export function surfacePrefix(surface) {
  return typeof surface?.boards === 'string' && surface.boards.trim() ? surface.boards.trim() : pascal(surface?.name ?? '');
}

/** A board's width: the last number in its stem, before Dark (06-canvas.md, Names). Null for a board with none, as Main. */
export function boardWidth(file) {
  const m = /(\d+)(?:Dark)?$/.exec(stemOf(file));
  return m ? Number(m[1]) : null;
}

/**
 * The words a module's states board can be known by: each word of five letters or more, so "and" or "of" never
 * matches by chance. A module of short words only ("Menu") is known by its whole name.
 */
export function moduleWords(module) {
  const words = String(module).split(/[^A-Za-z0-9]+/).filter((w) => w.length >= 5);
  return words.length ? words : [pascal(module)];
}

/**
 * Hold a surface's `pages` to the core patterns: each names the board that shows it, one of the surface's own, or
 * skips it as { "skip": "why" }. A run drew no create and edit screen and met the bar, then lost points in review on
 * error prevention and user control, which those screens carry. A key is matched without its case or a leading "the".
 * Returns the named, the skipped and what is missing; null for a surface with neither modules nor pages, which has
 * nothing to check. A surface with modules that names none is held to every pattern: left unchecked, the run that drew
 * no create and edit screen would meet the bar again.
 */
export function corePages(pages, { prefix, widths, modules, boards, canvas }) {
  if (pages == null && !modules.length) return null;
  const key = (name) => String(name).trim().toLowerCase().replace(/^the\s+/, '');
  const given = new Map();
  const strays = [];
  for (const [name, value] of Object.entries(typeof pages === 'object' ? pages : {})) {
    const pattern = CORE_PAGES.find((p) => key(p) === key(name));
    if (pattern) given.set(pattern, value);
    else strays.push(name);
  }
  const named = [];
  const skipped = [];
  const unnamed = [];
  const faults = [];
  for (const pattern of CORE_PAGES) {
    const value = given.get(pattern);
    if (typeof value === 'string' && value.trim()) {
      const board = stemOf(value.trim());
      if (!canvas.includes(board)) faults.push(`${pattern} is named on ${board}, which is not on the canvas`);
      else if (!boards.includes(board)) faults.push(`${pattern} is named on ${board}, which is not a ${prefix} board`);
      else named.push({ pattern, board });
    } else if (value && typeof value === 'object' && 'skip' in value) {
      if (typeof value.skip === 'string' && value.skip.trim()) skipped.push({ pattern, reason: value.skip.trim() });
      else faults.push(`${pattern} is skipped with no reason: say why the surface has none`);
    } else unnamed.push(pattern);
  }
  const missing = [
    ...(unnamed.length ? [`core pages neither named nor skipped: ${unnamed.join(', ')} (under the surface's pages in product.json, name the board that shows each, as "${unnamed[0]}": "${prefix}${pascal(unnamed[0].replace(/^The /, ''))}${widths[0]}", or skip it with { "skip": "why the surface has none" })`] : []),
    ...faults,
    ...strays.map((name) => `pages names ${name}, which is not a core pattern (04-written-system.md, Screen patterns: ${CORE_PAGES.join(', ')})`),
  ];
  return { named, skipped, missing };
}

/** Every board in a canvas folder, probe boards (`_probe...`) left out. */
export function canvasBoards(dir) {
  return existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.dc.html') && !f.startsWith('_')).sort() : [];
}

/**
 * Hold the canvas's boards to the surfaces. A board belongs to the longest prefix it starts with, at a word boundary
 * (the next letter a capital or a digit), so AppStaffShift820 is not an App board and ApplesHome390 is nobody's.
 * Returns each surface with its prefix, widths, modules, how many boards it has, its core pages and what is missing,
 * and `covered`.
 */
export function canvasCoverage({ surfaces = [], files = [] }) {
  if (!Array.isArray(surfaces) || !surfaces.length) {
    return { covered: false, skipped: 'product.json lists no surfaces, so nothing says what the canvas has to cover (01-routes-and-intake.md)', surfaces: [] };
  }
  const listed = surfaces.map((s) => ({
    name: String(s?.name ?? '(no name)'),
    prefix: surfacePrefix(s),
    widths: Array.isArray(s?.widths) && s.widths.length ? s.widths.map(Number) : [...DEFAULT_WIDTHS],
    modules: (Array.isArray(s?.modules) ? s.modules : []).map((m) => (typeof m === 'string' ? m : m?.name)).filter(Boolean),
  }));
  const owner = (stem) => listed
    .filter((s) => s.prefix && stem.startsWith(s.prefix) && /^[A-Z0-9]/.test(stem.slice(s.prefix.length)))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0];
  const boardsOf = new Map(listed.map((s) => [s, []]));
  for (const f of files) {
    const s = owner(stemOf(f));
    if (s) boardsOf.get(s).push(stemOf(f));
  }
  const canvas = files.map(stemOf);
  const result = listed.map((s, i) => {
    const boards = boardsOf.get(s);
    const missing = [];
    const core = corePages(surfaces[i]?.pages, { ...s, boards, canvas });
    const twin = listed.slice(0, i).find((o) => o.prefix === s.prefix);
    if (!s.prefix) missing.push('no boards prefix: give the surface a name or a boards prefix');
    else if (twin) missing.push(`its prefix ${s.prefix} is also ${twin.name}'s: give each surface its own boards prefix`);
    else if (!boards.length) missing.push(`no board at all: name each one ${s.prefix}, its screen, then its width, as ${s.prefix}Home${s.widths[0]}`);
    else {
      for (const w of s.widths) if (!boards.some((b) => boardWidth(b) === w)) missing.push(`no board at ${w}`);
      for (const m of s.modules) {
        const words = moduleWords(m).map((w) => w.toLowerCase());
        const states = boards.some((b) => {
          const rest = b.slice(s.prefix.length);
          return rest.includes('States') && words.some((w) => rest.toLowerCase().includes(w));
        });
        if (!states) missing.push(`no states board for the ${m} module (a board named ${s.prefix}, a word of ${moduleWords(m).join(' or ')}, then States, as ${s.prefix}${pascal(m)}States${s.widths[0]})`);
      }
      missing.push(...(core?.missing ?? []));
    }
    // Which modules drew options and which reused a written pattern (06-canvas.md, section 4), for the record: an
    // option board ends in its letter before the width, as ConsoleRostersC1440. Two letters or more make a set.
    const options = [];
    for (const m of s.modules) {
      const words = moduleWords(m).map((w) => w.toLowerCase());
      const letters = new Set();
      for (const b of boards) {
        const opt = /^(.+?)([A-D])\d+(?:Dark)?$/.exec(b.slice(s.prefix.length));
        if (opt && !opt[1].includes('States') && words.some((w) => opt[1].toLowerCase().includes(w))) letters.add(opt[2]);
      }
      if (letters.size >= 2) options.push({ module: m, letters: [...letters].sort() });
    }
    const reused = s.modules.filter((m) => !options.some((o) => o.module === m));
    return { ...s, boards: boards.length, missing, options, reused, core };
  });
  return { covered: result.every((s) => !s.missing.length), surfaces: result };
}

export default { canvasCoverage, corePages, canvasBoards, surfacePrefix, boardWidth, moduleWords, DEFAULT_WIDTHS, CORE_PAGES };
