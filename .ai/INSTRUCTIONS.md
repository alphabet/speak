# Instructions for AI Assistants

## Rules

- When new `.md` files are added to `.ai/`, register them in `TOC-INDEX.md` with a one-line description
- Always verify mobile-first when testing responsive designs

## Running Scripts

All shell scripts use `#!/bin/sh` shebang for compatibility.

```bash
# Correct
sh scripts/start.sh
node scripts/some-script.js

# Avoid direct execution - may not work on all systems
./scripts/start.sh
```

## Directory Purpose

`.ai/` contains AI-related tooling and configuration:

- Development-only - not included in production deployments
- Standalone - independent from application code
- Version-controlled - checked into git (except node_modules, .env, logs)

## MCP Server

`mcp-server/` contains a Model Context Protocol server with Playwright for browser automation and page rendering verification.

Configure with environment variables:
- `BASE_URL` - base URL for relative navigation (default: `http://localhost:3000`)
- `HEADLESS` - set to `false` to show the browser window (default: `true`)
- `BROWSER_TIMEOUT` - timeout in ms (default: `30000`)

Capabilities:
- Navigate pages and interact with the app
- Inspect page content via accessibility trees
- Take screenshots for visual verification
- Get computed CSS styles
- Execute JavaScript in the browser context

## Gitignore Rules

- `node_modules/` - NPM packages
- `.env` - Environment variables
- `package-lock.json` - Lock file
- `*.log` - Log files
- `tmp/` - Scratch files

> See also: [TOC-INDEX](TOC-INDEX.md)
