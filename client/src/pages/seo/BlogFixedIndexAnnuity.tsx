/**
 * Blog Article: What Is a Fixed Index Annuity?
 * Target keywords: fixed index annuity, FIA annuity, what is FIA,
 * indexed annuity explained, FIA vs 401k
 */

import { Link } from "wouter";
import SEOPageLayout from "@/components/SEOPageLayout";
import { CircleCheck as CheckCircle, TrendingUp, Shield, DollarSign } from "lucide-react";

const faqs = [
  {
    question: "Can I lose money in a Fixed Index Annuity?",
    answer: "No — that's one of the key benefits. With a Fixed Index Annuity, your principal is protected from market losses. If the linked index (like the S&P 500) goes down, your account value stays the same — it never decreases due to market performance. You can only lose money if you withdraw more than allowed during the surrender period, which may incur surrender charges.",
  },
  {
    question: "What returns can I expect from an FIA?",
    answer: "FIA returns vary based on market performance and the specific crediting method. Historically, FIAs have averaged 3-7% annual returns over long periods. In strong market years, you might earn 8-12% (subject to caps). In down years, you earn 0% (but never negative). The trade-off is that you won't capture 100% of market gains, but you'll never suffer market losses either.",
  },
  {
    question: "What is the difference between an FIA and a variable annuity?",
    answer: "The key difference is risk. A variable annuity invests directly in the market — your account value goes up and down with market performance, meaning you can lose money. An FIA uses index-linked crediting with a floor of 0%, so you participate in gains but are protected from losses. Variable annuities also typically have higher fees. For most retirees seeking safety and growth, FIAs offer a better balance.",
  },
  {
    question: "Are Fixed Index Annuities good for retirement?",
    answer: "FIAs are excellent retirement vehicles for people who want growth potential without market risk. They're particularly well-suited for people within 10-15 years of retirement or already retired, those who want to protect their nest egg from market crashes, people looking for guaranteed lifetime income options, and anyone who wants tax-deferred growth. We'll help you determine if an FIA fits your overall retirement strategy.",
  },
];

export default function BlogFixedIndexAnnuity() {
  return (
    <SEOPageLayout
      title="What Is a Fixed Index Annuity (FIA)? Beginner's Guide (2026) | Ortiz Insurance"
      description="Learn how Fixed Index Annuities work — growth potential, principal protection, and guaranteed income. Expert FIA guide from Ortiz Insurance Broker in Corpus Christi, TX."
      canonicalPath="/blog/what-is-fixed-index-annuity"
      keywords="fixed index annuity, FIA annuity explained, what is a fixed index annuity, indexed annuity guide, FIA vs 401k, FIA retirement"
      heroLabel="Annuity Guide"
      heroHeading="What Is a Fixed Index Annuity?"
      heroSubheading="A beginner-friendly guide to Fixed Index Annuities (FIAs) — how they work, their benefits and limitations, and whether an FIA belongs in your retirement plan."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Blog", href: "/blog" },
        { label: "What Is a Fixed Index Annuity?" },
      ]}
      faqs={faqs}
      articleSchema={{
        headline: "What Is a Fixed Index Annuity? A Beginner's Guide to FIAs",
        datePublished: "2026-05-22",
        dateModified: "2026-05-22",
        author: "Eric Ortiz",
        description: "Everything you need to know about Fixed Index Annuities — how they work, benefits, and whether an FIA is right for your retirement.",
      }}
    >
      <section className="py-16 bg-[#F5F0E8]">
        <div className="max-w-3xl mx-auto px-6">
          <article className="prose prose-lg max-w-none text-[#5A5A5A] font-['Lato'] leading-relaxed">
            <p className="text-lg font-semibold text-[#0D1B3E]">
              Fixed Index Annuities (FIAs) have become one of the most popular retirement savings vehicles in America — and for good reason. They offer something rare in the financial world: the potential to grow your money when markets go up, while protecting your principal when markets go down.
            </p>

            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#0D1B3E] mt-10 mb-4">
              How a Fixed Index Annuity Works
            </h2>
            <p>
              A Fixed Index Annuity is an insurance product that earns interest based on the performance of a market index — most commonly the <strong>S&P 500</strong>. But unlike investing directly in the stock market, your money isn't actually in the market. Instead, the insurance company uses the index as a benchmark to calculate your interest credits.
            </p>
            <p>Here's the key concept:</p>

            <div className="not-prose bg-white border border-[#E8E0D0] rounded-sm p-6 my-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-sm bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <TrendingUp size={22} className="text-green-600" />
                  </div>
                  <h4 className="font-['Playfair_Display'] font-bold text-[#0D1B3E] mb-2">Market Goes Up</h4>
                  <p className="text-sm text-[#5A5A5A] font-['Lato']">You earn a portion of the gains (subject to a cap or participation rate)</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-sm bg-[#0D1B3E] flex items-center justify-center mx-auto mb-3">
                    <Shield size={22} className="text-[#C9A84C]" />
                  </div>
                  <h4 className="font-['Playfair_Display'] font-bold text-[#0D1B3E] mb-2">Market Goes Down</h4>
                  <p className="text-sm text-[#5A5A5A] font-['Lato']">Your account stays the same — 0% floor means you never lose money</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-sm bg-[#C9A84C]/20 flex items-center justify-center mx-auto mb-3">
                    <DollarSign size={22} className="text-[#C9A84C]" />
                  </div>
                  <h4 className="font-['Playfair_Display'] font-bold text-[#0D1B3E] mb-2">Gains Are Locked In</h4>
                  <p className="text-sm text-[#5A5A5A] font-['Lato']">Once credited, your gains become part of your protected principal</p>
                </div>
              </div>
            </div>

            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#0D1B3E] mt-10 mb-4">
              Key FIA Terms You Should Know
            </h2>

            <div className="not-prose bg-white border border-[#E8E0D0] rounded-sm overflow-hidden my-6">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    { term: "Cap Rate", def: "The maximum interest you can earn in a given period. Example: a 10% cap means if the index gains 15%, you earn 10%." },
                    { term: "Participation Rate", def: "The percentage of index gains credited to your account. Example: 80% participation on a 10% gain = 8% credit." },
                    { term: "Floor", def: "The minimum interest rate — typically 0%. This guarantees you never lose money due to market declines." },
                    { term: "Surrender Period", def: "The period (usually 5-10 years) during which early withdrawals may incur charges. Most FIAs allow 10% annual penalty-free withdrawals." },
                    { term: "Income Rider", def: "An optional feature that provides guaranteed lifetime income, regardless of account performance." },
                  ].map((row, i) => (
                    <tr key={row.term} className={i % 2 === 0 ? "bg-[#F5F0E8]" : "bg-white"}>
                      <td className="px-4 py-3 font-semibold text-[#0D1B3E] font-['Lato'] w-1/3">{row.term}</td>
                      <td className="px-4 py-3 text-[#5A5A5A] font-['Lato']">{row.def}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#0D1B3E] mt-10 mb-4">
              Benefits of Fixed Index Annuities
            </h2>
            <div className="not-prose space-y-3 my-4">
              {[
                "Principal protection — your money is safe from market crashes",
                "Growth potential linked to major market indices",
                "Tax-deferred accumulation — no taxes until withdrawal",
                "Guaranteed lifetime income options available",
                "No management fees on most FIAs (unlike mutual funds)",
                "Gains are locked in annually and become part of your protected balance",
                "Probate avoidance — death benefit passes directly to beneficiaries",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle size={16} className="text-[#C9A84C] mt-0.5 shrink-0" />
                  <span className="text-[#5A5A5A] text-sm font-['Lato']">{item}</span>
                </div>
              ))}
            </div>

            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#0D1B3E] mt-10 mb-4">
              Who Should Consider an FIA?
            </h2>
            <p>
              Fixed Index Annuities are best suited for people who are <strong>within 10-15 years of retirement or already retired</strong> and want to protect their savings while still earning competitive returns. They're particularly valuable if you:
            </p>
            <ul>
              <li>Want to protect your nest egg from another 2008-style market crash</li>
              <li>Need guaranteed income in retirement that you can't outlive</li>
              <li>Are rolling over a 401(k) or IRA and want safety + growth</li>
              <li>Want tax-deferred growth without the volatility of the stock market</li>
              <li>Are looking for an alternative to low-yield CDs and bonds</li>
            </ul>

            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#0D1B3E] mt-10 mb-4">
              Get Expert FIA Guidance in Corpus Christi
            </h2>
            <p>
              Fixed Index Annuities are powerful tools, but they're not one-size-fits-all. The right FIA depends on your age, retirement timeline, income needs, and risk tolerance. At Ortiz Insurance Broker, we compare FIA products from top carriers like National Life Group, Athene, North American, and Allianz to find the best fit for your retirement goals.
            </p>
            <p>
              <strong>Schedule your free retirement consultation.</strong> Call <a href="tel:3616138336" className="text-[#C9A84C] hover:underline">(361) 613-8336</a> or <Link href="/quote" className="text-[#C9A84C] hover:underline">request a free consultation online</Link>.
            </p>
          </article>
        </div>
      </section>

      {/* ── RELATED ARTICLES ── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#0D1B3E] mb-8 text-center">
            Related <span className="italic text-[#C9A84C]">Articles</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Annuities in Corpus Christi", href: "/annuities-corpus-christi", cat: "Annuities" },
              { title: "Why Every Parent Needs Life Insurance", href: "/blog/why-parents-need-life-insurance", cat: "Life Insurance" },
              { title: "How Much Life Insurance Do I Need?", href: "/blog/how-much-life-insurance-do-i-need", cat: "Life Insurance" },
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
