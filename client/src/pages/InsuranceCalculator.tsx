/* ============================================================= 
   INSURANCE NEEDS ANALYSIS CALCULATOR - DIME METHOD
   Interactive tool using the DIME formula:
   D = Debt (all outstanding obligations)
   I = Income Replacement (annual income × years needed)
   M = Mortgage (remaining balance)
   E = Education (college costs for children)
   ============================================================= */

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft, DollarSign, Hop as Home, GraduationCap, TrendingUp, Download, Phone, ArrowRight, Shield, CircleCheck as CheckCircle, Zap, Heart } from "lucide-react";

export default function InsuranceCalculator() {
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<any>(null);

  const [formData, setFormData] = useState({
    autoLoans: 0,
    studentLoans: 0,
    creditCardDebt: 0,
    personalLoans: 0,
    yearsToReplace: 10,
    annualIncome: 75000,
    mortgageBalance: 300000,
    educationFunding: 200000,
    finalExpenses: 25000,
  });

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const onChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCalculate = () => {
    const debt = formData.autoLoans + formData.studentLoans + formData.creditCardDebt + formData.personalLoans;
    const incomeReplacement = formData.annualIncome * formData.yearsToReplace;
    const mortgage = formData.mortgageBalance;
    const education = formData.educationFunding;
    const finalExpenses = formData.finalExpenses;

    const subtotal = debt + incomeReplacement + mortgage + education + finalExpenses;
    const recommendedCoverage = Math.ceil(subtotal / 100000) * 100000;

    const estimatedTermMonthly = (recommendedCoverage / 1000) * 0.03;
    const estimatedWholeLifeMonthly = (recommendedCoverage / 1000) * 0.03;
    const costPerDay = estimatedTermMonthly / 30;
    const protectionRatio = recommendedCoverage / formData.annualIncome;

    setResults({
      debt,
      incomeReplacement,
      mortgage,
      education,
      finalExpenses,
      subtotal,
      recommendedCoverage,
      estimatedTermMonthly,
      estimatedWholeLifeMonthly,
      costPerDay,
      protectionRatio,
    });
  };

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

  if (results) {
    return (
      <div className="min-h-screen overflow-hidden" style={{
        backgroundImage: `linear-gradient(rgba(5, 12, 28, 0.25), rgba(5, 12, 28, 0.30)), url('/manus-storage/hooks-bg-optimized_3615c91a.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}>
        {/* Animated background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#10B981]/10 rounded-full blur-3xl animate-pulse" />
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
                className="inline-block mb-4 px-4 py-2 bg-[#10B981]/10 border border-[#10B981]/30 rounded-full"
              >
                <p className="text-sm font-semibold text-[#10B981] uppercase tracking-wider">Family Protection</p>
              </motion.div>

              <motion.h1
                className="text-5xl md:text-7xl font-['Playfair_Display'] font-bold text-white mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Protect Your <span className="bg-gradient-to-r from-[#10B981] to-[#D4AF37] bg-clip-text text-transparent">Family</span>
              </motion.h1>

              <motion.p
                className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Your life insurance needs calculated with precision using the DIME method
              </motion.p>
            </div>
          </motion.div>

          {/* Results */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {/* Main Result */}
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-[#10B981]/20 to-[#D4AF37]/10 backdrop-blur-xl border border-[#10B981]/30 rounded-2xl p-12 shadow-2xl"
              >
                <p className="text-sm font-semibold text-[#10B981] uppercase tracking-wider mb-4">Your Family Protection Plan</p>
                <motion.h2
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-[#10B981] to-[#D4AF37] bg-clip-text text-transparent mb-4"
                >
                  {formatCurrency(results.recommendedCoverage)}
                </motion.h2>
                <p className="text-xl text-gray-300">in life insurance protection for your family's future</p>
              </motion.div>

              {/* Cost Breakdown */}
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl"
              >
                <h3 className="text-2xl font-bold text-white mb-6">Your Investment in Protection</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-lg bg-green-50 p-6 border border-green-200">
                    <p className="text-sm text-gray-600 mb-2">Monthly protection cost:</p>
                    <p className="text-4xl font-bold text-green-600">${results.estimatedTermMonthly.toFixed(0)}/mo</p>
                    <p className="mt-3 text-base font-semibold text-green-700">
                      ✓ That's just ${results.costPerDay.toFixed(2)}/day — less than a coffee!
                    </p>
                  </div>

                  <div className="rounded-lg bg-blue-50 p-6 border border-blue-200">
                    <p className="text-sm text-gray-600 mb-2">Your protection covers:</p>
                    <p className="text-4xl font-bold text-blue-600">{results.protectionRatio.toFixed(1)}x</p>
                    <p className="mt-1 text-sm text-blue-700">your annual income</p>
                  </div>

                  <div className="rounded-lg bg-amber-50 p-6 border border-amber-200">
                    <p className="text-sm text-gray-600 mb-2">Annual protection:</p>
                    <p className="text-4xl font-bold text-amber-600">${(results.estimatedTermMonthly * 12).toFixed(0)}/yr</p>
                    <p className="mt-1 text-sm text-amber-700">term life insurance</p>
                  </div>
                </div>
              </motion.div>

              {/* What This Protects */}
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl"
              >
                <h3 className="text-2xl font-bold text-white mb-6">What This Protects</h3>
                <div className="space-y-3">
                  {[
                    { icon: TrendingUp, label: 'Income Replacement', value: formatCurrency(results.incomeReplacement), desc: `${formData.yearsToReplace} years of income`, color: '#10B981' },
                    { icon: Home, label: 'Mortgage Protection', value: formatCurrency(results.mortgage), desc: 'Keep your home in the family', color: '#D4AF37' },
                    { icon: GraduationCap, label: 'Education Fund', value: formatCurrency(results.education), desc: 'College for your children', color: '#3B82F6' },
                    { icon: DollarSign, label: 'Debt Elimination', value: formatCurrency(results.debt), desc: 'Clear all outstanding obligations', color: '#F59E0B' },
                    { icon: CheckCircle, label: 'Final Expenses', value: formatCurrency(results.finalExpenses), desc: 'Funeral and end-of-life costs', color: '#8B5CF6' },
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

              {/* Key Insight */}
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-[#10B981]/10 to-transparent border-l-4 border-l-[#10B981] rounded-lg p-6"
              >
                <p className="text-lg font-semibold text-white">
                  💡 <span className="font-bold">Key Insight:</span> For less than a coffee per day, you can protect everything you've worked for. Your family deserves peace of mind.
                </p>
              </motion.div>

              {/* CTA */}
              <motion.div
                variants={itemVariants}
                className="flex gap-4"
              >
                <motion.button
                  onClick={() => setResults(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-xl transition-all duration-300"
                >
                  Adjust
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-[#10B981] to-[#D4AF37] hover:from-[#059669] hover:to-[#C49A2E] text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-lg shadow-lg"
                >
                  Get Started <ArrowRight className="h-5 w-5" />
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F2F1F] via-[#1A3F2E] to-[#0F2F1F] overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#10B981]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl animate-pulse" />
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
              className="inline-block mb-4 px-4 py-2 bg-[#10B981]/10 border border-[#10B981]/30 rounded-full"
            >
              <p className="text-sm font-semibold text-[#10B981] uppercase tracking-wider">DIME Method</p>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl font-['Playfair_Display'] font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Calculate Your <span className="bg-gradient-to-r from-[#10B981] to-[#D4AF37] bg-clip-text text-transparent">Life Insurance</span> Need
            </motion.h1>

            <motion.p
              className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Discover the right coverage amount to protect your family's financial future
            </motion.p>
          </div>
        </motion.div>

        {/* Calculator Steps */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-10 shadow-2xl"
          >
            {currentStep === 0 && (
              <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-[#10B981]/20 rounded-lg">
                    <DollarSign className="h-6 w-6 text-[#10B981]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Debts</h2>
                    <p className="text-gray-300">Auto loans, student loans, credit cards, personal loans</p>
                  </div>
                </div>

                {[
                  { label: 'Auto Loans', field: 'autoLoans' },
                  { label: 'Student Loans', field: 'studentLoans' },
                  { label: 'Credit Card Debt', field: 'creditCardDebt' },
                  { label: 'Personal Loans', field: 'personalLoans' },
                ].map((item) => (
                  <div key={item.field} className="space-y-2">
                    <label className="text-white font-semibold">{item.label}</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-lg text-[#10B981]">$</span>
                      <input
                        type="number"
                        value={formData[item.field as keyof typeof formData] || ''}
                        onChange={(e) => onChange(item.field, e.target.value === '' ? 0 : Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:bg-white/15 focus:border-[#10B981] transition-all duration-300"
                        placeholder="0"
                      />
                    </div>
                  </div>
                ))}

                <motion.button
                  onClick={() => setCurrentStep(1)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-8 bg-gradient-to-r from-[#10B981] to-[#D4AF37] hover:from-[#059669] hover:to-[#C49A2E] text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-lg shadow-lg"
                >
                  Continue <ArrowRight className="h-5 w-5" />
                </motion.button>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-[#D4AF37]/20 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Income Replacement</h2>
                    <p className="text-gray-300">How many years of income should be protected?</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-white font-semibold block mb-2">Annual Income</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-lg text-[#D4AF37]">$</span>
                      <input
                        type="number"
                        value={formData.annualIncome || ''}
                        onChange={(e) => onChange('annualIncome', e.target.value === '' ? 0 : Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:bg-white/15 focus:border-[#D4AF37] transition-all duration-300"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-white font-semibold block mb-2">Years to Replace</label>
                    <input
                      type="number"
                      value={formData.yearsToReplace || ''}
                      onChange={(e) => onChange('yearsToReplace', e.target.value === '' ? 0 : Number(e.target.value))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:bg-white/15 focus:border-[#D4AF37] transition-all duration-300"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <motion.button
                    onClick={() => setCurrentStep(0)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-lg transition-all duration-300"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    onClick={() => setCurrentStep(2)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-gradient-to-r from-[#10B981] to-[#D4AF37] hover:from-[#059669] hover:to-[#C49A2E] text-white font-bold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    Continue <ArrowRight className="h-5 w-5" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-[#3B82F6]/20 rounded-lg">
                    <Home className="h-6 w-6 text-[#3B82F6]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Mortgage & Education</h2>
                    <p className="text-gray-300">Protect your home and your children's future</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-white font-semibold block mb-2">Mortgage Balance</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-lg text-[#3B82F6]">$</span>
                      <input
                        type="number"
                        value={formData.mortgageBalance || ''}
                        onChange={(e) => onChange('mortgageBalance', e.target.value === '' ? 0 : Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:bg-white/15 focus:border-[#3B82F6] transition-all duration-300"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-white font-semibold block mb-2">Education Funding</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-lg text-[#3B82F6]">$</span>
                      <input
                        type="number"
                        value={formData.educationFunding || ''}
                        onChange={(e) => onChange('educationFunding', e.target.value === '' ? 0 : Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:bg-white/15 focus:border-[#3B82F6] transition-all duration-300"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-white font-semibold block mb-2">Final Expenses</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-lg text-[#3B82F6]">$</span>
                      <input
                        type="number"
                        value={formData.finalExpenses || ''}
                        onChange={(e) => onChange('finalExpenses', e.target.value === '' ? 0 : Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:bg-white/15 focus:border-[#3B82F6] transition-all duration-300"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <motion.button
                    onClick={() => setCurrentStep(1)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-lg transition-all duration-300"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    onClick={handleCalculate}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-gradient-to-r from-[#10B981] to-[#D4AF37] hover:from-[#059669] hover:to-[#C49A2E] text-white font-bold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    Calculate <ArrowRight className="h-5 w-5" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
