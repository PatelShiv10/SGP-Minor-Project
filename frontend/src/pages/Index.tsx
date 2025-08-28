import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ChevronDown, MessageSquare, FileText, Users, Video, Star, Send } from 'lucide-react';
import { useState } from 'react';

const Index = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Feedback submitted:', { rating, ...feedback });
    // Here you would typically send the feedback to your backend
    setFeedbackOpen(false);
    setRating(0);
    setFeedback({ name: '', email: '', message: '' });
  };

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const faqs = [
    {
      question: "What is LawMate and how does it work?",
      answer: "LawMate is an AI-powered legal assistant that helps users understand legal documents, simplify complex legal language, and connect with qualified lawyers. Our AI analyzes your legal questions and provides clear, understandable explanations."
    },
    {
      question: "Can I trust the AI legal advice?",
      answer: "While our AI provides helpful guidance based on legal knowledge, it should not replace professional legal counsel. Always consult with a qualified attorney for important legal decisions and specific legal advice."
    },
    {
      question: "How do I find the right lawyer for my case?",
      answer: "Use our Find a Lawyer feature to filter by specialization, location, and experience. Each lawyer profile includes ratings, reviews, and detailed information to help you make an informed choice."
    },
    {
      question: "Is my uploaded document information secure?",
      answer: "Yes, we use industry-standard encryption to protect your documents and personal information. Your data is processed securely and is not shared with third parties without your consent."
    }
  ];

  const features = [
    {
      icon: FileText,
      title: "LawSimplify",
      description: "Transform complex legal documents into simple, understandable language",
      link: "/lawsimplify"
    },
    {
      icon: MessageSquare,
      title: "Document Q&A",
      description: "Ask questions about your legal documents and get instant AI-powered answers",
      link: "/document-qa"
    },
    {
      icon: Users,
      title: "Find a Lawyer",
      description: "Connect with qualified lawyers in your area based on specialization and reviews",
      link: "/find-lawyer"
    },
    {
      icon: Video,
      title: "Video Consultation",
      description: "Schedule and conduct secure video calls with legal professionals",
      link: "/find-lawyer"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Small Business Owner",
      rating: 5,
      comment: "LawMate helped me understand my contract terms clearly. The AI explanations were spot-on and saved me hours of confusion."
    },
    {
      name: "Michael Chen",
      role: "Individual Client",
      rating: 5,
      comment: "Finding the right lawyer was so easy with their platform. The video consultation feature is incredibly convenient."
    },
    {
      name: "Emily Rodriguez",
      role: "Freelancer",
      rating: 4,
      comment: "The document Q&A feature is amazing. I can quickly get answers about legal documents without waiting for appointments."
    }
  ];

  const scrollToChatbot = () => {
    document.getElementById('chatbot-preview')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 to-white py-20 lg:py-32">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5e7eb' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-navy mb-6 leading-tight">
            Welcome to LawMate
            <span className="block text-teal">Your Intelligent Legal Companion</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Simplify complex legal matters with AI-powered assistance. Get instant answers, 
            understand legal documents, and connect with qualified lawyers - all in one platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={scrollToChatbot}
              size="lg" 
              className="bg-teal hover:bg-teal-light text-white px-8 py-3 text-lg"
            >
              Get Legal Help
            </Button>
            <Button asChild variant="outline" size="lg" className="border-navy text-navy hover:bg-navy hover:text-white px-8 py-3 text-lg">
              <Link to="/find-lawyer">Talk to a Lawyer</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Chatbot Preview Section */}
      <section id="chatbot-preview" className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-navy mb-8">
            Try Our AI Legal Assistant
          </h2>
          <Card className="shadow-soft border-0 mb-8">
            <CardContent className="p-8">
              <div className="bg-white rounded-lg p-6 mb-6 text-left max-w-2xl mx-auto">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-8 h-8 bg-teal rounded-full flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800">
                      Hello! I'm LawMate, your AI legal assistant. I can help you understand legal concepts, 
                      analyze documents, and answer questions about various areas of law. What would you like to know?
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-teal text-white rounded-lg px-4 py-2 max-w-xs">
                    <p className="text-sm">Can you help me understand a contract?</p>
                  </div>
                </div>
              </div>
              <Button asChild size="lg" className="bg-teal hover:bg-teal-light text-white">
                <Link to="/chatbot">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Start Chat
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Platform Features Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy mb-4">Our Platform Features</h2>
            <p className="text-xl text-gray-600">Comprehensive legal assistance at your fingertips</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-soft border-0 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
                <CardContent className="p-6 text-center flex flex-col flex-grow">
                  <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-teal" />
                  </div>
                  <h3 className="text-xl font-semibold text-navy mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-4 flex-grow">{feature.description}</p>
                  <div className="mt-auto">
                    <Button asChild variant="outline" size="sm" className="border-teal text-teal hover:bg-teal hover:text-white">
                      <Link to={feature.link}>Learn More</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600">Real feedback from satisfied clients</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="shadow-soft border-0">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.comment}"</p>
                  <div>
                    <p className="font-semibold text-navy">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-navy text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="shadow-soft border-0">
                <Collapsible 
                  open={openFAQ === index} 
                  onOpenChange={() => setOpenFAQ(openFAQ === index ? null : index)}
                >
                  <CollapsibleTrigger className="w-full">
                    <CardContent className="p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
                      <h3 className="text-lg font-semibold text-navy text-left">
                        {faq.question}
                      </h3>
                      <ChevronDown className={`h-5 w-5 text-teal transition-transform ${
                        openFAQ === index ? 'rotate-180' : ''
                      }`} />
                    </CardContent>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="px-6 pb-6 pt-0">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Preview Section */}
      <section className="py-16 bg-teal">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Have a Question or Need Help?
          </h2>
          <p className="text-xl text-teal-100 mb-8">
            Our support team is here to assist you with any questions or concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="outline" className="border-white text-teal bg-white hover:bg-gray-100 hover:text-teal">
              <Link to="/contact">
                <Send className="h-5 w-5 mr-2" />
                Contact Us
              </Link>
            </Button>
            
            <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-navy hover:bg-navy/90 text-white">
                  <Star className="h-5 w-5 mr-2" />
                  Give Feedback
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md backdrop-blur-sm">
                <DialogHeader>
                  <DialogTitle className="text-center text-navy">Share Your Feedback</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Rate your experience</Label>
                    <div className="flex justify-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-8 w-8 cursor-pointer transition-colors ${
                            star <= rating 
                              ? 'text-yellow-500 fill-current' 
                              : 'text-gray-300 hover:text-yellow-400'
                          }`}
                          onClick={() => handleStarClick(star)}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={feedback.name}
                      onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={feedback.email}
                      onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={feedback.message}
                      onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                      placeholder="Tell us about your experience..."
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setFeedbackOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1 bg-teal hover:bg-teal-light">
                      Submit Feedback
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
