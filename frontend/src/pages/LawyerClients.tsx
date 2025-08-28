import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, User, MessageCircle, FileText, Phone } from 'lucide-react';
import { LawyerSidebar } from '@/components/lawyer/LawyerSidebar';
import { LawyerTopBar } from '@/components/lawyer/LawyerTopBar';

const LawyerClients = () => {
  const [currentPage, setCurrentPage] = useState('clients');
  const navigate = useNavigate();

  const clients = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+1 234-567-8900",
      caseType: "Family Law",
      status: "active",
      lastContact: "2024-01-15",
      totalSessions: 5
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "+1 234-567-8901",
      caseType: "Corporate Law",
      status: "pending",
      lastContact: "2024-01-14",
      totalSessions: 2
    },
    {
      id: 3,
      name: "Mike Wilson",
      email: "mike.wilson@email.com",
      phone: "+1 234-567-8902",
      caseType: "Criminal Law",
      status: "completed",
      lastContact: "2024-01-10",
      totalSessions: 8
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleMessageClient = (clientId: number) => {
    navigate('/lawyer-messages', { state: { clientId } });
  };

  const handleCallClient = (clientId: number, phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleViewDocuments = (clientId: number) => {
    navigate('/lawyer-documents', { state: { clientId } });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <LawyerSidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <div className="flex-1 flex flex-col">
        <LawyerTopBar />
        
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h1 className="text-2xl lg:text-3xl font-bold text-navy">Clients</h1>
              <Button className="bg-teal hover:bg-teal-light text-white w-full sm:w-auto">
                <User className="h-4 w-4 mr-2" />
                Add New Client
              </Button>
            </div>

            {/* Search and Filters */}
            <Card className="shadow-soft border-0 mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search clients..."
                      className="pl-10"
                    />
                  </div>
                  <Select>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Case Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="family">Family Law</SelectItem>
                      <SelectItem value="corporate">Corporate Law</SelectItem>
                      <SelectItem value="criminal">Criminal Law</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Clients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client) => (
                <Card key={client.id} className="shadow-soft border-0 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-teal rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {client.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-navy">{client.name}</h3>
                          <p className="text-sm text-gray-600">{client.caseType}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(client.status)}>
                        {client.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4 text-sm">
                      <p className="text-gray-600">{client.email}</p>
                      <p className="text-gray-600">{client.phone}</p>
                      <p className="text-gray-600">
                        Last contact: {client.lastContact}
                      </p>
                      <p className="text-gray-600">
                        Sessions: {client.totalSessions}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleMessageClient(client.id)}
                        title="Send Message"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleViewDocuments(client.id)}
                        title="View Documents"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
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

export default LawyerClients;
