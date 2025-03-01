
import { useState } from "react";
import { usePrintSettings, PaperSize, Orientation, ColorMode } from "@/contexts/PrintSettingsContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

interface NewPrintSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrint: () => void;
}

export function NewPrintSettingsDialog({ 
  open, 
  onOpenChange,
  onPrint
}: NewPrintSettingsDialogProps) {
  const { settings, updateSettings, applyPrintSettings } = usePrintSettings();
  const [localSettings, setLocalSettings] = useState({ ...settings });
  
  const handleApplySettings = () => {
    updateSettings(localSettings);
    applyPrintSettings();
    onPrint();
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalSettings({ ...settings });
    onOpenChange(false);
  };

  const updateLocalSettings = (key: string, value: any) => {
    setLocalSettings(prev => {
      if (key.includes('.')) {
        const [parent, child] = key.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent as keyof typeof prev],
            [child]: value
          }
        };
      }
      return { ...prev, [key]: value };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Print Settings</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="paperSize" className="text-right">Paper Size</Label>
            <Select 
              value={localSettings.paperSize}
              onValueChange={(value) => updateLocalSettings('paperSize', value as PaperSize)}
              className="col-span-3"
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
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="orientation" className="text-right">Orientation</Label>
            <Select 
              value={localSettings.orientation}
              onValueChange={(value) => updateLocalSettings('orientation', value as Orientation)}
              className="col-span-3"
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
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="colorMode" className="text-right">Color Mode</Label>
            <Select 
              value={localSettings.colorMode}
              onValueChange={(value) => updateLocalSettings('colorMode', value as ColorMode)}
              className="col-span-3"
            >
              <SelectTrigger id="colorMode">
                <SelectValue placeholder="Select color mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="color">Color</SelectItem>
                <SelectItem value="bw">Black & White</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Scale (%)</Label>
            <div className="col-span-3 flex items-center gap-4">
              <Slider 
                value={[localSettings.scale]} 
                min={50} 
                max={150} 
                step={1}
                onValueChange={(value) => updateLocalSettings('scale', value[0])}
                className="flex-1"
              />
              <span className="w-12 text-center">{localSettings.scale}%</span>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Show Header/Footer</Label>
            <div className="flex items-center space-x-2 col-span-3">
              <Switch 
                checked={localSettings.showHeaderFooter}
                onCheckedChange={(checked) => updateLocalSettings('showHeaderFooter', checked)}
              />
              <span>{localSettings.showHeaderFooter ? 'Yes' : 'No'}</span>
            </div>
          </div>
          
          <div className="col-span-4">
            <h3 className="text-sm font-medium mb-2">Margins (mm)</h3>
            <div className="grid grid-cols-4 gap-2">
              <div className="space-y-1">
                <Label htmlFor="marginTop" className="text-xs">Top</Label>
                <Input 
                  id="marginTop"
                  type="number" 
                  value={localSettings.margins.top}
                  onChange={(e) => updateLocalSettings('margins.top', parseInt(e.target.value))}
                  min={0}
                  max={100}
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="marginRight" className="text-xs">Right</Label>
                <Input 
                  id="marginRight"
                  type="number" 
                  value={localSettings.margins.right}
                  onChange={(e) => updateLocalSettings('margins.right', parseInt(e.target.value))}
                  min={0}
                  max={100}
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="marginBottom" className="text-xs">Bottom</Label>
                <Input 
                  id="marginBottom"
                  type="number" 
                  value={localSettings.margins.bottom}
                  onChange={(e) => updateLocalSettings('margins.bottom', parseInt(e.target.value))}
                  min={0}
                  max={100}
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="marginLeft" className="text-xs">Left</Label>
                <Input 
                  id="marginLeft"
                  type="number" 
                  value={localSettings.margins.left}
                  onChange={(e) => updateLocalSettings('margins.left', parseInt(e.target.value))}
                  min={0}
                  max={100}
                  className="h-8"
                />
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleApplySettings}>
            Apply & Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
