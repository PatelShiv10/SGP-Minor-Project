import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MessageSquare, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LawyerFeedbackDialogProps {
  lawyerId: string;
  lawyerName: string;
  trigger?: React.ReactNode;
  onFeedbackSubmitted?: () => void;
}

interface FeedbackForm {
  rating: number;
  title: string;
  comment: string;
  serviceType: string;
}

const LawyerFeedbackDialog: React.FC<LawyerFeedbackDialogProps> = ({
  lawyerId,
  lawyerName,
  trigger,
  onFeedbackSubmitted
}) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackForm>({
    rating: 0,
    title: '',
    comment: '',
    serviceType: 'consultation'
  });

  const { toast } = useToast();

  const handleStarClick = (rating: number) => {
    setFeedback({ ...feedback, rating });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (feedback.rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch('http://localhost:5000/api/lawyer-feedback', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          lawyerId,
          rating: feedback.rating,
          title: feedback.title,
          comment: feedback.comment,
          serviceType: feedback.serviceType
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Review Submitted",
          description: "Thank you! Your review will be published after approval."
        });
        
        // Reset form
        setFeedback({
          rating: 0,
          title: '',
          comment: '',
          serviceType: 'consultation'
        });
        
        setOpen(false);
        onFeedbackSubmitted?.();
      } else {
        throw new Error(data.message || 'Failed to submit review');
      }
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit review. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" className="border-teal text-teal hover:bg-teal hover:text-white">
      <MessageSquare className="h-4 w-4 mr-2" />
      Leave Review
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-navy">
            Share Your Experience with {lawyerName}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Rate your experience *</Label>
            <div className="flex justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-8 w-8 cursor-pointer transition-colors ${
                    star <= feedback.rating 
                      ? 'text-yellow-500 fill-current' 
                      : 'text-gray-300 hover:text-yellow-400'
                  }`}
                  onClick={() => handleStarClick(star)}
                />
              ))}
            </div>
            {feedback.rating > 0 && (
              <p className="text-sm text-center text-gray-600">
                {feedback.rating} out of 5 stars
              </p>
            )}
          </div>

          {/* Service Type */}
          <div className="space-y-2">
            <Label htmlFor="serviceType">Service Type</Label>
            <Select 
              value={feedback.serviceType} 
              onValueChange={(value) => setFeedback({ ...feedback, serviceType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="document_review">Document Review</SelectItem>
                <SelectItem value="legal_advice">Legal Advice</SelectItem>
                <SelectItem value="representation">Legal Representation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={feedback.title}
              onChange={(e) => setFeedback({ ...feedback, title: e.target.value })}
              placeholder="Summarize your experience in a few words"
              required
              maxLength={100}
            />
            <p className="text-xs text-gray-500">{feedback.title.length}/100 characters</p>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Your Review *</Label>
            <Textarea
              id="comment"
              value={feedback.comment}
              onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
              placeholder="Share details about your experience with this lawyer..."
              className="min-h-[100px]"
              required
              maxLength={1000}
            />
            <p className="text-xs text-gray-500">{feedback.comment.length}/1000 characters</p>
          </div>

          {/* Submit button */}
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-teal hover:bg-teal-light text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LawyerFeedbackDialog;