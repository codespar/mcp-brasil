# x402 demo server — public 402 paywall ($0.001 USDC on Base Sepolia).
# Deployed as a CodeSpar example API so agents can pay a real 402 resource.
# Env (set in Railway, NOT baked in): SERVER_ADDRESS (payee 0x), FACILITATOR_URL.
# Do NOT copy .env into the image — it holds the example CLIENT_PRIVATE_KEY.
FROM node:22-slim
WORKDIR /app

COPY package.json ./
# Full install (not --omit=dev): the server runs via `tsx`, a devDependency.
RUN npm install --no-audit --no-fund

COPY server.ts ./

# Railway injects PORT; the server reads process.env.PORT (fallback 4021).
ENV PORT=4021
EXPOSE 4021

CMD ["npx", "tsx", "server.ts"]
