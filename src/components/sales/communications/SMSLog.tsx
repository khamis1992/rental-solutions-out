
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
import { MessageSquare } from "lucide-react";

const smsSchema = z.object({
  content: z.string().min(1, "Message content is required"),
});

interface SMSLogProps {
  leadId: string;
  phoneNumber: string | null;
}

export function SMSLog({ leadId, phoneNumber }: SMSLogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof smsSchema>>({
    resolver: zodResolver(smsSchema),
    defaultValues: {
      content: "",
    },
  });

  const { data: messages, isLoading } = useQuery({
    queryKey: ["sms-messages", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sms_messages")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const sendSMSMutation = useMutation({
    mutationFn: async (values: z.infer<typeof smsSchema>) => {
      if (!phoneNumber) {
        throw new Error("No phone number available");
      }

      // Here you would integrate with your SMS provider
      // For now, we'll just log it in the database
      const { error } = await supabase.from("sms_messages").insert([
        {
          lead_id: leadId,
          direction: "outgoing",
          content: values.content,
          status: "sent",
          sent_at: new Date().toISOString(),
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-messages", leadId] });
      setIsDialogOpen(false);
      form.reset();
      toast.success("SMS sent successfully");
    },
    onError: (error) => {
      console.error("Error sending SMS:", error);
      toast.error("Failed to send SMS");
    },
  });

  if (isLoading) {
    return <div>Loading SMS messages...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          SMS Messages
        </CardTitle>
        <CardDescription>Send and track SMS messages</CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!phoneNumber}>
              Send New SMS
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send SMS</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) => sendSMSMutation.mutate(values))}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={sendSMSMutation.isPending}>
                  Send SMS
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <div className="mt-4 space-y-4">
          {messages?.map((message) => (
            <Card key={message.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(message.created_at), "PPp")}
                      {" · "}
                      <span className="capitalize">{message.direction}</span>
                    </p>
                    <p className="mt-2 text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  <span className="text-sm capitalize">{message.status}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
