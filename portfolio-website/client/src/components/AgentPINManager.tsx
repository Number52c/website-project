import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Copy, CircleCheck as CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface AgentPINManagerProps {
  agentId: number;
  agentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGeneratePIN: (agentId: number) => Promise<{ pin: string }>;
}

export function AgentPINManager({ agentId, agentName, open, onOpenChange, onGeneratePIN }: AgentPINManagerProps) {
  const [generatedPIN, setGeneratedPIN] = useState<string | null>(null);
  const [copiedPIN, setCopiedPIN] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGeneratePIN = async () => {
    setIsLoading(true);
    try {
      const result = await onGeneratePIN(agentId);
      setGeneratedPIN(result.pin);
      setCopiedPIN(false);
      toast.success("PIN generated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate PIN");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPIN = () => {
    if (generatedPIN) {
      navigator.clipboard.writeText(generatedPIN);
      setCopiedPIN(true);
      setTimeout(() => setCopiedPIN(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Generate PIN for {agentName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {generatedPIN ? (
            <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
              <p className="text-sm text-slate-300 mb-2">Generated PIN:</p>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={generatedPIN}
                  readOnly
                  className="bg-slate-600 border-slate-500 text-white font-mono text-lg"
                />
                <Button
                  size="sm"
                  onClick={handleCopyPIN}
                  className="bg-slate-600 hover:bg-slate-500"
                >
                  {copiedPIN ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-slate-400 mt-2">Share this PIN with the agent for quick login.</p>
            </div>
          ) : (
            <p className="text-slate-300">Click the button below to generate a new PIN for this agent.</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-600 text-slate-300"
          >
            Close
          </Button>
          {!generatedPIN && (
            <Button
              onClick={handleGeneratePIN}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? "Generating..." : "Generate PIN"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
