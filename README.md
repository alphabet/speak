# speak

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Deep in a flow state, locked onto that thing. The rest of the world has stopped existing.

## Why 
My way to delegate peripheral attention to Claude Code is with this simple text to speech (TTS) plugin => https://github.com/alphabet/speak

## Demo
After a week of playing with it, my favorite voice is the nerdy WALL-E / Stephen Hawking voice. In OSX, it’s called the "Grandma" voice.

<video src="https://github.com/user-attachments/assets/9bddb1ce-05b1-4d77-b066-1e2b33971d64" controls
  width="auto"></video>

## How
It uses OS native speech. Native mainly for simplicity. Platform abstraction was part of my design. The native engines, `say` on MacOS, and `espeak` in Linux, are both easily swapped out via the `lib/engine.mjs` interface. Native has low latency. Native never blocks the agent. This should work for windows too, though it hasn't been tested.


## Install

1. Clone this repository, i.e., `gh repo clone alphabet/speak ~/speak`
2. Start Claude Code with `claude --plugin-dir ~/speak`

If you want the same voice I use, on MacOS it's `/speak set voice "Grandma (English (US))"`

```
Current TTS settings:
> /speak status
  ┌───────────┬─────────┐
  │  Setting  │ Value   │
  ├───────────┼─────────┤
  │ enabled   │ false   │
  ├───────────┼─────────┤
  │ engine    │ native  │
  ├───────────┼─────────┤
  │ voice     │ Grandma │
  ├───────────┼─────────┤
  │ speed     │ 1.0     │
  ├───────────┼─────────┤
  │ sentences │ 3       │
  ├───────────┼─────────┤
  │ cleanMode │ terse   │
  └───────────┴─────────┘
```

## Compatibility

Works with any Claude Code tool that supports hooks and plugins:

- CLI (`claude`)
- Desktop app (Mac/Windows)
- Web app (claude.ai/code)
- IDE extensions (VS Code, JetBrains)

Does **not** work with the Claude chat app. The chat app has no hook or plugin system.


## Usage

### /speak

| Plugin  | Command | Value     | Parameter       | Description                          |
|---------|---------|-----------|-----------------|--------------------------------------|
| /speak  | on      |           |                 | Enable TTS                           |
| /speak  | off     |           |                 | Disable TTS                          |
| /speak  | status  |           |                 | Show current settings                |
| /speak  | set     | voice     | `<name>`        | Platform-specific voice              |
| /speak  | set     | sentences | `<n>` (1--10)   | Sentences to speak per response      |
| /speak  | set     | speed     | `<n>` (0.1--3.0)| Rate multiplier (1.0 = normal)       |
| /speak  | terse   |           |                 | Strip markdown before speaking       |
| /speak  | verbose |           |                 | Speak raw text as-is                 |
| /speak  | voices  |           | `[filter]`      | List available voices                |
| /speak  | help    |           |                 | Show this help                       |

### Kill switch and volume

To stop speech mid-sentence, hardware mute is the only thing that works. Use your system volume keys to adjust volume or mute.

## Event flow

- **Stop hook** fires after each Claude response
- Text is cleaned (markdown/code stripped) via via `/speak set terse`
- Text is truncated to N sentences via `/speak set sentences N`
- Native TTS engine speaks the text
- If a previous response is still speaking, it gets cut off. Only one voice at a time.

## Platform support

| Platform | Engine | Install |
|----------|--------|---------|
| macOS    | say    | Built-in, always available |
| Linux    | espeak | `apt install espeak` or `dnf install espeak` |
| Windows  | SAPI   | Built-in via PowerShell + System.Speech |

## Config

Stored at `~/.speak/config.json`. All fields optional, defaults shown:

```json
{
  "enabled": true,
  "engine": "native",
  "voice": null,
  "speed": 1.0,
  "sentences": 1,
  "cleanMode": "terse"
}
```

## Troubleshooting

**No sound on macOS**
- Check system volume is not muted
- Run `say "test"` in Terminal to verify TTS works outside the plugin
- Check `~/.speak/config.json` has `"enabled": true`

**No sound on Linux**
- Install espeak: `apt install espeak`
- Run `espeak "test"` to verify it works
- The SessionStart hook warns if espeak is missing; check your session start output

**Wrong voice or speed**
- Run `/speak voices` to see available voices
- Voice names are platform-specific and must match exactly (e.g. "Grandma (English (US))", not just "Grandma")

**Config looks wrong**
- Check `~/.speak/config.json` is valid JSON
- If corrupted, delete it -- defaults will be used
- Parse errors are logged to `~/.speak/speak.log`

**Two voices talking at once**
- The plugin kills any running speech before starting new speech -- this shouldn't happen
- If you have a TTS block in `~/.claude/hooks/scripts/hooks.py`, remove it to avoid double-firing

**Hook not firing**
- Verify the plugin is enabled in `~/.claude/settings.json` under `enabledPlugins`
- Check `~/.speak/speak.log` for errors
- Restart your Claude Code session after installing

## File layout

```
speak/
  .claude-plugin/plugin.json    Plugin manifest
  hooks/
    hooks.json                  Hook definitions
    stop.mjs                    Stop hook (speak on response)
    session-start.mjs           Check TTS availability
  skills/
    speak/SKILL.md                /speak command
  lib/
    config.mjs                  Config load/save
    text-cleaner.mjs            Markdown stripping
    engine.mjs                  Engine registry
    engines/native.mjs          OS-native TTS
  bin/
    speak.mjs                   CLI tool
```

Engine interface is pluggable via lib/engine.mjs. If you're not satisfied with the system TTS, a different engine can be configured behind this same interface. Right now the plugin only requires `Node.js >= 18` and your platform's native TTS (say on macOS, espeak on Linux). Neural engines sound better, but neural engine performance varies with system hardware (CPU vs GPU) and the engine capabilities. And I already mentioned that I prefer a robot voice for my agent over a human one.

## What it does

Cross-platform text-to-speech plugin for Claude Code. Hear your agent's responses spoken aloud.


## Legal

**macOS voices**: Apple's system voices are subject to the macOS Software License Agreement, which restricts their use to personal, non-commercial purposes. This plugin calls `say` on the user's own machine -- it does not redistribute Apple's voices. If you use the audio output commercially, review Apple's license terms.

**espeak-ng**: Licensed under GPLv3. This plugin does not bundle espeak -- it calls the system-installed binary. Audio output generated by espeak is not subject to the GPL. Source: https://github.com/espeak-ng/espeak-ng

**This plugin**: Apache-2.0.

## License

Apache-2.0
