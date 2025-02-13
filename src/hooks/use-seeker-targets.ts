
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SeekerTarget, SeekerLocationHistory, SeekerAlert } from '@/types/seeker';
import { toast } from 'sonner';

export function useSeekerTargets() {
  const queryClient = useQueryClient();

  const { data: targets, isLoading } = useQuery({
    queryKey: ['seeker-targets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seeker_targets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SeekerTarget[];
    },
  });

  const { data: locationHistory } = useQuery({
    queryKey: ['seeker-location-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seeker_location_history')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data as SeekerLocationHistory[];
    },
  });

  const { data: alerts } = useQuery({
    queryKey: ['seeker-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seeker_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SeekerAlert[];
    },
  });

  const createTarget = useMutation({
    mutationFn: async (target: Omit<SeekerTarget, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('seeker_targets')
        .insert(target)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seeker-targets'] });
      toast.success('Target created successfully');
    },
    onError: (error) => {
      console.error('Error creating target:', error);
      toast.error('Failed to create target');
    },
  });

  const updateTarget = useMutation({
    mutationFn: async ({ id, ...target }: Partial<SeekerTarget> & { id: string }) => {
      const { data, error } = await supabase
        .from('seeker_targets')
        .update(target)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seeker-targets'] });
      toast.success('Target updated successfully');
    },
    onError: (error) => {
      console.error('Error updating target:', error);
      toast.error('Failed to update target');
    },
  });

  const deleteTarget = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('seeker_targets')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seeker-targets'] });
      toast.success('Target deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting target:', error);
      toast.error('Failed to delete target');
    },
  });

  return {
    targets,
    locationHistory,
    alerts,
    isLoading,
    createTarget,
    updateTarget,
    deleteTarget,
  };
}
