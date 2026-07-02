/**
 * SEO Landing Page: Term Life Insurance
 * Target keywords: term life insurance, affordable term life,
 * 20 year term life insurance, cheap life insurance Texas
 */

import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import SEOPageLayout from "@/components/SEOPageLayout";
import { Shield, DollarSign, Clock, Users, CircleCheck as CheckCircle } from "lucide-react";

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

const termLengths = [
  { years: "10-Year Term", desc: "Ideal for short-term needs like covering a business loan, bridge coverage between policies, or supplementing existing coverage during high-expense years.", price: "From $15/mo" },
  { years: "20-Year Term", desc: "The most popular term length. Perfect for young families who need coverage while raising children, paying a mortgage, and building savings.", price: "From $22/mo" },
  { years: "30-Year Term", desc: "Maximum term coverage for long-term protection. Great for new homeowners with 30-year mortgages or parents who want coverage until their children are financially independent.", price: "From $30/mo" },
];

const benefits = [
  { icon: DollarSign, title: "Most Affordable Life Insurance", desc: "Term life offers the lowest premiums of any life insurance type. A healthy 30-year-old can get $500,000 in coverage for as little as $20-25/month — making it accessible for any budget." },
  { icon: Clock, title: "Simple & Straightforward", desc: "No cash value, no investment components, no complexity. Term life does one thing and does it well: it provides a large death benefit at the lowest possible cost for a set period of time." },
  { icon: Shield, title: "Convertible to Permanent Coverage", desc: "Most term policies include a conversion option that lets you convert to whole life insurance without a new medical exam. This gives you flexibility as your needs change over time." },
  { icon: Users, title: "Ideal for Young Families", desc: "If you have a mortgage, young children, or a spouse who depends on your income, term life insurance ensures they're protected during your highest-need years at a price you can afford today." },
];

const faqs = [
  {
    question: "What is term life insurance?",
    answer: "Term life insurance provides a death benefit for a specific period of time — typically 10, 20, or 30 years. If you pass away during the term, your beneficiaries receive the full death benefit tax-free. If you outlive the term, the policy expires with no payout. Term life is the simplest and most affordable type of life insurance, making it the most popular choice for young families and income earners.",
  },
  {
    question: "How much does term life insurance cost?",
    answer: "Term life insurance is very affordable. A healthy 30-year-old can get a $500,000 20-year term policy for approximately $20-30/month. A 40-year-old might pay $35-60/month for the same coverage. Rates depend on your age, health, gender, smoking status, and coverage amount. We compare rates from 20+ carriers to find you the absolute lowest premium available.",
  },
  {
    question: "How much term life insurance do I need?",
    answer: "A common guideline is 10-12 times your annual income, but the right amount depends on your specific obligations. Consider your mortgage balance, number of dependents, outstanding debts, future education costs, and your spouse's income. For example, a family with a $300,000 mortgage, two children, and $60,000 in annual expenses might need $750,000-$1,000,000 in coverage. We'll help you calculate the exact amount during your free consultation.",
  },
  {
    question: "What happens when my term life insurance expires?",
    answer: "When your term expires, you have several options: (1) Let the policy lapse if you no longer need coverage, (2) Renew the policy at a higher premium based on your current age, (3) Convert to a permanent whole life policy without a medical exam (if your policy has a conversion option), or (4) Apply for a new policy. We recommend reviewing your coverage needs before your term expires so we can help you plan the best next step.",
  },
  {
    question: "Can I get term life insurance without a medical exam?",
    answer: "Yes! Several of our carriers offer no-exam term life insurance with coverage up to $500,000. These simplified issue policies use health questions and data-driven underwriting instead of a medical exam, and many can be approved within 24-48 hours. While premiums may be slightly higher than fully-underwritten policies, the convenience and speed make them an excellent option for many applicants.",
  },
  {
    question: "Should I choose term or whole life insurance?",
    answer: "Term life is best if you need maximum coverage at the lowest cost for a specific period — like while raising children or paying a mortgage. Whole life is better for permanent needs like estate planning and cash value accumulation. Many financial experts recommend buying term life for your primary coverage needs and investing the premium savings, while adding a smaller whole life policy for permanent protection. We'll help you find the right balance for your situation.",
  },
];

export default function TermLifeInsurance() {
  const benefitsSection = useInView();
  const termsSection = useInView();

  return (
    <SEOPageLayout
      title="Term Life Insurance in Corpus Christi, TX | Affordable Coverage"
      description="Get affordable term life insurance in Corpus Christi, Texas. 10, 20, and 30-year terms from $15/month. Compare rates from 20+ carriers. Free quote — call (361) 613-8336."
      canonicalPath="/term-life-insurance"
      keywords="term life insurance Corpus Christi, affordable term life insurance Texas, 20 year term life insurance, cheap life insurance near me, term life insurance rates, no exam term life insurance"
      heroLabel="Term Life Insurance"
      heroHeading="Affordable Term Life Insurance Starting at $15/Month"
      heroSubheading="Protect your family with the most affordable life insurance available. We compare term life rates from 20+ top-rated carriers to find you maximum coverage at the lowest price — guaranteed."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Services", href: "/services" },
        { label: "Life Insurance", href: "/life-insurance-corpus-christi" },
        { label: "Term Life Insurance" },
      ]}
      faqs={faqs}
    >
      {/* ── BENEFITS ── */}
      <section className="py-20 bg-[#F5F0E8]" ref={benefitsSection.ref}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Why Term Life Insurance</p>
            <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-[#0D1B3E]">
              Maximum Protection, <span className="italic text-[#C9A84C]">Minimum Cost</span>
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

      {/* ── TERM LENGTHS ── */}
      <section className="py-20 bg-white" ref={termsSection.ref}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Choose Your Term</p>
            <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-[#0D1B3E]">
              Term Length <span className="italic text-[#C9A84C]">Options</span>
            </h2>
            <div className="gold-rule w-24 mx-auto mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {termLengths.map((t, i) => (
              <div
                key={t.years}
                className={`bg-[#F5F0E8] border border-[#E8E0D0] p-8 rounded-sm text-center transition-all duration-500 hover:shadow-lg hover:border-[#C9A84C]/40 ${termsSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <h3 className="font-['Playfair_Display'] text-2xl font-bold text-[#0D1B3E] mb-2">{t.years}</h3>
                <div className="text-[#C9A84C] font-['Lato'] font-bold text-lg mb-4">{t.price}</div>
                <p className="text-[#5A5A5A] text-sm leading-relaxed font-['Lato']">{t.desc}</p>
                <Link href="/quote" className="btn-gold px-8 py-3 rounded-sm text-xs font-bold tracking-widest uppercase inline-block mt-6">
                  Get Quote
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-[#5A5A5A] text-xs mt-6 font-['Lato']">
            *Rates shown are estimates for healthy non-smoking applicants. Actual rates depend on age, health, and coverage amount.
          </p>
        </div>
      </section>

      {/* ── TRUST SIGNALS ── */}
      <section className="py-16 bg-[#0D1B3E]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "$15", label: "Starting Monthly Rate" },
              { value: "20+", label: "Carriers Compared" },
              { value: "24hr", label: "Fast Approval" },
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
            Term Life Insurance in <span className="text-[#C9A84C]">Corpus Christi & South Texas</span>
          </h2>
          <div className="gold-rule w-16 mb-8" />

          <div className="prose prose-lg max-w-none text-[#5A5A5A] font-['Lato'] leading-relaxed space-y-5">
            <p>
              Term life insurance is the most popular and affordable way to protect your family's financial future. At Ortiz Insurance Broker, we help families across Corpus Christi, Portland, Robstown, Kingsville, and the entire Coastal Bend region find the best term life rates from top-rated carriers.
            </p>
            <p>
              As an independent broker, we compare term life policies from carriers like Protective, Banner Life, North American, Pacific Life, and many more. This means you get the lowest available rate for your age and health — not just the rate from one company. Whether you need a simple 20-year term to cover your mortgage or a larger policy to replace your income, we'll find the right fit.
            </p>
            <p>
              <strong>Get your free term life quote today.</strong> Call <a href="tel:3616138336" className="text-[#C9A84C] font-semibold hover:underline">(361) 613-8336</a> or <Link href="/quote" className="text-[#C9A84C] font-semibold hover:underline">request a quote online</Link>. Most quotes are ready in minutes.
            </p>
          </div>
        </div>
      </section>
    </SEOPageLayout>
  );
}
