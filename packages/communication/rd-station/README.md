# @codespar/mcp-rd-station

> MCP server for **RD Station** — marketing automation and CRM

[![npm](https://img.shields.io/npm/v/@codespar/mcp-rd-station)](https://www.npmjs.com/package/@codespar/mcp-rd-station)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "rd-station": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-rd-station"],
      "env": {
        "RD_STATION_TOKEN": "your-token"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add rd-station -- npx @codespar/mcp-rd-station
```

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "servers": {
    "rd-station": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-rd-station"],
      "env": {
        "RD_STATION_TOKEN": "your-token"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `create_contact` | Create a contact in RD Station CRM |
| `update_contact` | Update a contact by UUID |
| `get_contact` | Get contact details by UUID or email |
| `list_contacts` | List contacts with pagination |
| `create_event` | Create a conversion event for a contact |
| `list_funnels` | List all sales funnels |
| `get_funnel` | Get funnel details with stages |
| `create_opportunity` | Create a sales opportunity in a funnel |

## Authentication

RD Station uses a Bearer token for authentication.

## Sandbox / Testing

RD Station provides an OAuth sandbox for testing. Use sandbox credentials during development.

### Get your credentials

1. Go to [RD Station Developer Portal](https://developers.rdstation.com)
2. Create a developer account
3. Register an OAuth application and obtain a token
4. Set the `RD_STATION_TOKEN` environment variable

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `RD_STATION_TOKEN` | Yes | Bearer token from RD Station |

## Links

- [RD Station Website](https://rdstation.com)
- [RD Station API Documentation](https://developers.rdstation.com)
- [MCP Dev Brasil](https://github.com/codespar/mcp-dev-brasil)
- [Landing Page](https://codespar.dev/mcp)

## License

MIT
