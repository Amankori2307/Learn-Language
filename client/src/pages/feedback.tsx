import { useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@shared/routes";

export default function FeedbackPage() {
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitFeedback = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(api.feedback.submit.path, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
          rating,
          pageUrl: window.location.href,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message ?? "Failed to send feedback");
      }
      const parsed = api.feedback.submit.responses[200].parse(payload);
      toast({
        title: "Feedback sent",
        description: `Thanks! Your feedback was sent to ${parsed.sentTo}.`,
      });
      setSubject("");
      setMessage("");
      setRating(5);
    } catch (error) {
      toast({
        title: "Could not send feedback",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Send Feedback</h1>
          <p className="text-muted-foreground">
            Share bugs, product suggestions, and UX feedback directly with the website owner.
          </p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-4 md:p-6 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="feedback-subject">Subject</Label>
            <Input
              id="feedback-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Short summary of your feedback"
              maxLength={120}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="feedback-rating">Rating</Label>
            <select
              id="feedback-rating"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={rating}
              onChange={(event) => setRating(Number.parseInt(event.target.value, 10))}
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} / 5
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="feedback-message">Message</Label>
            <Textarea
              id="feedback-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Tell us what happened, what can be improved, and where you saw it."
              className="min-h-40"
              maxLength={4000}
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={submitFeedback}
              disabled={isSubmitting || subject.trim().length < 3 || message.trim().length < 10}
            >
              {isSubmitting ? "Sending..." : "Send Feedback"}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
