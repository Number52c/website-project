import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CircleAlert as AlertCircle, Lock, CircleCheck as CheckCircle } from "lucide-react";

export default function AgentChangePassword() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const setInitialPasswordMutation = trpc.agent.setInitialPassword.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => {
        setLocation("/agent/dashboard");
      }, 2000);
    },
    onError: (err: any) => {
      setError(err.message || "An error occurred while setting your password");
    },
  });

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate email
    if (!email) {
      setError("Email is required");
      return;
    }

    // Validate passwords
    if (!tempPassword) {
      setError("Temporary password is required");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (tempPassword === newPassword) {
      setError("New password must be different from temporary password");
      return;
    }

    setInitialPasswordMutation.mutate({
      email,
      tempPassword,
      newPassword,
      confirmPassword,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1B3E] to-[#1a2a5e] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Lock className="text-[#C9A84C]" size={28} />
              <h1 className="text-3xl font-bold text-[#0D1B3E]">Set Your Password</h1>
            </div>
            <p className="text-gray-600">Please set your password before accessing your dashboard</p>
          </div>

          {/* Success Alert */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-green-700 text-sm font-semibold">Password set successfully!</p>
                <p className="text-green-600 text-xs">Redirecting to dashboard...</p>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Password Setup Form */}
          <form onSubmit={handleSetPassword} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#0D1B3E] mb-2">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                disabled={setInitialPasswordMutation.isPending || success}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your agent email address
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0D1B3E] mb-2">
                Temporary Password
              </label>
              <Input
                type="password"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={setInitialPasswordMutation.isPending || success}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the temporary password provided by your administrator
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0D1B3E] mb-2">
                New Password
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={setInitialPasswordMutation.isPending || success}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 8 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0D1B3E] mb-2">
                Confirm New Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={setInitialPasswordMutation.isPending || success}
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              disabled={setInitialPasswordMutation.isPending || success}
              className="w-full bg-[#C9A84C] hover:bg-[#D4AF37] text-[#0D1B3E] font-bold py-2 rounded-lg transition-all duration-300"
            >
              {setInitialPasswordMutation.isPending ? "Setting Password..." : "Set Password & Continue"}
            </Button>
          </form>

          {/* Security Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-xs font-semibold mb-2">
              🔒 Security Note
            </p>
            <p className="text-blue-700 text-xs">
              For your security, you must set your password on your first login. This ensures only you have access to your account.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
