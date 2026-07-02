"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CircleAlert as AlertCircle, CircleCheck as CheckCircle2, Loader as Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface PolicyEditRow {
  id: number;
  policyNumber: string;
  clientName: string;
  carrier: string;
  type: string;
  premiumAmount: number | null;
  yearlyAP: number | null;
  coverageAmount: number | null;
  effectiveDate: Date | null;
  status: string;
  commissionRate: number | null;
  edited: boolean;
}

export function BulkPolicyEditor() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editedRows, setEditedRows] = useState<Map<number, Partial<PolicyEditRow>>>(new Map());
  const [isSaving, setIsSaving] = useState(false);

  // Fetch all policies
  const { data: policies, isLoading } = trpc.admin.listPolicies.useQuery();
  const updateMutation = trpc.admin.updatePoliciesBulk.useMutation();

  // Filter policies based on search term
  const filteredPolicies = useMemo(() => {
    if (!policies) return [];
    return policies.filter((p) =>
      p.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.carrier.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [policies, searchTerm]);

  // Handle field change
  const handleFieldChange = (
    policyId: number,
    field: keyof PolicyEditRow,
    value: string | number | null
  ) => {
    const updated = new Map(editedRows);
    if (!updated.has(policyId)) {
      const original = policies?.find((p) => p.id === policyId);
      if (original) {
        updated.set(policyId, { ...original });
      }
    }
    const row = updated.get(policyId);
    if (row) {
      (row as any)[field] = value;
      updated.set(policyId, row);
      setEditedRows(updated);
    }
  };

  // Format currency for display
  const formatCurrency = (value: number | null | string) => {
    if (!value) return "";
    const num = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(num) ? "" : `$${num.toFixed(2)}`;
  };

  // Parse currency input
  const parseCurrency = (value: string) => {
    return value.replace(/[^0-9.]/g, "");
  };

  // Format date for input
  const formatDateForInput = (date: Date | null) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Parse date from input
  const parseDate = (dateStr: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).getTime();
  };

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Save changes
  const handleSave = async () => {
    if (editedRows.size === 0) {
      toast.info("No changes to save");
      return;
    }

    setIsSaving(true);
    try {
      const updates = Array.from(editedRows.entries()).map(([policyId, data]) => ({
        id: policyId,
        policyNumber: data.policyNumber || undefined,
        clientName: data.clientName || undefined,
        carrier: data.carrier || undefined,
        type: data.type || undefined,
        premiumAmount: data.premiumAmount ? parseFloat(parseCurrency(String(data.premiumAmount))) : null,
        yearlyAP: data.yearlyAP ? parseFloat(parseCurrency(String(data.yearlyAP))) : null,
        coverageAmount: data.coverageAmount ? parseFloat(parseCurrency(String(data.coverageAmount))) : null,
        effectiveDate: data.effectiveDate ? new Date(data.effectiveDate).getTime() : null,
        status: data.status || undefined,
        commissionRate: data.commissionRate ? parseFloat(String(data.commissionRate)) : null,
      }));

      await updateMutation.mutateAsync({ updates });
      setEditedRows(new Map());
      toast.success(`Updated ${updates.length} policy/policies`);
    } catch (error) {
      toast.error("Failed to save changes");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset changes
  const handleReset = () => {
    setEditedRows(new Map());
    toast.info("Changes discarded");
  };

  const hasChanges = editedRows.size > 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading policies...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Policy Editor</CardTitle>
        <CardDescription>
          Edit all policy details for {policies?.length || 0} policies in one place
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alert about bulk editing */}
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Click any cell to edit. Changes are highlighted in blue. Click "Save Changes" to persist all updates at once.
          </AlertDescription>
        </Alert>

        {/* Search bar */}
        <div>
          <Input
            placeholder="Search by policy #, client name, or carrier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <p className="mt-2 text-sm text-muted-foreground">
            Showing {filteredPolicies.length} of {policies?.length || 0} policies
          </p>
        </div>

        {/* Changes summary */}
        {hasChanges && (
          <Alert className="border-blue-200 bg-blue-50">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              {editedRows.size} policy/policies have unsaved changes
            </AlertDescription>
          </Alert>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes ({editedRows.size})
              </>
            )}
          </Button>
          {hasChanges && (
            <Button variant="outline" onClick={handleReset} disabled={isSaving}>
              Discard
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-xs">Policy #</th>
                <th className="px-3 py-2 text-left font-semibold text-xs">Client Name</th>
                <th className="px-3 py-2 text-left font-semibold text-xs">Carrier</th>
                <th className="px-3 py-2 text-left font-semibold text-xs">Type</th>
                <th className="px-3 py-2 text-left font-semibold text-xs">Effective Date</th>
                <th className="px-3 py-2 text-left font-semibold text-xs">Status</th>
                <th className="px-3 py-2 text-right font-semibold text-xs">Premium</th>
                <th className="px-3 py-2 text-right font-semibold text-xs">Annual AP</th>
                <th className="px-3 py-2 text-right font-semibold text-xs">Coverage</th>
                <th className="px-3 py-2 text-right font-semibold text-xs">Commission %</th>
              </tr>
            </thead>
            <tbody className="max-h-96 overflow-y-auto">
              {filteredPolicies.map((policy) => {
                const edited = editedRows.get(policy.id);
                const policyNumber = edited?.policyNumber ?? policy.policyNumber;
                const clientName = edited?.clientName ?? policy.clientName;
                const carrier = edited?.carrier ?? policy.carrier;
                const type = edited?.type ?? policy.type;
                const effectiveDate = edited?.effectiveDate ?? policy.effectiveDate;
                const status = edited?.status ?? policy.status;
                const premium = edited?.premiumAmount ?? policy.premiumAmount;
                const ap = edited?.yearlyAP ?? policy.yearlyAP;
                const coverage = edited?.coverageAmount ?? policy.coverageAmount;
                const commissionRate = edited?.commissionRate ?? policy.commissionRate;
                const isEdited = !!edited;

                return (
                  <tr
                    key={policy.id}
                    className={`border-b transition-colors ${
                      isEdited ? "bg-blue-50" : "hover:bg-muted/50"
                    }`}
                  >
                    {/* Policy # */}
                    <td className="px-3 py-2">
                      <Input
                        type="text"
                        value={policyNumber || ""}
                        onChange={(e) =>
                          handleFieldChange(policy.id, "policyNumber", e.target.value)
                        }
                        className="w-24 text-xs h-8 cursor-text border-[#c9a84c]/30 focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c]/50 bg-white/5 hover:bg-white/10 transition-colors"
                        placeholder="Edit..."
                      />
                    </td>

                    {/* Client Name */}
                    <td className="px-3 py-2">
                      <Input
                        type="text"
                        value={clientName || ""}
                        onChange={(e) =>
                          handleFieldChange(policy.id, "clientName", e.target.value)
                        }
                        className="w-32 text-xs h-8 cursor-text border-[#c9a84c]/30 focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c]/50 bg-white/5 hover:bg-white/10 transition-colors"
                        placeholder="Edit..."
                      />
                    </td>

                    {/* Carrier */}
                    <td className="px-3 py-2">
                      <Input
                        type="text"
                        value={carrier || ""}
                        onChange={(e) =>
                          handleFieldChange(policy.id, "carrier", e.target.value)
                        }
                        className="w-28 text-xs h-8 cursor-text border-[#c9a84c]/30 focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c]/50 bg-white/5 hover:bg-white/10 transition-colors"
                        placeholder="Edit..."
                      />
                    </td>

                    {/* Type */}
                    <td className="px-3 py-2">
                      <Input
                        type="text"
                        value={type || ""}
                        onChange={(e) =>
                          handleFieldChange(policy.id, "type", e.target.value)
                        }
                        className="w-24 text-xs h-8"
                      />
                    </td>

                    {/* Effective Date */}
                    <td className="px-3 py-2">
                      <Input
                        type="date"
                        value={formatDateForInput(effectiveDate)}
                        onChange={(e) =>
                          handleFieldChange(
                            policy.id,
                            "effectiveDate",
                            e.target.value ? new Date(e.target.value) : null
                          )
                        }
                        className="w-28 text-xs h-8"
                      />
                    </td>

                    {/* Status */}
                    <td className="px-3 py-2">
                      <select
                        value={status || ""}
                        onChange={(e) =>
                          handleFieldChange(policy.id, "status", e.target.value)
                        }
                        className="w-24 text-xs h-8 px-2 border rounded"
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="expired">Expired</option>
                      </select>
                    </td>

                    {/* Premium */}
                    <td className="px-3 py-2 text-right">
                      <Input
                        type="text"
                        placeholder="$0.00"
                        value={premium ? formatCurrency(premium) : ""}
                        onChange={(e) =>
                          handleFieldChange(policy.id, "premiumAmount", e.target.value)
                        }
                        className="w-24 text-right text-xs h-8"
                      />
                    </td>

                    {/* Annual AP */}
                    <td className="px-3 py-2 text-right">
                      <Input
                        type="text"
                        placeholder="$0.00"
                        value={ap ? formatCurrency(ap) : ""}
                        onChange={(e) =>
                          handleFieldChange(policy.id, "yearlyAP", e.target.value)
                        }
                        className="w-24 text-right text-xs h-8"
                      />
                    </td>

                    {/* Coverage Amount */}
                    <td className="px-3 py-2 text-right">
                      <Input
                        type="text"
                        placeholder="$0.00"
                        value={coverage ? formatCurrency(coverage) : ""}
                        onChange={(e) =>
                          handleFieldChange(policy.id, "coverageAmount", e.target.value)
                        }
                        className="w-24 text-right text-xs h-8"
                      />
                    </td>

                    {/* Commission Rate */}
                    <td className="px-3 py-2 text-right">
                      <Input
                        type="text"
                        placeholder="0.00%"
                        value={commissionRate ? `${commissionRate.toFixed(2)}%` : ""}
                        onChange={(e) => {
                          const val = e.target.value.replace("%", "");
                          handleFieldChange(
                            policy.id,
                            "commissionRate",
                            val ? parseFloat(val) : null
                          );
                        }}
                        className="w-20 text-right text-xs h-8 cursor-text border-[#c9a84c]/30 focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c]/50 bg-white/5 hover:bg-white/10 transition-colors"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredPolicies.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No policies found matching your search
          </div>
        )}
      </CardContent>
    </Card>
  );
}
