/* =============================================================
   ABOUT US PAGE — Ortiz Insurance
   Design: Heraldic Prestige — Navy + Gold + Corpus Christi skyline
   ============================================================= */

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { Shield, Award, Users, MapPin, Phone, ArrowRight } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

const values = [
  {
    icon: Shield,
    title: "Integrity First",
    desc: "We believe in transparent, honest advice. Our recommendations are always in your best interest — never driven by commission.",
  },
  {
    icon: Award,
    title: "Expert Guidance",
    desc: "With deep expertise across life, health, commercial, and retirement products, we bring professional-grade knowledge to every client.",
  },
  {
    icon: Users,
    title: "Community Rooted",
    desc: "We live and work in Corpus Christi. We understand the local economy, the people, and the unique challenges South Texans face.",
  },
  {
    icon: MapPin,
    title: "Locally Owned",
    desc: "Ortiz Insurance is an independent, locally owned brokerage — not a franchise. Your business stays right here in Corpus Christi.",
  },
];

export default function About() {
  useSEO({
    title:
      "About Ortiz Insurance Broker | Trusted Agent in Corpus Christi, TX",
    description:
      "Meet Eric Ortiz, your trusted independent insurance broker in Corpus Christi, Texas. Serving South Texas families with integrity, expertise, and personalized service.",
    canonicalPath: "/about",
    keywords:
      "about Ortiz Insurance, insurance broker Corpus Christi, Eric Ortiz insurance agent, independent insurance broker South Texas",
  });

  const s1 = useInView();
  const s2 = useInView();
  const s3 = useInView();
  const cta = useInView();

  return (
    <div className="min-h-screen bg-[#F5F0E8] pt-20">
      <Navbar />

      {/* ── PAGE HERO WITH PORTRAIT ── */}
      <section className="relative pt-20 pb-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Portrait */}
            <div className="flex justify-center md:justify-start">
              <div className="relative w-full max-w-sm">
                <img
                  src="/manus-storage/founder-portrait-optimized_5153cde4.jpg"
                  alt="Portrait of the founder of Ortiz Insurance Broker"
                  className="w-full h-auto rounded-sm shadow-2xl object-cover object-center"
                  style={{ objectFit: 'cover', objectPosition: 'center' }}
                />
                <div className="absolute -bottom-3 -left-3 w-20 h-20 border-b-2 border-l-2 border-[#C9A84C]/40" />
                <div className="absolute -top-3 -right-3 w-20 h-20 border-t-2 border-r-2 border-[#C9A84C]/40" />
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center">
              <p className="section-label text-[#C9A84C] mb-3">Meet the Founder</p>
              <h1 className="font-['Playfair_Display'] text-4xl sm:text-5xl font-bold text-[#0D1B3E] mb-6 leading-tight">
                Eric Ortiz
              </h1>
              <div className="gold-rule w-16 mb-6" />
              <p className="text-[#6B6B6B] text-base leading-relaxed font-['Lato'] mb-6">
                With dedicated expertise in insurance and financial planning, Eric founded Ortiz Insurance to bring honest, personalized service to South Texas families and businesses.
              </p>
              <p className="text-[#6B6B6B] text-base leading-relaxed font-['Lato'] mb-8">
                As an independent broker, Eric is committed to finding the right coverage at the right price — always putting your needs first.
              </p>
              <div className="flex flex-col gap-3">
                <div className="inline-flex items-center gap-2.5 bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-sm px-5 py-2.5 w-fit">
                  <Shield size={15} className="text-[#C9A84C]" />
                  <span className="text-[#C9A84C] text-[0.7rem] font-bold tracking-[0.2em] font-['Lato'] uppercase">
                    Licensed in 50+ States
                  </span>
                </div>
                <div className="inline-flex items-center gap-2.5 bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-sm px-5 py-2.5 w-fit">
                  <span className="text-[#C9A84C] text-[0.7rem] font-bold tracking-[0.2em] font-['Lato'] uppercase">
                    NPN # 21406077
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT STORY SECTION ── */}
      <section className="relative pt-28 pb-28 bg-[#F5F0E8]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="section-label mb-3">Our Story</p>
            <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl font-bold text-[#0D1B3E] leading-tight">
              About Ortiz Insurance
            </h2>
            <div className="gold-rule w-16 mx-auto mt-6" />
          </div>
          <p className="text-[#6B6B6B] text-base leading-relaxed font-['Lato'] mb-6">
            A Corpus Christi insurance brokerage built on trust, expertise, and a
            genuine commitment to protecting the people and businesses of South
            Texas.
          </p>
        </div>
      </section>

      {/* ── MISSION SECTION ── */}
      <section className="py-28 bg-white" ref={s1.ref}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <div className="relative order-2 lg:order-1">
              <div
                className="rounded-sm overflow-hidden h-80 lg:h-[480px]"
                style={{
                  backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/112286430/VpboFheV3AGxAWHe4GAyVf/hero-bg-7VRV92Z9tfmRkYoG7Uh6jQ.webp)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div className="absolute -bottom-4 -left-4 w-20 h-20 border-b-2 border-l-2 border-[#C9A84C]/40" />
              <div className="absolute -top-4 -right-4 w-20 h-20 border-t-2 border-r-2 border-[#C9A84C]/40" />
            </div>

            {/* Text */}
            <div
              className={`order-1 lg:order-2 transition-all duration-700 ${
                s1.inView
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-8"
              }`}
            >
              <p className="section-label mb-3">Our Mission</p>
              <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-[#0D1B3E] mb-6 leading-tight">
                Promise Today,
                <br />
                <span className="italic text-[#C9A84C]">
                  Protect Tomorrow.
                </span>
              </h2>
              <div className="gold-rule w-14 mb-8" />
              <p className="text-[#6B6B6B] leading-relaxed font-['Lato'] mb-5 text-[0.95rem]">
                Ortiz Insurance Broker was founded with a single purpose: to
                provide the people of Corpus Christi and South Texas with honest,
                expert insurance guidance they can rely on. We believe that
                insurance is more than a policy — it&apos;s a promise to be
                there when life takes an unexpected turn.
              </p>
              <p className="text-[#6B6B6B] leading-relaxed font-['Lato'] mb-5 text-[0.95rem]">
                As an independent broker, we are not tied to any single carrier.
                That means we shop the market on your behalf, comparing options
                from multiple top-rated insurance companies to find the coverage
                that best fits your needs and budget.
              </p>
              <p className="text-[#6B6B6B] leading-relaxed font-['Lato'] text-[0.95rem]">
                From life and health insurance to commercial coverage,
                annuities, and pension planning — we are your one-stop resource
                for comprehensive financial protection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="py-28 bg-[#F5F0E8]" ref={s2.ref}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <p className="section-label mb-3">What Drives Us</p>
            <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl font-bold text-[#0D1B3E] leading-tight">
              Our Core Values
            </h2>
            <div className="gold-rule w-16 mx-auto mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <div
                key={v.title}
                className={`bg-white border border-[#E8E0D0] p-9 rounded-lg card-luxury flex gap-6 transition-all duration-700 hover:border-[#C9A84C]/40 hover:shadow-lg group ${
                  s2.inView
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-full bg-[#0D1B3E] flex items-center justify-center shrink-0 group-hover:bg-[#C9A84C]/10 group-hover:border group-hover:border-[#C9A84C]/30 transition-all duration-300">
                  <v.icon
                    size={20}
                    className="text-[#C9A84C] group-hover:text-[#0D1B3E] transition-colors duration-300"
                  />
                </div>
                <div>
                  <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#0D1B3E] mb-2">
                    {v.title}
                  </h3>
                  <p className="text-[#6B6B6B] text-sm leading-relaxed font-['Lato']">
                    {v.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CORPUS CHRISTI PRIDE BAND ── */}
      <section
        className="relative py-28 overflow-hidden"
        style={{
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/112286430/VpboFheV3AGxAWHe4GAyVf/contact-bg-d4HcAVgcpvygnwxKBtaNBX.webp)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
        ref={s3.ref}
      >
        <div className="absolute inset-0 bg-[#0D1B3E]/85" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div
            className={`transition-all duration-700 ${
              s3.inView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <p className="section-label text-[#C9A84C] mb-4">
              Proudly Serving
            </p>
            <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Corpus Christi &<br />
              <span className="italic text-[#C9A84C]">South Texas</span>
            </h2>
            <div className="gold-rule w-16 mx-auto mb-8" />
            <p className="text-white/60 text-base sm:text-lg leading-relaxed font-['Lato'] max-w-2xl mx-auto mb-8">
              From the shores of Corpus Christi Bay to the communities of the
              Coastal Bend, Ortiz Insurance is proud to serve the families,
              educators, and business owners who make South Texas great. We are
              your neighbors — and we take that responsibility seriously.
            </p>
            <p className="text-[#C9A84C]/70 text-[0.65rem] font-bold tracking-[0.2em] uppercase font-['Lato']">
              Based in Corpus Christi &middot; Licensed in 50+ States &middot;
              Serving Clients Nationwide
            </p>
          </div>
        </div>
      </section>



      {/* ── CTA ── */}
      <div ref={cta.ref} className="bg-[#0D1B3E] py-24 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent" />
        <div
          className={`max-w-3xl mx-auto px-6 text-center transition-all duration-700 ${
            cta.inView
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <p className="section-label text-[#C9A84C] mb-4">
            Let&apos;s Connect
          </p>
          <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to Work With
            <br />
            <span className="italic text-[#C9A84C]">Ortiz Insurance?</span>
          </h2>
          <div className="gold-rule w-16 mx-auto mb-10" />
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm sm:max-w-none mx-auto">
            <Link
              href="/quote"
              className="btn-gold w-full sm:w-auto px-12 py-4 rounded-sm text-sm font-bold tracking-widest uppercase inline-flex items-center justify-center gap-2 group"
            >
              Get A Free Quote
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
            <a
              href="tel:3616138336"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-10 py-4 rounded-sm text-sm font-bold tracking-widest uppercase border-2 border-white/30 text-white hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all duration-300"
            >
              <Phone size={16} /> (361) 613-8336
            </a>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent" />
      </div>

      <Footer />
    </div>
  );
}
