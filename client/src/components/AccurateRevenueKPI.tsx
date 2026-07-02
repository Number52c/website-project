import { TrendingUp, CircleAlert as AlertCircle } from "lucide-react";

interface AccurateRevenueKPIProps {
  issuedPaidPremium: number;
  totalExpenses: number;
  month: number;
  year: number;
}

export function AccurateRevenueKPI({
  issuedPaidPremium,
  totalExpenses,
  month,
  year,
}: AccurateRevenueKPIProps) {
  const accurateRevenue = issuedPaidPremium - totalExpenses;
  const isPositive = accurateRevenue >= 0;

  const monthName = new Date(year, month - 1).toLocaleString("en-US", { month: "long" });

  return (
    <div
      className={`rounded-xl p-6 border transition-all ${
        isPositive
          ? "bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-500/30"
          : "bg-gradient-to-br from-orange-900/30 to-orange-800/20 border-orange-500/30"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-gray-300 uppercase tracking-wider mb-1">
            Accurate Monthly Revenue
          </p>
          <p className="text-xs text-gray-400 mb-2">
            {monthName} {year}
          </p>
          <p
            className={`text-3xl font-bold ${
              isPositive ? "text-blue-400" : "text-orange-400"
            }`}
          >
            ${Math.abs(accurateRevenue).toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
        {isPositive ? (
          <TrendingUp size={28} className="text-blue-400" />
        ) : (
          <AlertCircle size={28} className="text-orange-400" />
        )}
      </div>

      <div className="space-y-3 text-xs">
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-300">Issued Paid Premium</span>
            <span className="text-emerald-400 font-semibold">
              +${issuedPaidPremium.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <p className="text-gray-500 text-[10px]">
            Total premium from paid policies
          </p>
        </div>

        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-300">Total Expenses</span>
            <span className="text-red-400 font-semibold">
              -${totalExpenses.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <p className="text-gray-500 text-[10px]">
            Cell phone, leads, CRM, WAVV, misc
          </p>
        </div>

        <div
          className={`rounded-lg p-3 border-2 ${
            isPositive
              ? "bg-blue-500/10 border-blue-500/30"
              : "bg-orange-500/10 border-orange-500/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white">Expected Revenue</span>
            <span
              className={`font-bold text-lg ${
                isPositive ? "text-blue-400" : "text-orange-400"
              }`}
            >
              {isPositive ? "+" : "-"}$
              {Math.abs(accurateRevenue).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
