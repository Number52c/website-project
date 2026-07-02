"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CircleAlert as AlertCircle, CircleCheck as CheckCircle2, Loader as Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface PolicyRow {
  id: number;
  policyNumber: string;
  clientName: string;
  carrier: string;
  type: string;
  premiumAmount: number | null;
  yearlyAP: number | null;
  coverageAmount: number | null;
  effectiveDate: Date | null;
  terminationDate: Date | null;
  status: string;
  edited: boolean;
}

export function BulkPremiumEditor() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editedRows, setEditedRows] = useState<Map<number, Partial<PolicyRow>>>(new Map());
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
    field: "premiumAmount" | "yearlyAP" | "coverageAmount",
    value: string
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
      row[field] = value as any;
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

  // Format date
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
        premiumAmount: data.premiumAmount ? parseFloat(parseCurrency(String(data.premiumAmount))) : null,
        yearlyAP: data.yearlyAP ? parseFloat(parseCurrency(String(data.yearlyAP))) : null,
        coverageAmount: data.coverageAmount ? parseFloat(parseCurrency(String(data.coverageAmount))) : null,
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
        <CardTitle>Bulk Premium Editor</CardTitle>
        <CardDescription>
          Edit premium amounts, annual premium (AP), and coverage amounts for all {policies?.length || 0} policies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alert about missing data */}
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            All policies currently show $0.00 premium. Please enter the correct values below to fix revenue reporting.
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
                <th className="px-4 py-2 text-left font-semibold">Policy #</th>
                <th className="px-4 py-2 text-left font-semibold">Client Name</th>
                <th className="px-4 py-2 text-left font-semibold">Carrier</th>
                <th className="px-4 py-2 text-left font-semibold">Type</th>
                <th className="px-4 py-2 text-left font-semibold">Effective Date</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
                <th className="px-4 py-2 text-right font-semibold">Premium</th>
                <th className="px-4 py-2 text-right font-semibold">Annual AP</th>
                <th className="px-4 py-2 text-right font-semibold">Coverage Amount</th>
              </tr>
            </thead>
            <tbody className="max-h-96 overflow-y-auto">
              {filteredPolicies.map((policy) => {
                const edited = editedRows.get(policy.id);
                const premium = edited?.premiumAmount ?? policy.premiumAmount;
                const ap = edited?.yearlyAP ?? policy.yearlyAP;
                const coverage = edited?.coverageAmount ?? policy.coverageAmount;
                const isEdited = !!edited;

                return (
                  <tr
                    key={policy.id}
                    className={`border-b transition-colors ${
                      isEdited ? "bg-blue-50" : "hover:bg-muted/50"
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-semibold">{policy.policyNumber}</td>
                    <td className="px-4 py-3 text-sm font-medium">{policy.clientName || "—"}</td>
                    <td className="px-4 py-3 text-sm">{policy.carrier}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{policy.type}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDate(policy.effectiveDate)}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span
                        className={`inline-block px-2 py-1 rounded font-semibold ${getStatusColor(
                          policy.status
                        )}`}
                      >
                        {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Input
                        type="text"
                        placeholder="$0.00"
                        value={premium ? formatCurrency(premium) : ""}
                        onChange={(e) =>
                          handleFieldChange(policy.id, "premiumAmount", e.target.value)
                        }
                        className="w-28 text-right text-xs"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Input
                        type="text"
                        placeholder="$0.00"
                        value={ap ? formatCurrency(ap) : ""}
                        onChange={(e) =>
                          handleFieldChange(policy.id, "yearlyAP", e.target.value)
                        }
                        className="w-28 text-right text-xs"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Input
                        type="text"
                        placeholder="$0.00"
                        value={coverage ? formatCurrency(coverage) : ""}
                        onChange={(e) =>
                          handleFieldChange(policy.id, "coverageAmount", e.target.value)
                        }
                        className="w-28 text-right text-xs"
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
