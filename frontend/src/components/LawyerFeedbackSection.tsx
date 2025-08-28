import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, Users, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import LawyerFeedbackDialog from './LawyerFeedbackDialog';

interface LawyerStats {
  _id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  location: string;
  isVerified: boolean;
  averageRating: number;
  totalReviews: number;
  recentReviews: any[];
}

const LawyerFeedbackSection: React.FC = () => {
  const [topLawyers, setTopLawyers] = useState<LawyerStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopLawyers();
  }, []);

  const fetchTopLawyers = async () => {
    try {
      setLoading(true);
      // For demo purposes, we'll create mock data
      // In a real implementation, you'd fetch from an API endpoint
      const mockLawyers: LawyerStats[] = [
        {
          _id: '1',
          firstName: 'Sarah',
          lastName: 'Johnson',
          specialization: 'Corporate Law',
          location: 'New York, NY',
          isVerified: true,
          averageRating: 4.9,
          totalReviews: 127,
          recentReviews: []
        },
        {
          _id: '2',
          firstName: 'Michael',
          lastName: 'Chen',
          specialization: 'Immigration Law',
          location: 'Los Angeles, CA',
          isVerified: true,
          averageRating: 4.8,
          totalReviews: 89,
          recentReviews: []
        },
        {
          _id: '3',
          firstName: 'Emily',
          lastName: 'Rodriguez',
          specialization: 'Family Law',
          location: 'Chicago, IL',
          isVerified: true,
          averageRating: 4.7,
          totalReviews: 156,
          recentReviews: []
        }
      ];

      setTimeout(() => {
        setTopLawyers(mockLawyers);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching top lawyers:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy mb-4">Lawyer Feedback</h2>
            <p className="text-xl text-gray-600">Share your experience with our lawyers</p>
          </div>
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading lawyer information...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy mb-4">Lawyer Feedback</h2>
          <p className="text-xl text-gray-600">
            Share your experience and help others find the right legal representation
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="shadow-soft border-0 text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-teal" />
              </div>
              <h3 className="text-2xl font-bold text-navy mb-2">
                {topLawyers.reduce((total, lawyer) => total + lawyer.totalReviews, 0)}+
              </h3>
              <p className="text-gray-600">Total Reviews</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-0 text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
              <h3 className="text-2xl font-bold text-navy mb-2">
                {topLawyers.length > 0 
                  ? (topLawyers.reduce((total, lawyer) => total + lawyer.averageRating, 0) / topLawyers.length).toFixed(1)
                  : '0.0'
                }
              </h3>
              <p className="text-gray-600">Average Rating</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-0 text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-teal" />
              </div>
              <h3 className="text-2xl font-bold text-navy mb-2">98%</h3>
              <p className="text-gray-600">Satisfaction Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Rated Lawyers */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-navy text-center mb-8">
            Top Rated Lawyers
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topLawyers.map((lawyer) => (
              <Card key={lawyer._id} className="shadow-soft border-0 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-teal rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
                      {lawyer.firstName[0]}{lawyer.lastName[0]}
                    </div>
                    <h4 className="text-lg font-semibold text-navy mb-1">
                      {lawyer.firstName} {lawyer.lastName}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">{lawyer.specialization}</p>
                    <p className="text-xs text-gray-500">{lawyer.location}</p>
                  </div>

                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(lawyer.averageRating)
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold">{lawyer.averageRating}</span>
                    <span className="text-xs text-gray-500">({lawyer.totalReviews} reviews)</span>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Button asChild variant="outline" className="border-teal text-teal hover:bg-teal hover:text-white">
                      <Link to={`/lawyer/${lawyer._id}`}>
                        View Profile
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                    
                    <LawyerFeedbackDialog 
                      lawyerId={lawyer._id}
                      lawyerName={`${lawyer.firstName} ${lawyer.lastName}`}
                      trigger={
                        <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Leave Feedback
                        </Button>
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="shadow-soft border-0 bg-gradient-to-r from-teal to-teal-light text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">
                Had an Experience with One of Our Lawyers?
              </h3>
              <p className="text-lg mb-6 opacity-90">
                Your feedback helps us maintain quality service and helps other clients make informed decisions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="outline" className="bg-white text-teal border-white hover:bg-gray-100">
                  <Link to="/find-lawyer">
                    Find a Lawyer
                  </Link>
                </Button>
                <Button asChild variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-teal">
                  <Link to="/contact">
                    Contact Support
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default LawyerFeedbackSection;