/**
 * SEOPageLayout.tsx
 * Shared layout for SEO landing pages and blog posts.
 * Includes: Helmet-style meta injection, breadcrumbs, hero, content slot, FAQ with schema, CTA band.
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Phone, ChevronRight, ChevronDown } from "lucide-react";
import LeadCaptureWidget from "./LeadCaptureWidget";

// Intersection observer hook for scroll animations
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface SEOPageProps {
  /** Page title for <title> tag */
  title: string;
  /** Meta description */
  description: string;
  /** Canonical URL path (e.g. "/life-insurance-corpus-christi") */
  canonicalPath: string;
  /** Keywords for meta tag */
  keywords: string;
  /** Hero section heading */
  heroHeading: string;
  /** Hero subheading */
  heroSubheading: string;
  /** Hero label (small text above heading) */
  heroLabel: string;
  /** Breadcrumb items */
  breadcrumbs: { label: string; href?: string }[];
  /** FAQ items with schema markup */
  faqs?: FAQ[];
  /** Main content */
  children: React.ReactNode;
  /** Optional article schema for blog posts */
  articleSchema?: {
    headline: string;
    datePublished: string;
    dateModified: string;
    author: string;
    description: string;
  };
}

function FAQSection({ faqs }: { faqs: FAQ[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const section = useInView();

  return (
    <section className="py-20 bg-white" ref={section.ref}>
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="section-label mb-3">Common Questions</p>
          <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-[#0D1B3E]">
            Frequently Asked <span className="italic text-[#C9A84C]">Questions</span>
          </h2>
          <div className="gold-rule w-24 mx-auto mt-6" />
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`border border-[#E8E0D0] rounded-sm overflow-hidden transition-all duration-500 ${section.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left bg-[#F5F0E8] hover:bg-[#EDE6D8] transition-colors"
              >
                <h3 className="font-['Playfair_Display'] font-semibold text-[#0D1B3E] text-lg pr-4">{faq.question}</h3>
                <ChevronDown
                  size={20}
                  className={`text-[#C9A84C] shrink-0 transition-transform duration-300 ${openIndex === i ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${openIndex === i ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <p className="px-6 py-5 text-[#5A5A5A] text-sm leading-relaxed font-['Lato'] bg-white">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map((faq) => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer,
              },
            })),
          }),
        }}
      />
    </section>
  );
}

export default function SEOPageLayout({
  title,
  description,
  canonicalPath,
  keywords,
  heroHeading,
  heroSubheading,
  heroLabel,
  breadcrumbs,
  faqs,
  children,
  articleSchema,
}: SEOPageProps) {
  const ctaSection = useInView();

  // Inject meta tags
  useEffect(() => {
    document.title = title;

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta("description", description);
    setMeta("keywords", keywords);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:url", `https://www.ortizinsurancebroker.com${canonicalPath}`, true);
    setMeta("og:type", articleSchema ? "article" : "website", true);
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `https://www.ortizinsurancebroker.com${canonicalPath}`;

    return () => {
      // Reset title on unmount
      document.title = "Ortiz Insurance Broker | Life Insurance & Annuities in Corpus Christi, TX";
    };
  }, [title, description, canonicalPath, keywords, articleSchema]);

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Navbar />

      {/* Article Schema for blog posts */}
      {articleSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              "headline": articleSchema.headline,
              "datePublished": articleSchema.datePublished,
              "dateModified": articleSchema.dateModified,
              "author": {
                "@type": "Person",
                "name": articleSchema.author,
              },
              "publisher": {
                "@type": "Organization",
                "name": "Ortiz Insurance Broker",
                "url": "https://www.ortizinsurancebroker.com",
              },
              "description": articleSchema.description,
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": `https://www.ortizinsurancebroker.com${canonicalPath}`,
              },
            }),
          }}
        />
      )}

      {/* ── HERO ── */}
      <section className="relative pt-20 pb-16 bg-[#0D1B3E] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D1B3E] via-[#0D1B3E] to-[#1a2d5a]" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#C9A84C]/5 to-transparent" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-4">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-['Lato'] tracking-wide mb-8" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <ChevronRight size={12} className="text-white/30" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-white/60">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>

          <p className="section-label text-[#C9A84C] mb-4 animate-fade-in-up">{heroLabel}</p>
          <h1 className="font-['Playfair_Display'] text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 animate-fade-in-up animate-delay-200">
            {heroHeading}
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-3xl font-['Lato'] leading-relaxed animate-fade-in-up animate-delay-300">
            {heroSubheading}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-10 animate-fade-in-up animate-delay-400 w-full max-w-sm sm:max-w-none mx-auto">
            <Link href="/quote" className="btn-gold w-full sm:w-auto px-10 py-4 rounded-sm text-sm font-bold tracking-widest uppercase text-center block">
              Get A Free Quote
            </Link>
            <a
              href="tel:3616138336"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 rounded-sm text-sm font-bold tracking-widest uppercase border-2 border-white/40 text-white hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all duration-300"
            >
              <Phone size={16} />
              (361) 613-8336
            </a>
          </div>

          <div className="mt-6 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-[#C9A84C]/40 rounded-sm px-4 py-2 animate-fade-in-up animate-delay-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#C9A84C]"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
            <span className="text-[#C9A84C] text-xs font-bold tracking-widest font-['Lato'] uppercase">Licensed in 50+ States</span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
      </section>

      {/* ── MAIN CONTENT ── */}
      {children}

      {/* ── FAQ SECTION ── */}
      {faqs && faqs.length > 0 && <FAQSection faqs={faqs} />}

      {/* ── INLINE LEAD CAPTURE ── */}
      <section className="py-16 bg-white">
        <div className="max-w-lg mx-auto px-6">
          <LeadCaptureWidget coverageType={heroLabel.includes("Annuit") ? "Annuities / FIAs" : heroLabel.includes("Final") ? "Final Expense / Burial Insurance" : heroLabel.includes("Whole") ? "Whole Life Insurance" : heroLabel.includes("Term") ? "Term Life Insurance" : "Life Insurance"} heading="Get Your Free Quote Now" />
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <div ref={ctaSection.ref} className="bg-[#0D1B3E] py-20">
        <div
          className={`max-w-3xl mx-auto px-6 text-center transition-all duration-700 ${ctaSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <p className="section-label text-[#C9A84C] mb-4">Ready to Get Protected?</p>
          <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-white mb-6">
            Get Your Free, No-Obligation<br />
            <span className="italic text-[#C9A84C]">Insurance Quote Today</span>
          </h2>
          <div className="gold-rule w-24 mx-auto mb-8" />
          <p className="text-white/70 font-['Lato'] mb-10 text-lg">
            Serving Corpus Christi and all of South Texas. Call us today or request a free quote — we'll help you find the right coverage for your family and budget.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm sm:max-w-none mx-auto">
            <Link href="/quote" className="btn-gold w-full sm:w-auto px-10 py-4 rounded-sm text-sm font-bold tracking-widest uppercase text-center block">
              Get A Free Quote
            </Link>
            <a
              href="tel:3616138336"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 rounded-sm text-sm font-bold tracking-widest uppercase border-2 border-white/40 text-white hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all duration-300"
            >
              <Phone size={16} />
              (361) 613-8336
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
