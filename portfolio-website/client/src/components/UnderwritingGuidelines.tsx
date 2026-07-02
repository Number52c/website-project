import { useState } from "react";
import { FileText, Play, Download, Search, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import DocumentViewer from "@/components/DocumentViewer";
import VideoPlayer from "@/components/VideoPlayer";
import { toast } from "sonner";

interface GuidelineDocument {
  id: string;
  name: string;
  url: string;
  type: "pdf" | "video";
  carrier?: string;
  category?: string;
}

interface CarrierData {
  id: string;
  name: string;
  guidelines: GuidelineDocument[];
}

const INITIAL_GUIDELINES: GuidelineDocument[] = [
  {
    id: "accidental-instabrain",
    name: "Accidental Instabrain",
    url: "/manus-storage/AccidentalInstabrain_1a0408e6.pdf",
    type: "pdf",
    carrier: "Instabrain",
    category: "Accidental Death",
  },
  {
    id: "aflac-signature",
    name: "Aflac Signature Process",
    url: "/manus-storage/Aflacsignature_6dc6acc3.pdf",
    type: "pdf",
    carrier: "Aflac",
    category: "Signature",
  },
  {
    id: "cfl",
    name: "CFL Guidelines",
    url: "/manus-storage/CFL_668befd7.pdf",
    type: "pdf",
    carrier: "CFL",
    category: "General",
  },
  {
    id: "corebridge-guidelines",
    name: "CoreBridge Guidelines",
    url: "/manus-storage/corebridgeunder_14834caf.pdf",
    type: "pdf",
    carrier: "CoreBridge",
    category: "Underwriting",
  },
  {
    id: "decline-medications",
    name: "Decline Medications",
    url: "/manus-storage/DeclineMeds_478fbeb2.pdf",
    type: "pdf",
    carrier: "ELCO",
    category: "Medical",
  },
  {
    id: "elco-weight",
    name: "ELCO Weight Guidelines",
    url: "/manus-storage/Elcoweight_16f3e25b.pdf",
    type: "pdf",
    carrier: "ELCO",
    category: "Medical",
  },
  {
    id: "elco-whole-life",
    name: "ELCO Whole Life Underwriting Guide",
    url: "/manus-storage/ELCOWholeLifeUnderwritingGuide(WLUWG-04-24)_39108121.pdf",
    type: "pdf",
    carrier: "ELCO",
    category: "Whole Life",
  },
  {
    id: "golden-eagle",
    name: "Golden Eagle Guidelines",
    url: "/manus-storage/GoldenEagle_a56b5e3f.pdf",
    type: "pdf",
    carrier: "Golden Eagle",
    category: "General",
  },
  {
    id: "medications-reference",
    name: "Medications Reference",
    url: "/manus-storage/Medications_d6192a79.pdf",
    type: "pdf",
    category: "Medical",
  },
  {
    id: "moo-text-signature",
    name: "MOO Text Signature Process",
    url: "/manus-storage/MOOTEXTSIGNATURE(2)_8f17c2c5.mp4",
    type: "video",
    category: "Signature",
  },
  {
    id: "transamerica-signature",
    name: "Transamerica Signature Process",
    url: "/manus-storage/TransamericaSignatureProcess_841b2ca9.pdf",
    type: "pdf",
    carrier: "Transamerica",
    category: "Signature",
  },
];

export default function UnderwritingGuidelines() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<GuidelineDocument | null>(null);
  const [showAddCarrierDialog, setShowAddCarrierDialog] = useState(false);
  const [newCarrierName, setNewCarrierName] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfCategory, setPdfCategory] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Initialize carriers from guidelines
  const [guidelines, setGuidelines] = useState<GuidelineDocument[]>(INITIAL_GUIDELINES);
  const [carriers, setCarriers] = useState<CarrierData[]>(() => {
    const carrierMap = new Map<string, GuidelineDocument[]>();
    INITIAL_GUIDELINES.forEach((doc) => {
      if (doc.carrier) {
        if (!carrierMap.has(doc.carrier)) {
          carrierMap.set(doc.carrier, []);
        }
        carrierMap.get(doc.carrier)!.push(doc);
      }
    });
    return Array.from(carrierMap.entries()).map(([name, docs], idx) => ({
      id: `carrier-${idx}`,
      name,
      guidelines: docs,
    }));
  });

  const handleAddCarrier = async () => {
    if (!newCarrierName.trim()) {
      toast.error("Please enter a carrier name");
      return;
    }

    if (!pdfFile || !pdfTitle.trim() || !pdfCategory.trim()) {
      toast.error("Please select a PDF and fill in all fields");
      return;
    }

    try {
      // Create a local URL for the PDF (in production, upload to storage)
      const fileUrl = URL.createObjectURL(pdfFile);
      
      const newDoc: GuidelineDocument = {
        id: `doc-${Date.now()}`,
        name: pdfTitle,
        url: fileUrl,
        type: "pdf",
        carrier: newCarrierName,
        category: pdfCategory,
      };

      // Add to guidelines
      setGuidelines([...guidelines, newDoc]);

      // Add or update carrier
      const existingCarrier = carriers.find((c) => c.name === newCarrierName);
      if (existingCarrier) {
        setCarriers(
          carriers.map((c) =>
            c.id === existingCarrier.id
              ? { ...c, guidelines: [...c.guidelines, newDoc] }
              : c
          )
        );
      } else {
        setCarriers([
          ...carriers,
          {
            id: `carrier-${Date.now()}`,
            name: newCarrierName,
            guidelines: [newDoc],
          },
        ]);
      }

      // Reset form
      setNewCarrierName("");
      setPdfFile(null);
      setPdfTitle("");
      setPdfCategory("");
      setShowAddCarrierDialog(false);
      setActiveTab(newCarrierName);
      toast.success(`${newCarrierName} carrier created successfully`);
    } catch (error) {
      toast.error("Failed to add carrier");
    }
  };

  const handleViewDocument = (doc: GuidelineDocument) => {
    setSelectedDocument(doc);
    setViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setViewerOpen(false);
    setSelectedDocument(null);
  };

  const handleDeleteGuideline = (docId: string, carrierId: string) => {
    setGuidelines(guidelines.filter((d) => d.id !== docId));
    setCarriers(
      carriers.map((c) =>
        c.id === carrierId
          ? { ...c, guidelines: c.guidelines.filter((g) => g.id !== docId) }
          : c
      )
    );
    toast.success("Guideline deleted");
  };

  const getActiveCarrierGuidelines = () => {
    if (activeTab === "all") {
      return guidelines;
    }
    const carrier = carriers.find((c) => c.name === activeTab);
    return carrier ? carrier.guidelines : [];
  };

  const filteredGuidelines = getActiveCarrierGuidelines().filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.carrier?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (doc.category?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesCategory = !selectedCategory || doc.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(
    new Set(getActiveCarrierGuidelines().map((doc) => doc.category).filter(Boolean))
  ) as string[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-[#0D1B3E] mb-2">
            Underwriting Guidelines
          </h2>
          <p className="text-gray-600">
            Access carrier underwriting guidelines, medical requirements, and signature processes
          </p>
        </div>
        <Button
          onClick={() => setShowAddCarrierDialog(true)}
          className="gap-2 bg-[#C9A84C] hover:bg-[#D4AF37] text-[#0D1B3E]"
        >
          <Plus size={18} />
          Add Carrier
        </Button>
      </div>

      {/* Add Carrier Dialog */}
      <Dialog open={showAddCarrierDialog} onOpenChange={setShowAddCarrierDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Carrier</DialogTitle>
            <DialogDescription>Create a new carrier and upload its first guideline</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Carrier Name (e.g., MetLife, Prudential)"
              value={newCarrierName}
              onChange={(e) => setNewCarrierName(e.target.value)}
            />
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
                <FileText className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="text-sm text-gray-600">
                  {pdfFile ? pdfFile.name : "Click to select PDF"}
                </p>
              </label>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAddCarrierDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddCarrier}
                className="bg-[#C9A84C] hover:bg-[#D4AF37] text-[#0D1B3E]"
              >
                Create Carrier
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Carrier Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap gap-2 bg-transparent border-b border-gray-200 h-auto p-0">
          <TabsTrigger
            value="all"
            className="rounded-none border-b-2 data-[state=active]:border-[#C9A84C] data-[state=active]:bg-transparent px-4 py-2"
          >
            All Guidelines
          </TabsTrigger>
          {carriers.map((carrier) => (
            <TabsTrigger
              key={carrier.id}
              value={carrier.name}
              className="rounded-none border-b-2 data-[state=active]:border-[#C9A84C] data-[state=active]:bg-transparent px-4 py-2"
            >
              {carrier.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Search and Filter */}
        <div className="space-y-4 mt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <Input
              placeholder="Search by document name, carrier, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setSelectedCategory(null)}
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              className={
                selectedCategory === null
                  ? "bg-[#C9A84C] hover:bg-[#D4AF37] text-[#0D1B3E]"
                  : ""
              }
            >
              All Documents
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                className={
                  selectedCategory === category
                    ? "bg-[#C9A84C] hover:bg-[#D4AF37] text-[#0D1B3E]"
                    : ""
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Documents Grid */}
        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGuidelines.length > 0 ? (
              filteredGuidelines.map((doc) => (
                <div
                  key={doc.id}
                  className="border border-gray-300 rounded-lg p-4 hover:shadow-lg transition-shadow bg-white"
                >
                  {/* Document Icon and Type */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {doc.type === "pdf" ? (
                        <FileText className="text-red-500" size={24} />
                      ) : (
                        <Play className="text-blue-500" size={24} />
                      )}
                      <span className="text-xs font-semibold text-gray-500 uppercase">
                        {doc.type}
                      </span>
                    </div>
                    {doc.carrier && (
                      <span className="text-xs bg-[#C9A84C]/10 text-[#C9A84C] px-2 py-1 rounded">
                        {doc.carrier}
                      </span>
                    )}
                  </div>

                  {/* Document Name */}
                  <h3 className="font-semibold text-[#0D1B3E] mb-2 line-clamp-2 text-sm">
                    {doc.name}
                  </h3>

                  {/* Category Badge */}
                  {doc.category && (
                    <p className="text-xs text-gray-600 font-medium mb-3">{doc.category}</p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleViewDocument(doc)}
                      size="sm"
                      className="flex-1 bg-[#C9A84C] hover:bg-[#D4AF37] text-[#0D1B3E] font-semibold"
                    >
                      {doc.type === "pdf" ? "View PDF" : "Watch Video"}
                    </Button>
                    <a href={doc.url} download className="flex-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        title="Download document"
                      >
                        <Download size={16} />
                      </Button>
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <FileText className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500">
                  No documents found matching your search
                </p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">{filteredGuidelines.length}</span> of{" "}
              <span className="font-semibold">{getActiveCarrierGuidelines().length}</span> documents
              shown
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Document Viewer Modal */}
      {selectedDocument && selectedDocument.type === "pdf" && (
        <DocumentViewer
          isOpen={viewerOpen}
          onClose={handleCloseViewer}
          documentUrl={selectedDocument.url}
          documentName={selectedDocument.name}
        />
      )}

      {/* Video Player Modal */}
      {selectedDocument && selectedDocument.type === "video" && (
        <VideoPlayer
          isOpen={viewerOpen}
          onClose={handleCloseViewer}
          videoUrl={selectedDocument.url}
          videoName={selectedDocument.name}
        />
      )}
    </div>
  );
}
