import fs from 'node:fs';
import path from 'node:path';
import { EVENTS, CAPTIONS, DUR, FPS, srt } from './timeline.js';
const HERE = path.dirname(new URL(import.meta.url).pathname);
fs.mkdirSync(path.join(HERE, 'out'), { recursive: true });
fs.writeFileSync(path.join(HERE, 'events.json'), JSON.stringify({ dur: DUR, fps: FPS, ev: EVENTS }, null, 2) + '\n');
fs.writeFileSync(path.join(HERE, 'captions.srt'), srt());
console.log(`events: ${EVENTS.length} · captions: ${CAPTIONS.length} · ${DUR}s @ ${FPS}fps`);
