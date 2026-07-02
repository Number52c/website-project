/**
 * Policy Segregation KPIs Component
 * 
 * Displays segregated KPIs for:
 * - My Book of Business (admin personal policies)
 * - Agent Production (by agent with color coding)
 * - Agency Overview (combined totals)
 * 
 * Uses Phase 2 tRPC procedures for data segregation
 */

import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Users, TrendingUp, Loader as Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SegregatedKPIProps {
  adminId: number;
}

export function PolicySegregationKPIs({ adminId }: SegregatedKPIProps) {
  const [expandedSection, setExpandedSection] = useState<"my-book" | "agents" | "overview" | null>(null);

  // Fetch segregated data using Phase 2 procedures
  const { data: myBook, isLoading: myBookLoading } = trpc.phase2.myBookOfBusiness.useQuery(undefined, {
    enabled: true,
  });

  const { data: agentCounts, isLoading: agentCountsLoading } = trpc.phase2.policiesCountByAgent.useQuery(undefined, {
    enabled: true,
  });

  const { data: agentPremiums, isLoading: agentPremiumsLoading } = trpc.phase2.totalPremiumByAgent.useQuery(undefined, {
    enabled: true,
  });

  const { data: allPoliciesWithAgents, isLoading: allPoliciesLoading } = trpc.phase2.allPoliciesWithAgents.useQuery(undefined, {
    enabled: true,
  });

  // Calculate KPIs
  const myBookCount = myBook?.length || 0;
  const myBookPremium = myBook?.reduce((sum, p) => sum + parseFloat(p.annualPremium || "0"), 0) || 0;

  const agentTotals = {
    count: agentCounts?.reduce((sum, a) => sum + (Number(a.policyCount) || 0), 0) || 0,
    premium: agentPremiums?.reduce((sum, a) => sum + (parseFloat(String(a.totalPremium)) || 0), 0) || 0,
  };

  const agencyTotals = {
    count: (myBookCount + agentTotals.count) || 0,
    premium: (myBookPremium + agentTotals.premium) || 0,
  };

  const isLoading = myBookLoading || agentCountsLoading || agentPremiumsLoading || allPoliciesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Policy Segregation Dashboard</h2>
        <p className="text-gray-400">Segregated view of personal book, agent production, and agency totals</p>
      </div>

      {/* Three-Column KPI Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* My Book of Business */}
        <motion.div
          onClick={() => setExpandedSection(expandedSection === "my-book" ? null : "my-book")}
          whileHover={{ scale: 1.02 }}
          className="cursor-pointer"
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-900/40 to-blue-900/20 border-blue-500/30 hover:border-blue-400 p-6 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">My Book of Business</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-3xl font-bold text-white">{myBookCount}</p>
                    <p className="text-xs text-gray-400">Policies</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-400">
                      ${(myBookPremium / 1000).toFixed(0)}K
                    </p>
                    <p className="text-xs text-gray-400">Annual Premium</p>
                  </div>
                </div>
              </div>
              <DollarSign size={24} className="text-blue-400" />
            </div>
            {expandedSection === "my-book" && (
              <div className="mt-4 pt-4 border-t border-blue-500/20">
                <p className="text-xs text-gray-400">
                  {myBookCount} policies with ${myBookPremium.toLocaleString("en-US", { maximumFractionDigits: 0 })} in annual premium
                </p>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Agent Production */}
        <motion.div
          onClick={() => setExpandedSection(expandedSection === "agents" ? null : "agents")}
          whileHover={{ scale: 1.02 }}
          className="cursor-pointer"
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-900/40 to-purple-900/20 border-purple-500/30 hover:border-purple-400 p-6 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Agent Production</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-3xl font-bold text-white">{agentTotals.count}</p>
                    <p className="text-xs text-gray-400">Policies</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-400">
                      ${(agentTotals.premium / 1000).toFixed(0)}K
                    </p>
                    <p className="text-xs text-gray-400">Annual Premium</p>
                  </div>
                </div>
              </div>
              <Users size={24} className="text-purple-400" />
            </div>
            {expandedSection === "agents" && (
              <div className="mt-4 pt-4 border-t border-purple-500/20">
                <p className="text-xs text-gray-400 mb-3">
                  {agentCounts?.length || 0} agents with {agentTotals.count} total policies
                </p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {agentCounts?.map((agent) => (
                    <div key={agent.agentId} className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">{agent.agentName}</span>
                      <span className="text-purple-300 font-semibold">{agent.policyCount} policies</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Agency Overview */}
        <motion.div
          onClick={() => setExpandedSection(expandedSection === "overview" ? null : "overview")}
          whileHover={{ scale: 1.02 }}
          className="cursor-pointer"
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-900/40 to-emerald-900/20 border-emerald-500/30 hover:border-emerald-400 p-6 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Agency Overview</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-3xl font-bold text-white">{agencyTotals.count}</p>
                    <p className="text-xs text-gray-400">Total Policies</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-400">
                      ${(agencyTotals.premium / 1000).toFixed(0)}K
                    </p>
                    <p className="text-xs text-gray-400">Total Premium</p>
                  </div>
                </div>
              </div>
              <TrendingUp size={24} className="text-emerald-400" />
            </div>
            {expandedSection === "overview" && (
              <div className="mt-4 pt-4 border-t border-emerald-500/20 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">My Book:</span>
                  <span className="text-emerald-300 font-semibold">{myBookCount} policies</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Agent Production:</span>
                  <span className="text-emerald-300 font-semibold">{agentTotals.count} policies</span>
                </div>
                <div className="flex justify-between text-xs pt-2 border-t border-emerald-500/20">
                  <span className="text-gray-300 font-semibold">Total:</span>
                  <span className="text-emerald-300 font-bold">${agencyTotals.premium.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Agent Breakdown Table (if expanded) */}
      {expandedSection === "agents" && agentCounts && agentCounts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700"
        >
          <h3 className="text-sm font-semibold text-white mb-4">Agent Production Breakdown</h3>
          <div className="space-y-2">
            {agentCounts.map((agent) => {
              const premium = parseFloat(String(agentPremiums?.find((p) => p.agentId === agent.agentId)?.totalPremium || 0)) || 0;
              const policyData = allPoliciesWithAgents?.filter((p) => p.agentId === agent.agentId) || [];
              const color = policyData[0]?.agentColor || "default";

              return (
                <div key={agent.agentId} className="flex items-center justify-between p-3 bg-slate-800/50 rounded border border-slate-700">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: getColorValue(color),
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium text-white">{agent.agentName}</p>
                      <p className="text-xs text-gray-400">{agent.policyCount} policies</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">
                      ${(premium / 1000).toFixed(0)}K
                    </p>
                    <p className="text-xs text-gray-400">Annual Premium</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Convert color name to hex value for display
 */
function getColorValue(color: string): string {
  const colorMap: Record<string, string> = {
    blue: "#3b82f6",
    green: "#10b981",
    red: "#ef4444",
    purple: "#a855f7",
    pink: "#ec4899",
    orange: "#f97316",
    yellow: "#eab308",
    cyan: "#06b6d4",
    default: "#64748b",
  };
  return colorMap[color] || colorMap.default;
}
