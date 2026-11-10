// Caching from First Principles — editorial system-design Canvas engine.
// The revision follows the reference grammar: quiet paper stage, giant typography,
// isometric service blocks, a measured timeline, and one architectural idea per shot.
import { clamp, lerp, seg, ss, eo, ei, eio, back, hash, TAU } from '../../core/lib.js';
export { clamp, lerp, seg, ss, eo, ei, eio, back, hash, TAU };

export const W = 1920, H = 1080;
export const PAL = {
  paper: '#F5F2EB', paper2: '#ECE8DF', white: '#FFFDF8', ink: '#17171B', dim: '#6E6D73',
  faint: '#B8B6B1', line: 'rgba(23,23,27,.20)', violet: '#6757D9', violetSoft: '#DCD8FA',
  red: '#DE5361', redSoft: '#F5D9DC', green: '#2C9A6D', greenSoft: '#D6EEE3',
  amber: '#C98926', amberSoft: '#F4E6C9', blue: '#3D7AAA', blueSoft: '#D9E7F1',
  faceTop: '#FFFDF8', faceLeft: '#E9E5DC', faceRight: '#D8D3C8', dark: '#17171B', dark2: '#26262D'
};
export const FONT = { ui: 'Inter, DejaVu Sans, Arial, sans-serif', display: 'Inter Tight, Inter, DejaVu Sans, Arial, sans-serif', mono: 'JetBrains Mono, DejaVu Sans Mono, monospace' };

export const rgba = (hex, a = 1) => {
  if (String(hex).startsWith('rgba')) return hex.replace(/,[^,)]*\)$/, `,${a})`);
  if (String(hex).startsWith('rgb')) return hex;
  const n = parseInt(String(hex).replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
export const font = (px, weight = 500, family = 'ui') => `${weight} ${px}px ${FONT[family] || family}`;
export const rr = (g, x, y, w, h, r = 12) => {
  g.beginPath();
  if (g.roundRect) g.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2));
  else { const q = Math.min(r, w / 2, h / 2); g.moveTo(x + q, y); g.arcTo(x + w, y, x + w, y + h, q); g.arcTo(x + w, y + h, x, y + h, q); g.arcTo(x, y + h, x, y, q); g.arcTo(x, y, x + w, y, q); }
  return g;
};

export function clear(g) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'; g.clearRect(0, 0, W, H); }
export function grid(g, o = {}) {
  const { alpha = .36, module = 64, dark = false } = o; g.save(); g.lineWidth = 1; g.strokeStyle = dark ? 'rgba(255,255,255,.08)' : 'rgba(23,23,27,.055)';
  for (let x = 0; x <= W; x += module) { g.beginPath(); g.moveTo(x + .5, 0); g.lineTo(x + .5, H); g.globalAlpha = (x / module) % 4 === 0 ? alpha : alpha * .55; g.stroke(); }
  for (let y = 0; y <= H; y += module) { g.beginPath(); g.moveTo(0, y + .5); g.lineTo(W, y + .5); g.globalAlpha = (y / module) % 4 === 0 ? alpha : alpha * .55; g.stroke(); }
  g.restore();
}
export function bg(g, o = {}) {
  const { dark = false, gridAlpha = .30 } = o; g.fillStyle = dark ? PAL.dark : PAL.paper; g.fillRect(0, 0, W, H); grid(g, { alpha: gridAlpha, dark });
  if (!dark) { const r = g.createRadialGradient(W * .62, H * .18, 0, W * .62, H * .18, 760); r.addColorStop(0, 'rgba(255,255,255,.46)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, W, H); }
}
export function vignette(g, dark = false) { if (!dark) return; const r = g.createRadialGradient(W / 2, H / 2, H * .25, W / 2, H / 2, W * .72); r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(1, 'rgba(0,0,0,.38)'); g.fillStyle = r; g.fillRect(0, 0, W, H); }

export function label(g, textValue, x, y, o = {}) {
  const { size = 15, color = PAL.dim, weight = 600, family = 'mono', align = 'left', alpha = 1, tracking = 2 } = o; g.save(); g.globalAlpha *= alpha; g.fillStyle = color; g.font = font(size, weight, family); g.textAlign = align; g.textBaseline = 'alphabetic';
  if ('letterSpacing' in g) g.letterSpacing = `${tracking}px`; g.fillText(textValue, x, y); if ('letterSpacing' in g) g.letterSpacing = '0px'; g.restore();
}
export function title(g, textValue, x, y, o = {}) { const { size = 74, color = PAL.ink, weight = 700, family = 'display', align = 'left', alpha = 1 } = o; g.save(); g.globalAlpha *= alpha; g.fillStyle = color; g.font = font(size, weight, family); g.textAlign = align; g.textBaseline = 'alphabetic'; g.fillText(textValue, x, y); g.restore(); }
export function body(g, textValue, x, y, o = {}) { const { size = 24, color = PAL.ink, weight = 500, family = 'ui', align = 'left', alpha = 1 } = o; g.save(); g.globalAlpha *= alpha; g.fillStyle = color; g.font = font(size, weight, family); g.textAlign = align; g.textBaseline = 'alphabetic'; g.fillText(textValue, x, y); g.restore(); }
export function wrapText(g, str, x, y, maxW, lineH, o = {}) {
  const { size = 24, color = PAL.ink, weight = 500, family = 'ui', align = 'left', maxLines = 3, alpha = 1 } = o; g.save(); g.globalAlpha *= alpha; g.fillStyle = color; g.font = font(size, weight, family); g.textAlign = align; g.textBaseline = 'top';
  const lines = []; let s = ''; for (const word of str.split(/\s+/)) { const test = s ? `${s} ${word}` : word; if (g.measureText(test).width > maxW && s) { lines.push(s); s = word; } else s = test; } if (s) lines.push(s); lines.slice(0, maxLines).forEach((v, i) => g.fillText(v, x, y + i * lineH)); g.restore(); return Math.min(lines.length, maxLines) * lineH;
}
export function panel(g, x, y, w, h, o = {}) {
  const { fill = PAL.white, stroke = 'rgba(23,23,27,.17)', r = 14, alpha = 1, shadow = .10, accent = null, dark = false } = o; g.save(); g.globalAlpha *= alpha;
  if (shadow) { g.shadowColor = dark ? 'rgba(0,0,0,.28)' : 'rgba(23,23,27,.16)'; g.shadowBlur = 18; g.shadowOffsetY = 8; } g.fillStyle = fill; rr(g, x, y, w, h, r); g.fill(); g.shadowColor = 'transparent'; g.lineWidth = 1.5; g.strokeStyle = accent ? rgba(accent, .62) : stroke; rr(g, x + .5, y + .5, w - 1, h - 1, r); g.stroke(); g.restore();
}
export function pill(g, x, y, w, h, textValue, o = {}) { const { fill = PAL.paper2, stroke = PAL.line, color = PAL.ink, size = 15, alpha = 1 } = o; panel(g, x, y, w, h, { fill, stroke, r: h / 2, shadow: 0, alpha, accent: o.accent }); label(g, textValue, x + w / 2, y + h / 2 + size * .34, { size, color, family: 'mono', weight: 700, align: 'center', tracking: 1, alpha }); }
export function line(g, pts, o = {}) { const { color = PAL.ink, width = 3, alpha = 1, dash = null, cap = 'round', join = 'round' } = o; if (pts.length < 2) return; g.save(); g.globalAlpha *= alpha; g.strokeStyle = color; g.lineWidth = width; g.lineCap = cap; g.lineJoin = join; if (dash) g.setLineDash(dash); g.beginPath(); g.moveTo(...pts[0]); pts.slice(1).forEach(p => g.lineTo(...p)); g.stroke(); g.restore(); }
export function bezier(g, a, c1, c2, b, o = {}) { const { color = PAL.violet, width = 4, alpha = 1, dash = null } = o; g.save(); g.globalAlpha *= alpha; g.strokeStyle = color; g.lineWidth = width; g.lineCap = 'round'; if (dash) g.setLineDash(dash); g.beginPath(); g.moveTo(...a); g.bezierCurveTo(...c1, ...c2, ...b); g.stroke(); g.restore(); }
export function arrow(g, a, b, o = {}) { const { color = PAL.ink, width = 3, alpha = 1, head = 12 } = o; line(g, [a, b], { color, width, alpha }); const ang = Math.atan2(b[1] - a[1], b[0] - a[0]); line(g, [[b[0] - Math.cos(ang - .55) * head, b[1] - Math.sin(ang - .55) * head], b, [b[0] - Math.cos(ang + .55) * head, b[1] - Math.sin(ang + .55) * head]], { color, width, alpha }); }
export function movingDot(g, p, o = {}) { const { color = PAL.violet, r = 7, alpha = 1 } = o; g.save(); g.globalAlpha *= alpha; g.fillStyle = color; g.beginPath(); g.arc(p[0], p[1], r, 0, TAU); g.fill(); g.restore(); }
export function lerpPoint(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)]; }
export function polyPoint(points, t) { const n = points.length - 1, p = clamp(t) * n, i = Math.min(n - 1, Math.floor(p)); return lerpPoint(points[i], points[i + 1], p - i); }

export function isoProject(x, y, z, c = {}) { const { cx = W / 2, cy = H / 2, k = 1 } = c; return [cx + (x - y) * .866 * k, cy + (x + y) * .5 * k - z * k]; }
export function isoShadow(g, x, y, rx, ry, alpha = .15) { g.save(); g.fillStyle = `rgba(23,23,27,${alpha})`; g.filter = 'blur(10px)'; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill(); g.filter = 'none'; g.restore(); }
export function isoBox(g, x, y, z, w, d, h, o = {}) {
  const { cx = W / 2, cy = H / 2, k = 1, top = PAL.faceTop, left = PAL.faceLeft, right = PAL.faceRight, stroke = PAL.ink, alpha = 1, dash = null } = o; const p = (xx, yy, zz) => isoProject(xx, yy, zz, { cx, cy, k });
  const A = p(x, y, z + h), B = p(x + w, y, z + h), C = p(x + w, y + d, z + h), D = p(x, y + d, z + h), b = p(x + w, y, z), c = p(x + w, y + d, z), d0 = p(x, y + d, z);
  g.save(); g.globalAlpha *= alpha; g.lineJoin = 'round'; const fill = (pts, color) => { g.beginPath(); g.moveTo(...pts[0]); pts.slice(1).forEach(q => g.lineTo(...q)); g.closePath(); g.fillStyle = color; g.fill(); g.strokeStyle = stroke; g.lineWidth = 1.8; if (dash) g.setLineDash(dash); g.stroke(); };
  fill([A, B, C, D], top); fill([D, C, c, d0], left); fill([B, C, c, b], right); g.restore(); return { top: [A, B, C, D], anchor: p(x + w / 2, y + d / 2, z + h) };
}
export function drawCube(g, x, y, s = 1, o = {}) {
  const { name = 'API', sub = 'SERVICE', accent = PAL.violet, alpha = 1, ghost = false, fill = null } = o; isoShadow(g, x, y + 86 * s, 150 * s, 22 * s, ghost ? .05 : .14);
  isoBox(g, 0, 0, 0, 170 * s, 100 * s, 76 * s, { cx: x, cy: y, k: 1, top: fill || PAL.faceTop, left: ghost ? PAL.paper2 : PAL.faceLeft, right: ghost ? '#E4E1D9' : PAL.faceRight, stroke: ghost ? 'rgba(23,23,27,.25)' : PAL.ink, alpha });
  label(g, name, x, y + 28 * s, { size: 18 * s, color: ghost ? PAL.dim : PAL.ink, weight: 700, align: 'center', tracking: 1.6, alpha }); label(g, sub, x, y + 50 * s, { size: 12 * s, color: ghost ? PAL.faint : PAL.dim, family: 'mono', align: 'center', tracking: 1, alpha });
  if (accent && !ghost) { g.save(); g.globalAlpha *= alpha; g.fillStyle = accent; g.beginPath(); g.arc(x - 45 * s, y + 16 * s, 5 * s, 0, TAU); g.fill(); g.restore(); }
}
export function drawDisk(g, x, y, s = 1, o = {}) { const { alpha = 1, read = 0, ghost = false } = o; g.save(); g.globalAlpha *= alpha; isoShadow(g, x, y + 37 * s, 150 * s, 18 * s, ghost ? .04 : .12); g.fillStyle = ghost ? PAL.paper2 : PAL.faceLeft; g.strokeStyle = ghost ? 'rgba(23,23,27,.25)' : PAL.ink; g.lineWidth = 1.8; g.beginPath(); g.ellipse(x, y, 125 * s, 34 * s, 0, 0, TAU); g.fill(); g.stroke(); g.fillStyle = ghost ? '#DDD9D1' : PAL.faceRight; g.beginPath(); g.ellipse(x, y - 4 * s, 94 * s, 23 * s, 0, 0, TAU); g.fill(); g.stroke(); g.fillStyle = PAL.paper; g.beginPath(); g.ellipse(x, y - 4 * s, 23 * s, 7 * s, 0, 0, TAU); g.fill(); g.stroke(); line(g, [[x - 88 * s, y - 4 * s], [x + 88 * s, y - 4 * s]], { color: read ? PAL.red : PAL.dim, width: 2 * s, alpha: read ? 1 : .55 }); label(g, 'DISK', x, y + 58 * s, { size: 13 * s, color: read ? PAL.red : PAL.dim, family: 'mono', align: 'center', tracking: 1.2 }); g.restore(); }
export function drawBrowser(g, x, y, s = 1, o = {}) {
  const { alpha = 1, profile = true, click = 0, response = null } = o; g.save(); g.globalAlpha *= alpha; isoShadow(g, x, y + 120 * s, 190 * s, 20 * s, .13); isoBox(g, 0, 0, 0, 300 * s, 165 * s, 18 * s, { cx: x, cy: y + 110 * s, k: 1, top: PAL.paper2, left: '#DFDBD3', right: '#D0CBC2', stroke: PAL.ink });
  panel(g, x - 160 * s, y - 105 * s, 320 * s, 220 * s, { fill: PAL.white, stroke: PAL.ink, r: 14 * s, shadow: .12, alpha: 1 }); g.fillStyle = PAL.paper2; rr(g, x - 160 * s, y - 105 * s, 320 * s, 34 * s, 14 * s); g.fill(); g.fillStyle = PAL.red; g.beginPath(); g.arc(x - 139 * s, y - 88 * s, 5 * s, 0, TAU); g.fill(); g.fillStyle = PAL.amber; g.beginPath(); g.arc(x - 121 * s, y - 88 * s, 5 * s, 0, TAU); g.fill(); g.fillStyle = PAL.green; g.beginPath(); g.arc(x - 103 * s, y - 88 * s, 5 * s, 0, TAU); g.fill(); label(g, 'PROFILE', x - 68 * s, y - 84 * s, { size: 11 * s, color: PAL.dim, tracking: 1, alpha });
  if (profile) { g.fillStyle = PAL.violetSoft; g.beginPath(); g.arc(x - 104 * s, y - 22 * s, 28 * s, 0, TAU); g.fill(); g.fillStyle = PAL.violet; g.beginPath(); g.arc(x - 104 * s, y - 32 * s, 10 * s, 0, TAU); g.fill(); title(g, 'AANYA RAO', x - 60 * s, y - 22 * s, { size: 18 * s, color: PAL.ink, weight: 700, alpha }); label(g, '@aanyarao', x - 60 * s, y - 2 * s, { size: 11 * s, color: PAL.dim, tracking: .7, alpha }); label(g, response ? response.toUpperCase() : 'CELEBRITY PROFILE', x - 104 * s, y + 42 * s, { size: 11 * s, color: response === 'hit' ? PAL.green : PAL.dim, family: 'mono', align: 'center', tracking: 1, alpha }); panel(g, x + 58 * s, y + 12 * s, 66 * s, 28 * s, { fill: response === 'hit' ? PAL.greenSoft : PAL.paper2, stroke: response === 'hit' ? PAL.green : PAL.line, r: 14 * s, shadow: 0 }); label(g, 'VIEW', x + 91 * s, y + 30 * s, { size: 10 * s, color: response === 'hit' ? PAL.green : PAL.ink, family: 'mono', align: 'center', tracking: 1 }); }
  if (click) { g.save(); g.globalAlpha = click * alpha; g.strokeStyle = PAL.red; g.lineWidth = 3 * s; g.beginPath(); g.arc(x + 88 * s, y + 58 * s, 20 * s * click, 0, TAU); g.stroke(); g.restore(); }
  g.restore();
}
export function drawCursor(g, x, y, s = 1, o = {}) { const { alpha = 1, color = PAL.ink, click = 0 } = o; g.save(); g.globalAlpha *= alpha; const p = new Path2D(); p.moveTo(x, y); p.lineTo(x + 13 * s, y + 35 * s); p.lineTo(x + 27 * s, y + 28 * s); p.lineTo(x + 39 * s, y + 51 * s); p.lineTo(x + 48 * s, y + 46 * s); p.lineTo(x + 34 * s, y + 23 * s); p.lineTo(x + 49 * s, y + 18 * s); p.closePath(); g.fillStyle = color; g.fill(p); if (click) { g.strokeStyle = PAL.red; g.lineWidth = 2; g.beginPath(); g.arc(x + 20 * s, y + 24 * s, 34 * s * click, 0, TAU); g.stroke(); } g.restore(); }
export function drawPacket(g, x, y, textValue, o = {}) { const { color = PAL.violet, alpha = 1, scale = 1, fill = null } = o; const w = Math.max(70, textValue.length * 8 + 25) * scale, h = 27 * scale; panel(g, x - w / 2, y - h / 2, w, h, { fill: fill || (color === PAL.green ? PAL.greenSoft : color === PAL.red ? PAL.redSoft : PAL.violetSoft), stroke: color, r: h / 2, shadow: 0, alpha }); label(g, textValue, x, y + 4 * scale, { size: 11 * scale, color, family: 'mono', weight: 700, align: 'center', tracking: .8, alpha }); }
export function drawRuler(g, x, y, w, segments, o = {}) { const { alpha = 1, color = PAL.dim } = o; line(g, [[x, y], [x + w, y]], { color, width: 2, alpha }); let cursor = x; segments.forEach((s, i) => { const sw = w * s.value / segments.reduce((a, b) => a + b.value, 0); line(g, [[cursor, y - 10], [cursor, y + 10]], { color: s.color || color, width: 2, alpha }); label(g, s.label, cursor + sw / 2, y + 34, { size: 12, color: s.color || color, family: 'mono', align: 'center', tracking: .6, alpha }); cursor += sw; }); line(g, [[x + w, y - 10], [x + w, y + 10]], { color, width: 2, alpha }); }
export function drawClock(g, x, y, r, p, o = {}) { const { color = PAL.amber, alpha = 1 } = o; g.save(); g.globalAlpha *= alpha; g.strokeStyle = rgba(color, .22); g.lineWidth = 10; g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke(); g.strokeStyle = color; g.beginPath(); g.arc(x, y, r, -.5, -.5 + TAU * clamp(p)); g.stroke(); g.restore(); label(g, 'TTL', x, y - 2, { size: 13, color, family: 'mono', align: 'center', tracking: 1, alpha }); label(g, '60 s', x, y + 23, { size: 20, color, family: 'mono', weight: 700, align: 'center', tracking: 1, alpha }); }
export function caption(g, textValue, o = {}) { const { y = 958, alpha = 1, accent = PAL.violet } = o; const maxW = 1470; g.save(); g.font = font(25, 500, 'ui'); const words = textValue.split(/\s+/), lines = []; let s = ''; for (const w of words) { const test = s ? `${s} ${w}` : w; if (g.measureText(test).width > maxW - 90 && s) { lines.push(s); s = w; } else s = test; } if (s) lines.push(s); const h = 22 + lines.length * 33, x = (W - maxW) / 2; g.globalAlpha *= alpha; g.fillStyle = rgba(PAL.paper, .94); rr(g, x, y, maxW, h, 10); g.fill(); g.strokeStyle = rgba(PAL.ink, .18); g.lineWidth = 1; g.stroke(); g.fillStyle = accent; g.beginPath(); g.arc(x + 25, y + 22, 6, 0, TAU); g.fill(); g.fillStyle = PAL.ink; g.textAlign = 'left'; g.textBaseline = 'top'; lines.forEach((v, i) => g.fillText(v, x + 46, y + 10 + i * 33)); g.restore(); }
export function captionTransition(t0, t1, t) { return Math.min(clamp((t - t0) / .18), clamp((t1 - t) / .18)); }
export function lightSweep(g, p, color = PAL.violet, alpha = .14) { const x = lerp(-400, W + 400, clamp(p)); const gr = g.createLinearGradient(x - 190, 0, x + 190, 0); gr.addColorStop(0, rgba(color, 0)); gr.addColorStop(.5, rgba(color, alpha)); gr.addColorStop(1, rgba(color, 0)); g.fillStyle = gr; g.fillRect(x - 240, 0, 480, H); }
