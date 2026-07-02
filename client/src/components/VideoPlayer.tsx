import { useState } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  videoName: string;
}

export default function VideoPlayer({
  isOpen,
  onClose,
  videoUrl,
  videoName,
}: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-slate-900 border-slate-700 p-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex-1">
            <DialogTitle className="text-white text-lg truncate">
              {videoName}
            </DialogTitle>
          </div>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white"
            >
              <X size={20} />
            </Button>
          </DialogClose>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center justify-end px-6 py-3 border-b border-slate-700 bg-slate-800/50 gap-2">
          <a href={videoUrl} download={videoName}>
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

        {/* Video Player */}
        <div className="flex-1 overflow-auto bg-slate-950 flex items-center justify-center p-4">
          {isLoading && (
            <div className="absolute text-slate-400 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border border-slate-600 border-t-[#C9A84C] mx-auto mb-2" />
              <p>Loading video...</p>
            </div>
          )}

          <video
            controls
            className="w-full h-full max-w-full max-h-full rounded-lg bg-black"
            onLoadedMetadata={() => setIsLoading(false)}
            onCanPlay={() => setIsLoading(false)}
          >
            <source src={videoUrl} type="video/mp4" />
            <p className="text-slate-300">
              Your browser does not support the video tag. Please{" "}
              <a href={videoUrl} download className="text-[#C9A84C] underline">
                download the video
              </a>
              .
            </p>
          </video>
        </div>

        {/* Footer Info */}
        <div className="px-6 py-3 border-t border-slate-700 bg-slate-800/50 text-xs text-slate-400">
          <p>
            Tip: Use the video player controls to play, pause, adjust volume, and fullscreen.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
