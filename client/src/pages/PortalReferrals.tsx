/*
   PREMIUM REFERRAL REWARDS DASHBOARD
   Gamified referral program with rewards tracking, tier progression, and leaderboard
   ============================================================= */

import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Copy, Award, TrendingUp, Users, Zap, Gift, Target, Lock, Clock as Unlock, ChevronRight, Check, Star, Trophy, DollarSign, Calendar, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

// Mock data - replace with API call
const mockReferralData = {
  clientId: 1,
  referralCode: "ERIC-ORTIZ-2024",
  tier: "gold",
  totalReferrals: 8,
  totalConversions: 3,
  totalCommissions: 4500,
  availableReward: 1200,
  redeemableReward: 3300,
  referrals: [
    {
      id: 1,
      name: "John Smith",
      email: "john@example.com",
      phone: "555-0101",
      status: "converted",
      convertedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      commission: 1500,
      bonus: 300,
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "555-0102",
      status: "quoted",
      convertedAt: null,
      commission: 0,
      bonus: 0,
    },
    {
      id: 3,
      name: "Michael Chen",
      email: "michael@example.com",
      phone: "555-0103",
      status: "converted",
      convertedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      commission: 1500,
      bonus: 300,
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily@example.com",
      phone: "555-0104",
      status: "pending",
      convertedAt: null,
      commission: 0,
      bonus: 0,
    },
  ],
};

const tiers = [
  {
    name: "Bronze",
    minReferrals: 0,
    icon: "🥉",
    color: "from-amber-600 to-amber-700",
    benefits: ["5% commission", "Email support", "Monthly newsletter"],
    unlocked: true,
  },
  {
    name: "Silver",
    minReferrals: 3,
    icon: "🥈",
    color: "from-slate-400 to-slate-500",
    benefits: ["7% commission", "Priority support", "Quarterly bonus"],
    unlocked: true,
  },
  {
    name: "Gold",
    minReferrals: 5,
    icon: "🥇",
    color: "from-yellow-400 to-yellow-500",
    benefits: ["10% commission", "VIP support", "Exclusive perks"],
    unlocked: true,
  },
  {
    name: "Platinum",
    minReferrals: 10,
    icon: "💎",
    color: "from-purple-400 to-purple-500",
    benefits: ["15% commission", "Dedicated manager", "Annual trip"],
    unlocked: false,
  },
];

export default function PortalReferrals() {
  const [copied, setCopied] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const copyReferralLink = () => {
    const link = `${window.location.origin}?ref=${mockReferralData.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Invitation sent to ${inviteData.email}!`);
    setInviteData({ name: "", email: "", phone: "", message: "" });
    setShowInviteForm(false);
  };

  const currentTier = tiers.find((t) => t.name.toLowerCase() === mockReferralData.tier);
  const nextTier = tiers[tiers.indexOf(currentTier!) + 1];
  const referralsToNextTier = nextTier
    ? nextTier.minReferrals - mockReferralData.totalConversions
    : 0;

  return (
    <div className="space-y-8">
      {/* ── TIER BADGE & PROGRESS ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#0D1B3E] to-[#1a2f5a] rounded-xl p-8 text-white relative overflow-hidden card-luxury"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#C9A84C]/10 rounded-full blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Current Tier */}
          <div className="flex items-center gap-6">
            <div className="text-6xl">{currentTier?.icon}</div>
            <div>
              <p className="text-white/70 text-sm font-['Lato']">Current Tier</p>
              <h3 className="font-['Playfair_Display'] text-3xl font-bold">
                {currentTier?.name}
              </h3>
              <p className="text-[#C9A84C] text-sm font-semibold mt-1">
                {currentTier?.benefits[0]}
              </p>
            </div>
          </div>

          {/* Progress to Next Tier */}
          {nextTier && (
            <div>
              <p className="text-white/70 text-sm font-['Lato'] mb-3">
                Progress to {nextTier.name}
              </p>
              <div className="space-y-2">
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#C9A84C] to-[#D4AF37]"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(mockReferralData.totalConversions / nextTier.minReferrals) * 100}%`,
                    }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <p className="text-sm text-white/70 font-['Lato']">
                  {mockReferralData.totalConversions} of {nextTier.minReferrals} conversions
                </p>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-4 border border-white/20">
              <p className="text-white/70 text-xs font-['Lato']">Total Referrals</p>
              <p className="text-2xl font-bold text-[#C9A84C]">
                {mockReferralData.totalReferrals}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 border border-white/20">
              <p className="text-white/70 text-xs font-['Lato']">Conversions</p>
              <p className="text-2xl font-bold text-[#C9A84C]">
                {mockReferralData.totalConversions}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── REFERRAL LINK & SHARING ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-[#E8E0D0] p-8 card-luxury"
      >
        <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#0D1B3E] mb-6">
          Share Your Referral Link
        </h2>

        <div className="space-y-6">
          {/* Referral Link */}
          <div>
            <label className="block text-sm font-semibold text-[#0D1B3E] mb-3">
              Your Personal Referral Link
            </label>
            <div className="flex gap-3">
              <div className="flex-1 bg-[#F5F0E8] border border-[#E8E0D0] rounded-lg px-4 py-3 font-['Lato'] text-[#0D1B3E] break-all">
                {`${window.location.origin}?ref=${mockReferralData.referralCode}`}
              </div>
              <button
                onClick={copyReferralLink}
                className="px-6 py-3 bg-[#C9A84C] text-[#0D1B3E] rounded-lg font-semibold hover:bg-[#B8941E] transition-all duration-300 flex items-center gap-2 btn-gold"
              >
                <Copy size={18} />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Share Methods */}
          <div>
            <p className="text-sm text-[#6B6B6B] font-['Lato'] mb-4">
              Share via your preferred method:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Mail, label: "Email", color: "bg-blue-100 text-blue-600" },
                { icon: Phone, label: "Text", color: "bg-green-100 text-green-600" },
                { icon: Share2, label: "Social", color: "bg-purple-100 text-purple-600" },
                { icon: Users, label: "Direct", color: "bg-orange-100 text-orange-600" },
              ].map((method) => (
                <button
                  key={method.label}
                  className={`p-4 rounded-lg border border-[#E8E0D0] flex flex-col items-center gap-2 hover:border-[#C9A84C] transition-all duration-300`}
                >
                  <div className={`p-2 rounded-lg ${method.color}`}>
                    <method.icon size={20} />
                  </div>
                  <span className="text-xs font-semibold text-[#0D1B3E]">
                    {method.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Invite Form */}
          {!showInviteForm ? (
            <button
              onClick={() => setShowInviteForm(true)}
              className="w-full py-3 border-2 border-[#C9A84C] text-[#C9A84C] rounded-lg font-semibold hover:bg-[#C9A84C]/5 transition-all duration-300"
            >
              + Invite Someone Directly
            </button>
          ) : (
            <form onSubmit={handleInvite} className="space-y-4 pt-4 border-t border-[#E8E0D0]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={inviteData.name}
                  onChange={(e) =>
                    setInviteData({ ...inviteData, name: e.target.value })
                  }
                  className="border border-[#E8E0D0] rounded-lg px-4 py-3 text-[#0D1B3E] focus:outline-none focus:border-[#C9A84C] form-input-premium"
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={inviteData.email}
                  onChange={(e) =>
                    setInviteData({ ...inviteData, email: e.target.value })
                  }
                  className="border border-[#E8E0D0] rounded-lg px-4 py-3 text-[#0D1B3E] focus:outline-none focus:border-[#C9A84C] form-input-premium"
                  required
                />
              </div>
              <textarea
                placeholder="Personal message (optional)"
                value={inviteData.message}
                onChange={(e) =>
                  setInviteData({ ...inviteData, message: e.target.value })
                }
                className="w-full border border-[#E8E0D0] rounded-lg px-4 py-3 text-[#0D1B3E] focus:outline-none focus:border-[#C9A84C] form-input-premium"
                rows={3}
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#C9A84C] text-[#0D1B3E] rounded-lg font-semibold hover:bg-[#B8941E] transition-all duration-300 btn-gold"
                >
                  Send Invitation
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteForm(false)}
                  className="flex-1 py-3 border border-[#0D1B3E] text-[#0D1B3E] rounded-lg font-semibold hover:bg-[#0D1B3E]/5 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>

      {/* ── REWARDS & EARNINGS ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          {
            icon: DollarSign,
            label: "Total Commissions",
            value: `$${mockReferralData.totalCommissions}`,
            color: "from-emerald-500/20 to-emerald-600/20 border-emerald-500/30",
          },
          {
            icon: Gift,
            label: "Available Rewards",
            value: `$${mockReferralData.availableReward}`,
            color: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
          },
          {
            icon: Trophy,
            label: "Redeemable Balance",
            value: `$${mockReferralData.redeemableReward}`,
            color: "from-purple-500/20 to-purple-600/20 border-purple-500/30",
          },
        ].map((item, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br ${item.color} rounded-lg border p-6 card-luxury`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#6B6B6B] text-sm font-['Lato'] mb-2">
                  {item.label}
                </p>
                <p className="font-['Playfair_Display'] text-3xl font-bold text-[#0D1B3E]">
                  {item.value}
                </p>
              </div>
              <item.icon size={32} className="text-[#C9A84C] opacity-50" />
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── TIER BENEFITS ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl border border-[#E8E0D0] p-8 card-luxury"
      >
        <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#0D1B3E] mb-6">
          Tier Benefits & Progression
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {tiers.map((tier, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className={`rounded-lg border-2 p-6 transition-all duration-300 ${
                tier.unlocked
                  ? "border-[#C9A84C] bg-gradient-to-br from-[#C9A84C]/10 to-transparent"
                  : "border-[#E8E0D0] bg-[#F5F0E8]/50 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">{tier.icon}</span>
                {tier.unlocked && (
                  <Unlock size={20} className="text-[#C9A84C]" />
                )}
                {!tier.unlocked && (
                  <Lock size={20} className="text-[#B0A898]" />
                )}
              </div>

              <h3 className="font-['Playfair_Display'] font-bold text-[#0D1B3E] mb-3">
                {tier.name}
              </h3>

              <p className="text-xs text-[#6B6B6B] font-['Lato'] mb-4">
                {tier.minReferrals}+ conversions
              </p>

              <ul className="space-y-2">
                {tier.benefits.map((benefit, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-2 text-sm text-[#0D1B3E] font-['Lato']"
                  >
                    <Check
                      size={16}
                      className="text-[#C9A84C] mt-0.5 shrink-0"
                    />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── REFERRAL HISTORY ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl border border-[#E8E0D0] p-8 card-luxury"
      >
        <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#0D1B3E] mb-6">
          Your Referrals
        </h2>

        <div className="space-y-3">
          {mockReferralData.referrals.map((ref, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.05 }}
              className="flex items-center justify-between p-4 bg-[#F5F0E8] rounded-lg border border-[#E8E0D0] hover:border-[#C9A84C] transition-all duration-300"
            >
              <div className="flex-1">
                <p className="font-semibold text-[#0D1B3E]">{ref.name}</p>
                <p className="text-xs text-[#6B6B6B] font-['Lato']">
                  {ref.email} • {ref.phone}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-[#6B6B6B] font-['Lato']">Status</p>
                  <p className="font-semibold text-[#0D1B3E] capitalize">
                    {ref.status}
                  </p>
                </div>

                {ref.status === "converted" && (
                  <div className="text-right">
                    <p className="text-xs text-[#6B6B6B] font-['Lato']">Earned</p>
                    <p className="font-semibold text-[#C9A84C]">
                      ${ref.commission + ref.bonus}
                    </p>
                  </div>
                )}

                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    ref.status === "converted"
                      ? "bg-emerald-100 text-emerald-700"
                      : ref.status === "quoted"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {ref.status === "converted" && "✓ Converted"}
                  {ref.status === "quoted" && "📋 Quoted"}
                  {ref.status === "pending" && "⏳ Pending"}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
