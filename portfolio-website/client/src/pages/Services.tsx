/* =============================================================
   SERVICES PAGE — Ortiz Insurance
   Design: Heraldic Prestige — Navy + Gold + Corpus Christi imagery
   ============================================================= */

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { useSEO } from "@/hooks/useSEO";
import { Shield, Heart, Building2, TrendingUp, GraduationCap, CircleCheck as CheckCircle2, Phone, ArrowRight } from "lucide-react";

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

const services = [
  {
    icon: Heart,
    title: "Life Insurance",
    tagline: "Secure Your Family's Future",
    desc: "Life insurance is the cornerstone of sound financial planning. At Ortiz Insurance, we offer term life, whole life, and universal life policies designed to provide your loved ones with financial stability in the event of the unexpected. We take the time to understand your family's unique situation and recommend coverage that fits your budget and long-term goals.",
    bullets: [
      "Term Life Insurance",
      "Whole Life Insurance",
      "Universal Life Insurance",
      "Final Expense Coverage",
    ],
  },
  {
    icon: Shield,
    title: "Health Insurance",
    tagline: "Coverage That Keeps You Healthy",
    desc: "Navigating health insurance can be overwhelming — but it doesn't have to be. We help individuals, families, and small business owners in Corpus Christi find affordable, comprehensive health plans that cover what matters most. From ACA marketplace plans to group health solutions, we'll guide you every step of the way.",
    bullets: [
      "Individual & Family Plans",
      "ACA Marketplace Coverage",
      "Group Health for Businesses",
      "Supplemental Health Plans",
    ],
  },
  {
    icon: Building2,
    title: "Commercial Property & Casualty",
    tagline: "Protect Your Business Assets",
    desc: "Your business represents years of hard work. Our commercial property and casualty coverage protects your physical assets, operations, and liability exposure. Whether you own a small retail shop, a professional office, or a larger commercial enterprise in South Texas, we'll craft a policy that keeps your business protected.",
    bullets: [
      "Commercial Property Insurance",
      "General Liability Coverage",
      "Business Owner's Policies (BOP)",
      "Workers' Compensation",
    ],
  },
  {
    icon: TrendingUp,
    title: "FIAs & Annuities",
    tagline: "Grow & Protect Your Retirement Savings",
    desc: "Fixed Indexed Annuities (FIAs) offer a powerful way to grow your retirement savings while protecting against market downturns. We help clients in Corpus Christi understand their annuity options, structure income strategies, and build a retirement plan that provides guaranteed income for life — without the risk of losing principal.",
    bullets: [
      "Fixed Indexed Annuities (FIAs)",
      "Multi-Year Guaranteed Annuities",
      "Income Rider Strategies",
      "Retirement Income Planning",
    ],
  },
  {
    icon: GraduationCap,
    title: "Pension Planning",
    tagline: "A Secure Retirement Starts Today",
    desc: "We specialize in pension planning for educators, public employees, and professionals throughout South Texas. Whether you're just starting your career or approaching retirement, we'll help you maximize your pension benefits, coordinate with Social Security, and build supplemental retirement income to ensure you live comfortably in your golden years.",
    bullets: [
      "Teacher Retirement System (TRS) Guidance",
      "Public Employee Pension Strategies",
      "Supplemental Retirement Income",
      "Social Security Coordination",
    ],
  },
];

export default function Services() {
  useSEO({
    title:
      "Insurance Services | Life, Health, Commercial & Annuities | Ortiz Insurance",
    description:
      "Comprehensive insurance services in Corpus Christi, TX. Life insurance, health insurance, commercial property & casualty, annuities, and pension planning. Free consultation.",
    canonicalPath: "/services",
    keywords:
      "insurance services Corpus Christi, life insurance agent, health insurance broker Texas, commercial insurance, annuities, pension planning",
  });

  const sectionRefs = services.map(() => useInView(0.08));
  const cta = useInView();

  return (
    <div className="min-h-screen bg-[#F5F0E8] pt-20">
      <Navbar />

      {/* ── PAGE HERO ── */}
      <section
        className="relative pt-40 pb-28 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(5, 12, 28, 0.25), rgba(5, 12, 28, 0.30)), url('/manus-storage/hooks-bg-optimized_3615c91a.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D1B3E]/45 via-[#0D1B3E]/35 to-[#0D1B3E]/50" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <p className="section-label text-[#C9A84C] mb-4">What We Offer</p>
          <h1 className="font-['Playfair_Display'] text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Our Services
          </h1>
          <div className="gold-rule w-20 mx-auto mb-8" />
          <p className="text-white/70 text-base sm:text-lg font-['Lato'] max-w-2xl mx-auto leading-relaxed">
            Comprehensive insurance and financial planning solutions for
            individuals, families, and businesses across Corpus Christi and South
            Texas.
          </p>
        </div>
      </section>

      {/* ── SERVICE SECTIONS ── */}
      <section className="py-24 bg-[#F5F0E8]">
        <div className="max-w-6xl mx-auto px-6 space-y-20">
          {services.map((svc, i) => {
            const isEven = i % 2 === 0;
            return (
              <div
                key={svc.title}
                ref={sectionRefs[i].ref}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden rounded-lg card-luxury transition-all duration-700 ${
                  sectionRefs[i].inView
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
              >
                {/* Accent sidebar — alternates left/right on desktop */}
                <div
                  className={`lg:col-span-3 bg-[#0D1B3E] flex flex-col items-center justify-center py-12 px-8 gap-5 ${
                    isEven ? "lg:order-1" : "lg:order-2"
                  }`}
                >
                  <div className="w-16 h-16 rounded-full border-2 border-[#C9A84C]/50 flex items-center justify-center">
                    <svc.icon size={28} className="text-[#C9A84C]" />
                  </div>
                  <div className="gold-rule w-10" />
                  <p className="text-[#C9A84C]/80 text-[0.65rem] tracking-[0.2em] uppercase font-bold text-center font-['Lato'] leading-relaxed">
                    {svc.tagline}
                  </p>
                  <span className="text-white/20 text-6xl font-['Playfair_Display'] font-bold leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Content panel */}
                <div
                  className={`lg:col-span-9 bg-white p-10 md:p-12 transition-all duration-400 hover:bg-[#FAFAF8] ${
                    isEven ? "lg:order-2" : "lg:order-1"
                  }`}
                >
                  <h2 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-bold text-[#0D1B3E] mb-5">
                    {svc.title}
                  </h2>
                  <p className="text-[#6B6B6B] leading-relaxed font-['Lato'] mb-8 text-[0.95rem]">
                    {svc.desc}
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    {svc.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-center gap-2.5 text-sm text-[#0D1B3E] font-['Lato']"
                      >
                        <CheckCircle2
                          size={16}
                          className="text-[#C9A84C] shrink-0"
                          strokeWidth={2.5}
                        />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/quote"
                    className="btn-gold px-8 py-3 rounded-sm text-xs font-bold tracking-widest uppercase inline-flex items-center gap-2 group"
                  >
                    Get A Quote
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA ── */}
      <div ref={cta.ref} className="bg-[#0D1B3E] py-24 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent" />
        <div
          className={`max-w-3xl mx-auto px-6 text-center transition-all duration-700 ${
            cta.inView
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <p className="section-label text-[#C9A84C] mb-4">Start Today</p>
          <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Not Sure Which Coverage
            <br />
            <span className="italic text-[#C9A84C]">Is Right For You?</span>
          </h2>
          <div className="gold-rule w-20 mx-auto mb-8" />
          <p className="text-white/60 font-['Lato'] mb-12 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Let&apos;s talk. Eric Ortiz will personally review your situation and
            recommend the right coverage — no pressure, no jargon.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm sm:max-w-none mx-auto">
            <Link
              href="/quote"
              className="btn-gold w-full sm:w-auto px-12 py-4 rounded-sm text-sm font-bold tracking-widest uppercase inline-flex items-center justify-center gap-2 group"
            >
              Request A Free Quote
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
            <a
              href="tel:3616138336"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-10 py-4 rounded-sm text-sm font-bold tracking-widest uppercase border-2 border-white/30 text-white hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all duration-300"
            >
              <Phone size={16} /> (361) 613-8336
            </a>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent" />
      </div>

      <Footer />
    </div>
  );
}
