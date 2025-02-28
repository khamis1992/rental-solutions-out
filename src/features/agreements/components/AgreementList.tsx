
import { AgreementCard } from "./AgreementCard";
import { AgreementListProps } from "../types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export function AgreementList({
  agreements = [],
  onViewDetails,
  onDelete,
  viewMode = "grid",
  showLoadingState = false,
  onSelectAgreement,
  selectedAgreements = [],
  onSelectAll
}: AgreementListProps) {
  // Setup keyboard shortcuts
  useHotkeys('shift+a', () => {
    if (onSelectAll) {
      onSelectAll(agreements);
      toast.success(`Selected ${agreements.length} agreements`);
    }
  }, {
    preventDefault: true
  });

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (onSelectAll) {
      if (checked) {
        onSelectAll(agreements);
      } else {
        onSelectAll([]);
      }
    }
  };

  // Check if an agreement is selected
  const isAgreementSelected = (agreementId: string) => {
    return selectedAgreements.some(a => a.id === agreementId);
  };

  if (showLoadingState) {
    return (
      <div className={`grid grid-cols-1 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : ''} gap-4`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="border rounded-lg p-6 space-y-4">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <div className="space-y-2 mt-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (agreements.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <h3 className="text-lg font-medium">No agreements found</h3>
        <p className="text-muted-foreground mt-1">Try adjusting your filters or search criteria</p>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              {onSelectAgreement && (
                <th className="px-4 py-3 text-left w-10">
                  <Checkbox 
                    checked={selectedAgreements.length === agreements.length && agreements.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
              )}
              <th className="px-4 py-3 text-left">Agreement</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Vehicle</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {agreements.map((agreement) => (
              <tr 
                key={agreement.id}
                className="border-b hover:bg-muted/20 transition-colors"
              >
                {onSelectAgreement && (
                  <td className="px-4 py-3">
                    <Checkbox 
                      checked={isAgreementSelected(agreement.id)}
                      onCheckedChange={(checked) => onSelectAgreement(agreement, !!checked)}
                    />
                  </td>
                )}
                <td className="px-4 py-3 font-medium">
                  {agreement.agreement_number || "No Number"}
                </td>
                <td className="px-4 py-3">
                  {agreement.customer?.full_name || "No Customer"}
                </td>
                <td className="px-4 py-3">
                  {agreement.vehicle ? 
                    `${agreement.vehicle.make} ${agreement.vehicle.model}` : 
                    "No Vehicle"}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    agreement.status === 'active' ? 'bg-green-100 text-green-800' :
                    agreement.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {agreement.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {new Intl.NumberFormat('en-US', { 
                    style: 'currency',
                    currency: 'QAR'
                  }).format(agreement.total_amount)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails && onViewDetails(agreement)}
                    >
                      View
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete && onDelete(agreement)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (viewMode === "compact") {
    return (
      <div className="space-y-2">
        {agreements.map((agreement) => (
          <div key={agreement.id} className="flex items-center justify-between border rounded-md p-3 hover:bg-muted/20 transition-colors">
            {onSelectAgreement && (
              <div className="mr-3">
                <Checkbox 
                  checked={isAgreementSelected(agreement.id)}
                  onCheckedChange={(checked) => onSelectAgreement(agreement, !!checked)}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{agreement.agreement_number || "No Number"}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  agreement.status === 'active' ? 'bg-green-100 text-green-800' :
                  agreement.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {agreement.status}
                </span>
              </div>
              <div className="text-sm text-muted-foreground truncate">
                {agreement.customer?.full_name || "No Customer"} | 
                {agreement.vehicle ? 
                  ` ${agreement.vehicle.make} ${agreement.vehicle.model}` : 
                  " No Vehicle"}
              </div>
            </div>
            <div className="shrink-0 ml-4 text-right">
              <div className="font-medium">
                {new Intl.NumberFormat('en-US', { 
                  style: 'currency',
                  currency: 'QAR'
                }).format(agreement.total_amount)}
              </div>
              <div className="flex gap-2 mt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="px-2 h-7"
                  onClick={() => onViewDetails && onViewDetails(agreement)}
                >
                  View
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="px-2 h-7"
                  onClick={() => onDelete && onDelete(agreement)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default to Grid view
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {agreements.map((agreement) => (
        <div key={agreement.id} className="relative">
          {onSelectAgreement && (
            <div className="absolute top-2 left-2 z-10">
              <Checkbox 
                checked={isAgreementSelected(agreement.id)}
                onCheckedChange={(checked) => onSelectAgreement(agreement, !!checked)}
              />
            </div>
          )}
          <AgreementCard 
            agreement={agreement} 
            onViewDetails={onViewDetails}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
}
