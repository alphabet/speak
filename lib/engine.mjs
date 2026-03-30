const engines = new Map();

export function register(engine) {
  engines.set(engine.name, engine);
}

export function get(name) {
  const engine = engines.get(name);
  if (!engine) throw new Error(`Unknown TTS engine: ${name}`);
  return engine;
}

export function list() {
  return [...engines.keys()];
}
