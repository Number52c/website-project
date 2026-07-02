/*
   STICKY CTA BAR
   High-conversion sticky footer with prominent CTAs
   ============================================================= */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MessageSquare, X } from "lucide-react";
import { Link } from "wouter";

export default function StickyCTABar() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 300;
      setHasScrolled(scrolled);
      if (scrolled && !isVisible) {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-[#0D1B3E] to-[#1a2f5a] border-t border-[#C9A84C]/20 shadow-2xl"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Message */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-['Playfair_Display'] font-semibold text-sm sm:text-base truncate">
                  Ready to protect what matters most?
                </p>
                <p className="text-white/60 font-['Lato'] text-xs hidden sm:block">
                  Get a free quote in minutes
                </p>
              </div>

              {/* Right: CTAs */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {/* Call Button */}
                <a
                  href="tel:3616138336"
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#C9A84C] text-[#0D1B3E] rounded-lg font-semibold text-xs sm:text-sm hover:bg-[#D4AF37] transition-all duration-300 whitespace-nowrap btn-gold"
                >
                  <Phone size={16} />
                  <span className="hidden sm:inline">Call Now</span>
                  <span className="sm:hidden">(361) 613-8336</span>
                </a>

                {/* Quote Button */}
                <Link
                  href="/quote"
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 text-white rounded-lg font-semibold text-xs sm:text-sm border border-white/20 hover:bg-white/15 hover:border-[#C9A84C]/50 transition-all duration-300 whitespace-nowrap"
                >
                  <MessageSquare size={16} />
                  <span className="hidden sm:inline">Get Quote</span>
                  <span className="sm:hidden">Quote</span>
                </Link>

                {/* Close Button */}
                <button
                  onClick={() => setIsVisible(false)}
                  className="p-2 text-white/50 hover:text-white transition-colors"
                  aria-label="Close CTA bar"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
