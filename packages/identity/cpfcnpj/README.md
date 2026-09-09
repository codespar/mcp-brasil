# @codespar/mcp-cpfcnpj

MCP server for [cpfcnpj.com.br](https://www.cpfcnpj.com.br), official Brazilian CPF and CNPJ lookups for identity, KYC and KYB agent workflows.

Give an agent a CNPJ and it returns razao social, fantasia, address, IBGE codes and, on the richer package, registration status, company size and Simples Nacional status. Give it a CPF and it returns the registered name and, on the richer package, the address.

## Why this source

- **Official data, in real time (D+0).** Results come straight from the government registries, not from a monthly snapshot.
- **No leaked or scraped databases.** The service does not resell breached dumps or crawled data. Every response traces back to the authoritative registry.
- **Certified security and compliance posture.** The provider runs a certified program covering information security, privacy and compliance (ISO/IEC 27001, ISO/IEC 27701 and ISO 37301), which matters when the lookup feeds a regulated onboarding or lending decision.

## Quick Start

### Claude Desktop

```json
{
  "mcpServers": {
    "cpfcnpj": {
      "command": "npx",
      "args": ["-y", "@codespar/mcp-cpfcnpj"],
      "env": {
        "CPFCNPJ_TOKEN": "your-token"
      }
    }
  }
}
```

### Cursor / VS Code

```bash
CPFCNPJ_TOKEN=your-token npx -y @codespar/mcp-cpfcnpj
```

## Tools (2)

| Tool | Source endpoint | Notes |
|---|---|---|
| `companies_lookup` | `GET /{token}/{pacote}/{cnpj}` | CNPJ lookup. Package `6` (default) returns razao, fantasia, address, IBGE codes, situacao, porte and Simples Nacional; package `5` returns the base registry fields. |
| `persons_lookup` | `GET /{token}/{pacote}/{cpf}` | CPF lookup. Package `3` (default) returns name and address; package `1` returns the name only. |

Both tools accept the document with or without punctuation. The provider reports success or failure in a `status` field (1 success, 0 error); this server maps it to an explicit `ok` boolean so the agent can branch without parsing prose.

Example result:

```json
{
  "ok": true,
  "status": 200,
  "provider_status": 1,
  "documento": "27272134000118",
  "pacote": "6",
  "data": {
    "status": 1,
    "razao": "ALAS TECNOLOGIA LTDA",
    "situacao": "ATIVA",
    "porte": "ME"
  }
}
```

## Authentication

cpfcnpj.com.br authenticates by an account **token** carried in the request path:

```
GET https://api.cpfcnpj.com.br/{token}/{pacote}/{documento}
```

Issue the token from your account dashboard:

- Dashboard: <https://www.cpfcnpj.com.br>
- API packages: <https://www.cpfcnpj.com.br/dev/>

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `CPFCNPJ_TOKEN` | yes | Account token used in the request path. |
| `CPFCNPJ_API_BASE` | no | API base URL. Defaults to `https://api.cpfcnpj.com.br`. Override for testing. |

## Enterprise

Need governance, budget limits, and audit trails for agent identity calls? [CodeSpar Enterprise](https://codespar.dev/enterprise) adds policy engine, payment routing, and compliance templates on top of these MCP servers.

## License

MIT
