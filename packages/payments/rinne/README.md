# @codespar/mcp-rinne

> MCP server for **Rinne** — Brazilian card acquiring, PIX, banking, and payment infrastructure, covering the full API surface

[![npm](https://img.shields.io/npm/v/@codespar/mcp-rinne)](https://www.npmjs.com/package/@codespar/mcp-rinne)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## What is Rinne?

**Rinne** is a Brazilian payment infrastructure API. It runs a B2B2B model: your **Organization** manages any number of **Merchants**, each merchant onboards via KYC and connects to a payment provider (Rinne itself, Cappta, Celcoin, ...) through an **Affiliation**, and everything downstream flows through that affiliation — card and PIX transactions, cards-on-file, 3D Secure, cashouts/payouts, ledger, and pricing.

This MCP server wraps the entire Rinne REST API — not just card acquiring — so AI agents can manage merchants, run transactions, move money, and administer access in sandbox or production.

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "rinne": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-rinne"],
      "env": {
        "RINNE_API_KEY": "your-api-key",
        "RINNE_SANDBOX": "true"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add rinne -- npx @codespar/mcp-rinne
```

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "servers": {
    "rinne": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-rinne"],
      "env": {
        "RINNE_API_KEY": "your-api-key",
        "RINNE_SANDBOX": "true"
      }
    }
  }
}
```

## Tools (62)

### Company

| Tool | Purpose |
|---|---|
| `get_company` | Get the authenticated company (org or merchant, depending on key scope) |
| `update_company` | Update the authenticated company |

### Merchants

| Tool | Purpose |
|---|---|
| `create_merchant` | Create a merchant under your organization (KYC) |
| `list_merchants` | List merchants |
| `get_merchant` | Get merchant details by ID |
| `update_merchant` | Update a merchant |

### Affiliations

| Tool | Purpose |
|---|---|
| `create_affiliation` | Create a merchant account with a payment provider (Rinne, Cappta, Celcoin, ...) |
| `register_affiliation` | Register a gateway-mode affiliation using existing provider credentials |
| `list_affiliations` | List affiliations, org-wide or for one merchant |
| `get_affiliation` | Get a specific affiliation |

### Cards on file

| Tool | Purpose |
|---|---|
| `store_card` | Save a card for reuse in future transactions |
| `list_cards` | List stored cards |
| `get_card` | Get a stored card by ID |
| `delete_card` | Delete a stored card |

### 3D Secure

| Tool | Purpose |
|---|---|
| `create_3ds_session` | Create a 3DS authentication session ahead of a transaction |

### Transactions

| Tool | Purpose |
|---|---|
| `create_transaction` | Create a card (raw, stored, or Apple Pay/Google Pay) or PIX transaction |
| `authenticate_transaction` | Complete 3DS for a transaction awaiting authentication |
| `get_transaction` | Get transaction details and status, including refunds |
| `list_transactions` | List transactions, org-wide or for one merchant |
| `cancel_transaction` | Cancel a pending transaction (e.g. unpaid bolepix) |
| `refund_transaction` | Refund a transaction, fully or partially |
| `cancel_refund` | Cancel a refund that hasn't settled yet |
| `get_transaction_receipt` | Get a transaction's receipt (base64 PDF) |
| `simulate_pay_transaction` | **Sandbox only** — mark a transaction as paid |

### PIX (collection keys)

| Tool | Purpose |
|---|---|
| `create_pix_collection_key` | Create a PIX key the merchant uses to *receive* payments |
| `list_pix_collection_keys` | List the merchant's PIX collection keys |

### Ledger

| Tool | Purpose |
|---|---|
| `list_ledger_entries` | List ledger entries for the authenticated company |
| `get_ledger_entry` | Get a single ledger entry |

### Banking

| Tool | Purpose |
|---|---|
| `create_bank_account` | Register an external bank account (payout destination) |
| `update_bank_account` | Set a bank account as primary |
| `register_cashout_pix_key` | Register an external PIX key as a *payout* destination |
| `get_balance` | Get the current balance |
| `topup_balance` | **Sandbox only** — simulate funding the balance |
| `get_statement` | Get a merchant's balance statement for a date range |
| `create_internal_transfer` | Transfer funds between your org's own bank accounts |
| `list_judicial_blockages` | List court-ordered account freezes affecting balances |

### Cashouts

| Tool | Purpose |
|---|---|
| `create_cashout` | Create a payout to a bank account or PIX key |
| `list_cashouts` | List cashouts |
| `get_cashout` | Get a single cashout |
| `get_cashout_receipt` | Get a cashout's receipt |

### Pricing

| Tool | Purpose |
|---|---|
| `list_fee_policies` | List fee policies (what you charge merchants) |
| `create_fee_policy` | Create a fee policy |
| `replace_fee_policy` | Replace a fee policy in full |
| `update_fee_policy` | Partially update a fee policy |
| `list_cost_policies` | List cost policies (what providers charge you) |
| `list_mccs` | List Merchant Category Codes |

### Webhooks

| Tool | Purpose |
|---|---|
| `get_webhook_dashboard_url` | Get the URL to configure webhook endpoints/events |

### System

| Tool | Purpose |
|---|---|
| `get_health` | Check API health status |

### Access management — JWT required

| Tool | Purpose |
|---|---|
| `create_api_key` | Create an API key (shown once) |
| `list_api_keys` | List API keys (prefix + last 4 only) |
| `revoke_api_key` | Revoke an API key |
| `create_role` | Create a custom role |
| `list_roles` | List roles |
| `list_permissions` | List all available permissions |
| `get_current_session` | Whoami for the JWT session |

### Users

| Tool | Purpose |
|---|---|
| `create_user` | Create a user (merchant scope: x-api-key; org scope: JWT) |
| `list_users` | List users |
| `update_user` | Update a user's name/roles — **JWT, org only** |
| `suspend_user` | Suspend a user — **JWT, org only** |
| `activate_user` | Reactivate a user — **JWT, org only** |

### Zipcode — JWT required

| Tool | Purpose |
|---|---|
| `lookup_zipcode` | Look up a Brazilian address by CEP |

### Sandbox

| Tool | Purpose |
|---|---|
| `get_sandbox_guide` | Return test cards, the amount-based decline rule, and which tools need JWT |

## Card data is never sent in the clear

Rinne does not accept a raw card number or CVV over this API. Every `number`/`cvv` field (and, for Apple Pay/Google Pay, `network_token`/`cryptogram`) must already be an encrypted token (`"ev:..."`) produced by the **rinne-js Card/Wallet Element** running in a browser — a raw PAN/CVV is rejected with `400 VALIDATION_ERROR`, and there is no server-side encryption path.

In practice, this server is the second half of a checkout: run a rinne-js flow (see [rinne-js docs](https://docs.rinne.com.br/rinne-js)) to collect and encrypt the card client-side, then hand the resulting token to `store_card` or `create_transaction` here to finish the operation. Alternatively, use `card_id` on `create_transaction` to charge a card already saved via `store_card`.

## Organization vs. merchant scope

Every resource that operates on transactions, cards, 3DS sessions, affiliations, or banking accepts an optional `merchant_id`:

- **Omitted** — acts at the organization/self level.
- **Provided** — acts on that specific merchant (`/v1/merchants/{merchant_id}/...`), for an organization managing multiple merchants.

`refund_transaction`, `get_statement`, and `create_pix_collection_key`/`list_pix_collection_keys` always require `merchant_id` — they only exist at the merchant level.

## Two PIX key resources — don't confuse them

Rinne has two distinct PIX-key resources with similarly-named endpoints:

- **`create_pix_collection_key`** (`/v1/merchants/{id}/pix/keys`) — a key the merchant uses to *receive* PIX payments, tied to a provider affiliation (`provider`, `key_type`).
- **`register_cashout_pix_key`** (`/v1/merchants/{id}/pix-keys` or `/v1/companies/me/pix-keys`) — an *external* key registered as a *payout* destination for cashouts (`key`, `primary`).

## Authentication

Most of the API uses `x-api-key`, but Rinne's access-management surface deliberately rejects it — a leaked API key must not be able to create other keys, roles, or users. Those tools need a JWT session instead:

| Auth | Used by |
|---|---|
| `x-api-key` (`RINNE_API_KEY`) | Everything else — merchants, affiliations, cards, 3DS, transactions, PIX, banking, cashouts, pricing, webhooks, merchant-scoped users |
| JWT (`RINNE_EMAIL` + `RINNE_PASSWORD`) | `create_api_key`, `list_api_keys`, `revoke_api_key`, `create_role`, `list_roles`, `list_permissions`, `get_current_session`, `lookup_zipcode`, and org-scoped `create_user`/`list_users`/`update_user`/`suspend_user`/`activate_user` |

This server logs in lazily on the first JWT-gated tool call and caches the token, re-logging-in once on a `401`. If `RINNE_COMPANY_ID` is set, it selects that company right after login (for accounts with access to multiple companies). If `RINNE_EMAIL`/`RINNE_PASSWORD` aren't set, JWT-gated tools return a clear error instead of failing silently — the rest of the server works fine without them.

## Sandbox / Testing

Defaults to sandbox (`https://api-sandbox.rinne.com.br/core`). Set `RINNE_SANDBOX=false` for production (`https://api.rinne.com.br/core`).

### Sandbox simulation rules

Call `get_sandbox_guide` for the full JSON, or see below:

#### Test cards

| Card number | Brand | 3DS |
|---|---|---|
| `5155901222280001` | Mastercard | No |
| `4012001037141112` | Visa | No |
| `4242424242424242` | Visa | Challenge |

#### Outcome by amount

The **last two digits of the amount (in cents)** determine the result — not the card number:

| Last 2 digits | Result |
|---|---|
| `00` | Approved |
| `51` | Refused — insufficient funds |
| `05` | Refused — do not honor |
| `54` | Refused — expired card |

Example: `amount: 1051` → `REFUSED` with code `51`.

#### PIX

Use `simulate_pay_transaction` (sandbox only) to mark a `WAITING_PAYMENT` PIX transaction as paid.

Reference: [Rinne testing guide](https://docs.rinne.com.br/guides/testing)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `RINNE_API_KEY` | Yes | API key, sent as `x-api-key` |
| `RINNE_SANDBOX` | No | Defaults to sandbox; set to `"false"` for production |
| `RINNE_EMAIL` | No | Login identifier for JWT-gated tools |
| `RINNE_PASSWORD` | No | Login password, paired with `RINNE_EMAIL` |
| `RINNE_COMPANY_ID` | No | Company to select after login, for multi-company accounts |

## Links

- [Rinne Documentation](https://docs.rinne.com.br)
- [rinne-js SDK](https://docs.rinne.com.br/rinne-js)
- [MCP Dev LATAM](https://github.com/codespar/mcp-dev-latam)
- [Landing Page](https://codespar.dev/mcp)

## Enterprise

Need governance, budget limits, and audit trails for agent payments? [CodeSpar Enterprise](https://codespar.dev/enterprise) adds policy engine, payment routing, and compliance templates on top of these MCP servers.

## License

MIT
