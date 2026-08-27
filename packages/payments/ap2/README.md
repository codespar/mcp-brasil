# @codespar/mcp-ap2


> **Alpha release** — published under the `alpha` npm dist-tag. Pin exact versions during `0.x.x-alpha`. Install with `npm install <pkg>@alpha`.

> MCP server for **AP2** — Google's Agent-to-Agent Payment Protocol (authorization, audit, and trust for agentic payments)

[![npm](https://img.shields.io/npm/v/@codespar/mcp-ap2)](https://www.npmjs.com/package/@codespar/mcp-ap2)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> **No live endpoint.** Checked on 2026-08-27. This server's `BASE_URL` (`src/index.ts:62-64`) is `https://ap2.googleapis.com/v1`, which answers HTTP 404 with Google's generic `Error 404 (Not Found)` HTML page instead of an API response. With `AP2_SANDBOX=true` the address becomes `https://sandbox.ap2.googleapis.com/v1`, which fails the TLS handshake, because the certificate served there covers `*.googleapis.com` and not the extra label. As controls on the same run, `storage.googleapis.com` and `translate.googleapis.com` each answered a structured JSON API error. AP2 is a published specification and this package ships tool definitions written for it; we have not checked them against a conforming implementation, and no call made through this server currently reaches a service.

## What is AP2?

AP2 (Agent-to-Agent Payment Protocol) is Google's open framework for **authorization, audit, and trust** in agentic payments. It answers the critical questions: *Who authorized this payment? What limits apply? What's the full audit trail?*

The specification is published at [ap2-protocol.org](https://ap2-protocol.org).

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ap2": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-ap2"],
      "env": {
        "AP2_API_KEY": "your-key",
        "AP2_AGENT_ID": "your-agent-id"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add ap2 -- npx @codespar/mcp-ap2
```

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "servers": {
    "ap2": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-ap2"],
      "env": {
        "AP2_API_KEY": "your-key",
        "AP2_AGENT_ID": "your-agent-id"
      }
    }
  }
}
```

## Tools (22)

| Tool | Purpose |
|---|---|
| `register_agent` | Register an AI agent as a trusted payer in the AP2 network. |
| `get_agent` | Get agent registration details, trust status, and current spend usage |
| `list_agents` | List registered agents with optional filters |
| `revoke_agent` | Revoke an agent's payment authorization. |
| `authorize_payment` | Request payment authorization with scoped limits. |
| `get_authorization` | Get authorization details including status, limits, and expiry |
| `list_authorizations` | List payment authorizations with optional filters |
| `execute_payment` | Execute an authorized payment. |
| `get_audit_trail` | Get the complete audit trail for a transaction — every authorization, approval, execution, and settlement e... |
| `list_audit_events` | List audit events across all transactions with filters |
| `list_payment_methods` | List payment methods offered by the AP2 partner network |
| `get_transaction` | Get full transaction details including authorization, execution, and settlement status |
| `list_transactions` | List transactions with optional filters |
| `create_intent_mandate` | Create an AP2 intent mandate — a Verifiable Credential expressing the user's intent to delegate a transacti... |
| `create_cart_mandate` | Create an AP2 cart mandate — a signed, locked-cart commitment from a merchant binding line items, totals, a... |
| `create_payment_mandate` | Create an AP2 payment mandate — the final Verifiable Credential authorizing settlement against a cart mandate. |
| `verify_credential` | Verify a Verifiable Credential (intent, cart, or payment mandate). |
| `create_presentation` | Create a Verifiable Presentation bundling one or more credentials (e.g. |
| `verify_presentation` | Verify a Verifiable Presentation and all embedded credentials, including holder binding and challenge nonce. |
| `resolve_did` | Resolve a Decentralized Identifier (DID) to its DID document via the AP2 universal resolver. |
| `create_receipt` | Create a signed receipt for a settled payment — a tamper-evident record linking transaction, mandates, and... |
| `verify_receipt` | Verify a receipt's signature, issuer, and chain back to the originating mandates. |

## Authentication

The server sends `AP2_API_KEY` as an `Authorization: Bearer` header and `AP2_AGENT_ID` as an `X-Agent-Id` header on every request (`src/index.ts:69-73`).

There is no portal issuing those credentials. The developer portal this README used to link, `developers.google.com/ap2`, answers HTTP 404, as does the `ap2-spec` repository it pointed at. The published specification is at [ap2-protocol.org](https://ap2-protocol.org).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AP2_API_KEY` | Yes | Sent as `Authorization: Bearer` |
| `AP2_AGENT_ID` | Yes | Sent as the `X-Agent-Id` header |
| `AP2_SANDBOX` | No | `true` switches `BASE_URL` to `https://sandbox.ap2.googleapis.com/v1`, which fails TLS |

## Use Cases

- **Authorized agent purchases** — Agent requests spend authorization, gets approval with limits, then executes payment
- **Multi-agent commerce** — Agent A authorizes Agent B to make payments on its behalf with scoped limits
- **Compliance & audit** — Full audit trail of every authorization, approval, execution, and settlement
- **Cross-rail payments** — AP2 bridges card payments, bank transfers, wallets, and x402 micropayments

## Roadmap

### v0.2 (planned)
- `create_policy` — Define reusable authorization policies
- `delegate_authority` — Allow agent-to-agent authorization delegation
- `get_spend_report` — Get spend analytics and reports
- OAuth 2.0 authentication flow

### v0.3 (planned)
- Webhook support for real-time authorization events
- Multi-currency support with automatic FX
- Integration with x402 as payment method

Want to contribute? [Open a PR](https://github.com/codespar/mcp-dev-latam) or [request a tool](https://github.com/codespar/mcp-dev-latam/issues).

## Links

- [AP2 specification](https://ap2-protocol.org)
- [MCP Dev LATAM](https://github.com/codespar/mcp-dev-latam)
- [Landing Page](https://codespar.dev/mcp)

## Enterprise

Need governance, budget limits, and audit trails for agent payments? [CodeSpar Enterprise](https://codespar.dev/enterprise) adds policy engine, payment routing, and compliance templates on top of these MCP servers.

## License

MIT
