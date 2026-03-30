import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const bin = join(__dirname, '..', 'bin', 'voices.mjs');

function run(...args) {
  return execFileSync('node', [bin, ...args], { encoding: 'utf8' });
}

function runJson(...args) {
  return JSON.parse(run('--json', ...args));
}

describe('bin/voices.mjs', () => {

  describe('table mode', () => {
    it('grandma returns ~14 variants in a fenced code block', () => {
      const out = run('grandma');
      assert.ok(out.startsWith('```'), 'output should start with code fence');
      assert.ok(out.trimEnd().endsWith('```'), 'output should end with code fence');
      assert.ok(out.includes('Voice'), 'should have header');
      assert.ok(out.includes('Locale'), 'should have header');
      const lines = out.split('\n').filter(l => l.includes('Grandma'));
      assert.ok(lines.length >= 10, `expected >=10 Grandma variants, got ${lines.length}`);
    });

    it('en_US filter lists multiple voices', () => {
      const out = run('en_US');
      assert.ok(out.includes('en_US'), 'should contain en_US voices');
      const dataLines = out.split('\n').filter(l => l.includes('en_US'));
      assert.ok(dataLines.length >= 5, `expected >=5 en_US voices, got ${dataLines.length}`);
    });

    it('nonexistent filter prints no-match message', () => {
      const out = run('xyzfake');
      assert.ok(out.includes('No voices matching'), 'should print no-match message');
    });
  });

  describe('json mode', () => {
    it('grandma returns array of voice objects', () => {
      const voices = runJson('grandma');
      assert.ok(Array.isArray(voices), 'should return array');
      assert.ok(voices.length >= 10, `expected >=10 Grandma variants, got ${voices.length}`);
      for (const v of voices) {
        assert.ok(v.name, 'each voice should have name');
        assert.ok(v.locale, 'each voice should have locale');
        assert.ok(typeof v.sample === 'string', 'each voice should have sample string');
        assert.ok(v.name.toLowerCase().includes('grandma'), `name should match filter: ${v.name}`);
      }
    });

    it('albert returns single-element array', () => {
      const voices = runJson('albert');
      assert.equal(voices.length, 1, 'should return exactly 1 match');
      assert.equal(voices[0].name, 'Albert');
      assert.equal(voices[0].locale, 'en_US');
    });

    it('nonexistent filter returns empty array', () => {
      const voices = runJson('xyzfake');
      assert.deepEqual(voices, []);
    });

    it('voices have correct structure', () => {
      const voices = runJson('albert');
      const v = voices[0];
      assert.ok('name' in v, 'should have name');
      assert.ok('locale' in v, 'should have locale');
      assert.ok('sample' in v, 'should have sample');
      assert.equal(Object.keys(v).length, 3, 'should have exactly 3 fields');
    });
  });

  describe('engine listVoices', () => {
    it('no filter returns all voices', async () => {
      const { register, get } = await import('../lib/engine.mjs');
      const native = (await import('../lib/engines/native.mjs')).default;
      register(native);
      const engine = get('native');
      const all = await engine.listVoices();
      assert.ok(all.length > 50, `expected >50 total voices, got ${all.length}`);
    });

    it('filter is case-insensitive', async () => {
      const { get } = await import('../lib/engine.mjs');
      const engine = get('native');
      const lower = await engine.listVoices('albert');
      const upper = await engine.listVoices('ALBERT');
      const mixed = await engine.listVoices('AlBeRt');
      assert.deepEqual(lower, upper);
      assert.deepEqual(lower, mixed);
    });
  });
});
