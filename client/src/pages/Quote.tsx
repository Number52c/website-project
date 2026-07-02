/* =============================================================
   GET A QUOTE PAGE — Ortiz Insurance
   Design: Heraldic Prestige — Navy + Gold + Texas courthouse image
   ============================================================= */

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { Phone, Mail, CircleCheck as CheckCircle, Loader as Loader2, ArrowRight, Shield } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useSEO } from "@/hooks/useSEO";

const coverageTypes = [
  "Life Insurance",
  "Health Insurance",
  "Commercial Property & Casualty",
  "FIAs & Annuities",
  "Pension Planning",
  "Other / Not Sure",
];

export default function Quote() {
  useSEO({
    title:
      "Get a Free Insurance Quote | Ortiz Insurance Broker | Corpus Christi, TX",
    description:
      "Request a free, no-obligation insurance quote from Ortiz Insurance Broker in Corpus Christi, TX. Life insurance, final expense, annuities, and more. Call (361) 613-8336.",
    canonicalPath: "/quote",
    keywords:
      "free insurance quote Corpus Christi, life insurance quote Texas, get insurance quote online, insurance broker quote",
  });

  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    coverage: "",
    message: "",
    bestTime: "",
  });
  const [error, setError] = useState("");

  const submitMutation = trpc.quote.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setError("");
    },
    onError: () => {
      setError(
        "Something went wrong. Please try again or call us directly at (361) 613-8336."
      );
    },
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    submitMutation.mutate({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      coverage: form.coverage,
      bestTime: form.bestTime,
      message: form.message,
    });
  };

  const inputClasses =
    "w-full border border-[#E8E0D0] rounded-lg px-4 py-3.5 text-sm font-['Lato'] text-[#0D1B3E] focus:outline-none focus:border-[#C9A84C] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.15)] transition-all duration-300 bg-white placeholder:text-[#B0A898] hover:border-[#C9A84C]/30 form-input-premium";

  return (
    <div className="min-h-screen pt-20 bg-[#F5F0E8]">
      <Navbar />

      {/* ── PAGE HERO ── */}
      <section
        className="relative pt-40 pb-28 overflow-hidden"
        style={{
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/112286430/VpboFheV3AGxAWHe4GAyVf/quote-bg-jch5aoM9nKkw6dGxfYDWqS.webp)`,
          backgroundSize: "cover",
          backgroundPosition: "center 20%",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D1B3E]/80 via-[#0D1B3E]/70 to-[#0D1B3E]/90" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <p className="section-label text-[#C9A84C] mb-4">
            No Obligation &middot; No Pressure
          </p>
          <h1 className="font-['Playfair_Display'] text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Get A Free Quote
          </h1>
          <div className="gold-rule w-20 mx-auto mb-8" />
          <p className="text-white/70 text-base sm:text-lg font-['Lato'] max-w-2xl mx-auto leading-relaxed">
            Fill out the form below and Eric Ortiz will personally reach out to
            discuss your coverage options.
          </p>
        </div>
      </section>

      {/* ── FORM SECTION ── */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-[#0D1B3E] rounded-sm p-9 sticky top-28">
                <img
                  src="/manus-storage/ortiz-lion-crest-transparent_3447f82e.png"
                  alt="Ortiz Insurance"
                  className="h-14 w-auto object-contain mb-6"
                />
                <div className="gold-rule w-12 mb-6" />
                <h3 className="font-['Playfair_Display'] text-white text-xl font-bold mb-3">
                  Prefer to Talk?
                </h3>
                <p className="text-white/50 text-sm font-['Lato'] mb-8 leading-relaxed">
                  Call or email us directly. We&apos;re happy to answer
                  questions and walk you through your options.
                </p>
                <div className="space-y-5">
                  <a
                    href="tel:3616138336"
                    className="flex items-center gap-3 text-[#C9A84C]/80 hover:text-[#C9A84C] transition-colors duration-300 group"
                  >
                    <div className="w-9 h-9 rounded-full border border-[#C9A84C]/20 flex items-center justify-center group-hover:border-[#C9A84C]/50 group-hover:bg-[#C9A84C]/5 transition-all duration-300 shrink-0">
                      <Phone size={14} />
                    </div>
                    <span className="font-['Lato'] font-bold text-sm">
                      (361) 613-8336
                    </span>
                  </a>
                  <a
                    href="mailto:eortiz@ortizinsurancebroker.com"
                    className="flex items-center gap-3 text-[#C9A84C]/80 hover:text-[#C9A84C] transition-colors duration-300 group"
                  >
                    <div className="w-9 h-9 rounded-full border border-[#C9A84C]/20 flex items-center justify-center group-hover:border-[#C9A84C]/50 group-hover:bg-[#C9A84C]/5 transition-all duration-300 shrink-0">
                      <Mail size={14} />
                    </div>
                    <span className="font-['Lato'] font-bold text-sm break-all">
                      eortiz@ortizinsurancebroker.com
                    </span>
                  </a>
                </div>
                <div className="gold-rule w-12 mt-8 mb-6" />
                <div className="flex items-center gap-2">
                  <Shield size={13} className="text-[#C9A84C]/60" />
                  <span className="text-[#C9A84C]/60 text-[0.65rem] font-bold tracking-[0.15em] font-['Lato'] uppercase">
                    Licensed in 50+ States
                  </span>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="bg-white rounded-sm border border-[#E8E0D0] p-14 text-center shadow-sm">
                  <div className="w-18 h-18 rounded-full bg-[#0D1B3E] flex items-center justify-center mx-auto mb-8 w-[72px] h-[72px]">
                    <CheckCircle size={36} className="text-[#C9A84C]" />
                  </div>
                  <h2 className="font-['Playfair_Display'] text-3xl font-bold text-[#0D1B3E] mb-4">
                    Thank You!
                  </h2>
                  <div className="gold-rule w-16 mx-auto mb-6" />
                  <p className="text-[#6B6B6B] font-['Lato'] leading-relaxed text-lg mb-4 max-w-md mx-auto">
                    Your quote request has been received. Eric Ortiz will be in
                    touch with you shortly to discuss your coverage options.
                  </p>
                  <p className="text-[#6B6B6B] font-['Lato'] text-sm">
                    In the meantime, feel free to call us at{" "}
                    <a
                      href="tel:3616138336"
                      className="text-[#C9A84C] font-bold"
                    >
                      (361) 613-8336
                    </a>
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="bg-white rounded-lg border border-[#E8E0D0] p-9 md:p-12 shadow-sm card-luxury"
                >
                  <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#0D1B3E] mb-2">
                    Request Your Free Quote
                  </h2>
                  <p className="text-[#6B6B6B] text-sm font-['Lato'] mb-10">
                    All fields marked with{" "}
                    <span className="text-[#C9A84C]">*</span> are required.
                  </p>

                  {/* Name row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block text-[0.65rem] font-bold tracking-[0.2em] uppercase text-[#0D1B3E] mb-2.5 font-['Lato']">
                        First Name <span className="text-[#C9A84C]">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={form.firstName}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.65rem] font-bold tracking-[0.2em] uppercase text-[#0D1B3E] mb-2.5 font-['Lato']">
                        Last Name <span className="text-[#C9A84C]">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={form.lastName}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  {/* Contact row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block text-[0.65rem] font-bold tracking-[0.2em] uppercase text-[#0D1B3E] mb-2.5 font-['Lato']">
                        Email <span className="text-[#C9A84C]">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.65rem] font-bold tracking-[0.2em] uppercase text-[#0D1B3E] mb-2.5 font-['Lato']">
                        Phone Number{" "}
                        <span className="text-[#C9A84C]">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={form.phone}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="(361) 000-0000"
                      />
                    </div>
                  </div>

                  {/* Coverage type */}
                  <div className="mb-5">
                    <label className="block text-[0.65rem] font-bold tracking-[0.2em] uppercase text-[#0D1B3E] mb-2.5 font-['Lato']">
                      Type of Coverage{" "}
                      <span className="text-[#C9A84C]">*</span>
                    </label>
                    <select
                      name="coverage"
                      required
                      value={form.coverage}
                      onChange={handleChange}
                      className={inputClasses}
                    >
                      <option value="">Select coverage type...</option>
                      {coverageTypes.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Best time */}
                  <div className="mb-5">
                    <label className="block text-[0.65rem] font-bold tracking-[0.2em] uppercase text-[#0D1B3E] mb-2.5 font-['Lato']">
                      Best Time to Contact
                    </label>
                    <select
                      name="bestTime"
                      value={form.bestTime}
                      onChange={handleChange}
                      className={inputClasses}
                    >
                      <option value="">No preference</option>
                      <option value="morning">Morning (8am - 12pm)</option>
                      <option value="afternoon">Afternoon (12pm - 5pm)</option>
                      <option value="evening">Evening (5pm - 7pm)</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div className="mb-10">
                    <label className="block text-[0.65rem] font-bold tracking-[0.2em] uppercase text-[#0D1B3E] mb-2.5 font-['Lato']">
                      Additional Notes
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      value={form.message}
                      onChange={handleChange}
                      className={`${inputClasses} resize-none`}
                      placeholder="Tell us a bit about your coverage needs..."
                    />
                  </div>

                  {error && (
                    <p className="text-red-600 text-sm font-['Lato'] mb-5 bg-red-50 border border-red-200 rounded-sm px-4 py-3">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="btn-gold w-full py-4 rounded-sm text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-2 disabled:opacity-70 group"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />{" "}
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Quote Request
                        <ArrowRight
                          size={16}
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </>
                    )}
                  </button>

                  <p className="text-[#A0A0A0] text-[0.7rem] font-['Lato'] mt-4 text-center leading-relaxed">
                    By submitting this form, you agree to be contacted by Ortiz
                    Insurance Broker regarding your quote request.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
