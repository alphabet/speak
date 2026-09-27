/**
 * Kokoro neural TTS engine.
 *
 * Uses kokoro-js (ONNX-based, runs locally). The model (~86 MB quantized)
 * downloads automatically on first use and is cached by transformers.js.
 *
 * Requires an external WAV player for audio output (afplay, aplay, etc.).
 */

import { unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { detectPlayer, playWav, killPlayback } from '../playback.mjs';

const MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX';
const MODEL_OPTS = { dtype: 'q8', device: 'cpu' };

/** Convert kokoro language code (en-us) to locale format (en_US). */
function toLocale(lang) {
  if (!lang) return '??';
  const [l, r] = lang.split('-');
  return r ? `${l}_${r.toUpperCase()}` : l;
}

/** Lazy-load kokoro-js. Returns null if not installed. */
async function loadKokoro() {
  try {
    return await import('kokoro-js');
  } catch {
    return null;
  }
}

/** Load the TTS model. Cached within a single process invocation. */
let _tts = null;
async function getTTS() {
  if (_tts) return _tts;
  const mod = await loadKokoro();
  if (!mod) return null;
  _tts = await mod.KokoroTTS.from_pretrained(MODEL_ID, MODEL_OPTS);
  return _tts;
}

const kokoro = {
  name: 'kokoro',

  async available() {
    const mod = await loadKokoro();
    if (!mod) return false;
    return detectPlayer() !== null;
  },

  async speak(text, { voice, speed = 1.0 } = {}) {
    if (!text) return;

    killPlayback();

    const tts = await getTTS();
    if (!tts) return;

    const voiceId = voice || 'af_heart';
    const audio = await tts.generate(text, { voice: voiceId, speed });

    const tmp = join(tmpdir(), `speak-kokoro-${process.pid}.wav`);
    await audio.save(tmp);
    playWav(tmp);

    // Clean up after a delay (player is detached, give it time to read the file).
    setTimeout(() => { try { unlinkSync(tmp); } catch { /* ok */ } }, 30_000);
  },

  speakStream({ voice, speed = 1.0 } = {}) {
    killPlayback();
    const chunks = [];
    const self = this;
    return {
      write(text) { chunks.push(text); },
      end() { self.speak(chunks.join(' '), { voice, speed }); },
    };
  },

  async listVoices(filter = '') {
    const tts = await getTTS();
    if (!tts) return [];

    // Suppress console.table side-effect from kokoro-js internals.
    const origTable = console.table;
    console.table = () => {};

    // tts.voices is an object: { voiceId: { name, language, gender, ... } }
    let voices = Object.entries(tts.voices).map(([id, v]) => ({
      name: id,
      locale: toLocale(v.language),
      sample: `${v.name} (${v.gender})`,
    }));

    console.table = origTable;

    if (filter) {
      const q = filter.toLowerCase();
      voices = voices.filter(v =>
        v.name.toLowerCase().includes(q) ||
        v.locale.toLowerCase().includes(q) ||
        v.sample.toLowerCase().includes(q)
      );
    }

    return voices;
  },
};

export default kokoro;
