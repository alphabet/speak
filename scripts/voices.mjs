#!/usr/bin/env node

import { load } from '../lib/config.mjs';
import { register, get } from '../lib/engine.mjs';
import native from '../lib/engines/native.mjs';


register(native);

const args = process.argv.slice(2);
const jsonMode = args[0] === '--json';
const filter = (jsonMode ? args.slice(1) : args).join(' ');

const config = await load();
const engine = get(config.engine);

if (!await engine.available()) {
  console.error(`Engine "${config.engine}" not available on this platform.`);
  process.exit(1);
}

const voices = await engine.listVoices(filter);

if (jsonMode) {
  console.log(JSON.stringify(voices));
} else {
  if (voices.length === 0) {
    console.log(filter ? `No voices matching "${filter}".` : 'No voices found.');
    process.exit(0);
  }
  const nameW = Math.max(5, ...voices.map(v => v.name.length));
  const locW = Math.max(6, ...voices.map(v => v.locale.length));
  const hdr = 'Voice'.padEnd(nameW) + '  ' + 'Locale'.padEnd(locW) + '  Sample';
  const sep = '-'.repeat(nameW) + '  ' + '-'.repeat(locW) + '  ' + '-'.repeat(34);
  console.log('```');
  console.log(hdr);
  console.log(sep);
  for (const v of voices) {
    console.log(v.name.padEnd(nameW) + '  ' + v.locale.padEnd(locW) + '  ' + v.sample);
  }
  console.log('```');
}
