
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Download, Calendar, TrendingUp } from 'lucide-react';
import { LawyerSidebar } from '@/components/lawyer/LawyerSidebar';
import { LawyerTopBar } from '@/components/lawyer/LawyerTopBar';

const LawyerPayments = () => {
  const [currentPage, setCurrentPage] = useState('payments');

  const payments = [
    {
      id: 1,
      client: "John Smith",
      amount: 500,
      date: "2024-01-15",
      status: "completed",
      method: "Stripe",
      service: "Consultation"
    },
    {
      id: 2,
      client: "Sarah Johnson",
      amount: 750,
      date: "2024-01-14",
      status: "pending",
      method: "Bank Transfer",
      service: "Document Review"
    },
    {
      id: 3,
      client: "Mike Wilson",
      amount: 1200,
      date: "2024-01-12",
      status: "completed",
      method: "Stripe",
      service: "Legal Representation"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalEarnings = payments.reduce((sum, payment) => 
    payment.status === 'completed' ? sum + payment.amount : sum, 0
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <LawyerSidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <div className="flex-1 flex flex-col">
        <LawyerTopBar />
        
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl lg:text-3xl font-bold text-navy mb-6">Payments</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="shadow-soft border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Earnings</p>
                      <p className="text-2xl font-bold text-navy">${totalEarnings}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">This Month</p>
                      <p className="text-2xl font-bold text-navy">$2,450</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-50">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Growth</p>
                      <p className="text-2xl font-bold text-navy">+15%</p>
                    </div>
                    <div className="p-3 rounded-lg bg-teal-50">
                      <TrendingUp className="h-6 w-6 text-teal-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payments Table */}
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{payment.client}</TableCell>
                          <TableCell>{payment.service}</TableCell>
                          <TableCell>${payment.amount}</TableCell>
                          <TableCell>{payment.date}</TableCell>
                          <TableCell>{payment.method}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(payment.status)}>
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden space-y-4">
                  {payments.map((payment) => (
                    <Card key={payment.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{payment.client}</h3>
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{payment.service}</p>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-bold text-lg">${payment.amount}</p>
                            <p className="text-sm text-gray-500">{payment.date}</p>
                          </div>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LawyerPayments;
