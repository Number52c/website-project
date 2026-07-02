import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SalonSavingsCalculatorPremium from "./SalonSavingsCalculatorPremium";
import { useState, useEffect } from "react";
import { ArrowRight, CircleCheck as CheckCircle2, TrendingUp, Calculator, Shield, Sparkles, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function SalonAndBeautyProfessionals() {
  const [showCalculator, setShowCalculator] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const goBack = () => {
    window.history.back();
  };

  const trackInterest = trpc.interest.track.useMutation();
  const handleNotification = (message: string) => {
    trackInterest.mutate({ page: "Salon & Beauty Professionals", action: message });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* HERO - Premium Design */}
      <section className="relative overflow-hidden">
        {/* Background gradient with asymmetry */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-amber-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-amber-600/10 rounded-full blur-3xl"></div>

        <div className="relative px-4 py-16 sm:py-24 md:py-32 lg:py-40">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Content */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="inline-block">
                    <span className="text-amber-400 text-sm font-semibold uppercase tracking-widest">For Salon & Beauty Professionals</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-tight">
                    Build Your Beauty <span className="text-amber-400">Business Securely</span>
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed max-w-lg">
                    Whether you're a salon owner, hairstylist, or cosmetology professional, grow your business, protect your assets, and build retirement wealth with strategic planning designed for beauty entrepreneurs.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:gap-4 pt-2 sm:pt-4">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-bold text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 h-auto shadow-lg hover:shadow-xl transition-all group active:scale-95"
                    onClick={() => {
                      handleNotification("Calculate Savings Clicked");
                      setShowCalculator(true);
                    }}
                  >
                    Calculate Your Savings <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto border-2 border-amber-400 text-amber-400 hover:bg-amber-500/10 font-bold text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 h-auto active:scale-95"
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

              {/* Right: Visual Element */}
              <div className="hidden lg:block relative">
                <div className="relative h-96 bg-gradient-to-br from-amber-600/20 to-amber-500/10 rounded-2xl border border-amber-500/30 backdrop-blur-sm p-8 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Calculator className="h-16 w-16 text-amber-400 mx-auto" />
                    <p className="text-white text-lg font-semibold">Build Your<br />Retirement & Protection</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Show Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto flex items-end sm:items-center justify-center">
          <div className="w-full sm:min-h-screen flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-t-3xl sm:rounded-lg w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-3 sm:p-4 flex justify-between items-center rounded-t-3xl sm:rounded-t-lg">
                <h2 className="text-lg sm:text-2xl font-bold">Savings Calculator</h2>
                <button 
                  onClick={() => setShowCalculator(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl flex-shrink-0 ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-3 sm:p-4 pb-6 sm:pb-4">
                <SalonSavingsCalculatorPremium />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WHO WE SERVE - Unified Roles */}
      <section className="relative py-24 sm:py-32 bg-gray-50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="max-w-2xl mb-16">
            <span className="text-pink-600 text-sm font-semibold uppercase tracking-widest">Who We Serve</span>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mt-2">
              Salon Owners, Hairstylists & Cosmetology Professionals
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Salon Owners",
                description: "Build comprehensive protection for your business, manage multiple employees, and plan for long-term growth with strategic retirement and insurance solutions.",
              },
              {
                title: "Hairstylists",
                description: "Whether independent or booth-renting, maximize your income, build retirement savings, and protect your personal assets with tailored strategies.",
              },
              {
                title: "Cosmetology Professionals",
                description: "From estheticians to makeup artists, develop a financial plan that reflects your unique income model and protects your future.",
              },
            ].map((item, idx) => (
              <div key={idx} className="group">
                <div className="relative bg-white rounded-xl p-8 border border-gray-200 hover:border-pink-500 transition-all hover:shadow-lg">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/5 rounded-full -mr-10 -mt-10 group-hover:bg-pink-500/10 transition-all"></div>
                  <Sparkles className="h-8 w-8 text-pink-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE CHALLENGE - Premium Section */}
      <section className="relative py-24 sm:py-32 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="max-w-2xl mb-16">
            <span className="text-pink-600 text-sm font-semibold uppercase tracking-widest">The Challenge</span>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mt-2">
              Running a Beauty Business Is Complex. We Make It Simple.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Build Retirement Wealth",
                description: "Most beauty professionals lack a solid retirement plan. We show you how to save strategically based on your income model.",
              },
              {
                icon: Shield,
                title: "Protect Your Business",
                description: "One lawsuit can destroy everything. General liability insurance is essential protection for your salon or independent practice.",
              },
              {
                icon: CheckCircle2,
                title: "Plan for Growth",
                description: "Secure your business, protect your family, and build long-term wealth simultaneously with comprehensive planning.",
              },
            ].map((item, idx) => (
              <div key={idx} className="group">
                <div className="relative bg-white rounded-xl p-8 border border-gray-200 hover:border-amber-500 transition-all hover:shadow-lg">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full -mr-10 -mt-10 group-hover:bg-amber-500/10 transition-all"></div>
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
      <section className="relative py-24 sm:py-32 bg-gray-50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="max-w-2xl mb-16">
            <span className="text-pink-600 text-sm font-semibold uppercase tracking-widest">Your Strategy</span>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mt-2">
              Three Pillars of Beauty Business Success
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Retirement Savings */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-all"></div>
              <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 p-6 sm:p-8 lg:p-10 hover:border-amber-500 transition-all">
                <div className="inline-block mb-4 sm:mb-6">
                  <div className="bg-amber-600/10 p-3 sm:p-4 rounded-xl">
                    <TrendingUp className="h-6 sm:h-8 w-6 sm:w-8 text-amber-600" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">Retirement Savings</h3>
                <p className="text-base sm:text-lg text-amber-600 font-semibold mb-4 sm:mb-6">Build Long-Term Wealth</p>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6 sm:mb-8">
                  SEP-IRA and IUL strategies designed for beauty professionals to maximize tax savings and build retirement wealth based on your unique income model.
                </p>
                <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                  {[
                    "SEP-IRA for self-employed income",
                    "IUL for protection & growth",
                    "Tax-efficient planning",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 sm:gap-3">
                      <CheckCircle2 className="h-4 sm:h-5 w-4 sm:w-5 text-pink-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm sm:text-base text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 sm:py-6 h-auto text-sm sm:text-base active:scale-95"
                  onClick={() => {
                    handleNotification("Learn About Retirement Savings Clicked");
                    document.querySelector('[data-cta-section]')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* General Liability Insurance */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-all"></div>
              <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 p-6 sm:p-8 lg:p-10 hover:border-blue-500 transition-all">
                <div className="inline-block mb-4 sm:mb-6">
                  <div className="bg-blue-600/10 p-3 sm:p-4 rounded-xl">
                    <Shield className="h-6 sm:h-8 w-6 sm:w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">General Liability Insurance</h3>
                <p className="text-base sm:text-lg text-pink-600 font-semibold mb-4 sm:mb-6">Protect Your Business</p>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6 sm:mb-8">
                  General liability insurance protects your salon or independent practice from claims of bodily injury, property damage, and personal injury that occur during business operations.
                </p>
                <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                  {[
                    "Coverage for client injuries",
                    "Property damage protection",
                    "Legal defense costs",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 sm:gap-3">
                      <CheckCircle2 className="h-4 sm:h-5 w-4 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm sm:text-base text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 sm:py-6 h-auto text-sm sm:text-base active:scale-95"
                  onClick={() => {
                    handleNotification("Learn About General Liability Clicked");
                    document.querySelector('[data-cta-section]')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Get Protected <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Business & Personal Protection */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-all"></div>
              <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 p-6 sm:p-8 lg:p-10 hover:border-blue-500 transition-all">
                <div className="inline-block mb-4 sm:mb-6">
                  <div className="bg-blue-600/10 p-3 sm:p-4 rounded-xl">
                    <CheckCircle2 className="h-6 sm:h-8 w-6 sm:w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">Comprehensive Protection</h3>
                <p className="text-base sm:text-lg text-pink-600 font-semibold mb-4 sm:mb-6">Protect Your Family</p>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6 sm:mb-8">
                  Life insurance, disability coverage, and additional business protection to ensure your family and business are secure for the long term.
                </p>
                <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                  {[
                    "Life insurance planning",
                    "Disability income protection",
                    "Business succession planning",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 sm:gap-3">
                      <CheckCircle2 className="h-4 sm:h-5 w-4 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm sm:text-base text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 sm:py-6 h-auto text-sm sm:text-base active:scale-95"
                  onClick={() => {
                    handleNotification("Learn About Comprehensive Protection Clicked");
                    document.querySelector('[data-cta-section]')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Explore Options <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-r from-pink-50 to-pink-100/50 rounded-2xl border border-pink-200 p-8">
            <p className="text-lg text-gray-900">
              <span className="font-black text-pink-600">The Complete Strategy?</span> Combine retirement savings, business protection, and personal insurance into one comprehensive plan. We'll analyze your unique needs and build a customized strategy.
            </p>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US - Premium */}
      <section className="relative py-24 sm:py-32 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="max-w-2xl mb-16">
            <span className="text-pink-600 text-sm font-semibold uppercase tracking-widest">Why Beauty Professionals Trust Us</span>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mt-2">
              We Specialize in Beauty Industry Planning
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Beauty Industry Expert", desc: "We work exclusively with salon owners, hairstylists, and cosmetology professionals. We understand your business model." },
              { title: "Personalized Strategy", desc: "No cookie-cutter plans. Your salon's or independent practice's needs are unique to your business." },
              { title: "Maximize Protection", desc: "We help you get comprehensive coverage at competitive rates tailored to your specific role." },
              { title: "Local & Trusted", desc: "Licensed in 50+ states. Trusted by beauty professionals nationwide." },
            ].map((item, idx) => (
              <div key={idx} className="group">
                <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-8 border border-gray-200 hover:border-pink-500 transition-all hover:shadow-lg">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-pink-500/5 rounded-full -mr-8 -mt-8 group-hover:bg-pink-500/10 transition-all"></div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Final Conversion */}
      <section data-cta-section className="relative py-24 sm:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl"></div>

        <div className="relative container mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6">
            Ready to Protect Your Beauty Business?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Schedule a free consultation with Eric Ortiz. We'll review your needs and create a comprehensive protection and retirement plan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all"
              asChild
            >
              <a href="tel:3616138336">📞 Call (361) 613-8336</a>
            </Button>
            <Button
              size="lg"
              className="border-2 border-pink-400 text-pink-400 hover:bg-pink-500/10 font-bold text-lg px-8 py-6 h-auto"
              asChild
            >
              <a href="/quote">Get a Free Quote</a>
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER - Contact Info */}
      <section className="relative py-12 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <p className="text-gray-700 font-semibold mb-2">Eric Ortiz | Ortiz Insurance Broker</p>
          <p className="text-gray-600 mb-4">Licensed in 50+ States | Trusted by Beauty Professionals Nationwide</p>
          <p className="text-pink-600 font-bold text-lg">(361) 613-8336</p>
        </div>
      </section>
    </div>
  );
}
