import { useState, useMemo } from "react";
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, GraduationCap, PiggyBank, BriefcaseBusiness, DollarSign, ArrowRight, TrendingUp, Shield } from "lucide-react";
import { trpc } from "../lib/trpc";

const steps = [
  {
    id: 1,
    title: "Your Retirement Vision",
    description: "Tell us about your current situation and retirement goals.",
    icon: <GraduationCap className="w-8 h-8 text-white" />,
  },
  {
    id: 2,
    title: "Future Income & Expenses",
    description: "Estimate your future financial needs.",
    icon: <BriefcaseBusiness className="w-8 h-8 text-white" />,
  },
  {
    id: 3,
    title: "Savings & Investments",
    description: "How much are you currently saving?",
    icon: <PiggyBank className="w-8 h-8 text-white" />,
  },
  {
    id: 4,
    title: "Your Personalized Plan",
    description: "See your projected retirement outlook.",
    icon: <Sparkles className="w-8 h-8 text-white" />,
  },
];

const AnimatedCard = ({ children, index }: { children: React.ReactNode; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -50 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="w-full"
  >
    {children}
  </motion.div>
);

const TeacherRetirementCalculator = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [age, setAge] = useState<number | string>(30);
  const [retirementAge, setRetirementAge] = useState<number | string>(65);
  const [currentSavings, setCurrentSavings] = useState<number | string>(50000);
  const [annualContribution, setAnnualContribution] = useState<number | string>(5000);
  const [annualIncome, setAnnualIncome] = useState<number | string>(60000);
  const [incomeReplacement, setIncomeReplacement] = useState<number | string>(80);
  const [inflationRate, setInflationRate] = useState<number | string>(3);
  const [investmentReturn, setInvestmentReturn] = useState<number | string>(7);
  const [results, setResults] = useState<any>(null);
  const [location, navigate] = useLocation();

  const notifyOwnerMutation = trpc.system.notifyOwner.useMutation();

  const calculateRetirement = useMemo(() => {
    const currentAgeNum = Number(age);
    const retirementAgeNum = Number(retirementAge);
    const currentSavingsNum = Number(currentSavings);
    const annualContributionNum = Number(annualContribution);
    const annualIncomeNum = Number(annualIncome);
    const incomeReplacementNum = Number(incomeReplacement) / 100;
    const inflationRateNum = Number(inflationRate) / 100;
    const investmentReturnNum = Number(investmentReturn) / 100;

    if (
      isNaN(currentAgeNum) ||
      isNaN(retirementAgeNum) ||
      isNaN(currentSavingsNum) ||
      isNaN(annualContributionNum) ||
      isNaN(annualIncomeNum) ||
      isNaN(incomeReplacementNum) ||
      isNaN(inflationRateNum) ||
      isNaN(investmentReturnNum) ||
      currentAgeNum >= retirementAgeNum
    ) {
      return null;
    }

    let futureValue = currentSavingsNum;
    for (let i = currentAgeNum; i < retirementAgeNum; i++) {
      futureValue = futureValue * (1 + investmentReturnNum) + annualContributionNum;
    }

    const yearsInRetirement = 25; // Assuming 25 years in retirement
    let retirementIncomeNeeded = annualIncomeNum * incomeReplacementNum;
    for (let i = 0; i < retirementAgeNum - currentAgeNum; i++) {
      retirementIncomeNeeded *= (1 + inflationRateNum);
    }

    const totalRetirementNeeded = retirementIncomeNeeded * yearsInRetirement;
    const shortfall = totalRetirementNeeded - futureValue;
    const monthlyShortfall = shortfall / (yearsInRetirement * 12);

    return {
      projectedSavings: futureValue,
      retirementIncomeNeeded: retirementIncomeNeeded,
      totalRetirementNeeded: totalRetirementNeeded,
      shortfall: shortfall,
      monthlyShortfall: monthlyShortfall,
      yearsToRetirement: retirementAgeNum - currentAgeNum,
    };
  }, [age, retirementAge, currentSavings, annualContribution, annualIncome, incomeReplacement, inflationRate, investmentReturn]);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleCalculate = () => {
    setResults(calculateRetirement);
    setCurrentStep(steps.length);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleGetStarted = async () => {
    const message = `Teacher Retirement Calculator Lead:\n\n` +
                    `Current Age: ${age}\n` +
                    `Retirement Age: ${retirementAge}\n` +
                    `Current Savings: ${formatCurrency(Number(currentSavings))}\n` +
                    `Annual Contribution: ${formatCurrency(Number(annualContribution))}\n` +
                    `Annual Income: ${formatCurrency(Number(annualIncome))}\n` +
                    `Income Replacement: ${incomeReplacement}%\n` +
                    `Inflation Rate: ${inflationRate}%\n` +
                    `Investment Return: ${investmentReturn}%\n\n` +
                    `Projected Savings: ${results ? formatCurrency(results.projectedSavings) : "N/A"}\n` +
                    `Retirement Income Needed: ${results ? formatCurrency(results.retirementIncomeNeeded) : "N/A"}\n` +
                    `Total Retirement Needed: ${results ? formatCurrency(results.totalRetirementNeeded) : "N/A"}\n` +
                    `Shortfall: ${results ? formatCurrency(results.shortfall) : "N/A"}\n` +
                    `Monthly Shortfall: ${results ? formatCurrency(results.monthlyShortfall) : "N/A"}`; 

    await notifyOwnerMutation.mutateAsync({ title: "New Teacher Retirement Calculator Lead", content: message });
    alert("Thank you! Your personalized retirement plan has been sent to our team. We will contact you shortly.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1128] via-[#1A233A] to-[#0F1B2E] text-white p-4 sm:p-8 lg:p-12 flex flex-col items-center justify-center font-inter relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 100, -100, 0],
            y: [0, -100, 100, 0],
            opacity: [0.1, 0.2, 0.1, 0.1]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, -100, 100, 0],
            y: [0, 100, -100, 0],
            opacity: [0.1, 0.15, 0.1, 0.1]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-20 right-10 w-80 h-80 bg-amber-500 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12 relative z-10"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mb-6"
        >
          <GraduationCap className="w-16 h-16 text-amber-400 mx-auto" />
        </motion.div>
        <h1 className="text-6xl lg:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 mb-4 font-playfair drop-shadow-lg">
          Secure Your Golden Years
        </h1>
        <p className="text-xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed">
          Plan your retirement with confidence. Our premium calculator helps teachers visualize their financial future with precision and clarity.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full max-w-4xl relative z-10"
      >
        <Card className="bg-gradient-to-br from-[#1A233A]/95 to-[#0A1128]/95 border border-amber-500/30 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-amber-900/40 to-amber-800/20 p-8 border-b border-amber-500/20">
            <div className="flex justify-between items-center mb-6">
              <CardTitle className="text-3xl font-bold text-white flex items-center gap-3 font-playfair">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity }}>
                  <GraduationCap className="w-8 h-8 text-amber-400" />
                </motion.div>
                Teacher Retirement Calculator
              </CardTitle>
            </div>
            <div className="flex items-center gap-3 mb-4">
              {steps.map((step, idx) => (
                <motion.div
                  key={step.id}
                  animate={{ 
                    scale: currentStep === step.id ? 1.2 : 1,
                    opacity: currentStep >= step.id ? 1 : 0.4
                  }}
                  transition={{ duration: 0.3 }}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    currentStep >= step.id 
                      ? "bg-gradient-to-r from-amber-400 to-amber-300" 
                      : "bg-gray-700"
                  }`}
                />
              ))}
            </div>
            <Progress value={(currentStep / steps.length) * 100} className="h-1.5 bg-gray-800" />
            <p className="text-amber-200 text-sm mt-3 font-medium">Step {currentStep} of {steps.length}</p>
          </CardHeader>

          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {currentStep === 1 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-200 font-playfair mb-2">Your Retirement Vision</h2>
                      <p className="text-gray-300 text-lg">Let's start with your current age and when you plan to retire.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-3"
                      >
                        <Label htmlFor="age" className="text-amber-200 text-lg font-semibold">Current Age</Label>
                        <Input
                          id="age"
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                          className="bg-amber-900/20 border-2 border-amber-500/50 text-white placeholder:text-amber-300/60 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-lg py-3 rounded-lg transition-all"
                          placeholder="e.g., 30"
                        />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-3"
                      >
                        <Label htmlFor="retirementAge" className="text-amber-200 text-lg font-semibold">Desired Retirement Age</Label>
                        <Input
                          id="retirementAge"
                          type="number"
                          value={retirementAge}
                          onChange={(e) => setRetirementAge(e.target.value === "" ? "" : Number(e.target.value))}
                          className="bg-amber-900/20 border-2 border-amber-500/50 text-white placeholder:text-amber-300/60 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-lg py-3 rounded-lg transition-all"
                          placeholder="e.g., 65"
                        />
                      </motion.div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-200 font-playfair mb-2">Future Income & Expenses</h2>
                      <p className="text-gray-300 text-lg">Help us estimate your financial needs in retirement.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-3"
                      >
                        <Label htmlFor="annualIncome" className="text-amber-200 text-lg font-semibold">Current Annual Income</Label>
                        <Input
                          id="annualIncome"
                          type="number"
                          value={annualIncome}
                          onChange={(e) => setAnnualIncome(e.target.value === "" ? "" : Number(e.target.value))}
                          className="bg-amber-900/20 border-2 border-amber-500/50 text-white placeholder:text-amber-300/60 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-lg py-3 rounded-lg transition-all"
                          placeholder="e.g., 60000"
                        />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-3"
                      >
                        <Label htmlFor="incomeReplacement" className="text-amber-200 text-lg font-semibold">Income Replacement % (in retirement)</Label>
                        <div className="bg-amber-900/20 border-2 border-amber-500/50 rounded-lg p-4">
                          <Slider
                            id="incomeReplacement"
                            min={50}
                            max={100}
                            step={5}
                            value={[Number(incomeReplacement)]}
                            onValueChange={(val) => setIncomeReplacement(val[0])}
                            className="w-full"
                          />
                          <p className="text-right text-amber-300 mt-3 text-xl font-bold">{incomeReplacement}%</p>
                        </div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-3"
                      >
                        <Label htmlFor="inflationRate" className="text-amber-200 text-lg font-semibold">Expected Annual Inflation Rate (%)</Label>
                        <div className="bg-amber-900/20 border-2 border-amber-500/50 rounded-lg p-4">
                          <Slider
                            id="inflationRate"
                            min={1}
                            max={5}
                            step={0.5}
                            value={[Number(inflationRate)]}
                            onValueChange={(val) => setInflationRate(val[0])}
                            className="w-full"
                          />
                          <p className="text-right text-amber-300 mt-3 text-xl font-bold">{inflationRate}%</p>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-200 font-playfair mb-2">Savings & Investments</h2>
                      <p className="text-gray-300 text-lg">Let's look at your current savings and how you plan to grow them.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-3"
                      >
                        <Label htmlFor="currentSavings" className="text-amber-200 text-lg font-semibold">Current Retirement Savings</Label>
                        <Input
                          id="currentSavings"
                          type="number"
                          value={currentSavings}
                          onChange={(e) => setCurrentSavings(e.target.value === "" ? "" : Number(e.target.value))}
                          className="bg-amber-900/20 border-2 border-amber-500/50 text-white placeholder:text-amber-300/60 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-lg py-3 rounded-lg transition-all"
                          placeholder="e.g., 50000"
                        />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-3"
                      >
                        <Label htmlFor="annualContribution" className="text-amber-200 text-lg font-semibold">Annual Retirement Contribution</Label>
                        <Input
                          id="annualContribution"
                          type="number"
                          value={annualContribution}
                          onChange={(e) => setAnnualContribution(e.target.value === "" ? "" : Number(e.target.value))}
                          className="bg-amber-900/20 border-2 border-amber-500/50 text-white placeholder:text-amber-300/60 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-lg py-3 rounded-lg transition-all"
                          placeholder="e.g., 5000"
                        />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-3"
                      >
                        <Label htmlFor="investmentReturn" className="text-amber-200 text-lg font-semibold">Expected Annual Investment Return (%)</Label>
                        <div className="bg-amber-900/20 border-2 border-amber-500/50 rounded-lg p-4">
                          <Slider
                            id="investmentReturn"
                            min={3}
                            max={10}
                            step={0.5}
                            value={[Number(investmentReturn)]}
                            onValueChange={(val) => setInvestmentReturn(val[0])}
                            className="w-full"
                          />
                          <p className="text-right text-amber-300 mt-3 text-xl font-bold">{investmentReturn}%</p>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-200 font-playfair mb-2">Your Personalized Plan</h2>
                      <p className="text-gray-300 text-lg">Here's a summary of your retirement outlook:</p>
                    </div>
                    {results ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-br from-green-900/40 to-green-800/20 border-2 border-green-500/50 rounded-xl p-6 hover:border-green-400 transition-all"
                          >
                            <div className="flex items-start gap-4">
                              <div className="bg-green-500/20 p-3 rounded-lg">
                                <DollarSign className="w-6 h-6 text-green-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-green-200 text-sm font-semibold mb-1">Projected Savings at Retirement</p>
                                <p className="text-2xl font-bold text-green-300">{formatCurrency(results.projectedSavings)}</p>
                              </div>
                            </div>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-2 border-blue-500/50 rounded-xl p-6 hover:border-blue-400 transition-all"
                          >
                            <div className="flex items-start gap-4">
                              <div className="bg-blue-500/20 p-3 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-blue-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-blue-200 text-sm font-semibold mb-1">Annual Income Needed in Retirement</p>
                                <p className="text-2xl font-bold text-blue-300">{formatCurrency(results.retirementIncomeNeeded)}</p>
                              </div>
                            </div>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-2 border-purple-500/50 rounded-xl p-6 hover:border-purple-400 transition-all"
                          >
                            <div className="flex items-start gap-4">
                              <div className="bg-purple-500/20 p-3 rounded-lg">
                                <PiggyBank className="w-6 h-6 text-purple-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-purple-200 text-sm font-semibold mb-1">Total Retirement Fund Needed</p>
                                <p className="text-2xl font-bold text-purple-300">{formatCurrency(results.totalRetirementNeeded)}</p>
                              </div>
                            </div>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className={`bg-gradient-to-br ${results.shortfall > 0 ? "from-red-900/40 to-red-800/20 border-2 border-red-500/50" : "from-green-900/40 to-green-800/20 border-2 border-green-500/50"} rounded-xl p-6 hover:border-opacity-100 transition-all`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`${results.shortfall > 0 ? "bg-red-500/20" : "bg-green-500/20"} p-3 rounded-lg`}>
                                <Shield className={`w-6 h-6 ${results.shortfall > 0 ? "text-red-400" : "text-green-400"}`} />
                              </div>
                              <div className="flex-1">
                                <p className={`${results.shortfall > 0 ? "text-red-200" : "text-green-200"} text-sm font-semibold mb-1`}>Retirement Shortfall</p>
                                <p className={`text-2xl font-bold ${results.shortfall > 0 ? "text-red-300" : "text-green-300"}`}>{formatCurrency(results.shortfall)}</p>
                              </div>
                            </div>
                          </motion.div>
                        </div>

                        {results.shortfall > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-gradient-to-r from-amber-900/40 to-amber-800/20 border-2 border-amber-500/50 rounded-xl p-6"
                          >
                            <div className="flex items-start gap-4">
                              <div className="bg-amber-500/20 p-3 rounded-lg">
                                <ArrowRight className="w-6 h-6 text-amber-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-amber-200 text-sm font-semibold mb-1">Monthly Contribution to Cover Shortfall</p>
                                <p className="text-3xl font-bold text-amber-300">{formatCurrency(results.monthlyShortfall)}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      <p className="text-red-400 text-lg">Please complete all steps to see your personalized plan.</p>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>

          <div className="flex justify-between p-8 border-t border-amber-500/20 bg-gradient-to-r from-amber-900/10 to-amber-800/5">
            {currentStep > 1 && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleBack}
                  className="bg-gray-700/60 hover:bg-gray-600/80 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 border border-gray-600"
                >
                  ← Back
                </Button>
              </motion.div>
            )}
            {currentStep < steps.length - 1 && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="ml-auto">
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg"
                >
                  Next →
                </Button>
              </motion.div>
            )}
            {currentStep === steps.length - 1 && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="ml-auto">
                <Button
                  onClick={handleCalculate}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" /> Calculate
                </Button>
              </motion.div>
            )}
            {currentStep === steps.length && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full">
                <Button
                  onClick={handleGetStarted}
                  className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 font-bold py-4 px-8 rounded-lg transition-all duration-300 shadow-lg flex items-center justify-center gap-2 text-lg"
                >
                  <Sparkles className="w-6 h-6" /> Get Your Personalized Plan
                </Button>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default TeacherRetirementCalculator;
