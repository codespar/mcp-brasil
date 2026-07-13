import { it, expect, beforeAll, vi } from "vitest";
import {
  loadContractEnv,
  describeContract,
  parseToolResult,
} from "../../../../../test-utils/contract.js";

// --- Capture the tools/call handler; do NOT mock fetch (real network) ---
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

async function call(name: string, args: Record<string, unknown> = {}) {
  if (!callToolHandler) {
    throw new Error(
      "callToolHandler not registered — did beforeAll (vi.resetModules + import ../index.js) complete?",
    );
  }
  const result = await callToolHandler({ params: { name, arguments: args } });
  return parseToolResult(result);
}

// This block is SKIPPED in CI (no CELCOIN_CLIENT_ID). Run locally with real
// sandbox credentials in <repo-root>/.env:
//   CELCOIN_CLIENT_ID=...
//   CELCOIN_CLIENT_SECRET=...
//   CELCOIN_SANDBOX=true
//   CELCOIN_TEST_DIGITABLE=<a valid sandbox digitable line>   (optional)
// It codifies the real authorize -> confirm handshake against the sandbox host
// (sandbox.openfinance.celcoin.dev).
describeContract("mcp-celcoin", "CELCOIN_CLIENT_ID", () => {
  // A ficha-de-compensação digitable line (type 2). Override with a barcode
  // valid for your sandbox account via CELCOIN_TEST_DIGITABLE.
  const DIGITABLE =
    process.env.CELCOIN_TEST_DIGITABLE ||
    "34191790010104351004791020150008291070026000";

  beforeAll(async () => {
    process.env.CELCOIN_SANDBOX = "true";
    vi.resetModules();
    callToolHandler = undefined as any;
    await import("../index.js");
  });

  it(
    "read_barcode -> pay_bill: authorize then confirm handshake",
    async () => {
      // Step 1: authorize (consult). Real sandbox returns a transactionId that
      // opens the reservation window, or a structured error for an unpayable
      // barcode. Either way the route must resolve (no 404 on the old GET).
      const authorized = await call("read_barcode", {
        barcode: DIGITABLE,
        barcodeType: 2,
      });
      expect(authorized.text).not.toMatch(/404/);

      // If authorize did not yield a transactionId (e.g. the sample barcode is
      // not payable in this sandbox account), we have still proven the
      // authorize route resolves; there is nothing to confirm.
      const transactionId = (authorized.json as any)?.transactionId;
      const totalUpdated = (authorized.json as any)?.totalUpdated;
      if (!transactionId) {
        expect(authorized.isError).toBe(true);
        return;
      }

      // Step 2: confirm. The confirm MUST carry transactionIdAuthorize + billData;
      // without them Celcoin answers errorCode 44 "Valor nao permitido".
      const paid = await call("pay_bill", {
        barcode: DIGITABLE,
        barcodeType: 2,
        transactionIdAuthorize: String(transactionId),
        amount: totalUpdated,
        originalValue: totalUpdated,
        cpfcnpj: process.env.CELCOIN_TEST_CPFCNPJ || "12345678909",
      });
      // The confirm route must resolve; the errorCode-44 body bug must not recur.
      expect(paid.text).not.toMatch(/errorCode.*44|Valor nao permitido/i);
    },
    30000,
  );
});
