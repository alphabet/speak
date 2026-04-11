<p align="center">
  <h1 align="center">speak</h1>
</p>

<p align="center">
  Text-to-speech plugin for Claude Code. Reads responses aloud using native TTS engines.
</p>

## Demo

<video src="https://github.com/user-attachments/assets/8411f978-0be6-4055-937b-071649f1ec43" controls width="auto"></video>

## Prerequisites

- **git** — Required to clone the plugin repository
- **Node.js 18+** — Required to run plugin hooks

## Install

```bash
claude plugin marketplace add https://alphabetware.com/marketplace.json
claude plugin install speak
```

To install from source instead:

```bash
gh repo clone alphabet/speak ~/speak
claude --plugin-dir ~/speak
```

## Usage

Type `/speak` to verify the plugin is loaded. Key commands:

```
/speak on              # enable TTS
/speak off             # disable TTS
/speak set voice Ava   # change voice (fuzzy match)
/speak set speed 1.5   # adjust speed (0.1-3.0)
/speak set sentences 2 # sentences per response (1-10)
/speak terse           # strip markdown before speaking
/speak voices          # list available voices
```

Full command reference: [skills/speak/SKILL.md](skills/speak/SKILL.md)

## Platform support

| Platform | Engine | Install |
|----------|--------|---------|
| macOS    | say (native)   | Built-in, always available |
| Linux    | espeak (native)| `apt install espeak` or `dnf install espeak` |
| Windows  | SAPI (native)  | Built-in via PowerShell + System.Speech |

## How it works

A Stop hook fires after each Claude response. The text is cleaned (markdown stripped), truncated to N sentences, and spoken by the platform's native TTS engine. If a previous response is still speaking, it gets cut off. No additional tokens are consumed -- this is pure client-side TTS.

The engine interface is at `lib/engine.mjs` if you want to swap in a different runtime.

## Troubleshooting

**No sound on macOS** -- Check system volume. Run `say "test"` in Terminal. Check `~/.speak/config.json` has `"enabled": true`.

**No sound on Linux** -- Install espeak: `apt install espeak`. Run `espeak "test"` to verify.

**Adjust voice or speed** -- `/speak voices` to list voices, `/speak set voice <name>` for fuzzy match, `/speak set speed <n>` for rate.

**Config issues** -- Delete `~/.speak/config.json` to reset to defaults. Parse errors are logged to `~/.speak/speak.log`.

**Hook not firing** -- Restart your Claude Code session after installing. Check `~/.speak/speak.log` for errors.

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This plugin is MIT licensed. It calls platform TTS engines on the user's machine -- it does not redistribute any voice assets. macOS system voices are subject to Apple's macOS Software License Agreement. espeak-ng is GPLv3; this plugin calls the system binary without bundling it.
