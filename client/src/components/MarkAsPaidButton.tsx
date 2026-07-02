import { Check, X } from "lucide-react";
import { Button } from "./ui/button";

interface MarkAsPaidButtonProps {
  isPaid: boolean;
  onToggle: (isPaid: boolean) => void;
  isLoading?: boolean;
}

export function MarkAsPaidButton({
  isPaid,
  onToggle,
  isLoading = false,
}: MarkAsPaidButtonProps) {
  return (
    <Button
      size="sm"
      variant={isPaid ? "default" : "outline"}
      onClick={() => onToggle(!isPaid)}
      disabled={isLoading}
      className={`transition-all ${
        isPaid
          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
          : "border-gray-500 text-gray-400 hover:border-gray-300 hover:text-gray-300"
      }`}
    >
      {isPaid ? (
        <>
          <Check size={14} className="mr-1" />
          Paid
        </>
      ) : (
        <>
          <X size={14} className="mr-1" />
          Unpaid
        </>
      )}
    </Button>
  );
}
