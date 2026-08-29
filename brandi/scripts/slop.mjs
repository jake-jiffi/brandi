/**
 * The anti-slop linter, driven by the reference document rather than by a copy
 * of it.
 *
 * `references/04-anti-slop.md` has always carried a YAML block that calls
 * itself "the linter contract". Nothing read it. Meanwhile `guardian.mjs`
 * hand-maintained seven patterns and `canvas.mjs` hand-maintained a third,
 * overlapping set, and they disagreed: a comment in canvas.mjs records the day
 * `font-family: 'Inter', sans-serif` passed one validator and failed the other,
 * which is the single most-banned face getting through the check that exists to
 * stop it. Forty rules were specified and seven were enforced.
 *
 * So the document is now the source of truth and this file is the only reader.
 * Adding a rule means editing the reference, which is where a person would look
 * for it anyway, and the shape assertion below means a rule that stops parsing
 * fails the build instead of quietly disappearing.
 *
 * The YAML subset is deliberately small: nested maps, scalars, block and flow
 * sequences, and folded scalars. It is not a general parser and does not want to
 * be. `assertContract` states what the document must contain, so a change that
 * outgrows the subset is caught as a shape failure rather than as silence.
 */

import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// A small YAML subset
// ---------------------------------------------------------------------------

/**
 * Strip a trailing comment, respecting quotes.
 *
 * This is the one piece that cannot be naive: the contract's colour rules are
 * written `values: ['#6366f1', '#4f46e5']`, and a `#` comment strip that does
 * not know about quotes deletes every hex in the file and leaves a linter that
 * silently bans nothing.
 */
function stripComment(line) {
  let quote = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quote) {
      if (c === quote) quote = null;
    } else if (c === '"' || c === "'") {
      quote = c;
    } else if (c === '#' && (i === 0 || /\s/.test(line[i - 1]))) {
      return line.slice(0, i);
    }
  }
  return line;
}

/** A YAML scalar: quoted, numeric, boolean, or bare. */
function scalar(raw) {
  const v = raw.trim();
  if (v === '') return '';
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v === 'null' || v === '~') return null;
  if (/^-?\d+$/.test(v)) return Number(v);
  if (/^-?\d*\.\d+$/.test(v)) return Number(v);
  // Single quotes are literal except for '' which is one quote. Double quotes
  // in this document never carry escapes, so they are stripped the same way.
  if (v.startsWith("'") && v.endsWith("'") && v.length > 1) return v.slice(1, -1).replace(/''/g, "'");
  if (v.startsWith('"') && v.endsWith('"') && v.length > 1) return v.slice(1, -1);
  return v;
}

/** Split a flow sequence body on commas that are not inside quotes. */
function flowItems(body) {
  const out = [];
  let cur = '';
  let quote = null;
  for (const c of body) {
    if (quote) {
      cur += c;
      if (c === quote) quote = null;
    } else if (c === '"' || c === "'") {
      cur += c;
      quote = c;
    } else if (c === ',') {
      out.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  if (cur.trim()) out.push(cur);
  return out.map(scalar).filter((x) => x !== '');
}

/**
 * Parse the subset. Returns plain objects, arrays and scalars.
 *
 * `lines` are consumed with an explicit cursor rather than recursion over
 * slices, so a malformed document runs out of input instead of looping.
 */
function parseBlock(lines, cursor, indent) {
  // Decide map or sequence from the first meaningful line at this indent.
  let first = cursor.i;
  while (first < lines.length && lines[first].blank) first++;
  if (first >= lines.length || lines[first].indent < indent) return null;
  const isSeq = lines[first].text.startsWith('- ') || lines[first].text === '-';

  const result = isSeq ? [] : {};
  while (cursor.i < lines.length) {
    const line = lines[cursor.i];
    if (line.blank) { cursor.i++; continue; }
    if (line.indent < indent) break;
    if (line.indent > indent) {
      throw new SyntaxError(`anti-slop contract: unexpected indent at line ${line.n}: ${line.text}`);
    }

    if (isSeq) {
      cursor.i++;
      result.push(scalar(line.text.replace(/^-\s*/, '')));
      continue;
    }

    const m = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(line.text);
    if (!m) throw new SyntaxError(`anti-slop contract: not a key at line ${line.n}: ${line.text}`);
    const [, key, rest] = m;
    cursor.i++;

    if (rest === '>' || rest === '|' || rest === '>-' || rest === '|-') {
      // A folded or literal block: every deeper line, joined.
      const parts = [];
      while (cursor.i < lines.length && (lines[cursor.i].blank || lines[cursor.i].indent > indent)) {
        if (!lines[cursor.i].blank) parts.push(lines[cursor.i].text);
        cursor.i++;
      }
      result[key] = parts.join(rest.startsWith('>') ? ' ' : '\n').trim();
    } else if (rest.startsWith('[')) {
      // A flow sequence, which may run over several lines.
      let body = rest;
      while (!body.includes(']') && cursor.i < lines.length) {
        body += ' ' + lines[cursor.i].text;
        cursor.i++;
      }
      result[key] = flowItems(body.slice(body.indexOf('[') + 1, body.lastIndexOf(']')));
    } else if (rest === '') {
      result[key] = parseBlock(lines, cursor, indent + 2) ?? {};
    } else {
      result[key] = scalar(rest);
    }
  }
  return result;
}

/** Parse the YAML subset used by the anti-slop contract. */
export function parseContractYaml(source) {
  const lines = source.split('\n').map((raw, i) => {
    const text = stripComment(raw);
    return { n: i + 1, blank: text.trim() === '', indent: text.length - text.trimStart().length, text: text.trim() };
  });
  const cursor = { i: 0 };
  const doc = parseBlock(lines, cursor, 0);
  if (cursor.i < lines.length && lines.slice(cursor.i).some((l) => !l.blank)) {
    throw new SyntaxError(`anti-slop contract: stopped parsing at line ${lines[cursor.i].n}`);
  }
  return doc ?? {};
}

/** Pull the fenced yaml block out of the reference document. */
export function extractContract(markdown) {
  const m = /```yaml\n([\s\S]*?)\n```/.exec(markdown);
  if (!m) throw new Error('04-anti-slop.md no longer contains a ```yaml contract block.');
  return parseContractYaml(m[1]);
}

// ---------------------------------------------------------------------------
// The shape the document must keep
// ---------------------------------------------------------------------------

/**
 * What the linter needs to exist. A rule that stops parsing, or a group that
 * gets renamed, fails here rather than becoming a rule that silently stops
 * firing. That is the whole reason the document is allowed to be the source of
 * truth: the failure mode of a parser is silence, so silence has to be an error.
 */
export const REQUIRED_GROUPS = [
  'banned_fonts', 'banned_hex', 'css_patterns', 'thresholds',
  'banned_copy', 'banned_emoji', 'banned_hosts', 'structural', 'placeholder_form',
];

export const SEVERITIES = ['p0', 'p1', 'p2', 'watch', 'info'];

export function assertContract(c) {
  const problems = [];
  if (c.version !== 1) problems.push(`version is ${c.version}, expected 1`);
  if (typeof c.waiver_pattern !== 'string' || !c.waiver_pattern) problems.push('waiver_pattern is missing');
  for (const g of REQUIRED_GROUPS) {
    if (!c[g] || (typeof c[g] === 'object' && !Object.keys(c[g]).length)) problems.push(`${g} is missing or empty`);
  }
  if (!Array.isArray(c.banned_fonts?.literals) || c.banned_fonts.literals.length < 5) {
    problems.push('banned_fonts.literals is missing or implausibly short');
  }
  if (!Array.isArray(c.banned_emoji?.values) || !c.banned_emoji.values.length) problems.push('banned_emoji.values is empty');
  if (!Array.isArray(c.banned_hosts?.values) || !c.banned_hosts.values.length) problems.push('banned_hosts.values is empty');
  for (const [name, rule] of compilableRules(c)) {
    if (!SEVERITIES.includes(rule.severity)) problems.push(`${name}: severity "${rule.severity}" is not one of ${SEVERITIES.join(', ')}`);
    for (const src of [].concat(rule.regex ?? [])) {
      try { new RegExp(src, 'i'); } catch (e) { problems.push(`${name}: regex does not compile: ${e.message}`); }
    }
  }
  if (problems.length) {
    throw new Error(`The anti-slop contract in references/04-anti-slop.md no longer matches what the linter reads:\n  ${problems.join('\n  ')}`);
  }
  return c;
}

/** Every named rule in the contract that carries a severity. */
function* compilableRules(c) {
  for (const group of REQUIRED_GROUPS) {
    const g = c[group];
    if (!g || typeof g !== 'object') continue;
    if (g.severity) { yield [group, g]; continue; }
    for (const [name, rule] of Object.entries(g)) {
      if (rule && typeof rule === 'object' && rule.severity) yield [`${group}.${name}`, rule];
    }
  }
}

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

const HERE = path.dirname(new URL(import.meta.url).pathname);
export const CONTRACT_PATH = path.join(HERE, '..', 'skills', 'brand-system', 'references', '04-anti-slop.md');

let cached = null;

/** The contract, parsed, shape-checked and memoised. */
export async function loadContract(file = CONTRACT_PATH) {
  if (cached && cached.file === file) return cached.contract;
  const contract = assertContract(extractContract(await readFile(file, 'utf8')));
  cached = { file, contract };
  return contract;
}

/**
 * The same, synchronously, because `validateArtboard` is synchronous and has
 * every right to stay that way. One small read, memoised for the process.
 */
export function loadContractSync(file = CONTRACT_PATH) {
  if (cached && cached.file === file) return cached.contract;
  const contract = assertContract(extractContract(readFileSync(file, 'utf8')));
  cached = { file, contract };
  return contract;
}

// ---------------------------------------------------------------------------
// Running the rules
// ---------------------------------------------------------------------------

const SEVERITY_LEVEL = { p0: 'error', p1: 'warn', p2: 'info', watch: 'info', info: 'info' };

/**
 * Documentation must be allowed to quote what it forbids.
 *
 * The reference file itself contains every banned phrase, by necessity, and so
 * does the brand book's misuse page. Comments and script bodies come out before
 * matching, which the contract's own `notes` field asks for.
 */
function scrub(text) {
  return text
    .replace(/<!--[\s\S]*?-->/g, (m) => ' '.repeat(m.length))
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (m) => ' '.repeat(m.length));
}

const lineOf = (text, index) => text.slice(0, index).split('\n').length;

/**
 * Is this finding waived?
 *
 * The contract allows an adjacent justification to stand a rule down, because
 * an observed brand fact beats a general ban: a client whose real typeface is
 * Poppins does not have a slop problem, they have a Poppins problem, and the
 * system has to be able to say so. The waiver must carry a reason. A bare
 * `anti-slop-waiver:` with nothing after it is itself reported, because a
 * waiver with no argument is how a rule set quietly stops meaning anything.
 */
function waiverNear(lines, lineNo, pattern, hasReason) {
  for (let i = Math.max(0, lineNo - 2); i <= Math.min(lines.length - 1, lineNo); i++) {
    if (pattern.test(lines[i]) && hasReason(lines[i])) return true;
  }
  return false;
}

/**
 * Run the contract over one file's text.
 *
 * `mode` selects which rules apply: 'markup' for artboards and pages, 'style'
 * for stylesheets, 'any' for everything. Copy and colour rules run everywhere;
 * the CSS structural ones only make sense where there is CSS.
 */
export function slopFindings(contract, text, { file = '', mode = 'any' } = {}) {
  const findings = [];
  const body = scrub(text);
  const lines = text.split('\n');
  const waiver = new RegExp(contract.waiver_pattern, 'i');
  // `/* anti-slop-waiver: */` satisfies the contract's `\S+` because `*/` is
  // non-whitespace, which would let a comment terminator stand in for a reason.
  // A reason has to contain a word.
  const hasReason = (line) => {
    const m = /anti-slop-waiver:\s*(.*)$/i.exec(line);
    return !!m && /\w/.test(m[1].replace(/\*\/|-->|\s+$/g, ''));
  };
  const bareWaiver = (line) => /anti-slop-waiver:/i.test(line) && !hasReason(line);

  // The contract deliberately overlaps: #8b5cf6 is in ai_default_indigo AND in
  // purple_violet_family, and source.unsplash.com contains unsplash.com. That
  // overlap is right in a document a person reads and wrong in a report, so one
  // position reports once, at the worst severity that claimed it.
  const seen = new Map();
  const add = (rule, severity, index, message, fix) => {
    const line = lineOf(text, index);
    if (waiverNear(lines, line - 1, waiver, hasReason)) return;
    const rank = SEVERITIES.indexOf(severity);
    const prior = seen.get(index);
    if (prior && SEVERITIES.indexOf(prior.severity) <= rank) return;
    const finding = { rule, severity, level: SEVERITY_LEVEL[severity] ?? 'warn', file, line, message, fix };
    if (prior) findings[findings.indexOf(prior)] = finding;
    else findings.push(finding);
    seen.set(index, finding);
  };

  const scan = (source, rule, severity, message, fix, { unless = null, flags = 'gi' } = {}) => {
    // `unless` is how a rule says "only when nothing answered this": a removed
    // outline is a fault only where no :focus-visible replaces it.
    if (unless) {
      try { if (new RegExp(unless, 'i').test(body)) return; } catch { /* not a pattern */ }
    }
    let re;
    try { re = new RegExp(source, flags); } catch { return; }
    for (const m of body.matchAll(re)) add(rule, severity, m.index, message(m), fix);
  };

  // --- Typefaces ---------------------------------------------------------
  const fonts = contract.banned_fonts;
  const families = [...body.matchAll(/font-family\s*:\s*([^;}\n]+)/gi)];
  for (const m of families) {
    // Only the FIRST family in the stack is a choice. Everything after it is a
    // fallback, and a stack has to degrade: `'Karla', system-ui, sans-serif` is
    // correct practice, and reading it as three violations flagged Brandi's own
    // sheets sixteen times over. A ban on a fallback is a ban on graceful
    // degradation, which is not what any of these rules are about.
    const declared = m[1].split(',')[0].replace(/["']/g, '').trim();
    for (const banned of fonts.literals) {
      if (new RegExp(`\\b${banned.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(declared)) {
        add('banned-font', fonts.severity, m.index,
          `${banned} is a typeface that makes work look machine-generated.`,
          'Use a brand face, or waive it with a reason: /* anti-slop-waiver: the client owns this licence */');
      }
    }
    for (const soft of fonts.soft_literals ?? []) {
      if (new RegExp(`\\b${soft.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(declared)) {
        add('default-font', 'p1', m.index,
          `${soft} is not banned, it is a default. It is what a generator reaches for first.`,
          'Keep it only if it was chosen against alternatives, and record why.');
      }
    }
  }

  // --- Colour ------------------------------------------------------------
  for (const [name, group] of Object.entries(contract.banned_hex)) {
    if (!Array.isArray(group.values)) continue;
    // A ground is a ground. The grounds set is about what the page is painted,
    // so it only fires on a background declaration; a near-black printed in a
    // swatch table is the table doing its job.
    const groundsOnly = name === 'ai_default_grounds';
    for (const hex of group.values) {
      const re = groundsOnly
        ? new RegExp(`(?:background(?:-color)?|--(?:bg|surface|page)[\\w-]*)\\s*:\\s*${hex}\\b`, 'gi')
        : new RegExp(hex + '\\b', 'gi');
      for (const m of body.matchAll(re)) {
        add(`hex-${name.replace(/_/g, '-')}`, group.severity, m.index,
          `${hex} is in the ${name.replace(/_/g, ' ')} set, which is where generated design goes to look like every other generated design.`,
          group.severity === 'watch' ? 'Not a fault. Record why this one is right for this brand.' : 'Use a colour the brand actually owns.');
      }
    }
  }

  // --- CSS patterns ------------------------------------------------------
  if (mode !== 'copy') {
    for (const [name, rule] of Object.entries(contract.css_patterns)) {
      if (!rule.regex) continue;
      scan(rule.regex, name.replace(/_/g, '-'), rule.severity,
        () => rule.rule ?? `${name.replace(/_/g, ' ')} is one of the patterns that reads as machine-made.`,
        'Remove it, or record the decision that put it there.', { unless: rule.unless });
    }
  }

  // --- Copy --------------------------------------------------------------
  const placeholder = new RegExp(contract.placeholder_form.regex, 'g');
  for (const [name, rule] of Object.entries(contract.banned_copy)) {
    for (const src of [].concat(rule.regex ?? [])) {
      let re;
      try { re = new RegExp(src, 'gi'); } catch { continue; }
      for (const m of body.matchAll(re)) {
        // A conforming placeholder is honest, so it waives the copy rules it
        // would otherwise trip. That is the contract's own second use for it.
        placeholder.lastIndex = 0;
        if (new RegExp(`\\[[^\\]]*${m[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^\\]]*\\]`, 'i').test(body)) continue;
        add(name.replace(/_/g, '-'), rule.severity, m.index,
          `"${m[0].trim()}" is copy nobody wrote for this brand.`,
          'Say the specific thing, or bracket it honestly: [YOUR PRICE].');
      }
    }
  }

  // --- Emoji as iconography ---------------------------------------------
  for (const e of contract.banned_emoji.values) {
    const re = new RegExp(`(<(?:h[1-6]|button|li)\\b[^>]*>[^<]{0,200}?)${e}`, 'g');
    for (const m of body.matchAll(re)) {
      add('emoji-as-icon', contract.banned_emoji.severity, m.index + m[1].length,
        `${e} is doing an icon's job in a heading or a control.`,
        'Draw the icon, or drop it. An emoji renders differently on every platform and carries no brand.');
    }
  }

  // --- Placeholder image hosts ------------------------------------------
  for (const host of contract.banned_hosts.values) {
    const re = new RegExp(host.replace(/\./g, '\\.'), 'gi');
    for (const m of body.matchAll(re)) {
      add('placeholder-host', contract.banned_hosts.severity, m.index,
        `${host} is a stock or placeholder host, and it will still be there when this ships.`,
        'Use a real asset, or a captioned [PHOTOGRAPH: ...] slot that nobody could mistake for finished.');
    }
  }

  // --- Structural --------------------------------------------------------
  for (const [name, rule] of Object.entries(contract.structural)) {
    if (!rule.regex) continue;
    scan(rule.regex, name.replace(/_/g, '-'), rule.severity,
      () => rule.rule ?? `${name.replace(/_/g, ' ')}: a shape that appears in generated work far more often than in designed work.`,
      'Keep it only if the content genuinely has that shape.', { unless: rule.unless });
  }

  // --- Thresholds --------------------------------------------------------
  const t = contract.thresholds;
  if (mode !== 'copy' && t.raw_hex_outside_root?.max != null) {
    // The contract's own scope line says "inside <style> but outside :root".
    // Counting the whole document instead made every swatch sheet a violation,
    // because printing hex values is exactly what a swatch sheet is for.
    const styles = [...body.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((x) => x[1]);
    const css = styles.length ? styles.join('\n') : (/<html|<body|<div/i.test(body) ? '' : body);
    const withoutRoot = css.replace(/:root\s*\{[^}]*\}/g, '').replace(/\[data-theme[^{]*\{[^}]*\}/g, '');
    const raw = (withoutRoot.match(/#[0-9a-f]{3,8}\b/gi) ?? []).length;
    if (raw > t.raw_hex_outside_root.max) {
      add('raw-hex-outside-root', t.raw_hex_outside_root.severity, 0,
        `${raw} raw hex literals outside :root, past the ${t.raw_hex_outside_root.max} this system allows.`,
        'Tokens exist so colour lives in one place. Reach for var(--...) instead.');
    }
  }
  if (mode !== 'copy' && t.distinct_radii?.max != null) {
    const radii = new Set((body.match(/border-radius\s*:\s*([^;}\n]+)/gi) ?? [])
      .map((s) => s.split(':')[1].trim()).filter((v) => v && !/^0(px|rem|%)?$/.test(v)));
    if (radii.size > t.distinct_radii.max) {
      add('distinct-radii', t.distinct_radii.severity, 0,
        `${radii.size} distinct corner radii in one file, past the ${t.distinct_radii.max} a system should need.`,
        'A radius scale has three or four steps. More than that is not a system, it is a habit.');
    }
  }
  if (mode !== 'copy' && t.uppercase_no_tracking) {
    for (const m of body.matchAll(/text-transform\s*:\s*uppercase/gi)) {
      const block = body.slice(Math.max(0, m.index - 400), m.index + 400);
      if (!/letter-spacing\s*:\s*0?\.(0[6-9]|[1-9])/i.test(block)) {
        add('uppercase-no-tracking', t.uppercase_no_tracking.severity, m.index,
          'Uppercase set without letter-spacing. Capitals need air or they read as shouting.',
          'Add letter-spacing of at least 0.06em wherever text-transform: uppercase is set.');
      }
    }
  }

  // --- A waiver with no argument is itself the tell ----------------------
  lines.forEach((l, i) => {
    if (bareWaiver(l)) {
      findings.push({
        rule: 'empty-waiver', severity: 'p1', level: 'warn', file, line: i + 1,
        message: 'An anti-slop waiver with no reason after it.',
        fix: 'Say why: /* anti-slop-waiver: Poppins is the client\'s licensed corporate face */',
      });
    }
  });

  findings.sort((a, b) => (a.line ?? 0) - (b.line ?? 0));

  // A rule that fires 138 times in one file has said its piece after the third.
  // `watch` collapses to one, because it is not a fault at all: it asks for a
  // recorded justification, and one file needs one justification, not 138.
  const kept = [];
  const count = new Map();
  for (const f of findings) {
    const n = (count.get(f.rule) ?? 0) + 1;
    count.set(f.rule, n);
    const cap = f.severity === 'watch' ? 1 : 3;
    if (n <= cap) kept.push(f);
  }
  for (const f of kept) {
    const total = count.get(f.rule);
    const cap = f.severity === 'watch' ? 1 : 3;
    if (total > cap) f.message += ` (${total} times in this file; showing the first ${cap}.)`;
  }
  return kept;
}

/**
 * A flat, human-readable list of every rule the contract carries, for a brand's
 * emitted rules.json. Derived, never restated: a rule added to the document
 * appears here the next time a guardian is written.
 */
export function slopRuleSummary(contract) {
  const out = [];
  for (const group of REQUIRED_GROUPS) {
    const g = contract[group];
    if (!g || typeof g !== 'object') continue;
    if (g.severity) {
      out.push({ rule: group, severity: g.severity, patterns: [].concat(g.regex ?? g.values ?? g.literals ?? []).length });
      continue;
    }
    for (const [name, rule] of Object.entries(g)) {
      if (!rule || typeof rule !== 'object' || !rule.severity) continue;
      out.push({
        rule: `${group}.${name}`,
        severity: rule.severity,
        patterns: [].concat(rule.regex ?? rule.values ?? []).length,
        // Thresholds carry a number rather than a pattern, and dropping it made
        // a brand's rules.json claim a rule with nothing behind it.
        max: rule.max ?? undefined,
        recommended: rule.recommended ?? undefined,
        note: rule.rule ?? rule.scope ?? undefined,
      });
    }
  }
  return out;
}

export default { loadContract, loadContractSync, slopFindings, slopRuleSummary, parseContractYaml, extractContract, assertContract, CONTRACT_PATH };
