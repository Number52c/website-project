/*
   PREMIUM TESTIMONIALS CAROUSEL
   Social proof component with client success stories and ratings
   ============================================================= */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  title: string;
  company?: string;
  image: string;
  quote: string;
  rating: number;
  coverage: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Mitchell",
    title: "Business Owner",
    company: "Mitchell & Co.",
    image: "👩‍💼",
    quote:
      "Eric took the time to understand our family's needs and found us the perfect coverage at an unbeatable price. His expertise and personal touch made all the difference. We couldn't be happier!",
    rating: 5,
    coverage: "Term Life Insurance",
  },
  {
    id: 2,
    name: "James Rodriguez",
    title: "Financial Advisor",
    company: "Rodriguez Wealth Management",
    image: "👨‍💼",
    quote:
      "I recommend Ortiz Insurance to all my clients. Eric's knowledge of the market and ability to customize solutions is exceptional. He's a true professional.",
    rating: 5,
    coverage: "Whole Life Insurance",
  },
  {
    id: 3,
    name: "Maria Garcia",
    title: "Teacher",
    image: "👩‍🏫",
    quote:
      "After my husband passed, Eric helped our family navigate the insurance process with compassion and expertise. He made sure we had the coverage we needed for our children's future.",
    rating: 5,
    coverage: "Final Expense Insurance",
  },
  {
    id: 4,
    name: "David Chen",
    title: "Entrepreneur",
    image: "👨‍💻",
    quote:
      "The DIME calculator helped me realize I needed more coverage than I thought. Eric's guidance was invaluable in protecting my family's financial future.",
    rating: 5,
    coverage: "Term Life + FIA",
  },
  {
    id: 5,
    name: "Jennifer Walsh",
    title: "Healthcare Professional",
    image: "👩‍⚕️",
    quote:
      "Professional, responsive, and genuinely cares about his clients. Eric made the entire process simple and stress-free. Highly recommended!",
    rating: 5,
    coverage: "Health & Life Insurance",
  },
];

export default function TestimonialsCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [autoPlay]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir > 0 ? -1000 : 1000,
      opacity: 0,
    }),
  };

  const paginate = (newDirection: number) => {
    setAutoPlay(false);
    setDirection(newDirection);
    setCurrent((prev) => (prev + newDirection + testimonials.length) % testimonials.length);
    setTimeout(() => setAutoPlay(true), 8000);
  };

  const testimonial = testimonials[current];

  return (
    <section className="relative py-20 px-6 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C9A84C]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-px bg-[#C9A84C]" />
            <span className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase font-['Lato'] font-semibold">
              Social Proof
            </span>
            <div className="w-8 h-px bg-[#C9A84C]" />
          </div>
          <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl font-bold text-[#0D1B3E] mb-4">
            Loved by Our Clients
          </h2>
          <p className="text-[#6B6B6B] font-['Lato'] max-w-2xl mx-auto">
            Real families, real stories. See how Ortiz Insurance has made a difference in protecting what matters most.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={current}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.5 },
              }}
              className="w-full"
            >
              <div className="bg-white rounded-2xl border border-[#E8E0D0] p-8 md:p-12 card-luxury">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                  {/* Avatar & Info */}
                  <div className="flex flex-col items-center md:items-start">
                    <div className="text-7xl mb-4">{testimonial.image}</div>
                    <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#0D1B3E]">
                      {testimonial.name}
                    </h3>
                    <p className="text-sm text-[#6B6B6B] font-['Lato']">
                      {testimonial.title}
                    </p>
                    {testimonial.company && (
                      <p className="text-xs text-[#C9A84C] font-semibold mt-1">
                        {testimonial.company}
                      </p>
                    )}

                    {/* Rating */}
                    <div className="flex gap-1 mt-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className="fill-[#C9A84C] text-[#C9A84C]"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Quote */}
                  <div className="md:col-span-2">
                    <div className="mb-6">
                      <p className="text-6xl text-[#C9A84C]/20 leading-none mb-2">
                        "
                      </p>
                      <p className="text-lg md:text-xl text-[#0D1B3E] font-['Lato'] leading-relaxed">
                        {testimonial.quote}
                      </p>
                      <p className="text-6xl text-[#C9A84C]/20 leading-none text-right mt-2">
                        "
                      </p>
                    </div>

                    {/* Coverage Badge */}
                    <div className="inline-block px-4 py-2 bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-full">
                      <p className="text-sm font-semibold text-[#C9A84C] font-['Lato']">
                        {testimonial.coverage}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => paginate(-1)}
              className="p-3 rounded-full bg-[#0D1B3E] text-white hover:bg-[#C9A84C] hover:text-[#0D1B3E] transition-all duration-300 border border-[#0D1B3E] hover:border-[#C9A84C]"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <motion.button
                  key={i}
                  onClick={() => {
                    setDirection(i > current ? 1 : -1);
                    setCurrent(i);
                    setAutoPlay(false);
                    setTimeout(() => setAutoPlay(true), 8000);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === current
                      ? "bg-[#C9A84C] w-8"
                      : "bg-[#0D1B3E]/20 w-2 hover:bg-[#0D1B3E]/40"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => paginate(1)}
              className="p-3 rounded-full bg-[#0D1B3E] text-white hover:bg-[#C9A84C] hover:text-[#0D1B3E] transition-all duration-300 border border-[#0D1B3E] hover:border-[#C9A84C]"
              aria-label="Next testimonial"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Auto-play indicator */}
          <div className="mt-6 text-center">
            <p className="text-xs text-[#6B6B6B] font-['Lato']">
              {current + 1} of {testimonials.length}
            </p>
          </div>
        </div>

        {/* Trust Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 pt-16 border-t border-[#E8E0D0]">
          {[
            { number: "500+", label: "Satisfied Families" },
            { number: "4.9★", label: "Average Rating" },
            { number: "15+", label: "Years Experience" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="font-['Playfair_Display'] text-3xl font-bold text-[#C9A84C] mb-2">
                {stat.number}
              </p>
              <p className="text-[#6B6B6B] font-['Lato'] text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
