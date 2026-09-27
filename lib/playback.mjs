/**
 * Shared WAV playback utility for engines that generate audio files.
 *
 * Platform players: afplay (macOS), aplay (Linux), PowerShell (Windows).
 */

import { spawn, execFileSync } from 'node:child_process';
import { platform } from 'node:os';

const os = platform();
let current = null;

function which(cmd) {
  try {
    execFileSync('which', [cmd], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/** Detect the best available WAV player for this platform. */
export function detectPlayer() {
  if (os === 'darwin') return 'afplay';
  if (os === 'linux') {
    if (which('aplay')) return 'aplay';
    if (which('paplay')) return 'paplay';
    return null;
  }
  if (os === 'win32') return 'powershell';
  return null;
}

/**
 * Play a WAV file. Returns the spawned child process.
 * The process is detached and unref'd so the caller can exit.
 */
export function playWav(filePath) {
  killPlayback();

  const player = detectPlayer();
  if (!player) return null;

  let proc;
  if (player === 'powershell') {
    const ps = `(New-Object Media.SoundPlayer '${filePath.replace(/'/g, "''")}').PlaySync()`;
    proc = spawn('powershell', ['-c', ps], { detached: true, stdio: 'ignore' });
  } else {
    proc = spawn(player, [filePath], { detached: true, stdio: 'ignore' });
  }

  proc.unref();
  current = proc;
  return proc;
}

/** Kill any currently playing audio. */
export function killPlayback() {
  if (current) {
    try { current.kill(); } catch { /* already exited */ }
    current = null;
  }
}
