import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, CircleAlert as AlertCircle, Info } from "lucide-react";

interface AgentPersistenceKPIProps {
  /** null means no placed policies exist — show N/A */
  persistenceRate: number | null;
  activePolicies: number;
  cancelledThisMonth: number;
  /** Total placed policies (denominator) */
  startingBlock?: number;
  /** Active in-force policies (numerator) */
  stillActive?: number;
}

export function AgentPersistenceKPI({
  persistenceRate,
  activePolicies,
  cancelledThisMonth,
  startingBlock,
  stillActive,
}: AgentPersistenceKPIProps) {
  const isNA = persistenceRate === null;

  // Determine color based on persistence rate
  const getStatusColor = (rate: number) => {
    if (rate >= 90) return { bg: "from-green-600/30 to-green-400/30", border: "border-green-500/70", text: "text-green-300", badge: "bg-green-600 text-white", label: "Excellent" };
    if (rate >= 80) return { bg: "from-yellow-600/30 to-yellow-400/30", border: "border-yellow-500/70", text: "text-yellow-300", badge: "bg-yellow-600 text-white", label: "Good" };
    if (rate >= 75) return { bg: "from-orange-600/30 to-orange-400/30", border: "border-orange-500/70", text: "text-orange-300", badge: "bg-orange-600 text-white", label: "Acceptable" };
    return { bg: "from-red-600/30 to-red-400/30", border: "border-red-500/70", text: "text-red-300", badge: "bg-red-600 text-white", label: "At Risk" };
  };

  const naColors = {
    bg: "from-slate-600/30 to-slate-400/30",
    border: "border-slate-500/70",
    text: "text-slate-400",
    badge: "bg-slate-600 text-white",
    label: "N/A",
  };

  const colors = isNA ? naColors : getStatusColor(persistenceRate!);

  return (
    <div className="group relative hover:scale-105 transition-transform duration-300">
      <div className={`absolute inset-0 bg-gradient-to-r ${colors.bg} rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-300 opacity-0 group-hover:opacity-100`}></div>
      <Card className={`relative bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover:${colors.border} transition-all duration-300 group-hover:shadow-2xl`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-300">Persistence Rate</CardTitle>
            <TrendingUp className={`w-5 h-5 ${colors.text}`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <div className="text-4xl font-bold text-white">
              {isNA ? "N/A" : `${persistenceRate!.toFixed(1)}%`}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
              {colors.label}
            </span>
          </div>

          {/* N/A explanation */}
          {isNA && (
            <div className="mb-3 p-2 bg-slate-700/40 border border-slate-600/50 rounded-md flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400">
                No placed life policies on record yet. Persistency rate will appear once a policy is placed and in-force.
              </p>
            </div>
          )}

          {/* Live Book detail (only when rate is available) */}
          {!isNA && startingBlock !== undefined && (
            <div className="space-y-2 text-xs mb-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Placed:</span>
                <span className="text-slate-200 font-semibold">{startingBlock}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active In-Force:</span>
                <span className="text-slate-200 font-semibold">{stillActive ?? 0}</span>
              </div>
            </div>
          )}

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Active Policies (Total):</span>
              <span className="text-slate-200 font-semibold">{activePolicies}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cancelled This Month:</span>
              <span className="text-slate-200 font-semibold">{cancelledThisMonth}</span>
            </div>
          </div>

          {!isNA && persistenceRate! < 80 && (
            <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded-md flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-300">Focus on policy retention to improve persistence</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
