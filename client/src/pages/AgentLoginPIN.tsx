import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CircleAlert as AlertCircle, Lock } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AgentLoginPIN() {
  const [, setLocation] = useLocation();
  const [agentId, setAgentId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [showDialog, setShowDialog] = useState(true);

  const loginMutation = trpc.agent.loginWithPIN.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await loginMutation.mutateAsync({
        agentId: parseInt(agentId, 10),
        pin: pin.trim(),
      });

      if (response.success) {
        // Redirect to agent dashboard
        setLocation("/agent/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login.");
    } finally {
      // setIsLoading(false); // isLoading is handled by loginMutation.isPending
    }
  };

  const handleClose = () => {
    setShowDialog(false);
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#c9a84c]" />
              Agent Login
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 flex gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Agent ID
              </label>
              <Input
                type="number"
                placeholder="Enter your agent ID"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                disabled={loginMutation.isPending}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                PIN
              </label>
              <Input
                type="password"
                placeholder="Enter your PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                disabled={loginMutation.isPending}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
              />
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending || !agentId || !pin}
              className="w-full bg-[#c9a84c] hover:bg-[#b89a3a] text-slate-900 font-medium"
            >
              {loginMutation.isPending ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>

            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-4">
            Contact your administrator if you don't have your Agent ID or PIN.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
