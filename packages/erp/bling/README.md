# @codespar/mcp-bling

> MCP server for **Bling** — ERP with products, orders, contacts, invoices, and stock management

[![npm](https://img.shields.io/npm/v/@codespar/mcp-bling)](https://www.npmjs.com/package/@codespar/mcp-bling)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "bling": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-bling"],
      "env": {
        "BLING_ACCESS_TOKEN": "your-token"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add bling -- npx @codespar/mcp-bling
```

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "servers": {
    "bling": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-bling"],
      "env": {
        "BLING_ACCESS_TOKEN": "your-token"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `list_products` | List products in Bling |
| `create_product` | Create a product in Bling |
| `list_orders` | List sales orders in Bling |
| `create_order` | Create a sales order in Bling |
| `list_contacts` | List contacts (customers/suppliers) in Bling |
| `create_contact` | Create a contact in Bling |
| `list_invoices` | List fiscal invoices (NF-e) in Bling |
| `create_invoice` | Create a fiscal invoice (NF-e) from an order |
| `get_stock` | Get stock/inventory for a product |
| `update_stock` | Update stock for a product at a warehouse |

## Authentication

Bling uses OAuth2 Bearer tokens for authentication.

## Sandbox / Testing

Bling provides a sandbox via the OAuth flow. Use test credentials for development.

### Get your credentials

1. Go to [Bling Developer Portal](https://developer.bling.com.br)
2. Create an account
3. Register an OAuth application and obtain an access token
4. Set the `BLING_ACCESS_TOKEN` environment variable

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BLING_ACCESS_TOKEN` | Yes | OAuth2 access token |

## Links

- [Bling Website](https://bling.com.br)
- [Bling API Documentation](https://developer.bling.com.br)
- [MCP Dev Brasil](https://github.com/codespar/mcp-dev-brasil)
- [Landing Page](https://codespar.dev/mcp)

## License

MIT
