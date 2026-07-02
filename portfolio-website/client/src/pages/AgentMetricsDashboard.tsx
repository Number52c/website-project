import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, Users, Target, Wallet, ChartPie as PieChart, Download, FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import { useAuth } from "@/_core/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { trpc } from "@/lib/trpc";

export default function AgentMetricsDashboard() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const { data: persistenceData } = trpc.agent.myPersistence.useQuery();
  const { data: revenueData } = trpc.agent.myRevenue.useQuery({ year: currentYear, month: currentMonth });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  // Live data from backend — no hardcoded mock values
  const monthlyRevenue = revenueData?.totalCommission ?? 0;
  const ytdRevenue = revenueData?.ytdCommission ?? 0;
  const activeBook = revenueData?.activeBookAP ?? 0;
  // persistenceRate is null when no Jan 1 starting block exists (2026 N/A)
  const persistenceRate: number | null = persistenceData?.persistenceRate ?? null;
  const expenses = revenueData?.totalExpenses ?? 0;
  const netCommission = revenueData?.netRevenue ?? 0;

  const getPersistenceColor = (rate: number) => {
    if (rate >= 90) return "text-emerald-500";
    if (rate >= 80) return "text-yellow-500";
    return "text-red-500";
  };

  const getPersistenceBg = (rate: number) => {
    if (rate >= 90) return "bg-emerald-500/10";
    if (rate >= 80) return "bg-yellow-500/10";
    return "bg-red-500/10";
  };

  // Export to CSV
  const handleExportCSV = () => {
    const csvData = [
      ["Metric", "Value"],
      ["Monthly Revenue", `$${monthlyRevenue.toFixed(2)}`],
      ["YTD Revenue", `$${ytdRevenue.toFixed(2)}`],
      ["Active Book", `$${activeBook.toFixed(0)}`],
      ["Persistence Rate", `${persistenceRate}%`],
      ["Expenses", `$${expenses.toFixed(2)}`],
      ["Net Commission", `$${netCommission.toFixed(2)}`],
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `agent-metrics-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(13, 27, 62); // Navy color
    doc.text("Revenue Dashboard", margin, yPosition);
    yPosition += 10;

    // Subtitle
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text("Agent Performance Metrics", margin, yPosition);
    yPosition += 12;

    // Metrics table
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    const metrics = [
      ["Monthly Revenue", `$${monthlyRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`],
      ["YTD Revenue", `$${ytdRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`],
      ["Active Book", `$${activeBook.toLocaleString("en-US", { minimumFractionDigits: 0 })}`],
      ["Persistence Rate", `${persistenceRate}%`],
      ["Expenses", `$${expenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}`],
      ["Net Commission", `$${netCommission.toLocaleString("en-US", { minimumFractionDigits: 2 })}`],
    ];

    metrics.forEach(([label, value]) => {
      doc.setTextColor(0, 0, 0);
      doc.text(label, margin, yPosition);
      doc.setTextColor(201, 168, 76); // Gold color
      doc.text(value, pageWidth - margin - 30, yPosition, { align: "right" });
      yPosition += 8;
    });

    yPosition += 5;

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, pageHeight - 10);

    doc.save(`agent-metrics-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Export Buttons */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white dark:text-white mb-2">Revenue Dashboard</h1>
            <p className="text-slate-400 dark:text-slate-400 text-sm sm:text-base">Monitor your book of business and performance metrics</p>
          </div>
          <div className="flex gap-2 sm:gap-3 items-center">
            <Button
              onClick={handleExportCSV}
              className="bg-[#c9a84c] hover:bg-[#b89a3a] text-slate-900 font-medium flex items-center gap-2 text-sm sm:text-base"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">CSV</span>
              <span className="sm:hidden">CSV</span>
            </Button>
            <Button
              onClick={handleExportPDF}
              className="bg-[#c9a84c] hover:bg-[#b89a3a] text-slate-900 font-medium flex items-center gap-2 text-sm sm:text-base"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {/* Monthly Revenue */}
          <Card className="bg-slate-800 border-slate-700 hover:border-[#c9a84c] transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-300 text-xs sm:text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="w-4 sm:w-5 h-4 sm:h-5 text-[#c9a84c]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                ${monthlyRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-400">This month</p>
            </CardContent>
          </Card>

          {/* YTD Revenue */}
          <Card className="bg-slate-800 border-slate-700 hover:border-[#c9a84c] transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-300 text-xs sm:text-sm font-medium">YTD Revenue</CardTitle>
                <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-[#c9a84c]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                ${ytdRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-400">Year to date</p>
            </CardContent>
          </Card>

          {/* Active Book of Business */}
          <Card className="bg-slate-800 border-slate-700 hover:border-[#c9a84c] transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-300 text-xs sm:text-sm font-medium">Active Book</CardTitle>
                <PieChart className="w-4 sm:w-5 h-4 sm:h-5 text-[#c9a84c]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                ${activeBook.toLocaleString("en-US", { minimumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-slate-400">Total AP</p>
            </CardContent>
          </Card>

          {/* Persistence Rate */}
          <Card className={`border-slate-700 hover:border-[#c9a84c] transition-colors ${persistenceRate !== null ? getPersistenceBg(persistenceRate) : 'bg-slate-800'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-300 text-xs sm:text-sm font-medium">Persistence Rate</CardTitle>
                <Target className="w-4 sm:w-5 h-4 sm:h-5 text-[#c9a84c]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl sm:text-3xl font-bold mb-1 ${persistenceRate !== null ? getPersistenceColor(persistenceRate) : 'text-slate-400'}`}>
                {persistenceRate !== null ? `${persistenceRate}%` : 'N/A'}
              </div>
              <p className="text-xs text-slate-400">
                {persistenceRate !== null ? 'Year (Life Policies)' : 'No Jan 1 starting block — 2027 onward'}
              </p>
            </CardContent>
          </Card>

          {/* Expenses */}
          <Card className="bg-slate-800 border-slate-700 hover:border-[#c9a84c] transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-300 text-xs sm:text-sm font-medium">Expenses</CardTitle>
                <Wallet className="w-4 sm:w-5 h-4 sm:h-5 text-[#c9a84c]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                ${expenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-400">This month</p>
            </CardContent>
          </Card>

          {/* Net Commission */}
          <Card className="bg-slate-800 border-slate-700 hover:border-[#c9a84c] transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-300 text-xs sm:text-sm font-medium">Net Commission</CardTitle>
                <DollarSign className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-500 mb-1">
                ${netCommission.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-400">Revenue - Expenses</p>
            </CardContent>
          </Card>
        </div>

        {/* Persistence Insights */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-lg sm:text-xl">Persistence Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {persistenceRate === null ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#c9a84c] mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-white font-medium text-sm sm:text-base">2026 — Building Your Starting Block</p>
                      <p className="text-slate-400 text-xs sm:text-sm">Every active policy you write in 2026 becomes part of your January 1, 2027 starting block. Your persistence rate will be calculated for the first time on January 1, 2027.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#c9a84c] mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-white font-medium text-sm sm:text-base">Target: 75% or Above</p>
                      <p className="text-slate-400 text-xs sm:text-sm">Write quality business and keep clients engaged. A persistence rate of 75%+ shows you're placing clean, long-term policies that stay on the books.</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${persistenceRate >= 90 ? 'bg-emerald-500' : persistenceRate >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="text-white font-medium text-sm sm:text-base">
                        {persistenceRate >= 90 ? 'Excellent Persistence Rate' : persistenceRate >= 75 ? 'Good Persistence Rate' : 'Persistence Rate Needs Attention'}
                      </p>
                      <p className="text-slate-400 text-xs sm:text-sm">
                        Your {persistenceRate.toFixed(1)}% persistence rate {persistenceRate >= 90 ? 'is excellent — you are writing clean, quality business that stays on the books.' : persistenceRate >= 75 ? 'meets the 75% target. Focus on client engagement to push toward 90%+.' : 'is below the 75% target. Review recent cancellations and focus on client retention.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#c9a84c] mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-white font-medium text-sm sm:text-base">Target: 75% or Above</p>
                      <p className="text-slate-400 text-xs sm:text-sm">
                        {persistenceRate >= 75 ? `You are ${(persistenceRate - 75).toFixed(1)}% above the minimum target. Keep up the excellent work in client retention and policy management.` : `You are ${(75 - persistenceRate).toFixed(1)}% below the minimum target. Reach out to at-risk clients to prevent further lapses.`}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
