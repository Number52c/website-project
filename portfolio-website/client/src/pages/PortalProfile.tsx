/**
 * client/src/pages/PortalProfile.tsx
 * Client Portal profile page — displays personal details, beneficiary info, and masked sensitive data
 */

import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLocation } from "wouter";
import { User, Phone, Mail, MapPin, Heart, DollarSign, Lock, LogOut, Loader as Loader2, ArrowLeft } from "lucide-react";
import { useEffect } from "react";

function maskSSN(ssn: string | null | undefined): string {
  if (!ssn) return "—";
  const cleaned = ssn.replace(/\D/g, "");
  if (cleaned.length !== 9) return "—";
  return `***-**-${cleaned.slice(-4)}`;
}

function maskBankAccount(account: string | null | undefined): string {
  if (!account) return "—";
  const cleaned = account.replace(/\D/g, "");
  if (cleaned.length < 4) return "—";
  return `****${cleaned.slice(-4)}`;
}

export default function PortalProfile() {
  const [, setLocation] = useLocation();

  const meQuery = trpc.portal.me.useQuery(undefined, { retry: false });
  const logoutMutation = trpc.portal.logout.useMutation({
    onSuccess: () => { window.location.href = "/"; },
  });

  const portalClient = meQuery.data;
  const isLoading = meQuery.isLoading;

  useEffect(() => {
    if (!meQuery.isLoading && !portalClient) {
      setLocation("/portal/login");
    }
  }, [meQuery.isLoading, portalClient, setLocation]);

  if (!portalClient && !meQuery.isLoading) return null;

  return (
    <div className="min-h-screen pt-20 flex flex-col" style={{ background: "linear-gradient(135deg, #060e1f 0%, #0a1628 40%, #0d1b3e 100%)" }}>
      <Navbar />

      {/* ── Hero Header ── */}
      <section className="relative pt-28 pb-12 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C9A84C]/5 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-px bg-[#C9A84C]" />
                <span className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase font-['Lato'] font-semibold">
                  My Profile
                </span>
              </div>
              {isLoading ? (
                <div className="h-12 w-64 bg-white/5 rounded-lg animate-pulse" />
              ) : (
                <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl font-bold text-white leading-tight">
                  Your Account<br />
                  <span className="text-[#C9A84C]">Information</span>
                </h1>
              )}
              <p className="text-white/50 font-['Lato'] mt-3 text-sm">
                Manage your personal details and beneficiary information.
              </p>
            </div>

            <div className="flex flex-col gap-2 self-start mt-2">
              <button
                onClick={() => setLocation("/portal")}
                className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm font-['Lato']"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
              <button
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm font-['Lato']"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Profile Content ── */}
      <section className="px-6 pb-20 flex-1">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Personal Information */}
              <div className="rounded-2xl border border-white/10 p-8" style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(201,168,76,0.02) 100%)" }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/15 flex items-center justify-center">
                    <User className="w-5 h-5 text-[#C9A84C]" />
                  </div>
                  <h2 className="font-['Playfair_Display'] text-2xl font-bold text-white">
                    Personal Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="text-white/60 text-xs font-['Lato'] tracking-wide uppercase">
                      Full Name
                    </label>
                    <p className="text-white text-lg font-['Lato'] mt-2">
                      {portalClient?.firstName} {portalClient?.lastName}
                    </p>
                  </div>

                  {/* Date of Birth */}
                  {portalClient?.dateOfBirth && (
                    <div>
                      <label className="text-white/60 text-xs font-['Lato'] tracking-wide uppercase">
                        Date of Birth
                      </label>
                      <p className="text-white text-lg font-['Lato'] mt-2">
                        {new Date(portalClient.dateOfBirth).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  )}

                  {/* Phone */}
                  {portalClient?.phone && (
                    <div>
                      <label className="text-white/60 text-xs font-['Lato'] tracking-wide uppercase flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone
                      </label>
                      <p className="text-white text-lg font-['Lato'] mt-2">
                        {portalClient.phone}
                      </p>
                    </div>
                  )}

                  {/* Email */}
                  {portalClient?.email && (
                    <div>
                      <label className="text-white/60 text-xs font-['Lato'] tracking-wide uppercase flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </label>
                      <p className="text-white text-lg font-['Lato'] mt-2">
                        {portalClient.email}
                      </p>
                    </div>
                  )}

                  {/* Address */}
                  {(portalClient?.address || portalClient?.city) && (
                    <div className="md:col-span-2">
                      <label className="text-white/60 text-xs font-['Lato'] tracking-wide uppercase flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Address
                      </label>
                      <p className="text-white text-lg font-['Lato'] mt-2">
                        {portalClient.address && `${portalClient.address}, `}
                        {portalClient.city && `${portalClient.city}, `}
                        {portalClient.state && `${portalClient.state} `}
                        {portalClient.zip}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Beneficiary Information */}
              <div className="rounded-2xl border border-white/10 p-8" style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.08) 0%, rgba(236,72,153,0.02) 100%)" }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/15 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-pink-400" />
                  </div>
                  <h2 className="font-['Playfair_Display'] text-2xl font-bold text-white">
                    Beneficiary Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Primary Beneficiary */}
                  {portalClient?.primaryBeneficiary ? (
                    <>
                      <div>
                        <label className="text-white/60 text-xs font-['Lato'] tracking-wide uppercase">
                          Primary Beneficiary
                        </label>
                        <p className="text-white text-lg font-['Lato'] mt-2">
                          {portalClient.primaryBeneficiary}
                        </p>
                      </div>
                      {portalClient?.primaryBeneficiaryPercent && (
                        <div>
                          <label className="text-white/60 text-xs font-['Lato'] tracking-wide uppercase">
                            Percentage
                          </label>
                          <p className="text-white text-lg font-['Lato'] mt-2">
                            {portalClient.primaryBeneficiaryPercent}%
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-white/40 italic font-['Lato']">No primary beneficiary on file</p>
                  )}

                  {/* Contingent Beneficiary */}
                  {portalClient?.contingentBeneficiary ? (
                    <>
                      <div>
                        <label className="text-white/60 text-xs font-['Lato'] tracking-wide uppercase">
                          Contingent Beneficiary
                        </label>
                        <p className="text-white text-lg font-['Lato'] mt-2">
                          {portalClient.contingentBeneficiary}
                        </p>
                      </div>
                      {portalClient?.contingentBeneficiaryPercent && (
                        <div>
                          <label className="text-white/60 text-xs font-['Lato'] tracking-wide uppercase">
                            Percentage
                          </label>
                          <p className="text-white text-lg font-['Lato'] mt-2">
                            {portalClient.contingentBeneficiaryPercent}%
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-white/40 italic font-['Lato']">No contingent beneficiary on file</p>
                  )}
                </div>
              </div>

              {/* Sensitive Information */}
              <div className="rounded-2xl border border-white/10 p-8" style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(59,130,246,0.02) 100%)" }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-blue-400" />
                  </div>
                  <h2 className="font-['Playfair_Display'] text-2xl font-bold text-white">
                    Sensitive Information
                  </h2>
                </div>

                <p className="text-white/50 text-sm font-['Lato'] mb-6">
                  For your security, sensitive information is partially masked. Contact us to update these details.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Social Security Number */}
                  {portalClient?.ssn && (
                    <div>
                      <label className="text-white/60 text-xs font-['Lato'] tracking-wide uppercase">
                        Social Security Number
                      </label>
                      <p className="text-white text-lg font-['Lato'] mt-2 font-mono">
                        {maskSSN(portalClient.ssn)}
                      </p>
                    </div>
                  )}

                  {/* Driver License */}
                  {portalClient?.driverLicense && (
                    <div>
                      <label className="text-white/60 text-xs font-['Lato'] tracking-wide uppercase">
                        Driver License
                      </label>
                      <p className="text-white text-lg font-['Lato'] mt-2">
                        {portalClient.driverLicense}
                      </p>
                    </div>
                  )}

                  {/* Bank Name */}
                  {portalClient?.bankName && (
                    <div>
                      <label className="text-white/60 text-xs font-['Lato'] tracking-wide uppercase flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Bank Name
                      </label>
                      <p className="text-white text-lg font-['Lato'] mt-2">
                        {portalClient.bankName}
                      </p>
                    </div>
                  )}

                  {/* Account Number */}
                  {portalClient?.accountNumber && (
                    <div>
                      <label className="text-white/60 text-xs font-['Lato'] tracking-wide uppercase">
                        Account Number
                      </label>
                      <p className="text-white text-lg font-['Lato'] mt-2 font-mono">
                        {maskBankAccount(portalClient.accountNumber)}
                      </p>
                    </div>
                  )}

                  {/* Routing Number */}
                  {portalClient?.routingNumber && (
                    <div>
                      <label className="text-white/60 text-xs font-['Lato'] tracking-wide uppercase">
                        Routing Number
                      </label>
                      <p className="text-white text-lg font-['Lato'] mt-2 font-mono">
                        {maskBankAccount(portalClient.routingNumber)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Health Information */}
              {portalClient?.healthConditions && (
                <div className="rounded-2xl border border-white/10 p-8" style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(34,197,94,0.02) 100%)" }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-green-400" />
                    </div>
                    <h2 className="font-['Playfair_Display'] text-2xl font-bold text-white">
                      Health Information
                    </h2>
                  </div>

                  <div>
                    <label className="text-white/60 text-xs font-['Lato'] tracking-wide uppercase">
                      Health Conditions
                    </label>
                    <p className="text-white text-lg font-['Lato'] mt-2">
                      {portalClient.healthConditions}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
