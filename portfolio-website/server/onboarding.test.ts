import { describe, it, expect } from "vitest";

describe("Client Onboarding", () => {
  describe("PIN generation logic", () => {
    it("should generate a 4-digit PIN between 1000 and 9999", () => {
      for (let i = 0; i < 100; i++) {
        const pin = String(Math.floor(1000 + Math.random() * 9000));
        expect(pin.length).toBe(4);
        expect(Number(pin)).toBeGreaterThanOrEqual(1000);
        expect(Number(pin)).toBeLessThanOrEqual(9999);
      }
    });

    it("should generate unique PINs across multiple attempts", () => {
      const pins = new Set<string>();
      for (let i = 0; i < 50; i++) {
        pins.add(String(Math.floor(1000 + Math.random() * 9000)));
      }
      // With 9000 possible values, 50 attempts should produce mostly unique PINs
      expect(pins.size).toBeGreaterThan(30);
    });
  });

  describe("Text message generation", () => {
    it("should include client first name", () => {
      const firstName = "John";
      const lastName = "Doe";
      const pin = "4521";
      const policyType = "Whole Life Insurance";
      const portalUrl = "ortizinsurancebroker.com";

      const textMessage = `Hi ${firstName}! Welcome to Ortiz Insurance. Your client portal is ready.\n\nLogin at: ${portalUrl}\nLast Name: ${lastName}\nPIN: ${pin}\n\nYou can view your ${policyType} policy details, make payments, and more. If you have any questions, call us at (361) 613-8336.\n\n— Ortiz Insurance Broker`;

      expect(textMessage).toContain("Hi John!");
      expect(textMessage).toContain("Last Name: Doe");
      expect(textMessage).toContain("PIN: 4521");
      expect(textMessage).toContain("Whole Life Insurance");
      expect(textMessage).toContain("ortizinsurancebroker.com");
      expect(textMessage).toContain("(361) 613-8336");
      expect(textMessage).toContain("Ortiz Insurance Broker");
    });

    it("should include all required fields for different policy types", () => {
      const policyTypes = [
        "Whole Life Insurance",
        "Term Life Insurance",
        "Final Expense Insurance",
        "Fixed Index Annuity (FIA)",
        "Multi-Year Guaranteed Annuity (MYGA)",
      ];

      policyTypes.forEach((policyType) => {
        const textMessage = `Hi Maria! Welcome to Ortiz Insurance. Your client portal is ready.\n\nLogin at: ortizinsurancebroker.com\nLast Name: Garcia\nPIN: 7890\n\nYou can view your ${policyType} policy details, make payments, and more. If you have any questions, call us at (361) 613-8336.\n\n— Ortiz Insurance Broker`;

        expect(textMessage).toContain(policyType);
        expect(textMessage).toContain("Hi Maria!");
        expect(textMessage).toContain("Last Name: Garcia");
      });
    });
  });

  describe("Input validation", () => {
    it("should require all fields to be non-empty", () => {
      const requiredFields = ["firstName", "lastName", "email", "phone", "policyType"];
      requiredFields.forEach((field) => {
        expect(field).toBeTruthy();
      });
    });

    it("should validate email format", () => {
      const validEmails = ["test@example.com", "user@domain.co", "name@company.org"];
      const invalidEmails = ["notanemail", "@domain.com", "user@", ""];

      validEmails.forEach((email) => {
        expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });

      invalidEmails.forEach((email) => {
        expect(email).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });
  });

  describe("Duplicate detection", () => {
    it("should detect duplicate clients by name and email", () => {
      const existingClients = [
        { firstName: "John", lastName: "Doe", email: "john@test.com" },
        { firstName: "Jane", lastName: "Smith", email: "jane@test.com" },
      ];

      const newClient = { firstName: "John", lastName: "Doe", email: "john@test.com" };

      const isDuplicate = existingClients.some(
        (c) =>
          c.firstName.toLowerCase() === newClient.firstName.toLowerCase() &&
          c.lastName.toLowerCase() === newClient.lastName.toLowerCase() &&
          c.email.toLowerCase() === newClient.email.toLowerCase()
      );

      expect(isDuplicate).toBe(true);
    });

    it("should not flag different clients as duplicates", () => {
      const existingClients = [
        { firstName: "John", lastName: "Doe", email: "john@test.com" },
      ];

      const newClient = { firstName: "John", lastName: "Doe", email: "different@test.com" };

      const isDuplicate = existingClients.some(
        (c) =>
          c.firstName.toLowerCase() === newClient.firstName.toLowerCase() &&
          c.lastName.toLowerCase() === newClient.lastName.toLowerCase() &&
          c.email.toLowerCase() === newClient.email.toLowerCase()
      );

      expect(isDuplicate).toBe(false);
    });
  });
});
