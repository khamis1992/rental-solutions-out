
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type SyncStatus = "idle" | "syncing" | "success" | "error";
type SyncConfig = {
  table: string;
  column?: string;
  value?: string | number;
  realtimeEvents?: ("INSERT" | "UPDATE" | "DELETE")[];
  onDataChange?: (payload: any) => void;
  disableToasts?: boolean;
};

export function useDataSync<T = any>({
  table,
  column,
  value,
  realtimeEvents = ["INSERT", "UPDATE", "DELETE"],
  onDataChange,
  disableToasts = false,
}: SyncConfig) {
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [data, setData] = useState<T[] | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setStatus("syncing");
      let query = supabase.from(table).select("*");

      if (column && value !== undefined) {
        query = query.eq(column, value);
      }

      const { data: result, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setData(result as T[]);
      setLastSyncTime(new Date());
      setStatus("success");
      
      if (!disableToasts) {
        toast.success("Data synchronized successfully");
      }
      
      return result;
    } catch (err: any) {
      console.error("Error syncing data:", err);
      setError(err);
      setStatus("error");
      
      if (!disableToasts) {
        toast.error(`Sync error: ${err.message}`);
      }
      
      return null;
    }
  }, [table, column, value, disableToasts]);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`${table}-changes`)
      .on("postgres_changes", {
        event: realtimeEvents,
        schema: "public",
        table,
      }, (payload) => {
        if (onDataChange) {
          onDataChange(payload);
        }
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [table, column, value, realtimeEvents, fetchData, onDataChange]);

  return {
    data,
    status,
    lastSyncTime,
    error,
    refresh: fetchData,
    isLoading: status === "syncing",
  };
}
