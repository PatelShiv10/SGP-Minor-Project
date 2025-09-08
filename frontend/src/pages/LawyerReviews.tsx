
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, TrendingUp, MessageCircle, Reply, Filter, Search, Loader2, MessageSquare } from 'lucide-react';
import { LawyerSidebar } from '@/components/lawyer/LawyerSidebar';
import { LawyerTopBar } from '@/components/lawyer/LawyerTopBar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface FeedbackStats {
  averageRating: number;
  totalReviews: number;
  distribution: { [key: number]: number };
  recentReviews: any[];
}

const LawyerReviews = () => {
  const [currentPage, setCurrentPage] = useState('reviews');
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [responseText, setResponseText] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  // Mock data for now - replace with actual API calls
  const reviews = [
    {
      id: 1,
      client: "John Smith",
      rating: 5,
      date: "2024-01-15",
      comment: "Excellent service! Very professional and knowledgeable. Helped me resolve my case quickly.",
      response: null
    },
    {
      id: 2,
      client: "Sarah Johnson",
      rating: 4,
      date: "2024-01-14",
      comment: "Good communication and fair pricing. Would recommend to others.",
      response: "Thank you for your feedback! It was a pleasure working with you."
    },
    {
      id: 3,
      client: "Mike Wilson",
      rating: 5,
      date: "2024-01-12",
      comment: "Outstanding legal representation. Dr. Smith went above and beyond to help with my case.",
      response: null
    }
  ];

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userId = user?.id;
      if (!userId) return; // no-op if not available

      const response = await fetch(
        `http://localhost:5000/api/lawyer-feedback/lawyer/${userId}/summary`,
        {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Error",
        description: "Failed to load feedback statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async () => {
    try {
      setLoadingFeedback(true);
      const token = localStorage.getItem('token');
      const userId = user?.id;
      if (!userId) return; // no-op if not available

      const response = await fetch(
        `http://localhost:5000/api/lawyer-feedback/lawyer/${userId}`,
        {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setFeedback(data.data.feedback || []);
        // Also update stats with the latest data
        if (data.data.ratingStats) {
          setStats(data.data.ratingStats);
        }
      } else {
        console.error('Failed to fetch feedback:', data.message);
        toast({
          title: "Error",
          description: data.message || "Failed to load feedback",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast({
        title: "Error",
        description: "Failed to load feedback",
        variant: "destructive"
      });
    } finally {
      setLoadingFeedback(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchFeedback();
    
    // Set up polling to check for new reviews every 30 seconds
    const interval = setInterval(() => {
      fetchFeedback();
    }, 30000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleRespondToReview = async (review: any) => {
    setSelectedReview(review);
    setResponseText('');
    setResponseDialogOpen(true);
  };

  const submitResponse = async () => {
    if (!selectedReview || !responseText.trim()) return;

    setIsSubmittingResponse(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/lawyer-feedback/${selectedReview._id}/respond`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ message: responseText.trim() })
        }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Response Sent",
          description: "Your response has been added to the review."
        });
        setResponseDialogOpen(false);
        setSelectedReview(null);
        setResponseText('');
        // Refresh the feedback
        fetchFeedback();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send response",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send response",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const renderRatingDistribution = () => {
    if (!stats?.distribution) return null;

    return Object.entries(stats.distribution).reverse().map(([rating, count]) => (
      <div key={rating} className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">{rating} stars</span>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-yellow-400 h-2 rounded-full" 
            style={{ width: `${(count / stats.totalReviews) * 100}%` }}
          />
        </div>
        <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <LawyerSidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <div className="flex-1 flex flex-col">
        <LawyerTopBar />
        
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl lg:text-3xl font-bold text-navy mb-6">Reviews & Feedback</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="reviews">All Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="shadow-soft border-0">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Average Rating</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-2xl font-bold text-navy">
                              {stats?.averageRating?.toFixed(1) || averageRating.toFixed(1)}
                            </p>
                            <div className="flex">{renderStars(Math.round(stats?.averageRating || averageRating))}</div>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-yellow-50">
                          <Star className="h-6 w-6 text-yellow-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-soft border-0">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Reviews</p>
                          <p className="text-2xl font-bold text-navy">
                            {stats?.totalReviews || reviews.length}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-50">
                          <MessageCircle className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-soft border-0">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Response Rate</p>
                          <p className="text-2xl font-bold text-navy">
                            {stats?.recentReviews ? 
                              `${Math.round((stats.recentReviews.filter(r => r.response).length / stats.recentReviews.length) * 100)}%` : 
                              '85%'
                            }
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-green-50">
                          <Reply className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Rating Distribution */}
                <Card className="shadow-soft border-0">
                  <CardHeader>
                    <CardTitle className="text-lg text-navy">Rating Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {renderRatingDistribution()}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Reviews */}
                <Card className="shadow-soft border-0">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-navy">Recent Reviews</CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          fetchFeedback();
                          fetchStats();
                        }}
                      >
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {loadingFeedback ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <span className="ml-2">Loading reviews...</span>
                        </div>
                      ) : feedback.length === 0 ? (
                        <div className="text-center p-8">
                          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-600 mb-2">No reviews yet</h3>
                          <p className="text-gray-500">Reviews from your clients will appear here once they are submitted.</p>
                        </div>
                      ) : feedback.slice(0, 3).map((review, index) => (
                        <div key={review._id || review.id || index} className="border-b border-gray-100 pb-4 last:border-b-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <div className="flex">{renderStars(review.rating || 5)}</div>
                                <span className="text-sm text-gray-600">
                                  {review.clientName || review.client || 'Anonymous'}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {new Date(review.createdAt || review.date).toLocaleDateString()}
                                </span>
                                {!review.isApproved && (
                                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                    Pending Approval
                                  </Badge>
                                )}
                              </div>
                              <h4 className="font-medium text-navy mb-1">{review.title}</h4>
                              <p className="text-gray-700">{review.comment}</p>
                              {review.response && (
                                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                  <p className="text-sm text-blue-800">
                                    <strong>Your response:</strong> {review.response.message || review.response}
                                  </p>
                                </div>
                              )}
                            </div>
                            {!review.response && review.isApproved && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRespondToReview(review)}
                                className="ml-4"
                              >
                                <Reply className="h-4 w-4 mr-2" />
                                Respond
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <Card className="shadow-soft border-0">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-navy">All Reviews ({feedback.length})</CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          fetchFeedback();
                          fetchStats();
                        }}
                      >
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {loadingFeedback ? (
                        <div className="flex items-center justify-center p-8">
                          <Loader2 className="h-8 w-8 animate-spin" />
                          <span className="ml-2">Loading reviews...</span>
                        </div>
                      ) : feedback.length === 0 ? (
                        <div className="text-center p-8">
                          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-600 mb-2">No reviews yet</h3>
                          <p className="text-gray-500 mb-4">Reviews from your clients will appear here once they are submitted.</p>
                          <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
                            <p><strong>Note:</strong> Reviews are automatically approved and will appear immediately after submission.</p>
                          </div>
                        </div>
                      ) : (
                        feedback.map((review) => (
                          <div key={review._id} className="border-b border-gray-100 pb-4 last:border-b-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                                              <div className="flex items-center space-x-2 mb-2">
                                <div className="flex">{renderStars(review.rating)}</div>
                                <span className="text-sm text-gray-600">
                                  {review.clientName || 'Anonymous'}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                                {review.isApproved === false && (
                                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                    Pending Approval
                                  </Badge>
                                )}
                                {review.isApproved === true && (
                                  <Badge className="bg-green-100 text-green-800 text-xs">
                                    Approved
                                  </Badge>
                                )}
                              </div>
                                <p className="text-gray-700">{review.comment}</p>
                                {review.response && (
                                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                      <strong>Your response:</strong> {review.response.message}
                                    </p>
                                  </div>
                                )}
                              </div>
                              {!review.response && review.isApproved && (
                                <Button
                                  variant="outline"
                              <h4 className="font-medium text-navy mb-1">{review.title}</h4>
                              <p className="text-gray-700">{review.comment}</p>
                                  onClick={() => handleRespondToReview(review)}
                                  className="ml-4"
                                >
                                  <Reply className="h-4 w-4 mr-2" />
                                  Respond
                                </Button>
                              )}
                            </div>
                            {!review.response && review.isApproved !== false && (
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Review from {selectedReview?.clientName || selectedReview?.client || 'Anonymous'}:</p>
              <p className="text-gray-800 p-3 bg-gray-50 rounded-lg">
                {selectedReview?.comment}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Your Response
              </label>
              <Textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Write your response to this review..."
                className="min-h-[100px]"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setResponseDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={submitResponse}
                disabled={!responseText.trim() || isSubmittingResponse}
                className="bg-teal hover:bg-teal-light text-white"
              >
                {isSubmittingResponse ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  'Send Response'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LawyerReviews;
