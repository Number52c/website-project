import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CircleAlert as AlertCircle, Users, Target, TrendingUp, DollarSign, Download, FileText, Lock, Loader as Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { jsPDF } from "jspdf";
import { trpc } from "@/lib/trpc";

export default function OrtizPINDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [showPinModal, setShowPinModal] = useState(true);

  // Check existing session on mount
  const sessionCheck = trpc.adminAuth.checkSession.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (sessionCheck.isLoading) return;
    if (sessionCheck.data?.authenticated) {
      setAuthenticated(true);
      setShowPinModal(false);
    }
    setIsChecking(false);
  }, [sessionCheck.isLoading, sessionCheck.data]);

  const verifyPinMutation = trpc.adminAuth.verifyPin.useMutation({
    onSuccess: () => {
      setAuthenticated(true);
      setShowPinModal(false);
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
      setShowPinModal(true);
    },
  });

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
  const agentPersistence = [
    { id: 1, name: "Nathan Faughn", persistenceRate: 92, activePolicies: 125, cancellations: 1 },
    { id: 2, name: "Sarah Johnson", persistenceRate: 85, activePolicies: 98, cancellations: 2 },
    { id: 3, name: "Mike Davis", persistenceRate: 78, activePolicies: 112, cancellations: 3 },
  ];

  const metricsLoading = false;
  const persistenceLoading = false;

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

  const exportToCSV = () => {
    if (!adminMetrics || !agentPersistence) return;

    let csv = "Ortiz Insurance Dashboard Report\n";
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;

    csv += "ADMIN METRICS\n";
    csv += `Monthly Revenue,${adminMetrics.monthlyRevenue}\n`;
    csv += `YTD Revenue,${adminMetrics.ytdRevenue}\n`;
    csv += `Persistence Rate,${adminMetrics.persistenceRate}%\n\n`;

    csv += "AGENT PERSISTENCE RATES\n";
    csv += "Agent Name,Persistence Rate,Active Policies,Cancellations\n";
    agentPersistence.forEach((agent: any) => {
      csv += `${agent.name},${agent.persistenceRate}%,${agent.activePolicies},${agent.cancellations}\n`;
    });

    const element = document.createElement("a");
    element.setAttribute("href", `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`);
    element.setAttribute("download", `ortiz-dashboard-${new Date().toISOString().split("T")[0]}.csv`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const exportToPDF = () => {
    if (!adminMetrics || !agentPersistence) return;

    const pdf = new jsPDF();
    let yPosition = 10;

    pdf.setFontSize(16);
    pdf.text("Ortiz Insurance Dashboard Report", 10, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 10, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.text("Admin Metrics", 10, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.text(`Monthly Revenue: $${adminMetrics.monthlyRevenue.toFixed(2)}`, 10, yPosition);
    yPosition += 6;
    pdf.text(`YTD Revenue: $${adminMetrics.ytdRevenue.toFixed(2)}`, 10, yPosition);
    yPosition += 6;
    pdf.text(`Persistence Rate: ${adminMetrics.persistenceRate}%`, 10, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.text("Agent Persistence Rates", 10, yPosition);
    yPosition += 8;

    pdf.setFontSize(9);
    agentPersistence.forEach((agent: any) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 10;
      }
      pdf.text(
        `${agent.name}: ${agent.persistenceRate}% (${agent.activePolicies} policies, ${agent.cancellations} cancellations)`,
        10,
        yPosition
      );
      yPosition += 6;
    });

    pdf.save(`ortiz-dashboard-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-yellow-500" size={48} />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 max-w-md w-full">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-yellow-500" />
            <h2 className="text-white text-xl font-bold">Ortiz Dashboard</h2>
          </div>
          <div className="space-y-4">
            <p className="text-slate-300 text-sm">
              Enter your PIN to access the Ortiz Dashboard
            </p>
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
            {pinError && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {pinError}
              </div>
            )}
            <Button
              onClick={handlePinSubmit}
              disabled={verifyPinMutation.isPending}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold"
            >
              {verifyPinMutation.isPending ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
              Unlock Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (metricsLoading || persistenceLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Spinner className="w-8 h-8 text-yellow-500" />
      </div>
    );
  }

  if (!adminMetrics || !agentPersistence) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="bg-slate-800 border-slate-700 max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <p>Unable to load dashboard data. Please try again.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Ortiz Dashboard</h1>
            <p className="text-slate-400 text-sm">Monitor your book of business and agent performance</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={exportToCSV}
              variant="outline"
              size="sm"
              className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
            >
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button
              onClick={exportToPDF}
              variant="outline"
              size="sm"
              className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
            >
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Lock
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Your Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Your Metrics</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-yellow-500" />
                  Monthly Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">
                  ${adminMetrics.monthlyRevenue.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  YTD Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">
                  ${adminMetrics.ytdRevenue.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  Your Persistence Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold ${
                  adminMetrics.persistenceRate >= 90
                    ? "text-green-400"
                    : adminMetrics.persistenceRate >= 80
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}>
                  {adminMetrics.persistenceRate}%
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Agent Persistence Rates */}
        <div>
          <h2 className="text-xl font-bold mb-4">Agent Persistence Rates</h2>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Agent Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Persistence Rate (Year)</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300"># Active Policies</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300"># Cancellations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentPersistence.map((agent: any) => (
                      <tr key={agent.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                        <td className="py-3 px-4 text-white">{agent.name}</td>
                        <td className="py-3 px-4">
                          <span className={`font-semibold ${
                            agent.persistenceRate >= 90
                              ? "text-green-400"
                              : agent.persistenceRate >= 80
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}>
                            {agent.persistenceRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{agent.activePolicies}</td>
                        <td className="py-3 px-4 text-slate-300">{agent.cancellations}</td>
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
