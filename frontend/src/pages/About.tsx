
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, FileText, Scale, Users } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: MessageCircle,
      title: "AI Chatbot",
      description: "Get instant answers to your legal questions with our intelligent AI assistant that understands complex legal matters."
    },
    {
      icon: FileText,
      title: "LawSimplify",
      description: "Transform complex legal jargon into plain English. Understand contracts, terms, and legal documents effortlessly."
    },
    {
      icon: Scale,
      title: "Document Q&A",
      description: "Upload any legal document and ask specific questions. Our AI will analyze and provide clear, relevant answers."
    },
    {
      icon: Users,
      title: "Lawyer Booking",
      description: "Connect with verified lawyers in your area. Schedule consultations, video calls, and get professional legal advice."
    }
  ];

  return (
    <div className="min-h-screen py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-navy mb-6">About LawMate</h1>
          <div className="max-w-3xl mx-auto">
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              LawMate is revolutionizing how people access legal information and connect with legal professionals. 
              Our AI-powered platform makes legal assistance accessible, affordable, and understandable for everyone.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Whether you're dealing with contracts, need legal advice, or want to understand complex legal documents, 
              LawMate provides the tools and connections you need to navigate the legal landscape with confidence.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="shadow-soft border-0 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <IconComponent className="h-8 w-8 text-teal" />
                  </div>
                  <h3 className="text-xl font-semibold text-navy mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Mission Statement */}
        <div className="mt-20">
          <Card className="bg-navy text-white shadow-soft border-0">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-xl leading-relaxed max-w-4xl mx-auto opacity-90">
                To democratize access to legal information and services by leveraging artificial intelligence 
                to bridge the gap between complex legal systems and everyday people who need legal guidance.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
