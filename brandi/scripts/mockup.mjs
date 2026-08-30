/**
 * Put the brand on a real photograph, at the angle the surface actually sits.
 *
 * ===================== THE FAILURE THIS EXISTS FOR =====================
 *
 * The application artboards showed artwork on flat colour fields. A signage
 * board was an orange rectangle with type on it. That answers "what is the
 * artwork" and never answers "what does this look like on the thing", which is
 * the only question a client is actually asking, and the one they will ask in
 * the first minute of the presentation.
 *
 * The first attempt at fixing that by hand is the reason this file is shaped the
 * way it is. Artwork was placed using percentages estimated from looking at a
 * photograph, and it landed on grass and a tow bar. Two separate corrections to
 * the photograph's rotation both went the wrong way. Nothing was wrong with the
 * arithmetic; the inputs were guesses, and a mockup built from guessed inputs is
 * worse than no mockup because it looks finished.
 *
 * So placement is NOT computed. Somebody reads the four corners of the surface
 * off a grid rendered over the real photograph, and those four numbers are
 * recorded. Everything after that is deterministic: four corners define a
 * projective transform exactly, and the artwork is mapped onto them.
 *
 * ============================ THE ARITHMETIC ===========================
 *
 * Mapping a rectangle onto an arbitrary quadrilateral is a homography, and it is
 * the correct transform rather than an approximation: a flat panel photographed
 * from an angle IS a projective image of a rectangle. A skew or a rotate cannot
 * express it, which is why hand-tuned `skewY` never quite sits down on the
 * surface. Eight unknowns, eight equations from four point pairs, solved by
 * elimination, then emitted as a CSS `matrix3d` that a browser applies on the
 * GPU with no library involved.
 */

/**
 * Solve the 8x8 system for the projective transform taking the unit square to
 * `dst`, by Gaussian elimination with partial pivoting.
 *
 * Partial pivoting is not decoration. Without it a surface whose top edge is
 * exactly horizontal, which is most shopfronts, puts a zero on the diagonal and
 * the solve divides by it.
 */
function solve(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
    }
    if (Math.abs(M[pivot][col]) < 1e-12) return null; // degenerate: not four distinct corners
    [M[col], M[pivot]] = [M[pivot], M[col]];
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = M[r][col] / M[col][col];
      if (!f) continue;
      for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c];
    }
  }
  return M.map((row, i) => row[n] / row[i][i] ?? 0).map((v, i) => M[i][n] / M[i][i]);
}

/**
 * The projective transform taking the unit square (0,0)-(1,0)-(1,1)-(0,1) onto
 * four destination points, given clockwise from the top left.
 *
 * Returns the eight coefficients of
 *   x' = (ax + by + c) / (gx + hy + 1)
 *   y' = (dx + ey + f) / (gx + hy + 1)
 */
export function homography(dst) {
  if (!Array.isArray(dst) || dst.length !== 4) return null;
  for (const p of dst) {
    if (!Array.isArray(p) || p.length !== 2 || !Number.isFinite(p[0]) || !Number.isFinite(p[1])) return null;
  }
  const src = [[0, 0], [1, 0], [1, 1], [0, 1]];
  const A = [];
  const b = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [X, Y] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -x * X, -y * X]); b.push(X);
    A.push([0, 0, 0, x, y, 1, -x * Y, -y * Y]); b.push(Y);
  }
  return solve(A, b);
}

/** Where the transform sends a point in the unit square. Used to verify it. */
export function project(h, [x, y]) {
  const [a, b, c, d, e, f, g, i] = h;
  const w = g * x + i * y + 1;
  return [(a * x + b * y + c) / w, (d * x + e * y + f) / w];
}

/**
 * The same transform as a CSS `matrix3d`.
 *
 * CSS takes a 4x4 in COLUMN-major order, and the perspective terms live in the
 * fourth row of that layout rather than where a 3x3 would put them. Getting that
 * wrong produces a transform that looks almost right and shears under any
 * rotation, which is the kind of wrong that survives review.
 */
export function toMatrix3d(h) {
  if (!h) return null;
  const [a, b, c, d, e, f, g, i] = h;
  const m = [
    a, d, 0, g,
    b, e, 0, i,
    0, 0, 1, 0,
    c, f, 0, 1,
  ];
  return `matrix3d(${m.map((v) => (Math.abs(v) < 1e-10 ? 0 : +v.toFixed(6))).join(', ')})`;
}

/**
 * A quadrilateral has to be four distinct, non-collinear points wound one way.
 * A crossed quad renders as a bow tie, which is a real thing to type by hand.
 */
export function validateCorners(corners) {
  const h = homography(corners);
  if (!h) return { ok: false, reason: 'Not four usable corners: they must be distinct and not in a line.' };
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const signs = corners.map((_, k) => Math.sign(cross(
    corners[k], corners[(k + 1) % 4], corners[(k + 2) % 4],
  )));
  if (new Set(signs.filter(Boolean)).size > 1) {
    return { ok: false, reason: 'The corners cross over. Give them clockwise from the top left of the surface.' };
  }
  return { ok: true, homography: h, matrix3d: toMatrix3d(h) };
}

/**
 * A page showing the photograph under a percentage grid, so corners are READ off
 * the picture rather than estimated from a description of it.
 *
 * `rotate` is applied here because a phone photograph is frequently stored one
 * way and meant to be seen another, and the corners must be read from the
 * picture as it will be composited, not as it happens to be stored.
 */
export function gridPage({ photo, width, height, rotate = 0, step = 5, frameWidth = 1400 }) {
  const swap = rotate === 90 || rotate === 270;
  const [sw, sh] = swap ? [height, width] : [width, height];
  // Identical framing to `mockupBody`, or a corner read here means something
  // different there.
  const scale = sw > frameWidth ? frameWidth / sw : 1;
  const w = Math.round(sw * scale);
  const h = Math.round(sh * scale);
  const lines = [];
  for (let p = 0; p <= 100; p += step) {
    lines.push(`<div class="v" style="left:${p}%"></div><div class="h" style="top:${p}%"></div>`);
  }
  const labels = [];
  for (let x = 0; x <= 100; x += step * 2) {
    for (let y = 0; y <= 100; y += step * 2) {
      labels.push(`<b style="left:${x}%;top:${y}%">${x},${y}</b>`);
    }
  }
  return `<!doctype html>
<meta charset="utf-8">
<title>Read the corners off this</title>
<style>
  html,body{margin:0;background:#111;font:12px ui-monospace,Menlo,monospace}
  .f{position:relative;width:${w}px;height:${h}px;overflow:hidden}
  .f img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;
    transform:rotate(${rotate}deg)}
  .v{position:absolute;top:0;bottom:0;width:1px;background:rgba(0,255,120,.5)}
  .h{position:absolute;left:0;right:0;height:1px;background:rgba(0,255,120,.5)}
  b{position:absolute;color:#0f8;background:rgba(0,0,0,.65);padding:1px 3px;font-weight:400;
    transform:translate(2px,2px)}
  .n{position:fixed;left:0;right:0;bottom:0;background:#000;color:#0f8;padding:10px 14px;line-height:1.5}
</style>
<div class="f">
  <img src="${photo}" alt="">
  ${lines.join('')}
  ${labels.join('')}
</div>
<div class="n">Read the FOUR CORNERS of the surface the artwork goes on, clockwise from its top left,
as x,y percentages. Record them and the mockup is deterministic from there.</div>
`;
}

/**
 * The composited mockup body.
 *
 * The artwork is laid out in a 1000-unit-wide box and then mapped onto the
 * recorded corners, so it can be authored at a comfortable size without anybody
 * doing arithmetic about the photograph's dimensions.
 *
 * `multiply` is the default blend because a wrap, a painted sign and a printed
 * panel all take the surface's own shading and highlights. A sticker or a
 * backlit sign sits on top instead, which is what `blend: "normal"` is for.
 */
export function mockupBody({
  photo, width, height, rotate = 0, surfaces = [], caption = null, frameWidth = 1400,
}) {
  const swap = rotate === 90 || rotate === 270;
  const [srcW, srcH] = swap ? [height, width] : [width, height];
  // An artboard must not inherit the source's dimensions. A phone photograph is
  // 5712px wide, and a 5712px frame on a canvas is a frame nobody can see at a
  // useful zoom. Corners are percentages, so scaling the frame costs nothing.
  const scale = srcW > frameWidth ? frameWidth / srcW : 1;
  const w = Math.round(srcW * scale);
  const h = Math.round(srcH * scale);

  const panels = surfaces.map((s) => {
    // Corners are recorded as PERCENTAGES, because that is what the grid page
    // shows and what somebody reads off it. Pixels would be a second unit to
    // convert by hand, and a hand conversion is a place to be wrong.
    const px = (s.corners ?? []).map((c) => [(c[0] / 100) * w, (c[1] / 100) * h]);
    const check = validateCorners(px);
    if (!check.ok) {
      return `  <div style="position:absolute;left:4%;top:4%;max-width:40%;background:#7f1d1d;color:#fff;padding:10px 12px;font:13px system-ui">
    ${escapeHtml(s.name ?? 'surface')}: ${escapeHtml(check.reason)}
  </div>`;
    }
    const aspect = s.aspect ?? 0.4;
    const boxH = Math.round(1000 * aspect);
    // CSS applies transforms RIGHT TO LEFT, so the artwork is shrunk to the unit
    // square FIRST and the homography maps that unit square onto the corners.
    // Written the other way round it scaled a 1000px box and then projected it,
    // which put a corner of the artwork's border across the whole frame and read
    // as "the transform is broken" rather than "the composition is inverted".
    return `  <div style="position:absolute;left:0;top:0;width:${w}px;height:${h}px;pointer-events:none">
    <div style="position:absolute;left:0;top:0;width:1000px;height:${boxH}px;
      transform-origin:0 0;
      transform:${check.matrix3d} scale(${(1 / 1000).toFixed(8)},${(1 / boxH).toFixed(8)});
      mix-blend-mode:${s.blend ?? 'multiply'};opacity:${s.opacity ?? 0.96}">
${s.artwork ?? ''}
    </div>
  </div>`;
  }).join('\n');

  // No photograph is a legitimate state while corners are being checked. An
  // <img> with an empty src renders a broken-image icon and nothing else, which
  // looks like the mockup failed rather than like the photo is not wired yet.
  // `object-fit: contain` rather than explicit dimensions, deliberately.
  //
  // A reader of the file header and a browser can disagree about a photograph's
  // orientation, because EXIF and ISOBMFF `irot` are different mechanisms and
  // not every tool honours both. Setting explicit width and height forces one
  // opinion and distorts silently when it is the wrong one. Containing it means
  // a disagreement shows up as letterboxing, which somebody can see, and the
  // corners stay percentages of the FRAME either way.
  const plate = photo
    ? `  <img src="${escapeHtml(photo)}" alt="" style="position:absolute;inset:0;
    width:100%;height:100%;object-fit:contain;transform:rotate(${rotate}deg)">`
    : `  <div style="position:absolute;inset:0;background:repeating-linear-gradient(45deg,#1a1a1a,#1a1a1a 12px,#222 12px,#222 24px)"></div>`;

  return `<div style="position:relative;width:${w}px;height:${h}px;overflow:hidden;background:#111">
${plate}
${panels}
${caption ? `  <div style="position:absolute;left:0;right:0;bottom:0;padding:16px 20px;background:rgba(12,12,12,.86);color:#fff;font:13px/1.5 system-ui,sans-serif">${escapeHtml(caption)}</div>` : ''}
</div>`;
}

const escapeHtml = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export default { homography, project, toMatrix3d, validateCorners, gridPage, mockupBody };
