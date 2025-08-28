import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Eye, MessageCircle, Search, Upload } from 'lucide-react';
import { LawyerSidebar } from '@/components/lawyer/LawyerSidebar';
import { LawyerTopBar } from '@/components/lawyer/LawyerTopBar';

const LawyerDocuments = () => {
  const [currentPage, setCurrentPage] = useState('documents');
  const navigate = useNavigate();

  const documents = [
    {
      id: 1,
      name: "Contract Agreement.pdf",
      client: "John Smith",
      uploadDate: "2024-01-15",
      status: "new",
      size: "2.4 MB",
      type: "Contract"
    },
    {
      id: 2,
      name: "Legal Brief.docx",
      client: "Sarah Johnson",
      uploadDate: "2024-01-14",
      status: "reviewed",
      size: "1.8 MB",
      type: "Brief"
    },
    {
      id: 3,
      name: "Evidence Photos.zip",
      client: "Mike Wilson",
      uploadDate: "2024-01-13",
      status: "needs_attention",
      size: "15.2 MB",
      type: "Evidence"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'reviewed':
        return 'bg-green-100 text-green-800';
      case 'needs_attention':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDocument = (docId: number) => {
    // In a real app, this would open a document viewer
    console.log('Viewing document:', docId);
  };

  const handleDownloadDocument = (docId: number) => {
    // In a real app, this would trigger a download
    console.log('Downloading document:', docId);
  };

  const handleMessageClient = (docId: number) => {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      navigate('/lawyer-messages', { state: { clientName: doc.client } });
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
              <h1 className="text-2xl lg:text-3xl font-bold text-navy">Documents</h1>
              <Button className="bg-teal hover:bg-teal-light text-white w-full sm:w-auto">
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>

            {/* Search and Filters */}
            <Card className="shadow-soft border-0 mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search documents..."
                      className="pl-10"
                    />
                  </div>
                  <Select>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Document Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="brief">Brief</SelectItem>
                      <SelectItem value="evidence">Evidence</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="needs_attention">Needs Attention</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <Card key={doc.id} className="shadow-soft border-0 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-teal rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-navy truncate">{doc.name}</h3>
                          <p className="text-sm text-gray-600">{doc.client}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(doc.status)}>
                        {doc.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                      <p>Type: {doc.type}</p>
                      <p>Size: {doc.size}</p>
                      <p>Uploaded: {doc.uploadDate}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleViewDocument(doc.id)}
                        title="View Document"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleDownloadDocument(doc.id)}
                        title="Download Document"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleMessageClient(doc.id)}
                        title="Message Client"
                      >
                        <MessageCircle className="h-4 w-4" />
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

export default LawyerDocuments;
