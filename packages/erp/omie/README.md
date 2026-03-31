# @codespar/mcp-omie

> MCP server for **Omie** — ERP with customers, products, orders, invoices, and financials

[![npm](https://img.shields.io/npm/v/@codespar/mcp-omie)](https://www.npmjs.com/package/@codespar/mcp-omie)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "omie": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-omie"],
      "env": {
        "OMIE_APP_KEY": "your-app-key",
        "OMIE_APP_SECRET": "your-app-secret"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add omie -- npx @codespar/mcp-omie
```

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "servers": {
    "omie": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-omie"],
      "env": {
        "OMIE_APP_KEY": "your-app-key",
        "OMIE_APP_SECRET": "your-app-secret"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `list_customers` | List customers from Omie ERP |
| `create_customer` | Create a customer in Omie ERP |
| `list_products` | List products from Omie ERP |
| `create_product` | Create a product in Omie ERP |
| `create_order` | Create a sales order in Omie ERP |
| `list_orders` | List sales orders from Omie ERP |
| `list_invoices` | List invoices (NF) from Omie ERP |
| `get_financial` | List accounts receivable from Omie ERP |
| `create_invoice` | Consult a specific NF by ID in Omie ERP |
| `get_company_info` | List companies registered in Omie ERP |

## Authentication

Omie uses JSON-RPC style requests with app_key and app_secret in the request body.

## Sandbox / Testing

Omie provides a sandbox via app registration. Create an app to get test credentials.

### Get your credentials

1. Go to [Omie Developer Portal](https://developer.omie.com.br)
2. Create an account
3. Register an application to get app key and secret
4. Set the environment variables

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OMIE_APP_KEY` | Yes | Omie app key |
| `OMIE_APP_SECRET` | Yes | Omie app secret |

## Roadmap

### v0.2 (planned)
- `create_service_order` — Create a service order
- `list_service_orders` — List service orders with filters
- `create_purchase_order` — Create a purchase order
- `list_purchase_orders` — List purchase orders with filters
- `get_bank_accounts` — Get registered bank accounts

### v0.3 (planned)
- `create_production_order` — Create a production order
- `accounting_entries` — Create and list accounting entries

Want to contribute? [Open a PR](https://github.com/codespar/mcp-dev-brasil) or [request a tool](https://github.com/codespar/mcp-dev-brasil/issues).

## Links

- [Omie Website](https://omie.com.br)
- [Omie API Documentation](https://developer.omie.com.br)
- [MCP Dev Brasil](https://github.com/codespar/mcp-dev-brasil)
- [Landing Page](https://codespar.dev/mcp)

## License

MIT
