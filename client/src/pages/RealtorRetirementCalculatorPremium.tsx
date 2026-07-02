/**
 * Realtor Retirement & Income Protection Calculator
 * Features: Collapsible inputs, retirement savings projection, income gap analysis, life insurance recommendation
 */

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, TrendingUp, Heart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

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

export default function RealtorRetirementCalculatorPremium() {
  // ═══════════════════════════════════════
  // STATE: All 9 Realtor Inputs
  // ═══════════════════════════════════════
  const [currentAge, setCurrentAge] = useState(35);
  const [retirementAge, setRetirementAge] = useState(62);
  const [planUntilAge, setPlanUntilAge] = useState(85);
  const [avgAnnualCommission, setAvgAnnualCommission] = useState(95000);
  const [monthlyPersonalExpenses, setMonthlyPersonalExpenses] = useState(5000);
  const [currentRetirementSavings, setCurrentRetirementSavings] = useState(50000);
  const [annualSavingsRate, setAnnualSavingsRate] = useState(15);
  const [expectedAnnualReturn, setExpectedAnnualReturn] = useState(6);
  const [socialSecurityEstimate, setSocialSecurityEstimate] = useState(1200);
  const [inputsOpen, setInputsOpen] = useState(true);
  const [incomeView, setIncomeView] = useState<"monthly" | "yearly">("yearly");

  // ═══════════════════════════════════════
  // CALCULATIONS
  // ═══════════════════════════════════════
  const calculations = useMemo(() => {
    const yearsUntilRetirement = retirementAge - currentAge;
    const yearsInRetirement = planUntilAge - retirementAge;
    const annualContribution = avgAnnualCommission * (annualSavingsRate / 100);
    const monthlyReturn = expectedAnnualReturn / 100 / 12;

    // Future Value of current savings
    const fvCurrentSavings =
      currentRetirementSavings * Math.pow(1 + expectedAnnualReturn / 100, yearsUntilRetirement);

    // Future Value of annual contributions (growing annuity)
    const fvContributions =
      annualContribution *
      (Math.pow(1 + expectedAnnualReturn / 100, yearsUntilRetirement) - 1) /
      (expectedAnnualReturn / 100);

    const nestEggAtRetirement = fvCurrentSavings + fvContributions;

    // Monthly income from 4% rule
    const monthlyIncomeFromSavings = (nestEggAtRetirement * 0.04) / 12;

    // Total monthly retirement income
    const totalMonthlyIncome = monthlyIncomeFromSavings + socialSecurityEstimate;

    // Monthly income gap
    const monthlyIncomeGap = monthlyPersonalExpenses - totalMonthlyIncome;

    // Annuity recommendation (if gap exists)
    const annuityLumpSumNeeded = monthlyIncomeGap > 0 ? (monthlyIncomeGap * 12) / 0.05 : 0;

    // Life insurance recommendation
    const lifeInsuranceRecommendation =
      avgAnnualCommission * yearsUntilRetirement * 0.7 + 50000;

    // ═══════════════════════════════════════
    // PROJECTION DATA (for chart)
    // ═══════════════════════════════════════
    const projectionData = [];

    // Growth phase: current age to retirement
    for (let age = currentAge; age <= retirementAge; age += 1) {
      const yearsFromNow = age - currentAge;
      const savings =
        currentRetirementSavings * Math.pow(1 + expectedAnnualReturn / 100, yearsFromNow) +
        annualContribution *
          (Math.pow(1 + expectedAnnualReturn / 100, yearsFromNow) - 1) /
          (expectedAnnualReturn / 100);

      const isFirst = age === currentAge;
      const isPeak = age === retirementAge;

      projectionData.push({
        age,
        savings: Math.round(savings),
        phase: "growth",
        isFirst,
        isPeak,
        isLast: false,
      });
    }

    // Drawdown phase: retirement to plan until age
    for (let age = retirementAge + 1; age <= planUntilAge; age += 1) {
      const yearsInRetirementSoFar = age - retirementAge;
      const monthlyDrawdown = monthlyPersonalExpenses;
      const annualDrawdown = monthlyDrawdown * 12;

      // Simplified: subtract annual drawdown, apply returns
      let savings = nestEggAtRetirement;
      for (let year = 0; year < yearsInRetirementSoFar; year++) {
        savings = savings * (1 + expectedAnnualReturn / 100) - annualDrawdown;
        if (savings < 0) savings = 0;
      }

      const isLast = age === planUntilAge;

      projectionData.push({
        age,
        savings: Math.round(Math.max(0, savings)),
        phase: "drawdown",
        isFirst: false,
        isPeak: false,
        isLast,
      });
    }

    return {
      yearsUntilRetirement,
      yearsInRetirement,
      annualContribution,
      fvCurrentSavings,
      fvContributions,
      nestEggAtRetirement,
      monthlyIncomeFromSavings,
      totalMonthlyIncome,
      monthlyIncomeGap,
      annuityLumpSumNeeded,
      lifeInsuranceRecommendation,
      projectionData,
    };
  }, [
    currentAge,
    retirementAge,
    planUntilAge,
    avgAnnualCommission,
    monthlyPersonalExpenses,
    currentRetirementSavings,
    annualSavingsRate,
    expectedAnnualReturn,
    socialSecurityEstimate,
  ]);

  return (
    <div className="space-y-8">
      {/* SUMMARY SENTENCE */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-sm text-gray-700">
          At age <span className="font-semibold">{retirementAge}</span>, saving{" "}
          <span className="font-semibold">{annualSavingsRate}%</span> of{" "}
          <span className="font-semibold">{formatCurrency(avgAnnualCommission)}</span>/year, you're
          on track to retire with an estimated{" "}
          <span className="font-bold text-blue-600">
            {formatCurrency(calculations.nestEggAtRetirement)}
          </span>{" "}
          saved.
        </p>
      </div>

      {/* COLLAPSIBLE INPUTS PANEL */}
      <div className="border-2 border-amber-300 rounded-lg overflow-hidden bg-white">
        <button
          onClick={() => setInputsOpen(!inputsOpen)}
          className="w-full p-4 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-colors flex items-center justify-between font-bold text-gray-900"
        >
          <span>Realtor Income & Retirement Inputs</span>
          <ChevronDown
            className={`h-5 w-5 transition-transform ${inputsOpen ? "rotate-180" : ""}`}
          />
        </button>

        {inputsOpen && (
          <div className="p-6 space-y-6">
            {/* Grid: 2 columns on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Age */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">Current Age *</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min="20"
                    max="70"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(Math.max(20, Math.min(70, Number(e.target.value))))}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="range"
                    min="20"
                    max="70"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(Number(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Retirement Age */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">Retirement Age *</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min="50"
                    max="80"
                    value={retirementAge}
                    onChange={(e) => setRetirementAge(Math.max(50, Math.min(80, Number(e.target.value))))}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="range"
                    min="50"
                    max="80"
                    value={retirementAge}
                    onChange={(e) => setRetirementAge(Number(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Plan Until Age */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">Plan Until Age *</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min="70"
                    max="100"
                    value={planUntilAge}
                    onChange={(e) => setPlanUntilAge(Math.max(70, Math.min(100, Number(e.target.value))))}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="range"
                    min="70"
                    max="100"
                    value={planUntilAge}
                    onChange={(e) => setPlanUntilAge(Number(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Avg Annual Commission */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">
                  Avg Annual Commission (Last 3 Years) *
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min="30000"
                    max="500000"
                    step="5000"
                    value={avgAnnualCommission}
                    onChange={(e) =>
                      setAvgAnnualCommission(Math.max(30000, Math.min(500000, Number(e.target.value))))
                    }
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="range"
                    min="30000"
                    max="500000"
                    step="5000"
                    value={avgAnnualCommission}
                    onChange={(e) => setAvgAnnualCommission(Number(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Monthly Personal Expenses */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">
                  Monthly Personal Expenses *
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min="1000"
                    max="20000"
                    step="500"
                    value={monthlyPersonalExpenses}
                    onChange={(e) =>
                      setMonthlyPersonalExpenses(Math.max(1000, Math.min(20000, Number(e.target.value))))
                    }
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="range"
                    min="1000"
                    max="20000"
                    step="500"
                    value={monthlyPersonalExpenses}
                    onChange={(e) => setMonthlyPersonalExpenses(Number(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Current Retirement Savings */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">
                  Current Retirement Savings *
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min="0"
                    max="2000000"
                    step="10000"
                    value={currentRetirementSavings}
                    onChange={(e) =>
                      setCurrentRetirementSavings(Math.max(0, Math.min(2000000, Number(e.target.value))))
                    }
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="range"
                    min="0"
                    max="2000000"
                    step="10000"
                    value={currentRetirementSavings}
                    onChange={(e) => setCurrentRetirementSavings(Number(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Annual Savings Rate */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">
                  Annual Savings Rate from Commissions (%) *
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min="0"
                    max="40"
                    step="1"
                    value={annualSavingsRate}
                    onChange={(e) =>
                      setAnnualSavingsRate(Math.max(0, Math.min(40, Number(e.target.value))))
                    }
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={annualSavingsRate}
                    onChange={(e) => setAnnualSavingsRate(Number(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Expected Annual Return */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Expected Annual Return
                </label>
                <div className="flex gap-2">
                  {[4, 6, 8, 10].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setExpectedAnnualReturn(rate)}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                        expectedAnnualReturn === rate
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Select your expected average annual return
                </p>
              </div>

              {/* Social Security Estimate */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">
                  Social Security Estimate at {retirementAge} (Monthly) *
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min="0"
                    max="3000"
                    step="100"
                    value={socialSecurityEstimate}
                    onChange={(e) =>
                      setSocialSecurityEstimate(Math.max(0, Math.min(3000, Number(e.target.value))))
                    }
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="range"
                    min="0"
                    max="3000"
                    step="100"
                    value={socialSecurityEstimate}
                    onChange={(e) => setSocialSecurityEstimate(Number(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* OUTPUT CARDS - 2x2 GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Projected Nest Egg */}
        <Card className="p-6 border-2 border-blue-300 bg-blue-50">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
              Estimated Retirement Savings
            </p>
            <p className="text-4xl font-black text-blue-900">
              {formatCurrency(calculations.nestEggAtRetirement)}
            </p>
            <p className="text-xs text-blue-600">
              At age {retirementAge} with {calculations.yearsUntilRetirement} years of contributions
            </p>
          </div>
        </Card>

        {/* Card 2: Monthly Income from Savings */}
        <Card className="p-6 border-2 border-green-300 bg-green-50">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">
              Monthly Income from Savings (4% Rule)
            </p>
            <p className="text-4xl font-black text-green-900">
              {formatCurrencyDetailed(calculations.monthlyIncomeFromSavings)}
            </p>
            <p className="text-xs text-green-600">
              Based on {formatCurrency(calculations.nestEggAtRetirement)} nest egg
            </p>
          </div>
        </Card>

        {/* Card 3: Monthly Income Gap */}
        <Card
          className={`p-6 border-2 ${
            calculations.monthlyIncomeGap > 0
              ? "border-red-300 bg-red-50"
              : "border-emerald-300 bg-emerald-50"
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {calculations.monthlyIncomeGap > 0 ? (
                <>
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-sm font-semibold text-red-700 uppercase tracking-wide">
                    Monthly Income Gap
                  </p>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">
                    You're on Track!
                  </p>
                </>
              )}
            </div>
            <p
              className={`text-4xl font-black ${
                calculations.monthlyIncomeGap > 0 ? "text-red-900" : "text-emerald-900"
              }`}
            >
              {calculations.monthlyIncomeGap > 0 ? "+" : ""}
              {formatCurrencyDetailed(Math.abs(calculations.monthlyIncomeGap))}
            </p>
            <p className={`text-xs ${calculations.monthlyIncomeGap > 0 ? "text-red-600" : "text-emerald-600"}`}>
              Expenses: {formatCurrencyDetailed(monthlyPersonalExpenses)} | Income:{" "}
              {formatCurrencyDetailed(calculations.totalMonthlyIncome)}
            </p>
          </div>
        </Card>

        {/* Card 4: Recommended Life Insurance */}
        <Card className="p-6 border-2 border-amber-300 bg-amber-50">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-amber-700 uppercase tracking-wide">
              Suggested Life Insurance Coverage
            </p>
            <p className="text-4xl font-black text-amber-900">
              {formatCurrency(calculations.lifeInsuranceRecommendation)}
            </p>
            <p className="text-xs text-amber-600">
              Based on {calculations.yearsUntilRetirement} years of income replacement
            </p>
          </div>
        </Card>
      </div>

      {/* CHART: Savings Growth & Drawdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Projected Savings Growth & Retirement Drawdown</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={incomeView === "yearly" ? "default" : "outline"}
              onClick={() => setIncomeView("yearly")}
            >
              YEARLY
            </Button>
            <Button
              size="sm"
              variant={incomeView === "monthly" ? "default" : "outline"}
              onClick={() => setIncomeView("monthly")}
            >
              MONTHLY
            </Button>
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
            <Bar dataKey="savings" radius={[8, 8, 0, 0]}>
              {calculations.projectionData.map((entry, index) => {
                let color = "#3b82f6"; // Default blue
                if (entry.isFirst) {
                  color = "#3b82f6"; // Blue for first
                } else if (entry.isPeak) {
                  color = "#10b981"; // Green for peak (retirement)
                } else if (entry.isLast) {
                  color = "#f97316"; // Orange for last
                }
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ANNUITY RECOMMENDATION (if gap exists) */}
      {calculations.monthlyIncomeGap > 0 && (
        <Card className="p-6 border-2 border-purple-300 bg-purple-50">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Supplemental Annuity Planning</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Your estimated monthly income gap is{" "}
                  <span className="font-bold text-purple-600">
                    {formatCurrencyDetailed(calculations.monthlyIncomeGap)}
                  </span>
                  . A lump-sum annuity of approximately{" "}
                  <span className="font-bold text-purple-600">
                    {formatCurrency(calculations.annuityLumpSumNeeded)}
                  </span>{" "}
                  could generate{" "}
                  <span className="font-bold text-purple-600">
                    {formatCurrencyDetailed(calculations.monthlyIncomeGap)}
                  </span>
                  /month for life.
                </p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold">
                  Explore Annuity Options
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* LIFE INSURANCE RECOMMENDATION */}
      <Card className="p-6 border-2 border-rose-300 bg-rose-50">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Heart className="h-6 w-6 text-rose-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Life Insurance Recommendation</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Based on your commission income of{" "}
                <span className="font-bold text-rose-600">
                  {formatCurrency(avgAnnualCommission)}
                </span>
                /year, we recommend{" "}
                <span className="font-bold text-rose-600">
                  {formatCurrency(calculations.lifeInsuranceRecommendation)}
                </span>{" "}
                in coverage. Your family would need this to maintain their lifestyle for{" "}
                <span className="font-bold text-rose-600">{calculations.yearsUntilRetirement} years</span>.
              </p>
              <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold">
                Get a Free Life Insurance Quote
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* DISCLAIMER */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
        <p className="text-xs text-gray-700">
          <span className="font-bold text-yellow-700">Disclaimer:</span> This calculator is a simplified
          planning tool, not an official retirement estimate. Results are projections based on your inputs
          and assumptions about returns, inflation, and expenses. Actual results may vary. Consult a
          licensed financial advisor for personalized retirement planning advice.
        </p>
      </div>
    </div>
  );
}
