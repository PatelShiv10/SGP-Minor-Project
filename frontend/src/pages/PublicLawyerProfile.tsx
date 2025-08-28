import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Phone, MessageCircle, Calendar, Clock, DollarSign, Award, Users, CheckCircle, Shield, Loader2 } from 'lucide-react';
import LawyerFeedbackDialog from '@/components/LawyerFeedbackDialog';
import LawyerFeedbackList from '@/components/LawyerFeedbackList';

interface PublicLawyer {
  _id: string;
  firstName: string;
  lastName: string;
  location?: string;
  specialization?: string;
  experience?: number;
  bio?: string;
  education?: string[];
  certifications?: string[];
  availability?: { day: string; isActive: boolean; timeSlots: { startTime: string; endTime: string; isActive: boolean }[] }[];
  isVerified: boolean;
}

const PublicLawyerProfile = () => {
  const { id } = useParams();
  const [lawyer, setLawyer] = useState<PublicLawyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLawyer = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/lawyers/${id}/public`);
        if (!res.ok) throw new Error('Failed to load lawyer profile');
        const data = await res.json();
        setLawyer(data.data);
      } catch (err) {
        setError('Failed to load lawyer profile');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchLawyer();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen py-16 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading lawyer...</p>
        </div>
      </div>
    );
  }

  if (error || !lawyer) {
    return (
      <div className="min-h-screen py-16 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Not found'}</p>
          <Button asChild>
            <Link to="/find-lawyer">Back to list</Link>
          </Button>
        </div>
      </div>
    );
  }

  const fullName = `${lawyer.firstName} ${lawyer.lastName}`;

  return (
    <div className="min-h-screen py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Card className="mb-8 shadow-soft border-0">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
              <div className="w-32 h-32 rounded-lg bg-teal text-white flex items-center justify-center text-3xl font-bold overflow-hidden">
                {lawyer['profileImage'] ? (
                  <img src={(lawyer as any)['profileImage']} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{lawyer.firstName?.[0]}{lawyer.lastName?.[0]}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-navy mb-2">{fullName}</h1>
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">{lawyer.location || 'Location not specified'}</span>
                    </div>
                    <div className="flex items-center space-x-1 mb-4">
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <span className="text-lg font-semibold">4.8</span>
                      <span className="text-gray-600">(12 reviews)</span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    {lawyer.isVerified && (
                      <Badge className="bg-green-100 text-green-800">
                        <Shield className="h-4 w-4 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {lawyer.specialization ? (
                    <Badge variant="outline" className="text-sm">{lawyer.specialization}</Badge>
                  ) : (
                    <Badge variant="outline" className="text-sm">General Practice</Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-teal" />
                    <span>{lawyer.experience ? `${lawyer.experience} years experience` : 'Experience not specified'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-teal" />
                    <span>$250/hour</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-teal" />
                    <span>120 clients served</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button asChild className="flex-1 bg-teal hover:bg-teal-light text-white">
                <Link to={`/booking/${lawyer._id}`}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Consultation
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 border-teal text-teal hover:bg-teal hover:text-white">
                <Link to={`/chat/${lawyer._id}`}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Link>
              </Button>
              <Button variant="outline" className="border-gray-300">
                <Phone className="h-4 w-4 mr-2" />
                Call Now
              </Button>
              <LawyerFeedbackDialog 
                lawyerId={lawyer._id}
                lawyerName={fullName}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-navy">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">{lawyer.bio || 'No bio provided.'}</p>
              </CardContent>
            </Card>

            {/* Education & Certifications */}
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-navy">Education & Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Education</h4>
                    <ul className="space-y-1">
                      {(lawyer.education || []).length > 0 ? (
                        lawyer.education!.map((edu, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <Award className="h-4 w-4 text-teal" />
                            <span className="text-gray-600">{edu}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500">No education details provided.</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Certifications</h4>
                    <ul className="space-y-1">
                      {(lawyer.certifications || []).length > 0 ? (
                        lawyer.certifications!.map((cert, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-teal" />
                            <span className="text-gray-600">{cert}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500">No certifications provided.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Availability Preview */}
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-navy">Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(lawyer.availability || []).filter(d => d.isActive).map(day => (
                    <div key={day.day}>
                      <div className="font-medium text-gray-800">{day.day}</div>
                      <div className="flex flex-wrap gap-2 mt-1 text-sm">
                        {day.timeSlots.filter(s => s.isActive).map((s, idx) => (
                          <Badge key={`${day.day}-${idx}`} variant="outline">{s.startTime} - {s.endTime}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                  {(lawyer.availability || []).every(d => !d.isActive) && (
                    <div className="text-gray-500">No availability provided.</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-navy">Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-teal" />
                    <span className="text-gray-600">Hidden</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-teal" />
                    <span className="text-gray-600">{lawyer.location || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8">
          <LawyerFeedbackList 
            lawyerId={lawyer._id}
            showAll={true}
            limit={5}
          />
        </div>
      </div>
    </div>
  );
};

export default PublicLawyerProfile;
