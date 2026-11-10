// One source of truth for the minimalist architectural cut.
export const W = 1920;
export const H = 1080;
export const FPS = 24;
export const DUR = 30;

export const SCENES = [
  { id: 'hook', t0: 0, t1: 5.6, title: 'ONE CLICK', kicker: 'ONE REQUEST' },
  { id: 'bottleneck', t0: 5.6, t1: 11.5, title: 'REPEATED WORK', kicker: 'DATABASE BOTTLENECK' },
  { id: 'miss', t0: 11.5, t1: 17.7, title: 'ADD A CACHE', kicker: 'MISS → READ → SAVE' },
  { id: 'hit', t0: 17.7, t1: 23.6, title: 'CACHE HIT', kicker: 'SHORTER COMMON PATH' },
  { id: 'teardown', t0: 23.6, t1: 30, title: 'THE TRADE-OFF', kicker: 'TTL · SOURCE OF TRUTH · DESIGN' },
];

export const CAPTIONS = [
  { id: 'c1', t0: 0.18, t1: 5.42, text: 'One click creates one request. The app asks the database for a profile.' },
  { id: 'c2', t0: 5.72, t1: 11.30, text: 'Fifty thousand people ask for the same profile. Repeated work makes the database the bottleneck.' },
  { id: 'c3', t0: 11.62, t1: 17.50, text: 'Add a cache. The first lookup misses, reads the database, and saves the answer.' },
  { id: 'c4', t0: 17.82, t1: 23.38, text: 'Next time, the lookup hits. Memory returns it in about one point one milliseconds, not four.' },
  { id: 'c5', t0: 23.72, t1: 29.80, text: 'TTL expires old answers. Caching removes repeated work; the database still matters.' },
];

export const NARRATION = [
  { id: 'scene01', scene: 'hook', t0: 0.0, t1: 5.6, file: 'narration/processed/scene01.wav', text: 'One click creates one request. The app asks the database for a profile.' },
  { id: 'scene02', scene: 'bottleneck', t0: 5.6, t1: 11.5, file: 'narration/processed/scene02.wav', text: 'Fifty thousand people ask for the same profile. Repeated work makes the database the bottleneck.' },
  { id: 'scene03', scene: 'miss', t0: 11.5, t1: 17.7, file: 'narration/processed/scene03.wav', text: 'Add a cache. The first lookup misses, reads the database, and saves the answer.' },
  { id: 'scene04', scene: 'hit', t0: 17.7, t1: 23.6, file: 'narration/processed/scene04.wav', text: 'Next time, the lookup hits. Memory returns it in about one point one milliseconds, not four.' },
  { id: 'scene05', scene: 'teardown', t0: 23.6, t1: 30, file: 'narration/processed/scene05.wav', text: 'TTL expires old answers. Caching removes repeated work; the database still matters.' },
];

export const EVENTS = [
  [0.0, 'open'], [0.95, 'single_click'], [1.3, 'single_request'], [2.55, 'traffic_scale'], [3.4, 'requests_converge'],
  [5.6, 'architecture_pullback'], [7.0, 'database_pressure'], [8.0, 'disk_read'], [9.35, 'latency_breakdown'],
  [11.5, 'cache_inserted'], [12.25, 'cache_miss'], [13.4, 'database_read'], [14.6, 'result_return'], [15.35, 'cache_save'],
  [17.7, 'same_request'], [18.9, 'cache_hit'], [19.8, 'latency_reveal'], [21.0, 'memory_response'],
  [23.6, 'teardown'], [25.0, 'ttl_reveal'], [27.4, 'ttl_expiry'], [28.1, 'stampede_scope'], [29.45, 'final_hold'],
].map(([t, type, extra = {}]) => ({ t, type, ...extra }));

export function sceneAt(t) { return SCENES.find(s => t >= s.t0 && t < s.t1) || SCENES[SCENES.length - 1]; }
export function captionAt(t) { return CAPTIONS.filter(c => t >= c.t0 && t <= c.t1); }
export function srtTime(sec) { const ms = Math.max(0, Math.round(sec * 1000)); const h = Math.floor(ms / 3600000); const m = Math.floor(ms / 60000) % 60; const s = Math.floor(ms / 1000) % 60; const z = ms % 1000; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(z).padStart(3, '0')}`; }
export function srt() { return CAPTIONS.map((c, i) => `${i + 1}\n${srtTime(c.t0)} --> ${srtTime(c.t1)}\n${c.text}\n`).join('\n'); }
