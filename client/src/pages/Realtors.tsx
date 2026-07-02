import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import RealtorCommissionCalculatorPremium from "./RealtorCommissionCalculatorPremium";
import RealtorRetirementCalculatorPremium from "./RealtorRetirementCalculatorPremium";
import { useState, useEffect } from "react";
import { ArrowRight, CircleCheck as CheckCircle2, TrendingUp, Shield, Heart, Building2, ArrowLeft, ChevronDown } from "lucide-react";
import { trpc } from "@/lib/trpc";

// Education Card Component
function EducationCard({
  icon,
  title,
  description,
  content,
}: {
  icon: string;
  title: string;
  description: string;
  content: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card
      className="p-6 border-2 border-gray-200 hover:border-amber-400 transition-all cursor-pointer hover:shadow-md"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="text-3xl">{icon}</div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          <ChevronDown
            className={`h-5 w-5 text-gray-400 transition-transform flex-shrink-0 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {isOpen && (
          <div className="pt-3 border-t border-gray-200">
            <p className="text-gray-700 leading-relaxed">{content}</p>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function Realtors() {
  const [showCalculator, setShowCalculator] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const goBack = () => {
    window.history.back();
  };

  const trackInterest = trpc.interest.track.useMutation();
  const handleNotification = (message: string) => {
    trackInterest.mutate({ page: "Realtors", action: message });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* HERO - Premium Design */}
      <section className="relative overflow-hidden">
        {/* Background gradient with asymmetry */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl"></div>

        <div className="relative px-4 py-24 sm:py-32 lg:py-40">
          {/* Back Button */}
          <div className="mb-4">
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-amber-400 hover:text-amber-300 font-semibold transition-colors duration-200"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
              Back
            </button>
          </div>
          <div className="container mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="inline-block">
                    <span className="text-amber-400 text-sm font-semibold uppercase tracking-widest">For Real Estate Professionals</span>
                  </div>
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight">
                    Protect Your <span className="text-amber-400">Commission Income</span>
                  </h1>
                  <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                    Your real estate career is built on relationships and hustle. One health crisis or disability could end it all. Protect your income, your family, and your business.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    size="lg"
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all group"
                    onClick={() => {
                      handleNotification("Calculate Protection Need Clicked");
                      setShowCalculator(true);
                    }}
                  >
                    Calculate Your Protection <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    size="lg"
                    className="border-2 border-amber-400 text-amber-400 hover:bg-amber-500/10 font-bold text-lg px-8 py-6 h-auto"
                    asChild
                  >
                    <a href="tel:3616138336">Call (361) 613-8336</a>
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-gray-400 text-sm pt-4">
                  <CheckCircle2 className="h-5 w-5 text-amber-400" />
                  <span>Free consultation. No obligation. Expert guidance.</span>
                </div>
              </div>


            </div>
          </div>
        </div>
      </section>

      {/* CALCULATOR MODAL */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto flex items-end sm:items-center justify-center">
          <div className="w-full sm:min-h-screen flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-t-3xl sm:rounded-lg w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-3 sm:p-4 flex justify-between items-center rounded-t-3xl sm:rounded-t-lg">
                <h2 className="text-lg sm:text-2xl font-bold">Commission Protection Calculator</h2>
                <button 
                  onClick={() => setShowCalculator(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl flex-shrink-0 ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-3 sm:p-4 pb-6 sm:pb-4">
                <RealtorCommissionCalculatorPremium />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* THE CHALLENGE - Premium Section */}
      <section className="relative py-24 sm:py-32 bg-gray-50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="max-w-2xl mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
              The Reality of Real Estate
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              You're self-employed. Your income is variable. Your success depends entirely on your ability to work. But most realtors have zero protection if that changes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 border-2 border-red-200 bg-red-50">
              <div className="flex items-start gap-4">
                <div className="text-4xl">💔</div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">No Employer Benefits</h3>
                  <p className="text-gray-700">
                    No group health insurance. No disability coverage. No retirement plan. You're on your own.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 border-2 border-orange-200 bg-orange-50">
              <div className="flex items-start gap-4">
                <div className="text-4xl">📉</div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">Unpredictable Income</h3>
                  <p className="text-gray-700">
                    Commission-based means boom-and-bust cycles. Hard to plan. Hard to save. One slow market impacts everything.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 border-2 border-purple-200 bg-purple-50">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🚨</div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">One Crisis Away</h3>
                  <p className="text-gray-700">
                    A health issue, accident, or disability stops your income immediately. No paycheck. No safety net.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* YOUR STRATEGY - Premium Section */}
      <section className="relative py-24 sm:py-32 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="max-w-2xl mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
              Three Pillars of Realtor Protection
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Protect your income, your family, and your business with a comprehensive strategy designed specifically for real estate professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Pillar 1: Life Insurance */}
            <Card className="p-8 border-2 border-emerald-300 bg-emerald-50 hover:shadow-lg transition-shadow">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Heart className="h-12 w-12 text-emerald-600" />
                  <span className="text-sm font-bold text-emerald-700 bg-emerald-200 px-3 py-1 rounded-full">Pillar 1</span>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">
                    Life Insurance Protection
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Term life to replace your commission income if something happens to you. Permanent life to build cash value and protect your family long-term.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Term Life Insurance</p>
                      <p className="text-sm text-gray-600">Affordable income replacement for 20-30 years</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Permanent Life Insurance</p>
                      <p className="text-sm text-gray-600">Cash value growth + family protection</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Key-Person Coverage</p>
                      <p className="text-sm text-gray-600">Protect your business if a partner passes away</p>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  onClick={() => {
                    handleNotification("Learn More About Life Insurance");
                    setShowCalculator(true);
                  }}
                >
                  Learn More
                </Button>
              </div>
            </Card>

            {/* Pillar 2: Disability & Health */}
            <Card className="p-8 border-2 border-blue-300 bg-blue-50 hover:shadow-lg transition-shadow">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Shield className="h-12 w-12 text-blue-600" />
                  <span className="text-sm font-bold text-blue-700 bg-blue-200 px-3 py-1 rounded-full">Pillar 2</span>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">
                    Disability & Health Insurance
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    If you can't work, disability insurance replaces your commission income. Health insurance protects you from catastrophic medical costs.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Disability Income Insurance</p>
                      <p className="text-sm text-gray-600">Replaces 60-70% of income if you can't work</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Health Insurance</p>
                      <p className="text-sm text-gray-600">Comprehensive coverage for medical expenses</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Critical Illness Coverage</p>
                      <p className="text-sm text-gray-600">Lump sum if diagnosed with major illness</p>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  onClick={() => {
                    handleNotification("Learn More About Disability Insurance");
                    document.querySelector('[data-cta-section]')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Learn More
                </Button>
              </div>
            </Card>

            {/* Pillar 3: Business Protection */}
            <Card className="p-8 border-2 border-amber-300 bg-amber-50 hover:shadow-lg transition-shadow">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Building2 className="h-12 w-12 text-amber-600" />
                  <span className="text-sm font-bold text-amber-700 bg-amber-200 px-3 py-1 rounded-full">Pillar 3</span>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">
                    Business & Wealth Protection
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Protect your business assets, plan for succession, and build wealth strategically for long-term security.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-amber-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Buy-Sell Agreements</p>
                      <p className="text-sm text-gray-600">Protect business partners with funded agreements</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-amber-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Wealth Building Strategy</p>
                      <p className="text-sm text-gray-600">Diversified approach to long-term financial security</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-amber-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Estate Planning</p>
                      <p className="text-sm text-gray-600">Protect your family's financial future</p>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold"
                  onClick={() => {
                    handleNotification("Learn More About Business Protection");
                    document.querySelector('[data-cta-section]')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Learn More
                </Button>
              </div>
            </Card>
          </div>

          <div className="mt-12 p-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-300">
            <p className="text-lg text-gray-800 leading-relaxed">
              <span className="font-bold text-emerald-700">The Complete Strategy:</span> Combine life insurance, disability protection, and business safeguards into one comprehensive plan. We'll analyze your unique situation as a realtor and build a customized strategy that protects your income, your family, and your business.
            </p>
          </div>
        </div>
      </section>

      {/* REALTOR RETIREMENT & INCOME PROTECTION CALCULATOR */}
      <section className="relative py-24 sm:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="max-w-3xl mb-12">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
              Retirement & Income Protection Calculator
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Plan your retirement, project your savings growth, and discover your life insurance needs. Use this calculator to see exactly where you stand financially.
            </p>
          </div>

          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 sm:p-8">
            <RealtorRetirementCalculatorPremium />
          </div>
        </div>
      </section>

      {/* LIFE INSURANCE EDUCATION SECTION */}
      <section className="relative py-24 sm:py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="max-w-3xl mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
              Life Insurance Education for Realtors
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Understanding your life insurance options is crucial for protecting your commission income and family. Here's what every realtor should know.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EducationCard
              icon="💰"
              title="Income Replacement Strategy"
              description="How much life insurance do you actually need?"
              content="Most realtors need 10-15x their annual commission income in life insurance. This ensures your family maintains their lifestyle and covers mortgage, debts, and education expenses. Our calculator helps you determine your exact need based on your commission structure."
            />
            <EducationCard
              icon="🏡"
              title="Mortgage & Debt Protection"
              description="Protecting your family's home and assets"
              content="Life insurance can pay off your mortgage, car loans, and business debts, ensuring your family isn't burdened with these obligations. A $500K policy can eliminate multiple financial burdens and give your family peace of mind."
            />
            <EducationCard
              icon="👨‍👩‍👧‍👦"
              title="Family Security & Education"
              description="College funds and childcare coverage"
              content="Set aside funds for your children's education through life insurance. A 20-year term policy can fund college tuition, childcare costs, and provide income for your spouse to stay home if needed. Protect their future today."
            />
            <EducationCard
              icon="🤝"
              title="Business Continuity Planning"
              description="Protecting your brokerage and partners"
              content="If you're a broker or team leader, life insurance funds buy-sell agreements with partners. This ensures smooth business transitions and protects your team's income if something happens to you."
            />
            <EducationCard
              icon="📊"
              title="Tax-Efficient Life Insurance"
              description="Permanent insurance and cash value growth"
              content="Permanent life insurance (whole life, universal life) builds cash value that grows tax-free. You can borrow against this value for business needs or retirement, making it a powerful wealth-building tool alongside your term coverage."
            />
            <EducationCard
              icon="⚖️"
              title="Term vs. Permanent Insurance"
              description="Understanding your coverage options"
              content="Term insurance is affordable and perfect for income replacement. Permanent insurance builds wealth and lasts your lifetime. Most realtors benefit from a combination: term for immediate protection, permanent for long-term wealth building."
            />
          </div>
        </div>
      </section>

      {/* TAX STRATEGY GUIDES SECTION */}
      <section className="relative py-24 sm:py-32 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="max-w-3xl mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
              Tax Strategy Guides for Real Estate Professionals
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              As a 1099 independent contractor, you have unique tax opportunities. Learn how to maximize deductions, minimize taxes, and build wealth strategically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EducationCard
              icon="📝"
              title="Maximizing 1099 Deductions"
              description="Every dollar counts when you're self-employed"
              content="As a 1099 contractor, you can deduct: office supplies, technology, vehicle mileage (67.5¢/mile in 2024), home office expenses, professional development, marketing, and more. Many realtors leave thousands in deductions on the table. Track everything meticulously."
            />
            <EducationCard
              icon="🏦"
              title="SEP-IRA & Solo 401(k) Strategy"
              description="Building tax-deferred retirement savings"
              content="A SEP-IRA lets you contribute up to 25% of your net self-employment income (max $69,000 in 2024). A Solo 401(k) allows even higher contributions. These are powerful tools for realtors to build retirement savings while reducing current tax liability."
            />
            <EducationCard
              icon="🏢"
              title="Optimal Business Structure"
              description="LLC vs. S-Corp vs. Sole Proprietor"
              content="Your business structure impacts taxes significantly. An S-Corp election can save self-employment taxes (15.3%) on a portion of your income. An LLC provides liability protection. Consult a CPA to determine the best structure for your commission level and goals."
            />
            <EducationCard
              icon="📅"
              title="Quarterly Tax Planning"
              description="Avoiding penalties and cash flow surprises"
              content="As self-employed, you must pay estimated taxes quarterly (April 15, June 15, Sept 15, Jan 15). Underpayment penalties are steep. Set aside 25-30% of commissions for taxes. Work with a CPA to calculate exact quarterly payments based on your income."
            />
            <EducationCard
              icon="💵"
              title="Commission Optimization & Splits"
              description="Structuring deals for tax efficiency"
              content="Negotiate commission splits strategically. Consider whether higher splits with lower volume or lower splits with higher volume works better for your tax bracket. Understand how different deal structures affect your net income after taxes and expenses."
            />
            <EducationCard
              icon="💼"
              title="Expense Tracking & Record Keeping"
              description="Documentation that protects you in an audit"
              content="Keep detailed records: receipts, mileage logs, invoices, and contracts. Use accounting software to track business expenses in real-time. The IRS expects self-employed individuals to maintain meticulous records. Good documentation can save thousands in an audit."
            />
          </div>

          <div className="mt-12 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-300">
            <p className="text-lg text-gray-800 leading-relaxed">
              <span className="font-bold text-blue-700">Tax Planning Tip:</span> Work with a CPA who specializes in real estate professionals. The right tax strategy can save you $5,000-$20,000+ annually. Schedule a free consultation to discuss your specific situation.
            </p>
          </div>
        </div>
      </section>

      {/* BRAND STORY & TEAM CREDIBILITY */}
      <section className="relative py-24 sm:py-32 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="max-w-3xl mx-auto mb-20">
            <span className="text-amber-600 text-sm font-semibold uppercase tracking-widest">Our Story</span>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mt-2 mb-6">
              We Specialize in Real Estate Professionals
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              We have helped countless realtors protect their commission income and build long-term wealth. Our mission is helping real estate professionals set themselves up for success—showing you how life insurance, disability protection, and strategic planning can secure your career, your family, and your financial future.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              <span className="font-semibold text-amber-600">Rooted in Texas.</span> We're based in Corpus Christi with deep connections across Texas, including DFW. Our team includes realtors who sell life insurance and understand both the real estate and insurance sides of your business. We know what it takes to succeed in this industry.
            </p>
          </div>
        </div>
      </section>

      {/* WHY REALTORS TRUST US */}
      <section className="relative py-24 sm:py-32 bg-gray-50">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-16 text-center">
            Why Realtors Trust Us
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 border-2 border-amber-200 hover:border-amber-400 transition-colors">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🎯</div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">We Understand Your Business</h3>
                  <p className="text-gray-700">
                    Commission-based income. Variable earnings. Unpredictable markets. We work with realtors every day and understand your unique challenges.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 border-2 border-amber-200 hover:border-amber-400 transition-colors">
              <div className="flex items-start gap-4">
                <div className="text-4xl">💼</div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">Realtor-to-Realtor Expertise</h3>
                  <p className="text-gray-700">
                    Our team includes realtors who sell life insurance. We speak your language and understand both real estate and insurance. Strategies built by people who know your world.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 border-2 border-amber-200 hover:border-amber-400 transition-colors">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🤝</div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">Texas-Wide Network</h3>
                  <p className="text-gray-700">
                    Rooted in Corpus Christi. Connected across Texas including DFW. Local expertise with statewide reach. Licensed in 50+ states.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 border-2 border-amber-200 hover:border-amber-400 transition-colors">
              <div className="flex items-start gap-4">
                <div className="text-4xl">⭐</div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">Transparent & Trusted</h3>
                  <p className="text-gray-700">
                    Clear pricing. No hidden fees. No pressure. We explain everything in plain language so you understand your protection and can make confident decisions.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section data-cta-section className="relative py-24 sm:py-32 bg-gradient-to-r from-emerald-900 to-teal-900">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl sm:text-6xl font-black text-white">
                Ready to Protect Your Career?
              </h2>
              <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
                Schedule a free consultation with Eric Ortiz. We'll review your commission structure, analyze your protection gaps, and build a customized strategy for your real estate career.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg px-8 py-7 h-auto"
                asChild
              >
                <a href="tel:3616138336">📞 Call (361) 613-8336</a>
              </Button>
              <Button
                size="lg"
                className="border-2 border-emerald-400 text-emerald-100 hover:bg-emerald-800 font-bold text-lg px-8 py-7 h-auto"
                asChild
              >
                <a href="/quote">Get a Free Quote</a>
              </Button>
            </div>

            <p className="text-emerald-200 text-sm">
              Available 9am-6pm Monday-Friday | Free consultation, no obligation
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <section className="bg-white border-t border-gray-200 py-12">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <p className="text-gray-700 font-semibold mb-2">
            Eric Ortiz | Ortiz Insurance Broker
          </p>
          <p className="text-gray-600">
            Licensed in 50+ States | Trusted by Real Estate Professionals Nationwide
          </p>
          <p className="text-gray-600 mt-4">
            📞 (361) 613-8336
          </p>
        </div>
      </section>
    </div>
  );
}
