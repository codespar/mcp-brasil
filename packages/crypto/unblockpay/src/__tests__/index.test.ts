import { describe, it, expect, vi, beforeEach } from "vitest";

let listToolsHandler: Function;
let callToolHandler: Function;

vi.mock("@modelcontextprotocol/sdk/server/index.js", () => {
  class FakeServer {
    constructor() {}
    setRequestHandler(schema: any, handler: Function) {
      if (JSON.stringify(schema).includes("tools/list")) listToolsHandler = handler;
      if (JSON.stringify(schema).includes("tools/call")) callToolHandler = handler;
    }
    connect() { return Promise.resolve(); }
  }
  return { Server: FakeServer };
});

vi.mock("@modelcontextprotocol/sdk/server/stdio.js", () => ({ StdioServerTransport: class {} }));

process.env.UNBLOCKPAY_API_KEY = "test-key";

const mockFetch = vi.fn();
global.fetch = mockFetch as any;

beforeEach(async () => {
  vi.resetModules();
  listToolsHandler = undefined as any;
  callToolHandler = undefined as any;
  mockFetch.mockReset();
  global.fetch = mockFetch as any;
  await import("../index.js");
});

describe("mcp-unblockpay", () => {
  it("registers 13 tools matching the real v1 API surface", async () => {
    const result = await listToolsHandler();
    expect(result.tools).toHaveLength(13);
    expect(result.tools.map((t: any) => t.name)).toEqual([
      "create_customer",
      "list_customers",
      "verify_customer",
      "get_verification_details",
      "create_wallet",
      "list_wallets",
      "create_external_account",
      "list_external_accounts",
      "create_quote",
      "create_payin",
      "create_payout",
      "get_transaction",
      "cancel_transaction",
    ]);
  });

  it("posts create_customer to /customers with the raw Authorization header", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: "cus_1", status: "pending" }) });

    await callToolHandler({
      params: {
        name: "create_customer",
        arguments: { type: "business", country: "BRA", business_legal_name: "Acme" },
      },
    });

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.unblockpay.com/v1/customers");
    expect(opts.method).toBe("POST");
    expect(opts.headers.Authorization).toBe("test-key");
    expect(JSON.parse(opts.body)).toEqual({ type: "business", country: "BRA", business_legal_name: "Acme" });
  });

  it("templates customer id into verify_customer path", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ ok: true }) });

    await callToolHandler({ params: { name: "verify_customer", arguments: { id: "cus_42" } } });

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.unblockpay.com/v1/customers/cus_42/check");
    expect(opts.method).toBe("POST");
  });

  it("splits id out of body for cancel_transaction (id in path, status in body)", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: "tx_9", status: "cancelled" }) });

    await callToolHandler({
      params: { name: "cancel_transaction", arguments: { id: "tx_9", status: "cancelled" } },
    });

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.unblockpay.com/v1/transactions/tx_9");
    expect(opts.method).toBe("PUT");
    expect(JSON.parse(opts.body)).toEqual({ status: "cancelled" });
  });

  it("builds query strings for paginated list endpoints", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ items: [] }) });

    await callToolHandler({ params: { name: "list_customers", arguments: { limit: 25, offset: 50 } } });

    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.unblockpay.com/v1/customers?limit=25&offset=50");
  });

  it("honors UNBLOCKPAY_BASE_URL when set to the sandbox", async () => {
    process.env.UNBLOCKPAY_BASE_URL = "https://api.sandbox.unblockpay.com/v1";
    vi.resetModules();
    listToolsHandler = undefined as any;
    callToolHandler = undefined as any;
    await import("../index.js");
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: "w_1" }) });

    await callToolHandler({
      params: {
        name: "create_wallet",
        arguments: { customer_id: "cus_1", name: "main", blockchain: "solana" },
      },
    });

    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.sandbox.unblockpay.com/v1/wallets");
    delete process.env.UNBLOCKPAY_BASE_URL;
  });
});
