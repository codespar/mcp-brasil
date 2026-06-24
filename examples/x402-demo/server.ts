/**
 * x402 Demo Server — Express with 402 paywall on Base Sepolia
 *
 * This server protects endpoints with micropayment paywalls.
 * When an agent (or any HTTP client) hits a protected endpoint,
 * it receives HTTP 402 with payment instructions. The x402 client
 * automatically pays USDC on Base Sepolia and retries.
 *
 * Run: npx tsx server.ts
 */

import { config } from "dotenv";
import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";

config();

const serverAddress = process.env.SERVER_ADDRESS as `0x${string}`;
const facilitatorUrl = process.env.FACILITATOR_URL || "https://x402.org/facilitator";

const facilitatorClient = new HTTPFacilitatorClient({ url: facilitatorUrl });

const app = express();

// Register x402 payment middleware
app.use(
  paymentMiddleware(
    {
      "GET /api/market-data": {
        accepts: {
          scheme: "exact",
          price: "$0.001",
          network: "eip155:84532", // Base Sepolia
          payTo: serverAddress,
        },
        description: "Real-time market data feed",
        mimeType: "application/json",
      },
      "GET /api/premium-analysis": {
        accepts: {
          scheme: "exact",
          price: "$0.01",
          network: "eip155:84532",
          payTo: serverAddress,
        },
        description: "Premium AI-powered market analysis",
        mimeType: "application/json",
      },
    },
    new x402ResourceServer(facilitatorClient).register(
      "eip155:84532",
      new ExactEvmScheme()
    ),
  ),
);

// Free endpoint (no paywall)
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", protocol: "x402", network: "base-sepolia" });
});

// Paywalled endpoints
app.get("/api/market-data", (_req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    pairs: [
      { symbol: "BTC/USD", price: 68420.50, change24h: 2.3 },
      { symbol: "ETH/USD", price: 3850.75, change24h: 1.8 },
      { symbol: "SOL/USD", price: 142.30, change24h: -0.5 },
    ],
    source: "codespar-x402-demo",
  });
});

app.get("/api/premium-analysis", (_req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    analysis: "BTC showing bullish momentum with support at $67k. ETH/BTC ratio improving. SOL facing resistance at $145.",
    sentiment: { overall: "bullish", confidence: 0.78 },
    signals: [
      { asset: "BTC", signal: "buy", timeframe: "4h" },
      { asset: "ETH", signal: "hold", timeframe: "4h" },
      { asset: "SOL", signal: "sell", timeframe: "1h" },
    ],
    source: "codespar-x402-demo",
  });
});

const PORT = Number(process.env.PORT) || 4021;
app.listen(PORT, () => {
  console.log(`\n  x402 Demo Server running on http://localhost:${PORT}`);
  console.log(`  Network: Base Sepolia (eip155:84532)`);
  console.log(`  Payee: ${serverAddress}\n`);
  console.log(`  Endpoints:`);
  console.log(`    GET /api/health           — free`);
  console.log(`    GET /api/market-data      — $0.001 USDC`);
  console.log(`    GET /api/premium-analysis — $0.01  USDC\n`);
});
