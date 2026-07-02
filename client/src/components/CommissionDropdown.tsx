import { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";

interface CommissionDropdownProps {
  value: number | null;
  onChange: (value: number) => void;
  defaultValue?: number;
}

export function CommissionDropdown({ value, onChange, defaultValue = 110 }: CommissionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isManualInput, setIsManualInput] = useState(false);
  const [manualValue, setManualValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate commission options from 65 to 130 with 1% increments
  const commissionOptions = Array.from({ length: 66 }, (_, i) => 65 + i);

  const displayValue = value ?? defaultValue;

  const handleManualSubmit = () => {
    const parsed = parseFloat(manualValue);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 200) {
      onChange(parsed);
      setIsManualInput(false);
      setManualValue("");
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm flex items-center justify-between hover:bg-white/10 transition"
      >
        <span>{displayValue}%</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-white/10 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {/* Manual input option */}
          <div className="sticky top-0 bg-slate-800 border-b border-white/10 p-2">
            {isManualInput ? (
              <div className="flex gap-1">
                <input
                  ref={inputRef}
                  type="number"
                  value={manualValue}
                  onChange={(e) => setManualValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleManualSubmit(); }}
                  placeholder="Enter %"
                  className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-[#c9a84c]"
                  min="1"
                  max="200"
                  autoFocus
                />
                <button
                  onClick={handleManualSubmit}
                  className="px-2 py-1 bg-[#c9a84c] text-black text-xs font-semibold rounded hover:bg-[#b8973f] transition"
                >
                  Set
                </button>
                <button
                  onClick={() => { setIsManualInput(false); setManualValue(""); }}
                  className="px-2 py-1 bg-white/10 text-white text-xs rounded hover:bg-white/20 transition"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setIsManualInput(true); setTimeout(() => inputRef.current?.focus(), 50); }}
                className="w-full text-left px-2 py-1 text-sm text-[#c9a84c] hover:bg-white/10 rounded transition"
              >
                ✎ Enter custom value...
              </button>
            )}
          </div>
          {commissionOptions.map((percent) => (
            <button
              key={percent}
              onClick={() => {
                onChange(percent);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm transition ${
                displayValue === percent
                  ? "bg-[#c9a84c] text-black font-semibold"
                  : "text-white hover:bg-white/10"
              }`}
            >
              {percent}%
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
