# @codespar/mcp-kushki

> MCP server for **Kushki** — the omnichannel PSP spanning Mexico, Colombia, Chile, Peru and Ecuador: card tokenization + one-step/two-step charges, bank transfer-in (PSE / SPEI), cash networks and subscriptions, all on one REST API.

[![npm](https://img.shields.io/npm/v/@codespar/mcp-kushki)](https://www.npmjs.com/package/@codespar/mcp-kushki)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "kushki": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-kushki"],
      "env": {
        "KUSHKI_PUBLIC_MERCHANT_ID": "your-public-merchant-id",
        "KUSHKI_PRIVATE_MERCHANT_ID": "your-private-merchant-id",
        "KUSHKI_ENV": "sandbox"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add kushki --env KUSHKI_PUBLIC_MERCHANT_ID=... --env KUSHKI_PRIVATE_MERCHANT_ID=... -- npx -y @codespar/mcp-kushki
```

### Cursor / VS Code

Add the same block to `.cursor/mcp.json` or `.vscode/mcp.json`.

## Tools (10)

| Tool | Endpoint | What it does |
|---|---|---|
| `tokenize_card` | `POST /card/v1/tokens` | Raw card → single-use token (public id) |
| `create_charge` | `POST /card/v1/charges` | One-step card charge |
| `create_preauthorization` | `POST /card/v1/preAuthorization` | Hold funds (two-step, step 1) |
| `capture_preauthorization` | `POST /card/v1/capture` | Capture a preauth (step 2, partial OK) |
| `void_charge` | `DELETE /card/v1/charges/{ticket}` | Void (same-day) or refund (settled) |
| `create_transfer_token` | `POST /transfer/v1/tokens` | Token for PSE (CO) / SPEI (MX) transfer-in |
| `create_transfer_charge` | `POST /transfer/v1/init` | Start the bank transfer; returns redirect URL |
| `create_cash_charge` | `POST /cash/v1/charges` | Cash voucher for OXXO-style networks |
| `create_subscription` | `POST /card/v1/subscriptions` | Recurring card charge on a periodicity |
| `cancel_subscription` | `DELETE /card/v1/subscriptions/{id}` | Stop future charges |

## Authentication

Two merchant ids with distinct powers:

| Variable | Required | Description |
|---|---|---|
| `KUSHKI_PUBLIC_MERCHANT_ID` | yes | Tokenization only — safe for client-side use |
| `KUSHKI_PRIVATE_MERCHANT_ID` | yes | Money movement — server-side only |
| `KUSHKI_ENV` | no | `sandbox` (api-uat, default) or `production` |

Amounts use Kushki's per-country tax shape: `{ subtotalIva, subtotalIva0, iva, currency }` — currencies MXN, COP, CLP, PEN, USD.

## Example

> "Tokenize this test card and charge COP 85,000 with 19% IVA."

The agent calls `tokenize_card`, then `create_charge` with `{ subtotalIva: 85000, subtotalIva0: 0, iva: 16150, currency: "COP" }`.

## Enterprise

Need governance, budget limits, and audit trails for agent payments? [CodeSpar Enterprise](https://codespar.dev/enterprise) adds policy engine, payment routing, and compliance templates on top of these MCP servers.

## Managed tier

This open-source server calls Kushki's API directly with your credentials. CodeSpar's managed tier routes one interface across every LATAM provider with automatic failover, governance, audit and a credential vault: [codespar.dev/agents](https://codespar.dev/agents).

## License

MIT
