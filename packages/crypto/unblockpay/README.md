# @codespar/mcp-unblockpay

> MCP server for **UnblockPay** — fiat-to-stablecoin onramp/offramp and wallet management

[![npm](https://img.shields.io/npm/v/@codespar/mcp-unblockpay)](https://www.npmjs.com/package/@codespar/mcp-unblockpay)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "unblockpay": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-unblockpay"],
      "env": {
        "UNBLOCKPAY_API_KEY": "your-key"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add unblockpay -- npx @codespar/mcp-unblockpay
```

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "servers": {
    "unblockpay": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-unblockpay"],
      "env": {
        "UNBLOCKPAY_API_KEY": "your-key"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `create_wallet` | Create a new wallet in UnblockPay |
| `get_wallet` | Get wallet details by ID |
| `list_wallets` | List all wallets |
| `create_onramp` | Create a fiat-to-stablecoin onramp transaction |
| `create_offramp` | Create a stablecoin-to-fiat offramp transaction |
| `get_transaction` | Get transaction details by ID |
| `list_transactions` | List transactions with optional filters |
| `get_exchange_rate` | Get current exchange rate for a currency pair |
| `create_transfer` | Create a stablecoin transfer between wallets |
| `get_balance` | Get wallet balance |

## Authentication

UnblockPay uses a Bearer API key for authentication.

## Sandbox / Testing

UnblockPay provides a sandbox via the developer portal.

### Get your credentials

1. Go to [UnblockPay Documentation](https://docs.unblockpay.com)
2. Create a developer account
3. Generate an API key
4. Set the `UNBLOCKPAY_API_KEY` environment variable

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `UNBLOCKPAY_API_KEY` | Yes | API key from UnblockPay |

## Links

- [UnblockPay Website](https://unblockpay.com)
- [UnblockPay API Documentation](https://docs.unblockpay.com)
- [MCP Dev Brasil](https://github.com/codespar/mcp-dev-brasil)
- [Landing Page](https://codespar.dev/mcp)

## License

MIT
