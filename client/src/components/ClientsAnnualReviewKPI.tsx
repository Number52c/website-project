import { trpc } from "@/lib/trpc";
import { Calendar, CircleAlert as AlertCircle, Clock, X, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ClientsAnnualReviewKPI() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const { data: reviewStats, isLoading } = trpc.admin.getClientsAnnualReviewStats.useQuery();
  const { data: clientsList } = trpc.admin.listClients.useQuery();
  const { data: policiesList } = trpc.admin.listPolicies.useQuery();
  const { data: annuitiesList } = trpc.admin.listAnnuities.useQuery();

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-[#1a2a4a] to-[#0d1a2e] border border-[#c9a84c]/30 rounded-lg p-6 min-h-[200px] flex items-center justify-center">
        <div className="text-gray-400">Loading review stats...</div>
      </div>
    );
  }

  if (!reviewStats) {
    return null;
  }

  const { dueThisMonth, dueIn2Months, dueIn3Months, total } = reviewStats;

  // Get clients due for review
  const clientsDueForReview = clientsList?.filter(client => {
    if (!client.lastReviewDate) return true;
    const lastReviewTime = client.lastReviewDate * 1000;
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;
    const nextReviewDue = lastReviewTime + oneYearMs;
    return nextReviewDue <= Date.now();
  }) || [];

  // Get selected client's policies and annuities
  const selectedClient = clientsList?.find(c => c.id === selectedClientId);
  const selectedClientPolicies = policiesList?.filter(p => p.clientId === selectedClientId) || [];
  const selectedClientAnnuities = annuitiesList?.filter(a => a.clientId === selectedClientId) || [];

  return (
    <>
      <div 
        className="bg-gradient-to-br from-[#1a2a4a] to-[#0d1a2e] border border-[#c9a84c]/30 rounded-lg p-6 cursor-pointer hover:border-[#c9a84c]/60 transition-all hover:shadow-lg hover:shadow-[#c9a84c]/20"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-gray-400 text-sm font-medium mb-2">ANNUAL REVIEW DUE</div>
            <div className="text-4xl font-bold text-[#c9a84c]">{total}</div>
            <div className="text-gray-500 text-sm mt-2">Click to view clients</div>
          </div>
          <Calendar className="w-12 h-12 text-[#c9a84c]/40" />
        </div>
      </div>

      {/* Modal - List of Clients Due for Review */}
      <Dialog open={isOpen && !selectedClientId} onOpenChange={(open) => {
        if (!open) {
          setIsOpen(false);
          setSelectedClientId(null);
        }
      }}>
        <DialogContent className="max-w-2xl bg-[#0f2040] border border-[#c9a84c]/30">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">Clients Due for Annual Review</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {clientsDueForReview.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No clients due for annual review
              </div>
            ) : (
              clientsDueForReview.map((client) => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className="w-full text-left p-4 bg-gradient-to-r from-[#1a2a4a] to-[#0d1a2e] border border-[#c9a84c]/20 rounded-lg hover:border-[#c9a84c]/60 hover:bg-gradient-to-r hover:from-[#1a2a4a]/80 hover:to-[#0d1a2e]/80 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold">
                        {client.firstName} {client.lastName}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {client.email} • {client.phone}
                      </div>
                      {client.lastReviewDate && (
                        <div className="text-gray-500 text-xs mt-1">
                          Last review: {new Date(client.lastReviewDate * 1000).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#c9a84c] group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal - Client Policies & Annuities */}
      <Dialog open={selectedClientId !== null} onOpenChange={(open) => {
        if (!open) setSelectedClientId(null);
      }}>
        <DialogContent className="max-w-4xl bg-[#0f2040] border border-[#c9a84c]/30 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">
              {selectedClient?.firstName} {selectedClient?.lastName} - Policies & Annuities
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Client Info */}
            <div className="bg-gradient-to-r from-[#1a2a4a] to-[#0d1a2e] border border-[#c9a84c]/20 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Email:</span>
                  <div className="text-white font-medium">{selectedClient?.email}</div>
                </div>
                <div>
                  <span className="text-gray-400">Phone:</span>
                  <div className="text-white font-medium">{selectedClient?.phone}</div>
                </div>
                {selectedClient?.lastReviewDate && (
                  <div>
                    <span className="text-gray-400">Last Review:</span>
                    <div className="text-white font-medium">
                      {new Date(selectedClient.lastReviewDate * 1000).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Life Insurance Policies */}
            {selectedClientPolicies.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <span className="text-[#c9a84c]">🛡️</span> Life Insurance Policies ({selectedClientPolicies.length})
                </h3>
                <div className="space-y-3">
                  {selectedClientPolicies.map((policy) => (
                    <div
                      key={policy.id}
                      className="bg-gradient-to-r from-[#1a2a4a] to-[#0d1a2e] border border-[#c9a84c]/20 rounded-lg p-4"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Type:</span>
                          <div className="text-white font-medium">{policy.type}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Carrier:</span>
                          <div className="text-white font-medium">{policy.carrier}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Status:</span>
                          <div className="text-white font-medium capitalize">{policy.status}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Premium:</span>
                          <div className="text-white font-medium">${policy.premiumAmount}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Coverage:</span>
                          <div className="text-white font-medium">${policy.coverageAmount}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Policy #:</span>
                          <div className="text-white font-medium text-xs">{policy.policyNumber}</div>
                        </div>
                        {policy.paymentMethod && (
                          <div>
                            <span className="text-gray-400">Payment:</span>
                            <div className="text-white font-medium">{policy.paymentMethod}</div>
                          </div>
                        )}
                        {policy.beneficiaries && (
                          <div>
                            <span className="text-gray-400">Beneficiary:</span>
                            <div className="text-white font-medium text-xs">{policy.beneficiaries}</div>
                          </div>
                        )}
                        {policy.draftDate && (
                          <div>
                            <span className="text-gray-400">Draft Date:</span>
                            <div className="text-white font-medium">{String(policy.draftDate)}</div>
                          </div>
                        )}
                      </div>
                      {policy.riders && (
                        <div className="mt-3 pt-3 border-t border-[#c9a84c]/10">
                          <div className="text-gray-400 text-xs">Riders: {policy.riders}</div>
                        </div>
                      )}
                      {policy.notes && (
                        <div className="mt-2 text-gray-400 text-xs italic">Notes: {policy.notes}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Annuities */}
            {selectedClientAnnuities.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <span className="text-emerald-400">📈</span> Annuities ({selectedClientAnnuities.length})
                </h3>
                <div className="space-y-3">
                  {selectedClientAnnuities.map((annuity) => (
                    <div
                      key={annuity.id}
                      className="bg-gradient-to-r from-emerald-900/20 to-emerald-950/20 border border-emerald-500/20 rounded-lg p-4"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Type:</span>
                          <div className="text-white font-medium">{annuity.type}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Carrier:</span>
                          <div className="text-white font-medium">{annuity.carrier}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Status:</span>
                          <div className="text-white font-medium capitalize">{annuity.status}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Premium:</span>
                          <div className="text-white font-medium">${annuity.premium}</div>
                        </div>
                        {annuity.termYears && (
                          <div>
                            <span className="text-gray-400">Term:</span>
                            <div className="text-white font-medium">{annuity.termYears} years</div>
                          </div>
                        )}
                        {annuity.beneficiary && (
                          <div>
                            <span className="text-gray-400">Beneficiary:</span>
                            <div className="text-white font-medium text-xs">{annuity.beneficiary}</div>
                          </div>
                        )}
                        {annuity.rolledOverFrom && (
                          <div>
                            <span className="text-gray-400">Rolled Over From:</span>
                            <div className="text-white font-medium">{annuity.rolledOverFrom}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedClientPolicies.length === 0 && selectedClientAnnuities.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No policies or annuities found for this client
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
