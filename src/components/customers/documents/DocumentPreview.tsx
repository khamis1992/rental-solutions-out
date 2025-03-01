
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ZoomIn, RotateCw } from "lucide-react";

interface DocumentPreviewProps {
  fileUrl?: string | null;
  fileName: string;
  onClose: () => void;
  open: boolean;
}

export function DocumentPreview({
  fileUrl,
  fileName,
  onClose,
  open
}: DocumentPreviewProps) {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoom = () => {
    setZoom((prev) => (prev === 1 ? 1.5 : 1));
  };

  const isImage = fileUrl?.match(/\.(jpg|jpeg|png|gif)$/i);
  const isPDF = fileUrl?.match(/\.pdf$/i);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>{fileName}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleRotate}>
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleZoom}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {isImage && fileUrl && (
            <img
              src={fileUrl}
              alt={fileName}
              className="max-w-full h-auto mx-auto transition-transform"
              style={{
                transform: `rotate(${rotation}deg) scale(${zoom})`,
              }}
            />
          )}
          {isPDF && fileUrl && (
            <iframe
              src={fileUrl}
              className="w-full h-full border-0"
              title={fileName}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
