# Plan

## Origin

The project started organically, with a personal skill. The skill migrated from a single project, to my global claude settings, and is now here as a plugin.

The skill was good enough for me using macOS `say` on Claude responses. It worked well enough on my platform. The more I used it, the more I started to customize it. Change voices, adjust verbosity, adjust speed and volume. My first goal is to make it more portable, with this plugin.

FWIW, my favorite voices are on macOS are grandma and grandpa. They make Claude sound a little like wall-e from the Disney movie.

## v0.1.0

- Cross-platform native TTS (macOS say, Linux espeak, Windows SAPI)
- `/speak:say` skill for config (on/off, voice, speed, sentences, clean mode)
- Stop hook speaks after each Claude response
- SessionStart hook warns if TTS engine is missing
- Config at `~/.speak/config.json`, errors logged to `~/.speak/speak.log`
- Pluggable engine interface at `lib/engine.mjs`

## What could be next

### Neural TTS engine
The engine interface is ready for a second backend. Kokoro (82M params, Apache 2.0) is the leading candidate -- smallest model with the best quality-to-size ratio, runs on CPU in under 500ms, has a working ONNX/Node.js wrapper. VibeVoice or others could slot in if they get Node.js runtimes.

Neural engines require a daemon architecture (model loading exceeds the 5s hook timeout), so that gets built alongside the first neural backend.

### Some interesting ideas
- Streaming TTS (speaking while Claude is still typing)
- Multiple voices for different agents
- Multi-language auto-detection

## Lessons from building this without a plan

This plugin was built code-first. The old skill it replaced survived numerous rounds of cleanup before starting work on this "speak" plugin.