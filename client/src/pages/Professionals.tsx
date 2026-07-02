import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, Scissors, Palette, Sparkles, ArrowRight, Hop as Home } from "lucide-react";
import { useLocation } from "wouter";

export default function Professionals() {
  const [, navigate] = useLocation();

  const occupations = [
    {
      id: "teachers",
      title: "Teachers",
      subtitle: "TRS Retirement Planning",
      description: "Maximize your Texas Teacher Retirement System benefits, explore supplemental retirement plans, and secure your financial future.",
      icon: GraduationCap,
      href: "/teachers",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300",
      accentColor: "text-blue-600",
      lightBg: "bg-blue-100/20",
      cta: "Explore Teacher Solutions",
    },
    {
      id: "barbers",
      title: "Barbers & Barbershop Owners",
      subtitle: "SEP-IRA & IUL Solutions",
      description: "Build retirement wealth with SEP-IRA, protect your family with IUL, and stop leaving money on the table.",
      icon: Scissors,
      href: "/barbers",
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-300",
      accentColor: "text-amber-600",
      lightBg: "bg-amber-100/20",
      cta: "Explore Barber Solutions",
    },
    {
      id: "salon-and-beauty",
      title: "Salon & Beauty Professionals",
      subtitle: "Owners, Stylists & Cosmetologists",
      description: "Comprehensive retirement planning, business liability protection, and wealth-building strategies for salon owners, hairstylists, and cosmetology professionals.",
      icon: Palette,
      href: "/salon-and-beauty-professionals",
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-300",
      accentColor: "text-pink-600",
      lightBg: "bg-pink-100/20",
      cta: "Explore Salon & Beauty Solutions",
    },
    {
      id: "realtors",
      title: "Real Estate Professionals",
      subtitle: "Commission Protection & Life Insurance",
      description: "Protect your commission income, secure your family, and build your business with life insurance, disability coverage, and strategic planning designed for realtors.",
      icon: Home,
      href: "/realtors",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-300",
      accentColor: "text-emerald-600",
      lightBg: "bg-emerald-100/20",
      cta: "Explore Realtor Solutions",
    },
    {
      id: "coming-soon",
      title: "More Professions Coming",
      subtitle: "Your Industry Matters",
      description: "We're building specialized solutions for more occupations. If you don't see yours, let us know!",
      icon: Sparkles,
      href: "#",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300",
      accentColor: "text-purple-600",
      lightBg: "bg-purple-100/20",
      cta: "Suggest Your Profession",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* HERO - Bold & Striking */}
      <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>

        <div className="relative container mx-auto max-w-6xl px-4">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-block">
              <span className="text-blue-400 text-sm font-bold uppercase tracking-widest">Specialized Solutions</span>
            </div>
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white leading-tight">
              Your <span className="bg-gradient-to-r from-blue-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">Profession</span> Deserves Better
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 leading-relaxed">
              We specialize in retirement planning and insurance solutions designed specifically for your industry. Not generic advice. Real expertise.
            </p>
          </div>
        </div>
      </section>

      {/* OCCUPATION CARDS - Bold & Colorful */}
      <section className="relative py-24 sm:py-32 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {occupations.map((occ) => {
              const Icon = occ.icon;
              return (
                <div key={occ.id} className="group h-full">
                  {/* Card with gradient border effect */}
                  <div className="relative h-full">
                    {/* Gradient border glow */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${occ.color} rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-300`}></div>

                    {/* Main card */}
                    <div className={`relative h-full ${occ.bgColor} rounded-3xl border-2 ${occ.borderColor} p-10 sm:p-12 flex flex-col justify-between hover:shadow-2xl transition-all duration-300 group-hover:scale-105 group-hover:border-opacity-100`}>
                      {/* Top section with icon */}
                      <div className="space-y-6 mb-8">
                        {/* Icon container */}
                        <div className={`inline-block p-4 rounded-2xl bg-gradient-to-br ${occ.color}`}>
                          <Icon className="h-10 w-10 text-white" />
                        </div>

                        {/* Title and subtitle */}
                        <div className="space-y-2">
                          <h2 className="text-3xl sm:text-4xl font-black text-gray-900">{occ.title}</h2>
                          <p className={`text-lg font-bold ${occ.accentColor}`}>{occ.subtitle}</p>
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 text-lg leading-relaxed">{occ.description}</p>
                      </div>

                      {/* Bottom CTA */}
                      <Button
                        className={`w-full bg-gradient-to-r ${occ.color} hover:shadow-lg text-white font-bold text-lg py-7 h-auto group/btn transition-all`}
                        onClick={() => navigate(occ.href)}
                      >
                        {occ.cta}
                        <ArrowRight className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY SPECIALIZED - Bold Section */}
      <section className="relative py-24 sm:py-32 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-5xl sm:text-6xl font-black text-white leading-tight">
                  Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">Specialized</span> Matters
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed">
                  Generic insurance advice doesn't work for professionals with unique income patterns, tax situations, and retirement needs.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { title: "Your Business Model", desc: "We understand how you earn, how you spend, and what you need to protect." },
                  { title: "Tax Efficiency", desc: "Strategies designed around your specific tax situation and deductions." },
                  { title: "Real Expertise", desc: "We work with professionals like you every day. We know what works." },
                  { title: "Personalized Plans", desc: "No cookie-cutter solutions. Your plan is built for your unique situation." },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-pink-500">
                        <span className="text-white font-bold text-sm">✓</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{item.title}</h3>
                      <p className="text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500/20 to-pink-500/20 rounded-3xl border border-blue-400/30 p-12 backdrop-blur-sm">
                <div className="space-y-6 text-center">
                  <div className="text-6xl">🎯</div>
                  <h3 className="text-2xl font-black text-white">Precision Planning</h3>
                  <p className="text-gray-300 text-lg">
                    Built for your profession. Designed for your success.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION - Bold */}
      <section className="relative py-24 sm:py-32 bg-white">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl sm:text-6xl font-black text-gray-900">
                Ready to Get Specialized?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Choose your profession above and discover solutions built specifically for you. Or call us to discuss your unique situation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg text-white font-bold text-lg px-8 py-7 h-auto"
                asChild
              >
                <a href="tel:3616138336">📞 Call (361) 613-8336</a>
              </Button>
              <Button
                size="lg"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-lg px-8 py-7 h-auto"
                asChild
              >
                <a href="/quote">Get a Free Quote</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
