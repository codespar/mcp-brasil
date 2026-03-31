# @codespar/mcp-tiny

> MCP server for **Tiny ERP** — products, orders, contacts, invoices, stock, and accounts payable

[![npm](https://img.shields.io/npm/v/@codespar/mcp-tiny)](https://www.npmjs.com/package/@codespar/mcp-tiny)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "tiny": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-tiny"],
      "env": {
        "TINY_API_TOKEN": "your-token"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add tiny -- npx @codespar/mcp-tiny
```

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "servers": {
    "tiny": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-tiny"],
      "env": {
        "TINY_API_TOKEN": "your-token"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `list_products` | List products in Tiny ERP |
| `get_product` | Get product details by ID |
| `list_orders` | List sales orders in Tiny ERP |
| `get_order` | Get order details by ID |
| `list_contacts` | List contacts in Tiny ERP |
| `get_contact` | Get contact details by ID |
| `create_invoice` | Create a fiscal invoice (NF-e) from an order in Tiny |
| `get_invoice` | Get invoice details by ID |
| `get_stock` | Get current stock for a product |
| `list_accounts_payable` | List accounts payable in Tiny ERP |

## Authentication

Tiny uses a token parameter passed in each request.

## Sandbox / Testing

Tiny provides test access via account registration.

### Get your credentials

1. Go to [Tiny ERP](https://tiny.com.br)
2. Create an account
3. Navigate to API settings to generate a token
4. Set the `TINY_API_TOKEN` environment variable

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TINY_API_TOKEN` | Yes | API token from Tiny ERP |

## Links

- [Tiny ERP Website](https://tiny.com.br)
- [Tiny API Documentation](https://tiny.com.br/api-docs)
- [MCP Dev Brasil](https://github.com/codespar/mcp-dev-brasil)
- [Landing Page](https://codespar.dev/mcp)

## License

MIT
