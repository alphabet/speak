#!/usr/bin/env node

import { appendFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { load, CONFIG_DIR } from '../lib/config.mjs';
import { prepare } from '../lib/text-cleaner.mjs';
import { register, get } from '../lib/engine.mjs';
import native from '../lib/engines/native.mjs';

register(native);

async function log(msg) {
  try {
    await mkdir(CONFIG_DIR, { recursive: true });
    const ts = new Date().toISOString();
    await appendFile(join(CONFIG_DIR, 'speak.log'), `${ts} ${msg}\n`);
  } catch {
    // logging itself should never break the hook
  }
}

let input = '';
process.stdin.setEncoding('utf8');
for await (const chunk of process.stdin) {
  input += chunk;
}

let data;
try {
  data = JSON.parse(input);
} catch (e) {
  await log(`JSON parse error: ${e.message}`);
  process.exit(0);
}

if (data.hook_event_name !== 'Stop') process.exit(0);

const config = await load();
if (!config.enabled) process.exit(0);

const raw = data.last_assistant_message || '';
if (!raw) process.exit(0);

const text = prepare(raw, config);
if (!text) process.exit(0);

const engine = get(config.engine);
const ok = await engine.available();
if (!ok) {
  await log(`Engine "${config.engine}" not available on this platform`);
  process.exit(0);
}

await engine.speak(text, { voice: config.voice, speed: config.speed });
