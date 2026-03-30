#!/usr/bin/env node

import { load } from '../lib/config.mjs';
import { register, get } from '../lib/engine.mjs';
import native from '../lib/engines/native.mjs';

register(native);

const config = await load();
const engine = get(config.engine);
const ok = await engine.available();

if (!ok) {
  const output = {
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: `[speak] TTS engine "${config.engine}" is not available on this platform. On Linux, install espeak: apt install espeak`,
    },
  };
  console.log(JSON.stringify(output));
}
