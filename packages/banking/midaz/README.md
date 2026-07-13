# @codespar/mcp-midaz

> MCP server for **Midaz** by [Lerian](https://lerian.studio) — the open-source, multi-currency, multi-asset double-entry ledger. Your agent creates accounts, reads balances, and posts balanced transactions against **your own Midaz deployment**.

[![npm](https://img.shields.io/npm/v/@codespar/mcp-midaz)](https://www.npmjs.com/package/@codespar/mcp-midaz)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Self-hosted model

Midaz is **not a SaaS** — it runs in your infrastructure ([github.com/LerianStudio/midaz](https://github.com/LerianStudio/midaz)). This server points at your deployment:

- `MIDAZ_BASE_URL` → your onboarding service (organizations / ledgers / accounts)
- `MIDAZ_TRANSACTION_URL` → your transaction service (defaults to `MIDAZ_BASE_URL` when both sit behind one gateway)
- `MIDAZ_API_KEY` → only if your deployment enforces auth

Midaz hierarchy: **Organization → Ledger → Account → Transaction**. Tools take `organization_id` + `ledger_id` explicitly, so one connection can operate across ledgers.

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "midaz": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-midaz"],
      "env": {
        "MIDAZ_BASE_URL": "https://midaz.your-company.internal",
        "MIDAZ_API_KEY": "your-token-if-any"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add midaz -- npx @codespar/mcp-midaz
```

## Tools (5)

| Tool | What it does |
|---|---|
| `create_account` | Create an account in a ledger (`POST .../accounts`) |
| `list_accounts` | List a ledger's accounts, paginated |
| `get_balance` | Read available / on-hold balances per asset |
| `create_transaction` | Post a balanced double-entry transaction (`POST .../transactions/json`) |
| `get_transaction` | Fetch a transaction with its operations |

## Example

> "Move R$ 1.250,00 from the treasury account to @vendor-acme and show both balances."

The agent calls `create_transaction` with a `send` block debiting `treasury` and crediting `@vendor-acme` (amounts must balance — Midaz rejects lopsided entries), then `get_balance` on each account.

## Authentication

Your deployment decides: when `MIDAZ_API_KEY` is set it is sent as a Bearer token; otherwise requests are unauthenticated (typical for network-isolated internal deployments).

## Enterprise

Need governance, budget limits, and audit trails for agent-driven ledger operations on Midaz? [CodeSpar Enterprise](https://codespar.dev/enterprise) adds a policy engine, payment routing, and compliance templates on top of these MCP servers.

## License

MIT (this server). Midaz itself is Apache-2.0 by Lerian.
