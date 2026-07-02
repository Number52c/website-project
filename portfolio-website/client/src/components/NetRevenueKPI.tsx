import { trpc } from "@/lib/trpc";

interface NetRevenueKPIProps {
  totalCommission: number;
  month: number;
  year: number;
}

export function NetRevenueKPI({ totalCommission, month, year }: NetRevenueKPIProps) {
  const { data: totalExpenses = 0 } = trpc.admin.getTotalExpensesByMonth.useQuery({
    month,
    year,
  });

  const netRevenue = totalCommission - totalExpenses;

  return (
    <div className={`${
      netRevenue >= 0
        ? "bg-blue-500/10 border border-blue-500/30"
        : "bg-orange-500/10 border border-orange-500/30"
    } rounded-xl p-5`}>
      <p className={`text-xs ${
        netRevenue >= 0 ? "text-blue-400" : "text-orange-400"
      } uppercase tracking-wider mb-1`}>
        Net Revenue (Commission - Expenses)
      </p>
      <p className={`text-2xl font-bold ${
        netRevenue >= 0 ? "text-blue-400" : "text-orange-400"
      }`}>
        $
        {Math.abs(netRevenue).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>
      <p className={`text-xs ${
        netRevenue >= 0 ? "text-blue-400/60" : "text-orange-400/60"
      } mt-1`}>
        {netRevenue < 0 ? "Expenses exceed commission" : "After expenses"}
      </p>
    </div>
  );
}
