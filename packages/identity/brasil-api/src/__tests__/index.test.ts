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
describe("mcp-brasil-api", () => {
  const EXPECTED_TOOLS = [
    "get_cep",
    "get_cnpj",
    "get_banks",
    "get_holidays",
    "get_fipe_brands",
    "get_fipe_price",
    "get_ddd",
    "get_isbn",
    "get_ncm",
    "get_cptec_weather",
    "get_pix_participants",
    "get_domain_info",
    "get_ibge_municipalities",
    "get_tax_rates",
    "get_cptec_cities",
  ];

  describe("ListTools", () => {
    it("should register exactly 24 tools", async () => {
      const result = await listToolsHandler();
      expect(result.tools).toHaveLength(24);
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

  describe("get_cep", () => {
    it("should look up a CEP and return address data", async () => {
      const mockAddress = {
        cep: "01001000",
        state: "SP",
        city: "São Paulo",
        neighborhood: "Sé",
        street: "Praça da Sé",
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAddress),
      });

      const result = await callToolHandler({
        params: { name: "get_cep", arguments: { cep: "01001000" } },
      });

      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toBe("https://brasilapi.com.br/api/cep/v2/01001000");
      expect(opts.method).toBe("GET");

      const text = JSON.parse(result.content[0].text);
      expect(text.cep).toBe("01001000");
      expect(text.city).toBe("São Paulo");
    });
  });

  describe("get_cnpj", () => {
    it("should look up a CNPJ and return company data", async () => {
      const mockCompany = {
        cnpj: "19131243000197",
        razao_social: "Test Company LTDA",
        nome_fantasia: "Test Co",
        situacao_cadastral: "Ativa",
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCompany),
      });

      const result = await callToolHandler({
        params: { name: "get_cnpj", arguments: { cnpj: "19131243000197" } },
      });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toBe("https://brasilapi.com.br/api/cnpj/v1/19131243000197");

      const text = JSON.parse(result.content[0].text);
      expect(text.razao_social).toBe("Test Company LTDA");
    });
  });

  describe("invalid input handling", () => {
    it("should return error for non-existent CEP (404)", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve('{"message":"CEP 99999999 not found"}'),
      });

      const result = await callToolHandler({
        params: { name: "get_cep", arguments: { cep: "99999999" } },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("404");
    });

    it("should return error for invalid CNPJ (400)", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve('{"message":"CNPJ inválido"}'),
      });

      const result = await callToolHandler({
        params: { name: "get_cnpj", arguments: { cnpj: "00000000000000" } },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("400");
    });

    it("should return isError true for unknown tool", async () => {
      const result = await callToolHandler({
        params: { name: "nonexistent", arguments: {} },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Unknown tool");
    });
  });

  describe("get_banks", () => {
    it("should GET /banks/v1 with no arguments", async () => {
      const mockBanks = [
        { ispb: "00000000", name: "BCB", code: 0 },
        { ispb: "60701190", name: "Itaú", code: 341 },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBanks),
      });

      const result = await callToolHandler({
        params: { name: "get_banks", arguments: {} },
      });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toBe("https://brasilapi.com.br/api/banks/v1");

      const text = JSON.parse(result.content[0].text);
      expect(text).toHaveLength(2);
    });
  });

  describe("get_holidays", () => {
    it("should GET /feriados/v1/:year", async () => {
      const mockHolidays = [
        { date: "2026-01-01", name: "Confraternização Universal", type: "national" },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHolidays),
      });

      const result = await callToolHandler({
        params: { name: "get_holidays", arguments: { year: 2026 } },
      });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toBe("https://brasilapi.com.br/api/feriados/v1/2026");

      const text = JSON.parse(result.content[0].text);
      expect(text[0].name).toBe("Confraternização Universal");
    });
  });

  describe("API error handling", () => {
    it("should return isError true on 500 response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Internal Server Error"),
      });

      const result = await callToolHandler({
        params: { name: "get_banks", arguments: {} },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("500");
    });
  });
});

// ---------------------------------------------------------------------------
// Outbound HTTP identity
//
// Node's fetch (undici) fills in "User-Agent: node" when the caller does not
// set one, and BrasilAPI's edge answers 403 to that UA on the CNPJ route, so
// get_cnpj fails in normal use for everyone running this server. Measured
// live against brasilapi.com.br on 2026-08-28 (Node v25.5.0):
//
//   GET /cnpj/v1/00000000000191  User-Agent: node                  -> 403
//   GET /cnpj/v1/00000000000191  User-Agent: codespar-mcp-dev-...  -> 200
//   GET /cep/v1/01001000         User-Agent: node                  -> 200
//
// (the CEP route answers 200 either way, which is why only CNPJ surfaced).
// These tests pin the header on the request this server actually builds; the
// live half of the evidence is in contract.test.ts, behind BRASIL_API_CONTRACT.
// ---------------------------------------------------------------------------
describe("outbound HTTP identity", () => {
  // What undici puts on the wire when no User-Agent is supplied. This is the
  // value BrasilAPI rejects, so it is the value the request must not carry.
  const NODE_DEFAULT_UA = "node";

  function headersOfCall(callIndex: number): Headers {
    const [, init] = mockFetch.mock.calls[callIndex];
    return new Headers((init?.headers ?? {}) as HeadersInit);
  }

  it("sends an identifying User-Agent on get_cnpj", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ cnpj: "00000000000191" }),
    });

    await callToolHandler({
      params: { name: "get_cnpj", arguments: { cnpj: "00000000000191" } },
    });

    const headers = headersOfCall(0);

    // Positive control for this assertion's instrument: a header the server
    // has always set must be visible here. If this one is null the probe is
    // broken and the User-Agent assertions below mean nothing.
    expect(headers.get("content-type")).toBe("application/json");

    const ua = headers.get("user-agent");
    expect(
      ua,
      "no User-Agent on the outgoing request: undici will send 'node' and BrasilAPI answers 403 on /cnpj",
    ).not.toBeNull();
    expect(ua).not.toBe(NODE_DEFAULT_UA);
    expect(ua).toMatch(/mcp-brasil-api\/\d+\.\d+\.\d+/);
  });

  it("sends it on every route, not only CNPJ", async () => {
    const routes: Array<[string, Record<string, unknown>]> = [
      ["get_cep", { cep: "01001000" }],
      ["get_banks", {}],
      ["get_holidays", { year: 2026 }],
    ];

    for (const [name, args] of routes) {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
      await callToolHandler({ params: { name, arguments: args } });
    }

    expect(mockFetch.mock.calls).toHaveLength(routes.length);

    routes.forEach(([name], i) => {
      const headers = headersOfCall(i);
      expect(headers.get("content-type"), `${name}: probe broken`).toBe("application/json");
      const ua = headers.get("user-agent");
      expect(ua, `${name} went out without a User-Agent`).not.toBeNull();
      expect(ua, `${name} went out with the Node default UA`).not.toBe(NODE_DEFAULT_UA);
    });
  });
});
