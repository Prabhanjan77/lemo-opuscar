// One source of truth for the caching sample picture, captions, narration placement, and cues.
export const W = 1920;
export const H = 1080;
export const FPS = 24;
export const DUR = 30;

export const SCENES = [
  { id: 'hook', t0: 0, t1: 4.3, title: 'THE SPIKE', kicker: 'ONE PROFILE · MANY REQUESTS' },
  { id: 'bottleneck', t0: 4.3, t1: 11.8, title: 'THE BOTTLENECK', kicker: 'REPEATED READS · DATABASE PRESSURE' },
  { id: 'miss', t0: 11.8, t1: 19.1, title: 'THE MISS PATH', kicker: 'LOOKUP FIRST · FALL THROUGH · POPULATE' },
  { id: 'hit', t0: 19.1, t1: 25.5, title: 'THE HIT PATH', kicker: 'HOT DATA · SHORTER COMMON PATH' },
  { id: 'teardown', t0: 25.5, t1: 30, title: 'THE TRADE-OFF', kicker: 'TTL · STALE DATA · STAMPEDE DESIGN' },
];

// The narration clips are rendered at 1.08x with pitch-preserving atempo in build.sh.
// Their windows are intentionally J/L-cut by a few frames over the scene boundaries.
export const CAPTIONS = [
  { id: 'c1', t0: 0.12, t1: 3.90, text: 'Fifty thousand people open the same celebrity profile at once.' },
  { id: 'c2', t0: 3.98, t1: 10.82, text: 'Without a cache, every request hits the database. Connections fill, disk reads pile up, and latency grows.' },
  { id: 'c3', t0: 10.90, t1: 17.60, text: 'The cache checks first. On a miss, read the database, store the result, then respond.' },
  { id: 'c4', t0: 17.68, t1: 23.48, text: 'On a hit, hot data returns from memory in roughly one point one milliseconds, instead of four.' },
  { id: 'c5', t0: 23.56, t1: 29.86, text: 'A TTL limits staleness. Caching removes repeated reads, but stampedes still need design.' },
];

export const NARRATION = [
  { id: 'scene01', scene: 'hook', t0: 0.0, t1: 3.96, file: 'narration/processed/scene01.wav', text: 'Fifty thousand people open the same celebrity profile at once.' },
  { id: 'scene02', scene: 'bottleneck', t0: 3.96, t1: 10.89, file: 'narration/processed/scene02.wav', text: 'Without a cache, every request hits the database. Connections fill, disk reads pile up, and latency grows.' },
  { id: 'scene03', scene: 'miss', t0: 10.89, t1: 17.67, file: 'narration/processed/scene03.wav', text: 'The cache checks first. On a miss, read the database, store the result, then respond.' },
  { id: 'scene04', scene: 'hit', t0: 17.67, t1: 23.56, file: 'narration/processed/scene04.wav', text: 'On a hit, hot data returns from memory in roughly one point one milliseconds, instead of four.' },
  { id: 'scene05', scene: 'teardown', t0: 23.56, t1: 29.86, file: 'narration/processed/scene05.wav', text: 'A TTL limits staleness. Caching removes repeated reads, but stampedes still need design.' },
];

export const EVENTS = [
  [0.0, 'open'], [0.85, 'traffic_number_lock'], [1.65, 'cursor_refresh'], [2.25, 'request_fanout'],
  [4.3, 'camera_pullback'], [5.4, 'application_pool_fills'], [6.2, 'database_bottleneck'], [7.15, 'disk_read'], [8.5, 'latency_breakdown'],
  [11.8, 'cache_enters_path'], [12.6, 'cache_miss'], [14.05, 'database_read'], [15.05, 'disk_return'], [16.0, 'cache_population'],
  [19.1, 'hit_path'], [20.25, 'cache_hit'], [20.85, 'latency_reveal'], [22.0, 'fast_response'],
  [25.5, 'teardown_open'], [26.85, 'ttl_reveal'], [28.4, 'ttl_expiry'], [29.0, 'stampede_scope'], [29.6, 'final_promise'],
].map(([t, type, extra = {}]) => ({ t, type, ...extra }));

export function sceneAt(t) { return SCENES.find(s => t >= s.t0 && t < s.t1) || SCENES[SCENES.length - 1]; }
export function captionAt(t) { return CAPTIONS.filter(c => t >= c.t0 && t <= c.t1); }
export function srtTime(sec) {
  const ms = Math.max(0, Math.round(sec * 1000)); const h = Math.floor(ms / 3600000); const m = Math.floor(ms / 60000) % 60; const s = Math.floor(ms / 1000) % 60; const z = ms % 1000;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(z).padStart(3, '0')}`;
}
export function srt() { return CAPTIONS.map((c, i) => `${i + 1}\n${srtTime(c.t0)} --> ${srtTime(c.t1)}\n${c.text}\n`).join('\n'); }
