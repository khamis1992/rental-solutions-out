
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ZoomIn, RotateCw, AlertCircle, FileText } from "lucide-react";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reset states when dialog opens or file changes
    if (open) {
      setError(false);
      setLoading(true);
      setRotation(0);
      setZoom(1);
    }
  }, [open, fileUrl]);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoom = () => {
    setZoom((prev) => (prev === 1 ? 1.5 : 1));
  };

  const handleImageError = () => {
    setError(true);
    setLoading(false);
  };

  const handleLoadSuccess = () => {
    setLoading(false);
    setError(false);
  };

  const isImage = fileUrl?.match(/\.(jpg|jpeg|png|gif)$/i);
  const isPDF = fileUrl?.match(/\.pdf$/i);
  const isValidUrl = fileUrl && (fileUrl.startsWith('http://') || fileUrl.startsWith('https://'));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span className="truncate max-w-[300px]">{fileName}</span>
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
          {loading && !error && (
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading document...</p>
            </div>
          )}
          
          {error ? (
            <div className="text-center p-8">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Document Not Found</h3>
              <p className="text-muted-foreground">
                The document could not be loaded. Please check if the file exists and has proper permissions.
              </p>
            </div>
          ) : !isValidUrl ? (
            <div className="text-center p-8">
              <FileText className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Invalid Document URL</h3>
              <p className="text-muted-foreground">
                The document URL is invalid or missing. Please ensure a valid URL was provided.
              </p>
            </div>
          ) : isImage ? (
            <img
              src={fileUrl}
              alt={fileName}
              className="max-w-full h-auto mx-auto transition-transform"
              style={{
                transform: `rotate(${rotation}deg) scale(${zoom})`,
              }}
              onError={handleImageError}
              onLoad={handleLoadSuccess}
            />
          ) : isPDF ? (
            <iframe
              src={fileUrl}
              className="w-full h-full border-0"
              title={fileName}
              onLoad={handleLoadSuccess}
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
