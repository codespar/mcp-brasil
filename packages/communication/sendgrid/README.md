# @codespar/mcp-sendgrid

MCP server for [SendGrid](https://sendgrid.com) — global transactional and marketing email.

SendGrid is Twilio-owned (acquired 2019). Together with [`@codespar/mcp-twilio`](../twilio) this package closes the messaging loop:

- **Twilio** — SMS, WhatsApp, Voice, Verify
- **SendGrid** — email (transactional + marketing)

Agents building commerce notification flows — order confirmations, shipping updates, abandoned-cart nudges, promos — can now cover every channel through two packages.

## Tools

| Tool | Purpose |
|------|---------|
| `send_mail` | `POST /mail/send` — personalizations, content, attachments, scheduling |
| `send_template` | `POST /mail/send` using a dynamic template (`d-...`) — convenience wrapper |
| `add_contact` | `PUT /marketing/contacts` — upsert contacts (async job), assign to lists |
| `list_contacts` | `GET /marketing/contacts` — sample of contacts |
| `delete_contact` | `DELETE /marketing/contacts?ids=...` — delete by id or wipe all |
| `search_contacts` | `POST /marketing/contacts/search` — SGQL (SendGrid SQL-like) query |
| `list_templates` | `GET /templates` — dynamic (default) or legacy transactional templates |
| `create_template` | `POST /templates` — create a transactional template |
| `list_suppressions` | `GET /asm/groups/{group_id}/suppressions` — suppressed emails for a group |
| `add_suppression` | `POST /asm/groups/{group_id}/suppressions` — add suppressions |
| `get_stats` | `GET /stats` — sent / delivered / opens / clicks aggregated by day/week/month |

## Install

```bash
npm install @codespar/mcp-sendgrid
```

## Environment

```bash
SENDGRID_API_KEY="SG...."         # required (secret)
SENDGRID_FROM_EMAIL="no-reply@yourdomain.com"   # optional default sender
```

The `SENDGRID_FROM_EMAIL` must be either a Verified Sender or belong to an authenticated domain.

## Authentication

Bearer-token auth. The server handles this automatically.

```
Authorization: Bearer <SENDGRID_API_KEY>
```

## API surface

- Base URL: `https://api.sendgrid.com/v3`
- All requests/responses are `application/json`
- `POST /mail/send` returns `202 Accepted` on success (no body)

## Send with a dynamic template

```json
{
  "to": "buyer@example.com",
  "template_id": "d-abc123...",
  "dynamic_template_data": {
    "order_id": "1001",
    "total_brl": "R$ 249,90",
    "tracking_url": "https://example.com/track/1001"
  }
}
```

## Run

```bash
# stdio (default — for Claude Desktop, Cursor, etc)
npx @codespar/mcp-sendgrid

# HTTP (for server-to-server testing)
MCP_HTTP=true MCP_PORT=3000 npx @codespar/mcp-sendgrid
```

## Pairs with

- [`@codespar/mcp-twilio`](../twilio) — SMS, WhatsApp, Voice, Verify, Lookup

## License

MIT
