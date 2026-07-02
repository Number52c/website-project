/**
 * client/src/components/Navbar.tsx
 * Site-wide navigation bar. Solid navy background.
 * Three-column grid: nav links left | logo center | buttons right.
 * Mobile: logo centered with hamburger menu.
 */

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Phone, Shield, ChevronDown } from "lucide-react";


const navLinksLeft = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Resources", href: "/blog" },
  { label: "Calculator", href: "/calculator" },
  { label: "Professionals", href: "/professionals" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const navLinksRight: { label: string; href: string }[] = [];

const navLinks = [...navLinksLeft, ...navLinksRight];

// Portal Dropdown Component
function PortalDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-1.5 px-3 lg:px-4 py-2 rounded-sm text-[0.65rem] lg:text-[0.7rem] font-bold tracking-wider uppercase whitespace-nowrap bg-[#C9A84C] text-[#0D1B3E] hover:bg-[#D4AF37] transition-all duration-300"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        Portals
        <ChevronDown size={11} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {/* Dropdown Menu */}
      <div
        className={`absolute right-0 mt-0 w-48 bg-[#0D1B3E] border border-[#C9A84C]/30 rounded-sm shadow-xl transition-all duration-300 origin-top ${
          isOpen
            ? 'opacity-100 scale-y-100 pointer-events-auto'
            : 'opacity-0 scale-y-95 pointer-events-none'
        }`}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <Link
          href="/portal/login"
          className="block w-full px-4 py-3 text-[0.75rem] font-bold tracking-widest uppercase text-white hover:bg-[#C9A84C]/20 hover:text-[#C9A84C] transition-all duration-200 border-b border-[#C9A84C]/10 first:rounded-t-sm"
        >
          Client Portal
        </Link>
        <Link
          href="/agent/login"
          className="block w-full px-4 py-3 text-[0.75rem] font-bold tracking-widest uppercase text-white hover:bg-[#C9A84C]/20 hover:text-[#C9A84C] transition-all duration-200 border-b border-[#C9A84C]/10"
        >
          Agent Login
        </Link>
        <Link
          href="/admin"
          className="block w-full px-4 py-3 text-[0.75rem] font-bold tracking-widest uppercase text-white hover:bg-[#C9A84C]/20 hover:text-[#C9A84C] transition-all duration-200 last:rounded-b-sm"
        >
          Admin Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();


  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isHome = location === "/";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-[#0D1B3E] shadow-lg shadow-black/20`}
    >
      <div className="w-full px-3 sm:px-4 lg:px-6">
        {/* Desktop: 3-column grid — nav links left | logo center | buttons right */}
        <div className="hidden lg:grid grid-cols-3 items-center h-16">
          {/* Left: nav links */}
          <div className="flex items-center gap-1 xl:gap-3">
            {navLinksLeft.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-['Lato'] font-bold text-[0.6rem] xl:text-[0.7rem] tracking-widest uppercase transition-all duration-300 relative group whitespace-nowrap ${
                  location === link.href
                    ? "text-[#C9A84C]"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-1.5 left-0 h-[2px] bg-[#C9A84C] transition-all duration-300 ${
                    location === link.href
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* Center: logo — absolutely centered in the grid */}
          <div className="flex items-center justify-center">
            <Link href="/" className="flex items-center group">
              <img
                src="/manus-storage/ortiz-lion-crest-transparent_3447f82e.png"
                alt="Ortiz Insurance"
                className="h-12 xl:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Right: buttons */}
          <div className="flex items-center justify-end gap-2 lg:gap-3">
            {/* Portal Dropdown */}
            <PortalDropdown />
            <Link
              href="/quote"
              className="btn-gold px-3 lg:px-4 py-2 rounded-sm text-[0.65rem] lg:text-[0.7rem] font-bold tracking-wider uppercase whitespace-nowrap"
            >
              Get A Quote
            </Link>
            <a
              href="tel:3616138336"
              className="flex items-center text-[#C9A84C]/80 hover:text-[#C9A84C] transition-colors duration-300"
              aria-label="Call us"
            >
              <Phone size={16} />
            </a>
          </div>
        </div>

        {/* Tablet: simplified layout with logo center */}
        <div className="hidden md:flex lg:hidden items-center justify-between h-16">
          {/* Left: hamburger for tablet */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white p-1.5 rounded-sm hover:bg-white/5 transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Center: logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center">
            <img
              src="/manus-storage/ortiz-lion-crest-transparent_3447f82e.png"
              alt="Ortiz Insurance"
              className="h-11 w-auto object-contain"
            />
          </Link>

          {/* Right: buttons */}
          <div className="flex items-center gap-2">
            <Link
              href="/quote"
              className="btn-gold px-3 py-2 rounded-sm text-[0.65rem] font-bold tracking-wider uppercase whitespace-nowrap"
            >
              Quote
            </Link>
            <a
              href="tel:3616138336"
              className="text-[#C9A84C] flex items-center justify-center w-9 h-9 rounded-sm hover:bg-[#C9A84C]/10 transition-colors duration-200"
              aria-label="Call us"
            >
              <Phone size={18} />
            </a>
          </div>
        </div>

        {/* Mobile: logo centered with hamburger left, actions right */}
        <div className="flex md:hidden items-center justify-between h-16 relative">
          {/* Left: hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white p-1.5 rounded-sm hover:bg-white/5 transition-colors duration-200 z-10"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Center: logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center">
            <img
              src="/manus-storage/ortiz-lion-crest-transparent_3447f82e.png"
              alt="Ortiz Insurance"
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Right: phone icon */}
          <div className="flex items-center gap-2 z-10">
            <a
              href="tel:3616138336"
              className="text-[#C9A84C] flex items-center justify-center w-9 h-9 rounded-sm hover:bg-[#C9A84C]/10 transition-colors duration-200"
              aria-label="Call us"
            >
              <Phone size={18} />
            </a>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Menu — full screen overlay drawer */}
      {menuOpen && (
        <div
          className="lg:hidden fixed inset-0 top-16 z-40 bg-black/50"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <div
        className={`lg:hidden fixed left-0 right-0 top-16 z-50 bg-[#0D1B3E] shadow-lg transition-all duration-400 transform ${
          menuOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-full pointer-events-none"
        }`}
        style={{
          transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        <div className="px-6 py-8 pb-24 flex flex-col gap-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-['Lato'] text-base tracking-widest uppercase py-4 border-b border-white/[0.06] transition-all duration-500 ${
                location === link.href
                  ? "text-[#C9A84C]"
                  : "text-white/70 hover:text-white"
              } ${menuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{
                transitionDelay: menuOpen ? `${i * 50}ms` : "0ms",
              }}
            >
              {link.label}
            </Link>
          ))}
          <div
            className={`flex flex-col gap-3 mt-6 transition-all duration-500 ${
              menuOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{
              transitionDelay: menuOpen ? `${navLinks.length * 50}ms` : "0ms",
            }}
          >
            <Link
              href="/portal/login"
              className="px-5 py-2 rounded-sm text-[0.75rem] font-bold tracking-widest uppercase whitespace-nowrap bg-[#C9A84C] text-[#0D1B3E] hover:bg-[#D4AF37] transition-all duration-300 text-center"
            >
              Client Portal
            </Link>
            <Link
              href="/agent/login"
              className="px-5 py-2 rounded-sm text-[0.75rem] font-bold tracking-widest uppercase whitespace-nowrap bg-[#C9A84C] text-[#0D1B3E] hover:bg-[#D4AF37] transition-all duration-300 text-center"
            >
              Agent Login
            </Link>
            <Link
              href="/admin"
              className="flex items-center justify-center gap-1.5 bg-[#C9A84C] text-[#0D1B3E] px-5 py-2 rounded-sm text-[0.75rem] font-bold tracking-widest uppercase hover:bg-[#D4AF37] transition-all duration-300 whitespace-nowrap"
            >
              <Shield size={14} />
              Admin Dashboard
            </Link>
            <Link
              href="/quote"
              className="btn-gold py-3.5 rounded-sm text-center text-xs font-bold tracking-widest uppercase"
            >
              Get A Quote
            </Link>
            <a
              href="tel:3616138336"
              className="flex items-center justify-center gap-2 text-white/50 text-sm font-bold tracking-widest uppercase py-3 border-t border-white/[0.06] hover:text-[#C9A84C] transition-colors duration-200"
            >
              <Phone size={15} />
              (361) 613-8336
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
