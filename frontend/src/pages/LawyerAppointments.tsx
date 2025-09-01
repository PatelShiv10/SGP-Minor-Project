import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, User, Phone, Video, MapPin, Filter, Search, RefreshCw, Loader2, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LawyerSidebar } from '@/components/lawyer/LawyerSidebar';
import { LawyerTopBar } from '@/components/lawyer/LawyerTopBar';
import { useToast } from '@/hooks/use-toast';
import { 
  appointmentService, 
  Appointment, 
  AppointmentListResponse,
  CalendarEvent,
  formatAppointmentTime,
  formatAppointmentDate,
  getAppointmentTypeLabel,
  getStatusColor 
} from '@/services/appointmentService';
import AppointmentCalendar from '@/components/AppointmentCalendar';

const LawyerAppointments = () => {
  const [currentPage, setCurrentPage] = useState('appointments');
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  });
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    status: 'all',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'confirm' | 'cancel' | 'complete' | 'notes'>('confirm');
  const [actionData, setActionData] = useState({ reason: '', notes: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>([]);
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState<CalendarEvent | null>(null);

  const { toast } = useToast();

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response: AppointmentListResponse = await appointmentService.getLawyerAppointments({
        page,
        limit: 20,
        status: filters.status !== 'all' ? filters.status : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        sortBy,
        sortOrder
      });

      setAppointments(response.appointments);
      setPagination(response.pagination);
      setStats(response.stats);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch appointments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTodaysAppointments = async () => {
    try {
      const today = await appointmentService.getTodaysAppointments();
      setTodaysAppointments(today);
    } catch (error: any) {
      console.error('Error fetching today\'s appointments:', error);
    }
  };

  const handleCalendarEventClick = async (event: CalendarEvent) => {
    try {
      const appointment = await appointmentService.getAppointmentDetails(event.id);
      setSelectedAppointment(appointment);
      setActionType('notes');
      setActionData({ reason: '', notes: appointment.lawyerNotes || '' });
      setActionDialogOpen(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load appointment details",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [page, filters, sortBy, sortOrder]);

  useEffect(() => {
    fetchTodaysAppointments();
  }, []);

  const handleStatusUpdate = async (appointment: Appointment, newStatus: string, reason?: string, notes?: string) => {
    try {
      setActionLoading(true);
      await appointmentService.updateAppointmentStatus(appointment._id, newStatus, reason, notes);
      
      toast({
        title: "Success",
        description: `Appointment ${newStatus} successfully`
      });

      // Refresh data
      fetchAppointments();
      fetchTodaysAppointments();
      setActionDialogOpen(false);
      setSelectedAppointment(null);
      setActionData({ reason: '', notes: '' });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update appointment",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateNotes = async (appointment: Appointment, notes: string) => {
    try {
      setActionLoading(true);
      await appointmentService.updateAppointmentNotes(appointment._id, notes);
      
      toast({
        title: "Success",
        description: "Notes updated successfully"
      });

      fetchAppointments();
      setActionDialogOpen(false);
      setSelectedAppointment(null);
      setActionData({ reason: '', notes: '' });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update notes",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openActionDialog = (appointment: Appointment, type: 'confirm' | 'cancel' | 'complete' | 'notes') => {
    setSelectedAppointment(appointment);
    setActionType(type);
    setActionData({ reason: '', notes: appointment.lawyerNotes || '' });
    setActionDialogOpen(true);
  };

  const handleActionSubmit = () => {
    if (!selectedAppointment) return;

    switch (actionType) {
      case 'confirm':
        handleStatusUpdate(selectedAppointment, 'confirmed');
        break;
      case 'cancel':
        handleStatusUpdate(selectedAppointment, 'cancelled', actionData.reason);
        break;
      case 'complete':
        handleStatusUpdate(selectedAppointment, 'completed', undefined, actionData.notes);
        break;
      case 'notes':
        handleUpdateNotes(selectedAppointment, actionData.notes);
        break;
    }
  };

  const getMeetingIcon = (type: string) => {
    switch (type) {
      case 'video_call':
        return <Video className="h-4 w-4" />;
      case 'phone_call':
        return <Phone className="h-4 w-4" />;
      case 'in_person':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const renderAppointmentCard = (appointment: Appointment) => (
    <Card key={appointment._id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-navy">
              {appointment.userId.firstName} {appointment.userId.lastName}
            </h3>
            <p className="text-sm text-gray-600">{appointment.userId.email}</p>
            {appointment.userId.phone && (
              <p className="text-sm text-gray-600">{appointment.userId.phone}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {appointment.status === 'pending' && (
                <DropdownMenuItem onClick={() => openActionDialog(appointment, 'confirm')}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm
                </DropdownMenuItem>
              )}
              {['pending', 'confirmed'].includes(appointment.status) && (
                <>
                  <DropdownMenuItem onClick={() => openActionDialog(appointment, 'complete')}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openActionDialog(appointment, 'cancel')}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem onClick={() => openActionDialog(appointment, 'notes')}>
                <User className="h-4 w-4 mr-2" />
                Add Notes
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3 text-gray-500" />
            <span>{formatAppointmentDate(appointment.date)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3 text-gray-500" />
            <span>{formatAppointmentTime(appointment.start, appointment.end)}</span>
          </div>
          <div className="flex items-center space-x-1">
            {getMeetingIcon(appointment.meetingType)}
            <span className="capitalize">
              {appointment?.meetingType?.replace(/_/g, ' ') || "No Meeting Type"}
            </span>

          </div>
          <div>
            <Badge variant="outline" className="text-xs">
              {getAppointmentTypeLabel(appointment.appointmentType)}
            </Badge>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Badge className={getStatusColor(appointment.status)}>
            {appointment.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <span className="text-xs text-gray-500">
            {appointment.durationFormatted || `${appointment.durationMins}m`}
          </span>
        </div>

        {(appointment.notes || appointment.clientNotes) && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
            {appointment.clientNotes && (
              <p><strong>Client:</strong> {appointment.clientNotes}</p>
            )}
            {appointment.lawyerNotes && (
              <p><strong>Notes:</strong> {appointment.lawyerNotes}</p>
            )}
          </div>
        )}
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
              <h1 className="text-2xl lg:text-3xl font-bold text-navy">Appointments</h1>
              <Button 
                onClick={() => {
                  fetchAppointments();
                  fetchTodaysAppointments();
                }}
                className="bg-teal hover:bg-teal-light text-white w-full sm:w-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="shadow-soft border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-navy">{stats.pending || 0}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </CardContent>
              </Card>
              <Card className="shadow-soft border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.confirmed || 0}</div>
                  <div className="text-sm text-gray-600">Confirmed</div>
                </CardContent>
              </Card>
              <Card className="shadow-soft border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.completed || 0}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </CardContent>
              </Card>
              <Card className="shadow-soft border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.cancelled || 0}</div>
                  <div className="text-sm text-gray-600">Cancelled</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="list" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="today">Today</TabsTrigger>
              </TabsList>

              <TabsContent value="list">
                <Card className="shadow-soft border-0">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <CardTitle>All Appointments</CardTitle>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                          <SelectTrigger className="w-full sm:w-[140px]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="date"
                          value={filters.startDate}
                          onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                          className="w-full sm:w-auto"
                        />
                        <Input
                          type="date"
                          value={filters.endDate}
                          onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                          className="w-full sm:w-auto"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {loading ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="ml-2">Loading appointments...</span>
                      </div>
                    ) : appointments.length === 0 ? (
                      <div className="text-center p-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No appointments found</p>
                      </div>
                    ) : (
                      <>
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
                                <TableHead>Meeting</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {appointments.map((appointment) => (
                                <TableRow key={appointment._id}>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">
                                        {appointment.userId.firstName} {appointment.userId.lastName}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {appointment.userId.email}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">
                                        {formatAppointmentDate(appointment.date)}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {formatAppointmentTime(appointment.start, appointment.end)}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">
                                      {getAppointmentTypeLabel(appointment.appointmentType)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {appointment.durationFormatted || `${appointment.durationMins}m`}
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={getStatusColor(appointment.status)}>
                                      {appointment.status.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-1">
                                      {getMeetingIcon(appointment.meetingType)}
                                      <span className="text-sm capitalize">
                                          {appointment?.meetingType?.replace('_', ' ') || "No Meeting Type"}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        {appointment.status === 'pending' && (
                                          <DropdownMenuItem onClick={() => openActionDialog(appointment, 'confirm')}>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Confirm
                                          </DropdownMenuItem>
                                        )}
                                        {['pending', 'confirmed'].includes(appointment.status) && (
                                          <>
                                            <DropdownMenuItem onClick={() => openActionDialog(appointment, 'complete')}>
                                              <CheckCircle className="h-4 w-4 mr-2" />
                                              Mark Complete
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => openActionDialog(appointment, 'cancel')}>
                                              <XCircle className="h-4 w-4 mr-2" />
                                              Cancel
                                            </DropdownMenuItem>
                                          </>
                                        )}
                                        <DropdownMenuItem onClick={() => openActionDialog(appointment, 'notes')}>
                                          <User className="h-4 w-4 mr-2" />
                                          Add Notes
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden p-4">
                          {appointments.map(renderAppointmentCard)}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                          <div className="flex items-center justify-between p-4 border-t">
                            <div className="text-sm text-gray-600">
                              Showing {appointments.length} of {pagination.totalItems} appointments
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
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="calendar">
                <AppointmentCalendar onEventClick={handleCalendarEventClick} />
              </TabsContent>

              <TabsContent value="today">
                <Card className="shadow-soft border-0">
                  <CardHeader>
                    <CardTitle>Today's Appointments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {todaysAppointments.length === 0 ? (
                      <div className="text-center p-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No appointments today</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {todaysAppointments.map(renderAppointmentCard)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'confirm' && 'Confirm Appointment'}
              {actionType === 'cancel' && 'Cancel Appointment'}
              {actionType === 'complete' && 'Complete Appointment'}
              {actionType === 'notes' && 'Update Notes'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">
                  {selectedAppointment.userId.firstName} {selectedAppointment.userId.lastName}
                </h4>
                <p className="text-sm text-gray-600">
                  {formatAppointmentDate(selectedAppointment.date)} at {formatAppointmentTime(selectedAppointment.start, selectedAppointment.end)}
                </p>
              </div>

              {actionType === 'cancel' && (
                <div className="space-y-2">
                  <Label htmlFor="reason">Cancellation Reason</Label>
                  <Textarea
                    id="reason"
                    value={actionData.reason}
                    onChange={(e) => setActionData(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Please provide a reason for cancellation..."
                    className="min-h-[100px]"
                  />
                </div>
              )}

              {(actionType === 'complete' || actionType === 'notes') && (
                <div className="space-y-2">
                  <Label htmlFor="notes">
                    {actionType === 'complete' ? 'Session Notes' : 'Lawyer Notes'}
                  </Label>
                  <Textarea
                    id="notes"
                    value={actionData.notes}
                    onChange={(e) => setActionData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder={actionType === 'complete' 
                      ? "Add notes about the completed session..." 
                      : "Add or update your notes about this appointment..."
                    }
                    className="min-h-[100px]"
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
                  onClick={handleActionSubmit}
                  disabled={actionLoading || (actionType === 'cancel' && !actionData.reason.trim())}
                  className="bg-teal hover:bg-teal-light text-white"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {actionType === 'confirm' && 'Confirm'}
                      {actionType === 'cancel' && 'Cancel Appointment'}
                      {actionType === 'complete' && 'Mark Complete'}
                      {actionType === 'notes' && 'Update Notes'}
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

export default LawyerAppointments;