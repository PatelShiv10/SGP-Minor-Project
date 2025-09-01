
import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, ArrowLeft, Phone, Video } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  _id: string;
  text: string;
  sender: 'user' | 'lawyer';
  createdAt: string;
}

const ChatWithLawyer = () => {
  const { lawyerId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const userId = user?.id;

  const scrollToBottom = () => endRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        if (!lawyerId || !userId) return;
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({ lawyerId, userId });
        const res = await fetch(`http://localhost:5000/api/chat/conversation?${params.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load messages');
        const data = await res.json();
        setMessages(data.data);
      } catch (e) {
        setError('Failed to load conversation');
      } finally {
        setLoading(false);
      }
    };
    fetchConversation();
  }, [lawyerId, userId]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !lawyerId || !userId) return;
    const optimistic: Message = {
      _id: 'temp-' + Date.now(),
      text: inputText,
      sender: 'user',
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimistic]);
    setInputText('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ lawyerId, userId, text: optimistic.text })
      });
      if (!res.ok) throw new Error('Failed to send');
      const { data } = await res.json();
      setMessages(prev => prev.map(m => m._id === optimistic._id ? data : m));
    } catch (e) {
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
      alert('Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const lawyer = {
    name: 'Lawyer',
    specialization: 'General Law',
    avatar: 'L',
    status: 'online',
    hourlyRate: 250
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-soft p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost" size="sm">
              <Link to="/find-lawyer">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal text-white rounded-full flex items-center justify-center font-semibold">
                {lawyer.avatar}
              </div>
              <div>
                <h2 className="font-semibold text-navy">{lawyer.name}</h2>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">{lawyer.status}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to={`/video-call/${lawyerId}-${Date.now()}`}>
                <Video className="h-4 w-4 mr-2" />
                Video
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-teal hover:bg-teal-light text-white">
              <Link to={`/booking/${lawyerId}`}>Book Consultation</Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-1 gap-4 min-h-0">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            <Card className="flex-1 shadow-soft border-0 flex flex-col h-[calc(100vh-200px)]">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
                {loading && <div className="text-center text-gray-500">Loading...</div>}
                {error && <div className="text-center text-red-600">{error}</div>}
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                      <div className={`p-4 rounded-lg ${
                        message.sender === 'user' 
                          ? 'bg-teal text-white' 
                          : 'bg-gray-100'
                      }`}>
                        <p className="leading-relaxed">{message.text}</p>
                      </div>
                      <div className={`text-xs text-gray-500 mt-1 ${
                        message.sender === 'user' ? 'text-right' : 'text-left'
                      }`}>
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>

              {/* Input Area */}
              <div className="border-t p-4 flex-shrink-0">
                <div className="flex gap-2">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 border-gray-300 focus:border-teal focus:ring-teal"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim()}
                    className="bg-teal hover:bg-teal-light text-white px-6"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Lawyer Info Sidebar */}
          <div className="w-80">
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="text-lg text-navy">Lawyer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-teal text-white rounded-full flex items-center justify-center text-xl font-semibold mx-auto mb-3">
                    {lawyer.avatar}
                  </div>
                  <h3 className="font-semibold text-navy">{lawyer.name}</h3>
                  <p className="text-teal">{lawyer.specialization}</p>
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rate:</span>
                    <span className="font-medium">${lawyer.hourlyRate}/hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Response Time:</span>
                    <span className="font-medium">&lt; 5 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-green-600">Online</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> This chat is for initial consultation. 
                    For detailed legal advice, please book a formal consultation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWithLawyer;
