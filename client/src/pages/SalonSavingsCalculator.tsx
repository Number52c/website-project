import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, TrendingUp, DollarSign, Shield, Zap, CircleCheck as CheckCircle2, Sparkles, PiggyBank } from "lucide-react";
import { motion } from "framer-motion";

export default function SalonSavingsCalculator() {
  const [step, setStep] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(15000);
  const [savingsPercentage, setSavingsPercentage] = useState(5);
  const [yearsToRetirement, setYearsToRetirement] = useState(20);

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const monthlySavings = (monthlyRevenue * savingsPercentage) / 100;
  const annualSavings = monthlySavings * 12;
  const growthRate = 0.06;
  const projectedValue = annualSavings * (Math.pow(1 + growthRate, yearsToRetirement) - 1) / growthRate;
  const costPerDay = monthlySavings / 30;
  const growthAmount = projectedValue - (annualSavings * yearsToRetirement);
  const growthPercentage = (growthAmount / (annualSavings * yearsToRetirement)) * 100;

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
    <div className="min-h-screen bg-gradient-to-br from-[#2D1B1F] via-[#3D2429] to-[#2D1B1F] overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#E8A87C]/10 rounded-full blur-3xl animate-pulse" />
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
              className="inline-block mb-4 px-4 py-2 bg-[#E8A87C]/10 border border-[#E8A87C]/30 rounded-full"
            >
              <p className="text-sm font-semibold text-[#E8A87C] uppercase tracking-wider">Wealth Building</p>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl font-['Playfair_Display'] font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Build Your <span className="bg-gradient-to-r from-[#E8A87C] to-[#D4AF37] bg-clip-text text-transparent">Salon Empire</span>
            </motion.h1>

            <motion.p
              className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Discover how small daily savings can create extraordinary wealth
            </motion.p>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {step === 0 ? (
            // Step 1: Monthly Revenue
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
                  <div className="p-3 bg-[#E8A87C]/20 rounded-lg">
                    <DollarSign className="h-6 w-6 text-[#E8A87C]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Monthly Revenue</h2>
                    <p className="text-gray-300">What's your average monthly salon revenue?</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-white font-semibold block mb-4">Revenue</label>
                    <div className="relative">
                      <span className="absolute left-4 top-4 text-2xl text-[#E8A87C]">$</span>
                      <input
                        type="number"
                        value={monthlyRevenue || ''}
                        onChange={(e) => setMonthlyRevenue(e.target.value === '' ? 0 : Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-2xl font-bold placeholder-gray-400 focus:bg-white/15 focus:border-[#E8A87C] transition-all duration-300"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <motion.button
                    onClick={() => setStep(1)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full mt-8 bg-gradient-to-r from-[#E8A87C] to-[#D4AF37] hover:from-[#D4956E] hover:to-[#C49A2E] text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-xl"
                  >
                    Continue <ArrowRight className="h-5 w-5" />
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          ) : step === 1 ? (
            // Step 2: Savings Percentage
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
                    <PiggyBank className="h-6 w-6 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Savings Rate</h2>
                    <p className="text-gray-300">What % of revenue will you save?</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-white font-semibold">Percentage</label>
                      <motion.span
                        key={savingsPercentage}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-4xl font-bold bg-gradient-to-r from-[#E8A87C] to-[#D4AF37] bg-clip-text text-transparent"
                      >
                        {savingsPercentage}%
                      </motion.span>
                    </div>
                    <Slider
                      value={[savingsPercentage]}
                      onValueChange={(val) => setSavingsPercentage(val[0])}
                      min={1}
                      max={20}
                      step={0.5}
                      className="w-full"
                    />
                    <p className="text-gray-400 text-sm mt-4">Monthly savings: {formatCurrency(monthlySavings)}</p>
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
                      className="flex-1 bg-gradient-to-r from-[#E8A87C] to-[#D4AF37] hover:from-[#D4956E] hover:to-[#C49A2E] text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      Continue <ArrowRight className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : step === 2 ? (
            // Step 3: Years to Retirement
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
                    <Sparkles className="h-6 w-6 text-[#F59E0B]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Time Horizon</h2>
                    <p className="text-gray-300">How many years until retirement?</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-white font-semibold">Years</label>
                      <motion.span
                        key={yearsToRetirement}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-4xl font-bold bg-gradient-to-r from-[#F59E0B] to-[#D4AF37] bg-clip-text text-transparent"
                      >
                        {yearsToRetirement}
                      </motion.span>
                    </div>
                    <Slider
                      value={[yearsToRetirement]}
                      onValueChange={(val) => setYearsToRetirement(val[0])}
                      min={5}
                      max={40}
                      step={1}
                      className="w-full"
                    />
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
                      className="flex-1 bg-gradient-to-r from-[#E8A87C] to-[#D4AF37] hover:from-[#D4956E] hover:to-[#C49A2E] text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
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
                className="bg-gradient-to-br from-[#E8A87C]/20 to-[#D4AF37]/10 backdrop-blur-xl border border-[#E8A87C]/30 rounded-2xl p-12 shadow-2xl"
              >
                <p className="text-sm font-semibold text-[#E8A87C] uppercase tracking-wider mb-4">Your Projected Wealth</p>
                <motion.h2
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-[#E8A87C] to-[#D4AF37] bg-clip-text text-transparent mb-4"
                >
                  {formatCurrency(projectedValue)}
                </motion.h2>
                <p className="text-xl text-gray-300">In {yearsToRetirement} years with consistent savings</p>
              </motion.div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  variants={itemVariants}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:border-[#E8A87C]/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="h-5 w-5 text-[#E8A87C]" />
                    <p className="text-gray-300 text-sm">Monthly Savings</p>
                  </div>
                  <motion.p
                    key={monthlySavings}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-bold text-white"
                  >
                    {formatCurrency(monthlySavings)}
                  </motion.p>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:border-[#D4AF37]/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="h-5 w-5 text-[#D4AF37]" />
                    <p className="text-gray-300 text-sm">Investment Growth</p>
                  </div>
                  <motion.p
                    key={growthAmount}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-bold text-white"
                  >
                    {formatCurrency(growthAmount)}
                  </motion.p>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:border-[#F59E0B]/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="h-5 w-5 text-[#F59E0B]" />
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
              </div>

              {/* Detailed Breakdown */}
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl"
              >
                <h3 className="text-2xl font-bold text-white mb-6">Your Wealth Building Plan</h3>
                <div className="space-y-4">
                  {[
                    { icon: CheckCircle2, label: 'Total Contributions', value: formatCurrency(annualSavings * yearsToRetirement), color: '#E8A87C' },
                    { icon: TrendingUp, label: 'Investment Returns', value: `+${growthPercentage.toFixed(0)}%`, color: '#D4AF37' },
                    { icon: Sparkles, label: 'Annual Savings', value: formatCurrency(annualSavings), color: '#F59E0B' },
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
                        <p className="text-gray-300">{item.label}</p>
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
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-[#E8A87C] to-[#D4AF37] hover:from-[#D4956E] hover:to-[#C49A2E] text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-lg shadow-lg"
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
