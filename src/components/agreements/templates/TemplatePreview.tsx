
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextStyle, Table } from "@/types/agreement.types";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface TemplatePreviewProps {
  content: string;
  missingVariables?: string[];
  textStyle?: TextStyle;
  tables?: Table[];
}

export const TemplatePreview = ({ 
  content, 
  missingVariables = [],
  textStyle = {
    bold: false,
    italic: false,
    underline: false,
    fontSize: 14,
    alignment: 'right'
  },
  tables = []
}: TemplatePreviewProps) => {
  const [pageCount, setPageCount] = useState(1);
  const [processedContent, setProcessedContent] = useState(content);
  const [showSampleData, setShowSampleData] = useState(true);

  // Sample data for preview
  const sampleData = {
    customer: {
      full_name: "John Smith",
      phone_number: "+1 234 567 890",
      address: "123 Main St, City, Country",
      nationality: "United States"
    },
    vehicle: {
      make: "Toyota",
      model: "Camry",
      year: "2023",
      license_plate: "ABC 123",
      vin: "1HGCM82633A123456",
      color: "Silver"
    },
    agreement: {
      agreement_number: "AGR-2024-001",
      start_date: new Date().toLocaleDateString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      rent_amount: "1,500",
      total_amount: "18,000"
    }
  };

  const containsArabic = (text: string) => {
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(text);
  };

  const replaceVariables = (text: string) => {
    if (!showSampleData) return text;
    
    let replacedContent = text;

    // Replace customer variables
    Object.entries(sampleData.customer).forEach(([key, value]) => {
      const pattern = new RegExp(`{{customer.${key}}}`, 'g');
      replacedContent = replacedContent.replace(pattern, value.toString());
    });

    // Replace vehicle variables
    Object.entries(sampleData.vehicle).forEach(([key, value]) => {
      const pattern = new RegExp(`{{vehicle.${key}}}`, 'g');
      replacedContent = replacedContent.replace(pattern, value.toString());
    });

    // Replace agreement variables
    Object.entries(sampleData.agreement).forEach(([key, value]) => {
      const pattern = new RegExp(`{{agreement.${key}}}`, 'g');
      replacedContent = replacedContent.replace(pattern, value.toString());
    });

    return replacedContent;
  };

  const processContent = (text: string) => {
    const isArabic = containsArabic(text);
    const dirAttribute = isArabic ? 'rtl' : 'ltr';

    // First replace variables with sample data if enabled
    let processedText = replaceVariables(text);

    // Then apply styling
    processedText = processedText.replace(
      /<strong>(.*?)<\/strong>/g,
      '<strong class="block text-center mb-4">$1</strong>'
    );

    // Highlight variables differently based on view mode
    processedText = processedText.replace(
      /{{(.*?)}}/g,
      showSampleData 
        ? '<span class="template-variable bg-yellow-100 px-1 rounded border border-yellow-300">{{$1}}</span>'
        : '<span class="template-variable bg-blue-100 px-1 rounded border border-blue-300">{{$1}}</span>'
    );

    // Process section headers
    processedText = processedText.replace(
      /<h1>(.*?)<\/h1>/g,
      '<h1 class="text-2xl font-bold text-gray-900 mb-6 page-break-after-avoid">$1</h1>'
    );
    
    processedText = processedText.replace(
      /<h2>/g,
      '<h2 class="text-xl font-semibold mb-4 text-gray-800 page-break-after-avoid">'
    );

    // Optimize paragraph spacing
    processedText = processedText.replace(
      /<p>/g,
      `<p dir="${dirAttribute}" class="mb-4 leading-relaxed text-justify" style="text-align: ${isArabic ? 'right' : 'left'}">`
    );

    // Optimize list spacing
    processedText = processedText.replace(
      /<ul>/g,
      '<ul class="list-disc list-inside mb-4 space-y-2">'
    );

    processedText = processedText.replace(
      /<ol>/g,
      '<ol class="list-decimal list-inside mb-4 space-y-2">'
    );

    // Enhance table styling
    processedText = processedText.replace(
      /<table/g,
      '<table class="w-full border-collapse mb-6 page-break-inside-avoid"'
    );

    processedText = processedText.replace(
      /<th/g,
      '<th class="border border-gray-300 bg-gray-50 p-3 text-right"'
    );

    processedText = processedText.replace(
      /<td/g,
      '<td class="border border-gray-300 p-3 text-right"'
    );

    return processedText;
  };

  useEffect(() => {
    const processed = processContent(content);
    setProcessedContent(processed);
  }, [content, showSampleData]);

  const isArabic = containsArabic(content);

  const calculatePageCount = (containerRef: HTMLDivElement | null) => {
    if (containerRef) {
      const contentHeight = containerRef.scrollHeight;
      const pageHeight = 297; // A4 height in mm
      const calculatedPages = Math.ceil(contentHeight / pageHeight);
      setPageCount(calculatedPages);
    }
  };

  return (
    <div className="space-y-4 max-h-[80vh]">
      <DialogHeader>
        <div className="flex justify-between items-center">
          <DialogTitle className="text-xl font-semibold">
            {containsArabic(content) ? "معاينة النموذج" : "Template Preview"}
          </DialogTitle>
          <div className="flex items-center space-x-2">
            <Label htmlFor="preview-mode">Show Sample Data</Label>
            <Switch
              id="preview-mode"
              checked={showSampleData}
              onCheckedChange={setShowSampleData}
            />
          </div>
        </div>
      </DialogHeader>
      
      {missingVariables.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {containsArabic(content) ? 
              "المتغيرات التالية مفقودة: " + missingVariables.join("، ") :
              "The following variables are missing: " + missingVariables.join(", ")
            }
          </AlertDescription>
        </Alert>
      )}

      {showSampleData && (
        <div className="bg-yellow-50 p-4 rounded-md">
          <p className="text-sm text-yellow-800">
            Preview is showing sample data. Variables will be replaced with actual data when processing the document.
          </p>
        </div>
      )}

      {!showSampleData && (
        <div className="bg-blue-50 p-4 rounded-md">
          <p className="text-sm text-blue-800">
            Showing raw template with variable placeholders. Switch to sample data view to see how the document will look with actual data.
          </p>
        </div>
      )}
      
      <ScrollArea className="h-[calc(80vh-120px)] w-full rounded-md border">
        <div className="preview-container mx-auto bg-white">
          <div 
            className={cn(
              "a4-page",
              isArabic ? "font-arabic" : "font-serif",
              "leading-relaxed text-gray-700",
              {
                'font-bold': textStyle.bold,
                'italic': textStyle.italic,
                'underline': textStyle.underline,
                'text-left': !isArabic && textStyle.alignment === 'left',
                'text-center': textStyle.alignment === 'center',
                'text-right': isArabic || textStyle.alignment === 'right',
                'text-justify': textStyle.alignment === 'justify'
              }
            )}
            style={{
              direction: isArabic ? 'rtl' : 'ltr',
              fontSize: `${textStyle.fontSize}px`,
              width: '210mm',
              minHeight: '297mm',
              padding: '25mm 25mm 30mm 25mm',
              margin: '0 auto',
              boxSizing: 'border-box',
              backgroundColor: 'white',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)',
              position: 'relative'
            }}
            ref={calculatePageCount}
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
        </div>
      </ScrollArea>
    </div>
  );
};
