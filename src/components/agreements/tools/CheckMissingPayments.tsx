
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface MissingPaymentResult {
  id: string;
  agreement_number: string;
  status: string;
  rent_amount: number;
  start_date: string;
  schedule_count: number;
  payment_count: number;
  status_description: string;
}

export const CheckMissingPayments = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<MissingPaymentResult[]>([]);
  const [isFixing, setIsFixing] = useState(false);

  const checkMissingPayments = async () => {
    setIsChecking(true);
    try {
      const { data, error } = await supabase
        .from("leases_missing_payments")
        .select("*");

      if (error) throw error;
      setResults(data || []);

      if (data && data.length === 0) {
        toast.success("All agreements have payment records. No issues found!");
      } else {
        toast.warning(`Found ${data.length} agreements with payment issues`);
      }
    } catch (error) {
      console.error("Error checking missing payments:", error);
      toast.error("Failed to check for missing payments");
    } finally {
      setIsChecking(false);
    }
  };

  const fixMissingPayments = async () => {
    setIsFixing(true);
    try {
      const response = await supabase.functions.invoke("process-rent-schedules", {
        body: { fixHistorical: true },
      });

      if (!response.error) {
        toast.success("Fixed missing payment schedules. Running payment check again...");
        await checkMissingPayments();
      } else {
        throw new Error(response.error.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error fixing missing payments:", error);
      toast.error("Failed to fix missing payments");
    } finally {
      setIsFixing(false);
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "Missing start date":
        return "destructive";
      case "Missing payment schedules":
        return "warning";
      case "Missing payments":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Consistency Check</CardTitle>
        <CardDescription>
          Verify all agreements have proper payment records and schedules
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-4">
          <Button onClick={checkMissingPayments} disabled={isChecking}>
            {isChecking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              "Check Missing Payments"
            )}
          </Button>
          {results.length > 0 && (
            <Button 
              variant="secondary" 
              onClick={fixMissingPayments} 
              disabled={isFixing}
            >
              {isFixing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fixing...
                </>
              ) : (
                "Fix Payment Records"
              )}
            </Button>
          )}
        </div>

        {results.length === 0 && !isChecking && (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
            Run a check to verify payment consistency
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-amber-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">
                    Found {results.length} agreements with payment issues
                  </h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>
                      These agreements may have missing payment schedules or payments.
                      Click "Fix Payment Records" to automatically generate missing
                      records for all affected agreements.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border rounded-md divide-y">
              {results.map((result) => (
                <div key={result.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between mb-2">
                    <Link
                      to={`/agreements/${result.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {result.agreement_number}
                    </Link>
                    <Badge variant={getBadgeVariant(result.status_description)}>
                      {result.status_description}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>Start Date: {result.start_date ? format(parseISO(result.start_date), 'PP') : 'Not set'}</div>
                    <div>Payment Schedules: {result.schedule_count}</div>
                    <div>Rent Amount: {result.rent_amount} QAR</div>
                    <div>Payment Records: {result.payment_count}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
