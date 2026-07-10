/**
 * x402 Demo Server — Express with 402 paywall on Base (mainnet or Sepolia)
 *
 * This server protects endpoints with micropayment paywalls.
 * When an agent (or any HTTP client) hits a protected endpoint,
 * it receives HTTP 402 with payment instructions. The x402 client
 * automatically pays USDC on Base and retries.
 *
 * Network is env-driven:
 *   X402_NETWORK=eip155:8453   -> Base MAINNET (real USDC). Requires
 *     CDP_API_KEY_ID + CDP_API_KEY_SECRET: mainnet verify/settle goes through
 *     the Coinbase CDP facilitator (the public x402.org facilitator is
 *     Sepolia-only).
 *   unset / eip155:84532       -> Base Sepolia (faucet USDC), public facilitator.
 *
 * Run: npx tsx server.ts
 */

import { config } from "dotenv";
import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { facilitator as cdpFacilitator } from "@coinbase/x402";

config();

const serverAddress = process.env.SERVER_ADDRESS as `0x${string}`;
const network = (process.env.X402_NETWORK || "eip155:84532") as `eip155:${string}`;
const isMainnet = network === "eip155:8453";

// Mainnet verify/settle requires the CDP facilitator (authenticated).
// Testnet keeps the public facilitator (overridable via FACILITATOR_URL).
const facilitatorClient = isMainnet
  ? new HTTPFacilitatorClient(cdpFacilitator)
  : new HTTPFacilitatorClient({
      url: process.env.FACILITATOR_URL || "https://x402.org/facilitator",
    });

if (isMainnet && (!process.env.CDP_API_KEY_ID || !process.env.CDP_API_KEY_SECRET)) {
  console.error("X402_NETWORK is mainnet but CDP_API_KEY_ID/CDP_API_KEY_SECRET are missing.");
  process.exit(1);
}

const app = express();

// Register x402 payment middleware
app.use(
  paymentMiddleware(
    {
      "GET /api/market-data": {
        accepts: {
          scheme: "exact",
          price: "$0.001",
          network,
          payTo: serverAddress,
        },
        description: "Real-time market data feed",
        mimeType: "application/json",
      },
      "GET /api/premium-analysis": {
        accepts: {
          scheme: "exact",
          price: "$0.01",
          network,
          payTo: serverAddress,
        },
        description: "Premium AI-powered market analysis",
        mimeType: "application/json",
      },
    },
    new x402ResourceServer(facilitatorClient).register(network, new ExactEvmScheme()),
  ),
);

// Free endpoint (no paywall)
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    protocol: "x402",
    network: isMainnet ? "base" : "base-sepolia",
    chain: network,
  });
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
  console.log(`  Network: ${isMainnet ? "Base MAINNET (real USDC)" : "Base Sepolia"} (${network})`);
  console.log(`  Facilitator: ${isMainnet ? "Coinbase CDP (authenticated)" : "public x402.org"}`);
  console.log(`  Payee: ${serverAddress}\n`);
  console.log(`  Endpoints:`);
  console.log(`    GET /api/health           — free`);
  console.log(`    GET /api/market-data      — $0.001 USDC`);
  console.log(`    GET /api/premium-analysis — $0.01  USDC\n`);
});
