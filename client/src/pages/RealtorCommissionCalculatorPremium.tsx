/**
 * RealtorCommissionCalculatorPremium.tsx
 * Premium version with life insurance needs and tax strategy insights
 */

import { useState, useMemo } from "react";
import { PremiumCalculatorBase, CalculatorStep, CalculatorResult } from "@/components/PremiumCalculatorBase";
import { Building2, DollarSign, TrendingUp, Target, Heart, PiggyBank, CircleCheck as CheckCircle2 } from "lucide-react";

const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
};

export default function RealtorCommissionCalculatorPremium() {
  // State for all inputs
  const [age, setAge] = useState(35);
  const [retirementAge, setRetirementAge] = useState(65);
  const [annualCommission, setAnnualCommission] = useState(150000);
  const [currentSavings, setCurrentSavings] = useState(100000);
  const [annualSavings, setAnnualSavings] = useState(30000);
  const [dependents, setDependents] = useState(2);
  const [existingLifeInsurance, setExistingLifeInsurance] = useState(500000);
  const [mortgage, setMortgage] = useState(400000);
  const [inflationRate, setInflationRate] = useState(3);
  const [investmentReturn, setInvestmentReturn] = useState(7);
  const [retirementYears, setRetirementYears] = useState(25);

  // Calculate all retirement metrics
  const calculations = useMemo(() => {
    const yearsToRetirement = retirementAge - age;

    // Retirement savings projection
    let futureRetirementSavings = currentSavings;
    for (let i = 0; i < yearsToRetirement; i++) {
      futureRetirementSavings = futureRetirementSavings * (1 + investmentReturn / 100) + annualSavings;
    }

    // Income needed in retirement (80% replacement)
    let retirementIncomeNeeded = annualCommission * 0.8;
    for (let i = 0; i < yearsToRetirement; i++) {
      retirementIncomeNeeded *= 1 + inflationRate / 100;
    }

    // Total needed for retirement
    const totalNeeded = retirementIncomeNeeded * retirementYears;

    // Funding gap
    const fundingGap = Math.max(0, totalNeeded - futureRetirementSavings);

    // Life insurance needs (DIME method)
    const debtEstimate = 50000; // Credit cards, car loans, etc.
    const incomeReplacement = annualCommission * 10; // 10 years income replacement
    const mortgageEstimate = mortgage;
    const educationFund = 150000 * dependents; // $150k per dependent
    const totalLifeInsuranceNeeded = debtEstimate + incomeReplacement + mortgageEstimate + educationFund;
    const lifeInsuranceGap = Math.max(0, totalLifeInsuranceNeeded - existingLifeInsurance);

    // Tax considerations
    const estimatedTaxRate = 0.25; // 25% estimated tax bracket
    const annualTaxes = annualCommission * estimatedTaxRate;
    const taxSavingsFromSavings = annualSavings * 0.15; // Assuming some tax-advantaged savings

    // Year-by-year projection
    let savingsValue = currentSavings;
    const projectionData = [];
    for (let year = 0; year <= yearsToRetirement; year++) {
      projectionData.push({
        year: age + year,
        value: Math.round(savingsValue),
      });
      if (year < yearsToRetirement) {
        savingsValue = savingsValue * (1 + investmentReturn / 100) + annualSavings;
      }
    }

    return {
      futureRetirementSavings,
      retirementIncomeNeeded,
      totalNeeded,
      fundingGap,
      totalLifeInsuranceNeeded,
      lifeInsuranceGap,
      annualTaxes,
      taxSavingsFromSavings,
      projectionData,
      yearsToRetirement,
    };
  }, [
    age,
    retirementAge,
    annualCommission,
    currentSavings,
    annualSavings,
    dependents,
    existingLifeInsurance,
    mortgage,
    inflationRate,
    investmentReturn,
    retirementYears,
  ]);

  // Define calculator steps
  const steps: CalculatorStep[] = [
    {
      id: 1,
      title: "Your Real Estate Career",
      description: "Tell us about your income and retirement timeline",
      fields: [
        {
          label: "Current Age",
          type: "slider",
          min: 20,
          max: 70,
          value: age,
          onChange: setAge,
          unit: "years",
        },
        {
          label: "Target Retirement Age",
          type: "slider",
          min: 55,
          max: 75,
          value: retirementAge,
          onChange: setRetirementAge,
          unit: "years",
        },
        {
          label: "Annual Commission Income",
          type: "slider",
          min: 50000,
          max: 500000,
          value: annualCommission,
          onChange: setAnnualCommission,
          unit: "dollars",
          step: 10000,
        },
      ],
    },
    {
      id: 2,
      title: "Retirement Savings",
      description: "How much are you saving for retirement?",
      fields: [
        {
          label: "Current Retirement Savings",
          type: "slider",
          min: 0,
          max: 500000,
          value: currentSavings,
          onChange: setCurrentSavings,
          unit: "dollars",
          step: 10000,
        },
        {
          label: "Annual Savings",
          type: "slider",
          min: 0,
          max: 100000,
          value: annualSavings,
          onChange: setAnnualSavings,
          unit: "dollars",
          step: 5000,
        },
      ],
    },
    {
      id: 3,
      title: "Life Insurance Needs",
      description: "Protect your family with adequate coverage",
      fields: [
        {
          label: "Number of Dependents",
          type: "slider",
          min: 0,
          max: 5,
          value: dependents,
          onChange: setDependents,
          unit: "people",
        },
        {
          label: "Current Mortgage Balance",
          type: "slider",
          min: 0,
          max: 1000000,
          value: mortgage,
          onChange: setMortgage,
          unit: "dollars",
          step: 50000,
        },
        {
          label: "Existing Life Insurance",
          type: "slider",
          min: 0,
          max: 2000000,
          value: existingLifeInsurance,
          onChange: setExistingLifeInsurance,
          unit: "dollars",
          step: 50000,
        },
      ],
    },
    {
      id: 4,
      title: "Your Results",
      description: "See your complete financial picture",
      fields: [],
    },
  ];

  // Results to display
  const results: CalculatorResult[] = [
    {
      title: "Retirement Savings at Retirement",
      value: formatCurrency(calculations.futureRetirementSavings),
      icon: PiggyBank,
      color: "bg-blue-600",
      description: `Growing at ${investmentReturn}% annually`,
    },
    {
      title: "Annual Retirement Income Needed",
      value: formatCurrency(calculations.retirementIncomeNeeded),
      icon: DollarSign,
      color: "bg-green-600",
      description: `80% of current income`,
    },
    {
      title: "Life Insurance Gap",
      value: calculations.lifeInsuranceGap > 0 ? formatCurrency(calculations.lifeInsuranceGap) : "✓ Covered",
      icon: Heart,
      color: calculations.lifeInsuranceGap > 0 ? "bg-red-600" : "bg-green-600",
      description: `Total needed: ${formatCurrency(calculations.totalLifeInsuranceNeeded)}`,
    },
    {
      title: "Annual Tax Burden",
      value: formatCurrency(calculations.annualTaxes),
      icon: TrendingUp,
      color: "bg-purple-600",
      description: `At 25% estimated rate`,
    },
  ];

  // Professional insights for results page
  const professionalInsights = [
    {
      title: "Retirement Savings Strategy",
      icon: PiggyBank,
      points: [
        `Your retirement savings will grow to ${formatCurrency(calculations.futureRetirementSavings)} by age ${retirementAge}`,
        `This provides ${formatCurrency(calculations.futureRetirementSavings / retirementYears)}/year for ${retirementYears} years`,
        `Current annual savings: ${formatCurrency(annualSavings)}`,
        calculations.fundingGap > 0
          ? `Funding gap: ${formatCurrency(calculations.fundingGap)} - Consider increasing savings or working longer`
          : `✓ Your retirement is fully funded!`,
      ],
    },
    {
      title: "Life Insurance Protection (DIME Method)",
      icon: Heart,
      points: [
        `Debt to cover: ${formatCurrency(50000)}`,
        `Income replacement (10 years): ${formatCurrency(annualCommission * 10)}`,
        `Mortgage balance: ${formatCurrency(mortgage)}`,
        `Education fund (${dependents} dependents): ${formatCurrency(150000 * dependents)}`,
        `Total needed: ${formatCurrency(calculations.totalLifeInsuranceNeeded)}`,
        calculations.lifeInsuranceGap > 0
          ? `Coverage gap: ${formatCurrency(calculations.lifeInsuranceGap)} - Recommend term or permanent life insurance`
          : `✓ Your family is adequately protected`,
      ],
    },
    {
      title: "Tax Optimization",
      icon: DollarSign,
      points: [
        `Annual commission income: ${formatCurrency(annualCommission)}`,
        `Estimated annual taxes (25% bracket): ${formatCurrency(calculations.annualTaxes)}`,
        `Tax savings from retirement contributions: ${formatCurrency(calculations.taxSavingsFromSavings)}/year`,
        `Consider SEP-IRA or Solo 401(k) to reduce taxable income and build retirement savings`,
        `Work with a CPA to maximize business deductions and minimize tax liability`,
      ],
    },
    {
      title: "Complete Financial Plan",
      icon: Target,
      points: [
        `Retirement income needed: ${formatCurrency(calculations.retirementIncomeNeeded)}/year`,
        `Your plan provides: ${formatCurrency(calculations.futureRetirementSavings / retirementYears)}/year`,
        `Life insurance protects: ${calculations.lifeInsuranceGap > 0 ? "Partially - gap exists" : "✓ Fully covered"}`,
        `Schedule a consultation to discuss your complete financial strategy and protection plan`,
      ],
    },
  ];

  return (
    <PremiumCalculatorBase
      title="Realtor Financial Planner"
      description="Plan your retirement, taxes, and life insurance coverage"
      steps={steps}
      results={results}
      projectionData={calculations.projectionData}
      professionalInsights={professionalInsights}
      chartTitle="Retirement Savings Growth Projection"
      yAxisLabel="Savings Balance"
    />
  );
}
