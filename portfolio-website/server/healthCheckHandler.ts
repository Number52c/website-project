import { Request, Response } from "express";
import { getDb } from "./db";
import { sdk } from "./_core/sdk";
import { notifyOwner } from "./_core/notification";
import { policies, agents, clients } from "../drizzle/schema";
import { count } from "drizzle-orm";

/**
 * Daily health check handler - runs at 6 AM UTC
 * Verifies system integrity and sends status report to owner
 */
export async function healthCheckHandler(req: Request, res: Response) {
  try {
    // Authenticate as cron task
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) {
      return res.status(403).json({ error: "cron-only" });
    }

    // Collect health metrics
    const metrics = {
      timestamp: new Date().toISOString(),
      taskUid: user.taskUid,
      checks: {} as Record<string, any>,
      status: "healthy" as "healthy" | "warning" | "critical",
    };

    try {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // Check database connectivity
      const [agentCount] = await db
        .select({ count: count() })
        .from(agents);
      metrics.checks.database = {
        status: "ok",
        agentsCount: agentCount?.count || 0,
      };

      // Check policies
      const [policyCount] = await db
        .select({ count: count() })
        .from(policies);
      metrics.checks.policies = {
        status: "ok",
        policiesCount: policyCount?.count || 0,
      };

      // Check clients
      const [clientCount] = await db
        .select({ count: count() })
        .from(clients);
      metrics.checks.clients = {
        status: "ok",
        clientsCount: clientCount?.count || 0,
      };

      // Check for any critical issues
      if ((agentCount?.count || 0) === 0) {
        metrics.status = "warning";
        metrics.checks.database.warning = "No agents found in system";
      }

      // Send notification to owner
      const statusEmoji = metrics.status === "healthy" ? "✅" : "⚠️";
      await notifyOwner({
        title: `${statusEmoji} Daily Health Check - ${new Date().toLocaleDateString()}`,
        content: `
System Status: ${metrics.status.toUpperCase()}

📊 Metrics:
• Agents: ${agentCount?.count || 0}
• Policies: ${policyCount?.count || 0}
• Clients: ${clientCount?.count || 0}

⏰ Check Time: ${new Date().toLocaleTimeString()}
        `.trim(),
      });

      res.json({
        ok: true,
        metrics,
      });
    } catch (dbError) {
      metrics.status = "critical";
      metrics.checks.database = {
        status: "error",
        error: dbError instanceof Error ? dbError.message : "Unknown error",
      };

      // Notify owner of critical issue
      await notifyOwner({
        title: "🚨 Critical Health Check Failure",
        content: `Database connectivity issue detected during health check.
Error: ${dbError instanceof Error ? dbError.message : "Unknown error"}
Time: ${new Date().toLocaleTimeString()}`,
      });

      res.json({
        ok: true,
        metrics,
      });
    }
  } catch (error) {
    console.error("[Health Check] Error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      context: {
        url: req.url,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  }
}
