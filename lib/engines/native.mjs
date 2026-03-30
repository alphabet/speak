import { spawn, execSync, execFileSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir, platform } from 'node:os';

const os = platform();

function which(cmd) {
  try {
    execFileSync('which', [cmd], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function killCurrent() {
  try {
    if (os === 'darwin') execSync('killall say 2>/dev/null', { stdio: 'ignore' });
    if (os === 'linux') execSync('killall espeak 2>/dev/null; killall spd-say 2>/dev/null', { stdio: 'ignore' });
  } catch {
    // nothing running, that's fine
  }
}

function macRate(speed) {
  return Math.round(200 * speed);
}

function espeakRate(speed) {
  return Math.round(175 * speed);
}

function fuzzyMatch(query, target) {
  let qIdx = 0;
  for (let i = 0; i < target.length && qIdx < query.length; i++) {
    if (query[qIdx] === target[i]) qIdx++;
  }
  return qIdx === query.length;
}

const native = {
  name: 'native',

  async available() {
    if (os === 'darwin') return true;
    if (os === 'linux') return which('espeak') || which('spd-say');
    if (os === 'win32') return true;
    return false;
  },

  async speak(text, { voice, speed = 1.0 } = {}) {
    if (!text) return;

    killCurrent();

    if (os === 'darwin') {
      const args = ['-r', String(macRate(speed))];
      if (voice) args.push('-v', voice);
      args.push(text);
      spawn('say', args, { detached: true, stdio: 'ignore' }).unref();
      return;
    }

    if (os === 'linux') {
      if (which('espeak')) {
        const args = ['-s', String(espeakRate(speed))];
        if (voice) args.push('-v', voice);
        args.push(text);
        spawn('espeak', args, { detached: true, stdio: 'ignore' }).unref();
      } else if (which('spd-say')) {
        spawn('spd-say', [text], { detached: true, stdio: 'ignore' }).unref();
      }
      return;
    }

    if (os === 'win32') {
      // Write text to temp file to avoid PowerShell injection.
      // Never interpolate untrusted text into a shell command string.
      const tmp = join(tmpdir(), `speak-${process.pid}.txt`);
      writeFileSync(tmp, text, 'utf8');
      const rate = Math.round((speed - 1) * 10);
      const ps = `Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; $s.Rate = ${rate}; $s.Speak([IO.File]::ReadAllText('${tmp.replace(/'/g, "''")}')); Remove-Item '${tmp.replace(/'/g, "''")}'`;
      spawn('powershell', ['-c', ps], { detached: true, stdio: 'ignore' }).unref();
      return;
    }
  },

  /**
   * Open a streaming speech handle. Returns { write(text), end() }.
   * On macOS, pipes to `say -f -` so speech starts on first write.
   * On Linux, queues sentences and spawns espeak per sentence.
   * On Windows, falls back to batch speak().
   */
  speakStream({ voice, speed = 1.0 } = {}) {
    killCurrent();

    if (os === 'darwin') {
      const args = ['-r', String(macRate(speed)), '-f', '-'];
      if (voice) args.push('-v', voice);
      const proc = spawn('say', args, { detached: true, stdio: ['pipe', 'ignore', 'ignore'] });
      proc.unref();
      return {
        write(text) { proc.stdin.write(text + '\n'); },
        end() { proc.stdin.end(); },
      };
    }

    if (os === 'linux' && which('espeak')) {
      const args = ['-s', String(espeakRate(speed)), '--stdin'];
      if (voice) args.push('-v', voice);
      const proc = spawn('espeak', args, { detached: true, stdio: ['pipe', 'ignore', 'ignore'] });
      proc.unref();
      return {
        write(text) { proc.stdin.write(text + '\n'); },
        end() { proc.stdin.end(); },
      };
    }

    // Fallback: buffer all writes, speak on end().
    const self = this;
    const chunks = [];
    return {
      write(text) { chunks.push(text); },
      end() { self.speak(chunks.join(' '), { voice, speed }); },
    };
  },

  async listVoices(filter = '') {
    let voices = [];

    if (os === 'darwin') {
      try {
        const out = execFileSync('say', ['-v', '?'], { encoding: 'utf8' });
        const re = /^(.+?)\s+([a-z]{2}_[A-Z]{2})\s+#\s+(.*)$/;
        for (const line of out.split('\n')) {
          const m = line.match(re);
          if (m) voices.push({ name: m[1].trim(), locale: m[2], sample: m[3] });
        }
      } catch { /* say not available */ }
    } else if (os === 'linux' && which('espeak')) {
      try {
        const out = execFileSync('espeak', ['--voices'], { encoding: 'utf8' });
        const lines = out.split('\n').slice(1); // skip header
        const re = /^\s*\d+\s+(\S+)\s+\S+\s+(\S+)/;
        for (const line of lines) {
          const m = line.match(re);
          if (m) voices.push({ name: m[2], locale: m[1], sample: '' });
        }
      } catch { /* espeak not available */ }
    } else if (os === 'win32') {
      try {
        const ps = `Add-Type -AssemblyName System.Speech; (New-Object System.Speech.Synthesis.SpeechSynthesizer).GetInstalledVoices() | ForEach-Object { $_.VoiceInfo } | Select-Object Name, Culture | ConvertTo-Json`;
        const out = execFileSync('powershell', ['-c', ps], { encoding: 'utf8' });
        const data = JSON.parse(out);
        for (const v of Array.isArray(data) ? data : [data]) {
          voices.push({ name: v.Name, locale: v.Culture || '', sample: '' });
        }
      } catch { /* powershell not available */ }
    }

    if (filter) {
      const q = filter.toLowerCase();
      voices = voices.filter(v =>
        fuzzyMatch(q, v.name.toLowerCase()) ||
        fuzzyMatch(q, v.locale.toLowerCase()) ||
        fuzzyMatch(q, v.sample.toLowerCase())
      );
    }

    return voices;
  },
};

export default native;
