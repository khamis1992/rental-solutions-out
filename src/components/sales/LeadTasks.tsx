
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useTasks } from "@/hooks/sales/useTasks";

interface LeadTasksProps {
  leadId: string;
}

export const LeadTasks = ({ leadId }: LeadTasksProps) => {
  const [title, setTitle] = useState("");
  const { tasks, isLoading, addTask, completeTask } = useTasks(leadId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask.mutate(title, {
      onSuccess: () => setTitle("")
    });
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
