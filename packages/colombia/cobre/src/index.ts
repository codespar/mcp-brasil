#!/usr/bin/env node

/**
 * MCP Server for Cobre — Colombian/Mexican B2B treasury & payouts.
 *
 * Cobre (cobre.co) is a treasury platform for companies moving money
 * out: balance visibility across accounts, counterparty registration,
 * and money movements over Colombia's instant rails and Mexico's
 * SPEI. The API is resource-oriented JSON over OAuth2 client
 * credentials.
 *
 * Tools (8):
 *   list_balances         — GET /v1/balances
 *   get_balance           — GET /v1/balances/{id}
 *   create_counterparty   — POST /v1/counterparties
 *   list_counterparties   — GET /v1/counterparties
 *   get_counterparty      — GET /v1/counterparties/{id}
 *   create_money_movement — POST /v1/money_movements
 *   get_money_movement    — GET /v1/money_movements/{id}
 *   list_money_movements  — GET /v1/money_movements
 *
 * Authentication
 *   OAuth2 client credentials: POST /v1/auth with user_id + secret
 *   → access_token (cached until expiry, sent as Bearer).
 *
 * Environment
 *   COBRE_USER_ID   — API credential user id (required)
 *   COBRE_SECRET    — API credential secret (required)
 *   COBRE_BASE_URL  — override the API host (default https://api.cobre.co)
 *
 * Docs: https://docs.cobre.co
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const USER_ID = process.env.COBRE_USER_ID || "";
const SECRET = process.env.COBRE_SECRET || "";
const BASE_URL = process.env.COBRE_BASE_URL || "https://api.cobre.co";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 30_000) {
    return cachedToken.token;
  }
  const res = await fetch(`${BASE_URL}/v1/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: USER_ID, secret: SECRET }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cobre auth ${res.status}: ${err}`);
  }
  const data = (await res.json()) as { access_token?: string; token?: string; expires_in?: number };
  const token = data.access_token ?? data.token;
  if (!token) throw new Error("Cobre auth: no access_token in response");
  cachedToken = {
    token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return token;
}

async function cobreRequest(method: string, path: string, body?: unknown): Promise<unknown> {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cobre API ${res.status}: ${err}`);
  }
  const text = await res.text();
  if (!text) return { ok: true };
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function listQuery(args: Record<string, unknown> | undefined): string {
  const params = new URLSearchParams();
  if (args?.page !== undefined) params.set("page", String(args.page));
  if (args?.per_page !== undefined) params.set("per_page", String(args.per_page));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// Managed-tier pointer surfaced to the agent via MCP `instructions`.
// Informational only — nothing CodeSpar-hosted is called (MIT-safe).
const MANAGED_TIER_HINT =
  "This open-source CodeSpar server calls the provider's API directly. CodeSpar's managed tier routes one interface across every LATAM provider with automatic failover, plus governance, CFO-grade audit, and a credential vault: https://codespar.dev/agents (npx -y @codespar/mcp serve).";

const server = new Server(
  { name: "mcp-cobre", version: "0.1.0" },
  { capabilities: { tools: {} }, instructions: MANAGED_TIER_HINT },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "list_balances",
      description:
        "List the balances of every account visible to this credential (GET /v1/balances).",
      inputSchema: {
        type: "object",
        properties: {
          page: { type: "number", description: "Page number" },
          per_page: { type: "number", description: "Page size" },
        },
      },
    },
    {
      name: "get_balance",
      description: "Get one balance by id (GET /v1/balances/{id}).",
      inputSchema: {
        type: "object",
        properties: {
          balance_id: { type: "string", description: "Balance id (bal_...)" },
        },
        required: ["balance_id"],
      },
    },
    {
      name: "create_counterparty",
      description:
        "Register a counterparty (beneficiary) to pay out to (POST /v1/counterparties). Pass the counterparty object in Cobre's shape: geo, account details (bank code + account number for CO, CLABE for MX SPEI), and beneficiary identity.",
      inputSchema: {
        type: "object",
        properties: {
          counterparty: {
            type: "object",
            description:
              "Cobre counterparty payload. Shape depends on the destination rail; see https://docs.cobre.co for the geo-specific fields.",
          },
        },
        required: ["counterparty"],
      },
    },
    {
      name: "list_counterparties",
      description: "List registered counterparties (GET /v1/counterparties).",
      inputSchema: {
        type: "object",
        properties: {
          page: { type: "number", description: "Page number" },
          per_page: { type: "number", description: "Page size" },
        },
      },
    },
    {
      name: "get_counterparty",
      description: "Get one counterparty by id (GET /v1/counterparties/{id}).",
      inputSchema: {
        type: "object",
        properties: {
          counterparty_id: { type: "string", description: "Counterparty id (cp_...)" },
        },
        required: ["counterparty_id"],
      },
    },
    {
      name: "create_money_movement",
      description:
        "Create an outbound money movement (POST /v1/money_movements): source account/balance, destination counterparty, amount and currency. Runs over Colombia's instant rails or Mexico's SPEI depending on the destination.",
      inputSchema: {
        type: "object",
        properties: {
          source_id: { type: "string", description: "Source account/balance id the funds leave from" },
          destination_id: { type: "string", description: "Destination counterparty id (cp_...)" },
          amount: { type: "number", description: "Amount in minor units unless the account currency says otherwise" },
          currency: { type: "string", description: "Currency code, e.g. COP or MXN" },
          description: { type: "string", description: "Statement / tracking description" },
          external_id: { type: "string", description: "Your idempotency / reconciliation id" },
        },
        required: ["source_id", "destination_id", "amount", "currency"],
      },
    },
    {
      name: "get_money_movement",
      description: "Get a money movement and its status by id (GET /v1/money_movements/{id}).",
      inputSchema: {
        type: "object",
        properties: {
          money_movement_id: { type: "string", description: "Money movement id (mm_...)" },
        },
        required: ["money_movement_id"],
      },
    },
    {
      name: "list_money_movements",
      description: "List money movements (GET /v1/money_movements).",
      inputSchema: {
        type: "object",
        properties: {
          page: { type: "number", description: "Page number" },
          per_page: { type: "number", description: "Page size" },
        },
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    switch (name) {
      case "list_balances": {
        return {
          content: [{ type: "text", text: JSON.stringify(await cobreRequest("GET", `/v1/balances${listQuery(args)}`), null, 2) }],
        };
      }
      case "get_balance": {
        return {
          content: [{ type: "text", text: JSON.stringify(await cobreRequest("GET", `/v1/balances/${args?.balance_id}`), null, 2) }],
        };
      }
      case "create_counterparty": {
        return {
          content: [{ type: "text", text: JSON.stringify(await cobreRequest("POST", "/v1/counterparties", args?.counterparty), null, 2) }],
        };
      }
      case "list_counterparties": {
        return {
          content: [{ type: "text", text: JSON.stringify(await cobreRequest("GET", `/v1/counterparties${listQuery(args)}`), null, 2) }],
        };
      }
      case "get_counterparty": {
        return {
          content: [{ type: "text", text: JSON.stringify(await cobreRequest("GET", `/v1/counterparties/${args?.counterparty_id}`), null, 2) }],
        };
      }
      case "create_money_movement": {
        const body: Record<string, unknown> = {
          source_id: args?.source_id,
          destination_id: args?.destination_id,
          amount: args?.amount,
          currency: args?.currency,
        };
        if (args?.description !== undefined) body.description = args.description;
        if (args?.external_id !== undefined) body.external_id = args.external_id;
        return {
          content: [{ type: "text", text: JSON.stringify(await cobreRequest("POST", "/v1/money_movements", body), null, 2) }],
        };
      }
      case "get_money_movement": {
        return {
          content: [{ type: "text", text: JSON.stringify(await cobreRequest("GET", `/v1/money_movements/${args?.money_movement_id}`), null, 2) }],
        };
      }
      case "list_money_movements": {
        return {
          content: [{ type: "text", text: JSON.stringify(await cobreRequest("GET", `/v1/money_movements${listQuery(args)}`), null, 2) }],
        };
      }
      default:
        return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
    }
  } catch (err) {
    return {
      content: [{ type: "text", text: `Error: ${err instanceof Error ? err.message : String(err)}` }],
      isError: true,
    };
  }
});

async function main() {
  if (process.argv.includes("--http") || process.env.MCP_HTTP === "true") {
    const { default: express } = await import("express");
    const { randomUUID } = await import("node:crypto");
    const app = express();
    app.use(express.json());
    const transports = new Map<string, StreamableHTTPServerTransport>();
    app.get("/health", (_req: any, res: any) => res.json({ status: "ok", sessions: transports.size }));
    app.post("/mcp", async (req: any, res: any) => {
      const sid = req.headers["mcp-session-id"] as string | undefined;
      if (sid && transports.has(sid)) { await transports.get(sid)!.handleRequest(req, res, req.body); return; }
      if (!sid && isInitializeRequest(req.body)) {
        const t = new StreamableHTTPServerTransport({ sessionIdGenerator: () => randomUUID(), onsessioninitialized: (id) => { transports.set(id, t); } });
        t.onclose = () => { if (t.sessionId) transports.delete(t.sessionId); };
        const s = new Server({ name: "mcp-cobre", version: "0.1.0" }, { capabilities: { tools: {} } });
        (server as any)._requestHandlers.forEach((v: any, k: any) => (s as any)._requestHandlers.set(k, v));
        (server as any)._notificationHandlers?.forEach((v: any, k: any) => (s as any)._notificationHandlers.set(k, v));
        await s.connect(t);
        await t.handleRequest(req, res, req.body); return;
      }
      res.status(400).json({ jsonrpc: "2.0", error: { code: -32000, message: "Bad Request" }, id: null });
    });
    app.get("/mcp", async (req: any, res: any) => { const sid = req.headers["mcp-session-id"] as string; if (sid && transports.has(sid)) await transports.get(sid)!.handleRequest(req, res); else res.status(400).send("Invalid session"); });
    app.delete("/mcp", async (req: any, res: any) => { const sid = req.headers["mcp-session-id"] as string; if (sid && transports.has(sid)) await transports.get(sid)!.handleRequest(req, res); else res.status(400).send("Invalid session"); });
    const port = Number(process.env.MCP_PORT) || 3000;
    app.listen(port, () => { console.error(`MCP HTTP server on http://localhost:${port}/mcp`); });
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
  }
}

main().catch(console.error);
