# @codespar/mcp-bold-co

> MCP server for **Bold** — Colombian acquirer (bold.co): payment links for cards, PSE, Nequi and Botón Bancolombia, plus the checkout integrity-signature and webhook-validation helpers.

[![npm](https://img.shields.io/npm/v/@codespar/mcp-bold-co)](https://www.npmjs.com/package/@codespar/mcp-bold-co)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Bold's public integrations API is link-first: create a payment link (fixed or open amount), hand the payer `payload.url`, then poll the link until it reports `PAID`. The embedded checkout button flow is secured with a SHA-256 integrity signature and webhooks are HMAC-signed — both covered here as local tools.

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "bold-co": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-bold-co"],
      "env": {
        "BOLD_API_KEY": "your-identity-key",
        "BOLD_SECRET_KEY": "your-secret-key"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add bold-co --env BOLD_API_KEY=your-identity-key -- npx -y @codespar/mcp-bold-co
```

## Tools (7)

| Tool | Description |
|---|---|
| `create_payment_link` | Create a payment link (`POST /online/link/v1`) — cards, PSE, Nequi, Botón Bancolombia |
| `create_pse_payment_link` | Convenience: link restricted to PSE bank debit |
| `create_card_payment_link` | Convenience: link restricted to cards |
| `get_payment_link` | Query a link's status: ACTIVE, PROCESSING, PAID, REJECTED, EXPIRED |
| `list_payment_methods` | Payment methods enabled for this merchant |
| `generate_checkout_signature` | SHA-256 integrity hash for the embedded checkout button (local) |
| `validate_webhook_signature` | Verify the HMAC signature on a Bold webhook (local) |

## Environment

| Variable | Required | Description |
|---|---|---|
| `BOLD_API_KEY` | yes | Identity key (llave de identidad), sent as `Authorization: x-api-key` |
| `BOLD_SECRET_KEY` | no | Secret key — only for the local signature/webhook tools |

Bold has no separate sandbox host; test mode is driven by test keys from the Bold dashboard.

## Docs

- Provider docs: https://developers.bold.co
- Managed tier (one interface across every LATAM provider, governance + audit): https://codespar.dev/agents

## Enterprise

Need governance, budget limits, and audit trails for agent-driven payments on Bold? [CodeSpar Enterprise](https://codespar.dev/enterprise) adds a policy engine, payment routing, and compliance templates on top of these MCP servers.

## License

MIT
