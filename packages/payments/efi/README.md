# @codespar/mcp-efi

> MCP server for **EFI (Gerencianet)** — Pix charges, boleto, credit card, and carnets

[![npm](https://img.shields.io/npm/v/@codespar/mcp-efi)](https://www.npmjs.com/package/@codespar/mcp-efi)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "efi": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-efi"],
      "env": {
        "EFI_CLIENT_ID": "your-client-id",
        "EFI_CLIENT_SECRET": "your-client-secret",
        "EFI_SANDBOX": "true"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add efi -- npx @codespar/mcp-efi
```

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "servers": {
    "efi": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-efi"],
      "env": {
        "EFI_CLIENT_ID": "your-client-id",
        "EFI_CLIENT_SECRET": "your-client-secret",
        "EFI_SANDBOX": "true"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `create_cob` | Create an immediate Pix charge (cobranca imediata) |
| `get_cob` | Get Pix charge details by txid |
| `list_cobs` | List Pix charges by date range |
| `create_charge` | Create a billing charge (boleto or credit card) |
| `get_charge` | Get charge details by ID |
| `create_carnet` | Create a carnet (payment booklet with multiple parcels) |
| `get_pix_key` | Get details of a registered Pix key |
| `create_pix_evp` | Create a random Pix key (EVP/alias) |

## Authentication

EFI uses OAuth2 client credentials. The server automatically manages token refresh.

## Sandbox / Testing

EFI provides a sandbox at `pix-h.api.efipay.com.br`. Set `EFI_SANDBOX=true` to use it.

### Get your credentials

1. Go to [EFI Pay Dashboard](https://app.efipay.com.br)
2. Create an account
3. Register an application to get OAuth2 credentials
4. Set the environment variables

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `EFI_CLIENT_ID` | Yes | OAuth2 client ID |
| `EFI_CLIENT_SECRET` | Yes | OAuth2 client secret |
| `EFI_SANDBOX` | No | Set to `"true"` for sandbox mode |

## Links

- [EFI Pay Website](https://efipay.com.br)
- [Gerencianet API Documentation](https://dev.gerencianet.com.br)
- [MCP Dev Brasil](https://github.com/codespar/mcp-dev-brasil)
- [Landing Page](https://codespar.dev/mcp)

## License

MIT
