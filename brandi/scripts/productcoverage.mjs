/**
 * Brandi product layer: does the canvas cover every surface the product ships on?
 *
 * A round can stop at one surface and look finished. One run drew the console in depth and almost nothing of the
 * website, the app or the messages, and every gate passed, because every gate checks what was drawn and none
 * checks what was not. product.json lists the surfaces (01-routes-and-intake.md); each names the prefix its boards
 * carry (`boards`), the widths it is drawn at (`widths`) and, where it has them, its modules. Coverage asks for a
 * board at each width and a states board for each module, and says what is missing, surface by surface. It reads
 * board names only, as 06-canvas.md writes them: `<Prefix><Screen><Width>`, `<Prefix><Module>States<Width>`, a dark
 * twin ending in `Dark`.
 */

import { existsSync, readdirSync } from 'node:fs';

/** The checked widths (06-canvas.md), for a surface that names none of its own. */
export const DEFAULT_WIDTHS = Object.freeze([1440, 820, 390]);

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

/** Every board in a canvas folder, probe boards (`_probe...`) left out. */
export function canvasBoards(dir) {
  return existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.dc.html') && !f.startsWith('_')).sort() : [];
}

/**
 * Hold the canvas's boards to the surfaces. A board belongs to the longest prefix it starts with, at a word boundary
 * (the next letter a capital or a digit), so AppStaffShift820 is not an App board and ApplesHome390 is nobody's.
 * Returns each surface with its prefix, widths, modules, how many boards it has and what is missing, and `covered`.
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
  const result = listed.map((s, i) => {
    const boards = boardsOf.get(s);
    const missing = [];
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
    return { ...s, boards: boards.length, missing, options, reused };
  });
  return { covered: result.every((s) => !s.missing.length), surfaces: result };
}

export default { canvasCoverage, canvasBoards, surfacePrefix, boardWidth, moduleWords, DEFAULT_WIDTHS };
