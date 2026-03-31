# @codespar/mcp-mercado-bitcoin

> MCP server for **Mercado Bitcoin** — Brazilian cryptocurrency exchange with trading, orders, and market data

[![npm](https://img.shields.io/npm/v/@codespar/mcp-mercado-bitcoin)](https://www.npmjs.com/package/@codespar/mcp-mercado-bitcoin)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mercado-bitcoin": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-mercado-bitcoin"],
      "env": {
        "MB_API_KEY": "your-key",
        "MB_API_SECRET": "your-secret"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add mercado-bitcoin -- npx @codespar/mcp-mercado-bitcoin
```

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "servers": {
    "mercado-bitcoin": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-mercado-bitcoin"],
      "env": {
        "MB_API_KEY": "your-key",
        "MB_API_SECRET": "your-secret"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `get_ticker` | Get ticker data for a trading pair (price, volume, etc.) |
| `list_orderbook` | Get order book (bids and asks) for a trading pair |
| `create_order` | Create a buy or sell order |
| `get_order` | Get order details by ID |
| `cancel_order` | Cancel an open order |
| `list_orders` | List orders with optional filters |
| `get_balance` | Get account balances for all assets |
| `list_trades` | List executed trades for a trading pair |
| `get_candles` | Get candlestick/OHLCV data for a trading pair |
| `withdraw` | Create a withdrawal request |

## Authentication

Mercado Bitcoin uses an API key and secret passed via request headers.

## Sandbox / Testing

Mercado Bitcoin provides a sandbox via the dashboard for testing.

### Get your credentials

1. Go to [Mercado Bitcoin](https://www.mercadobitcoin.com.br)
2. Create an account
3. Navigate to API settings to generate key and secret
4. Set the environment variables

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MB_API_KEY` | Yes | API key from Mercado Bitcoin |
| `MB_API_SECRET` | Yes | API secret from Mercado Bitcoin |

## Links

- [Mercado Bitcoin Website](https://www.mercadobitcoin.com.br)
- [Mercado Bitcoin API Documentation](https://api.mercadobitcoin.net/api/v4/docs)
- [MCP Dev Brasil](https://github.com/codespar/mcp-dev-brasil)
- [Landing Page](https://codespar.dev/mcp)

## License

MIT
