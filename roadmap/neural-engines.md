# Neural Engine Learnings

Captured during Kokoro v0.3 integration (2026-04-05).

## Kokoro-js on CPU (Apple Silicon, M-series)

Model: `onnx-community/Kokoro-82M-v1.0-ONNX`, dtype `q8`, device `cpu`.

### Latency

| Phase                        | Time     |
|------------------------------|----------|
| Native `say` (total)         | ~15 ms   |
| Kokoro model load (cold)     | ~620 ms  |
| Kokoro inference + WAV save  | ~1690 ms |
| **Kokoro total (cold start)**| ~2300 ms |
| **Kokoro total (warm)**      | ~1690 ms |

A daemon saves only the ~620 ms model load. The ~1.7s inference cost is
the real bottleneck and is unavoidable on CPU without GPU acceleration
or a smaller model.

### kokoro-js API quirks

- `tts.list_voices()` returns `undefined`. It only prints `console.table`
  as a side-effect. Use `tts.voices` property instead (object keyed by
  voice ID: `{ name, language, gender, traits, targetQuality, overallGrade }`).
- `audio.save(path)` is async (must await).
- Language codes are `en-us` format, not `en_US`.
- Every invocation exits with code 134 (SIGABRT) due to the phonemizer
  WASM module crashing during process cleanup. This is cosmetic -- all
  output is produced correctly before the abort.
- The quantized ONNX model (`q8`) is ~86 MB, downloaded and cached
  automatically by transformers.js on first use.

### Voice inventory

This model version has **28 voices** (en-US and en-GB only), not the 54
listed in Kokoro's marketing. The full voice set across 8 languages
requires a different (larger) model or additional voice packs.

### Implications for the daemon

A daemon architecture would:
- Eliminate the ~620 ms model load penalty (keep model in memory)
- NOT eliminate the ~1.7s inference time
- Net latency with daemon: ~1.7s vs native's ~15 ms (~113x)

For the daemon to meaningfully close the gap, we would need:
- GPU acceleration (WebGPU device instead of CPU)
- A lighter model (if one becomes available)
- Speculative generation (pre-generate common phrases)
- Accept the latency as the cost of neural quality
