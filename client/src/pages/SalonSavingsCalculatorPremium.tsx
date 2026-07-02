/**
 * SalonSavingsCalculatorPremium.tsx
 * Premium version with SEP-IRA/Solo 401k insights
 */

import { useState, useMemo } from "react";
import { PremiumCalculatorBase, CalculatorStep, CalculatorResult } from "@/components/PremiumCalculatorBase";
import { Sparkles, DollarSign, TrendingUp, Target, Zap, PiggyBank, CircleCheck as CheckCircle2 } from "lucide-react";

const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
};

export default function SalonSavingsCalculatorPremium() {
  // State for all inputs
  const [age, setAge] = useState(35);
  const [retirementAge, setRetirementAge] = useState(65);
  const [annualIncome, setAnnualIncome] = useState(100000);
  const [currentSavings, setCurrentSavings] = useState(75000);
  const [retirementSavingsContribution, setRetirementSavingsContribution] = useState(20000);
  const [inflationRate, setInflationRate] = useState(3);
  const [investmentReturn, setInvestmentReturn] = useState(7);
  const [retirementYears, setRetirementYears] = useState(25);

  // Calculate all retirement metrics
  const calculations = useMemo(() => {
    const yearsToRetirement = retirementAge - age;

    // SEP-IRA vs Solo 401(k) comparison
    // SEP-IRA: 25% of net self-employment income, max $69,000
    const maxSepIra = Math.min(annualIncome * 0.25, 69000);
    
    // Solo 401(k): Employee deferral ($23,500) + Employer contribution (25% of net), max $69,000
    const maxSolo401k = Math.min(23500 + (annualIncome * 0.25), 69000);
    
    const actualContribution = Math.min(retirementSavingsContribution, maxSolo401k);

    // Retirement savings projection
    let futureRetirementSavings = currentSavings;
    for (let i = 0; i < yearsToRetirement; i++) {
      futureRetirementSavings = futureRetirementSavings * (1 + investmentReturn / 100) + actualContribution;
    }

    // Income needed in retirement (80% replacement)
    let retirementIncomeNeeded = annualIncome * 0.8;
    for (let i = 0; i < yearsToRetirement; i++) {
      retirementIncomeNeeded *= 1 + inflationRate / 100;
    }

    // Total needed for retirement
    const totalNeeded = retirementIncomeNeeded * retirementYears;

    // Funding gap
    const fundingGap = Math.max(0, totalNeeded - futureRetirementSavings);

    // Tax savings from retirement contributions
    const taxSavingsPerYear = actualContribution * 0.25; // Assuming 25% tax bracket
    const totalTaxSavings = taxSavingsPerYear * yearsToRetirement;

    // Year-by-year projection
    let savingsValue = currentSavings;
    const projectionData = [];
    for (let year = 0; year <= yearsToRetirement; year++) {
      projectionData.push({
        year: age + year,
        value: Math.round(savingsValue),
      });
      if (year < yearsToRetirement) {
        savingsValue = savingsValue * (1 + investmentReturn / 100) + actualContribution;
      }
    }

    return {
      maxSepIra,
      maxSolo401k,
      actualContribution,
      futureRetirementSavings,
      retirementIncomeNeeded,
      totalNeeded,
      fundingGap,
      taxSavingsPerYear,
      totalTaxSavings,
      projectionData,
      yearsToRetirement,
    };
  }, [
    age,
    retirementAge,
    annualIncome,
    currentSavings,
    retirementSavingsContribution,
    inflationRate,
    investmentReturn,
    retirementYears,
  ]);

  // Define calculator steps
  const steps: CalculatorStep[] = [
    {
      id: 1,
      title: "Your Salon Business",
      description: "Tell us about your income and current savings",
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
          label: "Annual Business Income",
          type: "slider",
          min: 40000,
          max: 300000,
          value: annualIncome,
          onChange: setAnnualIncome,
          unit: "dollars",
          step: 5000,
        },
      ],
    },
    {
      id: 2,
      title: "Retirement Savings",
      description: "SEP-IRA or Solo 401(k) contributions",
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
          label: "Annual Contribution",
          type: "slider",
          min: 0,
          max: 69000,
          value: retirementSavingsContribution,
          onChange: setRetirementSavingsContribution,
          unit: "dollars",
          step: 1000,
        },
      ],
    },
    {
      id: 3,
      title: "Investment Strategy",
      description: "Expected returns and inflation",
      fields: [
        {
          label: "Expected Annual Return",
          type: "slider",
          min: 3,
          max: 10,
          value: investmentReturn,
          onChange: setInvestmentReturn,
          unit: "%",
          step: 0.5,
        },
        {
          label: "Inflation Rate",
          type: "slider",
          min: 1,
          max: 5,
          value: inflationRate,
          onChange: setInflationRate,
          unit: "%",
          step: 0.5,
        },
      ],
    },
    {
      id: 4,
      title: "Your Results",
      description: "See your complete retirement plan",
      fields: [],
    },
  ];

  // Results to display
  const results: CalculatorResult[] = [
    {
      title: "Retirement Savings at Age 65",
      value: formatCurrency(calculations.futureRetirementSavings),
      icon: PiggyBank,
      color: "bg-blue-600",
      description: `Growing at ${investmentReturn}% annually`,
    },
    {
      title: "Max Annual Contribution",
      value: formatCurrency(calculations.maxSolo401k),
      icon: TrendingUp,
      color: "bg-green-600",
      description: `Solo 401(k) limit`,
    },
    {
      title: "Annual Tax Savings",
      value: formatCurrency(calculations.taxSavingsPerYear),
      icon: DollarSign,
      color: "bg-purple-600",
      description: `From retirement contributions`,
    },
    {
      title: "Retirement Income Gap",
      value: calculations.fundingGap > 0 ? formatCurrency(calculations.fundingGap) : "✓ Covered",
      icon: CheckCircle2,
      color: calculations.fundingGap > 0 ? "bg-red-600" : "bg-green-600",
      description: `Amount to address`,
    },
  ];

  // Professional insights for results page
  const professionalInsights = [
    {
      title: "SEP-IRA vs Solo 401(k)",
      icon: PiggyBank,
      points: [
        `SEP-IRA: Maximum ${formatCurrency(calculations.maxSepIra)}/year (25% of net income)`,
        `Solo 401(k): Maximum ${formatCurrency(calculations.maxSolo401k)}/year (employee + employer contributions)`,
        `Solo 401(k) allows loans against your balance; SEP-IRA does not`,
        `Both provide significant tax deductions to reduce your business taxes`,
      ],
    },
    {
      title: "Retirement Savings Strategy",
      icon: TrendingUp,
      points: [
        `Your retirement savings will grow to ${formatCurrency(calculations.futureRetirementSavings)} by age ${retirementAge}`,
        `This provides ${formatCurrency(calculations.futureRetirementSavings / retirementYears)}/year for ${retirementYears} years`,
        `Current contribution: ${formatCurrency(calculations.actualContribution)}/year`,
        `Consider maximizing contributions in high-income years to accelerate retirement savings`,
      ],
    },
    {
      title: "Tax Optimization",
      icon: DollarSign,
      points: [
        `Annual tax savings from retirement contributions: ${formatCurrency(calculations.taxSavingsPerYear)}`,
        `Total tax savings over ${calculations.yearsToRetirement} years: ${formatCurrency(calculations.totalTaxSavings)}`,
        `Reinvest tax savings into your retirement plan for faster growth`,
        `Work with a CPA to coordinate retirement contributions with other business deductions`,
      ],
    },
    {
      title: "Retirement Income Planning",
      icon: Sparkles,
      points: [
        `Income needed in retirement: ${formatCurrency(calculations.retirementIncomeNeeded)}/year`,
        `Your plan provides: ${formatCurrency(calculations.futureRetirementSavings / retirementYears)}/year`,
        calculations.fundingGap > 0
          ? `Funding gap: ${formatCurrency(calculations.fundingGap)} - Consider working longer or increasing contributions`
          : `✓ Your retirement is fully funded!`,
        `Schedule a consultation to discuss your complete retirement strategy`,
      ],
    },
  ];

  return (
    <PremiumCalculatorBase
      title="Salon Owner Retirement Planner"
      description="Plan your retirement with SEP-IRA or Solo 401(k) strategies"
      steps={steps}
      results={results}
      projectionData={calculations.projectionData}
      professionalInsights={professionalInsights}
      chartTitle="Retirement Savings Growth Projection"
      yAxisLabel="Savings Balance"
    />
  );
}
