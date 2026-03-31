# speak

Cross-platform text-to-speech plugin for Claude Code. Hear your agent's responses spoken aloud.

## What it does

When Claude finishes a response, the Stop hook extracts the text, strips markdown noise, and speaks it using your platform's native TTS engine.

<video src="https://github.com/user-attachments/assets/504d2148-3681-427f-99be-3c48a0dafad4" controls
  width="auto"></video>


## Compatibility

Works with any Claude Code surface that supports hooks and plugins:

- CLI (`claude`)
- Desktop app (Mac/Windows)
- Web app (claude.ai/code)
- IDE extensions (VS Code, JetBrains)

Does **not** work with Claude Desktop (the chat app), which has no hook or plugin system.

## Install

1. Clone this repo somewhere on your machine
2. Launch Claude Code with the plugin:
   ```bash
   claude --plugin-dir /path/to/speak
   ```

If you have a TTS block in `~/.claude/hooks/scripts/hooks.py`, remove it to avoid double-firing.

## Usage

### /speak

```
/speak on                                Enable TTS
/speak off                               Disable TTS
/speak status                            Show current settings
/speak config voice <name>               Set voice (e.g. "Grandma", "Grandpa")
/speak config sentences <n>              Sentences to speak (1-10)
/speak config speed <n>                  Rate multiplier (0.1-3.0)
/speak config clean terse                Strip markdown before speaking
/speak config clean verbose              Speak raw text as-is
/speak voices                            List available voices
/speak help                              Show all commands
```

### Quick silence

To stop speech mid-sentence, you have to use your system volume key (mute). Hardware mute is the only thing fast enough.

### CLI

```bash
node bin/speak.mjs "Hello world"
```

## How it works

- **Stop hook** fires after each Claude response
- Text is cleaned (markdown/code stripped) and truncated to N sentences
- Native TTS engine speaks the text asynchronously (never blocks Claude)
- If a previous response is still speaking, it gets cut off (one voice at a time)

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

Engine interface is pluggable via lib/engine.mjs. If you're not satisfied with the system TTS, a different engine can be configured behind this same interface. Right now the plugin only requires `Node.js >= 18` and your platform's native TTS (say on macOS, espeak on Linux). Neural engines sound better, but neural engine performance varies with system hardware (CPU vs GPU) and the engine capabilities.

## Legal

**macOS voices**: Apple's system voices are subject to the macOS Software License Agreement, which restricts their use to personal, non-commercial purposes. This plugin calls `say` on the user's own machine -- it does not redistribute Apple's voices. If you use the audio output commercially, review Apple's license terms.

**espeak-ng**: Licensed under GPLv3. This plugin does not bundle espeak -- it calls the system-installed binary. Audio output generated by espeak is not subject to the GPL. Source: https://github.com/espeak-ng/espeak-ng

**This plugin**: Apache-2.0.

## License

Apache-2.0
