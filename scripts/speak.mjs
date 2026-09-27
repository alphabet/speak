#!/usr/bin/env node

import { load } from '../lib/config.mjs';
import { prepare } from '../lib/text-cleaner.mjs';
import { register, get } from '../lib/engine.mjs';
import native from '../lib/engines/native.mjs';

register(native);

// Parse --voice and --speed flags from argv, remainder is text
const args = process.argv.slice(2);
let voiceOverride, speedOverride;
const textParts = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--voice' && i + 1 < args.length) { voiceOverride = args[++i]; }
  else if (args[i] === '--speed' && i + 1 < args.length) { speedOverride = parseFloat(args[++i]); }
  else { textParts.push(args[i]); }
}
const text = textParts.join(' ');
if (!text) {
  console.error('Usage: speak [--voice <name>] [--speed <n>] <text>');
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

await engine.speak(cleaned, {
  voice: voiceOverride || config.voice,
  speed: speedOverride || config.speed,
});
