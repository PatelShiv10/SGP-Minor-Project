
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Phone, Video, Search, Filter, ArrowLeft } from 'lucide-react';
import { LawyerSidebar } from '@/components/lawyer/LawyerSidebar';
import { LawyerTopBar } from '@/components/lawyer/LawyerTopBar';
import { Link } from 'react-router-dom';

const LawyerAllAppointments = () => {
  const [currentPage, setCurrentPage] = useState('appointments');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const allAppointments = [
    {
      id: 1,
      client: "John Smith",
      date: "2024-01-15",
      time: "10:00 AM",
      type: "Consultation",
      status: "confirmed",
      duration: "1 hour",
      phone: "+1 234-567-8900"
    },
    {
      id: 2,
      client: "Sarah Johnson",
      date: "2024-01-15",
      time: "2:00 PM",
      type: "Follow-up",
      status: "pending",
      duration: "30 minutes",
      phone: "+1 234-567-8901"
    },
    {
      id: 3,
      client: "Mike Wilson",
      date: "2024-01-16",
      time: "9:00 AM",
      type: "Document Review",
      status: "confirmed",
      duration: "45 minutes",
      phone: "+1 234-567-8902"
    },
    {
      id: 4,
      client: "Emily Davis",
      date: "2024-01-17",
      time: "11:30 AM",
      type: "Consultation",
      status: "confirmed",
      duration: "1 hour",
      phone: "+1 234-567-8903"
    },
    {
      id: 5,
      client: "Robert Brown",
      date: "2024-01-18",
      time: "3:00 PM",
      type: "Contract Review",
      status: "pending",
      duration: "2 hours",
      phone: "+1 234-567-8904"
    },
    {
      id: 6,
      client: "Lisa Anderson",
      date: "2024-01-19",
      time: "10:30 AM",
      type: "Follow-up",
      status: "cancelled",
      duration: "30 minutes",
      phone: "+1 234-567-8905"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAppointments = allAppointments.filter(appointment => {
    const matchesSearch = appointment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <LawyerSidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <LawyerTopBar />
        
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Link to="/lawyer-dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl lg:text-3xl font-bold text-navy">All Appointments</h1>
            </div>

            {/* Filters */}
            <Card className="mb-6 shadow-soft border-0">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by client name or appointment type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="w-full sm:w-48">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appointments Table */}
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle>
                  Appointments ({filteredAppointments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-teal rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {appointment.client.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{appointment.client}</p>
                                <p className="text-sm text-gray-600">{appointment.phone}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="font-medium">{appointment.date}</p>
                                <p className="text-sm text-gray-600">{appointment.time}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{appointment.type}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span>{appointment.duration}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <User className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Phone className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Video className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4 p-4">
                  {filteredAppointments.map((appointment) => (
                    <Card key={appointment.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-teal rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {appointment.client.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-navy">{appointment.client}</h3>
                              <p className="text-sm text-gray-600">{appointment.phone}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium">{appointment.date}</p>
                              <p className="text-gray-600">{appointment.time}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium">{appointment.duration}</p>
                              <p className="text-gray-600">{appointment.type}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <User className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Phone className="h-4 w-4 mr-1" />
                            Call
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Video className="h-4 w-4 mr-1" />
                            Video
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredAppointments.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No appointments found matching your criteria</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LawyerAllAppointments;
