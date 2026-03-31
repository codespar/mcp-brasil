# @codespar/mcp-evolution-api

> MCP server for **Evolution API** — self-hosted WhatsApp messaging API

[![npm](https://img.shields.io/npm/v/@codespar/mcp-evolution-api)](https://www.npmjs.com/package/@codespar/mcp-evolution-api)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "evolution-api": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-evolution-api"],
      "env": {
        "EVOLUTION_API_URL": "https://your-instance.example.com",
        "EVOLUTION_API_KEY": "your-key"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add evolution-api -- npx @codespar/mcp-evolution-api
```

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "servers": {
    "evolution-api": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-evolution-api"],
      "env": {
        "EVOLUTION_API_URL": "https://your-instance.example.com",
        "EVOLUTION_API_KEY": "your-key"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `send_text` | Send a text message via WhatsApp |
| `send_image` | Send an image message via WhatsApp |
| `send_document` | Send a document via WhatsApp |
| `get_instances` | List all WhatsApp instances |
| `create_instance` | Create a new WhatsApp instance |
| `get_qrcode` | Get QR code for instance pairing |
| `get_contacts` | Get contacts from an instance |
| `send_poll` | Send a poll message via WhatsApp |
| `get_messages` | Get messages from a chat |
| `check_number` | Check if a phone number is registered on WhatsApp |

## Authentication

Evolution API uses an API key passed via the `apikey` header.

## Sandbox / Testing

Evolution API is self-hosted. Deploy your own instance using Docker for testing.

### Get your credentials

1. Go to [Evolution API Documentation](https://doc.evolution-api.com)
2. Deploy your own instance (Docker recommended)
3. Get the API key from your instance configuration
4. Set the environment variables

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `EVOLUTION_API_URL` | Yes | Base URL of your Evolution API instance |
| `EVOLUTION_API_KEY` | Yes | API key for authentication |

## Roadmap

### v0.2 (planned)
- `create_group` — Create a WhatsApp group
- `get_group_info` — Get group details and participants
- `update_profile` — Update instance profile (name, photo, status)
- `set_presence` — Set online/offline presence status
- `get_chat_history` — Get full chat history with a contact

### v0.3 (planned)
- `bulk_send` — Send messages to multiple contacts
- `template_messages` — Send WhatsApp Business template messages
- `label_management` — Create, update, and assign labels to chats

Want to contribute? [Open a PR](https://github.com/codespar/mcp-dev-brasil) or [request a tool](https://github.com/codespar/mcp-dev-brasil/issues).

## Links

- [Evolution API Documentation](https://doc.evolution-api.com)
- [Evolution API GitHub](https://github.com/EvolutionAPI/evolution-api)
- [MCP Dev Brasil](https://github.com/codespar/mcp-dev-brasil)
- [Landing Page](https://codespar.dev/mcp)

## License

MIT
