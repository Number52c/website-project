import { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min?url";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  documentName: string;
}

export default function DocumentViewer({
  isOpen,
  onClose,
  documentUrl,
  documentName,
}: DocumentViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50));
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Load PDF on open
  useEffect(() => {
    if (!isOpen) return;

    const loadPdf = async () => {
      try {
        setIsLoading(true);
        const loadingTask = pdfjsLib.getDocument({ url: documentUrl });
        const pdfDoc = await loadingTask.promise;
        setPdf(pdfDoc);
        setTotalPages(pdfDoc.numPages);
        setCurrentPage(1);
        setZoom(100);
      } catch (error) {
        console.error("Error loading PDF:", error);
        setIsLoading(false);
      }
    };

    loadPdf();
  }, [isOpen, documentUrl]);

  // Render current page
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        setIsLoading(true);
        const page = await pdf.getPage(currentPage);
        const scale = zoom / 100;
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        };

        await page.render(renderContext as any).promise;
        setIsLoading(false);
      } catch (error) {
        console.error("Error rendering page:", error);
        setIsLoading(false);
      }
    };

    renderPage();
  }, [pdf, currentPage, zoom]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-900">
        <div className="flex-1">
          <h2 className="text-white text-lg font-semibold truncate">
            {documentName}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors p-2"
        >
          <X size={24} />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-700 bg-slate-800/50 flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="text-sm text-slate-300 px-3 min-w-[120px] text-center">
            Page {currentPage} of {totalPages || "..."}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <ChevronRight size={16} />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <ZoomOut size={16} />
          </Button>
          <span className="text-sm text-slate-300 px-3 min-w-[60px] text-center">
            {zoom}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <ZoomIn size={16} />
          </Button>

          <div className="w-px h-6 bg-slate-600 mx-2" />

          <a href={documentUrl} download={documentName}>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <Download size={16} className="mr-1" />
              Download
            </Button>
          </a>
        </div>
      </div>

      {/* PDF Viewer - Full Screen */}
      <div className="flex-1 overflow-auto bg-slate-950 flex items-center justify-center p-4">
        {isLoading && (
          <div className="text-slate-400 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border border-slate-600 border-t-[#C9A84C] mx-auto mb-4" />
            <p className="text-lg">Loading document...</p>
          </div>
        )}

        {/* Canvas for PDF rendering */}
        <div className="flex items-center justify-center max-w-full max-h-full overflow-auto">
          <canvas
            ref={canvasRef}
            className="border border-slate-600 rounded shadow-lg"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-6 py-3 border-t border-slate-700 bg-slate-800/50 text-xs text-slate-400">
        <p>
          💡 Tip: Use the toolbar above to navigate pages, zoom in/out, and download the document. Press ESC or click the X to close.
        </p>
      </div>
    </div>
  );
}
