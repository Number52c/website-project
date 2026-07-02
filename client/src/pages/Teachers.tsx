import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import TeacherRetirementCalculatorPremium from "./TeacherRetirementCalculatorPremium";
import { useState, useEffect } from "react";
import { ArrowRight, CircleCheck as CheckCircle2, TrendingUp, Calculator, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Teachers() {
  const [showCalculator, setShowCalculator] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const goBack = () => {
    window.history.back();
  };

  const trackInterest = trpc.interest.track.useMutation();
  const handleNotification = (message: string) => {
    trackInterest.mutate({ page: "Teachers", action: message });
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
                    <span className="text-amber-400 text-sm font-semibold uppercase tracking-widest">For Educators</span>
                  </div>
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight">
                    Teachers Deserve <span className="text-amber-400">Better Retirement</span>
                  </h1>
                  <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                    You've invested your career in our future. Now invest in yours. Maximize your TRS benefits and build real wealth.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    size="lg"
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all group"
                    onClick={() => {
                      handleNotification("Calculate TRS Benefits Clicked");
                      // Scroll to calculator section
                      const calculatorSection = document.querySelector('[data-calculator-section]');
                      if (calculatorSection) {
                        calculatorSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    Calculate Your TRS Benefits <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
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

      {/* Show Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold">TRS Retirement Calculator</h2>
                <button 
                  onClick={() => setShowCalculator(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                <TeacherRetirementCalculatorPremium />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* THE CHALLENGE - Premium Section */}
      <section className="relative py-24 sm:py-32 bg-gray-50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="max-w-2xl mb-16">
            <span className="text-amber-600 text-sm font-semibold uppercase tracking-widest">The Challenge</span>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mt-2">
              TRS Is Complex. We Make It Simple.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Maximize Your Benefits",
                description: "Most teachers don't know how to optimize their TRS benefits. We show you exactly how.",
              },
              {
                icon: Calculator,
                title: "Plan Your Retirement",
                description: "Understand your Rule of 80/90, pension projections, and income gaps before retirement.",
              },
              {
                icon: CheckCircle2,
                title: "Close the Gap",
                description: "TRS alone may not be enough. We help you build supplemental retirement income.",
              },
            ].map((item, idx) => (
              <div key={idx} className="group">
                <div className="relative bg-white rounded-xl p-8 border border-gray-200 hover:border-blue-500 transition-all hover:shadow-lg">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -mr-10 -mt-10 group-hover:bg-blue-500/10 transition-all"></div>
                  <item.icon className="h-8 w-8 text-amber-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTIONS - Premium Design */}
      <section className="relative py-24 sm:py-32 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="max-w-2xl mb-16">
            <span className="text-amber-600 text-sm font-semibold uppercase tracking-widest">Your Strategy</span>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mt-2">
              Three Pillars of Teacher Retirement
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 403(b) Optimization */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-all"></div>
              <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200 p-10 hover:border-amber-500 transition-all">
                <div className="inline-block mb-6">
                  <div className="bg-amber-600/10 p-4 rounded-xl">
                    <TrendingUp className="h-8 w-8 text-amber-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">403(b) Optimization</h3>
                <p className="text-lg text-amber-600 font-semibold mb-6">Maximize Tax Savings</p>
                <p className="text-gray-600 leading-relaxed mb-8">
                  Review your current 403(b) plan and ensure you're getting the best returns with the lowest fees.
                </p>
                <ul className="space-y-3 mb-10">
                  {[
                    "Fee analysis & optimization",
                    "Investment strategy review",
                    "Contribution maximization",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-6 h-auto"
                  onClick={() => {
                    handleNotification("Review 403(b) Clicked");
                    document.querySelector('[data-cta-section]')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Review My 403(b) <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Supplemental Retirement Plans */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-all"></div>
              <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200 p-10 hover:border-blue-500 transition-all">
                <div className="inline-block mb-6">
                  <div className="bg-blue-600/10 p-4 rounded-xl">
                    <Calculator className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Supplemental Plans</h3>
                <p className="text-lg text-amber-600 font-semibold mb-6">Close the Retirement Gap</p>
                <p className="text-gray-600 leading-relaxed mb-8">
                  TRS + 403(b) may not be enough. Build additional retirement income with strategic planning.
                </p>
                <ul className="space-y-3 mb-10">
                  {[
                    "Roth IRA strategies",
                    "SEP-IRA for side income",
                    "Deferred annuities",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 h-auto"
                  onClick={() => {
                    handleNotification("Explore Supplemental Plans Clicked");
                    document.querySelector('[data-cta-section]')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Explore Options <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Life Insurance & Annuities */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-all"></div>
              <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200 p-10 hover:border-blue-500 transition-all">
                <div className="inline-block mb-6">
                  <div className="bg-blue-600/10 p-4 rounded-xl">
                    <CheckCircle2 className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Life Insurance & Annuities</h3>
                <p className="text-lg text-amber-600 font-semibold mb-6">Protect Your Family</p>
                <p className="text-gray-600 leading-relaxed mb-8">
                  Guaranteed income in retirement. Life insurance to protect your family's future.
                </p>
                <ul className="space-y-3 mb-10">
                  {[
                    "Fixed & indexed annuities",
                    "Life insurance planning",
                    "Guaranteed income strategies",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 h-auto"
                  onClick={() => {
                    handleNotification("Explore Annuities Clicked");
                    document.querySelector('[data-cta-section]')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Explore Annuities <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-2xl border border-amber-200 p-8">
            <p className="text-lg text-gray-900">
              <span className="font-black text-amber-600">The Best Strategy?</span> A comprehensive plan that combines all three pillars. We'll analyze your specific situation and build a customized retirement strategy.
            </p>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US - Premium */}
      <section className="relative py-24 sm:py-32 bg-gray-50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="max-w-2xl mb-16">
            <span className="text-amber-600 text-sm font-semibold uppercase tracking-widest">Why Teachers Trust Us</span>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mt-2">
              We Specialize in Teacher Retirement
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mt-6 max-w-2xl">
              We have helped countless teachers prepare for retirement and specialize in teacher retirement planning. Our mission is helping teachers set themselves up for when that day comes—showing you supplemental benefits and strategies that maximize your TRS benefits and secure your financial future.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Teacher Specialist", desc: "We work exclusively with educators. We know TRS inside and out." },
              { title: "Personalized Strategy", desc: "No cookie-cutter plans. Your retirement plan is unique to you." },
              { title: "Maximize Benefits", desc: "We help you get every dollar you're entitled to from TRS." },
              { title: "Local & Trusted", desc: "Dedicated to serving South Texas teachers with expertise and integrity. Licensed in 50+ states." },
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-8 border border-gray-200 hover:border-amber-500 hover:shadow-lg transition-all">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Premium */}
      <section data-cta-section className="relative py-24 sm:py-32 bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"></div>
        <div className="relative container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6">
            Your Retirement Starts Here
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Schedule a FREE consultation with Eric Ortiz. We'll review your TRS benefits, analyze your 403(b), and build a personalized retirement strategy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg px-10 py-7 h-auto shadow-lg hover:shadow-xl transition-all"
              onClick={() => {
                handleNotification("Schedule Consultation Clicked");
                window.location.href = 'tel:3616138336';
              }}
            >
              Schedule Free Consultation <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              className="border-2 border-amber-400 text-amber-400 hover:bg-amber-500/10 font-bold text-lg px-10 py-7 h-auto"
              asChild
            >
              <a href="tel:3616138336">Call (361) 613-8336</a>
            </Button>
          </div>

          <p className="text-gray-400 mt-8">Available 9am-6pm Monday-Friday</p>
        </div>
      </section>

      {/* FAQ - Premium */}
      <section className="relative py-24 sm:py-32 bg-white">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="max-w-2xl mb-16">
            <span className="text-amber-600 text-sm font-semibold uppercase tracking-widest">FAQ</span>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mt-2">
              Common Questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: "What is the Rule of 80/90?",
                a: "The Rule of 80/90 allows you to retire with full benefits when your age plus years of service equals 80 (or you have 90 years of service). We'll calculate your specific eligibility.",
              },
              {
                q: "How much will my TRS pension be?",
                a: "Your TRS pension is based on your years of service and average salary. We'll provide a detailed projection based on your specific situation.",
              },
              {
                q: "Should I take a lump sum or monthly payments?",
                a: "This depends on your personal situation. We'll analyze both options and recommend the best choice for your retirement goals.",
              },
              {
                q: "What about my 403(b)?",
                a: "Your 403(b) is separate from TRS. We'll review your current plan, analyze fees, and optimize your investment strategy.",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-8 border border-gray-200 hover:border-amber-500 transition-all">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{item.q}</h3>
                <p className="text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRS Benefit Formula & Education */}
      <section className="relative py-24 sm:py-32 bg-white border-t border-gray-200">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">TRS Benefit Formula 2026</h2>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-8 rounded-lg mb-8">
              <p className="text-lg font-bold text-gray-900 mb-4">Standard Formula: 2.3% × Years of Service × Average Salary</p>
              <p className="text-gray-700 mb-4">Example: A teacher with 30 years of service and $60,000 average salary would receive:</p>
              <p className="text-2xl font-black text-amber-600">2.3% × 30 × $60,000 = $41,400/year annual pension</p>
              <p className="text-sm text-gray-600 mt-4">Vesting Requirement: 5 years minimum to be eligible for retirement benefits.</p>
            </div>
          </div>
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">The Rule of 90</h3>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-8 rounded-lg">
              <p className="text-gray-700 mb-4">The Rule of 90 is the most common way TRS members retire with full, unreduced benefits. You qualify when your age plus years of service equals 90 or more.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <p className="font-bold text-blue-600 mb-2">Example 1</p>
                  <p className="text-sm text-gray-700">Age 58 + 32 years service = 90 ✓</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <p className="font-bold text-blue-600 mb-2">Example 2</p>
                  <p className="text-sm text-gray-700">Age 60 + 30 years service = 90 ✓</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <p className="font-bold text-blue-600 mb-2">Example 3</p>
                  <p className="text-sm text-gray-700">Age 65 + 25 years service = 90 ✓</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-6">Need 5 years minimum for retirement benefits. Use the calculator above to find your specific Rule of 90 eligibility date.</p>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">TRS Retirement Tiers Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="text-left p-4 font-bold text-gray-900">Tier</th>
                    <th className="text-left p-4 font-bold text-gray-900">Years</th>
                    <th className="text-left p-4 font-bold text-gray-900">Avg Salary</th>
                    <th className="text-left p-4 font-bold text-gray-900">Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-4 font-bold text-gray-900">Tier 1 (Pre-2005)</td>
                    <td className="p-4 text-gray-700">Highest 3 years</td>
                    <td className="p-4 text-gray-700">Min age 55, highest 3 years</td>
                    <td className="p-4 text-gray-700">Most generous benefits</td>
                  </tr>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-4 font-bold text-gray-900">Tier 2 (2005-2013)</td>
                    <td className="p-4 text-gray-700">Highest 5 years</td>
                    <td className="p-4 text-gray-700">Min age 62, highest 5 years</td>
                    <td className="p-4 text-gray-700">Moderate benefits</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 font-bold text-gray-900">Tier 4 (2021+)</td>
                    <td className="p-4 text-gray-700">Highest 5 years</td>
                    <td className="p-4 text-gray-700">Min age 65, highest 5 years</td>
                    <td className="p-4 text-gray-700">Reduced benefits</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
      {/* Related Tools & Resources */}
      <section className="relative py-24 sm:py-32 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-12 text-center">Related Finance & Retirement Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href="/calculator" className="group bg-white p-8 rounded-xl border-2 border-gray-200 hover:border-amber-500 hover:shadow-lg transition-all">
              <Calculator className="h-8 w-8 text-amber-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Retirement Calculator</h3>
              <p className="text-sm text-gray-600 mb-4">Calculate your retirement needs and savings goals for all professions.</p>
              <span className="text-amber-600 font-bold text-sm flex items-center">Learn More <ArrowRight className="h-4 w-4 ml-2" /></span>
            </a>
            <a href="/professionals" className="group bg-white p-8 rounded-xl border-2 border-gray-200 hover:border-amber-500 hover:shadow-lg transition-all">
              <TrendingUp className="h-8 w-8 text-amber-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Professional Calculators</h3>
              <p className="text-sm text-gray-600 mb-4">Explore calculators for barbers, salon owners, realtors, and more.</p>
              <span className="text-amber-600 font-bold text-sm flex items-center">Explore <ArrowRight className="h-4 w-4 ml-2" /></span>
            </a>
            <a href="#contact" className="group bg-white p-8 rounded-xl border-2 border-gray-200 hover:border-amber-500 hover:shadow-lg transition-all">
              <CheckCircle2 className="h-8 w-8 text-amber-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Schedule Consultation</h3>
              <p className="text-sm text-gray-600 mb-4">Get personalized advice from a TRS specialist about your retirement plan.</p>
              <span className="text-amber-600 font-bold text-sm flex items-center">Schedule <ArrowRight className="h-4 w-4 ml-2" /></span>
            </a>
          </div>
        </div>
      </section>
      {/* Inline Calculator Section - Always visible */}
      <section data-calculator-section className="relative py-24 sm:py-32 bg-gradient-to-br from-slate-50 to-white border-t-2 border-amber-200">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="mb-16 text-center">
              <span className="text-amber-600 text-sm font-semibold uppercase tracking-widest">Interactive Tool</span>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mt-2">
                Calculate Your Retirement
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mt-6 max-w-2xl mx-auto">
                Get personalized insights about your TRS benefits, 403(b) strategy, and life insurance needs. Fill out the calculator below to see your complete retirement picture.
              </p>
            </div>
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-lg">
              <TeacherRetirementCalculatorPremium />
            </div>
          </div>
        </section>

      {/* Footer CTA */}
      <section className="relative py-16 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <p className="text-gray-600 mb-6">
            <span className="font-bold text-gray-900">Eric Ortiz</span> | Ortiz Insurance Broker<br />
             Licensed in 50+ States | Trusted by Teachers Nationwide<br />
            <span className="text-blue-600 font-bold">(361) 613-8336</span>
          </p>
        </div>
      </section>
    </div>
  );
}
