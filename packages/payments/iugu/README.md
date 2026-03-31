# @codespar/mcp-iugu

> MCP server for **iugu** — invoices, subscriptions, and payment management

[![npm](https://img.shields.io/npm/v/@codespar/mcp-iugu)](https://www.npmjs.com/package/@codespar/mcp-iugu)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "iugu": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-iugu"],
      "env": {
        "IUGU_API_TOKEN": "your-token"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add iugu -- npx @codespar/mcp-iugu
```

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "servers": {
    "iugu": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-iugu"],
      "env": {
        "IUGU_API_TOKEN": "your-token"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `create_invoice` | Create an invoice in iugu (Pix, boleto, or credit card) |
| `get_invoice` | Get invoice details by ID |
| `list_invoices` | List invoices with optional filters |
| `create_customer` | Create a customer in iugu |
| `list_customers` | List customers with optional filters |
| `create_subscription` | Create a recurring subscription in iugu |
| `create_payment_method` | Create a payment method (credit card token) for a customer |
| `get_account_info` | Get account information, configuration, and balance |

## Authentication

iugu uses Basic Auth with the API token as username and an empty password.

## Sandbox / Testing

iugu provides test mode via the dashboard. Use a test-mode API token to avoid real charges.

### Get your credentials

1. Go to [iugu Developer Portal](https://dev.iugu.com)
2. Create an account and access the dashboard
3. Toggle to test mode and generate an API token
4. Set the `IUGU_API_TOKEN` environment variable

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `IUGU_API_TOKEN` | Yes | API token from iugu dashboard |
| `IUGU_SANDBOX` | No | Set to `"true"` for test mode |

## Links

- [iugu Website](https://iugu.com)
- [iugu API Documentation](https://dev.iugu.com)
- [MCP Dev Brasil](https://github.com/codespar/mcp-dev-brasil)
- [Landing Page](https://codespar.dev/mcp)

## License

MIT
