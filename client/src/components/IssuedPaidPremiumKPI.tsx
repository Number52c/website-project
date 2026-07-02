import { DollarSign, CircleCheck as CheckCircle } from "lucide-react";

interface IssuedPaidPremiumKPIProps {
  issuedPaidPremium: number;
  totalPremium: number;
}

export function IssuedPaidPremiumKPI({
  issuedPaidPremium,
  totalPremium,
}: IssuedPaidPremiumKPIProps) {
  const paidPercentage = totalPremium > 0 ? (issuedPaidPremium / totalPremium) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 rounded-xl p-6 border border-emerald-500/30">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-emerald-300 uppercase tracking-wider mb-1">Issued Paid Premium</p>
          <p className="text-3xl font-bold text-emerald-400">
            ${issuedPaidPremium.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <CheckCircle size={28} className="text-emerald-400" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-300">Total Premium Entered</span>
          <span className="text-gray-400">
            ${totalPremium.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>
        
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full transition-all duration-300"
            style={{ width: `${Math.min(paidPercentage, 100)}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Payment Status</span>
          <span className="text-emerald-400 font-semibold">{paidPercentage.toFixed(1)}% Paid</span>
        </div>
      </div>
    </div>
  );
}
