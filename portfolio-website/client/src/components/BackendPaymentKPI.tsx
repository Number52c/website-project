import { useMemo } from "react";
import { Calendar, DollarSign } from "lucide-react";

interface BackendPaymentKPIProps {
  premium: number;
  commissionPercent: number;
  effectiveDate: number; // UTC timestamp
  clientName: string;
}

export function BackendPaymentKPI({
  premium,
  commissionPercent,
  effectiveDate,
  clientName,
}: BackendPaymentKPIProps) {
  const payments = useMemo(() => {
    if (!effectiveDate || !premium || !commissionPercent) {
      return { month10: 0, month11: 0, month12: 0, advanceCommission: 0, totalCommission: 0 };
    }

    const effectiveDateObj = new Date(effectiveDate);
    const baseCommission = (premium * commissionPercent) / 100;
    
    // Advance commission (paid upfront on effective date)
    const advanceCommission = baseCommission * 0.25; // Typically 25% upfront

    // Backend payments: months 10, 11, 12 after effective date
    // Each month gets equal share of remaining commission
    const remainingCommission = baseCommission - advanceCommission;
    const monthlyPayment = remainingCommission / 3;

    return {
      month10: monthlyPayment,
      month11: monthlyPayment,
      month12: monthlyPayment,
      advanceCommission,
      totalCommission: baseCommission,
    };
  }, [premium, commissionPercent, effectiveDate]);

  const effectiveDateObj = new Date(effectiveDate);
  const month10Date = new Date(effectiveDateObj);
  month10Date.setMonth(month10Date.getMonth() + 10);
  const month11Date = new Date(effectiveDateObj);
  month11Date.setMonth(month11Date.getMonth() + 11);
  const month12Date = new Date(effectiveDateObj);
  month12Date.setMonth(month12Date.getMonth() + 12);

  return (
    <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-4 border border-white/10">
      <div className="mb-3">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Backend Payment Schedule</p>
        <p className="text-sm font-semibold text-white">{clientName}</p>
      </div>

      <div className="space-y-2">
        {/* Advance Commission */}
        <div className="bg-white/5 rounded-lg p-3 border border-emerald-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign size={14} className="text-emerald-400" />
              <span className="text-xs text-gray-300">Advance Commission</span>
            </div>
            <span className="font-bold text-emerald-400">
              ${payments.advanceCommission.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Paid on effective date</p>
        </div>

        {/* Month 10 */}
        <div className="bg-white/5 rounded-lg p-3 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-blue-400" />
              <span className="text-xs text-gray-300">Month 10 ({month10Date.toLocaleDateString()})</span>
            </div>
            <span className="font-bold text-blue-400">
              ${payments.month10.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Month 11 */}
        <div className="bg-white/5 rounded-lg p-3 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-purple-400" />
              <span className="text-xs text-gray-300">Month 11 ({month11Date.toLocaleDateString()})</span>
            </div>
            <span className="font-bold text-purple-400">
              ${payments.month11.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Month 12 */}
        <div className="bg-white/5 rounded-lg p-3 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-orange-400" />
              <span className="text-xs text-gray-300">Month 12 ({month12Date.toLocaleDateString()})</span>
            </div>
            <span className="font-bold text-orange-400">
              ${payments.month12.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Total */}
        <div className="bg-white/10 rounded-lg p-3 border border-white/20 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white uppercase">Total Commission</span>
            <span className="font-bold text-[#c9a84c] text-lg">
              ${payments.totalCommission.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
