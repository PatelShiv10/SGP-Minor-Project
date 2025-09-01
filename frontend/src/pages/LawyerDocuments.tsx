import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  FileText, Download, Eye, MessageCircle, Search, Upload, 
  Filter, MoreHorizontal, Loader2, Trash2, Edit, Calendar,
  User, Clock, AlertCircle
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LawyerSidebar } from '@/components/lawyer/LawyerSidebar';
import { LawyerTopBar } from '@/components/lawyer/LawyerTopBar';
import { useToast } from '@/hooks/use-toast';
import { 
  documentService, 
  Document, 
  DocumentListResponse,
  getCategoryLabel,
  getStatusColor,
  getPriorityColor,
  formatFileSize,
  getFileIcon
} from '@/services/documentService';
import { clientService, Client } from '@/services/clientService';

const LawyerDocuments = () => {
  const [currentPage, setCurrentPage] = useState('documents');
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  });
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalSize: 0,
    byStatus: {},
    byCategory: {}
  });
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    priority: 'all',
    search: ''
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response: DocumentListResponse = await documentService.getDocuments({
        page,
        limit: 20,
        clientId: selectedClient !== 'all' ? selectedClient : undefined,
        category: filters.category !== 'all' ? filters.category : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        priority: filters.priority !== 'all' ? filters.priority : undefined,
        search: filters.search || undefined,
        sortBy,
        sortOrder
      });

      setDocuments(response.documents);
      setPagination(response.pagination);
      setStats(response.stats);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch documents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await clientService.getLawyerClients({ limit: 100 });
      setClients(response.clients);
    } catch (error: any) {
      console.error('Failed to fetch clients:', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [page, filters, sortBy, sortOrder, selectedClient]);

  useEffect(() => {
    fetchClients();
  }, []);

  const handleUploadDocument = async (formData: FormData) => {
    try {
      setUploadLoading(true);
      await documentService.uploadDocument(formData);
      toast({
        title: "Success",
        description: "Document uploaded successfully"
      });
      setUploadDialogOpen(false);
      fetchDocuments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload document",
        variant: "destructive"
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDownloadDocument = async (documentId: string, fileName: string) => {
    try {
      const blob = await documentService.downloadDocument(documentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to download document",
        variant: "destructive"
      });
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await documentService.deleteDocument(documentId);
      toast({
        title: "Success",
        description: "Document deleted successfully"
      });
      fetchDocuments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete document",
        variant: "destructive"
      });
    }
  };

  const handleEditDocument = async (documentId: string, updateData: any) => {
    try {
      setEditLoading(true);
      await documentService.updateDocument(documentId, updateData);
      toast({
        title: "Success",
        description: "Document updated successfully"
      });
      setEditDialogOpen(false);
      fetchDocuments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update document",
        variant: "destructive"
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleMessageClient = (clientId: string) => {
    navigate('/lawyer-messages', { state: { clientId } });
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
              <Button 
                className="bg-teal hover:bg-teal-light text-white w-full sm:w-auto"
                onClick={() => setUploadDialogOpen(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card className="shadow-soft border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Documents</p>
                      <p className="text-2xl font-bold text-navy">{stats.totalDocuments}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-50">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Size</p>
                      <p className="text-2xl font-bold text-navy">{formatFileSize(stats.totalSize)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending Review</p>
                      <p className="text-2xl font-bold text-navy">{stats.byStatus.pending_review || 0}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-yellow-50">
                      <AlertCircle className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Reviewed</p>
                      <p className="text-2xl font-bold text-navy">{stats.byStatus.reviewed || 0}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-50">
                      <Eye className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card className="shadow-soft border-0 mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search documents..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Clients</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client._id} value={client._id}>
                          {client.clientId.firstName} {client.clientId.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="legal_brief">Legal Brief</SelectItem>
                      <SelectItem value="evidence">Evidence</SelectItem>
                      <SelectItem value="correspondence">Correspondence</SelectItem>
                      <SelectItem value="court_document">Court Document</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="medical">Medical</SelectItem>
                      <SelectItem value="police_report">Police Report</SelectItem>
                      <SelectItem value="witness_statement">Witness Statement</SelectItem>
                      <SelectItem value="expert_report">Expert Report</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending_review">Pending Review</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            {/* Documents Table */}
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="text-lg">Documents</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading documents...</span>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No documents found</p>
                    <p className="text-gray-400 text-sm">Upload your first document to get started</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Document</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Client</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Priority</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Size</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Upload Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map((doc) => (
                          <tr key={doc._id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-teal text-white rounded flex items-center justify-center">
                                  <span className="text-sm">{getFileIcon(doc.mimeType)}</span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{doc.title}</p>
                                  <p className="text-sm text-gray-500">{doc.originalFileName}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-gray-900">
                                {doc.clientId.firstName} {doc.clientId.lastName}
                              </p>
                              <p className="text-sm text-gray-500">{doc.clientId.email}</p>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="outline">{getCategoryLabel(doc.category)}</Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={getStatusColor(doc.status)}>
                                {doc.status.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={getPriorityColor(doc.priority)}>
                                {doc.priority}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-gray-600">{formatFileSize(doc.fileSize)}</p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-gray-600">
                                {new Date(doc.createdAt).toLocaleDateString()}
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadDocument(doc._id, doc.originalFileName)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleMessageClient(doc.clientId._id)}
                                >
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => {
                                      setSelectedDocument(doc);
                                      setEditDialogOpen(true);
                                    }}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteDocument(doc._id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Upload Document Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <UploadDocumentForm 
            clients={clients}
            onSubmit={handleUploadDocument}
            loading={uploadLoading}
            onCancel={() => setUploadDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Document Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <EditDocumentForm 
              document={selectedDocument}
              onSubmit={(updateData) => handleEditDocument(selectedDocument._id, updateData)}
              loading={editLoading}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Upload Document Form Component
const UploadDocumentForm = ({ 
  clients, 
  onSubmit, 
  loading, 
  onCancel 
}: { 
  clients: Client[]; 
  onSubmit: (formData: FormData) => Promise<void>; 
  loading: boolean; 
  onCancel: () => void; 
}) => {
  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    description: '',
    category: 'other',
    priority: 'medium',
    tags: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !formData.clientId || !formData.title) return;

    const data = new FormData();
    data.append('document', selectedFile);
    data.append('clientId', formData.clientId);
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('priority', formData.priority);
    data.append('tags', formData.tags);

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="clientId">Client *</Label>
        <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client._id} value={client._id}>
                {client.clientId.firstName} {client.clientId.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="title">Document Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter document title"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter document description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="legal_brief">Legal Brief</SelectItem>
              <SelectItem value="evidence">Evidence</SelectItem>
              <SelectItem value="correspondence">Correspondence</SelectItem>
              <SelectItem value="court_document">Court Document</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="medical">Medical</SelectItem>
              <SelectItem value="police_report">Police Report</SelectItem>
              <SelectItem value="witness_statement">Witness Statement</SelectItem>
              <SelectItem value="expert_report">Expert Report</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="Enter tags separated by commas"
        />
      </div>

      <div>
        <Label htmlFor="file">Document File *</Label>
        <Input
          id="file"
          type="file"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          Supported formats: PDF, Word, Excel, Text, Images, Archives (max 50MB)
        </p>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !selectedFile || !formData.clientId || !formData.title}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload Document'
          )}
        </Button>
      </div>
    </form>
  );
};

// Edit Document Form Component
const EditDocumentForm = ({ 
  document, 
  onSubmit, 
  loading, 
  onCancel 
}: { 
  document: Document; 
  onSubmit: (updateData: any) => Promise<void>; 
  loading: boolean; 
  onCancel: () => void; 
}) => {
  const [formData, setFormData] = useState({
    title: document.title,
    description: document.description || '',
    category: document.category,
    priority: document.priority,
    status: document.status,
    tags: document.tags.join(', '),
    reviewNotes: document.reviewNotes || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Document Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter document title"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter document description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="legal_brief">Legal Brief</SelectItem>
              <SelectItem value="evidence">Evidence</SelectItem>
              <SelectItem value="correspondence">Correspondence</SelectItem>
              <SelectItem value="court_document">Court Document</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="medical">Medical</SelectItem>
              <SelectItem value="police_report">Police Report</SelectItem>
              <SelectItem value="witness_statement">Witness Statement</SelectItem>
              <SelectItem value="expert_report">Expert Report</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending_review">Pending Review</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="Enter tags separated by commas"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="reviewNotes">Review Notes</Label>
        <Textarea
          id="reviewNotes"
          value={formData.reviewNotes}
          onChange={(e) => setFormData({ ...formData, reviewNotes: e.target.value })}
          placeholder="Enter review notes"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Document'
          )}
        </Button>
      </div>
    </form>
  );
};

export default LawyerDocuments;
