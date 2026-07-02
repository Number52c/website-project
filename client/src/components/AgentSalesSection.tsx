/**
 * AgentSalesSection Component
 * Displays agent-created sales in a separate section with color-coded agent badges
 * Part of Phase 5: Sales Tracker Segregation
 */

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

interface AgentSale {
  id: number;
  agentId: number;
  agentFirstName: string;
  agentLastName: string;
  agentColor: string;
  clientName: string;
  carrier: string;
  productType: string;
  premium: string;
  annualPremium: string;
  commission: string;
  saleDate: number;
  status: string;
}

interface AgentSalesSectionProps {
  agentSalesData: AgentSale[] | undefined;
  isLoading: boolean;
}

const AGENT_COLOR_MAP: Record<string, string> = {
  blue: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  green: "bg-green-500/20 text-green-300 border-green-500/30",
  red: "bg-red-500/20 text-red-300 border-red-500/30",
  purple: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  pink: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  orange: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  yellow: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  cyan: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
};

const AGENT_COLOR_DOT_MAP: Record<string, string> = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  red: "bg-red-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  orange: "bg-orange-500",
  yellow: "bg-yellow-500",
  cyan: "bg-cyan-500",
};

export function AgentSalesSection({ agentSalesData, isLoading }: AgentSalesSectionProps) {
  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6 mt-8">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></span>
            Agent Sales
          </h3>
          <p className="text-sm text-gray-400">Loading agent sales...</p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!agentSalesData || agentSalesData.length === 0) {
    return (
      <div className="space-y-6 mt-8">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-400"></span>
            Agent Sales
          </h3>
          <p className="text-sm text-gray-400">No agent sales recorded yet</p>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalAgentPremium = agentSalesData.reduce(
    (sum, s) => sum + parseFloat(s.premium || "0"),
    0
  );
  const totalAgentCommission = agentSalesData.reduce(
    (sum, s) => sum + parseFloat(s.commission || "0"),
    0
  );

  // Group by agent
  const agentGroups = agentSalesData.reduce(
    (acc, sale) => {
      const agentKey = `${sale.agentFirstName} ${sale.agentLastName}`;
      if (!acc[agentKey]) {
        acc[agentKey] = {
          agentName: agentKey,
          agentColor: sale.agentColor,
          sales: [],
          totalPremium: 0,
          totalCommission: 0,
        };
      }
      acc[agentKey].sales.push(sale);
      acc[agentKey].totalPremium += parseFloat(sale.premium || "0");
      acc[agentKey].totalCommission += parseFloat(sale.commission || "0");
      return acc;
    },
    {} as Record<
      string,
      {
        agentName: string;
        agentColor: string;
        sales: AgentSale[];
        totalPremium: number;
        totalCommission: number;
      }
    >
  );

  return (
    <div className="space-y-6 mt-8">
      {/* Agent Sales Header */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-400"></span>
          Agent Sales ({agentSalesData.length})
        </h3>
        <p className="text-sm text-gray-400">
          Sales created by agents in your organization
        </p>
      </div>

      {/* Agent Sales Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/5 border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Total Premium</p>
              <p className="text-2xl font-bold text-white mt-2">
                ${totalAgentPremium.toFixed(2)}
              </p>
            </div>
            <DollarSign className="text-blue-400 opacity-50" size={32} />
          </div>
        </Card>

        <Card className="bg-white/5 border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Total Commission</p>
              <p className="text-2xl font-bold text-white mt-2">
                ${totalAgentCommission.toFixed(2)}
              </p>
            </div>
            <DollarSign className="text-green-400 opacity-50" size={32} />
          </div>
        </Card>

        <Card className="bg-white/5 border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Agent Count</p>
              <p className="text-2xl font-bold text-white mt-2">{Object.keys(agentGroups).length}</p>
            </div>
            <DollarSign className="text-purple-400 opacity-50" size={32} />
          </div>
        </Card>
      </div>

      {/* Agent Sales by Agent */}
      <div className="space-y-4">
        {Object.entries(agentGroups).map(([agentKey, agentData]) => {
          const colorClass = AGENT_COLOR_MAP[agentData.agentColor || "blue"] || AGENT_COLOR_MAP.blue;
          const dotColor = AGENT_COLOR_DOT_MAP[agentData.agentColor || "blue"] || AGENT_COLOR_DOT_MAP.blue;

          return (
            <div key={agentKey} className="space-y-3">
              {/* Agent Header */}
              <div className={`p-3 rounded-lg border ${colorClass}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`}></span>
                    <span className="font-semibold">{agentData.agentName}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-xs opacity-75">Premium:</span>
                      <span className="ml-1 font-semibold">${agentData.totalPremium.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-xs opacity-75">Commission:</span>
                      <span className="ml-1 font-semibold">${agentData.totalCommission.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agent Sales Table */}
              <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                          Agent
                        </th>
                        <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                          Client
                        </th>
                        <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                          Product
                        </th>
                        <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                          Carrier
                        </th>
                        <th className="text-right px-4 py-3 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                          Premium
                        </th>
                        <th className="text-right px-4 py-3 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                          AP
                        </th>
                        <th className="text-right px-4 py-3 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                          Commission
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {agentData.sales.map((sale) => {
                        const dotColor = AGENT_COLOR_DOT_MAP[agentData.agentColor || "blue"] || AGENT_COLOR_DOT_MAP.blue;
                        return (
                        <tr
                          key={sale.id}
                          className="border-b border-white/5 hover:bg-white/5 transition"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`}></span>
                              <span className="text-white font-medium">{agentData.agentName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-white">{sale.clientName}</td>
                          <td className="px-4 py-3 text-gray-300">
                            <Badge variant="outline" className="text-xs">
                              {sale.productType}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-gray-300">{sale.carrier}</td>
                          <td className="text-right px-4 py-3 text-white font-semibold">
                            ${parseFloat(sale.premium || "0").toFixed(2)}
                          </td>
                          <td className="text-right px-4 py-3 text-gray-300">
                            ${parseFloat(sale.annualPremium || "0").toFixed(2)}
                          </td>
                          <td className="text-right px-4 py-3 text-green-300 font-semibold">
                            ${parseFloat(sale.commission || "0").toFixed(2)}
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
