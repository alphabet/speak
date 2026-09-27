#!/usr/bin/env node

/**
 * UserPromptSubmit hook -- speaks a random spinner verb while Claude thinks.
 */

import { load } from '../lib/config.mjs';
import { register, get } from '../lib/engine.mjs';
import native from '../lib/engines/native.mjs';
import kokoro from '../lib/engines/kokoro.mjs';

register(native);
register(kokoro);

const VERBS = [
  'Accomplishing','Actualizing','Baking','Beboppin','Befuddling',
  'Bloviating','Boogieing','Boondoggling','Booping','Brewing',
  'Canoodling','Caramelizing','Cascading','Catapulting','Cerebrating',
  'Clauding','Cogitating','Combobulating','Concocting','Contemplating',
  'Crunching','Crystallizing','Dilly-dallying','Discombobulating',
  'Doodling','Drizzling','Fermenting','Fiddle-faddling','Finagling',
  'Flibbertigibbeting','Flummoxing','Frolicking','Gallivanting',
  'Gesticulating','Grooving','Hullaballooing','Hyperspacing',
  'Improvising','Incubating','Jitterbugging','Julienning',
  'Lollygagging','Marinating','Meandering','Metamorphosing',
  'Moonwalking','Moseying','Mulling','Musing','Noodling',
  'Orchestrating','Perambulating','Percolating','Philosophising',
  'Photosynthesizing','Pondering','Pontificating','Prestidigitating',
  'Puzzling','Quantumizing','Razzle-dazzling','Razzmatazzing',
  'Recombobulating','Ruminating','Scampering','Schlepping',
  'Shenaniganing','Shimmying','Skedaddling','Spelunking',
  'Swooping','Symbioting','Tinkering','Tomfoolering',
  'Topsy-turvying','Transmuting','Undulating','Vibing',
  'Waddling','Whatchamacalliting','Whirlpooling','Wibbling',
  'Wrangling','Zesting','Zigzagging',
];

const config = await load();
if (!config.enabled) process.exit(0);

const engine = get(config.engine);
if (!await engine.available()) process.exit(0);

const verb = VERBS[Math.floor(Math.random() * VERBS.length)];
const voice = config.spinnerVoice || 'Bubbles';
await engine.speak(verb, { voice, speed: config.speed });
