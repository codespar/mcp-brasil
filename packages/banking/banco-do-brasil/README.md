# @codespar/mcp-banco-do-brasil

MCP server for [Banco do Brasil](https://developers.bb.com.br) — Brazil's top public bank.

BB exposes one of the broadest public-bank API surfaces in the country across Pix, Cobranças, Conta-Corrente, Open Finance, and Arrecadação. Merchants doing high-volume Pix and boleto operations integrate directly with BB instead of going through a PSP.

## Status: alpha (`0.1.0-alpha.1`)

BB's Developer Portal is **contract-gated** — the full OpenAPI specs are visible only after merchant onboarding. Pix paths follow the BACEN Pix v2 standard; boleto, account, and statement paths are best-guesses based on BB's public marketing pages and conventions shared with peers (Itaú, Santander, Bradesco). Every unverified path is flagged `TODO(verify)` in `src/index.ts`. Pin to exact versions during `0.1.x`.

## Tools (10)

| Tool | Purpose |
|---|---|
| `create_pix_cob` | Create immediate Pix charge (cob) |
| `get_pix_cob` | Get an immediate Pix charge by txid |
| `list_pix_cob` | List immediate Pix charges by date range |
| `create_pix_devolucao` | Refund a received Pix (devolução) |
| `get_pix_devolucao` | Retrieve a devolução by id |
| `resolve_dict_key` | Resolve a DICT key to account data |
| `register_dict_key` | Register a DICT key on a BB account |
| `delete_dict_key` | Delete a DICT key owned by the merchant |
| `register_boleto` | Issue a boleto via BB Cobranças |
| `get_boleto` | Retrieve a boleto by nosso_numero |
| `cancel_boleto` | Cancel (baixa) an outstanding boleto |
| `get_account_balance` | Conta-corrente balance |
| `get_statement` | Account statement transactions |

## Install

```bash
npm install @codespar/mcp-banco-do-brasil@0.1.0-alpha.1
```

## Environment

```bash
BB_CLIENT_ID="..."             # OAuth client_id from developers.bb.com.br
BB_CLIENT_SECRET="..."         # OAuth client_secret
BB_DEVELOPER_APP_KEY="..."     # gw-dev-app-key — required on most calls
BB_CERT_PATH="/abs/path/client.crt"   # mTLS cert (production only)
BB_KEY_PATH="/abs/path/client.key"    # mTLS key  (production only)
BB_ENV="sandbox"                       # or "production" (default: sandbox)
```

## Authentication

- **OAuth2 `client_credentials`** — token endpoint at `oauth.{env}.bb.com.br`. Bearer cached until ~60s before expiry.
- **mTLS** — required by BACEN for Pix v2 in production. Sandbox typically allows TLS-only; cert/key are optional in sandbox and required in production.
- **`gw-dev-app-key`** — BB API gateway key, appended as a query param on all calls.

## Run

```bash
npx @codespar/mcp-banco-do-brasil
```

## License

MIT
