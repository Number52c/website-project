/**
 * LeadCaptureWidget.tsx
 * A compact, sticky lead capture form for SEO landing pages.
 * Appears as a sidebar or inline widget with minimal fields for high conversion.
 */

import { useState } from "react";
import { Phone, Mail, CircleCheck as CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface LeadCaptureWidgetProps {
  /** Coverage type to pre-select */
  coverageType?: string;
  /** Heading text */
  heading?: string;
  /** Compact mode for inline use */
  compact?: boolean;
}

export default function LeadCaptureWidget({
  coverageType = "Life Insurance",
  heading = "Get Your Free Quote",
  compact = false,
}: LeadCaptureWidgetProps) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    coverageType,
  });

  const submitQuote = trpc.quote.submit.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitQuote.mutate({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      coverage: form.coverageType,
      bestTime: "Anytime",
      message: `[SEO Lead] Submitted from ${coverageType} page`,
    });
  };

  if (submitted) {
    return (
      <div className={`bg-white border border-[#C9A84C]/30 rounded-sm ${compact ? "p-6" : "p-8"}`}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={24} className="text-green-600" />
          </div>
          <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#0D1B3E] mb-2">Thank You!</h3>
          <p className="text-[#5A5A5A] text-sm font-['Lato']">
            We've received your request and will contact you within 24 hours with your personalized quote.
          </p>
          <a
            href="tel:3616138336"
            className="inline-flex items-center gap-2 mt-4 text-[#C9A84C] font-bold text-sm font-['Lato'] hover:underline"
          >
            <Phone size={14} />
            Need it sooner? Call (361) 613-8336
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-[#E8E0D0] rounded-sm shadow-lg ${compact ? "p-6" : "p-8"}`}>
      <h3 className={`font-['Playfair_Display'] font-bold text-[#0D1B3E] mb-1 ${compact ? "text-lg" : "text-xl"}`}>
        {heading}
      </h3>
      <p className="text-[#5A5A5A] text-xs font-['Lato'] mb-5">Free, no-obligation. We respond within 24 hours.</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="First Name"
            required
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            className="w-full px-3 py-2.5 border border-[#E8E0D0] rounded-sm text-sm font-['Lato'] text-[#0D1B3E] placeholder:text-[#5A5A5A]/50 focus:outline-none focus:border-[#C9A84C] transition-colors"
          />
          <input
            type="text"
            placeholder="Last Name"
            required
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            className="w-full px-3 py-2.5 border border-[#E8E0D0] rounded-sm text-sm font-['Lato'] text-[#0D1B3E] placeholder:text-[#5A5A5A]/50 focus:outline-none focus:border-[#C9A84C] transition-colors"
          />
        </div>
        <input
          type="tel"
          placeholder="Phone Number"
          required
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full px-3 py-2.5 border border-[#E8E0D0] rounded-sm text-sm font-['Lato'] text-[#0D1B3E] placeholder:text-[#5A5A5A]/50 focus:outline-none focus:border-[#C9A84C] transition-colors"
        />
        <input
          type="email"
          placeholder="Email Address"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full px-3 py-2.5 border border-[#E8E0D0] rounded-sm text-sm font-['Lato'] text-[#0D1B3E] placeholder:text-[#5A5A5A]/50 focus:outline-none focus:border-[#C9A84C] transition-colors"
        />
        <select
          value={form.coverageType}
          onChange={(e) => setForm({ ...form, coverageType: e.target.value })}
          className="w-full px-3 py-2.5 border border-[#E8E0D0] rounded-sm text-sm font-['Lato'] text-[#0D1B3E] focus:outline-none focus:border-[#C9A84C] transition-colors bg-white"
        >
          <option value="Life Insurance">Life Insurance</option>
          <option value="Final Expense / Burial Insurance">Final Expense / Burial Insurance</option>
          <option value="Whole Life Insurance">Whole Life Insurance</option>
          <option value="Term Life Insurance">Term Life Insurance</option>
          <option value="Annuities / FIAs">Annuities / FIAs</option>
          <option value="Health Insurance">Health Insurance</option>
          <option value="Commercial Insurance">Commercial Insurance</option>
          <option value="Not Sure - Need Advice">Not Sure - Need Advice</option>
        </select>

        <button
          type="submit"
          disabled={submitQuote.isPending}
          className="w-full btn-gold px-6 py-3 rounded-sm text-sm font-bold tracking-widest uppercase disabled:opacity-60"
        >
          {submitQuote.isPending ? "Submitting..." : "Get My Free Quote"}
        </button>
      </form>

      <div className="mt-5 pt-4 border-t border-[#E8E0D0]">
        <div className="flex items-center gap-3 mb-2">
          <Phone size={14} className="text-[#C9A84C]" />
          <a href="tel:3616138336" className="text-sm font-['Lato'] text-[#0D1B3E] font-semibold hover:text-[#C9A84C] transition-colors">
            (361) 613-8336
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Mail size={14} className="text-[#C9A84C]" />
          <a href="mailto:eortiz@ortizinsurancebroker.com" className="text-sm font-['Lato'] text-[#0D1B3E] font-semibold hover:text-[#C9A84C] transition-colors break-all">
            eortiz@ortizinsurancebroker.com
          </a>
        </div>
      </div>

      <p className="text-[10px] text-[#5A5A5A]/60 font-['Lato'] mt-4 leading-relaxed">
        By submitting this form, you consent to be contacted by Ortiz Insurance Broker regarding your insurance inquiry. We respect your privacy and will never share your information.
      </p>
    </div>
  );
}
