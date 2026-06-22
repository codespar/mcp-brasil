#!/usr/bin/env node
/**
 * Inject the managed-tier pointer into every standalone server's primary
 * `Server` via the MCP `instructions` field — the conversion hook for the
 * self-hosted, account-less user (someone running `@codespar/mcp-<x>` in Claude
 * Code with only the provider's key, who never touches our dashboard and is
 * otherwise invisible to us).
 *
 * It is INFORMATIONAL only: a static string surfaced to the agent on the MCP
 * `initialize` handshake. Nothing CodeSpar-hosted is called, nothing is phoned
 * home, and no functionality is gated — so it stays within the MIT five-point
 * commitment (self-hostable, no telemetry that restricts).
 *
 * DRY at source (the hint text lives here), standalone at runtime (an inline
 * const, no shared runtime dependency added to the lean server packages). Run
 * after adding/regenerating servers; idempotent.
 *
 *   node scripts/add-managed-hint.mjs --dry   # report only
 *   node scripts/add-managed-hint.mjs         # write
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry");

// The single source of the hint text. Kept in one place; injected verbatim.
const HINT_VALUE =
  '"This open-source CodeSpar server calls the provider\'s API directly. ' +
  "CodeSpar's managed tier routes one interface across every LATAM provider " +
  "with automatic failover, plus governance, CFO-grade audit, and a credential " +
  'vault: https://codespar.dev/agents (npx -y @codespar/mcp serve)."';

const CONST_BLOCK =
  "// Managed-tier pointer surfaced to the agent via MCP `instructions`.\n" +
  "// Informational only — nothing CodeSpar-hosted is called (MIT-safe).\n" +
  `const MANAGED_TIER_HINT =\n  ${HINT_VALUE};\n\n`;

const PRIMARY = "const server = new Server(";
const CAP = "{ capabilities: { tools: {} } }";
const CAP_WITH = "{ capabilities: { tools: {} }, instructions: MANAGED_TIER_HINT }";

function findServers() {
  const out = [];
  const pkgRoot = join(ROOT, "packages");
  for (const v of readdirSync(pkgRoot)) {
    const vd = join(pkgRoot, v);
    if (!statSync(vd).isDirectory()) continue;
    for (const slug of readdirSync(vd)) {
      const f = join(vd, slug, "src", "index.ts");
      if (existsSync(f)) out.push({ slug: `${v}/${slug}`, file: f });
    }
  }
  return out;
}

let applied = 0;
const skipped = [];
for (const { slug, file } of findServers()) {
  const src = readFileSync(file, "utf8");
  if (src.includes("MANAGED_TIER_HINT") || /instructions:/.test(src)) {
    skipped.push(`${slug} (already has instructions/hint)`);
    continue;
  }
  const declIdx = src.indexOf(PRIMARY);
  if (declIdx < 0) {
    skipped.push(`${slug} (no \`const server = new Server(\` — McpServer or custom)`);
    continue;
  }
  const capIdx = src.indexOf(CAP, declIdx);
  if (capIdx < 0) {
    skipped.push(`${slug} (no standard capabilities options after primary server)`);
    continue;
  }
  // 1. add instructions to the primary server's options (this occurrence only).
  let next = src.slice(0, capIdx) + CAP_WITH + src.slice(capIdx + CAP.length);
  // 2. inject the const just before the primary server declaration.
  const at = next.indexOf(PRIMARY);
  next = next.slice(0, at) + CONST_BLOCK + next.slice(at);

  if (!DRY) writeFileSync(file, next);
  applied++;
}

console.log(`${DRY ? "[dry] would apply" : "applied"}: ${applied} servers`);
console.log(`skipped: ${skipped.length}`);
for (const s of skipped) console.log("  - " + s);
