'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Users, DollarSign, Target, ChartBar as BarChart3, Calendar, Plus, ArrowUpRight, Sparkles } from 'lucide-react';

interface PremiumAgentDashboardProps {
  agent: any;
  totalSalesCount: number;
  totalAnnualPremium: number;
  monthlyCommission: number;
  monthlySales: any[];
  onNewClient: () => void;
  onNewSale: () => void;
  children?: React.ReactNode;
}

export function PremiumAgentDashboard({
  agent,
  totalSalesCount,
  totalAnnualPremium,
  monthlyCommission,
  monthlySales,
  onNewClient,
  onNewSale,
  children,
}: PremiumAgentDashboardProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const kpiCards = [
    {
      title: 'Total Clients',
      value: totalSalesCount,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      lightColor: 'bg-blue-50',
      trend: '+12% this month',
      description: 'Active clients in your portfolio',
    },
    {
      title: 'Annual Premium',
      value: `$${(totalAnnualPremium / 1000).toFixed(1)}K`,
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
      lightColor: 'bg-emerald-50',
      trend: '+8% growth',
      description: 'Total annualized premium',
    },
    {
      title: 'This Month Commission',
      value: `$${monthlyCommission.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      icon: TrendingUp,
      color: 'from-amber-500 to-amber-600',
      lightColor: 'bg-amber-50',
      trend: 'On track',
      description: 'Commission earned this month',
    },
    {
      title: 'Sales This Month',
      value: monthlySales.length,
      icon: Target,
      color: 'from-purple-500 to-purple-600',
      lightColor: 'bg-purple-50',
      trend: `${monthlySales.length} entries`,
      description: 'Sales recorded this month',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
                  Welcome Back, {agent?.firstName}
                </h1>
                <p className="text-slate-400 mt-2 text-lg">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={onNewClient}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                >
                  <Plus size={18} />
                  New Client
                </Button>
                <Button
                  onClick={onNewSale}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                >
                  <Plus size={18} />
                  New Sale
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {kpiCards.map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <motion.div key={idx} variants={itemVariants}>
                  <motion.div
                    whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
                    transition={{ duration: 0.3 }}
                    className="group relative"
                  >
                    {/* Gradient background */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${kpi.color} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                    />

                    {/* Card */}
                    <div className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 overflow-hidden">
                      {/* Animated gradient border on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`${kpi.lightColor} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="text-slate-900" size={24} />
                          </div>
                          <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0">
                            <ArrowUpRight size={14} className="mr-1" />
                            {kpi.trend}
                          </Badge>
                        </div>

                        <p className="text-slate-400 text-sm font-medium mb-2">{kpi.title}</p>
                        <h3 className="text-3xl font-bold text-white mb-1">{kpi.value}</h3>
                        <p className="text-slate-500 text-xs">{kpi.description}</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
