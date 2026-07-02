import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";

// Session timeout durations (client-side tracking)
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes of inactivity
const WARNING_THRESHOLD_MS = 2 * 60 * 1000; // Warn 2 minutes before expiration

export function SessionTimeoutWarning() {
  const { isAuthenticated, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [_, navigate] = useLocation();
  const lastActivityRef = useRef(Date.now());
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset activity timestamp on user interaction
  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    // If warning is showing and user interacts, dismiss it
    if (showWarning) {
      setShowWarning(false);
      setRemainingTime(0);
    }
  }, [showWarning]);

  // Listen for user activity events
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    events.forEach(event => window.addEventListener(event, resetActivity, { passive: true }));

    return () => {
      events.forEach(event => window.removeEventListener(event, resetActivity));
    };
  }, [isAuthenticated, resetActivity]);

  // Check for inactivity periodically
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkInterval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const timeUntilExpiration = SESSION_TIMEOUT_MS - elapsed;

      if (timeUntilExpiration <= 0) {
        // Session expired
        clearInterval(checkInterval);
        setShowWarning(false);
        logout();
        navigate("/");
      } else if (timeUntilExpiration <= WARNING_THRESHOLD_MS && !showWarning) {
        setShowWarning(true);
        setRemainingTime(timeUntilExpiration);
      } else if (timeUntilExpiration > WARNING_THRESHOLD_MS && showWarning) {
        // User was active, dismiss warning
        setShowWarning(false);
      }

      if (showWarning) {
        setRemainingTime(timeUntilExpiration);
      }
    }, 1000);

    return () => clearInterval(checkInterval);
  }, [isAuthenticated, showWarning, logout, navigate]);

  const handleKeepAlive = () => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
    setRemainingTime(0);
  };

  const handleLogout = () => {
    setShowWarning(false);
    logout();
    navigate("/");
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isAuthenticated || !showWarning) {
    return null;
  }

  return (
    <Dialog open={showWarning} onOpenChange={(open) => { if (!open) handleKeepAlive(); }}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Session Expiring Soon</DialogTitle>
          <DialogDescription className="text-gray-300">
            Your session will expire in <span className="font-mono font-bold text-[#C9A84C]">{formatTime(remainingTime)}</span> due to inactivity.
            Do you want to stay logged in?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleLogout} className="border-white/20 text-white hover:bg-white/10">Logout</Button>
          <Button onClick={handleKeepAlive} className="bg-[#C9A84C] hover:bg-[#b8973f] text-black font-semibold">Keep Me Logged In</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
