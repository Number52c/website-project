/**
 * SEO Landing Page: Final Expense Insurance in Corpus Christi, TX
 * Target keywords: final expense insurance, burial insurance Corpus Christi,
 * funeral insurance seniors, affordable burial insurance Texas
 */

import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import SEOPageLayout from "@/components/SEOPageLayout";
import { Heart, Shield, DollarSign, Clock, CircleCheck as CheckCircle, Users } from "lucide-react";

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
  { icon: DollarSign, title: "Affordable Monthly Premiums", desc: "Final expense policies start as low as $30/month. Coverage amounts typically range from $5,000 to $50,000 — enough to cover funeral costs, outstanding medical bills, and other end-of-life expenses without burdening your family." },
  { icon: Shield, title: "No Medical Exam Required", desc: "Most of our final expense policies require no medical exam — just a few simple health questions. Even if you have pre-existing conditions like diabetes, COPD, or heart disease, we have guaranteed acceptance options available." },
  { icon: Clock, title: "Quick & Easy Approval", desc: "Many applications are approved the same day. Your coverage can be active within 24-48 hours, giving you and your family immediate peace of mind. The application process takes just 15-20 minutes." },
  { icon: Heart, title: "Your Family Won't Pay for Your Funeral", desc: "The average funeral in Texas costs $7,000-$12,000. Without insurance, that burden falls on your children and loved ones. Final expense insurance ensures your family can grieve without financial stress." },
];

const coverageDetails = [
  { label: "Coverage Amounts", value: "$5,000 – $50,000" },
  { label: "Age Range", value: "50 – 85 years old" },
  { label: "Monthly Premiums", value: "Starting at $30/month" },
  { label: "Medical Exam", value: "Not required" },
  { label: "Coverage Duration", value: "Lifetime (never expires)" },
  { label: "Premium Changes", value: "Locked in — never increases" },
];

const faqs = [
  {
    question: "What is final expense insurance?",
    answer: "Final expense insurance (also called burial insurance or funeral insurance) is a type of whole life insurance designed to cover end-of-life costs. These policies typically range from $5,000 to $50,000 and cover funeral expenses, outstanding medical bills, credit card debt, and other final expenses. Unlike term life insurance, final expense policies never expire and your premiums never increase.",
  },
  {
    question: "How much does a funeral cost in Corpus Christi, Texas?",
    answer: "The average funeral in Corpus Christi and South Texas costs between $7,000 and $12,000, depending on whether you choose burial or cremation and the services selected. A traditional burial with viewing, casket, and cemetery plot typically costs $8,000-$15,000. Cremation is more affordable at $3,000-$7,000. Final expense insurance ensures these costs don't become a burden on your family.",
  },
  {
    question: "Can I get final expense insurance with health problems?",
    answer: "Yes! Final expense insurance is specifically designed for seniors who may have health conditions. We offer three types: Simplified Issue (a few health questions, no exam), Graded Benefit (coverage increases over 2-3 years, accepts most conditions), and Guaranteed Issue (no health questions at all — guaranteed acceptance for ages 50-85). We'll help you find the best option for your specific health situation.",
  },
  {
    question: "What's the difference between final expense and regular life insurance?",
    answer: "Final expense insurance is a type of whole life insurance with smaller coverage amounts ($5,000-$50,000) and simplified underwriting. Regular life insurance policies often require medical exams and offer higher coverage amounts ($100,000+). Final expense is designed specifically for seniors who need affordable coverage to handle end-of-life costs, while regular life insurance is better for income replacement and larger financial obligations.",
  },
  {
    question: "How quickly can I get a final expense policy?",
    answer: "Most final expense applications are approved within 24-48 hours. Simplified issue policies with just a few health questions can often be approved the same day. Even guaranteed issue policies that accept everyone are typically active within a week. We handle all the paperwork and guide you through every step.",
  },
  {
    question: "Who are the best final expense insurance carriers?",
    answer: "As an independent broker, we work with top-rated final expense carriers including Mutual of Omaha, Americo, CUNA Mutual, AIG, Foresters Financial, Gerber Life, and National Life Group. Each carrier has different strengths — some offer the best rates for healthy applicants, while others specialize in coverage for individuals with health conditions. We compare them all to find your best option.",
  },
];

export default function FinalExpenseInsurance() {
  const benefitsSection = useInView();
  const detailsSection = useInView();

  return (
    <SEOPageLayout
      title="Final Expense Insurance in Corpus Christi, TX | Burial Insurance for Seniors"
      description="Affordable final expense and burial insurance in Corpus Christi, Texas. No medical exam, coverage from $30/month. Protect your family from funeral costs. Call (361) 613-8336."
      canonicalPath="/final-expense-insurance"
      keywords="final expense insurance Corpus Christi, burial insurance Texas, funeral insurance seniors, affordable burial insurance, no medical exam life insurance, final expense insurance near me"
      heroLabel="Final Expense Insurance in Corpus Christi"
      heroHeading="Affordable Burial Insurance to Protect Your Family From Funeral Costs"
      heroSubheading="Don't leave your loved ones with a $10,000+ funeral bill. Final expense insurance starts at just $30/month with no medical exam required. As your local Corpus Christi broker, we'll find you the best rate from top-rated carriers."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Services", href: "/services" },
        { label: "Final Expense Insurance" },
      ]}
      faqs={faqs}
    >
      {/* ── BENEFITS ── */}
      <section className="py-20 bg-[#F5F0E8]" ref={benefitsSection.ref}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Why Final Expense Insurance</p>
            <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-[#0D1B3E]">
              Give Your Family <span className="italic text-[#C9A84C]">Peace of Mind</span>
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

      {/* ── COVERAGE DETAILS ── */}
      <section className="py-20 bg-white" ref={detailsSection.ref}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="section-label mb-3">At a Glance</p>
            <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-[#0D1B3E]">
              Final Expense <span className="italic text-[#C9A84C]">Coverage Details</span>
            </h2>
            <div className="gold-rule w-24 mx-auto mt-6" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {coverageDetails.map((d, i) => (
              <div
                key={d.label}
                className={`bg-[#F5F0E8] border border-[#E8E0D0] p-6 rounded-sm text-center transition-all duration-500 ${detailsSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="text-xs tracking-widest uppercase text-[#5A5A5A] font-['Lato'] font-bold mb-2">{d.label}</div>
                <div className="font-['Playfair_Display'] text-xl font-bold text-[#0D1B3E]">{d.value}</div>
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
              { value: "500+", label: "Seniors Protected" },
              { value: "$30", label: "Starting Monthly Premium" },
              { value: "24hr", label: "Fast Approval" },
              { value: "0", label: "Medical Exams Required" },
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
            Final Expense Insurance for Seniors in <span className="text-[#C9A84C]">Corpus Christi & South Texas</span>
          </h2>
          <div className="gold-rule w-16 mb-8" />

          <div className="prose prose-lg max-w-none text-[#5A5A5A] font-['Lato'] leading-relaxed space-y-5">
            <p>
              No one wants to think about end-of-life expenses, but planning ahead is one of the most loving things you can do for your family. At Ortiz Insurance Broker, we specialize in helping seniors across Corpus Christi, Portland, Robstown, Kingsville, Alice, and the entire Coastal Bend region find affordable final expense coverage that fits their budget.
            </p>
            <p>
              We understand that many seniors have health conditions that make traditional life insurance difficult to obtain. That's why we work with carriers that specialize in simplified and guaranteed issue policies — meaning you can get coverage regardless of your health history. Whether you have diabetes, COPD, heart disease, or cancer history, we have options for you.
            </p>
            <p>
              As an independent broker, we're not limited to a single company. We compare rates from Mutual of Omaha, Americo, CUNA Mutual, AIG, Foresters, Gerber Life, and many more to find you the best coverage at the lowest price. Our consultations are always free, and there's never any obligation or pressure to buy.
            </p>
            <p>
              <strong>Don't wait — protect your family today.</strong> Call <a href="tel:3616138336" className="text-[#C9A84C] font-semibold hover:underline">(361) 613-8336</a> or <Link href="/quote" className="text-[#C9A84C] font-semibold hover:underline">request your free quote online</Link>. We'll have your personalized quote ready in minutes.
            </p>
          </div>
        </div>
      </section>
    </SEOPageLayout>
  );
}
