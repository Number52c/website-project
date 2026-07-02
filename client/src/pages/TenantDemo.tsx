import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ChartBar as BarChart3, Settings, LogOut } from "lucide-react";

// Demo tenant data
const DEMO_TENANTS = [
  {
    id: "demo-tenant-001",
    companyName: "Demo Insurance Agency",
    domain: "demo.local",
    primaryColor: "#0D1B3E",
    secondaryColor: "#D4AF37",
    subscriptionStatus: "active",
    subscriptionPlan: "professional",
  },
  {
    id: "demo-tenant-002",
    companyName: "Sunrise Insurance Group",
    domain: "sunrise.local",
    primaryColor: "#FF6B35",
    secondaryColor: "#F7931E",
    subscriptionStatus: "trial",
    subscriptionPlan: "professional",
  },
  {
    id: "demo-tenant-003",
    companyName: "Elite Financial Solutions",
    domain: "elite.local",
    primaryColor: "#1E3A8A",
    secondaryColor: "#60A5FA",
    subscriptionStatus: "active",
    subscriptionPlan: "enterprise",
  },
];

const DEMO_CLIENTS = [
  { id: 1, name: "John Smith", email: "john@example.com", policies: 2, status: "Active" },
  { id: 2, name: "Sarah Johnson", email: "sarah@example.com", policies: 1, status: "Active" },
  { id: 3, name: "Michael Williams", email: "michael@example.com", policies: 3, status: "Active" },
  { id: 4, name: "Emily Brown", email: "emily@example.com", policies: 1, status: "Pending" },
  { id: 5, name: "David Davis", email: "david@example.com", policies: 2, status: "Active" },
];

const DEMO_ANALYTICS = {
  totalClients: 5,
  totalPolicies: 9,
  totalAP: 325.0,
  monthlyCommission: 2150.0,
  activeClients: 4,
};

export default function TenantDemo() {
  const [selectedTenant, setSelectedTenant] = useState(DEMO_TENANTS[0]);
  const [activeTab, setActiveTab] = useState<"overview" | "clients" | "settings">("overview");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Multi-Tenant Demo</h1>
            <p className="text-sm text-gray-600">Switch between different agent tenants to see isolated data</p>
          </div>
          <Button variant="outline" className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tenant Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Tenant</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DEMO_TENANTS.map((tenant) => (
              <Card
                key={tenant.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedTenant.id === tenant.id
                    ? "ring-2 ring-offset-2"
                    : "hover:shadow-lg"
                }`}
                style={{
                  outlineColor: selectedTenant.id === tenant.id ? selectedTenant.primaryColor : undefined,
                } as React.CSSProperties}
                onClick={() => setSelectedTenant(tenant)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: tenant.primaryColor }}
                  >
                    {tenant.companyName.charAt(0)}
                  </div>
                  <Badge
                    variant={tenant.subscriptionStatus === "active" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {tenant.subscriptionStatus}
                  </Badge>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{tenant.companyName}</h3>
                <p className="text-xs text-gray-600 mt-1">{tenant.domain}</p>
                <p className="text-xs text-gray-500 mt-2">{tenant.subscriptionPlan} plan</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Tenant Dashboard */}
        <div className="space-y-6">
          {/* Tenant Header */}
          <div
            className="rounded-lg p-6 text-white"
            style={{ backgroundColor: selectedTenant.primaryColor }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold mb-2">{selectedTenant.companyName}</h2>
                <p className="opacity-90">Domain: {selectedTenant.domain}</p>
                <p className="opacity-90">Plan: {selectedTenant.subscriptionPlan}</p>
              </div>
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold"
                style={{ backgroundColor: selectedTenant.secondaryColor, color: selectedTenant.primaryColor }}
              >
                {selectedTenant.companyName.charAt(0)}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("clients")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "clients"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Clients
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "settings"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Settings
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-6">
                <p className="text-sm text-gray-600 mb-2">Total Clients</p>
                <p className="text-3xl font-bold text-gray-900">{DEMO_ANALYTICS.totalClients}</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-gray-600 mb-2">Total Policies</p>
                <p className="text-3xl font-bold text-gray-900">{DEMO_ANALYTICS.totalPolicies}</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-gray-600 mb-2">Total AP</p>
                <p className="text-3xl font-bold text-gray-900">${DEMO_ANALYTICS.totalAP.toLocaleString()}</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-gray-600 mb-2">Monthly Commission</p>
                <p className="text-3xl font-bold text-gray-900">${DEMO_ANALYTICS.monthlyCommission.toLocaleString()}</p>
              </Card>
            </div>
          )}

          {activeTab === "clients" && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Clients</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Policies</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEMO_CLIENTS.map((client) => (
                      <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">{client.name}</td>
                        <td className="py-3 px-4 text-gray-600">{client.email}</td>
                        <td className="py-3 px-4 text-gray-900">{client.policies}</td>
                        <td className="py-3 px-4">
                          <Badge variant={client.status === "Active" ? "default" : "secondary"}>
                            {client.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {activeTab === "settings" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Branding</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    <input
                      type="text"
                      value={selectedTenant.companyName}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg border-2 border-gray-300"
                        style={{ backgroundColor: selectedTenant.primaryColor }}
                      />
                      <span className="text-sm text-gray-600">{selectedTenant.primaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg border-2 border-gray-300"
                        style={{ backgroundColor: selectedTenant.secondaryColor }}
                      />
                      <span className="text-sm text-gray-600">{selectedTenant.secondaryColor}</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
                    <input
                      type="text"
                      value={selectedTenant.subscriptionPlan}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 capitalize"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            selectedTenant.subscriptionStatus === "active" ? "#10B981" : "#F59E0B",
                        }}
                      />
                      <span className="text-sm text-gray-600 capitalize">
                        {selectedTenant.subscriptionStatus}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
                    <input
                      type="text"
                      value={selectedTenant.domain}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Multi-Tenant Demo:</strong> This demo shows how different insurance agents will see their own
            branded instance of the platform. Each tenant has isolated data, custom branding (colors, company name),
            and their own dashboard. Try switching between tenants to see how the interface adapts!
          </p>
        </div>
      </div>
    </div>
  );
}
