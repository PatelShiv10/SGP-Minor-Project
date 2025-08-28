
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MessageSquare, Users, BarChart3, ChevronDown, User, LogOut } from 'lucide-react';
import { FeedbackManagement } from '@/components/admin/FeedbackManagement';
import { LawyerDirectoryManagement } from '@/components/admin/LawyerDirectoryManagement';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLawyers } from '@/hooks/useLawyers';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('feedback');
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { stats: lawyerStats } = useLawyers('admin');

  // Mock statistics data for feedback (you can create similar hooks for feedback)
  const feedbackStats = {
    totalFeedback: 156,
    pendingFeedback: 23,
    activeUsers: 1247,
    monthlyGrowth: 12.5
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">Administrator</Badge>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-0" align="end">
                  <div className="p-2">
                    <button 
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{feedbackStats.totalFeedback}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-orange-600">{feedbackStats.pendingFeedback} pending</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registered Lawyers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lawyerStats?.totalLawyers || 0}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-blue-600">{lawyerStats?.pendingLawyers || 0} pending approval</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Lawyers</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lawyerStats?.approvedLawyers || 0}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">Active on platform</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{feedbackStats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{feedbackStats.monthlyGrowth}%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="feedback">Feedback Management</TabsTrigger>
            <TabsTrigger value="lawyers">Lawyer Directory</TabsTrigger>
          </TabsList>

          <TabsContent value="feedback" className="space-y-4">
            <FeedbackManagement />
          </TabsContent>

          <TabsContent value="lawyers" className="space-y-4">
            <LawyerDirectoryManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
