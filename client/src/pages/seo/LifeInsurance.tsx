/**
 * SEO Landing Page: Life Insurance in Corpus Christi, TX
 * Target keywords: life insurance Corpus Christi, life insurance agent near me,
 * life insurance broker South Texas, affordable life insurance Texas
 */

import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import SEOPageLayout from "@/components/SEOPageLayout";
import { Shield, Heart, Users, DollarSign, CircleCheck as CheckCircle, ArrowRight } from "lucide-react";

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
  { icon: Heart, title: "Protect Your Family", desc: "Ensure your loved ones are financially secure if something happens to you. Life insurance provides a tax-free death benefit to cover mortgage payments, education costs, and daily living expenses." },
  { icon: DollarSign, title: "Affordable Premiums", desc: "Life insurance is more affordable than most people think. A healthy 30-year-old can get $500,000 in term coverage for as little as $25/month. We'll find the best rates from top-rated carriers." },
  { icon: Shield, title: "Multiple Coverage Options", desc: "From term life to whole life, universal life, and final expense — we offer every type of life insurance to match your specific needs, budget, and long-term financial goals." },
  { icon: Users, title: "Local & Personal Service", desc: "As a Corpus Christi-based insurance broker, you work directly with Eric Ortiz — not a call center. We take the time to understand your family's unique situation and recommend the right coverage." },
];

const policyTypes = [
  {
    name: "Term Life Insurance",
    desc: "Affordable coverage for a specific period (10, 20, or 30 years). Ideal for young families, mortgage protection, and income replacement.",
    ideal: "Young families, homeowners, income earners",
    link: "/term-life-insurance",
  },
  {
    name: "Whole Life Insurance",
    desc: "Permanent coverage that builds cash value over time. Your premiums never increase and your coverage never expires.",
    ideal: "Long-term planning, estate preservation, cash value growth",
    link: "/whole-life-insurance",
  },
  {
    name: "Final Expense Insurance",
    desc: "Affordable whole life policies designed to cover funeral costs, medical bills, and end-of-life expenses. No medical exam required for most plans.",
    ideal: "Seniors 50-85, simplified underwriting, burial costs",
    link: "/final-expense-insurance",
  },
  {
    name: "Graded Whole Life Insurance",
    desc: "Coverage for individuals with health conditions who may not qualify for traditional policies. Benefits increase over the first 2-3 years.",
    ideal: "Pre-existing conditions, guaranteed acceptance",
    link: "/services",
  },
];

const faqs = [
  {
    question: "How much life insurance do I need?",
    answer: "A common rule of thumb is 10-12 times your annual income, but the right amount depends on your specific situation — including your mortgage balance, number of dependents, outstanding debts, and future education costs. As your Corpus Christi life insurance broker, we'll help you calculate the exact coverage amount your family needs during a free consultation.",
  },
  {
    question: "What's the difference between term and whole life insurance?",
    answer: "Term life insurance provides coverage for a specific period (10, 20, or 30 years) at lower premiums, making it ideal for temporary needs like mortgage protection. Whole life insurance provides permanent, lifelong coverage and builds cash value over time. Many families benefit from a combination of both. We'll help you determine which type — or combination — best fits your budget and goals.",
  },
  {
    question: "Can I get life insurance with pre-existing conditions?",
    answer: "Yes! Many of our carriers offer coverage for individuals with diabetes, heart conditions, cancer history, and other pre-existing conditions. Options include graded whole life policies and guaranteed issue plans that don't require a medical exam. As an independent broker, we work with multiple carriers to find the best option for your health situation.",
  },
  {
    question: "How much does life insurance cost in Texas?",
    answer: "Life insurance costs vary based on your age, health, coverage amount, and policy type. A healthy 30-year-old can get a $500,000 term policy for $20-30/month. A 50-year-old might pay $80-150/month for similar coverage. Final expense policies for seniors typically range from $30-100/month. We provide free, no-obligation quotes so you can see exact pricing for your situation.",
  },
  {
    question: "Why should I use a local insurance broker in Corpus Christi instead of buying online?",
    answer: "An independent broker like Ortiz Insurance compares rates from dozens of top-rated carriers — something online tools can't do effectively. We provide personalized advice based on your family's unique needs, help you navigate the application process, and are here to assist with claims when you need us most. Plus, our local Corpus Christi office means you can meet face-to-face anytime.",
  },
  {
    question: "How long does it take to get a life insurance policy?",
    answer: "Many of our policies can be issued within 24-48 hours, especially simplified issue and final expense policies that don't require a medical exam. Traditional fully-underwritten policies typically take 2-4 weeks. We'll guide you through every step to make the process as fast and simple as possible.",
  },
];

export default function LifeInsurance() {
  const typesSection = useInView();
  const benefitsSection = useInView();

  return (
    <SEOPageLayout
      title="Life Insurance in Corpus Christi, TX | Ortiz Insurance Broker"
      description="Find affordable life insurance in Corpus Christi, Texas. Term life, whole life, and final expense coverage from a trusted local broker. Free quotes — call (361) 613-8336."
      canonicalPath="/life-insurance-corpus-christi"
      keywords="life insurance Corpus Christi, life insurance agent Corpus Christi TX, life insurance broker South Texas, affordable life insurance Texas, term life insurance Corpus Christi, whole life insurance near me"
      heroLabel="Life Insurance in Corpus Christi, TX"
      heroHeading="Affordable Life Insurance to Protect Your Family's Future"
      heroSubheading="As an independent life insurance broker in Corpus Christi, we compare rates from top-rated carriers to find you the best coverage at the lowest price. No pressure, no hidden fees — just honest advice from a local agent who cares."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Services", href: "/services" },
        { label: "Life Insurance in Corpus Christi" },
      ]}
      faqs={faqs}
    >
      {/* ── WHY LIFE INSURANCE ── */}
      <section className="py-20 bg-[#F5F0E8]" ref={benefitsSection.ref}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Why Life Insurance Matters</p>
            <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-[#0D1B3E]">
              Protect What <span className="italic text-[#C9A84C]">Matters Most</span>
            </h2>
            <div className="gold-rule w-24 mx-auto mt-6" />
            <p className="text-[#5A5A5A] text-base mt-6 max-w-2xl mx-auto font-['Lato'] leading-relaxed">
              Life insurance is the foundation of any sound financial plan. It ensures your family can maintain their standard of living, pay off debts, and achieve their goals — even if you're no longer there to provide.
            </p>
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

      {/* ── POLICY TYPES ── */}
      <section className="py-20 bg-white" ref={typesSection.ref}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Coverage Options</p>
            <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-[#0D1B3E]">
              Types of Life Insurance <span className="italic text-[#C9A84C]">We Offer</span>
            </h2>
            <div className="gold-rule w-24 mx-auto mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {policyTypes.map((pt, i) => (
              <div
                key={pt.name}
                className={`bg-[#F5F0E8] border border-[#E8E0D0] p-8 rounded-sm transition-all duration-500 hover:shadow-lg ${typesSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#0D1B3E] mb-3">{pt.name}</h3>
                <p className="text-[#5A5A5A] text-sm leading-relaxed font-['Lato'] mb-4">{pt.desc}</p>
                <div className="flex items-center gap-2 text-xs text-[#0D1B3E]/70 font-['Lato'] mb-4">
                  <CheckCircle size={14} className="text-[#C9A84C]" />
                  <span className="font-semibold">Ideal for:</span> {pt.ideal}
                </div>
                <Link href={pt.link} className="inline-flex items-center gap-1.5 text-[#C9A84C] text-xs font-bold tracking-widest uppercase hover:gap-3 transition-all duration-300">
                  Learn More <ArrowRight size={14} />
                </Link>
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
              { value: "500+", label: "Families Protected" },
              { value: "15+", label: "Years Experience" },
              { value: "20+", label: "Insurance Carriers" },
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
            Your Trusted Life Insurance Broker in <span className="text-[#C9A84C]">Corpus Christi, Texas</span>
          </h2>
          <div className="gold-rule w-16 mb-8" />

          <div className="prose prose-lg max-w-none text-[#5A5A5A] font-['Lato'] leading-relaxed space-y-5">
            <p>
              Finding the right life insurance policy shouldn't be complicated or stressful. At Ortiz Insurance Broker, we've been helping families across Corpus Christi, Portland, Robstown, Kingsville, and the entire Coastal Bend region protect their loved ones with affordable, comprehensive life insurance coverage for over 15 years.
            </p>
            <p>
              As an independent insurance broker, we're not tied to any single insurance company. This means we can shop your policy across more than 20 top-rated carriers — including Mutual of Omaha, Americo, AIG, Foresters, and National Life Group — to find you the best coverage at the most competitive price. Whether you need a simple term life policy to cover your mortgage or a permanent whole life plan to build cash value for retirement, we'll guide you through every option with honest, straightforward advice.
            </p>
            <p>
              We specialize in serving the unique needs of South Texas families, including coverage for individuals with pre-existing health conditions, seniors looking for final expense and burial insurance, and young parents who want to ensure their children's future is secure. Every consultation is free, and there's never any pressure to buy.
            </p>
            <p>
              <strong>Ready to protect your family?</strong> Call us at <a href="tel:3616138336" className="text-[#C9A84C] font-semibold hover:underline">(361) 613-8336</a> or <Link href="/quote" className="text-[#C9A84C] font-semibold hover:underline">request a free quote online</Link>. We're here to help — because your family's security is our promise.
            </p>
          </div>
        </div>
      </section>
    </SEOPageLayout>
  );
}
