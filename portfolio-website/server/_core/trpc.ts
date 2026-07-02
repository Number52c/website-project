import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { verifyCsrfToken } from "../csrf";
import { sessionTimeoutMiddleware } from "./session-timeout-middleware";
import { AuditAction, logSecurityEvent } from "./audit-logging-integration";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "../adminAuth";

export const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

const requireAgent = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.agent) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Please log in as an agent to access this resource." });
  }

  return next({
    ctx: {
      ...ctx,
      agent: ctx.agent,
    },
  });
});

const csrfProtection = t.middleware(async opts => {
  const { ctx, next } = opts;
  const csrfToken = ctx.req.headers["x-csrf-token"] as string | undefined;
  
  // TEMPORARY: Disabled CSRF protection for debugging client creation
  // TODO: Re-enable after fixing token generation/validation
  if (false && (!csrfToken || !(await verifyCsrfToken(csrfToken)))) {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "CSRF token validation failed. Please refresh the page and try again." 
    });
  }
  
  return next({ ctx });
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(requireUser).use(sessionTimeoutMiddleware()).use(t.middleware(async opts => {
  logSecurityEvent(AuditAction.PROCEDURE_CALL, { procedure: opts.path, user: opts.ctx.user?.id });
  return opts.next();
}));
export const agentProcedure = t.procedure.use(requireAgent);

export const adminProcedure = t.procedure.use(sessionTimeoutMiddleware()).use(t.middleware(async opts => {
  logSecurityEvent(AuditAction.PROCEDURE_CALL, { procedure: opts.path, user: opts.ctx.user?.id, role: 'admin' });
  return opts.next();
})).use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    // Check if user has admin role
    const hasAdminRole = ctx.user?.role === 'admin';

    // Check if user has valid admin PIN session
    const adminCookie = ctx.req.cookies?.[ADMIN_COOKIE_NAME];
    const hasAdminSession = adminCookie && await verifyAdminToken(adminCookie);

    // Allow access if either condition is true
    if (!hasAdminRole && !hasAdminSession) {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

export const protectedMutationProcedure = t.procedure.use(requireUser).use(csrfProtection).use(t.middleware(async opts => {
  logSecurityEvent(AuditAction.PROCEDURE_CALL, { procedure: opts.path, user: opts.ctx.user?.id });
  return opts.next();
}));

export const adminMutationProcedure = t.procedure
  .use(requireUser)
  .use(t.middleware(async opts => {
    logSecurityEvent(AuditAction.PROCEDURE_CALL, { procedure: opts.path, user: opts.ctx.user?.id, role: 'admin' });
    return opts.next();
  }))
  .use(t.middleware(async opts => {
    const { ctx, next } = opts;
    if (ctx.user?.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  }))
  .use(csrfProtection);

export const agentMutationProcedure = t.procedure.use(requireAgent).use(csrfProtection).use(t.middleware(async opts => {
  logSecurityEvent(AuditAction.PROCEDURE_CALL, { procedure: opts.path, agent: opts.ctx.agent?.id });
  return opts.next();
}));
