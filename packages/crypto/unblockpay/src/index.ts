#!/usr/bin/env node

/**
 * MCP Server for UnblockPay — fiat <> stablecoin cross-border platform.
 *
 * Pattern:
 *   Customer (KYC mother) → Wallet → Quote → Payin/Payout
 *
 * The 13 tools cover the full lifecycle: customer onboarding + KYC,
 * wallet creation under approved customers, external bank accounts for
 * non-Pix payouts, FX quoting, pay-in (fiat → stablecoin), pay-out
 * (stablecoin → fiat), and transaction polling/cancel.
 *
 * Tools:
 * - create_customer / list_customers / verify_customer / get_verification_details
 * - create_wallet / list_wallets
 * - create_external_account / list_external_accounts
 * - create_quote
 * - create_payin / create_payout
 * - get_transaction / cancel_transaction
 *
 * Environment:
 *   UNBLOCKPAY_API_KEY  — API key from https://docs.unblockpay.com/.
 *   UNBLOCKPAY_BASE_URL — Optional. Defaults to https://api.unblockpay.com/v1.
 *                         Set to https://api.sandbox.unblockpay.com/v1 to hit
 *                         the sandbox.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const API_KEY = process.env.UNBLOCKPAY_API_KEY || "";
const BASE_URL = process.env.UNBLOCKPAY_BASE_URL || "https://api.unblockpay.com/v1";

async function unblockpayRequest(
  method: string,
  path: string,
  body?: unknown,
  query?: Record<string, string | number | undefined>,
): Promise<unknown> {
  let url = `${BASE_URL}${path}`;
  if (query) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": API_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`UnblockPay API ${res.status}: ${err}`);
  }
  return res.json();
}

const server = new Server(
  { name: "mcp-unblockpay", version: "0.3.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "create_customer",
      description: "Create an individual or business customer (KYC mother). Business customers require date_of_incorporation; both types use 3-letter ISO country codes (BRA/USA/MEX). Returns { id, status: 'pending', verification: { verification_link } }.",
      inputSchema: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["individual", "business"], description: "Customer type" },
          business_legal_name: { type: "string", description: "Required when type=business" },
          first_name: { type: "string", description: "Required when type=individual" },
          last_name: { type: "string", description: "Required when type=individual" },
          date_of_incorporation: { type: "string", description: "ISO date (YYYY-MM-DD). REQUIRED when type=business" },
          date_of_birth: { type: "string", description: "ISO date (YYYY-MM-DD). Required when type=individual" },
          email: { type: "string" },
          phone_number: { type: "string", description: "E.164 format, e.g. +5511999999999" },
          country: { type: "string", description: "3-letter ISO 3166-1 alpha-3 country code (BRA, USA, MEX)" },
          tax_id: { type: "string", description: "CNPJ for BRA business, EIN for USA, RFC for MEX, etc." },
          address: {
            type: "object",
            properties: {
              street_line_1: { type: "string" },
              street_line_2: { type: "string" },
              city: { type: "string" },
              state: { type: "string" },
              postal_code: { type: "string" },
              country: { type: "string", description: "3-letter ISO code" },
            },
          },
        },
        required: ["type", "country"],
      },
    },
    {
      name: "list_customers",
      description: "List customers under the operator's API key. `limit` is mandatory per UnblockPay's pagination contract.",
      inputSchema: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Required by the API (1-100)" },
          offset: { type: "number" },
        },
        required: ["limit"],
      },
    },
    {
      name: "verify_customer",
      description: "Trigger the KYC verification check for a customer. Sandbox auto-progresses business customers through the hosted KYC flow once documents are uploaded. Idempotent — returns 422 'customer_cannot_be_verified' when already approved (safe to ignore).",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "Customer ID" },
        },
        required: ["id"],
      },
    },
    {
      name: "get_verification_details",
      description: "Poll the KYC verification state for a customer. Returns { customer_status: 'pending' | 'approved' | 'rejected' | 'partially_rejected', verification_steps: [...] }.",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "Customer ID" },
        },
        required: ["id"],
      },
    },
    {
      name: "create_wallet",
      description: "Create a stablecoin wallet under an APPROVED customer. blockchain selects the network (solana → USDC; ethereum/polygon → USDC/USDT; tron → USDT). Customer must be 'approved' before this succeeds (422 customer_not_allowed otherwise).",
      inputSchema: {
        type: "object",
        properties: {
          customer_id: { type: "string" },
          name: { type: "string", description: "Human-readable wallet name" },
          blockchain: { type: "string", enum: ["solana", "ethereum", "polygon", "tron"] },
          is_external_wallet: { type: "boolean", description: "False for UnblockPay-managed wallets" },
        },
        required: ["customer_id", "name", "blockchain"],
      },
    },
    {
      name: "list_wallets",
      description: "List wallets under the operator's API key.",
      inputSchema: {
        type: "object",
        properties: {
          limit: { type: "number" },
          offset: { type: "number" },
        },
      },
    },
    {
      name: "create_external_account",
      description: "Register a fiat receiver account (BRL Pix, USD wire, EUR SEPA, MXN SPEI). Skippable for BRL Pix payouts — pass pix_key + document directly on /payout instead.",
      inputSchema: {
        type: "object",
        properties: {
          customer_id: { type: "string" },
          currency: { type: "string", description: "BRL / USD / MXN / EUR" },
          payment_rail: { type: "string", description: "pix / us_wire / spei / sepa" },
        },
        required: ["customer_id", "currency", "payment_rail"],
      },
    },
    {
      name: "list_external_accounts",
      description: "List external accounts under the operator's API key.",
      inputSchema: {
        type: "object",
        properties: {
          limit: { type: "number" },
          offset: { type: "number" },
        },
      },
    },
    {
      name: "create_quote",
      description: "Lock an FX + fee quote for a 5-minute TTL. Same endpoint for both on_ramp (fiat → stablecoin) and off_ramp (stablecoin → fiat). Pass amount on EITHER sender or receiver, not both. Response carries { id, expires_at, commercial_quotation, fees }.",
      inputSchema: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["on_ramp", "off_ramp"] },
          sender: {
            type: "object",
            properties: {
              currency: { type: "string" },
              payment_rail: { type: "string" },
              amount: { type: "number" },
            },
            required: ["currency", "payment_rail"],
          },
          receiver: {
            type: "object",
            properties: {
              currency: { type: "string" },
              payment_rail: { type: "string" },
              amount: { type: "number" },
            },
            required: ["currency", "payment_rail"],
          },
        },
        required: ["type", "sender", "receiver"],
      },
    },
    {
      name: "create_payin",
      description: "Create a fiat → stablecoin pay-in referencing a quote_id. Sandbox min: 150 BRL / payout-side equivalents. Response carries { id, status: 'awaiting_deposit', sender_deposit_instructions: { deposit_address: '<Pix Copy & Paste EMV>' }, transaction_link }.",
      inputSchema: {
        type: "object",
        properties: {
          quote_id: { type: "string" },
          customer_id: { type: "string" },
          sender: {
            type: "object",
            properties: {
              payment_rail: { type: "string" },
              name: { type: "string", description: "Payer's legal name (BCB compliance for BR pay-in)" },
              document: { type: "string", description: "Payer's tax id (CPF for BR)" },
            },
            required: ["payment_rail", "name", "document"],
          },
          receiver: {
            type: "object",
            properties: {
              wallet_id: { type: "string", description: "Internal UnblockPay wallet id" },
              address: { type: "string", description: "External blockchain address (alternative to wallet_id)" },
            },
          },
        },
        required: ["quote_id", "customer_id", "sender", "receiver"],
      },
    },
    {
      name: "create_payout",
      description: "Create a stablecoin → fiat payout referencing a quote_id. customer_id is REQUIRED at the top level (404 'Customer not found' otherwise). Pix-BR shortcut: pass receiver.pix_key + receiver.document directly to skip external_account registration. Sandbox min: 25 USDC. Response carries { id, status: 'awaiting_deposit', transaction_link, sender_deposit_instructions: { deposit_address: '<blockchain address>' } }.",
      inputSchema: {
        type: "object",
        properties: {
          quote_id: { type: "string" },
          customer_id: { type: "string" },
          sender: {
            type: "object",
            properties: {
              wallet_id: { type: "string" },
              address: { type: "string", description: "External wallet address (alternative to wallet_id)" },
            },
          },
          receiver: {
            type: "object",
            description: "EITHER { pix_key, document } for BRL Pix shortcut OR { external_account_id } for other currencies",
            properties: {
              pix_key: { type: "string" },
              document: { type: "string" },
              external_account_id: { type: "string" },
            },
          },
        },
        required: ["quote_id", "customer_id", "sender", "receiver"],
      },
    },
    {
      name: "get_transaction",
      description: "Poll transaction status. Lifecycle: awaiting_deposit → processing → completed (or failed / refunded / cancelled / error). Sandbox does NOT auto-progress without a webhook simulation — see UnblockPay's /concepts/transactions docs for the mocked transaction IDs available for status testing.",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string" },
        },
        required: ["id"],
      },
    },
    {
      name: "cancel_transaction",
      description: "Cancel a transaction. Only valid while status is 'awaiting_deposit' — UnblockPay's API returns 422 once the deposit has been received.",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string" },
          status: { type: "string", enum: ["cancelled"], description: "Set to 'cancelled' to abort" },
        },
        required: ["id", "status"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const a = (args ?? {}) as Record<string, unknown>;

  try {
    switch (name) {
      case "create_customer":
        return { content: [{ type: "text", text: JSON.stringify(await unblockpayRequest("POST", "/customers", a), null, 2) }] };

      case "list_customers":
        return { content: [{ type: "text", text: JSON.stringify(await unblockpayRequest("GET", "/customers", undefined, { limit: a.limit as number, offset: a.offset as number }), null, 2) }] };

      case "verify_customer":
        return { content: [{ type: "text", text: JSON.stringify(await unblockpayRequest("POST", `/customers/${encodeURIComponent(String(a.id))}/check`), null, 2) }] };

      case "get_verification_details":
        return { content: [{ type: "text", text: JSON.stringify(await unblockpayRequest("GET", `/customers/${encodeURIComponent(String(a.id))}/verification-details`), null, 2) }] };

      case "create_wallet":
        return { content: [{ type: "text", text: JSON.stringify(await unblockpayRequest("POST", "/wallets", a), null, 2) }] };

      case "list_wallets":
        return { content: [{ type: "text", text: JSON.stringify(await unblockpayRequest("GET", "/wallets", undefined, { limit: a.limit as number, offset: a.offset as number }), null, 2) }] };

      case "create_external_account":
        return { content: [{ type: "text", text: JSON.stringify(await unblockpayRequest("POST", "/external-accounts", a), null, 2) }] };

      case "list_external_accounts":
        return { content: [{ type: "text", text: JSON.stringify(await unblockpayRequest("GET", "/external-accounts", undefined, { limit: a.limit as number, offset: a.offset as number }), null, 2) }] };

      case "create_quote":
        return { content: [{ type: "text", text: JSON.stringify(await unblockpayRequest("POST", "/quote", a), null, 2) }] };

      case "create_payin":
        return { content: [{ type: "text", text: JSON.stringify(await unblockpayRequest("POST", "/payin", a), null, 2) }] };

      case "create_payout":
        return { content: [{ type: "text", text: JSON.stringify(await unblockpayRequest("POST", "/payout", a), null, 2) }] };

      case "get_transaction":
        return { content: [{ type: "text", text: JSON.stringify(await unblockpayRequest("GET", `/transactions/${encodeURIComponent(String(a.id))}`), null, 2) }] };

      case "cancel_transaction": {
        const { id, ...body } = a;
        return { content: [{ type: "text", text: JSON.stringify(await unblockpayRequest("PUT", `/transactions/${encodeURIComponent(String(id))}`, body), null, 2) }] };
      }

      default:
        return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
    }
  } catch (err) {
    return { content: [{ type: "text", text: `Error: ${err instanceof Error ? err.message : String(err)}` }], isError: true };
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
        const s = new Server({ name: "mcp-unblockpay", version: "0.3.0" }, { capabilities: { tools: {} } }); (server as any)._requestHandlers.forEach((v: any, k: any) => (s as any)._requestHandlers.set(k, v)); (server as any)._notificationHandlers?.forEach((v: any, k: any) => (s as any)._notificationHandlers.set(k, v)); await s.connect(t);
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
