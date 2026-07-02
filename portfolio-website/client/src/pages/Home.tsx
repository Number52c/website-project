/*
   HOME PAGE — Ortiz Insurance
   Design: Bold Modern Luxury — Premium Hybrid System
   Hero: Cinematic, dynamic, impressive with smooth reveals
   Services: Asymmetric layout, custom icons, strategic gold accents
   Motion: Smooth, intentional, guides attention
   ============================================================= */

import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FAQSection from "@/components/FAQSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CaseStudiesSection from "@/components/CaseStudiesSection";


import { useSEO } from "@/hooks/useSEO";

import { FadeInContainer, StaggerContainer, StaggerItem, ScaleOnHover } from "@/components/AnimatedElements";
import { Shield, Heart, Building2, TrendingUp, GraduationCap, ChevronRight, Phone, Star, CircleCheck as CheckCircle2, ArrowRight, Zap, Target } from "lucide-react";

// Intersection observer hook for scroll animations
function useInView(threshold = 0.12) {
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

// Parallax hook for scroll-based transforms (disabled on mobile)
function useParallax(speed = 0.5) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const scrolled = window.scrollY;
      const elementTop = rect.top + scrolled;
      
      if (scrolled < elementTop + window.innerHeight && scrolled + window.innerHeight > elementTop) {
        const parallaxOffset = (scrolled - elementTop + window.innerHeight) * speed;
        setOffset(parallaxOffset);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed, isMobile]);

  return { ref, offset };
}

const services = [
  {
    icon: Heart,
    title: "Life Insurance",
    desc: "Protect your family's future with tailored life insurance coverage that gives you peace of mind today.",
    color: "from-blue-500/10 to-blue-500/5",
  },
  {
    icon: Shield,
    title: "Health Insurance",
    desc: "Comprehensive health coverage plans for individuals, families, and businesses across South Texas.",
    color: "from-green-500/10 to-green-500/5",
  },
  {
    icon: Building2,
    title: "Commercial Property & Casualty",
    desc: "Safeguard your business assets with robust commercial property and casualty insurance solutions.",
    color: "from-purple-500/10 to-purple-500/5",
  },
  {
    icon: TrendingUp,
    title: "FIAs & Annuities",
    desc: "Grow and protect your retirement savings with Fixed Indexed Annuities and annuity strategies.",
    color: "from-amber-500/10 to-amber-500/5",
  },
  {
    icon: GraduationCap,
    title: "Pension Planning",
    desc: "Expert pension planning guidance to help educators and professionals build a secure retirement.",
    color: "from-rose-500/10 to-rose-500/5",
  },
];

const stats = [
  { value: "500+", label: "Families Protected", icon: Heart },
  { value: "50+", label: "States Licensed", icon: Shield },
  { value: "100%", label: "Local & Trusted", icon: Target },
];

const trustPoints = [
  {
    title: "Local Expertise",
    desc: "Deep knowledge of South Texas markets, regulations, and the unique needs of Corpus Christi residents and businesses.",
  },
  {
    title: "Personalized Service",
    desc: "No call centers. You work directly with Eric Ortiz — a dedicated broker who knows your name and your policy.",
  },
  {
    title: "Comprehensive Solutions",
    desc: "From life and health to commercial and retirement planning, we cover every stage of your financial journey.",
  },
  {
    title: "Trusted & Licensed",
    desc: "A fully licensed Texas insurance broker with a track record of integrity and client satisfaction.",
  },
];

export default function Home() {
  useSEO({
    title:
      "Ortiz Insurance Broker | Life Insurance & Annuities in Corpus Christi, TX",
    description:
      "Trusted independent insurance broker in Corpus Christi, Texas. Life insurance, final expense, annuities, and retirement planning. Free quotes — call (361) 613-8336.",
    canonicalPath: "/",
    keywords:
      "insurance broker Corpus Christi, life insurance Corpus Christi TX, annuities South Texas, final expense insurance, insurance agent near me",
  });

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const servicesSection = useInView();
  const statsSection = useInView();
  const aboutSection = useInView();
  const trustSection = useInView();
  const ctaSection = useInView();

  // Parallax effects
  const heroParallax = useParallax(0.5);
  const aboutParallax = useParallax(0.4);

  return (
    <div className="min-h-screen bg-white pt-20">
      <Navbar />

      {/* ── HERO SECTION ── Cinematic, Dynamic, Impressive */}
      <section
        ref={heroParallax.ref}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(5, 12, 28, 0.25), rgba(5, 12, 28, 0.30)), url('/manus-storage/hooks-bg-optimized_3615c91a.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundAttachment: "scroll",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Enhanced contrast overlay to make stadium pop */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1628]/40 via-[#0D1B3E]/20 to-[#0A1628]/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/30 via-transparent to-[#0A1628]/30" />

        {/* Premium gold accent line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Location badge */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#D4AF37]/60" />
              <span className="font-semibold text-[#D4AF37] text-sm md:text-base tracking-widest uppercase">
                Corpus Christi, Texas
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#D4AF37]/60" />
            </div>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Protecting What
            <br />
            <span className="text-[#D4AF37] italic">Matters Most</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="text-white/80 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Life, health, commercial, and retirement solutions — delivered with integrity by a trusted South Texas insurance broker.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm sm:max-w-none mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link
              href="/quote"
              className="btn-gold w-full sm:w-auto px-10 py-4 rounded text-sm font-bold tracking-wider uppercase inline-flex items-center justify-center gap-2 group hover:shadow-xl transition-all duration-300"
            >
              Get A Free Quote
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/services"
              className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 rounded text-sm font-bold tracking-wider uppercase border-2 border-white/40 text-white hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all duration-300"
            >
              Explore Services
            </Link>
          </motion.div>

          {/* Trust badge */}
          <motion.div
            className="mt-12 inline-flex items-center gap-2.5 bg-white/8 backdrop-blur-md border border-[#D4AF37]/30 rounded-full px-5 py-2.5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Shield size={15} className="text-[#D4AF37]" />
            <span className="text-[#D4AF37]/90 text-xs font-bold tracking-widest uppercase">
              Licensed in 50+ States
            </span>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-5 h-8 rounded-full border border-[#D4AF37]/40 flex items-start justify-center p-1.5">
            <div className="w-1 h-2 rounded-full bg-[#D4AF37]/60" />
          </div>
        </motion.div>
      </section>

      {/* ── STATS SECTION ── Trust Signals with Icons */}
      <section ref={statsSection.ref} className="bg-[#0A1128] py-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent" />
        
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-20 max-w-4xl">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={statsSection.inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                >
                  <div className="flex justify-center mb-4">
                    <Icon className="text-[#D4AF37]" size={28} />
                  </div>
                  <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#D4AF37] mb-2">
                    {s.value}
                  </div>
                  <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">
                    {s.label}
                  </div>
                </motion.div>
              );
            })}
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent" />
      </section>

      {/* ── SERVICES SECTION ── Asymmetric, Custom Design */}
      <section className="py-32 bg-white" ref={servicesSection.ref}>
        <div className="max-w-6xl mx-auto px-6">
          {/* Section header */}
          <motion.div
            className="text-center mb-24"
            initial={{ opacity: 0, y: 20 }}
            animate={servicesSection.inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[#D4AF37] text-sm font-bold tracking-widest uppercase mb-4">What We Offer</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0A1128] leading-tight">
              Comprehensive Coverage
              <br />
              <span className="italic text-[#D4AF37]">Tailored For You</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-8" />
          </motion.div>

          {/* Featured services (top 3 in asymmetric layout) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {services.slice(0, 3).map((svc, i) => {
              const Icon = svc.icon;
              return (
                <motion.div
                  key={svc.title}
                  className="group relative"
                  initial={{ opacity: 0, y: 30 }}
                  animate={servicesSection.inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                >
                  <div className={`bg-gradient-to-br ${svc.color} border border-[#D4AF37]/10 rounded-lg p-10 hover:border-[#D4AF37]/40 transition-all duration-500 hover:shadow-lg`}>
                    <div className="w-16 h-16 rounded-lg bg-[#0A1128] flex items-center justify-center mb-6 group-hover:bg-[#D4AF37] transition-colors duration-400">
                      <Icon size={28} className="text-[#D4AF37] group-hover:text-[#0A1128] transition-colors duration-400" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0A1128] mb-3">
                      {svc.title}
                    </h3>
                    <p className="text-[#6B7280] text-sm leading-relaxed mb-6">
                      {svc.desc}
                    </p>
                    <Link
                      href="/services"
                      className="inline-flex items-center gap-2 text-[#D4AF37] text-xs font-bold tracking-widest uppercase group-hover:gap-3 transition-all duration-300"
                    >
                      Explore <ChevronRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Secondary services (bottom 2, centered) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto mb-16">
            {services.slice(3).map((svc, i) => {
              const Icon = svc.icon;
              return (
                <motion.div
                  key={svc.title}
                  className="group relative"
                  initial={{ opacity: 0, y: 30 }}
                  animate={servicesSection.inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: (i + 3) * 0.1, duration: 0.6 }}
                >
                  <div className={`bg-gradient-to-br ${svc.color} border border-[#D4AF37]/10 rounded-lg p-10 hover:border-[#D4AF37]/40 transition-all duration-500 hover:shadow-lg`}>
                    <div className="w-16 h-16 rounded-lg bg-[#0A1128] flex items-center justify-center mb-6 group-hover:bg-[#D4AF37] transition-colors duration-400">
                      <Icon size={28} className="text-[#D4AF37] group-hover:text-[#0A1128] transition-colors duration-400" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0A1128] mb-3">
                      {svc.title}
                    </h3>
                    <p className="text-[#6B7280] text-sm leading-relaxed mb-6">
                      {svc.desc}
                    </p>
                    <Link
                      href="/services"
                      className="inline-flex items-center gap-2 text-[#D4AF37] text-xs font-bold tracking-widest uppercase group-hover:gap-3 transition-all duration-300"
                    >
                      Explore <ChevronRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* CTA Button */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={servicesSection.inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Link
              href="/services"
              className="btn-gold px-12 py-4 rounded text-sm font-bold tracking-wider uppercase inline-flex items-center gap-2 group hover:shadow-xl transition-all duration-300"
            >
              View All Services
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── ABOUT SECTION ── Premium Authority */}
      <section
        ref={aboutParallax.ref}
        className="relative py-32 overflow-hidden"
        style={{
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/112286430/VpboFheV3AGxAWHe4GAyVf/about-bg-3477vrqfUHn2wqFWdS79KV.webp)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-[#0A1128]/85" />

        <motion.div
          ref={aboutSection.ref}
          className="relative z-10 max-w-3xl mx-auto px-6 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={aboutSection.inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p className="text-[#D4AF37] text-sm font-bold tracking-widest uppercase mb-4">
            About Ortiz Insurance
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Rooted in Corpus Christi,
            <br />
            Committed to You
          </h2>
          <p className="text-white/80 text-lg leading-relaxed mb-8">
            Ortiz Insurance Broker is a locally owned agency proudly serving Corpus Christi and the surrounding South Texas community. We specialize in building long-term relationships — understanding your unique needs and delivering coverage that truly protects what you've worked hard to build.
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-[#D4AF37] text-sm font-bold tracking-widest uppercase hover:gap-3 transition-all duration-300"
          >
            Our Story <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* ── TRUST SECTION ── Why Choose Us */}
      <section className="py-32 bg-white" ref={trustSection.ref}>
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={trustSection.inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[#D4AF37] text-sm font-bold tracking-widest uppercase mb-4">Why Choose Us</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0A1128] leading-tight">
              A Promise You Can
              <br />
              Count On
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {trustPoints.map((point, i) => (
              <motion.div
                key={point.title}
                className="flex gap-6"
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                animate={trustSection.inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center">
                    <CheckCircle2 className="text-[#D4AF37]" size={24} />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0A1128] mb-2">
                    {point.title}
                  </h3>
                  <p className="text-[#6B7280] leading-relaxed">
                    {point.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <div>
        <TestimonialsSection />
        <CaseStudiesSection />
      </div>
      {/* FAQ SECTION */}
      <FAQSection />
      {/* CALL TO ACTION SECTION */}
      <section className="py-24 bg-gradient-to-r from-[#0A1128] to-[#1a2a4a] relative overflow-hidden" ref={ctaSection.ref}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl" />
        </div>

        <motion.div
          className="relative z-10 max-w-3xl mx-auto px-6 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={ctaSection.inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Protected?
          </h2>
          <p className="text-white/80 text-lg mb-10">
            Call us today or request a free, no-obligation quote. We're here to help Corpus Christi families and businesses thrive.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/quote"
              className="btn-gold px-12 py-4 rounded text-sm font-bold tracking-wider uppercase inline-flex items-center justify-center gap-2 group hover:shadow-xl transition-all duration-300"
            >
              Get A Free Quote
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <a
              href="tel:3616138336"
              className="px-12 py-4 rounded text-sm font-bold tracking-wider uppercase border-2 border-white/40 text-white hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all duration-300 inline-flex items-center justify-center gap-2"
            >
              <Phone size={16} />
              Call (361) 613-8336
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[#D4AF37] text-sm font-bold tracking-widest uppercase mb-4">Questions?</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0A1128] leading-tight">
              Frequently Asked Questions
            </h2>
          </motion.div>
          <FAQSection />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}
