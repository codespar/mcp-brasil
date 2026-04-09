/**
 * Shared dual-transport launcher for CodeSpar MCP servers.
 *
 * Supports two modes:
 * - stdio (default): runs as a child process, communicates via stdin/stdout
 * - http (--http flag or MCP_HTTP=true): runs as HTTP server with Streamable HTTP transport
 *
 * Usage in any MCP server:
 *
 *   import { Server } from "@modelcontextprotocol/sdk/server/index.js";
 *   import { startServer } from "@codespar/mcp-shared";
 *
 *   const server = new Server({ name: "mcp-foo", version: "0.1.0" }, { capabilities: { tools: {} } });
 *   // ... register handlers ...
 *   startServer(server);
 */

export { startServer } from "./transport.js";
