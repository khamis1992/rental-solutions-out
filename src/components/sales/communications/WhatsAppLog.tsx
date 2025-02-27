
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { MessagesSquare } from "lucide-react";

const whatsappSchema = z.object({
  content: z.string().min(1, "Message content is required"),
  messageType: z.enum(["text", "template"]),
  templateId: z.string().optional(),
});

interface WhatsAppLogProps {
  leadId: string;
  phoneNumber: string | null;
}

const WHATSAPP_TEMPLATES = [
  { id: "welcome", name: "Welcome Message" },
  { id: "payment_reminder", name: "Payment Reminder" },
  { id: "appointment_confirmation", name: "Appointment Confirmation" },
  { id: "follow_up", name: "Follow Up" },
];

export function WhatsAppLog({ leadId, phoneNumber }: WhatsAppLogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof whatsappSchema>>({
    resolver: zodResolver(whatsappSchema),
    defaultValues: {
      content: "",
      messageType: "text",
    },
  });

  const watchMessageType = form.watch("messageType");

  const { data: messages, isLoading } = useQuery({
    queryKey: ["whatsapp-messages", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sms_messages")
        .select("*")
        .eq("lead_id", leadId)
        .eq("direction", "outgoing")
        .eq("message_type", "whatsapp")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const sendWhatsAppMutation = useMutation({
    mutationFn: async (values: z.infer<typeof whatsappSchema>) => {
      if (!phoneNumber) {
        throw new Error("No phone number available");
      }

      // Call the Edge Function to send the WhatsApp message
      const { data, error } = await supabase.functions.invoke("send-whatsapp-message", {
        body: {
          phoneNumber,
          message: values.content,
          leadId,
          messageType: values.messageType,
          templateId: values.messageType === "template" ? values.templateId : undefined,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Store the message in the database
      const { error: dbError } = await supabase.from("sms_messages").insert([
        {
          lead_id: leadId,
          direction: "outgoing",
          content: values.content,
          status: "sent",
          sent_at: new Date().toISOString(),
          message_type: "whatsapp",
          whatsapp_template_id: values.messageType === "template" ? values.templateId : null,
          whatsapp_message_id: data?.manyChatResponse?.message_id || null,
        },
      ]);
      
      if (dbError) throw dbError;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-messages", leadId] });
      setIsDialogOpen(false);
      form.reset();
      toast.success("WhatsApp message sent successfully");
    },
    onError: (error) => {
      console.error("Error sending WhatsApp message:", error);
      toast.error("Failed to send WhatsApp message: " + error.message);
    },
  });

  if (isLoading) {
    return <div>Loading WhatsApp messages...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessagesSquare className="h-5 w-5" />
          WhatsApp Messages
        </CardTitle>
        <CardDescription>Send and track WhatsApp messages</CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!phoneNumber} className="bg-green-600 hover:bg-green-700">
              Send WhatsApp Message
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send WhatsApp Message</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) => sendWhatsAppMutation.mutate(values))}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="messageType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select message type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="text">Text Message</SelectItem>
                          <SelectItem value="template">Template Message</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchMessageType === "template" && (
                  <FormField
                    control={form.control}
                    name="templateId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select template" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {WHATSAPP_TEMPLATES.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {(watchMessageType === "text" || !watchMessageType) && (
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
                )}

                <Button 
                  type="submit" 
                  disabled={sendWhatsAppMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 w-full"
                >
                  Send WhatsApp
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <div className="mt-4 space-y-4">
          {messages?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No WhatsApp messages yet
            </div>
          )}
          
          {messages?.map((message) => (
            <Card key={message.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(message.created_at), "PPp")}
                      {" · "}
                      <span className="capitalize">{message.direction}</span>
                      {message.whatsapp_template_id && (
                        <span className="ml-2">
                          <Badge variant="outline" className="bg-green-50">
                            Template: {message.whatsapp_template_id}
                          </Badge>
                        </span>
                      )}
                    </p>
                    <p className="mt-2 text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  <Badge 
                    variant={message.status === "sent" ? "default" : "outline"}
                    className={message.status === "sent" ? "bg-green-600" : ""}
                  >
                    {message.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
