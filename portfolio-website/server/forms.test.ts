import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ── Mock external dependencies ──────────────────────────────────────────────

// Mock the DB insert helpers so we don't need a real database
vi.mock("./db", async (importOriginal) => {
  const orig = await importOriginal<typeof import("./db")>();
  return {
    ...orig,
    insertQuoteRequest: vi.fn().mockResolvedValue(undefined),
    insertContactSubmission: vi.fn().mockResolvedValue(undefined),
  };
});

// Mock the email module
vi.mock("./email", () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
  buildContactEmail: vi.fn().mockReturnValue("<html>contact</html>"),
  buildQuoteEmail: vi.fn().mockReturnValue("<html>quote</html>"),
}));

// Mock the notification module
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// Mock fetch for GHL webhook
const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
vi.stubGlobal("fetch", mockFetch);

// Set env vars for GHL webhook
process.env.GHL_WEBHOOK_URL = "https://hooks.example.com/test";
process.env.RESEND_API_KEY = "re_test_key";

// ── Helpers ─────────────────────────────────────────────────────────────────

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe("contact.submit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true, status: 200 });
  });

  it("accepts a valid contact form submission", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contact.submit({
      name: "John Doe",
      email: "john@example.com",
      phone: "(361) 555-1234",
      subject: "general",
      message: "I need help with my insurance policy.",
    });

    expect(result).toEqual({ success: true });
  });

  it("rejects missing name", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.submit({
        name: "",
        email: "john@example.com",
        message: "Hello",
      })
    ).rejects.toThrow();
  });

  it("rejects invalid email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.submit({
        name: "John",
        email: "not-an-email",
        message: "Hello",
      })
    ).rejects.toThrow();
  });

  it("rejects missing message", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.submit({
        name: "John",
        email: "john@example.com",
        message: "",
      })
    ).rejects.toThrow();
  });
});

describe("quote.submit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true, status: 200 });
  });

  it("accepts a valid quote request", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.quote.submit({
      firstName: "Maria",
      lastName: "Garcia",
      email: "maria@example.com",
      phone: "(361) 555-9876",
      coverage: "Life Insurance",
      bestTime: "morning",
      message: "I'm interested in a term life policy.",
    });

    expect(result).toEqual({ success: true });
  });

  it("accepts a quote request with minimal optional fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.quote.submit({
      firstName: "Carlos",
      lastName: "Ortiz",
      email: "carlos@example.com",
      phone: "(361) 555-0000",
      coverage: "Health Insurance",
    });

    expect(result).toEqual({ success: true });
  });

  it("rejects missing first name", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.quote.submit({
        firstName: "",
        lastName: "Smith",
        email: "test@example.com",
        phone: "555-1234",
        coverage: "Life Insurance",
      })
    ).rejects.toThrow();
  });

  it("rejects missing email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.quote.submit({
        firstName: "John",
        lastName: "Smith",
        email: "",
        phone: "555-1234",
        coverage: "Life Insurance",
      })
    ).rejects.toThrow();
  });

  it("rejects missing coverage type", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.quote.submit({
        firstName: "John",
        lastName: "Smith",
        email: "john@example.com",
        phone: "555-1234",
        coverage: "",
      })
    ).rejects.toThrow();
  });
});
