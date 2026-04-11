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

## Roadmap

### v0.2 (planned)
- `create_payment_link` — Create a payment link
- `get_payment_link` — Get payment link details
- `list_payment_links` — List all payment links
- `create_batch_transfer` — Create a batch crypto transfer
- `get_supported_currencies` — List supported cryptocurrencies

### v0.3 (planned)
- `multi_currency_wallet` — Multi-currency wallet management
- `compliance_reports` — Generate compliance/AML reports

Want to contribute? [Open a PR](https://github.com/codespar/mcp-dev-brasil) or [request a tool](https://github.com/codespar/mcp-dev-brasil/issues).

## Links

- [UnblockPay Website](https://unblockpay.com)
- [UnblockPay API Documentation](https://docs.unblockpay.com)
- [MCP Dev Brasil](https://github.com/codespar/mcp-dev-brasil)
- [Landing Page](https://codespar.dev/mcp)

## Enterprise

Need governance, budget limits, and audit trails for agent payments? [CodeSpar Enterprise](https://codespar.dev/enterprise) adds policy engine, payment routing, and compliance templates on top of these MCP servers.

## License

MIT
