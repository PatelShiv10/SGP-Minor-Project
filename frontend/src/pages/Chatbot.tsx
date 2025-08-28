import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Plus, Settings, User, Bot, Menu, X, ChevronLeft, ChevronRight, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatSession {
  id: number;
  title: string;
  preview: string;
  timestamp: Date;
}

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm Legal AI, your AI legal assistant. I can help you understand legal concepts, analyze documents, and answer questions about various areas of law. What would you like to know?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSessions] = useState<ChatSession[]>([
    { id: 1, title: 'Contract Review', preview: 'Need help reviewing employment contract', timestamp: new Date() },
    { id: 2, title: 'Tenant Rights', preview: 'Questions about rental agreements', timestamp: new Date() },
    { id: 3, title: 'Business Formation', preview: 'LLC vs Corporation comparison', timestamp: new Date() },
    { id: 4, title: 'Intellectual Property', preview: 'Trademark registration process', timestamp: new Date() },
    { id: 5, title: 'Family Law', preview: 'Child custody arrangements', timestamp: new Date() },
    { id: 6, title: 'Criminal Defense', preview: 'Rights during arrest', timestamp: new Date() },
    { id: 7, title: 'Employment Law', preview: 'Workplace discrimination case', timestamp: new Date() },
    { id: 8, title: 'Real Estate', preview: 'Property purchase agreement', timestamp: new Date() },
    { id: 9, title: 'Tax Law', preview: 'Business tax deductions', timestamp: new Date() },
    { id: 10, title: 'Immigration', preview: 'Visa application process', timestamp: new Date() },
  ]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mock user data
  const currentUser = {
    name: "Andrew Neilson",
    email: "andrew@example.com"
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        text: `Thank you for your question: "${inputText}". This is a simulated AI response. In a real implementation, this would connect to an AI service to provide legal guidance based on your query. Please remember that this is for informational purposes only and does not constitute legal advice.`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="h-[calc(100vh-64px)] bg-gray-50 flex overflow-hidden">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden fixed top-20 left-4 z-50 bg-white shadow-soft border border-gray-200"
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={closeMobileMenu}
          />
        )}

        {/* Desktop Toggle Button - Outside Sidebar */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={`hidden lg:flex h-8 w-8 hover:bg-gray-100 flex-shrink-0 absolute top-20 z-50 bg-white border border-gray-200 shadow-sm ${
            sidebarCollapsed ? 'left-20' : 'left-[21rem]'
          } transition-all duration-300`}
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>

        {/* Sidebar */}
        <div className={`
          ${sidebarCollapsed ? 'w-16' : 'w-80'} 
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-white border-r border-gray-200 flex flex-col h-full fixed lg:relative left-0 top-0 
          transition-all duration-300 z-40 lg:z-auto
          ${mobileMenuOpen ? 'w-80' : ''}
        `}>
          
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link to="/" className="flex items-center space-x-2">
                  <Scale className="h-8 w-8 text-teal" />
                  {!sidebarCollapsed && (
                    <span className="text-2xl font-bold text-navy">Legal AI</span>
                  )}
                </Link>
              </div>
              
              {/* Mobile Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={closeMobileMenu}
                className="lg:hidden h-8 w-8 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Sidebar Content */}
          {!sidebarCollapsed && (
            <>
              {/* New Chat Button */}
              <div className="p-4 flex-shrink-0">
                <Button 
                  className="w-full bg-teal hover:bg-teal-light text-white rounded-lg flex items-center gap-3 py-3"
                  onClick={() => {
                    setMessages([{
                      id: 1,
                      text: "Hello! I'm Legal AI, your AI legal assistant. I can help you understand legal concepts, analyze documents, and answer questions about various areas of law. What would you like to know?",
                      isUser: false,
                      timestamp: new Date()
                    }]);
                    closeMobileMenu();
                  }}
                >
                  <Plus className="h-5 w-5" />
                  New Chat
                </Button>
              </div>

              {/* Chat History Label */}
              <div className="px-4 py-2 flex-shrink-0">
                <span className="text-sm font-medium text-gray-600">Your Conversations</span>
              </div>
              
              {/* Scrollable Chat History */}
              <div className="flex-1 overflow-hidden px-4">
                <ScrollArea className="h-full">
                  <div className="space-y-2 pb-2">
                    {chatSessions.map((session) => (
                      <div 
                        key={session.id} 
                        className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-100 transition-colors"
                        onClick={closeMobileMenu}
                      >
                        <div className="text-sm font-medium text-gray-900 mb-1 truncate">{session.title}</div>
                        <div className="text-xs text-gray-600 line-clamp-2">{session.preview}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Bottom Section - Fixed */}
              <div className="border-t border-gray-200 p-3 space-y-1 flex-shrink-0 bg-white">
                <Link 
                  to="/legal-ai-settings"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors w-full"
                  onClick={closeMobileMenu}
                >
                  <Settings className="h-4 w-4 text-gray-600 flex-shrink-0" />
                  <span className="text-sm text-gray-900 font-medium">Settings</span>
                </Link>
              </div>
            </>
          )}

          {/* Collapsed Sidebar Content */}
          {sidebarCollapsed && (
            <div className="hidden lg:flex flex-col h-full">
              {/* New Chat Button - Collapsed */}
              <div className="p-3 flex-shrink-0 flex justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 hover:bg-gray-100"
                  title="New Chat"
                  onClick={() => {
                    setMessages([{
                      id: 1,
                      text: "Hello! I'm Legal AI, your AI legal assistant. I can help you understand legal concepts, analyze documents, and answer questions about various areas of law. What would you like to know?",
                      isUser: false,
                      timestamp: new Date()
                    }]);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Spacer */}
              <div className="flex-1"></div>
              
              {/* Bottom Section - Collapsed */}
              <div className="border-t border-gray-200 p-2 space-y-2 flex-shrink-0 bg-white flex flex-col items-center">
                <Link to="/legal-ai-settings">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-10 h-10 hover:bg-gray-100" 
                    title="Settings"
                  >
                    <Settings className="h-4 w-4 text-gray-600" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-full">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto pt-16 lg:pt-6">
            <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-3 lg:gap-4">
                  {/* Avatar */}
                  <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.isUser 
                      ? 'bg-gray-100' 
                      : 'bg-teal text-white'
                  }`}>
                    {message.isUser ? (
                      <User className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600" />
                    ) : (
                      <Bot className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900">
                        {message.isUser ? 'You' : 'Legal AI'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 lg:p-4 border border-gray-200 shadow-sm">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm lg:text-base break-words">
                        {message.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 lg:gap-4">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-teal text-white flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900">Legal AI</span>
                    </div>
                    <div className="bg-white rounded-lg p-3 lg:p-4 border border-gray-200">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-teal rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-teal rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-teal rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-600">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
            <div className="max-w-4xl mx-auto w-full">
              <div className="relative">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask your legal question..."
                  className="w-full pr-12 border-gray-300 focus:border-teal focus:ring-teal rounded-lg py-3 px-4 text-sm lg:text-base"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isLoading}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-teal hover:bg-teal-light text-white rounded-lg w-8 h-8 lg:w-10 lg:h-10 p-0"
                >
                  <Send className="h-3 w-3 lg:h-4 lg:w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
