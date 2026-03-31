# @codespar/mcp-celcoin

> MCP server for **Celcoin** — BaaS infrastructure for Pix, boleto, transfers, and top-ups

[![npm](https://img.shields.io/npm/v/@codespar/mcp-celcoin)](https://www.npmjs.com/package/@codespar/mcp-celcoin)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "celcoin": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-celcoin"],
      "env": {
        "CELCOIN_CLIENT_ID": "your-client-id",
        "CELCOIN_CLIENT_SECRET": "your-client-secret",
        "CELCOIN_SANDBOX": "true"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add celcoin -- npx @codespar/mcp-celcoin
```

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "servers": {
    "celcoin": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-celcoin"],
      "env": {
        "CELCOIN_CLIENT_ID": "your-client-id",
        "CELCOIN_CLIENT_SECRET": "your-client-secret",
        "CELCOIN_SANDBOX": "true"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `create_pix_payment` | Create a Pix payment via Celcoin |
| `get_pix_payment` | Get Pix payment details by transaction ID |
| `create_boleto` | Create a boleto payment via Celcoin |
| `get_boleto` | Get boleto details by transaction ID |
| `create_transfer` | Create a bank transfer (TED/DOC) via Celcoin |
| `get_balance` | Get account balance at Celcoin |
| `list_banks` | List available banks in Brazil (ISPB codes) |
| `create_topup` | Create a mobile/service top-up (recarga) via Celcoin |

## Authentication

Celcoin uses OAuth2 client credentials. The server automatically manages token refresh.

## Sandbox / Testing

Celcoin provides a sandbox at `sandbox-api.celcoin.com.br`. Set `CELCOIN_SANDBOX=true` to use it.

### Get your credentials

1. Go to [Celcoin Documentation](https://docs.celcoin.com.br)
2. Create a developer account
3. Register an application to get OAuth2 credentials
4. Set the environment variables

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CELCOIN_CLIENT_ID` | Yes | OAuth2 client ID |
| `CELCOIN_CLIENT_SECRET` | Yes | OAuth2 client secret |
| `CELCOIN_SANDBOX` | No | Set to `"true"` for sandbox mode |

## Links

- [Celcoin Website](https://celcoin.com.br)
- [Celcoin API Documentation](https://docs.celcoin.com.br)
- [MCP Dev Brasil](https://github.com/codespar/mcp-dev-brasil)
- [Landing Page](https://codespar.dev/mcp)

## License

MIT
