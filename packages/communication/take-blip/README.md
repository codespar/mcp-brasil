# @codespar/mcp-take-blip

> MCP server for **Take Blip** — chatbot and messaging platform

[![npm](https://img.shields.io/npm/v/@codespar/mcp-take-blip)](https://www.npmjs.com/package/@codespar/mcp-take-blip)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "take-blip": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-take-blip"],
      "env": {
        "TAKE_BLIP_BOT_ID": "your-bot-id",
        "TAKE_BLIP_ACCESS_KEY": "your-access-key"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add take-blip -- npx @codespar/mcp-take-blip
```

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "servers": {
    "take-blip": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-take-blip"],
      "env": {
        "TAKE_BLIP_BOT_ID": "your-bot-id",
        "TAKE_BLIP_ACCESS_KEY": "your-access-key"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `send_message` | Send a message to a contact via Take Blip |
| `get_contacts` | List contacts in Take Blip |
| `create_contact` | Create a contact in Take Blip |
| `get_threads` | Get message threads (recent conversations) |
| `send_notification` | Send a notification message to a contact |
| `get_analytics` | Get chatbot analytics and metrics |
| `create_broadcast` | Create a broadcast distribution list and send messages |
| `get_chatbot_flow` | Get chatbot flow/builder configuration |

## Authentication

Take Blip uses a Key-based auth header computed from the bot ID and access key.

## Sandbox / Testing

Take Blip offers a free account for testing. Create a bot to get started.

### Get your credentials

1. Go to [Take Blip](https://portal.blip.ai)
2. Create a free account and a chatbot
3. Navigate to bot settings to get the bot identifier and access key
4. Set the environment variables

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TAKE_BLIP_BOT_ID` | Yes | Bot identifier |
| `TAKE_BLIP_ACCESS_KEY` | Yes | Bot access key |

## Links

- [Take Blip Website](https://blip.ai)
- [Take Blip API Documentation](https://docs.blip.ai)
- [MCP Dev Brasil](https://github.com/codespar/mcp-dev-brasil)
- [Landing Page](https://codespar.dev/mcp)

## License

MIT
