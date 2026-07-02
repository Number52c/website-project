import { ArrowRight, Briefcase, Hop as Home, BookOpen, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { FadeInContainer, StaggerItem } from "@/components/AnimatedElements";
import { useLocation } from "wouter";

const caseStudies = [
  {
    title: "Securing Retirement for a Small Business Owner",
    description: "A barber shop owner with inconsistent income received a comprehensive SEP-IRA and Indexed Universal Life strategy, securing his future and protecting his family.",
    icon: Briefcase,
    color: "from-blue-500/20 to-blue-600/20",
    borderColor: "border-blue-200",
    iconColor: "text-blue-600",
    link: "/case-studies/barber-retirement",
  },
  {
    title: "Protecting a Growing Real Estate Portfolio",
    description: "A successful realtor expanded her asset protection with advanced life insurance and tax-efficient investments, structuring comprehensive wealth management.",
    icon: Home,
    color: "from-emerald-500/20 to-emerald-600/20",
    borderColor: "border-emerald-200",
    iconColor: "text-emerald-600",
    link: "/case-studies/realtor-wealth",
  },
  {
    title: "Ensuring Financial Stability for Educators",
    description: "Educators optimized their TRS benefits and integrated supplemental annuities, ensuring a comfortable and secure retirement with strategic planning.",
    icon: BookOpen,
    color: "from-amber-500/20 to-amber-600/20",
    borderColor: "border-amber-200",
    iconColor: "text-amber-600",
    link: "/case-studies/teacher-pension",
  },
  {
    title: "Comprehensive Coverage for a Startup Founder",
    description: "A tech startup founder received flexible life and health insurance designed to adapt to rapidly changing income and family needs with a custom, scalable solution.",
    icon: Lightbulb,
    color: "from-purple-500/20 to-purple-600/20",
    borderColor: "border-purple-200",
    iconColor: "text-purple-600",
    link: "/case-studies/startup-insurance",
  },
];

export default function CaseStudiesSection() {
  return (
    <section className="relative py-16 sm:py-24 bg-white">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-3 sm:mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
          >
            Our Success Stories
          </motion.h2>
          <motion.p
            className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Real-world examples of how we help our clients achieve their financial goals and protect what matters most.
          </motion.p>
        </div>

        <FadeInContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {caseStudies.map((study, index) => (
            <StaggerItem key={index} delay={index * 0.1}>
              <CaseStudyCard study={study} />
            </StaggerItem>
          ))}
        </FadeInContainer>
      </div>
    </section>
  );
}

function CaseStudyCard({ study }: { study: typeof caseStudies[0] }) {
  const [, navigate] = useLocation();
  const Icon = study.icon;

  const handleClick = () => {
    navigate(study.link);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left bg-gradient-to-br ${study.color} rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full border ${study.borderColor} overflow-hidden group cursor-pointer p-6 sm:p-8`}
    >
      <div className="flex items-center justify-center mb-4 sm:mb-6">
        <div className="p-3 sm:p-4 rounded-full bg-white/80 group-hover:bg-white transition-colors duration-300">
          <Icon className={`${study.iconColor} transition-transform duration-300 group-hover:scale-110`} size={28} />
        </div>
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors duration-300 text-center">
        {study.title}
      </h3>
      <p className="text-gray-700 text-sm sm:text-base flex-grow mb-4 text-center leading-relaxed">
        {study.description}
      </p>
      <div className="mt-auto flex justify-center">
        <span className="inline-flex items-center gap-2 text-amber-600 font-semibold group-hover:gap-3 transition-all duration-300 text-sm sm:text-base">
          Read More <ArrowRight size={16} />
        </span>
      </div>
    </button>
  );
}
