#!/usr/bin/env node

/**
 * Audit script to find all agents with poisoned passwordChangedAt timestamps
 * and fix them by setting to NULL
 */

import { drizzle } from "drizzle-orm/mysql2/promise";
import { createConnection } from "mysql2/promise";
import { agents } from "./drizzle/schema.ts";
import { eq, isNotNull, isNull } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable not set");
  process.exit(1);
}

async function auditAgents() {
  let connection;
  try {
    console.log("🔍 Auditing agents table...\n");
    
    // Create connection
    connection = await createConnection(DATABASE_URL);
    const db = drizzle(connection);

    // Get all agents
    const allAgents = await db.select().from(agents);
    
    console.log(`📊 Total agents: ${allAgents.length}\n`);
    console.log("━".repeat(80));
    console.log("Agent Details:");
    console.log("━".repeat(80));
    
    allAgents.forEach((agent, idx) => {
      const hasTimestamp = agent.passwordChangedAt !== null && agent.passwordChangedAt !== undefined;
      const status = hasTimestamp ? "❌ HAS TIMESTAMP" : "✅ NULL (CORRECT)";
      
      console.log(`\n${idx + 1}. ${agent.firstName} ${agent.lastName}`);
      console.log(`   Email: ${agent.email}`);
      console.log(`   ID: ${agent.id}`);
      console.log(`   Status: ${status}`);
      if (hasTimestamp) {
        console.log(`   passwordChangedAt: ${agent.passwordChangedAt}`);
      }
      console.log(`   Created: ${agent.createdAt}`);
    });

    // Count affected agents
    const affectedAgents = allAgents.filter(a => a.passwordChangedAt !== null && a.passwordChangedAt !== undefined);
    
    console.log("\n" + "━".repeat(80));
    console.log("📈 Summary:");
    console.log("━".repeat(80));
    console.log(`Total agents: ${allAgents.length}`);
    console.log(`Agents with poisoned timestamp: ${affectedAgents.length}`);
    console.log(`Agents with NULL (correct): ${allAgents.length - affectedAgents.length}`);

    if (affectedAgents.length > 0) {
      console.log("\n⚠️  AFFECTED AGENTS (need fixing):");
      affectedAgents.forEach(agent => {
        console.log(`   - ${agent.firstName} ${agent.lastName} (${agent.email})`);
      });

      console.log("\n🔧 FIX: Running migration to reset passwordChangedAt to NULL...\n");
      
      // Reset all affected agents
      for (const agent of affectedAgents) {
        await db.update(agents)
          .set({ passwordChangedAt: null })
          .where(eq(agents.id, agent.id));
        console.log(`✅ Reset agent ${agent.id}: ${agent.firstName} ${agent.lastName}`);
      }

      console.log("\n✅ Migration complete! All agents can now be prompted for password setup.");
    } else {
      console.log("\n✅ No affected agents found. Database is clean!");
    }

    await connection.end();
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

auditAgents();
