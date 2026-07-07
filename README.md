# pi-time-ago

A [pi-coding-agent](https://github.com/badlogic/pi-mono) extension that shows time since the last agent response in the footer, updating every second. Helps you see at a glance whether your agent is stuck, thinking, or has finished.

## Features

- ⏱ Shows elapsed time since last assistant response
- 🎨 Color-coded: green under 30s, yellow under 2min, red beyond
- 🔄 Updates every second while agent is running
- 🧹 Auto-cleans timer on session shutdown

## Install

```bash
pi install git:github.com/elecnix/pi-time-ago
```

## Usage

Once installed, the extension activates automatically. You'll see a `⏱ 5s ago` status in the footer that updates every second. It resets whenever:

- A session starts
- An assistant message finishes
- The agent runs a tool
- The user sends a new prompt

## Events Hooked

| Event | Action |
|-------|--------|
| `session_start` | Initialize timer, start 1s interval |
| `message_end` (assistant) | Reset timestamp |
| `agent_start` | Reset timestamp |
| `tool_execution_start` | Reset timestamp |
| `session_shutdown` | Clear interval |

## Architecture

```
extensions/timestamp-footer/index.ts   → Extension entry point
```

## Requirements

- pi-coding-agent v0.69+
- Node.js 20+
