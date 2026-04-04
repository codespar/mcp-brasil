import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ---------------------------------------------------------------------------
// Capture MCP handlers by mocking the SDK
// ---------------------------------------------------------------------------
let listToolsHandler: Function;
let callToolHandler: Function;

vi.mock("@modelcontextprotocol/sdk/server/index.js", () => {
  class FakeServer {
    constructor() {}
    setRequestHandler(schema: any, handler: Function) {
      const name = schema?.method ?? schema?.shape?.method?._def?.value;
      if (name === "tools/list" || schema === "ListToolsRequestSchema") {
        listToolsHandler = handler;
      } else if (name === "tools/call" || schema === "CallToolRequestSchema") {
        callToolHandler = handler;
      }
      // Fallback: check by schema content
      if (!listToolsHandler && JSON.stringify(schema).includes("tools/list")) {
        listToolsHandler = handler;
      }
      if (!callToolHandler && JSON.stringify(schema).includes("tools/call")) {
        callToolHandler = handler;
      }
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

// Set env vars BEFORE importing the server module
process.env.ZOOP_API_KEY = "test-key";
process.env.ZOOP_MARKETPLACE_ID = "mkt-123";

// Mock fetch before import
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

// Dynamic import to pick up the mocked modules
beforeEach(async () => {
  vi.resetModules();
  // Reset handlers
  listToolsHandler = undefined as any;
  callToolHandler = undefined as any;
  // Re-mock fetch
  mockFetch.mockReset();
  global.fetch = mockFetch as any;
  // Re-import to capture handlers
  await import("../index.js");
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("mcp-zoop", () => {
  const EXPECTED_TOOLS = [
    "create_transaction",
    "get_transaction",
    "list_transactions",
    "create_split_rule",
    "create_seller",
    "get_seller",
    "list_sellers",
    "create_buyer",
    "get_balance",
    "create_transfer",
    "refund_transaction",
    "get_receivables",
    "create_token_card",
    "create_bank_account",
    "get_seller_balance",
    "update_seller",
    "list_transfers",
    "get_transfer",
    "create_subscription",
    "list_receivables",
  ];

  describe("ListTools", () => {
    it("should register exactly 20 tools", async () => {
      const result = await listToolsHandler();
      expect(result.tools).toHaveLength(20);
    });

    it("should include all expected tool names", async () => {
      const result = await listToolsHandler();
      const names = result.tools.map((t: any) => t.name);
      for (const name of EXPECTED_TOOLS) {
        expect(names).toContain(name);
      }
    });

    it("every tool should have an inputSchema", async () => {
      const result = await listToolsHandler();
      for (const tool of result.tools) {
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe("object");
      }
    });
  });

  describe("create_transaction", () => {
    it("should POST to /transactions with valid args", async () => {
      const mockResponse = { id: "txn_abc", status: "pending", amount: 5000 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await callToolHandler({
        params: {
          name: "create_transaction",
          arguments: {
            on_behalf_of: "seller_1",
            amount: 5000,
            payment_type: "pix",
          },
        },
      });

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain("/transactions");
      expect(opts.method).toBe("POST");
      expect(JSON.parse(opts.body)).toMatchObject({
        on_behalf_of: "seller_1",
        amount: 5000,
        payment_type: "pix",
      });

      const text = JSON.parse(result.content[0].text);
      expect(text.id).toBe("txn_abc");
    });
  });

  describe("API error handling", () => {
    it("should return isError true on 400 response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve("Bad Request: missing field"),
      });

      const result = await callToolHandler({
        params: {
          name: "create_transaction",
          arguments: { on_behalf_of: "seller_1", amount: 5000, payment_type: "pix" },
        },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("400");
    });

    it("should return isError true on 500 response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Internal Server Error"),
      });

      const result = await callToolHandler({
        params: {
          name: "get_transaction",
          arguments: { id: "txn_123" },
        },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("500");
    });

    it("should return isError true for unknown tool", async () => {
      const result = await callToolHandler({
        params: { name: "nonexistent_tool", arguments: {} },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Unknown tool");
    });
  });

  describe("get_transaction", () => {
    it("should GET /transactions/:id", async () => {
      const mockResponse = { id: "txn_123", status: "succeeded" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await callToolHandler({
        params: { name: "get_transaction", arguments: { id: "txn_123" } },
      });

      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain("/transactions/txn_123");
      expect(opts.method).toBe("GET");

      const text = JSON.parse(result.content[0].text);
      expect(text.id).toBe("txn_123");
    });
  });

  describe("BASE_URL construction", () => {
    it("should use the marketplace ID in the URL", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      });

      await callToolHandler({
        params: { name: "list_transactions", arguments: {} },
      });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain("mkt-123");
      expect(url).toContain("api.zoop.ws/v1/marketplaces/mkt-123");
    });
  });

  describe("refund_transaction", () => {
    it("should POST to /transactions/:id/refund with partial amount", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: "txn_123", status: "refunded" }),
      });

      await callToolHandler({
        params: {
          name: "refund_transaction",
          arguments: { id: "txn_123", amount: 2000 },
        },
      });

      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain("/transactions/txn_123/refund");
      expect(opts.method).toBe("POST");
      expect(JSON.parse(opts.body)).toMatchObject({ amount: 2000 });
    });

    it("should POST without body for full refund", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: "txn_123", status: "refunded" }),
      });

      await callToolHandler({
        params: {
          name: "refund_transaction",
          arguments: { id: "txn_123" },
        },
      });

      const [, opts] = mockFetch.mock.calls[0];
      expect(opts.body).toBeUndefined();
    });
  });
});
