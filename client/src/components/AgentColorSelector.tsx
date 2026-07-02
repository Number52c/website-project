import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface AgentColorSelectorProps {
  agentId: number;
  agentName: string;
  currentColor: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectColor: (agentId: number, color: string) => Promise<void>;
}

const AGENT_COLORS = [
  { name: "Blue", value: "blue", hex: "#3b82f6" },
  { name: "Orange", value: "orange", hex: "#f97316" },
  { name: "Hot Pink", value: "hotpink", hex: "#ff1493" },
  { name: "Purple", value: "purple", hex: "#a855f7" },
  { name: "Green", value: "green", hex: "#22c55e" },
  { name: "Red", value: "red", hex: "#ef4444" },
];

export function AgentColorSelector({ agentId, agentName, currentColor, open, onOpenChange, onSelectColor }: AgentColorSelectorProps) {
  const handleSelectColor = async (color: string) => {
    try {
      await onSelectColor(agentId, color);
      toast.success(`Color updated to ${color}!`);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update color");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Select Color for {agentName}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3">
          {AGENT_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => handleSelectColor(color.value)}
              className={`p-4 rounded-lg border-2 transition-all ${
                currentColor === color.value
                  ? "border-white shadow-lg"
                  : "border-slate-600 hover:border-slate-500"
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            >
              <span className="text-white font-medium text-sm">{color.name}</span>
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-600 text-slate-300"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
