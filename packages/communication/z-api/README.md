# @codespar/mcp-z-api

> MCP server for **Z-API** — WhatsApp messaging platform

[![npm](https://img.shields.io/npm/v/@codespar/mcp-z-api)](https://www.npmjs.com/package/@codespar/mcp-z-api)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "z-api": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-z-api"],
      "env": {
        "ZAPI_INSTANCE_ID": "your-instance-id",
        "ZAPI_TOKEN": "your-token"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add z-api -- npx @codespar/mcp-z-api
```

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "servers": {
    "z-api": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-z-api"],
      "env": {
        "ZAPI_INSTANCE_ID": "your-instance-id",
        "ZAPI_TOKEN": "your-token"
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
| `send_audio` | Send an audio message via WhatsApp |
| `get_contacts` | Get all WhatsApp contacts |
| `check_number` | Check if a phone number has WhatsApp |
| `get_profile_picture` | Get profile picture URL for a phone number |
| `get_messages` | Get messages for a phone number |
| `send_button_list` | Send a button list message via WhatsApp |
| `get_status` | Get WhatsApp instance connection status |

## Authentication

Z-API uses instance ID and token embedded in the request URL.

## Sandbox / Testing

Z-API offers a free trial for testing. Create an account to get started.

### Get your credentials

1. Go to [Z-API Developer Portal](https://developer.z-api.io)
2. Create an account and start a free trial
3. Get your instance ID and token
4. Set the environment variables

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ZAPI_INSTANCE_ID` | Yes | Z-API instance ID |
| `ZAPI_TOKEN` | Yes | Z-API instance token |

## Links

- [Z-API Website](https://z-api.io)
- [Z-API Developer Documentation](https://developer.z-api.io)
- [MCP Dev Brasil](https://github.com/codespar/mcp-dev-brasil)
- [Landing Page](https://codespar.dev/mcp)

## License

MIT
