/* =============================================================
   CONTACT PAGE — Ortiz Insurance
   Design: Heraldic Prestige — Navy + Gold + Corpus Christi seawall
   ============================================================= */

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { Phone, Mail, MapPin, Clock, CircleCheck as CheckCircle, Loader as Loader2, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useSEO } from "@/hooks/useSEO";

export default function Contact() {
  useSEO({
    title:
      "Contact Ortiz Insurance Broker | Corpus Christi, TX | (361) 613-8336",
    description:
      "Contact Ortiz Insurance Broker in Corpus Christi, TX. Call (361) 613-8336 or visit our office. Free insurance consultations for life insurance, annuities, and more.",
    canonicalPath: "/contact",
    keywords:
      "contact Ortiz Insurance, insurance broker Corpus Christi phone, insurance office Corpus Christi TX",
  });
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [error, setError] = useState("");

  const submitMutation = trpc.contact.submit.useMutation({
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
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    submitMutation.mutate({
      name: form.name,
      email: form.email,
      phone: form.phone,
      subject: form.subject,
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
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/112286430/VpboFheV3AGxAWHe4GAyVf/contact-bg-d4HcAVgcpvygnwxKBtaNBX.webp)`,
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D1B3E]/80 via-[#0D1B3E]/70 to-[#0D1B3E]/90" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <p className="section-label text-[#C9A84C] mb-4">
            We&apos;re Here to Help
          </p>
          <h1 className="font-['Playfair_Display'] text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Contact Us
          </h1>
          <div className="gold-rule w-20 mx-auto mb-8" />
          <p className="text-white/70 text-base sm:text-lg font-['Lato'] max-w-2xl mx-auto leading-relaxed">
            Reach out by phone, email, or the form below. We look forward to
            hearing from you.
          </p>
        </div>
      </section>

      {/* ── CONTACT SECTION ── */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Info card */}
              <div className="bg-[#0D1B3E] rounded-sm p-9">
                <img
                  src="/manus-storage/ortiz-lion-crest-transparent_3447f82e.png"
                  alt="Ortiz Insurance"
                  className="h-14 w-auto object-contain mb-6"
                />
                <div className="gold-rule w-12 mb-8" />
                <h3 className="font-['Playfair_Display'] text-white text-xl font-bold mb-8">
                  Get In Touch
                </h3>
                <div className="space-y-6">
                  <a
                    href="tel:3616138336"
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-full border border-[#C9A84C]/20 flex items-center justify-center shrink-0 group-hover:border-[#C9A84C]/50 group-hover:bg-[#C9A84C]/5 transition-all duration-300">
                      <Phone size={15} className="text-[#C9A84C]/70" />
                    </div>
                    <div>
                      <p className="text-white/30 text-[0.65rem] tracking-[0.2em] uppercase font-['Lato'] mb-0.5">
                        Phone
                      </p>
                      <p className="text-white/80 font-bold font-['Lato'] text-sm group-hover:text-[#C9A84C] transition-colors duration-300">
                        (361) 613-8336
                      </p>
                    </div>
                  </a>

                  <a
                    href="mailto:eortiz@ortizinsurancebroker.com"
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-full border border-[#C9A84C]/20 flex items-center justify-center shrink-0 group-hover:border-[#C9A84C]/50 group-hover:bg-[#C9A84C]/5 transition-all duration-300">
                      <Mail size={15} className="text-[#C9A84C]/70" />
                    </div>
                    <div>
                      <p className="text-white/30 text-[0.65rem] tracking-[0.2em] uppercase font-['Lato'] mb-0.5">
                        Email
                      </p>
                      <p className="text-white/80 font-bold font-['Lato'] text-sm break-all group-hover:text-[#C9A84C] transition-colors duration-300">
                        eortiz@ortizinsurancebroker.com
                      </p>
                    </div>
                  </a>

                  <a
                    href="https://maps.google.com/?q=5333+Yorktown+Blvd+Corpus+Christi+TX+78413"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-full border border-[#C9A84C]/20 flex items-center justify-center shrink-0 group-hover:border-[#C9A84C]/50 group-hover:bg-[#C9A84C]/5 transition-all duration-300">
                      <MapPin size={15} className="text-[#C9A84C]/70" />
                    </div>
                    <div>
                      <p className="text-white/30 text-[0.65rem] tracking-[0.2em] uppercase font-['Lato'] mb-0.5">
                        Address
                      </p>
                      <p className="text-white/80 font-bold font-['Lato'] text-sm group-hover:text-[#C9A84C] transition-colors duration-300">
                        5333 Yorktown Blvd
                        <br />
                        Corpus Christi, TX 78413
                      </p>
                    </div>
                  </a>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full border border-[#C9A84C]/20 flex items-center justify-center shrink-0">
                      <Clock size={15} className="text-[#C9A84C]/70" />
                    </div>
                    <div>
                      <p className="text-white/30 text-[0.65rem] tracking-[0.2em] uppercase font-['Lato'] mb-0.5">
                        Hours
                      </p>
                      <p className="text-white/80 font-['Lato'] text-sm">
                        Mon - Fri: 8:00am - 6:00pm
                        <br />
                        <span className="text-white/40">
                          Sat - Sun: By Appointment
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map embed */}
              <div className="rounded-sm overflow-hidden border border-[#E8E0D0] h-52">
                <iframe
                  title="Ortiz Insurance Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3488.1!2d-97.3961!3d27.7172!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s5333+Yorktown+Blvd%2C+Corpus+Christi%2C+TX+78413!5e0!3m2!1sen!2sus!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <div className="bg-white rounded-sm border border-[#E8E0D0] p-14 text-center shadow-sm h-full flex flex-col items-center justify-center">
                  <div className="w-[72px] h-[72px] rounded-full bg-[#0D1B3E] flex items-center justify-center mx-auto mb-8">
                    <CheckCircle size={36} className="text-[#C9A84C]" />
                  </div>
                  <h2 className="font-['Playfair_Display'] text-3xl font-bold text-[#0D1B3E] mb-4">
                    Message Sent!
                  </h2>
                  <div className="gold-rule w-16 mx-auto mb-6" />
                  <p className="text-[#6B6B6B] font-['Lato'] leading-relaxed text-lg mb-4 max-w-md">
                    Thank you for reaching out. We&apos;ll get back to you as
                    soon as possible.
                  </p>
                  <p className="text-[#6B6B6B] font-['Lato'] text-sm">
                    Need immediate assistance? Call{" "}
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
                    Send Us a Message
                  </h2>
                  <p className="text-[#6B6B6B] text-sm font-['Lato'] mb-10">
                    We typically respond within one business day.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block text-[0.65rem] font-bold tracking-[0.2em] uppercase text-[#0D1B3E] mb-2.5 font-['Lato']">
                        Full Name <span className="text-[#C9A84C]">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.65rem] font-bold tracking-[0.2em] uppercase text-[#0D1B3E] mb-2.5 font-['Lato']">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="(361) 000-0000"
                      />
                    </div>
                  </div>

                  <div className="mb-5">
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

                  <div className="mb-5">
                    <label className="block text-[0.65rem] font-bold tracking-[0.2em] uppercase text-[#0D1B3E] mb-2.5 font-['Lato']">
                      Subject
                    </label>
                    <select
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className={inputClasses}
                    >
                      <option value="">Select a subject...</option>
                      <option value="quote">Request a Quote</option>
                      <option value="life">Life Insurance</option>
                      <option value="health">Health Insurance</option>
                      <option value="commercial">Commercial Insurance</option>
                      <option value="annuity">FIAs & Annuities</option>
                      <option value="pension">Pension Planning</option>
                      <option value="general">General Inquiry</option>
                    </select>
                  </div>

                  <div className="mb-10">
                    <label className="block text-[0.65rem] font-bold tracking-[0.2em] uppercase text-[#0D1B3E] mb-2.5 font-['Lato']">
                      Message <span className="text-[#C9A84C]">*</span>
                    </label>
                    <textarea
                      name="message"
                      rows={5}
                      required
                      value={form.message}
                      onChange={handleChange}
                      className={`${inputClasses} resize-none`}
                      placeholder="How can we help you?"
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
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <ArrowRight
                          size={16}
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </>
                    )}
                  </button>
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
