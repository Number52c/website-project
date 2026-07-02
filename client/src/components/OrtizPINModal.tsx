import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CircleAlert as AlertCircle, Lock } from "lucide-react";

interface OrtizPINModalProps {
  isOpen: boolean;
  onAuthenticate: (pin: string) => Promise<boolean>;
  onClose: () => void;
}

/**
 * PIN Authentication Modal for Ortiz Dashboard
 * Requires PIN to access confidential admin dashboard (verified server-side)
 */
export function OrtizPINModal({ isOpen, onAuthenticate, onClose }: OrtizPINModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (pin.length !== 4) {
      setError("PIN must be 4 digits");
      setIsLoading(false);
      return;
    }

    try {
      const success = await onAuthenticate(pin);
      if (success) {
        setPin("");
        setAttempts(0);
      } else {
        setAttempts((prev) => prev + 1);
        setError("Invalid PIN. Please try again.");
        setPin("");

        // Lock after 5 failed attempts
        if (attempts >= 4) {
          setError("Too many failed attempts. Please try again later.");
        }
      }
    } catch (err) {
      setError("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isLocked = attempts >= 5;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-600" />
            <DialogTitle>Ortiz Dashboard Access</DialogTitle>
          </div>
          <DialogDescription>
            This is a confidential dashboard. Enter your PIN to continue.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="border-red-500/50 bg-red-50/50 dark:bg-red-950/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-700 dark:text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <label className="text-sm font-medium text-foreground">PIN</label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="Enter 4-digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              disabled={isLoading || isLocked}
              className="mt-2 text-center text-2xl tracking-widest font-mono"
            />
          </div>

          {attempts > 0 && attempts < 5 && (
            <p className="text-xs text-muted-foreground">
              Attempts remaining: {5 - attempts}
            </p>
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isLoading || pin.length !== 4 || isLocked}
              className="flex-1 bg-amber-600 hover:bg-amber-700"
            >
              {isLoading ? "Verifying..." : "Unlock"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Session expires after 24 hours of inactivity
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
