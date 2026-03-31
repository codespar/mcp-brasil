#!/usr/bin/env node

/**
 * MCP Server for Mercado Bitcoin — Brazilian cryptocurrency exchange.
 *
 * Tools:
 * - get_ticker: Get ticker data for a trading pair
 * - list_orderbook: Get order book for a trading pair
 * - create_order: Create a buy or sell order
 * - get_order: Get order details by ID
 * - cancel_order: Cancel an open order
 * - list_orders: List orders with filters
 * - get_balance: Get account balances
 * - list_trades: List executed trades
 * - get_candles: Get candlestick/OHLCV data
 * - withdraw: Create a withdrawal request
 *
 * Environment:
 *   MB_API_KEY — API key from https://www.mercadobitcoin.com.br/
 *   MB_API_SECRET — API secret
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const API_KEY = process.env.MB_API_KEY || "";
const API_SECRET = process.env.MB_API_SECRET || "";
const BASE_URL = "https://api.mercadobitcoin.net/api/v4";

async function mbRequest(method: string, path: string, body?: unknown): Promise<unknown> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": API_KEY,
      "X-API-Secret": API_SECRET,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Mercado Bitcoin API ${res.status}: ${err}`);
  }
  return res.json();
}

const server = new Server(
  { name: "mcp-mercado-bitcoin", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_ticker",
      description: "Get ticker data for a trading pair (price, volume, etc.)",
      inputSchema: {
        type: "object",
        properties: {
          symbol: { type: "string", description: "Trading pair symbol (e.g. BTC-BRL, ETH-BRL, USDC-BRL)" },
        },
        required: ["symbol"],
      },
    },
    {
      name: "list_orderbook",
      description: "Get order book (bids and asks) for a trading pair",
      inputSchema: {
        type: "object",
        properties: {
          symbol: { type: "string", description: "Trading pair symbol (e.g. BTC-BRL)" },
          limit: { type: "number", description: "Number of entries per side (default 20)" },
        },
        required: ["symbol"],
      },
    },
    {
      name: "create_order",
      description: "Create a buy or sell order",
      inputSchema: {
        type: "object",
        properties: {
          symbol: { type: "string", description: "Trading pair symbol (e.g. BTC-BRL)" },
          side: { type: "string", enum: ["buy", "sell"], description: "Order side" },
          type: { type: "string", enum: ["limit", "market"], description: "Order type" },
          qty: { type: "string", description: "Quantity to buy/sell" },
          limitPrice: { type: "string", description: "Limit price (required for limit orders)" },
        },
        required: ["symbol", "side", "type", "qty"],
      },
    },
    {
      name: "get_order",
      description: "Get order details by ID",
      inputSchema: {
        type: "object",
        properties: {
          symbol: { type: "string", description: "Trading pair symbol" },
          orderId: { type: "string", description: "Order ID" },
        },
        required: ["symbol", "orderId"],
      },
    },
    {
      name: "cancel_order",
      description: "Cancel an open order",
      inputSchema: {
        type: "object",
        properties: {
          symbol: { type: "string", description: "Trading pair symbol" },
          orderId: { type: "string", description: "Order ID to cancel" },
        },
        required: ["symbol", "orderId"],
      },
    },
    {
      name: "list_orders",
      description: "List orders with optional filters",
      inputSchema: {
        type: "object",
        properties: {
          symbol: { type: "string", description: "Trading pair symbol" },
          status: { type: "string", enum: ["open", "filled", "cancelled", "partially_filled"], description: "Filter by status" },
          side: { type: "string", enum: ["buy", "sell"], description: "Filter by side" },
          limit: { type: "number", description: "Number of results" },
        },
        required: ["symbol"],
      },
    },
    {
      name: "get_balance",
      description: "Get account balances for all assets",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "list_trades",
      description: "List executed trades for a trading pair",
      inputSchema: {
        type: "object",
        properties: {
          symbol: { type: "string", description: "Trading pair symbol" },
          from: { type: "string", description: "Start timestamp (ISO 8601)" },
          to: { type: "string", description: "End timestamp (ISO 8601)" },
          limit: { type: "number", description: "Number of results" },
        },
        required: ["symbol"],
      },
    },
    {
      name: "get_candles",
      description: "Get candlestick/OHLCV data for a trading pair",
      inputSchema: {
        type: "object",
        properties: {
          symbol: { type: "string", description: "Trading pair symbol (e.g. BTC-BRL)" },
          resolution: { type: "string", enum: ["1m", "5m", "15m", "30m", "1h", "4h", "1d", "1w"], description: "Candle resolution" },
          from: { type: "string", description: "Start timestamp (ISO 8601)" },
          to: { type: "string", description: "End timestamp (ISO 8601)" },
          limit: { type: "number", description: "Number of candles" },
        },
        required: ["symbol", "resolution"],
      },
    },
    {
      name: "withdraw",
      description: "Create a withdrawal request",
      inputSchema: {
        type: "object",
        properties: {
          symbol: { type: "string", description: "Asset symbol (e.g. BTC, ETH, BRL)" },
          quantity: { type: "string", description: "Amount to withdraw" },
          address: { type: "string", description: "Destination address (crypto) or bank account ID (BRL)" },
          network: { type: "string", description: "Blockchain network (for crypto withdrawals)" },
        },
        required: ["symbol", "quantity", "address"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "get_ticker":
        return { content: [{ type: "text", text: JSON.stringify(await mbRequest("GET", `/tickers?symbols=${args?.symbol}`), null, 2) }] };
      case "list_orderbook": {
        const params = new URLSearchParams();
        if (args?.limit) params.set("limit", String(args.limit));
        return { content: [{ type: "text", text: JSON.stringify(await mbRequest("GET", `/${args?.symbol}/orderbook?${params}`), null, 2) }] };
      }
      case "create_order":
        return { content: [{ type: "text", text: JSON.stringify(await mbRequest("POST", `/${args?.symbol}/orders`, args), null, 2) }] };
      case "get_order":
        return { content: [{ type: "text", text: JSON.stringify(await mbRequest("GET", `/${args?.symbol}/orders/${args?.orderId}`), null, 2) }] };
      case "cancel_order":
        return { content: [{ type: "text", text: JSON.stringify(await mbRequest("DELETE", `/${args?.symbol}/orders/${args?.orderId}`), null, 2) }] };
      case "list_orders": {
        const params = new URLSearchParams();
        if (args?.status) params.set("status", String(args.status));
        if (args?.side) params.set("side", String(args.side));
        if (args?.limit) params.set("limit", String(args.limit));
        return { content: [{ type: "text", text: JSON.stringify(await mbRequest("GET", `/${args?.symbol}/orders?${params}`), null, 2) }] };
      }
      case "get_balance":
        return { content: [{ type: "text", text: JSON.stringify(await mbRequest("GET", "/accounts/balances"), null, 2) }] };
      case "list_trades": {
        const params = new URLSearchParams();
        if (args?.from) params.set("from", String(args.from));
        if (args?.to) params.set("to", String(args.to));
        if (args?.limit) params.set("limit", String(args.limit));
        return { content: [{ type: "text", text: JSON.stringify(await mbRequest("GET", `/${args?.symbol}/trades?${params}`), null, 2) }] };
      }
      case "get_candles": {
        const params = new URLSearchParams();
        params.set("resolution", String(args?.resolution));
        if (args?.from) params.set("from", String(args.from));
        if (args?.to) params.set("to", String(args.to));
        if (args?.limit) params.set("limit", String(args.limit));
        return { content: [{ type: "text", text: JSON.stringify(await mbRequest("GET", `/${args?.symbol}/candles?${params}`), null, 2) }] };
      }
      case "withdraw":
        return { content: [{ type: "text", text: JSON.stringify(await mbRequest("POST", "/withdrawals", args), null, 2) }] };
      default:
        return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
    }
  } catch (err) {
    return { content: [{ type: "text", text: `Error: ${err instanceof Error ? err.message : String(err)}` }], isError: true };
  }
});

async function main() {
  if (!API_KEY) {
    console.error("MB_API_KEY environment variable is required");
    process.exit(1);
  }
  if (!API_SECRET) {
    console.error("MB_API_SECRET environment variable is required");
    process.exit(1);
  }
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
