import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";
import { getDb } from "../db";
import { agents } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "../auth";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),

  debugAgentHash: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB connection failed");
      
      const [agent] = await db.select().from(agents).where(eq(agents.email, input.email.toLowerCase())).limit(1);
      if (!agent) return { found: false, email: input.email };
      
      return {
        found: true,
        email: agent.email,
        hashLength: agent.passwordHash?.length || 0,
        hashPrefix: agent.passwordHash?.slice(0, 30) || "(null)",
        isBcrypt: agent.passwordHash?.startsWith('$2a$') || false,
        isScrypt: (agent.passwordHash?.length || 0) === 108,
        passwordChangedAt: agent.passwordChangedAt,
        createdAt: agent.createdAt,
      };
    }),

  resetAgentTempPassword: publicProcedure
    .input(z.object({ email: z.string().email(), adminSecret: z.string(), newTempPassword: z.string().min(6) }))
    .mutation(async ({ input }) => {
      // Guard with secret
      if (input.adminSecret !== process.env.ADMIN_DEBUG_SECRET) {
        throw new Error('UNAUTHORIZED');
      }

      const db = await getDb();
      if (!db) throw new Error("DB connection failed");

      const newHash = await hashPassword(input.newTempPassword);

      // Update the agent
      await db.update(agents).set({ passwordHash: newHash }).where(eq(agents.email, input.email.toLowerCase()));

      // Verify
      const [updated] = await db.select().from(agents).where(eq(agents.email, input.email.toLowerCase())).limit(1);

      return {
        success: true,
        newHashLength: updated?.passwordHash?.length || 0,
        newHashPrefix: updated?.passwordHash?.slice(0, 10),
        tempPasswordSet: input.newTempPassword,
      };
    }),
});
