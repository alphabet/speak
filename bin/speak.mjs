#!/usr/bin/env node

import { load } from '../lib/config.mjs';
import { prepare } from '../lib/text-cleaner.mjs';
import { register, get } from '../lib/engine.mjs';
import native from '../lib/engines/native.mjs';

register(native);

const text = process.argv.slice(2).join(' ');
if (!text) {
  console.error('Usage: speak <text>');
  process.exit(1);
}

const config = await load();
const cleaned = prepare(text, config);

if (!cleaned) {
  process.exit(0);
}

const engine = get(config.engine);
const ok = await engine.available();
if (!ok) {
  console.error(`TTS engine "${config.engine}" is not available on this platform.`);
  process.exit(1);
}

await engine.speak(cleaned, { voice: config.voice, speed: config.speed });
