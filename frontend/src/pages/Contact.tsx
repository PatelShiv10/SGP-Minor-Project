import { useState } from 'react';
import axios from 'axios'; // import axios
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/contact', formData); // update with your backend URL
      if (response.data.success) {
        setIsSubmitted(true);
      } else {
        alert('Failed to send message. Please try again later.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again later.');
    }

    setIsLoading(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 flex items-center justify-center">
        <Card className="max-w-2xl mx-auto shadow-soft border-0">
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-navy mb-4">Message Sent Successfully!</h1>
            <p className="text-lg text-gray-600 mb-8">
              Thank you for contacting us. We'll get back to you within 24 hours.
            </p>
            <Button
              onClick={() => {
                setIsSubmitted(false);
                setFormData({ name: '', email: '', subject: '', message: '' });
              }}
              className="bg-teal hover:bg-teal-light text-white"
            >
              Send Another Message
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-navy mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions about our services? Need help with your legal matters? 
            We're here to help and would love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="text-xl text-navy">Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-teal/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-teal" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy mb-1">Email</h3>
                    <p className="text-gray-600">support@lawmate.com</p>
                    <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-teal/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-teal" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy mb-1">Phone</h3>
                    <p className="text-gray-600">1-800-LEGAL-AI</p>
                    <p className="text-sm text-gray-500">Mon-Fri, 9 AM - 6 PM EST</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-teal/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-teal" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy mb-1">Office</h3>
                    <p className="text-gray-600">
                      123 Legal Tech Plaza<br />
                      Suite 400<br />
                      New York, NY 10001
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="text-xl text-navy">Follow Us</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <a href="#" className="flex items-center justify-center w-10 h-10 bg-teal text-white rounded-full hover:bg-teal-light transition-colors">
                    <span className="text-sm font-semibold">Li</span>
                  </a>
                  <a href="#" className="flex items-center justify-center w-10 h-10 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors">
                    <span className="text-sm font-semibold">GH</span>
                  </a>
                  <a href="#" className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
                    <span className="text-sm font-semibold">Tw</span>
                  </a>
                  <a href="#" className="flex items-center justify-center w-10 h-10 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-colors">
                    <span className="text-sm font-semibold">Fb</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="text-2xl text-navy">Send us a Message</CardTitle>
                <p className="text-gray-600">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name *
                      </label>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="border-gray-300 focus:border-teal focus:ring-teal"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="border-gray-300 focus:border-teal focus:ring-teal"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <Input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="border-gray-300 focus:border-teal focus:ring-teal"
                      placeholder="What is this regarding?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="border-gray-300 focus:border-teal focus:ring-teal"
                      placeholder="Please describe your inquiry in detail..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full md:w-auto bg-teal hover:bg-teal-light text-white px-8 py-3"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
