/**
 * Blog Article: Can You Get Life Insurance With Pre-Existing Conditions?
 * Target keywords: life insurance pre-existing conditions, life insurance with diabetes,
 * life insurance with heart disease, guaranteed issue life insurance
 */

import { Link } from "wouter";
import SEOPageLayout from "@/components/SEOPageLayout";
import { CircleCheck as CheckCircle } from "lucide-react";

const faqs = [
  {
    question: "Can I get life insurance if I have diabetes?",
    answer: "Yes. Many carriers offer coverage for people with Type 1 and Type 2 diabetes. If your diabetes is well-controlled (A1C under 8.0) and you have no major complications, you may qualify for standard or slightly rated policies. For more severe cases, simplified issue and guaranteed issue options are available without a medical exam.",
  },
  {
    question: "Will my premiums be higher with a pre-existing condition?",
    answer: "Usually yes, but not always as much as you'd expect. Carriers rate conditions differently — a condition that one company rates heavily, another might treat more favorably. This is exactly why working with an independent broker is so valuable. We know which carriers are most lenient for specific conditions and can shop your case to find the best rate.",
  },
  {
    question: "What is a graded benefit life insurance policy?",
    answer: "A graded benefit policy has a 2-3 year waiting period before the full death benefit is available. If you pass away during the waiting period, your beneficiaries receive a return of all premiums paid plus interest (typically 10-20%). After the waiting period, the full death benefit applies. Graded policies are designed for people who can't qualify for standard coverage.",
  },
  {
    question: "Can I get life insurance after a cancer diagnosis?",
    answer: "Yes, but timing matters. Most carriers require you to be cancer-free for 2-5 years before offering standard coverage. During that waiting period, guaranteed issue policies are available with no health questions. Some carriers specialize in post-cancer coverage and may offer better rates once you're in remission.",
  },
];

export default function BlogPreExistingConditions() {
  return (
    <SEOPageLayout
      title="Life Insurance With Pre-Existing Conditions | Ortiz Insurance Broker"
      description="Yes, you can get life insurance with diabetes, heart disease, cancer history, and other pre-existing conditions. Learn your options from Ortiz Insurance in Corpus Christi, TX."
      canonicalPath="/blog/life-insurance-pre-existing-conditions"
      keywords="life insurance pre-existing conditions, life insurance with diabetes, life insurance heart disease, guaranteed issue life insurance, no exam life insurance health conditions"
      heroLabel="Life Insurance Guide"
      heroHeading="Can You Get Life Insurance With Pre-Existing Conditions?"
      heroSubheading="The answer is almost always yes. From diabetes to heart disease to cancer history — here's how to find affordable coverage when you have health challenges."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Blog", href: "/blog" },
        { label: "Life Insurance With Pre-Existing Conditions" },
      ]}
      faqs={faqs}
      articleSchema={{
        headline: "Can You Get Life Insurance With Pre-Existing Conditions?",
        datePublished: "2026-05-15",
        dateModified: "2026-05-31",
        author: "Eric Ortiz",
        description: "A guide to getting life insurance with diabetes, heart disease, cancer, and other pre-existing conditions.",
      }}
    >
      <section className="py-16 bg-[#F5F0E8]">
        <div className="max-w-3xl mx-auto px-6">
          <article className="prose prose-lg max-w-none text-[#5A5A5A] font-['Lato'] leading-relaxed">
            <p className="text-lg font-semibold text-[#0D1B3E]">
              One of the biggest myths in the insurance industry is that pre-existing health conditions make you uninsurable. The truth? Most people with health conditions <strong>can</strong> get coverage — they just need to know where to look and how to apply.
            </p>

            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#0D1B3E] mt-10 mb-4">
              Common Conditions and Your Coverage Options
            </h2>

            <div className="bg-white border border-[#E8E0D0] rounded-sm overflow-hidden my-6 not-prose">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0D1B3E]">
                    <th className="px-4 py-3 text-left text-white font-['Playfair_Display'] font-bold">Condition</th>
                    <th className="px-4 py-3 text-left text-[#C9A84C] font-['Playfair_Display'] font-bold">Coverage Available?</th>
                    <th className="px-4 py-3 text-left text-[#C9A84C] font-['Playfair_Display'] font-bold">Best Option</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { condition: "Type 2 Diabetes (controlled)", available: "Yes — standard rates possible", best: "Fully underwritten or simplified issue" },
                    { condition: "Type 1 Diabetes", available: "Yes — rated policies", best: "Simplified issue or graded benefit" },
                    { condition: "High Blood Pressure", available: "Yes — often standard rates", best: "Fully underwritten (if controlled)" },
                    { condition: "Heart Disease / History", available: "Yes — after stabilization", best: "Simplified issue or guaranteed issue" },
                    { condition: "Cancer (in remission)", available: "Yes — after 2-5 years", best: "Fully underwritten (post-remission)" },
                    { condition: "COPD / Asthma", available: "Yes — rated policies", best: "Simplified issue" },
                    { condition: "Depression / Anxiety", available: "Yes — often standard rates", best: "Fully underwritten" },
                    { condition: "Obesity (BMI 30-40)", available: "Yes — rated policies", best: "Fully underwritten or simplified" },
                    { condition: "Multiple Conditions", available: "Yes — guaranteed issue", best: "Guaranteed issue whole life" },
                  ].map((row, i) => (
                    <tr key={row.condition} className={i % 2 === 0 ? "bg-[#F5F0E8]" : "bg-white"}>
                      <td className="px-4 py-3 font-semibold text-[#0D1B3E] font-['Lato']">{row.condition}</td>
                      <td className="px-4 py-3 text-[#5A5A5A] font-['Lato']">{row.available}</td>
                      <td className="px-4 py-3 text-[#5A5A5A] font-['Lato']">{row.best}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#0D1B3E] mt-10 mb-4">
              Three Paths to Coverage
            </h2>

            <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#0D1B3E] mt-8 mb-3">
              Path 1: Fully Underwritten (Best Rates)
            </h3>
            <p>
              If your condition is well-controlled, you may qualify for a traditional policy with a medical exam. This gives you the <strong>lowest premiums</strong> and highest coverage amounts. Carriers evaluate your specific situation — medication, lab results, treatment history — and assign a rating class.
            </p>
            <p>
              <strong>Pro tip:</strong> Different carriers rate conditions differently. A carrier that's strict on diabetes might be lenient on heart conditions, and vice versa. An independent broker knows which carriers are most favorable for your specific condition.
            </p>

            <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#0D1B3E] mt-8 mb-3">
              Path 2: Simplified Issue (No Exam)
            </h3>
            <p>
              Simplified issue policies require a health questionnaire but <strong>no medical exam</strong>. Approval is fast (often 24-48 hours) and coverage amounts range from $25,000 to $500,000. These are ideal for moderate health conditions where you can answer "no" to the key health questions.
            </p>

            <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#0D1B3E] mt-8 mb-3">
              Path 3: Guaranteed Issue (Everyone Qualifies)
            </h3>
            <p>
              Guaranteed issue policies accept <strong>everyone</strong> — no health questions, no medical exam, no possibility of denial. Coverage is typically $2,000 to $25,000 with a 2-3 year graded benefit period. Premiums are higher, but this is the safety net for people who can't qualify anywhere else.
            </p>

            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#0D1B3E] mt-10 mb-4">
              How to Improve Your Chances of Approval
            </h2>
            <div className="not-prose space-y-3 my-6">
              {[
                "Get your condition under control before applying — stable lab results help",
                "Gather your medical records and medication list before the application",
                "Be completely honest on your application — misrepresentation can void coverage",
                "Work with an independent broker who knows which carriers favor your condition",
                "Apply to the right carrier first — multiple denials can make future applications harder",
                "Consider a graded benefit policy as a bridge while you improve your health",
                "Don't wait — conditions can worsen, and premiums increase with age",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle size={16} className="text-[#C9A84C] mt-0.5 shrink-0" />
                  <span className="text-[#5A5A5A] text-sm font-['Lato']">{item}</span>
                </div>
              ))}
            </div>

            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#0D1B3E] mt-10 mb-4">
              Why an Independent Broker Makes the Difference
            </h2>
            <p>
              When you have a pre-existing condition, the carrier you apply to matters enormously. A captive agent (who works for one company) can only offer that company's products. If that company is strict on your condition, you'll get a high rate or a denial.
            </p>
            <p>
              An <strong>independent broker like Ortiz Insurance</strong> works with 20+ carriers and knows exactly which companies are most favorable for specific conditions. We can often find coverage at rates that surprise our clients — because we know where to look.
            </p>

            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#0D1B3E] mt-10 mb-4">
              Get Your Free Quote — No Judgment, No Pressure
            </h2>
            <p>
              We've helped hundreds of Corpus Christi families with health conditions find affordable life insurance. Your health situation doesn't define your options — it just means you need the right broker in your corner.
            </p>
            <p>
              <strong>Call us at <a href="tel:3616138336" className="text-[#C9A84C] hover:underline">(361) 613-8336</a></strong> or <Link href="/quote" className="text-[#C9A84C] hover:underline">request a free quote online</Link>. We'll find you coverage — guaranteed.
            </p>
          </article>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#0D1B3E] mb-8 text-center">
            Related <span className="italic text-[#C9A84C]">Articles</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Graded vs Guaranteed Issue Insurance", href: "/blog/graded-vs-guaranteed-issue", cat: "Life Insurance" },
              { title: "Life Insurance for Seniors Over 50", href: "/blog/life-insurance-seniors-over-50", cat: "Life Insurance" },
              { title: "Final Expense Insurance Guide", href: "/final-expense-insurance", cat: "Final Expense" },
            ].map((a) => (
              <Link key={a.href} href={a.href} className="group bg-[#F5F0E8] border border-[#E8E0D0] p-6 rounded-sm hover:shadow-lg hover:border-[#C9A84C]/40 transition-all duration-300">
                <span className="text-[10px] tracking-widest uppercase font-bold text-[#C9A84C] font-['Lato']">{a.cat}</span>
                <h3 className="font-['Playfair_Display'] font-bold text-[#0D1B3E] mt-2 group-hover:text-[#C9A84C] transition-colors">{a.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SEOPageLayout>
  );
}
