
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, MessageCircle, DollarSign, Bell, FileText, Video, Settings, LogOut, Loader2, Clock, RefreshCw } from 'lucide-react';
import { LawyerSidebar } from '@/components/lawyer/LawyerSidebar';
import { LawyerTopBar } from '@/components/lawyer/LawyerTopBar';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  appointmentService, 
  Appointment, 
  DashboardStats,
  formatAppointmentTime,
  getAppointmentTypeLabel,
  getStatusColor 
} from '@/services/appointmentService';

const LawyerDashboard = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard statistics
      const stats = await appointmentService.getDashboardStats();
      setDashboardStats(stats);

      // Fetch upcoming appointments
      const upcoming = await appointmentService.getUpcomingAppointments(5);
      setUpcomingAppointments(upcoming);

      // Fetch today's appointments
      const today = await appointmentService.getTodaysAppointments();
      setTodaysAppointments(today);

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const statCards = dashboardStats ? [
    {
      title: "Today's Appointments",
      value: dashboardStats.todaysAppointments.toString(),
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Pending Appointments",
      value: dashboardStats.pendingAppointments.toString(),
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Completed This Month",
      value: dashboardStats.thisMonthAppointments.toString(),
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Total Completed",
      value: dashboardStats.completedAppointments.toString(),
      icon: DollarSign,
      color: "text-teal-600",
      bgColor: "bg-teal-50"
    }
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <LawyerSidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <LawyerTopBar />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <h1 className="text-3xl font-bold text-navy">
                Dashboard
                {user && (
                  <span className="text-lg font-normal text-gray-600 ml-2">
                    - Welcome, {user.firstName} {user.lastName}
                  </span>
                )}
              </h1>
              <Button
                onClick={fetchDashboardData}
                variant="outline"
                className="border-teal text-teal hover:bg-teal hover:text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading dashboard...</span>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {statCards.map((stat, index) => (
                    <Card key={index} className="shadow-soft border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                            <p className="text-2xl font-bold text-navy">{stat.value}</p>
                          </div>
                          <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Today's Appointments */}
              <Card className="lg:col-span-2 shadow-soft border-0">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-navy">Today's Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  {todaysAppointments.length === 0 ? (
                    <div className="text-center p-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No appointments scheduled for today</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {todaysAppointments.slice(0, 5).map((appointment) => (
                        <div key={appointment._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-teal rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {appointment.userId.firstName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-navy">
                                {appointment.userId.firstName} {appointment.userId.lastName}
                              </p>
                              <p className="text-sm text-gray-600">
                                {getAppointmentTypeLabel(appointment.appointmentType)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-700">
                              {formatAppointmentTime(appointment.start, appointment.end)}
                            </span>
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Link to="/lawyer-appointments">
                    <Button className="w-full mt-4 bg-teal hover:bg-teal-light text-white">
                      View All Appointments
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-navy">Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardStats?.recentActivity && dashboardStats.recentActivity.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardStats.recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-teal rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">{activity.message}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(activity.time).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 text-gray-500">
                      <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No recent activity</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LawyerDashboard;
