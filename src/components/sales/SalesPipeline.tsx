
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PipelineStage {
  name: string;
  count: number;
  status: string;
}

export const SalesPipeline = () => {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPipelineData();
  }, []);

  const fetchPipelineData = async () => {
    try {
      const { data, error } = await supabase
        .from("sales_leads")
        .select("status")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Count leads in each stage
      const counts: Record<string, number> = {};
      data?.forEach((lead) => {
        counts[lead.status] = (counts[lead.status] || 0) + 1;
      });

      const pipelineStages: PipelineStage[] = [
        { name: "New Leads", status: "new", count: counts["new"] || 0 },
        { name: "Document Collection", status: "document_collection", count: counts["document_collection"] || 0 },
        { name: "Vehicle Selection", status: "vehicle_selection", count: counts["vehicle_selection"] || 0 },
        { name: "Agreement Draft", status: "agreement_draft", count: counts["agreement_draft"] || 0 },
        { name: "Ready for Signature", status: "ready_for_signature", count: counts["ready_for_signature"] || 0 },
        { name: "Completed", status: "completed", count: counts["completed"] || 0 }
      ];

      setStages(pipelineStages);
    } catch (error) {
      console.error("Error fetching pipeline data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stages.map((stage) => (
        <Card key={stage.status}>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{stage.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stage.count}</div>
            <p className="text-xs text-muted-foreground">
              {stage.count === 1 ? "Lead" : "Leads"}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
