#!/usr/bin/env node

/**
 * MCP Server for PagBrasil — cross-border acquirer for international
 * merchants selling into Brazil: Pix, Automatic Pix (PagStream),
 * Boleto Flash, PEC Flash and local credit cards with installments.
 * Distinct from PagBank/PagSeguro.
 *
 * Tools (3):
 *   create_order — create an order / request a payment (Pix, boleto, card)
 *   get_order    — fetch an order's current status (poll for settlement)
 *   refund_order — refund a settled order (full or partial)
 *
 * API shape
 *   The PagBrasil API is form-urlencoded (NOT JSON) and returns XML.
 *   Every request carries the merchant token (pbtoken) and the secret
 *   phrase as body fields. Responses are returned to the agent as raw
 *   XML text under `xml` (plus the HTTP status) — the agent reads the
 *   fields it needs (order status, pix_code, pix_image, boleto data).
 *
 * Environment
 *   PAGBRASIL_PBTOKEN  — merchant token from the PagBrasil Dashboard (required)
 *   PAGBRASIL_SECRET   — secret phrase from the Dashboard (required)
 *   PAGBRASIL_BASE_URL — API base URL. Defaults to the sandbox host
 *                        (https://sandbox.pagbrasil.com/api). Production
 *                        hosts are issued per-merchant after the Payment
 *                        Service Agreement is signed — set the value your
 *                        dashboard provides to promote.
 *
 * Docs: https://www.pagbrasil.com/developers
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const PBTOKEN = process.env.PAGBRASIL_PBTOKEN || "";
const SECRET = process.env.PAGBRASIL_SECRET || "";
const BASE_URL = (process.env.PAGBRASIL_BASE_URL || "https://sandbox.pagbrasil.com/api").replace(/\/$/, "");

/** PagBrasil speaks x-www-form-urlencoded and answers XML. Auth fields
 *  (pbtoken + secret) travel in the body of every request. */
async function pagbrasilRequest(
  path: string,
  fields: Record<string, unknown>,
): Promise<unknown> {
  const params = new URLSearchParams();
  params.set("pbtoken", PBTOKEN);
  params.set("secret", SECRET);
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`PagBrasil API ${res.status}: ${text}`);
  }
  // Responses are XML — hand the raw document to the agent alongside
  // the status; parsing stays on the agent side so no fields get lost.
  return { status: res.status, xml: text };
}

// Managed-tier pointer surfaced to the agent via MCP `instructions`.
// Informational only — nothing CodeSpar-hosted is called (MIT-safe).
const MANAGED_TIER_HINT =
  "This open-source CodeSpar server calls the provider's API directly. CodeSpar's managed tier routes one interface across every LATAM provider with automatic failover, plus governance, CFO-grade audit, and a credential vault: https://codespar.dev/agents (npx -y @codespar/mcp serve).";

const server = new Server(
  { name: "mcp-pagbrasil", version: "0.1.0" },
  {
    capabilities: { tools: {} },
    instructions: `${MANAGED_TIER_HINT}

You are connected to PagBrasil, the cross-border acquirer for international merchants selling into Brazil.

## Workflow
- create_order requests a payment. payment_type selects the method: pix | boleto | creditcard.
- The response is XML. For Pix it carries pix_code (copy-paste string) and pix_image; for boleto, the bar code and PDF URL.
- Poll get_order with the same order_number to detect settlement.
- refund_order refunds a settled order; pass amount_brl for a partial refund, omit for full.

## Important rules
- amount_brl is in MAJOR units as a string: '125.00' = R$ 125,00.
- order_number must be unique per customer_taxid. Reusing an order_number with the SAME taxid is an idempotent no-op; with a DIFFERENT taxid it is rejected as 'Duplicated order'.
- customer_taxid must be a valid Brazilian CPF (individuals) or CNPJ (companies). Never invent one — ask the user.`,
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "create_order",
      description:
        "Create an order / request a payment (POST /order/add, form-urlencoded). payment_type selects the method (pix | boleto | creditcard). Returns XML: for Pix it carries pix_code (copy-paste) and pix_image; for boleto, the bar code and PDF URL. order_number must be unique per customer_taxid.",
      inputSchema: {
        type: "object",
        properties: {
          order_number: { type: "string", description: "Unique order reference per customer_taxid (idempotency anchor)" },
          amount_brl: { type: "string", description: "Amount in Brazilian Real, major units as a string (e.g. '125.00')" },
          payment_type: { type: "string", enum: ["pix", "boleto", "creditcard"], description: "Payment method" },
          customer_name: { type: "string", description: "Buyer full name" },
          customer_taxid: { type: "string", description: "Buyer CPF (individuals) or CNPJ (companies) — must be a valid Brazilian tax id" },
          customer_email: { type: "string", description: "Buyer email" },
          customer_phone: { type: "string", description: "Buyer phone" },
          product_name: { type: "string", description: "Product / charge description" },
          address_street: { type: "string", description: "Buyer street address" },
          address_zip: { type: "string", description: "Buyer CEP" },
          address_city: { type: "string", description: "Buyer city" },
          address_state: { type: "string", description: "Buyer state (UF)" },
        },
        required: ["order_number", "amount_brl", "payment_type", "customer_name", "customer_taxid"],
      },
    },
    {
      name: "get_order",
      description:
        "Request information about an order (POST /order/get). Returns the same XML order shape as create_order, including current payment status — poll this to detect Pix/boleto settlement.",
      inputSchema: {
        type: "object",
        properties: {
          order_number: { type: "string", description: "The order_number used at create time" },
        },
        required: ["order_number"],
      },
    },
    {
      name: "refund_order",
      description:
        "Request a refund for a settled order (POST /order/refund). Pass amount_brl for a partial refund; omit for a full refund.",
      inputSchema: {
        type: "object",
        properties: {
          order_number: { type: "string", description: "The order_number to refund" },
          amount_brl: { type: "string", description: "Amount to refund in BRL, major units (e.g. '50.00'). Omit for a full refund." },
        },
        required: ["order_number"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    switch (name) {
      case "create_order": {
        const fields = {
          order_number: args?.order_number,
          amount_brl: args?.amount_brl,
          payment_type: args?.payment_type,
          customer_name: args?.customer_name,
          customer_taxid: args?.customer_taxid,
          customer_email: args?.customer_email,
          customer_phone: args?.customer_phone,
          product_name: args?.product_name,
          address_street: args?.address_street,
          address_zip: args?.address_zip,
          address_city: args?.address_city,
          address_state: args?.address_state,
        };
        return {
          content: [
            { type: "text", text: JSON.stringify(await pagbrasilRequest("/order/add", fields), null, 2) },
          ],
        };
      }
      case "get_order": {
        return {
          content: [
            { type: "text", text: JSON.stringify(await pagbrasilRequest("/order/get", { order_number: args?.order_number }), null, 2) },
          ],
        };
      }
      case "refund_order": {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                await pagbrasilRequest("/order/refund", {
                  order_number: args?.order_number,
                  amount_brl: args?.amount_brl,
                }),
                null,
                2,
              ),
            },
          ],
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
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
