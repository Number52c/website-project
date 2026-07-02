import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard as Edit2, Trash2, Phone, Link as LinkIcon } from "lucide-react";
import { trpc } from "@/lib/trpc";
import UnderwritingGuidelines from "@/components/UnderwritingGuidelines";

export default function AgentCarrierResources() {
  const [activeTab, setActiveTab] = useState("contact");
  const { data: carriers, isLoading } = trpc.agent.getCarriers.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Loading carrier resources...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Carrier Resources</h1>
          <p className="text-muted-foreground">Access carrier contact information and underwriting guidelines</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted">
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contact Info
            </TabsTrigger>
            <TabsTrigger value="guidelines" className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Guidelines
            </TabsTrigger>
          </TabsList>

          {/* Contact Info Tab */}
          <TabsContent value="contact" className="mt-6">
            <Card className="bg-card border-border p-6">
              <div className="space-y-4">
                {carriers && carriers.length > 0 ? (
                  <div className="space-y-3">
                    {carriers.map((carrier) => (
                      <div
                        key={carrier.id}
                        className="flex items-start justify-between p-4 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{carrier.name}</h3>
                          {carrier.phone && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {carrier.phone}
                            </p>
                          )}
                          {carrier.portalUrl && (
                            <a
                              href={carrier.portalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline mt-1 inline-block"
                            >
                              {carrier.portalUrl}
                            </a>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No carriers available</p>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Guidelines Tab */}
          <TabsContent value="guidelines" className="mt-6">
            <UnderwritingGuidelines />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
