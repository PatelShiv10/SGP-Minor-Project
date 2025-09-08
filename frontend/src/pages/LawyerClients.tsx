import React, { useState, useEffect } from 'react';
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
  Search, User, MessageCircle, FileText, Phone, MoreHorizontal, 
  CheckCircle, XCircle, Archive, Plus, RefreshCw, Loader2, 
  Calendar, Clock, AlertCircle, Edit
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LawyerSidebar } from '@/components/lawyer/LawyerSidebar';
import { LawyerTopBar } from '@/components/lawyer/LawyerTopBar';
import { useToast } from '@/hooks/use-toast';
import { 
  clientService, 
  Client, 
  ClientListResponse,
  getCaseTypeLabel,
  getStatusColor,
  getPriorityColor,
  formatClientName,
  formatCurrency,
  formatDate
} from '@/services/clientService';
import AddClientDialog from '@/components/AddClientDialog';

const LawyerClients = () => {
  const [currentPage, setCurrentPage] = useState('clients');
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  });
  const [stats, setStats] = useState({
    active: 0,
    pending: 0,
    completed: 0,
    inactive: 0,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: 'all',
    caseType: 'all',
    search: ''
  });
  const [sortBy, setSortBy] = useState('lastContactDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'complete' | 'delete' | 'archive' | 'note'>('complete');
  const [actionData, setActionData] = useState({ notes: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response: ClientListResponse = await clientService.getLawyerClients({
        page,
        limit: 20,
        status: filters.status !== 'all' ? filters.status : undefined,
        caseType: filters.caseType !== 'all' ? filters.caseType : undefined,
        search: filters.search || undefined,
        sortBy,
        sortOrder
      });

      setClients(response.clients);
      setPagination(response.pagination);
      setStats(response.stats);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch clients",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [page, filters, sortBy, sortOrder]);

  const handleClientAction = async (client: Client, action: 'complete' | 'delete' | 'archive' | 'note') => {
    setSelectedClient(client);
    setActionType(action);
    setActionData({ notes: '' });
    setActionDialogOpen(true);
  };

  const executeAction = async () => {
    if (!selectedClient) return;

    setActionLoading(true);

    try {
      switch (actionType) {
        case 'complete':
          await clientService.markClientComplete(selectedClient._id, actionData.notes);
          toast({
            title: "Success",
            description: "Client marked as completed"
          });
          break;
        
        case 'delete':
          await clientService.deleteClient(selectedClient._id);
          toast({
            title: "Success",
            description: "Client removed successfully"
          });
          break;
        
        case 'archive':
          await clientService.archiveClient(selectedClient._id);
          toast({
            title: "Success",
            description: "Client archived successfully"
          });
          break;
        
        case 'note':
          await clientService.addClientNote(selectedClient._id, actionData.notes);
          toast({
            title: "Success",
            description: "Note added successfully"
          });
          break;
      }

      fetchClients();
      setActionDialogOpen(false);
      setSelectedClient(null);
      setActionData({ notes: '' });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to perform action",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMessageClient = (client: Client) => {
    navigate('/lawyer-messages', { 
      state: { 
        clientId: client.clientId._id,
        clientName: formatClientName(client)
      } 
    });
  };

  const handleCallClient = (client: Client) => {
    window.open(`tel:${client.clientId.phone}`, '_self');
  };

  const handleViewDocuments = (client: Client) => {
    navigate('/lawyer-documents', { 
      state: { 
        clientId: client.clientId._id,
        clientName: formatClientName(client)
      } 
    });
  };

  const caseTypes = [
    'all', 'family_law', 'corporate_law', 'criminal_law', 'civil_litigation',
    'real_estate', 'immigration', 'personal_injury', 'employment',
    'intellectual_property', 'tax_law', 'estate_planning', 'other'
  ];

  const renderClientCard = (client: Client) => (
    <Card key={client._id} className="shadow-soft border-0 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-teal rounded-full flex items-center justify-center">
              {client.clientId.profileImage ? (
                <img 
                  src={client.clientId.profileImage} 
                  alt="" 
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-semibold text-lg">
                  {client.clientId.firstName.charAt(0)}{client.clientId.lastName.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-navy">
                {formatClientName(client)}
              </h3>
              <p className="text-sm text-gray-600">{client.clientId.email}</p>
              <p className="text-sm text-gray-600">{client.clientId.phone}</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleClientAction(client, 'note')}>
                <Edit className="h-4 w-4 mr-2" />
                Add Note
              </DropdownMenuItem>
              {client.status !== 'completed' && (
                <DropdownMenuItem onClick={() => handleClientAction(client, 'complete')}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Complete
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => handleClientAction(client, 'archive')}>
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleClientAction(client, 'delete')}>
                <XCircle className="h-4 w-4 mr-2" />
                Remove Client
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-sm">
            <span className="text-gray-500">Case Type:</span>
            <p className="font-medium">{getCaseTypeLabel(client.caseType)}</p>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Status:</span>
            <Badge className={getStatusColor(client.status)}>
              {client.status.toUpperCase()}
            </Badge>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Priority:</span>
            <Badge variant="outline" className={getPriorityColor(client.priority)}>
              {client.priority.toUpperCase()}
            </Badge>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Last Contact:</span>
            <p className="font-medium">{formatDate(client.lastContactDate)}</p>
          </div>
        </div>

        {client.caseTitle && (
          <div className="mb-4">
            <p className="text-sm text-gray-500">Case:</p>
            <p className="font-medium">{client.caseTitle}</p>
          </div>
        )}

        {client.stats && (
          <></>
        )}

        {client.stats?.nextAppointment && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-blue-600 font-medium">Next Appointment:</span>
              <span>{formatDate(client.stats.nextAppointment.date)} at {client.stats.nextAppointment.start}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleMessageClient(client)}
            className="w-full border-teal text-teal hover:bg-teal hover:text-white"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Chat
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCallClient(client)}
            className="w-full border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
          >
            <Phone className="h-4 w-4 mr-1" />
            Call
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewDocuments(client)}
            className="w-full border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white"
          >
            <FileText className="h-4 w-4 mr-1" />
            Files
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/lawyer-documents', { 
              state: { 
                clientId: client.clientId._id,
                clientName: formatClientName(client)
              } 
            })}
            className="w-full border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white"
          >
            <FileText className="h-4 w-4 mr-1" />
            Docs
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <LawyerSidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <div className="flex-1 flex flex-col">
        <LawyerTopBar />
        
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h1 className="text-2xl lg:text-3xl font-bold text-navy">Clients</h1>
              <div className="flex space-x-2">
                <Button 
                  onClick={fetchClients}
                  variant="outline"
                  className="border-teal text-teal hover:bg-teal hover:text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <AddClientDialog onClientAdded={fetchClients} />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="shadow-soft border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                  <div className="text-sm text-gray-600">Active</div>
                </CardContent>
              </Card>
              <Card className="shadow-soft border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </CardContent>
              </Card>
              <Card className="shadow-soft border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </CardContent>
              </Card>
              <Card className="shadow-soft border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-navy">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total</div>
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
                      placeholder="Search clients..."
                      className="pl-10"
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                  </div>
                  <Select 
                    value={filters.status} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="w-full lg:w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select 
                    value={filters.caseType} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, caseType: value }))}
                  >
                    <SelectTrigger className="w-full lg:w-[180px]">
                      <SelectValue placeholder="Case Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {caseTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type === 'all' ? 'All Types' : getCaseTypeLabel(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Clients List */}
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading clients...</span>
              </div>
            ) : clients.length === 0 ? (
              <Card className="shadow-soft border-0">
                <CardContent className="text-center p-12">
                  <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No clients found</h3>
                  <p className="text-gray-500 mb-6">
                    {filters.search || filters.status !== 'all' || filters.caseType !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'Start by adding your first client'}
                  </p>
                  <AddClientDialog onClientAdded={fetchClients} />
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {clients.map(renderClientCard)}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {clients.length} of {pagination.totalItems} clients
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(prev => Math.max(1, prev - 1))}
                        disabled={!pagination.hasPrev}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(prev => prev + 1)}
                        disabled={!pagination.hasNext}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'complete' && 'Mark Client as Completed'}
              {actionType === 'delete' && 'Remove Client'}
              {actionType === 'archive' && 'Archive Client'}
              {actionType === 'note' && 'Add Note'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedClient && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">
                  {formatClientName(selectedClient)}
                </h4>
                <p className="text-sm text-gray-600">
                  {getCaseTypeLabel(selectedClient.caseType)}
                  {selectedClient.caseTitle && ` - ${selectedClient.caseTitle}`}
                </p>
              </div>

              {actionType === 'delete' && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-red-700">
                    This will permanently remove the client relationship. This action cannot be undone.
                  </p>
                </div>
              )}

              {(actionType === 'complete' || actionType === 'note') && (
                <div className="space-y-2">
                  <Label htmlFor="notes">
                    {actionType === 'complete' ? 'Completion Notes' : 'Note'}
                  </Label>
                  <Textarea
                    id="notes"
                    value={actionData.notes}
                    onChange={(e) => setActionData({ notes: e.target.value })}
                    placeholder={
                      actionType === 'complete' 
                        ? "Add notes about the case completion..." 
                        : "Add a note about this client..."
                    }
                    className="min-h-[100px]"
                    maxLength={500}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setActionDialogOpen(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={executeAction}
                  disabled={actionLoading || (actionType === 'note' && !actionData.notes.trim())}
                  className={
                    actionType === 'delete' 
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-teal hover:bg-teal-light text-white'
                  }
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {actionType === 'complete' && 'Mark Complete'}
                      {actionType === 'delete' && 'Remove Client'}
                      {actionType === 'archive' && 'Archive'}
                      {actionType === 'note' && 'Add Note'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LawyerClients;