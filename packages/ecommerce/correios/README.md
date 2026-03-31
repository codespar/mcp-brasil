# @codespar/mcp-correios

> MCP server for **Correios** — Brazilian postal service tracking, rates, and shipping

[![npm](https://img.shields.io/npm/v/@codespar/mcp-correios)](https://www.npmjs.com/package/@codespar/mcp-correios)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "correios": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-correios"],
      "env": {
        "CORREIOS_USER": "your-user",
        "CORREIOS_TOKEN": "your-token"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add correios -- npx @codespar/mcp-correios
```

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "servers": {
    "correios": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-correios"],
      "env": {
        "CORREIOS_USER": "your-user",
        "CORREIOS_TOKEN": "your-token"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `track_package` | Track a package by Correios tracking code |
| `calculate_shipping` | Calculate shipping rates between two CEPs |
| `get_delivery_time` | Get estimated delivery time between two CEPs |
| `list_services` | List available Correios shipping services |
| `find_cep` | Look up address by CEP via Correios |
| `create_prepost` | Create a pre-posting order for shipping |

## Authentication

Correios uses Basic Auth for token generation, then Bearer token for subsequent requests. The server automatically manages authentication.

## Sandbox / Testing

Correios provides a homologation environment for testing. Contact Correios for homologation credentials.

### Get your credentials

1. Go to [Correios CWS Portal](https://cws.correios.com.br)
2. Register for API access (requires a contract with Correios)
3. Get your username and token
4. Set the environment variables

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CORREIOS_USER` | Yes | Correios API username |
| `CORREIOS_TOKEN` | Yes | Correios API token |

## Links

- [Correios Website](https://correios.com.br)
- [Correios API Portal](https://cws.correios.com.br)
- [MCP Dev Brasil](https://github.com/codespar/mcp-dev-brasil)
- [Landing Page](https://codespar.dev/mcp)

## License

MIT
