import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CircleAlert as AlertCircle, LogIn, KeyRound, ArrowLeft, CircleCheck as CheckCircle2 } from "lucide-react";

type View = "login" | "forgot" | "forgot-sent";

export default function AgentLogin() {
  const [, setLocation] = useLocation();
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [error, setError] = useState("");

  const loginMutation = trpc.agent.login.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        if (result.requiresPasswordChange) {
          setLocation("/agent/change-password");
        } else {
          setLocation("/agent/dashboard");
        }
      }
    },
    onError: (err: any) => {
      setError(err.message || "An error occurred during login");
    },
  });

  const forgotPasswordMutation = trpc.agent.forgotPassword.useMutation({
    onSuccess: () => {
      setView("forgot-sent");
    },
    onError: () => {
      // Still show success to prevent email enumeration
      setView("forgot-sent");
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate({ email, password });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    forgotPasswordMutation.mutate({ email: forgotEmail });
  };

  const handleFirstTimeSetup = () => {
    setLocation("/agent/change-password");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1B3E] to-[#1a2a5e] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl">
        <div className="p-8">

          {/* ── LOGIN VIEW ── */}
          {view === "login" && (
            <>
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <LogIn className="text-[#C9A84C]" size={28} />
                  <h1 className="text-3xl font-bold text-[#0D1B3E]">Agent Portal</h1>
                </div>
                <p className="text-gray-600">Sign in to your agent dashboard</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* OAuth Login for First-Time Setup */}
              <div className="mb-6">
                <Button
                  type="button"
                  onClick={handleFirstTimeSetup}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-all duration-300"
                >
                  Sign In with Manus (First-Time Setup)
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  New agents: Click here to set your password using the temporary password from your welcome email
                </p>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              {/* Direct Login Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#0D1B3E] mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    disabled={loginMutation.isPending}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0D1B3E] mb-2">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loginMutation.isPending}
                    className="w-full"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full bg-[#C9A84C] hover:bg-[#D4AF37] text-[#0D1B3E] font-bold py-2 rounded-lg transition-all duration-300"
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              {/* Forgot Password Link */}
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => { setView("forgot"); setError(""); }}
                  className="text-sm text-[#C9A84C] hover:text-[#D4AF37] font-medium underline underline-offset-2 transition-colors"
                >
                  Forgot your password?
                </button>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-gray-500 text-xs">
                  Contact your administrator to create your agent account
                </p>
              </div>
            </>
          )}

          {/* ── FORGOT PASSWORD VIEW ── */}
          {view === "forgot" && (
            <>
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <KeyRound className="text-[#C9A84C]" size={28} />
                  <h1 className="text-3xl font-bold text-[#0D1B3E]">Reset Password</h1>
                </div>
                <p className="text-gray-600 text-sm">
                  Enter your email and your administrator will be notified to send you a new password.
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#0D1B3E] mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    disabled={forgotPasswordMutation.isPending}
                    className="w-full"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={forgotPasswordMutation.isPending}
                  className="w-full bg-[#C9A84C] hover:bg-[#D4AF37] text-[#0D1B3E] font-bold py-2 rounded-lg transition-all duration-300"
                >
                  {forgotPasswordMutation.isPending ? "Sending..." : "Request Password Reset"}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setView("login")}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#0D1B3E] mx-auto transition-colors"
                >
                  <ArrowLeft size={14} />
                  Back to Sign In
                </button>
              </div>
            </>
          )}

          {/* ── FORGOT SENT VIEW ── */}
          {view === "forgot-sent" && (
            <>
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <CheckCircle2 className="text-green-500" size={48} />
                </div>
                <h1 className="text-2xl font-bold text-[#0D1B3E] mb-3">Request Sent!</h1>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Your administrator has been notified. They will send you a new temporary password shortly. Check your email or phone for the new credentials.
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-6">
                <p className="text-blue-800 text-xs font-semibold mb-1">What happens next?</p>
                <p className="text-blue-700 text-xs">
                  Your admin will generate a new temporary password and send it to you. Once you receive it, use the <strong>"Sign In with Manus"</strong> button on the login page to set a new permanent password.
                </p>
              </div>

              <Button
                type="button"
                onClick={() => { setView("login"); setForgotEmail(""); }}
                className="w-full bg-[#C9A84C] hover:bg-[#D4AF37] text-[#0D1B3E] font-bold py-2 rounded-lg transition-all duration-300"
              >
                Back to Sign In
              </Button>
            </>
          )}

        </div>
      </Card>
    </div>
  );
}
