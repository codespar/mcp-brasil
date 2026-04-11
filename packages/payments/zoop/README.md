# @codespar/mcp-zoop

> MCP server for **Zoop** — marketplace payments with split rules

[![npm](https://img.shields.io/npm/v/@codespar/mcp-zoop)](https://www.npmjs.com/package/@codespar/mcp-zoop)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "zoop": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-zoop"],
      "env": {
        "ZOOP_API_KEY": "your-key",
        "ZOOP_MARKETPLACE_ID": "your-marketplace-id"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add zoop -- npx @codespar/mcp-zoop
```

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "servers": {
    "zoop": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-zoop"],
      "env": {
        "ZOOP_API_KEY": "your-key",
        "ZOOP_MARKETPLACE_ID": "your-marketplace-id"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `create_transaction` | Create a transaction in Zoop (Pix, boleto, or credit card) |
| `get_transaction` | Get transaction details by ID |
| `list_transactions` | List transactions with optional filters |
| `create_split_rule` | Create a split rule for distributing payments between sellers |
| `create_seller` | Create a seller (individual or business) in the marketplace |
| `get_seller` | Get seller details by ID |
| `list_sellers` | List sellers in the marketplace |
| `create_buyer` | Create a buyer in the marketplace |
| `get_balance` | Get balance for a seller or the marketplace |
| `create_transfer` | Create a transfer to a seller's bank account |

## Authentication

Zoop uses Basic Auth with the API key as username and empty password.

## Sandbox / Testing

Zoop provides a sandbox environment accessible via the dashboard.

### Get your credentials

1. Go to [Zoop Documentation](https://docs.zoop.co)
2. Create a developer account
3. Get your API key and marketplace ID from the dashboard
4. Set the environment variables

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ZOOP_API_KEY` | Yes | API key from Zoop dashboard |
| `ZOOP_MARKETPLACE_ID` | Yes | Marketplace ID |

## Roadmap

### v0.2 (planned)
- `get_dispute` — Get dispute details by ID
- `respond_dispute` — Respond to a dispute with evidence
- `list_plans` — List all subscription plans
- `update_subscription` — Update a subscription's details
- `cancel_subscription` — Cancel an active subscription

### v0.3 (planned)
- `batch_transfers` — Process multiple transfers in a single request
- `detailed_reports` — Generate detailed financial reports
- `webhook_management` — Register, list, and delete webhooks

Want to contribute? [Open a PR](https://github.com/codespar/mcp-dev-brasil) or [request a tool](https://github.com/codespar/mcp-dev-brasil/issues).

## Links

- [Zoop Website](https://zoop.com.br)
- [Zoop API Documentation](https://docs.zoop.co)
- [MCP Dev Brasil](https://github.com/codespar/mcp-dev-brasil)
- [Landing Page](https://codespar.dev/mcp)

## Enterprise

Need governance, budget limits, and audit trails for agent payments? [CodeSpar Enterprise](https://codespar.dev/enterprise) adds policy engine, payment routing, and compliance templates on top of these MCP servers.

## License

MIT
