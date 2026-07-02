/*
   FAQ SECTION
   Comprehensive FAQ with schema markup for SEO
   ============================================================= */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: "Life Insurance",
    question: "How much life insurance do I actually need?",
    answer:
      "Most financial experts recommend having 10-12 times your annual income in coverage. However, the best way to determine your specific needs is to use the DIME method: calculate your Debt, Income replacement needs, Mortgage balance, and Education costs. Our free calculator can help you determine the right amount for your family.",
  },
  {
    category: "Life Insurance",
    question: "What's the difference between term and whole life insurance?",
    answer:
      "Term life insurance provides coverage for a specific period (10, 20, or 30 years) at a lower cost. Whole life insurance provides lifetime coverage and builds cash value over time. Term is ideal for temporary needs like mortgage protection, while whole life offers permanent protection and can serve as a wealth-building tool.",
  },
  {
    category: "Life Insurance",
    question: "Can I get life insurance with pre-existing conditions?",
    answer:
      "Yes! While pre-existing conditions may affect your rates or require additional underwriting, there are many insurance options available. We work with multiple carriers to find the best rates for your specific health situation. Some policies are specifically designed for people with health challenges.",
  },
  {
    category: "Final Expense",
    question: "What is final expense insurance?",
    answer:
      "Final expense insurance (also called burial insurance) is a type of whole life insurance designed to cover end-of-life costs like funeral expenses, medical bills, and outstanding debts. Policies typically range from $5,000 to $50,000 and are easier to qualify for than traditional life insurance.",
  },
  {
    category: "Final Expense",
    question: "Can seniors over 50 get life insurance?",
    answer:
      "Absolutely! Many carriers offer simplified issue policies for seniors that don't require a medical exam. While premiums may be higher due to age, final expense insurance is an affordable way to ensure your family isn't burdened with your end-of-life costs.",
  },
  {
    category: "Annuities",
    question: "What is a fixed index annuity (FIA)?",
    answer:
      "A fixed index annuity is an insurance product that provides a guaranteed minimum return plus potential growth tied to a stock market index. It offers downside protection (you won't lose money in market downturns) while allowing participation in market gains. It's ideal for conservative investors seeking income and growth.",
  },
  {
    category: "Annuities",
    question: "What is a MYGA annuity?",
    answer:
      "A Multi-Year Guaranteed Annuity (MYGA) is similar to a CD but offered through insurance companies. It provides a fixed rate of return for a specific period (typically 3-10 years) and is backed by the insurance company's claims-paying ability. It's ideal for predictable, guaranteed income.",
  },
  {
    category: "Process",
    question: "How long does the application process take?",
    answer:
      "Most applications can be completed in 15-30 minutes. For simplified issue policies, approval can happen within 24-48 hours. For policies requiring medical underwriting, the process typically takes 2-4 weeks. We handle all the paperwork and follow-up with the insurance company for you.",
  },
  {
    category: "Process",
    question: "Do I need a medical exam?",
    answer:
      "It depends on the policy type and coverage amount. Many of our final expense and simplified issue policies don't require a medical exam. Larger policies may require a phone interview or basic health questions. We'll let you know upfront what to expect.",
  },
  {
    category: "Process",
    question: "What happens after I apply?",
    answer:
      "After you apply, we submit your application to the insurance company. You may receive a call for health questions or to clarify information. Once approved, you'll receive your policy documents. Your coverage typically becomes effective once your first premium payment is processed.",
  },
];

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(faqs.map((faq) => faq.category)));
  const filteredFaqs = selectedCategory
    ? faqs.filter((faq) => faq.category === selectedCategory)
    : faqs;

  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              selectedCategory === null
                ? "bg-[#C9A84C] text-[#0D1B3E]"
                : "bg-[#0D1B3E]/10 text-[#0D1B3E] hover:bg-[#0D1B3E]/20"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-[#C9A84C] text-[#0D1B3E]"
                  : "bg-[#0D1B3E]/10 text-[#0D1B3E] hover:bg-[#0D1B3E]/20"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border border-[#E8E0D0] rounded-lg overflow-hidden hover:border-[#C9A84C] transition-all duration-300"
            >
              <button
                onClick={() =>
                  setActiveIndex(activeIndex === index ? null : index)
                }
                className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-[#F5F0E8] transition-colors duration-300"
              >
                <div className="flex-1 text-left">
                  <p className="text-xs text-[#C9A84C] font-semibold mb-1">
                    {faq.category}
                  </p>
                  <h3 className="font-['Playfair_Display'] font-bold text-[#0D1B3E] text-lg">
                    {faq.question}
                  </h3>
                </div>
                <motion.div
                  animate={{ rotate: activeIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="shrink-0 ml-4"
                >
                  <ChevronDown
                    size={24}
                    className="text-[#C9A84C]"
                  />
                </motion.div>
              </button>

              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-[#E8E0D0] bg-[#F5F0E8]/50"
                  >
                    <p className="px-6 py-4 text-[#0D1B3E] font-['Lato'] leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-[#6B6B6B] font-['Lato'] mb-6">
            Still have questions?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:3616138336"
              className="px-8 py-3 bg-[#C9A84C] text-[#0D1B3E] rounded-lg font-semibold hover:bg-[#D4AF37] transition-all duration-300 btn-gold"
            >
              Call Us
            </a>
            <a
              href="/contact"
              className="px-8 py-3 border-2 border-[#C9A84C] text-[#C9A84C] rounded-lg font-semibold hover:bg-[#C9A84C]/5 transition-all duration-300"
            >
              Send a Message
            </a>
          </div>
        </div>
      </div>

      {/* Schema Markup for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: filteredFaqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        })}
      </script>
    </section>
  );
}
