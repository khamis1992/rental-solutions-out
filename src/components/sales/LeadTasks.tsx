
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface LeadTasksProps {
  leadId: string;
}

export const LeadTasks = ({ leadId }: LeadTasksProps) => {
  const [title, setTitle] = useState("");
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["lead-tasks", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_tasks")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const addTask = useMutation({
    mutationFn: async (taskTitle: string) => {
      const { error } = await supabase
        .from("sales_tasks")
        .insert({
          lead_id: leadId,
          title: taskTitle,
          status: "pending"
        });

      if (error) throw error;
    },
    onSuccess: () => {
      setTitle("");
      queryClient.invalidateQueries({ queryKey: ["lead-tasks"] });
      toast.success("Task added successfully");
    },
    onError: () => {
      toast.error("Failed to add task");
    }
  });

  const completeTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from("sales_tasks")
        .update({ status: "completed" })
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-tasks"] });
      toast.success("Task completed");
    },
    onError: () => {
      toast.error("Failed to complete task");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask.mutate(title);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task">New Task</Label>
            <div className="flex gap-2">
              <Input
                id="task"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title..."
              />
              <Button 
                type="submit" 
                disabled={addTask.isPending || !title.trim()}
              >
                {addTask.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-6 space-y-4">
          {tasks?.map((task) => (
            <div 
              key={task.id} 
              className="flex items-center justify-between border-b pb-4"
            >
              <span className={task.status === "completed" ? "line-through text-muted-foreground" : ""}>
                {task.title}
              </span>
              {task.status !== "completed" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => completeTask.mutate(task.id)}
                  disabled={completeTask.isPending}
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
