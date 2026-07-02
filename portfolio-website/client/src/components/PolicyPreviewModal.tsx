import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface PolicyPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  policy: {
    policyNumber: string;
    type: string;
    carrier: string;
    coverageAmount: number;
    premiumAmount: number;
    premiumFrequency: string;
    status: string;
    effectiveDate: number;
    description?: string;
  };
}

export function PolicyPreviewModal({
  open,
  onOpenChange,
  clientName,
  policy,
}: PolicyPreviewModalProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">
            Client Portal Preview - {clientName}
          </DialogTitle>
        </DialogHeader>

        {/* Portal View Container */}
        <div className="bg-slate-800 rounded-lg p-8 text-white space-y-8">
          {/* Header */}
          <div className="border-b border-slate-700 pb-6">
            <h1 className="text-3xl font-bold text-amber-400 mb-2">
              Your Policy Details
            </h1>
            <p className="text-slate-300">
              This is what you see when you log into your client portal
            </p>
          </div>

          {/* Policy Summary Card */}
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-sm uppercase tracking-wide">
                  Policy Number
                </p>
                <p className="text-2xl font-mono font-bold text-amber-400">
                  {policy.policyNumber}
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-sm uppercase tracking-wide">
                  Status
                </p>
                <p
                  className={`text-lg font-semibold ${
                    policy.status === "active"
                      ? "text-green-400"
                      : "text-yellow-400"
                  }`}
                >
                  {policy.status.charAt(0).toUpperCase() +
                    policy.status.slice(1)}
                </p>
              </div>
            </div>
          </div>

          {/* Policy Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-slate-400 text-sm uppercase tracking-wide mb-1">
                  Policy Type
                </p>
                <p className="text-lg font-semibold text-white">
                  {policy.type}
                </p>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-slate-400 text-sm uppercase tracking-wide mb-1">
                  Carrier
                </p>
                <p className="text-lg font-semibold text-white">
                  {policy.carrier}
                </p>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-slate-400 text-sm uppercase tracking-wide mb-1">
                  Effective Date
                </p>
                <p className="text-lg font-semibold text-white">
                  {formatDate(policy.effectiveDate)}
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <p className="text-amber-400 text-sm uppercase tracking-wide mb-1">
                  Coverage Amount
                </p>
                <p className="text-2xl font-bold text-amber-400">
                  {formatCurrency(policy.coverageAmount)}
                </p>
              </div>

              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-400 text-sm uppercase tracking-wide mb-1">
                  Premium Amount
                </p>
                <p className="text-lg font-semibold text-green-400">
                  {formatCurrency(policy.premiumAmount)}{" "}
                  <span className="text-sm text-green-300">
                    per {policy.premiumFrequency}
                  </span>
                </p>
              </div>

              {policy.description && (
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <p className="text-slate-400 text-sm uppercase tracking-wide mb-1">
                    Description
                  </p>
                  <p className="text-white">{policy.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Section */}
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
            <p className="text-slate-300 mb-4">
              For any questions about your policy or to make changes, please
              contact us:
            </p>
            <div className="space-y-2 text-sm text-slate-300">
              <p>
                <span className="font-semibold">Phone:</span> (361) 613-8336
              </p>
              <p>
                <span className="font-semibold">Email:</span>{" "}
                eortiz@ortizinsurancebroker.com
              </p>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center text-xs text-slate-500 border-t border-slate-700 pt-6">
            <p>
              This is a preview of how your policy information appears in your
              client portal
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end gap-3 mt-6">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-slate-700 hover:bg-slate-600 text-white"
          >
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
