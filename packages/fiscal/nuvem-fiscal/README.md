# @codespar/mcp-nuvem-fiscal

> MCP server for **Nuvem Fiscal** — NFe, NFSe, NFCe fiscal document emission and CNPJ/CEP lookup

[![npm](https://img.shields.io/npm/v/@codespar/mcp-nuvem-fiscal)](https://www.npmjs.com/package/@codespar/mcp-nuvem-fiscal)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "nuvem-fiscal": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-nuvem-fiscal"],
      "env": {
        "NUVEM_FISCAL_CLIENT_ID": "your-client-id",
        "NUVEM_FISCAL_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add nuvem-fiscal -- npx @codespar/mcp-nuvem-fiscal
```

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "servers": {
    "nuvem-fiscal": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-nuvem-fiscal"],
      "env": {
        "NUVEM_FISCAL_CLIENT_ID": "your-client-id",
        "NUVEM_FISCAL_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `create_nfe` | Create a NF-e (nota fiscal eletronica) |
| `get_nfe` | Get NF-e details by ID |
| `cancel_nfe` | Cancel a NF-e |
| `create_nfse` | Create a NFS-e (nota fiscal de servico eletronica) |
| `get_nfse` | Get NFS-e details by ID |
| `cancel_nfse` | Cancel a NFS-e |
| `create_nfce` | Create a NFC-e (nota fiscal de consumidor eletronica) |
| `consult_cnpj` | Consult company data by CNPJ number |
| `consult_cep` | Consult address by CEP (postal code) |
| `register_company` | Register a company in Nuvem Fiscal |

## Authentication

Nuvem Fiscal uses OAuth2 client credentials. The server automatically manages token refresh.

## Sandbox / Testing

Nuvem Fiscal supports a homologation environment (ambiente=2) for testing fiscal document emission without affecting real tax systems.

### Get your credentials

1. Go to [Nuvem Fiscal Developer Portal](https://dev.nuvemfiscal.com.br)
2. Create an account
3. Register an application to get OAuth2 credentials
4. Set the environment variables

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NUVEM_FISCAL_CLIENT_ID` | Yes | OAuth2 client ID |
| `NUVEM_FISCAL_CLIENT_SECRET` | Yes | OAuth2 client secret |

## Links

- [Nuvem Fiscal Website](https://nuvemfiscal.com.br)
- [Nuvem Fiscal API Documentation](https://dev.nuvemfiscal.com.br)
- [MCP Dev Brasil](https://github.com/codespar/mcp-dev-brasil)
- [Landing Page](https://codespar.dev/mcp)

## License

MIT
