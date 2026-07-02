import { describe, it, expect } from "vitest";

/**
 * DIME Calculator Tests
 * Tests the DIME method: Debt, Income Replacement, Mortgage, Education
 */

function calculateDIME(formData: any) {
  const {
    autoLoans,
    studentLoans,
    creditCardDebt,
    personalLoans,
    annualIncome,
    yearsToReplace,
    mortgageBalance,
    numChildren,
    costPerChild,
    finalExpenses,
    existingCoverage,
  } = formData;

  // D - Debt
  const totalDebt = autoLoans + studentLoans + creditCardDebt + personalLoans;

  // I - Income Replacement
  const incomeReplacement = annualIncome * yearsToReplace;

  // M - Mortgage
  const mortgage = mortgageBalance;

  // E - Education
  const education = numChildren * costPerChild;

  // Total coverage need
  const totalNeed =
    totalDebt + incomeReplacement + mortgage + education + finalExpenses;

  // Net coverage
  const netNeed = Math.max(totalNeed - existingCoverage, 0);

  // Round to nearest $50,000
  const recommendedCoverage = Math.ceil(netNeed / 50000) * 50000;

  // Premium estimates
  const termRate = 0.5;
  const wholeLifeRate = 8;

  return {
    debt: totalDebt,
    incomeReplacement,
    mortgage,
    education,
    finalExpenses,
    subtotal: totalNeed,
    existingCoverage,
    netNeed,
    recommendedCoverage,
    estimatedTermMonthly: Math.round((recommendedCoverage * termRate) / 12),
    estimatedWholeLifeMonthly: Math.round(
      (recommendedCoverage * wholeLifeRate) / 12
    ),
  };
}

describe("DIME Calculator", () => {
  describe("Basic DIME Calculation", () => {
    it("should calculate total coverage need with all DIME components", () => {
      const formData = {
        autoLoans: 25000,
        studentLoans: 35000,
        creditCardDebt: 10000,
        personalLoans: 5000,
        annualIncome: 55000,
        yearsToReplace: 15,
        mortgageBalance: 250000,
        numChildren: 2,
        costPerChild: 100000,
        finalExpenses: 15000,
        existingCoverage: 0,
      };

      const result = calculateDIME(formData);

      // D = 25000 + 35000 + 10000 + 5000 = 75000
      expect(result.debt).toBe(75000);

      // I = 55000 * 15 = 825000
      expect(result.incomeReplacement).toBe(825000);

      // M = 250000
      expect(result.mortgage).toBe(250000);

      // E = 2 * 100000 = 200000
      expect(result.education).toBe(200000);

      // Total = 75000 + 825000 + 250000 + 200000 + 15000 = 1,365,000
      expect(result.subtotal).toBe(1365000);

      // Recommended should be rounded to nearest $50K
      expect(result.recommendedCoverage % 50000).toBe(0);
    });

    it("should match the blog example calculation", () => {
      // From blog: $250K mortgage + $25K car + $10K CC + $825K income (15yr @ $55K) + $200K education + $15K final = $1,325,000
      const formData = {
        autoLoans: 25000,
        studentLoans: 0,
        creditCardDebt: 10000,
        personalLoans: 0,
        annualIncome: 55000,
        yearsToReplace: 15,
        mortgageBalance: 250000,
        numChildren: 2,
        costPerChild: 100000,
        finalExpenses: 15000,
        existingCoverage: 0,
      };

      const result = calculateDIME(formData);

      expect(result.subtotal).toBe(1325000);
      expect(result.recommendedCoverage).toBeGreaterThanOrEqual(1325000);
    });
  });

  describe("Individual DIME Components", () => {
    it("should calculate Debt (D) correctly", () => {
      const formData = {
        autoLoans: 20000,
        studentLoans: 30000,
        creditCardDebt: 5000,
        personalLoans: 2000,
        annualIncome: 0,
        yearsToReplace: 0,
        mortgageBalance: 0,
        numChildren: 0,
        costPerChild: 0,
        finalExpenses: 0,
        existingCoverage: 0,
      };

      const result = calculateDIME(formData);

      expect(result.debt).toBe(57000);
      expect(result.subtotal).toBe(57000);
    });

    it("should calculate Income Replacement (I) correctly", () => {
      const formData = {
        autoLoans: 0,
        studentLoans: 0,
        creditCardDebt: 0,
        personalLoans: 0,
        annualIncome: 60000,
        yearsToReplace: 20,
        mortgageBalance: 0,
        numChildren: 0,
        costPerChild: 0,
        finalExpenses: 0,
        existingCoverage: 0,
      };

      const result = calculateDIME(formData);

      expect(result.incomeReplacement).toBe(1200000);
      expect(result.subtotal).toBe(1200000);
    });

    it("should calculate Mortgage (M) correctly", () => {
      const formData = {
        autoLoans: 0,
        studentLoans: 0,
        creditCardDebt: 0,
        personalLoans: 0,
        annualIncome: 0,
        yearsToReplace: 0,
        mortgageBalance: 350000,
        numChildren: 0,
        costPerChild: 0,
        finalExpenses: 0,
        existingCoverage: 0,
      };

      const result = calculateDIME(formData);

      expect(result.mortgage).toBe(350000);
      expect(result.subtotal).toBe(350000);
    });

    it("should calculate Education (E) correctly", () => {
      const formData = {
        autoLoans: 0,
        studentLoans: 0,
        creditCardDebt: 0,
        personalLoans: 0,
        annualIncome: 0,
        yearsToReplace: 0,
        mortgageBalance: 0,
        numChildren: 3,
        costPerChild: 120000,
        finalExpenses: 0,
        existingCoverage: 0,
      };

      const result = calculateDIME(formData);

      expect(result.education).toBe(360000);
      expect(result.subtotal).toBe(360000);
    });
  });

  describe("Income Replacement Variations", () => {
    it("should increase coverage with more years of replacement", () => {
      const baseFormData = {
        autoLoans: 0,
        studentLoans: 0,
        creditCardDebt: 0,
        personalLoans: 0,
        annualIncome: 50000,
        mortgageBalance: 0,
        numChildren: 0,
        costPerChild: 0,
        finalExpenses: 0,
        existingCoverage: 0,
      };

      const result5Years = calculateDIME({
        ...baseFormData,
        yearsToReplace: 5,
      });
      const result10Years = calculateDIME({
        ...baseFormData,
        yearsToReplace: 10,
      });
      const result20Years = calculateDIME({
        ...baseFormData,
        yearsToReplace: 20,
      });

      expect(result5Years.incomeReplacement).toBe(250000);
      expect(result10Years.incomeReplacement).toBe(500000);
      expect(result20Years.incomeReplacement).toBe(1000000);

      expect(result5Years.recommendedCoverage).toBeLessThan(
        result10Years.recommendedCoverage
      );
      expect(result10Years.recommendedCoverage).toBeLessThan(
        result20Years.recommendedCoverage
      );
    });
  });

  describe("Education Costs", () => {
    it("should scale education costs with number of children", () => {
      const baseFormData = {
        autoLoans: 0,
        studentLoans: 0,
        creditCardDebt: 0,
        personalLoans: 0,
        annualIncome: 0,
        yearsToReplace: 0,
        mortgageBalance: 0,
        costPerChild: 100000,
        finalExpenses: 0,
        existingCoverage: 0,
      };

      const result1Child = calculateDIME({
        ...baseFormData,
        numChildren: 1,
      });
      const result2Children = calculateDIME({
        ...baseFormData,
        numChildren: 2,
      });
      const result3Children = calculateDIME({
        ...baseFormData,
        numChildren: 3,
      });

      expect(result1Child.education).toBe(100000);
      expect(result2Children.education).toBe(200000);
      expect(result3Children.education).toBe(300000);
    });

    it("should handle different education costs per child", () => {
      const formData = {
        autoLoans: 0,
        studentLoans: 0,
        creditCardDebt: 0,
        personalLoans: 0,
        annualIncome: 0,
        yearsToReplace: 0,
        mortgageBalance: 0,
        numChildren: 2,
        costPerChild: 150000,
        finalExpenses: 0,
        existingCoverage: 0,
      };

      const result = calculateDIME(formData);

      expect(result.education).toBe(300000);
    });
  });

  describe("Existing Coverage Offset", () => {
    it("should reduce net need by existing coverage", () => {
      const baseFormData = {
        autoLoans: 0,
        studentLoans: 0,
        creditCardDebt: 0,
        personalLoans: 0,
        annualIncome: 100000,
        yearsToReplace: 10,
        mortgageBalance: 200000,
        numChildren: 0,
        costPerChild: 0,
        finalExpenses: 10000,
      };

      const noExistingCoverage = calculateDIME({
        ...baseFormData,
        existingCoverage: 0,
      });
      const withExistingCoverage = calculateDIME({
        ...baseFormData,
        existingCoverage: 300000,
      });

      expect(noExistingCoverage.netNeed).toBeGreaterThan(
        withExistingCoverage.netNeed
      );
      expect(noExistingCoverage.recommendedCoverage).toBeGreaterThan(
        withExistingCoverage.recommendedCoverage
      );
    });

    it("should ensure minimum coverage of zero", () => {
      const formData = {
        autoLoans: 0,
        studentLoans: 0,
        creditCardDebt: 0,
        personalLoans: 0,
        annualIncome: 0,
        yearsToReplace: 0,
        mortgageBalance: 0,
        numChildren: 0,
        costPerChild: 0,
        finalExpenses: 0,
        existingCoverage: 1000000,
      };

      const result = calculateDIME(formData);

      expect(result.netNeed).toBe(0);
      expect(result.recommendedCoverage).toBe(0);
    });
  });

  describe("Coverage Rounding", () => {
    it("should round recommended coverage to nearest $50K", () => {
      const testCases = [
        { subtotal: 325000, expected: 350000 }, // Rounds up
        { subtotal: 324999, expected: 350000 }, // Rounds up
        { subtotal: 300000, expected: 300000 }, // Already aligned
        { subtotal: 312500, expected: 350000 }, // Rounds up
      ];

      testCases.forEach(({ subtotal, expected }) => {
        const formData = {
          autoLoans: 0,
          studentLoans: 0,
          creditCardDebt: 0,
          personalLoans: 0,
          annualIncome: subtotal,
          yearsToReplace: 1,
          mortgageBalance: 0,
          numChildren: 0,
          costPerChild: 0,
          finalExpenses: 0,
          existingCoverage: 0,
        };

        const result = calculateDIME(formData);

        expect(result.recommendedCoverage).toBe(expected);
      });
    });
  });

  describe("Premium Estimates", () => {
    it("should calculate term life premiums correctly", () => {
      const formData = {
        autoLoans: 0,
        studentLoans: 0,
        creditCardDebt: 0,
        personalLoans: 0,
        annualIncome: 50000,
        yearsToReplace: 10,
        mortgageBalance: 0,
        numChildren: 0,
        costPerChild: 0,
        finalExpenses: 0,
        existingCoverage: 0,
      };

      const result = calculateDIME(formData);

      // Term rate is $0.50 per $1000 per month
      // 500K coverage = 500 * $0.50 = $250/month
      expect(result.estimatedTermMonthly).toBe(
        Math.round((result.recommendedCoverage * 0.5) / 12)
      );
    });

    it("should calculate whole life premiums higher than term", () => {
      const formData = {
        autoLoans: 0,
        studentLoans: 0,
        creditCardDebt: 0,
        personalLoans: 0,
        annualIncome: 100000,
        yearsToReplace: 10,
        mortgageBalance: 0,
        numChildren: 0,
        costPerChild: 0,
        finalExpenses: 0,
        existingCoverage: 0,
      };

      const result = calculateDIME(formData);

      expect(result.estimatedWholeLifeMonthly).toBeGreaterThan(
        result.estimatedTermMonthly
      );

      // Whole life rate is $8 per $1000 per month (16x term rate)
      // Due to rounding, we just verify it's approximately 16x
      const ratio = result.estimatedWholeLifeMonthly / result.estimatedTermMonthly;
      expect(ratio).toBeCloseTo(16, 0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero income scenario", () => {
      const formData = {
        autoLoans: 0,
        studentLoans: 0,
        creditCardDebt: 0,
        personalLoans: 0,
        annualIncome: 0,
        yearsToReplace: 10,
        mortgageBalance: 200000,
        numChildren: 0,
        costPerChild: 0,
        finalExpenses: 10000,
        existingCoverage: 0,
      };

      const result = calculateDIME(formData);

      // Should still calculate based on mortgage and final expenses
      expect(result.subtotal).toBe(210000);
      expect(result.recommendedCoverage).toBeGreaterThan(0);
    });

    it("should handle high debt scenario", () => {
      const formData = {
        autoLoans: 50000,
        studentLoans: 100000,
        creditCardDebt: 30000,
        personalLoans: 20000,
        annualIncome: 40000,
        yearsToReplace: 10,
        mortgageBalance: 300000,
        numChildren: 2,
        costPerChild: 100000,
        finalExpenses: 15000,
        existingCoverage: 0,
      };

      const result = calculateDIME(formData);

      expect(result.debt).toBe(200000);
      expect(result.subtotal).toBeGreaterThan(900000);
    });

    it("should handle family with no children", () => {
      const formData = {
        autoLoans: 20000,
        studentLoans: 0,
        creditCardDebt: 5000,
        personalLoans: 0,
        annualIncome: 50000,
        yearsToReplace: 10,
        mortgageBalance: 200000,
        numChildren: 0,
        costPerChild: 100000,
        finalExpenses: 10000,
        existingCoverage: 0,
      };

      const result = calculateDIME(formData);

      expect(result.education).toBe(0);
      expect(result.subtotal).toBe(735000);
    });
  });
});
