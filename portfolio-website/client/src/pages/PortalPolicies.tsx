/**
 * client/src/pages/PortalPolicies.tsx
 * Stunning Policy Management — Interactive timelines, comparisons, and coverage analysis
 */

import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { Calendar, TrendingUp, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Clock, DollarSign, Heart, ChartBar as BarChart3, ChevronDown } from "lucide-react";

interface Policy {
  id: number;
  type: string;
  carrier: string;
  premium: string;
  coverageAmount: string;
  effectiveDate: number | null;
  renewalDate: number | null;
  status: string;
  carrierInfo?: any;
}

function formatDate(ts: number | null | undefined): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(val: string | number | null | undefined): string {
  if (val === null || val === undefined || val === "") return "—";
  const num = typeof val === "number" ? val : parseFloat(val);
  if (isNaN(num)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
}

// Animated Timeline Component
function PolicyTimeline({ policy }: { policy: Policy }) {
  const now = Date.now();
  const effectiveDate = policy.effectiveDate || 0;
  const renewalDate = policy.renewalDate || 0;
  const daysToRenewal = renewalDate ? Math.ceil((renewalDate - now) / (1000 * 60 * 60 * 24)) : 0;

  const isExpired = renewalDate && renewalDate < now;
  const isPending = daysToRenewal > 0 && daysToRenewal <= 30;
  const isActive = daysToRenewal > 30;

  return (
    <div className="space-y-4">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 h-full w-1 bg-gradient-to-b from-gold/50 to-gold/10" />

        {/* Effective Date */}
        <div className="relative flex gap-4 pb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gold bg-gold/10">
            <CheckCircle className="h-6 w-6 text-gold" />
          </div>
          <div className="flex-1 pt-2">
            <p className="text-xs font-medium text-gray-500">EFFECTIVE DATE</p>
            <p className="text-lg font-semibold text-white">{formatDate(effectiveDate)}</p>
          </div>
        </div>

        {/* Renewal Date */}
        <div className="relative flex gap-4 pb-6">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
            isExpired ? "border-red-500 bg-red-500/10" :
            isPending ? "border-amber-500 bg-amber-500/10" :
            "border-emerald-500 bg-emerald-500/10"
          }`}>
            <Calendar className={`h-6 w-6 ${
              isExpired ? "text-red-400" :
              isPending ? "text-amber-400" :
              "text-emerald-400"
            }`} />
          </div>
          <div className="flex-1 pt-2">
            <p className="text-xs font-medium text-gray-500">RENEWAL DATE</p>
            <p className="text-lg font-semibold text-white">{formatDate(renewalDate)}</p>
            {daysToRenewal > 0 && (
              <p className={`mt-1 text-sm ${
                isPending ? "text-amber-400" :
                isActive ? "text-emerald-400" :
                "text-gray-400"
              }`}>
                {daysToRenewal} days away
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Coverage Breakdown Component
function CoverageBreakdown({ policies }: { policies: Policy[] }) {
  const totalCoverage = policies.reduce((sum, p) => sum + (parseFloat(p.coverageAmount) || 0), 0);
  const policyTypes = Array.from(new Set(policies.map(p => p.type)));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Coverage Breakdown</h3>
      <div className="space-y-3">
        {policyTypes.map(type => {
          const typePolicies = policies.filter(p => p.type === type);
          const typeCoverage = typePolicies.reduce((sum, p) => sum + (parseFloat(p.coverageAmount) || 0), 0);
          const percentage = (typeCoverage / totalCoverage) * 100;

          return (
            <div key={type}>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-300">{type}</p>
                <p className="text-sm font-semibold text-gold">{formatCurrency(typeCoverage)}</p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-gold to-gold/50 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 rounded-lg border border-gold/30 bg-gold/5 p-4">
        <p className="text-xs text-gray-400">TOTAL COVERAGE</p>
        <p className="text-2xl font-bold text-white">{formatCurrency(totalCoverage)}</p>
      </div>
    </div>
  );
}

// Premium Payment Tracker
function PremiumTracker({ policies }: { policies: Policy[] }) {
  const monthlyTotal = policies.reduce((sum, p) => sum + (parseFloat(p.premium) || 0), 0);
  const yearlyTotal = monthlyTotal * 12;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Premium Payment Schedule</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-white/10 bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 p-4">
          <p className="text-xs text-gray-400">MONTHLY</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(monthlyTotal)}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-4">
          <p className="text-xs text-gray-400">ANNUALLY</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(yearlyTotal)}</p>
        </div>
      </div>
    </div>
  );
}

// Policy Comparison Component
function PolicyComparison({ policies }: { policies: Policy[] }) {
  const [selectedPolicies, setSelectedPolicies] = useState<number[]>(
    policies.slice(0, Math.min(2, policies.length)).map(p => p.id)
  );

  const comparingPolicies = policies.filter(p => selectedPolicies.includes(p.id));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Compare Policies</h3>

      {/* Policy Selection */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {policies.map(policy => (
          <button
            key={policy.id}
            onClick={() => {
              setSelectedPolicies(prev =>
                prev.includes(policy.id)
                  ? prev.filter(id => id !== policy.id)
                  : [...prev, policy.id]
              );
            }}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              selectedPolicies.includes(policy.id)
                ? "bg-gold text-navy"
                : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            {policy.type.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* Comparison Table */}
      {comparingPolicies.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">ATTRIBUTE</th>
                {comparingPolicies.map(policy => (
                  <th key={policy.id} className="px-4 py-3 text-left text-xs font-medium text-gold">
                    {policy.type}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10">
                <td className="px-4 py-3 text-gray-300">Carrier</td>
                {comparingPolicies.map(policy => (
                  <td key={policy.id} className="px-4 py-3 text-white">{policy.carrier}</td>
                ))}
              </tr>
              <tr className="border-b border-white/10">
                <td className="px-4 py-3 text-gray-300">Coverage Amount</td>
                {comparingPolicies.map(policy => (
                  <td key={policy.id} className="px-4 py-3 text-white">{formatCurrency(policy.coverageAmount)}</td>
                ))}
              </tr>
              <tr className="border-b border-white/10">
                <td className="px-4 py-3 text-gray-300">Monthly Premium</td>
                {comparingPolicies.map(policy => (
                  <td key={policy.id} className="px-4 py-3 text-white">{formatCurrency(policy.premium)}</td>
                ))}
              </tr>
              <tr className="border-b border-white/10">
                <td className="px-4 py-3 text-gray-300">Effective Date</td>
                {comparingPolicies.map(policy => (
                  <td key={policy.id} className="px-4 py-3 text-white">{formatDate(policy.effectiveDate)}</td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-300">Status</td>
                {comparingPolicies.map(policy => (
                  <td key={policy.id} className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                      policy.status === "active" ? "bg-emerald-500/20 text-emerald-400" :
                      policy.status === "pending" ? "bg-amber-500/20 text-amber-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                      {policy.status}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function PortalPolicies({ policies }: { policies: Policy[] }) {
  if (!policies || policies.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-gradient-to-br from-gray-900/40 to-gray-800/20 p-12 text-center">
        <Heart className="mx-auto h-12 w-12 text-gray-600 mb-4" />
        <h3 className="text-lg font-semibold text-white">No Policies to Analyze</h3>
        <p className="mt-2 text-gray-400">Your policies will appear here once added by your agent.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Individual Policy Timelines */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Policy Timeline</h2>
        {policies.map(policy => (
          <div key={policy.id} className="rounded-xl border border-white/10 bg-gradient-to-br from-gray-900/40 to-gray-800/20 p-6 backdrop-blur-sm">
            <h3 className="mb-4 text-lg font-semibold text-white">{policy.type}</h3>
            <PolicyTimeline policy={policy} />
          </div>
        ))}
      </div>

      {/* Coverage Breakdown */}
      <div className="rounded-xl border border-white/10 bg-gradient-to-br from-gray-900/40 to-gray-800/20 p-6 backdrop-blur-sm">
        <CoverageBreakdown policies={policies} />
      </div>

      {/* Premium Tracker */}
      <div className="rounded-xl border border-white/10 bg-gradient-to-br from-gray-900/40 to-gray-800/20 p-6 backdrop-blur-sm">
        <PremiumTracker policies={policies} />
      </div>

      {/* Policy Comparison */}
      {policies.length > 1 && (
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-gray-900/40 to-gray-800/20 p-6 backdrop-blur-sm">
          <PolicyComparison policies={policies} />
        </div>
      )}
    </div>
  );
}
