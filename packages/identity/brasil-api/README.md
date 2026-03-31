# @codespar/mcp-brasil-api

> MCP server for **BrasilAPI** — free public data APIs for CEP, CNPJ, banks, holidays, FIPE, and more

[![npm](https://img.shields.io/npm/v/@codespar/mcp-brasil-api)](https://www.npmjs.com/package/@codespar/mcp-brasil-api)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "brasil-api": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-brasil-api"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add brasil-api -- npx @codespar/mcp-brasil-api
```

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "servers": {
    "brasil-api": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-brasil-api"]
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `get_cep` | Look up address by CEP (Brazilian postal code) |
| `get_cnpj` | Look up company information by CNPJ |
| `get_banks` | List all Brazilian banks with codes and names |
| `get_holidays` | List national holidays for a given year |
| `get_fipe_brands` | List vehicle brands by type from FIPE table |
| `get_fipe_price` | Get vehicle price from FIPE table by code |
| `get_ddd` | Get state and cities for a DDD (area code) |
| `get_isbn` | Look up book information by ISBN |
| `get_ncm` | Look up NCM tax classification code |
| `get_cptec_weather` | Get weather forecast for a city (CPTEC/INPE) |

## Authentication

No authentication required. BrasilAPI is a free public API.

## Sandbox / Testing

No sandbox needed. BrasilAPI is free and open for all requests.

### Get your credentials

No credentials needed. Just install and use.

## Environment Variables

No environment variables required.

## Links

- [BrasilAPI Website](https://brasilapi.com.br)
- [BrasilAPI Documentation](https://brasilapi.com.br/docs)
- [MCP Dev Brasil](https://github.com/codespar/mcp-dev-brasil)
- [Landing Page](https://codespar.dev/mcp)

## License

MIT
