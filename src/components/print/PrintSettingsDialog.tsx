
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { PaperSize, Orientation, ColorMode, usePrintSettings } from "@/contexts/PrintSettingsContext";

interface PrintSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrint?: () => void;
}

export function PrintSettingsDialog({ open, onOpenChange, onPrint }: PrintSettingsDialogProps) {
  const { settings, updateSettings, applyPrintSettings } = usePrintSettings();
  const [localSettings, setLocalSettings] = useState(settings);

  // Reset local settings when dialog opens
  useState(() => {
    if (open) {
      setLocalSettings(settings);
    }
  });

  const handlePrint = () => {
    updateSettings(localSettings);
    applyPrintSettings();
    onOpenChange(false);
    
    // Add a small delay before printing
    setTimeout(() => {
      if (onPrint) {
        onPrint();
      } else {
        window.print();
      }
    }, 200);
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    onOpenChange(false);
  };

  const updateLocalSettings = (update: Partial<typeof localSettings>) => {
    setLocalSettings(prev => ({
      ...prev,
      ...update,
      margins: {
        ...prev.margins,
        ...(update.margins || {}),
      },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Print Settings</DialogTitle>
          <DialogDescription>
            Customize how your document will be printed
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paperSize">Paper Size</Label>
              <Select 
                value={localSettings.paperSize} 
                onValueChange={(value: PaperSize) => updateLocalSettings({ paperSize: value })}
              >
                <SelectTrigger id="paperSize">
                  <SelectValue placeholder="Select Paper Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a4">A4</SelectItem>
                  <SelectItem value="letter">Letter</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orientation">Orientation</Label>
              <Select 
                value={localSettings.orientation} 
                onValueChange={(value: Orientation) => updateLocalSettings({ orientation: value })}
              >
                <SelectTrigger id="orientation">
                  <SelectValue placeholder="Select Orientation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Margins (mm)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="marginTop" className="text-xs">Top</Label>
                <Input
                  id="marginTop"
                  type="number"
                  min="0"
                  max="100"
                  value={localSettings.margins.top}
                  onChange={(e) => updateLocalSettings({
                    margins: { top: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="marginRight" className="text-xs">Right</Label>
                <Input
                  id="marginRight"
                  type="number"
                  min="0"
                  max="100"
                  value={localSettings.margins.right}
                  onChange={(e) => updateLocalSettings({
                    margins: { right: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="marginBottom" className="text-xs">Bottom</Label>
                <Input
                  id="marginBottom"
                  type="number"
                  min="0"
                  max="100"
                  value={localSettings.margins.bottom}
                  onChange={(e) => updateLocalSettings({
                    margins: { bottom: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="marginLeft" className="text-xs">Left</Label>
                <Input
                  id="marginLeft"
                  type="number"
                  min="0"
                  max="100"
                  value={localSettings.margins.left}
                  onChange={(e) => updateLocalSettings({
                    margins: { left: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="colorMode">Color Mode</Label>
            <Select 
              value={localSettings.colorMode} 
              onValueChange={(value: ColorMode) => updateLocalSettings({ colorMode: value })}
            >
              <SelectTrigger id="colorMode">
                <SelectValue placeholder="Select Color Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="color">Color</SelectItem>
                <SelectItem value="bw">Black & White</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scale">Scale ({localSettings.scale}%)</Label>
            <Slider
              id="scale"
              min={50}
              max={150}
              step={5}
              value={[localSettings.scale]}
              onValueChange={(value) => updateLocalSettings({ scale: value[0] })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="showHeaderFooter"
              checked={localSettings.showHeaderFooter}
              onCheckedChange={(checked) => updateLocalSettings({ showHeaderFooter: checked })}
            />
            <Label htmlFor="showHeaderFooter">Show Header & Footer</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handlePrint}>
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
