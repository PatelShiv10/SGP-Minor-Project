
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Clock, Calendar, User } from 'lucide-react';
import { LawyerSidebar } from '@/components/lawyer/LawyerSidebar';
import { LawyerTopBar } from '@/components/lawyer/LawyerTopBar';

const LawyerVideoCalls = () => {
  const [currentPage, setCurrentPage] = useState('video-calls');

  const videoSessions = [
    {
      id: 1,
      client: "John Smith",
      date: "2024-01-15",
      time: "10:00 AM",
      duration: "1 hour",
      status: "upcoming",
      sessionId: "session-123"
    },
    {
      id: 2,
      client: "Sarah Johnson",
      date: "2024-01-15",
      time: "2:00 PM",
      duration: "30 minutes",
      status: "live",
      sessionId: "session-456"
    },
    {
      id: 3,
      client: "Mike Wilson",
      date: "2024-01-14",
      time: "4:30 PM",
      duration: "45 minutes",
      status: "completed",
      sessionId: "session-789"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'live':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <LawyerSidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <div className="flex-1 flex flex-col">
        <LawyerTopBar />
        
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h1 className="text-2xl lg:text-3xl font-bold text-navy">Video Calls</h1>
              <Button className="bg-teal hover:bg-teal-light text-white w-full sm:w-auto">
                <Video className="h-4 w-4 mr-2" />
                Schedule Call
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videoSessions.map((session) => (
                <Card key={session.id} className="shadow-soft border-0 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-teal rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {session.client.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-navy">{session.client}</h3>
                          <p className="text-sm text-gray-600">Video Consultation</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{session.date}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{session.time} ({session.duration})</span>
                      </div>
                    </div>
                    
                    <Button 
                      className={`w-full ${
                        session.status === 'live' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-teal hover:bg-teal-light'
                      } text-white`}
                      disabled={session.status === 'completed'}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      {session.status === 'live' ? 'Join Now' : 
                       session.status === 'upcoming' ? 'Join Call' : 'Completed'}
                    </Button>
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

export default LawyerVideoCalls;
