import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreditCard as Edit2, Trash2, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminCarrierResources() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", portalUrl: "", website: "" });

  const { data: carriers, isLoading, refetch } = trpc.admin.carriers.list.useQuery();
  const addCarrierMutation = trpc.admin.carriers.add.useMutation();
  const updateCarrierMutation = trpc.admin.carriers.update.useMutation();
  const deleteCarrierMutation = trpc.admin.carriers.delete.useMutation();

  const handleAddCarrier = async () => {
    if (!formData.name.trim()) {
      toast.error("Carrier name is required");
      return;
    }

    try {
      await addCarrierMutation.mutateAsync({
        name: formData.name,
        portalUrl: formData.portalUrl || undefined,
        website: formData.website || undefined,
      });
      toast.success("Carrier added successfully");
      setFormData({ name: "", portalUrl: "", website: "" });
      setIsAddOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to add carrier");
    }
  };

  const handleUpdateCarrier = async () => {
    if (!editingCarrier) return;
    if (!formData.name.trim()) {
      toast.error("Carrier name is required");
      return;
    }

    try {
      await updateCarrierMutation.mutateAsync({
        id: editingCarrier.id,
        name: formData.name,
        portalUrl: formData.portalUrl || undefined,
        website: formData.website || undefined,
      });
      toast.success("Carrier updated successfully");
      setFormData({ name: "", portalUrl: "", website: "" });
      setIsEditOpen(false);
      setEditingCarrier(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to update carrier");
    }
  };

  const handleDeleteCarrier = async (id: number) => {
    if (!confirm("Are you sure you want to delete this carrier?")) return;

    try {
      await deleteCarrierMutation.mutateAsync({ id });
      toast.success("Carrier deleted successfully");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete carrier");
    }
  };

  const openEditDialog = (carrier: any) => {
    setEditingCarrier(carrier);
    setFormData({
      name: carrier.name,
      portalUrl: carrier.portalUrl || "",
      website: carrier.website || "",
    });
    setIsEditOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Loading carriers...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Carrier Management</h2>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Carrier
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Carrier</DialogTitle>
                <DialogDescription>Enter the carrier information below</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Carrier Name *</label>
                  <Input
                    placeholder="e.g., American General Life Insurance"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Portal URL</label>
                  <Input
                    placeholder="https://example.com/portal"
                    value={formData.portalUrl}
                    onChange={(e) => setFormData({ ...formData, portalUrl: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Website</label>
                  <Input
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleAddCarrier} className="w-full" disabled={addCarrierMutation.isPending}>
                  {addCarrierMutation.isPending ? "Adding..." : "Add Carrier"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-card border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Carrier Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Portal URL</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Website</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {carriers && carriers.length > 0 ? (
                  carriers.map((carrier) => (
                    <tr key={carrier.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-foreground">{carrier.name}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {carrier.portalUrl ? (
                          <a
                            href={carrier.portalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline truncate"
                          >
                            {carrier.portalUrl}
                          </a>
                        ) : (
                          <span className="text-muted-foreground/60">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {carrier.website ? (
                          <a
                            href={carrier.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline truncate"
                          >
                            {carrier.website}
                          </a>
                        ) : (
                          <span className="text-muted-foreground/60">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(carrier)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCarrier(carrier.id)}
                            className="text-muted-foreground hover:text-destructive"
                            disabled={deleteCarrierMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      No carriers found. Add one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Carrier</DialogTitle>
            <DialogDescription>Update the carrier information below</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Carrier Name *</label>
              <Input
                placeholder="e.g., American General Life Insurance"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Portal URL</label>
              <Input
                placeholder="https://example.com/portal"
                value={formData.portalUrl}
                onChange={(e) => setFormData({ ...formData, portalUrl: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Website</label>
              <Input
                placeholder="https://example.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="mt-1"
              />
            </div>
            <Button onClick={handleUpdateCarrier} className="w-full" disabled={updateCarrierMutation.isPending}>
              {updateCarrierMutation.isPending ? "Updating..." : "Update Carrier"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
