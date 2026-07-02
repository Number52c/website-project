/**
 * Admin Dashboard — Excel Import, Client/PIN Management, Analytics & Policies
 * Only accessible by the site owner (admin role).
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import type { Annuity } from "../../../drizzle/schema";
import { ChaosPageLoadSection } from "@/components/ChaosPageLoad";

import Footer from "@/components/Footer";
import { PolicyEditDrawer } from "@/components/PolicyEditDrawer";
import { WelcomeTextModal } from "@/components/WelcomeTextModal";
import { AdminPolicyPreviewModal } from "@/components/AdminPolicyPreviewModal";
import { ExpenseTracker } from "@/components/ExpenseTracker";
import { NetRevenueKPI } from "@/components/NetRevenueKPI";
import { CommissionDropdown } from "@/components/CommissionDropdown";
import { BackendPaymentKPI } from "@/components/BackendPaymentKPI";
import { ClientBackendPayments } from "@/components/ClientBackendPayments";
import { IssuedPaidPremiumKPI } from "@/components/IssuedPaidPremiumKPI";
import { AccurateRevenueKPI } from "@/components/AccurateRevenueKPI";
import { MarkAsPaidButton } from "@/components/MarkAsPaidButton";
import { Month10_11_12ExpectedRevenueKPI } from "@/components/Month10_11_12ExpectedRevenueKPI";
import { ClientsAnnualReviewKPI } from "@/components/ClientsAnnualReviewKPI";
import { LinkHouseholdModal } from "@/components/LinkHouseholdModal";
import { ClientIntakeForm } from "@/components/ClientIntakeForm";
import { AgentPerformanceModal } from "@/components/AgentPerformanceModal";
import { AnnualReviewModal } from "@/components/AnnualReviewModal";
import { AdminAgents } from "@/pages/AdminAgents";
import { OnboardingGuide } from "@/pages/OnboardingGuide";
import { AgentPerformanceTab } from "@/pages/AgentPerformanceTab";
import { AnnualReviewsTab } from "@/pages/AnnualReviewsTab";
import { AdminCarrierTracker } from "@/components/AdminCarrierTracker";
import { AdvancePaidCard } from "@/components/AdvancePaidCard";
import { BulkPolicyEditor } from "@/components/BulkPolicyEditor";
import { AgentKPICard } from "@/components/AgentKPICard";
import { DragDropFileUpload } from "@/components/DragDropFileUpload";
import CarrierResources from "@/components/CarrierResources";
import { PolicySegregationKPIs } from "@/components/PolicySegregationKPIs";
import { AgentSalesSection } from "@/components/AgentSalesSection";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Upload, Users, Shield, FileSpreadsheet, Eye, EyeOff, Trash2, CreditCard as Edit, Plus, X, Search, ChevronDown, ChevronUp, Loader as Loader2, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Copy, Phone, ChartBar as BarChart3, DollarSign, TrendingUp, ChartPie as PieChart, Download, UserPlus, MessageSquare, FileText, Send, ClipboardCopy, RefreshCw, LogIn, Calendar, LogOut, Zap, Briefcase, Lock, Clock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/* ─── Carrier Portal Link Component ──────────────────────────────────────────── */

function CarrierPortalLink({ carrierName }: { carrierName: string }) {
  const { data, isLoading } = trpc.admin.getCarrierPortalUrl.useQuery({ carrierName });
  
  if (isLoading) return <span className="text-gray-500 text-[11px]">Loading...</span>;
  if (!data?.portalUrl && !data?.website) return null;
  
  return (
    <div className="flex gap-2 flex-wrap">
      {data?.portalUrl && (
        <a
          href={data.portalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#c9a84c] hover:text-[#e8c547] text-[11px] underline transition font-medium"
        >
          Portal
        </a>
      )}
      {data?.website && (
        <a
          href={data.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#c9a84c] hover:text-[#e8c547] text-[11px] underline transition font-medium"
        >
          Website
        </a>
      )}
    </div>
  );
}

/* ─── Types ─────────────────────────────────────────────────────────────────── */

interface ImportedClient {
  name: string;
  pin: string;
  policiesCount: number;
}

type TabKey =
  | "analytics"
  | "sales"
  | "clients"
  | "policies"
  | "agentPolicies"
  | "annuities"
  | "gwl"
  | "onboarding"
  | "import"
  | "notes"
  | "carrierResources"
  | "carrierTracker"
  | "agents"
  | "bulkPremium"
  | "agentPerformance"
  | "guide"
;

/* ─── Carrier Data Types ─────────────────────────────────────────────────────── */

export interface CarrierInfo {
  phone: string;
  portalUrl?: string;
}

/* ─── Default Carrier Data Map ─────────────────────────────────────────────── */

const DEFAULT_CARRIER_PHONES: Record<string, CarrierInfo> = {
  Transamerica: {
    phone: "1-800-523-7900",
    portalUrl:
      "https://www.transamerica.com/individual/insurance/your-life-insurance-policy",
  },
  "Mutual of Omaha": {
    phone: "1-800-775-6000",
    portalUrl: "https://www.mutualofomaha.com/welcome/customer-access",
  },
  Americo: {
    phone: "1-816-641-2850",
    portalUrl: "https://www.americocustomer.com/",
  },
  Athene: {
    phone: "1-888-266-8489",
    portalUrl: "https://www.athene.com/signup",
  },
  "American Equity": {
    phone: "1-888-221-1234",
    portalUrl: "https://myportal.american-equity.com/",
  },
  Corebridge: {
    phone: "1-800-424-4990",
    portalUrl: "https://www.corebridgefinancial.com/rs/login",
  },
  Aetna: {
    phone: "1-888-792-3862",
    portalUrl:
      "https://www.aetna.com/individuals-families/member-rights-resources/member-portal.html",
  },
  CICA: {
    phone: "1-800-880-5044",
    portalUrl: "https://cicaamerica.citizensinc.com/",
  },
  LCBA: {
    phone: "1-800-234-5222",
    portalUrl: "https://www.lcbalife.org/",
  },
  "Elco Mutual": {
    phone: "1-800-321-3526",
    portalUrl: "https://www.elcomutual.com/",
  },
  "Catholic Financial": {
    phone: "1-877-426-6540",
    portalUrl: "https://www.catholicfinanciallife.org/members/login",
  },
  Instabrain: {
    phone: "1-800-806-9714",
    portalUrl: "",
  },
  "American General (AIG)": {
    phone: "1-800-888-2452",
    portalUrl: "https://www.aig.com/individual/life-insurance",
  },
  AIG: {
    phone: "1-800-888-2452",
    portalUrl: "https://www.aig.com/individual/life-insurance",
  },
};

/* ─── Carrier List ─────────────────────────────────────────────────────────── */

const CARRIERS = [
  // Life & Health
  "Aetna",
  "Aflac",
  "Allstate Life",
  "American Equity",
  "American Fidelity",
  "American General (AIG)",
  "American National",
  "Americo",
  "Athene",
  "Banner Life",
  "Cincinnati Life",
  "Columbus Life",
  "Foresters Financial",
  "Global Atlantic",
  "Great Plains Energy",
  "Guggenheim Life",
  "Integrity Life",
  "Jackson National",
  "John Hancock",
  "Kansas City Life",
  "Lafayette Life",
  "Legal & General America",
  "Liberty Bankers Life",
  "Lincoln Benefit Life",
  "Lincoln Financial",
  "Lumico Life",
  "Mass Mutual",
  "Midland National",
  "Minnesota Life",
  "Mutual of Omaha",
  "National Life Group",
  "National Western Life",
  "New York Life",
  "North American",
  "Northwestern Mutual",
  "Ohio National",
  "Pacific Life",
  "Penn Mutual",
  "Principal Financial",
  "Protective Life",
  "Prudential",
  "Reliance Standard",
  "Sagicor Life",
  "Securian Financial",
  "Sentinel Security Life",
  "Symetra",
  "Transamerica",
  "United of Omaha",
  "USAA Life",
  "Voya Financial",
  "William Penn",
  // From FFL Comp Guide — additional carriers
  "Accordia Life",
  "American Amicable",
  "Ameritas",
  "Balance Life (I-Provide)",
  "Catholic Financial Life",
  "CICA Life",
  "Columbia Life",
  "Combined Insurance",
  "Equitable Life",
  "Ethos Life",
  "Fentraco",
  "Gerber Life",
  "GIWL (Vision Life)",
  "Gleaner Life",
  "InsureMax",
  "LCBA Life",
  "Liberty Bankers Life",
  "Lumico Life",
  "NewBridge Life",
  "OneAmerica",
  "Prosperity Life",
  "Royal Arcanum",
  "Royal Neighbors of America",
  "SBLI",
  "Stonebridge Life",
  "Term Bankers",
  "Trusted Fraternal Life",
  "Viva Life",
  // Annuity-specific
  "Allianz Life",
  "Annexus",
  "Delaware Life",
  "Eagle Life",
  "Elco Mutual",
  "Equitrust Life",
  "F&G (Fidelity & Guaranty)",
  "Gainbridge",
  "Nassau Life",
  "North American Company",
  "Oxford Life",
  "Palladium Life",
  "Prevail",
  "Puritan Life",
  "Safe Harbor Life",
  "Sentinel Life",
  "Silac",
  "Standard Insurance",
  "Starfire Life",
  "Steadfast Insurance",
  "Summit Alliance Life",
  "Talcott Resolution",
  "UM Life",
  // Health
  "Blue Cross Blue Shield",
  "Cigna",
  "Humana",
  "Kaiser Permanente",
  "Molina Healthcare",
  "UnitedHealthcare",
  "WellCare",
]
  .sort()
  .filter((v, i, a) => a.indexOf(v) === i);

/* ─── CarrierSelect Component ───────────────────────────────────────────────── */

function CarrierSelect({
  value,
  onChange,
  required = false,
  placeholder = "Search or select carrier...",
  className = "",
}: {
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = (CARRIERS || []).filter(c =>
    c.toLowerCase().includes(search.toLowerCase())
  );
  const showCustom =
    search.trim() &&
    !CARRIERS.some(c => c.toLowerCase() === search.trim().toLowerCase());

  return (
    <div className={`relative ${className}`}>
      <div
        className="flex items-center w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white cursor-pointer hover:border-[#c9a84c]/50 focus-within:border-[#c9a84c]/50 focus-within:ring-2 focus-within:ring-[#c9a84c]/30 transition"
        onClick={() => setOpen(o => !o)}
      >
        <span
          className={`flex-1 truncate ${value ? "text-white" : "text-gray-500"}`}
        >
          {value || placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>
      {open && (
        <div className="absolute z-50 mt-1 left-0 w-64 bg-[#0f2040] border border-white/20 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-white/10">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Type to search..."
              className="w-full px-3 py-1.5 text-sm bg-white/10 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50"
              onClick={e => e.stopPropagation()}
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {showCustom && (
              <button
                type="button"
                className="w-full text-left px-4 py-2 text-sm text-[#c9a84c] hover:bg-white/10 transition italic"
                onClick={() => {
                  onChange(search.trim());
                  setOpen(false);
                  setSearch("");
                }}
              >
                + Use "{search.trim()}"
              </button>
            )}
            {filtered.length === 0 && !showCustom && (
              <p className="px-4 py-3 text-sm text-gray-500">
                No carriers found
              </p>
            )}
            {filtered.map(c => (
              <button
                key={c}
                type="button"
                className={`w-full text-left px-4 py-2 text-sm transition ${
                  value === c
                    ? "bg-[#c9a84c]/20 text-[#c9a84c] font-semibold"
                    : "text-gray-200 hover:bg-white/10"
                }`}
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                  setSearch("");
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
      {required && (
        <input
          type="text"
          required
          value={value}
          onChange={() => {}}
          className="sr-only"
          tabIndex={-1}
        />
      )}
    </div>
  );
}

/* ─── Admin Dashboard ───────────────────────────────────────────────────────── */

export default function AdminDashboard({ onLogout }: { onLogout?: () => void } = {}) {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("analytics");
  const [mobileTabOpen, setMobileTabOpen] = useState<boolean>(false);
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [showAgentPerformanceModal, setShowAgentPerformanceModal] = useState(false);



  const utils = trpc.useUtils();
  const createClientIntakeMutation = trpc.admin.createClientFromIntakeForm.useMutation({
    onSuccess: () => {
      toast.success("Client added successfully!");
      setShowIntakeForm(false);
      utils.admin.listClients.invalidate();
      utils.admin.getSalesByMonth.invalidate();
      utils.admin.listPolicies.invalidate();
      utils.admin.getAgentAnnualReviewStats.invalidate();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to save client";
      toast.error(msg);
    },
  });





  return (
    <div
      className="min-h-screen flex flex-row"
      style={{
        background:
          "linear-gradient(135deg, #060e1f 0%, #0a1628 40%, #0d1b3e 100%)",
      }}
    >
      {/* Sidebar Navigation */}
      <aside className="w-[220px] bg-gradient-to-b from-[#0a0f1e] via-[#0d1528] to-[#0f1a2e] border-r border-[#c9a84c]/20 flex flex-col fixed left-0 top-0 bottom-0 overflow-y-auto shadow-2xl z-20">
        <div className="pt-8 px-4 space-y-2">
          <div className="flex items-center justify-center mb-6 group">
            <img
              src="/manus-storage/ortiz-insurance-logo_9c798257.png"
              alt="Ortiz Insurance"
              className="h-16 w-auto animate-fade-in-up group-hover:scale-105 transition-transform duration-300 drop-shadow-lg"
            />
          </div>
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent mb-8 animate-fade-in-up animate-delay-100 shadow-lg shadow-[#c9a84c]/50" />
          {(() => {
            const primaryTabs = [
              {
                key: "analytics" as const,
                label: "Analytics",
                icon: BarChart3,
              },
              {
                key: "sales" as const,
                label: "Sales Tracker",
                icon: DollarSign,
              },
              { key: "clients" as const, label: "Clients & PINs", icon: Users },
              {
                key: "policies" as const,
                label: "Policies",
                icon: FileSpreadsheet,
              },
              {
                key: "annuities" as const,
                label: "Annuities",
                icon: TrendingUp,
              },
              { key: "gwl" as const, label: "Life Insurance", icon: Shield },
              {
                key: "agents" as const,
                label: "Agents",
                icon: Users,
              },
            ];
            const secondaryTabs = [
              {
                key: "onboarding" as const,
                label: "Onboard Client",
                icon: UserPlus,
              },
              { key: "import" as const, label: "Import Excel", icon: Upload },
              {
                key: "bulkPremium" as const,
                label: "Fix Premiums",
                icon: DollarSign,
              },
              {
                key: "carrierResources" as const,
                label: "Carrier Resources",
                icon: Phone,
              },
              {
                key: "carrierTracker" as const,
                label: "My Carriers",
                icon: Briefcase,
              },
              {
                key: "agentPerformance" as const,
                label: "Agent Performance",
                icon: TrendingUp,
              },
            ];
            const tabs = [...primaryTabs, ...secondaryTabs];
            return tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-300 rounded-lg group relative ${
                  activeTab === key
                    ? "bg-gradient-to-r from-[#c9a84c]/30 to-[#c9a84c]/15 text-[#e6c200] border-l-2 border-[#c9a84c] shadow-lg shadow-[#c9a84c]/30"
                    : "text-gray-400 hover:text-[#c9a84c] hover:bg-[#c9a84c]/10 border-l-2 border-transparent hover:border-[#c9a84c]/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon size={16} />
                  <span>{label}</span>
                </div>
              </button>
            ));
          })()}
</div>
          <div className="mt-auto p-4 text-center text-[#c9a84c]/70 text-sm animate-fade-in-up animate-delay-300 border-t border-[#c9a84c]/20">
            <p className="mb-2 italic text-[#c9a84c]/60">"The only way to do great work is to love what you do."</p>
            <p className="font-semibold text-[#c9a84c]">- Steve Jobs</p>
          </div>
	      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-[220px]">
      {/* Header - Premium Glassmorphism */}
      <section className="relative pt-8 pb-12 px-4 overflow-hidden bg-gradient-to-br from-[#0a0f1e] via-[#0d1528] to-[#0f1a2e] shadow-2xl rounded-b-lg animate-fade-in-up border-b border-[#c9a84c]/20">
        {/* Background glow - gold accent */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[400px] h-[200px] bg-[#C9A84C]/8 rounded-full blur-[100px]" />
          <div className="absolute top-20 left-1/3 w-[300px] h-[150px] bg-[#c9a84c]/5 rounded-full blur-[80px]" />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-4xl text-primary mb-1">
                Welcome Mr. Ortiz! 👋
              </h1>
              <p className="text-foreground/80 font-sans text-sm sm:text-base md:text-lg">
                Here's what's happening with your business today.
              </p>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4 group flex-shrink-0">
                <div className="relative">
                  <img src="/manus-storage/founder-portrait-optimized_5153cde4.jpg" alt="Mr. Ortiz" className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-2 border-[#c9a84c] group-hover:border-[#e6c200] group-hover:shadow-lg group-hover:shadow-[#c9a84c]/50 group-hover:scale-110 transition-all duration-300 object-cover object-top" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#c9a84c]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex flex-col hidden sm:flex">
                  <span className="font-semibold text-[#c9a84c] group-hover:text-[#e6c200] transition-colors duration-300 text-sm">Mr. Ortiz</span>
                  <span className="text-xs text-[#c9a84c]/60">Admin</span>
                </div>
                <Button variant="ghost" size="icon" onClick={onLogout} className="text-[#c9a84c] hover:text-[#e6c200] hover:bg-[#c9a84c]/10 transition-all duration-300">
                  <LogOut size={20} />
                </Button>
              </div>
            </div>
          </div>
        </section>

      {/* Tabs */}
      <section className="px-4 pb-4">
        <div className="max-w-7xl mx-auto">
          {/* Mobile: dropdown */}
          {(() => {
            const primaryTabs = [
              {
                key: "analytics" as const,
                label: "Analytics",
                icon: BarChart3,
              },
              {
                key: "sales" as const,
                label: "Sales Tracker",
                icon: DollarSign,
              },
              { key: "clients" as const, label: "Clients & PINs", icon: Users },
              {
                key: "policies" as const,
                label: "Policies",
                icon: FileSpreadsheet,
              },
              {
                key: "annuities" as const,
                label: "Annuities",
                icon: TrendingUp,
              },
              { key: "gwl" as const, label: "Life Insurance", icon: Shield },
              {
                key: "agents" as const,
                label: "Agents",
                icon: Users,
              },
            ];
            const secondaryTabs = [
              {
                key: "onboarding" as const,
                label: "Onboard Client",
                icon: UserPlus,
              },
              { key: "import" as const, label: "Import Excel", icon: Upload },
              {
                key: "bulkPremium" as const,
                label: "Fix Premiums",
                icon: DollarSign,
              },
              {
                key: "carrierResources" as const,
                label: "Carrier Resources",
                icon: Phone,
              },
              {
                key: "carrierTracker" as const,
                label: "My Carriers",
                icon: Briefcase,
              },
              {
                key: "agentPerformance" as const,
                label: "Agent Performance",
                icon: TrendingUp,
              },
            ];
            const tabs = [...primaryTabs, ...secondaryTabs];
            const activeTabInfo = tabs.find(t => t.key === activeTab);
            const ActiveIcon = activeTabInfo?.icon ?? BarChart3;
            return (
              <>
                {/* Mobile dropdown */}
                <div className="md:hidden relative">
                  <button
                    onClick={() => setMobileTabOpen(prev => !prev)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-[#c9a84c]/10 to-[#c9a84c]/5 border border-[#c9a84c]/30 hover:border-[#c9a84c]/60 rounded-xl text-sm font-semibold text-[#c9a84c] hover:bg-[#c9a84c]/15 transition-all duration-200"
                  >
                    <span>
                      <span className="flex items-center gap-2">
                        <ActiveIcon size={16} />
                        {activeTabInfo?.label}
                      </span>
                    </span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${mobileTabOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {mobileTabOpen && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-gradient-to-b from-[#0d1528] to-[#0a0f1e] border border-[#c9a84c]/30 rounded-xl shadow-2xl shadow-[#c9a84c]/20 overflow-hidden">
                      {tabs.map(({ key, label, icon: Icon }) => (
                        <button
                          key={key}
                          onClick={() => {
                            setActiveTab(key);
                            setMobileTabOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all duration-200 border-b border-[#c9a84c]/10 last:border-b-0 ${
                            activeTab === key
                              ? "bg-gradient-to-r from-[#c9a84c]/20 to-transparent text-[#e6c200] border-l-2 border-l-[#c9a84c]"
                              : "text-gray-400 hover:bg-[#c9a84c]/10 hover:text-[#c9a84c] hover:border-l-2 hover:border-l-[#c9a84c]/50"
                          }`}
                        >
                          <Icon size={16} />
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Desktop tab bar */}
                <div className="hidden">
                  <div className="border-b border-white/10 overflow-x-auto scrollbar-hide">
                    <div className="flex gap-8 px-6 py-4 min-w-min">
                      {tabs.map(({ key, label, icon: Icon }) => (
                        <button
                          key={key}
                          onClick={() => setActiveTab(key)}
                          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-all duration-300 whitespace-nowrap rounded-full relative group ${
                            activeTab === key
                              ? "bg-gradient-to-r from-[#c9a84c]/30 to-[#c9a84c]/20 text-[#e6c200] shadow-lg shadow-[#c9a84c]/40 border border-[#c9a84c]/60"
                              : "text-gray-400 hover:text-[#c9a84c] hover:bg-[#c9a84c]/10 border border-transparent hover:border-[#c9a84c]/30"
                          }`}
                        >
                <div className="flex items-center gap-2">
                  <Icon size={16} />
                  <span>{label}</span>
                </div>
              </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </section>

      {/* Content */}
      <main className="flex-1 px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          {(() => {
            switch (activeTab) {
              case "analytics":
                return <AnalyticsTab setShowIntakeForm={setShowIntakeForm} user={user} />;
              case "sales":
                return <SalesTrackerTab />;
              case "import":
                return <ImportTab />;
              case "bulkPremium":
                return <BulkPolicyEditor />;
              case "clients":
                return (
                  <ClientsTab
                    showIntakeForm={showIntakeForm}
                    setShowIntakeForm={setShowIntakeForm}
                    createClientIntakeMutation={createClientIntakeMutation}
                  />
                );
              case "policies":
                return <PoliciesTab />;
              case "agentPolicies":
                return <AgentPoliciesTab />;
              case "annuities":
                return <AnnuitiesTab />;
              case "gwl":
                return <GradedWholeLifeTab />;
              case "onboarding":
                return <OnboardingTab />;
              case "notes":
                return <PolicyNotesTab />;
              case "carrierResources":
                return <CarrierResources><CarrierPhonesTab /></CarrierResources>;
              case "carrierTracker":
                return <AdminCarrierTracker />;
              case "agents":
                return (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-6">Agents Management</h2>
                      <AdminAgents />
                    </div>
                    <div className="border-t border-white/10 pt-8">
                      <h2 className="text-2xl font-bold text-white mb-6">Onboarding Guide</h2>
                      <OnboardingGuide />
                    </div>
                  </div>
                );
              case "agentPerformance":
                return <AgentPerformanceTab />;
              default:
                return null;
            }
          })()}
        </div>
      </main>

      <AgentPerformanceModal isOpen={showAgentPerformanceModal} onClose={() => setShowAgentPerformanceModal(false)} />
      <Footer />

      {/* Comprehensive Client Intake Form Dialog */}
      <Dialog open={showIntakeForm} onOpenChange={setShowIntakeForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0f1117] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">New Client Financial Profile</DialogTitle>
            <DialogDescription className="text-gray-400">
              Fill out the complete client intake form below
            </DialogDescription>
          </DialogHeader>
          <ClientIntakeForm
            onSubmit={async (data) => {
              const { healthConditions, beneficiary, yearlyAP, commissionPercent, ...rest } = data;
              await createClientIntakeMutation.mutateAsync({
                ...rest,
                annualPremium: yearlyAP || '0',
                commissionPercent: commissionPercent ? parseFloat(commissionPercent.toString()) : 0,
                healthConditionsJSON: JSON.stringify(healthConditions),
              });
              // After saving, close the form and navigate to Policies tab
              setShowIntakeForm(false);
              setActiveTab("policies");
            }}
            isLoading={createClientIntakeMutation.isPending}
            onClose={() => setShowIntakeForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  </div>
  );
}

/* ─── Analytics Tab ────────────────────────────────────────────────────────── */

function AnalyticsTab({ setShowIntakeForm, user }: { setShowIntakeForm: (val: boolean) => void; user: any }) {
  const [policyListModal, setPolicyListModal] = useState<{
    type: "policies" | "annuities" | "gwl";
    isOpen: boolean;
  }>({ type: "policies", isOpen: false });
  const [showAgentPerformanceModal, setShowAgentPerformanceModal] = useState(false);
  const [showAnnualReviewModal, setShowAnnualReviewModal] = useState(false);
  const [showAgentAnnualReviewModal, setShowAgentAnnualReviewModal] = useState(false);

  const { data: policiesList, isLoading: policiesLoading } =
    trpc.admin.listPolicies.useQuery();
  const { data: clientsList, isLoading: clientsLoading } =
    trpc.admin.listClients.useQuery();
  const { data: annuitiesList, isLoading: annuitiesLoading } =
    trpc.admin.listAnnuities.useQuery();
  const { data: gwlList } = trpc.admin.listGWL.useQuery();
  const now = new Date();
  const { data: salesData } = trpc.admin.getSalesByMonth.useQuery({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });
  const { data: agentAnnualReviewStats } = trpc.admin.getAgentAnnualReviewStats.useQuery();
  const { data: agentsList } = trpc.admin.listAgents.useQuery();
  const { data: allSalesData } = trpc.admin.getAllSales.useQuery();

  const stats = useMemo(() => {
    const policies = policiesList ?? [];
    const clients = clientsList ?? [];
    const annuities = annuitiesList ?? [];
    const agents = agentsList ?? [];

    // Policy AP (active only)
    const activePolicies = (policies ?? []).filter(p => p.status === "active");
    const policyAP = (activePolicies ?? []).reduce((sum, p) => {
      const ap = parseFloat(p.yearlyAP || "0");
      return sum + (isNaN(ap) ? 0 : ap);
    }, 0);

    // Annuity AP (active only) — uses commission-adjusted AP when commissionPercent is set
    const calcAnnuityAP = (a: any) => {
      const premium = parseFloat(a.premium || "0");
      const compPct = parseFloat(a.commissionPercent || "0");
      if (isNaN(premium)) return 0;
      if (compPct > 0) return (premium * compPct) / 100;
      return premium;
    };
    const activeAnnuities = (annuities ?? []).filter(a => a.status === "active");
    const annuityAP = (activeAnnuities ?? []).reduce(
      (sum, a) => sum + calcAnnuityAP(a),
      0
    );

    // FIA / MYGA breakdown
    const fiaAnnuities = (annuities ?? []).filter(a => a.type === "FIA");
    const mygaAnnuities = (annuities ?? []).filter(a => a.type === "MYGA");
    const activeFIA = (fiaAnnuities ?? []).filter(a => a.status === "active");
    const activeMYGA = (mygaAnnuities ?? []).filter(a => a.status === "active");
    const fiaAP = (activeFIA ?? []).reduce((s, a) => s + calcAnnuityAP(a), 0);
    const mygaAP = (activeMYGA ?? []).reduce((s, a) => s + calcAnnuityAP(a), 0);
    // AUM = total raw premium (not commission-adjusted) for all active annuities
    const fiaAUM = (activeFIA ?? []).reduce(
      (s, a) => s + (parseFloat(a.premium || "0") || 0),
      0
    );
    const mygaAUM = (activeMYGA ?? []).reduce(
      (s, a) => s + (parseFloat(a.premium || "0") || 0),
      0
    );
    const totalAUM = fiaAUM + mygaAUM;

    // GWL AP (from GWL policies table, active only)
    const gwlPolicies = gwlList ?? [];
    const activeGWL = (gwlPolicies ?? []).filter(g => g.status === "active");
    const gwlFromGWLTable = (activeGWL ?? []).reduce(
      (sum, g) => sum + parseFloat(g.yearlyAP || "0"),
      0
    );

    // Also include regular policies where type contains "graded" (case-insensitive)
    const gradedFromPolicies = (activePolicies ?? []).filter(p =>
      p.type.toLowerCase().includes("graded")
    );
    const gwlFromPoliciesAP = (gradedFromPolicies ?? []).reduce((sum, p) => {
      const ap = parseFloat(p.yearlyAP || "0");
      return sum + (isNaN(ap) ? 0 : ap);
    }, 0);
        const gwlAP = gwlFromGWLTable + gwlFromPoliciesAP;
    const gwlTotalCount = activeGWL.length + gradedFromPolicies.length;
    // Life AP = ALL life policies (policies table active + GWL table active)
    // This is everything that is NOT an annuity
    const lifeAPBase = policyAP + gwlAP;
    const lifeCount = activePolicies.length + gwlTotalCount;
    // Combined total AP (grand total: life + annuities)
    const totalAP = policyAP + annuityAP + gwlAP;
    // Life AP = grand total of ALL AP (life + annuities) — shown as the total AP figure
    const lifeAP = totalAP;
    // Policy AP = Life (non-annuity) AP + Annuity AP combined (same as totalAP but labeled as Policy AP)
    const combinedPolicyAP = lifeAPBase + annuityAP;
    // Issued Paid = sum of premium from ALL-TIME sales entries where isPaid = true
    const issuedPaid = (allSalesData ?? []).reduce((sum: number, sale: any) => {
      if (sale.isPaid) {
        const premium = parseFloat(sale.premium || "0") || 0;
        const commPercent = parseFloat(sale.commissionPercent || "0") || 0;
        if (commPercent > 0) return sum + (premium * commPercent) / 100;
        return sum + premium;
      }
      return sum;
    }, 0);

    // Policy type breakdown — normalize raw codes to canonical display names
    const TYPE_NORMALIZE: Record<string, string> = {
      "WL": "Whole Life",
      "GWL": "Graded Whole Life",
      "Term": "Term Life",
      "Accidental": "Accidental Death",
      "IUL": "Indexed Universal Life (IUL)",
      "UL": "Universal Life (UL)",
      "Final Expense": "Final Expense",
      "FIA": "FIA (Fixed Indexed Annuity)",
      "MYGA": "MYGA (Multi-Year Guaranteed)",
      "fixed_annuity": "Fixed Annuity",
      "indexed_annuity": "FIA (Indexed Annuity)",
      "variable_annuity": "Variable Annuity",
      "immediate_annuity": "MYGA (Immediate Annuity)",
      "Graded Whole Life": "Graded Whole Life",
      "Whole Life Final Expense": "Whole Life Final Expense",
      "Whole Life": "Whole Life",
      "Annuity": "Annuity",
      "other": "Other",
    };
    const typeCounts: Record<string, number> = {};
    for (const p of policies) {
      const normalized = TYPE_NORMALIZE[p.type] ?? p.type;
      typeCounts[normalized] = (typeCounts[normalized] || 0) + 1;
    }

    // Status breakdown
    const statusCounts: Record<string, number> = {};
    for (const p of policies) {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    }

    // Carrier breakdown
    const carrierCounts: Record<string, number> = {};
    for (const p of policies) {
      carrierCounts[p.carrier] = (carrierCounts[p.carrier] || 0) + 1;
    }

    // AP by carrier (active policies + active annuities + active GWL)
    const carrierAP: Record<string, number> = {};
    for (const p of activePolicies) {
      const ap = parseFloat(p.yearlyAP || "0");
      if (!isNaN(ap)) {
        carrierAP[p.carrier] = (carrierAP[p.carrier] || 0) + ap;
      }
    }
    for (const a of activeAnnuities) {
      const ap = calcAnnuityAP(a);
      if (ap > 0) {
        carrierAP[a.carrier] = (carrierAP[a.carrier] || 0) + ap;
      }
    }
    // GWL AP by carrier
    for (const g of activeGWL) {
      const ap = parseFloat(g.yearlyAP || "0");
      if (ap > 0) {
        carrierAP[g.carrier] = (carrierAP[g.carrier] || 0) + ap;
      }
    }

    // AP by policy type (all sources: regular policies + annuities + GWL table)
    const typeAP: Record<string, { ap: number; count: number }> = {};
    // Regular active policies — grouped by their type field
    for (const p of activePolicies) {
      const ap = parseFloat(p.yearlyAP || "0");
      if (!isNaN(ap) && ap > 0) {
        const t = p.type || "Unknown";
        if (!typeAP[t]) typeAP[t] = { ap: 0, count: 0 };
        typeAP[t].ap += ap;
        typeAP[t].count += 1;
      }
    }
    // Annuities — FIA and MYGA as their own types
    for (const a of activeAnnuities) {
      const ap = calcAnnuityAP(a);
      if (ap > 0) {
        const t = a.type; // "FIA" or "MYGA"
        if (!typeAP[t]) typeAP[t] = { ap: 0, count: 0 };
        typeAP[t].ap += ap;
        typeAP[t].count += 1;
      }
    }
    // GWL table entries — always "Graded Whole Life"
    for (const g of activeGWL) {
      const ap = parseFloat(g.yearlyAP || "0");
      if (!isNaN(ap) && ap > 0) {
        const t = "Graded Whole Life";
        if (!typeAP[t]) typeAP[t] = { ap: 0, count: 0 };
        typeAP[t].ap += ap;
        typeAP[t].count += 1;
      }
    }

    // Total active records = active policies + active annuities + active GWL
    const totalClients =
      activePolicies.length + activeAnnuities.length + activeGWL.length;

    // Estimated commission on books — uses commissionRate stored on each policy
    let estimatedMonthlyCommission = 0;
    let estimatedAnnualCommission = 0;
    for (const p of activePolicies) {
      const ap = parseFloat(p.yearlyAP || "0");
      if (isNaN(ap) || ap <= 0) continue;
      const rate = parseFloat((p as any).commissionRate || "0");
      if (rate > 0) {
        const comm = (ap * rate) / 100;
        estimatedAnnualCommission += comm;
        estimatedMonthlyCommission += comm / 12;
      }
    }
    // Annuity commissions (already stored as commissionAmount or derived)
    for (const a of activeAnnuities) {
      const premium = parseFloat(a.premium || "0");
      const compPct = parseFloat(a.commissionPercent || "0");
      if (compPct > 0 && premium > 0) {
        estimatedAnnualCommission += (premium * compPct) / 100;
        estimatedMonthlyCommission += (premium * compPct) / 100 / 12;
      }
    }

    // ── Backend Payments (deferred months 10, 11, 12) ──────────────────────────
    // Calculate backend payments from sales tracker data
    // Each paid sale contributes commission that's split across months 10, 11, 12
    // Total backend owed = sum of all commission amounts from paid sales
    
    let totalBackendOwed = 0;
    let totalMonth10 = 0;
    let totalMonth11 = 0;
    let totalMonth12 = 0;
    
    // Sum commission from all paid sales entries
    if (salesData) {
      for (const sale of salesData) {
        if (sale.isPaid) {
          // Calculate commission: premium * (commissionPercent / 100)
          const premium = parseFloat(sale.premium || "0") || 0;
          const commPercent = parseFloat(sale.commissionPercent || "0") || 0;
          const commAmount = (premium * commPercent) / 100;
          
          if (commAmount > 0) {
            const monthlyBackend = commAmount / 3; // Split equally across 3 months
            totalBackendOwed += commAmount;
            totalMonth10 += monthlyBackend;
            totalMonth11 += monthlyBackend;
            totalMonth12 += monthlyBackend;
          }
        }
      }
    }
    
    const backendPaymentsPerPolicy: Array<{
      clientId: number;
      carrier: string;
      type: string;
      policyNumber: string;
      monthlyComm: number;
      month10: number;
      month11: number;
      month12: number;
      totalBackend: number;
      effectiveDate: string | null;
      dueDate10: string | null;
      dueDate11: string | null;
      dueDate12: string | null;
      overdue10: boolean;
      overdue11: boolean;
      overdue12: boolean;
    }> = [];

    return {
      totalClients,
      totalPolicies: policies.length,
      activePolicies: activePolicies.length,
      totalAP,
      estimatedMonthlyCommission,
      estimatedAnnualCommission,
      policyAP: combinedPolicyAP,
      annuityAP,
      gwlAP,
      gwlTotalCount,
      lifeAP,
      issuedPaid,
      lifeCount,
      totalAnnuities: annuities.length,
      activeAnnuities: activeAnnuities.length,
      fiaCount: fiaAnnuities.length,
      mygaCount: mygaAnnuities.length,
      fiaAP,
      mygaAP,
      fiaAUM,
      mygaAUM,
      totalAUM,
      typeCounts,
      statusCounts,
      carrierCounts,
      carrierAP,
      typeAP,
      totalBackendOwed,
      totalMonth10,
      totalMonth11,
      totalMonth12,
      backendPaymentsPerPolicy,
      clientLoginStats: {
        loggedInClients: (clients || []).filter(c => c.lastPortalLogin).length,
        neverLoggedIn: (clients || []).filter(c => !c.lastPortalLogin).length,
      },
      totalAgents: agents.length,
      pendingPolicies: (policies ?? []).filter(p => p.status === 'pending' || !p.status).length,
    };
  }, [policiesList, clientsList, annuitiesList, gwlList, agentsList, allSalesData]);

  if (policiesLoading || clientsLoading || annuitiesLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#c9a84c]" size={32} />
      </div>
    );
  }

  const POLICY_TYPE_LABELS: Record<string, string> = {
    "WL": "Whole Life",
    "GWL": "Graded Whole Life",
    "Term": "Term Life",
    "Accidental": "Accidental Death",
    "IUL": "Indexed Universal Life (IUL)",
    "UL": "Universal Life (UL)",
    "Final Expense": "Final Expense",
    "FIA": "FIA (Fixed Indexed Annuity)",
    "MYGA": "MYGA (Multi-Year Guaranteed)",
    "fixed_annuity": "Fixed Annuity",
    "indexed_annuity": "FIA (Indexed Annuity)",
    "variable_annuity": "Variable Annuity",
    "immediate_annuity": "MYGA (Immediate Annuity)",
    "Graded Whole Life": "Graded Whole Life",
    "Whole Life Final Expense": "Whole Life Final Expense",
    "Whole Life": "Whole Life",
    "Annuity": "Annuity",
    "other": "Other",
  };
  const typeOrder = [
    "WL",
    "GWL",
    "Term",
    "Accidental",
    "IUL",
    "UL",
    "Final Expense",
    "FIA",
    "MYGA",
    "fixed_annuity",
    "indexed_annuity",
    "variable_annuity",
    "immediate_annuity",
    "Graded Whole Life",
    "Whole Life Final Expense",
    "Whole Life",
    "Annuity",
    "other",
  ];

  // Sort types: known types first in order, then any extras alphabetically
  const sortedTypes = Object.entries(stats.typeCounts).sort(([a], [b]) => {
    const idxA = typeOrder.indexOf(a);
    const idxB = typeOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  const sortedCarrierAP = Object.entries(stats.carrierAP).sort(
    ([, a], [, b]) => b - a
  );

  // Sort AP by type descending
  const sortedTypeAP = Object.entries(stats.typeAP).sort(
    ([, a], [, b]) => b.ap - a.ap
  );
  const maxTypeAP = sortedTypeAP[0]?.[1]?.ap || 1;
  const totalTypeAP = (sortedTypeAP || []).reduce((s, [, v]) => s + v.ap, 0);

  // Color palette for policy types
  const typeColorMap: Record<string, string> = {
    FIA: "from-emerald-500 to-emerald-400",
    MYGA: "from-blue-500 to-blue-400",
    "Graded Whole Life": "from-purple-500 to-purple-400",
    "Whole Life": "from-[#c9a84c] to-[#e8c84a]",
    "Term Life": "from-sky-500 to-sky-400",
    Term: "from-sky-500 to-sky-400",
    "Final Expense": "from-rose-500 to-rose-400",
    "Whole Life Final Expense": "from-orange-500 to-orange-400",
    Accidental: "from-teal-500 to-teal-400",
    Health: "from-cyan-500 to-cyan-400",
  };
  const defaultTypeColor = "from-gray-500 to-gray-400";

  return (
    <div className="space-y-8">

      
      {/* Policy Segregation KPIs - Phase 3 */}
      {!!user && <PolicySegregationKPIs adminId={user.id} />}

      {/* Top-level KPI Cards — Row 1: AP Metrics (4 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          className="card-luxury card-glow gold"
          icon={<DollarSign size={24} className="text-gold-light" />}
          label="Issued Paid"
          value={`$${stats.issuedPaid.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sublabel="Total paid out (all-time sales)"
          accent
        />
        <div
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setPolicyListModal({ type: "policies", isOpen: true })}
        >
          <KPICard
            className="card-luxury card-glow blue"
            icon={<FileSpreadsheet size={24} className="text-blue-400" />}
            label="Policy AP"
            value={`$${stats.policyAP.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            sublabel={`Life AP + Annuity AP combined`}
          />
        </div>
        <div
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setPolicyListModal({ type: "annuities", isOpen: true })}
        >
          <KPICard
            className="card-luxury card-glow purple"
            icon={<TrendingUp size={24} className="text-purple-400" />}
            label="Annuity AP"
            value={`$${stats.annuityAP.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            sublabel={`${stats.totalAnnuities} annuities (${stats.activeAnnuities} active)`}
          />
        </div>
        <div
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setPolicyListModal({ type: "gwl", isOpen: true })}
        >
          <KPICard
            className="card-luxury card-glow teal"
            icon={<Shield size={24} className="text-teal-400" />}
            label="Life AP"
            value={`$${stats.lifeAP.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            sublabel={`Total AP including backend (all types)`}
          />
        </div>
      </div>

      {/* Top-level KPI Cards — Row 2: Clients, Persistence, Agents (3 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          className="card-luxury card-glow pink"
          icon={<Users size={24} className="text-pink-400" />}
          label="Total Clients"
          value={String(stats.totalClients)}
          sublabel={`${stats.activePolicies} life + ${stats.activeAnnuities} annuities + ${stats.gwlTotalCount} GWL`}
        />
        {/* Admin's Own Persistence Rate KPI */}
        <AdminPersistenceKPICard />
        <button
          onClick={() => setShowAgentPerformanceModal(true)}
          className="group relative overflow-hidden rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-6 transition-all duration-300 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 card-luxury card-glow blue"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-blue-500/5 transition-all duration-300" />
          <div className="relative flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Users size={24} className="text-blue-400" />
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Agents</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalAgents || 0}</div>
            <div className="text-xs text-slate-400">Click to view performance</div>
          </div>
        </button>
      </div>

      {/* Commission & Backend Payments KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Est. Monthly Commission */}
        <div className="card-luxury card-glow gold bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
          <p className="text-xs text-emerald-400 uppercase tracking-wider mb-1">
            Est. Monthly Commission
          </p>
          <p className="text-2xl font-bold text-[#c9a84c]">
            $
            {stats.estimatedMonthlyCommission.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            From active life policies (based on stored commission rate)
          </p>
        </div>
        {/* Est. Annual Commission */}
        <div className="card-luxury card-glow gold bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
          <p className="text-xs text-emerald-400 uppercase tracking-wider mb-1">
            Est. Annual Commission
          </p>
          <p className="text-2xl font-bold text-[#c9a84c]">
            $
            {stats.estimatedAnnualCommission.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            9-month advance paid upfront per policy
          </p>
        </div>
        {/* Sales Tracker This Month */}
        {salesData && (() => {
          const monthlyCommission = (salesData as any[]).reduce((sum, sale) => {
            if (sale.isPaid) {
              const premium = parseFloat(sale.premium || "0") || 0;
              const commPercent = parseFloat(sale.commissionPercent || "0") || 0;
              return sum + (premium * commPercent) / 100;
            }
            return sum;
          }, 0);
          return (
            <div className="card-luxury card-glow gold bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
              <p className="text-xs text-emerald-400 uppercase tracking-wider mb-1">
                This Month Sales Commission
              </p>
              <p className="text-2xl font-bold text-[#c9a84c]">
                $
                {monthlyCommission.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {(salesData as any[]).length} sales entries this month
              </p>
            </div>
          );
        })()}
      </div>

      {/* Backend Payments Section */}
      <div className="card-luxury card-glow gold relative overflow-hidden bg-gradient-to-br from-[#0f1420] to-[#0a0e18] border border-amber-500/20 rounded-2xl p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-amber-400 text-xs font-semibold tracking-[0.2em] uppercase mb-2">
              Deferred Compensation
            </p>
            <h2 className="font-['Playfair_Display'] text-xl text-white leading-tight">
              Backend Payments Owed
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Months 10, 11 &amp; 12 — paid when they come due
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
              Total Owed
            </p>
            <p className="font-['Playfair_Display'] text-2xl text-amber-400 font-semibold">
              $
              {stats.totalBackendOwed.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
        {/* Month breakdown */}
        <div className="space-y-2 mb-6">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex justify-between items-center">
            <span className="text-xs text-amber-400 uppercase tracking-wider font-semibold">Month 10</span>
            <span className="text-xl font-bold text-white">${stats.totalMonth10.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex justify-between items-center">
            <span className="text-xs text-amber-400 uppercase tracking-wider font-semibold">Month 11</span>
            <span className="text-xl font-bold text-white">${stats.totalMonth11.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex justify-between items-center">
            <span className="text-xs text-amber-400 uppercase tracking-wider font-semibold">Month 12</span>
            <span className="text-xl font-bold text-white">${stats.totalMonth12.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
        {/* Per-policy breakdown table */}
        {stats.backendPaymentsPerPolicy.length > 0 && (
          <div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent mb-4" />
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Per-Policy Breakdown ({stats.backendPaymentsPerPolicy.length}{" "}
                policies)
              </p>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />{" "}
                  Overdue
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />{" "}
                  Upcoming
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-gray-500 inline-block" />{" "}
                  No date set
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="text-left border-b border-white/10">
                    <th className="text-xs text-gray-500 uppercase pb-2 pr-3">
                      Policy #
                    </th>
                    <th className="text-xs text-gray-500 uppercase pb-2 pr-3">
                      Carrier
                    </th>
                    <th className="text-xs text-gray-500 uppercase pb-2 pr-3">
                      Eff. Date
                    </th>
                    <th className="text-xs text-gray-500 uppercase pb-2 pr-3 text-right">
                      Mo. Comm
                    </th>
                    <th
                      className="text-xs text-gray-500 uppercase pb-2 pr-3 text-center"
                      colSpan={2}
                    >
                      Month 10
                    </th>
                    <th
                      className="text-xs text-gray-500 uppercase pb-2 pr-3 text-center"
                      colSpan={2}
                    >
                      Month 11
                    </th>
                    <th
                      className="text-xs text-gray-500 uppercase pb-2 text-center"
                      colSpan={2}
                    >
                      Month 12
                    </th>
                  </tr>
                  <tr className="border-b border-white/5">
                    <th colSpan={3} />
                    <th />
                    <th className="text-[10px] text-gray-600 uppercase pb-1 pr-1 text-right">
                      Amount
                    </th>
                    <th className="text-[10px] text-gray-600 uppercase pb-1 pr-3 text-left">
                      Due Date
                    </th>
                    <th className="text-[10px] text-gray-600 uppercase pb-1 pr-1 text-right">
                      Amount
                    </th>
                    <th className="text-[10px] text-gray-600 uppercase pb-1 pr-3 text-left">
                      Due Date
                    </th>
                    <th className="text-[10px] text-gray-600 uppercase pb-1 pr-1 text-right">
                      Amount
                    </th>
                    <th className="text-[10px] text-gray-600 uppercase pb-1 text-left">
                      Due Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(stats?.backendPaymentsPerPolicy || []).map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-white/5 hover:bg-white/[0.03] transition"
                    >
                      <td className="py-2 pr-3 text-white font-mono text-xs">
                        {row.policyNumber || "—"}
                      </td>
                      <td className="py-2 pr-3 text-gray-300 text-xs whitespace-nowrap">
                        {row.carrier}
                      </td>
                      <td className="py-2 pr-3 text-gray-400 text-xs whitespace-nowrap">
                        {row.effectiveDate ? (
                          row.effectiveDate
                        ) : (
                          <span className="text-gray-600 italic">Not set</span>
                        )}
                      </td>
                      <td className="py-2 pr-3 text-amber-400 text-xs text-right font-mono">
                        $
                        {row.monthlyComm.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      {/* Month 10 */}
                      <td className="py-2 pr-1 text-white text-xs text-right font-mono">
                        $
                        {row.month10.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td
                        className={`py-2 pr-3 text-xs whitespace-nowrap ${row.dueDate10 ? (row.overdue10 ? "text-red-400 font-semibold" : "text-amber-300") : "text-gray-600 italic"}`}
                      >
                        {row.dueDate10
                          ? row.overdue10
                            ? `⚠ ${row.dueDate10}`
                            : row.dueDate10
                          : "—"}
                      </td>
                      {/* Month 11 */}
                      <td className="py-2 pr-1 text-white text-xs text-right font-mono">
                        $
                        {row.month11.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td
                        className={`py-2 pr-3 text-xs whitespace-nowrap ${row.dueDate11 ? (row.overdue11 ? "text-red-400 font-semibold" : "text-amber-300") : "text-gray-600 italic"}`}
                      >
                        {row.dueDate11
                          ? row.overdue11
                            ? `⚠ ${row.dueDate11}`
                            : row.dueDate11
                          : "—"}
                      </td>
                      {/* Month 12 */}
                      <td className="py-2 pr-1 text-white text-xs text-right font-mono">
                        $
                        {row.month12.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td
                        className={`py-2 text-xs whitespace-nowrap ${row.dueDate12 ? (row.overdue12 ? "text-red-400 font-semibold" : "text-amber-300") : "text-gray-600 italic"}`}
                      >
                        {row.dueDate12
                          ? row.overdue12
                            ? `⚠ ${row.dueDate12}`
                            : row.dueDate12
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {stats.backendPaymentsPerPolicy.length === 0 && (
          <p className="text-gray-500 text-center py-4 italic text-sm">
            No active policies with comp rates found. Add carrier + product type
            to policies to see backend payment estimates.
          </p>
        )}
      </div>

      {/* Annuity Breakdown: FIA vs MYGA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-luxury card-glow teal bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
          <p className="text-xs text-emerald-400 uppercase tracking-wider mb-1">
            FIA Count
          </p>
          <p className="text-2xl font-bold text-white">{stats.fiaCount}</p>
        </div>
        <div className="card-luxury card-glow teal bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
          <p className="text-xs text-emerald-400 uppercase tracking-wider mb-1">
            FIA AUM
          </p>
          <p className="text-2xl font-bold text-[#c9a84c]">
            $
            {stats.fiaAUM.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.fiaCount} active FIA policies
          </p>
        </div>
        <div className="card-luxury card-glow blue bg-blue-500/5 border border-blue-500/20 rounded-xl p-5">
          <p className="text-xs text-blue-400 uppercase tracking-wider mb-1">
            MYGA Count
          </p>
          <p className="text-2xl font-bold text-white">{stats.mygaCount}</p>
        </div>
        <div className="card-luxury card-glow blue bg-blue-500/5 border border-blue-500/20 rounded-xl p-5">
          <p className="text-xs text-blue-400 uppercase tracking-wider mb-1">
            MYGA AUM
          </p>
          <p className="text-2xl font-bold text-[#c9a84c]">
            $
            {stats.mygaAUM.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.mygaCount} active MYGA policies
          </p>
        </div>
      </div>

      {/* Policy Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <PieChart className="text-[#c9a84c]" size={20} />
            <h2 className="font-['Playfair_Display'] text-xl text-white">
              Policy Type Breakdown
            </h2>
          </div>
          <div className="space-y-3">
            {sortedTypes.map(([type, count]) => {
              const pct =
                stats.totalPolicies > 0
                  ? (count / stats.totalPolicies) * 100
                  : 0;
              return (
                <div key={type}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-300 text-sm">{POLICY_TYPE_LABELS[type] ?? type}</span>
                    <span className="text-white font-semibold text-sm">
                      {count}{" "}
                      <span className="text-gray-500 font-normal">
                        ({pct.toFixed(0)}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-[#c9a84c] to-[#e8c84a]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="text-[#c9a84c]" size={20} />
            <h2 className="font-['Playfair_Display'] text-xl text-white">
              Policy Status Overview
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {(["active", "pending", "expired", "cancelled"] as const).map(
              status => {
                const count = stats.statusCounts[status] || 0;
                const colorMap = {
                  active: {
                    bg: "bg-[#c9a84c]/10",
                    border: "border-[#c9a84c]/30",
                    text: "text-[#c9a84c]",
                  },
                  pending: {
                    bg: "bg-yellow-500/10",
                    border: "border-yellow-500/30",
                    text: "text-yellow-400",
                  },
                  expired: {
                    bg: "bg-gray-500/10",
                    border: "border-gray-500/30",
                    text: "text-gray-400",
                  },
                  cancelled: {
                    bg: "bg-red-500/10",
                    border: "border-red-500/30",
                    text: "text-red-400",
                  },
                };
                const c = colorMap[status];
                return (
                  <div
                    key={status}
                    className={`${c.bg} border ${c.border} rounded-lg p-4 text-center card-luxury card-glow ${status === 'active' ? 'gold' : status === 'pending' ? 'gold' : status === 'expired' ? 'blue' : 'pink'}`}
                  >
                    <p className={`text-3xl font-bold ${c.text}`}>{count}</p>
                    <p className="text-gray-400 text-sm capitalize mt-1">
                      {status}
                    </p>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* AP by Policy Type */}
      <div className="card-luxury card-glow gold relative overflow-hidden bg-gradient-to-br from-[#0f1420] to-[#0a0e18] border border-[#c9a84c]/20 rounded-2xl p-8">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#c9a84c]/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#c9a84c]/3 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.2em] uppercase mb-2">
              Portfolio Breakdown
            </p>
            <h2 className="font-['Playfair_Display'] text-2xl text-white leading-tight">
              Annualized Premium
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              by Policy Type · Active records, all sources
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
              Total AP
            </p>
            <p className="font-['Playfair_Display'] text-2xl text-[#c9a84c] font-semibold">
              $
              {totalTypeAP.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#c9a84c]/30 to-transparent mb-8" />

        {sortedTypeAP.length === 0 ? (
          <p className="text-gray-500 text-center py-8 italic">
            No active records with AP data
          </p>
        ) : (
          <div className="space-y-6">
            {sortedTypeAP.map(([type, { ap, count }], idx) => {
              const barPct = (ap / maxTypeAP) * 100;
              const sharePct = totalTypeAP > 0 ? (ap / totalTypeAP) * 100 : 0;
              const gradient = typeColorMap[type] || defaultTypeColor;
              const rank = idx + 1;
              return (
                <div key={type} className={`group card-luxury card-glow ${typeColorMap[type] ? typeColorMap[type].split(' ')[0].replace('from-', '') : 'gold'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[#c9a84c]/40 text-xs font-mono w-4 text-right">
                        {rank < 10 ? `0${rank}` : rank}
                      </span>
                      <span className="text-white text-sm font-medium tracking-wide">
                        {type}
                      </span>
                      <span className="text-[10px] text-gray-600 border border-white/10 rounded px-1.5 py-0.5 font-mono">
                        {count} {count === 1 ? "policy" : "policies"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[#c9a84c]/70 text-xs font-mono">
                        {sharePct.toFixed(1)}%
                      </span>
                      <span className="text-white font-semibold text-sm tabular-nums">
                        $
                        {ap.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                  {/* Track */}
                  <div className="relative w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${gradient} transition-all duration-700 ease-out`}
                      style={{ width: `${barPct}%` }}
                    />
                    {/* Shimmer overlay */}
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-700 ease-out"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AP by Carrier */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0f1420] to-[#0a0e18] border border-[#c9a84c]/20 rounded-2xl p-8">
        {/* Decorative accents */}
        <div className="absolute top-0 left-0 w-48 h-48 bg-[#c9a84c]/4 rounded-full -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#c9a84c]/3 rounded-full translate-y-1/2 translate-x-1/2 pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.2em] uppercase mb-2">
              Carrier Distribution
            </p>
            <h2 className="font-['Playfair_Display'] text-2xl text-white leading-tight">
              Annual Premium
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              by Carrier · Active policies &amp; annuities
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
              Carriers
            </p>
            <p className="font-['Playfair_Display'] text-2xl text-[#c9a84c] font-semibold">
              {sortedCarrierAP.length}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#c9a84c]/30 to-transparent mb-8" />

        {sortedCarrierAP.length === 0 ? (
          <p className="text-gray-500 text-center py-8 italic">
            No active policies with AP data
          </p>
        ) : (
          <div className="space-y-5">
            {sortedCarrierAP.map(([carrier, ap], idx) => {
              const maxAP = sortedCarrierAP[0]?.[1] || 1;
              const pct = (ap / maxAP) * 100;
              const totalCarrierAP = (sortedCarrierAP || []).reduce(
                (s, [, v]) => s + v,
                0
              );
              const sharePct =
                totalCarrierAP > 0 ? (ap / totalCarrierAP) * 100 : 0;
              const policyCount = (policiesList || []).filter(
                p => p.carrier === carrier && p.status === "active"
              ).length;
              const annuityCount = (annuitiesList || []).filter(
                a => a.carrier === carrier && a.status === "active"
              ).length;
              const totalCount = policyCount + annuityCount;
              const rank = idx + 1;
              // Top carrier gets gold, rest get a subtle teal-to-blue gradient
              const barGradient =
                rank === 1
                  ? "from-[#c9a84c] to-[#e8c84a]"
                  : rank === 2
                    ? "from-[#c9a84c]/80 to-[#e8c84a]/80"
                    : "from-[#c9a84c]/50 to-[#e8c84a]/50";
              return (
                <div key={carrier} className="group">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[#c9a84c]/40 text-xs font-mono w-4 text-right">
                        {rank < 10 ? `0${rank}` : rank}
                      </span>
                      <span className="text-white text-sm font-medium tracking-wide">
                        {carrier}
                      </span>
                      <span className="text-[10px] text-gray-600 border border-white/10 rounded px-1.5 py-0.5 font-mono">
                        {totalCount} {totalCount === 1 ? "product" : "products"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[#c9a84c]/70 text-xs font-mono">
                        {sharePct.toFixed(1)}%
                      </span>
                      <span className="text-white font-semibold text-sm tabular-nums">
                        $
                        {ap.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                  {/* Track */}
                  <div className="relative w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${barGradient} transition-all duration-700 ease-out`}
                      style={{ width: `${pct}%` }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-all duration-700 ease-out"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Policy List Modal */}
      {policyListModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/10 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {policyListModal.type === "policies" && "Life Policies"}
                {policyListModal.type === "annuities" && "Annuities"}
                {policyListModal.type === "gwl" && "Graded Whole Life Policies"}
              </h3>
              <button
                onClick={() => setPolicyListModal({ ...policyListModal, isOpen: false })}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              {policyListModal.type === "policies" && (
                <div className="space-y-3">
                  {(policiesList || []).filter(p => p.status === "active").map((policy) => {
                    const client = clientsList?.find(c => c.id === policy.clientId);
                    return (
                      <div key={policy.id} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-white">{client ? `${client.firstName} ${client.lastName}` : "Unknown Client"}</p>
                            <p className="text-sm text-gray-400">{policy.policyNumber || ''}</p>
                            <p className="text-xs text-gray-500 mt-1">{policy.carrier} - {policy.type}</p>
                          </div>
                          <p className="font-bold text-[#c9a84c] ml-4">${policy.yearlyAP}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {policyListModal.type === "annuities" && (
                <div className="space-y-3">
                  {(annuitiesList || []).filter(a => a.status === "active").map((annuity) => {
                    const client = clientsList?.find(c => c.id === annuity.clientId);
                    const displayName = client ? `${client.firstName} ${client.lastName}` : annuity.clientName || "Unknown Client";
                    return (
                      <div key={annuity.id} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-white">{displayName}</p>
                            <p className="text-xs text-gray-500 mt-1">{annuity.id}</p>
                            <p className="text-sm text-gray-400 mt-1">{annuity.carrier} - {annuity.type}</p>
                            {annuity.productName && <p className="text-xs text-gray-500 mt-1">{annuity.productName}</p>}
                          </div>
                          <p className="font-bold text-[#c9a84c] ml-4">${Number(annuity.premium).toFixed(2)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {policyListModal.type === "gwl" && (
                <div className="space-y-3">
                  {/* GWL from dedicated GWL table */}
                  {(gwlList || []).filter(g => g.status === "active").map((gwl) => {
                    const client = clientsList?.find(c => c.id === gwl.clientId);
                    return (
                      <div key={`gwl-${gwl.id}`} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-white">{client ? `${client.firstName} ${client.lastName}` : "Unknown Client"}</p>
                            <p className="text-sm text-gray-400">{gwl.policyNumber}</p>
                            <p className="text-xs text-gray-500 mt-1">{gwl.carrier} - Graded Whole Life</p>
                          </div>
                          <p className="font-bold text-[#c9a84c] ml-4">${gwl.yearlyAP}</p>
                        </div>
                      </div>
                    );
                  })}
                  {/* Graded policies from regular policies table */}
                  {(policiesList || []).filter(p => p.status === "active" && p.type.toLowerCase().includes("graded")).map((policy) => {
                    const client = clientsList?.find(c => c.id === policy.clientId);
                    return (
                      <div key={`policy-${policy.id}`} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-white">{client ? `${client.firstName} ${client.lastName}` : "Unknown Client"}</p>
                            <p className="text-sm text-gray-400">{policy.policyNumber || ''}</p>
                            <p className="text-xs text-gray-500 mt-1">{policy.carrier} - {policy.type}</p>
                          </div>
                          <p className="font-bold text-[#c9a84c] ml-4">${policy.yearlyAP}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Quick Actions Panel */}
      <div className="card-luxury card-glow gold mt-12 bg-gradient-to-br from-slate-900/40 to-slate-900/20 border border-white/10 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="text-amber-400" size={24} />
          <h3 className="text-2xl font-bold text-white">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setShowIntakeForm(true)}
            className="group relative p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 hover:border-blue-400/60 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 card-luxury card-glow blue"
          >
            <div className="flex items-center gap-3 mb-2">
              <Users size={20} className="text-blue-400 group-hover:text-blue-300" />
              <span className="font-semibold text-white group-hover:text-blue-100">Add New Client</span>
            </div>
            <p className="text-sm text-gray-400">Create a new client and start building relationships</p>
          </button>
          <button
            className="group relative p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 hover:border-purple-400/60 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 card-luxury card-glow purple"
          >
            <div className="flex items-center gap-3 mb-2">
              <UserPlus size={20} className="text-purple-400 group-hover:text-purple-300" />
              <span className="font-semibold text-white group-hover:text-purple-100">Create Policy</span>
            </div>
            <p className="text-sm text-gray-400">Protect what matters most</p>
          </button>
          <button
            className="group relative p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 hover:border-emerald-400/60 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 card-luxury card-glow teal"
          >
            <div className="flex items-center gap-3 mb-2">
              <Shield size={20} className="text-emerald-400 group-hover:text-emerald-300" />
              <span className="font-semibold text-white group-hover:text-emerald-100">Log A Sale</span>
            </div>
            <p className="text-sm text-gray-400">Track your success</p>
          </button>
          <button
            className="group relative p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 hover:border-amber-400/60 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20 card-luxury card-glow gold"
          >
            <div className="flex items-center gap-3 mb-2">
              <Calendar size={20} className="text-amber-400 group-hover:text-amber-300" />
              <span className="font-semibold text-white group-hover:text-amber-100">Schedule Review</span>
            </div>
            <p className="text-sm text-gray-400">Stay connected with clients</p>
          </button>
        </div>
      </div>

      <AgentPerformanceModal isOpen={showAgentPerformanceModal} onClose={() => setShowAgentPerformanceModal(false)} />
      <AnnualReviewModal isOpen={showAnnualReviewModal} onClose={() => setShowAnnualReviewModal(false)} />
    </div>
  );
}

/* ─── Sales Tracker Tab ────────────────────────────────────────────────────── */

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const PRODUCT_TYPES = [
  "Whole Life",
  "Term Life",
  "Final Expense",
  "Graded Whole Life",
  "Accidental",
  "FIA",
  "MYGA",
  "Health",
  "Commercial",
  "Other",
];

function SalesTrackerTab() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form state
  const [clientName, setClientName] = useState("");
  const [productType, setProductType] = useState("");
  const [carrier, setCarrier] = useState("");
  const [premium, setPremium] = useState("");
  const [yearlyAP, setAnnualPremium] = useState("");
  const [commissionPercent, setCommissionPercent] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [saleDate, setSaleDate] = useState("");
  const [notes, setNotes] = useState("");

  const utils = trpc.useUtils();

  // Check admin session (inherited from AdminDashboardPINWrapper)
  const { data: adminSession } = trpc.adminAuth.checkSession.useQuery();

  const { data: salesData, isLoading, error: salesError } = trpc.admin.getSalesByMonth.useQuery(
    {
      month: selectedMonth,
      year: selectedYear,
    },
    {
      enabled: adminSession?.authenticated ?? false,
    }
  );



  const { data: agentSalesData } = trpc.admin.getAgentSalesByMonth.useQuery(
    {
      month: selectedMonth,
      year: selectedYear,
    },
    {
      enabled: adminSession?.authenticated ?? false,
    }
  );

  const { data: annuityData } = trpc.admin.getAnnuitiesByMonth.useQuery(
    {
      month: selectedMonth,
      year: selectedYear,
    },
    {
      enabled: adminSession?.authenticated ?? false,
    }
  );

  const { data: expensesByMonth } = trpc.admin.listExpensesByMonth.useQuery(
    {
      month: selectedMonth,
      year: selectedYear,
    },
    {
      enabled: adminSession?.authenticated ?? false,
    }
  );

  const createMutation = trpc.admin.createSale.useMutation({
    onSuccess: () => {
      toast.success("Sale entry added!");
      utils.admin.getSalesByMonth.invalidate({
        month: selectedMonth,
        year: selectedYear,
      });
      resetForm();
      setShowAddForm(false);
    },
    onError: err => toast.error(err.message),
  });

  const updateMutation = trpc.admin.updateSale.useMutation({
    onSuccess: () => {
      toast.success("Sale entry updated!");
      utils.admin.getSalesByMonth.invalidate({
        month: selectedMonth,
        year: selectedYear,
      });
      resetForm();
      setEditingId(null);
    },
    onError: err => toast.error(err.message),
  });

  const deleteMutation = trpc.admin.deleteSale.useMutation({
    onSuccess: () => {
      toast.success("Sale entry deleted.");
      utils.admin.getSalesByMonth.invalidate({
        month: selectedMonth,
        year: selectedYear,
      });
    },
    onError: err => toast.error(err.message),
  });

  const bulkDeleteMutation = trpc.admin.bulkDeleteSales.useMutation({
    onSuccess: () => {
      toast.success(`${selectedIds.size} sale(s) deleted successfully!`);
      setSelectedIds(new Set());
      setShowDeleteConfirm(false);
      utils.admin.getSalesByMonth.invalidate({
        month: selectedMonth,
        year: selectedYear,
      });
    },
    onError: err => toast.error(err.message),
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const ids = new Set((allEntries || []).map(e => e.id));
      setSelectedIds(ids);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectEntry = (id: string | number, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkDelete = () => {
    const idsToDelete = Array.from(selectedIds).filter(id => typeof id === 'number') as number[];
    if (idsToDelete.length > 0) {
      bulkDeleteMutation.mutate({ ids: idsToDelete });
    }
  };

  function resetForm() {
    setClientName("");
    setProductType("");
    setCarrier("");
    setPremium("");
    setAnnualPremium("");
    setCommissionPercent("");
    setEffectiveDate("");
    setSaleDate("");
    setNotes("");
  }

  function handleCarrierChange(newCarrier: string) {
    setCarrier(newCarrier);
    // Commission % is entered manually — no auto-fill
  }
  function handleProductTypeChange(newType: string) {
    setProductType(newType);
        // Commission % is entered manually — no auto-fill
  }
  function handlePremiumChange(val: string) {
    setPremium(val);
    if (val && commissionPercent) {
      const ap = parseFloat(val) * 12;
      setAnnualPremium(String(ap.toFixed(2)));
    }
  }

  function handleCommissionPercentChange(val: string) {
    setCommissionPercent(val);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dateTs = saleDate ? new Date(saleDate).getTime() : Date.now();

    if (editingId !== null) {
      updateMutation.mutate({
        id: editingId,
        clientName,
        productType,
        carrier,
        premium,
        yearlyAP: yearlyAP || undefined,
        commissionPercent: commissionPercent || undefined,
        saleDate: dateTs,
        saleMonth: selectedMonth,
        saleYear: selectedYear,
        notes: notes || undefined,
      });
    } else {
      createMutation.mutate({
        clientName,
        productType,
        carrier,
        premium,
        yearlyAP: yearlyAP || undefined,
        commissionPercent: commissionPercent || undefined,
        saleDate: dateTs,
        saleMonth: selectedMonth,
        saleYear: selectedYear,
        notes: notes || undefined,
      });
    }
  }

  function startEdit(entry: any) {
    setEditingId(entry.id);
    setClientName(entry.clientName);
    setProductType(entry.productType);
    setCarrier(entry.carrier);
    setPremium(entry.premium || "");
    setAnnualPremium(entry.yearlyAP || "");
    setCommissionPercent(entry.commissionPercent || "");
    setEffectiveDate(
      entry.effectiveDate ? new Date(entry.effectiveDate).toISOString().split("T")[0] : ""
    );
    setSaleDate(
      entry.saleDate ? new Date(entry.saleDate).toISOString().split("T")[0] : ""
    );
    setNotes(entry.notes || "");
    setShowAddForm(true);
  }

  // Summary calculations — combine manual entries + annuity records
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-white">Loading sales data...</p>
        </div>
      </div>
    );
  }

  const entries = salesData || [];
  const annuityEntries = (annuityData || []).map(a => ({
    id: `annuity-${a.id}`,
    clientName: a.clientName,
    productType:
      a.type === "FIA"
        ? "Fixed Index Annuity"
        : "Multi-Year Guaranteed Annuity",
    carrier: a.carrier,
    premium: a.premium,
    yearlyAP: a.commissionPercent
      ? String(
          (parseFloat(a.premium || "0") *
            parseFloat(a.commissionPercent || "0")) /
            100
        )
      : a.premium,
    commissionPercent: a.commissionPercent,
    commissionOverride: null,
    isPaid: false,
    isCanceled: false,
    commissionAmount: a.commissionPercent
      ? String(
          (parseFloat(a.premium || "0") *
            parseFloat(a.commissionPercent || "0")) /
            100
        )
      : null,
    saleDate: a.effectiveDate,
    notes: a.productName ? `Product: ${a.productName}` : null,
    isAnnuity: true,
  }));
  const allEntries = [
    ...(entries || []).map(e => ({ ...e, isAnnuity: false })),
    ...annuityEntries,
  ].sort((a, b) => (a.saleDate || 0) - (b.saleDate || 0));
  const totalPremium = (allEntries || []).reduce(
    (s, e) => s + parseFloat(e.premium || "0"),
    0
  );
  const totalAP = (allEntries || []).reduce(
    (s, e) => s + parseFloat((e as any).annualPremium || e.yearlyAP || "0"),
    0
  );
    // Total Commission = AP × actual COMM% entered per entry
  const totalCommission = (allEntries || []).reduce(
    (s, e) => {
      const ap = parseFloat((e as any).annualPremium || e.yearlyAP || "0");
      const commPct = parseFloat(
        e.commissionOverride ? String(e.commissionOverride) : e.commissionPercent || "0"
      ) / 100;
      return s + (ap * commPct);
    },
    0
  );
  // Issued Paid Premium = 75% of total commission (advance portion)
  const issuedPaidPremium = totalCommission * 0.75;

  // Calculate total expenses for the month
  const totalExpenses = (expensesByMonth || []).reduce(
    (s: number, e: any) => s + parseFloat(e.amount || "0"),
    0
  );

  // Calculate accurate revenue: issued paid premium - total expenses
  const accurateRevenue = issuedPaidPremium - totalExpenses;

    // Calculate month 10, 11, 12 expected revenue = 25% of commission split across 3 months
  // (The advance/issued paid is 75%, the backend portion is the remaining 25%)
  const month10_11_12Revenues = (allEntries || []).filter((e: any) => !e.isAnnuity && !e.isCanceled).reduce(
    (acc: any, entry: any) => {
      const ap = parseFloat((entry as any).annualPremium || entry.yearlyAP || "0");
      const commPct = parseFloat(
        entry.commissionOverride ? String(entry.commissionOverride) : entry.commissionPercent || "0"
      ) / 100;
      const totalComm = ap * commPct;
      const backendCommission = totalComm * 0.25; // 25% backend portion
      const monthlyPayment = backendCommission / 3;
      return {
        month10: acc.month10 + monthlyPayment,
        month11: acc.month11 + monthlyPayment,
        month12: acc.month12 + monthlyPayment,
      };
    },
    { month10: 0, month11: 0, month12: 0 }
  );

  const totalMonth10_11_12Revenue = 
    month10_11_12Revenues.month10 + 
    month10_11_12Revenues.month11 + 
    month10_11_12Revenues.month12;

  // Generate year options (2020 to current year + 1)
  const yearOptions: number[] = [];
  for (let y = 2020; y <= now.getFullYear() + 1; y++) yearOptions.push(y);

  return (
    <div className="space-y-6">
      {/* Month/Year Selector */}
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="font-['Playfair_Display'] text-2xl text-white">
          Monthly Sales Tracker
        </h2>
        <div className="flex items-center gap-2 ml-auto">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm"
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={i} value={i + 1} className="bg-[#0a1628] text-white">
                {name}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm"
          >
            {yearOptions.map(y => (
              <option key={y} value={y} className="bg-[#0a1628] text-white">
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-xl p-5">
          <p className="text-xs text-[#c9a84c] uppercase tracking-wider mb-1">
            Total Sales
          </p>
          <p className="text-2xl font-bold text-[#c9a84c]">
            {allEntries.length}
          </p>
          <p className="text-xs text-[#c9a84c]/60 mt-1">
            {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Total Monthly Premium
          </p>
          <p className="text-2xl font-bold text-white">
            $
            {totalPremium.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-gray-500 mt-1">Sum of monthly premiums</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Total Annual Premium (AP)
          </p>
          <p className="text-2xl font-bold text-white">
            $
            {totalAP.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Annualized across all sales
          </p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5">
          <p className="text-xs text-emerald-400 uppercase tracking-wider mb-1">
            Total Commission Earned
          </p>
          <p className="text-2xl font-bold text-emerald-400">
            $
            {totalCommission.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-emerald-400/60 mt-1">
            {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
          </p>
        </div>
        <IssuedPaidPremiumKPI issuedPaidPremium={issuedPaidPremium} totalPremium={totalPremium} />
        <AdvancePaidCard 
          totalAP={totalAP}
          carrierRates={[]}
        />
        <AccurateRevenueKPI issuedPaidPremium={issuedPaidPremium} totalExpenses={totalExpenses} month={selectedMonth} year={selectedYear} />
        <Month10_11_12ExpectedRevenueKPI 
          month10Revenue={month10_11_12Revenues.month10}
          month11Revenue={month10_11_12Revenues.month11}
          month12Revenue={month10_11_12Revenues.month12}
          currentMonth={selectedMonth}
          currentYear={selectedYear}
        />
      </div>

      {/* Expense Tracker Section */}
      <ExpenseTracker month={selectedMonth} year={selectedYear} />

      {/* Add Entry Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            resetForm();
            setEditingId(null);
            setShowAddForm(!showAddForm);
          }}
          className="flex items-center gap-2 bg-[#c9a84c] text-black px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#d4af37] transition"
        >
          {showAddForm ? <X size={16} /> : <Plus size={16} />}
          {showAddForm ? "Cancel" : "Add Sale"}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4"
        >
          <h3 className="text-lg font-semibold text-white mb-2">
            {editingId !== null ? "Edit Sale Entry" : "New Sale Entry"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">
                Client Name *
              </label>
              <input
                type="text"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">
                Product Type *
              </label>
              <select
                value={productType}
                onChange={e => handleProductTypeChange(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                required
              >
                <option value="" className="bg-[#0a1628]">
                  Select type...
                </option>
                {PRODUCT_TYPES.map(t => (
                  <option key={t} value={t} className="bg-[#0a1628]">
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">
                Carrier *
              </label>
              <CarrierSelect
                value={carrier}
                onChange={handleCarrierChange}
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">
                Monthly Premium *
              </label>
              <input
                type="number"
                step="0.01"
                value={premium}
                onChange={e => handlePremiumChange(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">
                Annual Premium (AP)
              </label>
              <input
                type="number"
                step="0.01"
                value={yearlyAP}
                onChange={e => setAnnualPremium(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">
                Commission %
              </label>
              <input
                type="number"
                step="0.01"
                value={commissionPercent}
                onChange={e => handleCommissionPercentChange(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">
                Effective Date
              </label>
              <input
                type="date"
                value={effectiveDate}
                onChange={e => setEffectiveDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">
                Sale Date
              </label>
              <input
                type="date"
                value={saleDate}
                onChange={e => setSaleDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-1">
              <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">
                Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="Optional notes..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setEditingId(null);
                setShowAddForm(false);
              }}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex items-center gap-2 bg-[#c9a84c] text-black px-5 py-2 rounded-lg font-semibold text-sm hover:bg-[#d4af37] transition disabled:opacity-50"
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 size={14} className="animate-spin" />
              )}
              {editingId !== null ? "Update Entry" : "Add Entry"}
            </button>
          </div>
        </form>
      )}

      {/* Sales Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-[#c9a84c]" size={32} />
        </div>
      ) : allEntries.length === 0 ? (
        <div className="text-center py-16 bg-white/5 border border-white/10 rounded-xl">
          <DollarSign className="mx-auto text-gray-600 mb-4" size={48} />
          <p className="text-gray-400 text-lg">
            No sales recorded for {MONTH_NAMES[selectedMonth - 1]}{" "}
            {selectedYear}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Click "Add Sale" to record your first entry, or add annuities with
            an effective date in this month.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Admin Personal Sales Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#c9a84c]"></span>
              Admin Personal Sales
            </h3>
            {selectedIds.size > 0 && (
              <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <span className="text-amber-300 font-semibold">
                {selectedIds.size} sale(s) selected
              </span>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition"
              >
                <Trash2 size={16} />
                Delete Selected
              </button>
            </div>
            )}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-center px-4 py-3 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === allEntries.length && allEntries.length > 0}
                      onChange={e => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                    Client
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                    Product
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                    Carrier
                  </th>
                  <th className="text-right px-4 py-3 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                    Premium
                  </th>
                  <th className="text-right px-4 py-3 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                    AP
                  </th>
                  <th className="text-right px-4 py-3 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                    Comm %
                  </th>
                  <th className="text-center px-4 py-3 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                    Actions
                    </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(allEntries || []).map(entry => {
                  const pt = (entry.productType || "").toLowerCase();
                  const isAnnuityType =
                    entry.isAnnuity ||
                    pt.includes("fia") ||
                    pt.includes("myga") ||
                    pt.includes("annuity") ||
                    pt.includes("fixed index");
                  const isLifeType =
                    !isAnnuityType &&
                    (pt.includes("life") ||
                      pt.includes("term") ||
                      pt.includes("whole") ||
                      pt.includes("final expense") ||
                      pt.includes("universal") ||
                      pt.includes("graded") ||
                      pt.includes("accidental"));
                  return (
                    <tr
                      key={String(entry.id)}
                      className={`border-b border-white/5 hover:bg-white/5 transition ${
                        (entry as any).tagColor === 'hotpink'
                          ? "bg-pink-500/30 border-b border-pink-500/60"
                          : entry.isPaid
                            ? "bg-green-500/15 border-b border-green-500/40"
                            : entry.isCanceled
                              ? "bg-red-600/35 border-b border-red-600/70"
                              : "bg-yellow-500/20 border-b border-yellow-500/40"
                      }`}
                    >
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(entry.id)}
                          onChange={e => handleSelectEntry(entry.id, e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                        {entry.saleDate
                          ? new Date(entry.saleDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-white font-medium whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {entry.clientName}
                          {isAnnuityType && (
                            <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded px-1.5 py-0.5 font-semibold uppercase tracking-wider">
                              Annuity
                            </span>
                          )}
                          {isLifeType && (
                            <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 rounded px-1.5 py-0.5 font-semibold uppercase tracking-wider">
                              Life
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                        {entry.productType}
                      </td>
                      <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                        {entry.carrier}
                      </td>
                      <td className="px-4 py-3 text-white text-right whitespace-nowrap">
                        $
                        {parseFloat(entry.premium || "0").toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        )}
                      </td>
                      <td className="px-4 py-3 text-white text-right whitespace-nowrap">
                        {entry.annualPremium
                          ? `$${parseFloat(entry.annualPremium as string).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-right whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max="200"
                          step="0.5"
                          defaultValue={entry.commissionOverride ? Number(entry.commissionOverride) : Number(entry.commissionPercent) || 110}
                          onBlur={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) {
                              updateMutation.mutate({
                                id: entry.id as number,
                                commissionOverride: val,
                              });
                            }
                          }}
                          className="w-16 px-2 py-1 text-xs rounded border border-white/20 bg-slate-800 text-white text-right focus:outline-none focus:border-[#c9a84c] transition"
                        />
                        <span className="text-gray-400 text-xs ml-0.5">%</span>
                      </td>

                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {entry.isAnnuity ? (
                          <span className="text-xs text-gray-500 italic">
                            Auto
                          </span>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <select
                              value={entry.isCanceled ? "canceled" : entry.isPaid ? "paid" : "unpaid"}
                              onChange={(e) => {
                                const status = e.target.value;
                                updateMutation.mutate({
                                  id: entry.id as number,
                                  isPaid: status === "paid",
                                  isCanceled: status === "canceled",
                                });
                              }}
                              className="px-2 py-1 text-xs rounded border border-white/20 bg-slate-800 text-gray-200 hover:bg-slate-700 transition cursor-pointer font-medium"
                              disabled={updateMutation.isPending}
                            >
                              <option value="unpaid" className="bg-slate-800 text-gray-200">Unpaid</option>
                              <option value="paid" className="bg-slate-800 text-gray-200">Paid</option>
                              <option value="canceled" className="bg-slate-800 text-gray-200">Canceled</option>
                            </select>
                            <button
                              onClick={() => startEdit(entry as any)}
                              className="text-gray-400 hover:text-[#c9a84c] transition"
                              title="Edit"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Delete this sale entry?"))
                                  deleteMutation.mutate({
                                    id: entry.id as number,
                                  });
                              }}
                              className="text-gray-400 hover:text-red-400 transition"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Totals Row */}
              <tfoot>
                <tr className="border-t border-white/10 bg-white/5">
                  <td
                    className="px-4 py-3 text-[#c9a84c] font-bold"
                    colSpan={4}
                  >
                    TOTALS ({allEntries.length} sales)
                  </td>
                  <td className="px-4 py-3 text-[#c9a84c] font-bold text-right">
                    $
                    {totalPremium.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-4 py-3 text-[#c9a84c] font-bold text-right">
                    $
                    {totalAP.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-emerald-400 font-bold text-right">
                    $
                    {totalCommission.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
              </table>
            </div>

              {/* Backend Payments Section */}
              <div className="mt-8">
                <div className="bg-slate-800/50 border border-white/10 rounded-lg p-6">
                  <ClientBackendPayments
                    entries={allEntries.filter(e => !e.isAnnuity)
                      .map(e => ({
                        clientName: e.clientName,
                        premium: parseFloat(e.premium || "0"),
                        commissionPercent: parseFloat(e.commissionOverride ? String(e.commissionOverride) : e.commissionPercent || "110"),
                        effectiveDate: e.saleDate || Date.now(),
                        policyNumber: e.id?.toString() || "N/A",
                        carrier: e.carrier,
                      }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
          <div className="bg-[#0a1628] border border-white/10 rounded-xl p-6 max-w-sm">
            <h3 className="text-lg font-semibold text-white mb-2">
              Delete {selectedIds.size} Sale(s)?
            </h3>
            <p className="text-gray-400 mb-6">
              This action cannot be undone. Are you sure you want to delete the selected sales?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleteMutation.isPending}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition disabled:opacity-50"
              >
                {bulkDeleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agent Sales Section - Phase 5 */}
      <AgentSalesSection agentSalesData={agentSalesData} isLoading={isLoading} />
    </div>
  );
}

/* ─── Agent Sales Section (Phase 5) ─────────────────────────────────────── */
// The Agent Sales section is now handled by the separate AgentSalesSection component
// See: client/src/components/AgentSalesSection.tsx

/* ─── KPI Card ─────────────────────────────────────────────────────────────── */

function KPICard({
  icon,
  label,
  value,
  sublabel,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel: string;
  accent?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  
  // Gradient colors for each KPI card
  const gradients = [
    { border: "border-blue-500/50 hover:border-blue-400", shadow: "shadow-blue-500/20", from: "from-blue-500", to: "to-cyan-500" },
    { border: "border-purple-500/50 hover:border-purple-400", shadow: "shadow-purple-500/20", from: "from-purple-500", to: "to-pink-500" },
    { border: "border-emerald-500/50 hover:border-emerald-400", shadow: "shadow-emerald-500/20", from: "from-emerald-500", to: "to-teal-500" },
    { border: "border-amber-500/50 hover:border-amber-400", shadow: "shadow-amber-500/20", from: "from-amber-500", to: "to-orange-500" },
    { border: "border-rose-500/50 hover:border-rose-400", shadow: "shadow-rose-500/20", from: "from-rose-500", to: "to-pink-500" },
  ];
  
  const gradient = gradients[label.charCodeAt(0) % gradients.length];
  
  return (
    <motion.div
      onClick={() => setExpanded(e => !e)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      animate={expanded ? { scale: 1.05 } : { scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 10 }}
      className={`relative rounded-2xl cursor-pointer select-none transition-all duration-300 ease-out flex flex-col justify-between card-luxury backdrop-blur-xl overflow-hidden
        ${expanded ? "p-8 shadow-2xl z-10" : "p-6 hover:shadow-2xl"}
        bg-gradient-to-br from-slate-900/40 to-slate-900/20 ${gradient.border} ${gradient.shadow}
        min-h-[140px]
      `}
    >
      {/* Gradient border effect */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient.from} ${gradient.to} opacity-0 hover:opacity-15 transition-opacity duration-300 pointer-events-none`} />
      <div className="relative z-10">
        <div
          className={`mb-3 transition-transform duration-300 text-2xl ${expanded ? "scale-125" : ""}`}
        >
          {icon}
        </div>
        <p className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wider section-label">{label}</p>
        <p
          className={`font-bold transition-all duration-400 leading-tight break-words ${expanded ? "text-3xl" : "text-lg sm:text-xl"} text-white`}
        >
          {value}
        </p>
        <p
          className={`text-gray-400 transition-all duration-400 mt-2 ${expanded ? "text-sm" : "text-xs"} line-clamp-2`}
        >
          {sublabel}
        </p>
        {expanded && (
          <p className="text-gray-600 text-xs mt-3">Click to collapse</p>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Admin Persistence KPI Card ───────────────────────────────────────────── */

function AdminPersistenceKPICard() {
  const { data, isLoading } = trpc.admin.getMyPersistence.useQuery();

  const rate = data?.persistenceRate;
  const isNA = rate === null || rate === undefined;

  // Color coding: green ≥90%, yellow ≥80%, red <80%, gray = N/A
  const getColors = (r: number) => {
    if (r >= 90) return { border: "border-emerald-500/60", text: "text-emerald-400", bg: "from-emerald-900/30 to-emerald-950/30", badge: "bg-emerald-500/20 text-emerald-400", label: "Excellent" };
    if (r >= 80) return { border: "border-yellow-500/60", text: "text-yellow-400", bg: "from-yellow-900/20 to-yellow-950/20", badge: "bg-yellow-500/20 text-yellow-400", label: "Good" };
    if (r >= 75) return { border: "border-orange-500/60", text: "text-orange-400", bg: "from-orange-900/20 to-orange-950/20", badge: "bg-orange-500/20 text-orange-400", label: "Fair" };
    return { border: "border-red-500/60", text: "text-red-400", bg: "from-red-900/20 to-red-950/20", badge: "bg-red-500/20 text-red-400", label: "Needs Attention" };
  };

  const colors = isNA
    ? { border: "border-slate-600", text: "text-slate-400", bg: "from-slate-800/50 to-slate-900/50", badge: "bg-slate-700/50 text-slate-400", label: "No Data" }
    : getColors(rate!);

  return (
    <div className={`relative overflow-hidden rounded-xl border ${colors.border} bg-gradient-to-br ${colors.bg} p-6 transition-all duration-300 hover:shadow-lg card-luxury`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">My Persistence</p>
          <p className="text-xs text-slate-500">{data?.year ?? new Date().getFullYear()} YTD</p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${colors.badge}`}>
          {colors.label}
        </span>
      </div>

      {isLoading ? (
        <div className="text-2xl font-bold text-slate-500 animate-pulse">—</div>
      ) : isNA ? (
        <>
          <div className="text-2xl font-bold text-slate-400">N/A</div>
          <p className="text-xs text-slate-500 mt-1">No placed life policies yet</p>
          <p className="text-xs text-slate-500">Rate appears once a policy is placed in-force</p>
        </>
      ) : (
        <>
          <div className={`text-3xl font-bold ${colors.text}`}>{rate!.toFixed(1)}%</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="bg-white/5 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-500">Active Policies</p>
              <p className="text-lg font-bold text-white">{data?.activePoliciesCount ?? 0}</p>
            </div>
            <div className="bg-white/5 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-500">Cancellations</p>
              <p className="text-lg font-bold text-white">{data?.cancellationsThisMonth ?? 0}</p>
              <p className="text-xs text-slate-600">this month</p>
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  rate! >= 90 ? 'bg-emerald-400' : rate! >= 80 ? 'bg-yellow-400' : rate! >= 75 ? 'bg-orange-400' : 'bg-red-400'
                }`}
                style={{ width: `${Math.min(rate!, 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">{data?.activeInForce ?? 0} of {data?.totalPlaced ?? 0} placed policies active in-force</p>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Import Tab ────────────────────────────────────────────────────────────── */

function ImportTab() {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    clientsCreated: number;
    clientsSkipped: number;
    policiesCreated: number;
    importedClients: ImportedClient[];
  } | null>(null);

  const importExcelMutation = trpc.admin.importExcel.useMutation({
    onSuccess: data => {
      setResult(data);
      setImporting(false);
      toast.success(
        `Imported ${data.clientsCreated} clients and ${data.policiesCreated} policies!`
      );
    },
    onError: err => {
      setImporting(false);
      toast.error(err.message || "Import failed");
    },
  });

  const importPdfMutation = trpc.admin.importPDF.useMutation({
    onSuccess: data => {
      setResult(data);
      setImporting(false);
      toast.success(
        `Imported ${data.clientsCreated} clients and ${data.policiesCreated} policies!`
      );
    },
    onError: err => {
      setImporting(false);
      toast.error(err.message || "Import failed");
    },
  });

  const handleFileSelect = useCallback(
    (file: File) => {
      const isPDF = file.name.match(/\.pdf$/i);
      const isExcel = file.name.match(/\.(xlsx|xls|csv)$/i);

      if (!isPDF && !isExcel) {
        toast.error("Please select an Excel, CSV, or PDF file (.xlsx, .xls, .csv, .pdf)");
        return;
      }

      setImporting(true);
      setResult(null);

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        
        if (isPDF) {
          importPdfMutation.mutate({ fileBase64: base64, fileName: file.name });
        } else {
          importExcelMutation.mutate({ fileBase64: base64, fileName: file.name });
        }
      };
      reader.readAsDataURL(file);
    },
    [importExcelMutation, importPdfMutation]
  );

  const copyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    toast.success("PIN copied!");
  };

  return (
    <div className="space-y-8">
      {/* Upload Card */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-8">
        <h2 className="font-['Playfair_Display'] text-2xl text-white mb-2">
          Import Sales Tracker
        </h2>
        <p className="text-gray-400 mb-6">
          Upload your Excel sales tracker to automatically create client portal
          accounts and import all policies. Each new client gets a unique PIN
          for portal access.
        </p>

        <DragDropFileUpload
          onFileSelect={handleFileSelect}
          accept=".xlsx,.xls,.csv,.pdf"
          acceptedFormats={["Excel (.xlsx, .xls)", "CSV (.csv)", "PDF (.pdf)"]}
          isLoading={importing}
          disabled={false}
          maxSize={50 * 1024 * 1024}
        />
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white/5 border border-[#c9a84c]/30 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="text-[#c9a84c]" size={28} />
            <h2 className="font-['Playfair_Display'] text-2xl text-white">
              Import Complete
            </h2>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-[#c9a84c]">
                {result.clientsCreated}
              </p>
              <p className="text-gray-400 text-sm">New Clients Created</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-[#c9a84c]">
                {result.policiesCreated}
              </p>
              <p className="text-gray-400 text-sm">Policies Imported</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-gray-400">
                {result.clientsSkipped}
              </p>
              <p className="text-gray-400 text-sm">
                Existing Clients (Skipped)
              </p>
            </div>
          </div>

          {/* New Client PINs */}
          {result.importedClients.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-3">
                New Client PINs (save these!):
              </h3>
              <div className="bg-[#0a1628] rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-gray-400 text-xs uppercase px-4 py-3">
                        Client Name
                      </th>
                      <th className="text-left text-gray-400 text-xs uppercase px-4 py-3">
                        PIN
                      </th>
                      <th className="text-left text-gray-400 text-xs uppercase px-4 py-3">
                        Policies
                      </th>
                      <th className="text-right text-gray-400 text-xs uppercase px-4 py-3">
                        Copy
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.importedClients.map((c, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        <td className="px-4 py-3 text-white">{c.name}</td>
                        <td className="px-4 py-3">
                          <code className="bg-[#c9a84c]/20 text-[#c9a84c] px-2 py-1 rounded font-mono text-sm">
                            {c.pin}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          {c.policiesCount}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => copyPin(c.pin)}
                            className="text-gray-400 hover:text-[#c9a84c] transition"
                          >
                            <Copy size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Clients Tab ───────────────────────────────────────────────────────────── */

function ClientsTab({
  showIntakeForm,
  setShowIntakeForm,
  createClientIntakeMutation,
}: {
  showIntakeForm: boolean;
  setShowIntakeForm: (val: boolean) => void;
  createClientIntakeMutation: any;
}) {
  const [search, setSearch] = useState("");
  const [showPins, setShowPins] = useState<Record<number, boolean>>({});
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showLinkHouseholdModal, setShowLinkHouseholdModal] = useState(false);
  const [welcomeData, setWelcomeData] = useState<{
    clientName: string;
    welcomeText: string;
  } | null>(null);
  const utils = trpc.useUtils();

  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const { data: clientsList, isLoading } = trpc.admin.listClients.useQuery();
  const { data: agentClientsList } = trpc.admin.listAgentClients.useQuery(
    { agentId: selectedAgentId! },
    { enabled: selectedAgentId !== null }
  );
  const { data: policiesList } = trpc.admin.listPolicies.useQuery();
  const { data: annuitiesList } = trpc.admin.listAnnuities.useQuery();
  const { data: agentsList } = trpc.admin.listAgents.useQuery();

  const deleteClientMutation = trpc.admin.deleteClient.useMutation({
    onSuccess: () => {
      utils.admin.listClients.invalidate();
      if (selectedAgentId) {
        utils.admin.listAgentClients.invalidate({ agentId: selectedAgentId });
      }
      utils.admin.listPolicies.invalidate();
      toast.success("Client deleted");
    },
  });

  const displayClients = selectedAgentId !== null ? agentClientsList : clientsList;
  const filteredClients = (displayClients || []).filter(c => {
    const q = search.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      (c.phone || "").includes(q) ||
      (c.email || "").includes(q)
    );
  });

  const getPolicyCount = (clientId: number) =>
    (policiesList || []).filter(p => p.clientId === clientId).length;

  const togglePin = (id: number) => {
    setShowPins(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    toast.success("PIN copied!");
  };

  const generateWelcomeMutation = trpc.admin.generateWelcomeText.useMutation();

  const handleGenerateWelcome = async (client: any) => {
    try {
      const result = await generateWelcomeMutation.mutateAsync({
        clientId: client.id,
      });
      setWelcomeData(result);
      setShowWelcomeModal(true);
    } catch (err) {
      toast.error("Failed to generate welcome text");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#c9a84c]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agent Selector */}
      {agentsList && agentsList.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            View Clients By Agent:
          </label>
          <select
            value={selectedAgentId || ""}
            onChange={(e) => setSelectedAgentId(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full md:w-64 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#c9a84c]/50"
          >
            <option value="">Your Direct Clients (Owner)</option>
            {(agentsList || []).map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.firstName} {agent.lastName} ({agent.email})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Header Buttons */}
      <div className="flex justify-end gap-2">
        <Button
          onClick={() => setShowIntakeForm(true)}
          className="gap-2 bg-[#c9a84c] hover:bg-[#b8963e] text-black font-semibold"
        >
          <UserPlus size={18} />
          New Client Intake Form
        </Button>
        <Button
          onClick={() => setShowLinkHouseholdModal(true)}
          variant="outline"
          className="gap-2"
        >
          <Users size={18} />
          Link Household
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#c9a84c]/50"
          />
        </div>
        <span className="text-gray-400 text-sm">
          {filteredClients.length} {selectedAgentId ? "agent " : ""}clients
        </span>
      </div>

      {/* Client Cards */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-16">
          <Users className="mx-auto mb-4 text-gray-600" size={48} />
          <p className="text-gray-400 text-lg">No clients found</p>
          <p className="text-gray-500 text-sm mt-1">
            Import an Excel file to get started
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {(filteredClients || []).map(client => {
            // Dynamic color assignment — works for any number of agents
            // Each agent gets a unique color from a palette based on their index
            const AGENT_COLORS = [
              { border: 'border-purple-500/30', bg: 'bg-purple-500/5', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
              { border: 'border-orange-500/30', bg: 'bg-orange-500/5', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
              { border: 'border-blue-500/30', bg: 'bg-blue-500/5', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
              { border: 'border-green-500/30', bg: 'bg-green-500/5', badge: 'bg-green-500/20 text-green-300 border-green-500/30' },
              { border: 'border-pink-500/30', bg: 'bg-pink-500/5', badge: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
              { border: 'border-yellow-500/30', bg: 'bg-yellow-500/5', badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
              { border: 'border-teal-500/30', bg: 'bg-teal-500/5', badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
              { border: 'border-red-500/30', bg: 'bg-red-500/5', badge: 'bg-red-500/20 text-red-300 border-red-500/30' },
              { border: 'border-indigo-500/30', bg: 'bg-indigo-500/5', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
              { border: 'border-cyan-500/30', bg: 'bg-cyan-500/5', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
            ];
            // Build a stable sorted list of agent IDs so colors don't shift when agents are added
            const sortedAgentIds = (agentsList || []).map(a => a.id).sort((a, b) => a - b);
            const agentIndex = client.agentId ? sortedAgentIds.indexOf(client.agentId) : -1;
            const agentColor = agentIndex >= 0 ? AGENT_COLORS[agentIndex % AGENT_COLORS.length] : null;
            const agentName = client.agentId ? agentsList?.find(a => a.id === client.agentId) : null;

            const borderColor = agentColor ? agentColor.border : 'border-white/10';
            const bgColor = agentColor ? agentColor.bg : 'bg-white/5';
            
            return (
            <div
              key={client.id}
              className={`${bgColor} border ${borderColor} rounded-xl p-5 hover:border-[#c9a84c]/20 transition`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 className="text-white font-semibold text-lg">
                      {client.firstName} {client.lastName}
                    </h3>
                    <span className="bg-[#c9a84c]/20 text-[#c9a84c] text-xs px-2 py-0.5 rounded-full">
                      {getPolicyCount(client.id)}{" "}
                      {getPolicyCount(client.id) === 1 ? "policy" : "policies"}
                    </span>
                    {client.lastPortalLogin ? (
                      <span className="text-[8px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded px-1.5 py-0.5 font-semibold uppercase tracking-wider">
                        A
                      </span>
                    ) : (
                      <span className="text-[8px] bg-gray-500/20 text-gray-300 border border-gray-500/30 rounded px-1.5 py-0.5 font-semibold uppercase tracking-wider">
                        NLI
                      </span>
                    )}
                    {agentName && agentColor && (
                      <span className={`text-[10px] border rounded px-2 py-0.5 font-semibold ${agentColor.badge}`}>
                        {agentName.firstName} {agentName.lastName}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                    {client.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={14} />
                        {client.phone}
                      </span>
                    )}
                    {client.email && <span>{client.email}</span>}
                  </div>
                  {/* Additional client info */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2">
                    {client.ssnLast4 && (
                      <span title="Social Security Number">
                        SSN: ***-**-{client.ssnLast4}
                      </span>
                    )}
                    {client.driverLicenseLast4 && (
                      <span title="Driver License">
                        DL: ****{client.driverLicenseLast4} ({client.driverLicenseState})
                      </span>
                    )}
                    {client.bankName && (
                      <span title="Bank Account">
                        Bank: {client.bankName}
                      </span>
                    )}
                    {client.accountNumberLast4 && (
                      <span title="Account Number">
                        Acct: ****{client.accountNumberLast4}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* PIN display */}
                  <div className="flex items-center gap-2 bg-[#0a1628] rounded-lg px-3 py-2">
                    <span className="text-gray-400 text-xs uppercase">
                      PIN:
                    </span>
                    <code className="text-[#c9a84c] font-mono text-sm min-w-[3rem]">
                      {showPins[client.id] ? client.pin : "••••"}
                    </code>
                    <button
                      onClick={() => togglePin(client.id)}
                      className="text-gray-400 hover:text-white transition"
                    >
                      {showPins[client.id] ? (
                        <EyeOff size={14} />
                      ) : (
                        <Eye size={14} />
                      )}
                    </button>
                    <button
                      onClick={() => copyPin(client.pin)}
                      className="text-gray-400 hover:text-[#c9a84c] transition"
                    >
                      <Copy size={14} />
                    </button>
                  </div>

                  {/* Generate Welcome Text */}
                  <button
                    onClick={() => handleGenerateWelcome(client)}
                    className="text-gray-400 hover:text-[#c9a84c] transition p-2"
                    title="Generate Welcome Text"
                  >
                    <MessageSquare size={16} />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Delete ${client.firstName} ${client.lastName} and all their policies?`
                        )
                      ) {
                        deleteClientMutation.mutate({ id: client.id });
                      }
                    }}
                    className="text-gray-400 hover:text-red-400 transition p-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Welcome Text Modal */}
      {welcomeData && (
        <WelcomeTextModal
          open={showWelcomeModal}
          onOpenChange={setShowWelcomeModal}
          clientName={welcomeData.clientName}
          welcomeText={welcomeData.welcomeText}
        />
      )}

      {/* Link Household Modal */}
      <LinkHouseholdModal
        open={showLinkHouseholdModal}
        onOpenChange={setShowLinkHouseholdModal}
        onSuccess={() => utils.admin.listClients.invalidate()}
      />

    </div>
  );
}

/* ─── Policies Tab ──────────────────────────────────────────────────────────── */

/* ─── Policies Mobile Accordion Cards ──────────────────────────────────────── */

function PoliciesMobileCards({
  policies,
  getClientName,
  getClientLoginStatus,
  optimisticStatuses,
  handleStatusChange,
  editingPolicyId,
  startEditPolicy,
  saveEditedPolicy,
  cancelEditPolicy,
  editFormData,
  setEditFormData,
  calculateYearlyAP,
  statusColor,
  updatePolicyMutation,
  onSyncToSalesTracker,
  syncingPolicyId,
  handleGenerateDocument,
  handleEmailDocument,
  generatingDocPolicyId,
  sendingEmailPolicyId,
  onDeletePolicy,
}: {
  policies: any[];
  getClientName: (id: number) => string;
  getClientLoginStatus: (id: number) => boolean;
  optimisticStatuses: Record<number, string>;
  handleStatusChange: (id: number, status: string) => void;
  editingPolicyId: number | null;
  startEditPolicy: (p: any) => void;
  saveEditedPolicy: (id: number) => void;
  cancelEditPolicy: () => void;
  editFormData: any;
  setEditFormData: (v: any) => void;
  calculateYearlyAP: (amount: string, freq: string) => string;
  statusColor: (s: string) => string;
  updatePolicyMutation: { isPending: boolean };
  onSyncToSalesTracker: (policy: any) => void;
  syncingPolicyId: number | null;
  handleGenerateDocument: (policyId: number) => void;
  handleEmailDocument: (policyId: number) => void;
  generatingDocPolicyId: number | null;
  sendingEmailPolicyId: number | null;
  onDeletePolicy?: (policy: any) => void;
}) {
  const [openId, setOpenId] = useState<number | null>(null);
  const handleDeleteClick = (policy: any) => {
    if (onDeletePolicy) {
      onDeletePolicy(policy);
    }
  };
  return (
    <div className="md:hidden space-y-2">
      {policies.map(policy => {
        const isOpen = openId === policy.id;
        const isEditing = editingPolicyId === policy.id;
        const status = optimisticStatuses[policy.id] ?? policy.status;
        return (
          <div
            key={policy.id}
            className="rounded-xl border border-white/10 bg-white/5 overflow-hidden"
          >
            <button
              onClick={() => setOpenId(isOpen ? null : policy.id)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-white font-semibold text-sm">
                    {getClientName(policy.clientId)}
                  </p>
                  {getClientLoginStatus(policy.clientId) ? (
                    <span className="text-[8px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded px-1.5 py-0.5 font-semibold uppercase tracking-wider">
                      A
                    </span>
                  ) : (
                    <span className="text-[8px] bg-gray-500/20 text-gray-300 border border-gray-500/30 rounded px-1.5 py-0.5 font-semibold uppercase tracking-wider">
                      NLI
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-xs">
                  {policy.carrier} · {policy.type}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor(status)}`}
                >
                  {status}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
              </div>
            </button>
            {isOpen && (
              <div className="border-t border-white/10 px-4 py-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-gray-500 uppercase tracking-wide mb-0.5">
                      Policy #
                    </p>
                    <p className="text-gray-300 font-mono">
                      {policy.policyNumber || '' || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 uppercase tracking-wide mb-0.5">
                      Frequency
                    </p>
                    <p className="text-gray-300 capitalize">
                      {policy.premiumFrequency || "monthly"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 uppercase tracking-wide mb-0.5">
                      Premium
                    </p>
                    <p className="text-[#c9a84c] font-semibold">
                      ${parseFloat(policy.premiumAmount || "0").toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 uppercase tracking-wide mb-0.5">
                      Yearly AP
                    </p>
                    <p className="text-[#c9a84c] font-semibold">
                      {policy.yearlyAP
                        ? `$${parseFloat(policy.yearlyAP).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 uppercase tracking-wide mb-0.5">
                      Coverage
                    </p>
                    <p className="text-white">
                      $
                      {parseFloat(
                        policy.coverageAmount || "0"
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 uppercase tracking-wide text-xs mb-1">
                    Status
                  </p>
                  <select
                    value={status}
                    onChange={e =>
                      handleStatusChange(policy.id, e.target.value)
                    }
                    disabled={updatePolicyMutation.isPending}
                    className={`text-xs px-3 py-1.5 rounded-full capitalize border cursor-pointer appearance-none font-semibold focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50 ${statusColor(status)}`}
                    style={{ background: "transparent" }}
                  >
                    <option value="active" className="bg-[#0a1628] text-white">
                      Active
                    </option>
                    <option value="pending" className="bg-[#0a1628] text-white">
                      Pending
                    </option>
                    <option value="expired" className="bg-[#0a1628] text-white">
                      Expired
                    </option>
                    <option
                      value="cancelled"
                      className="bg-[#0a1628] text-white"
                    >
                      Cancelled
                    </option>
                  </select>
                </div>
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        value={editFormData.premiumAmount}
                        onChange={e =>
                          setEditFormData({
                            ...editFormData,
                            premiumAmount: e.target.value,
                          })
                        }
                        placeholder="Premium"
                        className="flex-1 bg-white/10 border border-[#c9a84c]/50 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-[#c9a84c]"
                        autoFocus
                      />
                      <select
                        value={editFormData.premiumFrequency}
                        onChange={e =>
                          setEditFormData({
                            ...editFormData,
                            premiumFrequency: e.target.value as any,
                          })
                        }
                        className="bg-white/10 border border-[#c9a84c]/50 rounded px-2 py-1.5 text-white text-xs focus:outline-none"
                      >
                        <option value="monthly" className="bg-[#0a1628]">
                          Monthly
                        </option>
                        <option value="quarterly" className="bg-[#0a1628]">
                          Quarterly
                        </option>
                        <option value="semi-annual" className="bg-[#0a1628]">
                          Semi-Annual
                        </option>
                        <option value="annual" className="bg-[#0a1628]">
                          Annual
                        </option>
                      </select>
                    </div>
                    <p className="text-xs text-[#c9a84c]">
                      Yearly AP: $
                      {parseFloat(
                        calculateYearlyAP(
                          editFormData.premiumAmount,
                          editFormData.premiumFrequency
                        )
                      ).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEditedPolicy(policy.id)}
                        disabled={updatePolicyMutation.isPending}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] hover:bg-[#c9a84c]/20 text-xs font-medium transition"
                      >
                        <CheckCircle size={12} /> Save
                      </button>
                      <button
                        onClick={cancelEditPolicy}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-[#c9a84c] text-xs font-medium transition"
                      >
                        <X size={12} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditPolicy(policy)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-medium transition"
                      >
                        <Edit size={12} /> Edit
                      </button>
                      <button
                        onClick={() => onSyncToSalesTracker(policy)}
                        disabled={syncingPolicyId === policy.id}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] hover:bg-[#c9a84c]/20 text-xs font-medium transition disabled:opacity-50"
                      >
                        {syncingPolicyId === policy.id ? (
                          <>
                            <Loader2 size={12} className="animate-spin" />{" "}
                            Syncing...
                          </>
                        ) : (
                          <>
                            <RefreshCw size={12} /> Sync Tracker
                          </>
                        )}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleGenerateDocument(policy.id)}
                        disabled={generatingDocPolicyId === policy.id}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-medium transition disabled:opacity-50"
                        title="Generate Document"
                      >
                        {generatingDocPolicyId === policy.id ? (
                          <>
                            <Loader2 size={12} className="animate-spin" /> Generating...
                          </>
                        ) : (
                          <>
                            <FileText size={12} /> Generate
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleEmailDocument(policy.id)}
                        disabled={sendingEmailPolicyId === policy.id}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] hover:bg-[#c9a84c]/20 text-xs font-medium transition disabled:opacity-50"
                        title="Email Document"
                      >
                        {sendingEmailPolicyId === policy.id ? (
                          <>
                            <Loader2 size={12} className="animate-spin" /> Sending...
                          </>
                        ) : (
                          <>
                            <Send size={12} /> Email
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(policy)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-medium transition"
                        title="Delete Policy"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PoliciesTab() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "pending" | "expired" | "cancelled"
  >("all");
  const [agentFilter, setAgentFilter] = useState<number | "all">("all");
  const [optimisticStatuses, setOptimisticStatuses] = useState<
    Record<number, string>
  >({});
  const [editingPolicyId, setEditingPolicyId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({
    clientId: undefined as number | undefined,
    clientName: "",
    carrier: "",
    type: "",
    policyNumber: "",
    premiumAmount: "",
    premiumFrequency: "monthly" as
      | "monthly"
      | "quarterly"
      | "semi-annual"
      | "annual",
    coverageAmount: "",
  });
  const utils = trpc.useUtils();
  const { data: policiesList, isLoading } = trpc.admin.listPolicies.useQuery();
  const { data: clientsList } = trpc.admin.listClients.useQuery();
  const { data: policiesWithAgents } = trpc.phase2.allPoliciesWithAgents.useQuery();

  const [syncingPolicyId, setSyncingPolicyId] = useState<number | null>(null);
  const [editingPolicy, setEditingPolicy] = useState<any | null>(null);
  const [previewPolicyId, setPreviewPolicyId] = useState<number | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [deletingPolicyId, setDeletingPolicyId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<any | null>(null);

  const deletePolicyMutation = trpc.admin.deletePolicy.useMutation({
    onSuccess: () => {
      setDeletingPolicyId(null);
      setShowDeleteConfirm(false);
      setPolicyToDelete(null);
      utils.admin.listPolicies.invalidate();
      toast.success("Policy deleted successfully");
    },
    onError: (err) => {
      setDeletingPolicyId(null);
      toast.error(err.message || "Failed to delete policy");
    },
  });

  const syncPolicyMutation = trpc.admin.syncPolicyToSalesTracker.useMutation({
    onSuccess: data => {
      setSyncingPolicyId(null);
      toast.success(
        `Sales Tracker updated — ${data.clientName} / ${data.carrier}: $${parseFloat(data.premium).toFixed(2)}/mo, $${parseFloat(data.yearlyAP).toFixed(2)} AP` +
            ""
      );
    },
    onError: err => {
      setSyncingPolicyId(null);
      toast.error(err.message || "Sync failed");
    },
  });

    const startEditPolicy = (policy: any) => {
    setEditingPolicy(policy);
    setEditFormData({
      clientId: policy.clientId || undefined,
      clientName: policy.clientName || "",
      carrier: policy.carrier || "",
      type: policy.type || "",
      policyNumber: policy.policyNumber || '' || "",
      premiumAmount: policy.premiumAmount || "",
      premiumFrequency: policy.premiumFrequency || "monthly",
      coverageAmount: policy.coverageAmount || "",
    });
  };
  const cancelEditPolicy = () => {
    setEditingPolicy(null);
    setEditingPolicyId(null);
    setEditFormData({
      clientId: undefined,
      clientName: "",
      carrier: "",
      type: "",
      policyNumber: "",
      premiumAmount: "",
      premiumFrequency: "monthly",
      coverageAmount: "",
    });
  };

  const saveEditedPolicy = (policyId: number) => {
    updatePolicyMutation.mutate({
      id: policyId,
      clientId: editFormData.clientId,
      carrier: editFormData.carrier,
      type: editFormData.type,
      policyNumber: editFormData.policyNumber,
      premiumAmount: editFormData.premiumAmount,
      premiumFrequency: editFormData.premiumFrequency,
      coverageAmount: editFormData.coverageAmount,
      yearlyAP: calculateYearlyAP(
        editFormData.premiumAmount,
        editFormData.premiumFrequency
      ),
    });
    setEditingPolicy(null);
  };

  const handleSyncToSalesTracker = (policy: any) => {
    setSyncingPolicyId(policy.id);
    syncPolicyMutation.mutate({
      policyId: policy.id,
      // Commission % comes from the policy's stored commissionRate, not a hardcoded table
      commissionPercent: (policy as any).commissionRate ? String((policy as any).commissionRate) : undefined,
    });
  };
  const generateDocMutation = trpc.admin.generatePolicyDocument.useMutation({
    onSuccess: (result) => {
      const text = result.documentText;
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `policy-${result.policyNumber}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Document generated and downloaded");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to generate document");
    },
  });

  const handleGenerateDocument = (policyId: number) => {
    generateDocMutation.mutate({ policyId });
  };

  const sendEmailMutation = trpc.admin.sendPolicyDocumentEmail.useMutation({
    onSuccess: () => {
      toast.success("Document emailed successfully");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to send email");
    },
  });

  const handleEmailDocument = (policyId: number) => {
    const policy = (policiesList || []).find(p => p.id === policyId);
    if (!policy) {
      toast.error("Policy not found");
      return;
    }
    const client = (clientsList || []).find(c => c.id === policy.clientId);
    if (!client?.email) {
      toast.error("Client email not found");
      return;
    }
    sendEmailMutation.mutate({
      policyId,
      clientEmail: client.email,
    });
  };

  const updatePolicyMutation = trpc.admin.updatePolicy.useMutation({
    onSuccess: (_data, variables) => {
      utils.admin.listPolicies.invalidate();
      setOptimisticStatuses(prev => {
        const next = { ...prev };
        delete next[variables.id];
        return next;
      });
      if (variables.premiumAmount || variables.yearlyAP) {
        toast.success("Premium & Yearly AP updated");
      } else {
        toast.success("Policy updated");
      }
      setEditingPolicyId(null);
    },
    onError: (err, variables) => {
      setOptimisticStatuses(prev => {
        const next = { ...prev };
        delete next[variables.id];
        return next;
      });
      toast.error(err.message || "Failed to update");
    },
  });

  const getClientName = (clientId: number) => {
    const client = (clientsList || []).find(c => c.id === clientId);
    return client
      ? `${client.firstName} ${client.lastName}`
      : `Client #${clientId}`;
  };

  const getClientLoginStatus = (clientId: number) => {
    const client = (clientsList || []).find(c => c.id === clientId);
    return client?.lastPortalLogin ? true : false;
  };

  const getAgentInfo = (policyId: number) => {
    return policiesWithAgents?.find(p => p.id === policyId);
  };

  const getAgentColor = (color?: string) => {
    const colorMap: Record<string, string> = {
      blue: "#3b82f6",
      green: "#10b981",
      red: "#ef4444",
      purple: "#a855f7",
      pink: "#ec4899",
      orange: "#f97316",
      yellow: "#eab308",
      cyan: "#06b6d4",
      gold: "#c9a84c",
      default: "#64748b",
    };
    return colorMap[color || "default"] || colorMap.default;
  };

  // Get unique agents for filter dropdown
  const uniqueAgents = Array.from(
    new Map(
      (policiesWithAgents || []).map(p => [p.agentId, { id: p.agentId, name: p.agentName, color: p.agentColor }])
    ).values()
  );

  const annuityTypes = ['fixed_annuity', 'variable_annuity', 'indexed_annuity', 'immediate_annuity', 'annuity'];
  const filteredPolicies = (policiesList || []).filter(p => {
    const q = search.toLowerCase();
    const clientName = p.clientName || getClientName(p.clientId) || "";
    const matchesSearch =
      (p.carrier || "").toLowerCase().includes(q) ||
      (p.productType || p.type || "").toLowerCase().includes(q) ||
      (p.policyNumber || "").toLowerCase().includes(q) ||
      clientName.toLowerCase().includes(q);
    const effectiveStatus = optimisticStatuses[p.id] ?? (p.status || "active");
    const matchesStatus =
      statusFilter === "all" || effectiveStatus === statusFilter;
    const agentInfo = getAgentInfo(p.id);
    const matchesAgent =
      agentFilter === "all" || agentInfo?.agentId === agentFilter;
    // Exclude annuity types from Life tab
    const isLifePolicy = !annuityTypes.includes(p.type);
    return matchesSearch && matchesStatus && matchesAgent && isLifePolicy;
  });

  // Count per status for badge
  const statusCounts = (policiesList || []).reduce(
    (acc, p) => {
      const s = optimisticStatuses[p.id] ?? (p.status || "active");
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const statusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-[#c9a84c]/20 text-[#c9a84c] border-[#c9a84c]/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "expired":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const handleStatusChange = (policyId: number, newStatus: string) => {
    setOptimisticStatuses(prev => ({ ...prev, [policyId]: newStatus }));
    updatePolicyMutation.mutate({
      id: policyId,
      status: newStatus as "active" | "pending" | "expired" | "cancelled",
    });
  };

  const calculateYearlyAP = (amount: string, frequency: string): string => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return "0";
    switch (frequency) {
      case "monthly":
        return (num * 12).toFixed(2);
      case "quarterly":
        return (num * 4).toFixed(2);
      case "semi-annual":
        return (num * 2).toFixed(2);
      case "annual":
        return num.toFixed(2);
      default:
        return (num * 12).toFixed(2);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#c9a84c]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search + Status Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search policies..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#c9a84c]/50"
            />
          </div>
          <span className="text-gray-400 text-sm">
            {filteredPolicies.length} policies
          </span>
        </div>
        {/* Status quick-filter buttons */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              {
                key: "all",
                label: "All",
                color: "text-white border-white/20 hover:border-white/40",
              },
              {
                key: "active",
                label: "Active",
                color:
                  "text-[#c9a84c] border-[#c9a84c]/30 hover:border-[#c9a84c]/60",
              },
              {
                key: "pending",
                label: "Pending",
                color:
                  "text-yellow-400 border-yellow-500/30 hover:border-yellow-400/60",
              },
              {
                key: "expired",
                label: "Expired",
                color:
                  "text-gray-400 border-gray-500/30 hover:border-gray-400/60",
              },
              {
                key: "cancelled",
                label: "Cancelled",
                color: "text-red-400 border-red-500/30 hover:border-red-400/60",
              },
            ] as const
          ).map(({ key, label, color }) => {
            const count =
              key === "all"
                ? (policiesList || []).length
                : statusCounts[key] || 0;
            const isActive = statusFilter === key;
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isActive
                    ? key === "all"
                      ? "bg-white/15 border-white/40 text-white"
                      : key === "active"
                        ? "bg-green-500/15 border-green-400/50 text-green-300"
                        : key === "pending"
                          ? "bg-yellow-500/15 border-yellow-400/50 text-yellow-300"
                          : key === "expired"
                            ? "bg-gray-500/15 border-gray-400/50 text-gray-300"
                            : "bg-red-500/15 border-red-400/50 text-red-300"
                    : `bg-transparent ${color}`
                }`}
              >
                {label}
                <span className="bg-white/10 rounded px-1 font-mono">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        {/* Agent Filter Dropdown */}
        {uniqueAgents.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Filter by Agent:
            </label>
            <select
              value={agentFilter === "all" ? "all" : agentFilter}
              onChange={e => setAgentFilter(e.target.value === "all" ? "all" : parseInt(e.target.value))}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-[#c9a84c]/50"
            >
              <option value="all" className="bg-[#0a1628]">All Agents</option>
              {uniqueAgents.map(agent => (
                <option key={agent.id} value={agent.id} className="bg-[#0a1628]">
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Policies Table */}
      {filteredPolicies.length === 0 ? (
        <div className="text-center py-20">
          <FileSpreadsheet className="mx-auto mb-4 text-gray-600" size={48} />
          <p className="text-gray-400 text-lg">No policies found</p>
        </div>
      ) : (
        <>
          {/* ── Mobile accordion cards ── */}
          <PoliciesMobileCards
            policies={filteredPolicies}
            getClientName={getClientName}
            getClientLoginStatus={getClientLoginStatus}
            optimisticStatuses={optimisticStatuses}
            handleStatusChange={handleStatusChange}
            editingPolicyId={editingPolicyId}
            startEditPolicy={startEditPolicy}
            saveEditedPolicy={saveEditedPolicy}
            cancelEditPolicy={cancelEditPolicy}
            editFormData={editFormData}
            setEditFormData={setEditFormData}
            calculateYearlyAP={calculateYearlyAP}
            statusColor={statusColor}
            updatePolicyMutation={updatePolicyMutation}
            onSyncToSalesTracker={handleSyncToSalesTracker}
            syncingPolicyId={syncingPolicyId}
            handleGenerateDocument={handleGenerateDocument}
            handleEmailDocument={handleEmailDocument}
            generatingDocPolicyId={generateDocMutation.isPending ? null : null}
            sendingEmailPolicyId={sendEmailMutation.isPending ? null : null}
            onDeletePolicy={(policy) => {
              setPolicyToDelete(policy);
              setDeletingPolicyId(policy.id);
              setShowDeleteConfirm(true);
            }}
          />
          {/* ── Desktop table ── */}
          <div className="hidden md:block bg-white/5 border border-white/10 rounded-xl">
            <div className="w-full overflow-x-auto rounded-xl">
              <table className="min-w-[900px] w-full text-[14px] lg:text-base">
                <thead>
                  <tr className="border-b border-white/10 bg-white/3">
                    <th className="text-left text-gray-400 text-[10px] lg:text-[11px] uppercase px-1.5 py-2 font-semibold tracking-wider sticky left-0 z-20 bg-[#0a1628] min-w-[130px] after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-white/10">
                      Client
                    </th>
                    <th className="text-left text-gray-400 text-[10px] lg:text-[11px] uppercase px-1.5 py-2 font-semibold tracking-wider sticky left-[130px] z-20 bg-[#0a1628] min-w-[120px] after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-white/10">
                      Carrier
                    </th>
                    <th className="text-left text-gray-400 text-[10px] lg:text-[11px] uppercase px-1.5 py-2 font-semibold tracking-wider">
                      Type
                    </th>
                    <th className="text-left text-gray-400 text-[10px] lg:text-[11px] uppercase px-1 py-2 font-semibold tracking-wider">
                      Policy #
                    </th>
                    <th className="text-right text-gray-400 text-[10px] lg:text-[11px] uppercase px-1.5 py-2 font-semibold tracking-wider">
                      Premium
                    </th>
                    <th className="text-right text-gray-400 text-[10px] lg:text-[11px] uppercase px-1.5 py-2 font-semibold tracking-wider">
                      AP
                    </th>

                    <th className="text-left text-gray-400 text-[10px] lg:text-[11px] uppercase px-1.5 py-2 font-semibold tracking-wider">
                      Writing Agent
                    </th>
                    <th className="text-center text-gray-400 text-[10px] lg:text-[11px] uppercase px-1.5 py-2 font-semibold tracking-wider">
                      Status
                    </th>
                    <th className="text-center text-gray-400 text-[10px] lg:text-[11px] uppercase px-1 py-2 font-semibold tracking-wider">
                      Act
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPolicies.map(policy => (
                    <tr
                      key={policy.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-2 py-2 text-white font-medium whitespace-nowrap text-[13px] lg:text-[14px] sticky left-0 z-10 bg-[#0a1628] min-w-[130px] after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-white/10" style={policy.tagColor ? { backgroundColor: `${policy.tagColor}20` } : {}}>
                        <div className="flex items-center gap-1">
                          <span className="truncate">{(policy as any).clientName || getClientName((policy as any).clientId ?? (policy as any).client_id)}</span>
                          {clientsList?.find(c => c.id === policy.clientId)
                            ?.lastPortalLogin ? (
                            <span className="text-[8px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded px-1.5 py-0.5 font-semibold uppercase tracking-wider flex-shrink-0">
                              A
                            </span>
                          ) : (
                            <span className="text-[8px] bg-gray-500/20 text-gray-300 border border-gray-500/30 rounded px-1.5 py-0.5 font-semibold uppercase tracking-wider flex-shrink-0">
                              NLI
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Carrier */}
                      <td className="px-3 py-3 text-[13px] lg:text-[14px] sticky left-[130px] z-10 bg-[#0a1628] min-w-[120px] after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-white/10">
                        {editingPolicyId === policy.id ? (
                          <CarrierSelect
                            value={editFormData.carrier}
                            onChange={val =>
                              setEditFormData({ ...editFormData, carrier: val })
                            }
                            className="min-w-[140px]"
                          />
                        ) : (
                          <span className="text-white font-semibold text-[14px] lg:text-[15px]">{policy.carrier}</span>
                        )}
                      </td>
                      {/* Type */}
                      <td className="px-3 py-3 text-[13px] lg:text-[14px]">
                        {editingPolicyId === policy.id ? (
                          <input
                            type="text"
                            value={editFormData.type}
                            onChange={e =>
                              setEditFormData({
                                ...editFormData,
                                type: e.target.value,
                              })
                            }
                            className="w-20 bg-white/10 border border-[#c9a84c]/50 rounded px-1 py-0.5 text-white text-[8px] focus:outline-none focus:border-[#c9a84c]"
                          />
                        ) : (
                          <span className="text-gray-300 font-medium">
                            {policy.type?.toLowerCase().includes('whole life') && !policy.type?.toLowerCase().includes('graded')
                              ? 'WL'
                              : policy.type?.toLowerCase().includes('term')
                              ? 'T'
                              : policy.type?.toLowerCase().includes('graded')
                              ? 'G'
                              : policy.type}
                          </span>
                        )}
                      </td>
                      {/* Policy # */}
                      <td className="px-3 py-3 text-[13px] lg:text-[14px]">
                        {editingPolicyId === policy.id ? (
                          <input
                            type="text"
                            value={editFormData.policyNumber}
                            onChange={e =>
                              setEditFormData({
                                ...editFormData,
                                policyNumber: e.target.value,
                              })
                            }
                            className="w-full bg-white/10 border border-[#c9a84c]/50 rounded px-2 py-1 text-white text-[12px] focus:outline-none focus:border-[#c9a84c]"
                          />
                        ) : (
                          <span className="text-gray-300 font-mono text-[12px] lg:text-[13px] truncate max-w-[120px]" title={policy.policyNumber || ''}>{policy.policyNumber || ''}</span>
                        )}
                      </td>
                      {/* Premium & Frequency */}
                      {editingPolicyId === policy.id ? (
                        <>
                          <td className="px-1.5 py-1.5 text-right">
                            <input
                              type="number"
                              step="0.01"
                              value={editFormData.premiumAmount}
                              onChange={e =>
                                setEditFormData({
                                  ...editFormData,
                                  premiumAmount: e.target.value,
                                })
                              }
                              className="w-16 bg-white/10 border border-[#c9a84c]/50 rounded px-1 py-0.5 text-white text-[9px] lg:text-[10px] text-right focus:outline-none focus:border-[#c9a84c]"
                            />
                          </td>
                          <td className="px-1 py-1.5 text-center hidden xl:table-cell">
                            <select
                              value={editFormData.premiumFrequency}
                              onChange={e =>
                                setEditFormData({
                                  ...editFormData,
                                  premiumFrequency: e.target.value as any,
                                })
                              }
                              className="bg-white/10 border border-[#c9a84c]/50 rounded px-1 py-0.5 text-white text-[7px] lg:text-[8px] focus:outline-none"
                            >
                              <option value="monthly" className="bg-[#0a1628]">
                                Monthly
                              </option>
                              <option
                                value="quarterly"
                                className="bg-[#0a1628]"
                              >
                                Quarterly
                              </option>
                              <option
                                value="semi-annual"
                                className="bg-[#0a1628]"
                              >
                                Semi-Annual
                              </option>
                              <option value="annual" className="bg-[#0a1628]">
                                Annual
                              </option>
                            </select>
                          </td>
                          <td className="px-1.5 py-1.5 text-right text-[#c9a84c] font-semibold whitespace-nowrap text-[8px] lg:text-[9px]">
                            $
                            {parseFloat(
                              calculateYearlyAP(
                                editFormData.premiumAmount,
                                editFormData.premiumFrequency
                              )
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </>
                      ) : (
                        <>
                                    <td className="px-2 py-2 text-right text-[#c9a84c] font-semibold whitespace-nowrap text-[13px] lg:text-[14px]">
                            {(() => {
                              const ap = (policy as any).yearlyAP ?? (policy as any).annualPremium ?? (policy as any).yearlyAp ?? null;
                              const val = ap !== null && ap !== undefined ? Number(ap) : NaN;
                              return isNaN(val) ? '—' : `$${val.toFixed(2)}`;
                            })()}
                          </td>
                          <td className="px-2 py-2 text-right text-[#c9a84c] whitespace-nowrap text-[13px] lg:text-[14px]">
                            {(() => {
                              const ap = (policy as any).yearlyAP ?? (policy as any).annualPremium ?? (policy as any).yearlyAp ?? null;
                              const val = ap !== null && ap !== undefined ? Number(ap) : NaN;
                              return isNaN(val) || val === 0 ? '—' : `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                            })()}
                          </td>
                        </>
                      )}

                      {/* Writing Agent Column */}
                      <td className="px-2 py-2 text-left">
                        {(() => {
                          const agentInfo = getAgentInfo(policy.id);
                          if (!agentInfo) {
                            return <span className="text-gray-500 text-[12px]">—</span>;
                          }
                          return (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{
                                  backgroundColor: getAgentColor(agentInfo.agentColor),
                                }}
                              />
                              <span className="text-white text-[12px] lg:text-[13px] font-medium truncate">
                                {agentInfo.agentName}
                              </span>
                            </div>
                          );
                        })()}
                      </td>

                      <td className="px-2 py-2 text-center">
                        <select
                          value={optimisticStatuses[policy.id] ?? (policy as any).status}
                          onChange={e =>
                            handleStatusChange(policy.id, e.target.value)
                          }
                          disabled={updatePolicyMutation.isPending}
                          className={`text-[11px] lg:text-[12px] px-3 py-1.5 rounded-full capitalize border cursor-pointer appearance-none text-center font-semibold focus:outline-none focus:ring-1 focus:ring-[#c9a84c]/50 ${statusColor(optimisticStatuses[policy.id] ?? (policy as any).status)}`}
                          style={{ background: "transparent" }}
                        >
                          <option
                            value="active"
                            className="bg-[#0a1628] text-white"
                          >
                            Active
                          </option>
                          <option
                            value="pending"
                            className="bg-[#0a1628] text-white"
                          >
                            Pending
                          </option>
                          <option
                            value="expired"
                            className="bg-[#0a1628] text-white"
                          >
                            Expired
                          </option>
                          <option
                            value="cancelled"
                            className="bg-[#0a1628] text-white"
                          >
                            Cancelled
                          </option>
                        </select>
                      </td>
                      <td className="px-1 py-1.5 text-center whitespace-nowrap">
                        {editingPolicyId === policy.id ? (
                          <div className="flex items-center gap-2 justify-center">
                            <button
                              onClick={() => saveEditedPolicy(policy.id)}
                              disabled={updatePolicyMutation.isPending}
                              className="text-[#c9a84c] hover:text-[#e8c547] transition p-1.5"
                              title="Save"
                            >
                              <CheckCircle size={20} />
                            </button>
                            <button
                              onClick={cancelEditPolicy}
                              className="text-gray-400 hover:text-[#c9a84c] transition p-1.5"
                              title="Cancel"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 justify-center">
                            <button
                              onClick={() => startEditPolicy(policy)}
                              className="text-[#c9a84c] hover:text-[#e8c547] transition p-1.5"
                              title="Edit"
                            >
                              <Edit size={20} />
                            </button>
                            <button
                              onClick={() => handleSyncToSalesTracker(policy)}
                              disabled={syncingPolicyId === policy.id}
                              className="text-blue-400 hover:text-blue-300 transition disabled:opacity-50 p-1.5"
                              title="Sync"
                            >
                              {syncingPolicyId === policy.id ? (
                                <Loader2 size={20} className="animate-spin" />
                              ) : (
                                <RefreshCw size={20} />
                              )}
                            </button>
                            <button
                              onClick={() => handleGenerateDocument(policy.id)}
                              className="text-green-400 hover:text-green-300 transition p-1.5"
                              title="Gen"
                            >
                              <FileText size={20} />
                            </button>
                            <button
                              onClick={() => handleEmailDocument(policy.id)}
                              className="text-purple-400 hover:text-purple-300 transition p-1.5"
                              title="Email"
                            >
                              <Send size={20} />
                            </button>
                            <button
                              onClick={() => {
                                setPreviewPolicyId(policy.id);
                                setShowPreviewModal(true);
                              }}
                              className="text-cyan-400 hover:text-cyan-300 transition p-1.5"
                              title="View"
                            >
                              <Eye size={20} />
                            </button>
                            <button
                              onClick={() => {
                                setPolicyToDelete(policy);
                                setDeletingPolicyId(policy.id);
                                setShowDeleteConfirm(true);
                              }}
                              className="text-red-400 hover:text-red-300 transition p-1.5"
                              title="Delete"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Policy Edit Drawer */}
      <PolicyEditDrawer
        isOpen={!!editingPolicy}
        policy={editingPolicy}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        onSave={() => editingPolicy && saveEditedPolicy(editingPolicy.id)}
        onCancel={cancelEditPolicy}
        calculateYearlyAP={calculateYearlyAP}
        isSaving={updatePolicyMutation.isPending}
        clientsList={clientsList || []}
      />

      {/* Policy Preview Modal */}
      {previewPolicyId && (
        <AdminPolicyPreviewModal
          open={showPreviewModal}
          onOpenChange={setShowPreviewModal}
          policyId={previewPolicyId}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-[#0a1628] border border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Policy</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-sm text-gray-300">
                {policyToDelete && (
                  <>
                    Are you sure you want to delete this policy?
                    <div className="mt-3 p-3 bg-white/5 rounded border border-white/10">
                      <p className="text-sm font-medium text-white">
                        {getClientName(policyToDelete.clientId)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {policyToDelete.carrier} • {policyToDelete.type} • {policyToDelete.policyNumber}
                      </p>
                    </div>
                    <p className="mt-3 text-xs text-red-400 font-medium">
                      This action cannot be undone.
                    </p>
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600 border-0">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (policyToDelete) {
                  deletePolicyMutation.mutate({ id: policyToDelete.id });
                }
              }}
              disabled={deletePolicyMutation.isPending}
              className="bg-red-600 text-white hover:bg-red-700 border-0"
            >
              {deletePolicyMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


    </div>
  );
}

/* ─── Annuities Tab (FIA & MYGA) ─────────────────────────────────────────── */

function AnnuitiesTab() {
  const { data: annuitiesList, isLoading } =
    trpc.admin.listAnnuities.useQuery();
  const { data: clientsList } = trpc.admin.listClients.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.admin.createAnnuity.useMutation({
    onSuccess: () => {
      utils.admin.listAnnuities.invalidate();
      toast.success("Annuity created");
      setShowForm(false);
      resetForm();
    },
    onError: err => toast.error(err.message),
  });
  const updateMutation = trpc.admin.updateAnnuity.useMutation({
    onSuccess: () => {
      utils.admin.listAnnuities.invalidate();
      toast.success("Annuity updated");
    },
    onError: err => toast.error(err.message),
  });
  const deleteMutation = trpc.admin.deleteAnnuity.useMutation({
    onSuccess: () => {
      utils.admin.listAnnuities.invalidate();
      toast.success("Annuity deleted");
    },
    onError: err => toast.error(err.message),
  });
  const importMutation = trpc.admin.importAnnuityExcel.useMutation({
    onSuccess: data => {
      utils.admin.listAnnuities.invalidate();
      setImportResult(data);
      setShowImportResult(true);
      if (data.created > 0)
        toast.success(
          `Imported ${data.created} annuit${data.created === 1 ? "y" : "ies"}`
        );
      if (data.skipped > 0)
        toast.info(
          `${data.skipped} row${data.skipped === 1 ? "" : "s"} skipped`
        );
    },
    onError: err => toast.error(err.message),
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImportResult, setShowImportResult] = useState(false);
  const [importResult, setImportResult] = useState<{
    created: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  /** Generate and download the Excel sales tracker template */
  async function downloadTemplate() {
    try {
      const { Workbook } = await import("exceljs");
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet("Annuities");

      const headers = [
        "Client Name",
        "Type",
        "Carrier",
        "Product Name",
        "Premium",
        "Term (Years)",
        "Commission (%)",
        "Status",
        "Effective Date",
        "Maturity Date",
        "Notes",
      ];

      // Add header row
      worksheet.addRow(headers);

      // Style header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E78" } };

      // Add sample rows
      const sampleRows = [
        [
          "John Doe",
          "FIA",
          "Athene",
          "Performance Elite 10",
          50000,
          10,
          7,
          "Active",
          "2025-01-15",
          "2035-01-15",
          "Initial deposit",
        ],
        [
          "Jane Smith",
          "MYGA",
          "North American",
          "NAC Guarantee Choice 5",
          100000,
          5,
          3,
          "Active",
          "2025-03-01",
          "2030-03-01",
          "",
        ],
        [
          "Robert Garcia",
          "FIA",
          "Global Atlantic",
          "ForeAccumulation II",
          75000,
          7,
          6.5,
          "Pending",
          "2025-06-01",
          "2032-06-01",
          "Awaiting transfer",
        ],
      ];

      sampleRows.forEach((row) => worksheet.addRow(row));

      // Set column widths
      worksheet.columns = [
        { width: 20 },
        { width: 8 },
        { width: 22 },
        { width: 28 },
        { width: 14 },
        { width: 14 },
        { width: 18 },
        { width: 12 },
        { width: 14 },
        { width: 14 },
        { width: 30 },
      ];

      // Generate and download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Ortiz_Annuity_Sales_Tracker.xlsx";
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Template downloaded!");
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Failed to download template");
    }
  }

  /** Handle file upload */
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error("Please upload an Excel file (.xlsx, .xls) or CSV");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      importMutation.mutate({ fileBase64: base64, fileName: file.name });
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-uploaded
    e.target.value = "";
  }

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "FIA" | "MYGA">("all");
  const [search, setSearch] = useState("");
  const [optimisticStatuses, setOptimisticStatuses] = useState<
    Record<number, string>
  >({});

  // Form state
  const [annuityClientSearch, setAnnuityClientSearch] = useState("");
  const [showAnnuityClientDropdown, setShowAnnuityClientDropdown] = useState(false);
  const [formData, setFormData] = useState({
    clientId: undefined as number | undefined,
    clientName: "",
    type: "FIA" as "FIA" | "MYGA",
    carrier: "",
    productName: "",
    premium: "",
    termYears: "",
    commissionPercent: "",
    status: "active" as
      | "active"
      | "pending"
      | "matured"
      | "surrendered"
      | "cancelled",
    effectiveDate: "",
    maturityDate: "",
    notes: "",
  });

  function resetForm() {
    setFormData({
      clientId: undefined,
      clientName: "",
      type: "FIA",
      carrier: "",
      productName: "",
      premium: "",
      termYears: "",
      commissionPercent: "",
      status: "active",
      effectiveDate: "",
      maturityDate: "",
      notes: "",
    });
    setEditingId(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      clientId: formData.clientId,
      clientName: formData.clientName,
      type: formData.type,
      carrier: formData.carrier,
      productName: formData.productName,
      premium: formData.premium,
      termYears: formData.termYears ? parseInt(formData.termYears) : undefined,
      commissionPercent: formData.commissionPercent || undefined,
      status: formData.status,
      effectiveDate: formData.effectiveDate
        ? new Date(formData.effectiveDate).getTime()
        : undefined,
      maturityDate: formData.maturityDate
        ? new Date(formData.maturityDate).getTime()
        : undefined,
      notes: formData.notes,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  function startEdit(a: any) {
    setEditingId(a.id);
    setFormData({
      clientId: a.clientId || undefined,
      clientName: a.clientName || "",
      type: a.type,
      carrier: a.carrier || "",
      productName: a.productName || "",
      premium: a.premium || "",
      termYears: a.termYears ? String(a.termYears) : "",
      commissionPercent: a.commissionPercent || "",
      status: a.status || "active",
      effectiveDate: a.effectiveDate
        ? new Date(Number(a.effectiveDate)).toISOString().split("T")[0]
        : "",
      maturityDate: a.maturityDate
        ? new Date(Number(a.maturityDate)).toISOString().split("T")[0]
        : "",
      notes: a.notes || "",
    });
    setShowForm(true);
  }

  function handleStatusChange(id: number, newStatus: string) {
    setOptimisticStatuses(prev => ({ ...prev, [id]: newStatus }));
    updateMutation.mutate(
      {
        id,
        status: newStatus as
          | "active"
          | "pending"
          | "matured"
          | "surrendered"
          | "cancelled",
      },
      {
        onError: () =>
          setOptimisticStatuses(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
          }),
      }
    );
  }

  const allAnnuities = annuitiesList || [];
  const filtered = (allAnnuities || []).filter(a => {
    if (filter !== "all" && a.type !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (a.clientName || "").toLowerCase().includes(q) ||
        (a.carrier || "").toLowerCase().includes(q) ||
        (a.productName || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const calcAP = (a: any) => {
    const premium = parseFloat(a.premium || "0");
    const compPct = parseFloat(a.commissionPercent || "0");
    if (isNaN(premium)) return 0;
    if (compPct > 0) return (premium * compPct) / 100;
    return premium;
  };

  const fiaList = (allAnnuities || []).filter(a => a.type === "FIA");
  const mygaList = (allAnnuities || []).filter(a => a.type === "MYGA");
  const totalFIAPremium = (fiaList || []).reduce((s, a) => s + calcAP(a), 0);
  const totalMYGAPremium = (mygaList || []).reduce((s, a) => s + calcAP(a), 0);
  const totalPremium = totalFIAPremium + totalMYGAPremium;
  const activeFIA = (fiaList || []).filter(a => a.status === "active").length;
  const activeMYGA = (mygaList || []).filter(a => a.status === "active").length;

  const [annuityView, setAnnuityView] = useState<"list" | "compensation">(
    "list"
  );
  const [editingComp, setEditingComp] = useState<number | null>(null);
  const [compValue, setCompValue] = useState("");

  const annuityStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "border-emerald-500/50 text-emerald-400";
      case "pending":
        return "border-amber-500/50 text-amber-400";
      case "matured":
        return "border-blue-500/50 text-blue-400";
      case "surrendered":
        return "border-orange-500/50 text-orange-400";
      case "cancelled":
        return "border-red-500/50 text-red-400";
      default:
        return "border-gray-500/50 text-gray-400";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#c9a84c]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Annuity AP",
            value: `$${totalPremium.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            sub: `FIA: $${totalFIAPremium.toLocaleString("en-US", { minimumFractionDigits: 2 })} | MYGA: $${totalMYGAPremium.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            icon: DollarSign,
            color: "text-[#c9a84c]",
          },
          {
            label: "FIA Annuities",
            value: `${fiaList.length}`,
            sub: `${activeFIA} active`,
            icon: TrendingUp,
            color: "text-emerald-400",
          },
          {
            label: "MYGA Annuities",
            value: `${mygaList.length}`,
            sub: `${activeMYGA} active`,
            icon: BarChart3,
            color: "text-blue-400",
          },
          {
            label: "Total Annuities",
            value: `${allAnnuities.length}`,
            sub: `${(allAnnuities || []).filter(a => a.status === "active").length} active`,
            icon: PieChart,
            color: "text-purple-400",
          },
        ].map((card, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg bg-white/5 ${card.color}`}>
                <card.icon size={18} />
              </div>
              <span className="text-xs text-gray-400 uppercase tracking-wider">
                {card.label}
              </span>
            </div>
            <p className="text-xl font-bold text-white">{card.value}</p>
            {(card as any).sub && (
              <p className="text-xs text-gray-500 mt-1">{(card as any).sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 border-b border-white/10 pb-1">
        <button
          onClick={() => setAnnuityView("list")}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition ${
            annuityView === "list"
              ? "bg-[#c9a84c] text-[#0a1628]"
              : "text-gray-400 hover:text-white hover:bg-white/10"
          }`}
        >
          Annuity List
        </button>
        <button
          onClick={() => setAnnuityView("compensation")}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition flex items-center gap-2 ${
            annuityView === "compensation"
              ? "bg-[#c9a84c] text-[#0a1628]"
              : "text-gray-400 hover:text-white hover:bg-white/10"
          }`}
        >
          <DollarSign size={14} />
          Compensation
        </button>
      </div>

      {/* Compensation Sub-Tab */}
      {annuityView === "compensation" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#c9a84c]/30 bg-[#c9a84c]/5 p-4">
            <p className="text-sm text-[#c9a84c] font-semibold mb-1">
              How Compensation % Affects Your AP
            </p>
            <p className="text-xs text-gray-400">
              When you set a commission % on an annuity, the AP Contribution
              becomes <strong className="text-white">Premium × Comp%</strong>{" "}
              instead of the full premium. This flows into your total AP on the
              Analytics tab and the Annuity List.
            </p>
          </div>

          {/* Summary row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                label: "Total Gross Premium",
                value: `$${(allAnnuities || []).reduce((s, a) => s + parseFloat(a.premium || "0"), 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
              },
              {
                label: "Total Comp AP",
                value: `$${(allAnnuities || [])(mygaList || []).reduce((s, a) => s + calcAP(a), 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
              },
              {
                label: "Annuities Without Comp %",
                value: `${(allAnnuities || []).filter(a => !a.commissionPercent || parseFloat(a.commissionPercent) === 0).length}`,
              },
            ].map((card, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/5 p-4 text-center"
              >
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                  {card.label}
                </p>
                <p className="text-xl font-bold text-[#c9a84c]">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Compensation table */}
          {/* Mobile card list */}
          <div className="md:hidden space-y-3">
            {(allAnnuities || []).map(a => (
              <div
                key={a.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold text-sm">
                    {a.clientName}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-bold ${
                      a.type === "FIA"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                    }`}
                  >
                    {a.type}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  {a.carrier}
                  {a.productName ? ` — ${a.productName}` : ""}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500 uppercase tracking-wide">
                      Gross Premium
                    </p>
                    <p className="text-gray-300 font-medium">
                      $
                      {parseFloat(a.premium || "0").toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 uppercase tracking-wide">
                      Comp %
                    </p>
                    {editingComp === a.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={compValue}
                          onChange={e => setCompValue(e.target.value)}
                          className="w-16 bg-white/10 border border-[#c9a84c]/50 rounded px-2 py-1 text-white text-xs text-center focus:outline-none focus:border-[#c9a84c]"
                          autoFocus
                        />
                        <span className="text-gray-400">%</span>
                      </div>
                    ) : (
                      <p className="text-[#c9a84c] font-bold">
                        {a.commissionPercent &&
                        parseFloat(a.commissionPercent) > 0 ? (
                          `${a.commissionPercent}%`
                        ) : (
                          <span className="text-gray-500">Not set</span>
                        )}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-500 uppercase tracking-wide">
                      AP Contribution
                    </p>
                    <p className="text-[#c9a84c] font-bold">
                      {editingComp === a.id
                        ? `$${((parseFloat(a.premium || "0") * (parseFloat(compValue) || 0)) / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })} (preview)`
                        : `$${calcAP(a).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                    </p>
                  </div>
                  <div className="flex items-end">
                    {editingComp === a.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            updateMutation.mutate(
                              { id: a.id, commissionPercent: compValue },
                              {
                                onSuccess: () => {
                                  utils.admin.listAnnuities.invalidate();
                                  toast.success("Comp % saved");
                                  setEditingComp(null);
                                },
                              }
                            );
                          }}
                          disabled={updateMutation.isPending}
                          className="text-green-400 hover:text-green-300 transition"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => setEditingComp(null)}
                          className="text-gray-400 hover:text-white transition"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingComp(a.id);
                          setCompValue(a.commissionPercent || "");
                        }}
                        className="text-gray-400 hover:text-[#c9a84c] transition flex items-center gap-1 text-xs"
                      >
                        <Edit size={12} /> Edit Comp %
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div className="rounded-xl border border-[#c9a84c]/30 bg-[#c9a84c]/5 px-4 py-3 flex justify-between items-center">
              <span className="text-xs text-gray-400 uppercase font-semibold">
                Total AP Contribution
              </span>
              <span className="text-[#c9a84c] font-bold">
                $
                {allAnnuities
                  (fiaList || [])(mygaList || []).reduce((s, a) => s + calcAP(a), 0)
                  .toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block rounded-xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-4 py-3 text-left text-xs text-gray-400 uppercase">
                      Client
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-400 uppercase">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-400 uppercase">
                      Carrier / Product
                    </th>
                    <th className="px-4 py-3 text-right text-xs text-gray-400 uppercase">
                      Gross Premium
                    </th>
                    <th className="px-4 py-3 text-center text-xs text-gray-400 uppercase">
                      Comp %
                    </th>
                    <th className="px-4 py-3 text-right text-xs text-gray-400 uppercase">
                      AP Contribution
                    </th>
                    <th className="px-4 py-3 text-center text-xs text-gray-400 uppercase">
                      Edit
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(allAnnuities || []).map(a => (
                    <tr key={a.id} className="hover:bg-white/5 transition">
                      <td className="px-4 py-3 text-white font-medium whitespace-nowrap">
                        {a.clientName}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-bold ${
                            a.type === "FIA"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                          }`}
                        >
                          {a.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                        {a.carrier}
                        {a.productName ? ` — ${a.productName}` : ""}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-300 whitespace-nowrap">
                        $
                        {parseFloat(a.premium || "0").toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      {editingComp === a.id ? (
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center gap-1 justify-center">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              value={compValue}
                              onChange={e => setCompValue(e.target.value)}
                              className="w-20 bg-white/10 border border-[#c9a84c]/50 rounded px-2 py-1 text-white text-sm text-center focus:outline-none focus:border-[#c9a84c]"
                              autoFocus
                            />
                            <span className="text-gray-400 text-xs">%</span>
                          </div>
                        </td>
                      ) : (
                        <td className="px-4 py-3 text-center">
                          {a.commissionPercent &&
                          parseFloat(a.commissionPercent) > 0 ? (
                            <span className="text-[#c9a84c] font-bold">
                              {a.commissionPercent}%
                            </span>
                          ) : (
                            <span className="text-gray-500 text-xs">
                              Not set
                            </span>
                          )}
                        </td>
                      )}
                      <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                        {editingComp === a.id ? (
                          <span className="text-[#c9a84c]">
                            $
                            {(
                              (parseFloat(a.premium || "0") *
                                (parseFloat(compValue) || 0)) /
                              100
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                            <span className="text-xs text-gray-500 ml-1">
                              (preview)
                            </span>
                          </span>
                        ) : (
                          <span className="text-[#c9a84c]">
                            $
                            {calcAP(a).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {editingComp === a.id ? (
                          <div className="flex items-center gap-1 justify-center">
                            <button
                              onClick={() => {
                                updateMutation.mutate(
                                  { id: a.id, commissionPercent: compValue },
                                  {
                                    onSuccess: () => {
                                      utils.admin.listAnnuities.invalidate();
                                      toast.success("Comp % saved");
                                      setEditingComp(null);
                                    },
                                  }
                                );
                              }}
                              disabled={updateMutation.isPending}
                              className="text-green-400 hover:text-green-300 transition"
                              title="Save"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => setEditingComp(null)}
                              className="text-gray-400 hover:text-white transition"
                              title="Cancel"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingComp(a.id);
                              setCompValue(a.commissionPercent || "");
                            }}
                            className="text-gray-400 hover:text-[#c9a84c] transition"
                            title="Edit Comp %"
                          >
                            <Edit size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-[#c9a84c]/30 bg-[#c9a84c]/5">
                    <td
                      colSpan={5}
                      className="px-4 py-3 text-right text-xs text-gray-400 uppercase font-semibold"
                    >
                      Total AP Contribution
                    </td>
                    <td className="px-4 py-3 text-right text-[#c9a84c] font-bold text-base">
                      $
                      {allAnnuities
                        (mygaList || []).reduce((s, a) => s + calcAP(a), 0)
                        .toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {annuityView === "list" && (
        <>
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex gap-2">
              {(["all", "FIA", "MYGA"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
                    filter === f
                      ? "bg-[#c9a84c] text-[#0a1628]"
                      : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {f === "all" ? "All" : f}
                </button>
              ))}
            </div>
            <div className="flex gap-3 items-center">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Search annuities..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50 w-56"
                />
              </div>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 font-semibold rounded-lg text-sm transition"
                title="Download Excel sales tracker template"
              >
                <Download size={14} />
                Template
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={importMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 font-semibold rounded-lg text-sm transition disabled:opacity-50"
                title="Upload Excel file to import annuities"
              >
                {importMutation.isPending ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Upload size={14} />
                )}
                {importMutation.isPending ? "Importing..." : "Import"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(!showForm);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#c9a84c] to-[#e8c84a] text-[#0a1628] font-bold rounded-lg text-sm hover:shadow-lg transition"
              >
                {showForm ? <X size={14} /> : <Plus size={14} />}
                {showForm ? "Cancel" : "Add Annuity"}
              </button>
            </div>
          </div>

          {/* Import Results */}
          {showImportResult && importResult && (
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet size={20} className="text-[#c9a84c]" />
                  Import Results
                </h3>
                <button
                  onClick={() => setShowImportResult(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                  <CheckCircle
                    className="mx-auto mb-1 text-emerald-400"
                    size={24}
                  />
                  <p className="text-2xl font-bold text-emerald-400">
                    {importResult.created}
                  </p>
                  <p className="text-xs text-gray-400">Imported</p>
                </div>
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-center">
                  <AlertCircle
                    className="mx-auto mb-1 text-amber-400"
                    size={24}
                  />
                  <p className="text-2xl font-bold text-amber-400">
                    {importResult.skipped}
                  </p>
                  <p className="text-xs text-gray-400">Skipped</p>
                </div>
              </div>
              {importResult.errors.length > 0 && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                  <p className="text-sm font-semibold text-red-400 mb-2">
                    Errors:
                  </p>
                  <ul className="space-y-1">
                    {importResult.errors.map((err, i) => (
                      <li key={i} className="text-xs text-red-300">
                        {err}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Add/Edit Form */}
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 space-y-4"
            >
              <h3 className="text-lg font-bold text-white mb-2">
                {editingId ? "Edit Annuity" : "New Annuity"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Link to Client dropdown */}
                <div className="md:col-span-3">
                  <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1">
                    <span className="text-[#c9a84c]">🔗</span> Link to Client (optional — links annuity to client portal)
                  </label>
                  <div className="relative">
                    <div
                      className="w-full px-3 py-2 text-sm bg-white/5 border border-[#c9a84c]/50 rounded-lg text-white cursor-pointer flex items-center justify-between"
                      onClick={() => { setShowAnnuityClientDropdown(!showAnnuityClientDropdown); setAnnuityClientSearch(""); }}
                    >
                      <span className={formData.clientId ? "text-white" : "text-gray-400"}>
                        {formData.clientId
                          ? (() => { const c = (clientsList || []).find((cl: any) => cl.id === formData.clientId); return c ? `${c.firstName} ${c.lastName}` : formData.clientName || "Unknown"; })()
                          : "— Search and select a client to link —"}
                      </span>
                      <span className="text-gray-400 text-xs">🔍</span>
                    </div>
                    {showAnnuityClientDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[#0f2040] border border-[#c9a84c]/30 rounded shadow-xl z-10 max-h-56 overflow-hidden flex flex-col">
                        <div className="p-2 border-b border-white/10">
                          <input
                            autoFocus
                            type="text"
                            value={annuityClientSearch}
                            onChange={e => setAnnuityClientSearch(e.target.value)}
                            placeholder="Search clients..."
                            className="w-full bg-white/10 border border-white/20 rounded px-3 py-1.5 text-white text-sm focus:outline-none"
                          />
                        </div>
                        <div className="overflow-y-auto">
                          {(clientsList || []).filter((c: any) => !annuityClientSearch.trim() || `${c.firstName} ${c.lastName}`.toLowerCase().includes(annuityClientSearch.toLowerCase())).slice(0, 20).map((c: any) => (
                            <button
                              key={c.id}
                              type="button"
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition ${formData.clientId === c.id ? "text-[#c9a84c] bg-white/5" : "text-white"}`}
                              onClick={() => { setFormData(p => ({ ...p, clientId: c.id, clientName: `${c.firstName} ${c.lastName}` })); setShowAnnuityClientDropdown(false); setAnnuityClientSearch(""); }}
                            >
                              {c.firstName} {c.lastName}
                            </button>
                          ))}
                          {(clientsList || []).filter((c: any) => !annuityClientSearch.trim() || `${c.firstName} ${c.lastName}`.toLowerCase().includes(annuityClientSearch.toLowerCase())).length === 0 && (
                            <div className="px-3 py-3 text-gray-500 text-sm text-center">No clients found</div>
                          )}
                        </div>
                      </div>
                    )}
                    {formData.clientId && <p className="text-xs text-[#c9a84c] mt-1">✓ Annuity will appear in {formData.clientName}'s portal</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={e =>
                      setFormData(p => ({ ...p, clientName: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={e =>
                      setFormData(p => ({
                        ...p,
                        type: e.target.value as "FIA" | "MYGA",
                      }))
                    }
                    className="w-full px-3 py-2 text-sm bg-[#0a1628] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
                  >
                    <option value="FIA">FIA — Fixed Index Annuity</option>
                    <option value="MYGA">
                      MYGA — Multi-Year Guaranteed Annuity
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Carrier *
                  </label>
                  <CarrierSelect
                    value={formData.carrier}
                    onChange={v => setFormData(p => ({ ...p, carrier: v }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={e =>
                      setFormData(p => ({ ...p, productName: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
                    placeholder="e.g. Performance Elite 10"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Premium Amount *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.premium}
                    onChange={e =>
                      setFormData(p => ({ ...p, premium: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
                    placeholder="50000.00"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Term (Years)
                  </label>
                  <input
                    type="number"
                    value={formData.termYears}
                    onChange={e =>
                      setFormData(p => ({ ...p, termYears: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
                    placeholder="5, 7, 10..."
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Commission (%)
                  </label>
                  <input
                    type="text"
                    value={formData.commissionPercent}
                    onChange={e =>
                      setFormData(p => ({
                        ...p,
                        commissionPercent: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
                    placeholder="e.g. 7"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={e =>
                      setFormData(p => ({
                        ...p,
                        status: e.target.value as any,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm bg-[#0a1628] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="matured">Matured</option>
                    <option value="surrendered">Surrendered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Effective Date
                  </label>
                  <input
                    type="date"
                    value={formData.effectiveDate}
                    onChange={e =>
                      setFormData(p => ({
                        ...p,
                        effectiveDate: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Maturity Date
                  </label>
                  <input
                    type="date"
                    value={formData.maturityDate}
                    onChange={e =>
                      setFormData(p => ({ ...p, maturityDate: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs text-gray-400 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={e =>
                      setFormData(p => ({ ...p, notes: e.target.value }))
                    }
                    rows={2}
                    className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="px-6 py-2 bg-gradient-to-r from-[#c9a84c] to-[#e8c84a] text-[#0a1628] font-bold rounded-lg text-sm hover:shadow-lg transition disabled:opacity-50"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="inline animate-spin mr-2" size={14} />
                  )}
                  {editingId ? "Update Annuity" : "Create Annuity"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-6 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Data Table */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 rounded-xl border border-white/10 bg-white/5">
              <TrendingUp className="mx-auto mb-3 text-gray-600" size={48} />
              <p className="text-gray-400 text-lg">No annuities found</p>
              <p className="text-gray-500 text-sm mt-1">
                Click "Add Annuity" to create your first FIA or MYGA record.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {(filtered || []).map(a => (
                  <div
                    key={a.id}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold">
                        {a.clientName}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-bold ${
                          a.type === "FIA"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                        }`}
                      >
                        {a.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {a.carrier}
                      {a.productName ? ` — ${a.productName}` : ""}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500 uppercase">Premium</p>
                        <p className="text-[#c9a84c] font-semibold">
                          $
                          {parseFloat(a.premium || "0").toLocaleString(
                            "en-US",
                            { minimumFractionDigits: 2 }
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 uppercase">
                          AP Contribution
                        </p>
                        <p className="text-[#c9a84c]/80 font-medium">
                          $
                          {calcAP(a).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 uppercase">Term</p>
                        <p className="text-gray-300">
                          {a.termYears ? `${a.termYears} yr` : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 uppercase">Comm %</p>
                        <p className="text-gray-300">
                          {a.commissionPercent
                            ? `${a.commissionPercent}%`
                            : "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <select
                        value={String(optimisticStatuses[a.id] ?? (a as Annuity).status)}
                        onChange={e => handleStatusChange(a.id, e.target.value)}
                        disabled={updateMutation.isPending}
                        className={`text-xs px-2 py-1 rounded-full capitalize border cursor-pointer appearance-none font-semibold focus:outline-none ${annuityStatusColor(String(optimisticStatuses[a.id] ?? (a as Annuity).status))}`}
                        style={{ background: "transparent" }}
                      >
                        <option
                          value="active"
                          className="bg-[#0a1628] text-white"
                        >
                          Active
                        </option>
                        <option
                          value="pending"
                          className="bg-[#0a1628] text-white"
                        >
                          Pending
                        </option>
                        <option
                          value="matured"
                          className="bg-[#0a1628] text-white"
                        >
                          Matured
                        </option>
                        <option
                          value="surrendered"
                          className="bg-[#0a1628] text-white"
                        >
                          Surrendered
                        </option>
                        <option
                          value="cancelled"
                          className="bg-[#0a1628] text-white"
                        >
                          Cancelled
                        </option>
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(a)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-[#c9a84c] transition"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete this annuity?"))
                              deleteMutation.mutate({ id: a.id });
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop table */}
              <div className="hidden md:block rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="px-4 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-4 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">
                          Carrier
                        </th>
                        <th className="px-4 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-4 py-3 text-right text-xs text-gray-400 uppercase tracking-wider">
                          Premium
                        </th>
                        <th className="px-4 py-3 text-center text-xs text-gray-400 uppercase tracking-wider">
                          Term
                        </th>
                        <th className="px-4 py-3 text-center text-xs text-gray-400 uppercase tracking-wider">
                          Comm %
                        </th>
                        <th className="px-4 py-3 text-right text-xs text-gray-400 uppercase tracking-wider">
                          AP Contribution
                        </th>
                        <th className="px-4 py-3 text-center text-xs text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-center text-xs text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {(filtered || []).map(a => {
                        let rowBgClass = "hover:bg-white/5 transition";
                        if (a.isPaid) {
                          rowBgClass = "bg-emerald-500/10 border-l-4 border-emerald-500 hover:bg-emerald-500/15 transition";
                        } else {
                          rowBgClass = "bg-amber-500/10 border-l-4 border-amber-500 hover:bg-amber-500/15 transition";
                        }
                        return (
                        <tr key={a.id} className={rowBgClass}>
                          <td className="px-4 py-3 text-white font-medium">
                            {a.clientName}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-bold ${
                                a.type === "FIA"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                  : "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                              }`}
                            >
                              {a.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-300">
                            {a.carrier}
                          </td>
                          <td className="px-4 py-3 text-gray-400">
                            {a.productName || "—"}
                          </td>
                          <td className="px-4 py-3 text-right text-[#c9a84c] font-semibold">
                            $
                            {parseFloat(a.premium || "0").toLocaleString(
                              "en-US",
                              { minimumFractionDigits: 2 }
                            )}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-300">
                            {a.termYears ? `${a.termYears} yr` : "—"}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-300">
                            {a.commissionPercent
                              ? `${a.commissionPercent}%`
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-right text-[#c9a84c]/80 font-medium">
                            $
                            {calcAP(a).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                            {a.commissionPercent &&
                              parseFloat(a.commissionPercent) > 0 && (
                                <span className="text-xs text-gray-500 ml-1">
                                  ({a.commissionPercent}%)
                                </span>
                              )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <select
                              value={String(optimisticStatuses[a.id] ?? (a as Annuity).status)}
                              onChange={e =>
                                handleStatusChange(a.id, e.target.value)
                              }
                              disabled={updateMutation.isPending}
                              className={`text-xs px-2 py-1 rounded-full capitalize border cursor-pointer appearance-none text-center font-semibold focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50 ${annuityStatusColor(String(optimisticStatuses[a.id] ?? (a as Annuity).status))}`}
                              style={{ background: "transparent" }}
                            >
                              <option
                                value="active"
                                className="bg-[#0a1628] text-white"
                              >
                                Active
                              </option>
                              <option
                                value="pending"
                                className="bg-[#0a1628] text-white"
                              >
                                Pending
                              </option>
                              <option
                                value="matured"
                                className="bg-[#0a1628] text-white"
                              >
                                Matured
                              </option>
                              <option
                                value="surrendered"
                                className="bg-[#0a1628] text-white"
                              >
                                Surrendered
                              </option>
                              <option
                                value="cancelled"
                                className="bg-[#0a1628] text-white"
                              >
                                Cancelled
                              </option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <select
                                value={a.isPaid ? "paid" : "unpaid"}
                                onChange={(e) => {
                                  updateMutation.mutate({
                                    id: a.id,
                                    isPaid: e.target.value === "paid",
                                  });
                                }}
                                className="px-2 py-1 text-xs rounded border border-white/20 bg-slate-800 text-gray-200 hover:bg-slate-700 transition cursor-pointer font-medium"
                                disabled={updateMutation.isPending}
                              >
                                <option value="unpaid" className="bg-slate-800 text-gray-200">Unpaid</option>
                                <option value="paid" className="bg-slate-800 text-gray-200">Paid</option>
                              </select>
                              <button
                                onClick={() => startEdit(a)}
                                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-[#c9a84c] transition"
                                title="Edit"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm("Delete this annuity?"))
                                    deleteMutation.mutate({ id: a.id });
                                }}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

/* ─── GWL Mobile Expandable Cards ──────────────────────────────────────── */

function GWLMobileCards({
  policies,
  fmt,
  freqLabel,
  startEdit,
  deleteGWL,
}: {
  policies: any[];
  fmt: (n: number) => string;
  freqLabel: Record<string, string>;
  startEdit: (p: any) => void;
  deleteGWL: { mutate: (args: { id: number }) => void };
}) {
  const [openId, setOpenId] = useState<number | null>(null);
  return (
    <div className="md:hidden space-y-2">
      {(policies || []).map(p => (
        <div
          key={p.id}
          className="rounded-xl border border-white/10 bg-white/5 overflow-hidden"
        >
          {/* Header row — tap to expand */}
          <button
            onClick={() => setOpenId(openId === p.id ? null : p.id)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition"
          >
            <div>
              <p className="text-white font-semibold text-sm">{p.clientName}</p>
              <p className="text-gray-400 text-xs">{p.carrier}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  p.status === "active"
                    ? "bg-green-500/20 text-green-400"
                    : p.status === "pending"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : p.status === "lapsed"
                        ? "bg-orange-500/20 text-orange-400"
                        : "bg-red-500/20 text-red-400"
                }`}
              >
                {p.status}
              </span>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200 ${openId === p.id ? "rotate-180" : ""}`}
              />
            </div>
          </button>
          {/* Expandable details */}
          {openId === p.id && (
            <div className="border-t border-white/10 px-4 py-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-500 uppercase tracking-wide mb-0.5">
                    Policy #
                  </p>
                  <p className="text-gray-300">{p.policyNumber || "—"}</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase tracking-wide mb-0.5">
                    Frequency
                  </p>
                  <p className="text-gray-300">
                    {freqLabel[p.premiumFrequency] || p.premiumFrequency}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase tracking-wide mb-0.5">
                    Premium
                  </p>
                  <p className="text-white font-medium">
                    {fmt(parseFloat(p.premium))}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase tracking-wide mb-0.5">
                    Yearly AP
                  </p>
                  <p className="text-[#c9a84c] font-semibold">
                    {p.yearlyAP ? fmt(parseFloat(p.yearlyAP)) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase tracking-wide mb-0.5">
                    Comp %
                  </p>
                  <p className="text-gray-300">
                    {p.commissionPercent ? `${p.commissionPercent}%` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase tracking-wide mb-0.5">
                    Face Amount
                  </p>
                  <p className="text-gray-300">
                    {p.coverageAmount ? fmt(parseFloat(p.coverageAmount)) : "—"}
                  </p>
                </div>
              </div>
              {p.notes && (
                <p className="text-xs text-gray-400 italic">{p.notes}</p>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => startEdit(p)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-medium transition"
                >
                  <Edit size={12} /> Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete ${p.clientName}'s GWL policy?`))
                      deleteGWL.mutate({ id: p.id });
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-500/5 border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs font-medium transition"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Graded Whole Life Tab ─────────────────────────────────────────────── */

function GradedWholeLifeTab() {
  const utils = trpc.useUtils();
  // Use listPolicies instead of listGWL to show life policies from the policies table
  const { data: policiesList, isLoading } = trpc.admin.listPolicies.useQuery();
  const addGWL = trpc.admin.addGWL.useMutation({
    onSuccess: () => utils.admin.listPolicies.invalidate(),
  });
  const updateGWL = trpc.admin.updateGWL.useMutation({
    onSuccess: () => utils.admin.listPolicies.invalidate(),
  });
  const deleteGWL = trpc.admin.deleteGWL.useMutation({
    onSuccess: () => utils.admin.listPolicies.invalidate(),
  });
  // updatePolicy is used when editing policies from the main policies table
  const updatePolicyMutation = trpc.admin.updatePolicy.useMutation({
    onSuccess: () => utils.admin.listPolicies.invalidate(),
  });
  // deletePolicy is used when deleting policies from the main policies table
  const deletePolicyMutation = trpc.admin.deletePolicy.useMutation({
    onSuccess: () => utils.admin.listPolicies.invalidate(),
  });

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [gwlClientSearch, setGwlClientSearch] = useState("");
  const [showGwlClientDropdown, setShowGwlClientDropdown] = useState(false);
  const [form, setForm] = useState({
    clientId: undefined as number | undefined,
    clientName: "",
    carrier: "",
    policyNumber: "",
    type: "",
    premium: "",
    premiumFrequency: "monthly" as
      | "monthly"
      | "quarterly"
      | "semi-annual"
      | "annual",
    commissionPercent: "",
    coverageAmount: "",
    status: "active" as "active" | "pending" | "lapsed" | "cancelled",
    notes: "",
  });

  const freqMultiplier = {
    monthly: 12,
    quarterly: 4,
    "semi-annual": 2,
    annual: 1,
  };
  const calcYearlyAP = (premium: string, freq: string) => {
    const p = parseFloat(premium);
    if (isNaN(p) || p <= 0) return null;
    const mult = freqMultiplier[freq as keyof typeof freqMultiplier] || 12;
    return (p * mult).toFixed(2);
  };

  const resetForm = () => {
    setForm({
      clientId: undefined,
      clientName: "",
      carrier: "",
      policyNumber: "",
      type: "",
      premium: "",
      premiumFrequency: "monthly",
      commissionPercent: "",
      coverageAmount: "",
      status: "active",
      notes: "",
    });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    // For new policies, require clientName, carrier, and premium
    // For edits, only require carrier (premium may already be set in DB)
    if (editId !== null) {
      if (!form.carrier) return;
    } else {
      if (!form.clientName || !form.carrier || !form.premium) return;
    }
    const yearlyAP = calcYearlyAP(form.premium, form.premiumFrequency);
    const payload = { ...form, yearlyAP: yearlyAP || undefined };
    if (editId !== null) {
      // Check if this is a policy from the main policies table (not graded_whole_life_policies)
      const editingPolicy = (policiesList || []).find(p => p.id === editId);
      if (editingPolicy) {
        // Update in the policies table using updatePolicy
        await updatePolicyMutation.mutateAsync({
          id: editId,
          clientId: form.clientId || undefined,
          type: form.type || undefined,
          carrier: form.carrier || undefined,
          policyNumber: form.policyNumber || undefined,
          premiumAmount: form.premium || undefined,
          premiumFrequency: form.premiumFrequency as any || undefined,
          coverageAmount: form.coverageAmount || undefined,
          commissionRate: form.commissionPercent || undefined,
          annualPremium: yearlyAP || undefined,
          status: form.status as any || undefined,
          notes: form.notes || undefined,
        });
      } else {
        // Fall back to updateGWL for legacy graded_whole_life_policies entries
        await updateGWL.mutateAsync({ id: editId, ...payload });
      }
    } else {
      await addGWL.mutateAsync(payload);
    }
    resetForm();
  };

  const startEdit = (p: any) => {
    // policies table uses premiumAmount; graded_whole_life_policies uses premium
    const premiumVal = p.premiumAmount || p.premium || "";
    // policies table uses coverageAmount; graded_whole_life_policies uses faceAmount
    const coverageVal = p.coverageAmount || p.faceAmount || "";
    setForm({
      clientId: p.clientId || undefined,
      clientName: p.clientName || "",
      carrier: p.carrier || "",
      policyNumber: p.policyNumber || "",
      type: (p.type || "").trim(),
      premium: premiumVal,
      premiumFrequency: p.premiumFrequency || p.gwl_premiumFrequency || "monthly",
      commissionPercent: p.commissionRate || p.commissionPercent || "",
      coverageAmount: coverageVal,
      status: p.status || p.gwl_status || "active",
      notes: p.notes || "",
    });
    setEditId(p.id);
    setShowForm(true);
  };

  // Filter to show only life policies (exclude annuities)
  const allPolicies = policiesList || [];
  // Match all life-related types: WL, WL , whole_life, term_life, universal_life, etc.
  // Exclude annuities and disability/critical illness only
  const ANNUITY_TYPES = ["fixed_annuity", "variable_annuity", "indexed_annuity", "immediate_annuity"];
  const lifeTypePolicies = (allPolicies || []).filter(p => {
    const type = (p.type || "").trim().toLowerCase();
    if (ANNUITY_TYPES.includes(type)) return false;
    if (type === "disability" || type === "critical_illness" || type === "other") return false;
    return true;
  });
  const activePolicies = (lifeTypePolicies || []).filter(p => p.status === "active");
  const totalYearlyAP = (activePolicies || []).reduce(
    (sum, p) => sum + parseFloat((p as any).yearlyAP || p.premiumAmount || "0"),
    0
  );
  const totalPremium = (activePolicies || []).reduce(
    (sum, p) => sum + parseFloat(p.premiumAmount || "0"),
    0
  );

  const fmt = (n: number) =>
    n.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    });
  const freqLabel = {
    monthly: "Monthly",
    quarterly: "Quarterly",
    "semi-annual": "Semi-Annual",
    annual: "Annual",
  };

  return (
    <div className="py-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-gray-400 text-sm mb-1">Total Life Policies</p>
          <p className="text-3xl font-bold text-white">{lifeTypePolicies.length}</p>
          <p className="text-xs text-gray-500 mt-1">
            {activePolicies.length} active
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-gray-400 text-sm mb-1">Total Yearly AP (Active)</p>
          <p className="text-3xl font-bold text-[#c9a84c]">
            {fmt(totalYearlyAP)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Annual premium total</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-gray-400 text-sm mb-1">Total Premium (Active)</p>
          <p className="text-3xl font-bold text-green-400">
            {fmt(totalPremium)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Per-payment premium</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-lg">
          Life Insurance Policies
        </h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#c9a84c] text-[#0a1628] font-semibold text-sm hover:bg-[#e8c84a] transition"
        >
          <Plus size={16} /> Add Policy
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-[#c9a84c]/30 bg-white/5 p-6 space-y-4">
          <h3 className="text-[#c9a84c] font-semibold">
            {editId !== null ? "Edit" : "Add"} Life Insurance Policy
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Link to Client dropdown */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-gray-400 text-xs mb-1 flex items-center gap-1">
                <span className="text-[#c9a84c]">🔗</span> Link to Client (optional — links policy to client portal)
              </label>
              <div className="relative">
                <div
                  className="w-full bg-white/10 border border-[#c9a84c]/50 rounded-lg px-3 py-2 text-white text-sm cursor-pointer flex items-center justify-between"
                  onClick={() => { setShowGwlClientDropdown(!showGwlClientDropdown); setGwlClientSearch(""); }}
                >
                  <span className={form.clientId ? "text-white" : "text-gray-400"}>
                    {form.clientId
                      ? (() => { const c = (clientsList || []).find((cl: any) => cl.id === form.clientId); return c ? `${c.firstName} ${c.lastName}` : form.clientName || "Unknown"; })()
                      : "— Search and select a client to link —"}
                  </span>
                  <span className="text-gray-400 text-xs">🔍</span>
                </div>
                {showGwlClientDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#0f2040] border border-[#c9a84c]/30 rounded shadow-xl z-10 max-h-56 overflow-hidden flex flex-col">
                    <div className="p-2 border-b border-white/10">
                      <input
                        autoFocus
                        type="text"
                        value={gwlClientSearch}
                        onChange={e => setGwlClientSearch(e.target.value)}
                        placeholder="Search clients..."
                        className="w-full bg-white/10 border border-white/20 rounded px-3 py-1.5 text-white text-sm focus:outline-none"
                      />
                    </div>
                    <div className="overflow-y-auto">
                      {(clientsList || []).filter((c: any) => !gwlClientSearch.trim() || `${c.firstName} ${c.lastName}`.toLowerCase().includes(gwlClientSearch.toLowerCase())).slice(0, 20).map((c: any) => (
                        <button
                          key={c.id}
                          type="button"
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition ${form.clientId === c.id ? "text-[#c9a84c] bg-white/5" : "text-white"}`}
                          onClick={() => { setForm(f => ({ ...f, clientId: c.id, clientName: `${c.firstName} ${c.lastName}` })); setShowGwlClientDropdown(false); setGwlClientSearch(""); }}
                        >
                          {c.firstName} {c.lastName}
                        </button>
                      ))}
                      {(clientsList || []).filter((c: any) => !gwlClientSearch.trim() || `${c.firstName} ${c.lastName}`.toLowerCase().includes(gwlClientSearch.toLowerCase())).length === 0 && (
                        <div className="px-3 py-3 text-gray-500 text-sm text-center">No clients found</div>
                      )}
                    </div>
                  </div>
                )}
                {form.clientId && <p className="text-xs text-[#c9a84c] mt-1">✓ Policy will appear in {form.clientName}'s portal</p>}
              </div>
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">
                Client Name *
              </label>
              <input
                value={form.clientName}
                onChange={e =>
                  setForm(f => ({ ...f, clientName: e.target.value }))
                }
                placeholder="Full name"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">
                Carrier *
              </label>
              <CarrierSelect
                value={form.carrier}
                onChange={v => setForm(f => ({ ...f, carrier: v }))}
                placeholder="Select carrier"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">
                Policy Number
              </label>
              <input
                value={form.policyNumber}
                onChange={e =>
                  setForm(f => ({ ...f, policyNumber: e.target.value }))
                }
                placeholder="Policy #"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">
                Policy Type
              </label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full bg-[#0f2040] border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="">-- Select Type --</option>
                <option value="WL">Whole Life (WL)</option>
                <option value="GWL">Graded Whole Life (GWL)</option>
                <option value="Term">Term Life</option>
                <option value="Final Expense">Final Expense</option>
                <option value="Accidental">Accidental Death</option>
                <option value="IUL">Indexed Universal Life (IUL)</option>
                <option value="UL">Universal Life (UL)</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">
                Premium *
              </label>
              <input
                type="number"
                value={form.premium}
                onChange={e =>
                  setForm(f => ({ ...f, premium: e.target.value }))
                }
                placeholder="0.00"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">
                Frequency
              </label>
              <select
                value={form.premiumFrequency}
                onChange={e =>
                  setForm(f => ({
                    ...f,
                    premiumFrequency: e.target.value as any,
                  }))
                }
                className="w-full bg-[#0f2040] border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="semi-annual">Semi-Annual</option>
                <option value="annual">Annual</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">
                Yearly AP (auto)
              </label>
              <input
                readOnly
                value={
                  form.premium
                    ? fmt(
                        parseFloat(
                          calcYearlyAP(form.premium, form.premiumFrequency) ||
                            "0"
                        )
                      )
                    : ""
                }
                placeholder="Auto"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[#c9a84c] text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">
                Commission %
              </label>
              <input
                type="number"
                value={form.commissionPercent}
                onChange={e =>
                  setForm(f => ({ ...f, commissionPercent: e.target.value }))
                }
                placeholder="e.g. 80"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">
                Face Amount
              </label>
              <input
                type="number"
                value={form.coverageAmount}
                onChange={e =>
                  setForm(f => ({ ...f, coverageAmount: e.target.value }))
                }
                placeholder="0.00"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Status</label>
              <select
                value={form.status}
                onChange={e =>
                  setForm(f => ({ ...f, status: e.target.value as any }))
                }
                className="w-full bg-[#0f2040] border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="lapsed">Lapsed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-gray-400 text-xs mb-1">Notes</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2}
                placeholder="Optional notes"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={addGWL.isPending || updateGWL.isPending || updatePolicyMutation.isPending}
              className="px-5 py-2 rounded-lg bg-[#c9a84c] text-[#0a1628] font-semibold text-sm hover:bg-[#e8c84a] transition disabled:opacity-50"
            >
              {addGWL.isPending || updateGWL.isPending || updatePolicyMutation.isPending
                ? "Saving..."
                : editId !== null
                  ? "Save Changes"
                  : "Add Policy"}
            </button>
            <button
              onClick={resetForm}
              className="px-5 py-2 rounded-lg border border-white/20 text-gray-300 text-sm hover:bg-white/5 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-[#c9a84c]" size={28} />
        </div>
      ) : lifeTypePolicies.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No life insurance policies yet. Click "Add Policy" to get started.
        </div>
      ) : (
        <>
          {/* Mobile: expandable cards */}
          <GWLMobileCards
            policies={lifeTypePolicies}
            fmt={fmt}
            freqLabel={freqLabel}
            startEdit={startEdit}
            deleteGWL={deleteGWL}
          />
          {/* Desktop: full table */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">
                    Client
                  </th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">
                    Carrier
                  </th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">
                    Policy #
                  </th>
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">
                    Premium
                  </th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">
                    Freq
                  </th>
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">
                    Yearly AP
                  </th>
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">
                    Comp %
                  </th>
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">
                    Face Amount
                  </th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">
                    Status
                  </th>
                  <th className="text-center px-4 py-3 text-gray-400 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {(lifeTypePolicies || []).map((p, i) => (
                  <tr
                    key={p.id}
                    className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/[0.02]" : ""} hover:bg-white/5 transition`}
                  >
                    <td className="px-4 py-3 text-white font-medium">
                      {p.clientName}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{p.carrier}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {p.policyNumber || "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-white">
                      {p.premiumAmount ? fmt(parseFloat(p.premiumAmount)) : (p as any).premium ? fmt(parseFloat((p as any).premium)) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {freqLabel[
                        p.premiumFrequency as keyof typeof freqLabel
                      ] || p.premiumFrequency}
                    </td>
                    <td className="px-4 py-3 text-right text-[#c9a84c] font-semibold">
                      {p.yearlyAP ? fmt(parseFloat(p.yearlyAP)) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">
                      {(p as any).commissionRate ? `${(p as any).commissionRate}%` : (p as any).commissionPercent ? `${(p as any).commissionPercent}%` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">
                      {p.coverageAmount ? fmt(parseFloat(p.coverageAmount)) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === "active" ? "bg-green-500/20 text-green-400" : p.status === "pending" ? "bg-yellow-500/20 text-yellow-400" : p.status === "lapsed" ? "bg-orange-500/20 text-orange-400" : "bg-red-500/20 text-red-400"}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => startEdit(p)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => {
                            const clientLabel = (p as any).clientName || `Client #${p.clientId}`;
                            if (confirm(`Delete ${clientLabel}'s policy?`)) {
                              deletePolicyMutation.mutate({ id: p.id });
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-[#c9a84c]/30 bg-white/5">
                  <td
                    colSpan={5}
                    className="px-4 py-3 text-gray-400 font-semibold text-right"
                  >
                    Active Totals:
                  </td>
                  <td className="px-4 py-3 text-right text-[#c9a84c] font-bold">
                    {fmt(totalYearlyAP)}
                  </td>
                  <td colSpan={4} />
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Onboarding Tab ─────────────────────────────────────────────────────── */

function OnboardingTab() {
  const utils = trpc.useUtils();
  const createMutation = trpc.admin.createClientFromIntakeForm.useMutation({
    onSuccess: () => {
      toast.success("Client added successfully!");
      utils.admin.listClients.invalidate();
      utils.admin.getSalesByMonth.invalidate();
      utils.admin.listPolicies.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to add client");
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ClientIntakeForm
        onSubmit={async (data) => {
          const { healthConditions, beneficiary, yearlyAP, commissionPercent, ...rest } = data;
          await createMutation.mutateAsync({
            ...rest,
            annualPremium: yearlyAP || "0",
            commissionPercent: commissionPercent ? parseFloat(commissionPercent.toString()) : 0,
            healthConditionsJSON: JSON.stringify(healthConditions),
          });
        }}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}

/* ─── Policy Notes Tab ─────────────────────────────────────────────────────── */

function PolicyNotesTab() {
  const { data: policiesList, isLoading } = trpc.admin.listPolicies.useQuery();
  const { data: clientsList } = trpc.admin.listClients.useQuery();
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [noteValue, setNoteValue] = useState("");

  const updateMutation = trpc.admin.updatePolicy.useMutation({
    onSuccess: () => {
      utils.admin.listPolicies.invalidate();
      toast.success("Note saved");
      setEditingId(null);
    },
    onError: err => toast.error(err.message || "Failed to save note"),
  });

  const getClientName = (clientId: number) => {
    const client = (clientsList || []).find(c => c.id === clientId);
    return client
      ? `${client.firstName} ${client.lastName}`
      : `Client #${clientId}`;
  };

  const filtered = (policiesList || []).filter(p => {
    const q = search.toLowerCase();
    const clientName = getClientName((p as any).clientId);
    const carrier = (p as any).carrier || "";
    const type = (p as any).type || (p as any).productType || "";
    const description = (p as any).description || "";
    return (
      clientName.toLowerCase().includes(q) ||
      carrier.toLowerCase().includes(q) ||
      type.toLowerCase().includes(q) ||
      description.toLowerCase().includes(q)
    );
  });

  const startEdit = (policy: any) => {
    setEditingId(policy.id);
    setNoteValue(policy.description || "");
  };

  const saveNote = (policyId: number) => {
    updateMutation.mutate({ id: policyId, description: noteValue });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#c9a84c]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="font-['Playfair_Display'] text-2xl text-white">
            Policy Notes Editor
          </h2>
          <p className="text-white/40 font-['Lato'] text-sm mt-0.5">
            View and edit client-visible notes for all policies. Notes appear in
            the client portal.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by client, carrier, type, or note..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#c9a84c]/50"
          />
        </div>
        <span className="text-gray-400 text-sm">
          {filtered.length} policies
        </span>
      </div>

      {/* Notes list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="mx-auto mb-4 text-gray-600" size={48} />
          <p className="text-gray-400 text-lg">No policies found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(policy => (
            <div
              key={policy.id}
              className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Policy info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-['Playfair_Display'] text-white font-semibold">
                      {getClientName((policy as any).clientId)}
                    </span>
                    <span className="text-[#c9a84c] text-sm font-['Lato']">
                      {policy.carrier}
                    </span>
                    <span className="text-gray-500 text-xs border border-white/10 rounded px-1.5 py-0.5 font-mono">
                      {(policy as any).type || (policy as any).productType}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${
                        (policy as any).status === "active"
                          ? "bg-green-500/15 text-green-400 border-green-500/30"
                          : (policy as any).status === "pending"
                            ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
                            : "bg-gray-500/15 text-gray-400 border-gray-500/30"
                      }`}
                    >
                      {(policy as any).status || "active"}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs font-mono">
                    #{(policy as any).policyNumber || "N/A"}
                  </p>

                  {/* Note field */}
                  {editingId === policy.id ? (
                    <div className="mt-3 space-y-2">
                      <textarea
                        value={noteValue}
                        onChange={e => setNoteValue(e.target.value)}
                        rows={3}
                        placeholder="Enter a note visible to the client in their portal..."
                        className="w-full px-3 py-2 bg-white/8 border border-[#c9a84c]/40 rounded-lg text-white text-sm font-['Lato'] placeholder:text-gray-600 focus:outline-none focus:border-[#c9a84c] resize-none"
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => saveNote(policy.id)}
                          disabled={updateMutation.isPending}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-[#c9a84c] text-[#0a1628] text-xs font-bold rounded-lg hover:bg-[#d4b65c] transition disabled:opacity-50"
                        >
                          {updateMutation.isPending ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <CheckCircle size={12} />
                          )}
                          Save Note
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-1.5 bg-white/5 text-gray-400 text-xs font-semibold rounded-lg hover:bg-white/10 transition border border-white/10"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2">
                      {(policy as any).description ? (
                        <p className="text-gray-300 text-sm font-['Lato'] leading-relaxed bg-white/3 border border-white/8 rounded-lg px-3 py-2">
                          {(policy as any).description}
                        </p>
                      ) : (
                        <p className="text-gray-600 text-sm italic">
                          No note — click Edit to add one
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Edit button */}
                {editingId !== policy.id && (
                  <button
                    onClick={() => startEdit(policy)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-gray-400 text-xs font-semibold rounded-lg hover:bg-white/10 hover:text-[#c9a84c] hover:border-[#c9a84c]/30 transition"
                  >
                    <Edit size={12} />
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Carrier Phones Tab ───────────────────────────────────────────────────── */

function CarrierPhonesTab() {
  const utils = trpc.useUtils();

  // Load saved carrier phones from app settings
  const { data: savedData, isLoading } = trpc.admin.getSetting.useQuery({
    key: "carrier_phones",
  });

  const [carriers, setCarriers] = useState<Record<string, CarrierInfo>>({});
  const [newCarrier, setNewCarrier] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPortalUrl, setNewPortalUrl] = useState("");
  const [saving, setSaving] = useState(false);

  // Initialize from saved data or defaults — normalize old string format
  useEffect(() => {
    if (savedData?.value) {
      try {
        const parsed = JSON.parse(savedData.value);
        const normalized: Record<string, CarrierInfo> = {};
        for (const [k, v] of Object.entries(parsed)) {
          if (typeof v === "string") {
            normalized[k] = {
              phone: v as string,
              portalUrl: DEFAULT_CARRIER_PHONES[k]?.portalUrl || "",
            };
          } else {
            normalized[k] = v as CarrierInfo;
          }
        }
        setCarriers(normalized);
      } catch {
        setCarriers({ ...DEFAULT_CARRIER_PHONES });
      }
    } else if (!isLoading) {
      setCarriers({ ...DEFAULT_CARRIER_PHONES });
    }
  }, [savedData, isLoading]);

  const saveMutation = trpc.admin.setSetting.useMutation({
    onSuccess: () => {
      utils.admin.getSetting.invalidate({ key: "carrier_phones" });
      toast.success("Carrier list saved");
      setSaving(false);
    },
    onError: err => {
      toast.error(err.message || "Failed to save");
      setSaving(false);
    },
  });

  const handleSave = () => {
    setSaving(true);
    saveMutation.mutate({
      key: "carrier_phones",
      value: JSON.stringify(carriers),
    });
  };

  const handleUpdate = (carrier: string, info: CarrierInfo) => {
    setCarriers(prev => ({ ...prev, [carrier]: info }));
  };

  const handleDelete = (carrier: string) => {
    setCarriers(prev => {
      const next = { ...prev };
      delete next[carrier];
      return next;
    });
  };

  const handleAdd = () => {
    if (!newCarrier.trim() || !newPhone.trim()) {
      toast.error("Please enter both carrier name and phone number");
      return;
    }
    setCarriers(prev => ({
      ...prev,
      [newCarrier.trim()]: {
        phone: newPhone.trim(),
        portalUrl: newPortalUrl.trim(),
      },
    }));
    setNewCarrier("");
    setNewPhone("");
    setNewPortalUrl("");
  };

  const handleReset = () => {
    setCarriers({ ...DEFAULT_CARRIER_PHONES });
    toast.info("Reset to defaults — click Save to apply");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#c9a84c]" size={32} />
      </div>
    );
  }

  const sortedEntries = Object.entries(carriers).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Playfair_Display'] text-2xl text-white">
            Carrier Contact Information
          </h2>
          <p className="text-white/40 font-['Lato'] text-sm mt-0.5">
            Phone numbers and self-service portal links appear on client portal
            pages and in onboarding PDFs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-white/5 border border-white/10 text-gray-400 text-sm font-semibold rounded-lg hover:bg-white/10 hover:text-white transition"
          >
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-[#c9a84c] text-[#0a1628] text-sm font-bold rounded-lg hover:bg-[#d4b65c] transition disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <CheckCircle size={14} />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {/* Add new carrier */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <h3 className="text-[#c9a84c] font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
          <Plus size={14} />
          Add Carrier
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Carrier name (e.g. North American)"
            value={newCarrier}
            onChange={e => setNewCarrier(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#c9a84c]/50 text-sm"
          />
          <input
            type="text"
            placeholder="Phone (e.g. 1-800-555-1234)"
            value={newPhone}
            onChange={e => setNewPhone(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#c9a84c]/50 text-sm"
          />
          <input
            type="text"
            placeholder="Portal URL (e.g. https://portal.carrier.com)"
            value={newPortalUrl}
            onChange={e => setNewPortalUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#c9a84c]/50 text-sm"
          />
          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white/8 border border-white/15 text-white text-sm font-semibold rounded-lg hover:bg-white/15 hover:border-[#c9a84c]/40 transition"
          >
            <Plus size={14} />
            Add Carrier
          </button>
        </div>
      </div>

      {/* Carrier list */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
          <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">
            {sortedEntries.length} Carriers
          </span>
          <span className="text-gray-600 text-xs">
            Changes are saved when you click "Save Changes"
          </span>
        </div>
        {sortedEntries.length === 0 ? (
          <div className="text-center py-12">
            <Phone className="mx-auto mb-3 text-gray-600" size={32} />
            <p className="text-gray-500">
              No carriers configured. Add one above.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {sortedEntries.map(([carrier, info]) => (
              <CarrierPhoneRow
                key={carrier}
                carrier={carrier}
                info={info}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info note */}
      <div className="bg-[#c9a84c]/5 border border-[#c9a84c]/15 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle size={16} className="text-[#c9a84c] shrink-0 mt-0.5" />
        <p className="text-white/60 text-sm font-['Lato'] leading-relaxed">
          Phone numbers and portal links appear on{" "}
          <strong className="text-white/80">client portal</strong> policy detail
          pages and in{" "}
          <strong className="text-white/80">onboarding PDFs</strong>. If a
          carrier is not listed, the portal falls back to the Ortiz office
          number. Click <strong className="text-white/80">Save Changes</strong>{" "}
          after making edits.
        </p>
      </div>
    </div>
  );
}

/* ─── Carrier Phone Row (inline edit) ─────────────────────────────────────── */

function CarrierPhoneRow({
  carrier,
  info,
  onUpdate,
  onDelete,
}: {
  carrier: string;
  info: CarrierInfo;
  onUpdate: (carrier: string, info: CarrierInfo) => void;
  onDelete: (carrier: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState(info.phone);
  const [portalUrl, setPortalUrl] = useState(info.portalUrl || "");

  const save = () => {
    onUpdate(carrier, { phone, portalUrl });
    setEditing(false);
  };

  const cancel = () => {
    setPhone(info.phone);
    setPortalUrl(info.portalUrl || "");
    setEditing(false);
  };

  return (
    <div className="px-5 py-4 hover:bg-white/3 transition-colors">
      {editing ? (
        <div className="space-y-2">
          <p className="text-white font-semibold text-sm font-['Lato'] mb-2">
            {carrier}
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Phone number"
              onKeyDown={e => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") cancel();
              }}
              className="flex-1 px-3 py-1.5 bg-white/8 border border-[#c9a84c]/40 rounded-lg text-white text-sm focus:outline-none focus:border-[#c9a84c] placeholder:text-gray-600"
              autoFocus
            />
            <input
              type="text"
              value={portalUrl}
              onChange={e => setPortalUrl(e.target.value)}
              placeholder="Portal URL (optional)"
              onKeyDown={e => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") cancel();
              }}
              className="flex-1 px-3 py-1.5 bg-white/8 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-[#c9a84c] placeholder:text-gray-600"
            />
            <div className="flex items-center gap-1">
              <button
                onClick={save}
                className="text-green-400 hover:text-green-300 transition p-1"
                title="Save"
              >
                <CheckCircle size={16} />
              </button>
              <button
                onClick={cancel}
                className="text-gray-500 hover:text-white transition p-1"
                title="Cancel"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm font-['Lato']">
              {carrier}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 mt-0.5">
              <span className="text-[#c9a84c] font-mono text-xs">
                {info.phone}
              </span>
              {info.portalUrl ? (
                <a
                  href={info.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400/70 hover:text-blue-400 text-xs truncate max-w-xs transition"
                >
                  {info.portalUrl}
                </a>
              ) : (
                <span className="text-gray-600 text-xs italic">
                  No portal URL
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="text-gray-500 hover:text-[#c9a84c] transition p-1"
              title="Edit"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={() => onDelete(carrier)}
              className="text-gray-600 hover:text-red-400 transition p-1"
              title="Remove"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


/* ─── Agent Onboarding Tab ─────────────────────────────────────────────────── */

function AdminAgentOnboardingTab() {
  const { data: agents, isLoading } = trpc.admin.getAllAgents.useQuery();
  const { data: onboardingProgress } = trpc.admin.getAgentOnboardingProgress.useQuery();
  const [expandedAgentId, setExpandedAgentId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#c9a84c]" size={32} />
      </div>
    );
  }

  const getProgressPercentage = (agentId: number) => {
    const progress = onboardingProgress?.find(p => p.agentId === agentId);
    if (!progress) return 0;
    const completed = [
      progress.beforeYouStartCompleted,
      progress.step1HcmsInviteSent,
      progress.step2EmailSequenceCompleted,
      progress.step2SureLcCompleted,
      progress.step3NlcContractsSubmitted,
      progress.step4AdditionalContractsSent,
    ].filter(v => v === 1).length;
    return Math.round((completed / 6) * 100);
  };

  const getStatus = (agentId: number) => {
    const progress = onboardingProgress?.find(p => p.agentId === agentId);
    if (!progress) return "Not Started";
    if (progress.onboardingCompleted === 1) return "Completed";
    const percentage = getProgressPercentage(agentId);
    if (percentage === 0) return "Not Started";
    if (percentage === 100) return "Completed";
    return "In Progress";
  };

  const stats = {
    total: agents?.length || 0,
    completed: onboardingProgress?.filter(p => p.onboardingCompleted === 1).length || 0,
    inProgress: onboardingProgress?.filter(p => p.onboardingCompleted === 0 && getProgressPercentage(p.agentId) > 0).length || 0,
    notStarted: onboardingProgress?.filter(p => getProgressPercentage(p.agentId) === 0).length || 0,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-700/50 pb-6">
        <h2 className="text-4xl font-bold text-white mb-2">Agent Onboarding</h2>
        <p className="text-slate-400 text-sm">Monitor agent progress through the FFL onboarding process</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm font-medium">Total Agents</p>
            <div className="text-2xl">👥</div>
          </div>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-950/30 border border-emerald-700/50 rounded-xl p-5 hover:border-emerald-600/50 transition">
          <div className="flex items-center justify-between mb-2">
            <p className="text-emerald-400 text-sm font-medium">Completed</p>
            <div className="text-2xl">✅</div>
          </div>
          <p className="text-3xl font-bold text-emerald-400">{stats.completed}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-950/30 border border-blue-700/50 rounded-xl p-5 hover:border-blue-600/50 transition">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-400 text-sm font-medium">In Progress</p>
            <div className="text-2xl">⏳</div>
          </div>
          <p className="text-3xl font-bold text-blue-400">{stats.inProgress}</p>
        </div>
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm font-medium">Not Started</p>
            <div className="text-2xl">⏸️</div>
          </div>
          <p className="text-3xl font-bold text-slate-300">{stats.notStarted}</p>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="space-y-4">
        {agents?.map((agent) => {
          const percentage = getProgressPercentage(agent.id);
          const status = getStatus(agent.id);
          const progress = onboardingProgress?.find(p => p.agentId === agent.id);
          const isExpanded = expandedAgentId === agent.id;

          return (
            <div key={agent.id} className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-all">
              <button
                onClick={() => setExpandedAgentId(isExpanded ? null : agent.id)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-5 flex-1 text-left">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#c9a84c] to-[#a88c3a] flex items-center justify-center text-white font-bold text-lg">
                    {agent.firstName.charAt(0)}{agent.lastName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-lg">{agent.firstName} {agent.lastName}</p>
                    <p className="text-slate-400 text-sm">{agent.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-bold text-[#c9a84c]">{percentage}%</span>
                    <div className="w-32 h-2 bg-slate-700 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#c9a84c] to-[#e8c547] rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                    status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' :
                    status === 'In Progress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                    'bg-slate-700/50 text-slate-300 border-slate-600'
                  }`}>
                    {status}
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-slate-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                  />
                </div>
              </button>

              {isExpanded && progress && (
                <div className="border-t border-slate-700 bg-slate-900/30 px-6 py-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { key: 'beforeYouStartCompleted', label: 'Before You Start', icon: '📋' },
                      { key: 'step1HcmsInviteSent', label: 'Step 1: HCMS Invite', icon: '📧' },
                      { key: 'step2EmailSequenceCompleted', label: 'Step 2: Email Sequence', icon: '✉️' },
                      { key: 'step2SureLcCompleted', label: 'Step 2: SureLC', icon: '✅' },
                      { key: 'step3NlcContractsSubmitted', label: 'Step 3: NLC Contracts', icon: '📄' },
                      { key: 'step4AdditionalContractsSent', label: 'Step 4: Additional', icon: '📦' },
                    ].map((step) => {
                      const isCompleted = progress[step.key as keyof typeof progress] === 1;
                      return (
                        <div key={step.key} className={`p-4 rounded-lg border-2 transition-all ${
                          isCompleted
                            ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                            : 'bg-slate-800/30 border-slate-700 hover:border-slate-600'
                        }`}>
                          <div className="flex items-start gap-3">
                            <div className={`text-2xl flex-shrink-0 ${
                              isCompleted ? 'opacity-100' : 'opacity-60'
                            }`}>
                              {isCompleted ? '✓' : step.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold ${
                                isCompleted ? 'text-emerald-400' : 'text-slate-300'
                              }`}>
                                {step.label}
                              </p>
                              <p className={`text-xs mt-1 ${
                                isCompleted ? 'text-emerald-400/70' : 'text-slate-500'
                              }`}>
                                {isCompleted ? 'Completed' : 'Pending'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
