/**
 * SEO Landing Page: Whole Life Insurance
 * Target keywords: whole life insurance, permanent life insurance,
 * cash value life insurance, whole life vs term
 */

import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import SEOPageLayout from "@/components/SEOPageLayout";
import { Shield, TrendingUp, Heart, Lock, CircleCheck as CheckCircle } from "lucide-react";

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

const benefits = [
  { icon: Lock, title: "Lifetime Coverage That Never Expires", desc: "Unlike term insurance that expires after 10-30 years, whole life insurance covers you for your entire life. As long as you pay your premiums, your coverage is guaranteed — no matter how old you are or how your health changes." },
  { icon: TrendingUp, title: "Cash Value That Grows Tax-Deferred", desc: "A portion of every premium payment goes into a cash value account that grows at a guaranteed rate. Over time, this cash value can be borrowed against for emergencies, education, or retirement — all tax-advantaged." },
  { icon: Shield, title: "Guaranteed Level Premiums", desc: "Your premium is locked in from day one and never increases. A whole life policy purchased at age 35 will cost the same at age 75. This predictability makes budgeting easy and protects against inflation." },
  { icon: Heart, title: "Guaranteed Death Benefit", desc: "Your beneficiaries receive a guaranteed, tax-free death benefit regardless of when you pass. This provides certainty for estate planning, legacy building, and ensuring your family's financial security." },
];

const comparisonData = [
  { feature: "Coverage Duration", term: "10, 20, or 30 years", whole: "Lifetime (never expires)" },
  { feature: "Premium Cost", term: "Lower initial premiums", whole: "Higher but locked in forever" },
  { feature: "Cash Value", term: "No cash value", whole: "Builds cash value over time" },
  { feature: "Premium Changes", term: "Increases at renewal", whole: "Never increases" },
  { feature: "Best For", term: "Temporary needs, budget-conscious", whole: "Permanent protection, wealth building" },
];

const faqs = [
  {
    question: "What is whole life insurance?",
    answer: "Whole life insurance is a type of permanent life insurance that provides coverage for your entire lifetime, as long as premiums are paid. It includes a guaranteed death benefit, level premiums that never increase, and a cash value component that grows at a guaranteed rate. Whole life is considered one of the most stable and predictable forms of life insurance available.",
  },
  {
    question: "How does the cash value in whole life insurance work?",
    answer: "A portion of each premium payment goes into a cash value account that grows at a guaranteed interest rate set by the insurance company. This cash value grows tax-deferred and can be accessed through policy loans or withdrawals. Many policyholders use their cash value for emergencies, supplemental retirement income, or funding education expenses. The cash value is separate from the death benefit and belongs to the policyholder.",
  },
  {
    question: "Is whole life insurance worth it?",
    answer: "Whole life insurance is worth it for people who want permanent, lifelong coverage with guaranteed premiums and cash value growth. It's particularly valuable for estate planning, leaving a legacy, building tax-advantaged savings, and covering final expenses. While premiums are higher than term life, the guarantees and cash value component provide long-term value that term insurance cannot match. We'll help you determine if whole life fits your financial plan.",
  },
  {
    question: "Should I get term or whole life insurance?",
    answer: "The best choice depends on your needs and budget. Term life is ideal for temporary needs (like covering a mortgage or raising children) and offers lower premiums. Whole life is better for permanent needs (estate planning, legacy, lifelong coverage) and builds cash value. Many financial advisors recommend a combination: term coverage for your highest-need years plus a smaller whole life policy for permanent protection. We'll help you find the right balance.",
  },
  {
    question: "Can I get whole life insurance with health problems?",
    answer: "Yes. We offer several whole life products designed for individuals with health conditions. Simplified issue policies require only a few health questions (no medical exam), while guaranteed issue policies accept everyone ages 50-85 regardless of health. Graded benefit policies provide increasing coverage over the first 2-3 years. As an independent broker, we'll match you with the carrier that offers the best rates for your specific health situation.",
  },
  {
    question: "How much does whole life insurance cost?",
    answer: "Whole life insurance premiums depend on your age, health, gender, and coverage amount. As a general guide: a healthy 30-year-old might pay $200-400/month for $250,000 in coverage, while a 50-year-old might pay $400-800/month for the same amount. Final expense whole life policies (smaller coverage amounts) are much more affordable at $30-100/month. We provide free quotes from multiple carriers so you can compare exact pricing.",
  },
];

export default function WholeLifeInsurance() {
  const benefitsSection = useInView();
  const comparisonSection = useInView();

  return (
    <SEOPageLayout
      title="Whole Life Insurance in Corpus Christi, TX | Permanent Life Insurance"
      description="Whole life insurance with guaranteed coverage, cash value growth, and level premiums. Compare rates from top carriers with your Corpus Christi broker. Call (361) 613-8336."
      canonicalPath="/whole-life-insurance"
      keywords="whole life insurance Corpus Christi, permanent life insurance Texas, cash value life insurance, whole life vs term, whole life insurance rates, guaranteed whole life insurance"
      heroLabel="Whole Life Insurance"
      heroHeading="Permanent Life Insurance With Guaranteed Cash Value Growth"
      heroSubheading="Build lifelong protection and tax-advantaged savings with whole life insurance. As your independent Corpus Christi broker, we compare rates from 20+ carriers to find you the best permanent coverage."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Services", href: "/services" },
        { label: "Life Insurance", href: "/life-insurance-corpus-christi" },
        { label: "Whole Life Insurance" },
      ]}
      faqs={faqs}
    >
      {/* ── BENEFITS ── */}
      <section className="py-20 bg-[#F5F0E8]" ref={benefitsSection.ref}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Why Whole Life Insurance</p>
            <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-[#0D1B3E]">
              Coverage That Lasts <span className="italic text-[#C9A84C]">A Lifetime</span>
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

      {/* ── TERM vs WHOLE LIFE COMPARISON ── */}
      <section className="py-20 bg-white" ref={comparisonSection.ref}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Side-by-Side Comparison</p>
            <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-[#0D1B3E]">
              Term vs. Whole Life <span className="italic text-[#C9A84C]">Insurance</span>
            </h2>
            <div className="gold-rule w-24 mx-auto mt-6" />
          </div>

          <div className={`overflow-hidden rounded-sm border border-[#E8E0D0] transition-all duration-700 ${comparisonSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0D1B3E] text-white">
                  <th className="px-6 py-4 text-left font-['Playfair_Display'] font-semibold">Feature</th>
                  <th className="px-6 py-4 text-left font-['Playfair_Display'] font-semibold">Term Life</th>
                  <th className="px-6 py-4 text-left font-['Playfair_Display'] font-semibold text-[#C9A84C]">Whole Life</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? "bg-[#F5F0E8]" : "bg-white"}>
                    <td className="px-6 py-4 font-semibold text-[#0D1B3E] font-['Lato']">{row.feature}</td>
                    <td className="px-6 py-4 text-[#5A5A5A] font-['Lato']">{row.term}</td>
                    <td className="px-6 py-4 text-[#0D1B3E] font-['Lato'] font-semibold">{row.whole}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-center text-[#5A5A5A] text-sm mt-6 font-['Lato']">
            Not sure which is right for you? <Link href="/quote" className="text-[#C9A84C] font-semibold hover:underline">Get a free consultation</Link> and we'll help you decide.
          </p>
        </div>
      </section>

      {/* ── TRUST SIGNALS ── */}
      <section className="py-16 bg-[#0D1B3E]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Policies Written" },
              { value: "15+", label: "Years Experience" },
              { value: "20+", label: "Carrier Partners" },
              { value: "$0", label: "Consultation Fee" },
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
            Whole Life Insurance in <span className="text-[#C9A84C]">Corpus Christi & South Texas</span>
          </h2>
          <div className="gold-rule w-16 mb-8" />

          <div className="prose prose-lg max-w-none text-[#5A5A5A] font-['Lato'] leading-relaxed space-y-5">
            <p>
              Whole life insurance is the cornerstone of a comprehensive financial plan. At Ortiz Insurance Broker, we help families across Corpus Christi and South Texas build permanent protection that grows in value over time. Whether you're looking to protect your family, build cash value for retirement, or create a tax-efficient legacy, whole life insurance provides guarantees that no other financial product can match.
            </p>
            <p>
              As an independent broker, we work with carriers like Mutual of Omaha, National Life Group, Foresters Financial, and many more to compare whole life policies and find the best rates for your age and health. We also specialize in graded and guaranteed issue whole life policies for individuals who may have difficulty qualifying for traditional coverage due to health conditions.
            </p>
            <p>
              <strong>Ready to explore your options?</strong> Call <a href="tel:3616138336" className="text-[#C9A84C] font-semibold hover:underline">(361) 613-8336</a> or <Link href="/quote" className="text-[#C9A84C] font-semibold hover:underline">request a free quote online</Link> to get started.
            </p>
          </div>
        </div>
      </section>
    </SEOPageLayout>
  );
}
