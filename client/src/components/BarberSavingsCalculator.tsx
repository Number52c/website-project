import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, TrendingUp, DollarSign, Zap, Target } from "lucide-react";

export function BarberSavingsCalculator({ onNotify }: { onNotify: (message: string) => void }) {
  // Format large numbers professionally
  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const [lowPrice, setLowPrice] = useState(40);
  const [highPrice, setHighPrice] = useState(60);
  const [haircutsPerMonth, setHaircutsPerMonth] = useState(5);
  const [yearsToRetirement, setYearsToRetirement] = useState(20);
  const [showResults, setShowResults] = useState(false);

  const avgPrice = (lowPrice + highPrice) / 2;
  const monthlySavings = haircutsPerMonth * avgPrice;
  const annualSavings = monthlySavings * 12;

  // Conservative 6% annual growth calculation
  const rate = 0.06;
  const months = yearsToRetirement * 12;
  const futureValue = monthlySavings * (((1 + rate / 12) ** months - 1) / (rate / 12));

  // Calculate attractive metrics
  const costPerDay = monthlySavings / 30;
  const growthAmount = futureValue - (monthlySavings * months);
  const growthPercentage = (growthAmount / (monthlySavings * months)) * 100;

  return (
    <div className="w-full space-y-6">
      {!showResults ? (
        <>
          {/* Input Section */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="low-price" className="text-base font-semibold text-gray-900">
                Low Haircut Price
              </Label>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-amber-600" />
                <Input
                  id="low-price"
                  type="number"
                  value={lowPrice}
                  onChange={(e) => setLowPrice(Number(e.target.value))}
                  className="border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="high-price" className="text-base font-semibold text-gray-900">
                High Haircut Price
              </Label>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-amber-600" />
                <Input
                  id="high-price"
                  type="number"
                  value={highPrice}
                  onChange={(e) => setHighPrice(Number(e.target.value))}
                  className="border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="haircuts" className="text-base font-semibold text-gray-900">
                Haircuts Per Month
              </Label>
              <Input
                id="haircuts"
                type="number"
                value={haircutsPerMonth}
                onChange={(e) => setHaircutsPerMonth(Number(e.target.value))}
                className="border-gray-300 focus:border-amber-500 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="years" className="text-base font-semibold text-gray-900">
                Years Until Retirement
              </Label>
              <Input
                id="years"
                type="number"
                value={yearsToRetirement}
                onChange={(e) => setYearsToRetirement(Number(e.target.value))}
                className="border-gray-300 focus:border-amber-500 focus:ring-amber-500"
              />
            </div>

            <Button
              onClick={() => setShowResults(true)}
              className="w-full bg-amber-500 py-6 text-lg font-bold text-white hover:bg-amber-600"
            >
              Calculate Your Wealth
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Results Section - ATTRACTIVE VALUE MESSAGING */}
          <div className="space-y-6">
            {/* Main Result - Attractive Headline */}
            <Card className="border-0 bg-gradient-to-br from-amber-50 to-amber-100 p-6 shadow-lg">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-wide text-amber-900">
                  Your Wealth Building Plan
                </p>
                <h3 className="text-4xl font-bold text-amber-900">{formatCurrency(futureValue)}</h3>
                <p className="text-lg text-amber-800">
                  in {yearsToRetirement} years with smart investing
                </p>
              </div>
            </Card>

            {/* Monthly Investment - Most Attractive Metric */}
            <Card className="border-2 border-green-200 bg-green-50 p-6">
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900">Your Monthly Investment</h4>

                <div className="rounded-lg bg-white p-4">
                  <p className="text-sm text-gray-600">Save per month:</p>
                  <p className="text-3xl font-bold text-green-600">${monthlySavings.toFixed(0)}</p>
                  <p className="mt-2 text-sm font-semibold text-green-700">
                    ✓ That's just ${costPerDay.toFixed(2)}/day — less than a tip!
                  </p>
                </div>
              </div>
            </Card>

            {/* Growth Breakdown */}
            <Card className="border border-gray-200 bg-white p-6">
              <h4 className="mb-4 text-lg font-bold text-gray-900">Your Money at Work</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Total Contributions</p>
                      <p className="text-sm text-gray-600">{months} months of saving</p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900">{formatCurrency(monthlySavings * months)}</p>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-green-50 p-4 border border-green-200">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Investment Growth</p>
                      <p className="text-sm text-gray-600">6% annual return</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatCurrency(growthAmount)}</p>
                    <p className="text-sm text-green-700 font-semibold">+{growthPercentage.toFixed(0)}%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Total Wealth</p>
                      <p className="text-sm text-gray-600">Your retirement fund</p>
                    </div>
                  </div>
                  <p className="font-bold text-blue-600">{formatCurrency(futureValue)}</p>
                </div>
              </div>
            </Card>

            {/* Key Insight - Motivational */}
            <Card className="border-l-4 border-l-amber-500 bg-amber-50 p-6">
              <p className="text-base font-semibold text-amber-900">
                💡 <span className="font-bold">Key Insight:</span> Every haircut you do can work for you. By setting aside just a portion of your earnings and letting it grow, you're building a retirement fund that protects your family and secures your future. That's {formatCurrency(growthAmount)} in growth you wouldn't have otherwise!
              </p>
            </Card>

            {/* Call to Action */}
            <div className="space-y-3">
              <Button
                onClick={() => setShowResults(false)}
                variant="outline"
                className="w-full border-gray-300"
              >
                Adjust Your Numbers
              </Button>
              <Button 
                onClick={() => onNotify("Schedule Free Strategy Session Clicked from Calculator")}
                className="w-full bg-amber-500 py-6 text-lg font-bold text-white hover:bg-amber-600"
              >
                Schedule Your Free Strategy Session
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
