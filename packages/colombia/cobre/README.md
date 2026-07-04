# @codespar/mcp-cobre

> MCP server for **Cobre** — Colombian/Mexican B2B treasury and payouts platform: balance visibility, counterparty registration, and outbound money movements over Colombia's instant rails and Mexico's SPEI.

[![npm](https://img.shields.io/npm/v/@codespar/mcp-cobre)](https://www.npmjs.com/package/@codespar/mcp-cobre)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Auth is OAuth2 client credentials (`POST /v1/auth`); the server caches the access token and refreshes before expiry.

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "cobre": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-cobre"],
      "env": {
        "COBRE_USER_ID": "your-user-id",
        "COBRE_SECRET": "your-secret"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add cobre --env COBRE_USER_ID=uid --env COBRE_SECRET=sk -- npx -y @codespar/mcp-cobre
```

## Tools (8)

| Tool | Description |
|---|---|
| `list_balances` | Balances across every visible account |
| `get_balance` | One balance by id |
| `create_counterparty` | Register a payout beneficiary (CO bank account or MX CLABE) |
| `list_counterparties` | List registered counterparties |
| `get_counterparty` | One counterparty by id |
| `create_money_movement` | Create an outbound payout (instant rails / SPEI) |
| `get_money_movement` | Movement status by id |
| `list_money_movements` | List movements |

## Environment

| Variable | Required | Description |
|---|---|---|
| `COBRE_USER_ID` | yes | API credential user id |
| `COBRE_SECRET` | yes | API credential secret |
| `COBRE_BASE_URL` | no | Override the API host (default `https://api.cobre.co`) |

## Docs

- Provider docs: https://docs.cobre.co
- Managed tier (one interface across every LATAM provider, governance + audit): https://codespar.dev/agents

## Enterprise

Need governance, budget limits, and audit trails for agent-driven payments on Cobre? [CodeSpar Enterprise](https://codespar.dev/enterprise) adds a policy engine, payment routing, and compliance templates on top of these MCP servers.

## License

MIT
