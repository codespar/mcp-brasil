# @codespar/mcp-clip

> MCP server for **Clip (PayClip)** — Mexico's leading native acquirer. Hosted payment links, transparent card-token charges, queries and refunds, in MXN.

[![npm](https://img.shields.io/npm/v/@codespar/mcp-clip)](https://www.npmjs.com/package/@codespar/mcp-clip)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "clip": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-clip"],
      "env": {
        "CLIP_AUTH_TOKEN": "your-basic-token"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add clip -- npx @codespar/mcp-clip
```

## Environment

| Variable | Required | Description |
|---|---|---|
| `CLIP_AUTH_TOKEN` | yes | Basic auth token from the Clip developer dashboard (sent as `Authorization: Basic <token>`) |
| `CLIP_BASE_URL` | no | API base override (default `https://api.payclip.com`) |

Test mode: Clip distinguishes environments by the token itself — test tokens hit the sandbox processing path; there is no separate URL.

## Tools (6)

| Tool | What it does |
|---|---|
| `create_payment_link` | Hosted checkout link (`POST /v2/checkout`) — the no-PCI path |
| `get_payment_link` | Checkout status by id |
| `create_payment` | Transparent charge with a client-side card token (`POST /payments`) |
| `get_payment` | Payment detail |
| `list_payments` | List payments, paginated |
| `refund_payment` | Full or partial refund (`POST /payments/{id}/refund`) |

Raw card numbers are never accepted — `create_payment` takes a token from Clip's client-side SDK. When you have no tokenization front-end, use `create_payment_link`.

## Example

> "Cobra 450 pesos por la consultoría y mándame el link."

The agent calls `create_payment_link` (`amount: 450.00`, `purchase_description: "Consultoría"`) and returns the `payment_request_url` for the buyer.

## Authentication

Clip issues a single Basic auth token in the developer dashboard; the server sends it as `Authorization: Basic <CLIP_AUTH_TOKEN>` on every call.

## Enterprise

Need governance, budget limits, and audit trails for agent-driven payments on Clip? [CodeSpar Enterprise](https://codespar.dev/enterprise) adds a policy engine, payment routing, and compliance templates on top of these MCP servers.

## License

MIT
