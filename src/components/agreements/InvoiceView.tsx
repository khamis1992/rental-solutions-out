
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InvoiceData } from "./utils/invoiceUtils";

interface InvoiceViewProps {
  data: InvoiceData;
  onPrint?: () => void;
}

export const InvoiceView = ({ data, onPrint }: InvoiceViewProps) => {
  const { data: settings } = useQuery({
    queryKey: ["company-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_settings")
        .select("*")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    }
    window.print();
  };

  // Calculate total paid amount and late fines
  const totalPaidAmount = data.payments?.reduce((sum, payment) => sum + payment.amount_paid, 0) || 0;
  const totalLateFines = data.payments?.reduce((sum, payment) => sum + (payment.late_fine_amount || 0), 0) || 0;
  
  // Calculate due amount as total paid minus late fines
  const dueAmount = totalPaidAmount - totalLateFines;

  return (
    <ScrollArea className="h-[calc(100vh-200px)] w-full">
      <Card className="p-8 max-w-4xl mx-auto bg-white shadow-lg print:shadow-none print:p-4 print:max-w-none">
        <div className="flex justify-between items-start mb-8">
          <div>
            {settings?.logo_url && (
              <img
                src={settings.logo_url}
                alt="Company Logo"
                className="h-16 object-contain print:h-12 mb-4"
              />
            )}
            {settings?.company_name && (
              <div className="text-sm text-gray-600">
                <p className="font-medium">{settings.company_name}</p>
                <p>{settings.address}</p>
                <p>{settings.phone}</p>
                <p>{settings.business_email}</p>
              </div>
            )}
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-gray-900 print:text-2xl mb-2">Receipt</h1>
            <p className="text-gray-600">#{data.invoiceNumber}</p>
            <p className="text-gray-600 mt-2">Date: {format(new Date(), "dd/MM/yyyy")}</p>
            <p className="text-gray-600">Time: {format(new Date(), "HH:mm:ss")}</p>
          </div>
        </div>

        <div className="border-t border-b border-gray-200 py-8">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Bill To:</h3>
              <div className="space-y-1 text-gray-600">
                <p className="font-medium text-gray-800">{data.customerName}</p>
                <p className="whitespace-pre-line">{data.customerAddress}</p>
              </div>
            </div>
            <div className="text-right space-y-2">
              <div>
                <span className="font-semibold text-gray-700">Agreement #: </span>
                <span className="text-gray-600">{data.agreementId}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Vehicle: </span>
                <span className="text-gray-600">{data.vehicleDetails}</span>
              </div>
              {data.dueDate && (
                <div>
                  <span className="font-semibold text-gray-700">Due Date: </span>
                  <span className="text-gray-600">{data.dueDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="my-8">
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Description</th>
                  <th className="text-right py-3 px-4 text-gray-700 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, index) => (
                  <tr key={index} className="border-b last:border-b-0">
                    <td className="py-3 px-4 text-gray-600">{item.description}</td>
                    <td className="text-right py-3 px-4 text-gray-800 font-medium">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Details */}
        {data.payments && data.payments.length > 0 && (
          <div className="my-8">
            <h3 className="font-semibold text-gray-700 mb-4">Payment Details</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Method</th>
                    <th className="text-right py-3 px-4 text-gray-700 font-semibold">Amount</th>
                    <th className="text-right py-3 px-4 text-gray-700 font-semibold">Late Fine</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payments.map((payment) => (
                    <tr key={payment.id} className="border-b last:border-b-0">
                      <td className="py-3 px-4 text-gray-600">
                        {payment.payment_date 
                          ? format(new Date(payment.payment_date), "dd/MM/yyyy")
                          : format(new Date(payment.created_at), "dd/MM/yyyy")}
                      </td>
                      <td className="py-3 px-4 text-gray-600 capitalize">
                        {payment.payment_method?.toLowerCase().replace("_", " ") || "-"}
                      </td>
                      <td className="text-right py-3 px-4 text-gray-800 font-medium">
                        {formatCurrency(payment.amount_paid)}
                      </td>
                      <td className="text-right py-3 px-4 text-red-600 font-medium">
                        {payment.late_fine_amount ? formatCurrency(payment.late_fine_amount) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="border-t pt-6 mt-8">
          <div className="flex flex-col items-end space-y-3">
            <div className="flex justify-between w-64 text-gray-600">
              <span>Subtotal:</span>
              <span>{formatCurrency(data.subtotal)}</span>
            </div>
            {data.discount > 0 && (
              <div className="flex justify-between w-64 text-gray-600">
                <span>Discount:</span>
                <span>-{formatCurrency(data.discount)}</span>
              </div>
            )}
            {totalLateFines > 0 && (
              <div className="flex justify-between w-64 text-gray-600">
                <span>Late Fees:</span>
                <span className="text-red-600">
                  {formatCurrency(totalLateFines)}
                </span>
              </div>
            )}
            <div className="flex justify-between w-64 bg-gray-50 p-4 rounded-lg">
              <span className="font-semibold text-gray-700">Total Amount:</span>
              <span className="font-bold text-xl text-gray-900">
                {formatCurrency(data.total)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-gray-500">
          <p className="font-medium mb-2">Thank you for your business!</p>
          {settings?.company_name && (
            <>
              <p className="mb-1">{settings.company_name}</p>
              <p className="text-xs text-gray-400">This is a computer-generated receipt and does not require a signature.</p>
            </>
          )}
        </div>

        <div className="mt-8 print:hidden">
          <Button onClick={handlePrint} className="w-full">
            <Printer className="w-4 h-4 mr-2" />
            Print Receipt
          </Button>
        </div>
      </Card>
    </ScrollArea>
  );
};
