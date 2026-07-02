import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Download, X, Check } from "lucide-react";
import { toast } from "sonner";

interface WelcomeTextModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  welcomeText: string;
}

export function WelcomeTextModal({ open, onOpenChange, clientName, welcomeText }: WelcomeTextModalProps) {
  const [isCopied, setIsCopied] = React.useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(welcomeText);
      setIsCopied(true);
      toast.success("Copied to clipboard!");
      // Reset the button state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const downloadTXT = () => {
    const element = document.createElement("a");
    const file = new Blob([welcomeText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `Welcome_${clientName.replace(/ /g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Downloaded!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-xl p-0 gap-0 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
          <DialogTitle className="text-base font-semibold text-white truncate">
            Message for {clientName}
          </DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 hover:bg-slate-700 rounded transition"
          >
            <X size={18} className="text-slate-300" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Message Preview */}
          <div className="bg-slate-900 border border-slate-700 rounded p-3 text-xs leading-6 text-slate-100 font-mono overflow-x-auto">
            <pre className="whitespace-pre-wrap word-break break-words">{welcomeText}</pre>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={copyToClipboard}
              className={`w-full font-semibold py-2.5 text-sm transition-all duration-300 ${
                isCopied
                  ? "bg-green-600 hover:bg-green-600 text-white"
                  : "bg-[#c9a84c] hover:bg-[#b89a3c] text-slate-900"
              }`}
            >
              {isCopied ? (
                <>
                  <Check size={16} className="mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} className="mr-2" />
                  Copy Message
                </>
              )}
            </Button>
            <Button
              onClick={downloadTXT}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2.5 text-sm"
            >
              <Download size={16} className="mr-2" />
              Download as TXT
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2.5 text-sm"
            >
              Close
            </Button>
          </div>

          <p className="text-xs text-slate-400 text-center pt-2">
            Copy and paste into SMS or messaging app
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
