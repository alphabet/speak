---
name: say
description: Control text-to-speech for Claude Code responses. Turn on/off, adjust voice, speed, sentence count, and text cleaning.
argument-hint: "[on|off|status|config <key> <value>|voices|help]"
allowed-tools: [Read, Write, Bash]
user_invocable: true
---

# /speak:say

Control text-to-speech for Claude Code responses.

## Commands

```
/speak:say on                          Enable TTS
/speak:say off                         Disable TTS
/speak:say status                      Show current settings
/speak:say config voice <name>         Set voice (e.g. "Grandma", "Karen")
/speak:say config sentences <n>        Sentences to speak per response
/speak:say config speed <n>            Rate multiplier (1.0 = normal)
/speak:say config clean terse          Strip markdown before speaking
/speak:say config clean verbose        Speak raw text as-is
/speak:say voices                      List available voices for this platform
/speak:say help                        Show this help
```

## Quick silence

To stop speech mid-sentence, use your system volume key (mute). This is the only thing fast enough -- by the time a skill command round-trips through Claude, the speech is already done.

## Implementation

Config file: `~/.speak/config.json`

### /speak:say on
Read config, set `enabled: true`, write back. Confirm to user with current settings summary.

### /speak:say off
Read config, set `enabled: false`, write back. Confirm: "TTS disabled."

### /speak:say status
Read config and display all current settings. If the config file does not exist, show defaults:
- enabled: true
- engine: native
- voice: (platform default)
- speed: 1.0
- sentences: 1
- cleanMode: terse

### /speak:say config <key> <value>
Read config, validate, update the specified key, write back. Valid keys and validation:
- **voice** -- non-empty string. Platform-specific (e.g. "Karen" on macOS, "en" on Linux espeak).
- **sentences** -- positive integer, max 10. How many sentences to speak from each response. Reject values over 10.
- **speed** -- positive number between 0.1 and 3.0. Speech rate multiplier (1.0 = normal). Reject non-numbers or out-of-range.
- **clean** -- must be "terse" or "verbose". Reject other values.

If validation fails, tell the user what went wrong and do not update the config.

After any successful config change, confirm the new value to the user.

### /speak:say voices
List available voices for the current platform:
- macOS: run `say -v '?'`
- Linux: run `espeak --voices`
Display the output to the user.

### /speak:say help
Display the commands list from the Commands section above.

## Notes

- After any change (on, off, config), always confirm the result to the user with the current state
- Changes take effect on the next Claude response (Stop hook reads config each time)
- The Stop hook runs asynchronously and never blocks Claude
