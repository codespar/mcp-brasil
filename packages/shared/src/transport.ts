import { randomUUID } from "node:crypto";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import express from "express";

interface StartOptions {
  /** HTTP port (default: 3000, or MCP_PORT env var) */
  port?: number;
  /** Force HTTP mode (otherwise detected via --http flag or MCP_HTTP env) */
  http?: boolean;
}

/**
 * Start an MCP server in stdio or HTTP mode.
 *
 * HTTP mode is enabled by:
 * - Passing `{ http: true }` in options
 * - Running with `--http` flag: `node dist/index.js --http`
 * - Setting `MCP_HTTP=true` environment variable
 *
 * In HTTP mode, the server exposes a single `/mcp` endpoint supporting
 * POST (JSON-RPC), GET (SSE stream), and DELETE (session termination).
 */
export async function startServer(
  server: Server,
  options: StartOptions = {},
): Promise<void> {
  const useHttp =
    options.http ||
    process.argv.includes("--http") ||
    process.env.MCP_HTTP === "true";

  if (useHttp) {
    await startHttpServer(server, options.port);
  } else {
    await startStdioServer(server);
  }
}

async function startStdioServer(server: Server): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

async function startHttpServer(
  server: Server,
  port?: number,
): Promise<void> {
  const httpPort = port || Number(process.env.MCP_PORT) || 3000;
  const app = express();
  app.use(express.json());

  // Session → transport mapping
  const transports = new Map<string, StreamableHTTPServerTransport>();

  // Health check
  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      sessions: transports.size,
    });
  });

  // POST /mcp — JSON-RPC requests
  app.post("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    if (sessionId && transports.has(sessionId)) {
      const transport = transports.get(sessionId)!;
      await transport.handleRequest(req, res, req.body);
      return;
    }

    if (!sessionId && isInitializeRequest(req.body)) {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sid) => {
          transports.set(sid, transport);
        },
      });

      transport.onclose = () => {
        if (transport.sessionId) {
          transports.delete(transport.sessionId);
        }
      };

      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      return;
    }

    res.status(400).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Bad Request: No valid session ID" },
      id: null,
    });
  });

  // GET /mcp — SSE stream for server notifications
  app.get("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !transports.has(sessionId)) {
      res.status(400).send("Invalid or missing session ID");
      return;
    }
    await transports.get(sessionId)!.handleRequest(req, res);
  });

  // DELETE /mcp — session termination
  app.delete("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !transports.has(sessionId)) {
      res.status(400).send("Invalid or missing session ID");
      return;
    }
    await transports.get(sessionId)!.handleRequest(req, res);
  });

  app.listen(httpPort, () => {
    console.error(`MCP HTTP server running on http://localhost:${httpPort}/mcp`);
    console.error(`Health check: http://localhost:${httpPort}/health`);
  });
}
