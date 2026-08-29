/**
 * The handover: one directory, and a front page that says who takes what.
 *
 * Everything Brandi produces already existed in pieces, scattered across
 * `brand/`, and a client who is handed a folder of files works out what to do
 * with roughly none of them. An agency does not hand over a directory listing;
 * it hands over a package with a contents page, and the contents page is
 * addressed to people rather than to filenames. A printer does not want the
 * token file and a developer does not want the Pantone table, and neither of
 * them should have to work out which is which.
 *
 * This assembles, it does not generate. Anything absent is reported as absent,
 * with the command that would produce it, because a handover that quietly omits
 * the thing somebody needs is worse than one that says it is missing.
 */

import { readFile, writeFile, mkdir, cp, readdir, stat, realpath } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Who each part of a handover is for.
 *
 * The audience is the organising idea, not the file type. Every entry names a
 * person who has a job to do on Monday, because that is the test of whether a
 * thing belongs in a handover at all: if nobody is waiting for it, it is
 * documentation of the process rather than a deliverable.
 */
export const PARTS = Object.freeze([
  {
    id: 'book',
    dest: 'brand-book.html',
    from: (b) => path.join(b, 'brand-book.html'),
    title: 'The brand book',
    who: 'Everyone. Start here.',
    what: 'The whole system written down, including what was decided, why, and what nobody has answered yet.',
    make: 'brandi book',
  },
  {
    id: 'pdf',
    dest: 'brand-book.pdf',
    from: (b) => path.join(b, 'brand-book.pdf'),
    title: 'The brand book, as a PDF',
    who: 'Anyone who has to send it to somebody, or print it.',
    what: 'The same book, paginated, for the people who will not open an HTML file.',
    make: 'brandi book --pdf',
    optional: true,
  },
  {
    id: 'assets',
    dest: 'assets',
    from: (b) => path.join(b, 'assets'),
    title: 'The asset pack',
    who: 'A developer, a printer, a signwriter, an embroiderer, whoever runs the social accounts.',
    what: 'Vectors in every colourway, rasters at every size a browser or a platform asks for, a real favicon, and the web manifest.',
    make: 'brandi assets',
  },
  {
    id: 'logo',
    dest: 'logo',
    from: (b) => path.join(b, 'logo'),
    title: 'The mark, and how it was arrived at',
    who: 'Whoever approves it, and whoever has to defend the choice later.',
    what: 'The masters, and the round they were chosen from, with the provenance record. A mark with no record of what it beat is a mark nobody can argue for.',
    make: 'brandi logo master <id>',
    optional: true,
  },
  {
    id: 'tokens',
    dest: 'tokens',
    from: (b) => path.join(b, 'tokens'),
    title: 'Design tokens',
    who: 'A developer, on the first morning.',
    what: 'The system as CSS custom properties, Tailwind v4, TypeScript, DTCG JSON and Style Dictionary. Import one and the colours, type, spacing, breakpoints and motion are already right.',
    make: 'brandi tokens',
  },
  {
    id: 'canvas',
    dest: 'canvas',
    from: (b) => path.join(b, 'canvas'),
    title: 'The artboards',
    who: 'A designer picking the work up, and anyone who wants to see the system rather than read it.',
    what: 'The specification sheets and the applications, as files that open in a browser and on the design canvas.',
    make: 'brandi sheets',
  },
  {
    id: 'brand',
    dest: 'brand.json',
    from: (b) => path.join(b, 'brand.json'),
    title: 'The source of truth',
    who: 'Whoever maintains this after today.',
    what: 'Every decision, its reason, the evidence behind it and the questions still open. Everything else in this folder is generated from this one file, so this is the file to edit.',
    make: 'brandi init',
  },
]);

/** Recursive size and count, so the index can say how big a thing is. */
async function measure(target) {
  const s = await stat(target).catch(() => null);
  if (!s) return null;
  if (s.isFile()) return { files: 1, bytes: s.size };
  let files = 0;
  let bytes = 0;
  for (const entry of await readdir(target, { withFileTypes: true })) {
    const sub = await measure(path.join(target, entry.name));
    if (sub) { files += sub.files; bytes += sub.bytes; }
  }
  return { files, bytes };
}

const human = (bytes) => (bytes > 1024 * 1024
  ? `${(bytes / 1024 / 1024).toFixed(1)}MB`
  : `${Math.max(1, Math.round(bytes / 1024))}KB`);

/**
 * The front page.
 *
 * Deliberately plain HTML with no dependency on the brand's own webfonts: it
 * has to open correctly on a machine that has downloaded nothing, including a
 * printer's, which is exactly the machine most likely to open it first.
 */
function indexPage({ brandName, version, present, absent, system }) {
  const brandHex = system?.palettes?.brand?.light?.solidStrong?.hex ?? '#222222';
  const ink = system?.palettes?.neutral?.light?.steps?.[11]?.hex ?? '#1a1a1a';
  const paper = system?.palettes?.neutral?.light?.steps?.[0]?.hex ?? '#ffffff';
  const muted = system?.palettes?.neutral?.light?.steps?.[8]?.hex ?? '#666666';

  const row = (p) => `    <tr>
      <td style="padding:14px 16px 14px 0;border-bottom:1px solid rgba(0,0,0,.1);vertical-align:top">
        <a href="./${esc(p.dest)}" style="color:${brandHex};font-weight:600;text-decoration:none">${esc(p.title)}</a>
        <div style="font-family:ui-monospace,Menlo,monospace;font-size:11px;color:${muted};margin-top:3px">${esc(p.dest)}${p.size ? ` &middot; ${esc(p.size)}` : ''}</div>
      </td>
      <td style="padding:14px 16px 14px 0;border-bottom:1px solid rgba(0,0,0,.1);vertical-align:top;width:26%">${esc(p.who)}</td>
      <td style="padding:14px 0;border-bottom:1px solid rgba(0,0,0,.1);vertical-align:top;color:${muted}">${esc(p.what)}</td>
    </tr>`;

  return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="brandi: generated from the resolved system">
<title>${esc(brandName)} brand handover</title>
<style>
  body { margin:0; background:${paper}; color:${ink};
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    font-size:15px; line-height:1.55; }
  main { max-width: 940px; margin: 0 auto; padding: 64px 32px 96px; }
  h1 { font-size: 40px; line-height:1.1; letter-spacing:-.02em; margin:0 0 6px; }
  h2 { font-size: 17px; margin: 44px 0 10px; }
  .eyebrow { font-family: ui-monospace, Menlo, monospace; font-size:11px; letter-spacing:.14em;
    text-transform:uppercase; color:${muted}; }
  table { width:100%; border-collapse: collapse; text-align:left; font-size:14px; }
  th { font-family: ui-monospace, Menlo, monospace; font-size:11px; letter-spacing:.12em;
    text-transform:uppercase; color:${muted}; font-weight:400; padding:0 16px 8px 0;
    border-bottom:1px solid ${ink}; }
  .note { color:${muted}; max-width:70ch; }
  .missing { border-left:3px solid ${brandHex}; padding:12px 0 12px 16px; margin:10px 0; }
  code { font-family: ui-monospace, Menlo, monospace; font-size:13px; }
</style>
</head>
<body>
<main>
  <span class="eyebrow">${esc(brandName)}${version ? ` &middot; v${esc(version)}` : ''}</span>
  <h1>Brand handover</h1>
  <p class="note">Everything in this folder comes from one file, <code>brand.json</code>, so nothing here can disagree with anything else. If something needs to change, change it there and regenerate rather than editing the output.</p>

  <h2>What is here, and who it is for</h2>
  <table>
    <thead><tr><th>File</th><th>Who needs it</th><th>What it is</th></tr></thead>
    <tbody>
${present.map(row).join('\n')}
    </tbody>
  </table>

  ${absent.length ? `<h2>What is not here</h2>
  <p class="note">Listed rather than left out, because a handover that quietly omits something is worse than one that says what is missing.</p>
  ${absent.map((p) => `<div class="missing"><strong>${esc(p.title)}</strong><div class="note">${esc(p.what)}</div><div style="margin-top:6px">Produce it with <code>${esc(p.make)}</code></div></div>`).join('')}` : ''}

  <h2>Keeping it true</h2>
  <p class="note">Run <code>brandi check &lt;paths&gt;</code> against real work to hold it to this system: off-palette colour, off-brand type, banned vocabulary, and the patterns that read as machine-made. A brand-specific enforcement skill was written to <code>~/.claude/skills/</code> when this was built, so any future session in any project can apply it without being told the rules again.</p>
</main>
</body>
</html>
`;
}

/**
 * Assemble the package.
 *
 * `brandDir` is the brand directory, `outDir` is where the handover goes. The
 * result says what landed and what did not, and the caller decides whether a
 * partial handover is acceptable, because sometimes it is: a brand with no mark
 * yet still has a book, tokens and a canvas worth handing over.
 */
export async function buildHandoff({ brandDir, outDir, brand, system }) {
  await mkdir(outDir, { recursive: true });
  const present = [];
  const absent = [];

  // A handover is a package somebody zips and sends. Two rules follow from that
  // and neither was here: a symlink pointing outside the project must not be
  // packaged, and a symlink pointing inside must be resolved to the real file,
  // because a link survives neither the zip nor the machine at the other end.
  //
  // The first version copied links as links. `handover/assets` came out as an
  // absolute symlink to a directory outside the project, and reading through it
  // returned the outside file. The check that missed it was `grep -r`, which
  // does not follow symlinks: the verification was wrong in the same way the
  // code was.
  const insideBrand = async (candidate) => {
    try {
      const real = await realpath(candidate);
      const root = await realpath(brandDir);
      return real === root || real.startsWith(root + path.sep);
    } catch {
      return false;
    }
  };

  for (const part of PARTS) {
    const source = part.from(brandDir);
    if (!existsSync(source)) {
      absent.push(part);
      continue;
    }
    if (!await insideBrand(source)) {
      absent.push({
        ...part,
        what: `${part.what} Not packaged: it resolves outside the brand directory, and a handover carries only what belongs to the brand.`,
      });
      continue;
    }
    const dest = path.join(outDir, part.dest);
    // `dereference` turns an internal link into the real file, so the package
    // is self-contained rather than a set of pointers into somebody's machine.
    await cp(source, dest, { recursive: true, dereference: true });
    const m = await measure(dest);
    present.push({ ...part, size: m ? `${m.files === 1 ? human(m.bytes) : `${m.files} files, ${human(m.bytes)}`}` : null });
  }

  const html = indexPage({
    brandName: brand.meta?.name ?? 'Brand',
    version: brand.meta?.version ?? null,
    present,
    absent,
    system,
  });
  await writeFile(path.join(outDir, 'index.html'), html);

  return { present, absent, outDir, index: path.join(outDir, 'index.html') };
}

export default { buildHandoff, PARTS };
