# @codespar/mcp-stark-bank

> MCP server for **Stark Bank** — digital banking with transfers, boletos, invoices, and Pix

[![npm](https://img.shields.io/npm/v/@codespar/mcp-stark-bank)](https://www.npmjs.com/package/@codespar/mcp-stark-bank)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "stark-bank": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-stark-bank"],
      "env": {
        "STARK_BANK_ACCESS_TOKEN": "your-token",
        "STARK_BANK_SANDBOX": "true"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add stark-bank -- npx @codespar/mcp-stark-bank
```

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "servers": {
    "stark-bank": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-stark-bank"],
      "env": {
        "STARK_BANK_ACCESS_TOKEN": "your-token",
        "STARK_BANK_SANDBOX": "true"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `create_transfer` | Create a bank transfer (Pix or TED) |
| `get_transfer` | Get transfer details by ID |
| `list_transfers` | List transfers with optional filters |
| `create_boleto` | Create a boleto payment |
| `get_balance` | Get current account balance |
| `create_invoice` | Create an invoice (generates Pix QR code) |
| `get_invoice` | Get invoice details by ID |
| `list_invoices` | List invoices with optional filters |
| `create_pix_request` | Create a Pix payment request |
| `get_webhook_events` | Get webhook events (payment confirmations, transfers, etc.) |

## Authentication

Stark Bank uses a Bearer token for API authentication.

## Sandbox / Testing

Stark Bank provides a sandbox at `sandbox.api.starkbank.com`. Set `STARK_BANK_SANDBOX=true` to use it.

### Get your credentials

1. Go to [Stark Bank](https://starkbank.com)
2. Create an account
3. Generate an API access token from the dashboard
4. Set the environment variables

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `STARK_BANK_ACCESS_TOKEN` | Yes | API access token |
| `STARK_BANK_SANDBOX` | No | Set to `"true"` for sandbox mode |

## Links

- [Stark Bank Website](https://starkbank.com)
- [Stark Bank API Documentation](https://starkbank.com/docs)
- [MCP Dev Brasil](https://github.com/codespar/mcp-dev-brasil)
- [Landing Page](https://codespar.dev/mcp)

## License

MIT
