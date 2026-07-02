import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calculator, DollarSign } from "lucide-react";

export function CommissionCalculator() {
  const [premium, setPremium] = useState<string>("");
  const [commissionPercent, setCommissionPercent] = useState<string>("");
  const [commission, setCommission] = useState<number | null>(null);

  const calculateCommission = () => {
    const p = parseFloat(premium);
    const c = parseFloat(commissionPercent);
    
    if (isNaN(p) || isNaN(c) || p < 0 || c < 0) {
      setCommission(null);
      return;
    }

    const calc = (p * c) / 100;
    setCommission(Math.round(calc * 100) / 100);
  };

  const handleReset = () => {
    setPremium("");
    setCommissionPercent("");
    setCommission(null);
  };

  // Format large numbers professionally
  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-[#c9a84c] hover:bg-[#b8963e] text-black font-semibold">
          <Calculator className="w-4 h-4" />
          Commission Calculator
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#c9a84c]" />
            Commission Calculator
          </DialogTitle>
          <DialogDescription>
            Calculate your commission before logging a sale
          </DialogDescription>
        </DialogHeader>

        <Card className="bg-slate-800 border border-slate-700">
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="premium" className="text-white">Monthly Premium ($)</Label>
              <Input
                id="premium"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter monthly premium"
                value={premium}
                onChange={(e) => setPremium(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commissionPercent" className="text-white">Commission Rate (%)</Label>
              <Input
                id="commissionPercent"
                type="number"
                step="0.01"
                min="0"
                max="200"
                placeholder="Enter commission percentage"
                value={commissionPercent}
                onChange={(e) => setCommissionPercent(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={calculateCommission}
                className="flex-1 bg-[#c9a84c] hover:bg-[#b8963e] text-black font-semibold"
              >
                Calculate
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1 border-slate-600 text-white hover:bg-slate-700"
              >
                Reset
              </Button>
            </div>

            {commission !== null && (
              <div className="bg-gradient-to-br from-[#c9a84c]/20 to-[#c9a84c]/10 border border-[#c9a84c]/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">Your Commission</p>
                    <p className="text-3xl font-bold text-[#c9a84c] flex items-center gap-2 mt-1">
                      <DollarSign className="w-6 h-6" />
                      {formatCurrency(commission)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-sm">Premium</p>
                    <p className="text-lg font-semibold text-white">{formatCurrency(parseFloat(premium || "0"))}</p>
                    <p className="text-slate-400 text-sm mt-2">Rate</p>
                    <p className="text-lg font-semibold text-white">{parseFloat(commissionPercent || "0").toFixed(2)}%</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
