# @codespar/mcp-focus-nfe

> MCP server for **Focus NFe** — NFe, NFSe, and NFCe fiscal document emission

[![npm](https://img.shields.io/npm/v/@codespar/mcp-focus-nfe)](https://www.npmjs.com/package/@codespar/mcp-focus-nfe)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "focus-nfe": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-focus-nfe"],
      "env": {
        "FOCUS_NFE_TOKEN": "your-token",
        "FOCUS_NFE_SANDBOX": "true"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add focus-nfe -- npx @codespar/mcp-focus-nfe
```

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "servers": {
    "focus-nfe": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-focus-nfe"],
      "env": {
        "FOCUS_NFE_TOKEN": "your-token",
        "FOCUS_NFE_SANDBOX": "true"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `create_nfe` | Create and emit an NFe (nota fiscal eletronica) |
| `get_nfe` | Get NFe details and status by reference |
| `cancel_nfe` | Cancel an authorized NFe |
| `create_nfse` | Create and emit an NFSe (nota fiscal de servico) |
| `get_nfse` | Get NFSe details and status by reference |
| `cancel_nfse` | Cancel an authorized NFSe |
| `get_nfe_pdf` | Get NFe PDF (DANFE) download URL |
| `create_nfce` | Create and emit an NFCe (nota fiscal do consumidor eletronica) |

## Authentication

Focus NFe uses Basic Auth with the API token as username and empty password.

## Sandbox / Testing

Focus NFe provides a homologation environment at `homologacao.focusnfe.com.br`. Set `FOCUS_NFE_SANDBOX=true` to use it.

### Get your credentials

1. Go to [Focus NFe](https://focusnfe.com.br)
2. Create an account
3. Get your API token from the dashboard
4. Set the `FOCUS_NFE_TOKEN` environment variable

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `FOCUS_NFE_TOKEN` | Yes | API token from Focus NFe |
| `FOCUS_NFE_SANDBOX` | No | Set to `"true"` for homologation mode |

## Links

- [Focus NFe Website](https://focusnfe.com.br)
- [Focus NFe API Documentation](https://focusnfe.com.br/doc)
- [MCP Dev Brasil](https://github.com/codespar/mcp-dev-brasil)
- [Landing Page](https://codespar.dev/mcp)

## License

MIT
