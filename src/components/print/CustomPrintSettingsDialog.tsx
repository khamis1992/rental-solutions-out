
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { usePrintSettings, PaperSize, Orientation, ColorMode } from "@/contexts/PrintSettingsContext";

interface PrintSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrint: () => void;
}

export function CustomPrintSettingsDialog({
  open,
  onOpenChange,
  onPrint
}: PrintSettingsDialogProps) {
  const { settings, updateSettings, applyPrintSettings } = usePrintSettings();
  const [marginTop, setMarginTop] = useState(settings.margins.top);
  const [marginRight, setMarginRight] = useState(settings.margins.right);
  const [marginBottom, setMarginBottom] = useState(settings.margins.bottom);
  const [marginLeft, setMarginLeft] = useState(settings.margins.left);
  const [scale, setScale] = useState(settings.scale);

  // Sync local state with context when dialog opens
  useEffect(() => {
    if (open) {
      setMarginTop(settings.margins.top);
      setMarginRight(settings.margins.right);
      setMarginBottom(settings.margins.bottom);
      setMarginLeft(settings.margins.left);
      setScale(settings.scale);
    }
  }, [open, settings]);

  const handlePrint = () => {
    // Apply updated margin settings to context before printing
    updateSettings({
      margins: {
        top: marginTop,
        right: marginRight,
        bottom: marginBottom,
        left: marginLeft
      },
      scale
    });
    
    // Apply print settings
    applyPrintSettings();
    
    // Close dialog
    onOpenChange(false);
    
    // Trigger print
    onPrint();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Print Settings</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paperSize">Paper Size</Label>
              <Select 
                value={settings.paperSize} 
                onValueChange={(value: PaperSize) => updateSettings({ paperSize: value })}
              >
                <SelectTrigger id="paperSize">
                  <SelectValue placeholder="Select paper size" />
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
                value={settings.orientation} 
                onValueChange={(value: Orientation) => updateSettings({ orientation: value })}
              >
                <SelectTrigger id="orientation">
                  <SelectValue placeholder="Select orientation" />
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
                <div className="flex items-center space-x-2">
                  <Slider 
                    id="marginTop"
                    min={0} 
                    max={50} 
                    step={1} 
                    value={[marginTop]} 
                    onValueChange={(value) => setMarginTop(value[0])}
                  />
                  <span className="text-sm w-8">{marginTop}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="marginRight" className="text-xs">Right</Label>
                <div className="flex items-center space-x-2">
                  <Slider 
                    id="marginRight"
                    min={0} 
                    max={50} 
                    step={1} 
                    value={[marginRight]} 
                    onValueChange={(value) => setMarginRight(value[0])}
                  />
                  <span className="text-sm w-8">{marginRight}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="marginBottom" className="text-xs">Bottom</Label>
                <div className="flex items-center space-x-2">
                  <Slider 
                    id="marginBottom"
                    min={0} 
                    max={50} 
                    step={1} 
                    value={[marginBottom]} 
                    onValueChange={(value) => setMarginBottom(value[0])}
                  />
                  <span className="text-sm w-8">{marginBottom}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="marginLeft" className="text-xs">Left</Label>
                <div className="flex items-center space-x-2">
                  <Slider 
                    id="marginLeft"
                    min={0} 
                    max={50} 
                    step={1} 
                    value={[marginLeft]} 
                    onValueChange={(value) => setMarginLeft(value[0])}
                  />
                  <span className="text-sm w-8">{marginLeft}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="scale">Scale (%)</Label>
            <div className="flex items-center space-x-2">
              <Slider 
                id="scale"
                min={50} 
                max={150} 
                step={5} 
                value={[scale]} 
                onValueChange={(value) => setScale(value[0])}
              />
              <span className="text-sm w-8">{scale}%</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="colorMode">Color Mode</Label>
              <Select 
                value={settings.colorMode} 
                onValueChange={(value: ColorMode) => updateSettings({ colorMode: value })}
              >
                <SelectTrigger id="colorMode" className="w-32">
                  <SelectValue placeholder="Select color mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="color">Color</SelectItem>
                  <SelectItem value="bw">Black & White</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="showHeaderFooter" 
              checked={settings.showHeaderFooter}
              onCheckedChange={(checked) => updateSettings({ showHeaderFooter: checked })}
            />
            <Label htmlFor="showHeaderFooter">Show header and footer</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
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
