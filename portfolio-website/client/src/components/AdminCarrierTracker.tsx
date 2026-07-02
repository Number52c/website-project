import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Trash2, CreditCard as Edit2, Plus, Eye, EyeOff, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Credential {
  id: number;
  carrier: string;
  writingNumber: string | null;
  username: string;
  password: string;
}

export function AdminCarrierTracker() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [showPasswords, setShowPasswords] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState({
    carrier: "",
    writingNumber: "",
    username: "",
    password: "",
  });

  const { data: credentials = [], refetch } = trpc.admin.credentials.list.useQuery();
  const addMutation = trpc.admin.credentials.add.useMutation();
  const updateMutation = trpc.admin.credentials.update.useMutation();
  const deleteMutation = trpc.admin.credentials.delete.useMutation();

  const handleSubmit = async () => {
    if (!formData.carrier || !formData.username || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          ...formData,
        });
        toast.success("Credential updated");
      } else {
        await addMutation.mutateAsync(formData);
        toast.success("Credential added");
      }
      setFormData({ carrier: "", writingNumber: "", username: "", password: "" });
      setEditingId(null);
      setIsOpen(false);
      refetch();
    } catch (error) {
      toast.error("Failed to save credential");
    }
  };

  const handleEdit = (cred: Credential) => {
    setFormData({
      carrier: cred.carrier,
      writingNumber: cred.writingNumber || "",
      username: cred.username,
      password: cred.password,
    });
    setEditingId(cred.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Credential deleted");
      refetch();
    } catch (error) {
      toast.error("Failed to delete credential");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({ carrier: "", writingNumber: "", username: "", password: "" });
      setEditingId(null);
    }
    setIsOpen(open);
  };

  const togglePasswordVisibility = (id: number) => {
    const newSet = new Set(showPasswords);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setShowPasswords(newSet);
  };

  const filteredCredentials = credentials.filter(cred =>
    cred.carrier.toLowerCase().includes(search.toLowerCase()) ||
    cred.username.toLowerCase().includes(search.toLowerCase()) ||
    (cred.writingNumber && cred.writingNumber.includes(search))
  );

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">My Carrier Portal Tracker</h2>
          <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-[#c9a84c] hover:bg-[#d4b456] text-black font-semibold">
                <Plus className="w-4 h-4" />
                Add Carrier
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">{editingId ? "Edit Carrier Credentials" : "Add New Carrier"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-200">Carrier Name *</Label>
                  <Input
                    value={formData.carrier}
                    onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                    placeholder="e.g., Transamerica"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-200">Writing Number</Label>
                  <Input
                    value={formData.writingNumber}
                    onChange={(e) => setFormData({ ...formData, writingNumber: e.target.value })}
                    placeholder="Your writing number"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-200">Username *</Label>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Portal username"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-200">Password *</Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Portal password"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <Button onClick={handleSubmit} disabled={addMutation.isPending || updateMutation.isPending} className="w-full bg-[#c9a84c] hover:bg-[#d4b456] text-black font-semibold">
                  {editingId ? "Update" : "Add"} Carrier
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search carriers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#c9a84c]/50"
          />
        </div>
      </div>

      {/* Table */}
      {filteredCredentials.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No carrier credentials found</p>
        </div>
      ) : (
        <div className="bg-gradient-to-b from-[#0d1528]/50 to-[#0a0f1e]/50 border border-[#c9a84c]/20 rounded-xl overflow-hidden shadow-lg shadow-[#c9a84c]/10">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#c9a84c]/20 bg-gradient-to-r from-[#c9a84c]/10 to-transparent">
                  <th className="text-left text-[#c9a84c] text-xs uppercase px-4 py-3 font-semibold tracking-wider">Carrier</th>
                  <th className="text-left text-[#c9a84c] text-xs uppercase px-4 py-3 font-semibold tracking-wider">Writing #</th>
                  <th className="text-left text-[#c9a84c] text-xs uppercase px-4 py-3 font-semibold tracking-wider">Username</th>
                  <th className="text-left text-[#c9a84c] text-xs uppercase px-4 py-3 font-semibold tracking-wider">Password</th>
                  <th className="text-right text-[#c9a84c] text-xs uppercase px-4 py-3 font-semibold tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCredentials.map((cred) => (
                  <tr key={cred.id} className="border-b border-[#c9a84c]/10 hover:bg-gradient-to-r hover:from-[#c9a84c]/10 hover:to-transparent transition-all duration-300 group">
                    <td className="px-4 py-3 text-white font-semibold group-hover:text-[#e6c200] transition-colors">{cred.carrier}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-sm group-hover:text-[#c9a84c] transition-colors">{cred.writingNumber || "—"}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-sm group-hover:text-[#c9a84c] transition-colors">{cred.username}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300 font-mono text-sm">
                          {showPasswords.has(cred.id) ? cred.password : "•".repeat(Math.min(cred.password.length, 12))}
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(cred.id)}
                          className="text-gray-400 hover:text-[#c9a84c] transition-colors"
                          title={showPasswords.has(cred.id) ? "Hide password" : "Show password"}
                        >
                          {showPasswords.has(cred.id) ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(cred)}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-[#c9a84c]"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(cred.id)}
                          disabled={deleteMutation.isPending}
                          className="bg-red-900/50 hover:bg-red-900 text-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
