# @codespar/mcp-niubiz

> MCP server for **Niubiz** (ex-VisaNet Perú) — Peru's dominant card acquirer, 300k+ merchants. Implements the real ecommerce flow: security token → checkout session → authorization, plus same-day reverse.

[![npm](https://img.shields.io/npm/v/@codespar/mcp-niubiz)](https://www.npmjs.com/package/@codespar/mcp-niubiz)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "niubiz": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-niubiz"],
      "env": {
        "NIUBIZ_USER": "your-api-user",
        "NIUBIZ_PASSWORD": "your-api-password",
        "NIUBIZ_MERCHANT_ID": "your-merchant-id",
        "NIUBIZ_ENV": "sandbox"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add niubiz --env NIUBIZ_USER=... --env NIUBIZ_PASSWORD=... --env NIUBIZ_MERCHANT_ID=... -- npx -y @codespar/mcp-niubiz
```

### Cursor / VS Code

Add the same block to `.cursor/mcp.json` or `.vscode/mcp.json`.

## Tools (4)

| Tool | Endpoint | What it does |
|---|---|---|
| `get_security_token` | `POST /api.security/v1/security` | Bearer token (cached 20 min; other tools auto-fetch) |
| `create_session_token` | `POST /api.ecommerce/v2/ecommerce/token/session/{merchantId}` | Checkout session with amount + antifraud data |
| `authorize_transaction` | `POST /api.authorization/v3/authorization/ecommerce/{merchantId}` | Authorize with the checkout's `transactionToken` |
| `reverse_transaction` | `POST /api.authorization/v3/reverse/ecommerce/{merchantId}` | Same-day void of an authorization |

## The Niubiz flow

Card data never touches this server: the customer types the card into Niubiz's own checkout form (fed by `create_session_token`), the form returns a `transactionToken`, and `authorize_transaction` completes the purchase. This is Niubiz's standard 3-step ecommerce integration.

## Authentication

| Variable | Required | Description |
|---|---|---|
| `NIUBIZ_USER` | yes | API user |
| `NIUBIZ_PASSWORD` | yes | API password |
| `NIUBIZ_MERCHANT_ID` | yes | Merchant id (código de comercio) |
| `NIUBIZ_ENV` | no | `sandbox` (default) or `production` |

## Enterprise

Need governance, budget limits, and audit trails for agent payments? [CodeSpar Enterprise](https://codespar.dev/enterprise) adds policy engine, payment routing, and compliance templates on top of these MCP servers.

## Managed tier

This open-source server calls Niubiz's API directly with your credentials. CodeSpar's managed tier routes one interface across every LATAM provider with automatic failover, governance, audit and a credential vault: [codespar.dev/agents](https://codespar.dev/agents).

## License

MIT
