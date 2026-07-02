import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { BackendPaymentKPI } from "./BackendPaymentKPI";

interface ClientPaymentEntry {
  clientName: string;
  premium: number;
  commissionPercent: number;
  effectiveDate: number;
  policyNumber: string;
  carrier: string;
}

interface ClientBackendPaymentsProps {
  entries: ClientPaymentEntry[];
}

export function ClientBackendPayments({ entries }: ClientBackendPaymentsProps) {
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());

  // Group entries by client name
  const clientGroups = entries.reduce(
    (acc, entry) => {
      if (!acc[entry.clientName]) {
        acc[entry.clientName] = [];
      }
      acc[entry.clientName].push(entry);
      return acc;
    },
    {} as Record<string, ClientPaymentEntry[]>
  );

  const toggleClient = (clientName: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientName)) {
      newExpanded.delete(clientName);
    } else {
      newExpanded.add(clientName);
    }
    setExpandedClients(newExpanded);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
        Backend Payment Schedule by Client
      </h3>

      {Object.entries(clientGroups).map(([clientName, clientEntries]) => (
        <div key={clientName} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
          {/* Client Header */}
          <button
            onClick={() => toggleClient(clientName)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition"
          >
            <div className="text-left">
              <p className="font-semibold text-white">{clientName}</p>
              <p className="text-xs text-gray-400">{clientEntries.length} policy(ies)</p>
            </div>
            <ChevronDown
              size={20}
              className={`text-gray-400 transition-transform ${
                expandedClients.has(clientName) ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Client Details */}
          {expandedClients.has(clientName) && (
            <div className="border-t border-white/10 p-4 bg-black/20 space-y-4">
              {clientEntries.map((entry, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="text-xs text-gray-400 mb-2">
                    <p>{entry.carrier} - {entry.policyNumber}</p>
                    <p>Premium: ${entry.premium.toLocaleString("en-US", { minimumFractionDigits: 2 })}/month</p>
                  </div>
                  <BackendPaymentKPI
                    premium={entry.premium}
                    commissionPercent={entry.commissionPercent}
                    effectiveDate={entry.effectiveDate}
                    clientName={clientName}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
