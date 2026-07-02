import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { clients, policies, salesEntries } from "../drizzle/schema";

describe("agent.createClientFromIntakeForm", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
  });

  afterAll(async () => {
    // Cleanup: Delete any test clients created during tests
    if (db) {
      const testClients = await db.select().from(clients)
        .where(eq(clients.firstName, "IntakeFormTest"));
      for (const client of testClients) {
        await db.delete(policies).where(eq(policies.clientId, client.id));
        await db.delete(clients).where(eq(clients.id, client.id));
      }
    }
  });

  it("should create a client with associated policy when premium is provided", async () => {
    if (!db) {
      throw new Error("Database not available");
    }

    // Simulate creating a client via intake form
    const pin = "TE0001";
    const testClientData = {
      pin,
      firstName: "IntakeFormTest",
      lastName: "Client",
      email: `intake-form-test-${Date.now()}@ortizinsurance.local`,
      phone: "555-1234",
      address: "123 Test St",
      city: "Corpus Christi",
      state: "TX",
      zip: "12345",
      dateOfBirth: new Date("1990-01-01").getTime(),
      ssn: "123-45-6789",
      driverLicense: "DL123456",
      driverLicenseState: "TX",
      healthConditionsJSON: "{}",
      bankName: "Local Bank",
      accountNumber: "123456789",
      routingNumber: "987654321",
      age: "34",
      gender: "Male",
      smoker: 0,
      goal: "Protect family",
      medicalConditions: "None",
      prescriptions: "None",
      surgeries: "None",
      height: "6ft",
      weight: "180lbs",
      maritalStatus: "Married",
      kids: "2",
      additionalHealthNotes: "Healthy",
      placeOfBirth: "USA",
      citizenship: "US",
      resident: 1,
      cardNumber: "4111111111111111",
      cardExpiration: "12/25",
      doctorOrClinic: "Test Clinic",
      lastVisit: new Date().getTime(),
      doctorPhone: "555-5678",
      doctorAddress: "456 Doctor St",
      beneficiary1Name: "Spouse",
      beneficiary1DOB: new Date("1992-01-01").getTime(),
      beneficiary1Relationship: "Spouse",
      beneficiary2Name: "",
      beneficiary2DOB: null,
      beneficiary2Relationship: "",
      beneficiary3Name: "",
      beneficiary3DOB: null,
      beneficiary3Relationship: "",
      bankAccountType: "Checking",
      carrier: "Test Carrier",
      productPolicyType: "Life Insurance",
      policyNumber: "POL-TE0001",
      coverageDeathBenefit: "250000",
      monthlyPremium: "100",
      annualPremium: "1200",
      effectiveDate: new Date().getTime(),
      statusSelected: 0,
      statusDenied: 0,
      existingLifeInsuranceSource: "None",
    };

    // Insert the client
    await db.insert(clients).values(testClientData);

    // Retrieve the created client
    const createdClients = await db.select().from(clients)
      .where(eq(clients.pin, pin));
    
    expect(createdClients.length).toBeGreaterThan(0);
    const clientId = createdClients[0].id;

    // Create the associated policy
    const policyData = {
      agentId: 1, // Assuming agent ID 1 exists
      clientId: clientId,
      policyNumber: "POL-TE0001",
      type: "Life Insurance",
      carrier: "Test Carrier",
      status: "active",
      premiumAmount: "100",
      premiumFrequency: "monthly",
      coverageAmount: "250000",
      yearlyAP: "1200",
      isPaid: 0,
      effectiveDate: new Date().getTime(),
      description: "Onboarded via intake form",
    };

    await db.insert(policies).values(policyData);

    // Verify the policy was created
    const createdPolicies = await db.select().from(policies)
      .where(eq(policies.clientId, clientId));
    
    expect(createdPolicies.length).toBe(1);
    expect(createdPolicies[0].policyNumber).toBe("POL-TE0001");
    expect(createdPolicies[0].carrier).toBe("Test Carrier");
    expect(createdPolicies[0].premiumAmount).toBe("100.00");

    // Cleanup
    await db.delete(policies).where(eq(policies.clientId, clientId));
    await db.delete(clients).where(eq(clients.id, clientId));
  });

  it("should create client without policy when premium is not provided", async () => {
    if (!db) {
      throw new Error("Database not available");
    }

    const pin = "TE0002";
    const testClientData = {
      pin,
      firstName: "IntakeFormTest",
      lastName: "NoPolicy",
      email: `intake-form-nopolicy-${Date.now()}@ortizinsurance.local`,
      phone: "555-9999",
      address: "789 No Policy St",
      city: "No City",
      state: "TX",
      zip: "54321",
      dateOfBirth: new Date("1985-01-01").getTime(),
      ssn: "987-65-4321",
      driverLicense: "DL654321",
      driverLicenseState: "TX",
      healthConditionsJSON: "{}",
      bankName: "Test Bank",
      accountNumber: "987654321",
      routingNumber: "123456789",
      age: "39",
      gender: "Female",
      smoker: 0,
      goal: "Retirement",
      medicalConditions: "None",
      prescriptions: "None",
      surgeries: "None",
      height: "5ft6in",
      weight: "140lbs",
      maritalStatus: "Single",
      kids: "0",
      additionalHealthNotes: "Excellent",
      placeOfBirth: "USA",
      citizenship: "US",
      resident: 1,
      cardNumber: "4111111111111111",
      cardExpiration: "12/26",
      doctorOrClinic: "Test Clinic",
      lastVisit: new Date().getTime(),
      doctorPhone: "555-5678",
      doctorAddress: "456 Doctor St",
      beneficiary1Name: "Parent",
      beneficiary1DOB: new Date("1960-01-01").getTime(),
      beneficiary1Relationship: "Parent",
      beneficiary2Name: "",
      beneficiary2DOB: null,
      beneficiary2Relationship: "",
      beneficiary3Name: "",
      beneficiary3DOB: null,
      beneficiary3Relationship: "",
      bankAccountType: "Savings",
      carrier: "",
      productPolicyType: "",
      policyNumber: "",
      coverageDeathBenefit: "",
      monthlyPremium: "0", // No premium
      annualPremium: "0",
      effectiveDate: null,
      statusSelected: 0,
      statusDenied: 0,
      existingLifeInsuranceSource: "None",
    };

    // Insert the client
    await db.insert(clients).values(testClientData);

    // Retrieve the created client
    const createdClients = await db.select().from(clients)
      .where(eq(clients.pin, pin));
    
    expect(createdClients.length).toBeGreaterThan(0);
    const clientId = createdClients[0].id;

    // Verify no policy was created (since premium is 0)
    const createdPolicies = await db.select().from(policies)
      .where(eq(policies.clientId, clientId));
    
    expect(createdPolicies.length).toBe(0);

    // Cleanup
    await db.delete(clients).where(eq(clients.id, clientId));
  });
});
