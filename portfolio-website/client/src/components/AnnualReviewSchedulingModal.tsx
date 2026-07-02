import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, CircleAlert as AlertCircle, CircleCheck as CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface AnnualReviewSchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName?: string;
}

export function AnnualReviewSchedulingModal({ isOpen, onClose, clientName = "Sarah" }: AnnualReviewSchedulingModalProps) {
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setPreferredDate("");
        setPreferredTime("");
        setNotes("");
      }, 3000);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferredDate || !preferredTime) {
      alert("Please select both a date and time");
      return;
    }

    setIsSubmitting(true);
    await contactMutation.mutateAsync({
      name: clientName,
      email: "client@example.com",
      phone: "",
      subject: "Annual Review Scheduling Request",
      message: `I would like to schedule my annual review.\n\nPreferred Date: ${preferredDate}\nPreferred Time: ${preferredTime}\n\nAdditional Notes:\n${notes}`,
    });
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-slate-900 to-slate-800 border border-gold/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="h-6 w-6 text-gold" />
            Schedule Your Annual Review
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Let's get your annual review scheduled. Choose a date and time that works best for you.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-emerald-500/20 p-3">
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Request Submitted!</h3>
            <p className="text-gray-300">
              Thank you for scheduling your annual review. We'll confirm your appointment shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Preferred Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="inline h-4 w-4 mr-2" />
                Preferred Date
              </label>
              <Input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="bg-slate-800/50 border border-gold/20 text-white placeholder-gray-500 focus:border-gold/50"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Select a date within the next 3 months</p>
            </div>

            {/* Preferred Time */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Clock className="inline h-4 w-4 mr-2" />
                Preferred Time
              </label>
              <Input
                type="time"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="bg-slate-800/50 border border-gold/20 text-white placeholder-gray-500 focus:border-gold/50"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Business hours: 9 AM - 5 PM CST</p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Additional Notes (Optional)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific topics you'd like to discuss during your review?"
                className="bg-slate-800/50 border border-gold/20 text-white placeholder-gray-500 focus:border-gold/50 resize-none"
                rows={3}
              />
            </div>

            {/* Info Alert */}
            <div className="rounded-lg bg-gold/10 border border-gold/20 p-3 flex gap-2">
              <AlertCircle className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-300">
                We'll contact you to confirm your appointment. Make sure your contact information is up to date.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1 border-gold/20 text-gray-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gold/20 text-gold hover:bg-gold/30 border border-gold/50"
              >
                {isSubmitting ? "Submitting..." : "Schedule Review"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
