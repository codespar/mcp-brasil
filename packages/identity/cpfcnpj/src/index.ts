#!/usr/bin/env node

/**
 * MCP Server for cpfcnpj.com.br, official Brazilian CPF and CNPJ lookups.
 *
 * Tools:
 * - companies_lookup: Look up a company by CNPJ (razao social, fantasia,
 *   address, IBGE codes, and for the richer package also situacao, porte
 *   and Simples Nacional status).
 * - persons_lookup: Look up a person by CPF (name and, in the richer
 *   package, address).
 *
 * Data source: official government registries queried in real time (D+0).
 * The service does not resell leaked or scraped databases, and it operates
 * under a certified program covering information security, privacy and
 * compliance (ISO/IEC 27001, ISO/IEC 27701 and ISO 37301).
 *
 * Source endpoint:
 *   GET https://api.cpfcnpj.com.br/{token}/{pacote}/{documento}
 *
 * Packages used by this server:
 *   CNPJ, package 6 (default): razao/fantasia/address/IBGE + situacao/porte/simplesNacional
 *   CNPJ, package 5:           razao/fantasia/address/IBGE
 *   CPF,  package 3 (default): name + address
 *   CPF,  package 1:           name only
 *
 * The API answers with a JSON body carrying a `status` field where 1 means
 * success and 0 means the query failed. This server maps that field into a
 * structured result so an agent can branch on `ok` without parsing prose.
 *
 * Env:
 *   CPFCNPJ_TOKEN     required, the account token issued at cpfcnpj.com.br
 *   CPFCNPJ_API_BASE  optional override (default https://api.cpfcnpj.com.br)
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// --- Validation helpers ---
// CPF is always 11 digits. CNPJ carries 14 characters and, since the 2026
// alphanumeric rollout, the first twelve may be letters or digits while the
// last two check digits stay numeric, so the accepted set is [0-9A-Z].
const cpfSchema = z.string().regex(/^\d{11}$/, "CPF must be 11 digits");
const cnpjSchema = z
  .string()
  .regex(
    /^[0-9A-Z]{12}\d{2}$/,
    "CNPJ must be 14 characters: 12 alphanumeric plus 2 numeric check digits",
  );

const CNPJ_PACKAGES = new Set(["5", "6"]);
const CPF_PACKAGES = new Set(["1", "3"]);

function normalizeCpf(raw: unknown): string {
  return String(raw ?? "").replace(/\D/g, "");
}

function normalizeCnpj(raw: unknown): string {
  return String(raw ?? "")
    .replace(/[^0-9A-Za-z]/g, "")
    .toUpperCase();
}

function validationError(msg: string) {
  return {
    content: [{ type: "text" as const, text: `Validation error: ${msg}` }],
    isError: true as const,
  };
}

const BASE_URL = process.env.CPFCNPJ_API_BASE ?? "https://api.cpfcnpj.com.br";

// Every request identifies itself so the provider edge does not answer the
// bare "node" User-Agent that undici sends when the header is left out. The
// format follows the other servers in this repo.
const USER_AGENT = "codespar-mcp-dev-latam/mcp-cpfcnpj/0.1.0";

function getToken(): string | undefined {
  return process.env.CPFCNPJ_TOKEN;
}

interface CpfCnpjResult {
  ok: boolean;
  status: number;
  provider_status?: number;
  documento: string;
  pacote: string;
  data?: unknown;
  error?: string;
}

async function cpfCnpjLookup(
  pacote: string,
  documento: string,
): Promise<CpfCnpjResult> {
  const token = getToken();
  if (!token) {
    return {
      ok: false,
      status: 0,
      documento,
      pacote,
      error:
        "Missing CPFCNPJ_TOKEN. Set the environment variable with the token issued at cpfcnpj.com.br.",
    };
  }

  const url = `${BASE_URL}/${encodeURIComponent(token)}/${pacote}/${encodeURIComponent(documento)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json", "User-Agent": USER_AGENT },
  });

  const text = await res.text();
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      documento,
      pacote,
      error: typeof body === "string" ? body : JSON.stringify(body),
    };
  }

  // A 2xx with a non-JSON body (a proxy or CDN error page, say) is not a
  // valid lookup. Fail closed instead of forwarding it as a success.
  if (typeof body !== "object" || body === null) {
    return {
      ok: false,
      status: res.status,
      documento,
      pacote,
      error: "The provider returned a non-JSON body on an HTTP success.",
      data: body,
    };
  }

  // The provider reports success or failure in the payload `status` field
  // (1 success, 0 error), independent of the HTTP status. Only a real JSON
  // number 1 counts as success: a string "1", a boolean true, or any other
  // coercible value is treated as a failure, so a malformed or proxied body
  // never reads as a successful lookup. Comparing the raw value (not a
  // Number() coercion, which would map "1"/true/[1] onto 1) keeps this
  // fail-closed.
  const rawStatus = (body as Record<string, unknown>).status;
  const providerStatus = typeof rawStatus === "number" ? rawStatus : NaN;

  if (providerStatus !== 1) {
    const message =
      "message" in body
        ? String((body as Record<string, unknown>).message)
        : "The provider did not return status 1 for this document.";
    return {
      ok: false,
      status: res.status,
      provider_status: Number.isNaN(providerStatus) ? undefined : providerStatus,
      documento,
      pacote,
      error: message,
      data: body,
    };
  }

  return {
    ok: true,
    status: res.status,
    provider_status: 1,
    documento,
    pacote,
    data: body,
  };
}

function ok(result: CpfCnpjResult) {
  // Surface a failed lookup through the protocol-level `isError` flag too,
  // matching the sibling servers and this file's own validation branches, so
  // a client that branches on `isError` does not read a failure as a success.
  return {
    content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    ...(result.ok ? {} : { isError: true as const }),
  };
}

// Managed-tier pointer surfaced to the agent via MCP `instructions`.
// Informational only, nothing CodeSpar-hosted is called (MIT-safe).
const MANAGED_TIER_HINT =
  "This open-source CodeSpar server calls the provider's API directly. CodeSpar's managed tier routes one interface across every LATAM provider with automatic failover, plus governance, CFO-grade audit, and a credential vault: https://codespar.dev/agents (npx -y @codespar/mcp serve).";

const server = new Server(
  { name: "mcp-cpfcnpj", version: "0.1.0" },
  { capabilities: { tools: {} }, instructions: MANAGED_TIER_HINT },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "companies_lookup",
      description:
        "Look up a Brazilian company by CNPJ from official registries in real time (razao social, fantasia, address, IBGE codes; package 6 also returns situacao, porte and Simples Nacional status).",
      inputSchema: {
        type: "object",
        properties: {
          cnpj: {
            type: "string",
            description:
              "CNPJ, 14 characters. Punctuation is ignored (e.g. 27.272.134/0001-18 or 27272134000118).",
          },
          pacote: {
            type: "string",
            enum: ["5", "6"],
            description:
              "Data package. '6' (default) adds situacao, porte and Simples Nacional; '5' returns the base registry fields.",
          },
        },
        required: ["cnpj"],
      },
    },
    {
      name: "persons_lookup",
      description:
        "Look up a Brazilian person by CPF from official registries in real time (name; package 3 also returns address).",
      inputSchema: {
        type: "object",
        properties: {
          cpf: {
            type: "string",
            description:
              "CPF, 11 digits. Punctuation is ignored (e.g. 123.456.789-09 or 12345678909).",
          },
          pacote: {
            type: "string",
            enum: ["1", "3"],
            description:
              "Data package. '3' (default) returns name and address; '1' returns the name only.",
          },
        },
        required: ["cpf"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "companies_lookup": {
        const cnpj = normalizeCnpj(args?.cnpj);
        const parsed = cnpjSchema.safeParse(cnpj);
        if (!parsed.success) return validationError(parsed.error.issues[0].message);
        const pacote =
          args?.pacote && CNPJ_PACKAGES.has(String(args.pacote))
            ? String(args.pacote)
            : "6";
        return ok(await cpfCnpjLookup(pacote, cnpj));
      }
      case "persons_lookup": {
        const cpf = normalizeCpf(args?.cpf);
        const parsed = cpfSchema.safeParse(cpf);
        if (!parsed.success) return validationError(parsed.error.issues[0].message);
        const pacote =
          args?.pacote && CPF_PACKAGES.has(String(args.pacote))
            ? String(args.pacote)
            : "3";
        return ok(await cpfCnpjLookup(pacote, cpf));
      }
      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (err) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${err instanceof Error ? err.message : String(err)}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  if (!getToken()) {
    console.error(
      "[mcp-cpfcnpj] CPFCNPJ_TOKEN is not set. Lookups will return a configuration error until it is provided.",
    );
  }
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
