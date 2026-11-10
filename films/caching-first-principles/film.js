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

function drawUserCard(g, x, y, s = 1, textValue = 'USER 01', alpha = 1, click = 0) {
  const w = 214 * s, h = 72 * s; E.panel(g, x, y, w, h, { fill: 'rgba(12,17,28,.88)', stroke: E.rgba(PAL.white, .17), r: 16 * s, shadow: .28, alpha });
  g.save(); g.globalAlpha *= alpha; g.fillStyle = E.rgba(PAL.violet, .34); g.beginPath(); g.arc(x + 33 * s, y + 36 * s, 18 * s, 0, TAU); g.fill(); g.fillStyle = E.rgba(PAL.cyan, .30); g.beginPath(); g.arc(x + 33 * s, y + 31 * s, 7 * s, 0, TAU); g.fill(); g.fillStyle = E.rgba(PAL.cyan, .22); g.beginPath(); g.arc(x + 33 * s, y + 48 * s, 12 * s, Math.PI, TAU); g.fill(); g.restore();
  E.label(g, textValue, x + 63 * s, y + 32 * s, { size: 12 * s, color: PAL.white, family: 'mono', weight: 700, tracking: 1, alpha }); E.label(g, 'GET /profile', x + 63 * s, y + 51 * s, { size: 11 * s, color: PAL.dim, family: 'mono', tracking: .7, alpha });
  if (click > 0) { g.save(); g.globalAlpha *= alpha * click; g.strokeStyle = PAL.green; g.lineWidth = 2 * s; g.beginPath(); g.arc(x + 33 * s, y + 36 * s, 28 * s * click, 0, TAU); g.stroke(); g.restore(); }
}

function hook(g, t) {
  const s = SCENES[0]; base(g, { lift: 1.08, cool: .8, grid: .92 }); header(g, s, 1);
  const reveal = appear(t, .18, 1.45, back); E.drawNoiseGlyphs(g, 1210, 150, 560, 100, reveal, PAL.violet);
  E.drawNumber(g, '50,000', 1210, 292, { size: 144, color: PAL.white, scramble: 1 - reveal, accent: PAL.violet });
  E.label(g, 'PEOPLE · SAME CELEBRITY PROFILE', 1218, 326, { size: 15, color: PAL.violet, family: 'mono', tracking: 1.6, alpha: reveal });
  const profileP = appear(t, .48, 1.35, back); const profileX = 760, profileY = 325;
  E.drawProfileWindow(g, profileX, profileY, .86, { alpha: profileP, refresh: t > 2.0 ? .15 + between(t, 2.0, 2.5) : 0 });
  E.label(g, 'ONE SHARED READ TARGET', profileX + 215, profileY + 330, { size: 13, color: PAL.dim, family: 'mono', align: 'center', tracking: 1.2, alpha: profileP });
  const oneP = appear(t, .95, 1.55, back); drawUserCard(g, 96, 420, .92, 'USER 01', oneP, pulse(t, 1.62, .28));
  const oneRoute = [[294, 455], [420, 380], [610, 390], [750, 450]]; drawPath(g, oneRoute, PAL.violet, 5, oneP); const oneQ = between(t, 1.55, 2.25); routeDot(g, oneRoute, oneQ, PAL.violet, oneP); routePacket(g, oneRoute, oneQ, 'GET', PAL.violet, t, oneP);
  const cursorP = appear(t, 1.22, 1.62, back); E.drawCursor(g, 238, 442, .54, { alpha: cursorP, click: pulse(t, 1.62, .28) });
  E.pill(g, 94, 520, 270, 34, 'ONE CLICK → ONE REQUEST', { color: PAL.green, stroke: E.rgba(PAL.green, .55), fill: E.rgba(PAL.green, .10), size: 12, mono: true, alpha: oneP });
  const positions = [[88, 600], [330, 600], [88, 700], [330, 700], [88, 800], [330, 800]];
  const swarmP = between(t, 2.35, 4.55);
  positions.forEach((pos, i) => { const a = appear(t, 2.35 + i * .16, 2.72 + i * .16, back); drawUserCard(g, pos[0], pos[1], .76, `USER ${String(i + 2).padStart(2, '0')}`, a, pulse(t, 2.72 + i * .16, .22)); const endY = profileY + 92 + (i % 3) * 34; const route = [[pos[0] + 162, pos[1] + 27], [500, pos[1] + 35], [620, endY], [750, endY]]; drawPath(g, route, PAL.violet, 3, a * .72); const qp = between(t, 2.78 + i * .16, 4.55); routeDot(g, route, qp, PAL.violet, a); });
  if (swarmP > .15) { E.label(g, 'GET /PROFILE × MANY CLIENTS', 430, 292, { size: 13, color: PAL.violet, family: 'mono', weight: 700, tracking: 1.1, alpha: swarmP }); const targetPulse = .5 + .5 * Math.sin(t * 12); g.save(); g.globalAlpha = swarmP; g.strokeStyle = PAL.violet; g.lineWidth = 3; g.beginPath(); g.arc(profileX + 55, profileY + 165, 62 + targetPulse * 10, 0, TAU); g.stroke(); g.restore(); }
  E.panel(g, 1210, 408, 566, 190, { fill: 'rgba(10,14,23,.70)', stroke: 'rgba(238,241,247,.14)', r: 22, shadow: .40, accent: PAL.violet, alpha: appear(t, 2.4, 3.0) });
  E.label(g, 'ALL REQUESTS CONVERGE', 1250, 454, { size: 14, color: PAL.dim, tracking: 1.8 }); E.title(g, 'Same profile.', 1250, 510, { size: 45, color: PAL.white }); E.label(g, 'ONE HOT READ TARGET · MANY CLIENTS', 1252, 552, { size: 14, color: PAL.violet, family: 'mono', tracking: 1.2 });
  E.drawLightSweep(g, between(t, 5.35, 5.95), PAL.violet, .12);
}

function bottleneck(g, t) {
  const s = SCENES[1]; base(g, { lift: .78, cool: .6, grid: .62 }); header(g, s, 2); floor(g, 720, .52);
  const cam = lerp(90, -150, eio(between(t, 6.0, 11.5)));
  const appX = 315 + cam, dbX = 895 + cam, diskX = 1490 + cam, sy = 538;
  stationLine(g, [appX + 105, sy + 12], [dbX - 104, sy + 4], PAL.violet, .95, 'REQUESTS'); stationLine(g, [dbX + 104, sy + 12], [diskX - 124, sy + 2], PAL.red, between(t, 7.6, 8.8), 'READ PRESSURE');
  E.drawApplication(g, appX, sy, .92, { busy: between(t, 7.0, 10.9) }); E.drawDatabase(g, dbX, sy - 62, 1.02, { state: between(t, 7.6, 9.6) > .4 ? 'POOL FULL' : 'READ', row: between(t, 8.0, 9.8), miss: between(t, 7.8, 10.3) }); E.drawDisk(g, diskX, sy + 12, .9, { read: between(t, 8.6, 10.9) });
  const p = [[appX + 120, sy - 8], [appX + 280, sy - 130], [dbX - 180, sy - 160], [dbX - 106, sy - 78]]; const q = between(t, 6.9, 8.4); drawPath(g, p, PAL.violet, 5, .74); routeDot(g, p, q, PAL.violet); routePacket(g, p, q, 'REQ ×n', PAL.violet, t);
  const p2 = [[dbX + 105, sy - 50], [dbX + 260, sy - 165], [diskX - 240, sy - 140], [diskX - 125, sy - 12]]; const q2 = between(t, 8.2, 10.0); drawPath(g, p2, PAL.red, 5, .7); routeDot(g, p2, q2, PAL.red); routePacket(g, p2, q2, 'READ', PAL.red, t + 1);
  const pool = between(t, 6.8, 8.4); drawPool(g, 1260, 160, pool, appear(t, 6.7, 7.3));
  drawLatencyBreakdown(g, 1260, 330, appear(t, 7.8, 8.6));
  const bp = appear(t, 9.2, 9.8, back); E.title(g, 'BOTTLENECK', 1260, 615, { size: 48, color: PAL.red, alpha: bp }); E.label(g, 'THE REPEATED PATH SATURATES THE SOURCE', 1265, 650, { size: 15, color: PAL.red, family: 'mono', tracking: 1.4, alpha: bp });
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
  const appX = 220, cacheX = 650, dbX = 1015, diskX = 1320, y = 585;
  const fast = [[appX + 120, y - 8], [appX + 250, y - 155], [cacheX - 155, y - 155], [cacheX - 96, y - 55]];
  const slow = [[cacheX + 98, y - 35], [cacheX + 230, y - 190], [dbX - 170, y - 175], [dbX - 104, y - 55]];
  drawPath(g, slow, PAL.red, 4, .18, [11, 10]); drawPath(g, fast, PAL.green, 7, .78, null);
  const q = between(t, 19.0, 20.55); routeDot(g, fast, q, PAL.green); routePacket(g, fast, q, 'HIT', PAL.green, t);
  E.drawApplication(g, appX, y, .88, { hit: between(t, 18.7, 19.9) }); E.drawCache(g, cacheX, y - 50, 1.02, { state: 'HIT', fill: 1, hit: 1 }); E.drawDatabase(g, dbX, y - 62, .88, { state: 'ASLEEP', row: 0, hot: 0, alpha: .46 }); E.drawDisk(g, diskX, y + 12, .78, { alpha: .30, read: 0 });
  E.drawProfileWindow(g, 90, 238, .72, { alpha: appear(t, 18.35, 19.1), response: 'hit' });
  const nP = appear(t, 19.55, 20.45, back); E.drawNumber(g, '1.1 ms', 1435, 292, { size: 126, color: PAL.green, alpha: nP, accent: PAL.green }); E.label(g, 'HOT DATA / MEMORY PATH', 1440, 330, { size: 15, color: PAL.green, family: 'mono', tracking: 1.7, alpha: nP });
  E.panel(g, 1400, 398, 420, 126, { fill: 'rgba(12,17,27,.80)', stroke: 'rgba(238,241,247,.13)', r: 18, shadow: .30, alpha: nP * .86 }); E.label(g, 'DATABASE PATH / DIMMED, NOT GONE', 1428, 432, { size: 13, color: PAL.dim, family: 'mono', tracking: 1, alpha: nP }); E.label(g, '≈ 4 ms', 1428, 488, { size: 43, color: PAL.dim, family: 'mono', weight: 700, tracking: 1, alpha: nP });
  const fastP = appear(t, 20.85, 21.65, back); drawFastBreakdown(g, 1400, 590, fastP);
  E.pill(g, 88, 768, 472, 44, 'SAME REQUEST · DIFFERENT COMMON PATH', { color: PAL.violet, stroke: E.rgba(PAL.violet, .55), fill: E.rgba(PAL.violet, .10), size: 14, mono: true, alpha: appear(t, 21.2, 21.9) });
  E.drawLightSweep(g, between(t, 22.8, 23.45), PAL.green, .18);
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
  if (s.id === 'hook' && t >= 1.50) add('traffic-count', '50,000', 1200, 150, 1790, 315);
  if (s.id === 'bottleneck' && t >= 9.25) add('bottleneck', 'BOTTLENECK', 1245, 565, 1580, 635);
  if (s.id === 'miss' && t >= 12.75) add('miss-route', 'MISS → DATABASE → STORE → RESPOND', 100, 755, 790, 835);
  if (s.id === 'hit' && t >= 20.5) add('fast-latency', '1.1 ms', 1390, 165, 1790, 315);
  if (s.id === 'teardown' && t >= 25.9) add('ttl', 'TTL 60 s', 1430, 450, 1645, 550);
  if (s.id === 'teardown' && t >= 27.3) add('less-work', 'LESS REPEATED WORK', 1440, 245, 1810, 385);
  return out;
}
