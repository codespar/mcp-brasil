# @codespar/mcp-bitso

> MCP server for **Bitso** — Latin American cryptocurrency exchange with trading, orders, and withdrawals

[![npm](https://img.shields.io/npm/v/@codespar/mcp-bitso)](https://www.npmjs.com/package/@codespar/mcp-bitso)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "bitso": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-bitso"],
      "env": {
        "BITSO_API_KEY": "your-key",
        "BITSO_API_SECRET": "your-secret"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add bitso -- npx @codespar/mcp-bitso
```

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "servers": {
    "bitso": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-bitso"],
      "env": {
        "BITSO_API_KEY": "your-key",
        "BITSO_API_SECRET": "your-secret"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `get_ticker` | Get ticker data for a trading pair (price, volume, VWAP, etc.) |
| `list_orderbook` | Get order book (bids and asks) for a trading pair |
| `create_order` | Create a buy or sell order |
| `get_order` | Get order details by ID |
| `cancel_order` | Cancel an open order |
| `list_orders` | List orders with optional filters |
| `get_balances` | Get account balances for all assets |
| `list_trades` | List executed trades for an order book |
| `list_funding_sources` | List available funding sources (bank accounts, etc.) |
| `create_withdrawal` | Create a withdrawal request (crypto or fiat) |

## Authentication

Bitso uses HMAC-SHA256 signed requests with an API key and secret.

## Sandbox / Testing

Bitso provides a developer sandbox via the developer account.

### Get your credentials

1. Go to [Bitso](https://bitso.com)
2. Create an account
3. Navigate to API settings and generate key and secret
4. Set the environment variables

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BITSO_API_KEY` | Yes | API key from Bitso |
| `BITSO_API_SECRET` | Yes | API secret for HMAC signature |

## Links

- [Bitso Website](https://bitso.com)
- [Bitso API Documentation](https://bitso.com/developers)
- [MCP Dev Brasil](https://github.com/codespar/mcp-dev-brasil)
- [Landing Page](https://codespar.dev/mcp)

## License

MIT
