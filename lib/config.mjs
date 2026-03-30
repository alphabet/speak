import { readFile, writeFile, appendFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';

const CONFIG_DIR = join(homedir(), '.speak');
const CONFIG_PATH = join(CONFIG_DIR, 'config.json');
const LOG_PATH = join(CONFIG_DIR, 'speak.log');

const DEFAULTS = {
  enabled: true,
  engine: 'native',
  voice: null,
  speed: 1.0,
  sentences: 1,
  cleanMode: 'terse',
  streaming: true,
};

async function log(msg) {
  try {
    await mkdir(CONFIG_DIR, { recursive: true });
    await appendFile(LOG_PATH, `${new Date().toISOString()} ${msg}\n`);
  } catch {
    // logging should never break anything
  }
}

export async function load() {
  try {
    const raw = await readFile(CONFIG_PATH, 'utf8');
    const saved = JSON.parse(raw);
    delete saved.charLimit;
    return { ...DEFAULTS, ...saved };
  } catch (e) {
    if (e.code !== 'ENOENT') {
      await log(`Config parse error: ${e.message}. Using defaults.`);
    }
    return { ...DEFAULTS };
  }
}

export async function save(config) {
  const { charLimit, ...rest } = config;
  await mkdir(CONFIG_DIR, { recursive: true });
  await writeFile(CONFIG_PATH, JSON.stringify(rest, null, 2) + '\n');
}

export { CONFIG_DIR, CONFIG_PATH, DEFAULTS };
