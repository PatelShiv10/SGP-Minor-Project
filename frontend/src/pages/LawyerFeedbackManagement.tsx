import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, MessageSquare, Calendar, User, Reply, TrendingUp, Filter, Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LawyerFeedbackList from '@/components/LawyerFeedbackList';

interface FeedbackStats {
  averageRating: number;
  totalReviews: number;
  distribution: { [key: number]: number };
  recentReviews: any[];
}

const LawyerFeedbackManagement = () => {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [responseText, setResponseText] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userId = JSON.parse(localStorage.getItem('user') || '{}').id;

      const response = await fetch(
        `http://localhost:5000/api/lawyer-feedback/lawyer/${userId}/summary`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load feedback statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

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
        // Refresh the feedback list
        fetchStats();
      } else {
        throw new Error(data.message || 'Failed to submit response');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit response",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, description }: any) => (
    <Card className="shadow-soft border-0">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-navy">{value}</p>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <Icon className="h-8 w-8 text-teal" />
        </div>
      </CardContent>
    </Card>
  );

  const userId = JSON.parse(localStorage.getItem('user') || '{}').id;

  if (loading) {
    return (
      <div className="min-h-screen py-16 bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading feedback data...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Feedback Management</h1>
          <p className="text-gray-600">Monitor and respond to client feedback</p>
        </div>

        {/* Statistics Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Average Rating"
              value={stats.averageRating ? stats.averageRating.toFixed(1) : 'N/A'}
              icon={Star}
              description={`Based on ${stats.totalReviews} reviews`}
            />
            <StatCard
              title="Total Reviews"
              value={stats.totalReviews}
              icon={MessageSquare}
              description="All time reviews"
            />
            <StatCard
              title="Recent Activity"
              value={stats.recentReviews?.length || 0}
              icon={TrendingUp}
              description="Reviews in last 30 days"
            />
          </div>
        )}

        {/* Rating Distribution */}
        {stats && stats.totalReviews > 0 && (
          <Card className="shadow-soft border-0 mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-navy">Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map(rating => (
                  <div key={rating} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 w-12">
                      <span className="text-sm">{rating}</span>
                      <Star className="h-3 w-3 text-yellow-500" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${stats.totalReviews > 0 ? (stats.distribution[rating] / stats.totalReviews) * 100 : 0}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {stats.distribution[rating] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="all-reviews" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all-reviews">All Reviews</TabsTrigger>
            <TabsTrigger value="recent-reviews">Recent Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="all-reviews">
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-navy">All Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <LawyerFeedbackList 
                  lawyerId={userId}
                  isLawyerView={true}
                  showAll={true}
                  limit={10}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent-reviews">
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-navy">Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <LawyerFeedbackList 
                  lawyerId={userId}
                  isLawyerView={true}
                  showAll={false}
                  limit={5}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Response Dialog */}
        <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-navy">Respond to Review</DialogTitle>
            </DialogHeader>
            
            {selectedReview && (
              <div className="space-y-4">
                {/* Review Preview */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star}
                          className={`h-4 w-4 ${
                            star <= selectedReview.rating
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      by {selectedReview.clientName}
                    </span>
                  </div>
                  <h4 className="font-semibold mb-1">{selectedReview.title}</h4>
                  <p className="text-sm text-gray-600">{selectedReview.comment}</p>
                </div>

                {/* Response Form */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    Your Response
                  </label>
                  <Textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Thank you for your feedback. I appreciate..."
                    className="min-h-[100px]"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500">{responseText.length}/500 characters</p>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setResponseDialogOpen(false)}
                    disabled={isSubmittingResponse}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={submitResponse}
                    disabled={isSubmittingResponse || !responseText.trim()}
                    className="bg-teal hover:bg-teal-light text-white"
                  >
                    {isSubmittingResponse ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Reply className="h-4 w-4 mr-2" />
                        Send Response
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default LawyerFeedbackManagement;