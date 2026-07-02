import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader as Loader2, TrendingUp, Users, DollarSign, CircleCheck as CheckCircle, Clock } from "lucide-react";

interface AgentPerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AgentPerformanceModal({ isOpen, onClose }: AgentPerformanceModalProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const { data: agents, isLoading: agentsLoading } = trpc.admin.listAgents.useQuery();

  const selectedAgent = useMemo(() => {
    if (!selectedAgentId || !agents) return null;
    return agents.find(a => a.id === parseInt(selectedAgentId));
  }, [selectedAgentId, agents]);

  // Fetch agent sales for all months
  const { data: agentSalesData, isLoading: salesLoading } = trpc.admin.getAgentSalesMetrics.useQuery(
    { agentId: selectedAgent?.id || 0 },
    { enabled: !!selectedAgent }
  );

  const monthlyMetrics = useMemo(() => {
    if (!agentSalesData) return [];

    const months: Array<{ num: number; name: string }> = [
      { num: 1, name: "January" },
      { num: 2, name: "February" },
      { num: 3, name: "March" },
      { num: 4, name: "April" },
      { num: 5, name: "May" },
      { num: 6, name: "June" },
      { num: 7, name: "July" },
      { num: 8, name: "August" },
      { num: 9, name: "September" },
      { num: 10, name: "October" },
      { num: 11, name: "November" },
      { num: 12, name: "December" },
    ];

    return months.map(month => {
      const monthData = agentSalesData.find((d: any) => d.month === month.num);
      return {
        month: month.name,
        monthNum: month.num,
        issuedPaid: monthData?.issuedPaid || 0,
        yearlyAP: monthData?.yearlyAP || 0,
        submittedPremium: monthData?.submittedPremium || 0,
        submittedAnnualPremium: monthData?.submittedAnnualPremium || 0,
        totalSubmitted: monthData?.totalSubmitted || 0,
        totalIssued: monthData?.totalIssued || 0,
        totalClients: monthData?.totalClients || 0,
      };
    });
  }, [agentSalesData]);

  // Year-to-date totals
  const yearTotals = useMemo(() => {
    return monthlyMetrics.reduce((acc, m) => ({
      submittedPremium: acc.submittedPremium + m.submittedPremium,
      submittedAP: acc.submittedAP + m.submittedAnnualPremium,
      issuedPremium: acc.issuedPremium + m.issuedPaid,
      issuedAP: acc.issuedAP + m.yearlyAP,
      totalSubmitted: acc.totalSubmitted + m.totalSubmitted,
      totalIssued: acc.totalIssued + m.totalIssued,
    }), { submittedPremium: 0, submittedAP: 0, issuedPremium: 0, issuedAP: 0, totalSubmitted: 0, totalIssued: 0 });
  }, [monthlyMetrics]);

  // Only show months with activity
  const activeMonths = monthlyMetrics.filter(m => m.totalSubmitted > 0);

  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agent Performance Metrics</DialogTitle>
          <DialogDescription>
            Select an agent to view their monthly performance data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Agent Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Agent</label>
            <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an agent..." />
              </SelectTrigger>
              <SelectContent>
                {agentsLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  agents?.map(agent => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      {agent.firstName} {agent.lastName} ({agent.email})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Agent Summary */}
          {selectedAgent && (
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">
                {selectedAgent.firstName} {selectedAgent.lastName}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Email: {selectedAgent.email}
              </p>
              {selectedAgent.phone && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Phone: {selectedAgent.phone}
                </p>
              )}
              {selectedAgent.licenseNumber && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  License: {selectedAgent.licenseNumber} ({selectedAgent.licenseState})
                </p>
              )}
            </div>
          )}

          {/* Year-to-Date Summary */}
          {selectedAgent && !salesLoading && yearTotals.totalSubmitted > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Year-to-Date Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card className="border-blue-200 dark:border-blue-800">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Submitted</span>
                    </div>
                    <div className="text-2xl font-bold">{yearTotals.totalSubmitted}</div>
                    <div className="text-sm text-slate-500">${fmt(yearTotals.submittedPremium)}/mo</div>
                    <div className="text-xs text-slate-400">AP: ${fmt(yearTotals.submittedAP)}</div>
                  </CardContent>
                </Card>
                <Card className="border-green-200 dark:border-green-800">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Issued / Paid</span>
                    </div>
                    <div className="text-2xl font-bold">{yearTotals.totalIssued}</div>
                    <div className="text-sm text-slate-500">${fmt(yearTotals.issuedPremium)}/mo</div>
                    <div className="text-xs text-slate-400">AP: ${fmt(yearTotals.issuedAP)}</div>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-700">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-slate-500" />
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Clients</span>
                    </div>
                    <div className="text-2xl font-bold">{monthlyMetrics[0]?.totalClients || 0}</div>
                    <div className="text-sm text-slate-500">Under management</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Monthly Breakdown */}
          {selectedAgent && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Monthly Breakdown</h3>
              {salesLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : activeMonths.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No sales activity recorded for this agent yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-3 font-semibold text-slate-600 dark:text-slate-400">Month</th>
                        <th className="text-center py-3 px-3 font-semibold text-blue-600 dark:text-blue-400">Submitted</th>
                        <th className="text-right py-3 px-3 font-semibold text-blue-600 dark:text-blue-400">Submitted AP</th>
                        <th className="text-center py-3 px-3 font-semibold text-green-600 dark:text-green-400">Issued/Paid</th>
                        <th className="text-right py-3 px-3 font-semibold text-green-600 dark:text-green-400">Issued AP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeMonths.map(metric => (
                        <tr key={metric.monthNum} className="border-b hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="py-3 px-3 font-medium">{metric.month}</td>
                          <td className="py-3 px-3 text-center">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                              {metric.totalSubmitted} sale{metric.totalSubmitted !== 1 ? "s" : ""}
                            </Badge>
                            <div className="text-xs text-slate-500 mt-1">${fmt(metric.submittedPremium)}/mo</div>
                          </td>
                          <td className="py-3 px-3 text-right font-semibold text-blue-700 dark:text-blue-300">
                            ${fmt(metric.submittedAnnualPremium)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {metric.totalIssued > 0 ? (
                              <>
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-0">
                                  {metric.totalIssued} issued
                                </Badge>
                                <div className="text-xs text-slate-500 mt-1">${fmt(metric.issuedPaid)}/mo</div>
                              </>
                            ) : (
                              <span className="text-xs text-slate-400">Pending</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-semibold text-green-700 dark:text-green-300">
                            {metric.totalIssued > 0 ? `$${fmt(metric.yearlyAP)}` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {!selectedAgent && (
            <div className="text-center py-8 text-slate-500">
              Select an agent to view their performance metrics
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
