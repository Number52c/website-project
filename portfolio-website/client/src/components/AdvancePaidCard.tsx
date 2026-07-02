import { useState } from "react";
import { DollarSign, CreditCard as Edit2, Save, X } from "lucide-react";

interface CarrierRate {
  carrier: string;
  advancePaidPercent: number;
}

interface AdvancePaidCardProps {
  totalAP: number;
  carrierRates: CarrierRate[];
  onUpdateRates?: (rates: CarrierRate[]) => void;
}

export function AdvancePaidCard({
  totalAP,
  carrierRates,
  onUpdateRates,
}: AdvancePaidCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRates, setEditedRates] = useState(carrierRates);

  const calculateAdvancePaid = () => {
    // Advance paid is typically 7 months of commission (110% FFL)
    // This is calculated from the AP and advance paid percentage per carrier
    return carrierRates.reduce((sum, rate) => {
      const carrierAP = totalAP * (rate.advancePaidPercent / 100);
      return sum + (carrierAP * 1.1) / 12 * 7; // 7 months advance
    }, 0);
  };

  const handleSave = () => {
    setEditedRates(editedRates);
    onUpdateRates?.(editedRates);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedRates(carrierRates);
    setIsEditing(false);
  };

  const advancePaid = calculateAdvancePaid();

  return (
    <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 rounded-xl p-6 border border-emerald-500/30">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-emerald-300 uppercase tracking-wider mb-1">
            Advance Paid (7 Months)
          </p>
          <p className="text-3xl font-bold text-emerald-400">
            ${advancePaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-emerald-400 hover:text-emerald-300 transition"
        >
          {isEditing ? <X size={24} /> : <Edit2 size={24} />}
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          {editedRates.map((rate, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-gray-300 text-sm flex-1">{rate.carrier}</span>
              <input
                type="number"
                min="0"
                max="100"
                value={rate.advancePaidPercent}
                onChange={(e) => {
                  const newRates = [...editedRates];
                  newRates[idx].advancePaidPercent = parseFloat(e.target.value) || 0;
                  setEditedRates(newRates);
                }}
                className="w-16 bg-emerald-900/30 border border-emerald-500/30 rounded px-2 py-1 text-emerald-400 text-sm"
              />
              <span className="text-gray-400 text-sm">%</span>
            </div>
          ))}
          <div className="flex gap-2 pt-3">
            <button
              onClick={handleSave}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded text-sm font-semibold flex items-center justify-center gap-2 transition"
            >
              <Save size={16} /> Save
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded text-sm font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {carrierRates.map((rate, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span className="text-gray-300">{rate.carrier}</span>
              <span className="text-emerald-400 font-semibold">
                {rate.advancePaidPercent}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
