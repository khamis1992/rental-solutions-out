
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";

interface LeadCommunicationsProps {
  leadId: string;
  leadEmail: string | null;
}

export function LeadCommunications({ leadId, leadEmail }: LeadCommunicationsProps) {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: communications, isLoading } = useQuery({
    queryKey: ["lead-communications", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_communications")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: async () => {
      if (!leadEmail) {
        throw new Error("Lead has no email address");
      }

      const response = await fetch("/api/send-lead-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId,
          subject,
          content,
          to: leadEmail,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }
    },
    onSuccess: () => {
      toast.success("Email sent successfully");
      setIsDialogOpen(false);
      setSubject("");
      setContent("");
    },
    onError: (error) => {
      console.error("Error sending email:", error);
      toast.error("Failed to send email");
    },
  });

  if (isLoading) {
    return <div>Loading communications...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Communications</CardTitle>
        <CardDescription>Email communications with this lead</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!leadEmail}>
                Send New Email
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Email</DialogTitle>
                <DialogDescription>
                  Compose a new email to send to this lead
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input
                  placeholder="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
                <Textarea
                  placeholder="Email content..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px]"
                />
                <Button
                  onClick={() => sendEmailMutation.mutate()}
                  disabled={sendEmailMutation.isPending}
                >
                  Send Email
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="space-y-4 mt-6">
            {communications?.map((comm) => (
              <Card key={comm.id}>
                <CardContent className="pt-6">
                  <div>
                    <h4 className="font-medium">{comm.subject}</h4>
                    <p className="text-sm text-muted-foreground">
                      Sent: {format(new Date(comm.sent_at), "PPp")}
                    </p>
                    <p className="mt-2 text-sm whitespace-pre-wrap">
                      {comm.content}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
