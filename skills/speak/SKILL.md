---
name: speak
description: Control text-to-speech for Claude Code responses. Turn on/off, adjust voice, speed, sentence count, and text cleaning.
argument-hint: "[on|off|status|config <key> <value>|voices|help]"
allowed-tools: [Read, Write, Bash]
user_invocable: true
---

# /speak

Control text-to-speech for Claude Code responses.

## Commands

```
/speak on                                Enable TTS
/speak off                               Disable TTS
/speak status                            Show current settings
/speak config voice <name>               Set voice (e.g. "Grandma", "Grandpa")
/speak config sentences <n>              Sentences to speak per response
/speak config speed <n>                  Rate multiplier (1.0 = normal)
/speak config clean terse                Strip markdown before speaking
/speak config clean verbose              Speak raw text as-is
/speak voices                            List available voices for this platform
/speak help                              Show this help
```

## Quick silence

To stop speech mid-sentence, use your system volume key (mute). This is the only thing fast enough -- by the time a skill command round-trips through Claude, the speech is already done.

## Implementation

Config file: `~/.speak/config.json`

### /speak on
Read config, set `enabled: true`, write back. Confirm to user with current settings summary.

### /speak off
Read config, set `enabled: false`, write back. Confirm: "TTS disabled."

### /speak status
Read config and display all current settings. If the config file does not exist, show defaults:
- enabled: true
- engine: native
- voice: (platform default)
- speed: 1.0
- sentences: 1
- cleanMode: terse

### /speak config <key> <value>
Read config, validate, update the specified key, write back. Valid keys and validation:
- **voice** -- non-empty string. Platform-specific (e.g. "Grandma" on macOS, "en" on Linux espeak).
- **sentences** -- positive integer, max 10. How many sentences to speak from each response. Reject values over 10.
- **speed** -- positive number between 0.1 and 3.0. Speech rate multiplier (1.0 = normal). Reject non-numbers or out-of-range.
- **clean** -- must be "terse" or "verbose". Reject other values.

If validation fails, tell the user what went wrong and do not update the config.

After any successful config change, confirm the new value to the user.

### /speak voices
List available voices for the current platform:
- macOS: run `say -v '?'`
- Linux: run `espeak --voices`
Display the output to the user.

### /speak help
Display the commands list from the Commands section above.

## Notes

- After any change (on, off, config), always confirm the result to the user with the current state
- Changes take effect on the next Claude response (Stop hook reads config each time)
- The Stop hook runs asynchronously and never blocks Claude
