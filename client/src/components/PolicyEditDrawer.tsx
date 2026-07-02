import React, { useState, useMemo } from "react";
import { X, Save, RotateCcw, Palette, Search, Link } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Client {
  id: number;
  firstName: string;
  lastName: string;
}

interface PolicyEditDrawerProps {
  isOpen: boolean;
  policy: any;
  editFormData: any;
  setEditFormData: (data: any) => void;
  onSave: () => void;
  onCancel: () => void;
  calculateYearlyAP: (premium: string, frequency: string) => string;
  isSaving?: boolean;
  clientsList?: Client[];
}

export function PolicyEditDrawer({
  isOpen,
  policy,
  editFormData,
  setEditFormData,
  onSave,
  onCancel,
  calculateYearlyAP,
  isSaving = false,
  clientsList = [],
}: PolicyEditDrawerProps) {
  const [clientSearch, setClientSearch] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clientsList.slice(0, 20);
    const q = clientSearch.toLowerCase();
    return clientsList
      .filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(q))
      .slice(0, 20);
  }, [clientsList, clientSearch]);

  if (!isOpen || !policy) return null;

  const selectedClientName = editFormData.clientId
    ? (() => {
        const c = clientsList.find(cl => cl.id === editFormData.clientId);
        return c ? `${c.firstName} ${c.lastName}` : editFormData.clientName || "Unknown";
      })()
    : editFormData.clientName || "Not linked";

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity z-40 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onCancel}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-[#0a1628] border-l border-white/10 shadow-2xl transition-transform z-50 overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="sticky top-0 bg-[#0a1628] border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Edit Policy</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Link to Client */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Link size={14} className="text-[#c9a84c]" />
              Link to Client
            </label>
            <div className="relative">
              <div
                className="w-full bg-white/10 border border-[#c9a84c]/50 rounded px-3 py-2 text-white text-sm cursor-pointer flex items-center justify-between focus:outline-none focus:border-[#c9a84c]"
                onClick={() => {
                  setShowClientDropdown(!showClientDropdown);
                  setClientSearch("");
                }}
              >
                <span className={editFormData.clientId ? "text-white" : "text-gray-400"}>
                  {selectedClientName}
                </span>
                <Search size={14} className="text-gray-400 flex-shrink-0" />
              </div>

              {showClientDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#0f2040] border border-[#c9a84c]/30 rounded shadow-xl z-10 max-h-64 overflow-hidden flex flex-col">
                  <div className="p-2 border-b border-white/10">
                    <input
                      autoFocus
                      type="text"
                      value={clientSearch}
                      onChange={e => setClientSearch(e.target.value)}
                      placeholder="Search clients..."
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#c9a84c]"
                    />
                  </div>
                  <div className="overflow-y-auto">
                    {filteredClients.length === 0 ? (
                      <div className="px-3 py-3 text-gray-500 text-sm text-center">No clients found</div>
                    ) : (
                      filteredClients.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition ${
                            editFormData.clientId === c.id ? "text-[#c9a84c] bg-white/5" : "text-white"
                          }`}
                          onClick={() => {
                            setEditFormData({
                              ...editFormData,
                              clientId: c.id,
                              clientName: `${c.firstName} ${c.lastName}`,
                            });
                            setShowClientDropdown(false);
                            setClientSearch("");
                          }}
                        >
                          {c.firstName} {c.lastName}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            {editFormData.clientId && (
              <p className="text-xs text-[#c9a84c] mt-1">
                ✓ Linked to client ID #{editFormData.clientId} — policy will appear in their portal
              </p>
            )}
          </div>

          {/* Carrier */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Carrier
            </label>
            <select
              value={editFormData.carrier}
              onChange={(e) => setEditFormData({ ...editFormData, carrier: e.target.value })}
              className="w-full bg-white/10 border border-[#c9a84c]/50 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]"
            >
              <option value="" className="bg-[#0a1628]">Select Carrier</option>
              <option value="Aetna" className="bg-[#0a1628]">Aetna</option>
              <option value="Elco" className="bg-[#0a1628]">Elco</option>
              <option value="American Equity" className="bg-[#0a1628]">American Equity</option>
              <option value="Athene" className="bg-[#0a1628]">Athene</option>
              <option value="AIG" className="bg-[#0a1628]">AIG</option>
              <option value="Foresters" className="bg-[#0a1628]">Foresters</option>
              <option value="Gerber" className="bg-[#0a1628]">Gerber</option>
              <option value="Instabrain" className="bg-[#0a1628]">Instabrain</option>
              <option value="MOO" className="bg-[#0a1628]">MOO</option>
              <option value="Nationwide" className="bg-[#0a1628]">Nationwide</option>
              <option value="North American" className="bg-[#0a1628]">North American</option>
              <option value="United Home Life" className="bg-[#0a1628]">United Home Life</option>
              <option value="Lafayette Life" className="bg-[#0a1628]">Lafayette Life</option>
              <option value="CICA" className="bg-[#0a1628]">CICA</option>
              <option value="Transamerica" className="bg-[#0a1628]">Transamerica</option>
              <option value="Catholic" className="bg-[#0a1628]">Catholic</option>
              <option value="Americo" className="bg-[#0a1628]">Americo</option>
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Policy Type
            </label>
            <select
              value={editFormData.type}
              onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
              className="w-full bg-white/10 border border-[#c9a84c]/50 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]"
            >
              <option value="" className="bg-[#0a1628]">-- Select Type --</option>
              <option value="WL" className="bg-[#0a1628]">Whole Life (WL)</option>
              <option value="GWL" className="bg-[#0a1628]">Graded Whole Life (GWL)</option>
              <option value="Term" className="bg-[#0a1628]">Term Life</option>
              <option value="Final Expense" className="bg-[#0a1628]">Final Expense</option>
              <option value="Accidental" className="bg-[#0a1628]">Accidental Death</option>
              <option value="IUL" className="bg-[#0a1628]">Indexed Universal Life (IUL)</option>
              <option value="UL" className="bg-[#0a1628]">Universal Life (UL)</option>
              <option value="fixed_annuity" className="bg-[#0a1628]">Fixed Annuity</option>
              <option value="indexed_annuity" className="bg-[#0a1628]">Indexed Annuity (FIA)</option>
              <option value="variable_annuity" className="bg-[#0a1628]">Variable Annuity</option>
              <option value="immediate_annuity" className="bg-[#0a1628]">Immediate Annuity (MYGA)</option>
              <option value="other" className="bg-[#0a1628]">Other</option>
            </select>
          </div>

          {/* Policy Number */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Policy Number
            </label>
            <input
              type="text"
              value={editFormData.policyNumber}
              onChange={(e) =>
                setEditFormData({ ...editFormData, policyNumber: e.target.value })
              }
              className="w-full bg-white/10 border border-[#c9a84c]/50 rounded px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[#c9a84c]"
              placeholder="e.g., IMP-May-24b"
            />
          </div>

          {/* Premium Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Monthly Premium
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                value={editFormData.premiumAmount}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, premiumAmount: e.target.value })
                }
                className="w-full bg-white/10 border border-[#c9a84c]/50 rounded px-3 py-2 pl-7 text-white text-sm focus:outline-none focus:border-[#c9a84c]"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Premium Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Payment Frequency
            </label>
            <select
              value={editFormData.premiumFrequency}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  premiumFrequency: e.target.value as any,
                })
              }
              className="w-full bg-white/10 border border-[#c9a84c]/50 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]"
            >
              <option value="monthly" className="bg-[#0a1628]">Monthly</option>
              <option value="quarterly" className="bg-[#0a1628]">Quarterly</option>
              <option value="semi-annual" className="bg-[#0a1628]">Semi-Annual</option>
              <option value="annual" className="bg-[#0a1628]">Annual</option>
            </select>
          </div>

          {/* Yearly AP (auto-calculated) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Yearly AP
            </label>
            <div className="bg-white/5 border border-white/10 rounded px-3 py-2 text-[#c9a84c] font-semibold text-sm">
              ${parseFloat(
                calculateYearlyAP(
                  editFormData.premiumAmount,
                  editFormData.premiumFrequency
                )
              ).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              <span className="text-xs text-gray-500 ml-2">(auto-calculated)</span>
            </div>
          </div>

          {/* Coverage Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Coverage Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                step="1"
                value={editFormData.coverageAmount}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, coverageAmount: e.target.value })
                }
                className="w-full bg-white/10 border border-[#c9a84c]/50 rounded px-3 py-2 pl-7 text-white text-sm focus:outline-none focus:border-[#c9a84c]"
                placeholder="0"
              />
            </div>
          </div>

          {/* Agent Assignment */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Assigned Agent
            </label>
            <input
              type="text"
              value={editFormData.agent || ""}
              onChange={(e) =>
                setEditFormData({ ...editFormData, agent: e.target.value })
              }
              className="w-full bg-white/10 border border-[#c9a84c]/50 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]"
              placeholder="e.g., ROACH, MAURI or NATHAN FAUGHN"
            />
          </div>

          {/* Color Assignment */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Palette size={16} />
              Policy Color
            </label>
            <select
              value={editFormData.tagColor || ""}
              onChange={(e) =>
                setEditFormData({ ...editFormData, tagColor: e.target.value })
              }
              className="w-full bg-white/10 border border-[#c9a84c]/50 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]"
            >
              <option value="" className="bg-[#0a1628]">Select a color...</option>
              <option value="#FF1493" className="bg-[#0a1628]">Hot Pink (Mauri)</option>
              <option value="#FF8C00" className="bg-[#0a1628]">Orange (Nathan)</option>
              <option value="#4169E1" className="bg-[#0a1628]">Royal Blue</option>
              <option value="#32CD32" className="bg-[#0a1628]">Lime Green</option>
              <option value="#FFD700" className="bg-[#0a1628]">Gold</option>
              <option value="#FF6347" className="bg-[#0a1628]">Tomato Red</option>
              <option value="#9370DB" className="bg-[#0a1628]">Medium Purple</option>
              <option value="#20B2AA" className="bg-[#0a1628]">Light Sea Green</option>
            </select>
            <div className="mt-2 flex items-center gap-2">
              <div
                className="w-8 h-8 rounded border border-white/20"
                style={{ backgroundColor: editFormData.tagColor || "transparent" }}
              />
              <span className="text-xs text-gray-400">{editFormData.tagColor || "No color selected"}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="flex-1 bg-[#c9a84c] hover:bg-[#d4b857] text-black font-semibold py-2 rounded transition-colors"
            >
              <Save size={16} className="mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              onClick={onCancel}
              disabled={isSaving}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded transition-colors"
            >
              <RotateCcw size={16} className="mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
