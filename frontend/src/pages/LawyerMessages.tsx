import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Send, Search } from 'lucide-react';
import { LawyerSidebar } from '@/components/lawyer/LawyerSidebar';
import { LawyerTopBar } from '@/components/lawyer/LawyerTopBar';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  _id: string;
  sender: 'user' | 'lawyer';
  text: string;
  createdAt: string;
}

interface ConversationPreview {
  userId: string;
  name: string;
  unread: number;
  lastMessage?: string;
  lastTime?: string;
}

const LawyerMessages = () => {
  const [currentPage, setCurrentPage] = useState('messages');
  const { user } = useAuth();
  const lawyerId = user?.id;

  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      if (isNearBottom || messages.length === 0) {
        scrollToBottom();
      }
    }
  }, [messages]);

  useEffect(() => {
    const loadConversations = async () => {
      if (!lawyerId) return;
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/chat/conversations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load conversations');
        const data = await res.json();
        setConversations(data.data);
        if (!selectedUserId && data.data.length > 0) {
          setSelectedUserId(data.data[0].userId);
        }
      } catch {
        // ignore
      }
    };
    loadConversations();
  }, [lawyerId]);

  useEffect(() => {
    const loadConversation = async () => {
      if (!lawyerId || !selectedUserId) return;
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({ lawyerId, userId: selectedUserId });
        const res = await fetch(
          `http://localhost:5000/api/chat/conversation?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error('Failed to fetch conversation');
        const data = await res.json();
        setMessages(data.data);

        // refresh list
        try {
          const listRes = await fetch('http://localhost:5000/api/chat/conversations', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          if (listRes.ok) {
            const listData = await listRes.json();
            setConversations(listData.data);
          }
        } catch {
          // ignore
        }
      } catch {
        setError('Failed to load conversation');
      } finally {
        setLoading(false);
      }
    };
    loadConversation();
  }, [lawyerId, selectedUserId]);

  const handleSendMessage = async () => {
    if (!message.trim() || !lawyerId || !selectedUserId) return;
    const optimistic: Message = {
      _id: 'temp-' + Date.now(),
      sender: 'lawyer',
      text: message,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lawyerId, userId: selectedUserId, text: optimistic.text }),
      });
      if (!res.ok) throw new Error('Failed to send');
      const { data } = await res.json();
      setMessages((prev) => prev.map((m) => (m._id === optimistic._id ? data : m)));
    } catch {
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
      alert('Failed to send message');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <LawyerSidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <div className="flex-1 flex flex-col">
        <LawyerTopBar />

        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto h-full">
            <h1 className="text-2xl lg:text-3xl font-bold text-navy mb-6">Messages</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
              {/* Client List */}
              <Card className="shadow-soft border-0 lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Conversations</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input placeholder="Search conversations..." className="pl-10" />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {conversations.length === 0 && (
                      <div className="p-4 text-sm text-gray-500">No conversations yet</div>
                    )}
                    {conversations.map((client) => (
                      <button
                        key={client.userId}
                        onClick={() => setSelectedUserId(client.userId)}
                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                          selectedUserId === client.userId
                            ? 'bg-teal-50 border-l-4 border-l-teal'
                            : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-navy">{client.name}</h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {client.lastTime ? new Date(client.lastTime).toLocaleString() : ''}
                            </span>
                            {client.unread > 0 && (
                              <Badge className="bg-red-500 text-white text-xs">
                                {client.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{client.lastMessage}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Chat Area */}
              <Card className="shadow-soft border-0 lg:col-span-2 flex flex-col h-full">
                <CardHeader className="border-b border-gray-200">
                  <CardTitle className="text-lg">
                    {selectedUserId ? 'Conversation' : 'Select a conversation'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0 min-h-0">
                  {/* Messages */}
                  <div className="flex-1 p-4 space-y-4 overflow-y-auto min-h-0 messages-container max-h-[60vh]">
                    {loading && <div className="text-center text-gray-500">Loading...</div>}
                    {error && <div className="text-center text-red-600">{error}</div>}
                    {!selectedUserId ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Select a conversation to start messaging</p>
                      </div>
                    ) : (
                      <>
                        {messages.map((msg) => (
                          <div
                            key={msg._id}
                            className={`flex ${
                              msg.sender === 'lawyer' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[70%] ${
                                msg.sender === 'lawyer' ? 'order-2' : 'order-1'
                              }`}
                            >
                              <div
                                className={`p-4 rounded-lg ${
                                  msg.sender === 'lawyer' ? 'bg-teal text-white' : 'bg-gray-100'
                                }`}
                              >
                                <p className="leading-relaxed">{msg.text}</p>
                              </div>
                              <div
                                className={`text-xs text-gray-500 mt-1 ${
                                  msg.sender === 'lawyer' ? 'text-right' : 'text-left'
                                }`}
                              >
                                {new Date(msg.createdAt).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={endRef} />
                      </>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="border-t border-gray-200 p-4 flex-shrink-0">
                    <div className="flex gap-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === 'Enter' &&
                          !e.shiftKey &&
                          (e.preventDefault(), handleSendMessage())
                        }
                        placeholder="Type your message..."
                        className="flex-1 border-gray-300 focus:border-teal focus:ring-teal"
                        disabled={!selectedUserId}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!selectedUserId || !message.trim()}
                        className="bg-teal hover:bg-teal-light text-white px-6"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LawyerMessages;
