
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle, Circle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SalesLead } from "@/types/sales.types";
import { useSalesLeads } from "./hooks/useSalesLeads";
import { formatDistanceToNow } from "date-fns";

export function OnboardingList() {
  const { data: leads = [], isLoading } = useSalesLeads();
  const queryClient = useQueryClient();
  
  // Filter leads that are in onboarding status
  const onboardingLeads = leads.filter(
    (lead) => lead.status === "onboarding" || lead.status === "ready_for_signature"
  );

  const handleProgressUpdate = async (
    leadId: string,
    progress: Partial<SalesLead["onboarding_progress"]>
  ) => {
    try {
      const { error } = await supabase
        .from("sales_leads")
        .update({
          onboarding_progress: progress,
          status: Object.values(progress).every((v) => v)
            ? "completed"
            : "onboarding",
        })
        .eq("id", leadId);

      if (error) throw error;

      toast.success("Progress updated successfully");
      queryClient.invalidateQueries({ queryKey: ["sales-leads"] });
    } catch (error) {
      console.error("Error updating progress:", error);
      toast.error("Failed to update progress");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ScrollArea className="h-[700px] w-full rounded-md border">
      <div className="p-4 space-y-4">
        <AnimatePresence>
          {onboardingLeads.map((lead) => (
            <motion.div
              key={lead.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{lead.full_name}</CardTitle>
                      <CardDescription>
                        Started onboarding{" "}
                        {formatDistanceToNow(new Date(lead.created_at))} ago
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        lead.status === "completed"
                          ? "bg-green-500 text-white"
                          : "bg-yellow-500 text-white"
                      }
                    >
                      {lead.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div>
                        <span className="font-medium">Phone:</span>{" "}
                        {lead.phone_number}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {lead.email}
                      </div>
                      <div>
                        <span className="font-medium">Budget:</span>{" "}
                        {lead.budget_min} - {lead.budget_max ?? "No max"}
                      </div>
                      <div>
                        <span className="font-medium">Nationality:</span>{" "}
                        {lead.nationality}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Onboarding Progress</h4>
                      <div className="flex flex-col gap-2">
                        <TooltipProvider>
                          <div className="flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start"
                                  onClick={() =>
                                    handleProgressUpdate(lead.id, {
                                      ...lead.onboarding_progress,
                                      initial_payment:
                                        !lead.onboarding_progress.initial_payment,
                                    })
                                  }
                                >
                                  {lead.onboarding_progress.initial_payment ? (
                                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                  ) : (
                                    <Circle className="w-4 h-4 mr-2" />
                                  )}
                                  Initial Payment
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Click to toggle initial payment status
                              </TooltipContent>
                            </Tooltip>
                          </div>

                          <div className="flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start"
                                  onClick={() =>
                                    handleProgressUpdate(lead.id, {
                                      ...lead.onboarding_progress,
                                      agreement_creation:
                                        !lead.onboarding_progress
                                          .agreement_creation,
                                    })
                                  }
                                >
                                  {lead.onboarding_progress.agreement_creation ? (
                                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                  ) : (
                                    <Circle className="w-4 h-4 mr-2" />
                                  )}
                                  Agreement Creation
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Click to toggle agreement creation status
                              </TooltipContent>
                            </Tooltip>
                          </div>

                          <div className="flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start"
                                  onClick={() =>
                                    handleProgressUpdate(lead.id, {
                                      ...lead.onboarding_progress,
                                      customer_conversion:
                                        !lead.onboarding_progress
                                          .customer_conversion,
                                    })
                                  }
                                >
                                  {lead.onboarding_progress.customer_conversion ? (
                                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                  ) : (
                                    <Circle className="w-4 h-4 mr-2" />
                                  )}
                                  Customer Conversion
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Click to toggle customer conversion status
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {onboardingLeads.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No leads in onboarding phase
            </div>
          )}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
}
