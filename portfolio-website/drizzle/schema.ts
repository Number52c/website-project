import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  bigint,
  tinyint,
  unique,
  index,
  foreignKey,
} from "drizzle-orm/mysql-core";

/**
 * ============================================================================
 * CORE AUTHENTICATION & USERS
 * ============================================================================
 */

/**
 * Users table — Core user authentication via Manus OAuth
 * Supports roles: user, admin, agent
 */
export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    email: varchar("email", { length: 320 }).unique(),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: mysqlEnum("role", ["user", "admin", "agent"]).default("user").notNull(),
    agentId: int("agentId"), // FK to agents table if role is 'agent'
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  (table) => ({
    agentIdIdx: index("idx_users_agentId").on(table.agentId),
    roleIdx: index("idx_users_role").on(table.role),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * ============================================================================
 * AGENCIES & AGENTS
 * ============================================================================
 */

/**
 * Agencies table — IMO/Agency records
 * Represents the agency or IMO that agents work for
 */
export const agencies = mysqlTable(
  "agencies",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    licenseNumber: varchar("licenseNumber", { length: 100 }),
    address: text("address"),
    city: varchar("city", { length: 255 }),
    state: varchar("state", { length: 50 }),
    zip: varchar("zip", { length: 20 }),
    phone: varchar("phone", { length: 50 }),
    email: varchar("email", { length: 320 }),
    contactPerson: varchar("contactPerson", { length: 255 }),
    status: mysqlEnum("status", ["active", "inactive", "suspended"]).default("active"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    statusIdx: index("idx_agencies_status").on(table.status),
  })
);

export type Agency = typeof agencies.$inferSelect;
export type InsertAgency = typeof agencies.$inferInsert;

/**
 * Agents table — Licensed producers/agents
 * Each agent belongs to an agency and has a user account
 */
export const agents = mysqlTable(
  "agents",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").unique(), // FK to users table
    firstName: varchar("firstName", { length: 255 }).notNull(),
    lastName: varchar("lastName", { length: 255 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    phone: varchar("phone", { length: 50 }),
    licenseNumber: varchar("licenseNumber", { length: 100 }).unique(),
    licenseState: varchar("licenseState", { length: 2 }),
    agentStatus: mysqlEnum("agent_status", ["active", "inactive", "suspended"]).default("active"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    passwordHash: text("passwordHash"),
    passwordChangedAt: bigint("passwordChangedAt", { mode: "number" }),
    profilePictureUrl: text("profilePictureUrl"),
    pin: varchar("pin", { length: 255 }),
    color: varchar("color", { length: 20 }), // For admin dashboard color-coding
  },
  (table) => ({
    statusIdx: index("idx_agents_status").on(table.agentStatus),
    licenseNumberIdx: index("idx_agents_licenseNumber").on(table.licenseNumber),
  })
);

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

/**
 * ============================================================================
 * CLIENTS (ONE RECORD PER PERSON - DEDUPLICATION)
 * ============================================================================
 */

/**
 * Clients table — Master client record (one per person, never duplicated)
 * Supports client portal access via PIN
 * Clients can have multiple policies across different carriers
 * Clients can be linked to a household (e.g., spouse)
 */
export const clients = mysqlTable(
  "clients",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").unique(), // FK to users table (optional - for client portal login)
    householdId: int("householdId"), // FK to clients table (for grouping family members)
    createdByAgentId: int("createdByAgentId"), // FK to agents - which agent created this record
    pin: varchar("pin", { length: 255 }), // bcrypt hash for PIN-based portal access

    // Personal Information
    firstName: varchar("firstName", { length: 255 }).notNull(),
    lastName: varchar("lastName", { length: 255 }).notNull(),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 50 }),
    dateOfBirth: bigint("dateOfBirth", { mode: "number" }), // Unix timestamp

    // Address
    address: text("address"),
    city: varchar("city", { length: 255 }),
    state: varchar("state", { length: 50 }),
    zip: varchar("zip", { length: 20 }),

    // ID & Government
    ssn: varchar("ssn", { length: 11 }), // Last 4 only for display
    driverLicense: varchar("driverLicense", { length: 50 }),
    driverLicenseState: varchar("driverLicenseState", { length: 2 }),

    // Demographics
    gender: varchar("gender", { length: 20 }),
    maritalStatus: varchar("maritalStatus", { length: 50 }),
    smoker: tinyint("smoker").default(0), // 0 = no, 1 = yes

    // Health Information
    healthConditions: text("healthConditions"), // JSON array of conditions
    prescriptions: text("prescriptions"), // JSON array
    surgeries: text("surgeries"), // JSON array
    height: varchar("height", { length: 50 }), // e.g., "5'10\""
    weight: varchar("weight", { length: 50 }), // e.g., "180 lbs"

    // Family
    kids: varchar("kids", { length: 255 }), // Number of children or JSON details

    // Financial
    bankName: varchar("bankName", { length: 255 }),
    accountNumber: varchar("accountNumber", { length: 50 }),
    routingNumber: varchar("routingNumber", { length: 20 }),

    // Beneficiaries (primary stored here, secondary in beneficiaries table)
    primaryBeneficiary: varchar("primaryBeneficiary", { length: 255 }),
    primaryBeneficiaryPercent: int("primaryBeneficiaryPercent"),
    contingentBeneficiary: varchar("contingentBeneficiary", { length: 255 }),
    contingentBeneficiaryPercent: int("contingentBeneficiaryPercent"),

    // Portal & Tracking
    lastPortalLogin: bigint("lastPortalLogin", { mode: "number" }), // Unix timestamp
    lastReviewDate: bigint("lastReviewDate", { mode: "number" }), // Unix timestamp of last annual review

    // Notes
    notes: text("notes"),

    // Timestamps
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    emailIdx: index("idx_clients_email").on(table.email),
    phoneIdx: index("idx_clients_phone").on(table.phone),
    ssnIdx: index("idx_clients_ssn").on(table.ssn),
    householdIdIdx: index("idx_clients_householdId").on(table.householdId),
    createdByAgentIdIdx: index("idx_clients_createdByAgentId").on(table.createdByAgentId),
    userIdIdx: index("idx_clients_userId").on(table.userId),
    nameIdx: index("idx_clients_name").on(table.firstName, table.lastName),
  })
);

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

/**
 * ============================================================================
 * POLICIES (ANNUITIES & LIFE INSURANCE)
 * ============================================================================
 */

/**
 * Policies table — Annuities and Life Insurance policies
 * Each policy is linked to exactly one client
 * Each policy can have multiple agents (via policyAgents junction table)
 * Supports multiple carriers (Athene, AGL, ELCO, etc.)
 */
export const policies = mysqlTable(
  "policies",
  {
    id: int("id").autoincrement().primaryKey(),
    clientId: int("clientId").notNull(), // FK to clients table
    policyNumber: varchar("policyNumber", { length: 100 }).notNull().unique(),
    carrier: varchar("carrier", { length: 100 }).notNull(), // e.g., "Athene", "AGL", "ELCO"
    type: varchar("type", { length: 100 }).notNull(), // Policy type

    // Policy Details
    coverageAmount: decimal("coverageAmount", { precision: 14, scale: 2 }), // Coverage amount
    premiumAmount: decimal("premiumAmount", { precision: 10, scale: 2 }),
    yearlyAP: decimal("yearlyAP", { precision: 10, scale: 2 }),
    premiumFrequency: mysqlEnum("premiumFrequency", ["monthly", "quarterly", "semi-annual", "annual"]),

    // Dates
    effectiveDate: bigint("effectiveDate", { mode: "number" }), // Unix timestamp
    expirationDate: bigint("expirationDate", { mode: "number" }), // Unix timestamp (for term policies)
    contractAnniversaryMonth: varchar("contractAnniversaryMonth", { length: 20 }), // e.g., "January", "February"
    renewalDate: bigint("renewalDate", { mode: "number" }), // Unix timestamp

    // Status & Underwriting
    status: mysqlEnum("status", [
      "pending",
      "active",
      "expired",
      "cancelled",
      "surrendered",
      "matured",
    ]).default("pending"),
    underwritingStatus: mysqlEnum("underwritingStatus", [
      "pending",
      "approved",
      "declined",
      "conditional",
      "withdrawn",
    ]).default("pending"),

    // Commission
    commissionRate: decimal("commissionRate", { precision: 5, scale: 2 }), // Percentage
    commissionAmount: decimal("commissionAmount", { precision: 12, scale: 2 }),
    commissionPaidDate: bigint("commissionPaidDate", { mode: "number" }), // Unix timestamp

    // Additional Details
    notes: text("notes"),
    internalNotes: text("internalNotes"), // Admin-only notes

    // Payment tracking
    // isPaid=1 means the policy was placed and first premium was collected (ever in-force)
    // isPaid=0 means the policy was never placed / never paid (pending/declined/not-taken)
    // Used by persistence rate calculation to distinguish genuine cancellations from never-active policies
    isPaid: tinyint("isPaid").default(0).notNull(),

    // ── Persistency Lifecycle Fields ─────────────────────────────────────────
    // wasEverActive=1 means the policy was at some point active/in-force.
    // Used to exclude never-active policies from persistency denominators.
    wasEverActive: tinyint("wasEverActive").default(0).notNull(),
    // inForceDate: the date the policy first became active/in-force (Unix ms).
    // Set when status transitions to 'active' or isPaid becomes 1.
    // Used to determine if a policy was in-force as of a given Jan 1 starting block.
    inForceDate: bigint("inForceDate", { mode: "number" }),
    // cancelDate: the date the policy was cancelled/lapsed/terminated (Unix ms).
    // Set when status transitions to 'cancelled', 'surrendered', or 'matured'.
    // Used to exclude policies that lapsed before a given Jan 1 starting block.
    cancelDate: bigint("cancelDate", { mode: "number" }),

    // Timestamps
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    clientIdIdx: index("idx_policies_clientId").on(table.clientId),
    policyNumberIdx: index("idx_policies_policyNumber").on(table.policyNumber),
    carrierIdx: index("idx_policies_carrier").on(table.carrier),
    typeIdx: index("idx_policies_type").on(table.type),
    statusIdx: index("idx_policies_status").on(table.status),
    underwritingStatusIdx: index("idx_policies_underwritingStatus").on(table.underwritingStatus),
  })
);

export type Policy = typeof policies.$inferSelect;
export type InsertPolicy = typeof policies.$inferInsert;

/**
 * ============================================================================
 * BENEFICIARIES
 * ============================================================================
 */

/**
 * Beneficiaries table — Separate table for policy beneficiaries
 * Supports multiple beneficiaries per policy with percentages
 * Tracks primary, secondary, and contingent beneficiaries
 */
export const beneficiaries = mysqlTable(
  "beneficiaries",
  {
    id: int("id").autoincrement().primaryKey(),
    policyId: int("policyId").notNull(), // FK to policies table
    name: varchar("name", { length: 255 }).notNull(),
    relationship: varchar("relationship", { length: 100 }), // e.g., "Spouse", "Child", "Parent"
    percentage: int("percentage").notNull(), // 0-100
    ssn: varchar("ssn", { length: 11 }), // Last 4 only
    dateOfBirth: bigint("dateOfBirth", { mode: "number" }), // Unix timestamp
    type: mysqlEnum("type", ["primary", "secondary", "contingent"]).default("primary"),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    policyIdIdx: index("idx_beneficiaries_policyId").on(table.policyId),
    typeIdx: index("idx_beneficiaries_type").on(table.type),
  })
);

export type Beneficiary = typeof beneficiaries.$inferSelect;
export type InsertBeneficiary = typeof beneficiaries.$inferInsert;

/**
 * ============================================================================
 * POLICY-AGENT RELATIONSHIPS (JUNCTION TABLE)
 * ============================================================================
 */

/**
 * PolicyAgents table — Junction table linking policies to agents
 * Supports multiple agents per policy (e.g., agent + manager override)
 * Tracks the role of each agent (originating, manager, etc.)
 */
export const policyAgents = mysqlTable(
  "policy_agents",
  {
    id: int("id").autoincrement().primaryKey(),
    policyId: int("policyId").notNull(), // FK to policies table
    agentId: int("agentId").notNull(), // FK to agents table
    role: mysqlEnum("role", ["primary", "secondary", "override"]).default("primary"),
    commissionPercent: decimal("commissionPercent", { precision: 5, scale: 2 }), // Agent's share of commission
    splitPercent: int("splitPercent").default(100), // Percentage split for this agent
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    policyIdIdx: index("idx_policyAgents_policyId").on(table.policyId),
    agentIdIdx: index("idx_policyAgents_agentId").on(table.agentId),
    roleIdx: index("idx_policyAgents_role").on(table.role),
    uniquePolicyAgent: unique("unique_policy_agent").on(table.policyId, table.agentId, table.role),
  })
);

export type PolicyAgent = typeof policyAgents.$inferSelect;
export type InsertPolicyAgent = typeof policyAgents.$inferInsert;

/**
 * ============================================================================
 * IMPORTS (AUDIT LOG)
 * ============================================================================
 */

/**
 * Imports table — Audit log of every file uploaded
 * Tracks import history, success/failure counts, and mapping configuration
 */
export const imports = mysqlTable(
  "imports",
  {
    id: int("id").autoincrement().primaryKey(),
    agentId: int("agentId"), // FK to agents table (who uploaded the file)
    fileName: varchar("fileName", { length: 255 }).notNull(),
    fileSize: int("fileSize"), // Size in bytes
    carrier: varchar("carrier", { length: 100 }).notNull(), // e.g., "Athene", "AGL", "ELCO"
    importDate: timestamp("importDate").defaultNow().notNull(),
    totalRecords: int("totalRecords").default(0), // Total rows in file
    successfulRecords: int("successfulRecords").default(0), // Successfully imported
    failedRecords: int("failedRecords").default(0), // Failed rows
    skippedRecords: int("skippedRecords").default(0), // Skipped rows
    status: mysqlEnum("status", ["pending", "processing", "completed", "failed", "partial"]).default("pending"),
    mappingConfig: text("mappingConfig"), // JSON object storing field mappings
    errorLog: text("errorLog"), // JSON array of errors
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    agentIdIdx: index("idx_imports_agentId").on(table.agentId),
    carrierIdx: index("idx_imports_carrier").on(table.carrier),
    statusIdx: index("idx_imports_status").on(table.status),
    importDateIdx: index("idx_imports_importDate").on(table.importDate),
  })
);

export type Import = typeof imports.$inferSelect;
export type InsertImport = typeof imports.$inferInsert;

/**
 * ============================================================================
 * IMPORT ERRORS (DETAILED ERROR TRACKING)
 * ============================================================================
 */

/**
 * ImportErrors table — Every failed row with raw data and error message
 * Allows for debugging and re-import of failed records
 */
export const importErrors = mysqlTable(
  "import_errors",
  {
    id: int("id").autoincrement().primaryKey(),
    importId: int("importId").notNull(), // FK to imports table
    rowNumber: int("rowNumber").notNull(), // Row number in the file
    rawData: text("rawData").notNull(), // JSON object of the original row
    mappedData: text("mappedData"), // JSON object after field mapping
    errorMessage: text("errorMessage").notNull(), // Human-readable error
    errorCode: varchar("errorCode", { length: 50 }), // Machine-readable error code
    severity: mysqlEnum("severity", ["warning", "error", "critical"]).default("error"),
    resolved: tinyint("resolved").default(0), // 0 = unresolved, 1 = resolved
    resolutionNotes: text("resolutionNotes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    importIdIdx: index("idx_importErrors_importId").on(table.importId),
    rowNumberIdx: index("idx_importErrors_rowNumber").on(table.rowNumber),
    severityIdx: index("idx_importErrors_severity").on(table.severity),
    resolvedIdx: index("idx_importErrors_resolved").on(table.resolved),
  })
);

export type ImportError = typeof importErrors.$inferSelect;
export type InsertImportError = typeof importErrors.$inferInsert;

/**
 * ============================================================================
 * AGENT SESSIONS (SESSION TRACKING)
 * ============================================================================
 */

/**
 * AgentSessions table — Track agent login sessions
 * Sessions expire after 8 hours of inactivity
 */
export const agentSessions = mysqlTable(
  "agent_sessions",
  {
    id: int("id").autoincrement().primaryKey(),
    agentId: int("agentId").notNull(), // FK to agents table
    lastActivityAt: bigint("lastActivityAt", { mode: "number" }).notNull(), // Unix timestamp
    createdAt: bigint("createdAt", { mode: "number" }).notNull(), // Unix timestamp
  },
  (table) => ({
    agentIdIdx: index("idx_agentSessions_agentId").on(table.agentId),
    lastActivityAtIdx: index("idx_agentSessions_lastActivityAt").on(table.lastActivityAt),
  })
);

export type AgentSession = typeof agentSessions.$inferSelect;
export type InsertAgentSession = typeof agentSessions.$inferInsert;

/**
 * ============================================================================
 * AGENT CREDENTIALS (CARRIER PORTAL CREDENTIALS)
 * ============================================================================
 */

/**
 * AgentCredentials table — Store agent credentials for carrier portals
 * Encrypted storage of username/password for accessing carrier systems
 */
export const agentCredentials = mysqlTable(
  "agent_credentials",
  {
    id: int("id").autoincrement().primaryKey(),
    agentId: int("agentId"), // FK to agents table (optional for admin-managed credentials)
    carrier: varchar("carrier", { length: 100 }).notNull(), // e.g., "Athene", "AGL", "ELCO"
    writingNumber: varchar("writingNumber", { length: 100 }),
    username: varchar("username", { length: 255 }).notNull(),
    password: text("password").notNull(), // Should be encrypted
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    agentIdIdx: index("idx_agentCredentials_agentId").on(table.agentId),
    carrierIdx: index("idx_agentCredentials_carrier").on(table.carrier),
  })
);

export type AgentCredential = typeof agentCredentials.$inferSelect;
export type InsertAgentCredential = typeof agentCredentials.$inferInsert;

/**
 * ============================================================================
 * LEGACY TABLES (KEPT FOR BACKWARD COMPATIBILITY)
 * ============================================================================
 */

/**
 * Quote requests — Legacy table for quote form submissions
 */
export const quoteRequests = mysqlTable("quote_requests", {
  id: int("id").autoincrement().primaryKey(),
  firstName: varchar("firstName", { length: 255 }).notNull(),
  lastName: varchar("lastName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  coverage: varchar("coverage", { length: 255 }).notNull(),
  bestTime: varchar("bestTime", { length: 50 }).default(""),
  message: text("message"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type QuoteRequest = typeof quoteRequests.$inferSelect;
export type InsertQuoteRequest = typeof quoteRequests.$inferInsert;

/**
 * Contact submissions — Legacy table for contact form submissions
 */
export const contactSubmissions = mysqlTable("contact_submissions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }).default(""),
  subject: varchar("subject", { length: 255 }).default(""),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = typeof contactSubmissions.$inferInsert;

/**
 * ============================================================================
 * SALES & OPERATIONS TRACKING
 * ============================================================================
 */

/**
 * Sales Entries — Track individual sales/policies by agent
 * Links to agents and clients, stores commission and premium data
 * 
 * NOTE: This table contains both legacy and new column names for backward compatibility.
 * Legacy columns (productType, commissionPercent, saleMonth, saleYear) are kept alongside
 * their newer equivalents (product, commission, month, year). New code should use the
 * newer column names, but both are maintained in the schema to avoid breaking existing queries.
 */
export const salesEntries = mysqlTable(
  "sales_entries",
  {
    id: int("id").autoincrement().primaryKey(),
    // Legacy columns (kept for backward compatibility)
    clientName: varchar("clientName", { length: 255 }).notNull(),
    productType: varchar("productType", { length: 100 }), // LEGACY: use 'product' instead
    carrier: varchar("carrier", { length: 100 }).notNull(), // e.g., "Athene", "AGL", "ELCO"
    premium: decimal("premium", { precision: 14, scale: 2 }), // Monthly or annual premium
    annualPremium: decimal("annualPremium", { precision: 14, scale: 2 }), // Annualized premium
    commissionPercent: decimal("commissionPercent", { precision: 5, scale: 2 }), // LEGACY: use 'commission' instead
    saleDate: bigint("saleDate", { mode: "number" }), // Unix timestamp
    saleMonth: int("saleMonth"), // LEGACY: use 'month' instead (1-12)
    saleYear: int("saleYear"), // LEGACY: use 'year' instead
    notes: text("notes"), // Additional notes about the sale
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    commissionOverride: decimal("commissionOverride", { precision: 5, scale: 2 }), // Override commission percentage
    isPaid: tinyint("isPaid").default(0), // 0 = unpaid, 1 = paid
    effectiveDate: bigint("effectiveDate", { mode: "number" }), // Unix timestamp of policy effective date
    isCanceled: tinyint("isCanceled").default(0), // 0 = active, 1 = cancelled
    agentId: int("agentId"), // FK to agents
    clientId: int("clientId"), // FK to clients (optional, for new clients)
    // New columns (preferred naming)
    product: varchar("product", { length: 255 }), // e.g., "Fixed Annuity", "Term Life"
    commission: decimal("commission", { precision: 12, scale: 2 }), // Commission earned
    policyType: varchar("policyType", { length: 50 }), // e.g., "term_life", "fixed_annuity"
    status: varchar("status", { length: 50 }).default("active"), // active, pending, cancelled
    month: int("month"), // Sale month (1-12)
    year: int("year"), // Sale year
    policyId: int("policyId"), // FK to policies (optional, for bulk sync)
  },
  (table) => ({
    agentIdIdx: index("idx_salesEntries_agentId").on(table.agentId),
    clientIdIdx: index("idx_salesEntries_clientId").on(table.clientId),
    policyIdIdx: index("idx_salesEntries_policyId").on(table.policyId),
    saleDateIdx: index("idx_salesEntries_saleDate").on(table.saleDate),
    monthYearIdx: index("idx_salesEntries_monthYear").on(table.month, table.year),
    fk_agentId: foreignKey({ columns: [table.agentId], foreignColumns: [agents.id] }).onDelete("cascade"),
    fk_clientId: foreignKey({ columns: [table.clientId], foreignColumns: [clients.id] }).onDelete("set null"),
    fk_policyId: foreignKey({ columns: [table.policyId], foreignColumns: [policies.id] }).onDelete("set null"),
  })
);
export type SalesEntry = typeof salesEntries.$inferSelect;
export type InsertSalesEntry = typeof salesEntries.$inferInsert;

/**
 * Expenses — Track agent business expenses
 * Linked to agents, categorized by type and month
 */
export const expenses = mysqlTable(
  "expenses",
  {
    id: int("id").autoincrement().primaryKey(),
    agentId: int("agentId").notNull(), // FK to agents
    description: varchar("description", { length: 255 }).notNull(),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    category: varchar("category", { length: 100 }), // e.g., "marketing", "travel", "office"
    expenseDate: bigint("expenseDate", { mode: "number" }).notNull(), // Unix timestamp
    month: int("month").notNull(), // Expense month (1-12)
    year: int("year").notNull(), // Expense year
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    agentIdIdx: index("idx_expenses_agentId").on(table.agentId),
    monthYearIdx: index("idx_expenses_monthYear").on(table.month, table.year),
    fk_agentId: foreignKey({ columns: [table.agentId], foreignColumns: [agents.id] }).onDelete("cascade"),
  })
);
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;

/**
 * ============================================================================
 * SYSTEM CONFIGURATION
 * ============================================================================
 */

/**
 * App Settings — Key-value store for system configuration
 * Used for carrier settings, commission rates, system preferences
 */
export const appSettings = mysqlTable(
  "app_settings",
  {
    key: varchar("key", { length: 100 }).primaryKey(),
    value: text("value").notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  }
);
export type AppSetting = typeof appSettings.$inferSelect;
export type InsertAppSetting = typeof appSettings.$inferInsert;

/**
 * Carriers — Insurance carriers/companies
 * Stores carrier information for multi-carrier support
 */
export const carriers = mysqlTable(
  "carriers",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    portalUrl: text("portalUrl"), // Carrier portal URL
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    website: text("website"), // Carrier website
  },
  (table) => ({
    nameIdx: index("idx_carriers_name").on(table.name),
  })
);

// Note: Database schema currently has: id, name, portalUrl, createdAt, updatedAt, website
// Phone and other fields should be added via migration if needed
export type Carrier = typeof carriers.$inferSelect;
export type InsertCarrier = typeof carriers.$inferInsert;


/**
 * ============================================================================
 * CLIENT DOCUMENTS (PORTAL)
 * ============================================================================
 */

/**
 * ClientDocuments table — Documents uploaded for clients
 * Supports policy documents, forms, correspondence, etc.
 * Tracks upload history and file metadata
 */
export const clientDocuments = mysqlTable(
  "client_documents",
  {
    id: int("id").autoincrement().primaryKey(),
    clientId: int("clientId").notNull(), // FK to clients table
    policyId: int("policyId"), // FK to policies table (optional - document can be client-level or policy-level)
    uploadedByAgentId: int("uploadedByAgentId"), // FK to agents table (who uploaded)
    uploadedByAdminId: int("uploadedByAdminId"), // FK to users table (admin who uploaded)
    
    // Document Metadata
    fileName: varchar("fileName", { length: 255 }).notNull(),
    fileType: varchar("fileType", { length: 50 }), // e.g., "pdf", "docx", "jpg"
    fileSizeBytes: int("fileSizeBytes"), // File size in bytes
    storageKey: varchar("storageKey", { length: 500 }), // S3 storage key or reference
    storageUrl: text("storageUrl"), // Presigned URL or public URL
    
    // Document Classification
    documentType: mysqlEnum("documentType", [
      "policy_document",
      "illustration",
      "application",
      "disclosure",
      "correspondence",
      "statement",
      "receipt",
      "other"
    ]).default("other"),
    
    // Visibility & Permissions
    visibleToClient: tinyint("visibleToClient").default(1), // 1 = visible, 0 = admin-only
    visibleToAgent: tinyint("visibleToAgent").default(1), // 1 = visible to agent
    
    // Metadata
    description: text("description"),
    uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
    expiresAt: bigint("expiresAt", { mode: "number" }), // Unix timestamp (optional - for temporary documents)
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    clientIdIdx: index("idx_clientDocuments_clientId").on(table.clientId),
    policyIdIdx: index("idx_clientDocuments_policyId").on(table.policyId),
    documentTypeIdx: index("idx_clientDocuments_documentType").on(table.documentType),
    visibleToClientIdx: index("idx_clientDocuments_visibleToClient").on(table.visibleToClient),
    uploadedAtIdx: index("idx_clientDocuments_uploadedAt").on(table.uploadedAt),
  })
);

export type ClientDocument = typeof clientDocuments.$inferSelect;
export type InsertClientDocument = typeof clientDocuments.$inferInsert;

/**
 * ============================================================================
 * PAYMENT METHODS & HISTORY (PORTAL)
 * ============================================================================
 */

/**
 * PaymentMethods table — Client payment methods on file
 * Supports multiple payment methods per client
 * Tracks payment method type (bank account, credit card, etc.)
 */
export const paymentMethods = mysqlTable(
  "payment_methods",
  {
    id: int("id").autoincrement().primaryKey(),
    clientId: int("clientId").notNull(), // FK to clients table
    
    // Payment Method Type
    methodType: mysqlEnum("methodType", [
      "bank_account",
      "credit_card",
      "debit_card",
      "check",
      "ach",
      "other"
    ]).notNull(),
    
    // Bank Account Details (if methodType = bank_account or ach)
    bankName: varchar("bankName", { length: 255 }),
    accountType: mysqlEnum("bankAccountType", ["checking", "savings"]),
    accountNumberLast4: varchar("accountNumberLast4", { length: 4 }), // Last 4 digits only
    routingNumber: varchar("routingNumber", { length: 20 }), // Last 4 digits only for display
    
    // Card Details (if methodType = credit_card or debit_card)
    cardholderName: varchar("cardholderName", { length: 255 }),
    cardNumberLast4: varchar("cardNumberLast4", { length: 4 }), // Last 4 digits only
    cardBrand: varchar("cardBrand", { length: 50 }), // e.g., "Visa", "Mastercard", "Amex"
    expiryMonth: int("expiryMonth"), // 1-12
    expiryYear: int("expiryYear"), // 4-digit year
    
    // Status & Preferences
    isDefault: tinyint("isDefault").default(0), // 1 = default payment method
    isActive: tinyint("isActive").default(1), // 1 = active, 0 = inactive
    
    // Metadata
    addedAt: timestamp("addedAt").defaultNow().notNull(),
    lastUsedAt: bigint("lastUsedAt", { mode: "number" }), // Unix timestamp
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    clientIdIdx: index("idx_paymentMethods_clientId").on(table.clientId),
    isDefaultIdx: index("idx_paymentMethods_isDefault").on(table.isDefault),
    isActiveIdx: index("idx_paymentMethods_isActive").on(table.isActive),
  })
);

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = typeof paymentMethods.$inferInsert;

/**
 * PaymentHistory table — Records of all payments made by clients
 * Tracks payment transactions, amounts, dates, and status
 */
export const paymentHistory = mysqlTable(
  "payment_history",
  {
    id: int("id").autoincrement().primaryKey(),
    clientId: int("clientId").notNull(), // FK to clients table
    paymentMethodId: int("paymentMethodId"), // FK to paymentMethods table (optional - payment method may be deleted)
    policyId: int("policyId"), // FK to policies table (optional - payment can be for multiple policies)
    
    // Payment Details
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    paymentDate: bigint("paymentDate", { mode: "number" }).notNull(), // Unix timestamp
    paymentType: mysqlEnum("paymentType", [
      "premium_payment",
      "annuity_payment",
      "partial_payment",
      "refund",
      "adjustment",
      "other"
    ]).default("premium_payment"),
    
    // Payment Status
    status: mysqlEnum("status", [
      "pending",
      "processing",
      "completed",
      "failed",
      "cancelled",
      "refunded"
    ]).default("pending"),
    
    // Transaction Details
    transactionId: varchar("transactionId", { length: 255 }), // External transaction ID (from payment processor)
    referenceNumber: varchar("referenceNumber", { length: 100 }), // Internal reference number
    notes: text("notes"),
    failureReason: text("failureReason"), // If status = failed
    
    // Metadata
    processedAt: bigint("processedAt", { mode: "number" }), // Unix timestamp when payment was processed
    confirmedAt: bigint("confirmedAt", { mode: "number" }), // Unix timestamp when payment was confirmed
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    clientIdIdx: index("idx_paymentHistory_clientId").on(table.clientId),
    policyIdIdx: index("idx_paymentHistory_policyId").on(table.policyId),
    paymentDateIdx: index("idx_paymentHistory_paymentDate").on(table.paymentDate),
    statusIdx: index("idx_paymentHistory_status").on(table.status),
    transactionIdIdx: index("idx_paymentHistory_transactionId").on(table.transactionId),
  })
);

export type PaymentHistory = typeof paymentHistory.$inferSelect;
export type InsertPaymentHistory = typeof paymentHistory.$inferInsert;


/**
 * ============================================================================
 * DOCUMENTS & RESOURCES
 * ============================================================================
 */

/**
 * PDFs table — Store document metadata and storage URLs
 * Used for admin dashboard resource library
 */
export const pdfs = mysqlTable(
  "pdfs",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    subcategory: varchar("subcategory", { length: 100 }),
    description: text("description"),
    storageUrl: text("storageUrl").notNull(),
    fileName: varchar("fileName", { length: 255 }).notNull(),
    fileSize: int("fileSize"),
    mimeType: varchar("mimeType", { length: 100 }).default("application/pdf"),
    isPublic: tinyint("isPublic").default(0),
    displayOrder: int("displayOrder").default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    categoryIdx: index("idx_pdfs_category").on(table.category),
    subcategoryIdx: index("idx_pdfs_subcategory").on(table.subcategory),
    isPublicIdx: index("idx_pdfs_isPublic").on(table.isPublic),
  })
);

export type PDF = typeof pdfs.$inferSelect;
export type InsertPDF = typeof pdfs.$inferInsert;

/**
 * ============================================================================
 * PERSISTENCY SNAPSHOTS
 * ============================================================================
 */

/**
 * Policy Persistency Snapshots — Annual Jan 1 starting-block records
 *
 * On Jan 1 of each year, all eligible active/in-force life policies are
 * snapshotted here. This snapshot becomes the denominator for that year's
 * official persistency rate.
 *
 * For years before the snapshot table was created, the starting block is
 * derived dynamically using:
 *   inForceDate <= Jan 1 of year
 *   AND wasEverActive = 1
 *   AND (cancelDate IS NULL OR cancelDate > Jan 1 of year)
 */
export const policyPersistencySnapshots = mysqlTable(
  "policy_persistency_snapshots",
  {
    id: int("id").autoincrement().primaryKey(),
    policyId: int("policyId").notNull(),   // FK to policies
    agentId: int("agentId"),               // FK to agents (null = admin/unassigned)
    year: int("year").notNull(),           // The year this snapshot belongs to (e.g., 2027)
    snapshotDate: bigint("snapshotDate", { mode: "number" }).notNull(), // Unix ms of Jan 1
    inForceAsOfJan1: tinyint("inForceAsOfJan1").default(1).notNull(),  // Was in-force on Jan 1?
    statusAsOfJan1: varchar("statusAsOfJan1", { length: 50 }),         // Policy status on Jan 1
    lineOfBusiness: varchar("lineOfBusiness", { length: 100 }),        // e.g., "Whole Life", "Term Life"
    isAnnuity: tinyint("isAnnuity").default(0).notNull(),              // 1 = annuity (excluded from persistency)
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    policyIdIdx: index("idx_pps_policyId").on(table.policyId),
    agentIdIdx: index("idx_pps_agentId").on(table.agentId),
    yearIdx: index("idx_pps_year").on(table.year),
    policyYearUnique: unique("uq_pps_policy_year").on(table.policyId, table.year),
    fk_policyId: foreignKey({ columns: [table.policyId], foreignColumns: [policies.id] }).onDelete("cascade"),
    fk_agentId: foreignKey({ columns: [table.agentId], foreignColumns: [agents.id] }).onDelete("set null"),
  })
);

export type PolicyPersistencySnapshot = typeof policyPersistencySnapshots.$inferSelect;
export type InsertPolicyPersistencySnapshot = typeof policyPersistencySnapshots.$inferInsert;
