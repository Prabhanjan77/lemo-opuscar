import { SCENES, CAPTIONS, EVENTS, DUR, FPS } from './timeline.js';
const errors = [];
if (SCENES[0].t0 !== 0 || SCENES.at(-1).t1 !== DUR) errors.push('scene coverage does not span the full duration');
for (let i = 1; i < SCENES.length; i++) if (SCENES[i - 1].t1 !== SCENES[i].t0) errors.push(`scene gap/overlap at ${SCENES[i].t0}`);
for (let i = 1; i < EVENTS.length; i++) if (EVENTS[i].t < EVENTS[i - 1].t) errors.push(`event order at ${EVENTS[i].type}`);
for (const c of CAPTIONS) if (c.t1 - c.t0 < 1.8) errors.push(`caption too short: ${c.id}`);
if (EVENTS.some(e => e.t < 0 || e.t > DUR)) errors.push('event outside film');
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`timeline ok · ${DUR}s · ${FPS}fps · ${SCENES.length} scenes · ${CAPTIONS.length} captions · ${EVENTS.length} events`);
