# @codespar/mcp-payway

> MCP server for **Payway** (ex-Prisma Medios de Pago / Decidir) — Argentina's dominant card-acquiring gateway: card tokenization, one-step and two-step charges, installments (cuotas), marketplace split and refunds.

[![npm](https://img.shields.io/npm/v/@codespar/mcp-payway)](https://www.npmjs.com/package/@codespar/mcp-payway)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "payway": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-payway"],
      "env": {
        "PAYWAY_PUBLIC_API_KEY": "your-public-apikey",
        "PAYWAY_PRIVATE_API_KEY": "your-private-apikey",
        "PAYWAY_ENV": "sandbox"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add payway -- npx @codespar/mcp-payway
```

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "servers": {
    "payway": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-payway"],
      "env": {
        "PAYWAY_PUBLIC_API_KEY": "your-public-apikey",
        "PAYWAY_PRIVATE_API_KEY": "your-private-apikey",
        "PAYWAY_ENV": "sandbox"
      }
    }
  }
}
```

## Authentication

Payway authenticates with a single raw header named `apikey` (**not** `Authorization: Bearer`). Two co-equal keys exist with different powers — see the table below.

## The two-key model

Payway issues two co-equal API keys with different powers:

| Key | Header | May call |
|---|---|---|
| **Public** | `apikey` | `POST /tokens` (card tokenization only) |
| **Private** | `apikey` | Everything else: payments, captures, refunds, queries |

The auth header is a single raw header named `apikey` — **not** `Authorization: Bearer`.

## Tools (6)

| Tool | Endpoint | What it does |
|---|---|---|
| `create_token` | `POST /tokens` | Tokenize card data into a single-use payment token (public key) |
| `create_payment` | `POST /payments` | Charge a token — single sale or distributed/split, with installments |
| `get_payment` | `GET /payments/{id}` | Fetch a payment by id |
| `list_payments` | `GET /payments` | List payments (offset, pageSize, siteOperationId, merchantId) |
| `refund_payment` | `POST /payments/{id}/refunds` | Full refund (empty body) or partial (`amount` in minor units) |
| `confirm_payment` | `PUT /payments/{id}` | Capture a previously authorized payment (two-step flow) |

## Environment

| Variable | Required | Description |
|---|---|---|
| `PAYWAY_PUBLIC_API_KEY` | yes | Public apikey (tokenization) |
| `PAYWAY_PRIVATE_API_KEY` | yes | Private apikey (payments, refunds, queries) |
| `PAYWAY_ENV` | no | `sandbox` (default, Decidir sandbox host) or `production` |

Base URLs: production `https://ventasonline.payway.com.ar/api/v2`, sandbox `https://developers.decidir.com/api/v2`.

## Notes

- Amounts are integers in **minor units**: `50000` = ARS 500.00.
- `payment_method_id` identifies the card brand (1 = Visa, 31 = Mastercard, 15 = Maestro, …).
- `site_transaction_id` is the merchant-side idempotency anchor — unique per sale.
- This server never invents card data; agents must collect PAN/expiry/CVV from the user or a vault.

## Enterprise

Need governance, budget limits, and audit trails for agent-driven payments on Payway? [CodeSpar Enterprise](https://codespar.dev/enterprise) adds a policy engine, payment routing, and compliance templates on top of these MCP servers.

## License

MIT © CodeSpar
