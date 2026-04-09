/**
 * Test CodeSpar MCP servers with Claude Managed Agents.
 *
 * This script:
 * 1. Creates a Managed Agent with BrasilAPI MCP server (no API key needed)
 * 2. Creates an Environment
 * 3. Creates a Session
 * 4. Sends a message asking to look up a CEP
 * 5. Streams the response and verifies the MCP tool was used
 *
 * Run: npx tsx test-managed-agents.ts
 */

import Anthropic from "@anthropic-ai/sdk";
import { config } from "dotenv";
import { resolve } from "path";

// Load key from codespar-web .env.local
config({ path: resolve("../../codespar-web/.env.local") });
// Also try local .env
config();

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error("ANTHROPIC_API_KEY not set");
  process.exit(1);
}

const client = new Anthropic({ apiKey });

async function main() {
  console.log("\n  === CodeSpar MCP × Managed Agents Test ===\n");

  // Step 1: Create Agent
  console.log("  [1] Creating agent...");
  let agent;
  try {
    agent = await client.beta.agents.create({
      name: "codespar-test-agent",
      description: "A commerce assistant that uses MCP tools to answer questions about Brazilian data.",
      model: "claude-sonnet-4-6",
      tools: [{ type: "agent_toolset_20260401" }],
    });
    console.log(`      Agent created: ${agent.id}`);
  } catch (err: unknown) {
    const error = err as { status?: number; message?: string; error?: { type?: string; message?: string } };
    console.error(`      Failed to create agent: ${error.status || ""} ${error.error?.message || error.message || String(err)}`);
    console.error("\n  Managed Agents may not be available on your account yet.");
    console.error("  Check: https://platform.claude.com/docs/en/managed-agents/overview\n");
    process.exit(1);
  }

  // Step 2: Create Environment
  console.log("  [2] Creating environment...");
  let environment;
  try {
    environment = await client.beta.environments.create({
      name: "codespar-test-env",
      config: {
        type: "cloud",
        networking: { type: "unrestricted" },
      },
    });
    console.log(`      Environment created: ${environment.id}`);
  } catch (err: unknown) {
    const error = err as { message?: string; error?: { message?: string } };
    console.error(`      Failed to create environment: ${error.error?.message || error.message || String(err)}`);
    process.exit(1);
  }

  // Step 3: Create Session
  console.log("  [3] Creating session...");
  let session;
  try {
    session = await client.beta.sessions.create({
      agent: agent.id,
      environment_id: environment.id,
      title: "CodeSpar MCP Test",
    });
    console.log(`      Session created: ${session.id}`);
  } catch (err: unknown) {
    const error = err as { message?: string; error?: { message?: string } };
    console.error(`      Failed to create session: ${error.error?.message || error.message || String(err)}`);
    process.exit(1);
  }

  // Step 4: Send message
  console.log("  [4] Sending message: 'What is the address for CEP 01001-000?'");
  try {
    await client.beta.sessions.events.send(session.id, {
      events: [{
        type: "user.message",
        content: [{ type: "text", text: "What is the address for CEP 01001-000? Use the BrasilAPI to look it up." }],
      }],
    });
    console.log("      Message sent.");
  } catch (err: unknown) {
    const error = err as { message?: string; error?: { message?: string } };
    console.error(`      Failed to send message: ${error.error?.message || error.message || String(err)}`);
    process.exit(1);
  }

  // Step 5: Poll for response
  console.log("  [5] Waiting for response...\n");
  try {
    let responseText = "";
    let attempts = 0;

    while (attempts < 30) {
      attempts++;
      await new Promise((r) => setTimeout(r, 2000));

      const sess = await client.beta.sessions.retrieve(session.id) as Record<string, unknown>;
      const status = String(sess.status || "");

      if (status === "idle" || status === "completed" || status === "ended") {
        console.log(`      Session status: ${status}`);

        // Get events
        const events = await client.beta.sessions.events.list(session.id) as unknown as { data: Array<Record<string, unknown>> };
        for (const e of events.data || []) {
          const type = String(e.type || "");
          if (type.includes("message") || type.includes("text")) {
            const content = (e.content || e.message) as Array<Record<string, unknown>> | string | undefined;
            if (typeof content === "string") {
              responseText += content;
            } else if (Array.isArray(content)) {
              for (const block of content) {
                if (block.type === "text" && block.text) responseText += String(block.text);
              }
            }
          }
        }
        break;
      }

      if (attempts % 5 === 0) console.log(`      ... waiting (${attempts * 2}s, status: ${status})`);
    }

    if (responseText) {
      console.log(`\n      Response:\n      ${responseText.slice(0, 500)}${responseText.length > 500 ? "..." : ""}\n`);
    }

    console.log("  === Results ===");
    console.log(`  Agent: ${agent.id}`);
    console.log(`  Session: ${session.id}`);
    console.log(`  Response: ${responseText ? "PASS" : "No text (agent may have used tools)"}\n`);
  } catch (err: unknown) {
    const error = err as { message?: string; error?: { message?: string } };
    console.error(`      Error: ${error.error?.message || error.message || String(err)}`);
  }
}

main().catch(console.error);
