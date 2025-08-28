import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'lawyer' | 'admin';
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  redirectTo = '/login' 
}) => {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // If role is required and user doesn't have the correct role
  if (requiredRole && user?.userType !== requiredRole) {
    // Redirect based on user's actual role
    if (user?.userType === 'lawyer') {
      return <Navigate to="/lawyer-dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}; 