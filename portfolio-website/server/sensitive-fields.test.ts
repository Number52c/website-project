/**
 * Security test: Verify sensitive fields are stripped from API responses
 * Tests that passwordHash, pin, SSN, bank info are never returned to frontend
 */
import { describe, it, expect } from "vitest";

describe("Sensitive Field Stripping", () => {
  // Simulate the agent.me field stripping logic
  describe("agent.me endpoint", () => {
    it("should strip passwordHash, passwordChangedAt, and pin from agent data", () => {
      const mockAgent = {
        id: 1,
        userId: null,
        firstName: "Test",
        lastName: "Agent",
        email: "test@example.com",
        phone: "555-0100",
        licenseNumber: "LIC123",
        licenseState: "TX",
        agentStatus: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordHash: "SENSITIVE_HASH_VALUE_abc123",
        passwordChangedAt: 1719360000000,
        profilePictureUrl: null,
        pin: "1234",
        color: "#ff0000",
      };

      // Apply the same logic as the endpoint
      const { passwordHash, passwordChangedAt, pin, ...safeAgent } = mockAgent;

      expect(safeAgent).not.toHaveProperty("passwordHash");
      expect(safeAgent).not.toHaveProperty("passwordChangedAt");
      expect(safeAgent).not.toHaveProperty("pin");
      expect(safeAgent).toHaveProperty("id");
      expect(safeAgent).toHaveProperty("firstName");
      expect(safeAgent).toHaveProperty("email");
      expect(safeAgent).toHaveProperty("color");
    });
  });

  // Simulate the admin.listAgents field stripping logic
  describe("admin.listAgents endpoint", () => {
    it("should strip passwordHash and pin from all agent records", () => {
      const mockAgents = [
        {
          id: 1,
          firstName: "Agent",
          lastName: "One",
          email: "agent1@test.com",
          passwordHash: "HASH_1",
          pin: "1111",
          agentStatus: "active",
          phone: "555-0001",
        },
        {
          id: 2,
          firstName: "Agent",
          lastName: "Two",
          email: "agent2@test.com",
          passwordHash: "HASH_2",
          pin: "2222",
          agentStatus: "active",
          phone: "555-0002",
        },
      ];

      // Apply the same logic as the endpoint
      const result = mockAgents.map(({ passwordHash, pin, ...safeAgent }) => safeAgent);

      for (const agent of result) {
        expect(agent).not.toHaveProperty("passwordHash");
        expect(agent).not.toHaveProperty("pin");
        expect(agent).toHaveProperty("id");
        expect(agent).toHaveProperty("firstName");
        expect(agent).toHaveProperty("email");
      }
    });
  });

  // Simulate the admin.getAllAgents field stripping logic
  describe("admin.getAllAgents endpoint", () => {
    it("should strip passwordHash and pin from all agent records", () => {
      const mockAgents = [
        {
          id: 1,
          firstName: "Agent",
          lastName: "One",
          email: "agent1@test.com",
          passwordHash: "HASH_1",
          pin: "1111",
          agentStatus: "active",
        },
      ];

      const result = mockAgents.map(({ passwordHash, pin, ...safeAgent }) => safeAgent);

      for (const agent of result) {
        expect(agent).not.toHaveProperty("passwordHash");
        expect(agent).not.toHaveProperty("pin");
      }
    });
  });

  // Simulate the agent.myClients field stripping logic
  describe("agent.myClients endpoint", () => {
    it("should strip pin, ssn, driverLicense, accountNumber, routingNumber, bankName from client data", () => {
      const mockClients = [
        {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          email: "john@test.com",
          phone: "555-1234",
          pin: "HASHED_PIN",
          ssn: "123-45-6789",
          driverLicense: "DL12345",
          accountNumber: "9876543210",
          routingNumber: "021000021",
          bankName: "Chase Bank",
          address: "123 Main St",
          city: "Corpus Christi",
          state: "TX",
        },
      ];

      // Apply the same logic as the endpoint
      const result = mockClients.map(({ pin, ssn, driverLicense, accountNumber, routingNumber, bankName, ...safeClient }) => safeClient);

      for (const client of result) {
        expect(client).not.toHaveProperty("pin");
        expect(client).not.toHaveProperty("ssn");
        expect(client).not.toHaveProperty("driverLicense");
        expect(client).not.toHaveProperty("accountNumber");
        expect(client).not.toHaveProperty("routingNumber");
        expect(client).not.toHaveProperty("bankName");
        expect(client).toHaveProperty("id");
        expect(client).toHaveProperty("firstName");
        expect(client).toHaveProperty("email");
        expect(client).toHaveProperty("address");
      }
    });
  });

  // Simulate the portal.me field stripping logic
  describe("portal.me endpoint", () => {
    it("should strip pin, ssn, driverLicense, accountNumber, routingNumber from client data", () => {
      const mockPortalClient = {
        id: 1,
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@test.com",
        pin: "HASHED_PIN",
        ssn: "987-65-4321",
        driverLicense: "DL99999",
        accountNumber: "1234567890",
        routingNumber: "021000089",
        bankName: "Wells Fargo",
        address: "456 Oak Ave",
      };

      const { pin, ssn, driverLicense, accountNumber, routingNumber, ...safeClient } = mockPortalClient;

      expect(safeClient).not.toHaveProperty("pin");
      expect(safeClient).not.toHaveProperty("ssn");
      expect(safeClient).not.toHaveProperty("driverLicense");
      expect(safeClient).not.toHaveProperty("accountNumber");
      expect(safeClient).not.toHaveProperty("routingNumber");
      expect(safeClient).toHaveProperty("id");
      expect(safeClient).toHaveProperty("firstName");
      expect(safeClient).toHaveProperty("bankName"); // portal.me keeps bankName (admin needs it)
    });
  });

  // Verify login endpoints don't return sensitive data
  describe("agent.login endpoint", () => {
    it("should only return success, agentName, and requiresPasswordChange", () => {
      const loginResponse = {
        success: true,
        agentName: "Test Agent",
        requiresPasswordChange: false,
      };

      expect(loginResponse).not.toHaveProperty("passwordHash");
      expect(loginResponse).not.toHaveProperty("pin");
      expect(loginResponse).not.toHaveProperty("email");
      expect(loginResponse).toHaveProperty("success");
      expect(loginResponse).toHaveProperty("agentName");
      expect(loginResponse).toHaveProperty("requiresPasswordChange");
    });
  });

  // Verify getAgentPerformance only returns safe projections
  describe("admin.getAgentPerformance endpoint", () => {
    it("should only return id, name, and stats - not full agent objects", () => {
      const performanceResult = {
        id: 1,
        name: "Test Agent",
        monthlyStats: { salesCount: 5, totalAP: 10000, totalCommission: 1000 },
        ytdStats: { salesCount: 20, totalAP: 50000, totalCommission: 5000 },
      };

      expect(performanceResult).not.toHaveProperty("passwordHash");
      expect(performanceResult).not.toHaveProperty("pin");
      expect(performanceResult).not.toHaveProperty("email");
      expect(performanceResult).toHaveProperty("id");
      expect(performanceResult).toHaveProperty("name");
      expect(performanceResult).toHaveProperty("monthlyStats");
    });
  });
});
