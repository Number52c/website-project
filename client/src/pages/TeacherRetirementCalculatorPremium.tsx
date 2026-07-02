/*
 * TeacherRetirementCalculatorPremium.tsx
 * Comprehensive TRS retirement calculator with life insurance & annuity planning
 * Features: Single-page collapsible inputs, detailed benefit cards, income projections with COLA
 */

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, Heart, TrendingUp, DollarSign, CircleAlert as AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
};

const formatCurrencyDetailed = (value: number): string => {
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
};

// Custom bar component for colored bars and labels
const CustomBar = (props: any) => {
  const { x, y, width, height, payload, incomeView } = props;
  const dataKey = incomeView === "monthly" ? "monthly" : "annual";
  const value = payload[dataKey];
  const isFirst = payload.isFirst;
  const isLast = payload.isLast;
  const barIndex = payload.age - payload.age; // Placeholder for actual index
  
  // Determine bar color
  let barColor = "#3b82f6"; // Default blue
  if (isFirst) {
    barColor = "#3b82f6"; // Blue for first
  } else if (isLast) {
    barColor = "#f97316"; // Orange for last
  }

  // Show label on first, every 5th, and last bar
  const shouldShowLabel = isFirst || isLast || (payload.age - payload.age) % 10 === 0;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={barColor}
        rx={8}
        ry={8}
      />
      {shouldShowLabel && (
        <text
          x={x + width / 2}
          y={y - 5}
          textAnchor="middle"
          fontSize="12"
          fontWeight="600"
          fill="#1f2937"
        >
          {formatCurrency(value)}
        </text>
      )}
    </g>
  );
};

export default function TeacherRetirementCalculatorPremium() {
  // ═══════════════════════════════════════
  // STATE: All 11 TRS Inputs
  // ═══════════════════════════════════════
  const [currentAge, setCurrentAge] = useState(38);
  const [plannedRetirementAge, setPlannedRetirementAge] = useState(65);
  const [currentServiceCredit, setCurrentServiceCredit] = useState(20.8);
  const [currentAnnualSalary, setCurrentAnnualSalary] = useState(60000);
  const [expectedAnnualRaise, setExpectedAnnualRaise] = useState(3);
  const [averageSalaryPeriod, setAverageSalaryPeriod] = useState("5-highest");
  const [survivorOption, setSurvivorOption] = useState("single-life");
  const [partialLumpSumMonths, setPartialLumpSumMonths] = useState(0);
  const [earlyRetirementReduction, setEarlyRetirementReduction] = useState(5);
  const [colaAssumption, setColaAssumption] = useState(2);
  const [planUntilAge, setPlanUntilAge] = useState(95);
  const [inputsOpen, setInputsOpen] = useState(true);
  const [incomeView, setIncomeView] = useState<"monthly" | "yearly">("yearly");

  // ═══════════════════════════════════════
  // CALCULATIONS
  // ═══════════════════════════════════════
  const calculations = useMemo(() => {
    const yearsUntilRetirement = plannedRetirementAge - currentAge;
    const yearsAtRetirement = currentServiceCredit + yearsUntilRetirement;

    // Salary growth to retirement
    const finalSalary = currentAnnualSalary * Math.pow(1 + expectedAnnualRaise / 100, yearsUntilRetirement);
    
    // Average salary based on selected period
    // For simplicity: 5-year uses finalSalary, 3-year uses slightly higher (accounts for recent higher salary)
    const averageSalaryForBenefit = averageSalaryPeriod === "3-highest" 
      ? finalSalary * 1.02  // 2% bump for 3-year (more recent, higher)
      : finalSalary;       // 5-year uses finalSalary as-is

    // TRS multiplier: 2.3% per year of service
    const trsMultiplier = 0.023;

    // Base monthly benefit (before any reductions)
    const baseMonthlyBenefit = (yearsAtRetirement * trsMultiplier * averageSalaryForBenefit) / 12;

    // Early retirement reduction (if retiring before 65)
    let monthlyBenefit = baseMonthlyBenefit;
    if (plannedRetirementAge < 65) {
      const yearsEarly = 65 - plannedRetirementAge;
      const reductionFactor = 1 - (yearsEarly * earlyRetirementReduction) / 100;
      monthlyBenefit = baseMonthlyBenefit * Math.max(0.5, reductionFactor); // Min 50% of benefit
    }

    // PLSO (Partial Lump Sum Option) reduction
    // Simplified: reduce monthly by portion of lump sum taken
    const plsoReduction = (partialLumpSumMonths * monthlyBenefit) / (yearsAtRetirement * 12);
    monthlyBenefit = Math.max(0, monthlyBenefit - plsoReduction);

    // Adjust for survivor option
    let adjustedMonthlyBenefit = monthlyBenefit;
    if (survivorOption === "50-survivor") {
      adjustedMonthlyBenefit = monthlyBenefit * 0.95; // Slight reduction for survivor option
    } else if (survivorOption === "100-survivor") {
      adjustedMonthlyBenefit = monthlyBenefit * 0.90; // Greater reduction for 100% survivor
    }

    // Eligibility status
    const eligibilityStatus = `Normal age ${plannedRetirementAge}. Survivor option: ${
      survivorOption === "single-life"
        ? "Single life"
        : survivorOption === "50-survivor"
          ? "50% survivor"
          : "100% survivor"
    }. PLSO: ${partialLumpSumMonths} months.`;

    // ═══════════════════════════════════════
    // LIFE INSURANCE RECOMMENDATION
    // ═══════════════════════════════════════
    const incomeReplacementNeed = adjustedMonthlyBenefit * 12 * 20; // 20-year income replacement
    const finalExpenseBuffer = 25000;
    let survivorBenefitGap = 0;
    if (survivorOption === "single-life") {
      survivorBenefitGap = adjustedMonthlyBenefit * 12 * 15; // Full benefit × 15 years
    } else if (survivorOption === "50-survivor") {
      survivorBenefitGap = (adjustedMonthlyBenefit * 0.5) * 12 * 15; // 50% × 15 years
    }
    // 100% survivor = $0 gap

    const totalRecommendedLifeInsurance =
      incomeReplacementNeed + finalExpenseBuffer + survivorBenefitGap;

    // ═══════════════════════════════════════
    // ANNUITY RECOMMENDATION
    // ═══════════════════════════════════════
    const estimatedRetirementExpenses = (finalSalary * 0.8) / 12; // 80% of salary, monthly
    const monthlyIncomeGap = Math.max(0, estimatedRetirementExpenses - adjustedMonthlyBenefit);
    const annuityLumpSumNeeded = monthlyIncomeGap * 12 * 25; // 25x rule
    const projectedMonthlyAnnuityPayout = (annuityLumpSumNeeded * 0.05) / 12; // 5% withdrawal rate

    // ═══════════════════════════════════════
    // PROJECTED INCOME CHART DATA
    // ═══════════════════════════════════════
    const projectionData = [];
    for (let age = plannedRetirementAge; age <= planUntilAge; age += 2) {
      const yearsInRetirement = age - plannedRetirementAge;
      const colaAdjustedBenefit = adjustedMonthlyBenefit * Math.pow(1 + colaAssumption / 100, yearsInRetirement);
      const annualIncome = colaAdjustedBenefit * 12;
      const isFirst = age === plannedRetirementAge;
      const isLast = age === planUntilAge;

      projectionData.push({
        age,
        annual: Math.round(annualIncome),
        monthly: Math.round(colaAdjustedBenefit),
        isFirst,
        isLast,
      });
    }

    return {
      yearsUntilRetirement,
      yearsAtRetirement,
      finalSalary,
      averageSalaryForBenefit,
      baseMonthlyBenefit,
      monthlyBenefit: adjustedMonthlyBenefit,
      eligibilityStatus,
      incomeReplacementNeed,
      finalExpenseBuffer,
      survivorBenefitGap,
      totalRecommendedLifeInsurance,
      estimatedRetirementExpenses,
      monthlyIncomeGap,
      annuityLumpSumNeeded,
      projectedMonthlyAnnuityPayout,
      projectionData,
    };
  }, [
    currentAge,
    plannedRetirementAge,
    currentServiceCredit,
    currentAnnualSalary,
    expectedAnnualRaise,
    survivorOption,
    partialLumpSumMonths,
    earlyRetirementReduction,
    colaAssumption,
    planUntilAge,
  ]);

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════
  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8 bg-white">
      {/* SUMMARY SENTENCE */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
            <p className="text-sm text-gray-700">
          <span className="font-semibold">At age {plannedRetirementAge}</span>, with
          <span className="font-semibold">{calculations.yearsAtRetirement.toFixed(1)} years</span> of service and an
          estimated final average salary of{" "}
          <span className="font-semibold">{formatCurrency(calculations.averageSalaryForBenefit)}</span>, your projected monthly TRS
          benefit is <span className="font-bold text-blue-600">{formatCurrency(calculations.monthlyBenefit)}</span>.
        </p>
      </div>

      {/* SECTION 1: COLLAPSIBLE INPUTS PANEL */}
      <Card className="border-2 border-gray-200 overflow-hidden">
        <button
          onClick={() => setInputsOpen(!inputsOpen)}
          className="w-full flex items-center justify-between p-6 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <h2 className="text-xl font-bold text-gray-900">TRS Retirement Inputs</h2>
          <ChevronDown
            size={24}
            className={`text-gray-600 transition-transform ${inputsOpen ? "rotate-180" : ""}`}
          />
        </button>

        {inputsOpen && (
          <div className="p-6 space-y-6 bg-white">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Current Age</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(Math.max(20, Math.min(80, Number(e.target.value))))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="range"
                    min="20"
                    max="80"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(Number(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Planned Retirement Age</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={plannedRetirementAge}
                    onChange={(e) => setPlannedRetirementAge(Math.max(55, Math.min(80, Number(e.target.value))))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="range"
                    min="55"
                    max="80"
                    value={plannedRetirementAge}
                    onChange={(e) => setPlannedRetirementAge(Number(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Current TRS Service Credit (years)
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={currentServiceCredit}
                    onChange={(e) => setCurrentServiceCredit(Math.max(0, Math.min(45, Number(e.target.value))))}
                    step="0.1"
                    className="w-20 px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="range"
                    min="0"
                    max="45"
                    step="0.5"
                    value={currentServiceCredit}
                    onChange={(e) => setCurrentServiceCredit(Number(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Current Annual Salary</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={currentAnnualSalary}
                    onChange={(e) => setCurrentAnnualSalary(Math.max(30000, Math.min(200000, Number(e.target.value))))}
                    className="w-24 px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="range"
                    min="30000"
                    max="200000"
                    step="5000"
                    value={currentAnnualSalary}
                    onChange={(e) => setCurrentAnnualSalary(Number(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Expected Annual Raise (%)</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={expectedAnnualRaise}
                    onChange={(e) => setExpectedAnnualRaise(Math.max(0, Math.min(8, Number(e.target.value))))}
                    step="0.1"
                    className="w-20 px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="0.1"
                    value={expectedAnnualRaise}
                    onChange={(e) => setExpectedAnnualRaise(Number(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Average Salary Period</label>
                <select
                  value={averageSalaryPeriod}
                  onChange={(e) => setAverageSalaryPeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="5-highest">Most members (5 highest years)</option>
                  <option value="3-highest">Pre-2014 members (3 highest years)</option>
                </select>
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Survivor Option</label>
                <select
                  value={survivorOption}
                  onChange={(e) => setSurvivorOption(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="single-life">Single life</option>
                  <option value="50-survivor">50% survivor</option>
                  <option value="100-survivor">100% survivor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Partial Lump Sum Option (months)
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={partialLumpSumMonths}
                    onChange={(e) => setPartialLumpSumMonths(Math.max(0, Math.min(36, Number(e.target.value))))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="range"
                    min="0"
                    max="36"
                    value={partialLumpSumMonths}
                    onChange={(e) => setPartialLumpSumMonths(Number(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Row 5 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Early Retirement Reduction / Year (%)
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={earlyRetirementReduction}
                    onChange={(e) => setEarlyRetirementReduction(Math.max(0, Math.min(10, Number(e.target.value))))}
                    step="0.1"
                    className="w-20 px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={earlyRetirementReduction}
                    onChange={(e) => setEarlyRetirementReduction(Number(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Annual COLA / Inflation Assumption (%)
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={colaAssumption}
                    onChange={(e) => setColaAssumption(Math.max(0, Math.min(6, Number(e.target.value))))}
                    step="0.1"
                    className="w-20 px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="range"
                    min="0"
                    max="6"
                    step="0.1"
                    value={colaAssumption}
                    onChange={(e) => setColaAssumption(Number(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Row 6 */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Plan Until Age</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={planUntilAge}
                  onChange={(e) => setPlanUntilAge(Math.max(80, Math.min(120, Number(e.target.value))))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <input
                  type="range"
                  min="80"
                  max="120"
                  value={planUntilAge}
                  onChange={(e) => setPlanUntilAge(Number(e.target.value))}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* SECTION 2: TRS BENEFIT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Base Monthly Annuity */}
        <Card className="border-2 border-gray-200 p-6 bg-white">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Base Monthly Annuity</h3>
          <div className="space-y-2">
            <div className="text-4xl font-black text-gray-900">
              {formatCurrency(calculations.baseMonthlyBenefit)}
            </div>
            <div className="text-lg text-blue-600 font-semibold">
              {formatCurrency(calculations.baseMonthlyBenefit * 12)}/annually
            </div>
            <p className="text-xs text-gray-600 mt-4">
              Based on your projected retirement age, service credit, and {averageSalaryPeriod} average salary period.
            </p>
          </div>
        </Card>

        {/* Card 2: Estimated Monthly Benefit */}
        <Card className="border-2 border-gray-200 p-6 bg-white">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
            Estimated Monthly Benefit
          </h3>
          <div className="space-y-2">
            <div className="text-4xl font-black text-gray-900">{formatCurrency(calculations.monthlyBenefit)}</div>
            <div className="text-xs text-gray-600 mt-4 space-y-1">
              <p>{calculations.eligibilityStatus}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* SECTION 3: PROJECTED INCOME CHART */}
      <Card className="border-2 border-gray-200 p-6 bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Projected TRS Income After Retirement</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setIncomeView("monthly")}
              className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
                incomeView === "monthly"
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              MONTHLY
            </button>
            <button
              onClick={() => setIncomeView("yearly")}
              className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
                incomeView === "yearly"
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              YEARLY
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={calculations.projectionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="age" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) => `Age ${label}`}
            />
            <Bar
              dataKey={incomeView === "monthly" ? "monthly" : "annual"}
              radius={[8, 8, 0, 0]}
              shape={<CustomBar incomeView={incomeView} />}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* SECTION 4: LIFE INSURANCE RECOMMENDATION */}
      <Card className="border-2 border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-4">
          <Heart className="text-red-600 flex-shrink-0 mt-1" size={24} />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Life Insurance Planning</h3>
            <div className="space-y-3 text-sm text-gray-700 mb-6">
              <div className="flex justify-between">
                <span>20-Year Income Replacement:</span>
                <span className="font-semibold">{formatCurrencyDetailed(calculations.incomeReplacementNeed)}</span>
              </div>
              <div className="flex justify-between">
                <span>Final Expense Buffer:</span>
                <span className="font-semibold">{formatCurrencyDetailed(calculations.finalExpenseBuffer)}</span>
              </div>
              <div className="flex justify-between">
                <span>Survivor Benefit Gap:</span>
                <span className="font-semibold">{formatCurrencyDetailed(calculations.survivorBenefitGap)}</span>
              </div>
              <div className="border-t border-red-300 pt-3 flex justify-between font-bold text-base">
                <span>Recommended Life Insurance:</span>
                <span className="text-red-600">{formatCurrency(calculations.totalRecommendedLifeInsurance)}</span>
              </div>
            </div>
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white">Get a Free Life Insurance Quote</Button>
          </div>
        </div>
      </Card>

      {/* SECTION 5: SUPPLEMENTAL ANNUITY PLANNING */}
      <Card className="border-2 border-green-200 bg-green-50 p-6">
        <div className="flex items-start gap-4">
          <TrendingUp className="text-green-600 flex-shrink-0 mt-1" size={24} />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Supplemental Annuity Planning</h3>
            <div className="space-y-3 text-sm text-gray-700 mb-6">
              <div className="flex justify-between">
                <span>Estimated Monthly Retirement Expenses (80% rule):</span>
                <span className="font-semibold">{formatCurrencyDetailed(calculations.estimatedRetirementExpenses)}</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Income Gap:</span>
                <span className="font-semibold">
                  {calculations.monthlyIncomeGap > 0
                    ? formatCurrencyDetailed(calculations.monthlyIncomeGap)
                    : "✓ $0 (TRS covers expenses)"}
                </span>
              </div>
              {calculations.monthlyIncomeGap > 0 && (
                <>
                  <div className="flex justify-between">
                    <span>Suggested Annuity Lump Sum (25x rule):</span>
                    <span className="font-semibold">{formatCurrency(calculations.annuityLumpSumNeeded)}</span>
                  </div>
                  <div className="border-t border-green-300 pt-3 flex justify-between font-bold text-base">
                    <span>Projected Monthly Annuity Payout (5% withdrawal):</span>
                    <span className="text-green-600">
                      {formatCurrencyDetailed(calculations.projectedMonthlyAnnuityPayout)}
                    </span>
                  </div>
                </>
              )}
              {calculations.monthlyIncomeGap === 0 && (
                <p className="text-green-700 font-semibold mt-4">
                  Your TRS benefit fully covers your estimated retirement expenses. An annuity could still provide
                  additional security or legacy planning.
                </p>
              )}
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">Explore Annuity Options</Button>
          </div>
        </div>
      </Card>

      {/* SECTION 6: DISCLAIMER */}
      <Card className="border-2 border-yellow-200 bg-yellow-50 p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
          <div className="text-xs text-gray-700 leading-relaxed">
            <p className="font-semibold mb-2">Disclaimer</p>
            <p>
              This calculator is a simplified planning tool, not an official TRS estimate. Results are projections based
              on your inputs. Actual TRS benefits depend on tier, salary history, service credit, and official plan
              provisions. Consult a licensed financial advisor for personalized advice.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
