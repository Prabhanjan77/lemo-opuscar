// One source of truth for the slower architect's cut: picture, captions, narration, and cues.
export const W = 1920;
export const H = 1080;
export const FPS = 24;
export const DUR = 30;

export const SCENES = [
  { id: 'hook', t0: 0, t1: 6.0, title: 'THE SPIKE', kicker: 'ONE PERSON · ONE CLICK · ONE REQUEST' },
  { id: 'bottleneck', t0: 6.0, t1: 11.5, title: 'THE BOTTLENECK', kicker: 'MANY REQUESTS · ONE DATABASE PATH' },
  { id: 'miss', t0: 11.5, t1: 17.8, title: 'THE MISS PATH', kicker: 'LOOKUP FIRST · FALL THROUGH · POPULATE' },
  { id: 'hit', t0: 17.8, t1: 23.5, title: 'THE HIT PATH', kicker: 'SAME PROFILE · SHORTER COMMON PATH' },
  { id: 'teardown', t0: 23.5, t1: 30, title: 'THE TRADE-OFF', kicker: 'TTL · STALE DATA · STAMPEDE DESIGN' },
];

// Speech is intentionally allowed to breathe across the visual scene boundaries.
// The generated clips are kept at their natural selected-voice pace; no 1.08x squeeze.
export const CAPTIONS = [
  { id: 'c1', t0: 0.20, t1: 5.82, text: 'One person clicks once: one request. Now fifty thousand people click the same profile.' },
  { id: 'c2', t0: 6.08, t1: 11.32, text: 'All those requests reach the database. Connections and disk reads pile up.' },
  { id: 'c3', t0: 11.58, t1: 17.62, text: 'The cache checks first. A miss reads the database, stores the profile, and responds.' },
  { id: 'c4', t0: 17.88, t1: 23.30, text: 'A hit returns the profile from memory in about one point one milliseconds, not four.' },
  { id: 'c5', t0: 23.58, t1: 29.74, text: 'TTL limits staleness. The database still matters. Stampedes need design.' },
];

export const NARRATION = [
  { id: 'scene01', scene: 'hook', t0: 0.0, t1: 6.0, file: 'narration/processed/scene01.wav', text: 'One person clicks once: one request. Now fifty thousand people click the same profile.' },
  { id: 'scene02', scene: 'bottleneck', t0: 6.0, t1: 11.5, file: 'narration/processed/scene02.wav', text: 'All those requests reach the database. Connections and disk reads pile up.' },
  { id: 'scene03', scene: 'miss', t0: 11.5, t1: 17.8, file: 'narration/processed/scene03.wav', text: 'The cache checks first. A miss reads the database, stores the profile, and responds.' },
  { id: 'scene04', scene: 'hit', t0: 17.8, t1: 23.5, file: 'narration/processed/scene04.wav', text: 'A hit returns the profile from memory in about one point one milliseconds, not four.' },
  { id: 'scene05', scene: 'teardown', t0: 23.5, t1: 30.0, file: 'narration/processed/scene05.wav', text: 'TTL limits staleness. The database still matters. Stampedes need design.' },
];

export const EVENTS = [
  [0.0, 'open'], [0.85, 'profile_reveal'], [1.55, 'single_user_click'], [2.05, 'single_request'],
  [2.35, 'user_swarm_starts'], [3.1, 'multiple_clicks'], [4.2, 'all_requests_converge'],
  [6.0, 'architecture_pullback'], [7.0, 'application_pool_fills'], [7.8, 'database_bottleneck'], [8.6, 'disk_reads'], [9.55, 'latency_breakdown'],
  [11.5, 'cache_enters_path'], [12.25, 'cache_miss'], [13.55, 'database_read'], [14.45, 'disk_return'], [15.35, 'cache_population'],
  [17.8, 'hit_path'], [19.0, 'cache_hit'], [19.8, 'latency_reveal'], [21.25, 'fast_response'],
  [23.5, 'teardown_open'], [25.0, 'ttl_reveal'], [27.4, 'ttl_expiry'], [28.1, 'stampede_scope'], [29.45, 'final_promise'],
].map(([t, type, extra = {}]) => ({ t, type, ...extra }));

export function sceneAt(t) { return SCENES.find(s => t >= s.t0 && t < s.t1) || SCENES[SCENES.length - 1]; }
export function captionAt(t) { return CAPTIONS.filter(c => t >= c.t0 && t <= c.t1); }
export function srtTime(sec) {
  const ms = Math.max(0, Math.round(sec * 1000)); const h = Math.floor(ms / 3600000); const m = Math.floor(ms / 60000) % 60; const s = Math.floor(ms / 1000) % 60; const z = ms % 1000;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(z).padStart(3, '0')}`;
}
export function srt() { return CAPTIONS.map((c, i) => `${i + 1}\n${srtTime(c.t0)} --> ${srtTime(c.t1)}\n${c.text}\n`).join('\n'); }
