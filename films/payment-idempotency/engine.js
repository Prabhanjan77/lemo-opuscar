// Portrait Canvas engine for Payment Idempotency.
// Dark Tech Keynote stage + Isometric Infographic infrastructure language.
import { clamp, lerp, seg, ss, eo, ei, eio, back, spring, hash, TAU } from '../../core/lib.js';
export { clamp, lerp, seg, ss, eo, ei, eio, back, spring, hash, TAU };

export const W = 1080, H = 1920;
export const PAL = {
  bg: '#05060A', bgLift: '#151827', panel: '#11141D', panel2: '#1B2030', panel3: '#252B3B',
  white: '#E9EAF0', dim: '#9297A8', mute: '#5E6475', line: 'rgba(233,234,240,.12)',
  violet: '#9D83FF', violetDeep: '#5D4CC2', red: '#FF5864', green: '#6EEDB3', blue: '#6E9BFF',
};
export const FONT = { ui: 'Inter, DejaVu Sans, Arial, sans-serif', mono: 'JetBrains Mono, DejaVu Sans Mono, monospace', display: 'Inter Tight, Inter, DejaVu Sans, Arial, sans-serif' };

export const rgba = (hex, a = 1) => {
  if (String(hex).startsWith('rgba')) return hex.replace(/,[^,)]*\)$/, `,${a})`);
  if (String(hex).startsWith('rgb')) return hex;
  const n = parseInt(String(hex).replace('#', ''), 16);
  return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
};
export const font = (px, weight = 500, family = 'ui') => `${weight} ${px}px ${FONT[family] || family}`;
export const rr = (g, x, y, w, h, r = 12) => {
  g.beginPath();
  if (g.roundRect) g.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2)));
  else { const q = Math.min(r, w / 2, h / 2); g.moveTo(x + q, y); g.arcTo(x + w, y, x + w, y + h, q); g.arcTo(x + w, y + h, x, y + h, q); g.arcTo(x, y + h, x, y, q); g.arcTo(x, y, x + w, y, q); }
  return g;
};

export function clear(g) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'; g.clearRect(0, 0, W, H); }
export function mix(a, b, t) { const A = parseInt(a.replace('#', ''), 16), B = parseInt(b.replace('#', ''), 16); const c = s => Math.round(lerp((A >> s) & 255, (B >> s) & 255, t)); return `rgb(${c(16)},${c(8)},${c(0)})`; }

export function glow(g, x, y, r, color = PAL.violet, a = .2) {
  if (r <= 0 || a <= 0) return;
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, rgba(color, a)); gr.addColorStop(.42, rgba(color, a * .32)); gr.addColorStop(1, rgba(color, 0));
  g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
}
export function bg(g, o = {}) {
  const lift = o.lift ?? 1, cool = o.cool ?? 1, grid = o.grid ?? 1;
  g.fillStyle = PAL.bg; g.fillRect(0, 0, W, H);
  const gr = g.createRadialGradient(W * .56, H * .22, 0, W * .56, H * .22, W * 1.05);
  gr.addColorStop(0, rgba(PAL.bgLift, .96 * lift)); gr.addColorStop(.38, rgba(PAL.bgLift, .16 * lift)); gr.addColorStop(1, rgba(PAL.bg, 0));
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  if (cool) glow(g, W * .88, H * .12, 620, PAL.blue, .065 * cool);
  if (grid) drawGrid(g, { alpha: grid, module: 48, ox: 0, oy: 0 });
}
export function drawGrid(g, o = {}) {
  const { alpha = 1, module = 48, ox = 0, oy = 0, rect = [0, 0, W, H] } = o;
  const [x, y, w, h] = rect; g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.lineWidth = 1;
  for (let i = -2; i < Math.ceil(w / module) + 2; i++) { const xx = Math.round(x + ox + i * module) + .5; g.strokeStyle = `rgba(233,234,240,${(i % 4 === 0 ? .065 : .028) * alpha})`; g.beginPath(); g.moveTo(xx, y); g.lineTo(xx, y + h); g.stroke(); }
  for (let j = -2; j < Math.ceil(h / module) + 2; j++) { const yy = Math.round(y + oy + j * module) + .5; g.strokeStyle = `rgba(233,234,240,${(j % 4 === 0 ? .065 : .028) * alpha})`; g.beginPath(); g.moveTo(x, yy); g.lineTo(x + w, yy); g.stroke(); }
  g.restore();
}
export function vignette(g, amount = .56) { const gr = g.createRadialGradient(W / 2, H / 2, H * .31, W / 2, H / 2, H * .83); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${amount})`); g.fillStyle = gr; g.fillRect(0, 0, W, H); }

export function label(g, textValue, x, y, o = {}) {
  const { size = 15, color = PAL.dim, weight = 600, family = 'mono', align = 'left', alpha = 1, tracking = 2 } = o;
  g.save(); g.globalAlpha *= alpha; g.fillStyle = color; g.font = font(size, weight, family); g.textAlign = align; g.textBaseline = 'alphabetic';
  if ('letterSpacing' in g) g.letterSpacing = `${tracking}px`; g.fillText(textValue, x, y); if ('letterSpacing' in g) g.letterSpacing = '0px'; g.restore();
}
export function title(g, textValue, x, y, o = {}) { const { size = 44, color = PAL.white, weight = 700, family = 'display', align = 'left', alpha = 1 } = o; g.save(); g.globalAlpha *= alpha; g.fillStyle = color; g.font = font(size, weight, family); g.textAlign = align; g.textBaseline = 'alphabetic'; g.fillText(textValue, x, y); g.restore(); }
export function body(g, textValue, x, y, o = {}) { const { size = 24, color = PAL.white, weight = 500, family = 'ui', align = 'left', alpha = 1 } = o; g.save(); g.globalAlpha *= alpha; g.fillStyle = color; g.font = font(size, weight, family); g.textAlign = align; g.textBaseline = 'alphabetic'; g.fillText(textValue, x, y); g.restore(); }
export function wrapText(g, str, x, y, maxW, lineH, o = {}) { const { size = 24, color = PAL.white, weight = 500, family = 'ui', align = 'left', maxLines = 3 } = o; g.save(); g.fillStyle = color; g.font = font(size, weight, family); g.textAlign = align; g.textBaseline = 'top'; const words = str.split(/\s+/); const lines = []; let line = ''; for (const word of words) { const test = line ? `${line} ${word}` : word; if (g.measureText(test).width > maxW && line) { lines.push(line); line = word; } else line = test; } if (line) lines.push(line); const out = lines.slice(0, maxLines); out.forEach((v, i) => g.fillText(v, x, y + i * lineH)); g.restore(); return out.length * lineH; }

export function panel(g, x, y, w, h, o = {}) {
  const { fill = PAL.panel, stroke = PAL.line, r = 18, alpha = 1, shadow = .45, accent = null, top = true } = o;
  g.save(); g.globalAlpha *= alpha; if (shadow) { g.shadowColor = `rgba(0,0,0,${shadow})`; g.shadowBlur = 28; g.shadowOffsetY = 12; }
  g.fillStyle = fill; rr(g, x, y, w, h, r); g.fill(); g.shadowColor = 'transparent'; g.lineWidth = 1; g.strokeStyle = stroke; rr(g, x + .5, y + .5, w - 1, h - 1, r); g.stroke();
  if (top) { g.strokeStyle = 'rgba(255,255,255,.09)'; g.beginPath(); g.moveTo(x + r, y + 1.5); g.lineTo(x + w - r, y + 1.5); g.stroke(); }
  if (accent) { g.strokeStyle = rgba(accent, .58); g.lineWidth = 2; rr(g, x, y, w, h, r); g.stroke(); glow(g, x + w / 2, y + h / 2, Math.max(w, h) * .55, accent, .08); }
  g.restore();
}
export function pill(g, x, y, w, h, textValue, o = {}) { const { fill = PAL.panel2, stroke = PAL.line, color = PAL.white, accent = null, size = 17, mono = false, alpha = 1 } = o; panel(g, x, y, w, h, { fill, stroke, r: h / 2, shadow: 0, alpha, accent }); label(g, textValue, x + w / 2, y + h / 2 + size * .35, { size, color, family: mono ? 'mono' : 'ui', weight: 600, align: 'center', tracking: mono ? 1 : 0, alpha }); }

export function line(g, pts, o = {}) { const { color = PAL.violet, width = 4, alpha = 1, dash = null, glowWidth = 0, cap = 'round', join = 'round' } = o; if (pts.length < 2) return; g.save(); g.globalAlpha *= alpha; g.strokeStyle = color; g.lineWidth = width; g.lineCap = cap; g.lineJoin = join; if (dash) g.setLineDash(dash); if (glowWidth) { g.shadowColor = rgba(color, .72); g.shadowBlur = glowWidth; } g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.stroke(); g.restore(); }
export function bezier(g, a, c1, c2, b, o = {}) { const { color = PAL.violet, width = 4, alpha = 1, dash = null, glowWidth = 0 } = o; g.save(); g.globalAlpha *= alpha; g.strokeStyle = color; g.lineWidth = width; g.lineCap = 'round'; if (dash) g.setLineDash(dash); if (glowWidth) { g.shadowColor = rgba(color, .64); g.shadowBlur = glowWidth; } g.beginPath(); g.moveTo(...a); g.bezierCurveTo(...c1, ...c2, ...b); g.stroke(); g.restore(); }
export function arrow(g, a, b, o = {}) { const { color = PAL.violet, width = 4, alpha = 1, head = 12 } = o; line(g, [a, b], { color, width, alpha }); const ang = Math.atan2(b[1] - a[1], b[0] - a[0]); line(g, [[b[0] - Math.cos(ang - .55) * head, b[1] - Math.sin(ang - .55) * head], b, [b[0] - Math.cos(ang + .55) * head, b[1] - Math.sin(ang + .55) * head]], { color, width: width * .9, alpha }); }
export function movingDot(g, p, o = {}) { const { color = PAL.violet, r = 8, alpha = 1 } = o; g.save(); g.globalAlpha *= alpha; glow(g, p[0], p[1], r * 5, color, .18); g.fillStyle = color; g.beginPath(); g.arc(p[0], p[1], r, 0, TAU); g.fill(); g.restore(); }
export function lerpPoint(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)]; }
export function polyPoint(points, t) { const n = points.length - 1; const p = clamp(t) * n; const i = Math.min(n - 1, Math.floor(p)); return lerpPoint(points[i], points[i + 1], p - i); }

export function isoProject(x, y, z, c = {}) { const { cx = W / 2, cy = H / 2, k = 1 } = c; return [cx + (x - y) * .866 * k, cy + (x + y) * .5 * k - z * k]; }
export function isoBox(g, x, y, z, w, d, h, o = {}) {
  const { k = 1, cx = W / 2, cy = H / 2, top = PAL.panel3, left = PAL.panel, right = PAL.panel2, alpha = 1, stroke = null, bias = 0 } = o;
  const p = (xx, yy, zz) => isoProject(xx, yy, zz, { cx, cy, k });
  const A = p(x, y, z + h), B = p(x + w, y, z + h), C = p(x + w, y + d, z + h), D = p(x, y + d, z + h), a = p(x, y, z), b = p(x + w, y, z), c = p(x + w, y + d, z), d0 = p(x, y + d, z);
  g.save(); g.globalAlpha *= alpha; g.lineJoin = 'round'; const fill = (pts, color) => { g.beginPath(); g.moveTo(...pts[0]); pts.slice(1).forEach(q => g.lineTo(...q)); g.closePath(); g.fillStyle = color; g.fill(); if (stroke) { g.strokeStyle = stroke; g.lineWidth = 1; g.stroke(); } };
  fill([A, B, C, D], top); fill([D, C, c, d0], left); fill([B, C, c, b], right); g.restore(); return { top: [A, B, C, D], left: [D, C, c, d0], right: [B, C, c, b], anchor: p(x + w / 2, y + d / 2, z + h) };
}
export function isoCylinder(g, x, y, z, r, h, o = {}) {
  const { k = 1, cx = W / 2, cy = H / 2, fill = PAL.panel2, top = PAL.panel3, alpha = 1, stroke = null } = o; const p = (xx, yy, zz) => isoProject(xx, yy, zz, { cx, cy, k }); const t = p(x, y, z + h), b = p(x, y, z), rx = r * .866 * k, ry = r * .5 * k;
  g.save(); g.globalAlpha *= alpha; g.fillStyle = fill; g.beginPath(); g.moveTo(t[0] - rx, t[1]); g.lineTo(t[0] + rx, t[1]); g.lineTo(b[0] + rx, b[1]); g.lineTo(b[0] - rx, b[1]); g.closePath(); g.fill(); g.fillStyle = top; g.beginPath(); g.ellipse(t[0], t[1], rx, ry, 0, 0, TAU); g.fill(); g.fillStyle = fill; g.beginPath(); g.ellipse(b[0], b[1], rx, ry, 0, 0, TAU); g.fill(); if (stroke) { g.strokeStyle = stroke; g.lineWidth = 1; g.beginPath(); g.ellipse(t[0], t[1], rx, ry, 0, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(t[0] - rx, t[1]); g.lineTo(b[0] - rx, b[1]); g.moveTo(t[0] + rx, t[1]); g.lineTo(b[0] + rx, b[1]); g.stroke(); } g.restore(); return { top: t, bottom: b }; }

export function drawPacket(g, x, y, labelText = 'REQ', o = {}) { const { color = PAL.violet, scale = 1, alpha = 1, pulse = 0, textColor = '#08090D' } = o; const w = 116 * scale, h = 50 * scale; g.save(); g.globalAlpha *= alpha; if (pulse) { g.shadowColor = rgba(color, .82); g.shadowBlur = 20 + 10 * Math.sin(pulse * 6); } rr(g, x - w / 2, y - h / 2, w, h, 13 * scale); g.fillStyle = color; g.fill(); g.shadowColor = 'transparent'; label(g, labelText, x, y + 6 * scale, { size: 15 * scale, color: textColor, family: 'mono', weight: 700, align: 'center', tracking: .6 }); g.restore(); }
export function drawKey(g, x, y, scale = 1, o = {}) { const { color = PAL.violet, alpha = 1, glowOn = 1, labelText = 'pay_123' } = o; g.save(); g.globalAlpha *= alpha; const r = 30 * scale; if (glowOn) glow(g, x, y, 120 * scale, color, .17 * glowOn); g.strokeStyle = color; g.lineWidth = 10 * scale; g.lineCap = 'round'; g.beginPath(); g.arc(x - 78 * scale, y, r, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(x - 48 * scale, y); g.lineTo(x + 122 * scale, y); g.moveTo(x + 73 * scale, y); g.lineTo(x + 73 * scale, y + 26 * scale); g.moveTo(x + 105 * scale, y); g.lineTo(x + 105 * scale, y + 26 * scale); g.stroke(); label(g, labelText, x - 78 * scale, y + 80 * scale, { size: 27 * scale, color, family: 'mono', weight: 700, align: 'center', tracking: 1 }); g.restore(); }
export function drawCheck(g, x, y, r = 34, o = {}) { const { color = PAL.green, alpha = 1, pulse = 0 } = o; g.save(); g.globalAlpha *= alpha; glow(g, x, y, r * (3.5 + Math.sin(pulse * 5) * .35), color, .18); g.fillStyle = color; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.strokeStyle = '#07100D'; g.lineWidth = Math.max(3, r * .12); g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x - r * .42, y); g.lineTo(x - r * .08, y + r * .32); g.lineTo(x + r * .5, y - r * .38); g.stroke(); g.restore(); }

export function drawPhone(g, x, y, scale = 1, o = {}) {
  const { alpha = 1, tilt = 0, screen = 'checkout', tap = 0, amount = true, frozen = false } = o; const w = 330 * scale, h = 600 * scale;
  g.save(); g.globalAlpha *= alpha; g.translate(x, y); g.rotate(tilt); g.shadowColor = 'rgba(0,0,0,.72)'; g.shadowBlur = 50 * scale; g.shadowOffsetY = 28 * scale; rr(g, -w / 2, -h / 2, w, h, 36 * scale); g.fillStyle = '#1C2130'; g.fill(); g.shadowColor = 'transparent'; g.strokeStyle = 'rgba(233,234,240,.30)'; g.lineWidth = 2 * scale; rr(g, -w / 2 + 1, -h / 2 + 1, w - 2, h - 2, 36 * scale); g.stroke(); rr(g, -w / 2 + 19 * scale, -h / 2 + 53 * scale, w - 38 * scale, h - 111 * scale, 20 * scale); g.fillStyle = '#080A10'; g.fill(); g.strokeStyle = 'rgba(233,234,240,.1)'; g.lineWidth = 1; g.stroke(); rr(g, -44 * scale, -h / 2 + 20 * scale, 88 * scale, 11 * scale, 5 * scale); g.fillStyle = '#343A4A'; g.fill(); label(g, 'CHECKOUT', -w / 2 + 45 * scale, -h / 2 + 132 * scale, { size: 16 * scale, color: PAL.dim, tracking: 2, alpha: .95 });
  if (amount) title(g, '₹2,000', -w / 2 + 45 * scale, -h / 2 + 246 * scale, { size: 55 * scale, weight: 700 }); body(g, 'one logical payment', -w / 2 + 45 * scale, -h / 2 + 285 * scale, { size: 16 * scale, color: PAL.dim });
  rr(g, -w / 2 + 35 * scale, -h / 2 + 341 * scale, w - 70 * scale, 84 * scale, 17 * scale); g.fillStyle = frozen ? PAL.panel3 : PAL.violet; g.fill(); title(g, frozen ? 'WAITING…' : 'PAY', 0, -h / 2 + 394 * scale, { size: 25 * scale, color: frozen ? PAL.dim : '#08090D', align: 'center', weight: 700 });
  g.fillStyle = PAL.violet; g.beginPath(); g.arc(w / 2 - 50 * scale, h / 2 - 85 * scale, 8 * scale, 0, TAU); g.fill(); if (tap > 0) { for (let i = 0; i < 2; i++) { const q = clamp(tap - i * .25); if (q > 0) { g.strokeStyle = rgba(PAL.violet, (1 - q) * .6); g.lineWidth = 3 * scale; g.beginPath(); g.arc(0, -h / 2 + 380 * scale, (36 + q * 45) * scale, 0, TAU); g.stroke(); } } } g.restore();
}

export function drawServer(g, x, y, scale = 1, o = {}) {
  const { alpha = 1, angle = 0, bay1 = 0, bay2 = 0, quiet = false } = o; const w = 360 * scale, h = 560 * scale; g.save(); g.globalAlpha *= alpha; g.translate(x, y); g.rotate(angle); g.shadowColor = 'rgba(0,0,0,.65)'; g.shadowBlur = 50 * scale; g.shadowOffsetY = 20 * scale; rr(g, -w / 2, -h / 2, w, h, 24 * scale); g.fillStyle = PAL.panel2; g.fill(); g.shadowColor = 'transparent'; g.strokeStyle = 'rgba(233,234,240,.16)'; g.lineWidth = 2 * scale; rr(g, -w / 2, -h / 2, w, h, 24 * scale); g.stroke();
  // left bevel plane
  g.fillStyle = 'rgba(5,6,10,.32)'; g.beginPath(); g.moveTo(-w / 2, -h / 2); g.lineTo(-w / 2 + 46 * scale, -h / 2 + 26 * scale); g.lineTo(-w / 2 + 46 * scale, h / 2 - 26 * scale); g.lineTo(-w / 2, h / 2); g.closePath(); g.fill();
  label(g, 'PAYMENT', -w / 2 + 74 * scale, -h / 2 + 66 * scale, { size: 17 * scale, color: PAL.white, tracking: 2 }); label(g, 'SERVER', -w / 2 + 74 * scale, -h / 2 + 92 * scale, { size: 17 * scale, color: PAL.dim, tracking: 2 });
  const bay = (yy, amount, col) => { panel(g, -w / 2 + 68 * scale, yy, w - 118 * scale, 106 * scale, { fill: PAL.panel, stroke: rgba(col, .56), r: 14 * scale, shadow: 0, accent: amount ? col : null }); label(g, amount ? 'CHARGE' : 'IDLE', 0, yy + 65 * scale, { size: 19 * scale, color: amount ? col : PAL.mute, family: 'mono', weight: 700, align: 'center', tracking: 1 }); };
  bay(-h / 2 + 172 * scale, bay1, bay1 > 0 ? PAL.red : null); bay(-h / 2 + 314 * scale, bay2, bay2 > 0 ? PAL.red : null);
  if (!quiet) { g.fillStyle = PAL.violet; g.beginPath(); g.arc(w / 2 - 44 * scale, h / 2 - 38 * scale, 8 * scale, 0, TAU); g.fill(); }
  g.restore();
}
export function drawDatabase(g, x, y, scale = 1, o = {}) {
  const { alpha = 1, key = null, state = null, owner = null, color = PAL.violet, cut = 0, glowOn = 0, result = null } = o; const w = 330 * scale, h = 500 * scale; g.save(); g.globalAlpha *= alpha; g.translate(x, y); const rx = w / 2, ry = 48 * scale; if (glowOn) glow(g, 0, -h * .1, 220 * scale, color, .12 * glowOn);
  // body and top; cut exposes the row.
  g.fillStyle = PAL.panel; g.beginPath(); g.moveTo(-rx, 0); g.lineTo(-rx, h - ry); g.quadraticCurveTo(0, h + ry, rx, h - ry); g.lineTo(rx, 0); g.closePath(); g.fill(); g.strokeStyle = 'rgba(233,234,240,.20)'; g.lineWidth = 2 * scale; g.stroke(); g.fillStyle = PAL.panel3; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, TAU); g.fill(); g.stroke(); g.fillStyle = '#0C0F16'; g.beginPath(); g.ellipse(0, h - ry, rx, ry, 0, 0, TAU); g.fill(); g.stroke();
  if (key) { const rowY = lerp(156, 246, cut); panel(g, -rx + 34 * scale, rowY * scale, w - 68 * scale, 116 * scale, { fill: rgba(color, .11), stroke: rgba(color, .82), r: 14 * scale, shadow: 0, accent: glowOn ? color : null, alpha: 1 }); label(g, key, 0, (rowY + 42) * scale, { size: 22 * scale, color, family: 'mono', weight: 700, align: 'center', tracking: 1 }); if (state) label(g, state, 0, (rowY + 82) * scale, { size: 18 * scale, color, family: 'mono', weight: 700, align: 'center', tracking: 1 }); if (owner) label(g, owner, 0, (rowY + 108) * scale, { size: 13 * scale, color: PAL.dim, family: 'mono', align: 'center', tracking: 1 }); }
  if (result) { panel(g, -rx + 34 * scale, 302 * scale, w - 68 * scale, 90 * scale, { fill: rgba(PAL.green, .09), stroke: rgba(PAL.green, .62), r: 14 * scale, shadow: 0 }); label(g, 'RESULT: OK', 0, 337 * scale, { size: 17 * scale, color: PAL.green, family: 'mono', weight: 700, align: 'center', tracking: 1 }); label(g, '₹2,000', 0, 368 * scale, { size: 17 * scale, color: PAL.white, family: 'mono', weight: 700, align: 'center', tracking: 1 }); }
  g.restore();
}

export function drawLedger(g, x, y, amount = '₹2,000', id = 'TXN_8F2A', color = PAL.red, alpha = 1) { g.save(); g.globalAlpha *= alpha; panel(g, x, y, 440, 92, { fill: PAL.panel, stroke: rgba(color, .64), r: 14, shadow: 0 }); label(g, id, x + 26, y + 37, { size: 17, color: PAL.dim, family: 'mono', tracking: 1 }); label(g, `${amount} · CAPTURED`, x + 26, y + 70, { size: 16, color, family: 'mono', weight: 700, tracking: 1 }); g.restore(); }
export function drawConstraint(g, x, y, w, textValue, o = {}) { const { color = PAL.red, alpha = 1, h = 72 } = o; panel(g, x, y, w, h, { fill: rgba(color, .09), stroke: rgba(color, .72), r: 14, shadow: 0, alpha }); label(g, textValue, x + w / 2, y + h / 2 + 7, { size: 18, color, family: 'mono', weight: 700, align: 'center', tracking: 1 }); }
export function drawStatus(g, x, y, textValue, o = {}) { const { color = PAL.violet, alpha = 1, w = 260, h = 60, sub = null } = o; panel(g, x - w / 2, y - h / 2, w, h, { fill: rgba(color, .10), stroke: rgba(color, .72), r: 15, shadow: 0, alpha, accent: color }); label(g, textValue, x, y + 7, { size: 20, color, family: 'mono', weight: 700, align: 'center', tracking: 1, alpha }); if (sub) label(g, sub, x, y + h / 2 + 28, { size: 13, color: PAL.dim, family: 'mono', align: 'center', tracking: 1, alpha }); }

export function drawCursor(g, x, y, scale = 1, o = {}) { const { color = PAL.violet, alpha = 1 } = o; g.save(); g.globalAlpha *= alpha; const p = new Path2D(); p.moveTo(x, y); p.lineTo(x + 14 * scale, y + 44 * scale); p.lineTo(x + 29 * scale, y + 34 * scale); p.lineTo(x + 44 * scale, y + 64 * scale); p.lineTo(x + 54 * scale, y + 58 * scale); p.lineTo(x + 38 * scale, y + 28 * scale); p.lineTo(x + 55 * scale, y + 22 * scale); p.closePath(); g.fillStyle = color; g.shadowColor = rgba(color, .75); g.shadowBlur = 22 * scale; g.fill(p); g.shadowColor = 'transparent'; g.restore(); }
export function drawLightSweep(g, p, color = PAL.violet, alpha = .4) { const x = lerp(-400, W + 400, clamp(p)); const gr = g.createLinearGradient(x - 180, 0, x + 180, 0); gr.addColorStop(0, rgba(color, 0)); gr.addColorStop(.5, rgba(color, alpha)); gr.addColorStop(1, rgba(color, 0)); g.fillStyle = gr; g.fillRect(x - 260, 0, 520, H); }
export function drawNoiseGlyphs(g, x, y, w, h, p, color = PAL.violet) { const chars = '0123456789ABCDEF'; g.save(); g.globalAlpha = .7 * (1 - p); g.font = font(18, 700, 'mono'); for (let i = 0; i < 36; i++) { const xx = x + hash(i * 2.7) * w, yy = y + hash(i * 7.1) * h; g.fillStyle = rgba(color, .18 + hash(i + 9) * .45); g.fillText(chars[Math.floor(hash(i + p * 20) * chars.length)], xx, yy); } g.restore(); }

export function caption(g, textValue, o = {}) { const { y = 1650, alpha = 1, dense = false, accent = PAL.violet } = o; const maxW = dense ? 930 : 870; g.save(); g.font = font(dense ? 28 : 30, 500, 'ui'); const words = textValue.split(/\s+/); const lines = []; let s = ''; for (const w of words) { const test = s ? `${s} ${w}` : w; if (g.measureText(test).width > maxW - 100 && s) { lines.push(s); s = w; } else s = test; } if (s) lines.push(s); const lineH = dense ? 38 : 40, h = 28 + lines.length * lineH; const x = (W - maxW) / 2; g.globalAlpha *= alpha; g.shadowColor = 'rgba(0,0,0,.62)'; g.shadowBlur = 30; rr(g, x, y, maxW, h, 18); g.fillStyle = 'rgba(8,10,15,.88)'; g.fill(); g.shadowColor = 'transparent'; g.strokeStyle = 'rgba(233,234,240,.17)'; g.lineWidth = 1; g.stroke(); g.fillStyle = accent; g.beginPath(); g.arc(x + 28, y + 27, 7, 0, TAU); g.fill(); g.fillStyle = PAL.white; g.textAlign = 'left'; g.textBaseline = 'top'; lines.forEach((v, i) => g.fillText(v, x + 52, y + 15 + i * lineH)); g.restore(); return { x, y, w: maxW, h };
}
export function captionTransition(t0, t1, t) { return Math.min(clamp((t - t0) / .16), clamp((t1 - t) / .16)); }
export function introChrome(g, scene, t, o = {}) { const { progress = 1, number = null, tone = PAL.dim } = o; label(g, `PAYMENT IDEMPOTENCY  /  ${String(number ?? '').padStart(2, '0')}`, 54, 74, { size: 16, color: tone, tracking: 2, alpha: progress }); label(g, scene.title, 54, 124, { size: 31, color: PAL.white, weight: 700, tracking: 2, alpha: progress }); label(g, scene.kicker, 56, 158, { size: 14, color: PAL.dim, tracking: 1.7, alpha: progress }); }
export function lowerRule(g, y, p = 1, color = PAL.line) { g.save(); g.strokeStyle = color; g.lineWidth = 1; g.globalAlpha *= p; g.beginPath(); g.moveTo(54, y); g.lineTo(1026, y); g.stroke(); g.restore(); }
