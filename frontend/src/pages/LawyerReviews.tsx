
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, TrendingUp, MessageCircle } from 'lucide-react';
import { LawyerSidebar } from '@/components/lawyer/LawyerSidebar';
import { LawyerTopBar } from '@/components/lawyer/LawyerTopBar';

const LawyerReviews = () => {
  const [currentPage, setCurrentPage] = useState('reviews');

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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <LawyerSidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <div className="flex-1 flex flex-col">
        <LawyerTopBar />
        
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl lg:text-3xl font-bold text-navy mb-6">Reviews</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="shadow-soft border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Average Rating</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-2xl font-bold text-navy">{averageRating.toFixed(1)}</p>
                        <div className="flex">{renderStars(Math.round(averageRating))}</div>
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
                      <p className="text-2xl font-bold text-navy">{reviews.length}</p>
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
                      <p className="text-sm text-gray-600">This Month</p>
                      <p className="text-2xl font-bold text-navy">+3</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
              {reviews.map((review) => (
                <Card key={review.id} className="shadow-soft border-0">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-teal rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {review.client.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-navy">{review.client}</h3>
                          <div className="flex items-center space-x-2">
                            <div className="flex">{renderStars(review.rating)}</div>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{review.comment}</p>
                    
                    {review.response ? (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-sm font-medium text-navy mb-1">Your Response:</p>
                        <p className="text-sm text-gray-700">{review.response}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Textarea 
                          placeholder="Write your response..."
                          rows={3}
                        />
                        <Button className="bg-teal hover:bg-teal-light text-white">
                          Post Response
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LawyerReviews;
