import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CircleAlert as AlertCircle, Lock, Loader as Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function OrtizPINEntry() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();

  const verifyPinMutation = trpc.adminAuth.verifyPin.useMutation({
    onSuccess: () => {
      setLocation("/admin/ortiz");
    },
    onError: (err) => {
      setError(err.message);
      setPin("");
    },
  });

  const handleSubmit = () => {
    if (!pin.trim()) {
      setError("Please enter your PIN.");
      return;
    }
    verifyPinMutation.mutate({ pin });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-center mb-6">
            <div className="bg-yellow-500/20 p-3 rounded-lg">
              <Lock className="w-6 h-6 text-yellow-500" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Ortiz Dashboard
          </h1>
          <p className="text-slate-400 text-center mb-6">
            Enter your PIN to access the dashboard
          </p>

          {/* PIN Input */}
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 text-center text-2xl tracking-widest"
              disabled={verifyPinMutation.isPending}
              autoFocus
            />

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={verifyPinMutation.isPending}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold py-2 h-auto"
            >
              {verifyPinMutation.isPending ? (
                <Loader2 className="animate-spin mr-2" size={18} />
              ) : null}
              Unlock Dashboard
            </Button>
          </div>

          {/* Footer */}
          <p className="text-slate-500 text-xs text-center mt-6">
            Secured with server-side authentication
          </p>
        </div>
      </div>
    </div>
  );
}
