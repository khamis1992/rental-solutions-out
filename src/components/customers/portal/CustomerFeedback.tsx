
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Star, StarOff } from "lucide-react";

interface CustomerFeedbackProps {
  customerId: string;
  agreementId?: string;
}

export const CustomerFeedback = ({ customerId, agreementId }: CustomerFeedbackProps) => {
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  
  const feedbackMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("customer_feedback")
        .insert({
          customer_id: customerId,
          agreement_id: agreementId,
          rating,
          feedback_text: feedback
        });

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast.success("Thank you for your feedback!");
      setRating(0);
      setFeedback("");
    },
    onError: (error) => {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error("Please provide a rating");
      return;
    }
    
    feedbackMutation.mutate();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2 py-4">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            className="hover:scale-110 transition-transform"
            aria-label={`Rate ${value} star${value !== 1 ? 's' : ''}`}
          >
            {value <= rating ? (
              <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
            ) : (
              <StarOff className="w-8 h-8 text-muted-foreground" />
            )}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="feedback">Your Feedback</Label>
          <Textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your experience with our service..."
            className="min-h-[100px]"
          />
        </div>
        
        <Button 
          type="submit"
          className="w-full" 
          disabled={feedbackMutation.isPending || rating === 0}
        >
          {feedbackMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Feedback"
          )}
        </Button>
      </form>
    </div>
  );
};
