
import React, { createContext, useContext, useState, ReactNode } from "react";

export type PaperSize = "a4" | "letter" | "legal";
export type Orientation = "portrait" | "landscape";
export type ColorMode = "color" | "bw";

export interface PrintSettings {
  paperSize: PaperSize;
  orientation: Orientation;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  colorMode: ColorMode;
  showHeaderFooter: boolean;
  scale: number;
}

interface PrintSettingsContextType {
  settings: PrintSettings;
  updateSettings: (settings: Partial<PrintSettings>) => void;
  applyPrintSettings: () => void;
}

const defaultSettings: PrintSettings = {
  paperSize: "a4",
  orientation: "portrait",
  margins: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
  },
  colorMode: "color",
  showHeaderFooter: true,
  scale: 100,
};

const PrintSettingsContext = createContext<PrintSettingsContextType | undefined>(undefined);

export const PrintSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<PrintSettings>(defaultSettings);

  const updateSettings = (newSettings: Partial<PrintSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
      margins: {
        ...prev.margins,
        ...(newSettings.margins || {}),
      },
    }));
  };

  const applyPrintSettings = () => {
    const style = document.createElement("style");
    style.id = "print-settings-style";
    
    // Remove any existing print settings style
    const existingStyle = document.getElementById("print-settings-style");
    if (existingStyle) {
      existingStyle.remove();
    }

    const cssContent = `
      @media print {
        @page {
          size: ${settings.paperSize} ${settings.orientation};
          margin: ${settings.margins.top}mm ${settings.margins.right}mm ${settings.margins.bottom}mm ${settings.margins.left}mm;
        }
        
        body {
          ${settings.colorMode === "bw" ? "filter: grayscale(100%);" : ""}
          transform: scale(${settings.scale / 100});
          transform-origin: top left;
        }
        
        ${!settings.showHeaderFooter ? `
          @page { 
            margin-header: 0;
            margin-footer: 0;
          }
          
          header, footer, .header-content, .footer-content {
            display: none !important;
          }
        ` : ""}
      }
    `;

    style.textContent = cssContent;
    document.head.appendChild(style);
  };

  return (
    <PrintSettingsContext.Provider
      value={{
        settings,
        updateSettings,
        applyPrintSettings,
      }}
    >
      {children}
    </PrintSettingsContext.Provider>
  );
};

export const usePrintSettings = () => {
  const context = useContext(PrintSettingsContext);
  if (context === undefined) {
    throw new Error("usePrintSettings must be used within a PrintSettingsProvider");
  }
  return context;
};
