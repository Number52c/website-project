/**
 * PremiumCalculatorBase.tsx
 * Reusable base component for premium calculators with:
 * - Interactive sliders
 * - Real-time visualizations
 * - Step-by-step workflows
 * - Scenario comparison
 * - PDF report generation
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Download, TrendingUp, Target, Zap, CircleCheck as CheckCircle2, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import jsPDF from "jspdf";

export interface CalculatorStep {
  id: number;
  title: string;
  description: string;
  icon?: React.ReactNode;
  fields: CalculatorField[];
}

export interface ProfessionalInsight {
  title: string;
  icon: React.ComponentType<any>;
  points: string[];
}

export interface CalculatorField {
  id: string;
  label: string;
  type: "slider" | "input";
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  prefix?: string;
}

export interface CalculatorResult {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ComponentType<any> | React.ReactNode;
  color?: string;
}

export interface ScenarioComparison {
  label: string;
  current: number;
  optimized: number;
}

interface PremiumCalculatorBaseProps {
  title?: string;
  description?: string;
  steps: CalculatorStep[];
  results: CalculatorResult[] | null;
  projectionData?: any[];
  professionalInsights?: ProfessionalInsight[];
  chartTitle?: string;
  yAxisLabel?: string;
  scenarioData?: ScenarioComparison[];
  chartData?: any[];
  onDownloadPDF?: (data: any) => void;
  reportTitle?: string;
  reportSubtitle?: string;
}

const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
};

const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

const COLORS = ["#C9A84C", "#0D1B3E", "#4B5563", "#E8E0D0"];

export const PremiumCalculatorBase = ({
  steps,
  results,
  scenarioData,
  chartData,
  onDownloadPDF,
  reportTitle,
  reportSubtitle,
}: PremiumCalculatorBaseProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showResults, setShowResults] = useState(false);

  const currentStepData = steps.find((s) => s.id === currentStep);
  const totalSteps = steps.length;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGeneratePDF = () => {
    if (!onDownloadPDF) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header
    doc.setFillColor(13, 27, 62); // Navy
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text(reportTitle, 20, 25);

    yPosition = 50;

    // Subtitle
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(reportSubtitle, 20, yPosition);
    yPosition += 15;

    // Results Section
    if (results && results.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(13, 27, 62);
      doc.text("Your Results", 20, yPosition);
      yPosition += 10;

      results.forEach((result) => {
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        doc.text(result.title, 20, yPosition);
        yPosition += 5;

        doc.setFontSize(16);
        doc.setTextColor(13, 27, 62);
        doc.text(result.value, 20, yPosition);
        yPosition += 10;

        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }
      });
    }

    // Recommendations
    yPosition += 10;
    doc.setFontSize(14);
    doc.setTextColor(13, 27, 62);
    doc.text("Next Steps", 20, yPosition);
    yPosition += 10;

    const recommendations = [
      "Schedule a consultation with our financial advisors",
      "Review your current savings and investment strategy",
      "Explore tax-advantaged retirement planning options",
      "Create a personalized action plan based on your goals",
    ];

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    recommendations.forEach((rec, idx) => {
      doc.text(`${idx + 1}. ${rec}`, 20, yPosition);
      yPosition += 8;
    });

    doc.save(`${reportTitle.replace(/\s+/g, "_")}_Report.pdf`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {!showResults ? (
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm font-semibold text-amber-600">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {currentStepData && (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Step Header */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-100 rounded-lg">
                      {currentStepData.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {currentStepData.title}
                      </h3>
                      <p className="text-gray-600">{currentStepData.description}</p>
                    </div>
                  </div>
                </div>

                {/* Fields */}
                <div className="space-y-6 bg-gray-50 p-6 rounded-xl">
                  {currentStepData.fields.map((field) => (
                    <div key={field.id} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-gray-900">
                          {field.label}
                        </label>
                        <span className="text-lg font-bold text-amber-600">
                          {field.prefix}
                          {field.type === "slider"
                            ? field.value.toLocaleString()
                            : field.value}
                          {field.suffix}
                        </span>
                      </div>

                      {field.type === "slider" ? (
                        <Slider
                          value={[field.value]}
                          onValueChange={(val) => field.onChange(val[0])}
                          min={field.min}
                          max={field.max}
                          step={field.step}
                          className="w-full"
                        />
                      ) : (
                        <input
                          type="number"
                          value={field.value}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          min={field.min}
                          max={field.max}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                      )}

                      {/* Visual Indicator */}
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300"
                          style={{
                            width: `${((field.value - field.min) / (field.max - field.min)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4">
            <Button
              onClick={handlePrev}
              disabled={currentStep === 1}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white"
            >
              {currentStep === totalSteps ? (
                <>
                  See Results <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-6">
          {/* Results Cards */}
          {results && results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((result, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            {result.title}
                          </p>
                          <p className="text-3xl font-bold text-amber-600 mt-2">
                            {result.value}
                          </p>
                          {result.subtitle && (
                            <p className="text-xs text-gray-500 mt-1">
                              {result.subtitle}
                            </p>
                          )}
                        </div>
                        {result.icon && (
                          <div className="p-2 bg-amber-100 rounded-lg">
                            {result.icon && <result.icon className="h-6 w-6 text-amber-600" />}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Scenario Comparison Chart */}
          {scenarioData && scenarioData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                  Scenario Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scenarioData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="current" fill="#4B5563" name="Current Path" />
                    <Bar dataKey="optimized" fill="#C9A84C" name="Optimized Plan" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Projection Chart */}
          {chartData && chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-amber-600" />
                  Projection Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#C9A84C"
                      strokeWidth={2}
                      dot={{ fill: "#0D1B3E" }}
                      name="Projected Value"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Key Insights */}
          <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <Zap className="h-5 w-5" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-900">
                  Your personalized plan is designed to maximize your financial goals
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-900">
                  Small consistent actions compound into significant results over time
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-900">
                  Schedule a consultation to discuss implementation strategies
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleGeneratePDF}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white flex-1"
            >
              <Download className="h-4 w-4" />
              Download PDF Report
            </Button>

            <Button
              onClick={() => setShowResults(false)}
              variant="outline"
              className="flex-1"
            >
              Adjust Inputs
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumCalculatorBase;
