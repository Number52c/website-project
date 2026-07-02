/**
 * Admin Dashboard — Excel Import, Client/PIN Management, Analytics & Policies
 * Only accessible by the site owner (admin role).
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
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
import { AgentPerformanceTab } from "@/pages/AgentPerformanceTab";
import { AnnualReviewsTab } from "@/pages/AnnualReviewsTab";
import { AdvancePaidCard } from "@/components/AdvancePaidCard";
import { AgentKPICard } from "@/components/AgentKPICard";
import { DragDropFileUpload } from "@/components/DragDropFileUpload";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Upload, Users, Shield, FileSpreadsheet, Eye, EyeOff, Trash2, CreditCard as Edit, Plus, X, Search, ChevronDown, ChevronUp, Loader as Loader2, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Copy, Phone, ChartBar as BarChart3, DollarSign, TrendingUp, ChartPie as PieChart, Download, UserPlus, MessageSquare, FileText, Send, ClipboardCopy, RefreshCw, LogIn, Calendar, LogOut } from "lucide-react";
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
  | "annuities"
  | "gwl"
  | "onboarding"
  | "import"
  | "notes"
  | "carriers"
  | "agents"
  | "agentPerformance"
  | "annualReviews";

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

/* ─── Carrier Commission Rates @ 110% FFL Level ────────────────────────────── */
// All rates extracted from Family First Life Comp Guide at the 110% FFL contract level.
// Format: { [carrier]: { [productType]: commissionPercent } }
// productType keys match PRODUCT_TYPES array values.

const CARRIER_COMP_RATES: Record<string, Record<string, number>> = {
  // ── Transamerica ──
  // Source: Page 1 (FEX=108%, Express WL=110%, Term Provider WL=100%, CI=60%, Accidental=95%)
  // Source: Page 10 (FX=110%) | Page 11 (FE=100%)
  Transamerica: {
    "Final Expense": 100, // FE product @ 110% FFL
    "Whole Life": 110, // Express WL
    "Term Life": 100, // Term Provider WL
    Accidental: 95, // Accidental product
    "Critical Illness": 60, // CI product
  },
  // ── Americo ──
  // Source: Page 11 (HMS/Eagle/LF=105%, Eagle Finale=105%, Term Life Final=110%, Express Final=110%)
  Americo: {
    "Final Expense": 105, // HMS/Eagle Finale FEX
    "Whole Life": 105, // Eagle Finale WL
    "Term Life": 110, // Term Life Final / Express Final
  },
  // ── Mutual of Omaha ──
  // Source: Page 11 (UL=110%, Underwriting=97%, IULE=120%, Term Life Answers=110%)
  "Mutual of Omaha": {
    "Whole Life": 110, // UL / standard WL
    "Universal Life": 110, // UL
    "Term Life": 110, // Term Life Answers Death
    IUL: 120, // IULE
    "Graded Whole Life": 97, // Underwriting (simplified issue)
  },
  // ── AIG / American General ──
  // Source: Page 11 (GIWL=72.5%, SIWL=112%)
  "American General (AIG)": {
    "Graded Whole Life": 72.5, // GIWL (Guaranteed Issue WL)
    "Final Expense": 72.5, // GIWL-type FEX
    "Whole Life": 112, // SIWL (Simplified Issue WL)
    "Term Life": 112, // SIWL-type term
  },
  AIG: {
    "Graded Whole Life": 72.5,
    "Final Expense": 72.5,
    "Whole Life": 112,
    "Term Life": 112,
  },
  // ── Corebridge Financial (formerly AIG) ──
  "Corebridge Financial": {
    "Graded Whole Life": 72.5,
    "Final Expense": 72.5,
    "Whole Life": 112,
    "Term Life": 112,
  },
  // ── Aetna ──
  // Source: Page 10 (Whole Life=120%, FX=105%)
  Aetna: {
    "Whole Life": 120, // Aetna WL @ 110% FFL
    "Final Expense": 105, // FX product
    "Term Life": 105, // FX-type term
  },
  // ── National Life Group ──
  // Source: Page 10 (UL=105%, WL=120%)
  "National Life Group": {
    "Whole Life": 120, // WL @ 110% FFL
    "Universal Life": 105, // UL
    "Term Life": 105,
  },
  // ── Foresters Financial ──
  // Source: Page 5 (Strong Foundation=110%, second product=115%)
  "Foresters Financial": {
    "Whole Life": 110, // Strong Foundation WL
    "Term Life": 115, // second Foresters product
    "Final Expense": 110,
  },
  // ── Liberty Bankers Life ──
  // Source: Page 7 (FEX=110%)
  "Liberty Bankers Life": {
    "Final Expense": 110,
    "Whole Life": 110,
  },
  // ── Legal & General America ──
  // Source: Page 2 (Term=110%), Page 12 (LGEA=87.5%)
  "Legal & General America": {
    "Term Life": 110, // Standard term
    "Whole Life": 87.5, // LGEA WL product
    "Final Expense": 87.5,
  },
  "Legal & General": {
    "Term Life": 110,
    "Whole Life": 87.5,
    "Final Expense": 87.5,
  },
  // ── Lumico Life ──
  // Source: Page 14 (Lumico=115%)
  "Lumico Life": {
    "Final Expense": 115,
    "Whole Life": 115,
    "Term Life": 115,
  },
  // ── Elco Mutual ──
  // Source: Pages 15-16 (Silver Eagle FEX Level=105%, Modified=85%, GI=45%, Golden Eagle WL=90%)
  "Elco Mutual": {
    "Final Expense": 105, // Silver Eagle FEX Level
    "Whole Life": 90, // Golden Eagle Life Pay WL (0-75)
    "Graded Whole Life": 85, // Silver Eagle FEX Modified
    "Guaranteed Issue": 45, // Silver Eagle GI
  },
  // ── Sentinel Security Life ──
  // Source: Page 8 (FEX=105%)
  "Sentinel Security Life": {
    "Final Expense": 105,
    "Whole Life": 105,
  },
  // ── CICA Life ──
  // Source: Pages 2 & 9 (FEX=105% flat)
  CICA: { "Final Expense": 105, "Whole Life": 105, "Term Life": 105 },
  "CICA Life": { "Final Expense": 105, "Whole Life": 105, "Term Life": 105 },
  // ── Banner Life ──
  // Source: Pages 8 & 14 (Term=110%, FEX=105%)
  "Banner Life": {
    "Term Life": 110,
    "Final Expense": 105,
    "Whole Life": 110,
  },
  // ── Instabrain ──
  // Source: Page 7 (Term=110%, FEX=125%, Accidental=75%)
  Instabrain: {
    "Final Expense": 125,
    "Term Life": 110,
    Accidental: 75,
  },
  // ── American Amicable ──
  // Source: Page 4 (Senior Choice FEX=110%, EZ Term=80%, Secure Home=115%, OBA=95%, Tennessee Simplicity=115%, Family Protector=115%, XUL=90%, SI=105%, Affac FEX=93%)
  "American Amicable": {
    "Final Expense": 110, // Senior Choice FEX
    "Whole Life": 115, // Secure Home / Tennessee Simplicity / Family Protector
    "Term Life": 80, // EZ Term Life
    "Universal Life": 90, // XUL
    "Simplified Issue": 105, // SI product
    Accidental: 93, // Affac Final EX / OBA
    Other: 115,
  },
  // ── Catholic Financial Life ──
  // Source: Page 6 (flat 45%)
  "Catholic Financial Life": {
    "Final Expense": 45,
    "Whole Life": 45,
    "Term Life": 45,
    Other: 45,
  },
  "Catholic Financial": {
    "Final Expense": 45,
    "Whole Life": 45,
    "Term Life": 45,
    Other: 45,
  },
  // ── Gerber Life ──
  // Source: Page 6 (Accidental=50%, FEX=68%, Graded/Lean=50%, GI=50%, Term=100%)
  "Gerber Life": {
    "Final Expense": 68,
    "Graded Whole Life": 50,
    Accidental: 50,
    "Term Life": 100,
    "Guaranteed Issue": 50,
  },
  // ── Gleaner Life ──
  // Source: Page 6 (Term=100%), Page 14 (70%)
  "Gleaner Life": {
    "Term Life": 100,
    "Whole Life": 70,
    "Final Expense": 70,
  },
  // ── SBLI ──
  // Source: Page 2 (Term=110%), Page 14 (Term=110%/115%, GI Term=47%/90%)
  SBLI: {
    "Term Life": 110,
    "Final Expense": 90, // GI Term / simplified issue
    "Guaranteed Issue": 47, // GI Term base
  },
  // ── Royal Neighbors of America ──
  // Source: Page 5 (Final EX=100%, SI Term=110%, Term=100%, Secure Life WL=112%, SI WL=100%)
  "Royal Neighbors of America": {
    "Final Expense": 100,
    "Term Life": 110, // SI Term
    "Whole Life": 112, // Secure Life WL
    "Simplified Issue": 100, // SI WL
  },
  // ── Accordia Life ──
  // Source: Page 5 (IUL=105%, Term=105%)
  "Accordia Life": {
    "Term Life": 105,
    IUL: 105,
    Other: 105,
  },
  // ── Prosperity Life ──
  // Source: Page 5 (Whole Prime FEX=105%, Term=110%)
  "Prosperity Life": {
    "Final Expense": 105, // Whole Prime FEX
    "Term Life": 110,
  },
  // ── Columbia Life (Columbian Mutual) ──
  // Source: Pages 8 & 14 (Traditional WL=110%, IUL=120%, FEX Level=110%, FEX Modified=95%, Term=130%)
  "Columbia Life": {
    "Whole Life": 110, // Traditional WL
    IUL: 120,
    "Final Expense": 110, // FEX Level
    "Graded Whole Life": 95, // FEX Modified
    "Term Life": 130,
  },
  "Columbian Mutual": {
    "Whole Life": 110,
    IUL: 120,
    "Final Expense": 110,
    "Graded Whole Life": 95,
    "Term Life": 130,
  },
  // ── NewBridge Life ──
  // Source: Page 8 (FEX Level=110%, FEX Modified=100%, Term=130%)
  "NewBridge Life": {
    "Final Expense": 110, // FEX Level
    "Graded Whole Life": 100, // FEX Modified
    "Term Life": 130,
  },
  NewBridge: {
    "Final Expense": 110,
    "Graded Whole Life": 100,
    "Term Life": 130,
  },
  // ── Balance Life (I-Provide) ──
  // Source: Page 7 (FEX=110%, I-Provide=115%, A-Priority=105%), Page 14 (A-Priority=105%, I-Provide=100%)
  "Balance Life (I-Provide)": {
    "Final Expense": 110, // Balance Life FEX
    "Whole Life": 115, // I-Provide
    Other: 105, // A-Priority
  },
  "Balance Life": {
    "Final Expense": 110,
    "Whole Life": 115,
    Other: 105,
  },
  // ── Combined Insurance ──
  // Source: Pages 2 & 9 (Combined Preferred=110%)
  "Combined Insurance": {
    "Whole Life": 110,
    Other: 110,
  },
  // ── Equitable Life ──
  // Source: Page 13 (Equitable=105%)
  "Equitable Life": {
    "Whole Life": 105,
    "Term Life": 105,
    Other: 105,
  },
  // ── Ethos Life ──
  // Source: Page 12 (Senior Life=77.5%, Trustage=52.5%, Trustage GIWL=22.5%)
  "Ethos Life": {
    "Term Life": 77.5, // Senior Life term
    "Whole Life": 52.5, // Trustage WL
    "Graded Whole Life": 22.5, // Trustage GIWL
  },
  // ── InsureMax ──
  // Source: Page 13 (110%)
  InsureMax: {
    "Final Expense": 110,
    "Whole Life": 110,
    "Term Life": 110,
  },
  // ── Stonebridge Life ──
  // Source: Page 13 (65%)
  "Stonebridge Life": {
    "Final Expense": 65,
    "Whole Life": 65,
    Other: 65,
  },
  // ── Term Bankers ──
  // Source: Page 13 (140%)
  "Term Bankers": {
    "Term Life": 140,
  },
  // ── Viva Life ──
  // Source: Page 9 (105%)
  "Viva Life": {
    "Final Expense": 105,
    "Whole Life": 105,
  },
  // ── Ameritas ──
  // Source: Page 12 (87.5%)
  Ameritas: {
    "Whole Life": 87.5,
    "Term Life": 87.5,
    "Final Expense": 87.5,
  },
  // ── LCBA Life ──
  // Source: Pages 2 & 9 (Lifetime Benefit Term=55%)
  "LCBA Life": {
    "Term Life": 55,
    Other: 55,
  },
  LCBA: {
    "Term Life": 55,
    Other: 55,
  },
  // ── Annuity carriers (% of premium / single premium) ──
  // Standard FIA = 6-7% of premium, MYGA = 3-5% of premium
  Athene: {
    FIA: 6,
    MYGA: 4,
    "Fixed Index Annuity": 6,
    "Multi-Year Guaranteed Annuity": 4,
  },
  "American Equity": {
    FIA: 6,
    MYGA: 4,
    "Fixed Index Annuity": 6,
    "Multi-Year Guaranteed Annuity": 4,
  },
  "Allianz Life": {
    FIA: 6,
    MYGA: 4,
    "Fixed Index Annuity": 6,
    "Multi-Year Guaranteed Annuity": 4,
  },
  "North American Company": {
    FIA: 6,
    MYGA: 4,
    "Fixed Index Annuity": 6,
    "Multi-Year Guaranteed Annuity": 4,
  },
  "F&G (Fidelity & Guaranty)": {
    FIA: 6,
    MYGA: 4,
    "Fixed Index Annuity": 6,
    "Multi-Year Guaranteed Annuity": 4,
  },
  "Global Atlantic": {
    FIA: 6,
    MYGA: 4,
    "Fixed Index Annuity": 6,
    "Multi-Year Guaranteed Annuity": 4,
  },
  "Midland National": {
    FIA: 6,
    MYGA: 4,
    "Fixed Index Annuity": 6,
    "Multi-Year Guaranteed Annuity": 4,
  },
  "Nassau Life": {
    FIA: 5,
    MYGA: 3,
    "Fixed Index Annuity": 5,
    "Multi-Year Guaranteed Annuity": 3,
  },
};

/** Auto-lookup commission % for a carrier + product type at 110% FFL level */
function lookupCompRate(carrier: string, productType: string): number | null {
  const carrierRates = CARRIER_COMP_RATES[carrier];
  if (!carrierRates) return null;
  // Exact match first
  if (carrierRates[productType] !== undefined) return carrierRates[productType];
  // Fuzzy match on product type
  for (const [key, rate] of Object.entries(carrierRates)) {
    if (
      productType.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(productType.toLowerCase())
    ) {
      return rate;
    }
  }
  return null;
}

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
  const filtered = CARRIERS.filter(c =>
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

export default function AdminDashboard() {
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
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to save client";
      toast.error(msg);
    },
  });

  // Auth gate
  if (authLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #0a1628 0%, #132744 50%, #0a1628 100%)",
        }}
      >
        <Loader2 className="animate-spin text-[#c9a84c]" size={48} />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{
          background:
            "linear-gradient(135deg, #0a1628 0%, #132744 50%, #0a1628 100%)",
        }}
      >
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <Shield className="mx-auto mb-4 text-[#c9a84c]" size={64} />
            <h1 className="font-['Playfair_Display'] text-3xl text-white mb-4">
              Admin Access Required
            </h1>
            <p className="text-gray-300 mb-6">
              You must be logged in as an administrator to access this page.
            </p>
            <a
              href={getLoginUrl("/admin")}
              className="inline-block px-8 py-3 bg-gradient-to-r from-[#c9a84c] to-[#e8c84a] text-[#0a1628] font-bold rounded-lg hover:shadow-lg transition"
            >
              Sign In
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{
          background:
            "linear-gradient(135deg, #0a1628 0%, #132744 50%, #0a1628 100%)",
        }}
      >
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <AlertCircle className="mx-auto mb-4 text-red-400" size={64} />
            <h1 className="font-['Playfair_Display'] text-3xl text-white mb-4">
              Access Denied
            </h1>
            <p className="text-gray-300">
              You do not have admin privileges to access this page.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, #060e1f 0%, #0a1628 40%, #0d1b3e 100%)",
      }}
    >
      {/* Header */}
      <section className="relative pt-8 pb-8 px-4 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[400px] h-[200px] bg-[#C9A84C]/4 rounded-full blur-[80px]" />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-px bg-[#C9A84C]" />
              <span className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase font-['Lato'] font-semibold">
                Ortiz Insurance
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/15 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition text-sm font-semibold"
              title="Sign out"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
          <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl text-white mb-2">
            Admin <span className="text-[#C9A84C]">Dashboard</span>
          </h1>
          <p className="text-white/45 font-['Lato'] text-base">
            Manage clients, policies, analytics, and import data.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="px-4 pb-4">
        <div className="max-w-7xl mx-auto">
          {/* Mobile: dropdown */}
          {(() => {
            const tabs = [
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
              { key: "gwl" as const, label: "Graded Whole Life", icon: Shield },
              {
                key: "onboarding" as const,
                label: "Onboard Client",
                icon: UserPlus,
              },
              { key: "import" as const, label: "Import Excel", icon: Upload },
              {
                key: "notes" as const,
                label: "Policy Notes",
                icon: MessageSquare,
              },
              {
                key: "carriers" as const,
                label: "Carrier Phones",
                icon: Phone,
              },
              {
                key: "agents" as const,
                label: "Agents",
                icon: Users,
              },
              {
                key: "agentPerformance" as const,
                label: "Agent Performance",
                icon: TrendingUp,
              },
              {
                key: "annualReviews" as const,
                label: "Annual Review Reminders",
                icon: Calendar,
              },
            ];
            const activeTabInfo = tabs.find(t => t.key === activeTab);
            const ActiveIcon = activeTabInfo?.icon ?? BarChart3;
            return (
              <>
                {/* Mobile dropdown */}
                <div className="md:hidden relative">
                  <button
                    onClick={() => setMobileTabOpen(prev => !prev)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-sm font-semibold text-[#c9a84c]"
                  >
                    <span className="flex items-center gap-2">
                      <ActiveIcon size={16} />
                      {activeTabInfo?.label}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${mobileTabOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {mobileTabOpen && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#0f1e3a] border border-white/15 rounded-xl shadow-2xl overflow-hidden">
                      {tabs.map(({ key, label, icon: Icon }) => (
                        <button
                          key={key}
                          onClick={() => {
                            setActiveTab(key);
                            setMobileTabOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition ${
                            activeTab === key
                              ? "bg-[#c9a84c]/15 text-[#c9a84c]"
                              : "text-gray-400 hover:bg-white/5 hover:text-white"
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
                <div className="hidden md:block">
                  <div className="flex gap-8 border-b border-white/10 overflow-x-auto">
                    {tabs.map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex items-center gap-2 px-1 py-4 text-sm font-semibold transition-colors whitespace-nowrap relative group ${
                          activeTab === key
                            ? "text-[#c9a84c]"
                            : "text-gray-400 hover:text-gray-200"
                        }`}
                      >
                        <Icon size={16} />
                        {label}
                        {/* Animated underline */}
                        <div
                          className={`absolute bottom-0 left-0 right-0 h-0.5 bg-[#c9a84c] transition-all duration-300 ${
                            activeTab === key ? "w-full" : "w-0 group-hover:w-full"
                          }`}
                        />
                      </button>
                    ))}
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
          {activeTab === "analytics" && <AnalyticsTab />}
          {activeTab === "sales" && <SalesTrackerTab />}
          {activeTab === "import" && <ImportTab />}
          {activeTab === "clients" && (
            <ClientsTab
              showIntakeForm={showIntakeForm}
              setShowIntakeForm={setShowIntakeForm}
              createClientIntakeMutation={createClientIntakeMutation}
            />
          )}
          {activeTab === "policies" && <PoliciesTab />}
          {activeTab === "annuities" && <AnnuitiesTab />}
          {activeTab === "gwl" && <GradedWholeLifeTab />}
          {activeTab === "onboarding" && <OnboardingTab setShowIntakeForm={setShowIntakeForm} />}
          {activeTab === "notes" && <PolicyNotesTab />}
          {activeTab === "carriers" && <CarrierPhonesTab />}
          {activeTab === "agents" && <AdminAgents />}
          {activeTab === "agentPerformance" && <AgentPerformanceTab />}
          {activeTab === "annualReviews" && <AnnualReviewsTab />}
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
              const { healthConditions, beneficiary, ...rest } = data;
              await createClientIntakeMutation.mutateAsync({
                ...rest,
                healthConditionsJSON: JSON.stringify(healthConditions),
              });
            }}
            isLoading={createClientIntakeMutation.isPending}
          />
        </DialogContent>
      </Dialog>

    </div>
  );
}

/* ─── Analytics Tab ────────────────────────────────────────────────────────── */

function AnalyticsTab() {
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

  const stats = useMemo(() => {
    const policies = policiesList || [];
    const clients = clientsList || [];
    const annuities = annuitiesList || [];
    const agents = agentsList || [];

    // Policy AP (active only)
    const activePolicies = policies.filter(p => p.status === "active");
    const policyAP = activePolicies.reduce((sum, p) => {
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
    const activeAnnuities = annuities.filter(a => a.status === "active");
    const annuityAP = activeAnnuities.reduce(
      (sum, a) => sum + calcAnnuityAP(a),
      0
    );

    // FIA / MYGA breakdown
    const fiaAnnuities = annuities.filter(a => a.type === "FIA");
    const mygaAnnuities = annuities.filter(a => a.type === "MYGA");
    const activeFIA = fiaAnnuities.filter(a => a.status === "active");
    const activeMYGA = mygaAnnuities.filter(a => a.status === "active");
    const fiaAP = activeFIA.reduce((s, a) => s + calcAnnuityAP(a), 0);
    const mygaAP = activeMYGA.reduce((s, a) => s + calcAnnuityAP(a), 0);
    // AUM = total raw premium (not commission-adjusted) for all active annuities
    const fiaAUM = activeFIA.reduce(
      (s, a) => s + (parseFloat(a.premium || "0") || 0),
      0
    );
    const mygaAUM = activeMYGA.reduce(
      (s, a) => s + (parseFloat(a.premium || "0") || 0),
      0
    );
    const totalAUM = fiaAUM + mygaAUM;

    // GWL AP (from GWL policies table, active only)
    const gwlPolicies = gwlList || [];
    const activeGWL = gwlPolicies.filter(g => g.status === "active");
    const gwlFromGWLTable = activeGWL.reduce(
      (sum, g) => sum + parseFloat(g.yearlyAP || "0"),
      0
    );

    // Also include regular policies where type contains "graded" (case-insensitive)
    const gradedFromPolicies = activePolicies.filter(p =>
      p.type.toLowerCase().includes("graded")
    );
    const gwlFromPoliciesAP = gradedFromPolicies.reduce((sum, p) => {
      const ap = parseFloat(p.yearlyAP || "0");
      return sum + (isNaN(ap) ? 0 : ap);
    }, 0);
    const gwlAP = gwlFromGWLTable + gwlFromPoliciesAP;
    const gwlTotalCount = activeGWL.length + gradedFromPolicies.length;

    // Combined total AP
    const totalAP = policyAP + annuityAP + gwlAP;

    // Policy type breakdown
    const typeCounts: Record<string, number> = {};
    for (const p of policies) {
      typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;
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

    // Estimated commission on books (using CARRIER_COMP_RATES @ 110%)
    // For each active policy, look up the carrier+type rate and apply to AP
    let estimatedMonthlyCommission = 0;
    let estimatedAnnualCommission = 0;
    for (const p of activePolicies) {
      const ap = parseFloat(p.yearlyAP || "0");
      if (isNaN(ap) || ap <= 0) continue;
      const rate = lookupCompRate(p.carrier, p.type);
      if (rate !== null) {
        // For life products: commission is on AP (annual premium)
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
      policyAP,
      annuityAP,
      gwlAP,
      gwlTotalCount,
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
        loggedInClients: clients.filter(c => c.lastPortalLogin).length,
        neverLoggedIn: clients.filter(c => !c.lastPortalLogin).length,
      },
      totalAgents: agents.length
    };
  }, [policiesList, clientsList, annuitiesList, gwlList, agentsList]);

  if (policiesLoading || clientsLoading || annuitiesLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#c9a84c]" size={32} />
      </div>
    );
  }

  const typeOrder = [
    "Graded Whole Life",
    "Whole Life Final Expense",
    "Whole Life",
    "Term",
    "Accidental",
    "Annuity",
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
  const totalTypeAP = sortedTypeAP.reduce((s, [, v]) => s + v.ap, 0);

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
      {/* Annual Review KPI */}
      <div
        onClick={() => setShowAnnualReviewModal(true)}
        className="cursor-pointer transition-all duration-300 hover:scale-105"
      >
        <ClientsAnnualReviewKPI />
      </div>
      
      {/* Top-level KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KPICard
          icon={<DollarSign size={24} />}
          label="Total AP on Books"
          value={`$${stats.totalAP.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sublabel="Policies + Annuities + GWL (active)"
          accent
        />
        <div
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setPolicyListModal({ type: "policies", isOpen: true })}
        >
          <KPICard
            icon={<FileSpreadsheet size={24} />}
            label="Policy AP"
            value={`$${stats.policyAP.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            sublabel={`${stats.totalPolicies} policies (${stats.activePolicies} active)`}
          />
        </div>
        <div
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setPolicyListModal({ type: "annuities", isOpen: true })}
        >
          <KPICard
            icon={<TrendingUp size={24} />}
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
            icon={<Shield size={24} />}
            label="Graded Whole Life AP"
            value={`$${stats.gwlAP.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            sublabel={`${stats.gwlTotalCount} active GWL policies (all sources)`}
          />
        </div>
        <KPICard
          icon={<Users size={24} />}
          label="Total Clients"
          value={String(stats.totalClients)}
          sublabel={`${stats.activePolicies} life + ${stats.activeAnnuities} annuities + ${stats.gwlTotalCount} GWL`}
        />
        <KPICard
          icon={<LogIn size={24} />}
          label="Clients Logged In"
          value={String(stats.clientLoginStats?.loggedInClients || 0)}
          sublabel={`${stats.clientLoginStats?.neverLoggedIn || 0} never accessed portal`}
          accent
        />
        <button
          onClick={() => setShowAgentPerformanceModal(true)}
          className="group relative overflow-hidden rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-6 transition-all duration-300 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20"
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
        <button
          onClick={() => setShowAgentAnnualReviewModal(true)}
          className="group relative overflow-hidden rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-6 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/10 group-hover:to-cyan-500/5 transition-all duration-300" />
          <div className="relative flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Calendar size={24} className="text-cyan-400" />
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Agent Reviews Due</span>
            </div>
            <div className="text-3xl font-bold text-white">{agentAnnualReviewStats?.total || 0}</div>
            <div className="text-xs text-slate-400">{agentAnnualReviewStats?.clientsDueThisMonth || 0} this month</div>
          </div>
        </button>
      </div>

      {/* Commission & Backend Payments KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Est. Monthly Commission */}
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
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
            From active life policies @ 110% FFL
          </p>
        </div>
        {/* Est. Annual Commission */}
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
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
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
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
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0f1420] to-[#0a0e18] border border-amber-500/20 rounded-2xl p-6">
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
                  {stats.backendPaymentsPerPolicy.map((row, i) => (
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
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
          <p className="text-xs text-emerald-400 uppercase tracking-wider mb-1">
            FIA Count
          </p>
          <p className="text-2xl font-bold text-white">{stats.fiaCount}</p>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
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
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5">
          <p className="text-xs text-blue-400 uppercase tracking-wider mb-1">
            MYGA Count
          </p>
          <p className="text-2xl font-bold text-white">{stats.mygaCount}</p>
        </div>
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5">
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
                    <span className="text-gray-300 text-sm">{type}</span>
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
                    className={`${c.bg} border ${c.border} rounded-lg p-4 text-center`}
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
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0f1420] to-[#0a0e18] border border-[#c9a84c]/20 rounded-2xl p-8">
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
                <div key={type} className="group">
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
              const totalCarrierAP = sortedCarrierAP.reduce(
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
                            <p className="text-sm text-gray-400">{policy.policyNumber}</p>
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
                            <p className="text-sm text-gray-400">{policy.policyNumber}</p>
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

  // Form state
  const [clientName, setClientName] = useState("");
  const [productType, setProductType] = useState("");
  const [carrier, setCarrier] = useState("");
  const [premium, setPremium] = useState("");
  const [annualPremium, setAnnualPremium] = useState("");
  const [commissionPercent, setCommissionPercent] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [saleDate, setSaleDate] = useState("");
  const [notes, setNotes] = useState("");

  const utils = trpc.useUtils();

  const { data: salesData, isLoading } = trpc.admin.getSalesByMonth.useQuery({
    month: selectedMonth,
    year: selectedYear,
  });

  const { data: annuityData } = trpc.admin.getAnnuitiesByMonth.useQuery({
    month: selectedMonth,
    year: selectedYear,
  });

  const { data: expensesByMonth } = trpc.admin.listExpensesByMonth.useQuery({
    month: selectedMonth,
    year: selectedYear,
  });

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

  // Auto-fill commission % from CARRIER_COMP_RATES when carrier or product type changes
  function handleCarrierChange(newCarrier: string) {
    setCarrier(newCarrier);
    if (newCarrier && productType) {
      const rate = lookupCompRate(newCarrier, productType);
      if (rate !== null) {
        setCommissionPercent(String(rate));
        if (premium) {
          const ap = parseFloat(premium) * 12;
          setAnnualPremium(String(ap.toFixed(2)));
        }
      }
    }
  }

  function handleProductTypeChange(newType: string) {
    setProductType(newType);
    if (carrier && newType) {
      const rate = lookupCompRate(carrier, newType);
      if (rate !== null) {
        setCommissionPercent(String(rate));
        if (premium) {
          const ap = parseFloat(premium) * 12;
          setAnnualPremium(String(ap.toFixed(2)));
        }
      }
    }
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
        annualPremium: annualPremium || undefined,
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
        annualPremium: annualPremium || undefined,
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
    setAnnualPremium(entry.annualPremium || "");
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
    annualPremium: a.commissionPercent
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
    ...entries.map(e => ({ ...e, isAnnuity: false })),
    ...annuityEntries,
  ].sort((a, b) => (a.saleDate || 0) - (b.saleDate || 0));
  const totalPremium = allEntries.reduce(
    (s, e) => s + parseFloat(e.premium || "0"),
    0
  );
  const totalAP = allEntries.reduce(
    (s, e) => s + parseFloat(e.annualPremium || "0"),
    0
  );
  const totalCommission = allEntries.reduce(
    (s, e) => {
      const ap = parseFloat(e.annualPremium || "0");
      const commPercent = parseFloat(e.commissionPercent || "110") / 100;
      return s + (ap * commPercent);
    },
    0
  );

  // Calculate issued paid premium (only from entries marked as paid)
  const issuedPaidPremium = allEntries.reduce(
    (s, e) => s + (e.isPaid && !e.isCanceled ? parseFloat(e.premium || "0") : 0),
    0
  );

  // Calculate total expenses for the month
  const totalExpenses = (expensesByMonth || []).reduce(
    (s: number, e: any) => s + parseFloat(e.amount || "0"),
    0
  );

  // Calculate accurate revenue: issued paid premium - total expenses
  const accurateRevenue = issuedPaidPremium - totalExpenses;

  // Calculate month 10, 11, 12 expected revenue from paid policies
  const paidEntries = allEntries.filter((e: any) => e.isPaid && !e.isAnnuity);
  
  const month10_11_12Revenues = paidEntries.reduce(
    (acc: any, entry: any) => {
      const premium = parseFloat(entry.premium || "0");
      const commissionPercent = entry.commissionOverride 
        ? Number(entry.commissionOverride) 
        : Number(entry.commissionPercent || 110);
      const baseCommission = (premium * commissionPercent) / 100;
      const backendCommission = baseCommission * 0.75;
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
            {MONTH_NAMES[selectedMonth - 1]} {selectedYear} @ 110% FFL
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
                value={annualPremium}
                onChange={e => setAnnualPremium(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">
                Commission %
                {carrier &&
                  productType &&
                  lookupCompRate(carrier, productType) !== null && (
                    <span className="ml-2 text-[#c9a84c] text-xs font-normal">
                      (auto-filled @ 110%)
                    </span>
                  )}
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
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
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
                {allEntries.map(entry => {
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
                        entry.isPaid
                          ? "bg-green-500/15 border-b border-green-500/40"
                          : entry.isCanceled
                            ? "bg-red-600/35 border-b border-red-600/70"
                            : "bg-yellow-500/20 border-b border-yellow-500/40"
                      }`}
                    >
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
                          ? `$${parseFloat(entry.annualPremium).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-right whitespace-nowrap">
                        <CommissionDropdown
                          value={entry.commissionOverride ? Number(entry.commissionOverride) : Number(entry.commissionPercent)}
                          onChange={(percent) => {
                            updateMutation.mutate({
                              id: entry.id as number,
                              commissionOverride: percent,
                            });
                          }}
                          defaultValue={Number(entry.commissionPercent) || 110}
                        />
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
                entries={allEntries
                  .filter(e => !e.isAnnuity)
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
      )}
    </div>
  );
}

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
  return (
    <motion.div
      onClick={() => setExpanded(e => !e)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      animate={expanded ? { scale: 1.05 } : { scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 10 }}
      className={`rounded-2xl border cursor-pointer select-none transition-all duration-300 ease-out flex flex-col justify-between card-luxury backdrop-blur-xl
        ${expanded ? "p-8 shadow-2xl z-10 relative" : "p-6 hover:shadow-2xl"}
        ${
          accent
            ? expanded
              ? "bg-gradient-to-br from-[#c9a84c]/35 to-[#8b7a2e]/25 border-[#c9a84c]/80 shadow-lg shadow-[#c9a84c]/30"
              : "bg-gradient-to-br from-[#c9a84c]/20 to-[#8b7a2e]/15 border-[#c9a84c]/50 hover:border-[#c9a84c]/70 hover:shadow-lg hover:shadow-[#c9a84c]/20"
            : expanded
              ? "bg-gradient-to-br from-slate-800/60 to-slate-900/50 border-slate-600/70 shadow-lg shadow-slate-900/50"
              : "bg-gradient-to-br from-slate-800/40 to-slate-900/30 border-slate-700/60 hover:border-blue-500/60 hover:shadow-lg hover:shadow-blue-500/20"
        }
        min-h-[140px]
      `}
    >
      <div
        className={`mb-3 transition-transform duration-300 ${expanded ? "scale-125" : ""} ${accent ? "text-[#c9a84c]" : "text-gray-400"}`}
      >
        {icon}
      </div>
      <p className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wider section-label">{label}</p>
      <p
        className={`font-bold transition-all duration-400 leading-tight break-words ${expanded ? "text-3xl" : "text-lg sm:text-xl"} ${accent ? "text-[#c9a84c]" : "text-white"}`}
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
    </motion.div>
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
            {agentsList.map((agent) => (
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
          {filteredClients.map(client => {
            // Determine color based on agent
            const mauriId = agentsList?.find(a => a.email === 'mauri@ortizinsurancebroker.com')?.id;
            const nathanId = agentsList?.find(a => a.email === 'natefaughn@gmail.com')?.id;
            
            let borderColor = 'border-white/10';
            let bgColor = 'bg-white/5';
            
            if (client.agentId === mauriId) {
              borderColor = 'border-purple-500/30';
              bgColor = 'bg-purple-500/5';
            } else if (client.agentId === nathanId) {
              borderColor = 'border-orange-500/30';
              bgColor = 'bg-orange-500/5';
            }
            
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
                    {client.ssn && (
                      <span title="Social Security Number">
                        SSN: ***-**-{client.ssn.slice(-4)}
                      </span>
                    )}
                    {client.driverLicense && (
                      <span title="Driver License">
                        DL: {client.driverLicense} ({client.driverLicenseState})
                      </span>
                    )}
                    {client.bankName && (
                      <span title="Bank Account">
                        Bank: {client.bankName}
                      </span>
                    )}
                    {client.accountNumber && (
                      <span title="Account Number">
                        Acct: ****{client.accountNumber.slice(-4)}
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
                      {policy.policyNumber || "—"}
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
  const [optimisticStatuses, setOptimisticStatuses] = useState<
    Record<number, string>
  >({});
  const [editingPolicyId, setEditingPolicyId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({
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
        `Sales Tracker updated — ${data.clientName} / ${data.carrier}: $${parseFloat(data.premium).toFixed(2)}/mo, $${parseFloat(data.annualPremium).toFixed(2)} AP` +
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
      carrier: policy.carrier || "",
      type: policy.type || "",
      policyNumber: policy.policyNumber || "",
      premiumAmount: policy.premiumAmount || "",
      premiumFrequency: policy.premiumFrequency || "monthly",
      coverageAmount: policy.coverageAmount || "",
    });
  };

  const cancelEditPolicy = () => {
    setEditingPolicy(null);
    setEditingPolicyId(null);
    setEditFormData({
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
    const compRate = lookupCompRate(policy.carrier, policy.type);
    setSyncingPolicyId(policy.id);
    syncPolicyMutation.mutate({
      policyId: policy.id,
      commissionPercent: compRate !== null ? String(compRate) : undefined,
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

  const filteredPolicies = (policiesList || []).filter(p => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.carrier.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q) ||
      p.policyNumber.toLowerCase().includes(q) ||
      getClientName(p.clientId).toLowerCase().includes(q);
    const effectiveStatus = optimisticStatuses[p.id] ?? p.status;
    const matchesStatus =
      statusFilter === "all" || effectiveStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Count per status for badge
  const statusCounts = (policiesList || []).reduce(
    (acc, p) => {
      const s = optimisticStatuses[p.id] ?? p.status;
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
                      <td className="px-2 py-2 text-white font-medium whitespace-nowrap text-[13px] lg:text-[14px] sticky left-0 z-10 bg-[#0a1628] min-w-[130px] after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-white/10">
                        <div className="flex items-center gap-1">
                          <span className="truncate">{getClientName(policy.clientId)}</span>
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
                          <span className="text-gray-300 font-mono text-[12px] lg:text-[13px] truncate max-w-[120px]" title={policy.policyNumber}>{policy.policyNumber}</span>
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
                            ${parseFloat(policy.premiumAmount || "0").toFixed(2)}
                          </td>

                          <td className="px-2 py-2 text-right text-[#c9a84c] whitespace-nowrap text-[13px] lg:text-[14px]">
                            {policy.yearlyAP
                              ? `$${parseFloat(policy.yearlyAP).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              : "—"}
                          </td>
                        </>
                      )}

                      <td className="px-2 py-2 text-center">
                        <select
                          value={optimisticStatuses[policy.id] ?? policy.status}
                          onChange={e =>
                            handleStatusChange(policy.id, e.target.value)
                          }
                          disabled={updatePolicyMutation.isPending}
                          className={`text-[11px] lg:text-[12px] px-3 py-1.5 rounded-full capitalize border cursor-pointer appearance-none text-center font-semibold focus:outline-none focus:ring-1 focus:ring-[#c9a84c]/50 ${statusColor(optimisticStatuses[policy.id] ?? policy.status)}`}
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
            <AlertDialogDescription className="text-gray-300">
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
  const [formData, setFormData] = useState({
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
  const filtered = allAnnuities.filter(a => {
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

  const fiaList = allAnnuities.filter(a => a.type === "FIA");
  const mygaList = allAnnuities.filter(a => a.type === "MYGA");
  const totalFIAPremium = fiaList.reduce((s, a) => s + calcAP(a), 0);
  const totalMYGAPremium = mygaList.reduce((s, a) => s + calcAP(a), 0);
  const totalPremium = totalFIAPremium + totalMYGAPremium;
  const activeFIA = fiaList.filter(a => a.status === "active").length;
  const activeMYGA = mygaList.filter(a => a.status === "active").length;

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
            sub: `${allAnnuities.filter(a => a.status === "active").length} active`,
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
                value: `$${allAnnuities.reduce((s, a) => s + parseFloat(a.premium || "0"), 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
              },
              {
                label: "Total Comp AP",
                value: `$${allAnnuities.reduce((s, a) => s + calcAP(a), 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
              },
              {
                label: "Annuities Without Comp %",
                value: `${allAnnuities.filter(a => !a.commissionPercent || parseFloat(a.commissionPercent) === 0).length}`,
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
            {allAnnuities.map(a => (
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
                  .reduce((s, a) => s + calcAP(a), 0)
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
                  {allAnnuities.map(a => (
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
                        .reduce((s, a) => s + calcAP(a), 0)
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
                    list="client-names-list"
                  />
                  <datalist id="client-names-list">
                    {(clientsList || []).map(c => (
                      <option
                        key={c.id}
                        value={`${c.firstName} ${c.lastName}`}
                      />
                    ))}
                  </datalist>
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
                {filtered.map(a => (
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
                        value={optimisticStatuses[a.id] ?? a.status}
                        onChange={e => handleStatusChange(a.id, e.target.value)}
                        disabled={updateMutation.isPending}
                        className={`text-xs px-2 py-1 rounded-full capitalize border cursor-pointer appearance-none font-semibold focus:outline-none ${annuityStatusColor(optimisticStatuses[a.id] ?? a.status)}`}
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
                      {filtered.map(a => {
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
                              value={optimisticStatuses[a.id] ?? a.status}
                              onChange={e =>
                                handleStatusChange(a.id, e.target.value)
                              }
                              disabled={updateMutation.isPending}
                              className={`text-xs px-2 py-1 rounded-full capitalize border cursor-pointer appearance-none text-center font-semibold focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50 ${annuityStatusColor(optimisticStatuses[a.id] ?? a.status)}`}
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
      {policies.map(p => (
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
                    {p.faceAmount ? fmt(parseFloat(p.faceAmount)) : "—"}
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
  const { data: gwlList, isLoading } = trpc.admin.listGWL.useQuery();
  const addGWL = trpc.admin.addGWL.useMutation({
    onSuccess: () => utils.admin.listGWL.invalidate(),
  });
  const updateGWL = trpc.admin.updateGWL.useMutation({
    onSuccess: () => utils.admin.listGWL.invalidate(),
  });
  const deleteGWL = trpc.admin.deleteGWL.useMutation({
    onSuccess: () => utils.admin.listGWL.invalidate(),
  });

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    clientName: "",
    carrier: "",
    policyNumber: "",
    premium: "",
    premiumFrequency: "monthly" as
      | "monthly"
      | "quarterly"
      | "semi-annual"
      | "annual",
    commissionPercent: "",
    faceAmount: "",
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
      clientName: "",
      carrier: "",
      policyNumber: "",
      premium: "",
      premiumFrequency: "monthly",
      commissionPercent: "",
      faceAmount: "",
      status: "active",
      notes: "",
    });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!form.clientName || !form.carrier || !form.premium) return;
    const yearlyAP = calcYearlyAP(form.premium, form.premiumFrequency);
    const payload = { ...form, yearlyAP: yearlyAP || undefined };
    if (editId !== null) {
      await updateGWL.mutateAsync({ id: editId, ...payload });
    } else {
      await addGWL.mutateAsync(payload);
    }
    resetForm();
  };

  const startEdit = (p: any) => {
    setForm({
      clientName: p.clientName || "",
      carrier: p.carrier || "",
      policyNumber: p.policyNumber || "",
      premium: p.premium || "",
      premiumFrequency: p.premiumFrequency || "monthly",
      commissionPercent: p.commissionPercent || "",
      faceAmount: p.faceAmount || "",
      status: p.status || "active",
      notes: p.notes || "",
    });
    setEditId(p.id);
    setShowForm(true);
  };

  const policies = gwlList || [];
  const activePolicies = policies.filter(p => p.status === "active");
  const totalYearlyAP = activePolicies.reduce(
    (sum, p) => sum + parseFloat(p.yearlyAP || "0"),
    0
  );
  const totalPremium = activePolicies.reduce(
    (sum, p) => sum + parseFloat(p.premium || "0"),
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
          <p className="text-gray-400 text-sm mb-1">Total GWL Policies</p>
          <p className="text-3xl font-bold text-white">{policies.length}</p>
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
          Graded Whole Life Policies
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
            {editId !== null ? "Edit" : "Add"} Graded Whole Life Policy
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                value={form.faceAmount}
                onChange={e =>
                  setForm(f => ({ ...f, faceAmount: e.target.value }))
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
              disabled={addGWL.isPending || updateGWL.isPending}
              className="px-5 py-2 rounded-lg bg-[#c9a84c] text-[#0a1628] font-semibold text-sm hover:bg-[#e8c84a] transition disabled:opacity-50"
            >
              {addGWL.isPending || updateGWL.isPending
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
      ) : policies.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No graded whole life policies yet. Click "Add Policy" to get started.
        </div>
      ) : (
        <>
          {/* Mobile: expandable cards */}
          <GWLMobileCards
            policies={policies}
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
                {policies.map((p, i) => (
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
                      {fmt(parseFloat(p.premium))}
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
                      {p.commissionPercent ? `${p.commissionPercent}%` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">
                      {p.faceAmount ? fmt(parseFloat(p.faceAmount)) : "—"}
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
                            if (confirm(`Delete ${p.clientName}'s GWL policy?`))
                              deleteGWL.mutate({ id: p.id });
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

function OnboardingTab({ setShowIntakeForm }: { setShowIntakeForm: (val: boolean) => void }) {
  // Fetch admin-saved carrier phones for PDF generation
  const { data: adminCarrierPhones } = trpc.admin.getSetting.useQuery({
    key: "carrier_phones",
  });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [policyType, setPolicyType] = useState("");
  const [carrier, setCarrier] = useState("");
  const [premium, setPremium] = useState("");
  const [draftDate, setDraftDate] = useState("");
  // Contract detail fields (optional)
  const [contractNumber, setContractNumber] = useState("");
  const [contractType, setContractType] = useState("");
  const [productName, setProductName] = useState("");
  const [taxQualification, setTaxQualification] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [ownerDob, setOwnerDob] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");
  const [ownerCity, setOwnerCity] = useState("");
  const [ownerState, setOwnerState] = useState("");
  const [ownerZip, setOwnerZip] = useState("");
  const [annuitantName, setAnnuitantName] = useState("");
  const [annuitantDob, setAnnuitantDob] = useState("");
  const [primaryBeneficiary, setPrimaryBeneficiary] = useState("");
  const [primaryBeneficiaryPercent, setPrimaryBeneficiaryPercent] =
    useState("");
  const [contingentBeneficiary, setContingentBeneficiary] = useState("");
  const [contingentBeneficiaryPercent, setContingentBeneficiaryPercent] =
    useState("");
  const [accumulatedValue, setAccumulatedValue] = useState("");
  const [showContractDetails, setShowContractDetails] = useState(false);

  // Commission preview — auto-calculated from carrier + policyType + premium
  const onboardCompRate = lookupCompRate(carrier, policyType);
  const onboardMonthlyPremium = parseFloat(premium) || 0;
  const onboardAnnualPremium = onboardMonthlyPremium * 12;
  const onboardCommissionAmt =
    onboardCompRate !== null
      ? (onboardAnnualPremium * onboardCompRate) / 100
      : null;
  const onboardMonthlyCommission =
    onboardCommissionAmt !== null ? onboardCommissionAmt / 12 : null;

  const [result, setResult] = useState<{
    client: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      pin: string;
      policyType: string;
      carrier: string;
      premium: number;
      draftDate: string;
      contractNumber: string;
      contractType: string;
      productName: string;
      taxQualification: string;
      issueDate: string;
      ownerDob: string;
      ownerAddress: string;
      ownerCity: string;
      ownerState: string;
      ownerZip: string;
      annuitantName: string;
      annuitantDob: string;
      primaryBeneficiary: string;
      primaryBeneficiaryPercent: number;
      contingentBeneficiary: string;
      contingentBeneficiaryPercent: number;
      accumulatedValue: number;
    };
    textMessage: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const onboard = trpc.admin.onboardClient.useMutation({
    onSuccess: data => {
      setResult({ client: data.client, textMessage: data.textMessage });
      toast.success(
        `Client ${data.client.firstName} ${data.client.lastName} onboarded successfully!`
      );
    },
    onError: err => {
      // CONFLICT = duplicate client — show a clear, actionable message
      if (err.message?.includes("already exists")) {
        toast.error(
          err.message +
            " You can update their policy from the Clients tab instead.",
          { duration: 6000 }
        );
      } else {
        toast.error(err.message || "Onboarding failed. Please try again.");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !policyType ||
      !carrier ||
      !premium ||
      !draftDate
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    onboard.mutate({
      firstName,
      lastName,
      email,
      phone,
      policyType,
      carrier,
      premium: parseFloat(premium),
      draftDate,
      // Optional contract detail fields — only pass if filled
      ...(contractNumber && { contractNumber }),
      ...(contractType && { contractType }),
      ...(productName && { productName }),
      ...(taxQualification && { taxQualification }),
      ...(issueDate && { issueDate }),
      ...(ownerDob && { ownerDob }),
      ...(ownerAddress && { ownerAddress }),
      ...(ownerCity && { ownerCity }),
      ...(ownerState && { ownerState }),
      ...(ownerZip && { ownerZip }),
      ...(annuitantName && { annuitantName }),
      ...(annuitantDob && { annuitantDob }),
      ...(primaryBeneficiary && { primaryBeneficiary }),
      ...(primaryBeneficiaryPercent && {
        primaryBeneficiaryPercent: parseFloat(primaryBeneficiaryPercent),
      }),
      ...(contingentBeneficiary && { contingentBeneficiary }),
      ...(contingentBeneficiaryPercent && {
        contingentBeneficiaryPercent: parseFloat(contingentBeneficiaryPercent),
      }),
      ...(accumulatedValue && {
        accumulatedValue: parseFloat(accumulatedValue),
      }),
      origin: "https://www.ortizinsurancebroker.com", // Always use production domain for portal URL generation
    });
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.textMessage);
      setCopied(true);
      toast.success("Text message copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = result.textMessage;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      toast.success("Text message copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Carrier data lookup for PDF — use admin-saved list, fall back to defaults
  const PDF_CARRIER_DATA: Record<string, CarrierInfo> = (() => {
    if (adminCarrierPhones?.value) {
      try {
        const parsed = JSON.parse(adminCarrierPhones.value);
        // Normalize: if old format (string values), convert to CarrierInfo
        const normalized: Record<string, CarrierInfo> = {};
        for (const [k, v] of Object.entries(parsed)) {
          if (typeof v === "string") {
            normalized[k] = {
              phone: v,
              portalUrl: DEFAULT_CARRIER_PHONES[k]?.portalUrl || "",
            };
          } else {
            normalized[k] = v as CarrierInfo;
          }
        }
        return normalized;
      } catch {}
    }
    return { ...DEFAULT_CARRIER_PHONES };
  })();

  const handleDownloadPdf = async () => {
    if (!result) return;
    setGeneratingPdf(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "letter",
      });
      const w = doc.internal.pageSize.getWidth();
      const h = doc.internal.pageSize.getHeight();
      const c = result.client;
      const margin = 18;
      const carrierData = PDF_CARRIER_DATA[c.carrier] || null;
      const carrierPhone = carrierData?.phone || null;
      const carrierPortalUrl = carrierData?.portalUrl || null;
      // Always use the real production domain in client-facing PDFs
      const isDevOrigin =
        window.location.origin.includes("localhost") ||
        window.location.origin.includes("manus.computer") ||
        window.location.origin.includes("manus.space");
      const portalUrl = isDevOrigin
        ? "https://www.ortizinsurancebroker.com/portal"
        : `${window.location.origin}/portal`;

      // ─── Load logo ───
      let logoLoaded = false;
      let logoImg: HTMLImageElement | null = null;
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject();
          img.src = "/manus-storage/ortiz-crest-black-gold_3f5fa279.png";
        });
        logoImg = img;
        logoLoaded = true;
      } catch {
        /* continue without logo */
      }

      // ═══════════════════════════════════════════════════
      // PAGE 1 — Welcome Letter
      // ═══════════════════════════════════════════════════

      // ─── Page background ───
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, w, h, "F");

      // ─── Left gold accent bar ───
      doc.setFillColor(201, 168, 76);
      doc.rect(0, 0, 5, h, "F");

      // ─── Top header band ───
      doc.setFillColor(10, 22, 40);
      doc.rect(5, 0, w - 5, 52, "F");

      // Gold bottom border on header
      doc.setFillColor(201, 168, 76);
      doc.rect(5, 52, w - 5, 1.5, "F");

      // Logo in header
      const nameX = margin + 8;
      if (logoLoaded && logoImg) {
        // Full horizontal logo — sized to fit cleanly in the header band (52mm tall)
        // Preserve aspect ratio: logo is roughly 4:1 wide, so 60mm wide × 24mm tall
        doc.addImage(logoImg, "PNG", nameX, 10, 70, 30);
        // Tagline below logo
        doc.setTextColor(180, 180, 180);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.text(
          "Corpus Christi, TX  ·  (361) 613-8336  ·  eortiz@ortizinsurancebroker.com",
          nameX,
          44
        );
      } else {
        // Fallback: text-only header
        doc.setTextColor(201, 168, 76);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("ORTIZ INSURANCE BROKER", nameX, 26);
        doc.setTextColor(180, 180, 180);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        doc.text(
          "Corpus Christi, Texas  ·  Licensed in 50+ States  ·  (361) 613-8336",
          nameX,
          35
        );
        doc.text(
          "eortiz@ortizinsurancebroker.com  ·  www.ortizinsurancebroker.com",
          nameX,
          42
        );
      }

      // Document title right-aligned
      // Thin gold rule above title
      doc.setFillColor(201, 168, 76);
      doc.rect(w - margin - 60, 16, 60, 0.5, "F");
      doc.setTextColor(201, 168, 76);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text("ORTIZ INSURANCE BROKER", w - margin, 22, { align: "right" });
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("PERSONAL INSURANCE PORTFOLIO", w - margin, 31, {
        align: "right",
      });
      // Thin gold rule below title
      doc.setFillColor(201, 168, 76);
      doc.rect(w - margin - 60, 33.5, 60, 0.5, "F");
      doc.setTextColor(180, 180, 180);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.text(
        new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        w - margin,
        40,
        { align: "right" }
      );
      doc.setTextColor(150, 150, 160);
      doc.setFontSize(6.5);
      doc.text("PRIVATE & CONFIDENTIAL", w - margin, 47, { align: "right" });

      // ─── Welcome letter body ───
      let y = 68;

      // Greeting
      doc.setTextColor(10, 22, 40);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text(`Dear ${c.firstName} ${c.lastName},`, margin + 8, y);
      y += 10;

      // Gold divider
      doc.setFillColor(201, 168, 76);
      doc.rect(margin + 8, y, 40, 0.8, "F");
      y += 8;

      // Welcome paragraph
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(10.5);
      doc.setFont("helvetica", "normal");
      const welcomeLines = doc.splitTextToSize(
        `On behalf of the entire team at Ortiz Insurance Broker, I want to personally welcome you as a valued client. It is our privilege to serve you and your family, and we are committed to ensuring that your insurance coverage provides the protection and peace of mind you deserve.`,
        w - margin * 2 - 8
      );
      doc.text(welcomeLines, margin + 8, y);
      y += welcomeLines.length * 6 + 6;

      const para2Lines = doc.splitTextToSize(
        `Enclosed in this packet, you will find a summary of your policy details, your carrier's contact information, and your secure login credentials for our Client Portal — where you can view your policy, track your coverage, and reach us at any time.`,
        w - margin * 2 - 8
      );
      doc.text(para2Lines, margin + 8, y);
      y += para2Lines.length * 6 + 6;

      const para3Lines = doc.splitTextToSize(
        `We encourage you to review this information carefully and keep it in a safe place. Should you have any questions about your policy, need to make changes, or simply want to discuss your coverage options, please do not hesitate to contact our office. We are always here to help.`,
        w - margin * 2 - 8
      );
      doc.text(para3Lines, margin + 8, y);
      y += para3Lines.length * 6 + 10;

      // Closing
      doc.setTextColor(10, 22, 40);
      doc.setFontSize(10.5);
      doc.setFont("helvetica", "normal");
      doc.text(
        "With gratitude and dedication to your protection,",
        margin + 8,
        y
      );
      y += 8;

      // ─── Cursive signature image ───
      let sigLoaded = false;
      try {
        const sigImg = new Image();
        sigImg.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          sigImg.onload = () => resolve();
          sigImg.onerror = () => reject();
          sigImg.src = "/manus-storage/eric_ortiz_signature_d3d90b2e.png";
        });
        // Render at ~55mm wide, preserving aspect ratio (444x134 → ~55x16.6mm)
        doc.addImage(sigImg, "PNG", margin + 4, y, 55, 16.6);
        sigLoaded = true;
        y += 18;
      } catch {
        /* fallback to text */
      }

      if (!sigLoaded) {
        doc.setTextColor(201, 168, 76);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Eric Ortiz", margin + 8, y);
        y += 8;
      }

      doc.setTextColor(80, 80, 80);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(
        "Licensed Insurance Agent  ·  Ortiz Insurance Broker",
        margin + 8,
        y
      );
      doc.text(
        "(361) 613-8336  ·  eortiz@ortizinsurancebroker.com",
        margin + 8,
        y + 5
      );
      y += 18;

      // Gold divider
      doc.setFillColor(201, 168, 76);
      doc.rect(margin + 8, y, w - margin * 2 - 16, 0.5, "F");
      y += 10;

      // ─── Quick Reference Box ───
      const qrBoxH = 28;
      doc.setFillColor(10, 22, 40);
      doc.roundedRect(margin + 8, y, w - margin * 2 - 16, qrBoxH, 2, 2, "F");
      doc.setFillColor(201, 168, 76);
      doc.rect(margin + 8, y, 3, qrBoxH, "F");

      doc.setTextColor(201, 168, 76);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("QUICK REFERENCE", margin + 16, y + 7);

      const qrColW = (w - margin * 2 - 16 - 8) / 3;
      const qrStartX = margin + 16;

      // Col 1: Policy Type
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.text("POLICY TYPE", qrStartX, y + 14);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(c.policyType, qrStartX, y + 20);

      // Col 2: Carrier
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.text("CARRIER", qrStartX + qrColW, y + 14);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(c.carrier, qrStartX + qrColW, y + 20);

      // Col 3: Premium
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.text("MONTHLY PREMIUM", qrStartX + qrColW * 2, y + 14);
      doc.setTextColor(201, 168, 76);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(
        `$${c.premium.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        qrStartX + qrColW * 2,
        y + 20
      );

      y += qrBoxH + 12;

      // ─── Footer bar page 1 ───
      doc.setFillColor(10, 22, 40);
      doc.rect(5, h - 16, w - 5, 16, "F");
      doc.setFillColor(201, 168, 76);
      doc.rect(5, h - 16, w - 5, 0.8, "F");
      doc.setTextColor(180, 180, 180);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.text(
        "Ortiz Insurance Broker  ·  Corpus Christi, TX  ·  (361) 613-8336  ·  eortiz@ortizinsurancebroker.com",
        w / 2 + 2,
        h - 7,
        { align: "center" }
      );
      doc.setTextColor(201, 168, 76);
      doc.text("Page 1 of 2", w - margin, h - 7, { align: "right" });

      // ═══════════════════════════════════════════════════
      // PAGE 2 — Policy Details & Credentials
      // ═══════════════════════════════════════════════════
      doc.addPage();

      // Page background
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, w, h, "F");

      // Left gold accent bar
      doc.setFillColor(201, 168, 76);
      doc.rect(0, 0, 5, h, "F");

      // Top header band (compact)
      doc.setFillColor(10, 22, 40);
      doc.rect(5, 0, w - 5, 36, "F");
      doc.setFillColor(201, 168, 76);
      doc.rect(5, 36, w - 5, 1.5, "F");

      // Logo in compact header
      if (logoLoaded && logoImg) {
        doc.addImage(logoImg, "PNG", margin + 8, 7, 16, 16);
      }
      const p2TextX = logoLoaded ? margin + 28 : margin + 8;
      // Company name with gold accent
      doc.setTextColor(201, 168, 76);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("ORTIZ INSURANCE BROKER", p2TextX, 16);
      // Thin gold rule
      doc.setFillColor(201, 168, 76);
      doc.rect(p2TextX, 18.5, 70, 0.4, "F");
      doc.setTextColor(160, 160, 170);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text("Licensed Insurance Broker  ·  Corpus Christi, TX", p2TextX, 24);

      // Right side: document title
      doc.setFillColor(201, 168, 76);
      doc.rect(w - margin - 62, 10, 62, 0.4, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.text("PERSONAL INSURANCE PORTFOLIO", w - margin, 18, {
        align: "right",
      });
      doc.setFillColor(201, 168, 76);
      doc.rect(w - margin - 62, 20, 62, 0.4, "F");
      doc.setTextColor(180, 180, 180);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.text(`Prepared for: ${c.firstName} ${c.lastName}`, w - margin, 27, {
        align: "right",
      });

      y = 46;

      // ─── Helper: Section Header (page 2) ───
      const sectionHeader = (title: string) => {
        if (y > h - 40) {
          doc.addPage();
          y = 25;
        }
        doc.setFillColor(10, 22, 40);
        doc.roundedRect(margin + 8, y, w - margin * 2 - 16, 9, 1.5, 1.5, "F");
        doc.setFillColor(201, 168, 76);
        doc.rect(margin + 8, y, 2, 9, "F");
        doc.setTextColor(201, 168, 76);
        doc.setFontSize(9.5);
        doc.setFont("helvetica", "bold");
        doc.text(title.toUpperCase(), margin + 14, y + 6.5);
        y += 11;
      };

      // ─── Helper: Field Row ───
      const LABEL_COL = margin + 14; // left edge of label
      const VALUE_COL = margin + 72; // fixed left edge of value (aligned)
      const fieldRow = (label: string, value: string, highlight = false) => {
        if (y > h - 25) {
          doc.addPage();
          y = 25;
        }
        // Label
        doc.setTextColor(120, 120, 120);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.text(label, LABEL_COL, y);
        // Value
        if (highlight) {
          doc.setTextColor(201, 168, 76);
        } else {
          doc.setTextColor(20, 20, 20);
        }
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(value || "—", VALUE_COL, y);
        // Divider
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.2);
        doc.line(LABEL_COL, y + 3.5, w - margin - 14, y + 3.5);
        y += 8.5;
      };

      // ─── Client Information ───
      sectionHeader("Client Information");
      fieldRow("Full Name", `${c.firstName} ${c.lastName}`);
      fieldRow("Email Address", c.email);
      fieldRow("Phone Number", c.phone);
      y += 2;

      // ─── Policy Details ───
      sectionHeader("Policy Details");
      fieldRow("Policy Type", c.policyType);
      fieldRow("Insurance Carrier", c.carrier);
      fieldRow(
        "Monthly Premium",
        `$${c.premium.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        true
      );
      fieldRow("Draft Date", c.draftDate);
      y += 2;

      // ─── Carrier Contact Box (full navy, gold header bar) ───
      if (y > h - 70) {
        doc.addPage();
        y = 25;
      }
      const hasCarrierPortal = !!(
        carrierPortalUrl && carrierPortalUrl.length > 0
      );
      // Calculate box height: header(10) + rows
      const cRows = carrierPhone ? (hasCarrierPortal ? 3 : 2) : 1;
      const carrierBoxH = 10 + cRows * 13 + 6;
      const cBoxX = margin + 8;
      const cBoxW = w - margin * 2 - 16;
      const cLabelX = cBoxX + 8;
      const cValueX = cBoxX + 52;

      // Navy background
      doc.setFillColor(10, 22, 40);
      doc.roundedRect(cBoxX, y, cBoxW, carrierBoxH, 2, 2, "F");

      // Gold header bar inside box
      doc.setFillColor(201, 168, 76);
      doc.roundedRect(cBoxX + 0.4, y + 0.4, cBoxW - 0.8, 10, 2, 2, "F");
      doc.setFillColor(201, 168, 76);
      doc.rect(cBoxX + 0.4, y + 5, cBoxW - 0.8, 5.4, "F"); // square bottom of rounded top

      // Header text
      doc.setTextColor(10, 22, 40);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("CARRIER CONTACT INFORMATION", cBoxX + 8, y + 7.5);

      // Row helper for navy box
      let ry = y + 17;
      const cRow = (
        label: string,
        value: string,
        isLink = false,
        linkUrl = ""
      ) => {
        doc.setTextColor(160, 160, 170);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.text(label, cLabelX, ry);
        if (isLink && linkUrl) {
          doc.setTextColor(100, 180, 255);
          doc.setFontSize(8.5);
          doc.setFont("helvetica", "normal");
          doc.textWithLink(value, cValueX, ry, { url: linkUrl });
        } else {
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.text(value, cValueX, ry);
        }
        // subtle row divider
        doc.setDrawColor(30, 50, 80);
        doc.setLineWidth(0.2);
        doc.line(cLabelX, ry + 4, cBoxX + cBoxW - 8, ry + 4);
        ry += 13;
      };

      // Carrier name row
      cRow("Carrier", c.carrier);

      if (carrierPhone) {
        cRow("Customer Service", carrierPhone);
        if (hasCarrierPortal) {
          cRow("Online Portal", carrierPortalUrl!, true, carrierPortalUrl!);
        }
      } else {
        doc.setTextColor(160, 160, 170);
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.text(
          "Contact your agent for carrier service information.",
          cLabelX,
          ry
        );
      }

      y += carrierBoxH + 6;

      // ─── Portal Credentials Box ───
      if (y > h - 80) {
        doc.addPage();
        y = 25;
      }
      y += 2;
      const boxH = 58;
      doc.setFillColor(10, 22, 40);
      doc.roundedRect(margin + 8, y, w - margin * 2 - 16, boxH, 3, 3, "F");
      doc.setDrawColor(201, 168, 76);
      doc.setLineWidth(0.8);
      doc.roundedRect(margin + 8, y, w - margin * 2 - 16, boxH, 3, 3, "S");

      // Gold top accent bar inside box
      doc.setFillColor(201, 168, 76);
      doc.roundedRect(
        margin + 8.4,
        y + 0.4,
        w - margin * 2 - 16.8,
        9,
        2.5,
        2.5,
        "F"
      );
      doc.setFillColor(201, 168, 76);
      doc.rect(margin + 8.4, y + 5, w - margin * 2 - 16.8, 4.5, "F");
      doc.setTextColor(10, 22, 40);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("YOUR SECURE CLIENT PORTAL ACCESS", w / 2 + 2, y + 6.5, {
        align: "center",
      });

      // Credentials layout
      const credStartY = y + 16;
      const colMid = (w - margin * 2 - 16) / 2 + margin + 8;

      // Left column: Last Name
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.text("LAST NAME", margin + 18, credStartY);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(c.lastName, margin + 18, credStartY + 8);

      // Right column: PIN
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.text("SECURE PIN", colMid + 5, credStartY);
      doc.setTextColor(201, 168, 76);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(c.pin, colMid + 5, credStartY + 8);

      // Divider
      doc.setDrawColor(60, 80, 110);
      doc.setLineWidth(0.3);
      doc.line(margin + 18, credStartY + 12, w - margin - 18, credStartY + 12);

      // Portal URL row
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.text("ACCESS YOUR PORTAL AT:", margin + 18, credStartY + 19);
      doc.setTextColor(201, 168, 76);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.textWithLink(portalUrl, margin + 18, credStartY + 26, {
        url: portalUrl,
      });

      // Keep credentials note
      doc.setTextColor(120, 120, 120);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "italic");
      doc.text(
        "Please keep this information confidential and store it in a safe place.",
        w / 2 + 2,
        credStartY + 35,
        { align: "center" }
      );

      y += boxH + 8;

      // ─── Contract Details (if any) ───
      const hasContractDetails =
        c.contractNumber ||
        c.productName ||
        c.contractType ||
        c.taxQualification ||
        c.issueDate ||
        c.ownerDob ||
        c.ownerAddress ||
        c.annuitantName ||
        c.primaryBeneficiary ||
        c.contingentBeneficiary ||
        c.accumulatedValue > 0;
      if (hasContractDetails) {
        sectionHeader("Contract Details");
        if (c.contractNumber) fieldRow("Contract Number", c.contractNumber);
        if (c.contractType) fieldRow("Contract Type", c.contractType);
        if (c.productName) fieldRow("Product Name", c.productName);
        if (c.taxQualification)
          fieldRow("Tax Qualification", c.taxQualification);
        if (c.issueDate) fieldRow("Issue Date", c.issueDate);
        if (c.accumulatedValue > 0)
          fieldRow(
            "Accumulated Value",
            `$${c.accumulatedValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            true
          );
        y += 3;

        if (c.ownerDob || c.ownerAddress) {
          sectionHeader("Owner Details");
          if (c.ownerDob) fieldRow("Date of Birth", c.ownerDob);
          if (c.ownerAddress) {
            const fullAddr = [
              c.ownerAddress,
              c.ownerCity,
              c.ownerState,
              c.ownerZip,
            ]
              .filter(Boolean)
              .join(", ");
            fieldRow("Address", fullAddr);
          }
          y += 3;
        }

        if (c.annuitantName) {
          sectionHeader("Annuitant");
          fieldRow("Annuitant Name", c.annuitantName);
          if (c.annuitantDob) fieldRow("Date of Birth", c.annuitantDob);
          y += 3;
        }

        if (c.primaryBeneficiary || c.contingentBeneficiary) {
          sectionHeader("Beneficiary Designations");
          if (c.primaryBeneficiary)
            fieldRow(
              "Primary Beneficiary",
              `${c.primaryBeneficiary} — ${c.primaryBeneficiaryPercent}%`
            );
          if (c.contingentBeneficiary)
            fieldRow(
              "Contingent Beneficiary",
              `${c.contingentBeneficiary} — ${c.contingentBeneficiaryPercent}%`
            );
          y += 3;
        }
      }

      // ─── Footer bar page 2 ───
      doc.setFillColor(10, 22, 40);
      doc.rect(5, h - 16, w - 5, 16, "F");
      doc.setFillColor(201, 168, 76);
      doc.rect(5, h - 16, w - 5, 0.8, "F");
      doc.setTextColor(180, 180, 180);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.text(
        "Ortiz Insurance Broker  ·  Corpus Christi, TX  ·  (361) 613-8336  ·  eortiz@ortizinsurancebroker.com",
        w / 2 + 2,
        h - 7,
        { align: "center" }
      );
      doc.setTextColor(201, 168, 76);
      doc.text("Page 2 of 2", w - margin, h - 7, { align: "right" });

      doc.save(`${c.firstName}_${c.lastName}_Welcome_Packet.pdf`);
      toast.success("PDF downloaded!");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleReset = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setPolicyType("");
    setCarrier("");
    setPremium("");
    setDraftDate("");
    // Reset contract detail fields
    setContractNumber("");
    setContractType("");
    setProductName("");
    setTaxQualification("");
    setIssueDate("");
    setOwnerDob("");
    setOwnerAddress("");
    setOwnerCity("");
    setOwnerState("");
    setOwnerZip("");
    setAnnuitantName("");
    setAnnuitantDob("");
    setPrimaryBeneficiary("");
    setPrimaryBeneficiaryPercent("");
    setContingentBeneficiary("");
    setContingentBeneficiaryPercent("");
    setAccumulatedValue("");
    setShowContractDetails(false);
    setResult(null);
    setCopied(false);
  };

  const policyTypes = [
    "Whole Life Insurance",
    "Term Life Insurance",
    "Final Expense Insurance",
    "Graded Life Insurance",
    "Guaranteed Issue Life Insurance",
    "Fixed Index Annuity (FIA)",
    "Multi-Year Guaranteed Annuity (MYGA)",
    "Universal Life Insurance",
    "Mortgage Protection",
  ];

  // If we have a result, show the success screen
  if (result) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="text-emerald-400" size={22} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Client Onboarded Successfully
              </h3>
              <p className="text-emerald-300/80 text-sm">
                Portal credentials have been generated
              </p>
            </div>
          </div>
        </div>

        {/* Client Info Card */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h4 className="text-[#c9a84c] font-semibold text-lg mb-4 flex items-center gap-2">
            <Users size={18} />
            Client Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                Full Name
              </p>
              <p className="text-white font-semibold">
                {result.client.firstName} {result.client.lastName}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                Email
              </p>
              <p className="text-white font-semibold">{result.client.email}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                Phone
              </p>
              <p className="text-white font-semibold">{result.client.phone}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                Policy Type
              </p>
              <p className="text-white font-semibold">
                {result.client.policyType}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                Carrier
              </p>
              <p className="text-white font-semibold">
                {result.client.carrier}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                Premium
              </p>
              <p className="text-white font-semibold">
                $
                {result.client.premium.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                Draft Date
              </p>
              <p className="text-white font-semibold">
                {result.client.draftDate}
              </p>
            </div>
          </div>
        </div>

        {/* Contract Details Card — only show if any contract details were provided */}
        {(result.client.contractNumber ||
          result.client.productName ||
          result.client.contractType ||
          result.client.taxQualification ||
          result.client.issueDate ||
          result.client.ownerDob ||
          result.client.ownerAddress ||
          result.client.annuitantName ||
          result.client.primaryBeneficiary ||
          result.client.contingentBeneficiary ||
          result.client.accumulatedValue > 0) && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h4 className="text-[#c9a84c] font-semibold text-lg mb-4 flex items-center gap-2">
              <FileText size={18} />
              Contract Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.client.contractNumber && (
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                    Contract Number
                  </p>
                  <p className="text-white font-semibold">
                    {result.client.contractNumber}
                  </p>
                </div>
              )}
              {result.client.contractType && (
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                    Contract Type
                  </p>
                  <p className="text-white font-semibold">
                    {result.client.contractType}
                  </p>
                </div>
              )}
              {result.client.productName && (
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                    Product Name
                  </p>
                  <p className="text-white font-semibold">
                    {result.client.productName}
                  </p>
                </div>
              )}
              {result.client.taxQualification && (
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                    Tax Qualification
                  </p>
                  <p className="text-white font-semibold">
                    {result.client.taxQualification}
                  </p>
                </div>
              )}
              {result.client.issueDate && (
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                    Issue Date
                  </p>
                  <p className="text-white font-semibold">
                    {result.client.issueDate}
                  </p>
                </div>
              )}
              {result.client.accumulatedValue > 0 && (
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                    Accumulated Value
                  </p>
                  <p className="text-white font-semibold">
                    $
                    {result.client.accumulatedValue.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Owner Details */}
            {(result.client.ownerDob || result.client.ownerAddress) && (
              <div className="mt-4">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-3 font-semibold">
                  Owner Details
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.client.ownerDob && (
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                        Date of Birth
                      </p>
                      <p className="text-white font-semibold">
                        {result.client.ownerDob}
                      </p>
                    </div>
                  )}
                  {result.client.ownerAddress && (
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                        Address
                      </p>
                      <p className="text-white font-semibold">
                        {result.client.ownerAddress}
                        {result.client.ownerCity &&
                          `, ${result.client.ownerCity}`}
                        {result.client.ownerState &&
                          `, ${result.client.ownerState}`}
                        {result.client.ownerZip && ` ${result.client.ownerZip}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Annuitant */}
            {result.client.annuitantName && (
              <div className="mt-4">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-3 font-semibold">
                  Annuitant
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                      Name
                    </p>
                    <p className="text-white font-semibold">
                      {result.client.annuitantName}
                    </p>
                  </div>
                  {result.client.annuitantDob && (
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                        Date of Birth
                      </p>
                      <p className="text-white font-semibold">
                        {result.client.annuitantDob}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Beneficiaries */}
            {(result.client.primaryBeneficiary ||
              result.client.contingentBeneficiary) && (
              <div className="mt-4">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-3 font-semibold">
                  Beneficiaries
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.client.primaryBeneficiary && (
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                        Primary Beneficiary
                      </p>
                      <p className="text-white font-semibold">
                        {result.client.primaryBeneficiary} (
                        {result.client.primaryBeneficiaryPercent}%)
                      </p>
                    </div>
                  )}
                  {result.client.contingentBeneficiary && (
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                        Contingent Beneficiary
                      </p>
                      <p className="text-white font-semibold">
                        {result.client.contingentBeneficiary} (
                        {result.client.contingentBeneficiaryPercent}%)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Login Credentials Card */}
        <div className="bg-gradient-to-br from-[#c9a84c]/10 to-[#c9a84c]/5 border border-[#c9a84c]/30 rounded-xl p-6">
          <h4 className="text-[#c9a84c] font-semibold text-lg mb-4 flex items-center gap-2">
            <Shield size={18} />
            Portal Login Credentials
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/20 rounded-lg p-4 border border-[#c9a84c]/20">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                Last Name
              </p>
              <p className="text-[#c9a84c] text-2xl font-bold font-mono">
                {result.client.lastName}
              </p>
            </div>
            <div className="bg-black/20 rounded-lg p-4 border border-[#c9a84c]/20">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                PIN
              </p>
              <p className="text-[#c9a84c] text-2xl font-bold font-mono tracking-[0.3em]">
                {result.client.pin}
              </p>
            </div>
          </div>
        </div>

        {/* Text Message Preview */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[#c9a84c] font-semibold text-lg flex items-center gap-2">
              <MessageSquare size={18} />
              Text Message to Send Client
            </h4>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                copied
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/30 hover:bg-[#c9a84c]/20"
              }`}
            >
              {copied ? <CheckCircle size={16} /> : <ClipboardCopy size={16} />}
              {copied ? "Copied!" : "Copy Message"}
            </button>
          </div>
          <div className="bg-black/30 rounded-xl p-5 border border-white/5 relative">
            {/* Chat bubble style */}
            <div className="bg-[#1a7f37]/20 border border-[#1a7f37]/30 rounded-2xl rounded-bl-md p-4 max-w-lg">
              <p className="text-white text-sm whitespace-pre-line leading-relaxed">
                {result.textMessage}
              </p>
            </div>
            <p className="text-gray-500 text-xs mt-3 flex items-center gap-1">
              <Send size={12} />
              Copy and paste this into your messaging app to send to the client
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDownloadPdf}
            disabled={generatingPdf}
            className="flex items-center gap-2 px-6 py-3 bg-[#c9a84c] text-[#0a1628] font-bold rounded-lg hover:bg-[#d4b65c] transition disabled:opacity-50"
          >
            {generatingPdf ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <FileText size={18} />
            )}
            {generatingPdf ? "Generating..." : "Download PDF"}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 text-gray-300 font-semibold rounded-lg hover:bg-white/10 hover:text-white transition border border-white/10"
          >
            <UserPlus size={18} />
            Onboard Another Client
          </button>
        </div>
      </div>
    );
  }

  // Form view
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <UserPlus className="text-[#c9a84c]" size={22} />
              Onboard New Client
            </h3>
            <p className="text-gray-400 text-sm">
              Fill in the client's information below. A portal login (Last Name +
              PIN) will be auto-generated, and you'll get a ready-to-send text
              message with their credentials.
            </p>
          </div>
          <Button
            onClick={() => setShowIntakeForm(true)}
            className="gap-2 bg-[#c9a84c] hover:bg-[#b8963e] text-black font-semibold whitespace-nowrap"
          >
            <Plus size={18} />
            Comprehensive Intake Form
          </Button>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white/5 border border-white/10 rounded-xl p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* First Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="e.g. John"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/30 transition"
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="e.g. Doe"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/30 transition"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. john@email.com"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/30 transition"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="e.g. (361) 555-1234"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/30 transition"
              required
            />
          </div>

          {/* Policy Type */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Policy Type *
            </label>
            <select
              value={policyType}
              onChange={e => setPolicyType(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/30 transition appearance-none"
              required
            >
              <option value="" className="bg-[#0a1628]">
                Select policy type...
              </option>
              {policyTypes.map(type => (
                <option key={type} value={type} className="bg-[#0a1628]">
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Carrier */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Carrier *
            </label>
            <CarrierSelect value={carrier} onChange={setCarrier} required />
          </div>

          {/* Premium */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Premium ($) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={premium}
              onChange={e => setPremium(e.target.value)}
              placeholder="e.g. 150.00"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/30 transition"
              required
            />
          </div>

          {/* Commission Preview */}
          {onboardCompRate !== null && onboardMonthlyPremium > 0 && (
            <div className="md:col-span-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={16} className="text-emerald-400" />
                <span className="text-xs text-emerald-400 uppercase tracking-wider font-semibold">
                  Commission Preview @ {onboardCompRate}% (110% FFL)
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Annual Premium</p>
                  <p className="text-lg font-bold text-white">
                    $
                    {onboardAnnualPremium.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">
                    Annual Commission
                  </p>
                  <p className="text-lg font-bold text-emerald-400">
                    $
                    {onboardCommissionAmt!.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">
                    Monthly Commission
                  </p>
                  <p className="text-lg font-bold text-emerald-400">
                    $
                    {onboardMonthlyCommission!.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Draft Date */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Draft Date *
            </label>
            <input
              type="text"
              value={draftDate}
              onChange={e => setDraftDate(e.target.value)}
              placeholder="e.g. 1st of every month, 15th of every month"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/30 transition"
              required
            />
          </div>
        </div>

        {/* Contract Details (Optional - Collapsible) */}
        <div className="mt-6 border border-white/10 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowContractDetails(!showContractDetails)}
            className="w-full flex items-center justify-between px-5 py-4 bg-white/5 hover:bg-white/8 transition text-left"
          >
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-[#c9a84c]" />
              <span className="text-white font-semibold">Contract Details</span>
              <span className="text-gray-500 text-sm">(Optional)</span>
            </div>
            {showContractDetails ? (
              <ChevronUp size={18} className="text-gray-400" />
            ) : (
              <ChevronDown size={18} className="text-gray-400" />
            )}
          </button>

          {showContractDetails && (
            <div className="p-5 space-y-6 border-t border-white/10">
              {/* Contract Info */}
              <div>
                <p className="text-[#c9a84c] text-xs uppercase tracking-wider font-semibold mb-3">
                  Contract Information
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Contract Number
                    </label>
                    <input
                      type="text"
                      value={contractNumber}
                      onChange={e => setContractNumber(e.target.value)}
                      placeholder="e.g. 3301069949"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/30 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Contract Type
                    </label>
                    <input
                      type="text"
                      value={contractType}
                      onChange={e => setContractType(e.target.value)}
                      placeholder="e.g. Individual Flexible Premium Deferred Annuity"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/30 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={productName}
                      onChange={e => setProductName(e.target.value)}
                      placeholder="e.g. Athene Agility 10"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/30 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Tax Qualification
                    </label>
                    <input
                      type="text"
                      value={taxQualification}
                      onChange={e => setTaxQualification(e.target.value)}
                      placeholder="e.g. Non-Qualified, IRA, Roth IRA"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/30 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Issue Date
                    </label>
                    <input
                      type="text"
                      value={issueDate}
                      onChange={e => setIssueDate(e.target.value)}
                      placeholder="e.g. 05/15/2025"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/30 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Accumulated Value ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={accumulatedValue}
                      onChange={e => setAccumulatedValue(e.target.value)}
                      placeholder="e.g. 100000.00"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/30 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Owner Details */}
              <div>
                <p className="text-[#c9a84c] text-xs uppercase tracking-wider font-semibold mb-3">
                  Owner Details
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Owner Date of Birth
                    </label>
                    <input
                      type="text"
                      value={ownerDob}
                      onChange={e => setOwnerDob(e.target.value)}
                      placeholder="e.g. 03/22/1965"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/30 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Owner Address
                    </label>
                    <input
                      type="text"
                      value={ownerAddress}
                      onChange={e => setOwnerAddress(e.target.value)}
                      placeholder="e.g. 123 Main St"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/30 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={ownerCity}
                      onChange={e => setOwnerCity(e.target.value)}
                      placeholder="e.g. Corpus Christi"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/30 transition"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={ownerState}
                        onChange={e => setOwnerState(e.target.value)}
                        placeholder="e.g. TX"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/30 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Zip
                      </label>
                      <input
                        type="text"
                        value={ownerZip}
                        onChange={e => setOwnerZip(e.target.value)}
                        placeholder="e.g. 78401"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/30 transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Annuitant */}
              <div>
                <p className="text-[#c9a84c] text-xs uppercase tracking-wider font-semibold mb-3">
                  Annuitant
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Annuitant Name
                    </label>
                    <input
                      type="text"
                      value={annuitantName}
                      onChange={e => setAnnuitantName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/30 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Annuitant Date of Birth
                    </label>
                    <input
                      type="text"
                      value={annuitantDob}
                      onChange={e => setAnnuitantDob(e.target.value)}
                      placeholder="e.g. 03/22/1965"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/30 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Beneficiaries */}
              <div>
                <p className="text-[#c9a84c] text-xs uppercase tracking-wider font-semibold mb-3">
                  Beneficiaries
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Primary Beneficiary
                    </label>
                    <input
                      type="text"
                      value={primaryBeneficiary}
                      onChange={e => setPrimaryBeneficiary(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/30 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Primary %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={primaryBeneficiaryPercent}
                      onChange={e =>
                        setPrimaryBeneficiaryPercent(e.target.value)
                      }
                      placeholder="e.g. 100"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/30 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Contingent Beneficiary
                    </label>
                    <input
                      type="text"
                      value={contingentBeneficiary}
                      onChange={e => setContingentBeneficiary(e.target.value)}
                      placeholder="e.g. James Doe"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/30 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Contingent %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={contingentBeneficiaryPercent}
                      onChange={e =>
                        setContingentBeneficiaryPercent(e.target.value)
                      }
                      placeholder="e.g. 100"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/30 transition"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview of what will be generated */}
        {firstName && lastName && (
          <div className="mt-6 bg-white/5 rounded-lg p-4 border border-white/5">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
              Preview
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-gray-500">Portal Login:</span>{" "}
                <span className="text-white font-semibold">
                  Last Name: {lastName}
                </span>
                <span className="text-gray-500 mx-2">+</span>
                <span className="text-[#c9a84c] font-semibold">
                  PIN: (auto-generated)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={onboard.isPending}
            className="flex items-center gap-2 px-6 py-3 bg-[#c9a84c] text-[#0a1628] font-bold rounded-lg hover:bg-[#d4b65c] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {onboard.isPending ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Creating...
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Onboard Client
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3 bg-white/5 text-gray-400 font-semibold rounded-lg hover:bg-white/10 hover:text-white transition border border-white/10"
          >
            Clear
          </button>
        </div>
      </form>
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
    return (
      getClientName(p.clientId).toLowerCase().includes(q) ||
      p.carrier.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q)
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
                      {getClientName(policy.clientId)}
                    </span>
                    <span className="text-[#c9a84c] text-sm font-['Lato']">
                      {policy.carrier}
                    </span>
                    <span className="text-gray-500 text-xs border border-white/10 rounded px-1.5 py-0.5 font-mono">
                      {policy.type}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${
                        policy.status === "active"
                          ? "bg-green-500/15 text-green-400 border-green-500/30"
                          : policy.status === "pending"
                            ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
                            : "bg-gray-500/15 text-gray-400 border-gray-500/30"
                      }`}
                    >
                      {policy.status}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs font-mono">
                    #{policy.policyNumber}
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
                      {policy.description ? (
                        <p className="text-gray-300 text-sm font-['Lato'] leading-relaxed bg-white/3 border border-white/8 rounded-lg px-3 py-2">
                          {policy.description}
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
