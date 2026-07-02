/**
 * BarberSavingsCalculatorPremium.tsx
 * Premium version with SEP-IRA and IUL integration
 */

import { useState, useMemo } from "react";
import { PremiumCalculatorBase, CalculatorStep, CalculatorResult } from "@/components/PremiumCalculatorBase";
import { Scissors, TrendingUp, DollarSign, PiggyBank, Sparkles, Heart, CircleCheck as CheckCircle2, CircleAlert as AlertCircle } from "lucide-react";

const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
};

export function BarberSavingsCalculatorPremium() {
  // State for all inputs
  const [age, setAge] = useState(35);
  const [retirementAge, setRetirementAge] = useState(65);
  const [annualIncome, setAnnualIncome] = useState(80000);
  const [currentSavings, setCurrentSavings] = useState(50000);
  const [sepIraContribution, setSepIraContribution] = useState(15000);
  const [iulBalance, setIulBalance] = useState(0);
  const [iulAnnualContribution, setIulAnnualContribution] = useState(5000);
  const [inflationRate, setInflationRate] = useState(3);
  const [investmentReturn, setInvestmentReturn] = useState(7);
  const [iulReturn, setIulReturn] = useState(5);
  const [retirementYears, setRetirementYears] = useState(25);

  // Calculate all retirement metrics
  const calculations = useMemo(() => {
    const yearsToRetirement = retirementAge - age;

    // SEP-IRA Calculation (25% of net self-employment income, max $69,000 in 2024)
    const maxSepIra = Math.min(annualIncome * 0.25, 69000);
    const actualSepIra = Math.min(sepIraContribution, maxSepIra);

    // SEP-IRA projection
    let futureSepIra = currentSavings;
    for (let i = 0; i < yearsToRetirement; i++) {
      futureSepIra = futureSepIra * (1 + investmentReturn / 100) + actualSepIra;
    }

    // IUL (Indexed Universal Life) projection
    // IUL typically offers 2-6% annual growth with downside protection
    let futureIul = iulBalance;
    for (let i = 0; i < yearsToRetirement; i++) {
      futureIul = futureIul * (1 + iulReturn / 100) + iulAnnualContribution;
    }

    // Total retirement savings
    const totalRetirementSavings = futureSepIra + futureIul;

    // Income needed in retirement (80% replacement)
    let retirementIncomeNeeded = annualIncome * 0.8;
    for (let i = 0; i < yearsToRetirement; i++) {
      retirementIncomeNeeded *= 1 + inflationRate / 100;
    }

    // Total needed for retirement
    const totalNeeded = retirementIncomeNeeded * retirementYears;

    // Funding gap
    const fundingGap = Math.max(0, totalNeeded - totalRetirementSavings);

    // Tax savings from SEP-IRA
    const taxSavingsPerYear = actualSepIra * 0.25; // Assuming 25% tax bracket
    const totalTaxSavings = taxSavingsPerYear * yearsToRetirement;

    // IUL Cash Value at retirement (conservative estimate)
    const iulCashValue = futureIul * 0.85; // 85% of projected value due to fees

    // Year-by-year projection
    let sepValue = currentSavings;
    let iulValue = iulBalance;
    const projectionData = [];
    for (let year = 0; year <= yearsToRetirement; year++) {
      projectionData.push({
        year: age + year,
        value: Math.round(sepValue + iulValue),
        sepIra: Math.round(sepValue),
        iul: Math.round(iulValue),
      });
      if (year < yearsToRetirement) {
        sepValue = sepValue * (1 + investmentReturn / 100) + actualSepIra;
        iulValue = iulValue * (1 + iulReturn / 100) + iulAnnualContribution;
      }
    }

    return {
      maxSepIra,
      actualSepIra,
      futureSepIra,
      futureIul,
      iulCashValue,
      totalRetirementSavings,
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
    sepIraContribution,
    iulBalance,
    iulAnnualContribution,
    inflationRate,
    investmentReturn,
    iulReturn,
    retirementYears,
  ]);

  // Define calculator steps
  const steps: CalculatorStep[] = [
    {
      id: 1,
      title: "Your Barbering Business",
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
          min: 30000,
          max: 200000,
          value: annualIncome,
          onChange: setAnnualIncome,
          unit: "dollars",
          step: 5000,
        },
      ],
    },
    {
      id: 2,
      title: "SEP-IRA Savings",
      description: "Tax-advantaged retirement savings for self-employed",
      fields: [
        {
          label: "Current SEP-IRA Balance",
          type: "slider",
          min: 0,
          max: 500000,
          value: currentSavings,
          onChange: setCurrentSavings,
          unit: "dollars",
          step: 10000,
        },
        {
          label: "Annual SEP-IRA Contribution",
          type: "slider",
          min: 0,
          max: 69000,
          value: sepIraContribution,
          onChange: setSepIraContribution,
          unit: "dollars",
          step: 1000,
        },
      ],
    },
    {
      id: 3,
      title: "IUL (Indexed Universal Life)",
      description: "Tax-free growth with downside protection",
      fields: [
        {
          label: "Current IUL Cash Value",
          type: "slider",
          min: 0,
          max: 300000,
          value: iulBalance,
          onChange: setIulBalance,
          unit: "dollars",
          step: 5000,
        },
        {
          label: "Annual IUL Contribution",
          type: "slider",
          min: 0,
          max: 25000,
          value: iulAnnualContribution,
          onChange: setIulAnnualContribution,
          unit: "dollars",
          step: 500,
        },
      ],
    },
    {
      id: 4,
      title: "Your Results",
      description: "See your complete retirement savings strategy",
      fields: [],
    },
  ];

  // Results to display
  const results: CalculatorResult[] = [
    {
      title: "SEP-IRA at Retirement",
      value: formatCurrency(calculations.futureSepIra),
      icon: PiggyBank,
      color: "bg-blue-600",
      description: `Max contribution: ${formatCurrency(calculations.maxSepIra)}/year`,
    },
    {
      title: "IUL Cash Value",
      value: formatCurrency(calculations.iulCashValue),
      icon: Heart,
      color: "bg-amber-600",
      description: `Tax-free growth with protection`,
    },
    {
      title: "Total Retirement Savings",
      value: formatCurrency(calculations.totalRetirementSavings),
      icon: TrendingUp,
      color: "bg-green-600",
      description: `SEP-IRA + IUL combined`,
    },
    {
      title: "Annual Tax Savings",
      value: formatCurrency(calculations.taxSavingsPerYear),
      icon: DollarSign,
      color: "bg-purple-600",
      description: `From SEP-IRA deductions`,
    },
  ];

  // Professional insights for results page
  const professionalInsights = [
    {
      title: "SEP-IRA Strategy",
      icon: PiggyBank,
      points: [
        `Maximum SEP-IRA contribution: ${formatCurrency(calculations.maxSepIra)}/year (25% of net income)`,
        `Your SEP-IRA will grow to ${formatCurrency(calculations.futureSepIra)} by age ${retirementAge}`,
        `Contribution is tax-deductible, reducing your business taxes by ${formatCurrency(calculations.taxSavingsPerYear)}/year`,
      ],
    },
    {
      title: "IUL (Indexed Universal Life) Benefits",
      icon: Heart,
      points: [
        `IUL cash value projected: ${formatCurrency(calculations.iulCashValue)} at retirement`,
        `Tax-free growth: withdrawals and loans are not subject to income tax`,
        `Downside protection: 0% floor means you don't lose money in market downturns`,
        `Dual purpose: retirement savings + life insurance protection for your family`,
      ],
    },
    {
      title: "Combined Retirement Plan",
      icon: TrendingUp,
      points: [
        `Total retirement savings: ${formatCurrency(calculations.totalRetirementSavings)}`,
        `This provides ${formatCurrency(calculations.totalRetirementSavings / retirementYears)}/year for ${retirementYears} years`,
        calculations.fundingGap > 0
          ? `Funding gap: ${formatCurrency(calculations.fundingGap)} - Consider increasing contributions or working longer`
          : `✓ Your retirement is fully funded!`,
      ],
    },
    {
      title: "Tax Optimization",
      icon: DollarSign,
      points: [
        `Annual tax savings from SEP-IRA: ${formatCurrency(calculations.taxSavingsPerYear)}`,
        `Total tax savings over ${calculations.yearsToRetirement} years: ${formatCurrency(calculations.totalTaxSavings)}`,
        `IUL provides tax-free growth and tax-free access to cash value`,
        `Consider working with a CPA to maximize business deductions alongside your retirement plan`,
      ],
    },
  ];

  return (
    <PremiumCalculatorBase
      title="Barber SEP-IRA & IUL Planner"
      description="Maximize your retirement savings with tax-advantaged strategies"
      steps={steps}
      results={results}
      projectionData={calculations.projectionData}
      professionalInsights={professionalInsights}
      chartTitle="SEP-IRA + IUL Growth Projection"
      yAxisLabel="Total Savings"
    />
  );
}

export default BarberSavingsCalculatorPremium;
