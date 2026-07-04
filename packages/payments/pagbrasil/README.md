# @codespar/mcp-pagbrasil

> MCP server for **PagBrasil** — the cross-border acquirer for international merchants selling into Brazil: Pix, Automatic Pix (PagStream), Boleto Flash, PEC Flash and local credit cards with installments. Distinct from PagBank/PagSeguro.

[![npm](https://img.shields.io/npm/v/@codespar/mcp-pagbrasil)](https://www.npmjs.com/package/@codespar/mcp-pagbrasil)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "pagbrasil": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-pagbrasil"],
      "env": {
        "PAGBRASIL_PBTOKEN": "your-merchant-token",
        "PAGBRASIL_SECRET": "your-secret-phrase"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add pagbrasil -- npx @codespar/mcp-pagbrasil
```

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "servers": {
    "pagbrasil": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-pagbrasil"],
      "env": {
        "PAGBRASIL_PBTOKEN": "your-merchant-token",
        "PAGBRASIL_SECRET": "your-secret-phrase"
      }
    }
  }
}
```

## Authentication

Every request carries the merchant token (`pbtoken`) and the secret phrase as **body fields** — there is no auth header. This server injects both from `PAGBRASIL_PBTOKEN` and `PAGBRASIL_SECRET`.

## API shape (worth knowing)

PagBrasil's API is **form-urlencoded** (not JSON) and answers **XML**. The merchant token (`pbtoken`) and secret phrase travel as body fields on every request — this server injects both from the environment. Tool responses hand the raw XML to the agent under `xml` so no fields are lost.

## Tools (3)

| Tool | Endpoint | What it does |
|---|---|---|
| `create_order` | `POST /order/add` | Create an order / request a payment (pix, boleto, creditcard). Pix responses carry `pix_code` + `pix_image`; boleto responses carry the bar code + PDF URL |
| `get_order` | `POST /order/get` | Fetch an order's current status — poll to detect settlement |
| `refund_order` | `POST /order/refund` | Refund a settled order (`amount_brl` for partial, omit for full) |

## Environment

| Variable | Required | Description |
|---|---|---|
| `PAGBRASIL_PBTOKEN` | yes | Merchant token from the PagBrasil Dashboard |
| `PAGBRASIL_SECRET` | yes | Secret phrase from the Dashboard |
| `PAGBRASIL_BASE_URL` | no | Defaults to `https://sandbox.pagbrasil.com/api`. Production hosts are issued per-merchant after the Payment Service Agreement — set the URL your dashboard provides |

## Notes

- `amount_brl` is in **major units** as a string: `'125.00'` = R$ 125,00.
- `order_number` must be unique per `customer_taxid`. Same number + same taxid = idempotent no-op; same number + different taxid = rejected (`Duplicated order`).
- `customer_taxid` must be a valid CPF or CNPJ — agents should ask the user, never invent one.

## Enterprise

Need governance, budget limits, and audit trails for agent-driven payments on PagBrasil? [CodeSpar Enterprise](https://codespar.dev/enterprise) adds a policy engine, payment routing, and compliance templates on top of these MCP servers.

## License

MIT © CodeSpar
