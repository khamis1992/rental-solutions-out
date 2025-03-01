
/**
 * AgreementListHeader Component
 * 
 * This component renders the header section for the agreements list page. It includes:
 * - Search functionality for filtering agreements
 * - Action buttons for processing templates, exporting data, and creating new agreements
 * - Dialog triggers for additional functionality
 * 
 * The component is responsible for the top control section of the agreement list interface,
 * providing tools for users to manage and interact with agreement data.
 */

import { Button } from "@/components/ui/button";
import { Upload, Download, FileText } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";
import { ProcessTemplatesDialog } from "@/components/agreements/ProcessTemplatesDialog";
import { useState } from "react";
import { SearchInput } from "@/components/agreements/search/SearchInput";
import { Separator } from "@/components/ui/separator";

/**
 * Interface for AgreementListHeader component props
 * 
 * @property onImportClick - Function to trigger import action
 * @property onDeleteClick - Function to trigger delete action
 * @property isDeleting - Boolean indicating if delete operation is in progress
 * @property searchQuery - Current search query string
 * @property onSearchChange - Function to handle search query changes
 */
interface AgreementListHeaderProps {
  onImportClick: () => void;
  onDeleteClick: () => void;
  isDeleting: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const AgreementListHeader = ({
  onImportClick,
  onDeleteClick,
  isDeleting,
  searchQuery = "",
  onSearchChange
}: AgreementListHeaderProps) => {
  // State to control the visibility of the ProcessTemplates dialog
  const [showProcessTemplates, setShowProcessTemplates] = useState(false);
  
  /**
   * Handles search input changes and invokes the parent component's search handler
   * 
   * @param query - The updated search query string
   */
  const handleSearchChange = (query: string) => {
    console.log("Search input changed:", query);
    if (onSearchChange) {
      onSearchChange(query);
    }
  };
  
  return (
    <>
      {/* ----- Section: Main Header Container ----- */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between w-full mb-6">
        {/* Search input area */}
        <div className="relative w-full max-w-md">
          <SearchInput 
            onSearch={handleSearchChange}
            placeholder="Search agreements..."
            initialValue={searchQuery}
          />
        </div>
        
        {/* ----- Section: Action Buttons ----- */}
        <div className="flex items-center gap-3">
          {/* Process Templates Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="lg" className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 gap-2 group shadow-sm hover:shadow-md h-11" onClick={() => setShowProcessTemplates(true)}>
                  <FileText className="h-5 w-5" />
                  Process Templates
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Process agreement templates</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Export Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="lg" className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 gap-2 group shadow-sm hover:shadow-md h-11">
                  <Download className="h-5 w-5 group-hover:translate-y-[2px] transition-transform duration-300" />
                  Export
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Create Agreement Button/Dialog */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <CreateAgreementDialog>
                  <Button variant="default" size="lg" className="bg-blue-600 hover:bg-blue-700 text-white h-11">
                    <Upload className="h-5 w-5 mr-2" />
                    Create Agreement
                  </Button>
                </CreateAgreementDialog>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create new agreement (⌘ N)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Process Templates Dialog - Conditionally rendered based on state */}
          <ProcessTemplatesDialog open={showProcessTemplates} onOpenChange={setShowProcessTemplates} />
        </div>
      </div>
      
      {/* Separator line between header and content */}
      <Separator className="my-8 h-[2px] bg-gray-200" />
    </>
  );
};
