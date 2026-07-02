import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { TrendingUp, Users, DollarSign, Calendar, UserPlus, Clock } from "lucide-react";

export function AgentPerformanceTab() {
  const { data: agentPerformance, isLoading } = trpc.admin.getAgentPerformance.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (!agentPerformance || agentPerformance.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-400">No agent performance data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Agent Performance Dashboard</h2>
        <p className="text-gray-400">Monthly and year-to-date performance metrics for all agents</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {agentPerformance.map((agent) => (
          <div key={agent.id} className="group relative hover:scale-[1.02] transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-400/30 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
            <Card className="relative bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/70 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-blue-500/20">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-lg">{agent.name}</CardTitle>
                    <p className="text-xs text-gray-500 mt-1">
                      Last login: {agent.lastLogin ? new Date(agent.lastLogin).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                    </p>
                  </div>
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Monthly Stats */}
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">This Month Sales</p>
                    <p className="text-2xl font-bold text-white">{agent.monthlyStats.salesCount}</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">This Month AP</p>
                    <p className="text-2xl font-bold text-blue-400">${agent.monthlyStats.totalAP.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">This Month Commission</p>
                    <p className="text-2xl font-bold text-green-400">${agent.monthlyStats.totalCommission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  {/* Activity */}
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Clients Added</p>
                    <p className="text-2xl font-bold text-purple-400">{agent.clientsAddedThisMonth ?? 0}</p>
                    <p className="text-xs text-gray-500 mt-1">this month</p>
                  </div>

                  {/* YTD Stats */}
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">YTD Sales</p>
                    <p className="text-2xl font-bold text-white">{agent.ytdStats.salesCount}</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">YTD AP</p>
                    <p className="text-2xl font-bold text-blue-400">${agent.ytdStats.totalAP.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">YTD Commission</p>
                    <p className="text-2xl font-bold text-green-400">${agent.ytdStats.totalCommission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  {/* Last Login */}
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Last Active</p>
                    <p className="text-lg font-bold text-white">
                      {agent.lastLogin ? new Date(agent.lastLogin).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Never'}
                    </p>
                    {agent.lastLogin && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(agent.lastLogin).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
