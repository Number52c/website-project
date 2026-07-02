import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleAlert as AlertCircle, Calendar, Phone, Mail } from "lucide-react";
import { useState } from "react";

export function AnnualReviewsTab() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  const { data: reviewReminders, isLoading } = trpc.admin.getAnnualReviewReminders.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading annual review reminders...</div>
      </div>
    );
  }

  const reminders = reviewReminders || [];

  if (reminders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Calendar className="w-12 h-12 text-slate-500 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Annual Reviews Due</h3>
        <p className="text-slate-400">All clients are up to date with their annual reviews</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-white">{reminders.length} Clients Due for Annual Review</h3>
          <p className="text-sm text-slate-300">Within the next 90 days</p>
        </div>
      </div>

      <div className="grid gap-4">
        {reminders.map((reminder, idx) => (
          <Card 
            key={idx}
            className="bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover:border-amber-500/70 transition-all duration-300 cursor-pointer"
            onClick={() => setExpandedId(expandedId === idx ? null : idx)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white text-lg">{reminder.client.firstName} {reminder.client.lastName}</CardTitle>
                  <p className="text-sm text-slate-400 mt-1">
                    Last Review: {new Date(reminder.reviewDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-amber-400">{reminder.daysUntilReview}</div>
                  <p className="text-xs text-slate-400">days until</p>
                </div>
              </div>
            </CardHeader>

            {expandedId === idx && (
              <CardContent className="space-y-4 border-t border-slate-700/50 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Email</p>
                    <p className="text-white font-medium flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {reminder.client.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Phone</p>
                    <p className="text-white font-medium flex items-center gap-2 mt-1">
                      <Phone className="w-4 h-4 text-slate-400" />
                      {reminder.client.phone || "N/A"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Policy</p>
                  <div className="bg-slate-700/30 p-3 rounded text-sm text-slate-300">
                    <span className="font-medium">{reminder.policy.carrier}</span> - {reminder.policy.type}
                  </div>
                </div>

                <Button 
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `mailto:${reminder.client.email}?subject=Annual Review Reminder`;
                  }}
                >
                  Contact Client
                </Button>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
