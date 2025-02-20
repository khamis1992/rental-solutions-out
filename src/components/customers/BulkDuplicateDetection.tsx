
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { findBulkDuplicates } from "./utils/duplicateDetection";
import { toast } from "sonner";
import type { Customer } from "./types/customer";

export function BulkDuplicateDetection() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Awaited<ReturnType<typeof findBulkDuplicates>> | null>(null);

  const analyzeDuplicates = async () => {
    try {
      setIsAnalyzing(true);
      setProgress(0);

      // Fetch all customers
      const { data: customers, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone_number, email')
        .eq('role', 'customer');

      if (error) throw error;

      setProgress(25);

      // Process duplicates
      const duplicateResults = await findBulkDuplicates(customers as Partial<Customer>[]);
      
      setProgress(100);
      setResults(duplicateResults);

      toast.success(
        `Analysis complete: Found ${duplicateResults.totalDuplicates} potential duplicates in ${duplicateResults.clusters.length} clusters`
      );
    } catch (error) {
      console.error('Error analyzing duplicates:', error);
      toast.error('Failed to analyze duplicates');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Bulk Duplicate Detection</h2>
          <p className="text-sm text-muted-foreground">
            Analyze your customer database for potential duplicates
          </p>
        </div>
        <Button
          onClick={analyzeDuplicates}
          disabled={isAnalyzing}
          className="gap-2"
        >
          <Users className="h-4 w-4" />
          {isAnalyzing ? 'Analyzing...' : 'Analyze Duplicates'}
        </Button>
      </div>

      {isAnalyzing && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Analyzing customer records...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {results && !isAnalyzing && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <Card className="flex-1 p-4">
              <div className="text-2xl font-bold">{results.totalDuplicates}</div>
              <div className="text-sm text-muted-foreground">
                Potential Duplicates
              </div>
            </Card>
            <Card className="flex-1 p-4">
              <div className="text-2xl font-bold">{results.clusters.length}</div>
              <div className="text-sm text-muted-foreground">
                Duplicate Clusters
              </div>
            </Card>
            <Card className="flex-1 p-4">
              <div className="text-2xl font-bold">{results.processedCount}</div>
              <div className="text-sm text-muted-foreground">
                Records Processed
              </div>
            </Card>
          </div>

          <div className="space-y-2">
            {results.clusters.map((cluster, index) => (
              <Collapsible key={index}>
                <CollapsibleTrigger className="w-full">
                  <Card className="flex items-center justify-between p-4 hover:bg-accent">
                    <div className="flex items-center gap-4">
                      <Badge variant="default">
                        {cluster.customers.length} matches
                      </Badge>
                      <span className="font-medium">
                        {cluster.customers[0].full_name}
                      </span>
                      <div className="flex gap-1">
                        {cluster.match_reasons.map((reason, i) => (
                          <Badge key={i} variant="secondary">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Card>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Card className="mt-2 p-4">
                    <div className="space-y-2">
                      {cluster.customers.map((customer, i) => (
                        <div
                          key={customer.id}
                          className="flex items-center justify-between border-b border-border py-2 last:border-0"
                        >
                          <div>
                            <div className="font-medium">{customer.full_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {customer.phone_number || 'No phone'} •{' '}
                              {customer.email || 'No email'}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.location.href = `/customers/profile/${customer.id}`
                            }
                          >
                            View Profile
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
