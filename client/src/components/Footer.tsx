/**
 * client/src/components/Footer.tsx
 * Site-wide footer with brand, quick links, services, contact, and social icons.
 */

import { Link } from "wouter";
import { Phone, Mail, MapPin, Notebook as Facebook, Link as Linkedin, Drama as Instagram, Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0A1428] text-white/80">
      {/* Gold top rule */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-20 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <img
              src="/manus-storage/ortiz-lion-crest-transparent_3447f82e.png"
              alt="Ortiz Insurance"
              className="h-16 w-auto object-contain mb-5"
            />
            <p className="text-white/50 text-sm leading-relaxed font-['Lato']">
              Serving Corpus Christi and South Texas with integrity, expertise,
              and a personal commitment to your financial security.
            </p>
            <p className="text-[#C9A84C]/80 text-xs tracking-widest uppercase font-bold mt-5 italic font-['Lato']">
              &ldquo;Promise Today, Protect Tomorrow.&rdquo;
            </p>
            <div className="mt-5 inline-flex items-center gap-2 bg-[#C9A84C]/5 border border-[#C9A84C]/20 rounded-full px-4 py-2">
              <Shield size={13} className="text-[#C9A84C]/70" />
              <span className="text-[#C9A84C]/80 text-[0.65rem] font-bold tracking-[0.15em] font-['Lato'] uppercase">
                Licensed in 50+ States
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-['Playfair_Display'] text-white text-base font-semibold mb-6 tracking-wide">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Home", href: "/" },
                { label: "Services", href: "/services" },
                { label: "About Us", href: "/about" },
                { label: "Get A Quote", href: "/quote" },
                { label: "Contact", href: "/contact" },
                { label: "Resources & Blog", href: "/blog" },
                { label: "Leave a Review", href: "/reviews" },
                { label: "Client Portal", href: "/portal/login" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/45 hover:text-[#C9A84C] transition-all duration-300 text-sm font-['Lato'] tracking-wide inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-4 h-px bg-[#C9A84C] transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-['Playfair_Display'] text-white text-base font-semibold mb-6 tracking-wide">
              Our Services
            </h4>
            <ul className="space-y-3">
              {[
                {
                  label: "Life Insurance",
                  href: "/life-insurance-corpus-christi",
                },
                {
                  label: "Final Expense Insurance",
                  href: "/final-expense-insurance",
                },
                {
                  label: "Whole Life Insurance",
                  href: "/whole-life-insurance",
                },
                {
                  label: "Term Life Insurance",
                  href: "/term-life-insurance",
                },
                {
                  label: "Annuities & FIAs",
                  href: "/annuities-corpus-christi",
                },
              ].map((service) => (
                <li key={service.href}>
                  <Link
                    href={service.href}
                    className="text-white/45 hover:text-[#C9A84C] transition-all duration-300 text-sm font-['Lato'] tracking-wide inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-4 h-px bg-[#C9A84C] transition-all duration-300" />
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-['Playfair_Display'] text-white text-base font-semibold mb-6 tracking-wide">
              Contact Us
            </h4>
            <ul className="space-y-5">
              <li>
                <a
                  href="tel:3616138336"
                  className="flex items-center gap-3 text-white/50 hover:text-[#C9A84C] transition-colors duration-300 group"
                >
                  <div className="w-9 h-9 rounded-full border border-[#C9A84C]/20 flex items-center justify-center group-hover:border-[#C9A84C]/50 group-hover:bg-[#C9A84C]/5 transition-all duration-300 shrink-0">
                    <Phone size={14} className="text-[#C9A84C]/70" />
                  </div>
                  <span className="text-sm font-['Lato']">(361) 613-8336</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:eortiz@ortizinsurancebroker.com"
                  className="flex items-center gap-3 text-white/50 hover:text-[#C9A84C] transition-colors duration-300 group"
                >
                  <div className="w-9 h-9 rounded-full border border-[#C9A84C]/20 flex items-center justify-center group-hover:border-[#C9A84C]/50 group-hover:bg-[#C9A84C]/5 transition-all duration-300 shrink-0">
                    <Mail size={14} className="text-[#C9A84C]/70" />
                  </div>
                  <span className="text-sm font-['Lato'] break-all">
                    eortiz@ortizinsurancebroker.com
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="https://maps.google.com/?q=5333+Yorktown+Blvd+Corpus+Christi+TX+78413"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-white/50 hover:text-[#C9A84C] transition-colors duration-300 group"
                >
                  <div className="w-9 h-9 rounded-full border border-[#C9A84C]/20 flex items-center justify-center group-hover:border-[#C9A84C]/50 group-hover:bg-[#C9A84C]/5 transition-all duration-300 shrink-0">
                    <MapPin size={14} className="text-[#C9A84C]/70" />
                  </div>
                  <span className="text-sm font-['Lato']">
                    5333 Yorktown Blvd
                    <br />
                    Corpus Christi, TX 78413
                  </span>
                </a>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex gap-3 mt-8">
              {[
                { icon: Facebook, label: "Facebook", href: "https://www.facebook.com/ortizinsurancebroker" },
                { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/ortizinsurancebroker" },
                { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/ortizinsurancebroker" },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/35 hover:text-[#C9A84C] hover:border-[#C9A84C]/40 hover:bg-[#C9A84C]/5 transition-all duration-300"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/30 text-xs font-['Lato'] tracking-wide">
            &copy; {new Date().getFullYear()} Ortiz Insurance Broker. All rights
            reserved.
          </p>
          <p className="text-white/30 text-xs font-['Lato'] tracking-wide">
            Corpus Christi, Texas &middot; Licensed in 50+ States
          </p>
        </div>
      </div>
    </footer>
  );
}
