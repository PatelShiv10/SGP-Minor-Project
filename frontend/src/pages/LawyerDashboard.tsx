
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, MessageCircle, DollarSign, Bell, FileText, Video, Settings, LogOut } from 'lucide-react';
import { LawyerSidebar } from '@/components/lawyer/LawyerSidebar';
import { LawyerTopBar } from '@/components/lawyer/LawyerTopBar';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const LawyerDashboard = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { user } = useAuth();

  const dashboardStats = [
    {
      title: "Today's Appointments",
      value: "5",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "New Messages",
      value: "12",
      icon: MessageCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Pending Reviews",
      value: "3",
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "This Month's Earnings",
      value: "$4,250",
      icon: DollarSign,
      color: "text-teal-600",
      bgColor: "bg-teal-50"
    }
  ];

  const upcomingAppointments = [
    { id: 1, client: "John Smith", time: "10:00 AM", type: "Consultation", status: "confirmed" },
    { id: 2, client: "Sarah Johnson", time: "2:00 PM", type: "Follow-up", status: "pending" },
    { id: 3, client: "Mike Wilson", time: "4:30 PM", type: "Document Review", status: "confirmed" }
  ];

  const recentActivities = [
    "New appointment booked by John Smith",
    "Document uploaded by Sarah Johnson",
    "Payment received from Mike Wilson",
    "Review submitted by Emily Davis"
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <LawyerSidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <LawyerTopBar />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-navy mb-8">
              Dashboard
              {user && (
                <span className="text-lg font-normal text-gray-600 ml-2">
                  - Welcome, {user.firstName} {user.lastName}
                </span>
              )}
            </h1>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {dashboardStats.map((stat, index) => (
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Today's Appointments */}
              <Card className="lg:col-span-2 shadow-soft border-0">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-navy">Today's Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-teal rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {appointment.client.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-navy">{appointment.client}</p>
                            <p className="text-sm text-gray-600">{appointment.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-700">{appointment.time}</span>
                          <Badge 
                            variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}
                            className={appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link to="/lawyer-all-appointments">
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
                  <div className="space-y-3">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-teal rounded-full mt-2"></div>
                        <p className="text-sm text-gray-600">{activity}</p>
                      </div>
                    ))}
                  </div>
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
