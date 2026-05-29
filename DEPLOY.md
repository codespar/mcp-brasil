# Deploy — mcp-dev-latam

This repo provides the Railway service **`mcp-dev-brasil`** (MCP gateway, exposes the 109 catalog servers over HTTP).

## Staging

```bash
# from repo root, with desired branch checked out
railway environment staging
railway up -s mcp-dev-brasil
```

Public URL: https://mcp.staging.codespar.dev

## Production

Push to `main` → Railway auto-deploy. To force:

```bash
railway environment production
railway service redeploy -s mcp-dev-brasil --yes
```

Public URL: https://mcp.codespar.dev

## Prerequisites

- `railway login` + `railway link --project codespar`

## More context

The catalog is seeded **offline** in `codespar-enterprise` — `mcp-dev-brasil` itself is a translator/gateway, not a runtime catalog source.
