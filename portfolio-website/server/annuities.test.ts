import { describe, it, expect } from "vitest";
import { z } from "zod";

/**
 * Tests for the Annuities feature — schema validation and data logic.
 */

// ── Schema Definitions (mirror routers.ts) ──────────────────────────────────

const createAnnuitySchema = z.object({
  clientId: z.number().optional(),
  clientName: z.string().min(1, "Client name is required"),
  type: z.enum(["FIA", "MYGA"]),
  carrier: z.string().min(1, "Carrier is required"),
  productName: z.string().optional().default(""),
  premium: z.string().min(1, "Premium amount is required"),
  termYears: z.number().optional(),
  commissionPercent: z.string().optional(),
  status: z.enum(["active", "pending", "matured", "surrendered", "cancelled"]).optional().default("active"),
  effectiveDate: z.number().optional(),
  maturityDate: z.number().optional(),
  notes: z.string().optional().default(""),
});

const updateAnnuitySchema = z.object({
  id: z.number(),
  clientName: z.string().optional(),
  type: z.enum(["FIA", "MYGA"]).optional(),
  carrier: z.string().optional(),
  productName: z.string().optional(),
  premium: z.string().optional(),
  termYears: z.number().optional(),
  commissionPercent: z.string().optional(),
  status: z.enum(["active", "pending", "matured", "surrendered", "cancelled"]).optional(),
  effectiveDate: z.number().optional(),
  maturityDate: z.number().optional(),
  notes: z.string().optional(),
});

// ── Create Annuity Validation ───────────────────────────────────────────────

describe("Create Annuity Schema", () => {
  it("accepts valid FIA annuity data", () => {
    const result = createAnnuitySchema.safeParse({
      clientName: "John Doe",
      type: "FIA",
      carrier: "Athene",
      productName: "Performance Elite 10",
      premium: "50000.00",
      termYears: 10,
      commissionPercent: "7",
      status: "active",
      effectiveDate: Date.now(),
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("FIA");
      expect(result.data.carrier).toBe("Athene");
    }
  });

  it("accepts valid MYGA annuity data", () => {
    const result = createAnnuitySchema.safeParse({
      clientName: "Jane Smith",
      type: "MYGA",
      carrier: "North American",
      premium: "100000.00",
      termYears: 5,
      commissionPercent: "3",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("MYGA");
      expect(result.data.status).toBe("active"); // default
    }
  });

  it("rejects missing client name", () => {
    const result = createAnnuitySchema.safeParse({
      type: "FIA",
      carrier: "Athene",
      premium: "50000.00",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing carrier", () => {
    const result = createAnnuitySchema.safeParse({
      clientName: "John Doe",
      type: "FIA",
      premium: "50000.00",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing premium", () => {
    const result = createAnnuitySchema.safeParse({
      clientName: "John Doe",
      type: "MYGA",
      carrier: "North American",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid type", () => {
    const result = createAnnuitySchema.safeParse({
      clientName: "John Doe",
      type: "VARIABLE",
      carrier: "Athene",
      premium: "50000.00",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = createAnnuitySchema.safeParse({
      clientName: "John Doe",
      type: "FIA",
      carrier: "Athene",
      premium: "50000.00",
      status: "invalid_status",
    });
    expect(result.success).toBe(false);
  });

  it("defaults status to active when not provided", () => {
    const result = createAnnuitySchema.safeParse({
      clientName: "John Doe",
      type: "FIA",
      carrier: "Athene",
      premium: "50000.00",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("active");
    }
  });

  it("accepts all valid statuses", () => {
    const statuses = ["active", "pending", "matured", "surrendered", "cancelled"] as const;
    for (const status of statuses) {
      const result = createAnnuitySchema.safeParse({
        clientName: "John Doe",
        type: "FIA",
        carrier: "Athene",
        premium: "50000.00",
        status,
      });
      expect(result.success).toBe(true);
    }
  });
});

// ── Update Annuity Validation ───────────────────────────────────────────────

describe("Update Annuity Schema", () => {
  it("accepts partial update with only status", () => {
    const result = updateAnnuitySchema.safeParse({
      id: 1,
      status: "matured",
    });
    expect(result.success).toBe(true);
  });

  it("accepts partial update with premium and term", () => {
    const result = updateAnnuitySchema.safeParse({
      id: 5,
      premium: "75000.00",
      termYears: 7,
    });
    expect(result.success).toBe(true);
  });

  it("rejects update without id", () => {
    const result = updateAnnuitySchema.safeParse({
      status: "matured",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status on update", () => {
    const result = updateAnnuitySchema.safeParse({
      id: 1,
      status: "bogus",
    });
    expect(result.success).toBe(false);
  });

  it("accepts type change from FIA to MYGA", () => {
    const result = updateAnnuitySchema.safeParse({
      id: 1,
      type: "MYGA",
    });
    expect(result.success).toBe(true);
  });
});

// ── Import Row Parsing Logic ────────────────────────────────────────────────

describe("Annuity Import Row Parsing", () => {
  // Simulates the server-side header matching logic
  function extractField(row: Record<string, any>, ...keys: string[]): string {
    for (const key of keys) {
      if (row[key] !== undefined && row[key] !== "") return String(row[key]).trim();
    }
    return "";
  }

  function parseType(raw: string): "FIA" | "MYGA" | null {
    const upper = raw.toUpperCase();
    if (upper === "FIA" || upper.includes("FIXED INDEX")) return "FIA";
    if (upper === "MYGA" || upper.includes("MULTI-YEAR") || upper.includes("GUARANTEED")) return "MYGA";
    return null;
  }

  function parseStatus(raw: string): "active" | "pending" | "matured" | "surrendered" | "cancelled" {
    const lower = raw.toLowerCase();
    if (lower.includes("pending")) return "pending";
    if (lower.includes("mature")) return "matured";
    if (lower.includes("surrender")) return "surrendered";
    if (lower.includes("cancel")) return "cancelled";
    return "active";
  }

  it("extracts fields with flexible header names", () => {
    const row = { "Client Name": "John Doe", "Type": "FIA", "Carrier": "Athene" };
    expect(extractField(row, "Client Name", "client_name", "Name")).toBe("John Doe");
    expect(extractField(row, "Type", "type", "Annuity Type")).toBe("FIA");
  });

  it("falls back to alternate header names", () => {
    const row = { "client_name": "Jane Smith", "type": "MYGA", "Insurance Company": "North American" };
    expect(extractField(row, "Client Name", "client_name", "Name")).toBe("Jane Smith");
    expect(extractField(row, "Carrier", "carrier", "Insurance Company")).toBe("North American");
  });

  it("parses FIA type variants", () => {
    expect(parseType("FIA")).toBe("FIA");
    expect(parseType("fia")).toBe("FIA");
    expect(parseType("Fixed Index Annuity")).toBe("FIA");
  });

  it("parses MYGA type variants", () => {
    expect(parseType("MYGA")).toBe("MYGA");
    expect(parseType("myga")).toBe("MYGA");
    expect(parseType("Multi-Year Guaranteed")).toBe("MYGA");
    expect(parseType("Guaranteed Annuity")).toBe("MYGA");
  });

  it("rejects invalid types", () => {
    expect(parseType("Variable")).toBeNull();
    expect(parseType("SPIA")).toBeNull();
    expect(parseType("")).toBeNull();
  });

  it("parses status values", () => {
    expect(parseStatus("Active")).toBe("active");
    expect(parseStatus("Pending")).toBe("pending");
    expect(parseStatus("Matured")).toBe("matured");
    expect(parseStatus("Surrendered")).toBe("surrendered");
    expect(parseStatus("Cancelled")).toBe("cancelled");
    expect(parseStatus("")).toBe("active");
  });

  it("strips dollar signs and commas from premium", () => {
    const raw = "$50,000.00";
    const cleaned = raw.replace(/[,$]/g, "");
    expect(parseFloat(cleaned)).toBe(50000);
  });

  it("strips percent signs from commission", () => {
    const raw = "7%";
    const cleaned = raw.replace(/%/g, "");
    expect(parseFloat(cleaned)).toBe(7);
  });

  it("detects duplicate annuities", () => {
    const existing = [
      { clientName: "John Doe", carrier: "Athene", type: "FIA", premium: "50000.00" },
    ];
    const newRow = { clientName: "John Doe", carrier: "Athene", type: "FIA", premium: 50000 };
    const isDuplicate = existing.some(a =>
      a.clientName.toLowerCase() === newRow.clientName.toLowerCase() &&
      a.carrier.toLowerCase() === newRow.carrier.toLowerCase() &&
      a.type === newRow.type &&
      Math.abs(parseFloat(a.premium) - newRow.premium) < 0.01
    );
    expect(isDuplicate).toBe(true);
  });

  it("does not flag different clients as duplicates", () => {
    const existing = [
      { clientName: "John Doe", carrier: "Athene", type: "FIA", premium: "50000.00" },
    ];
    const newRow = { clientName: "Jane Smith", carrier: "Athene", type: "FIA", premium: 50000 };
    const isDuplicate = existing.some(a =>
      a.clientName.toLowerCase() === newRow.clientName.toLowerCase() &&
      a.carrier.toLowerCase() === newRow.carrier.toLowerCase() &&
      a.type === newRow.type &&
      Math.abs(parseFloat(a.premium) - newRow.premium) < 0.01
    );
    expect(isDuplicate).toBe(false);
  });
});

// ── Analytics Computation ───────────────────────────────────────────────────

describe("Annuity Analytics Computation", () => {
  const sampleAnnuities = [
    { id: 1, type: "FIA", premium: "50000.00", status: "active", carrier: "Athene" },
    { id: 2, type: "FIA", premium: "75000.00", status: "active", carrier: "North American" },
    { id: 3, type: "FIA", premium: "30000.00", status: "pending", carrier: "Athene" },
    { id: 4, type: "MYGA", premium: "100000.00", status: "active", carrier: "Global Atlantic" },
    { id: 5, type: "MYGA", premium: "60000.00", status: "matured", carrier: "Midland National" },
    { id: 6, type: "MYGA", premium: "45000.00", status: "cancelled", carrier: "North American" },
  ];

  it("correctly counts FIA vs MYGA", () => {
    const fiaCount = sampleAnnuities.filter(a => a.type === "FIA").length;
    const mygaCount = sampleAnnuities.filter(a => a.type === "MYGA").length;
    expect(fiaCount).toBe(3);
    expect(mygaCount).toBe(3);
  });

  it("correctly counts active FIA and MYGA", () => {
    const activeFIA = sampleAnnuities.filter(a => a.type === "FIA" && a.status === "active").length;
    const activeMYGA = sampleAnnuities.filter(a => a.type === "MYGA" && a.status === "active").length;
    expect(activeFIA).toBe(2);
    expect(activeMYGA).toBe(1);
  });

  it("correctly computes total premium", () => {
    const total = sampleAnnuities.reduce((s, a) => s + parseFloat(a.premium), 0);
    expect(total).toBe(360000);
  });

  it("correctly computes FIA premium subtotal", () => {
    const fiaPremium = sampleAnnuities
      .filter(a => a.type === "FIA")
      .reduce((s, a) => s + parseFloat(a.premium), 0);
    expect(fiaPremium).toBe(155000);
  });

  it("correctly computes MYGA premium subtotal", () => {
    const mygaPremium = sampleAnnuities
      .filter(a => a.type === "MYGA")
      .reduce((s, a) => s + parseFloat(a.premium), 0);
    expect(mygaPremium).toBe(205000);
  });

  it("filters by type correctly", () => {
    const fiaOnly = sampleAnnuities.filter(a => a.type === "FIA");
    expect(fiaOnly.every(a => a.type === "FIA")).toBe(true);
    expect(fiaOnly.length).toBe(3);
  });

  it("correctly computes combined policy + annuity AP", () => {
    const samplePolicies = [
      { yearlyAP: "500.00", status: "active" },
      { yearlyAP: "750.00", status: "active" },
      { yearlyAP: "300.00", status: "expired" },
    ];
    const policyAP = samplePolicies
      .filter(p => p.status === "active")
      .reduce((s, p) => s + parseFloat(p.yearlyAP), 0);
    const annuityAP = sampleAnnuities
      .filter(a => a.status === "active")
      .reduce((s, a) => s + parseFloat(a.premium), 0);
    const totalAP = policyAP + annuityAP;
    expect(policyAP).toBe(1250);
    expect(annuityAP).toBe(225000); // 50000 + 75000 + 100000
    expect(totalAP).toBe(226250);
  });
});
