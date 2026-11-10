// Caching from First Principles — 30-second landscape sample.
// Every frame is a pure function of t; the visual route and audio cues share timeline.js.
import * as E from './engine.js';
import { DUR, SCENES, CAPTIONS, sceneAt, captionAt } from './timeline.js';

const { W, H, PAL, clamp, lerp, seg, eo, ei, eio, back, spring, hash, font, TAU } = E;
export { DUR };

function appear(t, a, b, ease = eio) { return ease(seg(t, a, b)); }
function between(t, a, b) { return clamp(seg(t, a, b)); }
function pulse(t, at, span = .28) { return Math.max(0, 1 - Math.abs(t - at) / span); }
function pathPoint(points, p) { return E.polyPoint(points, p); }
function routeDot(g, points, p, color = PAL.violet, alpha = 1) { if (p <= 0 || p >= 1) return; E.movingDot(g, pathPoint(points, eio(p)), { color, r: 8, alpha }); }
function routePacket(g, points, p, textValue, color, t, alpha = 1) { if (p <= .03 || p >= 1.02) return; E.drawPacket(g, ...pathPoint(points, eio(p)), textValue, { color, scale: .86, pulse: t, alpha }); }
function drawPath(g, points, color, width = 5, alpha = 1, dash = null) {
  if (points.length === 4) E.bezier(g, points[0], points[1], points[2], points[3], { color, width, alpha, dash, glowWidth: width > 5 ? 13 : 0 });
  else E.line(g, points, { color, width, alpha, dash, glowWidth: width > 5 ? 13 : 0 });
}
function header(g, scene, number, p = 1) {
  E.label(g, `CACHING FROM FIRST PRINCIPLES  /  SAMPLE  /  ${String(number).padStart(2, '0')}`, 72, 54, { size: 15, color: PAL.dim, tracking: 2, alpha: p });
  E.title(g, scene.title, 72, 96, { size: 34, color: PAL.white, weight: 700, alpha: p });
  E.label(g, scene.kicker, 74, 122, { size: 14, color: PAL.dim, tracking: 1.4, alpha: p });
}
function base(g, opts = {}) { E.bg(g, opts); }
function floor(g, y = 760, alpha = .55) {
  g.save(); g.globalAlpha *= alpha; g.strokeStyle = 'rgba(238,241,247,.11)'; g.lineWidth = 1;
  for (let i = -8; i <= 8; i++) { const x = W / 2 + i * 120; g.beginPath(); g.moveTo(x, y); g.lineTo(W / 2 + i * 310, H); g.stroke(); }
  for (let j = 0; j < 6; j++) { const yy = y + j * j * 10 + j * 28; g.beginPath(); g.moveTo(80, yy); g.lineTo(W - 80, yy); g.stroke(); }
  g.restore();
}
function stationLine(g, a, b, color, p = 1, label = null) {
  E.line(g, [a, b], { color, width: 4, alpha: .22 + .78 * p, dash: p < 1 ? [12, 10] : null, glowWidth: p > .5 ? 9 : 0 });
  if (label) E.label(g, label, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 14, { size: 13, color, family: 'mono', align: 'center', tracking: 1.1, alpha: p });
}
function drawPool(g, x, y, fill, alpha = 1) {
  E.panel(g, x, y, 310, 132, { fill: 'rgba(11,15,24,.82)', stroke: 'rgba(238,241,247,.14)', r: 16, shadow: .3, alpha });
  E.label(g, 'CONNECTION POOL', x + 24, y + 31, { size: 14, color: PAL.dim, tracking: 1.5, alpha });
  for (let i = 0; i < 8; i++) E.panel(g, x + 24 + i * 33, y + 55, 24, 42, { fill: i < Math.round(fill * 8) ? E.rgba(PAL.red, .34) : E.rgba(PAL.white, .06), stroke: i < Math.round(fill * 8) ? E.rgba(PAL.red, .82) : E.rgba(PAL.white, .12), r: 6, shadow: 0, alpha });
  E.label(g, `${Math.round(fill * 8)}/8 BUSY`, x + 286, y + 86, { size: 13, color: fill > .8 ? PAL.red : PAL.dim, family: 'mono', weight: 700, align: 'right', tracking: 1, alpha });
}
function drawLatencyBreakdown(g, x, y, alpha = 1) {
  E.panel(g, x, y, 420, 184, { fill: 'rgba(12,17,27,.86)', stroke: 'rgba(238,241,247,.14)', r: 18, shadow: .38, alpha });
  E.label(g, 'DATABASE PATH / BACK-OF-ENVELOPE', x + 24, y + 30, { size: 13, color: PAL.dim, tracking: 1.4, alpha });
  const rows = [['APP → DB', '0.5 ms'], ['CONTROLLER LOOKUP', '1.5 ms'], ['PHYSICAL READ', '1.5 ms'], ['DB → APP', '0.5 ms']];
  rows.forEach((r, i) => { const yy = y + 65 + i * 25; E.label(g, r[0], x + 24, yy, { size: 12, color: PAL.dim, family: 'mono', tracking: .7, alpha }); E.label(g, r[1], x + 390, yy, { size: 12, color: PAL.red, family: 'mono', weight: 700, align: 'right', tracking: 1, alpha }); });
  E.label(g, '≈ 4 ms TOTAL', x + 24, y + 165, { size: 18, color: PAL.red, family: 'mono', weight: 700, tracking: 1.2, alpha });
}
function drawFastBreakdown(g, x, y, alpha = 1) {
  E.panel(g, x, y, 330, 116, { fill: E.rgba(PAL.green, .08), stroke: E.rgba(PAL.green, .54), r: 18, shadow: .25, alpha });
  E.label(g, 'CACHE PATH', x + 22, y + 30, { size: 13, color: PAL.dim, tracking: 1.4, alpha });
  E.label(g, 'APP → MEMORY', x + 22, y + 65, { size: 17, color: PAL.green, family: 'mono', weight: 700, tracking: 1, alpha });
  E.label(g, '≈ 1.1 ms', x + 305, y + 65, { size: 17, color: PAL.green, family: 'mono', weight: 700, align: 'right', tracking: 1, alpha });
}

function hook(g, t) {
  const s = SCENES[0]; base(g, { lift: 1.08, cool: .8, grid: .92 }); header(g, s, 1);
  const reveal = appear(t, .16, 1.28, back);
  E.drawNoiseGlyphs(g, 76, 170, 610, 110, reveal, PAL.violet);
  E.drawNumber(g, '50,000', 74, 304, { size: 166, color: PAL.white, scramble: 1 - reveal, accent: PAL.violet });
  E.label(g, 'USERS · SAME CELEBRITY PROFILE · ONE SPIKE', 82, 337, { size: 16, color: PAL.violet, family: 'mono', tracking: 1.8, alpha: reveal });
  const wp = appear(t, .52, 1.22, back), x = lerp(-430, 250, wp), y = 412;
  E.drawProfileWindow(g, x, y, .94, { alpha: wp, refresh: t > 2.2 ? .15 + between(t, 2.2, 2.65) : 0 });
  const cursorP = appear(t, 1.45, 2.15, back); E.drawCursor(g, lerp(490, 505, cursorP), lerp(600, 570, cursorP), .72, { alpha: cursorP, click: pulse(t, 2.25, .32) });
  const ringP = between(t, 2.0, 4.05);
  for (let i = 0; i < 4; i++) { const rr = 62 + i * 43 + Math.max(0, t - 2.0) * 9; g.save(); g.globalAlpha = ringP * (.50 - i * .08); g.strokeStyle = PAL.violet; g.lineWidth = 3; g.beginPath(); g.arc(720, 555, rr, -.8, .85); g.stroke(); g.restore(); }
  const p1 = [[536, 540], [640, 490], [820, 480], [1010, 405]], p2 = [[540, 574], [660, 600], [820, 660], [1010, 690]];
  drawPath(g, p1, PAL.violet, 5, .18 + ringP * .82); drawPath(g, p2, PAL.violet, 5, .18 + ringP * .82);
  const q1 = between(t, 2.65, 4.08), q2 = between(t, 2.88, 4.28); routeDot(g, p1, q1, PAL.violet, ringP); routeDot(g, p2, q2, PAL.violet, ringP); routePacket(g, p1, q1, 'GET', PAL.violet, t, ringP); routePacket(g, p2, q2, 'GET', PAL.violet, t + 1, ringP);
  E.panel(g, 1230, 248, 564, 292, { fill: 'rgba(10,14,23,.68)', stroke: 'rgba(238,241,247,.12)', r: 24, shadow: .42, accent: PAL.violet, alpha: appear(t, .9, 1.55) });
  E.label(g, 'A HOT READ', 1270, 298, { size: 14, color: PAL.dim, tracking: 2 }); E.title(g, 'Same profile.', 1270, 365, { size: 47, color: PAL.white }); E.title(g, 'Many requests.', 1270, 420, { size: 47, color: PAL.white }); E.label(g, 'THE WORK REPEATS BEFORE THE STORY CHANGES', 1272, 478, { size: 14, color: PAL.violet, family: 'mono', tracking: 1.2 });
  E.drawLightSweep(g, between(t, 3.72, 4.3), PAL.violet, .15);
}

function bottleneck(g, t) {
  const s = SCENES[1]; base(g, { lift: .78, cool: .6, grid: .62 }); header(g, s, 2); floor(g, 720, .52);
  const cam = lerp(90, -150, eio(between(t, 4.3, 11.8)));
  const appX = 315 + cam, dbX = 895 + cam, diskX = 1490 + cam, sy = 538;
  stationLine(g, [appX + 105, sy + 12], [dbX - 104, sy + 4], PAL.violet, .95, 'REQUESTS'); stationLine(g, [dbX + 104, sy + 12], [diskX - 124, sy + 2], PAL.red, between(t, 5.8, 7.4), 'READ PRESSURE');
  E.drawApplication(g, appX, sy, .92, { busy: between(t, 5.4, 10.8) }); E.drawDatabase(g, dbX, sy - 62, 1.02, { state: between(t, 6.0, 8.8) > .4 ? 'POOL FULL' : 'READ', row: between(t, 6.5, 8.8), miss: between(t, 6.1, 9.3) }); E.drawDisk(g, diskX, sy + 12, .9, { read: between(t, 7.0, 10.7) });
  const p = [[appX + 120, sy - 8], [appX + 280, sy - 130], [dbX - 180, sy - 160], [dbX - 106, sy - 78]]; const q = between(t, 5.25, 7.15); drawPath(g, p, PAL.violet, 5, .74); routeDot(g, p, q, PAL.violet); routePacket(g, p, q, 'REQ ×n', PAL.violet, t);
  const p2 = [[dbX + 105, sy - 50], [dbX + 260, sy - 165], [diskX - 240, sy - 140], [diskX - 125, sy - 12]]; const q2 = between(t, 7.15, 9.35); drawPath(g, p2, PAL.red, 5, .7); routeDot(g, p2, q2, PAL.red); routePacket(g, p2, q2, 'READ', PAL.red, t + 1);
  const pool = between(t, 5.1, 8.0); drawPool(g, 1260, 160, pool, appear(t, 5.0, 5.7));
  drawLatencyBreakdown(g, 1260, 330, appear(t, 6.2, 7.0));
  const bp = appear(t, 8.35, 9.05, back); E.title(g, 'DATABASE', 1260, 615, { size: 52, color: PAL.red, alpha: bp }); E.label(g, 'THE BOTTLENECK IS THE REPEATED PATH', 1265, 650, { size: 15, color: PAL.red, family: 'mono', tracking: 1.4, alpha: bp });
  E.label(g, 'CONNECTIONS · IOPS / DISK READS · CPU PRESSURE', 72, 865, { size: 14, color: PAL.dim, family: 'mono', tracking: 1.4 });
}

function missPath(g, t) {
  const s = SCENES[2]; base(g, { lift: .86, cool: .68, grid: .72 }); header(g, s, 3);
  E.label(g, 'THE COMMON PATH CHANGES HERE', 72, 160, { size: 15, color: PAL.violet, family: 'mono', tracking: 1.8 });
  const ay = 530, appX = 250, cacheX = 685, dbX = 1180, diskX = 1655;
  const lookup = [[appX + 118, ay], [appX + 250, ay - 140], [cacheX - 160, ay - 120], [cacheX - 92, ay - 36]];
  const miss = [[cacheX + 96, ay - 28], [cacheX + 220, ay - 170], [dbX - 230, ay - 160], [dbX - 102, ay - 40]];
  const read = [[dbX + 102, ay - 36], [dbX + 210, ay - 130], [diskX - 220, ay - 120], [diskX - 120, ay + 12]];
  const backDb = [[diskX - 112, ay + 32], [diskX - 280, ay + 160], [dbX + 228, ay + 146], [dbX + 96, ay + 55]];
  const populate = [[dbX - 96, ay + 60], [dbX - 250, ay + 225], [cacheX + 220, ay + 210], [cacheX + 94, ay + 53]];
  drawPath(g, lookup, PAL.violet, 5, .72); drawPath(g, miss, PAL.red, 5, .70); drawPath(g, read, PAL.red, 4, .58, [10, 9]); drawPath(g, backDb, PAL.cyan, 4, .45, [10, 9]); drawPath(g, populate, PAL.violet, 5, .65);
  const q1 = between(t, 12.15, 13.22), q2 = between(t, 13.0, 14.18), q3 = between(t, 14.0, 15.15), q4 = between(t, 15.0, 16.05), q5 = between(t, 15.65, 17.2);
  routeDot(g, lookup, q1, PAL.violet); routePacket(g, lookup, q1, 'LOOKUP', PAL.violet, t);
  routeDot(g, miss, q2, PAL.red); routePacket(g, miss, q2, 'MISS', PAL.red, t + 1);
  routeDot(g, read, q3, PAL.red); routePacket(g, read, q3, 'DB READ', PAL.red, t + 2);
  routeDot(g, backDb, q4, PAL.cyan); routePacket(g, backDb, q4, 'RESULT', PAL.cyan, t + 3);
  routeDot(g, populate, q5, PAL.violet); routePacket(g, populate, q5, 'SET', PAL.violet, t + 4);
  E.drawApplication(g, appX, ay, .88, { busy: 0, miss: between(t, 12.8, 15.8) }); E.drawCache(g, cacheX, ay - 50, .94, { state: t < 15.7 ? 'MISS' : 'POPULATE', fill: between(t, 15.65, 17.35), ttl: null }); E.drawDatabase(g, dbX, ay - 62, .98, { state: 'READ PROFILE', row: between(t, 14.1, 16.2), miss: 1 }); E.drawDisk(g, diskX, ay + 12, .88, { read: between(t, 14.0, 15.7) });
  E.panel(g, 80, 735, 740, 108, { fill: 'rgba(10,14,23,.84)', stroke: rgbaForState(t), r: 18, shadow: .30, alpha: appear(t, 12.2, 12.8) });
  E.label(g, 'CACHE LOOKUP', 110, 772, { size: 14, color: PAL.dim, tracking: 1.8 }); E.label(g, 'MISS  →  DATABASE  →  STORE  →  RESPOND', 110, 815, { size: 21, color: PAL.red, family: 'mono', weight: 700, tracking: 1.1 });
}
function rgbaForState(t) { return E.rgba(t > 15.65 ? PAL.violet : PAL.red, .48); }

function hitPath(g, t) {
  const s = SCENES[3]; base(g, { lift: 1.04, cool: .82, grid: .84 }); header(g, s, 4);
  const appX = 240, cacheX = 765, dbX = 1210, diskX = 1615, y = 520;
  const fast = [[appX + 120, y - 8], [appX + 260, y - 150], [cacheX - 180, y - 155], [cacheX - 98, y - 55]];
  const slow = [[cacheX + 100, y - 35], [cacheX + 280, y - 180], [dbX - 230, y - 170], [dbX - 105, y - 55]];
  drawPath(g, slow, PAL.red, 4, .18, [11, 10]); drawPath(g, fast, PAL.green, 7, .78, null);
  const q = between(t, 19.8, 21.35); routeDot(g, fast, q, PAL.green); routePacket(g, fast, q, 'HIT', PAL.green, t);
  E.drawApplication(g, appX, y, .88, { hit: between(t, 19.4, 20.8) }); E.drawCache(g, cacheX, y - 50, 1.02, { state: 'HIT', fill: 1, hit: 1 }); E.drawDatabase(g, dbX, y - 62, .88, { state: 'ASLEEP', row: 0, hot: 0, alpha: .46 }); E.drawDisk(g, diskX, y + 12, .78, { alpha: .30, read: 0 });
  E.drawProfileWindow(g, 90, 238, .72, { alpha: appear(t, 19.2, 19.85), response: 'hit' });
  const nP = appear(t, 20.0, 20.85, back); E.drawNumber(g, '1.1 ms', 1150, 292, { size: 142, color: PAL.green, alpha: nP, accent: PAL.green }); E.label(g, 'HOT DATA / MEMORY PATH', 1156, 330, { size: 15, color: PAL.green, family: 'mono', tracking: 1.7, alpha: nP });
  E.label(g, '≈ 4 ms', 1160, 470, { size: 56, color: PAL.dim, family: 'mono', weight: 700, alpha: nP * .78 }); E.label(g, 'DATABASE PATH / DIMMED, NOT GONE', 1164, 506, { size: 14, color: PAL.dim, family: 'mono', tracking: 1.2, alpha: nP * .78 });
  const fastP = appear(t, 21.15, 22.1, back); drawFastBreakdown(g, 1170, 620, fastP);
  E.pill(g, 88, 768, 472, 44, 'SAME REQUEST · DIFFERENT COMMON PATH', { color: PAL.violet, stroke: E.rgba(PAL.violet, .55), fill: E.rgba(PAL.violet, .10), size: 14, mono: true, alpha: appear(t, 21.4, 22.1) });
  E.drawLightSweep(g, between(t, 23.0, 23.7), PAL.green, .18);
}

function teardownLayer(g, t, i, x, y, sep, alpha = 1) {
  const e = sep * (i - 1.5); const yy = y + e * 38; const c = i === 1 ? PAL.cyan : i === 2 ? PAL.violet : i === 3 ? PAL.amber : PAL.disk;
  if (i === 0) E.drawApplication(g, x, yy, .76, { alpha });
  if (i === 1) E.drawCache(g, x, yy, .82, { alpha, state: 'HOT', fill: .92, ttl: 60 });
  if (i === 2) E.drawDatabase(g, x, yy, .82, { alpha, state: 'ROWS', row: .75 });
  if (i === 3) E.drawDisk(g, x, yy, .72, { alpha, read: 0 });
  const anchors = [[x + 95, yy - 38], [x + 105, yy - 38], [x + 84, yy + 12], [x + 94, yy + 12]];
  if (alpha > 0) { E.line(g, [anchors[i], [1160, yy - 38]], { color: c, width: 2, alpha: .32 + .50 * sep }); E.movingDot(g, [1160, yy - 38], { color: c, r: 4, alpha: .60 + .4 * sep }); }
}
function teardown(g, t) {
  const s = SCENES[4]; base(g, { lift: .92, cool: .66, grid: .72 }); header(g, s, 5);
  const sep = appear(t, 25.55, 27.0, back); const collapse = 1 - between(t, 28.25, 29.05);
  E.label(g, 'EXPLODED PATH / THE TRADE-OFF', 72, 160, { size: 15, color: PAL.violet, family: 'mono', tracking: 1.8 });
  E.isoShadow(g, 600, 915, 420, 42, .35);
  // bottom-to-top is drawn in the same order as the physical route, while labels remain anchored.
  teardownLayer(g, t, 0, 620, 330, sep * collapse, 1); teardownLayer(g, t, 1, 620, 470, sep * collapse, 1); teardownLayer(g, t, 2, 620, 625, sep * collapse, 1); teardownLayer(g, t, 3, 620, 790, sep * collapse, 1);
  E.label(g, 'APPLICATION', 1200, 310 + (0 - 1.5) * sep * 38, { size: 16, color: PAL.cyan, family: 'mono', weight: 700, tracking: 1.2 }); E.label(g, 'REQUEST / RESPONSE', 1200, 334 + (0 - 1.5) * sep * 38, { size: 13, color: PAL.dim, family: 'mono', tracking: 1 });
  E.label(g, 'CACHE · IN-MEMORY', 1200, 462 + (1 - 1.5) * sep * 38, { size: 16, color: PAL.violet, family: 'mono', weight: 700, tracking: 1.2 }); E.label(g, 'TTL = 60 s (EXAMPLE)', 1200, 486 + (1 - 1.5) * sep * 38, { size: 13, color: PAL.amber, family: 'mono', tracking: 1 });
  E.label(g, 'DATABASE', 1200, 628 + (2 - 1.5) * sep * 38, { size: 16, color: PAL.amber, family: 'mono', weight: 700, tracking: 1.2 }); E.label(g, 'SOURCE OF THE READ', 1200, 652 + (2 - 1.5) * sep * 38, { size: 13, color: PAL.dim, family: 'mono', tracking: 1 });
  E.label(g, 'DISK / IOPS', 1200, 792 + (3 - 1.5) * sep * 38, { size: 16, color: PAL.disk, family: 'mono', weight: 700, tracking: 1.2 }); E.label(g, 'PHYSICAL READ', 1200, 816 + (3 - 1.5) * sep * 38, { size: 13, color: PAL.dim, family: 'mono', tracking: 1 });
  const rightP = appear(t, 26.0, 26.85, back); E.panel(g, 1420, 174, 420, 596, { fill: 'rgba(10,14,23,.82)', stroke: 'rgba(238,241,247,.14)', r: 24, shadow: .42, accent: PAL.violet, alpha: rightP });
  E.label(g, 'WHAT THE CACHE BUYS', 1460, 222, { size: 14, color: PAL.dim, tracking: 1.8, alpha: rightP }); E.title(g, 'LESS', 1460, 302, { size: 67, color: PAL.green, alpha: rightP }); E.title(g, 'REPEATED', 1460, 360, { size: 46, color: PAL.white, alpha: rightP }); E.title(g, 'WORK', 1460, 414, { size: 46, color: PAL.white, alpha: rightP });
  const clockP = between(t, 26.85, 28.45); g.save(); g.globalAlpha = rightP; g.strokeStyle = E.rgba(PAL.amber, .26); g.lineWidth = 12; g.beginPath(); g.arc(1515, 510, 66, 0, TAU); g.stroke(); g.strokeStyle = PAL.amber; g.lineWidth = 12; g.beginPath(); g.arc(1515, 510, 66, -.5, -.5 + TAU * (1 - clockP)); g.stroke(); g.restore(); E.label(g, 'TTL', 1515, 505, { size: 15, color: PAL.amber, family: 'mono', align: 'center', tracking: 1, alpha: rightP }); E.label(g, '60 s', 1515, 532, { size: 24, color: PAL.amber, family: 'mono', weight: 700, align: 'center', tracking: 1, alpha: rightP });
  E.label(g, clockP > .88 ? 'EXPIRED → MISS' : 'EXPIRES TO A LATER MISS', 1610, 502, { size: 15, color: clockP > .88 ? PAL.red : PAL.dim, family: 'mono', weight: 700, tracking: 1, alpha: rightP });
  const scopeP = appear(t, 28.1, 28.8); E.panel(g, 1420, 802, 420, 116, { fill: 'rgba(255,88,100,.07)', stroke: 'rgba(255,88,100,.45)', r: 16, shadow: .25, alpha: scopeP }); E.label(g, 'SCOPE NOTE', 1446, 838, { size: 13, color: PAL.red, family: 'mono', weight: 700, tracking: 1.3, alpha: scopeP }); E.label(g, 'STAMPEDES STILL NEED DESIGN', 1446, 875, { size: 15, color: PAL.white, family: 'mono', tracking: 1.05, alpha: scopeP }); E.label(g, 'CACHE IS A PATH, NOT MAGIC', 1446, 899, { size: 13, color: PAL.dim, family: 'mono', tracking: 1, alpha: scopeP });
  const loopP = between(t, 28.8, 29.8); E.bezier(g, [1050, 610], [1270, 680], [1270, 920], [1035, 882], { color: PAL.red, width: 3, alpha: loopP, dash: [10, 10], glowWidth: 5 }); if (loopP > .1) E.drawPacket(g, 1130, 748 + loopP * 30, 'MISS AGAIN', { color: PAL.red, scale: .82, pulse: t, alpha: loopP });
  E.drawLightSweep(g, between(t, 29.15, 29.95), PAL.green, .18);
}

function transition(g, t, scene) {
  const local = Math.min(Math.abs(t - scene.t0), Math.abs(scene.t1 - t)); if (local < .22) E.drawLightSweep(g, clamp((.22 - local) / .22), scene.id === 'teardown' ? PAL.green : PAL.violet, .08);
}
function drawCaptions(g, t) {
  const active = captionAt(t); const c = active.length ? active[active.length - 1] : null; if (!c) return;
  const a = E.captionTransition(c.t0, c.t1, t); const accent = t < 11.8 ? PAL.red : t < 19.1 ? PAL.violet : t < 25.5 ? PAL.green : PAL.amber; E.caption(g, c.text, { alpha: a, accent });
}

export function renderFilm(g, t, o = {}) {
  E.clear(g); t = clamp(t, 0, DUR - 1 / 240); const s = sceneAt(t);
  if (s.id === 'hook') hook(g, t); else if (s.id === 'bottleneck') bottleneck(g, t); else if (s.id === 'miss') missPath(g, t); else if (s.id === 'hit') hitPath(g, t); else teardown(g, t);
  transition(g, t, s); if (!o.nosub) drawCaptions(g, t); E.vignette(g, .47);
}

export function textsAt(t) {
  const s = sceneAt(t), out = []; const add = (id, textValue, x0, y0, x1, y1, pass = false) => out.push({ id, text: textValue, x0, y0, x1, y1, pass });
  if (s.id === 'hook' && t >= 1.30) add('traffic-count', '50,000', 70, 170, 740, 320);
  if (s.id === 'bottleneck' && t >= 6.15) add('bottleneck', 'DATABASE', 1245, 565, 1510, 630);
  if (s.id === 'miss' && t >= 12.75) add('miss-route', 'MISS → DATABASE → STORE → RESPOND', 100, 755, 790, 835);
  if (s.id === 'hit' && t >= 20.8) add('fast-latency', '1.1 ms', 1140, 165, 1550, 315);
  if (s.id === 'teardown' && t >= 25.9) add('ttl', 'TTL 60 s', 1180, 420, 1380, 510);
  if (s.id === 'teardown' && t >= 27.3) add('less-work', 'LESS REPEATED WORK', 1440, 245, 1810, 385);
  return out;
}
