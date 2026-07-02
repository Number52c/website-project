import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Users, Percent, CircleAlert as AlertCircle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc";

/**
 * Agent Revenue Dashboard
 * Shows monthly revenue, YTD revenue, active book, persistence rate, expenses, and net commission.
 * All data is live from tRPC — no hardcoded mock values.
 */
export function AgentRevenueDashboard() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const { data: persistenceData, isLoading: persistenceLoading } = trpc.agent.myPersistence.useQuery();
  const { data: revenueData, isLoading: revenueLoading } = trpc.agent.myRevenue.useQuery({
    year: currentYear,
    month: currentMonth,
  });

  const isLoading = persistenceLoading || revenueLoading;

  // Live data — null/0 defaults until loaded
  const monthlyRevenue = revenueData?.totalCommission ?? 0;
  const ytdRevenue = revenueData?.ytdCommission ?? 0;
  const activeBookAP = revenueData?.activeBookAP ?? 0;
  // persistenceRate is null when no Jan 1 starting block exists (2026 N/A)
  const persistenceRate: number | null = persistenceData?.persistenceRate ?? null;
  const startingBlock = persistenceData?.startingBlock ?? 0;
  const stillActive = persistenceData?.stillActive ?? 0;
  const expenses = revenueData?.totalExpenses ?? 0;
  const netCommission = revenueData?.netRevenue ?? 0;

  const getPersistenceColor = (rate: number) => {
    if (rate >= 90) return "bg-emerald-500/10 text-emerald-700 border-emerald-200";
    if (rate >= 80) return "bg-amber-500/10 text-amber-700 border-amber-200";
    return "bg-red-500/10 text-red-700 border-red-200";
  };

  const getPersistenceBadgeColor = (rate: number) => {
    if (rate >= 90) return "bg-emerald-500 text-white";
    if (rate >= 80) return "bg-amber-500 text-white";
    return "bg-red-500 text-white";
  };

  const getPersistenceLabel = (rate: number) => {
    if (rate >= 90) return "Excellent";
    if (rate >= 80) return "Good";
    return "Needs Attention";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Your Revenue Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor your book of business performance and earnings
        </p>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Monthly Revenue */}
        <Card className="border-border bg-card hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              ${monthlyRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              This month's earnings
            </p>
          </CardContent>
        </Card>

        {/* YTD Revenue */}
        <Card className="border-border bg-card hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">YTD Revenue</CardTitle>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              ${ytdRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Year-to-date total
            </p>
          </CardContent>
        </Card>

        {/* Active Book AP */}
        <Card className="border-border bg-card hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Book AP</CardTitle>
              <Users className="w-4 h-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              ${activeBookAP.toLocaleString("en-US", { minimumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-purple-600 mt-2">
              Annual premium on books
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Persistence Rate - Color Coded */}
      <Card className={`border-2 ${persistenceRate !== null ? getPersistenceColor(persistenceRate) : 'border-border bg-card'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Persistence Rate (Year)</CardTitle>
              <CardDescription>Life policies retention performance</CardDescription>
            </div>
            <Percent className="w-5 h-5" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {persistenceRate === null ? (
            <div className="space-y-2">
              <div className="text-5xl font-bold text-muted-foreground">N/A</div>
              <p className="text-sm text-muted-foreground">
                No Jan 1 starting block on record. Persistence rate will be calculated starting Jan 1, {currentYear + 1}.
              </p>
              <p className="text-xs text-muted-foreground">
                2026 sales count toward production, AP, commissions, and active policy count — but not toward 2026 persistence.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="text-5xl font-bold text-foreground">{persistenceRate.toFixed(1)}%</div>
                <Badge className={getPersistenceBadgeColor(persistenceRate)}>
                  {getPersistenceLabel(persistenceRate)}
                </Badge>
              </div>

              {/* Starting block detail */}
              <div className="text-xs text-muted-foreground">
                {stillActive} still active / {startingBlock} Jan 1 starting block
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      persistenceRate >= 90
                        ? "bg-emerald-500"
                        : persistenceRate >= 80
                          ? "bg-amber-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(persistenceRate, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>Target: 75%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Insights */}
              <div className="pt-2 border-t border-border">
                {persistenceRate >= 90 && (
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">
                    ✓ Excellent persistence! You're writing clean business that sticks on the books.
                  </p>
                )}
                {persistenceRate >= 80 && persistenceRate < 90 && (
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Good persistence rate. Continue monitoring your book to maintain quality.
                  </p>
                )}
                {persistenceRate < 80 && (
                  <p className="text-sm text-red-700 dark:text-red-400">
                    Below target. Review your sales practices to improve retention.
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Secondary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Expenses */}
        <Card className="border-border bg-card hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              -${expenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Deducted from revenue
            </p>
          </CardContent>
        </Card>

        {/* Net Commission */}
        <Card className="border-border bg-card border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-emerald-700">Net Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700">
              ${netCommission.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-emerald-600 mt-2">
              Revenue minus expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Insights & Tips */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
            <div>
              <p className="font-semibold text-sm text-foreground">Track Your Persistence</p>
              <p className="text-xs text-muted-foreground">
                Persistence rate is calculated on life policies only. Annuities don't count toward persistence because they stay on the books longer.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2"></div>
            <div>
              <p className="font-semibold text-sm text-foreground">Maintain Quality</p>
              <p className="text-xs text-muted-foreground">
                Aim for 75% or above persistence rate. This indicates you're writing clean business that clients keep.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-500 mt-2"></div>
            <div>
              <p className="font-semibold text-sm text-foreground">Monitor Cancellations</p>
              <p className="text-xs text-muted-foreground">
                If you see cancellations trending up, analyze what might be causing them and adjust your approach.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
