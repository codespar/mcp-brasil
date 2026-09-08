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
  process.env.CPFCNPJ_TOKEN = "test-token";
  delete process.env.CPFCNPJ_API_BASE;
  await import("../index.js");
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("mcp-cpfcnpj", () => {
  const EXPECTED_TOOLS = ["companies_lookup", "persons_lookup"];

  it("registers the identity tools", async () => {
    const res = await listToolsHandler({});
    const names = res.tools.map((t: any) => t.name);
    for (const tool of EXPECTED_TOOLS) {
      expect(names).toContain(tool);
    }
    expect(names).toHaveLength(EXPECTED_TOOLS.length);
  });

  describe("companies_lookup", () => {
    it("calls package 6 by default and returns a success result", async () => {
      const payload = {
        status: 1,
        razao: "ALAS TECNOLOGIA LTDA",
        fantasia: "ALAS",
        situacao: "ATIVA",
        porte: "ME",
        simplesNacional: false,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(payload)),
      });

      const result = await callToolHandler({
        params: { name: "companies_lookup", arguments: { cnpj: "27.272.134/0001-18" } },
      });

      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toBe("https://api.cpfcnpj.com.br/test-token/6/27272134000118");
      expect(opts.method).toBe("GET");

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.ok).toBe(true);
      expect(parsed.pacote).toBe("6");
      expect(parsed.documento).toBe("27272134000118");
      expect(parsed.data.razao).toBe("ALAS TECNOLOGIA LTDA");
    });

    it("honours an explicit package 5", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ status: 1, razao: "X" })),
      });

      await callToolHandler({
        params: { name: "companies_lookup", arguments: { cnpj: "27272134000118", pacote: "5" } },
      });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toBe("https://api.cpfcnpj.com.br/test-token/5/27272134000118");
    });

    it("maps provider status 0 to ok:false", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ status: 0, message: "documento nao encontrado" })),
      });

      const result = await callToolHandler({
        params: { name: "companies_lookup", arguments: { cnpj: "27272134000118" } },
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.ok).toBe(false);
      expect(parsed.provider_status).toBe(0);
      expect(parsed.error).toBe("documento nao encontrado");
      expect(result.isError).toBe(true);
    });

    it("fails closed on a non-numeric provider status", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ status: "pending" })),
      });

      const result = await callToolHandler({
        params: { name: "companies_lookup", arguments: { cnpj: "27272134000118" } },
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.ok).toBe(false);
      expect(result.isError).toBe(true);
    });

    it("fails closed on a non-JSON 2xx body", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve("<html>upstream error</html>"),
      });

      const result = await callToolHandler({
        params: { name: "companies_lookup", arguments: { cnpj: "27272134000118" } },
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.ok).toBe(false);
      expect(result.isError).toBe(true);
    });

    it("rejects a CNPJ whose check digits are not numeric", async () => {
      const result = await callToolHandler({
        params: { name: "companies_lookup", arguments: { cnpj: "272721340001AB" } },
      });
      expect(result.isError).toBe(true);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("rejects a malformed CNPJ before any HTTP call", async () => {
      const result = await callToolHandler({
        params: { name: "companies_lookup", arguments: { cnpj: "123" } },
      });
      expect(result.isError).toBe(true);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("persons_lookup", () => {
    it("calls package 3 by default", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ status: 1, nome: "FULANO DE TAL" })),
      });

      const result = await callToolHandler({
        params: { name: "persons_lookup", arguments: { cpf: "123.456.789-09" } },
      });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toBe("https://api.cpfcnpj.com.br/test-token/3/12345678909");

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.ok).toBe(true);
      expect(parsed.data.nome).toBe("FULANO DE TAL");
    });

    it("honours an explicit package 1", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ status: 1, nome: "X" })),
      });

      await callToolHandler({
        params: { name: "persons_lookup", arguments: { cpf: "12345678909", pacote: "1" } },
      });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toBe("https://api.cpfcnpj.com.br/test-token/1/12345678909");
    });

    it("rejects a malformed CPF before any HTTP call", async () => {
      const result = await callToolHandler({
        params: { name: "persons_lookup", arguments: { cpf: "abc" } },
      });
      expect(result.isError).toBe(true);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("configuration and transport", () => {
    it("returns a configuration error when the token is absent", async () => {
      delete process.env.CPFCNPJ_TOKEN;
      const result = await callToolHandler({
        params: { name: "persons_lookup", arguments: { cpf: "12345678909" } },
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.ok).toBe(false);
      expect(parsed.error).toContain("CPFCNPJ_TOKEN");
      expect(result.isError).toBe(true);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("propagates an HTTP error as ok:false", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: () => Promise.resolve("forbidden"),
      });

      const result = await callToolHandler({
        params: { name: "companies_lookup", arguments: { cnpj: "27272134000118" } },
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.ok).toBe(false);
      expect(parsed.status).toBe(403);
      expect(result.isError).toBe(true);
    });

    it("sends an identifying User-Agent that is not the Node default", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ status: 1 })),
      });

      await callToolHandler({
        params: { name: "companies_lookup", arguments: { cnpj: "27272134000118" } },
      });

      const [, init] = mockFetch.mock.calls[0];
      const headers = new Headers((init?.headers ?? {}) as HeadersInit);
      const ua = headers.get("user-agent");
      expect(ua).not.toBeNull();
      expect(ua).not.toBe("node");
    });

    it("returns an error for an unknown tool", async () => {
      const result = await callToolHandler({
        params: { name: "does_not_exist", arguments: {} },
      });
      expect(result.isError).toBe(true);
    });
  });
});
