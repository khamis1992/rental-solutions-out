
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskService } from "@/services/sales/taskService";
import { toast } from "sonner";

export const useTasks = (leadId: string) => {
  const queryClient = useQueryClient();

  const {
    data: tasks,
    isLoading,
    error
  } = useQuery({
    queryKey: ["lead-tasks", leadId],
    queryFn: () => taskService.getTasks(leadId)
  });

  const addTask = useMutation({
    mutationFn: (title: string) => 
      taskService.addTask(leadId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-tasks", leadId] });
      toast.success("Task added successfully");
    },
    onError: () => {
      toast.error("Failed to add task");
    }
  });

  const completeTask = useMutation({
    mutationFn: taskService.completeTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-tasks", leadId] });
      toast.success("Task completed");
    },
    onError: () => {
      toast.error("Failed to complete task");
    }
  });

  return {
    tasks,
    isLoading,
    error,
    addTask,
    completeTask
  };
};
