import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ChartBar as BarChart3, Users, TrendingUp } from "lucide-react";

export default function DashboardPortal() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Ortiz Insurance</h1>
          <p className="text-slate-400 mt-1">Dashboard Portal</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold mb-4">Access Your Dashboard</h2>
            <p className="text-slate-300 text-lg">
              Select the dashboard you want to access
            </p>
          </div>

          {/* Dashboard Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Ortiz Dashboard Card */}
            <Card className="bg-slate-800 border-slate-700 hover:border-yellow-500 transition-colors cursor-pointer group">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-yellow-500/20 rounded-lg group-hover:bg-yellow-500/30 transition-colors">
                    <TrendingUp className="w-6 h-6 text-yellow-500" />
                  </div>
                  <CardTitle className="text-white">Ortiz Dashboard</CardTitle>
                </div>
                <CardDescription className="text-slate-400">
                  Owner metrics and agent performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-300 text-sm">
                  Monitor your book of business, track agent persistence rates, and view policy management metrics.
                </p>
                <Button
                  onClick={() => navigate("/admin/ortiz")}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold"
                  size="lg"
                >
                  Access Dashboard
                </Button>
                <p className="text-xs text-slate-500 text-center">
                  PIN Required
                </p>
              </CardContent>
            </Card>

            {/* Agent Metrics Card */}
            <Card className="bg-slate-800 border-slate-700 hover:border-green-500 transition-colors cursor-pointer group">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                    <BarChart3 className="w-6 h-6 text-green-500" />
                  </div>
                  <CardTitle className="text-white">Agent Metrics</CardTitle>
                </div>
                <CardDescription className="text-slate-400">
                  Personal revenue and performance tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-300 text-sm">
                  View your monthly revenue, YTD totals, persistence rate, and commission metrics in real-time.
                </p>
                <Button
                  onClick={() => navigate("/agent/metrics")}
                  className="w-full bg-green-500 hover:bg-green-600 text-slate-900 font-semibold"
                  size="lg"
                >
                  View Metrics
                </Button>
                <p className="text-xs text-slate-500 text-center">
                  No login required
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Info */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Quick Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400 mb-1">Owner/Admin Portal</p>
                  <p className="text-slate-300 font-mono text-xs bg-slate-900 p-2 rounded">
                    /admin/ortiz
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1">Agent Metrics</p>
                  <p className="text-slate-300 font-mono text-xs bg-slate-900 p-2 rounded">
                    /agent/metrics
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
