
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Video, VideoOff, Mic, MicOff, PhoneOff, ArrowLeft } from 'lucide-react';

const VideoCall = () => {
  const { sessionId } = useParams();
  const [isJoined, setIsJoined] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock appointment time - in real app, this would come from the booking
  const appointmentTime = new Date();
  appointmentTime.setMinutes(appointmentTime.getMinutes() + 2); // 2 minutes from now for demo

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const canJoin = currentTime >= appointmentTime;

  const handleJoinCall = () => {
    setIsJoined(true);
  };

  const handleLeaveCall = () => {
    setIsJoined(false);
  };

  if (isJoined) {
    return (
      <div className="h-screen bg-black flex flex-col">
        {/* Video Area */}
        <div className="flex-1 relative">
          {/* Main Video (Lawyer) */}
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <div className="w-32 h-32 bg-teal text-white rounded-full flex items-center justify-center text-4xl font-semibold">
              SJ
            </div>
            <div className="absolute bottom-4 left-4 text-white">
              <p className="font-medium">Sarah Johnson</p>
              <p className="text-sm opacity-75">Corporate Lawyer</p>
            </div>
          </div>

          {/* User Video (Picture-in-Picture) */}
          <div className="absolute top-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 bg-gray-600 text-white rounded-full flex items-center justify-center text-xl font-semibold">
                You
              </div>
            </div>
          </div>

          {/* Call Info */}
          <div className="absolute top-4 left-4 bg-black/50 text-white px-4 py-2 rounded-lg">
            <p className="text-sm">Legal Consultation</p>
            <p className="text-lg font-mono">
              {String(Math.floor(Math.random() * 60)).padStart(2, '0')}:
              {String(Math.floor(Math.random() * 60)).padStart(2, '0')}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-900 p-6">
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setVideoEnabled(!videoEnabled)}
              className={`rounded-full w-14 h-14 ${
                videoEnabled 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {videoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`rounded-full w-14 h-14 ${
                audioEnabled 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {audioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </Button>
            
            <Button
              variant="destructive"
              size="lg"
              onClick={handleLeaveCall}
              className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/find-lawyer">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lawyers
          </Link>
        </Button>

        <Card className="shadow-soft border-0">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 bg-teal text-white rounded-full flex items-center justify-center text-2xl font-semibold mx-auto mb-6">
              <Video className="h-12 w-12" />
            </div>
            
            <h1 className="text-3xl font-bold text-navy mb-4">Video Consultation</h1>
            
            <div className="bg-blue-50 p-6 rounded-lg mb-8">
              <h3 className="font-semibold text-navy mb-3">Session Details</h3>
              <div className="space-y-2 text-gray-700">
                <p><strong>Lawyer:</strong> Sarah Johnson</p>
                <p><strong>Specialization:</strong> Corporate Law</p>
                <p><strong>Session ID:</strong> {sessionId}</p>
                <p><strong>Scheduled Time:</strong> {appointmentTime.toLocaleString()}</p>
              </div>
            </div>

            {canJoin ? (
              <div>
                <p className="text-lg text-gray-600 mb-6">
                  Your consultation session is ready to start.
                </p>
                <Button
                  onClick={handleJoinCall}
                  size="lg"
                  className="bg-teal hover:bg-teal-light text-white px-8 py-3 text-lg"
                >
                  <Video className="h-5 w-5 mr-2" />
                  Join Video Call
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-lg text-gray-600 mb-4">
                  Your session will start at {appointmentTime.toLocaleTimeString()}
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  The join button will be enabled at your scheduled appointment time.
                </p>
                <Button
                  disabled
                  size="lg"
                  className="px-8 py-3 text-lg opacity-50 cursor-not-allowed"
                >
                  <Video className="h-5 w-5 mr-2" />
                  Join Video Call
                </Button>
              </div>
            )}

            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Preparation Tips:</strong> Have your questions ready, ensure stable internet connection, 
                and find a quiet space for the consultation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VideoCall;
