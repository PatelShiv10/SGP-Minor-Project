import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star, CheckCircle, XCircle, Eye, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LawyerFeedback {
  _id: string;
  lawyerId: string;
  clientName: string;
  clientEmail: string;
  rating: number;
  title: string;
  comment: string;
  serviceType: string;
  isApproved: boolean;
  createdAt: string;
  lawyerResponse?: {
    message: string;
    createdAt: string;
  };
}

export const LawyerFeedbackManagement = () => {
  const [feedback, setFeedback] = useState<LawyerFeedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<LawyerFeedback | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/lawyer-feedback/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFeedback(data.data || []);
      } else {
        throw new Error('Failed to fetch feedback');
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast({
        title: "Error",
        description: "Failed to load lawyer feedback",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleApprove = async (feedbackId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/lawyer-feedback/${feedbackId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Feedback approved successfully"
        });
        fetchFeedback(); // Refresh the list
      } else {
        throw new Error('Failed to approve feedback');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve feedback",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (feedbackId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/lawyer-feedback/${feedbackId}/reject`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Feedback rejected successfully"
        });
        fetchFeedback(); // Refresh the list
      } else {
        throw new Error('Failed to reject feedback');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject feedback",
        variant: "destructive"
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-blue-100 text-blue-800';
      case 'document_review': return 'bg-green-100 text-green-800';
      case 'legal_advice': return 'bg-purple-100 text-purple-800';
      case 'representation': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading lawyer feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>Lawyer Feedback Management</span>
            <Badge variant="secondary">{feedback.length} pending</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {feedback.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No pending feedback</p>
              <p className="text-gray-400 text-sm">All lawyer feedback has been reviewed</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedback.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.clientName}</p>
                        <p className="text-sm text-gray-500">{item.clientEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {renderStars(item.rating)}
                        <span className="text-sm text-gray-600">({item.rating})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getServiceTypeColor(item.serviceType)}>
                        {item.serviceType.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">{item.comment}</p>
                    </TableCell>
                    <TableCell>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedFeedback(item);
                            setViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove(item._id)}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(item._id)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Feedback Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Feedback Details</DialogTitle>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Client Name</label>
                  <p className="text-gray-900">{selectedFeedback.clientName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Client Email</label>
                  <p className="text-gray-900">{selectedFeedback.clientEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Rating</label>
                  <div className="flex items-center space-x-1">
                    {renderStars(selectedFeedback.rating)}
                    <span className="text-gray-900">({selectedFeedback.rating}/5)</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Service Type</label>
                  <Badge className={getServiceTypeColor(selectedFeedback.serviceType)}>
                    {selectedFeedback.serviceType.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Title</label>
                <p className="text-gray-900 font-medium">{selectedFeedback.title}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Comment</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedFeedback.comment}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Submitted</label>
                <p className="text-gray-900">{new Date(selectedFeedback.createdAt).toLocaleString()}</p>
              </div>

              {selectedFeedback.lawyerResponse && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Lawyer Response</label>
                  <p className="text-gray-900 bg-blue-50 p-3 rounded-lg">{selectedFeedback.lawyerResponse.message}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Responded on {new Date(selectedFeedback.lawyerResponse.createdAt).toLocaleString()}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setViewDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    handleApprove(selectedFeedback._id);
                    setViewDialogOpen(false);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => {
                    handleReject(selectedFeedback._id);
                    setViewDialogOpen(false);
                  }}
                  variant="destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};