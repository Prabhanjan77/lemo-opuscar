// Caching from First Principles — readable editorial system-design cut.
// Each scene uses one causal motion: request, bottleneck, miss, hit, trade-off.
import * as E from './engine.js';
import { DUR, SCENES, CAPTIONS, sceneAt, captionAt } from './timeline.js';

const { W, H, PAL, clamp, lerp, seg, eio, back, hash, TAU } = E;
export { DUR };

function appear(t, a, b, ease = eio) { return ease(seg(t, a, b)); }
function between(t, a, b) { return clamp(seg(t, a, b)); }
function point(points, p) { return E.polyPoint(points, p); }
function route(g, points, color, width = 3, alpha = 1, dash = null) { if (points.length === 4) E.bezier(g, points[0], points[1], points[2], points[3], { color, width, alpha, dash }); else E.line(g, points, { color, width, alpha, dash }); }
function dotRoute(g, points, p, color, alpha = 1, text = null, t = 0) { if (p <= 0) return; const q = point(points, Math.min(1, p)); E.movingDot(g, q, { color, r: text ? 8 : 6, alpha }); if (text && p < 1.04) E.drawPacket(g, q[0], q[1], text, { color, alpha, scale: .9 }); }
function header(g, scene, number) { E.label(g, `CACHING / FROM FIRST PRINCIPLES  ·  SAMPLE  ·  ${String(number).padStart(2, '0')}`, 72, 52, { size: 14, color: PAL.dim, tracking: 2 }); E.label(g, `${scene.t0.toFixed(2)} — ${scene.t1.toFixed(2)} s`, W - 72, 52, { size: 13, color: PAL.dim, align: 'right', tracking: 1.2 }); }
function titleBlock(g, headline, kicker, o = {}) { const { dark = false, alpha = 1 } = o; const ink = dark ? PAL.white : PAL.ink; const dim = dark ? '#B8B7BF' : PAL.dim; E.title(g, headline, 72, 157, { size: 78, color: ink, alpha }); E.label(g, kicker, 76, 194, { size: 15, color: dim, tracking: 1.6, alpha }); }
function base(g, dark = false) { E.bg(g, { dark: false, gridAlpha: .16 }); E.line(g, [[72, 1012], [1848, 1012]], { color: PAL.line, width: 1, alpha: .42 }); }
function stationLabel(g, x, y, title, sub, color = PAL.dim, alpha = 1) { E.label(g, title, x, y, { size: 14, color, family: 'mono', weight: 700, tracking: 1.2, alpha }); E.label(g, sub, x, y + 23, { size: 12, color: PAL.dim, family: 'mono', tracking: .7, alpha }); }
function drawDots(g, t, count, start, duration, source, target, color, radius = 5, alpha = 1) {
  for (let i = 0; i < count; i++) { const st = start + hash(i * 13.7 + 2.4) * .95; if (t < st) continue; const p = clamp((t - st) / duration); const wobble = (hash(i * 4.3) - .5) * 32; const a = [source[0] + wobble, source[1] + (hash(i * 9.1) - .5) * 260]; const b = [target[0], target[1] + wobble * .15]; const q = E.lerpPoint(a, b, eio(p)); E.movingDot(g, q, { color, r: radius * (p < 1 ? 1.25 : 1), alpha: alpha * (p < 1 ? .9 : .42) }); }
}
function drawRequestRuler(g, t, alpha = 1) { const p = appear(t, 9.35, 10.0); E.panel(g, 72, 720, 990, 128, { fill: PAL.white, stroke: PAL.line, r: 12, shadow: .07, alpha: p }); E.label(g, 'WHERE THE ~4 ms GOES', 102, 754, { size: 13, color: PAL.dim, tracking: 1.5, alpha: p }); E.drawRuler(g, 120, 800, 875, [{ value: .5, label: 'APP → DB 0.5', color: PAL.blue }, { value: 1.5, label: 'CONTROLLER 1.5', color: PAL.red }, { value: 1.5, label: 'PHYSICAL READ 1.5', color: PAL.red }, { value: .5, label: 'DB → APP 0.5', color: PAL.blue }], { alpha: p }); }
function drawStageNote(g, x, y, text, color, alpha = 1) { E.panel(g, x, y, 260, 42, { fill: color === PAL.red ? PAL.redSoft : color === PAL.green ? PAL.greenSoft : PAL.violetSoft, stroke: color, r: 21, shadow: 0, alpha }); E.label(g, text, x + 130, y + 26, { size: 12, color, family: 'mono', weight: 700, align: 'center', tracking: .9, alpha }); }

function opening(g, t) {
  const s = SCENES[0]; base(g); header(g, s, 1); titleBlock(g, 'One click, one request', 'GET /PROFILE  ·  START WITH ONE CLIENT');
  const browserP = appear(t, .25, 1.05, back), apiP = appear(t, .60, 1.30, back), dbP = appear(t, .92, 1.62, back);
  E.drawBrowser(g, 350, 525, .82, { alpha: browserP, click: between(t, 1.05, 1.48) }); E.drawCube(g, 870, 520, .94, { name: 'API', sub: ':5000', accent: PAL.violet, alpha: apiP }); E.drawCube(g, 1320, 420, .94, { name: 'DATABASE', sub: 'PROFILE ROW', accent: PAL.blue, alpha: dbP });
  const r1 = [[515, 480], [640, 410], [760, 455], [820, 492]], r2 = [[950, 470], [1040, 380], [1190, 370], [1260, 388]]; route(g, r1, PAL.violet, 4, .34 + .66 * apiP); route(g, r2, PAL.blue, 4, .30 + .70 * dbP);
  const q1 = between(t, 1.28, 2.35), q2 = between(t, 2.25, 3.35); dotRoute(g, r1, q1, PAL.violet, browserP, 'GET', t); dotRoute(g, r2, q2, PAL.blue, dbP, 'READ', t);
  E.drawCursor(g, 415, 520, .72, { alpha: appear(t, .95, 1.2), click: between(t, 1.08, 1.48) }); drawStageNote(g, 210, 690, 'ONE CLICK → ONE REQUEST', PAL.green, appear(t, 1.2, 1.8));
  const scaleP = appear(t, 2.55, 3.25, back); E.title(g, '50,000', 1210, 205, { size: 108, color: PAL.ink, alpha: scaleP }); E.label(g, 'REQUESTS · SAME PROFILE', 1220, 237, { size: 15, color: PAL.red, tracking: 1.5, alpha: scaleP });
  drawDots(g, t, 38, 2.60, 1.35, [420, 520], [805, 490], PAL.red, 4.5, scaleP); E.label(g, 'MANY CLIENTS', 520, 330, { size: 14, color: PAL.red, family: 'mono', tracking: 1.2, alpha: between(t, 3.1, 3.8) }); E.label(g, 'ONE SHARED READ TARGET', 930, 620, { size: 13, color: PAL.violet, family: 'mono', tracking: 1.1, alpha: between(t, 3.2, 4.4) });
  E.panel(g, 1210, 300, 570, 190, { fill: PAL.white, stroke: PAL.ink, r: 14, shadow: .12, alpha: appear(t, 3.45, 4.0) }); E.label(g, 'THE QUESTION IS IDENTICAL', 1245, 345, { size: 13, color: PAL.dim, tracking: 1.4 }); E.title(g, 'Same profile.', 1245, 412, { size: 47, color: PAL.ink }); E.label(g, 'THE WORK WILL REPEAT', 1247, 453, { size: 14, color: PAL.red, family: 'mono', tracking: 1.2 });
}

function bottleneck(g, t) {
  const s = SCENES[1]; base(g); header(g, s, 2); titleBlock(g, 'The same question, repeated', '50,000 × GET /PROFILE  ·  ONE SOURCE OF TRUTH');
  E.title(g, '≈ 4 ms', 72, 405, { size: 124, color: PAL.red }); E.label(g, 'DATABASE-BACKED PATH', 82, 442, { size: 15, color: PAL.red, tracking: 1.4 }); E.label(g, 'REPEATED WORK BECOMES THE BOTTLENECK', 82, 480, { size: 14, color: PAL.dim, family: 'mono', tracking: 1 });
  const appX = 650, dbX = 1070, diskX = 1460, p = appear(t, 5.9, 6.8, back); E.drawCube(g, appX, 535, .92, { name: 'API', sub: ':5000', accent: PAL.violet, alpha: p }); E.drawCube(g, dbX, 470, 1.02, { name: 'DATABASE', sub: 'READ PROFILE', accent: PAL.red, alpha: p }); E.drawDisk(g, diskX, 570, .88, { alpha: p, read: between(t, 8.0, 10.1) });
  const a = [[appX + 100, 500], [790, 395], [930, 405], [dbX - 95, 450]], b = [[dbX + 95, 445], [1210, 370], [1350, 425], [diskX - 120, 555]]; route(g, a, PAL.violet, 4, p); route(g, b, PAL.red, 4, p); const q1 = between(t, 6.8, 8.15), q2 = between(t, 8.0, 9.5); dotRoute(g, a, q1, PAL.violet, p, 'REQ', t); dotRoute(g, b, q2, PAL.red, p, 'READ', t);
  drawDots(g, t, 22, 7.15, 1.25, [800, 500], [dbX - 125, 450], PAL.red, 5, between(t, 7.0, 10.0)); E.panel(g, 1260, 180, 430, 122, { fill: PAL.white, stroke: PAL.red, r: 12, shadow: .10, alpha: appear(t, 7.0, 7.6) }); E.label(g, 'CONNECTION POOL', 1290, 214, { size: 13, color: PAL.dim, tracking: 1.4 }); for (let i = 0; i < 8; i++) E.panel(g, 1290 + i * 39, 240, 28, 34, { fill: i < 7 ? PAL.redSoft : PAL.paper2, stroke: i < 7 ? PAL.red : PAL.line, r: 6, shadow: 0, alpha: 1 }); E.label(g, '7 / 8 BUSY', 1648, 263, { size: 12, color: PAL.red, family: 'mono', weight: 700, align: 'right', tracking: .8 });
  drawRequestRuler(g, t, 1); stationLabel(g, 570, 650, 'APPLICATION', 'receives the request', PAL.violet, p); stationLabel(g, 980, 600, 'DATABASE', 'same read, again', PAL.red, p); stationLabel(g, 1390, 680, 'DISK / IOPS', 'physical read', PAL.dim, p);
}

function miss(g, t) {
  const s = SCENES[2]; base(g); header(g, s, 3); titleBlock(g, 'Put a cache in front', 'LOOKUP FIRST  ·  MISS FALLS THROUGH');
  const apiX = 390, cacheX = 820, dbX = 1260, diskX = 1580, p = appear(t, 11.7, 12.5, back); E.drawCube(g, apiX, 500, .88, { name: 'API', sub: 'APPLICATION', accent: PAL.violet, alpha: p }); E.drawCube(g, cacheX, 465, .98, { name: 'CACHE', sub: t < 15.1 ? 'EMPTY' : 'PROFILE', accent: PAL.violet, fill: PAL.violetSoft, alpha: p }); E.drawCube(g, dbX, 440, .92, { name: 'DATABASE', sub: 'SOURCE', accent: PAL.blue, alpha: p }); E.drawDisk(g, diskX, 600, .72, { alpha: p, read: between(t, 13.7, 15.0) });
  const lookup = [[apiX + 92, 466], [520, 370], [680, 390], [cacheX - 95, 438]], down = [[cacheX + 100, 428], [960, 320], [1120, 340], [dbX - 95, 415]], read = [[dbX + 88, 430], [1400, 400], [1490, 510], [diskX - 100, 580]], backRoute = [[diskX - 95, 596], [1430, 720], [1070, 685], [dbX + 84, 455]], save = [[dbX - 90, 450], [1120, 760], [950, 700], [cacheX + 92, 468]];
  route(g, lookup, PAL.violet, 4, p); route(g, down, PAL.red, 4, p, [10, 9]); route(g, read, PAL.red, 3, p, [10, 9]); route(g, backRoute, PAL.blue, 3, p, [10, 9]); route(g, save, PAL.violet, 4, p);
  const q1 = between(t, 12.2, 13.25), q2 = between(t, 13.0, 14.0), q3 = between(t, 13.8, 14.9), q4 = between(t, 14.7, 15.7), q5 = between(t, 15.3, 16.5); dotRoute(g, lookup, q1, PAL.violet, p, 'LOOKUP', t); dotRoute(g, down, q2, PAL.red, p, 'MISS', t); dotRoute(g, read, q3, PAL.red, p, 'READ', t); dotRoute(g, backRoute, q4, PAL.blue, p, 'RESULT', t); dotRoute(g, save, q5, PAL.violet, p, 'SAVE', t);
  drawStageNote(g, 72, 720, 'MISS', PAL.red, appear(t, 12.8, 13.4)); E.label(g, '→ READ DATABASE', 350, 748, { size: 14, color: PAL.red, family: 'mono', tracking: 1, alpha: appear(t, 13.1, 13.8) }); E.label(g, '→ SAVE PROFILE IN MEMORY', 740, 748, { size: 14, color: PAL.violet, family: 'mono', tracking: 1, alpha: appear(t, 15.2, 16.0) }); E.panel(g, 1190, 760, 470, 80, { fill: PAL.violetSoft, stroke: PAL.violet, r: 12, shadow: 0, alpha: appear(t, 15.25, 16.0) }); E.label(g, 'CACHE KEY  /profile/celebrity', 1425, 807, { size: 14, color: PAL.violet, family: 'mono', align: 'center', tracking: .8, alpha: 1 });
}

function hit(g, t) {
  const s = SCENES[3]; base(g); header(g, s, 4); titleBlock(g, 'The next request is a hit', 'SAME KEY  ·  SHORTER COMMON PATH');
  E.title(g, '1.1 ms', 72, 390, { size: 132, color: PAL.green }); E.label(g, 'MEMORY PATH', 84, 430, { size: 15, color: PAL.green, tracking: 1.5 }); E.label(g, '≈ 4 ms  /  DATABASE PATH', 84, 520, { size: 30, color: PAL.dim, family: 'mono', tracking: 1 });
  const apiX = 650, cacheX = 1010, dbX = 1430, p = appear(t, 18.0, 18.7, back); E.drawCube(g, apiX, 555, .90, { name: 'API', sub: 'APPLICATION', accent: PAL.violet, alpha: p }); E.drawCube(g, cacheX, 500, 1.02, { name: 'CACHE', sub: 'HIT', accent: PAL.green, fill: PAL.greenSoft, alpha: p }); E.drawCube(g, dbX, 450, .86, { name: 'DATABASE', sub: 'STILL THERE', accent: PAL.dim, ghost: true, alpha: p });
  const fast = [[apiX + 95, 520], [760, 380], [900, 400], [cacheX - 100, 472]], slow = [[cacheX + 100, 470], [1160, 350], [1300, 360], [dbX - 90, 425]]; route(g, fast, PAL.green, 6, p); route(g, slow, PAL.dim, 3, p, [10, 10]); const q = between(t, 18.8, 20.2); dotRoute(g, fast, q, PAL.green, p, 'HIT', t); E.drawPacket(g, 1150, 680, 'DB PATH DIMMED', { color: PAL.dim, alpha: appear(t, 20.0, 20.8), scale: 1.05 }); E.panel(g, 1360, 690, 330, 86, { fill: PAL.greenSoft, stroke: PAL.green, r: 12, shadow: 0, alpha: appear(t, 20.5, 21.2) }); E.label(g, 'SAME PROFILE', 1525, 725, { size: 14, color: PAL.green, family: 'mono', weight: 700, align: 'center', tracking: 1.1 }); E.label(g, 'FROM MEMORY', 1525, 750, { size: 13, color: PAL.green, family: 'mono', align: 'center', tracking: 1 });
}

function teardown(g, t) {
  const s = SCENES[4]; base(g); header(g, s, 5); titleBlock(g, 'A cache is a shortcut', 'NOT THE SOURCE OF TRUTH  ·  TTL SETS A BOUNDARY');
  const sep = appear(t, 24.0, 25.5, back); const layers = [{ y: 305, name: 'APP', sub: 'REQUEST', c: PAL.violet }, { y: 450, name: 'CACHE', sub: 'IN MEMORY', c: PAL.green }, { y: 595, name: 'DATABASE', sub: 'SOURCE', c: PAL.blue }, { y: 740, name: 'DISK', sub: 'PHYSICAL READ', c: PAL.dim }];
  layers.forEach((l, i) => { const yy = l.y + (i - 1.5) * sep * 30; E.drawCube(g, 750, yy, .78, { name: l.name, sub: l.sub, accent: l.c, ghost: i === 3, alpha: 1 }); E.line(g, [[850, yy - 30], [1050, yy - 30]], { color: l.c, width: 2, alpha: .70 }); E.label(g, l.name, 1080, yy - 32, { size: 15, color: l.c, family: 'mono', weight: 700, tracking: 1.1 }); E.label(g, l.sub, 1080, yy - 10, { size: 12, color: PAL.dim, family: 'mono', tracking: .7 }); });
  E.title(g, 'LESS', 72, 690, { size: 82, color: PAL.green }); E.title(g, 'REPEATED WORK', 72, 770, { size: 55, color: PAL.ink }); E.label(g, 'THE CACHE TAKES THE COMMON PATH', 78, 812, { size: 14, color: PAL.green, family: 'mono', tracking: 1.3 });
  const clockP = between(t, 25.25, 27.4); E.drawClock(g, 1510, 390, 72, 1 - clockP, { color: PAL.amber, alpha: appear(t, 24.7, 25.4) }); E.label(g, 'TTL EXPIRES OLD ANSWERS', 1510, 510, { size: 14, color: PAL.amber, family: 'mono', align: 'center', tracking: 1 }); const loop = between(t, 27.1, 28.6); E.arrow(g, [1450, 560], [1340, 560], { color: PAL.red, width: 3, alpha: loop }); E.label(g, 'EXPIRED → MISS AGAIN', 1510, 567, { size: 13, color: PAL.red, family: 'mono', align: 'center', tracking: .9, alpha: loop }); E.panel(g, 1270, 650, 520, 110, { fill: PAL.redSoft, stroke: PAL.red, r: 12, shadow: 0, alpha: appear(t, 27.8, 28.6) }); E.label(g, 'SCOPE NOTE', 1300, 686, { size: 12, color: PAL.red, family: 'mono', weight: 700, tracking: 1.2 }); E.label(g, 'STALE DATA / STAMPEDE', 1300, 722, { size: 15, color: PAL.ink, family: 'mono', tracking: .9 }); E.label(g, 'STILL NEED CAREFUL DESIGN', 1300, 746, { size: 13, color: PAL.dim, family: 'mono', tracking: .9 });
  E.label(g, 'THE DATABASE STILL MATTERS', 72, 900, { size: 15, color: PAL.dim, family: 'mono', tracking: 1.5 });
}

function transition(g, t, s) { const d = Math.min(Math.abs(t - s.t0), Math.abs(s.t1 - t)); if (d < .18) E.lightSweep(g, clamp((.18 - d) / .18), PAL.violet, .06); }
function drawCaptions(g, t) { const active = captionAt(t); const c = active.length ? active[active.length - 1] : null; if (!c) return; const i = SCENES.findIndex(s => t >= s.t0 && t < s.t1); const accent = [PAL.red, PAL.red, PAL.violet, PAL.green, PAL.amber][Math.max(0, i)]; E.caption(g, c.text, { alpha: E.captionTransition(c.t0, c.t1, t), accent }); }

export function renderFilm(g, t, o = {}) { E.clear(g); t = clamp(t, 0, DUR - 1 / 240); const s = sceneAt(t); if (s.id === 'hook') opening(g, t); else if (s.id === 'bottleneck') bottleneck(g, t); else if (s.id === 'miss') miss(g, t); else if (s.id === 'hit') hit(g, t); else teardown(g, t); transition(g, t, s); if (!o.nosub) drawCaptions(g, t); }
export function textsAt(t) {
  const s = sceneAt(t), out = []; const add = (id, text, x0, y0, x1, y1, pass = false) => out.push({ id, text, x0, y0, x1, y1, pass });
  if (s.id === 'hook' && t >= 2.7) add('traffic', '50,000', 1190, 105, 1750, 220);
  if (s.id === 'bottleneck' && t >= 6.0) add('slow-path', '≈ 4 ms', 65, 290, 650, 430);
  if (s.id === 'miss' && t >= 12.8) add('miss', 'MISS → READ DATABASE → SAVE', 60, 700, 1060, 780);
  if (s.id === 'hit' && t >= 19.6) add('hit', '1.1 ms', 60, 275, 680, 405);
  if (s.id === 'teardown' && t >= 27.1) add('less-work', 'LESS REPEATED WORK', 65, 610, 660, 790);
  return out;
}
