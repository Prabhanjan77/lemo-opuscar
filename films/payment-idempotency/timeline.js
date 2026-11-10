// One source of truth for the picture, captions, narration placement, and sound cues.
export const W = 1080;
export const H = 1920;
export const FPS = 24;
export const DUR = 60;

export const SCENES = [
  { id: 'hook', t0: 0, t1: 8, title: 'THE HOOK', kicker: 'ONE ACTION · TWO REQUESTS' },
  { id: 'problem', t0: 8, t1: 17, title: 'THE PROBLEM', kicker: 'WITHOUT PROTECTION · DUPLICATE EXECUTION' },
  { id: 'solution', t0: 17, t1: 30, title: 'THE SOLUTION', kicker: 'SAME KEY · ONE LOGICAL OPERATION' },
  { id: 'retry', t0: 30, t1: 43, title: 'SAFE RETRY', kicker: 'STORE THE RESULT · REPLAY THE RESPONSE' },
  { id: 'race', t0: 43, t1: 53, title: 'THE CONCURRENCY TEST', kicker: 'SIMULTANEOUS ARRIVAL · ATOMIC OWNERSHIP' },
  { id: 'takeaway', t0: 53, t1: 60, title: 'THE TAKEAWAY', kicker: 'ONE OPERATION · SAFE RETRIES' },
];

// Caption windows are deliberately a little longer than the spoken phrase. The page's
// UI toast is lifted over busy system diagrams and never covers the hero object.
// Captions follow the actual selected-voice clips. Scene cuts remain on the approved
// 0/8/17/30/43/53 grid; the few overhangs are intentional J/L cuts, so speech stays
// continuous while the next infrastructure layer enters.
export const CAPTIONS = [
  { id: 'h1', t0: 0.20, t1: 2.68, text: 'Imagine paying two thousand rupees online.' },
  { id: 'h2', t0: 2.72, t1: 4.56, text: 'You click Pay.' },
  { id: 'h3', t0: 4.60, t1: 6.40, text: 'The screen freezes.' },
  { id: 'h4', t0: 6.44, t1: 9.60, text: 'So you click again. Did you just pay twice?' },
  { id: 'p1', t0: 9.68, t1: 12.86, text: 'Both requests might reach the payment server.' },
  { id: 'p2', t0: 12.90, t1: 17.46, text: 'Without protection, the system could process the same payment twice.' },
  { id: 's1', t0: 17.58, t1: 21.14, text: "That's why payment systems use idempotency keys." },
  { id: 's2', t0: 21.18, t1: 26.76, text: 'The client attaches the same unique key to every retry of one payment operation.' },
  { id: 'r1', t0: 26.92, t1: 31.20, text: 'The first request processes the payment and stores its result.' },
  { id: 'r2', t0: 31.24, t1: 37.26, text: 'When the retry arrives, the server finds the same key and returns the saved result instead of charging again.' },
  { id: 'c1', t0: 37.42, t1: 40.70, text: 'But what if both requests arrive simultaneously?' },
  { id: 'c2', t0: 40.74, t1: 46.22, text: 'Atomic key reservation ensures only one request can own the operation.' },
  { id: 't1', t0: 46.40, t1: 48.82, text: "That's payment idempotency." },
  { id: 't2', t0: 48.86, t1: 53.00, text: 'One payment operation, even when clients retry.' },
  { id: 't3', t0: 53.04, t1: 56.44, text: 'A small key that solves a big distributed systems problem.' },
];

export const NARRATION = [
  { id: 'scene01', scene: 'hook', t0: 0.0, t1: 9.64, file: 'narration/scene01.wav', text: 'Imagine paying two thousand rupees online. You click Pay. The screen freezes. So you click again. Did you just pay twice?' },
  { id: 'scene02', scene: 'problem', t0: 9.64, t1: 17.52, file: 'narration/scene02.wav', text: 'Both requests might reach the payment server. Without protection, the system could process the same payment twice.' },
  { id: 'scene03', scene: 'solution', t0: 17.52, t1: 26.84, file: 'narration/scene03.wav', text: "That's why payment systems use idempotency keys. The client attaches the same unique key to every retry of one payment operation." },
  { id: 'scene04', scene: 'retry', t0: 26.84, t1: 37.32, file: 'narration/scene04.wav', text: 'The first request processes the payment and stores its result. When the retry arrives, the server finds the same key and returns the saved result instead of charging again.' },
  { id: 'scene05', scene: 'race', t0: 37.32, t1: 46.28, file: 'narration/scene05.wav', text: 'But what if both requests arrive simultaneously? Atomic key reservation ensures only one request can own the operation.' },
  { id: 'scene06', scene: 'takeaway', t0: 46.28, t1: 56.48, file: 'narration/scene06.wav', text: "That's payment idempotency. One payment operation, even when clients retry. A small key that solves a big distributed systems problem." },
];

export const EVENTS = [
  [0.0, 'open'], [1.15, 'amount_lock'], [2.25, 'pay_click', { n: 1 }], [3.10, 'pay_click', { n: 2 }],
  [3.45, 'request_depart', { n: 1 }], [3.92, 'request_depart', { n: 2 }], [5.82, 'double_charge'],
  [8.0, 'system_wide'], [10.82, 'server_arrival', { n: 1 }], [11.34, 'server_arrival', { n: 2 }], [13.15, 'charge_attempt', { n: 1 }], [14.0, 'charge_attempt', { n: 2 }], [15.32, 'duplicate_records'],
  [17.0, 'key_reveal'], [20.0, 'key_attach', { n: 1 }], [21.0, 'key_attach', { n: 2 }], [24.0, 'cutaway'], [26.6, 'atomic_reserve'], [28.0, 'processing'],
  [30.0, 'first_payment'], [33.2, 'store_result'], [34.88, 'completed'], [37.84, 'retry_route'], [40.15, 'two_responses'],
  [43.0, 'concurrency'], [45.8, 'simultaneous_arrival'], [47.35, 'unique_constraint'], [49.0, 'in_progress'], [51.35, 'no_fabricated_result'],
  [53.0, 'merge'], [55.18, 'success_bloom'], [56.0, 'final_title'], [59.1, 'scope_note'],
].map(([t, type, extra = {}]) => ({ t, type, ...extra }));

export function sceneAt(t) {
  return SCENES.find(s => t >= s.t0 && t < s.t1) || SCENES[SCENES.length - 1];
}

export function captionAt(t) {
  return CAPTIONS.filter(c => t >= c.t0 && t <= c.t1);
}

export function srtTime(sec) {
  const ms = Math.max(0, Math.round(sec * 1000));
  const h = Math.floor(ms / 3600000); const m = Math.floor(ms / 60000) % 60; const s = Math.floor(ms / 1000) % 60; const z = ms % 1000;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(z).padStart(3, '0')}`;
}

export function srt() {
  return CAPTIONS.map((c, i) => `${i + 1}\n${srtTime(c.t0)} --> ${srtTime(c.t1)}\n${c.text}\n`).join('\n');
}
