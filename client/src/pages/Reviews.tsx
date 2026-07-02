/* =============================================================
   REVIEWS PAGE — Ortiz Insurance
   Design: Heraldic Prestige — Navy + Gold + Corpus Christi imagery
   ============================================================= */

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useRef, useState } from "react";
import {
  Star,
  ExternalLink,
  Copy,
  CheckCheck,
  MessageSquare,
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const GOOGLE_REVIEW_URL = `https://www.google.com/maps/place/Ortiz+Insurance+Broker/@27.6677033,-97.4002792,17z/data=!3m1!4b1!4m6!3m5!1s0x8668f52540af28e5:0xe9e656a14c8983f8!8m2!3d27.6677033!4d-97.4002792!16s%2Fg%2F11nhlbspv6?hl=en&entry=ttu#lrd=0x8668f52540af28e5:0xe9e656a14c8983f8,1`;

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

const steps = [
  {
    num: "01",
    title: "Click the Button Below",
    desc: "Tap 'Leave Us a Google Review' and it will open your Google review form directly — no searching required.",
  },
  {
    num: "02",
    title: "Sign In to Google",
    desc: "If you're not already signed in, Google will ask you to log in with your Gmail or Google account.",
  },
  {
    num: "03",
    title: "Choose Your Star Rating",
    desc: "Select 1\u20135 stars. We strive for 5-star service every time — your honest feedback means the world to us.",
  },
  {
    num: "04",
    title: "Share Your Experience",
    desc: "Write a few sentences about your experience with Ortiz Insurance. Even a short review makes a big difference.",
  },
];

export default function Reviews() {
  useSEO({
    title: "Reviews | Ortiz Insurance Broker | Corpus Christi, TX",
    description:
      "Read reviews from satisfied clients of Ortiz Insurance Broker in Corpus Christi, TX. See why families trust us for life insurance, annuities, and retirement planning.",
    canonicalPath: "/reviews",
    keywords:
      "Ortiz Insurance reviews, insurance broker reviews Corpus Christi, life insurance reviews Texas",
  });

  const [copied, setCopied] = useState(false);
  const s1 = useInView();
  const s2 = useInView();
  const s3 = useInView();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `https://www.ortizinsurancebroker.com/reviews`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen pt-20 bg-[#F5F0E8]">
      <Navbar />

      {/* ── HERO ── */}
      <section
        className="relative pt-40 pb-28 overflow-hidden"
        style={{
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/112286430/VpboFheV3AGxAWHe4GAyVf/hero-bg-7VRV92Z9tfmRkYoG7Uh6jQ.webp)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D1B3E]/80 via-[#0D1B3E]/75 to-[#0D1B3E]/90" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="flex justify-center gap-1.5 mb-6">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={24}
                className="text-[#C9A84C] fill-[#C9A84C]"
              />
            ))}
          </div>
          <p className="section-label text-[#C9A84C] mb-4">
            Share Your Experience
          </p>
          <h1 className="font-['Playfair_Display'] text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Leave Us a Review
          </h1>
          <div className="gold-rule w-20 mx-auto mb-8" />
          <p className="text-white/70 text-base sm:text-lg font-['Lato'] max-w-2xl mx-auto leading-relaxed">
            Your feedback helps other South Texas families and businesses find
            trusted insurance coverage. It takes less than 2 minutes — and it
            means everything to us.
          </p>
        </div>
      </section>

      {/* ── MAIN CTA CARD ── */}
      <section className="py-24" ref={s1.ref}>
        <div className="max-w-3xl mx-auto px-6">
          <div
            className={`bg-[#0D1B3E] rounded-sm overflow-hidden transition-all duration-700 ${
              s1.inView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            {/* Gold top bar */}
            <div className="h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

            <div className="p-10 md:p-14 text-center">
              {/* Logo */}
              <img
                src="/manus-storage/ortiz-lion-crest-transparent_3447f82e.png"
                alt="Ortiz Insurance"
                className="h-16 w-auto object-contain mx-auto mb-8"
              />

              <div className="gold-rule w-16 mx-auto mb-8" />

              <h2 className="font-['Playfair_Display'] text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                How Was Your Experience
                <br />
                <span className="italic text-[#C9A84C]">
                  With Ortiz Insurance?
                </span>
              </h2>

              <p className="text-white/50 font-['Lato'] mb-10 max-w-xl mx-auto leading-relaxed text-[0.95rem]">
                We&apos;d be honored if you took a moment to share your
                experience on Google. Your review helps our community find
                reliable insurance guidance right here in Corpus Christi.
              </p>

              {/* Star display */}
              <div className="flex justify-center gap-2.5 mb-10">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={32}
                    className="text-[#C9A84C] fill-[#C9A84C]"
                  />
                ))}
              </div>

              {/* Primary CTA */}
              <a
                href={GOOGLE_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold w-full sm:w-auto inline-flex items-center justify-center gap-3 px-12 py-5 rounded-sm text-sm font-bold tracking-widest uppercase group"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 shrink-0"
                  fill="currentColor"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Leave Us a Google Review
                <ExternalLink
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>

              <div className="gold-rule w-16 mx-auto my-10" />

              {/* Share this link */}
              <div>
                <p className="text-white/30 text-[0.65rem] tracking-[0.2em] uppercase font-['Lato'] mb-4">
                  Share this review page with a client
                </p>
                <div className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-sm px-5 py-3 max-w-sm mx-auto">
                  <span className="text-white/50 text-sm font-['Lato'] truncate flex-1">
                    ortizinsurancebroker.com/reviews
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors duration-300 shrink-0 flex items-center gap-1.5 text-[0.65rem] font-bold font-['Lato'] uppercase tracking-[0.15em]"
                  >
                    {copied ? (
                      <>
                        <CheckCheck size={13} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={13} /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 bg-white" ref={s2.ref}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-20">
            <p className="section-label mb-3">Simple & Quick</p>
            <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-[#0D1B3E]">
              How to Leave a Review
            </h2>
            <div className="gold-rule w-16 mx-auto mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className={`text-center transition-all duration-700 ${
                  s2.inView
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="w-14 h-14 rounded-full bg-[#0D1B3E] flex items-center justify-center mx-auto mb-5">
                  <span className="font-['Playfair_Display'] text-[#C9A84C] font-bold text-lg">
                    {step.num}
                  </span>
                </div>
                <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#0D1B3E] mb-2">
                  {step.title}
                </h3>
                <p className="text-[#6B6B6B] text-sm leading-relaxed font-['Lato']">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY REVIEWS MATTER BAND ── */}
      <section
        className="relative py-24 overflow-hidden"
        style={{
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/112286430/VpboFheV3AGxAWHe4GAyVf/about-bg-3477vrqfUHn2wqFWdS79KV.webp)`,
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
          backgroundAttachment: "fixed",
        }}
        ref={s3.ref}
      >
        <div className="absolute inset-0 bg-[#0D1B3E]/85" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-10 text-center transition-all duration-700 ${
              s3.inView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div>
              <div className="w-14 h-14 rounded-full border border-[#C9A84C]/20 flex items-center justify-center mx-auto mb-5">
                <MessageSquare size={24} className="text-[#C9A84C]" />
              </div>
              <h3 className="font-['Playfair_Display'] text-white text-xl font-bold mb-3">
                Help Your Neighbors
              </h3>
              <p className="text-white/50 text-sm font-['Lato'] leading-relaxed">
                Your review helps other Corpus Christi families find trusted
                insurance guidance when they need it most.
              </p>
            </div>
            <div>
              <div className="w-14 h-14 rounded-full border border-[#C9A84C]/20 flex items-center justify-center mx-auto mb-5">
                <Star
                  size={24}
                  className="text-[#C9A84C] fill-[#C9A84C]"
                />
              </div>
              <h3 className="font-['Playfair_Display'] text-white text-xl font-bold mb-3">
                Build Our Reputation
              </h3>
              <p className="text-white/50 text-sm font-['Lato'] leading-relaxed">
                As a small local business, every Google review directly supports
                our ability to serve the South Texas community.
              </p>
            </div>
            <div>
              <div className="w-14 h-14 rounded-full border border-[#C9A84C]/20 flex items-center justify-center mx-auto mb-5">
                <ExternalLink size={24} className="text-[#C9A84C]" />
              </div>
              <h3 className="font-['Playfair_Display'] text-white text-xl font-bold mb-3">
                Takes 2 Minutes
              </h3>
              <p className="text-white/50 text-sm font-['Lato'] leading-relaxed">
                A quick star rating and a sentence or two is all it takes. We
                are grateful for every single review we receive.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
