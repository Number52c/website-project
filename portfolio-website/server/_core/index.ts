import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import * as trpcExpress from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from './context';
import { secureHeadersMiddleware } from './secure-headers';

import { serveStatic, setupVite } from "./vite";
import { sdk } from "./sdk";
import { getDb } from "../db";
import { notifyOwner } from "./notification";
import { sql, eq, count } from "drizzle-orm";
import { policies } from "../../drizzle/schema";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // Configure CORS for cookie support
  app.use((req, res, next) => {
    const origin = req.headers.origin || req.headers.referer?.split('/').slice(0, 3).join('/');
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-csrf-token');
    }
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });
  
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  
  // Health check scheduled endpoint (runs Mon–Fri at 6 AM CT = 11 AM UTC)
  // Cron: "0 0 11 * * 1-5" (6-field UTC, weekdays only)
  // Register after deploy: manus-heartbeat create --name daily-health-check --cron "0 0 11 * * 1-5" --path /api/scheduled/health-check --description "Mon-Fri 6AM CT system health check"
  app.post("/api/scheduled/health-check", async (req, res) => {
    const startedAt = new Date().toISOString();
    try {
      const user = await sdk.authenticateRequest(req);
      
      if (!user.isCron || !user.taskUid) {
        return res.status(403).json({ error: "cron-only" });
      }
      
      const checks: Record<string, { status: string; detail?: string }> = {};
      let overallStatus: "healthy" | "degraded" | "error" = "healthy";

      // 1. Database connectivity check
      try {
        const dbInst = await getDb();
        await dbInst.execute(sql`SELECT 1`);
        checks.database = { status: "ok" };
      } catch (dbErr) {
        checks.database = { status: "error", detail: String(dbErr) };
        overallStatus = "error";
      }

      // 2. Count active policies (quick sanity check)
      try {
        const dbInst = await getDb();
        const [result] = await dbInst.select({ count: count() }).from(policies).where(eq(policies.status, "active"));
        checks.activePolicies = { status: "ok", detail: `${result?.count ?? 0} active policies` };
      } catch (pErr) {
        checks.activePolicies = { status: "warning", detail: String(pErr) };
        if (overallStatus === "healthy") overallStatus = "degraded";
      }

      // 3. Notify owner on warning or error
      if (overallStatus !== "healthy") {
        await notifyOwner({
          title: `⚠️ System Health Check — ${overallStatus.toUpperCase()}`,
          content: `Daily health check at ${startedAt} detected issues:\n\n${Object.entries(checks)
            .filter(([, v]) => v.status !== "ok")
            .map(([k, v]) => `• ${k}: ${v.status}${v.detail ? ` — ${v.detail}` : ""}`)
            .join("\n")}`
        });
      }

      console.log(`[Health Check] ${overallStatus} at ${startedAt}`, checks);
      res.json({ ok: true, status: overallStatus, checks, timestamp: startedAt });
    } catch (error) {
      console.error("[Health Check] Error:", error);
      const err = error instanceof Error ? error : new Error(String(error));
      res.status(500).json({
        error: err.message,
        stack: err.stack,
        context: { url: req.url, taskUid: "unknown" },
        timestamp: startedAt
      });
    }
  });
  
  // CSRF token endpoint
  app.get("/api/csrf-token", async (_req, res) => {
    try {
      const { generateCsrfToken } = await import("../csrf");
      const token = await generateCsrfToken();
      res.json({ token });
    } catch (error) {
      console.error("[CSRF] Failed to generate token:", error);
      res.status(500).json({ error: "Failed to generate CSRF token" });
    }
  });
  
  // tRPC API
  app.use(secureHeadersMiddleware());
  app.use(
    "/api/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // Sitemap.xml for SEO
  app.get("/sitemap.xml", (_req, res) => {
    const baseUrl = "https://www.ortizinsurancebroker.com";
    const pages = [
      { loc: "/", priority: "1.0", changefreq: "weekly" },
      { loc: "/services", priority: "0.9", changefreq: "monthly" },
      { loc: "/about", priority: "0.7", changefreq: "monthly" },
      { loc: "/quote", priority: "0.9", changefreq: "monthly" },
      { loc: "/contact", priority: "0.8", changefreq: "monthly" },
      { loc: "/reviews", priority: "0.6", changefreq: "monthly" },
      { loc: "/life-insurance-corpus-christi", priority: "0.9", changefreq: "weekly" },
      { loc: "/final-expense-insurance", priority: "0.9", changefreq: "weekly" },
      { loc: "/annuities-corpus-christi", priority: "0.9", changefreq: "weekly" },
      { loc: "/whole-life-insurance", priority: "0.8", changefreq: "weekly" },
      { loc: "/term-life-insurance", priority: "0.8", changefreq: "weekly" },
      { loc: "/blog", priority: "0.8", changefreq: "weekly" },
      { loc: "/blog/how-much-life-insurance-do-i-need", priority: "0.7", changefreq: "monthly" },
      { loc: "/blog/final-expense-vs-prepaid-funeral", priority: "0.7", changefreq: "monthly" },
      { loc: "/blog/what-is-fixed-index-annuity", priority: "0.7", changefreq: "monthly" },
      { loc: "/blog/term-vs-whole-life-insurance", priority: "0.7", changefreq: "monthly" },
      { loc: "/blog/life-insurance-seniors-over-50", priority: "0.7", changefreq: "monthly" },
      { loc: "/blog/life-insurance-pre-existing-conditions", priority: "0.7", changefreq: "monthly" },
      { loc: "/blog/why-parents-need-life-insurance", priority: "0.7", changefreq: "monthly" },
      { loc: "/blog/graded-vs-guaranteed-issue", priority: "0.7", changefreq: "monthly" },
    ];
    const today = new Date().toISOString().split("T")[0];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${baseUrl}${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join("\n")}
</urlset>`;
    res.set("Content-Type", "application/xml");
    res.send(xml);
  });

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
