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

process.env.MELHOR_ENVIO_TOKEN = "test-me-token";
process.env.MELHOR_ENVIO_SANDBOX = "true";

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
describe("mcp-melhor-envio", () => {
  const EXPECTED_TOOLS = [
    "calculate_shipping",
    "create_shipment",
    "track_shipment",
    "generate_label",
    "list_agencies",
    "cancel_shipment",
    "get_balance",
    "add_cart",
    "checkout_cart",
    "preview_label",
    "print_label",
    "get_shipment",
    "list_shipments",
    "get_store",
    "search_agencies",
    "create_address",
    "list_services_available",
    "get_tracking_history",
  ];

  describe("ListTools", () => {
    it("should register exactly 18 tools", async () => {
      const result = await listToolsHandler();
      expect(result.tools).toHaveLength(18);
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

  describe("calculate_shipping", () => {
    it("should POST to /me/shipment/calculate with from, to, products", async () => {
      const mockRates = [
        { id: 1, name: "SEDEX", price: "25.90", delivery_time: 3 },
        { id: 2, name: "PAC", price: "15.50", delivery_time: 7 },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRates),
      });

      const args = {
        from: { postal_code: "01001000" },
        to: { postal_code: "20040020" },
        products: [
          { width: 20, height: 10, length: 30, weight: 1.5, quantity: 1 },
        ],
      };

      const result = await callToolHandler({
        params: { name: "calculate_shipping", arguments: args },
      });

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain("/me/shipment/calculate");
      expect(opts.method).toBe("POST");
      expect(opts.headers.Authorization).toBe("Bearer test-me-token");
      expect(JSON.parse(opts.body)).toMatchObject(args);

      const text = JSON.parse(result.content[0].text);
      expect(text).toHaveLength(2);
      expect(text[0].name).toBe("SEDEX");
    });
  });

  describe("sandbox mode URL switching", () => {
    it("should use sandbox URL when MELHOR_ENVIO_SANDBOX=true", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ balance: 50.0 }),
      });

      await callToolHandler({
        params: { name: "get_balance", arguments: {} },
      });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain("sandbox.melhorenvio.com.br/api/v2");
      expect(url).not.toMatch(/^https:\/\/melhorenvio\.com\.br/);
    });
  });

  describe("track_shipment", () => {
    it("should POST to /me/shipment/tracking with order ID", async () => {
      const mockTracking = {
        "order-123": { id: "order-123", status: "posted", tracking: "BR123456789" },
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTracking),
      });

      const result = await callToolHandler({
        params: { name: "track_shipment", arguments: { id: "order-123" } },
      });

      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain("/me/shipment/tracking");
      expect(opts.method).toBe("POST");
      const body = JSON.parse(opts.body);
      expect(body.orders).toContain("order-123");

      expect(result.isError).toBeUndefined();
    });
  });

  describe("API error handling", () => {
    it("should return isError true on 401 response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve("Unauthenticated"),
      });

      const result = await callToolHandler({
        params: { name: "get_balance", arguments: {} },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("401");
    });

    it("should return isError true on 422 response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        text: () => Promise.resolve('{"errors":{"postal_code":["required"]}}'),
      });

      const result = await callToolHandler({
        params: {
          name: "calculate_shipping",
          arguments: { from: {}, to: {}, products: [] },
        },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("422");
    });

    it("should return isError true on 500 response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Internal Server Error"),
      });

      const result = await callToolHandler({
        params: { name: "get_store", arguments: {} },
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

  describe("generate_label", () => {
    it("should POST to /me/shipment/generate with order IDs", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await callToolHandler({
        params: {
          name: "generate_label",
          arguments: { orders: ["order-1", "order-2"] },
        },
      });

      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain("/me/shipment/generate");
      expect(opts.method).toBe("POST");
      const body = JSON.parse(opts.body);
      expect(body.orders).toEqual(["order-1", "order-2"]);
    });
  });

  describe("list_shipments", () => {
    it("should GET /me/orders with query params", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [], total: 0 }),
      });

      await callToolHandler({
        params: {
          name: "list_shipments",
          arguments: { status: "pending", limit: 10, offset: 0 },
        },
      });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain("/me/orders");
      expect(url).toContain("status=pending");
      expect(url).toContain("limit=10");
    });
  });

  describe("Authorization header", () => {
    it("should send Bearer token in all requests", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await callToolHandler({
        params: { name: "get_store", arguments: {} },
      });

      const [, opts] = mockFetch.mock.calls[0];
      expect(opts.headers.Authorization).toBe("Bearer test-me-token");
      expect(opts.headers["User-Agent"]).toBe("mcp-melhor-envio/0.1.0");
    });
  });
});
