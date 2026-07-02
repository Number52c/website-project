import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CircleAlert as AlertCircle, Users, Target, TrendingUp, DollarSign, Download, FileText, Lock, Loader as Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { jsPDF } from "jspdf";
import { trpc } from "@/lib/trpc";

export default function OrtizDashboard() {
  const { user } = useAuth();
  const [authenticated, setAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  // Check existing session on mount
  const sessionCheck = trpc.adminAuth.checkSession.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (sessionCheck.isLoading) return;
    if (sessionCheck.data?.authenticated) {
      setAuthenticated(true);
    }
    setIsChecking(false);
  }, [sessionCheck.isLoading, sessionCheck.data]);

  const verifyPinMutation = trpc.adminAuth.verifyPin.useMutation({
    onSuccess: () => {
      setAuthenticated(true);
      setPinError("");
      setPin("");
    },
    onError: (err) => {
      setPinError(err.message);
      setPin("");
    },
  });

  const logoutMutation = trpc.adminAuth.logout.useMutation({
    onSuccess: () => {
      setAuthenticated(false);
      window.location.href = "/";
    },
  });

  const handlePinSubmit = () => {
    if (!pin.trim()) {
      setPinError("Please enter your PIN.");
      return;
    }
    verifyPinMutation.mutate({ pin });
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <Loader2 className="animate-spin text-yellow-500" size={48} />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 max-w-md w-full">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-yellow-500" />
            <h2 className="text-white text-xl font-bold">Ortiz Dashboard</h2>
          </div>
          <div className="space-y-4">
            <p className="text-slate-300 text-sm">Enter your PIN to access the Ortiz Dashboard</p>
            <input
              type="password"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setPinError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") handlePinSubmit(); }}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 text-center text-2xl tracking-widest"
              disabled={verifyPinMutation.isPending}
              autoFocus
            />
            {pinError && <p className="text-red-500 text-sm">{pinError}</p>}
            <Button
              onClick={handlePinSubmit}
              disabled={verifyPinMutation.isPending}
              className="w-full bg-[#c9a84c] hover:bg-[#d4b860] text-slate-900 font-semibold"
            >
              {verifyPinMutation.isPending ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
              Unlock Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Mock data for admin metrics
  const adminMetrics = {
    monthlyRevenue: 12500.00,
    ytdRevenue: 52000.00,
    activeBook: 425000.00,
    persistenceRate: 88,
    expenses: 2400.00,
    netCommission: 10100.00,
  };

  // Mock agent data
  const agents = [
    { id: 1, name: "Nathan Faughn", persistenceRate: 92, activePolicies: 125, cancellationsThisMonth: 1 },
    { id: 2, name: "Sarah Johnson", persistenceRate: 85, activePolicies: 98, cancellationsThisMonth: 2 },
    { id: 3, name: "Mike Davis", persistenceRate: 78, activePolicies: 112, cancellationsThisMonth: 3 },
  ];

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
    let csvContent = "Ortiz Dashboard Report\n\n";
    csvContent += "Admin Metrics\n";
    csvContent += "Metric,Value\n";
    csvContent += `Monthly Revenue,$${adminMetrics.monthlyRevenue.toFixed(2)}\n`;
    csvContent += `YTD Revenue,$${adminMetrics.ytdRevenue.toFixed(2)}\n`;
    csvContent += `Persistence Rate,${adminMetrics.persistenceRate}%\n\n`;
    csvContent += "Agent Persistence Rates\n";
    csvContent += "Agent Name,Persistence Rate,Active Policies,Cancellations This Month\n";
    
    agents.forEach((agent) => {
      csvContent += `${agent.name},${agent.persistenceRate}%,${agent.activePolicies},${agent.cancellationsThisMonth}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ortiz-dashboard-${new Date().toISOString().split("T")[0]}.csv`;
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
    doc.text("Ortiz Dashboard", margin, yPosition);
    yPosition += 10;

    // Subtitle
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text("Business Performance Report", margin, yPosition);
    yPosition += 12;

    // Admin Metrics Section
    doc.setFontSize(12);
    doc.setTextColor(13, 27, 62);
    doc.text("Your Metrics", margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const adminMetricsData = [
      ["Monthly Revenue", `$${adminMetrics.monthlyRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`],
      ["YTD Revenue", `$${adminMetrics.ytdRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`],
      ["Persistence Rate", `${adminMetrics.persistenceRate}%`],
    ];

    adminMetricsData.forEach(([label, value]) => {
      doc.text(label, margin, yPosition);
      doc.setTextColor(201, 168, 76); // Gold color
      doc.text(value, pageWidth - margin - 30, yPosition, { align: "right" });
      doc.setTextColor(0, 0, 0);
      yPosition += 7;
    });

    yPosition += 8;

    // Agent Persistence Section
    doc.setFontSize(12);
    doc.setTextColor(13, 27, 62);
    doc.text("Agent Persistence Rates", margin, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    const tableData = agents.map((agent) => [
      agent.name,
      `${agent.persistenceRate}%`,
      `${agent.activePolicies}`,
      `${agent.cancellationsThisMonth}`,
    ]);

    // Simple table rendering
    const colWidth = (pageWidth - 2 * margin) / 4;
    const headers = ["Agent Name", "Persistence", "Active", "Cancellations"];
    
    // Headers
    headers.forEach((header: string, i: number) => {
      doc.setTextColor(13, 27, 62);
      doc.setFont(undefined, "bold");
      doc.text(String(header || ""), margin + i * colWidth, yPosition);
    });
    yPosition += 6;

    // Data rows
    doc.setFont(undefined, "normal");
    tableData.forEach((row: string[]) => {
      row.forEach((cell: string, i: number) => {
        doc.setTextColor(0, 0, 0);
        doc.text(String(cell || ""), margin + i * colWidth, yPosition);
      });
      yPosition += 6;
    });

    yPosition += 5;

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, pageHeight - 10);

    doc.save(`ortiz-dashboard-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Export Buttons */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Ortiz Dashboard</h1>
            <p className="text-slate-400 text-sm sm:text-base">Monitor your book of business and agent performance</p>
          </div>
          <div className="flex gap-2 sm:gap-3">
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
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 text-sm sm:text-base"
            >
              Lock
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Admin Personal Metrics */}
        <div className="mb-12">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-6">Your Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Monthly Revenue */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-300 text-xs sm:text-sm font-medium">Monthly Revenue</CardTitle>
                  <DollarSign className="w-4 sm:w-5 h-4 sm:h-5 text-[#c9a84c]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  ${adminMetrics.monthlyRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            {/* YTD Revenue */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-300 text-xs sm:text-sm font-medium">YTD Revenue</CardTitle>
                  <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-[#c9a84c]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  ${adminMetrics.ytdRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            {/* Persistence Rate */}
            <Card className={`border-slate-700 ${getPersistenceBg(adminMetrics.persistenceRate)}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-300 text-xs sm:text-sm font-medium">Your Persistence Rate</CardTitle>
                  <Target className="w-4 sm:w-5 h-4 sm:h-5 text-[#c9a84c]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl sm:text-3xl font-bold ${getPersistenceColor(adminMetrics.persistenceRate)}`}>
                  {adminMetrics.persistenceRate}%
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Agent Persistence KPI Table */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white mb-6">Agent Persistence Rates</h2>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm sm:text-base">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-slate-300 font-semibold text-xs sm:text-sm">Agent Name</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-slate-300 font-semibold text-xs sm:text-sm">Persistence Rate (Year)</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-slate-300 font-semibold text-xs sm:text-sm"># Active Policies</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-slate-300 font-semibold text-xs sm:text-sm"># Cancellations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map((agent, index) => (
                      <tr
                        key={agent.id}
                        className={`border-b border-slate-700 hover:bg-slate-700/50 transition-colors ${
                          index === agents.length - 1 ? "border-b-0" : ""
                        }`}
                      >
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-white font-medium text-xs sm:text-base">{agent.name}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                          <span className={`font-bold text-xs sm:text-lg ${getPersistenceColor(agent.persistenceRate)}`}>
                            {agent.persistenceRate}%
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-center text-slate-300 text-xs sm:text-base">{agent.activePolicies}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                          <span className="inline-block px-2 sm:px-3 py-1 rounded-full bg-red-500/10 text-red-400 font-semibold text-xs">
                            {agent.cancellationsThisMonth}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
