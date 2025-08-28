
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Check, X, Edit, Trash2, MessageCircle, Phone, Mail, MapPin, Shield, Loader2 } from 'lucide-react';
import { useLawyers } from '@/hooks/useLawyers';

interface Lawyer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialization?: string;
  experience?: number;
  location?: string;
  barNumber?: string;
  bio?: string;
  isVerified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export const LawyerDirectoryManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSpecialization, setFilterSpecialization] = useState('all');
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  
  const { 
    lawyers, 
    stats, 
    loading, 
    error, 
    updateLawyerStatus, 
    deleteLawyer 
  } = useLawyers('admin');

  const filteredLawyers = lawyers.filter(lawyer => {
    const fullName = `${lawyer.firstName} ${lawyer.lastName}`;
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lawyer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lawyer.specialization && lawyer.specialization.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || lawyer.status === filterStatus;
    const matchesSpecialization = filterSpecialization === 'all' || 
                                  (lawyer.specialization && lawyer.specialization.toLowerCase().includes(filterSpecialization.toLowerCase()));
    
    return matchesSearch && matchesStatus && matchesSpecialization;
  });

  const handleStatusChange = async (id: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      await updateLawyerStatus(id, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDeleteLawyer = async (id: string) => {
    try {
      await deleteLawyer(id);
    } catch (error) {
      console.error('Failed to delete lawyer:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading lawyers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  const specializations = [
    'Criminal Law', 'Family Law', 'Corporate Law', 'Real Estate', 
    'Personal Injury', 'Immigration', 'Bankruptcy', 'Tax Law'
  ];

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lawyers</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalLawyers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.approvedLawyers || 0} verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.approvedLawyers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalLawyers ? Math.round((stats.approvedLawyers / stats.totalLawyers) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <MessageCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingLawyers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <X className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.rejectedLawyers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Not approved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Lawyer Directory Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search lawyers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSpecialization} onValueChange={setFilterSpecialization}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {specializations.map((spec) => (
                  <SelectItem key={spec} value={spec.toLowerCase()}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lawyers Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLawyers.map((lawyer) => (
                  <TableRow key={lawyer._id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="font-medium">{lawyer.firstName} {lawyer.lastName}</div>
                        {lawyer.isVerified && (
                          <Shield className="h-4 w-4 text-teal-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {lawyer.specialization ? (
                        <Badge variant="outline" className="text-xs">
                          {lawyer.specialization}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">Not specified</span>
                      )}
                    </TableCell>
                    <TableCell>{lawyer.location || 'Not specified'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(lawyer.status)}>
                        {lawyer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lawyer.experience ? `${lawyer.experience} years` : 'Not specified'}
                    </TableCell>
                    <TableCell>{formatDate(lawyer.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedLawyer(lawyer)}
                            >
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Lawyer Details</DialogTitle>
                            </DialogHeader>
                            {selectedLawyer && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Name</label>
                                    <p className="text-sm text-gray-600">{selectedLawyer.firstName} {selectedLawyer.lastName}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Email</label>
                                    <p className="text-sm text-gray-600">{selectedLawyer.email}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Phone</label>
                                    <p className="text-sm text-gray-600">{selectedLawyer.phone || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Location</label>
                                    <p className="text-sm text-gray-600">{selectedLawyer.location || 'Not specified'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Experience</label>
                                    <p className="text-sm text-gray-600">{selectedLawyer.experience ? `${selectedLawyer.experience} years` : 'Not specified'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Bar Number</label>
                                    <p className="text-sm text-gray-600">{selectedLawyer.barNumber || 'Not provided'}</p>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Specialization</label>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {selectedLawyer.specialization ? (
                                      <Badge variant="outline">
                                        {selectedLawyer.specialization}
                                      </Badge>
                                    ) : (
                                      <span className="text-gray-400">Not specified</span>
                                    )}
                                  </div>
                                </div>
                                {selectedLawyer.bio && (
                                  <div>
                                    <label className="text-sm font-medium">Bio</label>
                                    <p className="text-sm text-gray-600 mt-1">{selectedLawyer.bio}</p>
                                  </div>
                                )}
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <Badge className={getStatusColor(selectedLawyer.status)}>
                                      {selectedLawyer.status}
                                    </Badge>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Verified</label>
                                    <p className="text-sm text-gray-600">{selectedLawyer.isVerified ? 'Yes' : 'No'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Joined</label>
                                    <p className="text-sm text-gray-600">{formatDate(selectedLawyer.createdAt)}</p>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    onClick={() => handleStatusChange(selectedLawyer._id, 'approved')}
                                    disabled={selectedLawyer.status === 'approved'}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <Check className="h-4 w-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => handleStatusChange(selectedLawyer._id, 'rejected')}
                                    disabled={selectedLawyer.status === 'rejected'}
                                    className="border-red-600 text-red-600 hover:bg-red-50"
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => handleDeleteLawyer(selectedLawyer._id)}
                                    className="border-red-600 text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredLawyers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No lawyers found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

