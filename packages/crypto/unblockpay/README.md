# @codespar/mcp-unblockpay

> MCP server for **UnblockPay** — fiat ↔ stablecoin cross-border via Customer → Wallet → Quote → Payin/Payout

[![npm](https://img.shields.io/npm/v/@codespar/mcp-unblockpay)](https://www.npmjs.com/package/@codespar/mcp-unblockpay)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "unblockpay": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-unblockpay"],
      "env": {
        "UNBLOCKPAY_API_KEY": "your-key"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add unblockpay -- npx @codespar/mcp-unblockpay
```

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "servers": {
    "unblockpay": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-unblockpay"],
      "env": {
        "UNBLOCKPAY_API_KEY": "your-key"
      }
    }
  }
}
```

## Tools (13)

| Tool | Purpose |
|---|---|
| `create_customer` | Create an individual or business customer (KYC mother). Business customers require `date_of_incorporation`. |
| `list_customers` | List customers under the operator's API key (`limit` mandatory by the v1 pagination contract). |
| `verify_customer` | Trigger the KYC verification check. Idempotent (returns 422 `customer_cannot_be_verified` when already approved). |
| `get_verification_details` | Poll KYC state — returns `customer_status: pending \| approved \| rejected \| partially_rejected`. |
| `create_wallet` | Create a stablecoin wallet under an APPROVED customer. |
| `list_wallets` | List wallets under the operator's API key. |
| `create_external_account` | Register a fiat receiver account (BRL Pix, USD wire, EUR SEPA, MXN SPEI). Skippable for BRL Pix payouts via the `pix_key + document` shortcut on `create_payout`. |
| `list_external_accounts` | List external accounts under the operator's API key. |
| `create_quote` | Lock an FX + fee quote for 5 minutes. Pass `amount` on EITHER `sender` or `receiver`, not both. |
| `create_payin` | Fiat → stablecoin pay-in referencing a `quote_id`. Returns deposit instructions (`<Pix Copy & Paste EMV>` for BR). |
| `create_payout` | Stablecoin → fiat payout referencing a `quote_id`. `customer_id` is REQUIRED at the top level. |
| `get_transaction` | Poll transaction status. Lifecycle: `awaiting_deposit → processing → completed` (or `failed / refunded / cancelled / error`). |
| `cancel_transaction` | Cancel a transaction. Only valid while status is `awaiting_deposit`. |

## Authentication

UnblockPay uses an API key passed verbatim in the `Authorization` header (no `Bearer` prefix). The server sets that header for you — you just provide the key via `UNBLOCKPAY_API_KEY`.

## Sandbox / Testing

UnblockPay provides a separate sandbox environment for testing. Point the server at it by setting `UNBLOCKPAY_BASE_URL=https://api.sandbox.unblockpay.com/v1` and using a sandbox-issued API key.

### Get your credentials

1. Sign in at [app.unblockpay.com](https://app.unblockpay.com) (or follow the [docs](https://docs.unblockpay.com))
2. Generate an API key in the dashboard
3. Set the `UNBLOCKPAY_API_KEY` environment variable
4. (Sandbox only) Also set `UNBLOCKPAY_BASE_URL=https://api.sandbox.unblockpay.com/v1`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `UNBLOCKPAY_API_KEY` | Yes | API key from the UnblockPay dashboard |
| `UNBLOCKPAY_BASE_URL` | No | Defaults to `https://api.unblockpay.com/v1`. Set to `https://api.sandbox.unblockpay.com/v1` for sandbox. |

## Links

- [UnblockPay Website](https://unblockpay.com)
- [UnblockPay API Documentation](https://docs.unblockpay.com)
- [MCP Dev LatAm](https://github.com/codespar/mcp-dev-latam)
- [Landing Page](https://codespar.dev/mcp)

## Enterprise

Need governance, budget limits, and audit trails for agent payments? [CodeSpar Enterprise](https://codespar.dev/enterprise) adds policy engine, payment routing, and compliance templates on top of these MCP servers.

## License

MIT
