# @codespar/mcp-getnet

MCP server for [Getnet](https://developers.getnet.com.br) — Santander-owned Brazilian card acquirer.

Together with Cielo, Stone, and Efi, Getnet closes three of the "big four" BR acquirer quadrant. Distinct from per-PSP servers (Zoop, Pagar.me, Asaas): Getnet is an acquirer, so merchants with a Santander commercial contract integrate directly instead of going through a PSP.

## Tools

| Tool | Purpose |
|---|---|
| `authorize_credit` | Authorize card payment (optional auto-capture) |
| `capture_credit` | Capture previously authorized payment |
| `cancel_credit` | Cancel authorized-but-uncaptured payment |
| `refund_credit` | Full or partial refund |
| `create_pix` | Create Pix charge, returns QR + copy-paste |
| `create_boleto` | Create boleto charge |
| `get_payment` | Retrieve any payment by id |
| `tokenize_card` | PCI-safe card tokenization |
| `create_seller` | Onboard a marketplace seller |
| `get_seller` | Retrieve seller by id |
| `list_sellers` | List marketplace sellers |

## Install

```bash
npm install @codespar/mcp-getnet
```

## Environment

```bash
GETNET_CLIENT_ID="..."       # OAuth client_id
GETNET_CLIENT_SECRET="..."   # OAuth client_secret
GETNET_SELLER_ID="..."       # seller_id from your merchant contract
GETNET_BASE_URL="..."        # Optional. Default: https://api.getnet.com.br
                             # Sandbox: https://api-homologacao.getnet.com.br
```

## Authentication

OAuth 2.0 Client Credentials. The server calls `POST /auth/oauth/v2/token` with Basic auth and caches the bearer token in memory until 60s before expiry. Transparent to callers.

## Run

```bash
# stdio (default)
npx @codespar/mcp-getnet

# HTTP
MCP_HTTP=true MCP_PORT=3000 npx @codespar/mcp-getnet
```

## License

MIT
