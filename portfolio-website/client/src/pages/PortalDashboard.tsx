/**
 * client/src/pages/PortalDashboard.tsx
 * WORLD-CLASS Client Portal Dashboard — Premium Design & Animations
 * Uses PIN-based session (portal.me) instead of OAuth.
 */

import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link, useLocation } from "wouter";
import { Shield, FileText, Calendar, DollarSign, ChevronRight, LogOut, Loader as Loader2, Phone, Star, TrendingUp, Award, ExternalLink, Zap, Heart, CircleCheck as CheckCircle, Clock, CircleAlert as AlertCircle, ChartBar as BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import PortalPolicies from "./PortalPolicies";
import { AnnualReviewSchedulingModal } from "@/components/AnnualReviewSchedulingModal";
import { DocumentsSection } from "@/components/DocumentsSection";
import { PaymentsSection } from "@/components/PaymentsSection";
import { Button } from "@/components/ui/button";

// Carrier data type
interface CarrierInfo {
  phone: string;
  portalUrl?: string;
}

// Fallback carrier data map
const CARRIER_DATA_FALLBACK: Record<string, CarrierInfo> = {
  "Transamerica": { phone: "1-800-523-7900", portalUrl: "https://www.transamerica.com/individual/insurance/your-life-insurance-policy" },
  "Mutual Of Omaha": { phone: "1-800-775-6000", portalUrl: "https://www.mutualofomaha.com/welcome/customer-access" },
  "Mutual of Omaha": { phone: "1-800-775-6000", portalUrl: "https://www.mutualofomaha.com/welcome/customer-access" },
  "Americo": { phone: "1-816-641-2850", portalUrl: "https://www.americocustomer.com/" },
  "Athene": { phone: "1-888-266-8489", portalUrl: "https://www.athene.com/signup" },
  "American Equity": { phone: "1-888-221-1234", portalUrl: "https://myportal.american-equity.com/" },
  "Corebridge": { phone: "1-800-424-4990", portalUrl: "https://www.corebridgefinancial.com/rs/login" },
  "Aetna": { phone: "1-888-792-3862", portalUrl: "https://www.aetna.com/individuals-families/member-rights-resources/member-portal.html" },
  "CICA": { phone: "1-800-880-5044", portalUrl: "https://cicaamerica.citizensinc.com/" },
  "Cica": { phone: "1-800-880-5044", portalUrl: "https://cicaamerica.citizensinc.com/" },
  "LCBA": { phone: "1-800-234-5222", portalUrl: "https://www.lcbalife.org/" },
  "Elco": { phone: "1-800-321-3526", portalUrl: "https://www.elcomutual.com/" },
  "Elco Mutual": { phone: "1-800-321-3526", portalUrl: "https://www.elcomutual.com/" },
  "Catholic Financial": { phone: "1-877-426-6540", portalUrl: "https://www.catholicfinanciallife.org/members/login" },
  "Catholic": { phone: "1-877-426-6540", portalUrl: "https://www.catholicfinanciallife.org/members/login" },
  "Instabrain": { phone: "1-800-806-9714", portalUrl: "" },
};

function normalizeCarrierInfo(val: string | CarrierInfo | undefined): CarrierInfo | undefined {
  if (!val) return undefined;
  if (typeof val === "string") return { phone: val };
  return val;
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  expired: "bg-red-500/20 text-red-400 border-red-500/30",
  cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const typeGradients: Record<string, string> = {
  "Term Life Insurance": "from-blue-900/40 to-blue-800/20",
  "Whole Life Insurance": "from-indigo-900/40 to-indigo-800/20",
  "Whole Life Final Expense": "from-purple-900/40 to-purple-800/20",
  "Graded Whole Life": "from-violet-900/40 to-violet-800/20",
  "Final Expense": "from-purple-900/40 to-purple-800/20",
  "FIA": "from-emerald-900/40 to-emerald-800/20",
  "MYGA": "from-teal-900/40 to-teal-800/20",
  "Auto Insurance": "from-sky-900/40 to-sky-800/20",
  "Home Insurance": "from-orange-900/40 to-orange-800/20",
  "Health Insurance": "from-rose-900/40 to-rose-800/20",
};

const typeIcons: Record<string, string> = {
  "Term Life Insurance": "🛡️",
  "Whole Life Insurance": "💎",
  "Whole Life Final Expense": "🌿",
  "Graded Whole Life": "🌿",
  "Final Expense": "🌿",
  "FIA": "📈",
  "MYGA": "📊",
  "Auto Insurance": "🚗",
  "Home Insurance": "🏠",
  "Health Insurance": "🏥",
};

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

// Animated Counter Component
function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      setDisplayValue(Math.floor(value * progress));
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{displayValue}</span>;
}

// Premium KPI Card Component
function PremiumKPICard({
  icon: Icon,
  title,
  value,
  subtitle,
  gradient,
  animated = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  subtitle?: string;
  gradient: string;
  animated?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${gradient} p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-white/5 hover:-translate-y-1`}>
      {/* Animated background glow */}
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <Icon className="h-5 w-5 text-gold" />
            <p className="text-sm font-medium text-gray-400">{title}</p>
          </div>
          <p className="text-3xl font-bold text-white">
            {animated && typeof value === "number" ? (
              <AnimatedCounter value={value} />
            ) : (
              value
            )}
          </p>
          {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

// Premium Policy Card Component
function PremiumPolicyCard({ policy, ownerName }: { policy: any; ownerName?: string }) {
  const carrier = normalizeCarrierInfo(policy.carrierInfo);
  const gradient = typeGradients[policy.type] || "from-gray-900/40 to-gray-800/20";
  const icon = typeIcons[policy.type] || "📋";

  return (
    <div className={`group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${gradient} p-6 backdrop-blur-sm transition-all duration-300 hover:border-gold/50 hover:shadow-lg hover:shadow-gold/10 hover:-translate-y-1`}>
      {/* Animated gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold/0 to-gold/0 opacity-0 transition-all duration-300 group-hover:from-gold/5 group-hover:to-gold/0" />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <span className="text-3xl">{icon}</span>
            <div>
              <h3 className="font-semibold text-white">{policy.type}</h3>
              <p className="text-sm text-gray-400">{policy.carrier}</p>
              {ownerName && <p className="text-xs text-gold mt-1">Owner: {ownerName}</p>}
            </div>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusColors[policy.status] || statusColors.active}`}>
            {policy.status?.charAt(0).toUpperCase() + policy.status?.slice(1)}
          </span>
        </div>

        {/* Details Grid */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Coverage Amount</p>
            <p className="font-semibold text-white">{formatCurrency(policy.coverageAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Effective Date</p>
            <p className="font-semibold text-white">{formatDate(policy.effectiveDate)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {carrier?.portalUrl && (
            <a
              href={carrier.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-lg bg-gold/20 px-3 py-2 text-center text-xs font-medium text-gold transition-all duration-200 hover:bg-gold/30 hover:text-gold"
            >
              View at Carrier <ExternalLink className="ml-1 inline h-3 w-3" />
            </a>
          )}
          {carrier?.phone && (
            <a
              href={`tel:${carrier.phone}`}
              className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-center text-xs font-medium text-white transition-all duration-200 hover:bg-white/20"
            >
              Call <Phone className="ml-1 inline h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PortalDashboard() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"dashboard" | "analysis">("dashboard");
  const [showSchedulingModal, setShowSchedulingModal] = useState(false);
  const { data: me, isLoading: meLoading } = trpc.portal.me.useQuery();
  const { data: policies, isLoading: policiesLoading } = trpc.portal.myPolicies.useQuery();
  const { data: annuities, isLoading: annuitiesLoading } = trpc.portal.myAnnuities.useQuery();
  const { data: householdMembers, isLoading: membersLoading } = trpc.portal.householdMembers.useQuery();
  const logoutMutation = trpc.portal.logout.useMutation({
    onSuccess: () => { window.location.href = "/"; },
  });

  if (meLoading || policiesLoading || annuitiesLoading || membersLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-navy to-navy-dark">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!me) {
    navigate("/portal/login");
    return null;
  }

  const totalPolicies = (policies?.length || 0) + (annuities?.length || 0);
  const activePolicies = (policies?.filter((p: any) => p.status === "active").length || 0) + (annuities?.filter((a: any) => a.status === "active").length || 0);
  const totalMonthlyPremium = policies?.reduce((sum: number, p: any) => sum + (parseFloat(p.premiumAmount) || 0), 0) || 0;
  const totalCoverage = policies?.reduce((sum: number, p: any) => sum + (parseFloat(p.coverageAmount) || 0), 0) || 0;
  const totalAnnuityPremium = annuities?.reduce((sum: number, a: any) => sum + (parseFloat(a.premium) || 0), 0) || 0;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-navy via-navy-dark to-navy-darker">
      <Navbar />

      {/* Hero Section with Animated Gradient */}
      <div className="relative overflow-hidden border-b border-white/5 bg-gradient-to-r from-navy-dark via-navy to-navy-dark px-4 py-12 sm:px-6 lg:px-8">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-gold/5 blur-3xl" />
          <div className="absolute -left-32 -bottom-32 h-64 w-64 rounded-full bg-gold/5 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {householdMembers && householdMembers.length > 1 && (
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gold/10 border border-gold/30 px-4 py-2">
              <span className="text-xs font-medium text-gold">👥 Household:</span>
              <span className="text-xs text-gold/80">{householdMembers.map((m: any) => `${m.firstName} ${m.lastName}`).join(', ')}</span>
            </div>
          )}
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-gold">CLIENT PORTAL</p>
              <h1 className="mt-2 text-4xl font-bold text-white">
                Welcome back, <span className="text-gold">{me.firstName || "Client"}</span>
              </h1>
              <p className="mt-2 text-gray-400">Your complete insurance portfolio — managed with care</p>
            </div>
            <button
              onClick={() => logoutMutation.mutate()}
              className="flex items-center gap-2 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 transition-all duration-200 hover:bg-red-500/30"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>

          {/* Premium KPI Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <PremiumKPICard
              icon={Shield}
              title="Total Policies"
              value={totalPolicies}
              subtitle={`${activePolicies} active`}
              gradient="from-blue-900/40 to-blue-800/20"
              animated
            />
            <PremiumKPICard
              icon={DollarSign}
              title="Monthly Premium"
              value={formatCurrency(totalMonthlyPremium)}
              subtitle="estimated per month"
              gradient="from-emerald-900/40 to-emerald-800/20"
            />
            <PremiumKPICard
              icon={Heart}
              title="Total Coverage"
              value={formatCurrency(totalCoverage)}
              subtitle="face amount across policies"
              gradient="from-rose-900/40 to-rose-800/20"
            />
            <PremiumKPICard
              icon={TrendingUp}
              title="Portfolio Value"
              value={`${activePolicies}/${totalPolicies}`}
              subtitle="policies in force"
              gradient="from-purple-900/40 to-purple-800/20"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="mb-8 flex gap-4 border-b border-white/10">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`pb-4 px-4 font-medium transition-colors ${
                activeTab === "dashboard"
                  ? "border-b-2 border-gold text-gold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Dashboard
            </button>
            {policies && policies.length > 0 && (
              <button
                onClick={() => setActiveTab("analysis")}
                className={`pb-4 px-4 font-medium transition-colors ${
                  activeTab === "analysis"
                    ? "border-b-2 border-gold text-gold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Policy Analysis
              </button>
            )}
          </div>
          {activeTab === "dashboard" && (
            <>
              {/* Annual Review Notification */}
              <div className="mb-8 rounded-xl border border-gold/30 bg-gradient-to-r from-gold/10 to-gold/5 p-6 backdrop-blur-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-gold/20 p-3 flex-shrink-0">
                      <Calendar className="h-6 w-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Your Annual Review is Coming Up!</h3>
                      <p className="mt-1 text-sm text-gray-300">Let's make sure your coverage is still the right fit for your life. Schedule your annual review today.</p>
                    </div>
                  </div>
                  <button onClick={() => setShowSchedulingModal(true)} className="rounded-lg bg-gold/20 px-4 py-2 text-sm font-medium text-gold transition-all duration-200 hover:bg-gold/30 whitespace-nowrap flex-shrink-0">
                    Schedule Review
                  </button>
                </div>
              </div>

              {/* Section Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white">Your Portfolio</h2>
                <p className="mt-2 text-gray-400">Click any policy or annuity to view full details and carrier contact information</p>
              </div>

          {/* Combined Policies & Annuities Grid */}
          {((policies && policies.length > 0) || (annuities && annuities.length > 0)) ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {policies?.map((policy: any) => {
                // Find the owner name from household members
                const owner = householdMembers?.find((m: any) => m.id === policy.clientId);
                const ownerName = owner ? `${owner.firstName} ${owner.lastName}` : undefined;
                return (
                  <PremiumPolicyCard key={`policy-${policy.id}`} policy={policy} ownerName={ownerName} />
                );
              })}
              {annuities?.map((annuity: any) => {
                // Find the owner name from household members
                const owner = householdMembers?.find((m: any) => m.id === annuity.clientId);
                const ownerName = owner ? `${owner.firstName} ${owner.lastName}` : undefined;
                return (
                  <PremiumPolicyCard key={`annuity-${annuity.id}`} policy={{
                    id: annuity.id,
                    type: annuity.type,
                    carrier: annuity.carrier,
                    status: annuity.status,
                    coverageAmount: annuity.premium,
                    effectiveDate: annuity.effectiveDate,
                    premium: annuity.premium,
                    carrierInfo: annuity.carrier
                  }} ownerName={ownerName} />
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-gray-900/40 to-gray-800/20 p-12 text-center backdrop-blur-sm">
              <FileText className="mx-auto h-12 w-12 text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-white">No Policies or Annuities Yet</h3>
              <p className="mt-2 text-gray-400">Your insurance policies and annuities will appear here once they have been added by your agent. Please contact us if you believe this is an error.</p>
              <a href="tel:3616138336" className="mt-4 inline-block rounded-lg bg-gold/20 px-6 py-2 text-gold hover:bg-gold/30 transition-colors">
                Call Us
              </a>
            </div>
          )}

              {/* Trust Section */}
              <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-gray-900/40 to-gray-800/20 p-6 backdrop-blur-sm">
                  <Award className="h-8 w-8 text-gold mb-3" />
                  <h3 className="font-semibold text-white">Licensed & Trusted</h3>
                  <p className="mt-2 text-sm text-gray-400">Licensed in 50+ states and dedicated to serving families across Texas with integrity.</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-gray-900/40 to-gray-800/20 p-6 backdrop-blur-sm">
                  <Shield className="h-8 w-8 text-gold mb-3" />
                  <h3 className="font-semibold text-white">Your Coverage, Secured</h3>
                  <p className="mt-2 text-sm text-gray-400">We review your policies annually to ensure your coverage grows with your needs.</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-gray-900/40 to-gray-800/20 p-6 backdrop-blur-sm">
                  <Heart className="h-8 w-8 text-gold mb-3" />
                  <h3 className="font-semibold text-white">Personalized Service</h3>
                  <p className="mt-2 text-sm text-gray-400">One dedicated agent who knows your family and your goals — not a call center.</p>
                </div>
              </div>

              {/* CTA Section */}
              <div className="mt-12 rounded-xl border border-gold/30 bg-gradient-to-r from-gold/10 to-gold/5 p-8 text-center">
                <h3 className="text-2xl font-bold text-white">Need to Update Your Coverage?</h3>
                <p className="mt-2 text-gray-400">Our team is here to help you review, update, or expand your protection.</p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <a href="/quote" className="rounded-lg bg-gold px-6 py-3 font-semibold text-navy transition-all duration-200 hover:bg-gold/90 hover:shadow-lg hover:shadow-gold/20">
                    Request a Quote
                  </a>
                  <a href="tel:3616138336" className="rounded-lg border border-gold/50 px-6 py-3 font-semibold text-gold transition-all duration-200 hover:bg-gold/10">
                    Call Us
                  </a>
                </div>
              </div>
            </>
          )}
          {activeTab === "analysis" && (
            <>
              {/* Policy Analysis Section */}
              <div className="space-y-8">
                {/* Coverage Breakdown */}
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-gray-900/40 to-gray-800/20 p-6 backdrop-blur-sm">
                  <h3 className="text-xl font-bold text-white mb-6">Coverage Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-400 mb-2">By Type</p>
                      <div className="space-y-3">
                        {policies?.map((p: any) => (
                          <div key={p.id} className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">{p.type}</span>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-24 rounded-full bg-gray-700">
                                <div className="h-full rounded-full bg-gold" style={{width: `${Math.min(100, (parseFloat(p.coverageAmount) / 1000000) * 100)}%`}}></div>
                              </div>
                              <span className="text-xs text-gold font-semibold">{formatCurrency(p.coverageAmount)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Premium Distribution</p>
                      <div className="space-y-3">
                        {policies?.map((p: any) => (
                          <div key={p.id} className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">{p.carrier}</span>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-24 rounded-full bg-gray-700">
                                <div className="h-full rounded-full bg-green-500" style={{width: `${Math.min(100, (parseFloat(p.premiumAmount) / 500) * 100)}%`}}></div>
                              </div>
                              <span className="text-xs text-green-400 font-semibold">{formatCurrency(p.premiumAmount)}/mo</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-xl border border-white/10 bg-gradient-to-br from-blue-900/20 to-blue-800/10 p-6 backdrop-blur-sm">
                    <p className="text-sm text-gray-400">Total Annual Premium</p>
                    <p className="mt-2 text-3xl font-bold text-white">{formatCurrency(totalMonthlyPremium * 12)}</p>
                    <p className="mt-1 text-xs text-gray-500">Across {policies?.length || 0} policies</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-gradient-to-br from-purple-900/20 to-purple-800/10 p-6 backdrop-blur-sm">
                    <p className="text-sm text-gray-400">Total Coverage</p>
                    <p className="mt-2 text-3xl font-bold text-white">{formatCurrency(totalCoverage)}</p>
                    <p className="mt-1 text-xs text-gray-500">Face amount protection</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-gradient-to-br from-green-900/20 to-green-800/10 p-6 backdrop-blur-sm">
                    <p className="text-sm text-gray-400">Annuity Premium</p>
                    <p className="mt-2 text-3xl font-bold text-white">{formatCurrency(totalAnnuityPremium)}</p>
                    <p className="mt-1 text-xs text-gray-500">Retirement savings</p>
                  </div>
                </div>

                {/* Policy Details Table - Life Insurance */}
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-gray-900/40 to-gray-800/20 p-6 backdrop-blur-sm">
                  <h3 className="text-xl font-bold text-white mb-6">Life Insurance Details</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Carrier</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Owner</th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">Premium</th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">Coverage</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Payment Method</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Draft Date</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Beneficiary</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Riders</th>
                          <th className="text-center py-3 px-4 text-gray-400 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {policies?.map((p: any) => {
                          const owner = householdMembers?.find((m: any) => m.id === p.clientId);
                          const paymentDisplay = p.paymentMethod ? `${p.paymentMethod.replace(/_/g, ' ')} ****${p.paymentMethodLast4 || ''}` : '—';
                          return (
                            <>
                              <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="py-3 px-4 text-white">{p.type}</td>
                                <td className="py-3 px-4 text-gray-300">{p.carrier}</td>
                                <td className="py-3 px-4 text-gray-300">{owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown'}</td>
                                <td className="py-3 px-4 text-right text-green-400">{formatCurrency(p.premiumAmount)}/mo</td>
                                <td className="py-3 px-4 text-right text-gold">{formatCurrency(p.coverageAmount)}</td>
                                <td className="py-3 px-4 text-gray-300 text-xs">{paymentDisplay}</td>
                                <td className="py-3 px-4 text-gray-300">{p.draftDate ? `${p.draftDate}th` : '—'}</td>
                                <td className="py-3 px-4 text-gray-300 text-xs">{p.beneficiaries || '—'}</td>
                                <td className="py-3 px-4 text-blue-300 text-xs font-semibold">{p.riders ? '✓ Yes' : '—'}</td>
                                <td className="py-3 px-4 text-center"><span className="inline-block px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">Active</span></td>
                              </tr>
                              {(p.riders || p.notes) && (
                                <tr className="border-b border-white/5 bg-gray-800/30">
                                  <td colSpan={10} className="py-4 px-4">
                                    <div className="space-y-3">
                                      {p.riders && (
                                        <div>
                                          <h4 className="text-blue-300 font-semibold text-sm mb-1">📋 Policy Riders:</h4>
                                          <p className="text-gray-300 text-xs leading-relaxed">{p.riders}</p>
                                        </div>
                                      )}
                                      {p.notes && (
                                        <div>
                                          <h4 className="text-amber-300 font-semibold text-sm mb-1">📝 Notes:</h4>
                                          <p className="text-gray-300 text-xs leading-relaxed">{p.notes}</p>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Annuity Details Table */}
                {annuities && annuities.length > 0 && (
                  <div className="rounded-xl border border-white/10 bg-gradient-to-br from-emerald-900/20 to-teal-900/10 p-6 backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-white mb-6">Annuity Details</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Carrier</th>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Owner</th>
                            <th className="text-right py-3 px-4 text-gray-400 font-medium">Premium</th>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Term</th>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Beneficiary</th>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Rolled Over From</th>
                            <th className="text-center py-3 px-4 text-gray-400 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {annuities.map((a: any) => {
                            const owner = householdMembers?.find((m: any) => m.id === a.clientId);
                            return (
                              <tr key={a.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="py-3 px-4 text-white">{a.type}</td>
                                <td className="py-3 px-4 text-gray-300">{a.carrier}</td>
                                <td className="py-3 px-4 text-gray-300">{owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown'}</td>
                                <td className="py-3 px-4 text-right text-emerald-400">{formatCurrency(a.premium)}</td>
                                <td className="py-3 px-4 text-gray-300">{a.termYears ? `${a.termYears} years` : '—'}</td>
                                <td className="py-3 px-4 text-gray-300 text-xs">{a.beneficiary || '—'}</td>
                                <td className="py-3 px-4 text-gray-300 text-xs">{a.rolledOverFrom || '—'}</td>
                                <td className="py-3 px-4 text-center"><span className="inline-block px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">Active</span></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          {activeTab === "documents" && (
            <DocumentsSection className="w-full" />
          )}
          {activeTab === "payments" && (
            <PaymentsSection className="w-full" />
          )}
        </div>
      </div>

      <AnnualReviewSchedulingModal
        isOpen={showSchedulingModal}
        onClose={() => setShowSchedulingModal(false)}
        clientName={me?.firstName || "Client"}
      />

      <Footer />
    </div>
  );
}
