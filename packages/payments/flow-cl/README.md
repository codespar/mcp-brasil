# @codespar/mcp-flow-cl

> MCP server for **Flow** (flow.cl) — the Chile-native PSP: one hosted payment order covers Webpay (credit/debit), ETpay bank transfer, cash networks and international cards. Refunds included. Every API call is HMAC-SHA256 signed.

[![npm](https://img.shields.io/npm/v/@codespar/mcp-flow-cl)](https://www.npmjs.com/package/@codespar/mcp-flow-cl)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "flow-cl": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-flow-cl"],
      "env": {
        "FLOW_API_KEY": "your-flow-api-key",
        "FLOW_SECRET_KEY": "your-flow-secret-key",
        "FLOW_ENV": "sandbox"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add flow-cl --env FLOW_API_KEY=... --env FLOW_SECRET_KEY=... -- npx -y @codespar/mcp-flow-cl
```

### Cursor / VS Code

Add the same block to `.cursor/mcp.json` or `.vscode/mcp.json`.

## Tools (8)

| Tool | Endpoint | What it does |
|---|---|---|
| `create_payment` | `POST /payment/create` | Hosted payment order; returns `url + token` the customer pays at |
| `create_payment_by_email` | `POST /payment/createEmail` | Flow emails the customer a collection link |
| `get_payment_status` | `GET /payment/getStatus` | Status by Flow token (1 pending, 2 paid, 3 rejected, 4 canceled) |
| `get_payment_status_by_commerce_id` | `GET /payment/getStatusByCommerceId` | Status by your `commerceOrder` |
| `get_payment_status_by_flow_order` | `GET /payment/getStatusByFlowOrder` | Status by Flow order number |
| `list_payments` | `GET /payment/getPayments` | Payments received on a date (paged) |
| `create_refund` | `POST /refund/create` | Full or partial refund order |
| `get_refund_status` | `GET /refund/getStatus` | Refund status by refund token |

## Authentication

Flow signs every request: parameters are sorted alphabetically, concatenated as `name+value`, and signed with HMAC-SHA256 using your `secretKey`. This server does the signing for you — set the two env vars and call tools with plain arguments.

| Variable | Required | Description |
|---|---|---|
| `FLOW_API_KEY` | yes | Flow merchant API key |
| `FLOW_SECRET_KEY` | yes | HMAC signing secret (never sent on the wire) |
| `FLOW_ENV` | no | `sandbox` (default) or `production` |

Sandbox: register at [sandbox.flow.cl](https://sandbox.flow.cl) — the sandbox issues its own key pair.

## Example

> "Create a Flow payment order for CLP 25,000, subject 'Plan Pro mensual', email cliente@ejemplo.cl, and give me the payment link."

The agent calls `create_payment` and returns `url?token=...` — the customer picks Webpay, ETpay or cash at Flow's hosted page.

## Enterprise

Need governance, budget limits, and audit trails for agent payments? [CodeSpar Enterprise](https://codespar.dev/enterprise) adds policy engine, payment routing, and compliance templates on top of these MCP servers.

## Managed tier

This open-source server calls Flow's API directly with your credentials. CodeSpar's managed tier routes one interface across every LATAM provider with automatic failover, governance, audit and a credential vault: [codespar.dev/agents](https://codespar.dev/agents).

## License

MIT
