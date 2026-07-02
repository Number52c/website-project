import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { FadeInContainer, StaggerItem } from "@/components/AnimatedElements";

const testimonials = [
  {
    quote: "Eric Ortiz is more than an insurance agent; he's a financial architect. He helped me navigate complex annuity options and secure my retirement with confidence. Truly exceptional service!",
    name: "Maria S.",
    title: "Retired Educator",
    rating: 5,
  },
  {
    quote: "As a small business owner, finding the right commercial insurance was daunting. Eric simplified everything, found us comprehensive coverage, and saved us money. Highly recommend his expertise.",
    name: "David L.",
    title: "Local Business Owner",
    rating: 5,
  },
  {
    quote: "When my family needed life insurance, Eric was incredibly compassionate and knowledgeable. He guided us through the process with ease, ensuring our future is protected. A true professional.",
    name: "Jessica T.",
    title: "New Parent",
    rating: 5,
  },
  {
    quote: "I've worked with many agents, but Eric stands out. His dedication to understanding my unique needs and providing tailored solutions is unmatched. He's earned my trust and business.",
    name: "Robert K.",
    title: "Independent Contractor",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="relative py-24 sm:py-32 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl sm:text-5xl font-black text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
          >
            What Our Clients Say
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Hear directly from the individuals and businesses we've helped secure their financial futures.
          </motion.p>
        </div>

        <FadeInContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial, index) => (
            <StaggerItem key={index} delay={index * 0.1}>
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 flex flex-col h-full border border-gray-100">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <p className="text-gray-700 text-lg italic mb-6 flex-grow">"{testimonial.quote}"</p>
                <div className="mt-auto">
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.title}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </FadeInContainer>
      </div>
    </section>
  );
}
