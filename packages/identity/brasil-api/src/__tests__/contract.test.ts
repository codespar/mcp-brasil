import { it, expect, beforeAll, vi } from "vitest";
import {
  loadContractEnv,
  describeContract,
  parseToolResult,
} from "../../../../../test-utils/contract.js";

// ---------------------------------------------------------------------------
// Live contract test for BrasilAPI. No credential exists for this provider
// (public API), so the gate is opt-in only: set BRASIL_API_CONTRACT=1 to run
// it. It stays out of CI for the usual reason: it depends on a third party
// being up.
//
// What it is here for: get_cnpj is served behind an edge that rejects the
// User-Agent Node's fetch sends by default. That defect is invisible to a
// stubbed-fetch test, so the third-party half of the mechanism is produced
// here by calling the real API rather than being written by hand.
// ---------------------------------------------------------------------------

let callToolHandler: Function;

vi.mock("@modelcontextprotocol/sdk/server/index.js", () => {
  class FakeServer {
    constructor() {}
    setRequestHandler(schema: any, handler: Function) {
      if (JSON.stringify(schema).includes("tools/call")) callToolHandler = handler;
    }
    connect() {
      return Promise.resolve();
    }
  }
  return { Server: FakeServer };
});

vi.mock("@modelcontextprotocol/sdk/server/stdio.js", () => ({
  StdioServerTransport: class {},
}));

await loadContractEnv();

// Banco do Brasil S.A., a public and permanent CNPJ record. No secret involved.
const PUBLIC_CNPJ = "00000000000191";
const CNPJ_URL = `https://brasilapi.com.br/api/cnpj/v1/${PUBLIC_CNPJ}`;

describeContract("mcp-brasil-api", "BRASIL_API_CONTRACT", () => {
  beforeAll(async () => {
    vi.resetModules();
    await import("../index.js");
    if (!callToolHandler) {
      throw new Error("callToolHandler not registered: the import of ../index.js did not run");
    }
  });

  it("get_cnpj resolves a real company against the live API", async () => {
    const parsed = parseToolResult(
      await callToolHandler({ params: { name: "get_cnpj", arguments: { cnpj: PUBLIC_CNPJ } } }),
    );

    expect(parsed.isError, `live get_cnpj failed: ${parsed.text}`).toBe(false);
    expect((parsed.json as any)?.cnpj).toBe(PUBLIC_CNPJ);
  }, 30000);

  it("control: the edge is what rejects the default Node User-Agent", async () => {
    // Same URL, same method, twice. The only difference is the header.
    // `bare` inherits undici's default User-Agent ("node").
    const bare = await fetch(CNPJ_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const identified = await fetch(CNPJ_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "codespar-mcp-dev-latam/mcp-brasil-api/contract-control",
      },
    });

    // Positive control: if this one fails, BrasilAPI is down or rate-limiting
    // this host, and the assertion below carries no information.
    expect(identified.ok, `identified request failed with ${identified.status}`).toBe(true);

    expect(
      bare.ok,
      `bare request unexpectedly succeeded (${bare.status}): BrasilAPI may have dropped the User-Agent gate`,
    ).toBe(false);
  }, 30000);
});
