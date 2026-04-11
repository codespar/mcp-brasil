# @codespar/mcp-vtex

> MCP server for **VTEX** — e-commerce platform with catalog, orders, inventory, and promotions

[![npm](https://img.shields.io/npm/v/@codespar/mcp-vtex)](https://www.npmjs.com/package/@codespar/mcp-vtex)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "vtex": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-vtex"],
      "env": {
        "VTEX_ACCOUNT_NAME": "your-account",
        "VTEX_APP_KEY": "your-app-key",
        "VTEX_APP_TOKEN": "your-app-token"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add vtex -- npx @codespar/mcp-vtex
```

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "servers": {
    "vtex": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-vtex"],
      "env": {
        "VTEX_ACCOUNT_NAME": "your-account",
        "VTEX_APP_KEY": "your-app-key",
        "VTEX_APP_TOKEN": "your-app-token"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `list_products` | List products from VTEX catalog |
| `get_product` | Get product details by ID |
| `list_orders` | List orders with optional filters |
| `get_order` | Get order details by ID |
| `list_skus` | List SKUs for a product |
| `get_inventory` | Get inventory/stock for a SKU across warehouses |
| `update_inventory` | Update inventory quantity for a SKU at a specific warehouse |
| `get_shipping_rates` | Simulate shipping rates for items to a postal code |
| `create_promotion` | Create a promotion/discount in VTEX |
| `get_catalog` | Get the catalog category tree |

## Authentication

VTEX uses app key and app token headers for API authentication.

## Sandbox / Testing

VTEX provides sandbox access via partner accounts. Contact VTEX for developer access.

### Get your credentials

1. Go to [VTEX Developer Portal](https://developers.vtex.com)
2. Access your VTEX admin or create a partner account
3. Generate an app key and app token from License Manager
4. Set the environment variables

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VTEX_ACCOUNT_NAME` | Yes | VTEX account name |
| `VTEX_APP_KEY` | Yes | API app key |
| `VTEX_APP_TOKEN` | Yes | API app token |

## Roadmap

### v0.2 (planned)
- `create_product` — Create a new product
- `update_product` — Update product details
- `create_sku` — Create a SKU for a product
- `create_category` — Create a product category
- `list_categories` — List all product categories

### v0.3 (planned)
- `checkout_management` — Manage checkout cart and order form
- `marketplace_integration` — Marketplace seller and offer management

Want to contribute? [Open a PR](https://github.com/codespar/mcp-dev-brasil) or [request a tool](https://github.com/codespar/mcp-dev-brasil/issues).

## Links

- [VTEX Website](https://vtex.com)
- [VTEX Developer Documentation](https://developers.vtex.com)
- [MCP Dev Brasil](https://github.com/codespar/mcp-dev-brasil)
- [Landing Page](https://codespar.dev/mcp)

## Enterprise

Need governance, budget limits, and audit trails for agent payments? [CodeSpar Enterprise](https://codespar.dev/enterprise) adds policy engine, payment routing, and compliance templates on top of these MCP servers.

## License

MIT
