import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Capture MCP handlers by mocking the SDK
// ---------------------------------------------------------------------------
let listToolsHandler: Function;
let callToolHandler: Function;

vi.mock("@modelcontextprotocol/sdk/server/index.js", () => {
  class FakeServer {
    constructor() {}
    setRequestHandler(schema: any, handler: Function) {
      if (JSON.stringify(schema).includes("tools/list")) {
        listToolsHandler = handler;
      }
      if (JSON.stringify(schema).includes("tools/call")) {
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

process.env.ASAAS_API_KEY = "test-asaas-key";
process.env.ASAAS_SANDBOX = "false";

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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("mcp-asaas", () => {
  const EXPECTED_TOOLS = [
    "create_payment",
    "get_payment",
    "list_payments",
    "get_pix_qrcode",
    "get_boleto",
    "create_customer",
    "list_customers",
    "create_subscription",
    "get_balance",
    "list_subscriptions",
    "cancel_subscription",
    "get_webhook_events",
    "create_subaccount",
    "get_installments",
    "create_transfer",
  ];

  describe("ListTools", () => {
    it("should register exactly 15 tools", async () => {
      const result = await listToolsHandler();
      expect(result.tools).toHaveLength(15);
    });

    it("should include all expected tool names", async () => {
      const result = await listToolsHandler();
      const names = result.tools.map((t: any) => t.name);
      for (const name of EXPECTED_TOOLS) {
        expect(names).toContain(name);
      }
    });
  });

  describe("create_payment", () => {
    it("should POST to /payments with valid args", async () => {
      const mockResponse = { id: "pay_abc", status: "PENDING", value: 100 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await callToolHandler({
        params: {
          name: "create_payment",
          arguments: {
            customer: "cus_123",
            billingType: "PIX",
            value: 100,
            dueDate: "2026-05-01",
          },
        },
      });

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain("/payments");
      expect(url).toContain("api.asaas.com/v3");
      expect(opts.method).toBe("POST");
      expect(opts.headers.access_token).toBe("test-asaas-key");
      expect(JSON.parse(opts.body)).toMatchObject({
        customer: "cus_123",
        billingType: "PIX",
        value: 100,
      });

      const text = JSON.parse(result.content[0].text);
      expect(text.id).toBe("pay_abc");
    });
  });

  describe("get_payment", () => {
    it("should GET /payments/:id", async () => {
      const mockResponse = { id: "pay_123", status: "RECEIVED" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await callToolHandler({
        params: { name: "get_payment", arguments: { id: "pay_123" } },
      });

      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain("/payments/pay_123");
      expect(opts.method).toBe("GET");

      const text = JSON.parse(result.content[0].text);
      expect(text.status).toBe("RECEIVED");
    });
  });

  describe("list_payments", () => {
    it("should GET /payments with query params", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [], totalCount: 0 }),
      });

      await callToolHandler({
        params: {
          name: "list_payments",
          arguments: { customer: "cus_123", status: "PENDING", limit: 5 },
        },
      });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain("customer=cus_123");
      expect(url).toContain("status=PENDING");
      expect(url).toContain("limit=5");
    });
  });

  describe("API error handling", () => {
    it("should return isError true on 400 response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve('{"errors":[{"code":"invalid_value"}]}'),
      });

      const result = await callToolHandler({
        params: {
          name: "create_payment",
          arguments: { customer: "cus_123", billingType: "PIX", value: 100, dueDate: "2026-05-01" },
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
        params: { name: "get_balance", arguments: {} },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("500");
    });

    it("should return isError true for unknown tool", async () => {
      const result = await callToolHandler({
        params: { name: "nonexistent", arguments: {} },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Unknown tool");
    });
  });

  describe("sandbox mode URL switching", () => {
    it("should use production URL when ASAAS_SANDBOX is not true", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ balance: 1000 }),
      });

      await callToolHandler({
        params: { name: "get_balance", arguments: {} },
      });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain("api.asaas.com/v3");
      expect(url).not.toContain("sandbox");
    });
  });
});
