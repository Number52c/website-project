import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Calendar, CircleAlert as AlertCircle, Clock, Loader as Loader2 } from "lucide-react";

interface AnnualReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AnnualReviewModal({ isOpen, onClose }: AnnualReviewModalProps) {
  const { data: stats, isLoading } =
    trpc.admin.getClientsAnnualReviewStats.useQuery(undefined, {
      enabled: isOpen,
    });

  const totalDue = stats?.total || 0;
  const dueThisMonth = stats?.dueThisMonth || 0;
  const dueIn2Months = stats?.dueIn2Months || 0;
  const dueIn3Months = stats?.dueIn3Months || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-[#0f1420] to-[#0a0e18] border border-[#c9a84c]/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-['Playfair_Display'] text-white">
            Clients Due for Annual Review
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Track upcoming annual review appointments
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-[#c9a84c]" size={32} />
          </div>
        ) : totalDue === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto mb-4 text-[#c9a84c]/50" size={48} />
            <p className="text-gray-400">No clients due for annual review</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="bg-white/5 border border-[#c9a84c]/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-1">Total Due</p>
                    <p className="text-3xl font-bold text-[#c9a84c]">
                      {totalDue}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-red-500/10 border border-red-500/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-red-400 mb-1">This Month</p>
                    <p className="text-3xl font-bold text-red-400">
                      {dueThisMonth}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-amber-500/10 border border-amber-500/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-amber-400 mb-1">In 2 Months</p>
                    <p className="text-3xl font-bold text-amber-400">
                      {dueIn2Months}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-amber-500/10 border border-amber-500/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-amber-400 mb-1">In 3 Months</p>
                    <p className="text-3xl font-bold text-amber-400">
                      {dueIn3Months}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Info */}
            <Card className="bg-blue-500/10 border border-blue-500/20">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-blue-400">
                    <AlertCircle size={18} />
                    <span className="text-sm">
                      <strong>{dueThisMonth} clients</strong> need annual
                      reviews this month
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-400">
                    <Clock size={18} />
                    <span className="text-sm">
                      <strong>{dueIn2Months + dueIn3Months} clients</strong> will
                      need reviews in the next 3 months
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
