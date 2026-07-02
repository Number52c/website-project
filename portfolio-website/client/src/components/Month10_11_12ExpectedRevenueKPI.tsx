import { TrendingUp } from "lucide-react";

interface Month10_11_12ExpectedRevenueKPIProps {
  month10Revenue: number;
  month11Revenue: number;
  month12Revenue: number;
  currentMonth: number;
  currentYear: number;
}

export function Month10_11_12ExpectedRevenueKPI({
  month10Revenue,
  month11Revenue,
  month12Revenue,
}: Month10_11_12ExpectedRevenueKPIProps) {
  const totalExpectedRevenue = month10Revenue + month11Revenue + month12Revenue;

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-xl p-6 border border-purple-500/30">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-purple-300 uppercase tracking-wider mb-1">
            Months 10, 11, 12 Expected Revenue
          </p>
          <p className="text-3xl font-bold text-purple-400">
            ${fmt(totalExpectedRevenue)}
          </p>
        </div>
        <TrendingUp size={28} className="text-purple-400 shrink-0" />
      </div>

      {/* Vertical stacked rows — no overflow */}
      <div className="space-y-2 mb-3">
        {[
          { label: "Month 10", value: month10Revenue },
          { label: "Month 11", value: month11Revenue },
          { label: "Month 12", value: month12Revenue },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3 border border-white/10"
          >
            <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
            <span className="text-base font-bold text-purple-300">${fmt(value)}</span>
          </div>
        ))}
      </div>

      <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/30">
        <p className="text-xs text-gray-300 mb-1">
          Backend payments from policies paid this month
        </p>
        <p className="text-sm text-purple-300">
          These are the advance commission payments you'll receive 10, 11, and 12 months after each policy's effective date
        </p>
      </div>
    </div>
  );
}
