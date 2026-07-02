/**
 * Carrier Guidelines Manager
 * Allows admins to create carriers and upload PDFs/guidelines for each
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Upload, Download, Trash2, FileText } from "lucide-react";

interface Guideline {
  id: string;
  title: string;
  category: string;
  url: string;
}

interface Carrier {
  id: string;
  name: string;
  guidelines: Guideline[];
}

export function CarrierGuidelinesManager() {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [showAddCarrier, setShowAddCarrier] = useState(false);
  const [newCarrierName, setNewCarrierName] = useState("");
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null);
  const [showUploadPDF, setShowUploadPDF] = useState(false);
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfCategory, setPdfCategory] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const handleAddCarrier = () => {
    if (!newCarrierName.trim()) {
      toast.error("Please enter a carrier name");
      return;
    }

    const newCarrier: Carrier = {
      id: Date.now().toString(),
      name: newCarrierName,
      guidelines: [],
    };

    setCarriers([...carriers, newCarrier]);
    setNewCarrierName("");
    setShowAddCarrier(false);
    toast.success(`${newCarrierName} added successfully`);
  };

  const handleUploadPDF = async () => {
    if (!selectedCarrier || !pdfFile || !pdfTitle.trim() || !pdfCategory.trim()) {
      toast.error("Please fill in all fields and select a file");
      return;
    }

    try {
      const fileUrl = URL.createObjectURL(pdfFile);
      
      const newGuideline: Guideline = {
        id: Date.now().toString(),
        title: pdfTitle,
        category: pdfCategory,
        url: fileUrl,
      };

      const updatedCarrier = {
        ...selectedCarrier,
        guidelines: [...selectedCarrier.guidelines, newGuideline],
      };

      setCarriers(carriers.map(c => c.id === selectedCarrier.id ? updatedCarrier : c));
      setSelectedCarrier(updatedCarrier);
      setPdfTitle("");
      setPdfCategory("");
      setPdfFile(null);
      setShowUploadPDF(false);
      toast.success("PDF uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload PDF");
    }
  };

  const handleDeleteCarrier = (id: string) => {
    setCarriers(carriers.filter(c => c.id !== id));
    if (selectedCarrier?.id === id) {
      setSelectedCarrier(null);
    }
    toast.success("Carrier deleted");
  };

  const handleDeleteGuideline = (guidelineId: string) => {
    if (!selectedCarrier) return;

    const updatedCarrier = {
      ...selectedCarrier,
      guidelines: selectedCarrier.guidelines.filter(g => g.id !== guidelineId),
    };

    setCarriers(carriers.map(c => c.id === selectedCarrier.id ? updatedCarrier : c));
    setSelectedCarrier(updatedCarrier);
    toast.success("Guideline deleted");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Carrier Guidelines Manager</h2>
        <Button onClick={() => setShowAddCarrier(true)} className="gap-2">
          <Plus size={18} />
          Add Carrier
        </Button>
      </div>

      {/* Add Carrier Dialog */}
      <Dialog open={showAddCarrier} onOpenChange={setShowAddCarrier}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Carrier</DialogTitle>
            <DialogDescription>Enter the name of the new carrier</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="e.g., Aflac, MetLife, Transamerica"
              value={newCarrierName}
              onChange={(e) => setNewCarrierName(e.target.value)}
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAddCarrier(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCarrier}>Add Carrier</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload PDF Dialog */}
      <Dialog open={showUploadPDF} onOpenChange={setShowUploadPDF}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Guideline for {selectedCarrier?.name}</DialogTitle>
            <DialogDescription>Add a new PDF guideline</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Guideline Title (e.g., Signature Process)"
              value={pdfTitle}
              onChange={(e) => setPdfTitle(e.target.value)}
            />
            <Input
              placeholder="Category (e.g., Signature, Medical, General)"
              value={pdfCategory}
              onChange={(e) => setPdfCategory(e.target.value)}
            />
            <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                className="hidden"
                id="pdf-upload"
              />
              <label htmlFor="pdf-upload" className="cursor-pointer">
                <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="text-sm text-gray-600">
                  {pdfFile ? pdfFile.name : "Click to select PDF or drag and drop"}
                </p>
              </label>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowUploadPDF(false)}>
                Cancel
              </Button>
              <Button onClick={handleUploadPDF}>Upload PDF</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Carriers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {carriers.map((carrier) => (
          <Card
            key={carrier.id}
            className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedCarrier(carrier)}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-lg">{carrier.name}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCarrier(carrier.id);
                }}
              >
                <Trash2 size={16} className="text-red-500" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              {carrier.guidelines.length} guideline{carrier.guidelines.length !== 1 ? "s" : ""}
            </p>
            <Button
              size="sm"
              className="w-full gap-2"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCarrier(carrier);
                setShowUploadPDF(true);
              }}
            >
              <Upload size={16} />
              Add Guideline
            </Button>
          </Card>
        ))}
      </div>

      {/* Selected Carrier Details */}
      {selectedCarrier && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">{selectedCarrier.name} Guidelines</h3>
            <Button
              onClick={() => setSelectedCarrier(null)}
              variant="ghost"
            >
              Close
            </Button>
          </div>

          {selectedCarrier.guidelines.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No guidelines uploaded yet</p>
          ) : (
            <div className="space-y-3">
              {selectedCarrier.guidelines.map((guideline) => (
                <div
                  key={guideline.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-blue-500" />
                    <div>
                      <p className="font-semibold">{guideline.title}</p>
                      <p className="text-sm text-gray-600">{guideline.category}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(guideline.url, "_blank")}
                    >
                      <Download size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteGuideline(guideline.id)}
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
