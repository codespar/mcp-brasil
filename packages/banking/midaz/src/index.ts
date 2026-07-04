#!/usr/bin/env node

/**
 * MCP Server for Midaz — Lerian's open-source, multi-currency,
 * multi-asset double-entry ledger (github.com/LerianStudio/midaz).
 *
 * SELF-HOSTED MODEL: unlike SaaS providers in this catalog, Midaz runs
 * inside the tenant's own infrastructure. This server points at YOUR
 * deployment via MIDAZ_BASE_URL (onboarding service: organizations /
 * ledgers / accounts) and MIDAZ_TRANSACTION_URL (transaction service;
 * defaults to MIDAZ_BASE_URL when both run behind one gateway).
 *
 * Midaz hierarchy: Organization → Ledger → Account → Transaction
 * (each transaction is a set of balanced double-entry operations).
 * Tools take organization_id + ledger_id explicitly so one connection
 * can operate across ledgers.
 *
 * Tools (5):
 *   create_account     — create an account in a ledger
 *   list_accounts      — list a ledger's accounts (paginated)
 *   get_balance        — read an account's balances
 *   create_transaction — post a balanced double-entry transaction (JSON shape)
 *   get_transaction    — fetch a transaction by id
 *
 * Environment
 *   MIDAZ_BASE_URL         — base URL of your Midaz onboarding service (required)
 *   MIDAZ_TRANSACTION_URL  — base URL of the transaction service (default: MIDAZ_BASE_URL)
 *   MIDAZ_API_KEY          — bearer token, when your deployment enforces auth (optional)
 *
 * Docs: https://docs.lerian.studio
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const BASE_URL = (process.env.MIDAZ_BASE_URL || "").replace(/\/$/, "");
const TRANSACTION_URL = (process.env.MIDAZ_TRANSACTION_URL || BASE_URL).replace(/\/$/, "");
const API_KEY = process.env.MIDAZ_API_KEY || "";

async function midazRequest(
  service: "onboarding" | "transaction",
  method: string,
  path: string,
  body?: unknown,
): Promise<unknown> {
  if (!BASE_URL) {
    throw new Error(
      "MIDAZ_BASE_URL is not set. Midaz is self-hosted: point this server at your own deployment.",
    );
  }
  const base = service === "transaction" ? TRANSACTION_URL : BASE_URL;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (API_KEY) headers["Authorization"] = `Bearer ${API_KEY}`;
  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Midaz API ${res.status}: ${err}`);
  }
  const text = await res.text();
  if (!text) return { ok: true };
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

// Managed-tier pointer surfaced to the agent via MCP `instructions`.
// Informational only — nothing CodeSpar-hosted is called (MIT-safe).
const MANAGED_TIER_HINT =
  "This open-source CodeSpar server calls your self-hosted Midaz deployment directly. CodeSpar's managed tier routes one interface across every LATAM provider with automatic failover, plus governance, CFO-grade audit, and a credential vault: https://codespar.dev/agents (npx -y @codespar/mcp serve).";

const server = new Server(
  { name: "mcp-midaz", version: "0.1.0" },
  { capabilities: { tools: {} }, instructions: MANAGED_TIER_HINT },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "create_account",
      description:
        "Create an account in a ledger (POST /v1/organizations/{org}/ledgers/{ledger}/accounts). Accounts hold balances per asset code (e.g. BRL, USD, USDC).",
      inputSchema: {
        type: "object",
        properties: {
          organization_id: { type: "string", description: "Midaz organization id" },
          ledger_id: { type: "string", description: "Ledger id inside the organization" },
          name: { type: "string", description: "Account display name" },
          asset_code: { type: "string", description: "Asset the account holds (e.g. BRL, USD)" },
          type: { type: "string", description: "Account type (e.g. deposit, savings, creditCard, expense)" },
          alias: { type: "string", description: "Optional unique alias (used as @alias in transaction operations)" },
          extra: { type: "object", description: "Any additional Midaz account fields, merged into the payload" },
        },
        required: ["organization_id", "ledger_id", "name", "asset_code", "type"],
      },
    },
    {
      name: "list_accounts",
      description:
        "List a ledger's accounts (GET /v1/organizations/{org}/ledgers/{ledger}/accounts). Paginated via limit/page.",
      inputSchema: {
        type: "object",
        properties: {
          organization_id: { type: "string", description: "Midaz organization id" },
          ledger_id: { type: "string", description: "Ledger id" },
          limit: { type: "number", description: "Page size" },
          page: { type: "number", description: "Page number (1-based)" },
        },
        required: ["organization_id", "ledger_id"],
      },
    },
    {
      name: "get_balance",
      description:
        "Read an account's balances (GET /v1/organizations/{org}/ledgers/{ledger}/accounts/{account}/balances). Returns available and on-hold amounts per asset.",
      inputSchema: {
        type: "object",
        properties: {
          organization_id: { type: "string", description: "Midaz organization id" },
          ledger_id: { type: "string", description: "Ledger id" },
          account_id: { type: "string", description: "Account id" },
        },
        required: ["organization_id", "ledger_id", "account_id"],
      },
    },
    {
      name: "create_transaction",
      description:
        "Post a balanced double-entry transaction (POST /v1/organizations/{org}/ledgers/{ledger}/transactions/json). The send block debits source accounts and credits distribute targets; amounts must balance. Accounts are referenced by id or @alias.",
      inputSchema: {
        type: "object",
        properties: {
          organization_id: { type: "string", description: "Midaz organization id" },
          ledger_id: { type: "string", description: "Ledger id" },
          description: { type: "string", description: "Human-readable transaction description" },
          send: {
            type: "object",
            description:
              "Midaz send shape: { asset, value, scale, source: { from: [{ account, amount: { asset, value, scale } }] }, distribute: { to: [{ account, amount: {...} }] } }",
          },
          metadata: { type: "object", description: "Optional key-value metadata stored on the transaction" },
        },
        required: ["organization_id", "ledger_id", "send"],
      },
    },
    {
      name: "get_transaction",
      description:
        "Fetch a transaction with its operations (GET /v1/organizations/{org}/ledgers/{ledger}/transactions/{id}).",
      inputSchema: {
        type: "object",
        properties: {
          organization_id: { type: "string", description: "Midaz organization id" },
          ledger_id: { type: "string", description: "Ledger id" },
          transaction_id: { type: "string", description: "Transaction id" },
        },
        required: ["organization_id", "ledger_id", "transaction_id"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params as {
    name: string;
    arguments?: Record<string, unknown>;
  };
  const org = args?.organization_id;
  const ledger = args?.ledger_id;
  try {
    switch (name) {
      case "create_account": {
        const { extra, organization_id: _o, ledger_id: _l, asset_code, ...fields } =
          (args ?? {}) as Record<string, unknown>;
        const body = {
          ...fields,
          assetCode: asset_code,
          ...(typeof extra === "object" && extra ? extra : {}),
        };
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                await midazRequest("onboarding", "POST", `/v1/organizations/${org}/ledgers/${ledger}/accounts`, body),
                null,
                2,
              ),
            },
          ],
        };
      }
      case "list_accounts": {
        const params = new URLSearchParams();
        if (args?.limit !== undefined) params.set("limit", String(args.limit));
        if (args?.page !== undefined) params.set("page", String(args.page));
        const qs = params.toString();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                await midazRequest(
                  "onboarding",
                  "GET",
                  `/v1/organizations/${org}/ledgers/${ledger}/accounts${qs ? `?${qs}` : ""}`,
                ),
                null,
                2,
              ),
            },
          ],
        };
      }
      case "get_balance":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                await midazRequest(
                  "transaction",
                  "GET",
                  `/v1/organizations/${org}/ledgers/${ledger}/accounts/${args?.account_id}/balances`,
                ),
                null,
                2,
              ),
            },
          ],
        };
      case "create_transaction": {
        const body: Record<string, unknown> = { send: args?.send };
        if (args?.description) body.description = args.description;
        if (args?.metadata) body.metadata = args.metadata;
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                await midazRequest(
                  "transaction",
                  "POST",
                  `/v1/organizations/${org}/ledgers/${ledger}/transactions/json`,
                  body,
                ),
                null,
                2,
              ),
            },
          ],
        };
      }
      case "get_transaction":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                await midazRequest(
                  "transaction",
                  "GET",
                  `/v1/organizations/${org}/ledgers/${ledger}/transactions/${args?.transaction_id}`,
                ),
                null,
                2,
              ),
            },
          ],
        };
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
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
