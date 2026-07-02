import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, FileText } from "lucide-react";
import UnderwritingGuidelines from "@/components/UnderwritingGuidelines";

interface CarrierPhonesTabProps {
  children: React.ReactNode;
}

export default function CarrierResources({ children }: CarrierPhonesTabProps) {
  const [activeTab, setActiveTab] = useState("phones");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Carrier Resources
        </h2>
        <p className="text-gray-300">
          Access carrier contact information and underwriting guidelines
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/10 border border-white/20">
          <TabsTrigger 
            value="phones" 
            className="gap-2 text-gray-300 data-[state=active]:bg-[#C9A84C] data-[state=active]:text-[#0D1B3E]"
          >
            <Phone size={18} />
            <span>Contact Info</span>
          </TabsTrigger>
          <TabsTrigger 
            value="guidelines"
            className="gap-2 text-gray-300 data-[state=active]:bg-[#C9A84C] data-[state=active]:text-[#0D1B3E]"
          >
            <FileText size={18} />
            <span>Guidelines</span>
          </TabsTrigger>
        </TabsList>

        {/* Carrier Phones Tab */}
        <TabsContent value="phones" className="space-y-6">
          {children}
        </TabsContent>

        {/* Underwriting Guidelines Tab */}
        <TabsContent value="guidelines" className="space-y-6">
          <UnderwritingGuidelines />
        </TabsContent>
      </Tabs>
    </div>
  );
}
