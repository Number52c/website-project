/**
 * SEO Landing Page: Annuities in Corpus Christi, TX
 * Target keywords: annuity agent Corpus Christi, fixed annuity Texas,
 * retirement income planning, FIA annuity broker
 */

import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import SEOPageLayout from "@/components/SEOPageLayout";
import { TrendingUp, Shield, DollarSign, Clock, CircleCheck as CheckCircle, ArrowRight } from "lucide-react";

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

const annuityTypes = [
  {
    name: "Fixed Annuities",
    desc: "Earn a guaranteed interest rate on your investment with zero market risk. Fixed annuities provide predictable, stable growth — ideal for conservative investors who want certainty in retirement.",
    ideal: "Conservative investors, guaranteed returns, capital preservation",
  },
  {
    name: "Fixed Index Annuities (FIAs)",
    desc: "Participate in market gains through index-linked crediting while protecting your principal from losses. FIAs offer the best of both worlds — growth potential with downside protection.",
    ideal: "Growth with protection, market-linked returns, no loss of principal",
  },
  {
    name: "Immediate Annuities (SPIAs)",
    desc: "Convert a lump sum into guaranteed monthly income that starts right away. Single Premium Immediate Annuities are perfect for retirees who need reliable income they can't outlive.",
    ideal: "Immediate retirement income, pension replacement, lifetime payments",
  },
  {
    name: "Deferred Income Annuities",
    desc: "Start funding now for guaranteed income that begins at a future date — such as when you retire. The longer you defer, the higher your monthly payments will be.",
    ideal: "Future retirement planning, higher payouts, tax-deferred growth",
  },
];

const benefits = [
  { icon: Shield, title: "Principal Protection", desc: "Your money is protected from market downturns. With fixed and indexed annuities, you'll never lose your principal investment — even when the stock market drops." },
  { icon: TrendingUp, title: "Tax-Deferred Growth", desc: "Your annuity grows tax-deferred, meaning you don't pay taxes on gains until you withdraw. This allows your money to compound faster than taxable investments." },
  { icon: DollarSign, title: "Guaranteed Lifetime Income", desc: "An annuity can provide income you can't outlive. Whether you live to 80 or 100, your payments continue — eliminating the fear of running out of money in retirement." },
  { icon: Clock, title: "Flexible Payout Options", desc: "Choose from lump sum withdrawals, systematic payments, lifetime income, or joint-life options that continue paying your spouse after you pass." },
];

const faqs = [
  {
    question: "What is an annuity and how does it work?",
    answer: "An annuity is a financial product issued by an insurance company that converts your savings into guaranteed income. You make a payment (or series of payments) to the insurance company, and in return, they promise to pay you a regular income — either immediately or at a future date. Annuities are commonly used for retirement planning because they provide income you can't outlive.",
  },
  {
    question: "What is a Fixed Index Annuity (FIA)?",
    answer: "A Fixed Index Annuity (FIA) is a type of annuity that earns interest based on the performance of a market index (like the S&P 500) while protecting your principal from losses. If the index goes up, you earn a portion of the gains (subject to a cap or participation rate). If the index goes down, your account value stays the same — you never lose money. FIAs are popular among retirees who want growth potential without market risk.",
  },
  {
    question: "Are annuities a good investment for retirement?",
    answer: "Annuities can be an excellent part of a retirement strategy, especially for people who want guaranteed income, tax-deferred growth, and protection from market volatility. They're particularly valuable if you're concerned about outliving your savings, want to supplement Social Security or pension income, or need a safe place to grow money without market risk. As your Corpus Christi annuity broker, we'll help you determine if an annuity fits your overall retirement plan.",
  },
  {
    question: "How much money do I need to start an annuity?",
    answer: "Minimum investments vary by carrier and product type. Some fixed annuities accept as little as $5,000, while others may require $10,000-$25,000. Fixed Index Annuities typically start at $10,000-$25,000. We work with multiple carriers to find options that match your budget and financial goals.",
  },
  {
    question: "What's the difference between an annuity and a 401(k)?",
    answer: "A 401(k) is an employer-sponsored retirement account where your investments are subject to market risk — your balance can go up or down. An annuity is an insurance product that can guarantee your principal and provide guaranteed lifetime income. Many retirees roll over their 401(k) into an annuity when they retire to convert their savings into predictable, guaranteed income. The two products serve different purposes and can complement each other in a retirement plan.",
  },
  {
    question: "Why should I work with a local annuity broker in Corpus Christi?",
    answer: "Annuities are complex financial products with many variations. A local broker like Ortiz Insurance provides face-to-face consultations to explain your options clearly, compares products from multiple carriers to find the best rates, and provides ongoing service throughout the life of your annuity. Unlike online platforms, we're here in Corpus Christi whenever you need us — for questions, withdrawals, or beneficiary changes.",
  },
];

export default function Annuities() {
  const typesSection = useInView();
  const benefitsSection = useInView();

  return (
    <SEOPageLayout
      title="Annuities in Corpus Christi, TX | Fixed & Indexed Annuity Broker"
      description="Find the best annuity rates in Corpus Christi, Texas. Fixed annuities, FIAs, and retirement income planning from a trusted local broker. Free consultation — call (361) 613-8336."
      canonicalPath="/annuities-corpus-christi"
      keywords="annuities Corpus Christi TX, fixed annuity broker Texas, FIA annuity agent, retirement income planning South Texas, fixed index annuity near me, annuity rates Corpus Christi"
      heroLabel="Annuities & Retirement Income in Corpus Christi"
      heroHeading="Grow & Protect Your Retirement Savings With Annuities"
      heroSubheading="Looking for guaranteed retirement income with zero market risk? As an independent annuity broker in Corpus Christi, we compare rates from top-rated carriers to find you the highest returns with the strongest guarantees."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Services", href: "/services" },
        { label: "Annuities in Corpus Christi" },
      ]}
      faqs={faqs}
    >
      {/* ── BENEFITS ── */}
      <section className="py-20 bg-[#F5F0E8]" ref={benefitsSection.ref}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Why Choose Annuities</p>
            <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-[#0D1B3E]">
              Secure Your Retirement <span className="italic text-[#C9A84C]">With Confidence</span>
            </h2>
            <div className="gold-rule w-24 mx-auto mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((b, i) => (
              <div
                key={b.title}
                className={`bg-white border border-[#E8E0D0] p-8 rounded-sm hover:shadow-lg hover:border-[#C9A84C]/40 transition-all duration-500 ${benefitsSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-sm bg-[#0D1B3E] flex items-center justify-center mb-5">
                  <b.icon size={22} className="text-[#C9A84C]" />
                </div>
                <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#0D1B3E] mb-3">{b.title}</h3>
                <p className="text-[#5A5A5A] text-sm leading-relaxed font-['Lato']">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ANNUITY TYPES ── */}
      <section className="py-20 bg-white" ref={typesSection.ref}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Our Annuity Products</p>
            <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-[#0D1B3E]">
              Types of Annuities <span className="italic text-[#C9A84C]">We Offer</span>
            </h2>
            <div className="gold-rule w-24 mx-auto mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {annuityTypes.map((at, i) => (
              <div
                key={at.name}
                className={`bg-[#F5F0E8] border border-[#E8E0D0] p-8 rounded-sm transition-all duration-500 hover:shadow-lg ${typesSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#0D1B3E] mb-3">{at.name}</h3>
                <p className="text-[#5A5A5A] text-sm leading-relaxed font-['Lato'] mb-4">{at.desc}</p>
                <div className="flex items-center gap-2 text-xs text-[#0D1B3E]/70 font-['Lato']">
                  <CheckCircle size={14} className="text-[#C9A84C]" />
                  <span className="font-semibold">Ideal for:</span> {at.ideal}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST SIGNALS ── */}
      <section className="py-16 bg-[#0D1B3E]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "15+", label: "Years Experience" },
              { value: "20+", label: "Carrier Partners" },
              { value: "$0", label: "Consultation Fee" },
              { value: "A+", label: "Rated Carriers" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-[#C9A84C]">{s.value}</div>
                <div className="text-white/60 text-xs tracking-widest uppercase font-['Lato'] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOCAL CONTENT ── */}
      <section className="py-20 bg-[#F5F0E8]">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-['Playfair_Display'] text-3xl font-bold text-[#0D1B3E] mb-6">
            Your Trusted Annuity Broker in <span className="text-[#C9A84C]">Corpus Christi, Texas</span>
          </h2>
          <div className="gold-rule w-16 mb-8" />

          <div className="prose prose-lg max-w-none text-[#5A5A5A] font-['Lato'] leading-relaxed space-y-5">
            <p>
              Planning for retirement is one of the most important financial decisions you'll ever make. At Ortiz Insurance Broker, we help families and individuals across Corpus Christi, Portland, Kingsville, Alice, and the entire Coastal Bend region build secure retirement income strategies using annuities from top-rated insurance carriers.
            </p>
            <p>
              As an independent broker, we're not tied to any single company. We compare annuity rates and products from carriers like National Life Group, Athene, North American, Allianz, and many more to find you the highest guaranteed rates with the strongest financial backing. Whether you're looking to roll over a 401(k), create a pension-like income stream, or simply grow your savings safely, we have solutions tailored to your goals.
            </p>
            <p>
              We specialize in Fixed Index Annuities (FIAs) — products that let you participate in market gains while protecting your principal from losses. FIAs have become one of the most popular retirement vehicles in America, and for good reason: they offer growth potential, tax-deferred accumulation, and guaranteed lifetime income options.
            </p>
            <p>
              <strong>Schedule your free retirement consultation today.</strong> Call <a href="tel:3616138336" className="text-[#C9A84C] font-semibold hover:underline">(361) 613-8336</a> or <Link href="/quote" className="text-[#C9A84C] font-semibold hover:underline">request a free quote online</Link>. Let's build a retirement income plan you can count on.
            </p>
          </div>
        </div>
      </section>
    </SEOPageLayout>
  );
}
