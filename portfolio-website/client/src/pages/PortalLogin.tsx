/**
 * client/src/pages/PortalLogin.tsx
 * PIN-based client portal login page — premium luxury redesign.
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Shield, Lock, Eye, EyeOff, FileText, Clock, Phone, Loader as Loader2, Star, Award, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PortalLogin() {
  const [, navigate] = useLocation();
  const [lastName, setLastName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [showPin, setShowPin] = useState(false);

  const { data: portalUser, isLoading: checkingSession } = trpc.portal.me.useQuery(undefined, {
    retry: false,
  });

  const loginMutation = trpc.portal.login.useMutation({
    onSuccess: () => navigate("/portal"),
    onError: (err) => setError(err.message || "Invalid last name or PIN. Please try again."),
  });

  useEffect(() => {
    if (!checkingSession && portalUser) navigate("/portal");
  }, [checkingSession, portalUser, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!lastName.trim() || !pin.trim()) {
      setError("Please enter your last name and PIN.");
      return;
    }
    loginMutation.mutate({ lastName: lastName.trim(), pin: pin.trim() });
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen pt-20 flex flex-col" style={{ background: "linear-gradient(135deg, #060e1f 0%, #0a1628 40%, #0d1b3e 100%)" }}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#C9A84C] animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 flex flex-col" style={{ background: "linear-gradient(135deg, #060e1f 0%, #0a1628 40%, #0d1b3e 100%)" }}>
      <Navbar />

      {/* ── Hero Split Layout ── */}
      <section className="relative flex-1 flex items-stretch overflow-hidden pt-20">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#C9A84C]/4 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/4 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-6xl mx-auto w-full px-6 py-16 grid md:grid-cols-2 gap-12 items-center">

          {/* ── Left: Branding + Trust ── */}
          <div className="hidden md:flex flex-col justify-center">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-px bg-[#C9A84C]" />
              <span className="text-[#C9A84C] text-xs tracking-[0.35em] uppercase font-['Lato'] font-semibold">
                Secure Client Portal
              </span>
            </div>

            <h1 className="font-['Playfair_Display'] text-5xl font-bold text-white leading-tight mb-5">
              Your Insurance<br />
              <span className="text-[#C9A84C]">Portfolio,</span><br />
              At Your Fingertips.
            </h1>
            <p className="text-white/55 font-['Lato'] text-base leading-relaxed mb-10 max-w-md">
              Access your complete insurance portfolio 24/7. View coverage details,
              carrier contact information, policy dates, and more — all in one secure place.
            </p>

            {/* Trust pillars */}
            <div className="space-y-4">
              {[
                { icon: Shield, label: "Bank-Level Encryption", desc: "256-bit SSL protects every connection." },
                { icon: Award, label: "Licensed in 50+ States", desc: "Trusted by families across the country." },
                { icon: Star, label: "Personalized Service", desc: "One dedicated agent who knows your goals." },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-[#C9A84C]" />
                  </div>
                  <div>
                    <p className="text-white font-['Lato'] font-semibold text-sm">{item.label}</p>
                    <p className="text-white/45 font-['Lato'] text-xs">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Login Card ── */}
          <div className="flex flex-col justify-center">
            {/* Mobile eyebrow */}
            <div className="md:hidden flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-[#C9A84C]" />
              <span className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase font-['Lato'] font-semibold">
                Secure Client Portal
              </span>
            </div>

            {/* Mobile headline */}
            <h1 className="md:hidden font-['Playfair_Display'] text-3xl font-bold text-white mb-2">
              Client Portal
            </h1>
            <p className="md:hidden text-white/50 font-['Lato'] text-sm mb-8">
              Access your policy information securely.
            </p>

            {/* Card */}
            <div
              className="rounded-2xl border border-[#C9A84C]/20 p-8 shadow-2xl"
              style={{ background: "linear-gradient(145deg, rgba(13,27,62,0.95) 0%, rgba(10,22,40,0.98) 100%)" }}
            >
              {/* Card header */}
              <div className="flex items-center gap-3 mb-7">
                <div className="w-11 h-11 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/25 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[#C9A84C]" />
                </div>
                <div>
                  <h2 className="font-['Playfair_Display'] text-xl font-bold text-white">Sign In</h2>
                  <p className="text-white/40 text-xs font-['Lato']">Use the credentials provided by your agent</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 text-red-400 text-sm font-['Lato'] text-center">
                    {error}
                  </div>
                )}

                {/* Last Name */}
                <div>
                  <label className="block text-white/70 font-['Lato'] text-xs font-semibold tracking-widest uppercase mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your last name"
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white font-['Lato'] placeholder:text-white/25 focus:outline-none focus:border-[#C9A84C]/60 focus:ring-1 focus:ring-[#C9A84C]/30 transition-all"
                    autoComplete="family-name"
                  />
                </div>

                {/* PIN */}
                <div>
                  <label className="block text-white/70 font-['Lato'] text-xs font-semibold tracking-widest uppercase mb-2">
                    Secure PIN
                  </label>
                  <div className="relative">
                    <input
                      type={showPin ? "text" : "password"}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.toUpperCase().slice(0, 10))}
                      placeholder="Enter your PIN"
                      className="w-full px-4 py-3.5 pr-12 bg-white/5 border border-white/10 rounded-xl text-white font-['Lato'] placeholder:text-white/25 focus:outline-none focus:border-[#C9A84C]/60 focus:ring-1 focus:ring-[#C9A84C]/30 transition-all tracking-[0.3em]"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-[#C9A84C] transition-colors"
                    >
                      {showPin ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full btn-gold py-4 rounded-xl text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loginMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#0D1B3E] border-t-transparent rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <ChevronRight size={16} />
                      Access My Policies
                    </>
                  )}
                </button>
              </form>

              {/* Help footer */}
              <div className="mt-6 pt-5 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-['Lato']">
                <span className="text-white/35">PIN provided by your insurance agent.</span>
                <a href="tel:3616138336" className="text-[#C9A84C] hover:text-[#D4AF37] transition-colors font-semibold">
                  Need help? Call (361) 613-8336
                </a>
              </div>
            </div>

            {/* Security badge */}
            <div className="mt-5 flex items-center justify-center gap-2 text-white/25">
              <Lock size={11} />
              <span className="font-['Lato'] text-xs tracking-wide">256-bit encrypted connection</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Strip ── */}
      <section className="border-t border-white/8 bg-[#060e1f]/60">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "View Policies", desc: "See all your active and past insurance policies in one dashboard." },
              { icon: FileText, title: "Coverage Details", desc: "Review your coverage amounts, premiums, and carrier contact information." },
              { icon: Clock, title: "Policy Dates", desc: "Track effective dates, expiration dates, and renewal schedules." },
              { icon: Phone, title: "Need Help?", desc: "Contact us directly at (361) 613-8336 for any questions." },
            ].map((item, i) => (
              <div
                key={i}
                className="group bg-white/3 border border-white/8 rounded-2xl p-6 text-center hover:border-[#C9A84C]/30 hover:bg-white/5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#C9A84C]/8 border border-[#C9A84C]/15 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#C9A84C]/15 transition-colors">
                  <item.icon className="w-6 h-6 text-[#C9A84C]" />
                </div>
                <h3 className="font-['Playfair_Display'] text-base font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-white/50 text-sm font-['Lato'] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
