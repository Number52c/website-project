/**
 * client/src/pages/PortalPolicyDetail.tsx
 * Policy detail view for the client portal — premium redesign.
 * Uses PIN-based session (portal.me) instead of OAuth.
 */

import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link, useParams, useLocation } from "wouter";
import { ArrowLeft, Shield, Calendar, DollarSign, Building2, FileText, Loader as Loader2, CircleAlert as AlertCircle, Phone, ExternalLink, CircleCheck as CheckCircle, User, Hash, Globe } from "lucide-react";
import { useEffect } from "react";

// Carrier data type (matches AdminDashboard CarrierInfo)
interface CarrierInfo {
  phone: string;
  portalUrl?: string;
}

// Fallback carrier data map (used if admin hasn't saved a custom list)
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

/** Normalize a carrier value from the server (may be string or CarrierInfo object) */
function normalizeCarrierInfo(val: string | CarrierInfo | undefined): CarrierInfo | undefined {
  if (!val) return undefined;
  if (typeof val === "string") return { phone: val };
  return val;
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  active: { label: "Active", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", dot: "bg-emerald-400" },
  pending: { label: "Pending", color: "bg-amber-500/15 text-amber-400 border-amber-500/30", dot: "bg-amber-400" },
  expired: { label: "Expired", color: "bg-red-500/15 text-red-400 border-red-500/30", dot: "bg-red-400" },
  cancelled: { label: "Cancelled", color: "bg-gray-500/15 text-gray-400 border-gray-500/30", dot: "bg-gray-400" },
};

function formatDate(ts: number | null | undefined): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatCurrency(val: string | null | undefined): string {
  if (!val) return "—";
  const num = parseFloat(val);
  if (isNaN(num)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
}

export default function PortalPolicyDetail() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const policyId = parseInt(params.id || "0", 10);

  const meQuery = trpc.portal.me.useQuery(undefined, { retry: false });

  useEffect(() => {
    if (!meQuery.isLoading && !meQuery.data) {
      setLocation("/portal/login");
    }
  }, [meQuery.isLoading, meQuery.data, setLocation]);

  const policyQuery = trpc.portal.policyDetail.useQuery(
    { policyId },
    { enabled: !!meQuery.data && policyId > 0, retry: false }
  );

  // Fetch admin-saved carrier data (falls back to hardcoded map)
  const { data: adminCarrierData } = trpc.portal.carrierPhones.useQuery();

  const policy = policyQuery.data;
  const isLoading = meQuery.isLoading || policyQuery.isLoading;

  if (!meQuery.data && !meQuery.isLoading) return null;

  const status = policy ? (statusConfig[policy.status] || statusConfig.active) : statusConfig.active;

  // Normalize carrier data from server (may be old string format or new object format)
  const carrierInfo: CarrierInfo | undefined = policy
    ? normalizeCarrierInfo(adminCarrierData?.[policy.carrier]) ?? CARRIER_DATA_FALLBACK[policy.carrier]
    : undefined;

  const carrierPhone = carrierInfo?.phone;
  const carrierPortalUrl = carrierInfo?.portalUrl;

  return (
    <div className="min-h-screen pt-20 flex flex-col" style={{ background: "linear-gradient(135deg, #060e1f 0%, #0a1628 40%, #0d1b3e 100%)" }}>
      <Navbar />

      <section className="pt-28 pb-20 px-6 flex-1">
        <div className="max-w-4xl mx-auto">

          {/* Back link */}
          <Link
            href="/portal"
            className="inline-flex items-center gap-2 text-white/40 hover:text-[#C9A84C] transition-colors text-sm font-['Lato'] mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to My Policies
          </Link>

          {isLoading ? (
            <div className="space-y-4">
              <div className="h-32 rounded-2xl bg-white/5 animate-pulse" />
              <div className="grid md:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />)}
              </div>
            </div>
          ) : policyQuery.error ? (
            <div className="rounded-2xl border border-white/10 p-16 text-center bg-white/2">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="font-['Playfair_Display'] text-xl font-semibold text-white mb-2">
                Policy Not Found
              </h3>
              <p className="text-white/50 font-['Lato'] mb-6 text-sm">
                This policy could not be found or you don't have permission to view it.
              </p>
              <Link
                href="/portal"
                className="inline-flex items-center gap-2 text-[#C9A84C] hover:text-[#D4AF37] transition-colors text-sm font-['Lato']"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to My Policies
              </Link>
            </div>
          ) : policy ? (
            <div className="space-y-5">

              {/* ── Hero Card ── */}
              <div className="relative overflow-hidden rounded-2xl border border-white/10"
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)" }}>
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#C9A84C] via-[#D4AF37] to-transparent" />

                {/* Policy type badge */}
                <div className="px-6 pt-6 pb-0 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/15 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-[#C9A84C]" />
                    </div>
                    <div>
                      <p className="text-white/40 text-xs font-['Lato'] uppercase tracking-wider">Policy Type</p>
                      <p className="text-white font-semibold font-['Playfair_Display'] text-lg leading-tight">
                        {policy.type || "Insurance Policy"}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${status.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </div>

                {/* Quick stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-white/8 mt-5 border-t border-white/8">
                  <div className="p-5 sm:p-6 overflow-hidden">
                    <p className="text-white/40 text-xs font-['Lato'] uppercase tracking-wider mb-1">Policy Number</p>
                    <p className="text-white font-semibold font-['Playfair_Display'] text-base leading-tight flex items-center gap-1 min-w-0">
                      <Hash className="w-3 h-3 text-[#C9A84C] shrink-0" />
                      <span className="truncate">{policy.policyNumber || "—"}</span>
                    </p>
                  </div>
                  <div className="p-5 sm:p-6">
                    <p className="text-white/40 text-xs font-['Lato'] uppercase tracking-wider mb-1">Monthly Premium</p>
                    <p className="text-white font-bold font-['Playfair_Display'] text-xl leading-tight">
                      {formatCurrency(policy.premiumAmount)}
                    </p>
                    <p className="text-white/30 text-xs font-['Lato'] mt-0.5">/{policy.premiumFrequency || "month"}</p>
                  </div>
                  {policy.coverageAmount && (
                    <div className="p-5 sm:p-6">
                      <p className="text-white/40 text-xs font-['Lato'] uppercase tracking-wider mb-1">Face Amount</p>
                      <p className="text-[#C9A84C] font-bold font-['Playfair_Display'] text-xl">
                        {formatCurrency(policy.coverageAmount)}
                      </p>
                      <p className="text-white/30 text-xs font-['Lato'] mt-0.5">coverage</p>
                    </div>
                  )}
                  <div className="p-5 sm:p-6 col-span-2 sm:col-span-1 overflow-hidden">
                    <p className="text-white/40 text-xs font-['Lato'] uppercase tracking-wider mb-1">Carrier</p>
                    <p className="text-white font-semibold font-['Playfair_Display'] text-base leading-tight truncate">
                      {policy.carrier}
                    </p>
                    {carrierPhone && (
                      <a href={`tel:${carrierPhone.replace(/[^0-9]/g, "")}`}
                        className="text-[#C9A84C]/70 text-xs font-['Lato'] hover:text-[#C9A84C] transition-colors mt-0.5 block">
                        {carrierPhone}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Detail Cards Grid ── */}
              <div className="grid md:grid-cols-2 gap-4">

                {/* Carrier Contact */}
                <div className="rounded-2xl border border-white/10 p-5 sm:p-6"
                  style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center">
                      <Building2 className="w-4.5 h-4.5 text-[#C9A84C]" />
                    </div>
                    <span className="text-white/60 text-xs font-['Lato'] uppercase tracking-wider font-semibold">Carrier Information</span>
                  </div>
                  <p className="text-white text-xl font-semibold font-['Playfair_Display'] mb-2">{policy.carrier}</p>
                  {carrierPhone ? (
                    <a
                      href={`tel:${carrierPhone.replace(/[^0-9]/g, "")}`}
                      className="inline-flex items-center gap-2 text-[#C9A84C] hover:text-[#D4AF37] transition-colors font-['Lato'] font-semibold"
                    >
                      <Phone className="w-4 h-4" />
                      {carrierPhone}
                    </a>
                  ) : null}
                  {carrierPortalUrl && (
                    <a
                      href={carrierPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-400/70 hover:text-blue-400 transition-colors font-['Lato'] text-sm mt-3"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Manage My Policy Online
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {carrierPhone && <p className="text-white/30 text-xs font-['Lato'] mt-2">Customer Service — Mon–Fri, 8am–5pm</p>}
                </div>

                {/* Premium */}
                <div className="rounded-2xl border border-white/10 p-5 sm:p-6"
                  style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <DollarSign className="w-4.5 h-4.5 text-emerald-400" />
                    </div>
                    <span className="text-white/60 text-xs font-['Lato'] uppercase tracking-wider font-semibold">Premium</span>
                  </div>
                  <p className="text-white text-2xl font-bold font-['Playfair_Display']">
                    {formatCurrency(policy.premiumAmount)}
                    <span className="text-white/30 text-sm font-['Lato'] font-normal ml-1.5">
                      /{policy.premiumFrequency || "month"}
                    </span>
                  </p>
                  {policy.coverageAmount && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <p className="text-white/40 text-xs font-['Lato'] uppercase tracking-wider mb-1">Face Amount / Coverage</p>
                      <p className="text-[#C9A84C] font-bold font-['Lato'] text-lg">{formatCurrency(policy.coverageAmount)}</p>
                    </div>
                  )}
                </div>

                {/* Policy Period */}
                <div className="rounded-2xl border border-white/10 p-5 sm:p-6 md:col-span-2"
                  style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Calendar className="w-4.5 h-4.5 text-blue-400" />
                    </div>
                    <span className="text-white/60 text-xs font-['Lato'] uppercase tracking-wider font-semibold">Policy Period</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-white/40 text-xs font-['Lato'] uppercase tracking-wider mb-1.5">Effective Date</p>
                      <p className="text-white text-lg font-semibold font-['Playfair_Display']">
                        {formatDate(policy.effectiveDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs font-['Lato'] uppercase tracking-wider mb-1.5">Expiration Date</p>
                      <p className="text-white text-lg font-semibold font-['Playfair_Display']">
                        {formatDate(policy.expirationDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Policy Notes */}
              {policy.description && !policy.description.toLowerCase().includes("imported from") && (
                <div className="rounded-2xl border border-white/10 p-5 sm:p-6"
                  style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <FileText className="w-4.5 h-4.5 text-purple-400" />
                    </div>
                    <span className="text-white/60 text-xs font-['Lato'] uppercase tracking-wider font-semibold">Policy Notes</span>
                  </div>
                  <p className="text-white/70 font-['Lato'] leading-relaxed whitespace-pre-wrap text-sm">
                    {policy.description}
                  </p>
                </div>
              )}

              {/* ── Contact CTA ── */}
              <div className="relative overflow-hidden rounded-2xl border border-[#C9A84C]/20 p-6 sm:p-8"
                style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(201,168,76,0.03) 100%)" }}>
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#C9A84C]/5 rounded-full -translate-y-12 translate-x-12 pointer-events-none" />

                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-[#C9A84C]" />
                    <span className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase font-['Lato'] font-semibold">We're Here For You</span>
                  </div>
                  <h3 className="font-['Playfair_Display'] text-2xl font-bold text-white mb-2">
                    Questions About This Policy?
                  </h3>
                  <p className="text-white/50 font-['Lato'] mb-6 text-sm leading-relaxed max-w-lg">
                    Your dedicated agent is available to answer any questions, assist with claims, 
                    or help you review your coverage. You can also contact your carrier directly.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                    <Link
                      href="/contact"
                      className="btn-gold flex items-center justify-center gap-2 px-6 py-3 rounded-sm text-sm font-bold tracking-widest uppercase w-full sm:w-auto"
                    >
                      <User className="w-4 h-4" />
                      Contact My Agent
                    </Link>
                    {carrierPhone ? (
                      <a
                        href={`tel:${carrierPhone.replace(/[^0-9]/g, "")}`}
                        className="flex flex-col items-center justify-center px-6 py-3 rounded-sm border-2 border-white/20 text-white hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all duration-300 w-full sm:w-auto"
                      >
                        <span className="text-xs text-white/40 font-['Lato'] tracking-widest uppercase font-normal leading-none mb-0.5">
                          {policy.carrier} Customer Service
                        </span>
                        <span className="text-sm font-bold tracking-wide font-['Lato'] flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" />
                          {carrierPhone}
                        </span>
                      </a>
                    ) : (
                      <a
                        href="tel:3616138336"
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-sm border-2 border-white/20 text-white hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all duration-300 w-full sm:w-auto text-sm font-bold tracking-widest uppercase font-['Lato']"
                      >
                        <Phone className="w-4 h-4" />
                        (361) 613-8336
                      </a>
                    )}
                    {carrierPortalUrl && (
                      <a
                        href={carrierPortalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-sm border-2 border-blue-400/30 text-blue-300 hover:border-blue-400 hover:text-blue-200 transition-all duration-300 w-full sm:w-auto text-sm font-bold tracking-widest uppercase font-['Lato']"
                      >
                        <Globe className="w-4 h-4" />
                        {policy.carrier} Portal
                      </a>
                    )}
                    <Link
                      href="/portal"
                      className="flex items-center justify-center gap-2 px-6 py-3 rounded-sm border-2 border-white/10 text-white/50 hover:border-white/30 hover:text-white/70 transition-all duration-300 w-full sm:w-auto text-sm font-bold tracking-widest uppercase font-['Lato']"
                    >
                      <ExternalLink className="w-4 h-4" />
                      All Policies
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          ) : null}
        </div>
      </section>

      <Footer />
    </div>
  );
}
