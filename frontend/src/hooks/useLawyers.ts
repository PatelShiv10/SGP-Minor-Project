import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

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
  profileImage?: string;
  isVerified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface LawyerStats {
  totalLawyers: number;
  approvedLawyers: number;
  pendingLawyers: number;
  rejectedLawyers: number;
}

export const useLawyers = (type: 'admin' | 'public' = 'public') => {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [stats, setStats] = useState<LawyerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchLawyers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = type === 'admin' ? '/api/lawyers/all' : '/api/lawyers/approved';
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        headers: type === 'admin' ? {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        } : {}
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lawyers');
      }

      const data = await response.json();
      setLawyers(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch lawyers');
      toast({
        title: "Error",
        description: "Failed to fetch lawyers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/lawyers/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lawyer statistics');
      }

      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      console.error('Failed to fetch lawyer stats:', err);
    }
  };

  const updateLawyerStatus = async (lawyerId: string, status: 'pending' | 'approved' | 'rejected') => {
    try {
      const response = await fetch(`http://localhost:5000/api/lawyers/${lawyerId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update lawyer status');
      }

      const data = await response.json();
      
      // Update the lawyer in the local state
      setLawyers(prev => 
        prev.map(lawyer => 
          lawyer._id === lawyerId 
            ? { ...lawyer, status, isVerified: status === 'approved' }
            : lawyer
        )
      );

      toast({
        title: "Success",
        description: data.message,
      });

      return data.data;
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update lawyer status",
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteLawyer = async (lawyerId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/lawyers/${lawyerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete lawyer');
      }

      // Remove the lawyer from local state
      setLawyers(prev => prev.filter(lawyer => lawyer._id !== lawyerId));

      toast({
        title: "Success",
        description: "Lawyer deleted successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete lawyer",
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchLawyers();
    if (type === 'admin') {
      fetchStats();
    }
  }, [type]);

  return {
    lawyers,
    stats,
    loading,
    error,
    fetchLawyers,
    updateLawyerStatus,
    deleteLawyer,
    fetchStats
  };
}; 