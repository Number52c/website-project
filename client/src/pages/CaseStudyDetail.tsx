import { useRoute } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";

const caseStudyData: Record<string, any> = {
  "barber-retirement": {
    title: "Securing Retirement for a Small Business Owner",
    subtitle: "How we helped John build a secure retirement plan",
    image: "/manus-storage/case-study-barber_44498358.png",
    challenge: "John owned a successful barber shop but struggled with inconsistent monthly income and had no retirement savings strategy. At 45, he realized he was falling behind on retirement planning and worried about his family's financial security.",
    solution: "We implemented a comprehensive retirement strategy including a SEP-IRA to maximize tax-deferred savings based on his variable business income, combined with an Indexed Universal Life (IUL) policy that provided both death benefit protection and cash value accumulation.",
    results: [
      "Established a flexible retirement savings plan that adapts to his business income fluctuations",
      "Created $500,000 in death benefit protection for his family",
      "Built a tax-efficient wealth accumulation strategy",
      "Projected retirement savings of $750,000+ by age 65"
    ],
    keyTakeaway: "Business owners with variable income need flexible retirement strategies that can adapt to their unique financial situation."
  },
  "realtor-wealth": {
    title: "Protecting a Growing Real Estate Portfolio",
    subtitle: "Comprehensive wealth protection for a successful realtor",
    image: "/manus-storage/case-study-realtor_140df918.png",
    challenge: "Maria was a highly successful real estate agent with a growing investment portfolio, but her wealth was exposed to significant risks. She needed a comprehensive strategy to protect her assets and plan for long-term wealth accumulation.",
    solution: "We designed a multi-layered protection strategy including advanced life insurance to cover her income replacement needs, umbrella liability coverage for her real estate investments, and tax-efficient investment vehicles to maximize her after-tax returns.",
    results: [
      "Implemented $2M in comprehensive life and liability protection",
      "Created a tax-efficient investment strategy saving $15,000+ annually",
      "Established an emergency fund and asset protection plan",
      "Positioned her for long-term wealth growth and legacy planning"
    ],
    keyTakeaway: "High-income professionals need comprehensive protection strategies that address both income replacement and asset protection."
  },
  "teacher-pension": {
    title: "Ensuring Financial Stability for Educators",
    subtitle: "Optimizing pension benefits and supplemental retirement income",
    image: "/manus-storage/case-study-teacher_49cb2e30.png",
    challenge: "The Smith family, both teachers in the Texas public school system, faced complex pension decisions and needed to optimize their TRS (Teacher Retirement System) benefits while planning for a comfortable retirement.",
    solution: "We analyzed their TRS pension options, recommended the optimal benefit election strategy, and supplemented their pension with strategic annuity products and supplemental retirement savings to ensure their desired retirement lifestyle.",
    results: [
      "Optimized TRS benefit election, increasing lifetime benefits by $80,000+",
      "Created supplemental income stream through structured annuities",
      "Established healthcare cost coverage for pre-Medicare years",
      "Projected combined retirement income of $95,000+ annually"
    ],
    keyTakeaway: "Public employees should carefully evaluate pension options and supplement with additional retirement vehicles to achieve their lifestyle goals."
  },
  "startup-insurance": {
    title: "Comprehensive Coverage for a Startup Founder",
    subtitle: "Flexible insurance solutions for a rapidly growing business",
    image: "/manus-storage/case-study-startup_f75f64ea.png",
    challenge: "Sarah founded a tech startup with rapidly changing income and family needs. Traditional insurance products weren't flexible enough to adapt to her evolving situation, and she needed coverage that could scale with her business.",
    solution: "We implemented a flexible insurance strategy including a Variable Universal Life (VUL) policy with adjustable premiums and death benefits, supplemented with term insurance for additional coverage, and integrated business insurance to protect her startup equity.",
    results: [
      "Created flexible coverage that adapts to her changing income",
      "Established $1.5M in death benefit protection",
      "Integrated business insurance to protect startup equity",
      "Built tax-efficient wealth accumulation within the policy"
    ],
    keyTakeaway: "Entrepreneurs need flexible, scalable insurance solutions that can adapt to their rapidly changing business and personal circumstances."
  }
};

export default function CaseStudyDetail() {
  const [match, params] = useRoute("/case-studies/:slug");

  const slug = params?.slug as string;

  // Scroll to top when slug changes
  useEffect(() => {
    if (match && slug) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [match, slug]);

  if (!match) return null;

  const study = caseStudyData[slug];

  if (!study) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Case Study Not Found</h1>
          <a href="/" className="text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-2 justify-center">
            <ArrowLeft size={20} /> Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-gray-50 pt-32 pb-16">
        <div className="container mx-auto max-w-4xl px-4">
          <a href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 font-semibold cursor-pointer">
            <ArrowLeft size={20} /> Back
          </a>
          <h1 className="text-5xl font-black text-gray-900 mb-4">{study.title}</h1>
          <p className="text-2xl text-gray-600">{study.subtitle}</p>
        </div>
      </div>

      {/* Featured Image */}
      <div className="container mx-auto max-w-4xl px-4 -mt-8 mb-16">
        <img
          src={study.image}
          alt={study.title}
          className="w-full h-96 object-cover rounded-xl shadow-2xl"
        />
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-4xl px-4 pb-24">
        {/* Challenge */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">The Challenge</h2>
          <p className="text-lg text-gray-700 leading-relaxed">{study.challenge}</p>
        </div>

        {/* Solution */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Solution</h2>
          <p className="text-lg text-gray-700 leading-relaxed">{study.solution}</p>
        </div>

        {/* Results */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">The Results</h2>
          <ul className="space-y-4">
            {study.results.map((result: string, index: number) => (
              <li key={index} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm mt-1">
                  ✓
                </div>
                <p className="text-lg text-gray-700">{result}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Key Takeaway */}
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-l-4 border-amber-600 p-8 rounded-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Key Takeaway</h3>
          <p className="text-lg text-gray-700">{study.keyTakeaway}</p>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600 mb-6">Ready to create your own success story?</p>
          <a href="/contact" className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 px-8 rounded-lg transition-colors duration-300 cursor-pointer">
            Get a Free Consultation
          </a>
        </div>
      </div>
    </div>
  );
}
