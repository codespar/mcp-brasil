# @codespar/mcp-malga

> MCP server for **Malga** — Brazilian payments orchestration with credit card, Pix, boleto, and voucher

[![npm](https://img.shields.io/npm/v/@codespar/mcp-malga)](https://www.npmjs.com/package/@codespar/mcp-malga)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## What is Malga?

**Malga** is a Brazilian payments orchestration platform. It exposes a single API across multiple acquirers (Cielo, Rede, Stone, Adyen) covering charges (credit card, Pix, boleto, voucher), capture and refund, customers, saved cards and tokenization, merchants (sub-accounts), webhooks, and checkout sessions (1:1 and 1:N payment links).

This MCP server wraps the Malga REST API so AI agents can operate payments end-to-end in sandbox or production.

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "malga": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-malga"],
      "env": {
        "MALGA_CLIENT_ID": "your-client-id",
        "MALGA_API_KEY": "your-api-key",
        "MALGA_SANDBOX": "true"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add malga -- npx @codespar/mcp-malga
```

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "servers": {
    "malga": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-malga"],
      "env": {
        "MALGA_CLIENT_ID": "your-client-id",
        "MALGA_API_KEY": "your-api-key",
        "MALGA_SANDBOX": "true"
      }
    }
  }
}
```

## Tools (24)

### Charges

| Tool | Purpose |
|---|---|
| `create_charge` | Create a charge (credit card, Pix, boleto, or voucher). `capture` defaults to `false` (pre-authorization) |
| `get_charge` | Get charge details by ID |
| `list_charges` | List charges with optional filters and pagination |
| `capture_charge` | Capture a pre-authorized charge |
| `refund_charge` | Refund a charge (full or partial) |

### Customers

| Tool | Purpose |
|---|---|
| `create_customer` | Create a customer for charges and saved cards |
| `get_customer` | Get customer details by ID |
| `list_customers` | List customers with optional pagination |

### Cards / Tokens

| Tool | Purpose |
|---|---|
| `create_card` | Tokenize and save a card for a customer |
| `get_card` | Get card details by ID |
| `list_customer_cards` | List saved cards for a customer |
| `create_token` | Create a card token for one-time use |

### Merchants

| Tool | Purpose |
|---|---|
| `get_merchant` | Get merchant details by ID |
| `list_merchants` | List merchants |

### Webhooks

| Tool | Purpose |
|---|---|
| `create_webhook` | Register a webhook endpoint |
| `list_webhooks` | List registered webhooks |

### Sessions

| Tool | Purpose |
|---|---|
| `create_session` | Create a checkout session for deferred payment |
| `get_session` | Get session details and status |
| `pay_session` | Pay an existing session with a payment method |
| `cancel_session` | Cancel a pending payment session |

### Settings (payment link branding)

| Tool | Purpose |
|---|---|
| `get_settings` | Get payment link branding settings (client or merchant) |
| `create_settings` | Create payment link branding (colors, logo, company URL) |
| `update_settings` | Update payment link branding settings |

### Sandbox

| Tool | Purpose |
|---|---|
| `get_sandbox_guide` | Return sandbox simulation rules (card, CVV, capture/refund) |

## Payment link settings

Customize checkout/payment link appearance via `GET/POST/PATCH /v1/settings`:

- **Scope:** client-wide by default, or per merchant with `merchantId` (`X-Merchant-Id` header).
- **GET:** with `merchantId`, returns merchant config or falls back to client default.
- **POST/PATCH:** exact scope only (no fallback).
- **Branding fields:** `mainColor`, `secondaryColor`, `attentionColor`, `errorColor`, `successColor`, `backgroundColor`, `companyUrl`, `mastercardClickToPayDpaid`, and optional logo.
- **Logo upload:** pass `logoBase64` + `logoFilename` (.png/.jpg, max 1000px).
- **PATCH:** empty strings are ignored; API returns `422` if no effective fields are sent.

Reference: [Malga Settings API](https://docs.malga.io/api-reference/settings/recuperar-configuracao-de-link-de-pagamento)

## Authentication

Malga uses two headers on every request:

- `X-Client-Id` — your Malga client ID
- `X-Api-Key` — your Malga API key

Generate credentials from the Malga dashboard.

## Sandbox / Testing

Defaults to sandbox (`https://sandbox-api.malga.io`). Set `MALGA_SANDBOX=false` for production (`https://api.malga.io`).

### Get your credentials

1. Go to [Malga](https://malga.io)
2. Create a sandbox account
3. Copy your **Client ID** and **API Key** from the dashboard
4. Set `MALGA_CLIENT_ID` and `MALGA_API_KEY`

### Sandbox / Simulation Rules

This server embeds sandbox hints in tool schemas. You can also call `get_sandbox_guide` to retrieve the full rules as JSON.

#### Card number (last digit)

| Last digit | Authorized? | Status |
| --- | --- | --- |
| 0, 1 or 4 | Yes | Approved |
| 2 | No | Not authorized |
| 3 | No | Expired card |
| 5 | No | Blocked card |
| 6 | No | Timeout |
| 7 | No | Canceled card |
| 8 | Random | Approved / Timeout |

Use any test card number from a card generator; the last digit controls the outcome.

#### CVV (tokenization and saved cards)

| CVV last digit | Result |
| --- | --- |
| 0 | Validated |
| Any other | Not validated |

#### Capture and refund failure

Use `amount: 991` (cents) in `capture_charge` or `refund_charge` to simulate failure.

Reference: [Malga testing guide](https://docs.malga.io/documentations/welcome/testing)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MALGA_CLIENT_ID` | Yes | Client ID from Malga dashboard |
| `MALGA_API_KEY` | Yes | API key from Malga dashboard |
| `MALGA_SANDBOX` | No | Defaults to sandbox; set to `"false"` for production |

## Links

- [Malga Website](https://malga.io)
- [Malga API Documentation](https://docs.malga.io)
- [MCP Dev LATAM](https://github.com/codespar/mcp-dev-latam)
- [Landing Page](https://codespar.dev/mcp)

## License

MIT
