// Payment Idempotency — 60 s portrait explainer.
// Every frame is a pure function of t. The film never stores state between renders.
import * as E from './engine.js';
import { DUR, SCENES, CAPTIONS, sceneAt, captionAt } from './timeline.js';

const { W, H, PAL, clamp, lerp, seg, ss, eo, ei, eio, back, spring, hash, font } = E;
export { DUR };

function appear(t, a, b, ease = eio) { return ease(seg(t, a, b)); }
function pulse(t, at, span = .32) { return Math.max(0, 1 - clamp(Math.abs(t - at) / span)); }
function between(t, a, b) { return clamp(seg(t, a, b)); }
function easePath(g, points, t, color, width = 4, alpha = 1, glowWidth = 0) { if (t <= 0) return; const n = Math.max(1, Math.floor(t * (points.length - 1))); const p = points.slice(0, n + 1); p.push(E.lerpPoint(points[Math.min(n, points.length - 2)], points[Math.min(n + 1, points.length - 1)], t * (points.length - 1) - n)); E.line(g, p, { color, width, alpha, glowWidth }); }
function routeDot(g, points, p, color = PAL.violet, alpha = 1) { if (p <= 0 || p >= 1) return; const q = E.polyPoint(points, p); E.movingDot(g, q, { color, r: 9, alpha }); }
function sceneHeader(g, scene, n, p = 1) { E.introChrome(g, scene, 0, { progress: p, number: n }); }
function sceneBase(g, options = {}) { E.bg(g, options); }
function isoShadow(g, x, y, rx, ry, alpha = .3) { g.save(); g.fillStyle = `rgba(0,0,0,${alpha})`; g.filter = 'blur(22px)'; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); g.filter = 'none'; g.restore(); }
function note(g, text, x, y, color = PAL.dim, alpha = 1) { E.label(g, text, x, y, { size: 15, color, family: 'mono', tracking: 1.5, alpha }); }
function textBlock(g, heading, copy, x, y, color = PAL.white, alpha = 1) { E.title(g, heading, x, y, { size: 36, color, alpha }); E.wrapText(g, copy, x, y + 28, 450, 30, { size: 21, color: PAL.dim, alpha, maxLines: 3 }); }

function hook(g, t) {
  const scene = SCENES[0]; sceneBase(g, { lift: 1.05, cool: .82, grid: .86 }); sceneHeader(g, scene, 1);
  const phoneP = appear(t, .15, 1.1, back), phoneY = lerp(850, 760, phoneP), phoneS = lerp(.86, 1.02, phoneP);
  isoShadow(g, 540, phoneY + 360 * phoneS, 250 * phoneS, 42 * phoneS, .42);
  E.drawPhone(g, 540, phoneY, phoneS, { tap: Math.max(pulse(t, 2.25, .32), pulse(t, 3.10, .32)), frozen: t >= 3.55 && t < 5.25 });
  if (t < 1.6) E.drawNoiseGlyphs(g, 340, 650, 400, 160, between(t, 1.0, 1.6), PAL.violet);
  // two exact request paths leave the same client surface, but never cross.
  const p1 = [[690, 1015], [806, 1070], [874, 1200], [820, 1330]];
  const p2 = [[704, 1040], [866, 1100], [934, 1260], [820, 1405]];
  const q1 = between(t, 3.34, 5.45), q2 = between(t, 3.82, 5.75);
  E.bezier(g, p1[0], p1[1], p1[2], p1[3], { color: PAL.violet, width: 5, alpha: .28 + .72 * q1, glowWidth: 18 });
  E.bezier(g, p2[0], p2[1], p2[2], p2[3], { color: PAL.violet, width: 5, alpha: .28 + .72 * q2, glowWidth: 18 });
  routeDot(g, p1, eio(q1), PAL.violet, q1); routeDot(g, p2, eio(q2), PAL.violet, q2);
  if (q1 > .15) E.drawPacket(g, ...E.polyPoint(p1, eio(q1)), 'REQ 01', { color: PAL.violet, scale: .72, pulse: t });
  if (q2 > .15) E.drawPacket(g, ...E.polyPoint(p2, eio(q2)), 'RETRY 02', { color: PAL.violet, scale: .72, pulse: t + 1 });
  if (t > 3.0) { note(g, 'REQUEST 01', 760, 1210, PAL.violet, between(t, 3.2, 4.3)); note(g, 'RETRY 02', 820, 1285, PAL.violet, between(t, 3.8, 4.8)); }
  const redP = appear(t, 5.38, 6.05, back); const shake = t > 5.7 && t < 6.35 ? Math.sin(t * 48) * 3 * (1 - between(t, 6.0, 6.35)) : 0;
  E.title(g, 'DOUBLE CHARGE?', 540 + shake, 1515, { size: 58, color: PAL.red, align: 'center', alpha: redP, weight: 700 });
  if (redP > 0) { E.lowerRule(g, 1543, redP, E.rgba(PAL.red, .38)); note(g, 'THE RETRY HAS NO IDENTITY', 540, 1590, PAL.red, redP * .85); }
}

function problem(g, t) {
  const scene = SCENES[1]; sceneBase(g, { lift: .82, cool: .7, grid: .78 }); sceneHeader(g, scene, 2);
  const boardP = appear(t, 8.0, 8.45);
  E.panel(g, 52, 260, 976, 1085, { fill: 'rgba(12,15,22,.7)', stroke: 'rgba(233,234,240,.10)', r: 26, shadow: .52, alpha: boardP });
  note(g, 'TWO REQUESTS / ONE PAYMENT INTENT', 88, 310, PAL.dim, boardP);
  const serverX = 690, serverY = 760, serverS = .86;
  const a = [[125, 570], [320, 570], [485, 650], [536, 690]];
  const b = [[125, 835], [330, 835], [470, 780], [536, 805]];
  const pa = between(t, 8.55, 10.85), pb = between(t, 9.0, 11.35);
  E.bezier(g, a[0], a[1], a[2], a[3], { color: PAL.violet, width: 6, alpha: boardP, glowWidth: 15 }); E.bezier(g, b[0], b[1], b[2], b[3], { color: PAL.violet, width: 6, alpha: boardP, glowWidth: 15 });
  routeDot(g, a, eio(pa), PAL.violet, boardP); routeDot(g, b, eio(pb), PAL.violet, boardP);
  if (pa > .1) E.drawPacket(g, ...E.polyPoint(a, eio(pa)), 'REQ 01', { color: PAL.violet, scale: .74, pulse: t });
  if (pb > .1) E.drawPacket(g, ...E.polyPoint(b, eio(pb)), 'REQ 02', { color: PAL.violet, scale: .74, pulse: t + 1 });
  note(g, 'same amount', 94, 518, PAL.dim, boardP); note(g, 'same intent', 94, 868, PAL.dim, boardP);
  const c1 = between(t, 11.0, 11.6), c2 = between(t, 11.45, 12.1);
  E.drawServer(g, serverX, serverY, serverS, { alpha: boardP, bay1: c1, bay2: c2, quiet: false });
  note(g, 'EXECUTION LAYER', 558, 1110, PAL.dim, boardP);
  const l1 = appear(t, 12.55, 13.22, back), l2 = appear(t, 13.44, 14.05, back);
  E.drawLedger(g, 116, 1180, '₹2,000', 'TXN_8F2A', PAL.red, l1 * boardP); E.drawLedger(g, 116, 1295, '₹2,000', 'TXN_91C0', PAL.red, l2 * boardP);
  if (l2 > .1) { E.drawConstraint(g, 116, 1423, 440, 'DUPLICATE PAYMENT RISK', { color: PAL.red, alpha: l2 }); }
  const rp = appear(t, 14.45, 15.18, back); E.title(g, 'TWICE PROCESSED', 540, 1580, { size: 52, color: PAL.red, align: 'center', alpha: rp, weight: 700 }); note(g, 'WITHOUT A KEY, THE SERVER CANNOT TELL A RETRY FROM A NEW OPERATION', 540, 1630, PAL.red, rp * .85);
  E.drawLightSweep(g, between(t, 16.45, 17.0), PAL.red, .13);
}

function solution(g, t) {
  const scene = SCENES[2]; sceneBase(g, { lift: .9, cool: .76, grid: .84 }); sceneHeader(g, scene, 3);
  const keyP = appear(t, 17.0, 17.75, back);
  E.drawKey(g, 480, 390, 1.08, { alpha: keyP, glowOn: keyP, labelText: 'pay_123' });
  note(g, 'UNIQUE IDENTITY FOR ONE LOGICAL OPERATION', 540, 540, PAL.violet, keyP * .92);
  const sP = appear(t, 18.0, 19.0);
  E.panel(g, 64, 620, 952, 850, { fill: 'rgba(12,15,22,.66)', stroke: 'rgba(233,234,240,.10)', r: 26, shadow: .5, alpha: sP });
  note(g, 'CLIENT', 96, 680, PAL.dim, sP); note(g, 'PAYMENT SERVICE', 420, 680, PAL.dim, sP); note(g, 'KEY TABLE', 760, 680, PAL.dim, sP);
  const dbX = 820, dbY = 850;
  E.drawServer(g, 500, 1000, .58, { alpha: sP, bay1: 0, bay2: 0 });
  E.drawDatabase(g, dbX, dbY, .78, { alpha: sP, key: 'pay_123', state: t >= 28 ? 'PROCESSING' : 'RESERVE', color: PAL.violet, cut: between(t, 24.0, 26.2), glowOn: appear(t, 26.55, 27.35), owner: t >= 26.6 ? 'OWNER: REQUEST 01' : null });
  const req1 = [[148, 835], [300, 835], [376, 900], [382, 932]], req2 = [[148, 1050], [280, 1050], [360, 1010], [382, 1010]];
  const q1 = between(t, 19.25, 22.2), q2 = between(t, 20.15, 23.2);
  E.bezier(g, req1[0], req1[1], req1[2], req1[3], { color: PAL.violet, width: 5, alpha: sP, glowWidth: 14 }); E.bezier(g, req2[0], req2[1], req2[2], req2[3], { color: PAL.violet, width: 5, alpha: sP, glowWidth: 14 });
  routeDot(g, req1, eio(q1), PAL.violet, sP); routeDot(g, req2, eio(q2), PAL.violet, sP);
  if (q1 > .08) { E.drawPacket(g, ...E.polyPoint(req1, eio(q1)), 'KEY', { color: PAL.violet, scale: .7, pulse: t }); }
  if (q2 > .08) { E.drawPacket(g, ...E.polyPoint(req2, eio(q2)), 'KEY', { color: PAL.violet, scale: .7, pulse: t + 1 }); }
  if (t > 20.0) { E.pill(g, 104, 748, 162, 54, 'REQ + key', { color: PAL.violet, stroke: E.rgba(PAL.violet, .6), fill: E.rgba(PAL.violet, .09), size: 15, mono: true, alpha: sP }); E.pill(g, 104, 1116, 198, 54, 'RETRY + key', { color: PAL.violet, stroke: E.rgba(PAL.violet, .6), fill: E.rgba(PAL.violet, .09), size: 15, mono: true, alpha: sP }); }
  // Signature cutaway: a line appears before the near side opens.
  const cut = between(t, 24.0, 26.2); if (cut > 0) { E.line(g, [[690, 740], [948, 740]], { color: PAL.white, width: 2, alpha: cut }); note(g, 'CUTAWAY → ATOMIC RESERVATION', 540, 1380, PAL.violet, cut); }
  const reserve = appear(t, 26.5, 27.25, back); if (reserve > 0) { E.drawStatus(g, 820, 1325, 'ATOMIC RESERVE', { color: PAL.violet, alpha: reserve, w: 300, h: 64 }); note(g, 'UNIQUE(key) → ONE OWNER', 820, 1418, PAL.violet, reserve); }
  const proc = appear(t, 27.65, 28.2, back); if (proc > 0) { E.drawStatus(g, 540, 1540, 'PROCESSING', { color: PAL.violet, alpha: proc, w: 300, h: 68, sub: 'retry may wait or get IN_PROGRESS' }); }
}

function retry(g, t) {
  const scene = SCENES[3]; sceneBase(g, { lift: 1.0, cool: .65, grid: .8 }); sceneHeader(g, scene, 4);
  E.panel(g, 52, 260, 976, 1190, { fill: 'rgba(12,15,22,.68)', stroke: 'rgba(233,234,240,.10)', r: 26, shadow: .5 });
  const sx = 320, sy = 700, dx = 790, dy = 690;
  note(g, 'ONE EXECUTION PATH', 86, 316, PAL.dim); note(g, 'STORED RESPONSE PATH', 626, 316, PAL.dim);
  const first = [[100, 610], [210, 610], [260, 675], [sx - 40, sy]]; const retryP = [[100, 940], [245, 940], [410, 830], [sx + 20, sy + 18]];
  const p1 = between(t, 30.1, 31.6), p2 = between(t, 36.85, 38.45);
  E.bezier(g, first[0], first[1], first[2], first[3], { color: PAL.violet, width: 5, alpha: .72, glowWidth: 12 }); E.bezier(g, retryP[0], retryP[1], retryP[2], retryP[3], { color: PAL.violet, width: 5, alpha: .72, glowWidth: 12 });
  if (p1 > 0) { routeDot(g, first, eio(p1), PAL.violet); E.drawPacket(g, ...E.polyPoint(first, eio(p1)), 'REQ 01', { color: PAL.violet, scale: .7, pulse: t }); }
  if (p2 > 0) { routeDot(g, retryP, eio(p2), PAL.violet); E.drawPacket(g, ...E.polyPoint(retryP, eio(p2)), 'RETRY', { color: PAL.violet, scale: .7, pulse: t + 1 }); }
  E.drawServer(g, sx, sy, .66, { bay1: appear(t, 30.45, 31.15), bay2: 0, quiet: true });
  const stored = appear(t, 33.0, 34.0, back); E.drawDatabase(g, dx, dy, .78, { key: 'pay_123', state: t >= 34.88 ? 'COMPLETED' : 'PROCESSING', color: t >= 34.88 ? PAL.green : PAL.violet, alpha: 1, glowOn: stored, result: t >= 34.88 });
  if (stored > 0) { E.drawCheck(g, 462, 575, 34, { color: PAL.green, alpha: stored, pulse: t }); E.line(g, [[464, 700], [650, 700], [730, 680]], { color: PAL.green, width: 6, alpha: stored, glowWidth: 16 }); note(g, 'RESULT STORED ONCE', 492, 650, PAL.green, stored); }
  const comp = appear(t, 34.72, 35.55, back); if (comp > 0) { E.drawStatus(g, dx, 1060, 'COMPLETED', { color: PAL.green, alpha: comp, w: 306, h: 66 }); }
  const response = between(t, 37.75, 40.0); if (response > 0) {
    const respPts = [[dx, 980], [740, 1210], [520, 1260], [250, 1270]]; const respPts2 = [[dx + 40, 1030], [760, 1320], [540, 1380], [250, 1390]];
    E.bezier(g, respPts[0], respPts[1], respPts[2], respPts[3], { color: PAL.green, width: 5, alpha: response, glowWidth: 14 }); E.bezier(g, respPts2[0], respPts2[1], respPts2[2], respPts2[3], { color: PAL.green, width: 5, alpha: response * .72, dash: [12, 12], glowWidth: 9 });
    E.drawPacket(g, ...E.polyPoint(respPts, eio(response)), 'RESULT', { color: PAL.green, scale: .72, pulse: t });
    E.drawPacket(g, ...E.polyPoint(respPts2, eio(Math.max(0, response - .08))), 'RESULT', { color: PAL.green, scale: .72, pulse: t + 1 });
  }
  const hero = appear(t, 39.8, 40.65, back); E.title(g, 'ONE PAYMENT', 540, 1555, { size: 54, color: PAL.green, align: 'center', weight: 700, alpha: hero }); E.title(g, 'TWO RESPONSES', 540, 1620, { size: 54, color: PAL.white, align: 'center', weight: 700, alpha: hero }); note(g, 'SAVED RESULT · NO SECOND CHARGE', 540, 1672, PAL.dim, hero);
}

function race(g, t) {
  const scene = SCENES[4]; sceneBase(g, { lift: .72, cool: .55, grid: .78 }); sceneHeader(g, scene, 5);
  E.panel(g, 52, 260, 976, 1220, { fill: 'rgba(12,15,22,.7)', stroke: 'rgba(233,234,240,.10)', r: 26, shadow: .5 });
  note(g, 'THE READ-THEN-WRITE TRAP', 88, 316, PAL.dim); note(g, 'ATOMIC OWNER SELECTION', 640, 316, PAL.violet);
  const dbX = 760, dbY = 740; const a = [[130, 610], [300, 610], [510, 710], [628, 760]], b = [[130, 930], [330, 930], [510, 800], [628, 760]];
  const pa = between(t, 43.7, 45.9), pb = between(t, 44.15, 45.9);
  E.bezier(g, a[0], a[1], a[2], a[3], { color: PAL.violet, width: 6, alpha: .8, glowWidth: 15 }); E.bezier(g, b[0], b[1], b[2], b[3], { color: PAL.violet, width: 6, alpha: .8, glowWidth: 15 });
  if (pa > 0) { routeDot(g, a, eio(pa), PAL.violet); E.drawPacket(g, ...E.polyPoint(a, eio(pa)), 'RESERVE A', { color: PAL.violet, scale: .72, pulse: t }); }
  if (pb > 0) { routeDot(g, b, eio(pb), PAL.violet); E.drawPacket(g, ...E.polyPoint(b, eio(pb)), 'RESERVE B', { color: PAL.violet, scale: .72, pulse: t + 1 }); }
  const owner = appear(t, 46.0, 46.6, back); E.drawDatabase(g, dbX, dbY, .92, { key: 'pay_123', state: owner ? 'OWNER: A' : 'RESERVE', owner: owner ? 'REQUEST B IS NOT AN OWNER' : null, color: PAL.violet, glowOn: owner });
  const u = appear(t, 47.2, 48.05, back); if (u > 0) { E.drawConstraint(g, 566, 1060, 394, 'UNIQUE(key) · ALREADY EXISTS', { color: PAL.red, alpha: u, h: 78 }); E.line(g, [[762, 1004], [762, 1060]], { color: PAL.red, width: 4, alpha: u }); }
  const wait = appear(t, 48.7, 49.55, back); if (wait > 0) { E.bezier(g, [762, 1138], [760, 1220], [610, 1280], [430, 1300], { color: PAL.red, width: 5, alpha: wait, dash: [10, 10], glowWidth: 10 }); E.drawStatus(g, 360, 1320, 'IN_PROGRESS / WAIT', { color: PAL.violet, alpha: wait, w: 360, h: 70 }); }
  const truth = appear(t, 50.2, 51.15, back); if (truth > 0) { E.drawCheck(g, 540, 1540, 28, { color: PAL.violet, alpha: truth, pulse: t }); note(g, 'THE LOSER DOES NOT INVENT A COMPLETED RESULT', 540, 1615, PAL.white, truth); }
  const shake = t > 45.5 && t < 47.3 ? Math.sin(t * 70) * 2 * (1 - between(t, 46.4, 47.3)) : 0; if (shake) E.line(g, [[540 + shake, 420], [540 + shake, 520]], { color: PAL.red, width: 3, alpha: .45 });
}

function takeaway(g, t) {
  const scene = SCENES[5]; sceneBase(g, { lift: 1.0, cool: .82, grid: .8 }); sceneHeader(g, scene, 6);
  const p = appear(t, 53.0, 54.0);
  E.panel(g, 52, 280, 976, 760, { fill: 'rgba(12,15,22,.66)', stroke: 'rgba(233,234,240,.10)', r: 28, shadow: .5, alpha: p });
  const mergeP = between(t, 53.0, 54.6); const A = [[140, 540], [330, 540], [456, 660], [540, 750]], B = [[140, 790], [330, 790], [456, 840], [540, 750]];
  E.bezier(g, A[0], A[1], A[2], A[3], { color: PAL.violet, width: 7, alpha: p, glowWidth: 16 }); E.bezier(g, B[0], B[1], B[2], B[3], { color: PAL.violet, width: 7, alpha: p, glowWidth: 16 });
  if (mergeP < 1) { routeDot(g, A, eio(mergeP), PAL.violet, p); routeDot(g, B, eio(mergeP), PAL.violet, p); }
  const success = appear(t, 54.55, 55.45, back); if (success > 0) { E.glow(g, 540, 750, 190, PAL.green, .24 * success); g.fillStyle = E.rgba(PAL.green, .16 * success); g.beginPath(); g.arc(540, 750, 78 + success * 12, 0, Math.PI * 2); g.fill(); E.drawCheck(g, 540, 750, 50, { color: PAL.green, alpha: success, pulse: t }); }
  note(g, 'ONE PAYMENT OPERATION', 690, 735, PAL.green, success); note(g, 'MANY SAFE RESPONSES', 690, 770, PAL.dim, success);
  const titleP = appear(t, 55.75, 56.55, back); E.title(g, 'SAFE RETRIES.', 540, 1245, { size: 63, color: PAL.violet, align: 'center', weight: 700, alpha: titleP }); E.title(g, 'NO DUPLICATE', 540, 1320, { size: 62, color: PAL.white, align: 'center', weight: 700, alpha: titleP }); E.title(g, 'EXECUTION.', 540, 1394, { size: 62, color: PAL.white, align: 'center', weight: 700, alpha: titleP });
  E.lowerRule(g, 1432, titleP, E.rgba(PAL.violet, .42));
  const scope = appear(t, 58.85, 59.35, back); E.panel(g, 106, 1510, 868, 146, { fill: 'rgba(17,20,29,.84)', stroke: 'rgba(233,234,240,.16)', r: 18, shadow: 0, alpha: scope }); note(g, 'SCOPE NOTE', 138, 1550, PAL.dim, scope); E.wrapText(g, 'Provider-side idempotency or recovery may still be required.', 138, 1573, 800, 31, { size: 23, color: PAL.white, alpha: scope, maxLines: 2 });
  E.drawLightSweep(g, between(t, 54.8, 56.0), PAL.green, .16);
}

function transition(g, t, scene) { if (!scene || scene.t0 <= 0) return; const p = clamp((t - scene.t0) / .55); if (p >= 1) return; g.save(); g.globalCompositeOperation = 'lighter'; const x = lerp(-160, W + 160, eio(p)); const gr = g.createLinearGradient(x - 130, 0, x + 130, 0); gr.addColorStop(0, E.rgba(PAL.violet, 0)); gr.addColorStop(.5, E.rgba(PAL.violet, .14)); gr.addColorStop(1, E.rgba(PAL.violet, 0)); g.fillStyle = gr; g.fillRect(x - 160, 0, 320, H); g.restore(); }
function drawCaptions(g, t) { const active = captionAt(t); const c = active.length ? active[active.length - 1] : null; if (!c) return; const a = E.captionTransition(c.t0, c.t1, t); E.caption(g, c.text, { y: t >= 53 ? 1680 : 1685, alpha: a, dense: c.text.length > 70, accent: t < 17 ? PAL.red : PAL.violet }); }

export function renderFilm(g, t, o = {}) {
  E.clear(g); t = clamp(t, 0, DUR - 1 / 240); const scene = sceneAt(t);
  if (scene.id === 'hook') hook(g, t); else if (scene.id === 'problem') problem(g, t); else if (scene.id === 'solution') solution(g, t); else if (scene.id === 'retry') retry(g, t); else if (scene.id === 'race') race(g, t); else takeaway(g, t);
  transition(g, t, scene);
  if (!o.nosub) drawCaptions(g, t);
  E.vignette(g, t < 17 ? .62 : .52);
}

export function textsAt(t) {
  const scene = sceneAt(t); const out = [];
  const add = (id, text, x0, y0, x1, y1, pass = false) => out.push({ id, text, x0, y0, x1, y1, pass });
  // Captions are intentionally omitted from TEXTS: the Lemo-Opuscar readcheck
  // validates subtitle timing from captions.srt, not from the scene-text boxes.
  if (scene.id === 'hook' && t >= 5.35) add('double-charge', 'DOUBLE CHARGE?', 250, 1450, 830, 1540);
  if (scene.id === 'problem' && t >= 14.45) add('twice-processed', 'TWICE PROCESSED', 250, 1520, 830, 1600);
  if (scene.id === 'solution' && t >= 27.6) add('processing', 'PROCESSING', 390, 1490, 690, 1580);
  if (scene.id === 'retry' && t >= 39.8) add('two-responses', 'ONE PAYMENT TWO RESPONSES', 180, 1490, 900, 1660);
  if (scene.id === 'race' && t >= 48.7) add('in-progress', 'IN_PROGRESS / WAIT', 160, 1250, 560, 1390);
  if (scene.id === 'takeaway' && t >= 55.75) { add('safe-retries', 'SAFE RETRIES.', 180, 1170, 900, 1280); add('no-duplicate', 'NO DUPLICATE EXECUTION.', 120, 1260, 950, 1430); }
  return out;
}
