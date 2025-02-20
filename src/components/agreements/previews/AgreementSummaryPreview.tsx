
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { UseFormWatch } from "react-hook-form";
import { AgreementFormData } from "../hooks/useAgreementForm";
import { Vehicle } from "@/types/vehicle";
import { formatCurrency } from "@/lib/utils";

interface AgreementSummaryPreviewProps {
  watch: UseFormWatch<AgreementFormData>;
  selectedVehicle?: Vehicle | null;
  customerName?: string;
}

export function AgreementSummaryPreview({
  watch,
  selectedVehicle,
  customerName,
}: AgreementSummaryPreviewProps) {
  const agreementType = watch("agreementType");
  const rentAmount = watch("rentAmount");
  const agreementDuration = watch("agreementDuration");
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const dailyLateFee = watch("dailyLateFee");
  const finalPrice = watch("finalPrice");

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Agreement Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-medium mb-2">Agreement Details</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Type</dt>
                <dd className="font-medium capitalize">
                  {agreementType?.replace(/_/g, " ")}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Duration</dt>
                <dd className="font-medium">{agreementDuration} months</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Start Date</dt>
                <dd className="font-medium">
                  {startDate ? format(new Date(startDate), "PPP") : "Not set"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">End Date</dt>
                <dd className="font-medium">
                  {endDate ? format(new Date(endDate), "PPP") : "Not set"}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="font-medium mb-2">Financial Details</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Monthly Rent</dt>
                <dd className="font-medium">{formatCurrency(rentAmount || 0)}</dd>
              </div>
              {agreementType === "lease_to_own" && (
                <div>
                  <dt className="text-muted-foreground">Final Price</dt>
                  <dd className="font-medium">{formatCurrency(finalPrice || 0)}</dd>
                </div>
              )}
              <div>
                <dt className="text-muted-foreground">Daily Late Fee</dt>
                <dd className="font-medium">{formatCurrency(dailyLateFee || 0)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Total Duration Cost</dt>
                <dd className="font-medium">
                  {formatCurrency((rentAmount || 0) * (agreementDuration || 0))}
                </dd>
              </div>
            </dl>
          </div>

          {selectedVehicle && (
            <div>
              <h3 className="font-medium mb-2">Vehicle Details</h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Vehicle</dt>
                  <dd className="font-medium">
                    {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">License Plate</dt>
                  <dd className="font-medium">{selectedVehicle.license_plate}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">VIN</dt>
                  <dd className="font-medium">{selectedVehicle.vin}</dd>
                </div>
              </dl>
            </div>
          )}

          {customerName && (
            <div>
              <h3 className="font-medium mb-2">Customer Details</h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Customer Name</dt>
                  <dd className="font-medium">{customerName}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
