import { TrendingUp, Calendar } from "lucide-react";

interface MonthlyData {
  month: string;
  issuedPaid: number;
}

interface AgentKPICardProps {
  agentName: string;
  yearlyAP: number;
  monthlyData: MonthlyData[];
  onMonthClick?: (month: string) => void;
}

export function AgentKPICard({
  agentName,
  yearlyAP,
  monthlyData,
  onMonthClick,
}: AgentKPICardProps) {
  const totalIssuedPaid = monthlyData.reduce((sum, m) => sum + m.issuedPaid, 0);
  const maxValue = Math.max(...monthlyData.map(m => m.issuedPaid), 1);

  return (
    <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-xl p-6 border border-blue-500/30 hover:border-blue-400/50 transition cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-blue-300 uppercase tracking-wider mb-1">
            {agentName}
          </p>
          <p className="text-2xl font-bold text-blue-400">
            ${totalIssuedPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Annual Premium: ${annualPremium.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <TrendingUp size={24} className="text-blue-400" />
      </div>

      {/* Mini bar chart */}
      <div className="space-y-2">
        <div className="flex items-end gap-1 h-16">
          {monthlyData.map((data, idx) => (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center gap-1 group cursor-pointer"
              onClick={() => onMonthClick?.(data.month)}
            >
              <div
                className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-200 group-hover:from-blue-400 group-hover:to-blue-300"
                style={{
                  height: `${maxValue > 0 ? (data.issuedPaid / maxValue) * 100 : 0}%`,
                  minHeight: data.issuedPaid > 0 ? "4px" : "0px",
                }}
                title={`${data.month}: $${data.issuedPaid.toFixed(2)}`}
              />
              <span className="text-xs text-gray-400 group-hover:text-blue-300 transition">
                {data.month.substring(0, 3)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-blue-500/20">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400 flex items-center gap-1">
            <Calendar size={14} />
            Monthly Breakdown
          </span>
          <span className="text-blue-400 font-semibold">
            {monthlyData.filter(m => m.issuedPaid > 0).length} months active
          </span>
        </div>
      </div>
    </div>
  );
}
