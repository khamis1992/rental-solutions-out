
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentForm } from "./details/PaymentForm";
import { InvoiceList } from "./details/InvoiceList";
import { DocumentUpload } from "./details/DocumentUpload";
import { DamageAssessment } from "./details/DamageAssessment";
import { TrafficFines } from "./details/TrafficFines";
import { AgreementHeader } from "./AgreementHeader";
import { CustomerInfoCard } from "./details/CustomerInfoCard";
import { VehicleInfoCard } from "./details/VehicleInfoCard";
import { PaymentHistory } from "./details/PaymentHistory";
import { useAgreementDetails } from "./hooks/useAgreementDetails";
import { LeaseStatus } from "@/types/agreement.types";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { DateInput } from "@/components/ui/date-input";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { calculateDuration, calculateContractValue } from "./utils/agreementCalculations";
import { AgreementStatusSelect } from "./details/AgreementStatusSelect";
import { formatDateToDisplay, parseDateFromDisplay, formatDateForApi } from "@/lib/dateUtils";
import { 
  CalendarDays, 
  Calendar,
  CreditCard, 
  Receipt, 
  FileText, 
  ShieldAlert, 
  Car, 
  AlertTriangle,
  Clock,
  BadgeDollarSign,
  CalendarIcon,
  CircleDollarSign,
  UserCheck,
  FileCheck,
  Activity,
  TrendingUp,
  Timer,
  Mail,
  Phone,
  Hourglass,
  Banknote // Changed from BankNote to Banknote
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AgreementDetailsDialogProps {
  agreementId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AgreementDetailsDialog = ({
  agreementId,
  open,
  onOpenChange,
}: AgreementDetailsDialogProps) => {
  const { agreement, isLoading, refetch } = useAgreementDetails(agreementId, open);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [duration, setDuration] = useState(0);
  const [contractValue, setContractValue] = useState(0);
  const [rentAmount, setRentAmount] = useState<number>(0);

  useEffect(() => {
    if (agreement) {
      const start = agreement.start_date ? formatDateToDisplay(new Date(agreement.start_date)) : "";
      const end = agreement.end_date ? formatDateToDisplay(new Date(agreement.end_date)) : "";
      
      setStartDate(start);
      setEndDate(end);
      setRentAmount(Number(agreement.rent_amount) || 0);
      
      if (start && end) {
        const calculatedDuration = calculateDuration(start, end);
        setDuration(calculatedDuration);
        
        if (agreement.rent_amount) {
          const rentAmountValue = Number(agreement.rent_amount);
          const calculatedValue = calculateContractValue(rentAmountValue, calculatedDuration);
          setContractValue(calculatedValue);
        }
      }
    }
  }, [agreement]);

  const handleDateChange = async (start: string, end: string) => {
    if (!start || !end) return;

    const startDateObj = parseDateFromDisplay(start);
    const endDateObj = parseDateFromDisplay(end);

    if (!startDateObj || !endDateObj) {
      toast.error("Invalid date format. Please use DD/MM/YYYY");
      return;
    }

    if (startDateObj > endDateObj) {
      toast.error("Start date cannot be after end date");
      return;
    }

    const newDuration = calculateDuration(start, end);
    setDuration(newDuration);
    
    const newContractValue = calculateContractValue(rentAmount, newDuration);
    setContractValue(newContractValue);

    try {
      const { error } = await supabase
        .from('leases')
        .update({
          start_date: formatDateForApi(startDateObj),
          end_date: formatDateForApi(endDateObj),
          agreement_duration: `${newDuration} months`
        })
        .eq('id', agreementId);

      if (error) throw error;
      toast.success("Dates updated successfully");
    } catch (error) {
      console.error('Error updating dates:', error);
      toast.error('Failed to update dates');
    }
  };

  const handleRentAmountChange = async (value: string) => {
    const newRentAmount = Number(value);
    
    if (isNaN(newRentAmount) || newRentAmount < 0) {
      toast.error("Please enter a valid rent amount");
      return;
    }

    setRentAmount(newRentAmount);
    const newContractValue = calculateContractValue(newRentAmount, duration);
    setContractValue(newContractValue);

    try {
      const { error } = await supabase
        .from('leases')
        .update({
          rent_amount: newRentAmount
        })
        .eq('id', agreementId);

      if (error) throw error;
      toast.success("Rent amount updated successfully");
      refetch();
    } catch (error) {
      console.error('Error updating rent amount:', error);
      toast.error('Failed to update rent amount');
    }
  };

  const handleStatusChange = () => {
    refetch();
  };

  if (!open) return null;

  const remainingAmount = agreement?.remainingAmount?.[0]?.remaining_amount ?? 0;
  const paymentProgress = agreement ? ((contractValue - remainingAmount) / contractValue) * 100 : 0;

  const mappedAgreement = agreement ? {
    id: agreement.id,
    agreement_number: agreement.agreement_number || '',
    status: agreement.status as LeaseStatus,
    start_date: agreement.start_date || '',
    end_date: agreement.end_date || '',
    rent_amount: rentAmount,
    contractValue: contractValue,
    remainingAmount: remainingAmount
  } : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6 text-blue-600" />
            Agreement Details
          </DialogTitle>
          <DialogDescription className="text-base">
            View and manage agreement details, payments, and related information.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Clock className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : agreement ? (
          <div className="space-y-6">
            <div className="flex justify-between items-start gap-4">
              <AgreementHeader 
                agreement={mappedAgreement}
                remainingAmount={remainingAmount}
              />
              <AgreementStatusSelect
                agreementId={agreement.id}
                currentStatus={agreement.status as LeaseStatus}
                onStatusChange={handleStatusChange}
              />
            </div>

            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Agreement Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Payment Progress</span>
                    <span>{paymentProgress.toFixed(1)}%</span>
                  </div>
                  <Progress value={paymentProgress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Timer className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold">Agreement Period</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <DateInput
                        label={
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>Start Date</span>
                          </div>
                        }
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          handleDateChange(e.target.value, endDate);
                        }}
                      />
                      <DateInput
                        label={
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>End Date</span>
                          </div>
                        }
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          handleDateChange(startDate, e.target.value);
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold">Financial Details</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="space-y-2">
                            <Label htmlFor="rent_amount" className="flex items-center gap-2">
                              <BadgeDollarSign className="h-4 w-4 text-gray-500" />
                              Rent Amount (QAR)
                            </Label>
                            <Input
                              id="rent_amount"
                              type="number"
                              min="0"
                              step="0.01"
                              value={rentAmount}
                              onChange={(e) => handleRentAmountChange(e.target.value)}
                              className="bg-white"
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          Monthly rent amount
                        </TooltipContent>
                      </Tooltip>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Hourglass className="h-4 w-4 text-gray-500" />
                          Duration (Months)
                        </Label>
                        <Input
                          type="number"
                          value={duration}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                        Contract Value (QAR)
                      </Label>
                      <Input
                        type="number"
                        value={contractValue}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <CustomerInfoCard customer={agreement.customer} />
              <VehicleInfoCard 
                vehicle={agreement.vehicle}
                initialMileage={agreement.initial_mileage}
              />
            </div>

            <Tabs defaultValue="payments" className="w-full">
              <TabsList className="w-full grid grid-cols-6 h-auto gap-2 bg-transparent">
                <TabsTrigger value="payments" className="flex items-center gap-2 data-[state=active]:bg-blue-50">
                  <CreditCard className="h-4 w-4" />
                  Payments
                </TabsTrigger>
                <TabsTrigger value="payment-history" className="flex items-center gap-2 data-[state=active]:bg-blue-50">
                  <Receipt className="h-4 w-4" />
                  History
                </TabsTrigger>
                <TabsTrigger value="invoices" className="flex items-center gap-2 data-[state=active]:bg-blue-50">
                  <FileCheck className="h-4 w-4" />
                  Invoices
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center gap-2 data-[state=active]:bg-blue-50">
                  <FileText className="h-4 w-4" />
                  Documents
                </TabsTrigger>
                <TabsTrigger value="damages" className="flex items-center gap-2 data-[state=active]:bg-blue-50">
                  <ShieldAlert className="h-4 w-4" />
                  Damages
                </TabsTrigger>
                <TabsTrigger value="fines" className="flex items-center gap-2 data-[state=active]:bg-blue-50">
                  <AlertTriangle className="h-4 w-4" />
                  Fines
                </TabsTrigger>
              </TabsList>
              
              <div className="mt-6">
                <TabsContent value="payments">
                  <PaymentForm agreementId={agreementId} />
                </TabsContent>
                <TabsContent value="payment-history">
                  <PaymentHistory agreementId={agreementId} />
                </TabsContent>
                <TabsContent value="invoices">
                  <InvoiceList agreementId={agreementId} />
                </TabsContent>
                <TabsContent value="documents">
                  <DocumentUpload agreementId={agreementId} />
                </TabsContent>
                <TabsContent value="damages">
                  <DamageAssessment agreementId={agreementId} />
                </TabsContent>
                <TabsContent value="fines">
                  <TrafficFines agreementId={agreementId} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Agreement not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
