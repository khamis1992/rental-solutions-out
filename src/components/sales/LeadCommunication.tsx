
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { useCommunications } from "@/hooks/sales/useCommunications";

interface LeadCommunicationProps {
  leadId: string;
}

export const LeadCommunication = ({ leadId }: LeadCommunicationProps) => {
  const [message, setMessage] = useState("");
  const { communications, isLoading, addCommunication } = useCommunications(leadId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    addCommunication.mutate(message, {
      onSuccess: () => setMessage("")
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
        <CardTitle>Communications</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Add a note..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button 
            type="submit" 
            disabled={addCommunication.isPending || !message.trim()}
          >
            {addCommunication.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Add Note
          </Button>
        </form>

        <div className="mt-6 space-y-4">
          {communications?.map((comm) => (
            <div key={comm.id} className="border-b pb-4">
              <div className="flex justify-between items-start">
                <p className="font-medium">
                  {comm.team_member?.full_name || "System"}
                </p>
                <span className="text-sm text-muted-foreground">
                  {new Date(comm.created_at).toLocaleString()}
                </span>
              </div>
              <p className="mt-2 text-sm">{comm.content}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
