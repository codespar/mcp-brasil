# @codespar/mcp-c6

MCP server for [C6 Bank](https://developers.c6bank.com.br) — a top Brazilian digital bank, JPMorgan-backed.

C6 ranks among the largest Brazilian digital banks by retail account base and has expanded aggressively into SMB and corporate banking. Merchants integrate directly for Pix, boleto, and account-data flows.

## Status: alpha (`0.1.0-alpha.1`)

C6's Developer Portal is **contract-gated** — full OpenAPI specs for Pix, Cobrança, and account APIs are only visible to onboarded merchants. The endpoint paths in this server are best-guesses based on (a) the BACEN Pix v2 standard, (b) C6's public marketing pages, and (c) conventions shared across Itaú / Santander / Bradesco. Every unverified path is flagged `TODO(verify)` in the source.

Pin to exact versions during `0.1.x`; paths will be corrected to match the portal spec once an onboarded merchant can validate.

## Tools

| Tool | Purpose |
|---|---|
| `get_oauth_token` | Mint / inspect a cached OAuth2 bearer |
| `create_pix_cob` | Create a Pix immediate charge (cob) with QR |
| `get_pix_cob` | Retrieve a Pix immediate charge by txid |
| `list_pix_cob` | List Pix immediate charges by date range |
| `create_pix_cobv` | Create a Pix charge with due date (cobv) |
| `get_pix_cobv` | Retrieve a Pix due-date charge by txid |
| `resolve_dict_key` | Resolve a DICT key (CPF/CNPJ/email/phone/EVP) |
| `register_pix_key` | Register a DICT key on a C6 account |
| `delete_pix_key` | Delete a DICT key owned by the merchant |
| `create_boleto` | Issue a boleto via C6 Cobrança |
| `get_boleto` | Retrieve a boleto |
| `cancel_boleto` | Cancel (baixa) an outstanding boleto |
| `get_account_balance` | Account balance snapshot |
| `get_statement` | Account statement transactions |

## Install

```bash
npm install @codespar/mcp-c6@0.1.0-alpha.1
```

## Environment

```bash
C6_CLIENT_ID="..."        # OAuth client_id from C6's Developer Portal
C6_CLIENT_SECRET="..."    # OAuth client_secret
C6_CERT_PATH="/abs/path/to/client.crt"   # mTLS client certificate
C6_KEY_PATH="/abs/path/to/client.key"    # mTLS private key
C6_ENV="sandbox"                          # or "production" (default: sandbox)
```

## Authentication

Two factors are **both** required on every call:

1. **OAuth2 `client_credentials`** — the server calls the token endpoint, caches the bearer until ~60s before expiry, and attaches `Authorization: Bearer <token>` to downstream calls.
2. **mTLS** — BACEN mandates mutual TLS for Pix v2, and C6 enforces it across product families. The server loads the client certificate and private key from the paths you set, builds a Node `https.Agent`, and routes every request through it.

You obtain the cert + key bundle from the C6 Developer Portal after your merchant contract is signed.

## Run

```bash
# stdio (default)
npx @codespar/mcp-c6
```

## Caveats

- **Paths are unverified.** See the `TODO(verify)` markers in `src/index.ts`. Onboarded merchants should validate against their portal-issued OpenAPI spec and open a PR.
- **Sandbox host is a guess.** C6 issues a sandbox subdomain per merchant; override by editing `BASE_URL` if your provisioned sandbox URL differs.

## License

MIT
