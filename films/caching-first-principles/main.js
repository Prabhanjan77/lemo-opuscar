import { renderFilm, textsAt } from './film.js';
import { DUR, EVENTS } from './timeline.js';

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
const query = new URLSearchParams(location.search);
const preview = query.get('preview') === '1';
if (preview) document.body.classList.add('preview');

let current = 0; let playing = false; let raf = 0; let last = 0;
function render(t) { current = Math.max(0, Math.min(DUR - 1 / 240, Number(t) || 0)); renderFilm(ctx, current, { nosub: query.get('nosub') === '1' }); }
window.render = render; window.TEXTS = t => textsAt(Number(t) || 0); window.DUR = DUR; window.EV = EVENTS;
const play = document.getElementById('play'), scrub = document.getElementById('scrub'), time = document.getElementById('time'), audio = document.getElementById('audio');
const format = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${(s % 60).toFixed(2).padStart(5, '0')}`;
function updateUI() { if (!preview) return; scrub.value = current; time.textContent = `${format(current)} / 00:30.00`; play.textContent = playing ? 'Pause' : 'Play'; }
function frame(now) {
  if (!playing) return; if (!last) last = now; current += (now - last) / 1000; last = now;
  if (current >= DUR) { current = DUR - 1 / 240; playing = false; if (audio) audio.pause(); }
  render(current); updateUI(); raf = requestAnimationFrame(frame);
}
if (preview) {
  play.addEventListener('click', async () => { playing = !playing; last = 0; if (audio) { audio.currentTime = current; if (playing) { try { await audio.play(); } catch {} } else audio.pause(); } updateUI(); if (playing) raf = requestAnimationFrame(frame); else cancelAnimationFrame(raf); });
  scrub.addEventListener('input', e => { playing = false; current = Number(e.target.value); if (audio) { audio.pause(); audio.currentTime = current; } render(current); updateUI(); });
  if (audio) audio.addEventListener('ended', () => { playing = false; updateUI(); });
  updateUI(); render(0);
} else render(0);
if (document.fonts?.ready) document.fonts.ready.then(() => { window.READY = true; }); else window.READY = true;
