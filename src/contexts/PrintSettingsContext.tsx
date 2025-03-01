
/**
 * PrintSettingsContext
 * 
 * This context provides configuration and control for document printing throughout the application.
 * It manages print-related settings like paper size, orientation, margins, and other print options.
 * 
 * The context includes functions to update settings and apply them when printing documents,
 * ensuring consistent printing behavior across the application.
 */

import React, { createContext, useContext, useState, ReactNode } from "react";

/**
 * Types for print settings options
 */
export type PaperSize = "a4" | "letter" | "legal";
export type Orientation = "portrait" | "landscape";
export type ColorMode = "color" | "bw";

/**
 * Interface defining the structure of print settings
 */
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

/**
 * Interface for the context value provided to consumers
 */
interface PrintSettingsContextType {
  settings: PrintSettings;
  updateSettings: (settings: Partial<PrintSettings>) => void;
  applyPrintSettings: () => void;
}

/**
 * Default print settings values
 */
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

// Create the context with undefined initial value
const PrintSettingsContext = createContext<PrintSettingsContextType | undefined>(undefined);

/**
 * Provider component for print settings
 * 
 * @param children - Child components that will have access to print settings
 */
export const PrintSettingsProvider = ({ children }: { children: ReactNode }) => {
  // State to store the current print settings
  const [settings, setSettings] = useState<PrintSettings>(defaultSettings);

  /**
   * Updates print settings with partial new values
   * 
   * @param newSettings - Partial settings to update
   */
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

  /**
   * Applies the current print settings by injecting CSS into the document
   * This affects how the browser will render the document when printing
   */
  const applyPrintSettings = () => {
    // Create a style element for print-specific CSS
    const style = document.createElement("style");
    style.id = "print-settings-style";
    
    // Remove any existing print settings style
    const existingStyle = document.getElementById("print-settings-style");
    if (existingStyle) {
      existingStyle.remove();
    }

    // ----- Section: Print CSS Generation -----
    // Generate CSS content based on current settings
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

    // Add the CSS to the style element and inject it into the document
    style.textContent = cssContent;
    document.head.appendChild(style);
  };

  // Context value to provide to consumers
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

/**
 * Custom hook to access the print settings context
 * 
 * @returns The print settings context value
 * @throws Error if used outside of a PrintSettingsProvider
 */
export const usePrintSettings = () => {
  const context = useContext(PrintSettingsContext);
  if (context === undefined) {
    throw new Error("usePrintSettings must be used within a PrintSettingsProvider");
  }
  return context;
};
