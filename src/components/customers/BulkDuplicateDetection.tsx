import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ChevronDown, Users, Merge, Check, UserX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { findBulkDuplicates } from "./utils/duplicateDetection";
import { toast } from "sonner";
import type { Customer } from "./types/customer";
interface ClusterSelectionState {
  [clusterId: string]: {
    selected: boolean;
    primaryId: string | null;
  };
}
export function BulkDuplicateDetection() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Awaited<ReturnType<typeof findBulkDuplicates>> | null>(null);
  const [selectedClusters, setSelectedClusters] = useState<ClusterSelectionState>({});
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const analyzeDuplicates = async () => {
    try {
      setIsAnalyzing(true);
      setProgress(0);
      setSelectedClusters({});
      const {
        data: customers,
        error
      } = await supabase.from('profiles').select('id, full_name, phone_number, email').eq('role', 'customer');
      if (error) throw error;
      setProgress(25);
      const duplicateResults = await findBulkDuplicates(customers as Partial<Customer>[]);
      setProgress(100);
      setResults(duplicateResults);

      // Initialize selection state for each cluster
      const initialSelectionState: ClusterSelectionState = {};
      duplicateResults.clusters.forEach((_, index) => {
        initialSelectionState[index] = {
          selected: false,
          primaryId: null
        };
      });
      setSelectedClusters(initialSelectionState);
      toast.success(`Analysis complete: Found ${duplicateResults.totalDuplicates} potential duplicates in ${duplicateResults.clusters.length} clusters`);
    } catch (error) {
      console.error('Error analyzing duplicates:', error);
      toast.error('Failed to analyze duplicates');
    } finally {
      setIsAnalyzing(false);
    }
  };
  const handleClusterSelection = (clusterId: string, selected: boolean) => {
    setSelectedClusters(prev => ({
      ...prev,
      [clusterId]: {
        ...prev[clusterId],
        selected
      }
    }));
  };
  const handlePrimarySelection = (clusterId: string, customerId: string) => {
    setSelectedClusters(prev => ({
      ...prev,
      [clusterId]: {
        ...prev[clusterId],
        primaryId: customerId
      }
    }));
  };
  const mergeSelectedClusters = async () => {
    try {
      setIsMerging(true);
      const selectedClusterIds = Object.entries(selectedClusters).filter(([_, value]) => value.selected && value.primaryId).map(([key]) => parseInt(key));
      for (const clusterId of selectedClusterIds) {
        const cluster = results?.clusters[clusterId];
        const primaryId = selectedClusters[clusterId].primaryId;
        if (!cluster || !primaryId) continue;
        const duplicateIds = cluster.customers.map(c => c.id).filter(id => id !== primaryId);

        // Update all references to duplicate IDs to point to the primary ID
        const {
          error: updateError
        } = await supabase.rpc('merge_customer_records', {
          primary_id: primaryId,
          duplicate_ids: duplicateIds
        });
        if (updateError) throw updateError;

        // Mark duplicates as merged
        const {
          error: statusError
        } = await supabase.from('profiles').update({
          status: 'merged',
          merged_into: primaryId,
          updated_at: new Date().toISOString()
        }).in('id', duplicateIds);
        if (statusError) throw statusError;
      }
      toast.success('Successfully merged selected duplicates');
      analyzeDuplicates(); // Refresh the list
    } catch (error) {
      console.error('Error merging duplicates:', error);
      toast.error('Failed to merge duplicates');
    } finally {
      setIsMerging(false);
      setShowMergeDialog(false);
    }
  };
  const markAsReviewed = async (clusterId: string) => {
    try {
      const cluster = results?.clusters[clusterId];
      if (!cluster) return;
      const customerIds = cluster.customers.map(c => c.id);
      const {
        error
      } = await supabase.from('profiles').update({
        duplicate_review_status: 'reviewed',
        duplicate_review_date: new Date().toISOString()
      }).in('id', customerIds);
      if (error) throw error;

      // Remove the cluster from results
      if (results) {
        setResults({
          ...results,
          clusters: results.clusters.filter((_, index) => index.toString() !== clusterId),
          totalDuplicates: results.totalDuplicates - cluster.customers.length + 1
        });
      }
      toast.success('Marked cluster as reviewed');
    } catch (error) {
      console.error('Error marking as reviewed:', error);
      toast.error('Failed to mark as reviewed');
    }
  };
  const selectedCount = Object.values(selectedClusters).filter(v => v.selected).length;
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Bulk Duplicate Detection</h2>
          <p className="text-sm text-muted-foreground">
            Analyze your customer database for potential duplicates
          </p>
        </div>
        <div className="flex gap-2">
          {selectedCount > 0 && <Button onClick={() => setShowMergeDialog(true)} disabled={isMerging} variant="default" className="gap-2">
              <Merge className="h-4 w-4" />
              Merge Selected ({selectedCount})
            </Button>}
          <Button onClick={analyzeDuplicates} disabled={isAnalyzing} className="gap-2">
            <Users className="h-4 w-4" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze Duplicates'}
          </Button>
        </div>
      </div>

      {isAnalyzing && <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Analyzing customer records...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>}

      {results && !isAnalyzing && <div className="space-y-4">
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
            {results.clusters.map((cluster, index) => <Collapsible key={index}>
                <CollapsibleTrigger className="w-full">
                  <Card className="flex items-center justify-between p-4 hover:bg-accent">
                    <div className="flex items-center gap-4">
                      <Checkbox checked={selectedClusters[index]?.selected} onCheckedChange={checked => {
                  handleClusterSelection(index.toString(), checked as boolean);
                  event?.stopPropagation();
                }} onClick={e => e.stopPropagation()} />
                      <Badge variant="default">
                        {cluster.customers.length} matches
                      </Badge>
                      <span className="font-medium">
                        {cluster.customers[0].full_name}
                      </span>
                      <div className="flex gap-1">
                        {cluster.match_reasons.map((reason, i) => <Badge key={i} variant="secondary" className="bg-primary-light">
                            {reason}
                          </Badge>)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="gap-1" onClick={e => {
                  e.stopPropagation();
                  markAsReviewed(index.toString());
                }}>
                        <Check className="h-4 w-4" />
                        Mark Reviewed
                      </Button>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </Card>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Card className="mt-2 p-4">
                    <div className="space-y-2">
                      {cluster.customers.map(customer => <div key={customer.id} className="flex items-center justify-between border-b border-border py-2 last:border-0">
                          <div className="flex items-center gap-4">
                            {selectedClusters[index]?.selected && <Checkbox checked={selectedClusters[index]?.primaryId === customer.id} onCheckedChange={() => handlePrimarySelection(index.toString(), customer.id)} />}
                            <div>
                              <div className="font-medium">{customer.full_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {customer.phone_number || 'No phone'} •{' '}
                                {customer.email || 'No email'}
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => window.location.href = `/customers/profile/${customer.id}`}>
                            View Profile
                          </Button>
                        </div>)}
                    </div>
                  </Card>
                </CollapsibleContent>
              </Collapsible>)}
          </div>
        </div>}

      <AlertDialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Merge Selected Duplicates</AlertDialogTitle>
            <AlertDialogDescription>
              This action will merge {selectedCount} duplicate clusters. For each cluster,
              all records will be merged into the selected primary record. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={mergeSelectedClusters} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isMerging ? 'Merging...' : 'Merge Records'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
}