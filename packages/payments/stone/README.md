# @codespar/mcp-stone

> MCP server for **Stone** — open banking, payments, Pix, and transfers

[![npm](https://img.shields.io/npm/v/@codespar/mcp-stone)](https://www.npmjs.com/package/@codespar/mcp-stone)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "stone": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-stone"],
      "env": {
        "STONE_CLIENT_ID": "your-client-id",
        "STONE_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add stone -- npx @codespar/mcp-stone
```

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "servers": {
    "stone": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-stone"],
      "env": {
        "STONE_CLIENT_ID": "your-client-id",
        "STONE_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `create_payment` | Create a payment via Stone |
| `get_payment` | Get payment details by ID |
| `list_payments` | List payments with optional filters |
| `get_balance` | Get account balance |
| `list_transactions` | List account transactions |
| `create_transfer` | Create a bank transfer (internal or external) |
| `get_statement` | Get account statement for a period |
| `create_pix_payment` | Create a Pix payment via Stone |

## Authentication

Stone uses OAuth2 client credentials for authentication. The server automatically manages token refresh.

## Sandbox / Testing

Stone provides a sandbox via the developer portal.

### Get your credentials

1. Go to [Stone Open Bank Documentation](https://docs.openbank.stone.com.br)
2. Register as a developer
3. Create an application to get OAuth2 credentials
4. Set the environment variables

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `STONE_CLIENT_ID` | Yes | OAuth2 client ID |
| `STONE_CLIENT_SECRET` | Yes | OAuth2 client secret |

## Roadmap

### v0.2 (planned)
- `list_pix_keys` — List registered Pix keys
- `create_boleto` — Create a boleto payment
- `get_boleto` — Get boleto details
- `create_scheduled_payment` — Create a scheduled payment
- `list_webhooks` — List registered webhooks

### v0.3 (planned)
- `batch_transfers` — Process multiple transfers in a single request
- `detailed_statements` — Generate detailed account statements

Want to contribute? [Open a PR](https://github.com/codespar/mcp-dev-brasil) or [request a tool](https://github.com/codespar/mcp-dev-brasil/issues).

## Links

- [Stone Website](https://stone.com.br)
- [Stone Open Bank Documentation](https://docs.openbank.stone.com.br)
- [MCP Dev Brasil](https://github.com/codespar/mcp-dev-brasil)
- [Landing Page](https://codespar.dev/mcp)

## License

MIT
