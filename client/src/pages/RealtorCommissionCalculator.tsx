import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { ArrowRight, TrendingUp, DollarSign, Target, Zap, CircleCheck as CheckCircle2, Hop as Home, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

export default function RealtorCommissionCalculator() {
  const [step, setStep] = useState(0);
  const [annualCommission, setAnnualCommission] = useState(100000);
  const [yearsToRetirement, setYearsToRetirement] = useState(20);
  const [dependents, setDependents] = useState(2);
  const [debts, setDebts] = useState(250000);

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  // Calculate insurance need
  const incomeReplacement = annualCommission * 10;
  const debtProtection = debts;
  const educationFund = dependents * 150000;
  const finalExpenses = 25000;
  const totalNeed = incomeReplacement + debtProtection + educationFund + finalExpenses;

  // Premium calculation (0.03 per 1000)
  const monthlyCost = (totalNeed / 1000) * 0.03;
  const costPerDay = monthlyCost / 30;
  const protectionRatio = totalNeed / annualCommission;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1F1810] via-[#2D2416] to-[#1F1810] overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#F59E0B]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <motion.div 
          className="pt-12 pb-8 px-4 sm:px-6 lg:px-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-block mb-4 px-4 py-2 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-full"
            >
              <p className="text-sm font-semibold text-[#F59E0B] uppercase tracking-wider">Insurance Protection</p>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl font-['Playfair_Display'] font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Protect Your <span className="bg-gradient-to-r from-[#F59E0B] to-[#D4AF37] bg-clip-text text-transparent">Commission</span>
            </motion.h1>

            <motion.p
              className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Your commission income is your most valuable asset. Protect it with the right insurance.
            </motion.p>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {step === 0 ? (
            // Step 1: Annual Commission
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-10 shadow-2xl"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-[#F59E0B]/20 rounded-lg">
                    <Briefcase className="h-6 w-6 text-[#F59E0B]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Annual Commission</h2>
                    <p className="text-gray-300">What's your average annual commission?</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-white font-semibold block mb-4">Commission Income</label>
                    <div className="relative">
                      <span className="absolute left-4 top-4 text-2xl text-[#F59E0B]">$</span>
                      <input
                        type="number"
                        value={annualCommission || ''}
                        onChange={(e) => setAnnualCommission(e.target.value === '' ? 0 : Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-2xl font-bold placeholder-gray-400 focus:bg-white/15 focus:border-[#F59E0B] transition-all duration-300"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <motion.button
                    onClick={() => setStep(1)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full mt-8 bg-gradient-to-r from-[#F59E0B] to-[#D4AF37] hover:from-[#E59A0B] hover:to-[#C49A2E] text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-xl"
                  >
                    Continue <ArrowRight className="h-5 w-5" />
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          ) : step === 1 ? (
            // Step 2: Dependents
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-10 shadow-2xl"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-[#D4AF37]/20 rounded-lg">
                    <Home className="h-6 w-6 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Dependents</h2>
                    <p className="text-gray-300">How many dependents do you have?</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-white font-semibold">Number</label>
                      <motion.span
                        key={dependents}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-4xl font-bold bg-gradient-to-r from-[#F59E0B] to-[#D4AF37] bg-clip-text text-transparent"
                      >
                        {dependents}
                      </motion.span>
                    </div>
                    <Slider
                      value={[dependents]}
                      onValueChange={(val) => setDependents(val[0])}
                      min={0}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="flex gap-4">
                    <motion.button
                      onClick={() => setStep(0)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-xl transition-all duration-300"
                    >
                      Back
                    </motion.button>
                    <motion.button
                      onClick={() => setStep(2)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-gradient-to-r from-[#F59E0B] to-[#D4AF37] hover:from-[#E59A0B] hover:to-[#C49A2E] text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      Continue <ArrowRight className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : step === 2 ? (
            // Step 3: Debts
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-10 shadow-2xl"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-[#10B981]/20 rounded-lg">
                    <DollarSign className="h-6 w-6 text-[#10B981]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Outstanding Debts</h2>
                    <p className="text-gray-300">Mortgages, loans, credit cards</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-white font-semibold block mb-4">Total Debt</label>
                    <div className="relative">
                      <span className="absolute left-4 top-4 text-2xl text-[#10B981]">$</span>
                      <input
                        type="number"
                        value={debts || ''}
                        onChange={(e) => setDebts(e.target.value === '' ? 0 : Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-2xl font-bold placeholder-gray-400 focus:bg-white/15 focus:border-[#10B981] transition-all duration-300"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <motion.button
                      onClick={() => setStep(1)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-xl transition-all duration-300"
                    >
                      Back
                    </motion.button>
                    <motion.button
                      onClick={() => setStep(3)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-gradient-to-r from-[#F59E0B] to-[#D4AF37] hover:from-[#E59A0B] hover:to-[#C49A2E] text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      Calculate <ArrowRight className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            // Results
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {/* Main Result */}
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-[#F59E0B]/20 to-[#D4AF37]/10 backdrop-blur-xl border border-[#F59E0B]/30 rounded-2xl p-12 shadow-2xl"
              >
                <p className="text-sm font-semibold text-[#F59E0B] uppercase tracking-wider mb-4">Your Protection Need</p>
                <motion.h2
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-[#F59E0B] to-[#D4AF37] bg-clip-text text-transparent mb-4"
                >
                  {formatCurrency(totalNeed)}
                </motion.h2>
                <p className="text-xl text-gray-300">in life insurance protection</p>
              </motion.div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  variants={itemVariants}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:border-[#F59E0B]/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="h-5 w-5 text-[#F59E0B]" />
                    <p className="text-gray-300 text-sm">Monthly Premium</p>
                  </div>
                  <motion.p
                    key={monthlyCost}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-bold text-white"
                  >
                    {formatCurrency(monthlyCost)}
                  </motion.p>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:border-[#D4AF37]/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="h-5 w-5 text-[#D4AF37]" />
                    <p className="text-gray-300 text-sm">Cost Per Day</p>
                  </div>
                  <motion.p
                    key={costPerDay}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-bold text-white"
                  >
                    {formatCurrency(costPerDay)}
                  </motion.p>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:border-[#10B981]/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="h-5 w-5 text-[#10B981]" />
                    <p className="text-gray-300 text-sm">Protection Ratio</p>
                  </div>
                  <motion.p
                    key={protectionRatio}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-bold text-white"
                  >
                    {protectionRatio.toFixed(1)}x
                  </motion.p>
                </motion.div>
              </div>

              {/* Detailed Breakdown */}
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl"
              >
                <h3 className="text-2xl font-bold text-white mb-6">What This Protects</h3>
                <div className="space-y-4">
                  {[
                    { icon: TrendingUp, label: 'Income Replacement', value: formatCurrency(incomeReplacement), desc: '10 years of commission', color: '#F59E0B' },
                    { icon: Home, label: 'Debt Protection', value: formatCurrency(debtProtection), desc: 'Mortgages & loans', color: '#D4AF37' },
                    { icon: CheckCircle2, label: 'Education Fund', value: formatCurrency(educationFund), desc: `For ${dependents} dependent(s)`, color: '#10B981' },
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" style={{ color: item.color }} />
                        <div>
                          <p className="text-white font-semibold">{item.label}</p>
                          <p className="text-gray-400 text-sm">{item.desc}</p>
                        </div>
                      </div>
                      <p className="font-bold text-white">{item.value}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div
                variants={itemVariants}
                className="flex gap-4"
              >
                <motion.button
                  onClick={() => setStep(2)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-xl transition-all duration-300"
                >
                  Adjust
                </motion.button>
                <motion.button
                  onClick={() => {
                    fetch('/api/trpc/system.notifyOwner', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        json: {
                          title: 'Realtor Calculator - Get Started Clicked',
                          content: `Protection Need: ${formatCurrency(totalNeed)} | Monthly Cost: $${monthlyCost.toFixed(2)}`,
                        },
                      }),
                    }).catch(err => console.error('Notification error:', err));
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-[#F59E0B] to-[#D4AF37] hover:from-[#E59A0B] hover:to-[#C49A2E] text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-lg shadow-lg"
                >
                  Get Started <ArrowRight className="h-5 w-5" />
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
