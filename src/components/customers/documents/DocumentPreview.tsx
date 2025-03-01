
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ZoomIn, RotateCw, AlertCircle } from "lucide-react";

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
  const [error, setError] = useState(false);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoom = () => {
    setZoom((prev) => (prev === 1 ? 1.5 : 1));
  };

  const handleImageError = () => {
    setError(true);
  };

  // Reset error state when dialog opens with new file
  if (!open && error) {
    setError(false);
  }

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

        <div className="flex-1 overflow-auto flex items-center justify-center">
          {error ? (
            <div className="text-center p-8">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Document Not Found</h3>
              <p className="text-muted-foreground">
                The document could not be loaded. Please check if the file exists and has proper permissions.
              </p>
            </div>
          ) : isImage && fileUrl ? (
            <img
              src={fileUrl}
              alt={fileName}
              className="max-w-full h-auto mx-auto transition-transform"
              style={{
                transform: `rotate(${rotation}deg) scale(${zoom})`,
              }}
              onError={handleImageError}
            />
          ) : isPDF && fileUrl ? (
            <iframe
              src={fileUrl}
              className="w-full h-full border-0"
              title={fileName}
              onLoad={() => setError(false)}
              onError={handleImageError}
            />
          ) : (
            <div className="text-center p-8">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Unsupported Document Format</h3>
              <p className="text-muted-foreground">
                This document type cannot be previewed. Only images and PDFs are supported.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
