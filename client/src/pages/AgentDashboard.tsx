import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Users, FileText, TrendingUp, LogOut, Loader as Loader2, Lock, ChartBar as BarChart3, ShoppingCart, UserPlus, DollarSign, Briefcase, Target, Calendar, Pencil, Trash2, Zap, Clock } from "lucide-react";
import { AgentExpenseTracker } from "@/components/AgentExpenseTracker";
import { CommissionCalculator } from "@/components/CommissionCalculator";
import { AgentCarrierTracker } from "@/components/AgentCarrierTracker";
import UnderwritingGuidelines from "@/components/UnderwritingGuidelines";
import { AgentPersistenceKPI } from "@/components/AgentPersistenceKPI";
import { trpc } from "@/lib/trpc";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";
import { ClientIntakeForm, ClientFormData } from "@/components/ClientIntakeForm";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AgentDashboard() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showCreateClientForm, setShowCreateClientForm] = useState(false);
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [intakeFormLoading, setIntakeFormLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('analytics');
  const [showAnnualReviewModal, setShowAnnualReviewModal] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [deletingClientId, setDeletingClientId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  // Sales entry edit/delete state
  const [editingSaleId, setEditingSaleId] = useState<number | null>(null);
  const [saleEditForm, setSaleEditForm] = useState<Record<string, string>>({});
  const [deletingSaleId, setDeletingSaleId] = useState<number | null>(null);
  // Bulk delete state
  const [selectedClientIds, setSelectedClientIds] = useState<Set<number>>(new Set());
  const [selectedSaleIds, setSelectedSaleIds] = useState<Set<number>>(new Set());
  const [clientFormData, setClientFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    dateOfBirth: "",
  });

  // Fetch agent session
  const { data: agent, isLoading: agentLoading } = trpc.agent.me.useQuery();

  // Fetch agent's policies, annuities, and clients
  const { data: policies = [], isLoading: policiesLoading } = trpc.agent.myPolicies.useQuery(
    undefined,
    { enabled: !!agent }
  );
  const { data: annuities = [], isLoading: annuitiesLoading } = trpc.agent.myAnnuities.useQuery(
    undefined,
    { enabled: !!agent }
  );
  const { data: clients = [], isLoading: clientsLoading } = trpc.agent.myClients.useQuery(
    undefined,
    { enabled: !!agent }
  );
  const { data: persistenceData } = trpc.agent.myPersistence.useQuery(
    undefined,
    { enabled: !!agent }
  );
  const utils = trpc.useUtils();
  const createClientMutation = trpc.agent.createClient.useMutation();

  const updateClientMutation = trpc.agent.updateClient.useMutation({
    onSuccess: () => {
      toast.success("Client updated successfully!");
      setEditingClient(null);
      utils.agent.myClients.invalidate();
    },
    onError: (err) => toast.error("Failed to update client: " + err.message),
  });

  const deleteClientMutation = trpc.agent.deleteClient.useMutation({
    onSuccess: () => {
      toast.success("Client deleted.");
      setDeletingClientId(null);
      utils.agent.myClients.invalidate();
      utils.agent.salesByMonth.invalidate();
      utils.agent.totalSalesCount.invalidate();
      utils.agent.totalAnnualPremium.invalidate();
      utils.agent.monthlyCommission.invalidate();
    },
    onError: (err) => toast.error("Failed to delete client: " + err.message),
  });

  const bulkDeleteClientsMutation = trpc.agent.bulkDeleteClients.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.deletedCount} client(s) deleted.`);
      setSelectedClientIds(new Set());
      utils.agent.myClients.invalidate();
      utils.agent.salesByMonth.invalidate();
      utils.agent.totalSalesCount.invalidate();
      utils.agent.totalAnnualPremium.invalidate();
      utils.agent.monthlyCommission.invalidate();
    },
    onError: (err) => toast.error("Failed to delete clients: " + err.message),
  });

  const bulkDeleteSalesEntryMutation = trpc.agent.bulkDeleteSalesEntries.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.deletedCount} sale(s) deleted.`);
      setSelectedSaleIds(new Set());
      utils.agent.salesByMonth.invalidate();
      utils.agent.totalSalesCount.invalidate();
      utils.agent.totalAnnualPremium.invalidate();
      utils.agent.monthlyCommission.invalidate();
    },
    onError: (err) => toast.error("Failed to delete sales: " + err.message),
  });
  const createClientIntakeMutation = trpc.agent.createClientFromIntakeForm.useMutation({
    onSuccess: () => {
      toast.success("Client added successfully!");
      setShowIntakeForm(false);
      utils.agent.myClients.invalidate();
      utils.agent.salesByMonth.invalidate();
      utils.agent.totalSalesCount.invalidate();
      utils.agent.totalAnnualPremium.invalidate();
      utils.agent.monthlyCommission.invalidate();
    },
    onError: (err) => {
      // Parse Zod validation errors into readable messages
      let msg = err.message || "Failed to save client";
      try {
        const parsed = JSON.parse(msg);
        if (Array.isArray(parsed) && parsed[0]?.message) {
          msg = parsed.map((e: { message: string }) => e.message).join(", ");
        }
      } catch {}
      toast.error("Error saving client: " + msg);
    },
  });

  const uploadProfilePictureMutation = trpc.agent.uploadProfilePicture.useMutation({
    onSuccess: () => {
      toast.success("Profile picture updated!");
      utils.agent.me.invalidate();
    },
    onError: (err) => toast.error("Failed to upload picture: " + err.message),
  });

  // Fetch agent's sales data
  const { data: monthlySales = [], isLoading: salesLoading } = trpc.agent.salesByMonth.useQuery(
    { month: selectedMonth, year: selectedYear },
    { enabled: !!agent }
  );
  const { data: totalSalesCount = 0 } = trpc.agent.totalSalesCount.useQuery(
    undefined,
    { enabled: !!agent }
  );
  const { data: thisMonthStats } = trpc.agent.thisMonthStats.useQuery(undefined, { enabled: !!agent });
  const { data: annualReviewStats } = trpc.agent.getClientsForAnnualReview.useQuery(
    undefined,
    { enabled: !!agent }
  );
  const { data: totalAnnualPremium = 0 } = trpc.agent.totalAnnualPremium.useQuery(
    undefined,
    { enabled: !!agent }
  );
  const { data: monthlyCommission = 0 } = trpc.agent.monthlyCommission.useQuery(
    { month: selectedMonth, year: selectedYear },
    { enabled: !!agent }
  );

  // Sales entry mutations
  const updateSaleMutation = trpc.agent.updateSalesEntry.useMutation({
    onSuccess: () => {
      toast.success("Sale updated!");
      setEditingSaleId(null);
      setSaleEditForm({});
      utils.agent.salesByMonth.invalidate();
      utils.agent.monthlyCommission.invalidate();
    },
    onError: (err) => toast.error("Failed to update sale: " + err.message),
  });

  const deleteSaleMutation = trpc.agent.deleteSalesEntry.useMutation({
    onSuccess: () => {
      toast.success("Sale entry deleted.");
      setDeletingSaleId(null);
      utils.agent.salesByMonth.invalidate();
      utils.agent.totalSalesCount.invalidate();
      utils.agent.totalAnnualPremium.invalidate();
      utils.agent.monthlyCommission.invalidate();
    },
    onError: (err) => toast.error("Failed to delete sale: " + err.message),
  });

  // Logout mutation
  const handleLogoutSuccess = useCallback(() => {
    window.location.href = "/";
  }, []);
  
  const logoutMutation = trpc.agent.logout.useMutation({
    onSuccess: handleLogoutSuccess,
  });

  // Filter policies based on search term
  const filteredPolicies = useMemo(() => {
    if (searchTerm.trim() === "") return policies;
    const term = searchTerm.toLowerCase();
    return policies.filter(
      (p) =>
        p.clientName?.toLowerCase().includes(term) ||
        p.policyNumber?.toLowerCase().includes(term) ||
        p.carrier?.toLowerCase().includes(term)
    );
  }, [searchTerm, policies]);

  // Redirect to login if not authenticated (after loading completes)
  useEffect(() => {
    if (!agentLoading && !agent) {
      setLocation("/agent/login");
    }
  }, [agentLoading, agent, setLocation]);

  if (!agentLoading && !agent) {
    return null;
  }

  // Show loading spinner while checking auth
  if (agentLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C9A84C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // At this point agent is guaranteed non-null (guards above handle null/loading)
  const agentData = agent!;

  // Calculate KPIs
  const totalClients = clients.length;
  const totalPolicies = policies.length;
  const totalAnnuities = annuities.length;
  const totalPremium = policies.reduce((sum, p) => sum + (p.premiumAmount ? parseFloat(p.premiumAmount as any) : 0), 0);
  const totalCoverage = policies.reduce((sum, p) => sum + (p.coverageAmount ? parseFloat(p.coverageAmount as any) : 0), 0);
  const premiumAmount = monthlySales.reduce((sum, s) => sum + (Number(s.premium) || 0), 0);
  const totalMonthlyAP = monthlySales.reduce((sum, s) => sum + (Number(s.yearlyAP) || 0), 0);
  // Derived KPIs from policies
  const activePoliciesCount = policies.filter((p: any) => p.status === 'active' || p.status === 'paid' || p.status === 'issued' || p.status === 'in_force' || p.status === 'placed').length;
  const pendingPoliciesCount = policies.filter((p: any) => p.status === 'pending' || !p.status).length;
  const totalAPOnBooks = policies.filter((p: any) => p.status === 'active' || p.status === 'paid' || p.status === 'issued' || p.status === 'in_force' || p.status === 'placed').reduce((sum, p) => sum + (p.premiumAmount ? parseFloat(p.premiumAmount as any) * 12 : 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Premium Header Section */}
        <div className="mb-10 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 tracking-tight">
                Welcome, {agentData.firstName}! 👋
              </h1>
              <p className="text-slate-400 text-lg">
                License: <span className="text-[#c9a84c] font-semibold">{agentData.licenseNumber ?? "N/A"}</span> ({agentData.licenseState ?? "N/A"})
              </p>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#8b7a2e] p-1 shadow-lg group-hover:shadow-xl group-hover:shadow-[#c9a84c]/50 transition-all duration-300">
                  {agentData.profilePictureUrl ? (
                    <img src={agentData.profilePictureUrl} alt={agentData.firstName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-700 flex items-center justify-center text-2xl font-bold text-white">
                      {agentData.firstName[0]}{agentData.lastName[0]}
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-[#c9a84c] hover:bg-[#b8963e] text-black rounded-full p-2 cursor-pointer shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100">
                  <Pencil className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const formData = new FormData();
                        formData.append('file', file);
                        try {
                          const res = await fetch('/api/upload', { method: 'POST', body: formData });
                          const { url } = await res.json();
                          uploadProfilePictureMutation.mutate({ profilePictureUrl: url });
                        } catch (err) {
                          toast.error('Failed to upload image');
                        }
                      }
                    }}
                  />
                </label>
              </div>
              <div className="text-right">
                <p className="text-slate-300 font-medium">{agentData.email}</p>
                <Badge className="mt-2 bg-green-600 text-white hover:bg-green-700">
                  ✓ {agentData.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowChangePasswordModal(true)}
                  variant="outline"
                  className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <Lock className="w-4 h-4" />
                  Change Password
                </Button>
                <Button
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  variant="outline"
                  className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <LogOut className="w-4 h-4" />
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Button
            onClick={() => setShowIntakeForm(true)}
            className="gap-2 bg-[#c9a84c] hover:bg-[#b8963e] text-black font-semibold shadow-lg shadow-[#c9a84c]/20 transition-all duration-200 active:scale-[0.97]"
          >
            <UserPlus className="w-4 h-4" />
            New Client
          </Button>
          <Button
            onClick={() => setActiveTab('sales')}
            variant="outline"
            className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-[#c9a84c]/50 transition-all duration-200 active:scale-[0.97]"
          >
            <ShoppingCart className="w-4 h-4" />
            Sales Tracker
          </Button>
          <Button
            onClick={() => setActiveTab('policies')}
            variant="outline"
            className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-[#c9a84c]/50 transition-all duration-200 active:scale-[0.97]"
          >
            <FileText className="w-4 h-4" />
            View Policies
          </Button>
          <Button
            onClick={() => setActiveTab('clients')}
            variant="outline"
            className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-[#c9a84c]/50 transition-all duration-200 active:scale-[0.97]"
          >
            <Users className="w-4 h-4" />
            View Clients
          </Button>
          <Button
            onClick={() => setActiveTab('analytics')}
            variant="outline"
            className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-[#c9a84c]/50 transition-all duration-200 active:scale-[0.97]"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </Button>
        </div>

        {/* Premium Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-lg p-1 backdrop-blur-sm">
            <TabsList className="bg-transparent border-0 w-full h-auto gap-2 p-2">
              <TabsTrigger 
                value="analytics" 
                className="gap-2 px-6 py-3 rounded-md text-base font-semibold transition-all duration-300 text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#c9a84c] data-[state=active]:to-[#b8963e] data-[state=active]:text-black data-[state=active]:shadow-lg hover:bg-slate-700/50 hover:text-white"
              >
                <BarChart3 className="w-5 h-5" />
                Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="sales" 
                className="gap-2 px-6 py-3 rounded-md text-base font-semibold transition-all duration-300 text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#c9a84c] data-[state=active]:to-[#b8963e] data-[state=active]:text-black data-[state=active]:shadow-lg hover:bg-slate-700/50 hover:text-white"
              >
                <ShoppingCart className="w-5 h-5" />
                Sales Tracker
              </TabsTrigger>
              <TabsTrigger 
                value="clients" 
                className="gap-2 px-6 py-3 rounded-md text-base font-semibold transition-all duration-300 text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#c9a84c] data-[state=active]:to-[#b8963e] data-[state=active]:text-black data-[state=active]:shadow-lg hover:bg-slate-700/50 hover:text-white"
              >
                <Users className="w-5 h-5" />
                Clients
              </TabsTrigger>
              <TabsTrigger 
                value="policies" 
                className="gap-2 px-6 py-3 rounded-md text-base font-semibold transition-all duration-300 text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#c9a84c] data-[state=active]:to-[#b8963e] data-[state=active]:text-black data-[state=active]:shadow-lg hover:bg-slate-700/50 hover:text-white"
              >
                <FileText className="w-5 h-5" />
                Policies
              </TabsTrigger>
              <TabsTrigger 
                value="annuities" 
                className="gap-2 px-6 py-3 rounded-md text-base font-semibold transition-all duration-300 text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#c9a84c] data-[state=active]:to-[#b8963e] data-[state=active]:text-black data-[state=active]:shadow-lg hover:bg-slate-700/50 hover:text-white"
              >
                <TrendingUp className="w-5 h-5" />
                Annuities
              </TabsTrigger>
              <TabsTrigger 
                value="carriers" 
                className="gap-2 px-6 py-3 rounded-md text-base font-semibold transition-all duration-300 text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#c9a84c] data-[state=active]:to-[#b8963e] data-[state=active]:text-black data-[state=active]:shadow-lg hover:bg-slate-700/50 hover:text-white"
              >
                <Briefcase className="w-5 h-5" />
                Carriers
              </TabsTrigger>
              <TabsTrigger 
                value="guidelines" 
                className="gap-2 px-6 py-3 rounded-md text-base font-semibold transition-all duration-300 text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#c9a84c] data-[state=active]:to-[#b8963e] data-[state=active]:text-black data-[state=active]:shadow-lg hover:bg-slate-700/50 hover:text-white"
              >
                <FileText className="w-5 h-5" />
                Guidelines
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-8">
            {/* Premium KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {/* Total Clients Card */}
              <div className="group relative hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-blue-400/30 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                <Card className="relative bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/70 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-blue-500/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-slate-300">Total Clients</CardTitle>
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-white mb-1">{totalClients}</div>
                    <p className="text-blue-300 text-xs font-medium">Under management</p>
                  </CardContent>
                </Card>
              </div>

              {/* Policies Card */}
              <div className="group relative hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-purple-400/30 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                <Card className="relative bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/70 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-purple-500/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-slate-300">Policies</CardTitle>
                      <FileText className="w-5 h-5 text-purple-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-white mb-1">{totalPolicies}</div>
                    <p className="text-purple-300 text-xs font-medium">Active policies</p>
                  </CardContent>
                </Card>
              </div>

              {/* Annuities Card */}
              <div className="group relative hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/30 to-emerald-400/30 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                <Card className="relative bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover:border-emerald-500/70 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-emerald-500/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-slate-300">Annuities</CardTitle>
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-white mb-1">{totalAnnuities}</div>
                    <p className="text-emerald-300 text-xs font-medium">FIA/MYGA products</p>
                  </CardContent>
                </Card>
              </div>

              {/* Total Sales Card */}
              <div className="group relative hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600/30 to-amber-400/30 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                <Card className="relative bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover:border-amber-500/70 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-amber-500/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-slate-300">Total Sales</CardTitle>
                      <ShoppingCart className="w-5 h-5 text-amber-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-white mb-1">{totalSalesCount}</div>
                    <p className="text-amber-300 text-xs font-medium">All time</p>
                  </CardContent>
                </Card>
              </div>

              {/* Coverage Card */}
              <div className="group relative hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-600/30 to-rose-400/30 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                <Card className="relative bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover:border-rose-500/70 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-rose-500/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-slate-300">Coverage</CardTitle>
                      <Target className="w-5 h-5 text-rose-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-white mb-1">{totalCoverage > 0 ? `$${(totalCoverage / 1000000).toFixed(1)}M` : "N/A"}</div>
                    <p className="text-rose-300 text-xs font-medium">{totalCoverage > 0 ? "Total face amount" : "No coverage entered"}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Active Policies Card */}
              <div className="group relative hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/30 to-green-400/30 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                <Card className="relative bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover:border-green-500/70 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-green-500/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-slate-300">Active Policies</CardTitle>
                      <Zap className="w-5 h-5 text-green-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-white mb-1">{activePoliciesCount}</div>
                    <p className="text-green-300 text-xs font-medium">In-force life policies</p>
                  </CardContent>
                </Card>
              </div>

              {/* Pending Cases Card */}
              <div className="group relative hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/30 to-yellow-400/30 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                <Card className="relative bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover:border-yellow-500/70 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-yellow-500/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-slate-300">Pending Cases</CardTitle>
                      <Clock className="w-5 h-5 text-yellow-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-white mb-1">{pendingPoliciesCount}</div>
                    <p className="text-yellow-300 text-xs font-medium">Awaiting placement</p>
                  </CardContent>
                </Card>
              </div>

              {/* AP on Books Card */}
              <div className="group relative hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-[#c9a84c]/30 to-[#b8963e]/30 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                <Card className="relative bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover:border-[#c9a84c]/70 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-[#c9a84c]/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-slate-300">AP on Books</CardTitle>
                      <DollarSign className="w-5 h-5 text-[#c9a84c]" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-[#c9a84c] mb-1">${totalAPOnBooks > 0 ? (totalAPOnBooks >= 1000 ? `${(totalAPOnBooks / 1000).toFixed(1)}K` : totalAPOnBooks.toFixed(0)) : '0'}</div>
                    <p className="text-[#c9a84c]/70 text-xs font-medium">Annual premium (active)</p>
                  </CardContent>
                </Card>
              </div>

              {/* Annual Reviews Card */}
              <div className="group relative hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/30 to-cyan-400/30 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                <Card className="relative bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover:border-cyan-500/70 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-cyan-500/20 cursor-pointer" onClick={() => setShowAnnualReviewModal(true)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-slate-300">Annual Reviews Due</CardTitle>
                      <Calendar className="w-5 h-5 text-cyan-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-white mb-1">{annualReviewStats?.total || 0}</div>
                    <p className="text-cyan-300 text-xs font-medium">{annualReviewStats?.dueThisMonth || 0} due this month</p>
                  </CardContent>
                </Card>
              </div>

              {/* Persistence Rate Card */}
              {persistenceData ? (
                <AgentPersistenceKPI
                  persistenceRate={persistenceData.persistenceRate ?? null}
                  activePolicies={persistenceData.activePolicies}
                  cancelledThisMonth={persistenceData.cancelledThisMonth}
                  startingBlock={persistenceData.startingBlock}
                  stillActive={persistenceData.stillActive}
                />
              ) : (
                <div className="group relative">
                  <Card className="relative bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-slate-700/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-slate-300">Persistence Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold text-slate-500 mb-1 animate-pulse">—</div>
                      <p className="text-slate-500 text-xs font-medium">Loading...</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* This Month Stats Section */}
            <div className="mt-8 pt-8 border-t border-slate-700">
              <h3 className="text-2xl font-bold text-white mb-6">This Month Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* This Month Sales Card */}
                <div className="group relative hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600/30 to-orange-400/30 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                  <Card className="relative bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover:border-orange-500/70 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-orange-500/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold text-slate-300">Sales Count</CardTitle>
                        <ShoppingCart className="w-5 h-5 text-orange-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold text-white mb-1">{thisMonthStats?.salesCount || 0}</div>
                      <p className="text-orange-300 text-xs font-medium">Sales this month</p>
                    </CardContent>
                  </Card>
                </div>

                {/* This Month AP Card */}
                <div className="group relative hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/30 to-indigo-400/30 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                  <Card className="relative bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover:border-indigo-500/70 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-indigo-500/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold text-slate-300">Annual Premium</CardTitle>
                        <DollarSign className="w-5 h-5 text-indigo-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold text-white mb-1">${(thisMonthStats?.totalAP || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                      <p className="text-indigo-300 text-xs font-medium">AP this month</p>
                    </CardContent>
                  </Card>
                </div>

                {/* This Month Commission Card */}
                <div className="group relative hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-600/30 to-teal-400/30 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                  <Card className="relative bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover:border-teal-500/70 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-teal-500/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold text-slate-300">Commission Earned</CardTitle>
                        <TrendingUp className="w-5 h-5 text-teal-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold text-white mb-1">${(thisMonthStats?.totalCommission || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      <p className="text-teal-300 text-xs font-medium">Commission earned</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Monthly Commission Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[#c9a84c]" />
                    Monthly Commission
                  </CardTitle>
                  <CardDescription>For {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-[#c9a84c] mb-2">
                    ${typeof monthlyCommission === 'number' ? monthlyCommission.toFixed(2) : '0.00'}
                  </div>
                  <p className="text-slate-400">Based on {monthlySales.length} sales entries</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-[#c9a84c]" />
                    Monthly Premium
                  </CardTitle>
                  <CardDescription>Total annual premium issued</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-[#c9a84c] mb-2">
                    ${totalMonthlyAP.toFixed(2)}
                  </div>
                  <p className="text-slate-400">Annualized premium for this month</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sales Tracker Tab */}
          <TabsContent value="sales" className="space-y-6">
            <div className="flex justify-end">
              <CommissionCalculator />
            </div>
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-[#c9a84c]" />
                      Monthly Sales Tracker
                    </CardTitle>
                    <CardDescription>Track your sales and commissions by month</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      className="px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-md text-sm hover:border-slate-500 focus:border-[#c9a84c] focus:outline-none"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(0, i).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-md text-sm hover:border-slate-500 focus:border-[#c9a84c] focus:outline-none"
                    >
                      {Array.from({ length: 5 }, (_, i) => (
                        <option key={i} value={new Date().getFullYear() - i}>
                          {new Date().getFullYear() - i}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {monthlySales.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No sales entries for this month yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedSaleIds.size > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-sm">{selectedSaleIds.size} selected</span>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Selected ({selectedSaleIds.size})
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete {selectedSaleIds.size} sale(s)?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the selected sales entries. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => {
                                  bulkDeleteSalesEntryMutation.mutate({ ids: Array.from(selectedSaleIds) });
                                }}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left py-3 px-4 text-slate-300 font-semibold w-10">
                              <input
                                type="checkbox"
                                checked={selectedSaleIds.size > 0 && selectedSaleIds.size === monthlySales.length}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedSaleIds(new Set(monthlySales.map((s: any) => s.id)));
                                  } else {
                                    setSelectedSaleIds(new Set());
                                  }
                                }}
                                className="w-4 h-4 cursor-pointer"
                              />
                            </th>
                            <th className="text-left py-3 px-4 text-slate-300 font-semibold">Client</th>
                          <th className="text-left py-3 px-4 text-slate-300 font-semibold">Product</th>
                          <th className="text-left py-3 px-4 text-slate-300 font-semibold">Carrier</th>
                          <th className="text-right py-3 px-4 text-slate-300 font-semibold">Premium</th>
                          <th className="text-right py-3 px-4 text-slate-300 font-semibold">Commission</th>
                          <th className="text-right py-3 px-4 text-slate-300 font-semibold w-20">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlySales.map((sale: any) => (
                          editingSaleId === sale.id ? (
                            // Inline edit row
                            <tr key={sale.id} className="border-b border-[#c9a84c]/40 bg-slate-700/50">
                              <td className="py-2 px-3" colSpan={6}>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
                                  <div>
                                    <label className="text-xs text-slate-400 block mb-1">Client Name</label>
                                    <input
                                      className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white text-sm focus:border-[#c9a84c] focus:outline-none"
                                      value={saleEditForm.clientName ?? ""}
                                      onChange={e => setSaleEditForm(f => ({ ...f, clientName: e.target.value }))}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-slate-400 block mb-1">Product Type</label>
                                    <input
                                      className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white text-sm focus:border-[#c9a84c] focus:outline-none"
                                      value={saleEditForm.productType ?? ""}
                                      onChange={e => setSaleEditForm(f => ({ ...f, productType: e.target.value }))}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-slate-400 block mb-1">Carrier</label>
                                    <input
                                      className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white text-sm focus:border-[#c9a84c] focus:outline-none"
                                      value={saleEditForm.carrier ?? ""}
                                      onChange={e => setSaleEditForm(f => ({ ...f, carrier: e.target.value }))}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-slate-400 block mb-1">Monthly Premium ($)</label>
                                    <input
                                      type="number" step="0.01" min="0"
                                      className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white text-sm focus:border-[#c9a84c] focus:outline-none"
                                      value={saleEditForm.premium ?? ""}
                                      onChange={e => setSaleEditForm(f => ({ ...f, premium: e.target.value }))}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-slate-400 block mb-1">Commission %</label>
                                    <input
                                      type="number" step="0.01" min="0" max="200"
                                      className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white text-sm focus:border-[#c9a84c] focus:outline-none"
                                      value={saleEditForm.commissionPercent ?? ""}
                                      onChange={e => setSaleEditForm(f => ({ ...f, commissionPercent: e.target.value }))}
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-[#c9a84c] hover:bg-[#b8963e] text-black font-semibold"
                                    disabled={updateSaleMutation.isPending}
                                    onClick={() => {
                                      const updates: Record<string, any> = { id: sale.id };
                                      if (saleEditForm.clientName !== undefined) updates.clientName = saleEditForm.clientName;
                                      if (saleEditForm.productType !== undefined) updates.productType = saleEditForm.productType;
                                      if (saleEditForm.carrier !== undefined) updates.carrier = saleEditForm.carrier;
                                      if (saleEditForm.premium !== undefined && saleEditForm.premium !== "") updates.premium = parseFloat(saleEditForm.premium);
                                      if (saleEditForm.commissionPercent !== undefined && saleEditForm.commissionPercent !== "") updates.commissionPercent = parseFloat(saleEditForm.commissionPercent);
                                      updateSaleMutation.mutate(updates as any);
                                    }}
                                  >
                                    {updateSaleMutation.isPending ? "Saving..." : "Save"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                    onClick={() => { setEditingSaleId(null); setSaleEditForm({}); }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            // Normal display row
                            <tr key={sale.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors group">
                              <td className="py-3 px-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedSaleIds.has(sale.id)}
                                  onChange={(e) => {
                                    const newSet = new Set(selectedSaleIds);
                                    if (e.target.checked) {
                                      newSet.add(sale.id);
                                    } else {
                                      newSet.delete(sale.id);
                                    }
                                    setSelectedSaleIds(newSet);
                                  }}
                                  className="w-4 h-4 cursor-pointer"
                                />
                              </td>
                              <td className="py-3 px-4 text-white">{sale.clientName || 'N/A'}</td>
                              <td className="py-3 px-4 text-slate-300">{sale.productType || 'N/A'}</td>
                              <td className="py-3 px-4 text-slate-300">{sale.carrier || 'N/A'}</td>
                              <td className="py-3 px-4 text-right text-white font-medium">${Number(sale.premium || 0).toFixed(2)}</td>
                              <td className="py-3 px-4 text-right text-[#c9a84c] font-semibold">${Number(sale.commission || 0).toFixed(2)}</td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0 text-slate-400 hover:text-[#c9a84c] hover:bg-slate-600"
                                    onClick={() => {
                                      setEditingSaleId(sale.id);
                                      setSaleEditForm({
                                        clientName: sale.clientName || "",
                                        productType: sale.productType || "",
                                        carrier: sale.carrier || "",
                                        premium: sale.premium ? String(Number(sale.premium)) : "",
                                        commissionPercent: sale.commissionPercent ? String(Number(sale.commissionPercent)) : "",
                                      });
                                    }}
                                    title="Edit sale"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0 text-slate-400 hover:text-red-400 hover:bg-slate-600"
                                    onClick={() => setDeletingSaleId(sale.id)}
                                    title="Delete sale"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )
                        ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Expense Tracker Section */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-red-400" />
                  Expenses & Net Revenue
                </CardTitle>
                <CardDescription>Track your monthly business expenses and see your net revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <AgentExpenseTracker
                  month={selectedMonth}
                  year={selectedYear}
                  monthlyCommission={monthlyCommission}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                {selectedClientIds.size > 0 && (
                  <span className="text-slate-400 text-sm mr-4">{selectedClientIds.size} selected</span>
                )}
              </div>
              <div className="flex gap-2">
                {selectedClientIds.size > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Selected ({selectedClientIds.size})
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedClientIds.size} client(s)?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the selected clients and all their associated policies. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => {
                            bulkDeleteClientsMutation.mutate({ ids: Array.from(selectedClientIds) });
                          }}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                <Button
                  onClick={() => setShowIntakeForm(true)}
                  className="gap-2 bg-[#c9a84c] hover:bg-[#b8963e] text-black font-semibold px-6 py-2"
                >
                  <UserPlus className="w-5 h-5" />
                  New Client Intake Form
                </Button>
              </div>
            </div>

            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#c9a84c]" />
                  Your Clients
                </CardTitle>
                <CardDescription>Manage and view all your clients</CardDescription>
              </CardHeader>
              <CardContent>
                {clientsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 text-slate-400 mx-auto animate-spin" />
                  </div>
                ) : clients.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No clients yet. Create your first client to get started.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {clients.map((client: any) => (
                      <div key={client.id} className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:border-[#c9a84c]/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedClientIds.has(client.id)}
                              onChange={(e) => {
                                const newSet = new Set(selectedClientIds);
                                if (e.target.checked) {
                                  newSet.add(client.id);
                                } else {
                                  newSet.delete(client.id);
                                }
                                setSelectedClientIds(newSet);
                              }}
                              className="w-4 h-4 cursor-pointer"
                            />
                            <h3 className="text-white font-semibold">{client.firstName} {client.lastName}</h3>
                          </div>
                          <div className="flex gap-1 ml-2 shrink-0">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-slate-400 hover:text-[#c9a84c] hover:bg-slate-600"
                              onClick={() => {
                                setEditingClient(client);
                                setEditForm({
                                  firstName: client.firstName || "",
                                  lastName: client.lastName || "",
                                  email: client.email || "",
                                  phone: client.phone || "",
                                  address: client.address || "",
                                  city: client.city || "",
                                  state: client.state || "",
                                  zip: client.zip || "",
                                  dateOfBirth: client.dateOfBirth || "",
                                  gender: client.gender || "",
                                });
                              }}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-slate-400 hover:text-red-400 hover:bg-slate-600"
                              onClick={() => setDeletingClientId(client.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                        {client.email && <p className="text-slate-400 text-sm mb-1">{client.email}</p>}
                        {client.phone && <p className="text-slate-400 text-sm mb-1">{client.phone}</p>}
                        {client.city && <p className="text-slate-400 text-sm">{client.city}{client.state ? `, ${client.state}` : ""}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies" className="space-y-6">
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#c9a84c]" />
                      Your Policies
                    </CardTitle>
                    <CardDescription>View and manage all your policies</CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <Input
                      placeholder="Search policies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {policiesLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 text-slate-400 mx-auto animate-spin" />
                  </div>
                ) : filteredPolicies.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No policies found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4 text-slate-300 font-semibold">Client</th>
                          <th className="text-left py-3 px-4 text-slate-300 font-semibold">Type</th>
                          <th className="text-left py-3 px-4 text-slate-300 font-semibold">Carrier</th>
                          <th className="text-right py-3 px-4 text-slate-300 font-semibold">Premium</th>
                          <th className="text-right py-3 px-4 text-slate-300 font-semibold">Coverage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPolicies.map((policy: any) => (
                          <tr key={policy.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                            <td className="py-3 px-4 text-white">{policy.clientName}</td>
                            <td className="py-3 px-4 text-slate-300">{policy.type}</td>
                            <td className="py-3 px-4 text-slate-300">{policy.carrier}</td>
                            <td className="py-3 px-4 text-right text-white font-medium">${Number(policy.premiumAmount || 0).toFixed(2)}</td>
                            <td className="py-3 px-4 text-right text-[#c9a84c] font-semibold">{Number(policy.coverageAmount || 0) > 0 ? `$${Number(policy.coverageAmount).toLocaleString()}` : "N/A"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Annuities Tab */}
          <TabsContent value="annuities" className="space-y-6">
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#c9a84c]" />
                  Your Annuities
                </CardTitle>
                <CardDescription>FIA and MYGA products</CardDescription>
              </CardHeader>
              <CardContent>
                {annuitiesLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 text-slate-400 mx-auto animate-spin" />
                  </div>
                ) : annuities.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No annuities yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4 text-slate-300 font-semibold">Client</th>
                          <th className="text-left py-3 px-4 text-slate-300 font-semibold">Type</th>
                          <th className="text-left py-3 px-4 text-slate-300 font-semibold">Carrier</th>
                          <th className="text-right py-3 px-4 text-slate-300 font-semibold">Premium</th>
                          <th className="text-right py-3 px-4 text-slate-300 font-semibold">Term</th>
                        </tr>
                      </thead>
                      <tbody>
                        {annuities.map((annuity: any) => (
                          <tr key={annuity.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                            <td className="py-3 px-4 text-white">{annuity.clientName}</td>
                            <td className="py-3 px-4 text-slate-300">{annuity.type}</td>
                            <td className="py-3 px-4 text-slate-300">{annuity.carrier}</td>
                            <td className="py-3 px-4 text-right text-white font-medium">${Number(annuity.premium || 0).toFixed(2)}</td>
                            <td className="py-3 px-4 text-right text-[#c9a84c] font-semibold">{annuity.term} years</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Carriers Tab */}
          <TabsContent value="carriers" className="space-y-6">
            <AgentCarrierTracker />
          </TabsContent>

          {/* Underwriting Guidelines Tab */}
          <TabsContent value="guidelines" className="space-y-6">
            <UnderwritingGuidelines />
          </TabsContent>
        </Tabs>

        {/* Change Password Modal */}
        <ChangePasswordModal
          open={showChangePasswordModal}
          onOpenChange={setShowChangePasswordModal}
        />

        {/* Edit Client Dialog */}
        <Dialog open={!!editingClient} onOpenChange={(open) => !open && setEditingClient(null)}>
          <DialogContent className="max-w-lg bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Client</DialogTitle>
              <DialogDescription className="text-slate-400">Update client information below.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-2">
              {([
                ["firstName", "First Name"],
                ["lastName", "Last Name"],
                ["email", "Email"],
                ["phone", "Phone"],
                ["address", "Address"],
                ["city", "City"],
                ["state", "State"],
                ["zip", "ZIP Code"],
                ["dateOfBirth", "Date of Birth"],
                ["gender", "Gender"],
              ] as [string, string][]).map(([field, label]) => (
                <div key={field} className={field === "address" ? "col-span-2" : ""}>
                  <Label className="text-slate-300 text-sm mb-1 block">{label}</Label>
                  <Input
                    value={editForm[field] || ""}
                    onChange={(e) => setEditForm(prev => ({ ...prev, [field]: e.target.value }))}
                    className="bg-slate-800 border-slate-600 text-white placeholder-slate-500"
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" className="border-slate-600 text-slate-300" onClick={() => setEditingClient(null)}>Cancel</Button>
              <Button
                className="bg-[#c9a84c] hover:bg-[#b8963e] text-black font-semibold"
                disabled={updateClientMutation.isPending}
                onClick={() => {
                  if (!editingClient) return;
                  updateClientMutation.mutate({ id: editingClient.id, ...editForm });
                }}
              >
                {updateClientMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Client Confirmation */}
        <AlertDialog open={!!deletingClientId} onOpenChange={(open) => !open && setDeletingClientId(null)}>
          <AlertDialogContent className="bg-slate-900 border-slate-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Delete Client?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                This will permanently delete the client and all associated data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-slate-600 text-slate-300 bg-transparent hover:bg-slate-800">Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => deletingClientId && deleteClientMutation.mutate({ id: deletingClientId })}
              >
                {deleteClientMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Sale Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingSaleId} onOpenChange={(open) => !open && setDeletingSaleId(null)}>
          <AlertDialogContent className="bg-slate-900 border-slate-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Delete Sale Entry?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                This will permanently remove this sales entry. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-slate-600 text-slate-300 bg-transparent hover:bg-slate-800">Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => deletingSaleId && deleteSaleMutation.mutate({ id: deletingSaleId })}
              >
                {deleteSaleMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Client Intake Form Dialog */}
        <Dialog open={showIntakeForm} onOpenChange={setShowIntakeForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0f1117] border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">New Client Financial Profile</DialogTitle>
              <DialogDescription className="text-gray-400">
                Fill out the complete client intake form below
              </DialogDescription>
            </DialogHeader>
            <ClientIntakeForm
              onSubmit={async (data) => {
                const { healthConditions, beneficiary, commissionPercent, yearlyAP, ...rest } = data;
                await createClientIntakeMutation.mutateAsync({
                  ...rest,
                  annualPremium: yearlyAP || '0',
                  healthConditionsJSON: JSON.stringify(healthConditions),
                  commissionPercent: parseFloat(commissionPercent) || 0,
                });
              }}
              isLoading={createClientIntakeMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
