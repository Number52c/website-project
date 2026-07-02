import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, ArrowLeft, Shield, Calendar, DollarSign, Building2, FileText, Loader as Loader2, CircleAlert as AlertCircle, Phone, ExternalLink, CircleCheck as CheckCircle, User, Hash, Globe } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface AdminPolicyPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policyId: number;
}

interface CarrierInfo {
  phone: string;
  portalUrl?: string;
}

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

function formatCurrency(val: string | number | null | undefined): string {
  if (!val) return "—";
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
}

export function AdminPolicyPreviewModal({
  open,
  onOpenChange,
  policyId,
}: AdminPolicyPreviewModalProps) {
  const { data: policiesList } = trpc.admin.listPolicies.useQuery(
    undefined,
    { enabled: open }
  );
  const policy = policiesList?.find(p => p.id === policyId);
  const { data: clientsList } = trpc.admin.listClients.useQuery(
    undefined,
    { enabled: open }
  );
  const client = policy && clientsList?.find(c => c.id === policy.clientId);
  const { data: adminCarrierData } = trpc.portal.carrierPhones.useQuery();
  const isLoading = !policiesList || !clientsList;

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!policy) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl bg-slate-900 border-slate-700">
          <div className="flex items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-red-400 mr-4" />
            <p className="text-white text-lg">Policy not found</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const status = statusConfig[policy.status] || statusConfig.active;
  const carrierInfo: CarrierInfo | undefined = policy
    ? normalizeCarrierInfo(adminCarrierData?.[policy.carrier]) ?? CARRIER_DATA_FALLBACK[policy.carrier]
    : undefined;

  const carrierPhone = carrierInfo?.phone;
  const carrierPortalUrl = carrierInfo?.portalUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700 p-0">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-white text-xl">
              Client Portal Preview - Policy Details
            </DialogTitle>
          </DialogHeader>

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

              {/* Quick stats grid - 2x2 cards */}
              <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-white/8 px-6 pb-6">
                {/* Policy Number */}
                <div className="bg-white/3 rounded-xl p-4 border border-white/8">
                  <p className="text-white/40 text-[10px] font-['Lato'] uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Hash className="w-3 h-3 text-[#C9A84C]" /> Policy Number
                  </p>
                  <p className="text-white font-semibold font-['Lato'] text-sm leading-snug break-all">
                    {policy.policyNumber || "—"}
                  </p>
                </div>
                {/* Monthly Premium */}
                <div className="bg-white/3 rounded-xl p-4 border border-white/8">
                  <p className="text-white/40 text-[10px] font-['Lato'] uppercase tracking-wider mb-2">Monthly Premium</p>
                  <p className="text-white font-bold font-['Playfair_Display'] text-lg leading-tight">
                    {formatCurrency(policy.premiumAmount)}
                  </p>
                  <p className="text-white/30 text-[10px] font-['Lato'] mt-0.5">/{policy.premiumFrequency || "month"}</p>
                </div>
                {/* Face Amount */}
                <div className="bg-white/3 rounded-xl p-4 border border-white/8">
                  <p className="text-white/40 text-[10px] font-['Lato'] uppercase tracking-wider mb-2">Face Amount</p>
                  {policy.coverageAmount ? (
                    <>
                      <p className="text-[#C9A84C] font-bold font-['Playfair_Display'] text-lg leading-tight">
                        {formatCurrency(policy.coverageAmount)}
                      </p>
                      <p className="text-white/30 text-[10px] font-['Lato'] mt-0.5">coverage</p>
                    </>
                  ) : (
                    <p className="text-white/30 text-sm">—</p>
                  )}
                </div>
                {/* Carrier */}
                <div className="bg-white/3 rounded-xl p-4 border border-white/8">
                  <p className="text-white/40 text-[10px] font-['Lato'] uppercase tracking-wider mb-2">Carrier</p>
                  <p className="text-white font-semibold font-['Lato'] text-sm leading-snug break-words">
                    {policy.carrier}
                  </p>
                  {carrierPhone && (
                    <a href={`tel:${carrierPhone.replace(/[^0-9]/g, "")}`}
                      className="text-[#C9A84C]/70 text-[11px] font-['Lato'] hover:text-[#C9A84C] transition-colors mt-1 block">
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
                {carrierPortalUrl ? (
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
                ) : null}
              </div>

              {/* Effective & Expiration Dates */}
              <div className="rounded-2xl border border-white/10 p-5 sm:p-6"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center">
                    <Calendar className="w-4.5 h-4.5 text-[#C9A84C]" />
                  </div>
                  <span className="text-white/60 text-xs font-['Lato'] uppercase tracking-wider font-semibold">Policy Dates</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-white/40 text-xs font-['Lato'] mb-1">Effective Date</p>
                    <p className="text-white font-semibold font-['Playfair_Display']">
                      {formatDate(policy.effectiveDate)}
                    </p>
                  </div>
                  {policy.expirationDate && (
                    <div>
                      <p className="text-white/40 text-xs font-['Lato'] mb-1">Expiration Date</p>
                      <p className="text-white font-semibold font-['Playfair_Display']">
                        {formatDate(policy.expirationDate)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {policy.description && (
              <div className="rounded-2xl border border-white/10 p-5 sm:p-6"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center">
                    <FileText className="w-4.5 h-4.5 text-[#C9A84C]" />
                  </div>
                  <span className="text-white/60 text-xs font-['Lato'] uppercase tracking-wider font-semibold">Description</span>
                </div>
                <p className="text-white/80 font-['Lato'] leading-relaxed">
                  {policy.description}
                </p>
              </div>
            )}

            {/* Personal Information Section */}
            {client && (
              <div className="rounded-2xl border border-white/10 p-5 sm:p-6"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center">
                    <User className="w-4.5 h-4.5 text-[#C9A84C]" />
                  </div>
                  <span className="text-white/60 text-xs font-['Lato'] uppercase tracking-wider font-semibold">Personal Information</span>
                </div>
                <div className="space-y-3">
                  {client.ssnLast4 && (
                    <div>
                      <p className="text-white/40 text-xs font-['Lato'] mb-1">Social Security Number</p>
                      <p className="text-white font-semibold font-['Playfair_Display']">***-**-{client.ssnLast4}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Banking Information */}
            {client && (client.bankName || client.accountNumberLast4) && (
              <div className="rounded-2xl border border-white/10 p-5 sm:p-6"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center">
                    <Building2 className="w-4.5 h-4.5 text-[#C9A84C]" />
                  </div>
                  <span className="text-white/60 text-xs font-['Lato'] uppercase tracking-wider font-semibold">Banking Information</span>
                </div>
                <div className="space-y-3">
                  {client.bankName && (
                    <div>
                      <p className="text-white/40 text-xs font-['Lato'] mb-1">Bank Name</p>
                      <p className="text-white font-semibold font-['Playfair_Display']">{client.bankName}</p>
                    </div>
                  )}
                  {client.accountNumberLast4 && (
                    <div>
                      <p className="text-white/40 text-xs font-['Lato'] mb-1">Account Number</p>
                      <p className="text-white font-semibold font-['Playfair_Display']">****{client.accountNumberLast4}</p>
                    </div>
                  )}
                  {client.routingNumberLast4 && (
                    <div>
                      <p className="text-white/40 text-xs font-['Lato'] mb-1">Routing Number</p>
                      <p className="text-white font-semibold font-['Playfair_Display']">****{client.routingNumberLast4}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Beneficiary Information */}
            {client && (client.primaryBeneficiary || client.contingentBeneficiary) && (
              <div className="rounded-2xl border border-white/10 p-5 sm:p-6"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center">
                    <User className="w-4.5 h-4.5 text-[#C9A84C]" />
                  </div>
                  <span className="text-white/60 text-xs font-['Lato'] uppercase tracking-wider font-semibold">Beneficiary Information</span>
                </div>
                <div className="space-y-4">
                  {client.primaryBeneficiary && (
                    <div>
                      <p className="text-white/60 text-sm font-['Lato'] mb-2 font-semibold">Primary Beneficiary</p>
                      <div className="bg-slate-700/30 rounded-lg p-3">
                        <p className="text-white font-semibold font-['Playfair_Display']">{client.primaryBeneficiary}</p>
                        {client.primaryBeneficiaryPercent && (
                          <p className="text-white/60 text-sm font-['Lato'] mt-1">{client.primaryBeneficiaryPercent}% of benefit</p>
                        )}
                      </div>
                    </div>
                  )}
                  {client.contingentBeneficiary && (
                    <div>
                      <p className="text-white/60 text-sm font-['Lato'] mb-2 font-semibold">Contingent Beneficiary</p>
                      <div className="bg-slate-700/30 rounded-lg p-3">
                        <p className="text-white font-semibold font-['Playfair_Display']">{client.contingentBeneficiary}</p>
                        {client.contingentBeneficiaryPercent && (
                          <p className="text-white/60 text-sm font-['Lato'] mt-1">{client.contingentBeneficiaryPercent}% of benefit</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer Note */}
            <div className="text-center text-xs text-slate-500 border-t border-slate-700 pt-4">
              <p>This is exactly what your client sees in their portal</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
