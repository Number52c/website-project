/**
 * Blog / Resource Center — SEO Content Hub
 * Lists all blog articles for internal linking and organic traffic.
 */

import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, Clock, ArrowRight, BookOpen } from "lucide-react";

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

interface BlogPost {
  title: string;
  excerpt: string;
  slug: string;
  date: string;
  readTime: string;
  category: string;
}

const blogPosts: BlogPost[] = [
  {
    title: "How Much Life Insurance Do I Need? A Complete Guide for Texas Families",
    excerpt: "Learn the exact formula to calculate the right amount of life insurance for your family. We break down the income replacement method, DIME formula, and real-world examples for Corpus Christi families.",
    slug: "/blog/how-much-life-insurance-do-i-need",
    date: "May 28, 2026",
    readTime: "8 min read",
    category: "Life Insurance",
  },
  {
    title: "Final Expense Insurance vs. Pre-Paid Funeral Plans: Which Is Better?",
    excerpt: "Comparing the pros and cons of final expense insurance and pre-paid funeral plans. Discover which option provides better value, flexibility, and protection for your family in South Texas.",
    slug: "/blog/final-expense-vs-prepaid-funeral",
    date: "May 25, 2026",
    readTime: "7 min read",
    category: "Final Expense",
  },
  {
    title: "What Is a Fixed Index Annuity? A Beginner's Guide to FIAs",
    excerpt: "Everything you need to know about Fixed Index Annuities — how they work, their benefits and drawbacks, and whether an FIA is right for your retirement plan.",
    slug: "/blog/what-is-fixed-index-annuity",
    date: "May 22, 2026",
    readTime: "9 min read",
    category: "Annuities",
  },
  {
    title: "Term vs. Whole Life Insurance: Which Is Right for You?",
    excerpt: "A side-by-side comparison of term and whole life insurance — costs, pros and cons, and expert recommendations to help you choose the right coverage for your family.",
    slug: "/blog/term-vs-whole-life-insurance",
    date: "May 20, 2026",
    readTime: "8 min read",
    category: "Life Insurance",
  },
  {
    title: "Life Insurance for Seniors Over 50: Your Options Explained",
    excerpt: "You have more options than you think. From no-exam policies to guaranteed issue coverage, here's how to find affordable life insurance after 50 — even with health conditions.",
    slug: "/blog/life-insurance-seniors-over-50",
    date: "May 18, 2026",
    readTime: "9 min read",
    category: "Life Insurance",
  },
  {
    title: "Can You Get Life Insurance With Pre-Existing Conditions?",
    excerpt: "The answer is almost always yes. From diabetes to heart disease to cancer history — learn how to find affordable coverage when you have health challenges.",
    slug: "/blog/life-insurance-pre-existing-conditions",
    date: "May 15, 2026",
    readTime: "8 min read",
    category: "Life Insurance",
  },
  {
    title: "Why Every Parent Needs Life Insurance",
    excerpt: "Your children depend on you for everything. Life insurance ensures they'll be taken care of — no matter what. Here's why it's the most important purchase you'll make as a parent.",
    slug: "/blog/why-parents-need-life-insurance",
    date: "May 12, 2026",
    readTime: "7 min read",
    category: "Life Insurance",
  },
  {
    title: "Graded vs. Guaranteed Issue Life Insurance: What's the Difference?",
    excerpt: "Understanding the key differences between graded benefit and guaranteed issue life insurance policies. Which one is right for you if you have health conditions?",
    slug: "/blog/graded-vs-guaranteed-issue",
    date: "May 12, 2026",
    readTime: "6 min read",
    category: "Life Insurance",
  },
];

const categories = ["All", "Life Insurance", "Final Expense", "Annuities", "Retirement"];

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("All");
  const postsSection = useInView();

  useEffect(() => {
    document.title = "Insurance Blog & Resources | Ortiz Insurance Broker";
    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.content = content;
    };
    setMeta("description", "Expert insurance guides, tips, and resources from Ortiz Insurance Broker in Corpus Christi, TX. Learn about life insurance, final expense, annuities, and retirement planning.");
    setMeta("keywords", "insurance blog, life insurance guide, final expense tips, annuity guide, retirement planning Texas");
    return () => { document.title = "Ortiz Insurance Broker | Life Insurance & Annuities in Corpus Christi, TX"; };
  }, []);

  const filteredPosts = activeCategory === "All"
    ? blogPosts
    : blogPosts.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen pt-20 bg-[#F5F0E8]">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative pt-20 pb-16 bg-[#0D1B3E] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D1B3E] via-[#0D1B3E] to-[#1a2d5a]" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-4">
          <p className="section-label text-[#C9A84C] mb-4 animate-fade-in-up">Insurance Resources</p>
          <h1 className="font-['Playfair_Display'] text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 animate-fade-in-up animate-delay-200">
            Insurance Guides & <span className="italic text-[#C9A84C]">Expert Advice</span>
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-3xl font-['Lato'] leading-relaxed animate-fade-in-up animate-delay-300">
            Free educational resources to help you make informed decisions about life insurance, final expense coverage, annuities, and retirement planning.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
      </section>

      {/* ── CATEGORY FILTER ── */}
      <section className="py-8 bg-white border-b border-[#E8E0D0]">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-sm text-xs font-bold tracking-widest uppercase font-['Lato'] transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-[#0D1B3E] text-[#C9A84C]"
                  : "bg-[#F5F0E8] text-[#5A5A5A] hover:bg-[#E8E0D0]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ── BLOG POSTS ── */}
      <section className="py-16 bg-[#F5F0E8]" ref={postsSection.ref}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPosts.map((post, i) => (
              <Link
                key={post.slug}
                href={post.slug}
                className={`group bg-white border border-[#E8E0D0] rounded-sm overflow-hidden hover:shadow-xl hover:border-[#C9A84C]/40 transition-all duration-500 ${postsSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] tracking-widest uppercase font-bold text-[#C9A84C] bg-[#C9A84C]/10 px-3 py-1 rounded-sm font-['Lato']">
                      {post.category}
                    </span>
                  </div>
                  <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#0D1B3E] mb-3 group-hover:text-[#C9A84C] transition-colors duration-300 leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-[#5A5A5A] text-sm leading-relaxed font-['Lato'] mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-[#5A5A5A]/70 font-['Lato']">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[#C9A84C] text-xs font-bold tracking-widest uppercase group-hover:gap-2 transition-all duration-300">
                      Read <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <BookOpen size={48} className="text-[#C9A84C]/40 mx-auto mb-4" />
              <p className="text-[#5A5A5A] font-['Lato']">No articles in this category yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="bg-[#0D1B3E] py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-['Playfair_Display'] text-3xl font-bold text-white mb-4">
            Have Questions? <span className="italic text-[#C9A84C]">We're Here to Help</span>
          </h2>
          <p className="text-white/70 font-['Lato'] mb-8">
            Get personalized advice from a licensed insurance broker in Corpus Christi, TX.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm sm:max-w-none mx-auto">
            <Link href="/quote" className="btn-gold w-full sm:w-auto px-10 py-4 rounded-sm text-sm font-bold tracking-widest uppercase text-center block">
              Get A Free Quote
            </Link>
            <a href="tel:3616138336" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 rounded-sm text-sm font-bold tracking-widest uppercase border-2 border-white/40 text-white hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all duration-300">
              (361) 613-8336
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
