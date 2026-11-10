// Caching from First Principles — landscape Canvas stage.
// Shared Lemo-Opuscar grammar: Dark Tech Keynote + Living Screencast + Desktop Flythrough + Exploded Teardown.
import { clamp, lerp, seg, ss, eo, ei, eio, back, spring, hash, TAU } from '../../core/lib.js';
export { clamp, lerp, seg, ss, eo, ei, eio, back, spring, hash, TAU };

export const W = 1920, H = 1080;
export const PAL = {
  bg: '#05070D', bgLift: '#151C2C', panel: '#101622', panel2: '#1A2435', panel3: '#2A3850',
  white: '#EEF1F7', dim: '#9AA5B9', mute: '#5D687C', line: 'rgba(238,241,247,.14)',
  violet: '#9D83FF', violetDeep: '#5C4AB8', red: '#FF5864', green: '#6EEDB3', cyan: '#71C7FF',
  amber: '#FFC66D', disk: '#B0B7C7', black: '#070A11'
};
export const FONT = {
  ui: 'Inter, DejaVu Sans, Arial, sans-serif',
  display: 'Inter Tight, Inter, DejaVu Sans, Arial, sans-serif',
  mono: 'JetBrains Mono, DejaVu Sans Mono, monospace'
};

export const rgba = (hex, a = 1) => {
  if (String(hex).startsWith('rgba')) return hex.replace(/,[^,)]*\)$/, `,${a})`);
  if (String(hex).startsWith('rgb')) return hex;
  const n = parseInt(String(hex).replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
export const font = (px, weight = 500, family = 'ui') => `${weight} ${px}px ${FONT[family] || family}`;
export const rr = (g, x, y, w, h, r = 12) => {
  g.beginPath();
  if (g.roundRect) g.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2)));
  else {
    const q = Math.min(r, w / 2, h / 2); g.moveTo(x + q, y); g.arcTo(x + w, y, x + w, y + h, q);
    g.arcTo(x + w, y + h, x, y + h, q); g.arcTo(x, y + h, x, y, q); g.arcTo(x, y, x + w, y, q);
  }
  return g;
};

export function clear(g) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'; g.clearRect(0, 0, W, H); }
export function glow(g, x, y, r, color = PAL.violet, a = .2) {
  if (r <= 0 || a <= 0) return;
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, rgba(color, a)); gr.addColorStop(.42, rgba(color, a * .30)); gr.addColorStop(1, rgba(color, 0));
  g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
}
export function drawGrid(g, o = {}) {
  const { alpha = 1, module = 48, ox = 0, oy = 0, rect = [0, 0, W, H] } = o;
  const [x, y, w, h] = rect; g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.lineWidth = 1;
  for (let i = -2; i < Math.ceil(w / module) + 2; i++) {
    const xx = Math.round(x + ox + i * module) + .5; g.strokeStyle = `rgba(238,241,247,${(i % 4 === 0 ? .062 : .024) * alpha})`;
    g.beginPath(); g.moveTo(xx, y); g.lineTo(xx, y + h); g.stroke();
  }
  for (let j = -2; j < Math.ceil(h / module) + 2; j++) {
    const yy = Math.round(y + oy + j * module) + .5; g.strokeStyle = `rgba(238,241,247,${(j % 4 === 0 ? .062 : .024) * alpha})`;
    g.beginPath(); g.moveTo(x, yy); g.lineTo(x + w, yy); g.stroke();
  }
  g.restore();
}
export function bg(g, o = {}) {
  const { lift = 1, cool = 1, grid = 1 } = o;
  g.fillStyle = PAL.bg; g.fillRect(0, 0, W, H);
  const gr = g.createRadialGradient(W * .55, H * .22, 0, W * .55, H * .22, W * .78);
  gr.addColorStop(0, rgba(PAL.bgLift, .92 * lift)); gr.addColorStop(.42, rgba(PAL.bgLift, .12 * lift)); gr.addColorStop(1, rgba(PAL.bg, 0));
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  if (cool) glow(g, W * .85, H * .12, 540, PAL.cyan, .045 * cool);
  if (grid) drawGrid(g, { alpha: grid, module: 48 });
}
export function vignette(g, amount = .5) {
  const gr = g.createRadialGradient(W / 2, H / 2, H * .30, W / 2, H / 2, W * .64);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${amount})`); g.fillStyle = gr; g.fillRect(0, 0, W, H);
}

export function label(g, textValue, x, y, o = {}) {
  const { size = 15, color = PAL.dim, weight = 600, family = 'mono', align = 'left', alpha = 1, tracking = 2 } = o;
  g.save(); g.globalAlpha *= alpha; g.fillStyle = color; g.font = font(size, weight, family); g.textAlign = align; g.textBaseline = 'alphabetic';
  if ('letterSpacing' in g) g.letterSpacing = `${tracking}px`; g.fillText(textValue, x, y); if ('letterSpacing' in g) g.letterSpacing = '0px'; g.restore();
}
export function title(g, textValue, x, y, o = {}) {
  const { size = 46, color = PAL.white, weight = 700, family = 'display', align = 'left', alpha = 1 } = o;
  g.save(); g.globalAlpha *= alpha; g.fillStyle = color; g.font = font(size, weight, family); g.textAlign = align; g.textBaseline = 'alphabetic'; g.fillText(textValue, x, y); g.restore();
}
export function body(g, textValue, x, y, o = {}) {
  const { size = 24, color = PAL.white, weight = 500, family = 'ui', align = 'left', alpha = 1 } = o;
  g.save(); g.globalAlpha *= alpha; g.fillStyle = color; g.font = font(size, weight, family); g.textAlign = align; g.textBaseline = 'alphabetic'; g.fillText(textValue, x, y); g.restore();
}
export function wrapText(g, str, x, y, maxW, lineH, o = {}) {
  const { size = 24, color = PAL.white, weight = 500, family = 'ui', align = 'left', maxLines = 3, alpha = 1 } = o;
  g.save(); g.globalAlpha *= alpha; g.fillStyle = color; g.font = font(size, weight, family); g.textAlign = align; g.textBaseline = 'top';
  const words = str.split(/\s+/), lines = []; let lineText = '';
  for (const word of words) { const test = lineText ? `${lineText} ${word}` : word; if (g.measureText(test).width > maxW && lineText) { lines.push(lineText); lineText = word; } else lineText = test; }
  if (lineText) lines.push(lineText); lines.slice(0, maxLines).forEach((v, i) => g.fillText(v, x, y + i * lineH)); g.restore(); return Math.min(lines.length, maxLines) * lineH;
}
export function panel(g, x, y, w, h, o = {}) {
  const { fill = PAL.panel, stroke = PAL.line, r = 18, alpha = 1, shadow = .42, accent = null, top = true } = o;
  g.save(); g.globalAlpha *= alpha; if (shadow) { g.shadowColor = `rgba(0,0,0,${shadow})`; g.shadowBlur = 28; g.shadowOffsetY = 14; }
  g.fillStyle = fill; rr(g, x, y, w, h, r); g.fill(); g.shadowColor = 'transparent'; g.lineWidth = 1; g.strokeStyle = stroke; rr(g, x + .5, y + .5, w - 1, h - 1, r); g.stroke();
  if (top) { g.strokeStyle = 'rgba(255,255,255,.10)'; g.beginPath(); g.moveTo(x + r, y + 1.5); g.lineTo(x + w - r, y + 1.5); g.stroke(); }
  if (accent) { g.strokeStyle = rgba(accent, .58); g.lineWidth = 2; rr(g, x, y, w, h, r); g.stroke(); glow(g, x + w / 2, y + h / 2, Math.max(w, h) * .46, accent, .055); }
  g.restore();
}
export function pill(g, x, y, w, h, textValue, o = {}) {
  const { fill = PAL.panel2, stroke = PAL.line, color = PAL.white, accent = null, size = 16, mono = false, alpha = 1 } = o;
  panel(g, x, y, w, h, { fill, stroke, r: h / 2, shadow: 0, alpha, accent });
  label(g, textValue, x + w / 2, y + h / 2 + size * .35, { size, color, family: mono ? 'mono' : 'ui', weight: 700, align: 'center', tracking: mono ? 1 : 0, alpha });
}
export function line(g, pts, o = {}) {
  const { color = PAL.violet, width = 4, alpha = 1, dash = null, glowWidth = 0, cap = 'round', join = 'round' } = o;
  if (pts.length < 2) return; g.save(); g.globalAlpha *= alpha; g.strokeStyle = color; g.lineWidth = width; g.lineCap = cap; g.lineJoin = join; if (dash) g.setLineDash(dash);
  if (glowWidth) { g.shadowColor = rgba(color, .72); g.shadowBlur = glowWidth; }
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.stroke(); g.restore();
}
export function bezier(g, a, c1, c2, b, o = {}) {
  const { color = PAL.violet, width = 4, alpha = 1, dash = null, glowWidth = 0 } = o;
  g.save(); g.globalAlpha *= alpha; g.strokeStyle = color; g.lineWidth = width; g.lineCap = 'round'; if (dash) g.setLineDash(dash); if (glowWidth) { g.shadowColor = rgba(color, .64); g.shadowBlur = glowWidth; }
  g.beginPath(); g.moveTo(...a); g.bezierCurveTo(...c1, ...c2, ...b); g.stroke(); g.restore();
}
export function arrow(g, a, b, o = {}) {
  const { color = PAL.violet, width = 4, alpha = 1, head = 13 } = o; line(g, [a, b], { color, width, alpha });
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  line(g, [[b[0] - Math.cos(ang - .55) * head, b[1] - Math.sin(ang - .55) * head], b, [b[0] - Math.cos(ang + .55) * head, b[1] - Math.sin(ang + .55) * head]], { color, width: width * .9, alpha });
}
export function movingDot(g, p, o = {}) { const { color = PAL.violet, r = 8, alpha = 1 } = o; g.save(); g.globalAlpha *= alpha; glow(g, p[0], p[1], r * 5, color, .2); g.fillStyle = color; g.beginPath(); g.arc(p[0], p[1], r, 0, TAU); g.fill(); g.restore(); }
export function lerpPoint(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)]; }
export function polyPoint(points, t) { const n = points.length - 1, p = clamp(t) * n, i = Math.min(n - 1, Math.floor(p)); return lerpPoint(points[i], points[i + 1], p - i); }

export function isoProject(x, y, z, c = {}) { const { cx = W / 2, cy = H / 2, k = 1 } = c; return [cx + (x - y) * .866 * k, cy + (x + y) * .5 * k - z * k]; }
export function isoBox(g, x, y, z, w, d, h, o = {}) {
  const { k = 1, cx = W / 2, cy = H / 2, top = PAL.panel3, left = PAL.panel, right = PAL.panel2, alpha = 1, stroke = null } = o;
  const p = (xx, yy, zz) => isoProject(xx, yy, zz, { cx, cy, k });
  const A = p(x, y, z + h), B = p(x + w, y, z + h), C = p(x + w, y + d, z + h), D = p(x, y + d, z + h), b = p(x + w, y, z), c = p(x + w, y + d, z), d0 = p(x, y + d, z);
  g.save(); g.globalAlpha *= alpha; g.lineJoin = 'round';
  const fill = (pts, color) => { g.beginPath(); g.moveTo(...pts[0]); pts.slice(1).forEach(q => g.lineTo(...q)); g.closePath(); g.fillStyle = color; g.fill(); if (stroke) { g.strokeStyle = stroke; g.lineWidth = 1; g.stroke(); } };
  fill([A, B, C, D], top); fill([D, C, c, d0], left); fill([B, C, c, b], right); g.restore();
  return { top: [A, B, C, D], anchor: p(x + w / 2, y + d / 2, z + h) };
}
export function isoShadow(g, x, y, rx, ry, alpha = .32) { g.save(); g.fillStyle = `rgba(0,0,0,${alpha})`; g.filter = 'blur(20px)'; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill(); g.filter = 'none'; g.restore(); }

export function drawCursor(g, x, y, scale = 1, o = {}) {
  const { color = PAL.violet, alpha = 1, click = 0 } = o; g.save(); g.globalAlpha *= alpha;
  const p = new Path2D(); p.moveTo(x, y); p.lineTo(x + 15 * scale, y + 44 * scale); p.lineTo(x + 30 * scale, y + 35 * scale); p.lineTo(x + 46 * scale, y + 63 * scale); p.lineTo(x + 57 * scale, y + 57 * scale); p.lineTo(x + 40 * scale, y + 28 * scale); p.lineTo(x + 58 * scale, y + 22 * scale); p.closePath();
  if (click) { g.strokeStyle = rgba(color, .68 * click); g.lineWidth = 4; g.beginPath(); g.arc(x + 20 * scale, y + 29 * scale, 46 * scale * click, 0, TAU); g.stroke(); }
  g.fillStyle = color; g.shadowColor = rgba(color, .75); g.shadowBlur = 20 * scale; g.fill(p); g.shadowColor = 'transparent'; g.restore();
}
export function drawNoiseGlyphs(g, x, y, w, h, p, color = PAL.violet) {
  const chars = '0123456789ABCDEF'; g.save(); g.globalAlpha = .7 * (1 - clamp(p)); g.font = font(18, 700, 'mono');
  for (let i = 0; i < 60; i++) { const xx = x + hash(i * 2.7) * w, yy = y + hash(i * 7.1) * h; g.fillStyle = rgba(color, .14 + hash(i + 9) * .42); g.fillText(chars[Math.floor(hash(i + p * 20) * chars.length)], xx, yy); }
  g.restore();
}
export function drawNumber(g, textValue, x, y, o = {}) {
  const { size = 160, color = PAL.white, alpha = 1, align = 'left', scramble = 0, accent = PAL.violet } = o;
  g.save(); g.globalAlpha *= alpha; g.textAlign = align; g.textBaseline = 'alphabetic'; g.font = font(size, 800, 'display');
  if (scramble > 0) { const chars = textValue.split(''); const glyphs = chars.map((ch, i) => i < Math.floor((1 - scramble) * chars.length) ? ch : String(Math.floor(hash(i + scramble * 90) * 10))); g.fillStyle = color; g.fillText(glyphs.join(''), x, y); }
  else { g.fillStyle = color; g.fillText(textValue, x, y); }
  g.restore();
  if (scramble > 0 && scramble < .75) { const m = g.measureText ? g.measureText(textValue).width : size * textValue.length * .55; glow(g, x + (align === 'center' ? 0 : m * .5), y - size * .5, 150, accent, .05 * (1 - scramble)); }
}

export function drawProfileWindow(g, x, y, s = 1, o = {}) {
  const { alpha = 1, refresh = 0, response = null, dim = false } = o; g.save(); g.globalAlpha *= alpha;
  const w = 430 * s, h = 300 * s; panel(g, x, y, w, h, { fill: '#111827', stroke: 'rgba(238,241,247,.20)', r: 22 * s, shadow: .42, alpha: 1 });
  g.fillStyle = 'rgba(238,241,247,.08)'; rr(g, x + 18 * s, y + 18 * s, w - 36 * s, 32 * s, 9 * s); g.fill();
  label(g, 'CELEBRITY / PROFILE', x + 38 * s, y + 41 * s, { size: 14 * s, color: PAL.dim, tracking: 1.5, alpha: 1 });
  g.fillStyle = rgba(PAL.violet, .34); g.beginPath(); g.arc(x + 72 * s, y + 126 * s, 35 * s, 0, TAU); g.fill();
  g.fillStyle = rgba(PAL.cyan, .36); g.beginPath(); g.arc(x + 72 * s, y + 115 * s, 13 * s, 0, TAU); g.fill(); g.fillStyle = rgba(PAL.cyan, .25); g.beginPath(); g.arc(x + 72 * s, y + 149 * s, 23 * s, Math.PI, TAU); g.fill();
  title(g, 'Aanya Rao', x + 126 * s, y + 118 * s, { size: 27 * s, weight: 700, alpha: 1 }); label(g, '@aanyarao', x + 126 * s, y + 146 * s, { size: 15 * s, color: PAL.dim, tracking: 1, alpha: 1 });
  label(g, 'NEW FILM · LIVE NOW', x + 126 * s, y + 181 * s, { size: 13 * s, color: PAL.dim, tracking: 1.1, alpha: 1 });
  panel(g, x + 310 * s, y + 96 * s, 88 * s, 38 * s, { fill: rgba(PAL.violet, .14), stroke: rgba(PAL.violet, .7), r: 19 * s, shadow: 0 }); label(g, 'VIEW', x + 354 * s, y + 121 * s, { size: 13 * s, color: PAL.violet, family: 'mono', weight: 700, align: 'center', tracking: 1 });
  g.strokeStyle = rgba(PAL.white, .14); g.lineWidth = 1; g.beginPath(); g.moveTo(x + 36 * s, y + 220 * s); g.lineTo(x + w - 36 * s, y + 220 * s); g.stroke();
  label(g, 'FOLLOWERS', x + 38 * s, y + 250 * s, { size: 12 * s, color: PAL.mute, tracking: 1, alpha: 1 }); label(g, '12.4M', x + 38 * s, y + 275 * s, { size: 19 * s, color: PAL.white, family: 'mono', weight: 700, tracking: 1 });
  label(g, response ? response.toUpperCase() : 'PROFILE READY', x + 256 * s, y + 263 * s, { size: 13 * s, color: response === 'hit' ? PAL.green : response === 'miss' ? PAL.red : PAL.dim, family: 'mono', weight: 700, align: 'center', tracking: 1 });
  if (refresh) { g.save(); g.translate(x + w - 40 * s, y + 34 * s); g.rotate(refresh * TAU); g.strokeStyle = PAL.violet; g.lineWidth = 3 * s; g.beginPath(); g.arc(0, 0, 9 * s, .5, Math.PI * 1.85); g.stroke(); g.restore(); }
  if (dim) { g.fillStyle = 'rgba(5,7,13,.42)'; rr(g, x, y, w, h, 22 * s); g.fill(); }
  g.restore();
}
export function drawPacket(g, x, y, textValue, o = {}) {
  const { color = PAL.violet, scale = 1, alpha = 1, pulse = 0 } = o; const w = Math.max(84, textValue.length * 9 + 30) * scale, h = 32 * scale;
  g.save(); g.globalAlpha *= alpha; if (pulse) glow(g, x + w / 2, y + h / 2, 48 * scale, color, .08 + .04 * Math.abs(Math.sin(pulse * 8)));
  panel(g, x, y, w, h, { fill: rgba(color, .13), stroke: rgba(color, .68), r: h / 2, shadow: 0, accent: null }); label(g, textValue, x + w / 2, y + h / 2 + 5 * scale, { size: 13 * scale, color, family: 'mono', weight: 700, align: 'center', tracking: .8 }); g.restore();
}

export function drawApplication(g, x, y, s = 1, o = {}) {
  const { alpha = 1, busy = 0, hit = 0, miss = 0 } = o; g.save(); g.globalAlpha *= alpha;
  isoShadow(g, x + 74 * s, y + 104 * s, 180 * s, 26 * s, .28);
  isoBox(g, 0, 0, 0, 170 * s, 80 * s, 70 * s, { cx: x, cy: y, k: 1, top: '#35435B', left: '#182233', right: '#253149', stroke: 'rgba(238,241,247,.18)' });
  label(g, 'APPLICATION', x, y + 34 * s, { size: 14 * s, color: PAL.white, weight: 700, align: 'center', tracking: 1.4 }); label(g, 'PROFILE API', x, y + 57 * s, { size: 12 * s, color: PAL.dim, family: 'mono', align: 'center', tracking: 1 });
  if (busy > 0) { pill(g, x - 64 * s, y + 80 * s, 128 * s, 30 * s, `${Math.round(busy * 8)}/8 BUSY`, { color: PAL.red, stroke: rgba(PAL.red, .55), fill: rgba(PAL.red, .13), size: 11 * s, mono: true, alpha: 1 }); }
  if (hit || miss) pill(g, x - 66 * s, y - 58 * s, 132 * s, 32 * s, hit ? 'CACHE HIT' : 'CACHE MISS', { color: hit ? PAL.green : PAL.red, stroke: rgba(hit ? PAL.green : PAL.red, .65), fill: rgba(hit ? PAL.green : PAL.red, .12), size: 12 * s, mono: true });
  g.restore();
}
export function drawCache(g, x, y, s = 1, o = {}) {
  const { alpha = 1, state = 'EMPTY', fill = 0, hit = 0, ttl = null } = o; g.save(); g.globalAlpha *= alpha;
  isoShadow(g, x, y + 90 * s, 180 * s, 25 * s, .28);
  isoBox(g, 0, 0, 0, 190 * s, 100 * s, 84 * s, { cx: x, cy: y, k: 1, top: '#4A3E70', left: '#251F3B', right: '#382D59', stroke: rgba(PAL.violet, .50) });
  label(g, 'CACHE', x, y + 31 * s, { size: 16 * s, color: PAL.white, weight: 700, align: 'center', tracking: 2 }); label(g, 'IN-MEMORY', x, y + 54 * s, { size: 12 * s, color: rgba(PAL.white, .72), family: 'mono', align: 'center', tracking: 1 });
  if (state) { const c = state === 'HIT' ? PAL.green : state === 'MISS' ? PAL.red : PAL.violet; pill(g, x - 68 * s, y - 60 * s, 136 * s, 32 * s, state, { color: c, stroke: rgba(c, .7), fill: rgba(c, .13), size: 12 * s, mono: true }); }
  if (fill > 0) { const barW = 125 * s; panel(g, x - barW / 2, y + 68 * s, barW, 12 * s, { fill: rgba(PAL.black, .55), stroke: rgba(PAL.white, .12), r: 6 * s, shadow: 0 }); panel(g, x - barW / 2, y + 68 * s, barW * clamp(fill), 12 * s, { fill: PAL.violet, stroke: PAL.violet, r: 6 * s, shadow: 0 }); }
  if (ttl !== null) { label(g, `TTL ${ttl}s`, x, y + 112 * s, { size: 13 * s, color: PAL.amber, family: 'mono', weight: 700, align: 'center', tracking: 1 }); }
  g.restore();
}
export function drawDatabase(g, x, y, s = 1, o = {}) {
  const { alpha = 1, state = 'READ', row = 0, hot = 0, miss = 0, owner = null } = o; g.save(); g.globalAlpha *= alpha;
  const w = 190 * s, h = 154 * s, ry = 23 * s, rx = w / 2;
  isoShadow(g, x, y + 110 * s, 175 * s, 25 * s, .34);
  g.fillStyle = '#1A2230'; g.beginPath(); g.moveTo(x - rx, y); g.lineTo(x - rx, y + h - ry); g.quadraticCurveTo(x, y + h + ry, x + rx, y + h - ry); g.lineTo(x + rx, y); g.closePath(); g.fill(); g.strokeStyle = 'rgba(238,241,247,.24)'; g.lineWidth = 2 * s; g.stroke();
  g.fillStyle = '#41506A'; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill(); g.stroke(); g.fillStyle = '#0C111B'; g.beginPath(); g.ellipse(x, y + h - ry, rx, ry, 0, 0, TAU); g.fill(); g.stroke();
  label(g, 'DATABASE', x, y + 44 * s, { size: 15 * s, color: PAL.white, weight: 700, align: 'center', tracking: 1.5 });
  const c = miss ? PAL.red : hot ? PAL.green : PAL.violet; panel(g, x - 67 * s, y + 62 * s, 134 * s, 38 * s, { fill: rgba(c, .13), stroke: rgba(c, .74), r: 9 * s, shadow: 0 }); label(g, state, x, y + 87 * s, { size: 12 * s, color: c, family: 'mono', weight: 700, align: 'center', tracking: 1 });
  if (row > 0) { line(g, [[x - 62 * s, y + 117 * s], [x + 62 * s, y + 117 * s]], { color: c, width: 4 * s, alpha: row }); }
  if (owner) label(g, owner, x, y + 185 * s, { size: 12 * s, color: PAL.dim, family: 'mono', align: 'center', tracking: 1 });
  g.restore();
}
export function drawDisk(g, x, y, s = 1, o = {}) {
  const { alpha = 1, read = 0 } = o; g.save(); g.globalAlpha *= alpha; isoShadow(g, x, y + 74 * s, 165 * s, 23 * s, .38);
  g.fillStyle = '#18202D'; g.beginPath(); g.ellipse(x, y + 18 * s, 142 * s, 35 * s, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(238,241,247,.24)'; g.lineWidth = 2; g.stroke();
  g.fillStyle = '#303C53'; g.beginPath(); g.ellipse(x, y + 13 * s, 108 * s, 25 * s, 0, 0, TAU); g.fill(); g.stroke(); g.fillStyle = '#0A0F17'; g.beginPath(); g.ellipse(x, y + 13 * s, 29 * s, 9 * s, 0, 0, TAU); g.fill();
  line(g, [[x - 105 * s, y + 14 * s], [x + 105 * s, y + 14 * s]], { color: read ? PAL.red : PAL.disk, width: 2 * s, alpha: .7 + .3 * read });
  if (read) { glow(g, x, y + 13 * s, 110 * s, PAL.red, .12 * read); line(g, [[x + 28 * s, y - 6 * s], [x + 86 * s, y - 34 * s]], { color: PAL.red, width: 5 * s, glowWidth: 12, alpha: read }); }
  label(g, 'DISK / IOPS', x, y + 72 * s, { size: 13 * s, color: read ? PAL.red : PAL.dim, family: 'mono', align: 'center', tracking: 1 }); g.restore();
}
export function stationLabel(g, x, y, index, name, sub, color = PAL.violet, alpha = 1) {
  label(g, `${String(index).padStart(2, '0')}  ${name}`, x, y, { size: 15, color, weight: 700, family: 'mono', tracking: 1.3, alpha }); label(g, sub, x, y + 26, { size: 13, color: PAL.dim, family: 'mono', tracking: 1, alpha });
}
export function drawLightSweep(g, p, color = PAL.violet, alpha = .35) { const x = lerp(-460, W + 460, clamp(p)); const gr = g.createLinearGradient(x - 230, 0, x + 230, 0); gr.addColorStop(0, rgba(color, 0)); gr.addColorStop(.5, rgba(color, alpha)); gr.addColorStop(1, rgba(color, 0)); g.fillStyle = gr; g.fillRect(x - 300, 0, 600, H); }
export function caption(g, textValue, o = {}) {
  const { y = 948, alpha = 1, accent = PAL.violet } = o; const maxW = 1480; g.save(); g.font = font(26, 500, 'ui');
  const words = textValue.split(/\s+/), lines = []; let s = '';
  for (const w of words) { const test = s ? `${s} ${w}` : w; if (g.measureText(test).width > maxW - 120 && s) { lines.push(s); s = w; } else s = test; }
  if (s) lines.push(s); const lineH = 34, h = 24 + lines.length * lineH, x = (W - maxW) / 2;
  g.globalAlpha *= alpha; g.shadowColor = 'rgba(0,0,0,.70)'; g.shadowBlur = 26; rr(g, x, y, maxW, h, 17); g.fillStyle = 'rgba(8,11,18,.90)'; g.fill(); g.shadowColor = 'transparent'; g.strokeStyle = 'rgba(238,241,247,.18)'; g.lineWidth = 1; g.stroke(); g.fillStyle = accent; g.beginPath(); g.arc(x + 25, y + 24, 6, 0, TAU); g.fill(); g.fillStyle = PAL.white; g.textAlign = 'left'; g.textBaseline = 'top'; lines.forEach((v, i) => g.fillText(v, x + 47, y + 11 + i * lineH)); g.restore(); return { x, y, w: maxW, h };
}
export function captionTransition(t0, t1, t) { return Math.min(clamp((t - t0) / .16), clamp((t1 - t) / .16)); }
export function lowerRule(g, y, p = 1, color = PAL.line) { g.save(); g.strokeStyle = color; g.lineWidth = 1; g.globalAlpha *= p; g.beginPath(); g.moveTo(72, y); g.lineTo(W - 72, y); g.stroke(); g.restore(); }
