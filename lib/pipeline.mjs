/**
 * Shared hook pipeline for speak.
 *
 * Handles stdin parsing, config loading, engine setup, and speech.
 * Each hook handler supplies an `extract` function that pulls speakable
 * text from the event payload.
 */

import { appendFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { load, CONFIG_DIR } from './config.mjs';
import { register, get } from './engine.mjs';
import native from './engines/native.mjs';

register(native);

async function log(msg) {
  try {
    await mkdir(CONFIG_DIR, { recursive: true });
    await appendFile(join(CONFIG_DIR, 'speak.log'), `${new Date().toISOString()} ${msg}\n`);
  } catch {
    // logging itself should never break the hook
  }
}

async function readStdin() {
  let buf = '';
  process.stdin.setEncoding('utf8');
  for await (const chunk of process.stdin) buf += chunk;
  return JSON.parse(buf);
}

/**
 * Run the speak pipeline for a hook event.
 *
 * @param {(data: object, config: object) => string} extract
 *   Receives the parsed hook payload and config, returns text to speak.
 *   Return empty string to skip speech.
 */
export async function run(extract) {
  let data;
  try {
    data = await readStdin();
  } catch (e) {
    await log(`JSON parse error: ${e.message}`);
    return;
  }

  const config = await load();
  if (!config.enabled) return;

  const text = extract(data, config);
  if (!text) return;

  const engine = get(config.engine);
  if (!await engine.available()) {
    await log(`Engine "${config.engine}" not available on this platform`);
    return;
  }

  await engine.speak(text, { voice: config.voice, speed: config.speed });
}
