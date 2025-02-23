
import { EnhancedAgreementListV2Props } from "./types";
import { AgreementCard } from "./AgreementCard";

export const EnhancedAgreementListV2 = ({
  agreements,
  onViewDetails,
  onDelete,
  viewMode = "grid",
  showLoadingState = false
}: EnhancedAgreementListV2Props) => {
  if (showLoadingState) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[...Array(6)].map((_, index) => (
          <div 
            key={index}
            className="animate-pulse bg-white rounded-lg border border-slate-200/75 p-6 space-y-4"
          >
            <div className="h-6 bg-slate-200 rounded-md w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            </div>
            <div className="flex justify-between pt-4">
              <div className="h-8 bg-slate-200 rounded w-1/4"></div>
              <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={
      viewMode === "grid" 
        ? "grid grid-cols-1 sm:grid-cols-2 gap-6"
        : "space-y-4"
    }>
      {agreements.map((agreement) => (
        <AgreementCard
          key={agreement.id}
          agreement={agreement}
          onViewDetails={onViewDetails}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
