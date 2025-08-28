import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, MessageSquare, Calendar, User, MoreHorizontal, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Review {
  _id: string;
  rating: number;
  title: string;
  comment: string;
  serviceType: string;
  clientName: string;
  isAnonymous: boolean;
  helpfulVotes: number;
  createdAt: string;
  response?: {
    message: string;
    respondedAt: string;
  };
}

interface RatingStats {
  averageRating: number;
  totalReviews: number;
  distribution: { [key: number]: number };
}

interface LawyerFeedbackListProps {
  lawyerId: string;
  isLawyerView?: boolean; // If true, shows lawyer-specific actions like responding
  limit?: number;
  showAll?: boolean;
}

const LawyerFeedbackList: React.FC<LawyerFeedbackListProps> = ({
  lawyerId,
  isLawyerView = false,
  limit = 10,
  showAll = false
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const { toast } = useToast();

  const fetchReviews = async (pageNum = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const response = await fetch(
        `http://localhost:5000/api/lawyer-feedback/lawyer/${lawyerId}?page=${pageNum}&limit=${limit}`
      );
      
      const data = await response.json();

      if (data.success) {
        const newReviews = data.data.feedback;
        setReviews(prev => append ? [...prev, ...newReviews] : newReviews);
        setRatingStats(data.data.ratingStats);
        setHasMore(data.data.pagination.hasNext);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [lawyerId]);

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/lawyer-feedback/${reviewId}/helpful`,
        { method: 'PUT' }
      );
      
      const data = await response.json();
      
      if (data.success) {
        setReviews(prev => prev.map(review => 
          review._id === reviewId 
            ? { ...review, helpfulVotes: data.data.helpfulVotes }
            : review
        ));
        toast({
          title: "Thank you!",
          description: "Your feedback has been recorded."
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark as helpful",
        variant: "destructive"
      });
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage, true);
  };

  const getServiceTypeLabel = (type: string) => {
    const labels = {
      consultation: 'Consultation',
      document_review: 'Document Review',
      legal_advice: 'Legal Advice',
      representation: 'Legal Representation',
      other: 'Other'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const RatingDistribution = ({ stats }: { stats: RatingStats }) => (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map(rating => (
        <div key={rating} className="flex items-center space-x-2">
          <span className="text-sm w-8">{rating}</span>
          <Star className="h-3 w-3 text-yellow-500" />
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full"
              style={{ 
                width: `${stats.totalReviews > 0 ? (stats.distribution[rating] / stats.totalReviews) * 100 : 0}%` 
              }}
            />
          </div>
          <span className="text-sm text-gray-600 w-8">
            {stats.distribution[rating] || 0}
          </span>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading reviews...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {ratingStats && ratingStats.totalReviews > 0 && (
        <Card className="shadow-soft border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-navy">Reviews Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-navy mb-2">
                  {ratingStats.averageRating.toFixed(1)}
                </div>
                <div className="flex justify-center mb-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(ratingStats.averageRating)
                          ? 'text-yellow-500 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600">
                  Based on {ratingStats.totalReviews} review{ratingStats.totalReviews !== 1 ? 's' : ''}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Rating Distribution</h4>
                <RatingDistribution stats={ratingStats} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card className="shadow-soft border-0">
            <CardContent className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No reviews yet</p>
              <p className="text-sm text-gray-500">Be the first to leave a review!</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review._id} className="shadow-soft border-0">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star 
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? 'text-yellow-500 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {getServiceTypeLabel(review.serviceType)}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-navy mb-2">{review.title}</h4>
                    <p className="text-gray-600 mb-3">{review.comment}</p>
                  </div>
                  
                  {isLawyerView && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          Respond to Review
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Report Review
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Review footer */}
                <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{review.isAnonymous ? 'Anonymous' : review.clientName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(review.createdAt)}</span>
                    </div>
                  </div>
                  
                  {!isLawyerView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkHelpful(review._id)}
                      className="text-gray-500 hover:text-teal"
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      Helpful ({review.helpfulVotes})
                    </Button>
                  )}
                </div>

                {/* Lawyer response */}
                {review.response && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-teal">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-teal text-white">Lawyer Response</Badge>
                      <span className="text-xs text-gray-500">
                        {formatDate(review.response.respondedAt)}
                      </span>
                    </div>
                    <p className="text-gray-700">{review.response.message}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Load More button */}
      {hasMore && showAll && (
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={loadMore}
            disabled={loadingMore}
            className="border-teal text-teal hover:bg-teal hover:text-white"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Reviews'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default LawyerFeedbackList;