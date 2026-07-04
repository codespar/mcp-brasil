# @codespar/mcp-epayco

> MCP server for **ePayco** — Colombian payment gateway (Davivienda-owned): card tokenization and charges, PSE bank debit, and cash networks (Efecty, Gana, Red Servi, Punto Red, Su Red).

[![npm](https://img.shields.io/npm/v/@codespar/mcp-epayco)](https://www.npmjs.com/package/@codespar/mcp-epayco)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

The tool set mirrors the official ePayco SDKs (epayco-node): the card/token API on `api.secure.payco.co` and the restpagos API on `secure.payco.co` for PSE and cash. Test mode is a payload flag (`EPAYCO_TEST`), not a separate host.

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "epayco": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-epayco"],
      "env": {
        "EPAYCO_PUBLIC_KEY": "your-public-key",
        "EPAYCO_PRIVATE_KEY": "your-private-key",
        "EPAYCO_TEST": "true"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add epayco --env EPAYCO_PUBLIC_KEY=pk --env EPAYCO_PRIVATE_KEY=sk -- npx -y @codespar/mcp-epayco
```

## Tools (8)

| Tool | Description |
|---|---|
| `tokenize_card` | Create a card token (`POST /v1/tokens`) |
| `create_customer` | Create a customer bound to a card token |
| `charge_card` | Charge a tokenized card (`POST /payment/v1/charge/create`) |
| `get_transaction` | Transaction detail by referencePayco |
| `create_pse_payment` | PSE bank debit — returns the bank redirect URL |
| `get_pse_transaction` | PSE transaction status by transaction id |
| `list_pse_banks` | PSE bank list |
| `create_cash_payment` | Cash voucher on efecty / gana / redservi / puntored / sured |

## Environment

| Variable | Required | Description |
|---|---|---|
| `EPAYCO_PUBLIC_KEY` | yes | Public key |
| `EPAYCO_PRIVATE_KEY` | yes | Private key |
| `EPAYCO_TEST` | no | `"true"` (default) flags payloads as test mode |

## Docs

- Provider docs: https://docs.epayco.com
- Managed tier (one interface across every LATAM provider, governance + audit): https://codespar.dev/agents

## Enterprise

Need governance, budget limits, and audit trails for agent-driven payments on ePayco? [CodeSpar Enterprise](https://codespar.dev/enterprise) adds a policy engine, payment routing, and compliance templates on top of these MCP servers.

## License

MIT
