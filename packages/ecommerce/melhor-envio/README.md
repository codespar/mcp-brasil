# @codespar/mcp-melhor-envio

> MCP server for **Melhor Envio** — shipping aggregator with multi-carrier rate comparison

[![npm](https://img.shields.io/npm/v/@codespar/mcp-melhor-envio)](https://www.npmjs.com/package/@codespar/mcp-melhor-envio)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "melhor-envio": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-melhor-envio"],
      "env": {
        "MELHOR_ENVIO_TOKEN": "your-token",
        "MELHOR_ENVIO_SANDBOX": "true"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add melhor-envio -- npx @codespar/mcp-melhor-envio
```

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "servers": {
    "melhor-envio": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-melhor-envio"],
      "env": {
        "MELHOR_ENVIO_TOKEN": "your-token",
        "MELHOR_ENVIO_SANDBOX": "true"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `calculate_shipping` | Calculate shipping rates from multiple carriers |
| `create_shipment` | Create a shipment order |
| `track_shipment` | Track a shipment by order ID |
| `generate_label` | Generate shipping label for an order |
| `list_agencies` | List carrier pickup agencies near a location |
| `cancel_shipment` | Cancel a shipment order |
| `get_balance` | Get current account balance |
| `add_cart` | Add shipment orders to cart for batch checkout |

## Authentication

Melhor Envio uses a Bearer token for authentication.

## Sandbox / Testing

Melhor Envio provides a sandbox at `sandbox.melhorenvio.com.br`. Set `MELHOR_ENVIO_SANDBOX=true` to use it.

### Get your credentials

1. Go to [Melhor Envio](https://melhorenvio.com.br)
2. Create an account
3. Navigate to API settings and generate a token
4. Set the `MELHOR_ENVIO_TOKEN` environment variable

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MELHOR_ENVIO_TOKEN` | Yes | Bearer token from Melhor Envio |
| `MELHOR_ENVIO_SANDBOX` | No | Set to `"true"` for sandbox mode |

## Links

- [Melhor Envio Website](https://melhorenvio.com.br)
- [Melhor Envio API Documentation](https://docs.melhorenvio.com.br)
- [MCP Dev Brasil](https://github.com/codespar/mcp-dev-brasil)
- [Landing Page](https://codespar.dev/mcp)

## License

MIT
