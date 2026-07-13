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

process.env.BLING_ACCESS_TOKEN = "test-token";

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

describe("mcp-bling", () => {
  it("should register 39 tools", async () => {
    const result = await listToolsHandler();
    expect(result.tools).toHaveLength(39);
  });

  it("should call correct API endpoint for list_products", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) });

    await callToolHandler({ params: { name: "list_products", arguments: {} } });

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("bling.com.br/Api/v3");
    expect(opts.headers.Authorization).toBe("Bearer test-token");
  });

  it("list_orders_with_items fetches only one summary page per call (no full-range re-fetch)", async () => {
    mockFetch.mockImplementation((url: string) => {
      const isSummary = String(url).includes("/pedidos/vendas?");
      const body = isSummary
        ? { data: [
            { id: 1, numero: "A", data: "2026-01-01", total: 10, situacao: { valor: 1 } },
            { id: 2, numero: "B", data: "2026-01-02", total: 20, situacao: { valor: 1 } },
          ] }
        : { data: { itens: [] } };
      return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(body)) });
    });

    await callToolHandler({
      params: {
        name: "list_orders_with_items",
        arguments: { dataInicial: "2026-01-01", dataFinal: "2026-01-31", page: 1 },
      },
    });

    // The fix: exactly one summary request per call, not a re-pull of the whole range.
    const summaryCalls = mockFetch.mock.calls.filter(([u]: any[]) => String(u).includes("/pedidos/vendas?"));
    expect(summaryCalls).toHaveLength(1);
    expect(String(summaryCalls[0][0])).toContain("pagina=1");
  });
});
