import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CircleCheck as CheckCircle2, TrendingUp, Shield, ArrowLeft } from "lucide-react";
import BarberSavingsCalculatorPremium from "@/components/BarberSavingsCalculatorPremium";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

export default function Barbers() {
  const [showCalculator, setShowCalculator] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const trackInterest = trpc.interest.track.useMutation();
  const handleNotification = (message: string) => {
    trackInterest.mutate({ page: "Barbers", action: message });
  };

  const goBack = () => {
    window.history.back();
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Content */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="inline-block">
                    <span className="text-amber-400 text-sm font-semibold uppercase tracking-widest">For Barbers & Salon Owners</span>
                  </div>
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight">
                    Your Skills Deserve <span className="text-amber-400">Real Wealth</span>
                  </h1>
                  <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                    Stop leaving money on the table. Build a retirement strategy that matches your hustle. Get the financial foundation you deserve.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    size="lg"
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all group"
                    onClick={() => {
                      handleNotification("Free Strategy Call Clicked");
                      setShowCalculator(true);
                    }}
                  >
                    Get Your Free Strategy <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    size="lg"
                    className="border-2 border-amber-500 text-amber-400 hover:bg-red-500/10 font-bold text-lg px-8 py-6 h-auto"
                    asChild
                  >
                    <a href="tel:3616138336">Call (361) 613-8336</a>
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-gray-400 text-sm pt-4">
                  <CheckCircle2 className="h-5 w-5 text-amber-400" />
                   <span>No obligation. Transparent guidance. Professional expertise.</span>
                </div>
              </div>

              {/* Right: Visual Element */}
              <div className="hidden lg:block relative">
                <div className="relative h-96 bg-gradient-to-br from-amber-600/20 to-red-500/10 rounded-2xl border border-amber-500/30 backdrop-blur-sm p-8 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="text-6xl font-black text-amber-400">$</div>
                    <p className="text-white text-lg font-semibold">Build Your Retirement<br />While You Work</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE CHALLENGE - Premium Section */}
      <section className="relative py-24 sm:py-32 bg-gray-50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="max-w-2xl mb-16">
            <span className="text-amber-600 text-sm font-semibold uppercase tracking-widest">The Reality</span>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mt-2">
              Most Barbers Aren't Planning for Tomorrow
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "No Retirement Plan",
                description: "Self-employed means no 401(k), no safety net. Most barbers retire broke.",
              },
              {
                icon: TrendingUp,
                title: "Unpredictable Income",
                description: "Some months boom, some bust. Hard to plan. Hard to save consistently.",
              },
              {
                icon: Shield,
                title: "One Injury Away",
                description: "Can't work = can't earn. No backup plan. One accident changes everything.",
              },
            ].map((item, idx) => (
              <div key={idx} className="group">
                <div className="relative bg-white rounded-xl p-8 border border-gray-200 hover:border-amber-500 transition-all hover:shadow-lg">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/5 rounded-full -mr-10 -mt-10 group-hover:bg-red-500/10 transition-all"></div>
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
            <span className="text-amber-600 text-sm font-semibold uppercase tracking-widest">Your Options</span>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mt-2">
              Two Strategies. One Mission: Your Wealth.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* SEP-IRA */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-all"></div>
              <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200 p-10 hover:border-amber-500 transition-all">
                <div className="inline-block mb-6">
                  <div className="bg-amber-600/10 p-4 rounded-xl">
                    <TrendingUp className="h-8 w-8 text-amber-600" />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-2">SEP-IRA</h3>
                <p className="text-lg text-amber-600 font-semibold mb-6">Build Your Retirement Empire</p>
                <p className="text-gray-600 leading-relaxed mb-8">
                  Save aggressively with massive tax breaks. Build real wealth while you work. This is how successful barbers actually retire rich.
                </p>
                <ul className="space-y-4 mb-10">
                  {[
                    "Simple to set up — No complicated paperwork",
                    "Flexible contributions — Save what you can, when you can",
                    "Tax-deferred growth — Your money works harder",
                    "Built for self-employed — Made for people like you",
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
                    handleNotification("Learn More About SEP-IRA Clicked");
                    document.querySelector('[data-cta-section]')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* IUL */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-all"></div>
              <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200 p-10 hover:border-amber-500 transition-all">
                <div className="inline-block mb-6">
                  <div className="bg-amber-600/10 p-4 rounded-xl">
                    <Shield className="h-8 w-8 text-amber-600" />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-2">Indexed Universal Life</h3>
                <p className="text-lg text-amber-600 font-semibold mb-6">Protect Your Family & Build Wealth</p>
                <p className="text-gray-600 leading-relaxed mb-8">
                  Life insurance that actually builds value. Protect your family AND yourself. Wealth building with a safety net.
                </p>
                <ul className="space-y-4 mb-10">
                  {[
                    "Family protection — If something happens to you, they're covered",
                    "Cash value grows tax-free — Your money compounds",
                    "Borrow anytime — Access your cash value when you need it",
                    "Affordable premiums — Premium protection, reasonable cost",
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
                    handleNotification("Learn More About IUL Clicked");
                    document.querySelector('[data-cta-section]')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-2xl border border-amber-200 p-8">
            <p className="text-lg text-gray-900">
              <span className="font-black text-amber-600">Pro Move:</span> Most successful barbers use BOTH. SEP-IRA for aggressive retirement savings + IUL for family protection and wealth building. We'll help you figure out what works for YOUR situation.
            </p>
          </div>
        </div>
      </section>

      {/* CALCULATOR MODAL */}
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
                <BarberSavingsCalculatorPremium />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PARTNERSHIP - Premium Section */}
      <section className="relative py-24 sm:py-32 bg-gray-50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="max-w-2xl mb-16">
            <span className="text-amber-600 text-sm font-semibold uppercase tracking-widest">Partnership</span>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mt-2">
              Partnering With Get Faded Barbershop
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-8 border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Get Faded Barbershop</h3>
                <p className="text-gray-600 mb-4">
                  Located in Corpus Christi, Texas, Get Faded is a premier destination for men's grooming and sharp fades. With a <strong>4.4★ rating</strong>, they deliver top-tier service with precision and style.
                </p>
                <p className="text-gray-600 mb-6">
                  We're partnering with Get Faded to bring financial planning expertise directly to the barber community at their October event.
                </p>
                <Button
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                  asChild
                >
                  <a href="https://www.google.com/search?q=Get+Faded+Barbershop+Corpus+Christi" target="_blank" rel="noopener noreferrer">
                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>

              <div className="bg-white rounded-xl p-8 border border-gray-200">
                <h4 className="text-xl font-bold text-gray-900 mb-6">Why This Partnership Matters</h4>
                <ul className="space-y-4">
                  {[
                    { title: "Real Community Connection", desc: "Get Faded represents the barber community we serve" },
                    { title: "Shared Values", desc: "Excellence, integrity, and supporting local professionals" },
                    { title: "Direct Access", desc: "Meet us at Get Faded's events and get personalized guidance" },
                  ].map((item, idx) => (
                    <li key={idx} className="flex gap-3">
                      <CheckCircle2 className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900">{item.title}</p>
                        <p className="text-gray-600 text-sm">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl p-12 text-white">
              <h3 className="text-3xl font-black mb-4">Dre's World Foundation</h3>
              <p className="text-amber-100 leading-relaxed">
                Get Faded Barbershop is proud to support Dre's World Foundation, a community-focused initiative dedicated to making a positive impact. We share this commitment to giving back and supporting the communities we serve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US - Premium */}
      <section className="relative py-24 sm:py-32 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="max-w-2xl mb-16">
            <span className="text-amber-600 text-sm font-semibold uppercase tracking-widest">Why Barbers Trust Us</span>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mt-2">
              We Get Your Grind
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "We Get Your Grind", desc: "We work with self-employed professionals every day. We understand the hustle." },
              { title: "Transparent Pricing", desc: "Clear, honest pricing. No hidden fees. No pressure tactics. Complete transparency." },
              { title: "We Actually Care", desc: "This isn't transactional. We want to see you win long-term." },
              { title: "Trusted Professional", desc: "Dedicated to serving self-employed professionals with integrity and expertise." },
            ].map((item, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-8 border border-gray-200 hover:border-amber-500 hover:shadow-lg transition-all">
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
            Ready to Level Up?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
             Schedule a FREE consultation with Eric Ortiz. No obligation. No pressure. Professional guidance for your future.
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
              className="border-2 border-amber-500 text-amber-400 hover:bg-red-500/10 font-bold text-lg px-10 py-7 h-auto"
              asChild
            >
              <a href="tel:3616138336">Call (361) 613-8336</a>
            </Button>
          </div>

          <p className="text-gray-400 mt-8">Available 9am-6pm Monday-Friday</p>
        </div>
      </section>

      {/* FAQ - Premium */}
      <section className="relative py-24 sm:py-32 bg-gray-50">
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
                q: "I don't have a business license. Can I still get a SEP-IRA?",
                a: "Yes! If you're self-employed and have income, you qualify. We'll walk you through the process.",
              },
              {
                q: "What if my income is inconsistent?",
                a: "That's exactly why SEP-IRAs exist. You contribute what you can, when you can. No minimums. No penalties.",
              },
              {
                q: "How much does this cost?",
                a: "Your consultation is FREE. We'll discuss options and pricing based on YOUR situation. No surprises.",
              },
              {
                q: "Can I get life insurance if I have health issues?",
                a: "Absolutely. We work with carriers that specialize in coverage for people with health conditions. Let's explore your options.",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-8 border border-gray-200 hover:border-amber-500 transition-all">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{item.q}</h3>
                <p className="text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative py-16 bg-white border-t border-gray-200">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <p className="text-gray-600 mb-6">
            <span className="font-bold text-gray-900">Eric Ortiz</span> | Ortiz Insurance Broker<br />
             Licensed in 50+ States | Trusted by Professionals Nationwide<br />
            <span className="text-amber-600 font-bold">(361) 613-8336</span>
          </p>
        </div>
      </section>
    </div>
  );
}
