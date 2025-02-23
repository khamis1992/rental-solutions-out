
import { type Agreement } from "@/types/agreement.types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/dateUtils";

interface CustomAgreementListProps {
  agreements: Agreement[];
  onViewDetails: (agreement: Agreement) => void;
  onViewTemplate?: (agreement: Agreement) => void;
  onDelete?: (agreement: Agreement) => void;
  viewMode?: 'grid' | 'list';
}

export const CustomAgreementList = ({
  agreements,
  onViewDetails,
  onViewTemplate,
  onDelete,
  viewMode = 'grid'
}: CustomAgreementListProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!agreements?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No agreements found</p>
      </div>
    );
  }

  return (
    <div className={viewMode === 'grid' ? 
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : 
      "flex flex-col gap-4"
    }>
      {agreements.map((agreement) => (
        <Card 
          key={agreement.id}
          className={`overflow-hidden ${
            viewMode === 'list' ? 'flex items-center justify-between p-4' : ''
          }`}
        >
          <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {agreement.agreement_number || 'No Number'}
                </Badge>
                <Badge className={getStatusColor(agreement.status)}>
                  {agreement.status}
                </Badge>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewDetails(agreement)}>
                    View Details
                  </DropdownMenuItem>
                  {onViewTemplate && (
                    <DropdownMenuItem onClick={() => onViewTemplate(agreement)}>
                      View Template
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDelete(agreement)}
                    >
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Content */}
            <div className="space-y-2">
              {/* Vehicle Info */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Vehicle:</span>
                <span className="text-sm">
                  {agreement.vehicle ? 
                    `${agreement.vehicle.year} ${agreement.vehicle.make} ${agreement.vehicle.model}` :
                    'No vehicle assigned'
                  }
                </span>
              </div>

              {/* Customer Info */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Customer:</span>
                <span className="text-sm">
                  {agreement.customer?.full_name || 'No customer assigned'}
                </span>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Start Date</p>
                  <p className="text-sm">
                    {agreement.start_date ? 
                      formatDate(agreement.start_date) :
                      'Not set'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">End Date</p>
                  <p className="text-sm">
                    {agreement.end_date ? 
                      formatDate(agreement.end_date) :
                      'Not set'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            {viewMode !== 'list' && (
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewTemplate?.(agreement)}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Template
                </Button>
                {onDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(agreement)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
