
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Phone, PhoneIncoming, PhoneOutgoing } from "lucide-react";

const callLogSchema = z.object({
  type: z.enum(["incoming", "outgoing"]),
  duration: z.string().optional(),
  notes: z.string(),
  status: z.enum(["completed", "missed", "scheduled"]),
  scheduled_for: z.string().optional(),
});

interface CallLogProps {
  leadId: string;
}

export function CallLog({ leadId }: CallLogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof callLogSchema>>({
    resolver: zodResolver(callLogSchema),
    defaultValues: {
      type: "outgoing",
      status: "completed",
      notes: "",
    },
  });

  const { data: calls, isLoading } = useQuery({
    queryKey: ["call-logs", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("call_logs")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const logCallMutation = useMutation({
    mutationFn: async (values: z.infer<typeof callLogSchema>) => {
      const { error } = await supabase.from("call_logs").insert([
        {
          lead_id: leadId,
          ...values,
          duration: values.duration ? parseInt(values.duration) : null,
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["call-logs", leadId] });
      setIsDialogOpen(false);
      form.reset();
      toast.success("Call logged successfully");
    },
    onError: (error) => {
      console.error("Error logging call:", error);
      toast.error("Failed to log call");
    },
  });

  if (isLoading) {
    return <div>Loading call logs...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Call Log
        </CardTitle>
        <CardDescription>Track all calls with this lead</CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              Log New Call
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Call</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) => logCallMutation.mutate(values))}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Call Type</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select call type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="incoming">Incoming</SelectItem>
                          <SelectItem value="outgoing">Outgoing</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="missed">Missed</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("status") === "scheduled" && (
                  <FormField
                    control={form.control}
                    name="scheduled_for"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scheduled For</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={logCallMutation.isPending}>
                  Log Call
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <div className="mt-4 space-y-4">
          {calls?.map((call) => (
            <Card key={call.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    {call.type === "incoming" ? (
                      <PhoneIncoming className="h-5 w-5 text-blue-500" />
                    ) : (
                      <PhoneOutgoing className="h-5 w-5 text-green-500" />
                    )}
                    <div>
                      <p className="font-medium capitalize">{call.type} Call</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(call.created_at), "PPp")}
                      </p>
                      {call.duration && (
                        <p className="text-sm">Duration: {call.duration} minutes</p>
                      )}
                      <p className="mt-2 text-sm">{call.notes}</p>
                    </div>
                  </div>
                  <span className="text-sm capitalize">{call.status}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
