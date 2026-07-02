import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, Loader as Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import AdminDashboard from "./AdminDashboard";

export default function AdminDashboardPINWrapper() {
  const [isPINVerified, setIsPINVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");

  // Check existing session on mount
  const sessionCheck = trpc.adminAuth.checkSession.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (sessionCheck.isLoading) return;
    if (sessionCheck.data?.authenticated) {
      setIsPINVerified(true);
    }
    setIsChecking(false);
  }, [sessionCheck.isLoading, sessionCheck.data]);

  // Server-side PIN verification mutation
  const verifyPinMutation = trpc.adminAuth.verifyPin.useMutation({
    onSuccess: () => {
      setIsPINVerified(true);
      setError("");
      setPin("");
    },
    onError: (err) => {
      setError(err.message);
      setPin("");
    },
  });

  // Logout mutation
  const logoutMutation = trpc.adminAuth.logout.useMutation({
    onSuccess: () => {
      setIsPINVerified(false);
      window.location.href = "/";
    },
  });

  const handleUnlock = () => {
    if (!pin.trim()) {
      setError("Please enter your PIN.");
      return;
    }
    verifyPinMutation.mutate({ pin });
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Show loading while checking existing session
  if (isChecking) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #0a1628 0%, #132744 50%, #0a1628 100%)",
        }}
      >
        <Loader2 className="animate-spin text-yellow-500" size={48} />
      </div>
    );
  }

  if (!isPINVerified) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{
          background:
            "linear-gradient(135deg, #0a1628 0%, #132744 50%, #0a1628 100%)",
        }}
      >
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-4 rounded-lg">
                <Lock className="text-white" size={32} />
              </div>
            </div>

            <h1 className="text-center text-2xl font-bold text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-center text-gray-400 mb-6">
              Enter your PIN to access the dashboard
            </p>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnlock();
                    }
                  }}
                  placeholder="Enter PIN"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 text-center text-2xl tracking-widest"
                  disabled={verifyPinMutation.isPending}
                  autoFocus
                />
                <button
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  type="button"
                >
                  {showPin ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              <Button
                onClick={handleUnlock}
                disabled={verifyPinMutation.isPending}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-900 font-bold py-3 rounded-lg transition"
              >
                {verifyPinMutation.isPending ? (
                  <Loader2 className="animate-spin mr-2" size={18} />
                ) : null}
                Unlock Dashboard
              </Button>
            </div>

            <p className="text-center text-gray-500 text-sm mt-6">
              Secured with server-side authentication
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <AdminDashboard onLogout={handleLogout} />;
}
