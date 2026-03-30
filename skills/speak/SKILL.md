---
name: speak
description: Control text-to-speech for Claude Code responses. Turn on/off, adjust voice, speed, sentence count, and text cleaning.
argument-hint: "[on|off|status|terse|verbose|set <key> <value>|voices [filter]|help]"
allowed-tools: [Read, Write, Bash]
user_invocable: true
---

# /speak

Control text-to-speech for Claude Code responses.

## Commands

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

## Quick silence

To stop speech mid-sentence, use your system volume key (mute). This is the only thing fast enough -- by the time a skill command round-trips through Claude, the speech is already done.

## Implementation

Config file: `~/.speak/config.json`

### /speak on
Read config, set `enabled: true`, write back. Confirm to user with current settings summary.

### /speak off
Read config, set `enabled: false`, write back. Confirm: "TTS disabled."

### /speak status
Read config and display all current settings as a table. If the config file does not exist, show defaults:

| Setting   | Value              |
|-----------|--------------------|
| enabled   | true               |
| engine    | native             |
| voice     | (platform default) |
| speed     | 1.0                |
| sentences | 1                  |
| cleanMode | terse              |

### /speak set <key> <value>
Read config, validate, update the specified key, write back as a table. Valid keys and validation:
- **voice** -- fuzzy match against installed voices. Run: `../../bin/voices.mjs --json <value>`

  Parse the JSON array:
  - **1 result**: save its `name` to config. Confirm with name and locale.
  - **2+ results**: show a numbered list (name + locale), ask user to pick.
  - **0 results**: tell user no match, suggest `/speak voices <value>`.
- **sentences** -- positive integer, max 10. How many sentences to speak from each response. Reject values over 10.
- **speed** -- positive number between 0.1 and 3.0. Speech rate multiplier (1.0 = normal). Reject non-numbers or out-of-range.
If validation fails, tell the user what went wrong and do not update the config.

After any successful config change, confirm the new value to the user.

### /speak terse
Read config, set `cleanMode: "terse"`, write back. Confirm the change.

### /speak verbose
Read config, set `cleanMode: "verbose"`, write back. Confirm the change.

### /speak voices [filter]
Run: `../../bin/voices.mjs <filter if provided>`
Display the output directly -- it is pre-formatted. Do not reformat.

### /speak help
Display the commands list from the Commands section above.

## Notes

- After any change (on, off, set), always confirm the result to the user with the current state
- Changes take effect on the next Claude response (Stop hook reads config each time)
- The Stop hook runs asynchronously and never blocks Claude
